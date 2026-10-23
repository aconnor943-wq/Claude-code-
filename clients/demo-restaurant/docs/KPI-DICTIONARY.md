# KPI dictionary: Esplanade Kitchen

Send this to Alex Morgan to approve in writing (an email reply is fine) before anyone sees the dashboard.

| Metric | Name in the sheet | Exact rule | Source of truth | Better when | Target |
| --- | --- | --- | --- | --- | --- |
| Bookings | `bookings` | Table bookings for that day (by dining date), excluding cancelled. | Booking system export | up |  |
| Covers | `covers` | Guests seated from bookings that day. | Booking system export | up |  |
| No-shows | `no_shows` | Bookings for that day marked no-show. | Booking system export | down |  |
| No-show rate | `no_show_rate` | No-shows divided by bookings, from the totals for the period. | Sheet formula | down | 5% |
| Covers per booking | `covers_per_booking` | Covers divided by bookings. | Sheet formula | up |  |
| Sales (POS) | `sales` | POS sales that trading day, ex GST, including walk-ins. | POS | up |  |
| Spend per cover | `spend_per_cover` | POS sales divided by covers from bookings (blended: walk-in sales are included). | Sheet formula | up | $65 |
| Meta ad spend | `ad_spend` | Meta spend that day as Meta reports it, ex GST. | Meta | down |  |
| Website visits | `web_sessions` | GA4 sessions on the website that day. | GA4 | up |  |
| Cash received (Xero) | `cash_received` | Payments received on sales invoices that day (functions and events), inc GST. | Xero | up |  |

- Weeks run Monday to Sunday in Australia/Brisbane.
- A move of 20% or more against the 4-week average is flagged as a big move.
- Leads come from the CRM; spend comes from the ad platforms. The platforms' own conversion counts are shown for reference only.
