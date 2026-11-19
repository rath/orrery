---
name: Orrery (혼천의)
description: Saju, Zi Wei Dou Shu and natal chart calculator; ink on ruled paper with one vermilion mark
colors:
  bg: "#fbfbfc"
  surface: "#ffffff"
  sunken: "#f1f1f4"
  fg: "#15161c"
  fg-2: "#3d3f4a"
  muted: "#5c5e6a"
  faint: "#8a8b96"
  line: "#e2e2e7"
  control: "#8a8b96"
  accent: "#d7391e"
  accent-soft: "#fbeae6"
  accent-ink: "#b9301c"
  tone-green: "#1f7a46"
  tone-amber: "#8a5a00"
  tone-blue: "#2456b8"
  tone-red: "#b9301c"
  tile-tree: "#23834d"
  tile-fire: "#cf361f"
  tile-earth: "#e9b90c"
  tile-metal: "#ffffff"
  tile-water: "#15161c"
  dark-bg: "#111216"
  dark-surface: "#1a1b21"
  dark-sunken: "#17181d"
  dark-fg: "#eeebe4"
  dark-fg-2: "#cfccc6"
  dark-muted: "#a3a2a4"
  dark-line: "#2b2d36"
  dark-control: "#73747f"
  dark-accent: "#f0603f"
typography:
  title:
    fontFamily: "'Pretendard Variable', Pretendard, 'Noto Sans KR', sans-serif"
    fontSize: "1.5rem"
    fontWeight: 600
    lineHeight: 1.33
    letterSpacing: "-0.025em"
  section:
    fontFamily: "'Pretendard Variable', Pretendard, 'Noto Sans KR', sans-serif"
    fontSize: "1.125rem"
    fontWeight: 600
    lineHeight: 1.55
  body:
    fontFamily: "'Pretendard Variable', Pretendard, 'Noto Sans KR', sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.625
  meta:
    fontFamily: "'Pretendard Variable', Pretendard, 'Noto Sans KR', sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.43
  hanja:
    fontFamily: "'Noto Sans KR', 'Apple SD Gothic Neo', 'Malgun Gothic', sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.5
rounded:
  tile: "4px"
  control: "6px"
  panel: "8px"
spacing:
  control-gap: "8px"
  field-gap: "20px"
  section: "24px"
  page: "32px"
components:
  button-primary:
    backgroundColor: "{colors.fg}"
    textColor: "{colors.surface}"
    rounded: "{rounded.control}"
    height: "40px"
    padding: "0 16px"
  button-secondary:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.fg}"
    rounded: "{rounded.control}"
    height: "40px"
    padding: "0 16px"
  button-small:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.fg}"
    rounded: "{rounded.control}"
    height: "32px"
    padding: "0 12px"
  input:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.fg}"
    rounded: "{rounded.control}"
    height: "40px"
    padding: "0 12px"
  form-panel:
    backgroundColor: "{colors.surface}"
    rounded: "{rounded.panel}"
    padding: "24px"
  pillar-tile:
    rounded: "{rounded.control}"
    size: "56px"
---

# Orrery design system

The tokens live in `src/index.css` as CSS variables, exposed to Tailwind through `@theme inline` (`bg-bg`, `text-fg`, `text-muted`, `border-line`, `bg-sunken`, `text-accent`, `text-tone-red` and so on). The dark theme swaps the variables under `.dark`, so components never write `dark:` colour variants. Shared control classes are in `src/components/ui/classes.ts`. Product context: `PRODUCT.md`.

## Overview

The interface is the ruled paper around an astronomical chart: one near-white surface, hairline rules, ink text. The logo's vermilion dot is the only accent and it marks what is current or selected, nothing else.

Layout is a header, a profile list and the chart. From 1024px the list is a sticky left column (17rem) and the chart column is capped at 48rem; below that the list moves into a bottom sheet opened from a button above the chart. Result tabs stick to the top while the chart scrolls. Sections inside a tab are separated by a top hairline and 24px of padding (`ui/Section.tsx`), never by a box. The single bordered panel in the product is the birth-data form.

Motion is limited to 150 to 200ms colour transitions and the dialog's fade-and-rise. `prefers-reduced-motion` removes all of it.

## Colors

