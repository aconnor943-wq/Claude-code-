# Looker Studio dashboard: The Lounge

Signed in to [CLIENT GOOGLE ACCOUNT]: lookerstudio.google.com → **Create → Report** (menu names may differ).

1. **Add data → Google Sheets** → `The Lounge – Reporting Warehouse` → `Daily`. Add `Weekly` and `Metrics` too.
2. On each data source (**Resource → Manage added data sources → Edit**) set **Data credentials: Owner's**. Viewers never need the sheet; don't share it with them.
3. Report-level filter: `has_data` = true, so future dates don't show as zeros.
4. A date range control on every page, default "Last 28 days".
5. Add these calculated fields to the `Daily` data source. Rates always come from totals, never from averaging a rate:

- **No-show rate** (`no_show_rate`): `SUM(no_shows) / SUM(bookings)`, format percent
- **Covers per booking** (`covers_per_booking`): `SUM(covers) / SUM(bookings)`, format number
- **Share of bookings from the website** (`website_share`): `SUM(website_bookings) / SUM(bookings)`, format percent
- **Spend per cover (blended)** (`spend_per_cover`): `SUM(sales) / SUM(all_covers)`, format currency
- **Website visits that booked** (`web_booking_rate`): `SUM(website_bookings) / SUM(web_sessions)`, format percent

## Pages

- **Owner overview**: scorecards (comparison: previous period) for bookings, booked covers, walk-in covers, all covers, no-show rate, covers per booking, website bookings, share of bookings from the website, sales (lightspeed), spend per cover (blended), website visits, website visits that booked. A weekly line chart of the first two. The `Metrics` table (this week vs 4-week average). A text box with the plain-English definitions from `KPI_Dictionary`.
- **Sales**: bookings, attendance and won value per week. Per-staff numbers only if the owner asks.
- **Marketing**: spend by platform, leads from Google vs Meta, cost per lead, platform conversions next to CRM leads (labelled "platform's own count, for reference"), sessions and key events.

Plain design, big numbers, readable on a phone.

## Sharing (Privacy Act basics)

**Share → Add people** as **Viewer**, only these people:

- Owner: All pages
- [VENUE MANAGER]: All pages

Link access restricted to people added by email: never "anyone with the link", never public. Turn off downloading, printing and copying for viewers if the option is shown. Looker Studio can't hide pages per viewer, so anyone who shouldn't see revenue gets a separate report with only the Sales page.

**Test:** an invited viewer can open it. Signed out, or as an account you didn't invite, access is denied.
