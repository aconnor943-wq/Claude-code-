## GHL daily (04:30)

1. **Schedule Trigger**: daily 04:30.
2. **Code "Date range"**: paste `ghl-1-date-range.js`.
3. **HTTP Request "Contacts created"**: contacts created between `startMs` and `endMs` for location `{{ghl.location_id}}`. Need `id`, `dateAdded`, `source`, `tags`. Base `https://services.leadconnectorhq.com`, GHL credential, header `Version: 2021-07-28`. Page until there are no more results. Write it from the current GHL API docs (marketplace.gohighlevel.com).
4. **HTTP Request "Appointments"**: events on {{join:ghl.booking_calendars}} starting between `startMs` and `apptEndMs`. Need `id`, `dateAdded`, `startTime`, `appointmentStatus`.
5. **HTTP Request "Won opportunities"**: pipeline "{{ghl.sales_pipeline}}", status won, updated in the range. Need `id`, `status`, `monetaryValue`, `lastStatusChangeAt`.
6. Turn on **Always Output Data** on all three. Run each once and read the raw output: the field names and status values (`{{ghl.status_values.showed}}`, `{{ghl.status_values.no_show}}`, `{{ghl.status_values.cancelled}}`) must match `ghl-2-count-by-day.js`. If they don't, change the config's `ghl.status_values` and regenerate.
7. **Code "Count by day"**: paste `ghl-2-count-by-day.js`. Node names must be exactly "Date range", "Contacts created", "Appointments", "Won opportunities".
8. **Google Sheets** → `raw_ghl`.

**Test:** run it. `raw_ghl` gets 8 rows. Run again: still 8. Count one day's new contacts in GHL by hand; they match.

