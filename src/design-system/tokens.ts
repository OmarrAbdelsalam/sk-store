/**
 * SK Bags design tokens — the single source of truth for the storefront theme.
 *
 * Theme: Shopify "Prestige" (Allure preset), measured from its demo store's
 * computed styles (prestige-theme-allure.myshopify.com, Nov 2026) at 1440px.
 * Do not invent new values in components: add them here first, then use the
 * Tailwind class it generates (tailwind.config.ts) or the CSS variable
 * (src/app/globals.css).
 *
 * Read DESIGN_SYSTEM.md at the repo root for how to use each token.
 */

/* ------------------------------------------------------------------ */
/* Color                                                               */
/* ------------------------------------------------------------------ */

export const color = {
  /** Page background (Prestige "background 1"). */
  canvas: "#FFFFFF",
  /** Headings, prices, icons. Secondary text uses ink at 65%. */
  ink: "#1C1C1C",
  white: "#FFFFFF",

  /** Primary buttons. */
  primary: "#1C1C1C",
  /** Hover of primary. */
  night: "#000000",
  /** 1px lines on a dark surface. */
  primaryLine: "#3E3E3E",
  /** Promo bar (Parfois): ink at 5% on white, ink text. */
  announcement: "#F4F4F4",
  /** Sale red (Prestige "on sale"). */
  accent: "#E32C2B",
  /** Secondary text (ink at 65% on canvas). */
  muted: "#6E6E6E",

  /** Product image tile (Parfois: light gray on a white page). */
  beige: "#F5F5F5",
  beigeAlt: "#E6E6E6",
  roseLight: "#F7F7F7",
  rose: "#E6E6E6",
  roseMid: "#EDEDED",
  /** Sale price. */
  terracotta: "#E32C2B",

  /** Neutral scale. */
  gray: {
    50: "#FAFAFA",
    100: "#F5F5F5",
    200: "#DDDDDD",
    300: "#CFCFCF",
    400: "#A8A8A8",
    450: "#8E8E8E",
    500: "#6E6E6E",
    600: "#545454",
    700: "#3E3E3E",
    800: "#2A2A2A",
    900: "#1C1C1C",
  },

  /** Status (feedback only, never decoration). */
  success: { soft: "#E6F2EA", DEFAULT: "#2E7D4F" },
  warning: { soft: "#FBF1DD", DEFAULT: "#B7791F" },
  danger: { soft: "#FBE4E4", DEFAULT: "#E32C2B" },
  info: { soft: "#E5EEF6", DEFAULT: "#2F6690" },
} as const;

/** Translucent values used on top of photography / video. */
export const overlay = {
  buttonFill: "rgba(0, 0, 0, 0.10)",
  buttonFillHover: "rgba(0, 0, 0, 0.25)",
  buttonLine: "rgba(255, 255, 255, 0.30)",
  textShadow: "0 1px 3px rgba(0, 0, 0, 0.25)",
  /** Light even dim on hero photos. */
  scrim: "linear-gradient(180deg, rgba(0,0,0,0.08) 0%, rgba(0,0,0,0.18) 100%)",
  /** Under the transparent header: keeps logo, search and links readable. */
  scrimTop: "linear-gradient(180deg, rgba(0,0,0,0.45) 0%, rgba(0,0,0,0.18) 55%, rgba(0,0,0,0) 100%)",
  /** Behind centered hero text only — bags at the edges stay bright. */
  scrimCenter: "radial-gradient(ellipse 55% 45% at 50% 50%, rgba(0,0,0,0.42) 0%, rgba(0,0,0,0.2) 55%, rgba(0,0,0,0) 100%)",
} as const;

/* ------------------------------------------------------------------ */
/* Typography                                                          */
/* ------------------------------------------------------------------ */

export const fontFamily = {
  /** Body: Nunito (latin) → Cairo (arabic). */
  sans: ["var(--font-body)", "var(--font-cairo)", "system-ui", "sans-serif"],
  /** Headings + all tracked uppercase UI: Instrument Sans → Cairo. */
  display: ["var(--font-display)", "var(--font-cairo)", "system-ui", "sans-serif"],
  arabic: ["var(--font-cairo)", "system-ui", "sans-serif"],
} as const;

/**
 * Type scale — [fontSize, { lineHeight, letterSpacing }].
 * Prestige headings/labels are uppercase with 0.18em tracking.
 */
