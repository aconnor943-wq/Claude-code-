// n8n Code node "Tidy Meta" (workflow: RD – Harbourside Physio – Meta daily). Mode: Run Once for Each Item.
// Input: one Meta insights response (account level, time_increment=1). Check which action_type the client's
// lead forms report in the raw output; this config uses "lead".
const LEAD_ACTION = 'lead';
return ($json.data ?? []).map(r => ({ json: {
  date: r.date_start,
  spend: Number(r.spend || 0), clicks: Number(r.clicks || 0), impressions: Number(r.impressions || 0),
  platform_leads: Number((r.actions || []).find(a => a.action_type === LEAD_ACTION)?.value || 0),
  synced_at: new Date().toISOString() }}));
