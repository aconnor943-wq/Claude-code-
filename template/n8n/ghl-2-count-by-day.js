// n8n Code node "Count by day" (workflow: RD – {{business.name}} – GHL daily). Mode: Run Once for All Items.
// Counts only: no names, phones or emails leave this node.
// Reads the outputs of the nodes named "Date range", "Contacts created", "Appointments" and "Won opportunities".
// Check the raw output of those nodes once: the field names and status values below must match.
const TZ = '{{business.timezone}}';
const day = d => new Date(d).toLocaleDateString('en-CA', { timeZone: TZ });
const { dates } = $('Date range').first().json;
const uniq = arr => [...new Map(arr.filter(x => x && x.id).map(x => [x.id, x])).values()];
const contacts = uniq($('Contacts created').all().flatMap(i => i.json.contacts ?? []));
const appts = uniq($('Appointments').all().flatMap(i => i.json.events ?? []));
const opps = uniq($('Won opportunities').all().flatMap(i => i.json.opportunities ?? []));
const EXCLUDE = {{json:ghl.exclude_tags}};
const MAP = {{json:ghl.source_map}};
const STATUS = {{json:ghl.status_values}};
const text = c => `${c.source || ''} ${(c.tags || []).join(' ')}`.toLowerCase();
const isLead = c => !(c.tags || []).some(t => EXCLUDE.includes(String(t).toLowerCase()));
const is = (c, ch) => (MAP[ch] || []).some(k => text(c).includes(k));
return dates.map(date => {
  const L = contacts.filter(c => isLead(c) && day(c.dateAdded) === date);
  const g = L.filter(c => is(c, 'google')).length;
  const m = L.filter(c => !is(c, 'google') && is(c, 'meta')).length;
  const due = appts.filter(a => day(a.startTime) === date);
  const won = opps.filter(o => o.status === 'won' && day(o.lastStatusChangeAt || o.updatedAt) === date);
  return { json: {
    date, leads: L.length, leads_paid: g + m, leads_google: g, leads_meta: m,
    booked: appts.filter(a => day(a.dateAdded) === date && a.appointmentStatus !== STATUS.invalid).length,
    appts_due: due.filter(a => a.appointmentStatus !== STATUS.cancelled).length,
    showed: due.filter(a => a.appointmentStatus === STATUS.showed).length,
    no_show: due.filter(a => a.appointmentStatus === STATUS.no_show).length,
    cancelled: due.filter(a => a.appointmentStatus === STATUS.cancelled).length,
    won: won.length, won_value: won.reduce((s, o) => s + Number(o.monetaryValue || 0), 0),
    synced_at: new Date().toISOString() }};
});
