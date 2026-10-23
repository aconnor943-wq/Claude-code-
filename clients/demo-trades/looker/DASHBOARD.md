# Looker Studio dashboard: Northside Electrical

Signed in to reporting@example.com: lookerstudio.google.com → **Create → Report** (menu names may differ).

1. **Add data → Google Sheets** → `Northside Electrical – Reporting Warehouse` → `Daily`. Add `Weekly` and `Metrics` too.
2. On each data source (**Resource → Manage added data sources → Edit**) set **Data credentials: Owner's**. Viewers never need the sheet; don't share it with them.
3. Report-level filter: `has_data` = true, so future dates don't show as zeros.
4. A date range control on every page, default "Last 28 days".
5. Add these calculated fields to the `Daily` data source. Rates always come from totals, never from averaging a rate:

- **Quote booking rate** (`quote_rate`): `SUM(quotes_booked) / SUM(leads)`, format percent
- **Cost per lead** (`cpl`): `SUM(ad_spend) / SUM(leads_paid)`, format currency
- **Cost per job won (blended)** (`cost_per_job`): `SUM(ad_spend) / SUM(jobs_won)`, format currency

## Pages

- **Owner overview**: scorecards (comparison: previous period) for new enquiries, quote visits booked, quote booking rate, jobs won, value of jobs won, google ads spend, cost per lead, cost per job won (blended), revenue invoiced. A weekly line chart of the first two. The `Metrics` table (this week vs 4-week average). A text box with the plain-English definitions from `KPI_Dictionary`.
- **Sales**: bookings, attendance and won value per week. Per-staff numbers only if the owner asks.
- **Marketing**: spend by platform, leads from Google vs Meta, cost per lead, platform conversions next to CRM leads (labelled "platform's own count, for reference"), sessions and key events.

Plain design, big numbers, readable on a phone.

## Sharing (Privacy Act basics)

**Share → Add people** as **Viewer**, only these people:

- Owner: All pages
- Office manager: All pages

Link access restricted to people added by email: never "anyone with the link", never public. Turn off downloading, printing and copying for viewers if the option is shown. Looker Studio can't hide pages per viewer, so anyone who shouldn't see revenue gets a separate report with only the Sales page.

**Test:** an invited viewer can open it. Signed out, or as an account you didn't invite, access is denied.
