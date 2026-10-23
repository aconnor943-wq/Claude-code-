#!/usr/bin/env node
// Preview a client's owner dashboard on demo data: runs the generated setup-warehouse.gs (real formulas) with
// "Load demo data" in a formula engine, then draws the owner overview as a single HTML file.
// Usage: TZ=UTC node scripts/preview.mjs configs/<slug>.json   ->  clients/<slug>/preview/dashboard.html
// Needs the dev dependency: npm install
import { readFileSync, writeFileSync, mkdirSync, mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildClient } from './new-client.mjs';
import { createRuntime, loadAppsScript, serialToYmd } from '../tests/helpers/apps-script-mock.mjs';

if (process.env.TZ !== 'UTC') { console.error('Run with TZ=UTC (npm run preview -- configs/<slug>.json)'); process.exit(1); }
const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const cfgPath = resolve(process.argv[2] || '');
// The preview always shows 16 weeks of demo history so the trend has a shape, whatever the client's start date.
const real = JSON.parse(readFileSync(cfgPath, 'utf8'));
const mondayNow = new Date(); mondayNow.setUTCHours(0, 0, 0, 0); mondayNow.setUTCDate(mondayNow.getUTCDate() - ((mondayNow.getUTCDay() + 6) % 7));
real.data_start_date = new Date(mondayNow - 16 * 7 * 864e5).toISOString().slice(0, 10);
const tmpCfg = join(mkdtempSync(join(tmpdir(), 'rd-prev-')), `${real.slug}.json`);
writeFileSync(tmpCfg, JSON.stringify(real));
const tmpOut = mkdtempSync(join(tmpdir(), 'rd-prev2-'));
const { cfg } = buildClient(tmpCfg, tmpOut);
const source = readFileSync(join(tmpOut, cfg.slug, 'sheet/setup-warehouse.gs'), 'utf8')
  .replace('const DAILY_ROWS = 1100;', 'const DAILY_ROWS = 400;').replace('const WEEKLY_ROWS = 160;', 'const WEEKLY_ROWS = 60;');

const rt = createRuntime();
const app = loadAppsScript(source, rt, ['setupWarehouse', 'loadDemoData']);
app.setupWarehouse();
app.loadDemoData();

const settings = Object.fromEntries(rt.table('Settings').map((r) => [r.key, r.value]));
const reportWeek = serialToYmd(settings.report_week_start);
const metrics = rt.table('Metrics');
const weekly = rt.table('Weekly').map((r) => ({ ...r, week_start: serialToYmd(r.week_start) }))
  .filter((r) => r.week_start <= reportWeek);
const byName = Object.fromEntries(cfg.metrics.map((m) => [m.metric, m]));

// ---------- formatting ----------
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const blank = (v) => v === '' || v == null || Number.isNaN(Number(v));
const fmt = (metric, v) => {
  if (blank(v)) return 'n/a';
  const f = byName[metric].format, n = Number(v);
  if (f === 'percent') return (n * 100).toFixed(1) + '%';
  if (f === 'money') return '$' + Math.round(n).toLocaleString('en-AU');
  return Math.abs(n) < 100 && !Number.isInteger(n) ? n.toFixed(1) : Math.round(n).toLocaleString('en-AU');
};
const pct = (v) => (blank(v) ? 'n/a' : (v >= 0 ? '+' : '−') + Math.abs(Math.round(v * 100)) + '%');
const day = (ymd) => new Date(ymd + 'T00:00:00Z').toLocaleDateString('en-AU', { day: 'numeric', month: 'short', timeZone: 'UTC' });
const weekLabel = `${day(reportWeek)} – ${day(new Date(Date.parse(reportWeek + 'T00:00:00Z') + 6 * 864e5).toISOString().slice(0, 10))} ${reportWeek.slice(0, 4)}`;

const ICON = {
  good: '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M3 10l5-5 5 5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  bad: '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M8 3v6M8 12.5v.5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
};

function status(row) {
  if (row.flag === 'BIG GOOD MOVE') return { cls: 'good', text: 'Big good move', icon: ICON.good };
  if (row.flag === 'BIG BAD MOVE') return { cls: 'bad', text: 'Big bad move', icon: ICON.bad };
  return null;
}

