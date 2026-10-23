/**
 * Reporting warehouse for Harbourside Physio.
 * Generated from configs/demo-clinic.json - change the config and regenerate rather than editing CONFIG by hand.
 *
 * Install: open the client's Google Sheet -> Extensions -> Apps Script -> paste this whole file -> Save.
 * Reload the sheet, then use the "Reporting" menu. Safe to run again: raw data and typed reconciliation
 * figures are kept; the derived tabs (Daily, Weekly, Metrics, Checks) are rebuilt.
 */
const CONFIG = {
  "business_name": "Harbourside Physio",
  "timezone": "Australia/Brisbane",
  "data_start_date": "2026-07-06",
  "big_move_threshold": 0.2,
  "owner_email": "owner@example.com",
  "builder_email": "you@example.com",
  "raw_tabs": {
    "raw_ghl": [
      "date",
      "leads",
      "leads_paid",
      "leads_google",
      "leads_meta",
      "booked",
      "appts_due",
      "showed",
      "no_show",
      "cancelled",
      "won",
      "won_value",
      "synced_at"
    ],
    "raw_google_ads": [
      "date",
      "spend",
      "clicks",
      "impressions",
      "conversions",
      "synced_at"
    ],
    "raw_meta_ads": [
      "date",
      "spend",
      "clicks",
      "impressions",
      "platform_leads",
      "synced_at"
    ],
    "raw_xero": [
      "date",
      "revenue_invoiced",
      "cash_received",
      "synced_at"
    ],
    "raw_ga4": [
      "date",
      "sessions",
      "users",
      "key_events",
      "synced_at"
    ]
  },
  "demo": {},
  "metrics": [
    {
      "metric": "leads",
      "label": "New enquiries",
      "definition": "New contacts created that day (Brisbane time), not tagged staff, spam, team-internal or existing-client.",
      "source": "GHL",
      "good_when": "up",
      "target": null,
      "type": "count",
      "format": "number",
      "daily": [
        [
          "raw_ghl",
          "leads"
        ]
      ],
      "show": true
    },
    {
      "metric": "leads_paid",
      "label": "Enquiries from ads",
      "definition": "New enquiries whose source or tags map to Google Ads or Meta.",
      "source": "GHL",
      "good_when": "up",
      "target": null,
      "type": "count",
      "format": "number",
      "daily": [
        [
          "raw_ghl",
          "leads_paid"
        ]
      ],
      "show": false
    },
    {
      "metric": "booked",
      "label": "Bookings made",
      "definition": "Appointments created that day on the New patient assessment and Pilates intro class calendars, any status except invalid.",
      "source": "GHL calendars",
      "good_when": "up",
      "target": null,
      "type": "count",
      "format": "number",
      "daily": [
        [
          "raw_ghl",
          "booked"
        ]
      ],
      "show": true
    },
    {
      "metric": "appts_due",
      "label": "Appointments due",
      "definition": "Appointments scheduled for that day on those calendars, not cancelled.",
      "source": "GHL calendars",
      "good_when": "up",
      "target": null,
      "type": "count",
      "format": "number",
      "daily": [
        [
          "raw_ghl",
          "appts_due"
        ]
      ],
      "show": false
    },
    {
      "metric": "showed",
      "label": "Showed up",
      "definition": "Appointments scheduled for that day with status showed.",
      "source": "GHL calendars",
      "good_when": "up",
      "target": null,
      "type": "count",
      "format": "number",
      "daily": [
        [
          "raw_ghl",
          "showed"
        ]
      ],
      "show": true
    },
    {
      "metric": "booking_rate",
      "label": "Booking rate",
      "definition": "Bookings made divided by new enquiries, from the totals for the period.",
      "source": "Sheet formula",
      "good_when": "up",
      "target": 0.4,
      "type": "ratio",
      "format": "percent",
      "num": "booked",
      "den": "leads",
      "show": true
    },
    {
      "metric": "show_rate",
      "label": "Show rate",
      "definition": "Showed up divided by appointments due, from the totals for the period.",
      "source": "Sheet formula",
      "good_when": "up",
      "target": 0.9,
      "type": "ratio",
      "format": "percent",
      "num": "showed",
      "den": "appts_due",
      "show": true
    },
    {
      "metric": "ad_spend",
      "label": "Ad spend",
      "definition": "Google Ads plus Meta spend that day as the platforms report it, ex GST, in AUD.",
      "source": "Ad platforms",
      "good_when": "down",
      "target": null,
      "type": "count",
      "format": "money",
      "daily": [
        [
          "raw_google_ads",
          "spend"
        ],
        [
          "raw_meta_ads",
          "spend"
        ]
      ],
      "show": true
    },
    {
      "metric": "cpl",
      "label": "Cost per lead",
      "definition": "Ad spend divided by enquiries from ads.",
      "source": "Sheet formula",
      "good_when": "down",
      "target": 40,
      "type": "ratio",
      "format": "money",
      "num": "ad_spend",
      "den": "leads_paid",
      "show": true
    },
    {
      "metric": "cost_per_booking",
      "label": "Cost per booking (blended)",
      "definition": "All ad spend divided by all bookings made, including bookings that didn't come from ads.",
      "source": "Sheet formula",
      "good_when": "down",
      "target": null,
      "type": "ratio",
      "format": "money",
      "num": "ad_spend",
      "den": "booked",
      "show": true
    },
    {
      "metric": "won_value",
      "label": "Treatment plans won ($)",
      "definition": "Total value of New patients pipeline opportunities marked Won that day.",
      "source": "GHL",
      "good_when": "up",
      "target": null,
      "type": "count",
      "format": "money",
      "daily": [
        [
          "raw_ghl",
          "won_value"
        ]
      ],
      "show": true
    },
    {
      "metric": "revenue_invoiced",
      "label": "Revenue invoiced",
      "definition": "Sales invoices dated that day, ex GST, excluding draft and voided.",
      "source": "Xero",
      "good_when": "up",
      "target": null,
      "type": "count",
      "format": "money",
      "daily": [
        [
          "raw_xero",
          "revenue_invoiced"
        ]
      ],
      "show": true
    },
    {
      "metric": "cash_received",
      "label": "Cash received",
      "definition": "Payments received on sales invoices that day, inc GST.",
      "source": "Xero",
      "good_when": "up",
      "target": null,
      "type": "count",
      "format": "money",
      "daily": [
        [
          "raw_xero",
          "cash_received"
        ]
      ],
      "show": true
    }
  ]
};

