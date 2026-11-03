---
name: The Lounge, Paradise Point
description: Restaurant and cocktail bar on the Esplanade; black and gold from the venue's own sign, built to get a table booked.
colors:
  black: "#0e0d0b"
  charcoal: "#191714"
  charcoal-2: "#23201c"
  ivory: "#f1ece3"
  ivory-2: "#e6dfd2"
  ink: "#16140f"
  ink-soft: "#4b463e"
  text: "#f1ece3"
  text-soft: "#cfc6b8"
  gold: "#e2b866"
  gold-lift: "#ecc77e"
  gold-ink: "#16120a"
typography:
  display:
    fontFamily: "Cormorant Garamond, Georgia, serif"
    fontSize: "clamp(2.6rem, 1.6rem + 4.4vw, 5.4rem)"
    fontWeight: 600
    lineHeight: 1.05
    letterSpacing: "-0.01em"
  headline:
    fontFamily: "Cormorant Garamond, Georgia, serif"
    fontSize: "clamp(2.1rem, 1.5rem + 2.4vw, 3.6rem)"
    fontWeight: 600
    lineHeight: 1.05
    letterSpacing: "-0.01em"
  title:
    fontFamily: "Work Sans, Helvetica Neue, Arial, sans-serif"
    fontSize: "clamp(1.35rem, 1.2rem + 0.6vw, 1.75rem)"
    fontWeight: 500
    lineHeight: 1.25
  lead:
    fontFamily: "Work Sans, Helvetica Neue, Arial, sans-serif"
    fontSize: "clamp(1.1rem, 1.02rem + 0.35vw, 1.3rem)"
    fontWeight: 400
    lineHeight: 1.65
  body:
    fontFamily: "Work Sans, Helvetica Neue, Arial, sans-serif"
    fontSize: "1.0625rem"
    fontWeight: 400
    lineHeight: 1.65
  label:
    fontFamily: "Work Sans, Helvetica Neue, Arial, sans-serif"
    fontSize: "0.9rem"
    fontWeight: 600
    lineHeight: 1
rounded:
  pill: "999px"
  card: "14px"
spacing:
  pad: "clamp(20px, 4vw, 48px)"
  section: "clamp(80px, 11vw, 150px)"
  wrap: "1180px"
components:
  button-primary:
    backgroundColor: "{colors.gold}"
    textColor: "{colors.gold-ink}"
    rounded: "{rounded.pill}"
    height: "50px"
  button-primary-hover:
    backgroundColor: "{colors.gold-lift}"
  button-dark:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.ivory}"
    rounded: "{rounded.pill}"
---

# Design System: The Lounge, Paradise Point

The live site (`index.html`, `menu.html`, `site.css`, `site.js`), chosen on 3 November 2026. The earlier limestone-and-teal design and its system are kept in `versions/a/`.

## Overview

**Creative North Star: "Book a table from anywhere on the page."**

Black and gold because they are the venue's own sign, not a luxury template. The page answers what the place is, why to come and what to do next, in that order: a full-screen video with a plain headline ("Steaks, seafood and cocktails on the Esplanade"), a strip of quick facts, the week's specials, photographs of the room, the weekday deals, a taste of the menu, the bar, booking and the address. Every section ends in one action, and a gold Book a table button is always within reach (top bar, every section, and a floating button on phones).

The opening video picks day or night from Paradise Point's real time (Queensland, UTC+10, sunset by month), and only the loop that plays is downloaded.

## Colors

Roughly 60% black and charcoal grounds, 30% ivory (text, and the one light section), 10% gold.

- **Sign Black** (black) and **Charcoal** (charcoal, charcoal-2): the page ground, the facts strip, the menu tiles and booking field.
- **Ivory** (ivory): all primary text on dark, and the ground of the weekday deals, the one light section. **Ivory 2** (ivory-2) is its tone step.
- **Ink** (ink) and **Ink Soft** (ink-soft): text on ivory.
- **Text Soft** (text-soft): secondary text on dark (11:1 on black).
- **Neon Sign Gold** (gold): buttons, today's special and hours, chevrons, bullets and the focus ring. **Gold Lift** is hover only; **Gold Ink** is text on gold.

**The One Action Rule.** Gold marks what you can press and what is happening today. It never colours a heading or a field.

## Typography

**Display:** Cormorant Garamond 600, for the headline and section titles only.
**Text:** Work Sans 400/500/600 for everything else.

Two families, never more. The serif is set at a solid 600 weight and large sizes so it reads on black; labels, prices and controls stay in Work Sans.

## Layout

Content sits in a 1180px wrap with fluid side padding (`--pad`) and generous section padding (`--section`). The hero is full screen with the video behind a dark scrim. Lists are rows divided by faint ivory lines (16% alpha): the week, the deals, the hours. The weekly specials and the menu sections are dropdowns (`details`), with today's special open by default. The photo strip runs edge to edge: one wide image, two below.

Breakpoints: at 960px the nav links hide and two-column sections stack; at 640px the phone layout takes over, the hero button goes full width and the floating Book a table button appears once past the hero.

## Components

- **Primary button:** gold pill, 50px tall (58px in the hero, 42px in the top bar), Work Sans 600. One per section.
- **Dark button:** ink pill on the ivory deals section.
- **Specials dropdown:** day, special, price and a gold chevron on one line; today is gold with a short gold bar at the left.
- **Menu tiles:** charcoal cards with 14px corners linking to a section of the menu page, which opens that dropdown.
- **Floating Book a table:** phones only, hidden at the top and while the booking section is on screen.

## Motion

House ease is cubic-bezier(.16, 1, .3, 1). The day/night video crossfades over 1.6s; dropdowns open over 0.4s; photos in the strip scale 3% on hover. Under reduced motion, transitions collapse and the video does not autoplay.

## Do's and Don'ts

- **Do** keep one primary action per section, and keep Book a table in reach.
- **Do** use the serif only for the headline and section titles.
- **Do** check secondary text stays at least 4.5:1 against its ground.
- **Don't** add outline-only buttons for important actions.
- **Don't** use gold for decoration or headings.
- **Don't** add a third typeface.
