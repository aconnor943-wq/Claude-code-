// Runs the generated n8n Code nodes with fake inputs shaped like n8n's ($, $json, $input).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { buildClient } from '../scripts/new-client.mjs';

const out = mkdtempSync(join(tmpdir(), 'rd-n8n-'));
const { cfg } = buildClient(new URL('../configs/demo-clinic.json', import.meta.url).pathname, out);
const code = (f) => readFileSync(join(out, cfg.slug, 'n8n', f), 'utf8');

// nodes: { 'Node name': [json, json, ...] }
function run(file, { nodes = {}, json = {}, input = [] } = {}) {
  const $ = (name) => {
    if (!nodes[name]) throw new Error(`node "${name}" not provided`);
    const items = nodes[name].map((j) => ({ json: j }));
    return { all: () => items, first: () => items[0] };
  };
  const $input = { all: () => input.map((j) => ({ json: j })) };
  return new Function('$', '$json', '$input', code(file))($, json, $input).map((i) => i.json);
}

const TZ = cfg.business.timezone;
const day = (ms) => new Date(ms).toLocaleDateString('en-CA', { timeZone: TZ });
const daysAgo = (n, hour = 10) => {
  // a timestamp n days ago at `hour` o'clock in the client's time zone (Brisbane is UTC+10, no daylight saving)
  const d = new Date(Date.now() - n * 86400000);
  return Date.parse(`${day(d)}T${String(hour).padStart(2, '0')}:00:00+10:00`);
};

test('GHL date range covers yesterday and the 7 days before, in the client time zone', () => {
  const [r] = run('ghl-1-date-range.js');
  assert.equal(r.dates.length, 8);
  assert.equal(r.dates[7], day(Date.now() - 86400000));
  assert.ok(r.apptEndMs > Date.now() + 80 * 86400000);
});

test('GHL count by day: leads, exclusions, sources, bookings and statuses, with no personal fields', () => {
  const [range] = run('ghl-1-date-range.js');
  const target = range.dates[6];                    // two days ago
  const at = (h) => new Date(daysAgo(2, h)).toISOString();
  const contacts = [
    { id: 'c1', dateAdded: at(9), source: 'Google Ads', tags: [], firstName: 'Ann', email: 'a@x.com', phone: '1' },
    { id: 'c2', dateAdded: at(11), source: '', tags: ['src-meta'] },
    { id: 'c3', dateAdded: at(12), source: 'Website', tags: [] },
    { id: 'c4', dateAdded: at(13), source: 'Google Ads', tags: ['staff'] },          // excluded
    { id: 'c1', dateAdded: at(9), source: 'Google Ads', tags: [] },                  // duplicate page result
    { id: 'c5', dateAdded: new Date(daysAgo(2, 23) + 1800000).toISOString(), source: 'Website', tags: [] }, // 11:30pm, same day
  ];
  const events = [
    { id: 'e1', dateAdded: at(10), startTime: at(15), appointmentStatus: 'showed' },
    { id: 'e2', dateAdded: at(10), startTime: at(16), appointmentStatus: 'noshow' },
    { id: 'e3', dateAdded: at(10), startTime: at(17), appointmentStatus: 'cancelled' },
    { id: 'e4', dateAdded: at(10), startTime: new Date(daysAgo(-20)).toISOString(), appointmentStatus: 'confirmed' }, // booked now, due next month
  ];
  const opps = [{ id: 'o1', status: 'won', monetaryValue: 900, lastStatusChangeAt: at(14) }, { id: 'o2', status: 'open', monetaryValue: 500, lastStatusChangeAt: at(14) }];
  const rows = run('ghl-2-count-by-day.js', { nodes: {
    'Date range': [range], 'Contacts created': [{ contacts }], 'Appointments': [{ events }], 'Won opportunities': [{ opportunities: opps }],
  } });
  assert.equal(rows.length, 8);
  const r = rows.find((x) => x.date === target);
  assert.deepEqual({ ...r, synced_at: undefined }, {
    date: target, leads: 4, leads_paid: 2, leads_google: 1, leads_meta: 1, booked: 4, appts_due: 2, showed: 1,
    no_show: 1, cancelled: 1, won: 1, won_value: 900, synced_at: undefined,
  });
  for (const row of rows) for (const k of Object.keys(row)) assert.ok(!/name|email|phone|tag|source/i.test(k), `personal field ${k} leaked`);
});

