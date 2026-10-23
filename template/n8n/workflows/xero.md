## Xero daily (05:00)

1. **Schedule Trigger** 05:00.
2. **HTTP Request "Sales invoices"** (or n8n's Xero node): invoices of type ACCREC dated in the last 14 days. Need `Date`/`DateString`, `Status`, `SubTotal`, `Type`.
3. **HTTP Request "Payments"**: payments in the last 14 days. Need `Date`, `Amount`, `Status`, `Invoice.Type`.
4. **Code "Sum by day"**: paste `xero-sum-by-day.js`.
5. **Google Sheets** → `raw_xero`.

Check whether Xero currently charges for API access on your app tier (paid?).

