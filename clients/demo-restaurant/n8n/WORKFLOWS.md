# n8n workflows: Esplanade Kitchen

Menu and node names in n8n, GHL, Meta and Xero change often. If a name doesn't match, look for the closest one, or ask the build chat "where is X in <tool> now?".

**Every workflow:** name it `RD – Esplanade Kitchen – <what it does>`. In **Settings → Timezone** set `Australia/Brisbane`. Set the error workflow (below) on each. Every key goes in an n8n credential, never in a node body.

**Every Google Sheets write:** operation **Append or Update Row**, the `Esplanade Kitchen – Reporting Warehouse` sheet, column to match on `date`, map each field by name. If there's a value input option, choose the one that lets Google Sheets format values, so `2026-10-05` becomes a real date.

## Credentials (once per client)

| Credential | Type | Notes |
| --- | --- | --- |
| Google Sheets | Google Sheets OAuth2 | The account with edit access to the sheet |
| GHL (if used) | Header Auth, `Authorization: Bearer <token>` | Private Integration, read-only scopes for contacts, opportunities, calendars, calendar events. Location ID `n/a (no GHL)` |
| GHL SMS (optional, if used) | Header Auth | A second token with the scope for sending conversation messages, if the owner gets the SMS |
| Meta (if used) | Header Auth or query auth with a system user token | System user on the ad account, ads read permission only |
| Xero (if used) | Xero OAuth2 | Read-only accounting scopes. Requests need the tenant ID header |
| GA4 (if used) | Google OAuth2 / Service account | Viewer on the property |
| Anthropic (paid, usage) | Header Auth, name `x-api-key` | Set a monthly spend limit at console.anthropic.com |

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

## Custom sources: raw_bookings, raw_pos

These tabs hold numbers from a system without a standard sync (for example a POS, booking or practice system). For each one:

1. Check whether the system offers an API, an n8n or Zapier integration, or a scheduled CSV export (ask the build chat to check that product's current docs).
2. Build a workflow in the same pattern: Schedule Trigger → fetch the last 14 days → a Code node that counts or sums by day in Australia/Brisbane (counts and totals only, no customer details) → Google Sheets **Append or Update Row** into the tab, matching on `date`.
3. If there's no API or export, someone types one row per day into the tab. The freshness check will flag a missed day.

The tab's columns are set in the config's `custom_sources`. Change them there and regenerate, not in the sheet.

## Monday summary (Mondays 08:00)

1. **Schedule Trigger**: Mondays 08:00, after the syncs.
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
