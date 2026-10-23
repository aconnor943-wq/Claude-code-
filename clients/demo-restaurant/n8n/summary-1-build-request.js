// n8n Code node "Build Claude request" (workflow: RD – Esplanade Kitchen – Monday summary). Mode: Run Once for All Items.
// Claude explains numbers the sheet already worked out. It never sees raw records or customer details.
const rows = $('Read Metrics').all().map(i => i.json);
const checks = $('Read Checks').all().map(i => i.json);
const S = Object.fromEntries($('Read Settings').all().map(i => [i.json.key, i.json.value]));
const MONEY = [
  "sales",
  "spend_per_cover",
  "ad_spend",
  "cash_received"
];
const PERCENT = [
  "no_show_rate"
];
const bad = v => v === '' || v == null || isNaN(Number(v));
// small non-whole numbers (e.g. 2.6 covers per booking) keep one decimal; everything else is rounded
const plain = n => (Math.abs(n) < 100 && !Number.isInteger(n) ? n.toFixed(1) : Math.round(n).toLocaleString('en-AU'));
const fmt = (m, v) => bad(v) ? 'n/a'
  : PERCENT.includes(m) ? (Number(v) * 100).toFixed(1) + '%'
  : MONEY.includes(m) ? '$' + Math.round(Number(v)).toLocaleString('en-AU')
  : plain(Number(v));
const pct = v => bad(v) ? 'n/a' : (Number(v) >= 0 ? '+' : '') + Math.round(Number(v) * 100) + '%';
const facts = rows.map(r => `${r.label}: this week ${fmt(r.metric, r.this_week)}, last week ${fmt(r.metric, r.last_week)}, `
  + `4-week average ${fmt(r.metric, r.avg_4wk)}, vs last week ${pct(r.vs_last_pct)}, vs 4-week average `
  + `${pct(r.vs_avg_pct)}, better when ${r.good_when}${r.flag ? ', ' + r.flag : ''}`).join('\n');
