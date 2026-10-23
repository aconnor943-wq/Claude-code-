---
name: The Lounge, Paradise Point
description: Bar and kitchen on the Esplanade; one structure, two lights, day on the Broadwater and night under the lamps.
colors:
  gold: "#e2b866"
  gold-lift: "#ecc77e"
  gold-ink: "#15120c"
  sea: "#1d4a4f"
  sea-2: "#245a60"
  sea-today: "#2f6d73"
  sea-night: "#10292c"
  sea-2-night: "#153236"
  sea-today-night: "#1f4549"
  sea-ink: "#eef1ee"
  sea-muted: "#c3d3d1"
  limestone: "#e4e1db"
  limestone-2: "#d8d4cc"
  ink: "#15140f"
  muted: "#4a4741"
  black: "#0e0d0b"
  black-2: "#171512"
  black-3: "#201d19"
  lamp: "#ecebe7"
  lamp-muted: "#b9b1a4"
typography:
  display:
    fontFamily: "Work Sans, Helvetica Neue, Arial, sans-serif"
    fontSize: "clamp(4.5rem, 16vw, 16rem)"
    fontWeight: 300
    lineHeight: 0.9
    letterSpacing: "-0.035em"
  headline:
    fontFamily: "Work Sans, Helvetica Neue, Arial, sans-serif"
    fontSize: "clamp(2.25rem, 1.3rem + 3.6vw, 4rem)"
    fontWeight: 300
    lineHeight: 1
    letterSpacing: "-0.03em"
  title:
    fontFamily: "Work Sans, Helvetica Neue, Arial, sans-serif"
    fontSize: "clamp(1.25rem, 1.05rem + 0.8vw, 1.75rem)"
    fontWeight: 300
    lineHeight: 1.3
    letterSpacing: "-0.01em"
  body:
    fontFamily: "Work Sans, Helvetica Neue, Arial, sans-serif"
    fontSize: "clamp(1.0625rem, 1rem + 0.25vw, 1.1875rem)"
    fontWeight: 400
    lineHeight: 1.55
  label:
    fontFamily: "Work Sans, Helvetica Neue, Arial, sans-serif"
    fontSize: "clamp(0.8125rem, 0.79rem + 0.1vw, 0.875rem)"
    fontWeight: 500
    lineHeight: 1
    letterSpacing: "0.01em"
rounded:
  pill: "999px"
  round: "50%"
  focus: "2px"
spacing:
  margin: "clamp(16px, 2.2vw, 32px)"
  column-gap: "clamp(1rem, 2vw, 2rem)"
  section: "clamp(120px, 14vw, 200px)"
components:
  button-primary:
    backgroundColor: "{colors.gold}"
    textColor: "{colors.gold-ink}"
    typography: "{typography.label}"
    rounded: "{rounded.pill}"
    padding: "0 1.6em"
    height: "48px"
  button-primary-hover:
    backgroundColor: "{colors.gold-lift}"
    textColor: "{colors.gold-ink}"
  button-primary-small:
    backgroundColor: "{colors.gold}"
    textColor: "{colors.gold-ink}"
    typography: "{typography.label}"
    rounded: "{rounded.pill}"
    padding: "0 1.25em"
    height: "40px"
  button-round:
    backgroundColor: "{colors.gold}"
    textColor: "{colors.gold-ink}"
    rounded: "{rounded.round}"
    size: "0.9em"
  week-row:
    backgroundColor: "{colors.sea}"
    textColor: "{colors.sea-ink}"
    padding: "clamp(18px, 2.4vw, 32px) clamp(16px, 2.2vw, 32px)"
  week-row-alt:
    backgroundColor: "{colors.sea-2}"
    textColor: "{colors.sea-ink}"
  week-row-today:
    backgroundColor: "{colors.sea-today}"
    textColor: "{colors.sea-ink}"
---

# Design System: The Lounge, Paradise Point

## Overview

**Creative North Star: "The Light Changes, the Room Stays"**

One structure, two lights. Every surface is built once and lit twice: `data-light="day"` gives limestone render, near-black ink and Broadwater teal; `data-light="night"` dims the same chapters to sign-black with lamp-ivory ink. The light is chosen before first paint from Paradise Point's real time (Queensland, UTC+10, sunset by month) and a Day/Night switch in the top bar overrides it for the session. The change is a slow 1.6s crossfade, never a cut.

Space is generous and the photographs carry the page. Sections are separated by fields of colour and tone steps, never by lines or boxes. Type is a single sans family, light at display size and tightly tracked, set large enough to read solidly on the pale ground. Gold appears only where the visitor can act. The page reads top to bottom as day turning into night: limestone chapters, a teal week, then black bar, booking, address and footer.

