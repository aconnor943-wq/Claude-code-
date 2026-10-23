// n8n Code node "Date range" (workflow: RD – {{business.name}} – GHL daily). Mode: Run Once for All Items.
// Yesterday plus 7 days back. Re-pulling the week matters: show/no-show statuses and won deals change days later.
const TZ = '{{business.timezone}}';
const day = d => new Date(d).toLocaleDateString('en-CA', { timeZone: TZ }); // YYYY-MM-DD
const dates = [];
for (let i = 8; i >= 1; i--) dates.push(day(Date.now() - i * 86400000));
return [{ json: { dates,
  startMs: Date.now() - 9 * 86400000,       // a day of slack for time zones
  endMs: Date.now(),
  apptEndMs: Date.now() + 90 * 86400000 }}]; // this week's bookings can be for next month
