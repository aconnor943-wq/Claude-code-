// Runs each config's generated setup-warehouse.gs against a formula engine and checks the Metrics tab against
// numbers worked out independently in JavaScript from the same raw rows. Run with: TZ=UTC node --test tests/
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { buildClient } from '../scripts/new-client.mjs';
import { rawTabs } from '../scripts/lib.mjs';
import { createRuntime, loadAppsScript, serialToYmd, shiftRows } from './helpers/apps-script-mock.mjs';

if (process.env.TZ !== 'UTC') throw new Error('Run the tests with TZ=UTC (npm test does this)');

const ymd = (v) => (typeof v === 'number' ? serialToYmd(v) : String(v));
const addDays = (s, k) => { const d = new Date(s + 'T00:00:00Z'); d.setUTCDate(d.getUTCDate() + k); return d.toISOString().slice(0, 10); };
const today = new Date().toISOString().slice(0, 10);
const thisMonday = addDays(today, -((new Date(today + 'T00:00:00Z').getUTCDay() + 6) % 7));
const reportWeek = addDays(thisMonday, -7);

test('shifting formulas keeps anchored references fixed', () => {
  assert.equal(shiftRows('=SUMIFS(raw!$B:$B,raw!$A:$A,$A2)', 3), '=SUMIFS(raw!$B:$B,raw!$A:$A,$A5)');
  assert.equal(shiftRows('=IFERROR(C2/D2-1,"")', 1), '=IFERROR(C3/D3-1,"")');
  assert.equal(shiftRows('=Settings!$B$4-7+DATE(2026,7,6)', 5), '=Settings!$B$4-7+DATE(2026,7,6)');
  assert.equal(shiftRows('="A2"&A2', 1), '="A2"&A3');
});

const configs = readdirSync(new URL('../configs/', import.meta.url)).filter((f) => f.endsWith('.json'));

