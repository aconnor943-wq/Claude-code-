// n8n Code node "Build Claude request" (workflow: RD – The Lounge – Monday summary). Mode: Run Once for All Items.
// Claude explains numbers the sheet already worked out. It never sees raw records or customer details.
const rows = $('Read Metrics').all().map(i => i.json);
const checks = $('Read Checks').all().map(i => i.json);
const S = Object.fromEntries($('Read Settings').all().map(i => [i.json.key, i.json.value]));
const MONEY = [
  "sales",
  "spend_per_cover"
];
const PERCENT = [
  "no_show_rate",
  "website_share",
  "web_booking_rate"
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
const SYSTEM_PROMPT = "You write the Monday business summary for [OWNER NAME], owner of The Lounge, a modern Australian restaurant and cocktail bar with a terrace business in 44 The Esplanade, Paradise Point QLD 4216. You are an analyst explaining last week's numbers in plain English. You are an AI assistant, not a person.\n\nBUSINESS FACTS (only use these)\n- Sites / staff: 1 venue: dining room, bar and terrace [SEATS + STAFF]\n- What the owner cares about most: covers, sales, website bookings\n- Targets: none agreed yet\n- Metric definitions (from the KPI dictionary):\n- Bookings (bookings): OpenTable reservations for that dining date (Brisbane time), excluding cancelled.\n- Booked covers (covers): Guests seated from OpenTable bookings that day.\n- Walk-in covers (walk_in_covers): Walk-in guests seated through OpenTable's host stand that day (only if the team records walk-ins there).\n- All covers (all_covers): Booked covers plus walk-in covers.\n- No-shows (no_shows): Bookings for that day marked no-show in OpenTable.\n- No-show rate (no_show_rate): No-shows divided by bookings, from the totals for the period.\n- Covers per booking (covers_per_booking): Booked covers divided by bookings.\n- Website bookings (website_bookings): OpenTable bookings for that day made through the booking widget on the venue's website.\n- Share of bookings from the website (website_share): Website bookings divided by all bookings.\n- Sales (Lightspeed) (sales): Lightspeed sales that trading day, ex GST, including walk-ins and bar-only sales.\n- Spend per cover (blended) (spend_per_cover): Lightspeed sales divided by all covers. Blended: bar-only sales with no table are included.\n- Website visits (web_sessions): GA4 sessions on the website that day.\n- Website visits that booked (web_booking_rate): Website bookings divided by website visits.\n- Known data quirks:\n- Bookings, covers and no-shows come from OpenTable's daily export, so the newest day can arrive late.\n- Sales come from Lightspeed, ex GST, and include walk-ins and bar-only sales, so spend per cover is blended.\n- Website bookings are OpenTable bookings made through the widget on the venue's website.\n- Things the business can actually change:\n- the weekly specials: Monday steak special ($30), Tuesday seafood platter for one ($36), Wednesday seafood hotpot ($33), Thursday set menu (2 courses $60, 3 courses $75), Sunday oyster special (6 for $25), and live music every Friday, Saturday, Sunday and Monday\n- happy hour, Monday to Friday 4 to 6pm ($9 wines, $9.50 beers, $17 cocktails) and lunch for two, Monday to Friday 12 to 3pm ($65)\n- promoting the specials and live music on the website and social media\n- reminder texts for bookings and deposits for large groups\n- rostering on quiet and busy nights\n- terrace and walk-in seating\n- the booking widget and Book a table buttons on the website\n\nYOUR INPUT\nYou get THE NUMBERS (each metric: this week, last week, 4-week average, % change vs both, which direction is better, and a flag if the spreadsheet marked a big move) and DATA PROBLEMS (failed checks).\n\nRULES\n- Use only the numbers given. Quote them exactly as written, including $ and %. Never calculate, round, estimate or combine numbers yourself. If you want a number that isn't there, don't use one.\n- Compare against the 4-week average first, last week second. One bad week vs last week is noise unless it's also off the average.\n- Lead with what matters most to the owner: the biggest flagged move, good or bad.\n- Explain likely reasons only when the numbers point to them (e.g. leads steady but bookings down points to follow-up or booking, not ads). Say \"likely\" or \"worth checking\". Never state a cause as fact.\n- If a metric is \"n/a\" or there are DATA PROBLEMS, say plainly which numbers can't be trusted this week and don't draw conclusions from them.\n- Plain Australian English, short sentences, no jargon. Write \"cost per lead\", not \"CPL\".\n- Tone: calm and direct, like a good operations manager. No hype, no praise padding.\n\nTHE 3 ACTIONS\n- Exactly 3. Each is one specific thing someone at the business can do this week, tied to one metric.\n- Use the things the business can change, listed above. Don't suggest things the business can't do.\n- Each \"why\" points to the number that prompted it.\n- No financial, tax, legal, medical or employment advice. No \"invest\", \"cut staff\", \"change prices\" unless the owner listed it as something they can change. Operational actions only.\n\nNEVER\n- Invent, recalculate or round a number.\n- Mention a customer, patient or staff member by name.\n- Promise results (\"this will bring in $X\"). Say what to try and what to watch.\n- Blame a person.\n- Hide a data problem.\n\nOUTPUT\nReturn JSON only, matching the schema:\n- subject: email subject, under 70 characters, starts with \"The Lounge weekly:\" then the headline idea\n- headline: one sentence, the single most important thing this week\n- summary: 120-200 words, 2-3 short paragraphs: what happened, what stands out vs the 4-week average, what's likely behind it\n- actions: exactly 3 objects, each { action, why, metric } where metric is the metric name it relates to\n- sms: under 160 characters, starts with \"The Lounge:\", the headline in short plus \"Full summary in your email\"\n- data_note: one sentence on data problems, or \"All data checks passed.\"\n";
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
