#!/usr/bin/env node
// Build a client's ready-to-paste files from their config.
// Usage: node scripts/new-client.mjs configs/<slug>.json [--out clients]
import { readFileSync, writeFileSync, mkdirSync, rmSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadConfig, rawTabs, render } from './lib.mjs';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const T = (p) => readFileSync(join(ROOT, 'template', p), 'utf8');

export function buildClient(configPath, outRoot = join(ROOT, 'clients')) {
  const cfg = loadConfig(configPath);
  // Clients without GHL or Meta still render the shared prompts, so give those fields a clear default.
  cfg.ghl ??= { location_id: 'n/a (no GHL)', booking_calendars: ['n/a'], sales_pipeline: 'n/a', exclude_tags: [], source_map: {}, status_values: {} };
  cfg.meta ??= { lead_action_type: 'lead' };

  const tabs = rawTabs(cfg);
  const shown = cfg.metrics.filter((m) => m.show !== false);
  const derived = {
    sheet_config: {
      business_name: cfg.business.name,
      timezone: cfg.business.timezone,
      data_start_date: cfg.data_start_date,
      big_move_threshold: cfg.big_move_threshold ?? 0.2,
      owner_email: cfg.business.owner_email,
      builder_email: cfg.builder_email,
      raw_tabs: tabs,
      demo: cfg.demo || {},
      metrics: cfg.metrics.map(({ metric, label, definition, source, good_when, target, type, format, daily, num, den, show }) =>
        ({ metric, label, definition, source, good_when, target: target ?? null, type, format, daily, num, den, show: show !== false })),
    },
    big_move_threshold: cfg.big_move_threshold ?? 0.2,
    money_metrics: cfg.metrics.filter((m) => m.format === 'money').map((m) => m.metric),
    percent_metrics: cfg.metrics.filter((m) => m.format === 'percent').map((m) => m.metric),
    kpi_definitions: cfg.metrics.map((m) => `- ${m.label} (${m.metric}): ${m.definition}`).join('\n'),
    looker_fields: cfg.metrics.filter((m) => m.type === 'ratio')
      .map((m) => `- **${m.label}** (\`${m.metric}\`): \`SUM(${m.num}) / SUM(${m.den})\`, format ${m.format === 'percent' ? 'percent' : m.format === 'money' ? 'currency' : 'number'}`)
      .join('\n') || '- (this client has no ratio metrics)',
    looker_owner_metrics: shown.map((m) => m.label.toLowerCase()).join(', '),
    viewers_list: (cfg.viewers || []).map((v) => `- ${v.who}: ${v.pages}`).join('\n') || '- [ADD VIEWERS]',
    viewers_text: (cfg.viewers || []).map((v) => `${v.who} (${v.pages})`).join('; ') || '[VIEWERS + PAGES]',
    health_text: cfg.business.health_provider ? 'YES: covered by the Privacy Act whatever its size; no health details ever enter the warehouse' : 'NO',
    country_text: (cfg.business.country || 'Australia') === 'Australia' ? 'NO' : cfg.business.country,
    custom_tabs: Object.keys(cfg.custom_sources || {}).join(', '),
    crm_text: cfg.sources.includes('ghl')
      ? `GHL, Location ID ${cfg.ghl.location_id}. Booking calendars that count: ${cfg.ghl.booking_calendars.join(', ')}. Sales pipeline that counts: ${cfg.ghl.sales_pipeline}`
      : 'none connected (bookings and sales come from the custom sources)',
    custom_sources_note: Object.keys(cfg.custom_sources || {}).length ? `, plus custom tabs: ${Object.keys(cfg.custom_sources).join(', ')}` : '',
  };
  derived.system_prompt = render(T('prompts/weekly-summary-system-prompt.txt'), cfg, derived);
  derived.system_prompt_js = JSON.stringify(derived.system_prompt);

  const out = join(outRoot, cfg.slug);
  rmSync(out, { recursive: true, force: true });
  const files = {};
  const put = (path, text) => { files[path] = text; };
  const has = (s) => cfg.sources.includes(s);

  put('sheet/setup-warehouse.gs', render(T('sheet/setup-warehouse.gs'), cfg, derived));
  if (has('ghl')) {
    put('n8n/ghl-1-date-range.js', render(T('n8n/ghl-1-date-range.js'), cfg, derived));
    put('n8n/ghl-2-count-by-day.js', render(T('n8n/ghl-2-count-by-day.js'), cfg, derived));
  }
  if (has('meta_ads')) put('n8n/meta-tidy.js', render(T('n8n/meta-tidy.js'), cfg, derived));
  if (has('xero')) put('n8n/xero-sum-by-day.js', render(T('n8n/xero-sum-by-day.js'), cfg, derived));
  if (has('ga4')) put('n8n/ga4-tidy.js', render(T('n8n/ga4-tidy.js'), cfg, derived));
  if (has('google_ads')) put('google-ads/rd-warehouse-sync.js', render(T('google-ads/rd-warehouse-sync.js'), cfg, derived));
  put('n8n/summary-1-build-request.js', render(T('n8n/summary-1-build-request.js'), cfg, derived));
  put('n8n/summary-2-check-answer.js', render(T('n8n/summary-2-check-answer.js'), cfg, derived));

  const parts = ['_intro', '00-credentials', ...['ghl', 'google_ads', 'meta_ads', 'xero', 'ga4'].filter(has)];
  if (Object.keys(cfg.custom_sources || {}).length) parts.push('custom');
  parts.push('summary', 'monitoring');
  put('n8n/WORKFLOWS.md', parts.map((p) => render(T(`n8n/workflows/${p}.md`), cfg, derived).trimEnd()).join('\n\n') + '\n');

  put('prompts/weekly-summary-system-prompt.txt', derived.system_prompt);
  put('prompts/master-prompt.md', render(T('prompts/master-prompt.md'), cfg, derived));
  put('looker/DASHBOARD.md', render(T('looker/DASHBOARD.md'), cfg, derived));
  put('docs/LAUNCH-CHECKLIST.md', render(T('docs/LAUNCH-CHECKLIST.md'), cfg, derived));
  put('docs/KPI-DICTIONARY.md', kpiDictionary(cfg));
  put('README.md', clientReadme(cfg, Object.keys(files)));

  for (const [path, text] of Object.entries(files)) {
    mkdirSync(dirname(join(out, path)), { recursive: true });
    writeFileSync(join(out, path), text);
  }
  return { out, files: Object.keys(files), cfg };
}

