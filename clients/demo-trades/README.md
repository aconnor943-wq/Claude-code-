# Northside Electrical: AI reporting dashboard

Generated from `configs/demo-trades.json`. Don't edit these files by hand: change the config and run
`node scripts/new-client.mjs configs/demo-trades.json` again.

## Build order

1. **KPI workshop** with Jordan Lee (60-90 min). Agree the metrics, then send `docs/KPI-DICTIONARY.md` for written approval. Update the config if anything changed and regenerate.
2. **Master prompt**: paste `prompts/master-prompt.md` into a new Claude chat and keep it for the whole build.
3. **Accounts and read-only access**: `n8n/WORKFLOWS.md` → Credentials. Ask for access on day 1; it's the slowest part.
4. **Warehouse**: in reporting@example.com's Drive, create a Google Sheet named `Northside Electrical – Reporting Warehouse`. Extensions → Apps Script → paste `sheet/setup-warehouse.gs` → Save → reload the sheet → **Reporting → Build or refresh warehouse**.
5. **Syncs**: build each workflow in `n8n/WORKFLOWS.md`, pasting the matching file from `n8n/`. Google Ads uses `google-ads/rd-warehouse-sync.js`.
6. **Reconcile**: type each source's own totals for last month into the Checks tab, column D. Fix every mismatch before anyone sees the dashboard.
7. **Dashboard**: `looker/DASHBOARD.md`.
8. **Monday summary**: the last section of `n8n/WORKFLOWS.md`. Leave `auto_send` FALSE for 4 weeks and approve each draft.
9. **Launch**: `docs/LAUNCH-CHECKLIST.md`.

## Demo mode

For a sales demo, build the sheet (step 4), then **Reporting → Load demo data**. It fills every raw tab with made-up numbers from 2026-07-06 to yesterday, with a booking-rate drop in the last full week so the Monday summary has a story to tell. Never run it on a live client's sheet.

## Files

- `docs/KPI-DICTIONARY.md`
- `docs/LAUNCH-CHECKLIST.md`
- `google-ads/rd-warehouse-sync.js`
- `looker/DASHBOARD.md`
- `n8n/WORKFLOWS.md`
- `n8n/ghl-1-date-range.js`
- `n8n/ghl-2-count-by-day.js`
- `n8n/summary-1-build-request.js`
- `n8n/summary-2-check-answer.js`
- `n8n/xero-sum-by-day.js`
- `prompts/master-prompt.md`
- `prompts/weekly-summary-system-prompt.txt`
- `sheet/setup-warehouse.gs`
