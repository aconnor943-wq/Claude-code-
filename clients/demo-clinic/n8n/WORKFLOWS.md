# n8n workflows: Harbourside Physio

Menu and node names in n8n, GHL, Meta and Xero change often. If a name doesn't match, look for the closest one, or ask the build chat "where is X in <tool> now?".

**Every workflow:** name it `RD – Harbourside Physio – <what it does>`. In **Settings → Timezone** set `Australia/Brisbane`. Set the error workflow (below) on each. Every key goes in an n8n credential, never in a node body.

**Every Google Sheets write:** operation **Append or Update Row**, the `Harbourside Physio – Reporting Warehouse` sheet, column to match on `date`, map each field by name. If there's a value input option, choose the one that lets Google Sheets format values, so `2026-10-05` becomes a real date.

## Credentials (once per client)

| Credential | Type | Notes |
| --- | --- | --- |
| Google Sheets | Google Sheets OAuth2 | The account with edit access to the sheet |
| GHL (if used) | Header Auth, `Authorization: Bearer <token>` | Private Integration, read-only scopes for contacts, opportunities, calendars, calendar events. Location ID `[GHL LOCATION ID]` |
| GHL SMS (optional, if used) | Header Auth | A second token with the scope for sending conversation messages, if the owner gets the SMS |
| Meta (if used) | Header Auth or query auth with a system user token | System user on the ad account, ads read permission only |
| Xero (if used) | Xero OAuth2 | Read-only accounting scopes. Requests need the tenant ID header |
| GA4 (if used) | Google OAuth2 / Service account | Viewer on the property |
| Anthropic (paid, usage) | Header Auth, name `x-api-key` | Set a monthly spend limit at console.anthropic.com |

## GHL daily (04:30)

1. **Schedule Trigger**: daily 04:30.
2. **Code "Date range"**: paste `ghl-1-date-range.js`.
3. **HTTP Request "Contacts created"**: contacts created between `startMs` and `endMs` for location `[GHL LOCATION ID]`. Need `id`, `dateAdded`, `source`, `tags`. Base `https://services.leadconnectorhq.com`, GHL credential, header `Version: 2021-07-28`. Page until there are no more results. Write it from the current GHL API docs (marketplace.gohighlevel.com).
4. **HTTP Request "Appointments"**: events on New patient assessment, Pilates intro class starting between `startMs` and `apptEndMs`. Need `id`, `dateAdded`, `startTime`, `appointmentStatus`.
5. **HTTP Request "Won opportunities"**: pipeline "New patients", status won, updated in the range. Need `id`, `status`, `monetaryValue`, `lastStatusChangeAt`.
6. Turn on **Always Output Data** on all three. Run each once and read the raw output: the field names and status values (`showed`, `noshow`, `cancelled`) must match `ghl-2-count-by-day.js`. If they don't, change the config's `ghl.status_values` and regenerate.
7. **Code "Count by day"**: paste `ghl-2-count-by-day.js`. Node names must be exactly "Date range", "Contacts created", "Appointments", "Won opportunities".
8. **Google Sheets** → `raw_ghl`.

**Test:** run it. `raw_ghl` gets 8 rows. Run again: still 8. Count one day's new contacts in GHL by hand; they match.

## Google Ads (script, not n8n)

Paste `../google-ads/rd-warehouse-sync.js` into the ad account's Scripts, set `SHEET_URL`, Authorise, Preview, schedule daily around 4am. It runs in the ad account's time zone; spend is in the account's currency.

## Meta daily (04:40)

1. **Schedule Trigger** 04:40.
2. **HTTP Request "Meta insights"**: ad account insights, level account, `time_increment=1`, last 14 days, fields `spend,impressions,clicks,actions`. Token from the credential, never in the URL. Write it from the current Meta Marketing API docs.
3. **Code "Tidy Meta"**: paste `meta-tidy.js`.
4. **Google Sheets** → `raw_meta_ads`.

## Xero daily (05:00)

1. **Schedule Trigger** 05:00.
2. **HTTP Request "Sales invoices"** (or n8n's Xero node): invoices of type ACCREC dated in the last 14 days. Need `Date`/`DateString`, `Status`, `SubTotal`, `Type`.
3. **HTTP Request "Payments"**: payments in the last 14 days. Need `Date`, `Amount`, `Status`, `Invoice.Type`.
4. **Code "Sum by day"**: paste `xero-sum-by-day.js`.
5. **Google Sheets** → `raw_xero`.

Check whether Xero currently charges for API access on your app tier (paid?).

## GA4 daily (05:10)

1. **Schedule Trigger** 05:10.
2. **Google Analytics node** (GA4 report) or an HTTP Request to the GA4 Data API `runReport`: dimension `date`; metrics `sessions`, `totalUsers`, `keyEvents`; last 14 days.
3. **Code "Tidy GA4"**: paste `ga4-tidy.js`.
4. **Google Sheets** → `raw_ga4`.

## Monday summary (Mondays 07:00)

1. **Schedule Trigger**: Mondays 07:00, after the syncs.
2. **Google Sheets "Get Row(s)"** ×3, named exactly "Read Metrics", "Read Checks", "Read Settings".
3. **Code "Build Claude request"**: paste `summary-1-build-request.js` (the system prompt is already inside it).
4. **HTTP Request "Ask Claude"** (paid, usage): POST `https://api.anthropic.com/v1/messages`. Credential: Anthropic (`x-api-key`). Headers: `anthropic-version: 2026-10-21`, `anthropic-beta: server-side-fallback-2026-07-01`, `content-type: application/json`. Body JSON: `{{ JSON.stringify($json.claudeRequest) }}`. Timeout 300 seconds.
5. **Code "Read answer + number check"**: paste `summary-2-check-answer.js`.
6. **Google Sheets Append Row** → `Summaries`: `week_start` = Settings report_week_start, `status` = `ready` if `numbersOk` and Settings `auto_send` is TRUE, else `draft`. Actions as text, one per line.
7. **IF "Send now?"**: `ready` → step 8. Otherwise **Gmail "Draft to builder"** to `builder_email` (you@example.com): the summary, the flags, and "Set status to approved in the Summaries tab to send it."
8. **Send to the owner**: Gmail to `owner_email`. Optional SMS: GHL `POST /conversations/messages` with `{{ JSON.stringify({ type: 'SMS', contactId: $json.settings.owner_contact_id, message: $json.sms }) }}` (the owner's GHL contact is tagged `staff` / `team-internal`). Then update the `Summaries` row: `status` = `sent`, `sent_at` = now.

**"Send approved"** workflow: Schedule cron `*/30 7-12 * * 1`. Reads `Summaries` rows with `status` = `approved` and empty `sent_at`, runs step 8 for each.

`auto_send` stays FALSE for the first 4 weeks. You read every draft against the dashboard and approve it.

## Monitoring

- **Error workflow**: an Error Trigger that emails you the workflow name and error. Set it on every RD workflow.
- **Checks (08:00 daily)**: read `Checks`; if any `ok` is FALSE, email you the failing rows.
