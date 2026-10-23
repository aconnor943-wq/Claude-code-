// n8n Code node "Build Claude request" (workflow: RD – Northside Electrical – Monday summary). Mode: Run Once for All Items.
// Claude explains numbers the sheet already worked out. It never sees raw records or customer details.
const rows = $('Read Metrics').all().map(i => i.json);
const checks = $('Read Checks').all().map(i => i.json);
const S = Object.fromEntries($('Read Settings').all().map(i => [i.json.key, i.json.value]));
const MONEY = [
  "won_value",
  "ad_spend",
  "cpl",
  "cost_per_job",
  "revenue_invoiced"
];
const PERCENT = [
  "quote_rate"
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
const SYSTEM_PROMPT = "You write the Monday business summary for Jordan Lee, owner of Northside Electrical, a residential and commercial electrician business in Brisbane northside QLD. You are an analyst explaining last week's numbers in plain English. You are an AI assistant, not a person.\n\nBUSINESS FACTS (only use these)\n- Sites / staff: 8 electricians, 2 office staff\n- What the owner cares about most: quote visits booked, jobs won, cost per job won\n- Targets: quote booking rate 50% or better, cost per lead under $60\n- Metric definitions (from the KPI dictionary):\n- New enquiries (leads): New contacts created that day, not tagged staff, spam or supplier.\n- Enquiries from Google Ads (leads_paid): New enquiries whose source maps to Google Ads.\n- Quote visits booked (quotes_booked): Quote visits created that day on the Quote visit calendar.\n- Quote booking rate (quote_rate): Quote visits booked divided by new enquiries.\n- Jobs won (jobs_won): Jobs pipeline opportunities marked Won that day.\n- Value of jobs won (won_value): Total quoted value of jobs marked Won that day.\n- Google Ads spend (ad_spend): Google Ads spend that day, ex GST.\n- Cost per lead (cpl): Google Ads spend divided by enquiries from Google Ads.\n- Cost per job won (blended) (cost_per_job): Google Ads spend divided by all jobs won.\n- Revenue invoiced (revenue_invoiced): Sales invoices dated that day, ex GST, excluding draft and voided.\n- Known data quirks:\n- Cost per job won is blended across all jobs, including referrals.\n- Won value is the quoted price when the job is accepted, not the final invoice.\n- Things the business can actually change:\n- Google Ads budget and which services are advertised\n- how fast the office calls back new enquiries\n- follow-up on quotes not yet accepted\n- which suburbs and job types the ads target\n\nYOUR INPUT\nYou get THE NUMBERS (each metric: this week, last week, 4-week average, % change vs both, which direction is better, and a flag if the spreadsheet marked a big move) and DATA PROBLEMS (failed checks).\n\nRULES\n- Use only the numbers given. Quote them exactly as written, including $ and %. Never calculate, round, estimate or combine numbers yourself. If you want a number that isn't there, don't use one.\n- Compare against the 4-week average first, last week second. One bad week vs last week is noise unless it's also off the average.\n- Lead with what matters most to the owner: the biggest flagged move, good or bad.\n- Explain likely reasons only when the numbers point to them (e.g. leads steady but bookings down points to follow-up or booking, not ads). Say \"likely\" or \"worth checking\". Never state a cause as fact.\n- If a metric is \"n/a\" or there are DATA PROBLEMS, say plainly which numbers can't be trusted this week and don't draw conclusions from them.\n- Plain Australian English, short sentences, no jargon. Write \"cost per lead\", not \"CPL\".\n- Tone: calm and direct, like a good operations manager. No hype, no praise padding.\n\nTHE 3 ACTIONS\n- Exactly 3. Each is one specific thing someone at the business can do this week, tied to one metric.\n- Use the things the business can change, listed above. Don't suggest things the business can't do.\n- Each \"why\" points to the number that prompted it.\n- No financial, tax, legal, medical or employment advice. No \"invest\", \"cut staff\", \"change prices\" unless the owner listed it as something they can change. Operational actions only.\n\nNEVER\n- Invent, recalculate or round a number.\n- Mention a customer, patient or staff member by name.\n- Promise results (\"this will bring in $X\"). Say what to try and what to watch.\n- Blame a person.\n- Hide a data problem.\n\nOUTPUT\nReturn JSON only, matching the schema:\n- subject: email subject, under 70 characters, starts with \"Northside Electrical weekly:\" then the headline idea\n- headline: one sentence, the single most important thing this week\n- summary: 120-200 words, 2-3 short paragraphs: what happened, what stands out vs the 4-week average, what's likely behind it\n- actions: exactly 3 objects, each { action, why, metric } where metric is the metric name it relates to\n- sms: under 160 characters, starts with \"Northside Electrical:\", the headline in short plus \"Full summary in your email\"\n- data_note: one sentence on data problems, or \"All data checks passed.\"\n";
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
