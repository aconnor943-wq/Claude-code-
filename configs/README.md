# Config fields

One file per client: `configs/<slug>.json`. Copy the closest demo and change every value. Then run `node scripts/new-client.mjs configs/<slug>.json`.

| Field | What to put |
| --- | --- |
| `slug` | Short folder name: lower case, numbers and dashes (`smith-dental`) |
| `business.name` | Trading name. Used in the sheet name, email subject and SMS |
| `business.niche`, `location`, `sites_staff` | Plain words for the summary prompt ("multi-practitioner dental clinic", "Southport QLD", "2 sites, 9 dentists") |
| `business.owner_name`, `owner_email`, `owner_mobile` | Who gets the Monday summary |
| `business.timezone` | IANA name, e.g. `Australia/Brisbane` (no daylight saving) or `Australia/Sydney` (daylight saving) |
| `business.currency` | Ad account currency, e.g. `AUD` |
| `business.google_account` | The client's Google account that owns the sheet and the report |
| `business.health_provider` | `true` for any health service. Changes the privacy notes |
| `business.country` | `Australia`, or the country, so local privacy rules get flagged |
| `builder_email` | You: draft summaries and alerts come here |
| `data_start_date` | First Monday to report from, `YYYY-MM-DD` |
| `big_move_threshold` | Change vs the 4-week average that gets flagged. `0.2` = 20% |
| `summary.time`, `summary.channels` | When the Monday summary goes, and how ("email", "email and SMS") |
| `summary.top3` | The three numbers the owner said they'd check every morning, in their words |
| `summary.targets` | Plain-words targets, or "none yet" |
| `summary.levers` | Things the business can actually change. The 3 weekly actions only use these |
| `summary.quirks` | Known oddities the summary should know about ("cost per booking is blended") |
| `viewers` | Who sees the dashboard and which pages |
| `sources` | Standard sources this client uses: any of `ghl`, `google_ads`, `meta_ads`, `xero`, `ga4` |
| `custom_sources` | Anything else (POS, booking or practice software, a manual tab): `{ "raw_pos": ["date", "sales_ex_gst", "synced_at"] }`. The tab name must start with `raw_`, `date` must be first |
| `ghl` | Only if `sources` includes `ghl`: Location ID, the calendars that count as bookings, the sales pipeline, tags to exclude, how source and tags map to Google and Meta, and the appointment status words GHL returns |
| `meta.lead_action_type` | Only for Meta: the `action_type` the client's lead forms report (check the raw output) |
| `demo` | Optional, for demo data only: sizes for custom-source columns, `"raw_pos.sales_ex_gst": [weekday base, spread, weekend base]` |
| `metrics` | The agreed 8-12 numbers, below |

## Metrics

Each metric is one of two types.

**`count`**: added up per day from raw tab columns.
```json
{ "metric": "ad_spend", "label": "Ad spend", "type": "count", "format": "money", "good_when": "down",
  "daily": [["raw_google_ads", "spend"], ["raw_meta_ads", "spend"]], "source": "Ad platforms",
  "definition": "Google Ads plus Meta spend that day as the platforms report it, ex GST." }
```

**`ratio`**: one count divided by another, always from the period's totals (never an average of daily rates).
```json
{ "metric": "cpl", "label": "Cost per lead", "type": "ratio", "format": "money", "good_when": "down",
  "num": "ad_spend", "den": "leads_paid", "source": "Sheet formula", "target": 40,
  "definition": "Ad spend divided by enquiries from ads." }
```

| Metric field | What to put |
| --- | --- |
| `metric` | Name in the sheet, `lower_snake_case`, unique |
| `label` | What the owner calls it |
| `format` | `number`, `money` or `percent` (percent only makes sense for ratios) |
| `good_when` | `up` or `down`: decides whether a big move is good or bad |
| `daily` | Counts only: `[[tab, column], ...]`, added together |
| `num`, `den` | Ratios only: the names of two count metrics |
| `show` | `false` keeps a helper count (like `leads_paid`) out of the Metrics tab and the summary, while ratios can still use it |
| `target` | Optional |
| `definition` | The exact rule agreed in the KPI workshop. It goes into the KPI dictionary, the sheet and the summary prompt |