export const fontSize = {
  /** 12px — secondary meta (colour name, small notes). */
  caption: ["12px", { lineHeight: "20px", letterSpacing: "0px" }],
  /** 12px Instrument Sans (h6) — nav, product names, prices, headings. */
  label: ["12px", { lineHeight: "20.4px", letterSpacing: "2.16px" }],
  /** 13px Nunito — button text. */
  button: ["13px", { lineHeight: "21.45px", letterSpacing: "2.34px" }],
  /** 14px — small print, footer links. */
  fine: ["14px", { lineHeight: "23.1px", letterSpacing: "0px" }],
  /** 13px semibold — promo bar (Parfois). */
  announce: ["13px", { lineHeight: "20px", letterSpacing: "0px" }],
  /** 22px (h3) — product page title. */
  "title-sm": ["22px", { lineHeight: "33px", letterSpacing: "3.96px" }],
  /** 14px Nunito — paragraphs (Prestige body). */
  body: ["14px", { lineHeight: "23.1px", letterSpacing: "0px" }],
  base: ["14px", { lineHeight: "23.1px", letterSpacing: "0px" }],
  /** 16px — product page price. */
  price: ["16px", { lineHeight: "24px", letterSpacing: "0px" }],
  /** 18px (h4) — section titles in cart, related products. */
  "title-md": ["18px", { lineHeight: "27px", letterSpacing: "3.24px" }],
  /** 22px (h3) — tile titles. */
  "display-sm": ["22px", { lineHeight: "33px", letterSpacing: "3.96px" }],
  /** 28px (h2) — section headings. */
  "display-md": ["28px", { lineHeight: "39.2px", letterSpacing: "5.04px" }],
  /** 32px (h1) — hero / banner headings. */
  "display-lg": ["32px", { lineHeight: "41.6px", letterSpacing: "5.76px" }],
} as const;

export const fontWeight = {
  regular: "400",
  medium: "500",
  semibold: "600",
} as const;

/* ------------------------------------------------------------------ */
/* Space, size, shape                                                  */
/* ------------------------------------------------------------------ */

export const space = {
  /** Gap between product cards side by side (Parfois: 2px — cards touch). */
  tile: "var(--ds-tile-gap)",
  /** Gap between rows of product cards (Parfois: 42px desktop, 32px phone). */
  "row-gap": "42px",
  /** Row gap where cards end in a Quick add button (phones + tablets): the
   *  button already closes the card, so 42px read as an empty band. */
  "row-gap-tight": "20px",
  /** Side padding of header, titles, tabs, filters — phone (Parfois: 16px). */
  gutter: "16px",
  /** Same, desktop (Parfois: 30px). */
  "gutter-lg": "30px",
  /** Side padding of product grids on desktop (40px — slightly tighter than
   *  Parfois' 64px so cards read bigger; 0 on phones, edge to edge). */
  "grid-gutter-lg": "40px",
  /** Vertical padding of a standard section (Prestige: 3rem). */
  section: "48px",
  "section-lg": "64px",
} as const;

export const size = {
  announcement: "36px",
  "header-mobile": "52px",
  "header-desktop": "75px",
  "logo-h-mobile": "32px",
  "logo-h-desktop": "52px",
  /** Button height (Prestige: 44px). */
  button: "44px",
  "button-overlay": "44px",
  "button-overlay-sm": "40px",
  input: "44px",
  /** Content max width — none, Parfois spans the full screen width. */
  page: "100%",
} as const;

export const radius = {
  /** Everything is square (Prestige button/input radius 0). */
  none: "0px",
  sm: "0px",
  /** Color swatches only. */
  pill: "9999px",
} as const;

/** Media aspect ratios. */
export const aspect = {
  /** Product card image — 3:4 like Parfois (photo fills the tile). */
  product: "3 / 4",
  /** Category tiles on phones (mobile category photos are portrait/square). */
  tile: "4 / 5",
  /** Category tiles from md up. Desktop category photos are landscape
   *  (1536×1024, 1672×941) with the category name printed inside, so the
   *  tile matches 16:9 to keep that text whole. */
  "tile-wide": "16 / 9",
} as const;

/* ------------------------------------------------------------------ */
/* Motion                                                              */
/* ------------------------------------------------------------------ */

export const motion = {
  fast: "200ms",
  image: "500ms",
  ease: "cubic-bezier(0.25, 0.1, 0.25, 1)",
} as const;

export const breakpoint = {
  sm: "640px",
  md: "768px",
  lg: "1024px",
  xl: "1280px",
  "2xl": "1440px",
} as const;

const tokens = {
  color,
  overlay,
  fontFamily,
  fontSize,
  fontWeight,
  space,
  size,
  radius,
  aspect,
  motion,
  breakpoint,
};

export default tokens;