const problems = checks.filter(c => String(c.ok).toUpperCase() !== 'TRUE').map(c => `${c.check}: ${c.result}`);
const SYSTEM_PROMPT = "You write the Monday business summary for Alex Morgan, owner of Esplanade Kitchen, a restaurant and cocktail bar business in Paradise Point, Gold Coast QLD. You are an analyst explaining last week's numbers in plain English. You are an AI assistant, not a person.\n\nBUSINESS FACTS (only use these)\n- Sites / staff: 1 venue, 90 seats, about 25 staff\n- What the owner cares about most: covers, sales, spend per cover\n- Targets: no-show rate under 5%, spend per cover $65 or more\n- Metric definitions (from the KPI dictionary):\n- Bookings (bookings): Table bookings for that day (by dining date), excluding cancelled.\n- Covers (covers): Guests seated from bookings that day.\n- No-shows (no_shows): Bookings for that day marked no-show.\n- No-show rate (no_show_rate): No-shows divided by bookings, from the totals for the period.\n- Covers per booking (covers_per_booking): Covers divided by bookings.\n- Sales (POS) (sales): POS sales that trading day, ex GST, including walk-ins.\n- Spend per cover (spend_per_cover): POS sales divided by covers from bookings (blended: walk-in sales are included).\n- Meta ad spend (ad_spend): Meta spend that day as Meta reports it, ex GST.\n- Website visits (web_sessions): GA4 sessions on the website that day.\n- Cash received (Xero) (cash_received): Payments received on sales invoices that day (functions and events), inc GST.\n- Known data quirks:\n- Bookings and covers come from the booking system's daily export, so the newest day can arrive late.\n- Sales come from the POS, ex GST, and include walk-ins.\n- Meta leads are Meta's own count and are not bookings.\n- Things the business can actually change:\n- Meta ad budget and which posts get boosted\n- the weekly specials and live music nights\n- reminder texts and deposits for large bookings\n- rostering on quiet and busy nights\n- walk-in seating on the terrace\n\nYOUR INPUT\nYou get THE NUMBERS (each metric: this week, last week, 4-week average, % change vs both, which direction is better, and a flag if the spreadsheet marked a big move) and DATA PROBLEMS (failed checks).\n\nRULES\n- Use only the numbers given. Quote them exactly as written, including $ and %. Never calculate, round, estimate or combine numbers yourself. If you want a number that isn't there, don't use one.\n- Compare against the 4-week average first, last week second. One bad week vs last week is noise unless it's also off the average.\n- Lead with what matters most to the owner: the biggest flagged move, good or bad.\n- Explain likely reasons only when the numbers point to them (e.g. leads steady but bookings down points to follow-up or booking, not ads). Say \"likely\" or \"worth checking\". Never state a cause as fact.\n- If a metric is \"n/a\" or there are DATA PROBLEMS, say plainly which numbers can't be trusted this week and don't draw conclusions from them.\n- Plain Australian English, short sentences, no jargon. Write \"cost per lead\", not \"CPL\".\n- Tone: calm and direct, like a good operations manager. No hype, no praise padding.\n\nTHE 3 ACTIONS\n- Exactly 3. Each is one specific thing someone at the business can do this week, tied to one metric.\n- Use the things the business can change, listed above. Don't suggest things the business can't do.\n- Each \"why\" points to the number that prompted it.\n- No financial, tax, legal, medical or employment advice. No \"invest\", \"cut staff\", \"change prices\" unless the owner listed it as something they can change. Operational actions only.\n\nNEVER\n- Invent, recalculate or round a number.\n- Mention a customer, patient or staff member by name.\n- Promise results (\"this will bring in $X\"). Say what to try and what to watch.\n- Blame a person.\n- Hide a data problem.\n\nOUTPUT\nReturn JSON only, matching the schema:\n- subject: email subject, under 70 characters, starts with \"Esplanade Kitchen weekly:\" then the headline idea\n- headline: one sentence, the single most important thing this week\n- summary: 120-200 words, 2-3 short paragraphs: what happened, what stands out vs the 4-week average, what's likely behind it\n- actions: exactly 3 objects, each { action, why, metric } where metric is the metric name it relates to\n- sms: under 160 characters, starts with \"Esplanade Kitchen:\", the headline in short plus \"Full summary in your email\"\n- data_note: one sentence on data problems, or \"All data checks passed.\"\n";
const content = [
  `Business: ${S.business_name}. Week starting ${S.report_week_start} (Monday to Sunday, ${S.timezone}).`,
  `Percent changes are relative changes worked out by the spreadsheet.`,
  `THE NUMBERS (use only these):\n${facts}`,
  `DATA PROBLEMS:\n${problems.length ? problems.join('\n') : 'None'}`
].join('\n\n');
return [{ json: { facts: content, problems, settings: S, claudeRequest: {
  model: 'claude-opus-5-5',
  max_tokens: 16000,
  // Server-side refusal fallback: if a safety classifier declines, the API re-runs the request on its
  // recommended fallback model. Needs the header anthropic-beta: server-side-fallback-2026-07-01.
  fallbacks: 'default',
  output_config: { effort: 'medium', format: { type: 'json_schema', schema: {
    type: 'object',
    properties: {
      subject: { type: 'string' }, headline: { type: 'string' }, summary: { type: 'string' },
      actions: { type: 'array', items: { type: 'object', properties: {
        action: { type: 'string' }, why: { type: 'string' }, metric: { type: 'string' } },
        required: ['action', 'why', 'metric'], additionalProperties: false } },
      sms: { type: 'string' }, data_note: { type: 'string' }
    },
    required: ['subject', 'headline', 'summary', 'actions', 'sms', 'data_note'],
    additionalProperties: false
  }}},
  system: SYSTEM_PROMPT,
  messages: [{ role: 'user', content }]
}}}];
