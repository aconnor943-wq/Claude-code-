## Credentials (once per client)

| Credential | Type | Notes |
| --- | --- | --- |
| Google Sheets | Google Sheets OAuth2 | The account with edit access to the sheet |
| GHL (if used) | Header Auth, `Authorization: Bearer <token>` | Private Integration, read-only scopes for contacts, opportunities, calendars, calendar events. Location ID `{{ghl.location_id}}` |
| GHL SMS (optional, if used) | Header Auth | A second token with the scope for sending conversation messages, if the owner gets the SMS |
| Meta (if used) | Header Auth or query auth with a system user token | System user on the ad account, ads read permission only |
| Xero (if used) | Xero OAuth2 | Read-only accounting scopes. Requests need the tenant ID header |
| GA4 (if used) | Google OAuth2 / Service account | Viewer on the property |
| Anthropic (paid, usage) | Header Auth, name `x-api-key` | Set a monthly spend limit at console.anthropic.com |