function kpiDictionary(cfg) {
  const target = (m) => (m.target == null ? '' : m.format === 'percent' ? `${Math.round(m.target * 1000) / 10}%` : m.format === 'money' ? `$${m.target}` : String(m.target));
  const rows = cfg.metrics.map((m) => `| ${m.label} | \`${m.metric}\` | ${m.definition} | ${m.source} | ${m.good_when} | ${target(m)} |`);
  return `# KPI dictionary: ${cfg.business.name}

Send this to ${cfg.business.owner_name} to approve in writing (an email reply is fine) before anyone sees the dashboard.

| Metric | Name in the sheet | Exact rule | Source of truth | Better when | Target |
| --- | --- | --- | --- | --- | --- |
${rows.join('\n')}

- Weeks run Monday to Sunday in ${cfg.business.timezone}.
- A move of ${Math.round((cfg.big_move_threshold ?? 0.2) * 100)}% or more against the 4-week average is flagged as a big move.
- Leads come from the CRM; spend comes from the ad platforms. The platforms' own conversion counts are shown for reference only.
`;
}

function clientReadme(cfg, files) {
  return `# ${cfg.business.name}: AI reporting dashboard

Generated from \`configs/${cfg.slug}.json\`. Don't edit these files by hand: change the config and run
\`node scripts/new-client.mjs configs/${cfg.slug}.json\` again.

## Build order

1. **KPI workshop** with ${cfg.business.owner_name} (60-90 min). Agree the metrics, then send \`docs/KPI-DICTIONARY.md\` for written approval. Update the config if anything changed and regenerate.
2. **Master prompt**: paste \`prompts/master-prompt.md\` into a new Claude chat and keep it for the whole build.
3. **Accounts and read-only access**: \`n8n/WORKFLOWS.md\` → Credentials. Ask for access on day 1; it's the slowest part.
4. **Warehouse**: in ${cfg.business.google_account}'s Drive, create a Google Sheet named \`${cfg.business.name} – Reporting Warehouse\`. Extensions → Apps Script → paste \`sheet/setup-warehouse.gs\` → Save → reload the sheet → **Reporting → Build or refresh warehouse**.
5. **Syncs**: build each workflow in \`n8n/WORKFLOWS.md\`, pasting the matching file from \`n8n/\`.${cfg.sources.includes('google_ads') ? ' Google Ads uses `google-ads/rd-warehouse-sync.js`.' : ''}
6. **Reconcile**: type each source's own totals for last month into the Checks tab, column D. Fix every mismatch before anyone sees the dashboard.
7. **Dashboard**: \`looker/DASHBOARD.md\`.
8. **Monday summary**: the last section of \`n8n/WORKFLOWS.md\`. Leave \`auto_send\` FALSE for 4 weeks and approve each draft.
9. **Launch**: \`docs/LAUNCH-CHECKLIST.md\`.

## Demo mode

For a sales demo, build the sheet (step 4), then **Reporting → Load demo data**. It fills every raw tab with made-up numbers from ${cfg.data_start_date} to yesterday, with a booking-rate drop in the last full week so the Monday summary has a story to tell. Never run it on a live client's sheet.

## Files

${files.filter((f) => f !== 'README.md').sort().map((f) => `- \`${f}\``).join('\n')}
`;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const args = process.argv.slice(2);
  const cfgPath = args.find((a) => !a.startsWith('--'));
  if (!cfgPath) { console.error('Usage: node scripts/new-client.mjs configs/<slug>.json [--out <dir>]'); process.exit(1); }
  const outIdx = args.indexOf('--out');
  try {
    const { out, files } = buildClient(resolve(cfgPath), outIdx > -1 ? resolve(args[outIdx + 1]) : undefined);
    console.log(`Built ${files.length} files in ${out}`);
  } catch (e) {
    console.error(e.message);
    process.exit(1);
  }
}