- **Ink (`fg`, `fg-2`, `muted`)**: text and primary actions. `muted` is the lightest colour allowed for text (6.2:1 on `bg`); `faint` is for separators and icons only.
- **Paper (`bg`, `surface`, `sunken`)**: `bg` is the page, `surface` raises inputs, menus and the form panel, `sunken` recedes (selected list row, example blocks, the centre of the Zi Wei grid).
- **Rules (`line`, `control`)**: `line` divides content; `control` is the border of anything you can type in or press, at 3:1 or better against the page.
- **Vermilion (`accent`, `accent-soft`, `accent-ink`)**: the active tab underline, the dot beside the open profile, the current luck period (soft fill, with its age label in `accent-ink` so the text keeps 4.5:1 on the fill). Never a button fill, never decoration.
- **Tones (`tone-green`, `tone-amber`, `tone-blue`, `tone-red` and their `-soft` fills)**: meaning-bearing chart colours. The four transformations are 祿 green, 權 amber, 科 blue, 忌 red. Combinations (合) are blue, clashes (沖刑破害) red. Warnings use amber, errors red.
- **Five elements**: 木 green, 火 red, 土 yellow, 金 white, 水 black, as solid tiles for stems and branches (`bg-el-solid-*`) and as text colours for the ten gods (`el-*`). In the dark theme water text turns blue and metal light grey so neither disappears; tiles keep their colours and gain an outline where they would merge with the page.

### Named Rules

- **One mark**: if vermilion appears twice in one view for two different reasons, one of them is wrong.
- **Colour is data**: element and tone colours are never used for emphasis, branding or state.
- **No light grey text**: anything a person must read is `muted` or darker.

## Typography

One sans family, Pretendard Variable, for everything. Hanja terms and chart glyphs take `.font-hanja` (Noto Sans KR). Planet, sign and aspect symbols take `.font-symbol` and are passed through `textGlyph()` so they render as text glyphs, not colour emoji.

### Hierarchy

- **Title** (1.5rem / 600 / tight): the name of the person whose chart is open, or the product line on a first visit. One per view.
- **Section** (1.125rem / 600): each block inside a tab, usually a hanja term (四柱八字, 大運).
- **Body** (1rem): table cells, form values, prose. Prose is capped at 65ch.
- **Meta** (0.875rem): field labels, hints, secondary lines in the profile list, table headers.
- Numbers that line up (degrees, ages, dates, coordinates) use `tabular-nums`.

### Named Rules

- Korean text sets `word-break: keep-all`, so a word never breaks in the middle.
- No monospace; no display or serif face. The brush stroke belongs to the logo.

## Elevation

Flat. There are no shadows on content. Only things that float above the page cast one: the city and language dropdowns (`shadow-lg`, `z-20`). The dialog uses the browser's top layer with a dimmed backdrop. The sticky tab row sits at `z-10` on an opaque page background. No other z-index values are used.

## Components

### Buttons

Three variants from `buttonClass(variant, size)`: `primary` (ink fill, one per view: calculate, save, copy everything), `secondary` (surface with a `control` border), `ghost` (text only, for cancel and low-weight actions), plus `danger` (red text, for delete). Two sizes, 40px and 32px. Focus is a 2px ink outline, 2px offset, on every interactive element.

`CopyButton` keeps its width while its label changes to "copied" and announces the result to screen readers.

### Inputs / Fields

`inputClass` and `selectClass`: 40px high, 6px radius, `control` border that darkens to ink on hover and focus, red when `aria-invalid`. A field's label is above it in meta size; hints and errors are below. Selects that have not been chosen show their name as a muted placeholder option. Nothing that changes the chart is pre-filled (gender, date, time).

`Segmented` is a radio group drawn as joined buttons; the chosen option is ink-filled. It may start with nothing chosen.

### Navigation

The header holds the mark and wordmark, the language menu, the theme toggle and the GitHub link. The profile list (`PeoplePanel`) shows a name, a compact date and the day pillar; the open profile has a `sunken` row and a vermilion dot. Result tabs are underlined text with arrow-key navigation.

### Cards / Containers

None, apart from the form panel (`surface`, `line` border, 8px radius). Notices (`ui/Notice.tsx`) are a soft tone fill without a border.

### Chart tiles

A stem or branch is a solid element-coloured square: 56px in the pillar table (48px on phones), 36px in luck-period columns, 20px for hidden stems. Luck-period columns are buttons when choosing one changes what is shown below; the chosen column has an inset ink ring, the current one a soft vermilion fill.

## Do's and Don'ts

### Do:

- Use the tokens; add a variable to `src/index.css` before reaching for a raw Tailwind colour.
- Separate blocks with `Section` and let the table or grid carry the structure.
- Keep every UI string in the six locale files, and leave hanja terms untranslated.
- Check both themes and a 390px-wide screen for any change to a chart view.

### Don't:

- Don't wrap sections in bordered or shadowed boxes, and never nest one.
- Don't write `text-gray-*` or `dark:` colour pairs.
- Don't use vermilion for buttons, links or emphasis.
- Don't open a modal for something that fits inline; the profile sheet on narrow screens is the one exception.
- Don't default a field whose wrong value silently changes the chart.
