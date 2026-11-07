# SK Bags — Design System

The storefront theme follows Shopify's **Prestige** theme (Allure preset),
measured from its demo store's computed styles
(prestige-theme-allure.myshopify.com, Nov 2026): light-gray page, near-black
ink, Instrument Sans for headings and all tracked uppercase UI, Nunito for
body text, square corners, product photos sitting directly on the page
colour, white footer. SK keeps its own logo, photos, copy and product names.

## Where things live

| What | File |
|---|---|
| Token values (single source of truth) | `src/design-system/tokens.ts` |
| Tailwind classes generated from tokens | `tailwind.config.ts` |
| CSS variables + `.ds-*` component classes | `src/app/globals.css` |
| Class merging that knows the custom scale | `src/lib/utils.js` (`cn`) |
| Primitives | `src/components/ui/button.tsx`, `input.tsx`, `badge.tsx` |
| Fonts | `src/app/[locale]/layout.tsx` |

**Rule:** a component never hard-codes a hex color, a px font size, a
letter-spacing, a radius or a shadow. Add new values to `tokens.ts` first.
To retheme the store, change `tokens.ts` and the `:root` block in
`globals.css` — every component follows.

---

## Color

| Token | Hex | Tailwind | Use |
|---|---|---|---|
| canvas | `#FFFFFF` | `bg-background` `bg-canvas` | Page background (white, like Parfois) |
| ink | `#1C1C1C` | `text-ink` | Headings, names, icons; secondary text is `text-ink/65` |
| white | `#FFFFFF` | `bg-white` | Footer, panels, badges |
| primary | `#1C1C1C` | `bg-primary` | Primary buttons |
| announcement | `#F4F4F4` | `bg-announcement` | Promo bar (ink text) |
| night | `#000000` | `bg-night` | Hover of primary |
| sale red | `#E32C2B` | `text-accent-2` `bg-accent-2` `text-terracotta` | Sale price and "Sale" badge |
| product tile | `#F5F5F5` | `bg-beige` | Product image tiles |
| line | `#DDDDDD` / `#CFCFCF` | `border-gray-200` / `border-gray-300` | Dividers / inputs |
| success / warning / danger / info | see tokens | `text-danger` … | Feedback only |

shadcn variables (`--primary`, `--border`, …) are mapped onto this palette in
`globals.css`; `--radius` is `0px`.

## Typography

**Instrument Sans** (headings + tracked uppercase UI) · **Nunito** 400/600/700
(body) · **Cairo** (Arabic glyphs). Prestige uses 0.18em tracking on every
uppercase style.

| Role | Class | Size / line | Font | Case |
|---|---|---|---|---|
| Label (nav, names, prices, footer headings) | `.ds-label` `.ds-label-strong` | 12 / 20.4, 0.18em | Instrument Sans | UPPER |
| Announcement | `.ds-announce` | 12 / 20.4, 0.18em | Instrument Sans | UPPER |
| Badge | `.ds-badge` | 11 / 18, 0.18em, ink/65 on white | Instrument Sans | UPPER |
| Button text | `text-button` | 13 / 21.45, 0.18em | Nunito | UPPER |
| Caption | `.ds-caption` | 12 / 20, ink/65 | Nunito | — |
| Body | `.ds-body` | 14 / 23.1 | Nunito | — |
| Fine / footer links | `.ds-fine` | 14 / 23.1, ink/65 | Nunito | — |
| PDP price | `.ds-price-lg` | 16 / 24, ink/65 | Nunito | — |
| Small title (h4) | `.ds-title-md` | 18 / 27 (16 phone) | Instrument Sans | UPPER |
| PDP title / tile title (h3) | `.ds-title-sm` `.ds-display-sm` | 22 / 33 (18 phone) | Instrument Sans | UPPER |
| Section heading (h2) | `.ds-display-md` | 28 / 39.2 (20 phone) | Instrument Sans | UPPER |
| Hero heading (h1) | `.ds-display-lg` | 32 / 41.6 (22 phone) | Instrument Sans | UPPER |

Arabic: letter-spacing is forced to 0 on every `.ds-*` class and `tracking-*`.

## Buttons (square, 44px)

| Variant | `<Button variant=…>` / class | Look |
|---|---|---|
| Primary | `default` / `.ds-btn-primary` | ink fill, white text, hover black |
| Overlay | `overlay` / `.ds-btn-overlay` | white fill, ink text — on photos |
| Outline | `outline` / `.ds-btn-outline` | 1px ink border, fills ink on hover |
| Secondary | `secondary` | white fill |
| On primary | `onPrimary` | white outline on dark |
| Ghost / Link | `ghost` / `link` | text only |

## Forms

`<Input>` / `.ds-input`: 44px, square, white, 1px gray-300, gray-500 on
hover, ink on focus, 16px text on phones / 14px from `md`.

## Layout

| Token | Value | Tailwind |
|---|---|---|
| Header, titles, tabs, filters padding | 16px phone / 30px desktop (Parfois) | `.ds-page` / `.ds-gutter` |
| Product grid padding | 0 phone (edge to edge) / 40px desktop | `.ds-grid-page` |
| Container max width | none — full screen width (Parfois) | `max-w-page` = 100% |
| Card gap | 2px between cards, 42px between rows | `gap-x-tile gap-y-row-gap` |
| Section padding | 48px (64 large) | `py-section` |
| Section heading → content | 32px / 40px | `mb-8 lg:mb-10` |
| Promo bar | 36px | `h-announcement` |
| Header | 60px phone / 75px desktop | `h-header-mobile` `h-header-desktop` |
| Wordmark | SVG, 17px tall phone / 22px desktop | `<Wordmark />` |

