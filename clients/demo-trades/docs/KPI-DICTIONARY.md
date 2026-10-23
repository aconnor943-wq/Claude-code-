# KPI dictionary: Northside Electrical

Send this to Jordan Lee to approve in writing (an email reply is fine) before anyone sees the dashboard.

| Metric | Name in the sheet | Exact rule | Source of truth | Better when | Target |
| --- | --- | --- | --- | --- | --- |
| New enquiries | `leads` | New contacts created that day, not tagged staff, spam or supplier. | GHL | up |  |
| Enquiries from Google Ads | `leads_paid` | New enquiries whose source maps to Google Ads. | GHL | up |  |
| Quote visits booked | `quotes_booked` | Quote visits created that day on the Quote visit calendar. | GHL calendars | up |  |
| Quote booking rate | `quote_rate` | Quote visits booked divided by new enquiries. | Sheet formula | up | 50% |
| Jobs won | `jobs_won` | Jobs pipeline opportunities marked Won that day. | GHL | up |  |
| Value of jobs won | `won_value` | Total quoted value of jobs marked Won that day. | GHL | up |  |
| Google Ads spend | `ad_spend` | Google Ads spend that day, ex GST. | Google Ads | down |  |
| Cost per lead | `cpl` | Google Ads spend divided by enquiries from Google Ads. | Sheet formula | down | $60 |
| Cost per job won (blended) | `cost_per_job` | Google Ads spend divided by all jobs won. | Sheet formula | down |  |
| Revenue invoiced | `revenue_invoiced` | Sales invoices dated that day, ex GST, excluding draft and voided. | Xero | up |  |

- Weeks run Monday to Sunday in Australia/Brisbane.
- A move of 25% or more against the 4-week average is flagged as a big move.
- Leads come from the CRM; spend comes from the ad platforms. The platforms' own conversion counts are shown for reference only.
