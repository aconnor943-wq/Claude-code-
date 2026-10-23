// n8n Code node "Read answer + number check" (workflow: RD – Northside Electrical – Monday summary). Mode: Run Once for Each Item.
// Every number Claude quotes must appear in the facts it was given, or the summary goes to you as a draft.
const prev = $('Build Claude request').first().json;
const fallback = note => ({ subject: `${prev.settings.business_name}: weekly numbers`, headline: 'AI summary failed this week.',
  summary: 'Your dashboard is up to date. We are checking the summary.', actions: [], sms: '', data_note: note });
let a, failed = false, failNote = '';
if ($json.stop_reason === 'refusal') {
  failed = true; failNote = 'Claude declined the request' + ($json.stop_details?.category ? ` (${$json.stop_details.category})` : '');
} else if ($json.stop_reason === 'max_tokens') {
  failed = true; failNote = 'answer was cut off at max_tokens';
} else {
  try {
    a = JSON.parse(($json.content || []).find(b => b.type === 'text').text);
  } catch (e) {
    failed = true; failNote = 'could not read the answer as JSON';
  }
}
if (failed) a = fallback('AI summary failed: ' + failNote);
const norm = s => s.replace(/,/g, '');
const allowed = new Set((prev.facts.match(/\d[\d,]*(\.\d+)?/g) || []).map(norm));
const said = [a.headline, a.summary, a.sms, ...a.actions.map(x => `${x.action} ${x.why}`)].join(' ');
const unknown = (said.match(/\d[\d,]*(\.\d+)?/g) || []).map(norm).filter(n => !allowed.has(n) && Number(n) > 12);
const smsOk = a.sms.length > 0 && a.sms.length < 160;
const numbersOk = !failed && unknown.length === 0 && a.actions.length === 3 && smsOk;
const flags = [failed && failNote, unknown.length && 'numbers not in data: ' + unknown.join(', '),
  !failed && a.actions.length !== 3 && 'not 3 actions', !failed && !smsOk && 'SMS empty or 160+ characters',
  ...prev.problems].filter(Boolean);
return [{ json: { ...a, numbersOk, flags: flags.join('; '), settings: prev.settings } }];