const DAILY_ROWS = 1100;   // about 3 years of days
const WEEKLY_ROWS = 160;   // about 3 years of weeks
const MONEY_FORMAT = '$#,##0.00';
const PERCENT_FORMAT = '0.0%';
const DATE_FORMAT = 'yyyy-mm-dd';

function onOpen() {
  SpreadsheetApp.getUi().createMenu('Reporting')
    .addItem('Build or refresh warehouse', 'setupWarehouse')
    .addSeparator()
    .addItem('Load demo data (sample numbers)', 'loadDemoData')
    .addItem('Clear all raw data', 'clearRawData')
    .addToUi();
}

function setupWarehouse() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  ss.setSpreadsheetTimeZone(CONFIG.timezone);
  ss.setSpreadsheetLocale('en_AU');
  buildSettings_(ss);
  buildKpiDictionary_(ss);
  buildRawTabs_(ss);
  buildDaily_(ss);
  buildWeekly_(ss);
  buildMetrics_(ss);
  buildChecks_(ss);
  buildSummaries_(ss);
  const order = ['Settings', 'KPI_Dictionary', 'Metrics', 'Checks', 'Weekly', 'Daily']
    .concat(Object.keys(CONFIG.raw_tabs), ['Summaries']);
  order.forEach((name, i) => { ss.setActiveSheet(ss.getSheetByName(name)); ss.moveActiveSheet(i + 1); });
  const blank = ss.getSheetByName('Sheet1');
  if (blank && blank.getLastRow() === 0) ss.deleteSheet(blank);
  ss.setActiveSheet(ss.getSheetByName('Metrics'));
  SpreadsheetApp.getActive().toast('Warehouse built. Time zone: ' + CONFIG.timezone, 'Reporting', 5);
}

