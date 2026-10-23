// Shared helpers: load a client config, check it, and fill {{placeholders}} in template files.
import { readFileSync } from 'node:fs';

// Column layouts for the standard sources (the n8n Code nodes and the Google Ads Script write these).
export const SOURCE_COLUMNS = {
  ghl: ['date', 'leads', 'leads_paid', 'leads_google', 'leads_meta', 'booked', 'appts_due', 'showed', 'no_show', 'cancelled', 'won', 'won_value', 'synced_at'],
  google_ads: ['date', 'spend', 'clicks', 'impressions', 'conversions', 'synced_at'],
  meta_ads: ['date', 'spend', 'clicks', 'impressions', 'platform_leads', 'synced_at'],
  xero: ['date', 'revenue_invoiced', 'cash_received', 'synced_at'],
  ga4: ['date', 'sessions', 'users', 'key_events', 'synced_at'],
};

export function loadConfig(path) {
  const cfg = JSON.parse(readFileSync(path, 'utf8'));
  const problems = validate(cfg);
  if (problems.length) throw new Error(`Config ${path} has problems:\n- ${problems.join('\n- ')}`);
  return cfg;
}

// Every raw tab the client's sheet needs: { tabName: [columns] }
export function rawTabs(cfg) {
  const tabs = {};
  for (const s of cfg.sources) tabs[`raw_${s}`] = SOURCE_COLUMNS[s];
  for (const [tab, cols] of Object.entries(cfg.custom_sources || {})) tabs[tab] = cols;
  return tabs;
}

export function validate(cfg) {
  const p = [];
  for (const k of ['slug', 'business', 'metrics', 'sources', 'data_start_date']) if (cfg[k] == null) p.push(`missing "${k}"`);
  if (p.length) return p;
  if (!/^[a-z0-9-]+$/.test(cfg.slug)) p.push('slug must be lower-case letters, numbers and dashes');
  for (const s of cfg.sources) if (!SOURCE_COLUMNS[s]) p.push(`unknown source "${s}" (standard sources: ${Object.keys(SOURCE_COLUMNS).join(', ')}; put anything else in custom_sources)`);
  for (const [tab, cols] of Object.entries(cfg.custom_sources || {})) {
    if (!tab.startsWith('raw_')) p.push(`custom source tab "${tab}" must start with raw_`);
    if (cols[0] !== 'date') p.push(`custom source tab "${tab}" must have "date" as its first column`);
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(cfg.data_start_date) || new Date(cfg.data_start_date + 'T00:00:00Z').getUTCDay() !== 1)
    p.push('data_start_date must be a Monday, written YYYY-MM-DD');
  const tabs = rawTabs(cfg);
  const names = new Set();
  for (const m of cfg.metrics) {
    if (names.has(m.metric)) p.push(`metric "${m.metric}" appears twice`);
    names.add(m.metric);
    if (!/^[a-z][a-z0-9_]*$/.test(m.metric)) p.push(`metric name "${m.metric}" must be lower_snake_case`);
    if (!['count', 'ratio'].includes(m.type)) p.push(`metric "${m.metric}": type must be count or ratio`);
    if (!['number', 'money', 'percent'].includes(m.format)) p.push(`metric "${m.metric}": format must be number, money or percent`);
    if (!['up', 'down'].includes(m.good_when)) p.push(`metric "${m.metric}": good_when must be up or down`);
    if (m.type === 'count') {
      if (!Array.isArray(m.daily) || !m.daily.length) p.push(`metric "${m.metric}": a count needs "daily" [[tab, column], ...]`);
      for (const [tab, col] of m.daily || []) {
        if (!tabs[tab]) p.push(`metric "${m.metric}": tab ${tab} is not one of this client's sources`);
        else if (!tabs[tab].includes(col)) p.push(`metric "${m.metric}": ${tab} has no column ${col}`);
      }
    }
  }
  for (const m of cfg.metrics.filter((x) => x.type === 'ratio')) {
    for (const side of ['num', 'den']) {
      const ref = cfg.metrics.find((x) => x.metric === m[side]);
      if (!ref) p.push(`ratio "${m.metric}": ${side} "${m[side]}" is not a metric`);
      else if (ref.type !== 'count') p.push(`ratio "${m.metric}": ${side} "${m[side]}" must be a count, not another ratio`);
    }
  }
  return p;
}

// {{business.name}} -> value; {{json:metrics}} -> JSON; {{list:summary.levers}} -> "- a\n- b"
export function render(text, cfg, extra = {}) {
  const ctx = { ...cfg, ...extra };
  const get = (path) => path.split('.').reduce((o, k) => (o == null ? undefined : o[k]), ctx);
  return text.replace(/\{\{\s*(json:|list:|join:)?([a-zA-Z0-9_.]+)\s*\}\}/g, (whole, mode, path) => {
    const v = get(path);
    if (v === undefined) throw new Error(`Template placeholder ${whole} has no value in the config`);
    if (mode === 'json:') return JSON.stringify(v, null, 2);
    if (mode === 'list:') return v.map((x) => `- ${x}`).join('\n');
    if (mode === 'join:') return v.join(', ');
    return String(v);
  });
}