The system rejects the category's dark-luxury template (black, gold, italic serif) used wholesale, and the cream-and-serif restaurant default. Black and gold exist here because they are the venue's own sign, and they arrive only after dark.

**Key Characteristics:**
- Two light states on one DOM; tokens swap, layout does not.
- One family (Work Sans 300/400/500), five fluid steps.
- Separation by fields and tone, never by rules, borders or shadows.
- Gold is the action colour and nothing else.
- Square, uncropped-subject photography; pill and round controls.
- Slow light crossfade as the signature; quiet staggered entrances.

## Colors

A mineral day palette and a lamp-lit night palette, joined by one teal and one gold.

### Primary
- **Neon Sign Gold** (gold): the action colour. Fills every "Book a table" pill and the round arrow button, the monogram stroke, the open-now dot, the booking fallback link, the address link underline, text selection and the focus ring. **Gold Lift** (gold-lift) is its hover state only. **Gold Ink** (gold-ink) is the text on gold.

### Secondary
- **Broadwater Teal** (sea): the field for the weekly rows. **Shallow Teal** (sea-2) bands every other row; **Today Teal** (sea-today) marks the current day. At night the three drop to **Dusk Teal** (sea-night), **Dusk Band** (sea-2-night) and **Dusk Today** (sea-today-night). **Foam** (sea-ink) and **Salt Haze** (sea-muted) are the inks on teal.

### Neutral
- **Limestone Render** (limestone): the day ground for the intro and plate chapters and the solid top bar by day.
- **Shaded Render** (limestone-2): the one tone step down, used for the menu field by day.
- **Esplanade Ink** (ink) and **Weathered Ink** (muted): primary and secondary text on limestone.
- **Sign Black** (black): the hero backdrop, the bar chapter, the address rows and the page canvas.
- **Night Ground** (black-2): what the day ground becomes at night; also the booking and footer fields.
- **Night Step** (black-3): the menu field at night, one step lighter than the night ground.
- **Lamp Ivory** (lamp) and **Lamp Shade** (lamp-muted): primary and secondary text after dark; lamp-muted also marks the closed-now dot.

### Named Rules
**The One Action Rule.** Gold fills only things you can press or follow (book, go, the focus ring) and the TL monogram that is its source. It never colours a heading, a field or an ornament.

**The Two Lights Rule.** Any new surface defines its ground and ink through `--ground`, `--ground-ink` and `--ground-muted` (or sits in a fixed night field), so the Day/Night switch reaches it. A day chapter that does not dim at night is a bug.

**The Tone Step Rule.** Adjacent sections separate by a change of field (limestone to limestone-2, black to black-2 to black-3, sea to sea-2), never by a line.

## Typography

**Display Font:** Work Sans (with Helvetica Neue, Arial, sans-serif)
**Body Font:** Work Sans (same stack)

**Character:** One grotesque in three weights. Light (300) at display and headline size with tight negative tracking reads as calm and expensive; regular (400) carries running text; medium (500) is reserved for controls, the brand name and the active state.

### Hierarchy
- **Display / name** (300, clamp(4.5rem, 16vw, 16rem), 0.9, -0.035em): the venue name only, stepped over two lines in the hero and returning at the foot (0.85, -0.04em). On phones it sets at 20vw (hero) and 17vw (foot).
- **Headline / head** (300, clamp(2.25rem to 4rem), 1, -0.03em): section titles, weekday names in the week rows, and the address rows. 2.25rem fixed on phones for the address.
- **Title / lead** (300 to 400, clamp(1.25rem to 1.75rem), 1.2 to 1.3, -0.01em): the hero sentence, the intro statement, dish names in the menu and the plate title.
- **Body** (400, clamp(1.0625rem to 1.1875rem), 1.55): running text, held to 30 to 34ch.
- **Label / small** (400 or 500, clamp(0.8125rem to 0.875rem)): nav links, the Day/Night switch, captions, footer lines, pills (500, 0.01em).

### Named Rules
**The Solid Light Rule.** Weight 300 is the lightest allowed, and only at lead size and above. Never set a thinner weight or a display serif on the limestone ground.

**The Name Leads Rule.** The display step belongs to the venue name. Section titles stop at the head step.

## Layout

A 12-column grid with `column-gap` clamp(1rem, 2vw, 2rem) inside a fluid side margin `--m` (clamp(16px, 2.2vw, 32px)). Sections breathe on `--gap` (clamp(120px, 14vw, 200px)) of vertical padding. Compositions are asymmetric: text in a narrow early column (for example 2 to 5 or 1 to 5), photographs across 6 to 13; paired photos stagger (1 to 9, then 5 to 13 with a top offset). Full-bleed images and video run edge to edge between the margins.