// ---------- tabs ----------

function buildSettings_(ss) {
  const sh = tab_(ss, 'Settings');
  const old = readKeyValues_(sh);
  const rows = [
    ['business_name', CONFIG.business_name],
    ['timezone', CONFIG.timezone],
    ['report_week_start', ''],                                   // formula below (cell B4)
    ['big_move_threshold', CONFIG.big_move_threshold],           // cell B5
    ['auto_send', old.auto_send === '' || old.auto_send === undefined ? false : old.auto_send],
    ['owner_email', old.owner_email || CONFIG.owner_email],
    ['owner_contact_id', old.owner_contact_id || ''],
    ['builder_email', old.builder_email || CONFIG.builder_email],
  ];
  sh.clearContents();
  setHeader_(sh, ['key', 'value']);
  sh.getRange(2, 1, rows.length, 2).setValues(rows);
  sh.getRange('B4').setFormula('=TODAY()-WEEKDAY(TODAY(),3)-7').setNumberFormat(DATE_FORMAT);
  sh.autoResizeColumns(1, 2);
}

function buildKpiDictionary_(ss) {
  const sh = tab_(ss, 'KPI_Dictionary');
  sh.clearContents();
  setHeader_(sh, ['metric', 'label', 'definition', 'source', 'good_when', 'target']);
  const rows = CONFIG.metrics.map(m => [m.metric, m.label, m.definition, m.source, m.good_when, m.target == null ? '' : m.target]);
  sh.getRange(2, 1, rows.length, 6).setValues(rows).setWrap(true);
  sh.setColumnWidth(3, 480);
}

function buildRawTabs_(ss) {
  Object.keys(CONFIG.raw_tabs).forEach(name => {
    const sh = tab_(ss, name);
    setHeader_(sh, CONFIG.raw_tabs[name]);
    sh.getRange('A2:A').setNumberFormat(DATE_FORMAT);
  });
}

function buildDaily_(ss) {
  const sh = tab_(ss, 'Daily');
  sh.clear();
  const counts = CONFIG.metrics.filter(m => m.type === 'count');
  setHeader_(sh, ['date', 'has_data'].concat(counts.map(m => m.metric)));
  const n = DAILY_ROWS;
  sh.getRange('A2').setFormula('=DATE(' + CONFIG.data_start_date.split('-').map(Number).join(',') + ')');
  sh.getRange(3, 1, n - 1, 1).setFormula('=A2+1');
  sh.getRange(2, 1, n, 1).setNumberFormat(DATE_FORMAT);
  sh.getRange(2, 2, n, 1).setFormula('=A2<TODAY()');
  counts.forEach((m, i) => {
    const parts = m.daily.map(([tab, col]) => {
      const L = colLetter_(CONFIG.raw_tabs[tab].indexOf(col) + 1);
      return 'SUMIFS(' + tab + '!$' + L + ':$' + L + ',' + tab + '!$A:$A,$A2)';
    });
    const range = sh.getRange(2, 3 + i, n, 1);
    range.setFormula('=' + parts.join('+'));
    if (m.format === 'money') range.setNumberFormat(MONEY_FORMAT);
  });
}

function buildWeekly_(ss) {
  const sh = tab_(ss, 'Weekly');
  sh.clear();
  const names = CONFIG.metrics.map(m => m.metric);
  setHeader_(sh, ['week_start'].concat(names));
  const n = WEEKLY_ROWS;
  const dailyCounts = CONFIG.metrics.filter(m => m.type === 'count').map(m => m.metric);
  sh.getRange('A2').setFormula('=DATE(' + CONFIG.data_start_date.split('-').map(Number).join(',') + ')');
  sh.getRange(3, 1, n - 1, 1).setFormula('=A2+7');
  sh.getRange(2, 1, n, 1).setNumberFormat(DATE_FORMAT);
  CONFIG.metrics.forEach((m, i) => {
    const range = sh.getRange(2, 2 + i, n, 1);
    if (m.type === 'count') {
      const L = colLetter_(3 + dailyCounts.indexOf(m.metric));
      range.setFormula('=IF($A2>TODAY(),"",SUMIFS(Daily!' + L + ':' + L + ',Daily!$A:$A,">="&$A2,Daily!$A:$A,"<"&$A2+7))');
    } else {
      // rates and costs come from the week's totals, never from averaging
      const num = colLetter_(2 + names.indexOf(m.num));
      const den = colLetter_(2 + names.indexOf(m.den));
      range.setFormula('=IFERROR(' + num + '2/' + den + '2,"")');
    }
    if (m.format === 'money') range.setNumberFormat(MONEY_FORMAT);
    if (m.format === 'percent') range.setNumberFormat(PERCENT_FORMAT);
  });
}