test('Meta tidy reads spend and the configured lead action', () => {
  const rows = run('meta-tidy.js', { json: { data: [{ date_start: '2026-10-20', spend: '91.40', clicks: '120', impressions: '5000',
    actions: [{ action_type: 'link_click', value: '120' }, { action_type: 'lead', value: '4' }] }] } });
  assert.equal(rows[0].spend, 91.4);
  assert.equal(rows[0].platform_leads, 4);
});

test('Xero sums invoices ex GST and payments by day, ignoring drafts and bills', () => {
  const d1 = day(Date.now() - 3 * 86400000);
  const ms = Date.parse(d1 + 'T02:00:00Z');
  const rows = run('xero-sum-by-day.js', { nodes: {
    'Sales invoices': [{ Invoices: [
      { InvoiceID: 'i1', Type: 'ACCREC', Status: 'AUTHORISED', SubTotal: 100, DateString: d1 + 'T00:00:00' },
      { InvoiceID: 'i2', Type: 'ACCREC', Status: 'PAID', SubTotal: 250.5, Date: `/Date(${ms}+0000)/` },
      { InvoiceID: 'i3', Type: 'ACCREC', Status: 'DRAFT', SubTotal: 999, DateString: d1 + 'T00:00:00' },
      { InvoiceID: 'i4', Type: 'ACCPAY', Status: 'AUTHORISED', SubTotal: 999, DateString: d1 + 'T00:00:00' },
    ] }],
    'Payments': [{ Payments: [
      { PaymentID: 'p1', Status: 'AUTHORISED', Amount: 110, Date: `/Date(${ms}+0000)/`, Invoice: { Type: 'ACCREC' } },
      { PaymentID: 'p2', Status: 'DELETED', Amount: 50, Date: `/Date(${ms}+0000)/` },
    ] }],
  } });
  assert.equal(rows.length, 14);
  const r = rows.find((x) => x.date === d1);
  assert.equal(r.revenue_invoiced, 350.5);
  assert.equal(r.cash_received, 110);
  assert.ok(rows.some((x) => x.revenue_invoiced === 0), 'quiet days write 0');
});

test('GA4 tidy accepts the Data API shape and the n8n node shape', () => {
  const a = run('ga4-tidy.js', { input: [{ rows: [{ dimensionValues: [{ value: '20261020' }], metricValues: [{ value: '210' }, { value: '180' }, { value: '7' }] }] }] });
  assert.deepEqual({ ...a[0], synced_at: undefined }, { date: '2026-10-20', sessions: 210, users: 180, key_events: 7, synced_at: undefined });
  const b = run('ga4-tidy.js', { input: [{ date: '20261021', sessions: '150', totalUsers: '120', keyEvents: '3' }] });
  assert.equal(b[0].date, '2026-10-21');
  assert.equal(b[0].users, 120);
});

const metricsRows = [
  { metric: 'leads', label: 'New enquiries', this_week: 74, last_week: 71, avg_4wk: 72.5, vs_last_pct: 0.042, vs_avg_pct: 0.021, good_when: 'up', flag: '' },
  { metric: 'booking_rate', label: 'Booking rate', this_week: 0.31, last_week: 0.43, avg_4wk: 0.42, vs_last_pct: -0.279, vs_avg_pct: -0.262, good_when: 'up', flag: 'BIG BAD MOVE' },
  { metric: 'ad_spend', label: 'Ad spend', this_week: 1530.2, last_week: 1488, avg_4wk: 1501, vs_last_pct: 0.028, vs_avg_pct: 0.019, good_when: 'down', flag: '' },
  { metric: 'cpl', label: 'Cost per lead', this_week: '', last_week: 35.1, avg_4wk: 34, vs_last_pct: '', vs_avg_pct: '', good_when: 'down', flag: '' },
];
const settingsRows = [
  { key: 'business_name', value: cfg.business.name }, { key: 'timezone', value: TZ }, { key: 'report_week_start', value: '2026-10-12' },
];
const build = (checks = [{ check: 'raw_ghl fresh', result: '2026-10-22', ok: true }]) =>
  run('summary-1-build-request.js', { nodes: { 'Read Metrics': metricsRows, 'Read Checks': checks, 'Read Settings': settingsRows } })[0];

