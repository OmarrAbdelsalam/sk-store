import type { Config } from "tailwindcss";

export default {
	darkMode: ["class"],
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
				DEFAULT: '1.25rem',
				sm: '1.25rem',
				md: '2rem',
				lg: '2rem',
				xl: '2rem',
				'2xl': '2rem',
			},
			screens: {
				'2xl': '1400px'
			}
		},
		extend: {
			spacing: {
				'section': '48px',
				'section-lg': '64px',
				'section-xl': '80px',
				'screen-pad': '20px',
				'screen-pad-sm': '16px',
				'touch': '48px',
				'cta': '54px',
			},
			minHeight: {
				'touch': '48px',
				'cta': '54px',
				'input': '48px',
			},
			colors: {
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
				},
				sidebar: {
					DEFAULT: 'hsl(var(--sidebar-background))',
					foreground: 'hsl(var(--sidebar-foreground))',
					primary: 'hsl(var(--sidebar-primary))',
					'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
					accent: 'hsl(var(--sidebar-accent))',
					'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
					border: 'hsl(var(--sidebar-border))',
					ring: 'hsl(var(--sidebar-ring))'
				},
				luxury: {
					cream: 'hsl(var(--luxury-cream))',
					stone: 'hsl(var(--luxury-stone))',
					charcoal: 'hsl(var(--luxury-charcoal))',
					platinum: 'hsl(var(--luxury-platinum))'
				},
			},
			fontFamily: {
				'playfair': ['var(--font-poppins)', 'sans-serif'],
				'luxury': ['Playfair Display', 'serif'],
				'arabic': ['Noto Sans Arabic', 'sans-serif'],
				'tajawal': ['Tajawal', 'sans-serif'],
				'alexandria': ['var(--font-alexandria)', 'sans-serif'],
				'sans': ['var(--font-poppins)', 'sans-serif']
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)',
				card: '4px',
				luxury: '0px',
			},
			keyframes: {
				'accordion-down': {
					from: {
						height: '0'
					},
					to: {
						height: 'var(--radix-accordion-content-height)'
					}
				},
				'accordion-up': {
					from: {
						height: 'var(--radix-accordion-content-height)'
					},
					to: {
						height: '0'
					}
				},
				'cart-bounce': {
					'0%': { transform: 'scale(1) rotate(0deg)' },
					'40%': { transform: 'scale(1.15) rotate(-6deg)' },
					'70%': { transform: 'scale(0.95) rotate(3deg)' },
					'100%': { transform: 'scale(1) rotate(0deg)' },
				},
				'badge-pop': {
					'0%': { transform: 'scale(1)' },
					'40%': { transform: 'scale(1.3)' },
					'70%': { transform: 'scale(0.92)' },
					'100%': { transform: 'scale(1)' },
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'cart-bounce': 'cart-bounce 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)',
				'badge-pop': 'badge-pop 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)',
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