function buildMetrics_(ss) {
  const sh = tab_(ss, 'Metrics');
  sh.clear();
  setHeader_(sh, ['metric', 'label', 'this_week', 'last_week', 'avg_4wk', 'vs_last_pct', 'vs_avg_pct', 'good_when', 'flag']);
  const shown = CONFIG.metrics.filter(m => m.show !== false);
  const names = CONFIG.metrics.map(m => m.metric);
  const col = name => { const L = colLetter_(2 + names.indexOf(name)); return 'Weekly!$' + L + ':$' + L; };
  const inFourWeeks = 'Weekly!$A:$A,">="&Settings!$B$4-28,Weekly!$A:$A,"<"&Settings!$B$4';
  const week = (name, offset) => 'INDEX(' + col(name) + ',MATCH(Settings!$B$4' + offset + ',Weekly!$A:$A,0))';
  shown.forEach((m, i) => {
    const r = i + 2;
    // 4-week figures for rates and costs come from 4 weeks of totals, never from averaging four rates
    const avg = m.type === 'ratio'
      ? '=IFERROR(SUMIFS(' + col(m.num) + ',' + inFourWeeks + ')/SUMIFS(' + col(m.den) + ',' + inFourWeeks + '),"")'
      : '=IFERROR(SUMIFS(' + col(m.metric) + ',' + inFourWeeks + ')/COUNTIFS(' + inFourWeeks + '),"")';   // the weeks that exist, up to 4
    const cells = [
      m.metric,
      m.label,
      '=IFERROR(' + week(m.metric, '') + ',"")',
      '=IFERROR(' + week(m.metric, '-7') + ',"")',
      avg,
      '=IFERROR(C{r}/D{r}-1,"")',
      '=IFERROR(C{r}/E{r}-1,"")',
      m.good_when,
      '=IF(G{r}="","",IF(ABS(G{r})>=Settings!$B$5,IF((G{r}>0)=(H{r}="up"),"BIG GOOD MOVE","BIG BAD MOVE"),""))',
    ].map(c => String(c).split('{r}').join(String(r)));
    sh.getRange(r, 1, 1, 9).setValues([cells]);
    const fmt = m.format === 'money' ? MONEY_FORMAT : m.format === 'percent' ? PERCENT_FORMAT : '#,##0';
    sh.getRange(r, 3, 1, 3).setNumberFormat(fmt);
    sh.getRange(r, 6, 1, 2).setNumberFormat('+0%;-0%;0%');
  });
  sh.autoResizeColumns(1, 9);
}