test('summary request: formatted facts, data problems, and a valid Claude request', () => {
  const r = build([{ check: 'raw_meta_ads fresh', result: '2026-10-19', ok: false }, { check: 'raw_ghl fresh', result: '2026-10-22', ok: 'TRUE' }]);
  assert.match(r.facts, /Booking rate: this week 31\.0%, last week 43\.0%, 4-week average 42\.0%, vs last week -28%, vs 4-week average -26%, better when up, BIG BAD MOVE/);
  assert.match(r.facts, /Ad spend: this week \$1,530/);
  assert.match(r.facts, /Cost per lead: this week n\/a/);
  assert.deepEqual(r.problems, ['raw_meta_ads fresh: 2026-10-19']);
  const req = r.claudeRequest;
  assert.equal(req.model, 'claude-opus-5-5');
  assert.equal(req.fallbacks, 'default');
  assert.equal(req.output_config.format.type, 'json_schema');
  assert.equal(req.output_config.effort, 'medium');
  assert.ok(req.system.includes(cfg.business.name) && req.system.includes(cfg.business.owner_name));
  assert.ok(!/\{\{|\[BUSINESS NAME\]/.test(req.system), 'system prompt fully filled in');
});

const answer = (over = {}) => ({
  subject: `${cfg.business.name} weekly: bookings fell`, headline: 'Booking rate fell to 31.0% against a 42.0% average.',
  summary: 'Enquiries held at 74 while the booking rate dropped to 31.0%. Ad spend was $1,530.',
  actions: [{ action: 'Check reply times', why: 'Booking rate 31.0%', metric: 'booking_rate' },
    { action: 'Call back recent enquiries', why: 'Enquiries 74', metric: 'leads' },
    { action: 'Review booking form', why: 'Booking rate down -26%', metric: 'booking_rate' }],
  sms: `${cfg.business.name}: booking rate fell to 31.0%. Full summary in your email`, data_note: 'All data checks passed.', ...over,
});
const check = (resp) => run('summary-2-check-answer.js', { nodes: { 'Build Claude request': [build()] }, json: resp })[0];
const ok = (a) => ({ stop_reason: 'end_turn', content: [{ type: 'thinking', thinking: '' }, { type: 'text', text: JSON.stringify(a) }] });

test('answer check passes a summary that only quotes given numbers', () => {
  const r = check(ok(answer()));
  assert.equal(r.numbersOk, true, r.flags);
});

test('answer check flags invented numbers, wrong action count and long SMS', () => {
  assert.match(check(ok(answer({ summary: 'Bookings brought in $4,200 extra.' }))).flags, /numbers not in data: 4200/);
  assert.match(check(ok(answer({ actions: answer().actions.slice(0, 2) }))).flags, /not 3 actions/);
  assert.match(check(ok(answer({ sms: 'x'.repeat(170) }))).flags, /SMS/);
  assert.equal(check(ok(answer({ summary: 'Bookings brought in $4,200 extra.' }))).numbersOk, false);
});

test('a refusal or cut-off answer becomes a fallback draft, never an auto-send', () => {
  const refused = check({ stop_reason: 'refusal', stop_details: { type: 'refusal', category: 'cyber' }, content: [] });
  assert.equal(refused.numbersOk, false);
  assert.match(refused.flags, /declined.*cyber/);
  assert.equal(refused.actions.length, 0);
  assert.equal(check({ stop_reason: 'max_tokens', content: [] }).numbersOk, false);
  assert.equal(check({ stop_reason: 'end_turn', content: [{ type: 'text', text: 'not json' }] }).numbersOk, false);
});
