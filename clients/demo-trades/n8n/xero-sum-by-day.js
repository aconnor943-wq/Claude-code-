// n8n Code node "Sum by day" (workflow: RD – Northside Electrical – Xero daily). Mode: Run Once for All Items.
// Reads the nodes named "Sales invoices" (Invoices, Type ACCREC) and "Payments". Check the raw output once.
// revenue_invoiced = SubTotal (ex GST) of AUTHORISED or PAID invoices; cash_received = payment Amount (inc GST).
const TZ = 'Australia/Brisbane';
const day = ms => new Date(ms).toLocaleDateString('en-CA', { timeZone: TZ });
// Xero dates arrive as "/Date(1730073600000+0000)/" or as an ISO string; DateString is local date text.
const toDay = v => {
  if (v == null) return null;
  const m = String(v).match(/\/Date\((-?\d+)/);
  if (m) return day(Number(m[1]));
  const s = String(v);
  return /^\d{4}-\d{2}-\d{2}/.test(s) ? s.slice(0, 10) : day(Date.parse(s));
};
const invoices = $('Sales invoices').all().flatMap(i => i.json.Invoices ?? [i.json]).filter(x => x && x.InvoiceID);
const payments = $('Payments').all().flatMap(i => i.json.Payments ?? [i.json]).filter(x => x && x.PaymentID);
const totals = {};
const add = (date, key, v) => {
  if (!date) return;
  totals[date] = totals[date] || { revenue_invoiced: 0, cash_received: 0 };
  totals[date][key] += Number(v || 0);
};
for (const inv of invoices) {
  if ((inv.Type || 'ACCREC') !== 'ACCREC') continue;
  if (!['AUTHORISED', 'PAID'].includes(inv.Status)) continue;
  add(inv.DateString ? inv.DateString.slice(0, 10) : toDay(inv.Date), 'revenue_invoiced', inv.SubTotal);
}
for (const p of payments) {
  if (p.Status === 'DELETED') continue;
  if (p.Invoice && p.Invoice.Type && p.Invoice.Type !== 'ACCREC') continue;
  add(toDay(p.Date), 'cash_received', p.Amount);
}
// one row for each of the last 14 days, zeros included, so a quiet day writes 0 instead of leaving a gap
const out = [];
for (let i = 14; i >= 1; i--) {
  const d = day(Date.now() - i * 86400000);
  const t = totals[d] || { revenue_invoiced: 0, cash_received: 0 };
  out.push({ json: { date: d, revenue_invoiced: Math.round(t.revenue_invoiced * 100) / 100,
    cash_received: Math.round(t.cash_received * 100) / 100, synced_at: new Date().toISOString() } });
}
return out;
