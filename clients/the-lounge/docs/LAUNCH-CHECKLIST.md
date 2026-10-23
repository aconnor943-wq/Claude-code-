# Launch checklist: The Lounge

Tick each line, with a note if it failed and what you changed.

## Data accuracy
- [ ] Last full month: leads, bookings, showed, won match the source once the KPI rule is applied (type each source's total into Checks column D)
- [ ] Ad spend per platform matches Google Ads and Meta for the same dates, within a few cents
- [ ] Invoiced and cash match Xero's own reports (invoiced ex GST, cash inc GST)
- [ ] GA4 sessions match the GA4 report
- [ ] 3 random single days checked by hand
- [ ] Every known difference written in the KPI dictionary

## Dates and time zones (Australia/Brisbane)
- [ ] A test lead created at 11:30pm lands on the right day
- [ ] Sheet, every n8n workflow and the Code nodes all use Australia/Brisbane
- [ ] Settings `report_week_start` shows last Monday
- [ ] If the client is in a daylight-saving state, a date either side of the change checked

## Syncs
- [ ] Each sync run twice in a row: no duplicate dates (Checks says TRUE)
- [ ] A day with no leads writes 0, not a gap
- [ ] A status changed 3 days later updates the old day on the next run
- [ ] One credential broken on purpose: the error workflow emails you, and the 08:00 check flags it

## Dashboard and privacy
- [ ] Every page loads on a phone and a laptop
- [ ] Scorecards match the Weekly tab for the same dates; rates are SUM/SUM fields
- [ ] No customer names, phones, emails, notes or health details anywhere in the sheet
- [ ] Report shared only with named viewers; opening it signed out is denied; viewers can't open the sheet
- [ ] Every token read-only where the source allows it, and only in n8n credentials
- [ ] Sheet and report owned by [CLIENT GOOGLE ACCOUNT]

## Monday summary
- [ ] Run the test weeks (master prompt helper "Write my test weeks"): each leads with the right thing, exactly 3 actions
- [ ] Every number in the email appears in Metrics exactly as written
- [ ] A draft with a made-up number is flagged and not auto-sent
- [ ] A failing check makes the summary say which numbers can't be trusted
- [ ] Wrong model name on purpose: the fallback draft comes to you, nothing goes to the owner
- [ ] SMS under 160 characters, no emojis, starts with "The Lounge:"
- [ ] `auto_send` FALSE: nothing reaches the owner until you set `approved`

## Go live
- [ ] KPI dictionary approved by [OWNER NAME] in writing
- [ ] All syncs active, error workflow set on each, Anthropic spend limit set
- [ ] Owner has the dashboard link bookmarked on their phone
- [ ] First Monday summary on your calendar to review before 9am
- [ ] End of week 4: tune the system prompt, then set `auto_send` TRUE if all 4 drafts needed no edits

## Kill switch (fastest first)
1. Stop the Monday email: set `auto_send` FALSE, or deactivate the Monday summary workflow.
2. Stop one source: deactivate that sync (or pause the Google Ads Script).
3. Hide a wrong number: remove the chart, or add an "under review" text box.
4. Stop all syncs: deactivate every RD workflow and pause the Google Ads Script.
5. Remove access: revoke the GHL token, Meta system user, Xero connection and your Google access. The client keeps the sheet and report.