// ---------- scorecards ----------
const cards = metrics.map((r) => {
  const s = status(r);
  return `<article class="card">
    <h3>${esc(r.label)}</h3>
    <p class="value">${fmt(r.metric, r.this_week)}</p>
    <p class="delta">${pct(r.vs_avg_pct)} vs 4-week average <span class="muted">(${fmt(r.metric, r.avg_4wk)})</span></p>
    ${s ? `<p class="badge ${s.cls}">${s.icon}${s.text}</p>` : ''}
  </article>`;
}).join('\n');

// ---------- small-multiple line charts (one series each, one axis each) ----------
function niceMax(v) { const p = 10 ** Math.floor(Math.log10(v || 1)); return Math.ceil(v / p) * p; }
function lineChart(metric) {
  const m = byName[metric];
  const pts = weekly.map((w) => ({ x: w.week_start, y: Number(w[metric]) })).filter((p) => !Number.isNaN(p.y));
  const W = 560, H = 220, L = 48, R = 16, T = 16, B = 32;
  const max = niceMax(Math.max(...pts.map((p) => p.y)) * 1.1);
  const xs = (i) => L + (i * (W - L - R)) / Math.max(1, pts.length - 1);
  const ys = (v) => T + (H - T - B) * (1 - v / max);
  const ticks = [0, 0.25, 0.5, 0.75, 1].map((f) => f * max);
  const grid = ticks.map((t) => `<line x1="${L}" x2="${W - R}" y1="${ys(t)}" y2="${ys(t)}" class="grid"/><text x="${L - 8}" y="${ys(t) + 4}" class="tick" text-anchor="end">${fmt(metric, t)}</text>`).join('');
  const every = Math.ceil(pts.length / 6);
  const xl = pts.map((p, i) => (i % every === 0 || i === pts.length - 1 ? `<text x="${xs(i)}" y="${H - 10}" class="tick" text-anchor="middle">${day(p.x)}</text>` : '')).join('');
  const path = pts.map((p, i) => `${i ? 'L' : 'M'}${xs(i).toFixed(1)},${ys(p.y).toFixed(1)}`).join('');
  const dots = pts.map((p, i) => `<circle cx="${xs(i)}" cy="${ys(p.y)}" r="${i === pts.length - 1 ? 5 : 0}" class="dot"/>`).join('');
  const last = pts[pts.length - 1];
  const data = JSON.stringify(pts.map((p, i) => ({ x: xs(i), y: ys(p.y), label: `Week of ${day(p.x)}`, value: fmt(metric, p.y) })));
  return `<figure class="chart" data-points='${esc(data)}'>
    <figcaption><strong>${esc(m.label)}</strong> <span class="muted">per week</span></figcaption>
    <div class="plot">
      <svg viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(m.label)} per week, latest ${fmt(metric, last.y)}">
        ${grid}${xl}
        <path d="${path}" class="line"/>
        ${dots}
        <text x="${xs(pts.length - 1) - 8}" y="${ys(last.y) - 12}" class="label" text-anchor="end">${fmt(metric, last.y)}</text>
        <line class="cross" y1="${T}" y2="${H - B}" x1="0" x2="0"/>
        <circle class="hover-dot" r="5" cx="-10" cy="-10"/>
        <rect class="hit" x="${L}" y="${T}" width="${W - L - R}" height="${H - T - B}"/>
      </svg>
      <div class="tip" role="status"></div>
    </div>
  </figure>`;
}
const counts = cfg.metrics.filter((m) => m.type === 'count' && m.show !== false).slice(0, 2).map((m) => m.metric);
const charts = counts.map(lineChart).join('\n');

// ---------- metrics table (the table view of everything above) ----------
const rows = metrics.map((r) => {
  const s = status(r);
  return `<tr><th scope="row">${esc(r.label)}</th><td>${fmt(r.metric, r.this_week)}</td><td>${fmt(r.metric, r.last_week)}</td>
    <td>${fmt(r.metric, r.avg_4wk)}</td><td>${pct(r.vs_last_pct)}</td><td>${pct(r.vs_avg_pct)}</td>
    <td>${s ? `<span class="badge ${s.cls}">${s.icon}${s.text}</span>` : '<span class="muted">Steady</span>'}</td></tr>`;
}).join('\n');

