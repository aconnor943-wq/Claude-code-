# The Lounge — Paradise Point

Static website for The Lounge, Paradise Point (Gold Coast). No build step: open `index.html` or deploy the folder to any static host (Netlify, Vercel, GitHub Pages).

- `index.html`, `menu.html`, `site.css`, `site.js` — the site (the black-and-gold design, chosen 3 Nov 2026)
- `tools/menu/` — the menu as data; `python3 tools/menu/build.py menu.html` rebuilds the menu page (add `--prices` to show prices)
- `versions/a/` — the earlier limestone-and-teal design, kept for reference; `versions/c/` — the art-deco trial
- `assets/img`, `assets/video` — web-optimised stills and looping clips cut from the venue footage
- `photos/` — full-resolution graded stills plus 4:5 crops for social

## Still to confirm
- Phone number (not on the site yet)
- Bookings use the OpenTable widget for restaurant ID 212261 (`index.html`, Book section), confirmed from the venue's OpenTable admin
- Opening hours and weekly specials are taken from the OpenTable listing; hours also live in `site.js` (`HOURS`) for the "open now" indicator

## Notice bar
`index.html` has an empty notice in the opening screen: `<p class="notice" data-notice data-until="" hidden></p>`.
Type a message between the tags and an end date in `data-until` (YYYY-MM-DD), e.g.
`<p class="notice" data-notice data-until="2026-12-26" hidden>Christmas Day: closed. Boxing Day from 11:30am.</p>`.
It shows until the end of that date (Paradise Point time) and then hides itself. Leave `data-until` empty to show it until you remove it.

## At launch, on the real domain
- Replace `https://the-lounge-paradise-point-preview.netlify.app` with the real address in `index.html` and `menu.html` (share-preview tags and the Google listing details).
- Remove the `noindex` setting so Google can list the site (it is only on the Netlify test copy, not in this repo).
- Swap the Google review button's link for the venue's own "Ask for reviews" link.