Ratios: product image `aspect-product` (3:4) · category tiles `aspect-tile` (4:5) / `md:aspect-tile-wide` (16:9).

## Page anatomy (home)

1. **Promo bar** — Parfois style: `bg-announcement` (#F4F4F4), 36px,
   `.ds-announce` (13px semibold ink, normal case); several messages
   rotate upward one at a time (`AnnouncementTicker`).
2. **Header** — Parfois layout in this theme's tokens, one row, sticky.
   - Desktop: ☰ + the drawn SVG wordmark "SK BAGS" (`components/Wordmark.tsx`
     — geometric monoline letters in the Parfois style, `currentColor`, 22px
     tall) at start · underlined search field (300px) centered · "My orders" and
     "Cart" (20px icon + 14px semibold label) at end.
   - Phone: ☰ + search · wordmark (17px tall) · cart.
   - Scroll (Parfois): the promo bar scrolls away, the header sticks to the
     top. On the home page it stays transparent (white text) while it is over
     the hero and turns into the solid bar once the hero has scrolled past. Everywhere else and once scrolled: canvas bar,
     ink text, no bottom line.
3. **Hero** — slides under the transparent header, full screen. Desktop is a
   split of two product-led photos (`hero.png`, `discover2.webp`) with
   `object-position` aimed at the bags; phone uses `hero.png`. Overlays:
   `bg-scrim` (light even dim) + `bg-scrim-center` (radial, behind the text
   only) + `bg-scrim-top` (190px, under the header). Copy: eyebrow
   `.ds-label` "Handmade in Egypt", heading `.ds-display-lg`, white button.
4. **Categories** — inside `.ds-page`. The category photos already contain
   their name, so nothing is printed on them and they are not darkened; tile
   ratio `aspect-tile` (4:5) on phones, `md:aspect-tile-wide` (16:9) from
   md up so the printed text stays whole. Caption under each photo: name
   `.ds-label` + "Shop now →" in `text-ink/65`.
5. **New Arrivals** — visible heading, product row in `.ds-page`.
6. **Maison Clutch** — full-bleed video banner (own title).
7. **More to Discover** — two editorial tiles (heading hidden).
8. **Best Sellers** (visible heading), **reels** (heading hidden).
9. **Footer** — white, link columns with `.ds-label` headings and
   `.ds-fine` links, © line under a divider.

Hidden from the home page (components kept, re-enable in
`src/app/[locale]/page.tsx`): category tiles (4), Our Collections (in 8),
customer photos (@skbags), reassurance strip.
Visible section headings: `ds-display-md mb-8 text-center lg:mb-10`.

## Products page (`/products`)

Parfois listing header, all inside `.ds-page`:
1. Title (8px under the header, like Parfois) — 14px semibold ink: the category name, the badge name (New In /
   Best Sellers / Sale) or "All bags".
2. Category tabs — "View All" + every category, 40px tall, horizontally
   scrollable; active = semibold ink with a 2px ink underline, others
   `text-ink/55`; 1px `border-gray-200` under the row.
3. Filters — "Price ▾" and "Color ▾" chips (open the filter drawer) and a
   "Has deal" toggle (`?badge=sale`), 36px, 1px ink border, inverted when
   active; item count at the end.
4. Grid — 2 / 3 / 4 columns, `gap-tile`.

## Product card (Parfois)

- Image tile `.ds-cutout-frame` (`#F5F5F5`), `aspect-product` (3:4),
  323×430 at 1440px. The square photo spans the full width and is anchored
  to the bottom (`.ds-cutout`: `object-contain`, `object-position: 50% 100%`,
  `filter: contrast(1.08) brightness(1.08)`, `mix-blend-mode: multiply`), so
  the bag sits low with open gray space above it like Parfois, and white
  studio backgrounds turn into the tile gray — no image editing. Second photo cross-fades on hover.
- White round "+" (32px, `bg-white/90`) at the bottom center of the tile.
- Chips: "New" white top-start, "Sale" red top-end — 12px semibold
  uppercase, 0.04em.
- Info left-aligned, `px-2.5 pt-2.5`: name 13px uppercase 0.04em ink
  (truncated) · price 13px ink; on sale the old price is struck in ink and
  the new one is sale red.

## Deliberate deviations from Prestige

- Product image is 4:5 (Prestige: square) and the page is up to 1600px wide,
  so cards read bigger.
- Instrument Sans is loaded as a variable font (Turbopack fails with fixed
  weights).
- Logo: SK's monogram (32/40px) instead of a text wordmark.
- Admin keeps its own rounded look — `admin.css` pins the shared shadcn
  variables inside `.rm-admin-scope`.

## Checklist before merging UI work

- [ ] No hex, px font size, `tracking-[…]`, `rounded-*` or `shadow-*` added in components.
- [ ] Text roles use a `.ds-*` class or a token font size.
- [ ] Buttons use a `<Button>` variant or a `.ds-btn-*` class.
- [ ] Works in RTL (logical `ms-/me-/ps-/pe-/start-/end-`).
- [ ] Checked at 390px and 1440px.
