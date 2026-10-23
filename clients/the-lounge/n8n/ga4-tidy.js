// n8n Code node "Tidy GA4" (workflow: RD – The Lounge – GA4 daily). Mode: Run Once for All Items.
// Accepts either a GA4 Data API runReport response (rows[].dimensionValues / metricValues, metrics in the order
// sessions, totalUsers, keyEventCount) or one item per day from n8n's Google Analytics node (date, sessions, ...).
const iso = v => { const s = String(v); return /^\d{8}$/.test(s) ? `${s.slice(0, 4)}-${s.slice(4, 6)}-${s.slice(6, 8)}` : s.slice(0, 10); };
const out = [];
for (const item of $input.all()) {
  const j = item.json;
  if (Array.isArray(j.rows)) {
    for (const r of j.rows) out.push({ date: iso(r.dimensionValues[0].value),
      sessions: Number(r.metricValues[0].value || 0), users: Number(r.metricValues[1]?.value || 0),
      key_events: Number(r.metricValues[2]?.value || 0) });
  } else if (j.date) {
    out.push({ date: iso(j.date), sessions: Number(j.sessions || 0),
      users: Number(j.totalUsers ?? j.users ?? 0), key_events: Number(j.keyEvents ?? j.keyEventCount ?? j.key_events ?? 0) });
  }
}
const stamp = new Date().toISOString();
return out.map(r => ({ json: { ...r, synced_at: stamp } }));
