# KPI dictionary: Harbourside Physio

Send this to Sam Taylor to approve in writing (an email reply is fine) before anyone sees the dashboard.

| Metric | Name in the sheet | Exact rule | Source of truth | Better when | Target |
| --- | --- | --- | --- | --- | --- |
| New enquiries | `leads` | New contacts created that day (Brisbane time), not tagged staff, spam, team-internal or existing-client. | GHL | up |  |
| Enquiries from ads | `leads_paid` | New enquiries whose source or tags map to Google Ads or Meta. | GHL | up |  |
| Bookings made | `booked` | Appointments created that day on the New patient assessment and Pilates intro class calendars, any status except invalid. | GHL calendars | up |  |
| Appointments due | `appts_due` | Appointments scheduled for that day on those calendars, not cancelled. | GHL calendars | up |  |
| Showed up | `showed` | Appointments scheduled for that day with status showed. | GHL calendars | up |  |
| Booking rate | `booking_rate` | Bookings made divided by new enquiries, from the totals for the period. | Sheet formula | up | 40% |
| Show rate | `show_rate` | Showed up divided by appointments due, from the totals for the period. | Sheet formula | up | 90% |
| Ad spend | `ad_spend` | Google Ads plus Meta spend that day as the platforms report it, ex GST, in AUD. | Ad platforms | down |  |
| Cost per lead | `cpl` | Ad spend divided by enquiries from ads. | Sheet formula | down | $40 |
| Cost per booking (blended) | `cost_per_booking` | All ad spend divided by all bookings made, including bookings that didn't come from ads. | Sheet formula | down |  |
| Treatment plans won ($) | `won_value` | Total value of New patients pipeline opportunities marked Won that day. | GHL | up |  |
| Revenue invoiced | `revenue_invoiced` | Sales invoices dated that day, ex GST, excluding draft and voided. | Xero | up |  |
| Cash received | `cash_received` | Payments received on sales invoices that day, inc GST. | Xero | up |  |

- Weeks run Monday to Sunday in Australia/Brisbane.
- A move of 20% or more against the 4-week average is flagged as a big move.
- Leads come from the CRM; spend comes from the ad platforms. The platforms' own conversion counts are shown for reference only.