function buildChecks_(ss) {
  const sh = tab_(ss, 'Checks');
  const typed = {};
  if (sh.getLastRow() > 1) {
    sh.getRange(2, 1, sh.getLastRow() - 1, 4).getValues().forEach(row => { if (row[3] !== '') typed[row[0]] = row[3]; });
  }
  sh.clear();
  setHeader_(sh, ['check', 'result', 'ok', 'source_figure', 'how']);
  const rows = [];
  Object.keys(CONFIG.raw_tabs).forEach(tab => {
    rows.push([tab + ' fresh', '=IFERROR(MAX(' + tab + '!A:A),"")', '=AND(ISNUMBER(B{r}),B{r}>=TODAY()-1)', '',
      'Newest date in ' + tab + '. FALSE means the sync stopped.']);
    rows.push([tab + ' duplicate dates', '=COUNTA(' + tab + '!A:A)-COUNTUNIQUE(' + tab + '!A:A)', '=B{r}=0', '',
      'Rows sharing a date. FALSE means a sync appended instead of updating.']);
  });
  const negatives = Object.keys(CONFIG.raw_tabs).map(tab => {
    const cols = CONFIG.raw_tabs[tab];
    const last = colLetter_(cols[cols.length - 1] === 'synced_at' ? cols.length - 1 : cols.length);
    return 'COUNTIF(' + tab + '!B:' + last + ',"<0")';
  });
  rows.push(['negative numbers', '=' + negatives.join('+'), '=B{r}=0', '', 'Any negative value in a raw tab.']);
  const lastMonth = '">="&EOMONTH(TODAY(),-2)+1,Daily!$A:$A,"<="&EOMONTH(TODAY(),-1)';
  CONFIG.metrics.filter(m => m.type === 'count' && m.show !== false).forEach(m => {
    const i = CONFIG.metrics.filter(x => x.type === 'count').map(x => x.metric).indexOf(m.metric);
    const L = colLetter_(3 + i);
    const name = 'reconcile ' + m.metric + ' (last month)';
    const tolerance = m.format === 'money' ? 1 : 0;
    rows.push([name,
      '=IF(D{r}="","not checked yet",SUMIFS(Daily!' + L + ':' + L + ',Daily!$A:$A,' + lastMonth + ')-D{r})',
      '=IF(D{r}="",TRUE,ABS(B{r})<=' + tolerance + ')',
      typed[name] === undefined ? '' : typed[name],
      'Type ' + m.source + "'s own total for last calendar month in column D. Result is sheet minus source."]);
  });
  const values = rows.map((row, i) => row.map(c => String(c).split('{r}').join(String(i + 2))));
  sh.getRange(2, 1, values.length, 5).setValues(values);
  sh.setColumnWidth(5, 420);
  sh.autoResizeColumns(1, 3);
}

function buildSummaries_(ss) {
  const sh = tab_(ss, 'Summaries');
  if (sh.getLastRow() === 0) setHeader_(sh, ['week_start', 'status', 'subject', 'summary', 'actions', 'sms', 'numbers_ok', 'flags', 'created_at', 'sent_at']);
}

// ---------- demo data ----------

