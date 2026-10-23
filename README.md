# AI Reporting Dashboard: reusable template

One template for every client. Each business gets a single config file. A script turns that config into the client's complete, ready-to-paste build:

- the Google Sheet warehouse (Apps Script that builds every tab, header, formula and data check in one click)
- the n8n Code nodes for each source they use
- the Google Ads Script
- the Monday summary prompt and the two summary nodes (build the Claude request, check every number before sending)
- the master build prompt, pre-filled
- step-by-step guides for n8n, Looker Studio, and the launch checklist
- the KPI dictionary to send the owner for approval

It follows the AI Reporting Dashboard build pack (00-START-HERE to 04-SELL-IT): n8n → Google Sheets → Looker Studio → Claude writes the Monday summary from numbers the sheet already worked out.

## New client in 5 minutes

1. Copy the closest example config:
   - `configs/demo-clinic.json`: clinic or med spa on GHL, Google Ads, Meta, Xero, GA4
   - `configs/demo-trades.json`: trades business on GHL, Google Ads, Xero
   - `configs/demo-restaurant.json`: hospitality with a booking-system export and a POS (custom sources), Meta, Xero, GA4
2. Save it as `configs/<client-slug>.json` and change every value. `configs/README.md` explains each field.
3. Run:
   ```bash
   node scripts/new-client.mjs configs/<client-slug>.json
   ```
4. Open `clients/<client-slug>/README.md` and follow its build order.

If the config has a mistake (a ratio pointing at a metric that doesn't exist, a column a source doesn't have, a start date that isn't a Monday), the script stops and says what to fix.

After the KPI workshop, change the config, not the generated files, and run the script again.

## Demo for sales calls

Generate a demo config, create a Google Sheet, paste `clients/<slug>/sheet/setup-warehouse.gs` into Extensions → Apps Script, reload, then **Reporting → Build or refresh warehouse** and **Reporting → Load demo data**. You get months of believable numbers ending yesterday. The clinic demo has a booking-rate drop in the last full week, so the Monday summary has a real story to tell. Point a Looker Studio report at it and rename the business to the prospect's.

## What's in here

| Path | What it is |
| --- | --- |
| `configs/` | One JSON file per client (three demo examples included) |
| `template/` | The source templates with `{{placeholders}}`. Edit these to improve every future client |
| `scripts/new-client.mjs` | Builds `clients/<slug>/` from a config |
| `scripts/lib.mjs` | Config checks, source layouts, placeholder filling |
| `clients/` | Generated builds (the three demos are committed as examples) |
| `tests/` | Runs the real Apps Script and Code nodes and checks their numbers |

## Tests

```bash
npm install   # once: installs HyperFormula, a spreadsheet formula engine used only by the tests
npm test
```

The tests:
- run each config's generated Apps Script against a formula engine, load the demo data, and check every Metrics number (this week, last week, 4-week average, % change, big-move flag) against totals worked out separately from the raw rows
- check that the data checks catch a negative number, that reconciliation uses the typed source figure, and that rebuilding keeps raw data
- run the n8n Code nodes on fake GHL, Meta, Xero and GA4 responses: time zones, exclusions, source mapping, duplicates, no personal fields leaving the node
- check that the Monday summary request is valid, and that the answer check catches invented numbers, a refusal, a cut-off answer and an over-long SMS

The formula engine isn't Google Sheets. One Sheets function, `COUNTUNIQUE` (used by the duplicate-date check), has no equivalent there, so that check is only tested in a real sheet. Everything else runs as written.

## The Claude API call

The Monday summary uses `claude-opus-5-5` with `anthropic-version: 2026-10-21`, structured output (`output_config.format` with a JSON schema) at `medium` effort, and the server-side refusal fallback (`fallbacks: "default"` with `anthropic-beta: server-side-fallback-2026-07-01`). The check node treats a refusal, a cut-off answer or unreadable JSON as a failed draft that comes to you, never to the owner.

## Not built here (needs the client's accounts)

- The n8n HTTP Request nodes for GHL, Meta, Xero and GA4. Endpoints change, so `WORKFLOWS.md` says exactly what each must fetch, and the master prompt has Claude write them from the current docs. The Code nodes that process their output are done and tested.
- Looker Studio itself: `looker/DASHBOARD.md` lists the data sources, calculated fields, pages and sharing settings.
