// Google Ads Script "RD warehouse sync" for Harbourside Physio.
// In the ad account: Tools -> Bulk actions -> Scripts -> + (menu names may differ). Paste, Authorise, Preview,
// then schedule Daily around 4am. Writes one row per day for the last 14 days into raw_google_ads,
// updating days that are already there. Only SHEET_URL changes per client.
const SHEET_URL = '[SHEET URL]';
function main() {
  const ss = SpreadsheetApp.openByUrl(SHEET_URL);
  const sheet = ss.getSheetByName('raw_google_ads');
  const tz = ss.getSpreadsheetTimeZone();
  const rows = AdsApp.search('SELECT segments.date, metrics.cost_micros, metrics.clicks, ' +
    'metrics.impressions, metrics.conversions FROM customer WHERE segments.date DURING LAST_14_DAYS');
  const byDate = {};
  while (rows.hasNext()) {
    const r = rows.next();
    byDate[r.segments.date] = [r.segments.date, Number(r.metrics.costMicros) / 1e6,
      Number(r.metrics.clicks), Number(r.metrics.impressions),
      Number(r.metrics.conversions), new Date().toISOString()];
  }
  const data = sheet.getDataRange().getValues();
  const rowOf = {};
  for (let i = 1; i < data.length; i++) {
    const d = data[i][0];
    rowOf[d instanceof Date ? Utilities.formatDate(d, tz, 'yyyy-MM-dd') : String(d)] = i + 1;
  }
  Object.keys(byDate).forEach(date => {
    if (rowOf[date]) sheet.getRange(rowOf[date], 1, 1, 6).setValues([byDate[date]]);
    else sheet.appendRow(byDate[date]);
  });
}
