## Monday summary (Mondays {{summary.time}})

1. **Schedule Trigger**: Mondays {{summary.time}}, after the syncs.
2. **Google Sheets "Get Row(s)"** ×3, named exactly "Read Metrics", "Read Checks", "Read Settings".
3. **Code "Build Claude request"**: paste `summary-1-build-request.js` (the system prompt is already inside it).
4. **HTTP Request "Ask Claude"** (paid, usage): POST `https://api.anthropic.com/v1/messages`. Credential: Anthropic (`x-api-key`). Headers: `anthropic-version: 2026-10-21`, `anthropic-beta: server-side-fallback-2026-07-01`, `content-type: application/json`. Body JSON: `{{ JSON.stringify($json.claudeRequest) }}`. Timeout 300 seconds.
5. **Code "Read answer + number check"**: paste `summary-2-check-answer.js`.
6. **Google Sheets Append Row** → `Summaries`: `week_start` = Settings report_week_start, `status` = `ready` if `numbersOk` and Settings `auto_send` is TRUE, else `draft`. Actions as text, one per line.
7. **IF "Send now?"**: `ready` → step 8. Otherwise **Gmail "Draft to builder"** to `builder_email` ({{builder_email}}): the summary, the flags, and "Set status to approved in the Summaries tab to send it."
8. **Send to the owner**: Gmail to `owner_email`. Optional SMS: GHL `POST /conversations/messages` with `{{ JSON.stringify({ type: 'SMS', contactId: $json.settings.owner_contact_id, message: $json.sms }) }}` (the owner's GHL contact is tagged `staff` / `team-internal`). Then update the `Summaries` row: `status` = `sent`, `sent_at` = now.

**"Send approved"** workflow: Schedule cron `*/30 7-12 * * 1`. Reads `Summaries` rows with `status` = `approved` and empty `sent_at`, runs step 8 for each.

`auto_send` stays FALSE for the first 4 weeks. You read every draft against the dashboard and approve it.