Lists are display rows rather than tables: the menu sets category, dish and note in a three-column row (24% / 1fr / auto) with 26px between rows; the week sets day, what's on and hours in 5fr / 4fr / 3fr fields. The hero is 100svh with the name bottom-left and a right-aligned side column holding the sentence, open-now line and pill.

Breakpoints: at 1000px the nav links hide and the menu and booking columns stack; at 680px the phone gets its own composition (hero name moves to 26svh, side column goes full width and left-aligned, grids collapse to single flow, menu and week rows reflow to two columns, round button grows to 56px).

## Elevation & Depth

Flat. There are no shadows, glows, blur or backdrop filters anywhere in the system. Depth comes from field and tone steps and from the photographs themselves. The only gradients are neutral black scrims (rgba(10,9,8) at 0 to 0.74) over the hero video to hold white type; night deepens them.

### Named Rules
**The Flat Field Rule.** Surfaces never lift. If something needs emphasis, change its field (as the today row does) or its weight, not its elevation.

**The Scrim-Only Gradient Rule.** A gradient is allowed only as a neutral scrim between a moving photograph and type set on it. No colour gradients, no decorative washes.

## Shapes

Two shapes for controls, one for pictures. Buttons are full pills (999px) or perfect circles (50%); photographs and video are square-cornered rectangles shown at their native aspect so the subject is never cut off. Sections and rows have no borders and no radius; they are fields. The focus ring is a 2px gold outline offset 4px with a 2px corner. The TL monogram, a double ring with stroked T and L, is the one emblem and is drawn in currentColor gold.

## Components

### Buttons
Warm, soft-edged and few.
- **Shape:** full pill (999px).
- **Primary:** gold field, gold-ink label, Work Sans 500 at the small step, 48px tall, 1.6em side padding, no border. The small variant (40px, 1.25em) sits in the top bar.
- **Hover / Focus:** lifts 2px and warms to gold-lift over 0.4s on the house ease; active settles to scale(0.98); focus shows the gold ring.
- **Round:** a gold circle sized to the surrounding type (0.9em; 56px on phones) holding a stroked arrow; on hover it turns -45 degrees.

### Text links
- **Style:** inherit colour, 500 weight, 1px underline at 0.22em offset, followed by a stroked arrow that slides 4px on hover. In the address rows the underline is 2px gold and the text turns gold on hover.

### Navigation
- **Top bar:** fixed, transparent with white text over the hero, turning solid to the current ground and ink once past the first screen (0.5s). Monogram and name left, four section links whose underline fades in on hover, the Day/Night switch, and the small pill. No border or shadow when solid.
- **Day/Night switch:** two text buttons; the pressed one is 500 weight and underlined. Phones hide the name text and the links, keeping monogram, switch and pill.

### Week rows (signature)
Full-width teal fields, one per day, alternating sea and sea-2; the current day takes sea-today, its day name steps up to 400 and a 500-weight "Today" line carries the live open-now status. Hours are right-aligned in tabular figures.

### Light switch crossfade (signature)
Changing the light crossfades the two hero loops (opacity, 1.6s), swaps grounds and inks on every day chapter and the teal fields over the same 1.6s, and dims day-chapter photographs to brightness(0.82) saturate(0.92) at night.

### Motion
House ease is cubic-bezier(.16, 1, .3, 1). Text rises 24px and fades in over 0.9s; pictures fade in from scale(1.035) over 1.2s opacity / 1.6s transform; items within a section stagger by 75ms up to 600ms. Content is visible without script. Under reduced motion, transitions collapse to 0.01ms, entrances are shown immediately and the hero video does not autoplay.

## Do's and Don'ts

### Do:
- **Do** route every new surface's ground and ink through the light tokens so night reaches it.
- **Do** use the gold pill for booking and the gold round button for "go"; keep gold to actions.
- **Do** separate sections with a field or tone step (limestone to limestone-2, black to black-2 to black-3).
- **Do** set titles in Work Sans 300 at the head step with -0.03em tracking, and keep running text to about 30 to 34ch.
- **Do** show photographs square-cornered and whole, at their own aspect ratio.
- **Do** keep motion to the 1.6s light crossfade and the staggered rise and fade, with the reduced-motion fallback.

### Don't:
- **Don't** draw rules, outlines or boxes around buttons, panels or rows.
- **Don't** add box shadows, glows, blur or backdrop filters to UI; the neon lives in the photographs and the monogram, not in CSS effects.
- **Don't** use gradients other than neutral scrims under type on moving imagery.
- **Don't** introduce a second typeface, a display serif, italics as a luxury cue, or weights below 300.
- **Don't** use gold for headings, fields or decoration.
- **Don't** crop a photograph so its subject is cut off.
