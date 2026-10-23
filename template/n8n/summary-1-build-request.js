// n8n Code node "Build Claude request" (workflow: RD – {{business.name}} – Monday summary). Mode: Run Once for All Items.
// Claude explains numbers the sheet already worked out. It never sees raw records or customer details.
const rows = $('Read Metrics').all().map(i => i.json);
const checks = $('Read Checks').all().map(i => i.json);
const S = Object.fromEntries($('Read Settings').all().map(i => [i.json.key, i.json.value]));
const MONEY = {{json:money_metrics}};
const PERCENT = {{json:percent_metrics}};
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
const SYSTEM_PROMPT = {{system_prompt_js}};
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
