# Looker Studio dashboard: Esplanade Kitchen

Signed in to reporting@example.com: lookerstudio.google.com → **Create → Report** (menu names may differ).

1. **Add data → Google Sheets** → `Esplanade Kitchen – Reporting Warehouse` → `Daily`. Add `Weekly` and `Metrics` too.
2. On each data source (**Resource → Manage added data sources → Edit**) set **Data credentials: Owner's**. Viewers never need the sheet; don't share it with them.
3. Report-level filter: `has_data` = true, so future dates don't show as zeros.
4. A date range control on every page, default "Last 28 days".
5. Add these calculated fields to the `Daily` data source. Rates always come from totals, never from averaging a rate:

- **No-show rate** (`no_show_rate`): `SUM(no_shows) / SUM(bookings)`, format percent
- **Covers per booking** (`covers_per_booking`): `SUM(covers) / SUM(bookings)`, format number
- **Spend per cover** (`spend_per_cover`): `SUM(sales) / SUM(covers)`, format currency

## Pages

- **Owner overview**: scorecards (comparison: previous period) for bookings, covers, no-show rate, covers per booking, sales (pos), spend per cover, meta ad spend, website visits, cash received (xero). A weekly line chart of the first two. The `Metrics` table (this week vs 4-week average). A text box with the plain-English definitions from `KPI_Dictionary`.
- **Sales**: bookings, attendance and won value per week. Per-staff numbers only if the owner asks.
- **Marketing**: spend by platform, leads from Google vs Meta, cost per lead, platform conversions next to CRM leads (labelled "platform's own count, for reference"), sessions and key events.

Plain design, big numbers, readable on a phone.

## Sharing (Privacy Act basics)

**Share → Add people** as **Viewer**, only these people:

- Owner: All pages
- Venue manager: All pages

Link access restricted to people added by email: never "anyone with the link", never public. Turn off downloading, printing and copying for viewers if the option is shown. Looker Studio can't hide pages per viewer, so anyone who shouldn't see revenue gets a separate report with only the Sales page.

**Test:** an invited viewer can open it. Signed out, or as an account you didn't invite, access is denied.
