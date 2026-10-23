## Custom sources: {{custom_tabs}}

These tabs hold numbers from a system without a standard sync (for example a POS, booking or practice system). For each one:

1. Check whether the system offers an API, an n8n or Zapier integration, or a scheduled CSV export (ask the build chat to check that product's current docs).
2. Build a workflow in the same pattern: Schedule Trigger → fetch the last 14 days → a Code node that counts or sums by day in {{business.timezone}} (counts and totals only, no customer details) → Google Sheets **Append or Update Row** into the tab, matching on `date`.
3. If there's no API or export, someone types one row per day into the tab. The freshness check will flag a missed day.

The tab's columns are set in the config's `custom_sources`. Change them there and regenerate, not in the sheet.
