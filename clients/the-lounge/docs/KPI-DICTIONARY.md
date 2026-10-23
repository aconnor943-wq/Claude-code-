# KPI dictionary: The Lounge

Send this to [OWNER NAME] to approve in writing (an email reply is fine) before anyone sees the dashboard.

| Metric | Name in the sheet | Exact rule | Source of truth | Better when | Target |
| --- | --- | --- | --- | --- | --- |
| Bookings | `bookings` | OpenTable reservations for that dining date (Brisbane time), excluding cancelled. | OpenTable | up |  |
| Booked covers | `covers` | Guests seated from OpenTable bookings that day. | OpenTable | up |  |
| Walk-in covers | `walk_in_covers` | Walk-in guests seated through OpenTable's host stand that day (only if the team records walk-ins there). | OpenTable | up |  |
| All covers | `all_covers` | Booked covers plus walk-in covers. | OpenTable | up |  |
| No-shows | `no_shows` | Bookings for that day marked no-show in OpenTable. | OpenTable | down |  |
| No-show rate | `no_show_rate` | No-shows divided by bookings, from the totals for the period. | Sheet formula | down |  |
| Covers per booking | `covers_per_booking` | Booked covers divided by bookings. | Sheet formula | up |  |
| Website bookings | `website_bookings` | OpenTable bookings for that day made through the booking widget on the venue's website. | OpenTable | up |  |
| Share of bookings from the website | `website_share` | Website bookings divided by all bookings. | Sheet formula | up |  |
| Sales (Lightspeed) | `sales` | Lightspeed sales that trading day, ex GST, including walk-ins and bar-only sales. | Lightspeed | up |  |
| Spend per cover (blended) | `spend_per_cover` | Lightspeed sales divided by all covers. Blended: bar-only sales with no table are included. | Sheet formula | up |  |
| Website visits | `web_sessions` | GA4 sessions on the website that day. | GA4 | up |  |
| Website visits that booked | `web_booking_rate` | Website bookings divided by website visits. | Sheet formula | up |  |

- Weeks run Monday to Sunday in Australia/Brisbane.
- A move of 20% or more against the 4-week average is flagged as a big move.