function loadDemoData() {
  const ui = SpreadsheetApp.getUi();
  if (ui.alert('Load demo data?', 'This fills the raw tabs with made-up numbers for a demo. Never run it on a live client sheet.', ui.ButtonSet.OK_CANCEL) !== ui.Button.OK) return;
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const tz = CONFIG.timezone;
  const rand = mulberry32_(20261023);
  const noise = (base, spread) => Math.max(0, Math.round(base + (rand() * 2 - 1) * spread));
  const today = Utilities.formatDate(new Date(), tz, 'yyyy-MM-dd');
  const reportWeek = mondayBefore_(today, 7);    // the last complete week: the one the Monday summary reads
  const days = [];
  for (let d = CONFIG.data_start_date; d < today; d = addDays_(d, 1)) days.push(d);
  const stamp = new Date().toISOString();
  const rows = {};
  Object.keys(CONFIG.raw_tabs).forEach(tab => { rows[tab] = []; });
  days.forEach(d => {
    const dow = Utilities.parseDate(d, tz, 'yyyy-MM-dd').getDay();   // 0 Sunday
    const weekend = dow === 0 || dow === 6;
    const inReportWeek = d >= reportWeek && d < addDays_(reportWeek, 7);
    const date = Utilities.parseDate(d, tz, 'yyyy-MM-dd');
    const leads = noise(weekend ? 5 : 12, 3);
    const google = Math.round(leads * 0.35), meta = Math.round(leads * 0.25);
    const bookRate = inReportWeek ? 0.31 : 0.42;   // the story the demo summary tells: bookings dropped, ads didn't
    const booked = Math.round(leads * bookRate + (rand() - 0.5));
    const due = noise(weekend ? 3 : 8, 2);
    const showed = Math.min(due, Math.round(due * 0.91 + (rand() - 0.5)));
    const cancelled = noise(0.6, 0.6);
    const won = Math.round(showed * 0.35);
    const values = {
      raw_ghl: [date, leads, google + meta, google, meta, booked, due, showed, due - showed, cancelled, won, won * noise(650, 200), stamp],
      raw_google_ads: [date, noise(130, 25), noise(85, 20), noise(2400, 400), noise(6, 2), stamp],
      raw_meta_ads: [date, noise(90, 20), noise(140, 30), noise(5200, 900), noise(5, 2), stamp],
      raw_xero: [date, weekend ? noise(900, 300) : noise(3600, 700), weekend ? noise(800, 300) : noise(3400, 700), stamp],
      raw_ga4: [date, noise(weekend ? 140 : 230, 40), noise(weekend ? 110 : 190, 30), noise(weekend ? 4 : 9, 3), stamp],
    };
    Object.keys(rows).forEach(tab => {
      if (values[tab]) rows[tab].push(values[tab]);
      else rows[tab].push([date].concat(CONFIG.raw_tabs[tab].slice(1).map(c => {
        if (c === 'synced_at') return stamp;
        const hint = (CONFIG.demo || {})[tab + '.' + c];   // [weekday base, spread, weekend base] from the config
        return hint ? noise(weekend && hint[2] != null ? hint[2] : hint[0], hint[1]) : noise(20, 10);
      })));
    });
  });
  Object.keys(rows).forEach(tab => {
    const sh = ss.getSheetByName(tab);
    if (sh.getLastRow() > 1) sh.getRange(2, 1, sh.getLastRow() - 1, sh.getLastColumn()).clearContent();
    if (rows[tab].length) sh.getRange(2, 1, rows[tab].length, rows[tab][0].length).setValues(rows[tab]);
  });
  SpreadsheetApp.getActive().toast('Demo data loaded: ' + days.length + ' days. Last full week shows a booking-rate drop.', 'Reporting', 6);
}

function clearRawData() {
  const ui = SpreadsheetApp.getUi();
  if (ui.alert('Clear all raw data?', 'Deletes every synced row in the raw tabs. The syncs will refill them on their next run.', ui.ButtonSet.OK_CANCEL) !== ui.Button.OK) return;
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  Object.keys(CONFIG.raw_tabs).forEach(tab => {
    const sh = ss.getSheetByName(tab);
    if (sh && sh.getLastRow() > 1) sh.getRange(2, 1, sh.getLastRow() - 1, sh.getLastColumn()).clearContent();
  });
}

// ---------- helpers ----------

function tab_(ss, name) { return ss.getSheetByName(name) || ss.insertSheet(name); }

function setHeader_(sh, cols) {
  sh.getRange(1, 1, 1, cols.length).setValues([cols]).setFontWeight('bold');
  sh.setFrozenRows(1);
}

function readKeyValues_(sh) {
  const out = {};
  if (sh.getLastRow() > 1) sh.getRange(2, 1, sh.getLastRow() - 1, 2).getValues().forEach(r => { out[r[0]] = r[1]; });
  return out;
}

function colLetter_(n) {
  let s = '';
  while (n > 0) { const m = (n - 1) % 26; s = String.fromCharCode(65 + m) + s; n = Math.floor((n - 1) / 26); }
  return s;
}

function addDays_(ymd, k) {
  const d = new Date(ymd + 'T00:00:00Z');
  d.setUTCDate(d.getUTCDate() + k);
  return d.toISOString().slice(0, 10);
}

// Monday of the week `daysBack` days before ymd (7 = last week's Monday)
function mondayBefore_(ymd, daysBack) {
  const d = new Date(addDays_(ymd, -daysBack) + 'T00:00:00Z');
  const back = (d.getUTCDay() + 6) % 7;
  return addDays_(d.toISOString().slice(0, 10), -back);
}

function mulberry32_(a) {
  return function () {
    a |= 0; a = a + 0x6D2B79F5 | 0;
    let t = Math.imul(a ^ a >>> 15, 1 | a);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}
