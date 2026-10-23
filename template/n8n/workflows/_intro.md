# n8n workflows: {{business.name}}

Menu and node names in n8n, GHL, Meta and Xero change often. If a name doesn't match, look for the closest one, or ask the build chat "where is X in <tool> now?".

**Every workflow:** name it `RD – {{business.name}} – <what it does>`. In **Settings → Timezone** set `{{business.timezone}}`. Set the error workflow (below) on each. Every key goes in an n8n credential, never in a node body.

**Every Google Sheets write:** operation **Append or Update Row**, the `{{business.name}} – Reporting Warehouse` sheet, column to match on `date`, map each field by name. If there's a value input option, choose the one that lets Google Sheets format values, so `2026-10-05` becomes a real date.

