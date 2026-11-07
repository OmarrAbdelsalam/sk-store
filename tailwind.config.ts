import type { Config } from "tailwindcss";
import tokens from "./src/design-system/tokens";

const { color, overlay, fontFamily, fontSize, space, size, radius, aspect, motion } = tokens;

export default {
	darkMode: ["class"],
	// hover: / group-hover: only apply on devices with a real pointer that
	// can hover (mouse / trackpad). On phones a tap used to leave the hover
	// state "stuck" — a product card would flip to its second photo as if
	// hovered. Taps keep their active:/focus styles.
	future: {
		hoverOnlyWhenSupported: true,
	},
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
		"!./src/types/database.types.ts",
	],
	prefix: "",
	theme: {
		container: {
			center: true,
			padding: {
				DEFAULT: space.gutter,
				lg: space["gutter-lg"],
			},
			screens: {
				"2xl": size.page,
			},
		},
		extend: {
			spacing: {
				tile: space.tile,
				"row-gap": space["row-gap"],
				"row-gap-tight": space["row-gap-tight"],
				gutter: space.gutter,
				"gutter-lg": space["gutter-lg"],
				"grid-gutter-lg": space["grid-gutter-lg"],
				section: space.section,
				"section-lg": space["section-lg"],
				announcement: size.announcement,
				"header-mobile": size["header-mobile"],
				"header-desktop": size["header-desktop"],
				button: size.button,
				"button-overlay": size["button-overlay"],
				"button-overlay-sm": size["button-overlay-sm"],
				input: size.input,
				// legacy names kept so older markup keeps compiling
				"section-xl": "80px",
				"screen-pad": space.gutter,
				"screen-pad-sm": "16px",
				touch: "48px",
				cta: size.button,
			},
			minHeight: {
				touch: "48px",
				cta: size.button,
				input: size.input,
				button: size.button,
			},
			height: {
				"logo-mobile": size["logo-h-mobile"],
				"logo-desktop": size["logo-h-desktop"],
			},
			colors: {
				/* ---- shadcn semantic colors (values live in globals.css) ---- */
				border: "hsl(var(--border))",
				input: "hsl(var(--input))",
				ring: "hsl(var(--ring))",
				background: "hsl(var(--background))",
				foreground: "hsl(var(--foreground))",
				primary: {
					DEFAULT: "hsl(var(--primary))",
					foreground: "hsl(var(--primary-foreground))",
				},
				secondary: {
					DEFAULT: "hsl(var(--secondary))",
					foreground: "hsl(var(--secondary-foreground))",
				},
				destructive: {
					DEFAULT: "hsl(var(--destructive))",
					foreground: "hsl(var(--destructive-foreground))",
				},
				muted: {
					DEFAULT: "hsl(var(--muted))",
					foreground: "hsl(var(--muted-foreground))",
				},
				accent: {
					DEFAULT: "hsl(var(--accent))",
					foreground: "hsl(var(--accent-foreground))",
				},
				popover: {
					DEFAULT: "hsl(var(--popover))",
					foreground: "hsl(var(--popover-foreground))",
				},
				card: {
					DEFAULT: "hsl(var(--card))",
					foreground: "hsl(var(--card-foreground))",
				},
				sidebar: {
					DEFAULT: "hsl(var(--sidebar-background))",
					foreground: "hsl(var(--sidebar-foreground))",
					primary: "hsl(var(--sidebar-primary))",
					"primary-foreground": "hsl(var(--sidebar-primary-foreground))",
					accent: "hsl(var(--sidebar-accent))",
					"accent-foreground": "hsl(var(--sidebar-accent-foreground))",
					border: "hsl(var(--sidebar-border))",
					ring: "hsl(var(--sidebar-ring))",
				},

				/* ---- design-system palette ---- */
				ink: color.ink,
				canvas: color.canvas,
				announcement: color.announcement,
				"accent-2": color.accent,
				night: color.night,
				"primary-line": color.primaryLine,
				beige: { DEFAULT: color.beige, alt: color.beigeAlt },
				rose: { DEFAULT: color.rose, light: color.roseLight, mid: color.roseMid },
				terracotta: color.terracotta,
				// The reference uses a true (warm-free, blue-free) gray. Overriding
				// Tailwind's cool `gray` retunes every gray-* utility in the app.
				gray: { ...color.gray, 950: "#0A0A0A" },
				neutral: { ...color.gray, 950: "#0A0A0A" },
				success: color.success,
				warning: color.warning,
				danger: color.danger,
				info: color.info,

				// legacy aliases → new palette
				luxury: {
					cream: color.beige,
					stone: color.gray[300],
					charcoal: color.gray[700],
					platinum: color.gray[100],
				},
			},
			fontFamily: {
				sans: [...fontFamily.sans],
				display: [...fontFamily.display],
				arabic: [...fontFamily.arabic],
				cairo: [...fontFamily.arabic],
				// legacy aliases
				playfair: [...fontFamily.sans],
				luxury: [...fontFamily.display],
				tajawal: [...fontFamily.arabic],
				alexandria: [...fontFamily.arabic],
			},
			fontSize: {
				base: [fontSize.base[0], { ...fontSize.base[1] }],
				caption: [fontSize.caption[0], { ...fontSize.caption[1] }],
				label: [fontSize.label[0], { ...fontSize.label[1] }],
				button: [fontSize.button[0], { ...fontSize.button[1] }],
				fine: [fontSize.fine[0], { ...fontSize.fine[1] }],
				announce: [fontSize.announce[0], { ...fontSize.announce[1] }],
				"title-sm": [fontSize["title-sm"][0], { ...fontSize["title-sm"][1] }],
				body: [fontSize.body[0], { ...fontSize.body[1] }],
				price: [fontSize.price[0], { ...fontSize.price[1] }],
				"title-md": [fontSize["title-md"][0], { ...fontSize["title-md"][1] }],
				"display-sm": [fontSize["display-sm"][0], { ...fontSize["display-sm"][1] }],
				"display-md": [fontSize["display-md"][0], { ...fontSize["display-md"][1] }],
				"display-lg": [fontSize["display-lg"][0], { ...fontSize["display-lg"][1] }],
			},
			letterSpacing: {
				caption: "0px",
				label: "0.18em",
				button: "0.18em",
				cta: "0.18em",
				display: "0.18em",
			},
			borderRadius: {
				lg: "var(--radius)",
				md: "var(--radius)",
				sm: "var(--radius)",
				none: radius.none,
				ds: "var(--radius)",
				tag: radius.sm,
				pill: radius.pill,
				card: "var(--radius)",
				luxury: "var(--radius)",
			},
			aspectRatio: {
				product: aspect.product,
				tile: aspect.tile,
				"tile-wide": aspect["tile-wide"],
			},
			dropShadow: {
				overlay: "0 1px 3px rgba(0,0,0,0.25)",
			},
			maxWidth: {
				page: size.page,
			},
			backgroundImage: {
				scrim: overlay.scrim,
				"scrim-top": overlay.scrimTop,
				"scrim-center": overlay.scrimCenter,
			},
			transitionDuration: {
				fast: motion.fast,
				image: motion.image,
			},
			transitionTimingFunction: {
				brand: motion.ease,
			},
			keyframes: {
				"accordion-down": {
					from: { height: "0" },
					to: { height: "var(--radix-accordion-content-height)" },
				},
				"accordion-up": {
					from: { height: "var(--radix-accordion-content-height)" },
					to: { height: "0" },
				},
				"cart-bounce": {
					"0%": { transform: "scale(1)" },
					"40%": { transform: "scale(1.12)" },
					"100%": { transform: "scale(1)" },
				},
				"badge-pop": {
					"0%": { transform: "scale(1)" },
					"40%": { transform: "scale(1.25)" },
					"100%": { transform: "scale(1)" },
				},
			},
			animation: {
				"accordion-down": "accordion-down 0.2s ease-out",
				"accordion-up": "accordion-up 0.2s ease-out",
				"cart-bounce": "cart-bounce 0.5s ease-out",
				"badge-pop": "badge-pop 0.5s ease-out",
			},
		},
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