const html = `<!doctype html>
<html lang="en-AU">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(cfg.business.name)} dashboard preview</title>
<style>
:root {
  color-scheme: light;
  --surface-0: #f4f4f1; --surface-1: #fcfcfb; --border: #e3e2dd;
  --text-primary: #0b0b0b; --text-secondary: #52514e; --text-muted: #6b6a66;
  --series-1: #2a78d6; --grid: #e7e6e1;
  --good: #0a7d0a; --good-bg: #e6f4e6; --bad: #b83030; --bad-bg: #fbe9e9;
  --note-bg: #fff6dc; --note-ink: #5c4300;
}
@media (prefers-color-scheme: dark) {
  :root:not([data-theme="light"]) {
    color-scheme: dark;
    --surface-0: #121211; --surface-1: #1a1a19; --border: #2e2e2b;
    --text-primary: #f0efec; --text-secondary: #c3c2b7; --text-muted: #9c9b93;
    --series-1: #3987e5; --grid: #2c2c29;
    --good: #45c445; --good-bg: #143214; --bad: #ef7a7a; --bad-bg: #3a1a1a;
    --note-bg: #332a10; --note-ink: #f2d98a;
  }
}
:root[data-theme="dark"] {
  color-scheme: dark;
  --surface-0: #121211; --surface-1: #1a1a19; --border: #2e2e2b;
  --text-primary: #f0efec; --text-secondary: #c3c2b7; --text-muted: #9c9b93;
  --series-1: #3987e5; --grid: #2c2c29;
  --good: #45c445; --good-bg: #143214; --bad: #ef7a7a; --bad-bg: #3a1a1a;
  --note-bg: #332a10; --note-ink: #f2d98a;
}
* { box-sizing: border-box; }
body { margin: 0; background: var(--surface-0); color: var(--text-primary); font: 15px/1.5 system-ui, -apple-system, "Segoe UI", Roboto, sans-serif; }
main { max-width: 1180px; margin: 0 auto; padding: 24px 16px 48px; }
header h1 { font-size: 26px; margin: 0 0 4px; letter-spacing: -0.01em; }
header p { margin: 0; color: var(--text-secondary); }
.note { margin: 16px 0 24px; padding: 10px 14px; border-radius: 8px; background: var(--note-bg); color: var(--note-ink); font-size: 14px; }
h2 { font-size: 17px; margin: 32px 0 12px; }
.cards { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 12px; }
.card { background: var(--surface-1); border: 1px solid var(--border); border-radius: 10px; padding: 14px 16px; }
.card h3 { margin: 0; font-size: 13px; font-weight: 500; color: var(--text-secondary); }
.card .value { margin: 6px 0 2px; font-size: 28px; font-weight: 600; letter-spacing: -0.01em; font-variant-numeric: tabular-nums; }
.card .delta { margin: 0; font-size: 13px; color: var(--text-secondary); font-variant-numeric: tabular-nums; }
.muted { color: var(--text-muted); }
.badge { display: inline-flex; align-items: center; gap: 4px; margin: 8px 0 0; padding: 2px 8px 2px 4px; border-radius: 999px; font-size: 12px; font-weight: 600; }
.badge svg { width: 14px; height: 14px; }
.badge.good { color: var(--good); background: var(--good-bg); }
.badge.bad { color: var(--bad); background: var(--bad-bg); }
.charts { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 12px; }
.chart { margin: 0; background: var(--surface-1); border: 1px solid var(--border); border-radius: 10px; padding: 14px 16px 8px; }
.chart figcaption { font-size: 14px; margin-bottom: 4px; }
.plot { position: relative; }
.plot svg { width: 100%; height: auto; display: block; overflow: visible; }
.grid { stroke: var(--grid); stroke-width: 1; }
.tick { fill: var(--text-muted); font-size: 11px; font-variant-numeric: tabular-nums; }
.label { fill: var(--text-primary); font-size: 12px; font-weight: 600; }
.line { fill: none; stroke: var(--series-1); stroke-width: 2; stroke-linejoin: round; stroke-linecap: round; }
.dot, .hover-dot { fill: var(--series-1); stroke: var(--surface-1); stroke-width: 2; }
.hover-dot { opacity: 0; }
.cross { stroke: var(--text-muted); stroke-width: 1; stroke-dasharray: 3 3; opacity: 0; }
.hit { fill: transparent; cursor: crosshair; }
.tip { position: absolute; pointer-events: none; opacity: 0; transform: translate(-50%, -110%); background: var(--surface-1); border: 1px solid var(--border); border-radius: 6px; padding: 4px 8px; font-size: 12px; white-space: nowrap; box-shadow: 0 2px 8px rgba(0,0,0,.12); }
.tip b { font-variant-numeric: tabular-nums; }
.table-wrap { overflow-x: auto; background: var(--surface-1); border: 1px solid var(--border); border-radius: 10px; }
table { width: 100%; border-collapse: collapse; font-size: 14px; font-variant-numeric: tabular-nums; }
th, td { padding: 10px 14px; text-align: right; border-bottom: 1px solid var(--border); white-space: nowrap; }
th:first-child, td:last-child, thead th:last-child { text-align: left; }
thead th { font-size: 12px; font-weight: 600; color: var(--text-secondary); }
tbody tr:last-child th, tbody tr:last-child td { border-bottom: 0; }
tbody th { font-weight: 500; }
footer { margin-top: 24px; font-size: 13px; color: var(--text-muted); }
</style>
</head>
<body>
<main>
  <header>
    <h1>${esc(cfg.business.name)} · Owner overview</h1>
    <p>Week of ${weekLabel} · compared with the 4-week average</p>
  </header>
  <p class="note"><strong>Preview with sample numbers.</strong> These figures are made up by the template's demo data, run through ${esc(cfg.business.name)}'s real sheet formulas. The live dashboard is built in Looker Studio on the client's real data.</p>

  <section aria-labelledby="h-week">
    <h2 id="h-week">Last week</h2>
    <div class="cards">${cards}</div>
  </section>

  <section aria-labelledby="h-trend">
    <h2 id="h-trend">Trend</h2>
    <div class="charts">${charts}</div>
  </section>

  <section aria-labelledby="h-table">
    <h2 id="h-table">All numbers</h2>
    <div class="table-wrap"><table>
      <thead><tr><th scope="col">Metric</th><th scope="col">This week</th><th scope="col">Last week</th><th scope="col">4-week avg</th><th scope="col">vs last week</th><th scope="col">vs 4-week avg</th><th scope="col">Flag</th></tr></thead>
      <tbody>${rows}</tbody>
    </table></div>
  </section>
  <footer>A move of ${Math.round((cfg.big_move_threshold ?? 0.2) * 100)}% or more against the 4-week average is flagged. Rates and per-cover figures come from the period's totals.</footer>
</main>
<script>
document.querySelectorAll('.chart').forEach((fig) => {
  const pts = JSON.parse(fig.dataset.points);
  const svg = fig.querySelector('svg'), tip = fig.querySelector('.tip');
  const cross = svg.querySelector('.cross'), dot = svg.querySelector('.hover-dot'), hit = svg.querySelector('.hit');
  const move = (e) => {
    const box = svg.getBoundingClientRect(), vb = svg.viewBox.baseVal;
    const x = ((e.clientX - box.left) / box.width) * vb.width;
    const p = pts.reduce((a, b) => (Math.abs(b.x - x) < Math.abs(a.x - x) ? b : a));
    cross.setAttribute('x1', p.x); cross.setAttribute('x2', p.x); cross.style.opacity = 1;
    dot.setAttribute('cx', p.x); dot.setAttribute('cy', p.y); dot.style.opacity = 1;
    tip.innerHTML = p.label + ': <b>' + p.value + '</b>';
    tip.style.left = (p.x / vb.width) * box.width + 'px';
    tip.style.top = (p.y / vb.height) * box.height + 'px';
    tip.style.opacity = 1;
  };
  const leave = () => { cross.style.opacity = 0; tip.style.opacity = 0; dot.style.opacity = 0; };
  hit.addEventListener('pointermove', move);
  hit.addEventListener('pointerleave', leave);
});
</script>
</body>
</html>
`;

const outDir = join(ROOT, 'clients', cfg.slug, 'preview');
mkdirSync(outDir, { recursive: true });
writeFileSync(join(outDir, 'dashboard.html'), html);
console.log(`Preview written to ${join(outDir, 'dashboard.html')}`);