for (const file of configs) {
  const out = mkdtempSync(join(tmpdir(), 'rd-'));
  const { cfg } = buildClient(new URL(`../configs/${file}`, import.meta.url).pathname, out);
  // fewer rows than the real sheet so the formula engine runs in seconds; the formulas are identical
  const source = readFileSync(join(out, cfg.slug, 'sheet/setup-warehouse.gs'), 'utf8')
    .replace('const DAILY_ROWS = 1100;', 'const DAILY_ROWS = 200;').replace('const WEEKLY_ROWS = 160;', 'const WEEKLY_ROWS = 30;');

  const rt = createRuntime();
  const app = loadAppsScript(source, rt, ['setupWarehouse', 'loadDemoData']);
  app.setupWarehouse();
  app.loadDemoData();

  const raw = Object.fromEntries(Object.keys(rawTabs(cfg)).map((tab) => [tab, rt.table(tab)]));
  const dailyValue = (metric, date) => cfg.metrics.find((x) => x.metric === metric).daily
    .reduce((sum, [tab, col]) => sum + raw[tab].filter((r) => ymd(r.date) === date).reduce((s, r) => s + Number(r[col] || 0), 0), 0);
  const weekTotal = (metric, monday) => { let s = 0; for (let i = 0; i < 7; i++) s += dailyValue(metric, addDays(monday, i)); return s; };
  const expected = (m, monday) => (m.type === 'ratio' ? weekTotal(m.num, monday) / weekTotal(m.den, monday) : weekTotal(m.metric, monday));
  const expectedAvg = (m) => {
    const weeks = [1, 2, 3, 4].map((k) => addDays(reportWeek, -7 * k));
    if (m.type === 'ratio') return weeks.reduce((s, w) => s + weekTotal(m.num, w), 0) / weeks.reduce((s, w) => s + weekTotal(m.den, w), 0);
    return weeks.reduce((s, w) => s + weekTotal(m.metric, w), 0) / 4;
  };
  const name = (t) => `${cfg.slug}: ${t}`;

  test(name('builds every tab with the exact headers n8n matches on'), () => {
    const head = (t) => rt.sheets.get(t).getRange(1, 1, 1, rt.sheets.get(t).getLastColumn()).getValues()[0];
    for (const [tab, cols] of Object.entries(rawTabs(cfg))) assert.deepEqual(head(tab), cols);
    assert.deepEqual(head('Metrics'), ['metric', 'label', 'this_week', 'last_week', 'avg_4wk', 'vs_last_pct', 'vs_avg_pct', 'good_when', 'flag']);
    assert.deepEqual(head('Summaries'), ['week_start', 'status', 'subject', 'summary', 'actions', 'sms', 'numbers_ok', 'flags', 'created_at', 'sent_at']);
    assert.equal(rt.table('KPI_Dictionary').length, cfg.metrics.length);
  });

  test(name('Settings: report_week_start is last Monday, auto_send starts FALSE'), () => {
    const settings = Object.fromEntries(rt.table('Settings').map((r) => [r.key, r.value]));
    assert.equal(ymd(settings.report_week_start), reportWeek);
    assert.equal(settings.auto_send, false);
    assert.equal(settings.big_move_threshold, cfg.big_move_threshold ?? 0.2);
    assert.equal(settings.business_name, cfg.business.name);
  });

  test(name('Metrics match totals worked out independently from the raw rows'), () => {
    const metrics = rt.table('Metrics');
    const shown = cfg.metrics.filter((m) => m.show !== false);
    assert.equal(metrics.length, shown.length);
    for (const m of shown) {
      const row = metrics.find((r) => r.metric === m.metric);
      assert.ok(row, `missing metric row ${m.metric}`);
      const close = (a, b, what) => assert.ok(Math.abs(Number(a) - b) < 1e-6, `${m.metric} ${what}: sheet ${a}, expected ${b}`);
      close(row.this_week, expected(m, reportWeek), 'this_week');
      close(row.last_week, expected(m, addDays(reportWeek, -7)), 'last_week');
      close(row.avg_4wk, expectedAvg(m), 'avg_4wk');
      close(row.vs_avg_pct, expected(m, reportWeek) / expectedAvg(m) - 1, 'vs_avg_pct');
      const big = Math.abs(row.vs_avg_pct) >= (cfg.big_move_threshold ?? 0.2);
      const good = (row.vs_avg_pct > 0) === (m.good_when === 'up');
      assert.equal(row.flag, big ? (good ? 'BIG GOOD MOVE' : 'BIG BAD MOVE') : '', `${m.metric} flag`);
    }
  });

  if (cfg.metrics.some((m) => m.metric === 'booking_rate') && cfg.sources.includes('ghl')) {
    test(name('the demo week flags the booking-rate drop as a big bad move'), () => {
      const br = rt.table('Metrics').find((r) => r.metric === 'booking_rate');
      assert.equal(br.flag, 'BIG BAD MOVE');
    });
  }

  test(name('data checks pass on fresh demo data, then catch a negative number'), () => {
    for (const c of rt.table('Checks').filter((x) => /fresh|negative/.test(x.check))) assert.equal(c.ok, true, `${c.check} -> ${c.result}`);
    const firstTab = Object.keys(rawTabs(cfg))[0];
    const sh = rt.sheets.get(firstTab);
    const before = sh.getRange(3, 2).getValues()[0][0];
    sh.getRange(3, 2).setValue(-5);
    assert.equal(rt.table('Checks').find((x) => x.check === 'negative numbers').ok, false);
    sh.getRange(3, 2).setValue(before);
  });

  test(name('reconciliation uses the typed source figure, and a rebuild keeps it and the raw data'), () => {
    const metric = cfg.metrics.find((m) => m.type === 'count' && m.show !== false).metric;
    const check = `reconcile ${metric} (last month)`;
    const rowIdx = rt.table('Checks').findIndex((x) => x.check === check) + 2;
    const end = addDays(today.slice(0, 8) + '01', -1), start = end.slice(0, 8) + '01';
    let total = 0; for (let d = start; d <= end; d = addDays(d, 1)) total += dailyValue(metric, d);
    rt.sheets.get('Checks').getRange(rowIdx, 4).setValue(total + 2);
    let row = rt.table('Checks').find((x) => x.check === check);
    assert.ok(Math.abs(row.result + 2) < 1e-6, `result ${row.result}`);
    assert.equal(row.ok, false);
    const counts = Object.fromEntries(Object.keys(raw).map((t) => [t, rt.table(t).length]));
    app.setupWarehouse();
    row = rt.table('Checks').find((x) => x.check === check);
    assert.equal(row.source_figure, total + 2, 'typed figure kept after rebuild');
    for (const t of Object.keys(raw)) assert.equal(rt.table(t).length, counts[t], `${t} rows kept after rebuild`);
  });
}
