# Product

## Register

product

## Users

- People who want their own chart computed once and pasted into an AI chat (Claude, ChatGPT, Gemini) for a reading. Many arrive on a phone from a link, have never seen the site, and know their birth date but not the vocabulary.
- People who study or practise saju, Zi Wei Dou Shu or Western astrology and look at many charts: family, friends, clients. They come back, keep a list of people, switch between them and correct a birth time when they learn a better one.

## Product Purpose

Orrery (혼천의) computes three chart systems from one set of birth data, entirely in the browser: the Four Pillars (四柱八字), the Zi Wei Dou Shu chart (紫微斗數) and a Western natal chart. Nothing is sent to a server. Success is a first-time visitor reaching a chart and copying it for an AI within a minute, and a returning practitioner moving between saved people without re-entering anything.

## Brand Personality

Precise, quiet, instrument-like. The name is an astronomical instrument, and the logo is one ink brush stroke with a single vermilion dot: the interface is the ruled paper around it. Copy is matter-of-fact and short. Domain terms in hanja (四柱八字, 大運, 命宮) are data, never decoration.

## Anti-references

- Fortune-telling app kitsch: purple gradients, star fields, zodiac illustrations, mystical glow.
- SaaS dashboard grammar: a bordered card around every section, hero metrics, icon-plus-heading card grids.
- Tiny uppercase tracked eyebrows or `01 / 02 / 03` markers above sections.
- A serif or brush display face used on labels, buttons or data. The brush stroke belongs to the logo only.
- A modal for anything that can sit inline.

## Design Principles

1. The chart is the protagonist. Chrome recedes; tables and glyphs get the space and the contrast.
2. It is always clear whose chart is on screen, and changing that person's data is one obvious step.
3. One surface, hairline dividers, ink for text and actions. Vermilion marks what is current or selected and nothing else.
4. Element colours (木火土金水) and the four transformations are data encodings: consistent everywhere, legible in both themes, never used for decoration.
5. Nothing is entered by default on the user's behalf where a wrong default silently changes the chart (gender, date, time).

## Accessibility & Inclusion

WCAG 2.1 AA. Text contrast at least 4.5:1, including muted text and placeholders; control boundaries at least 3:1. Every control is reachable and operable by keyboard with a visible focus ring. Light and dark themes follow the system setting unless the user chooses. Motion is limited to short state transitions and is removed under `prefers-reduced-motion`. Six interface languages (ko, zh, ja, en, de, es); no UI string is hard-coded.
