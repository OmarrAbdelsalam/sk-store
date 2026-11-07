"use client"

import { MobileMenu } from "./navigation/MobileMenu";
import Wordmark from "./Wordmark";
import { SearchAndFilters } from "./navigation/SearchAndFilters";
import { CartButton } from "./navigation/CartButton";
import { useTranslations, useLocale } from 'next-intl';
import { usePathname } from 'next/navigation';
import { Link } from "@/i18n/navigation";
import { Globe, User } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";

export const LanguageSwitcher = () => {
  const locale = useLocale();
  const pathname = usePathname();
  const nextLocale = locale === 'ar' ? 'en' : 'ar';
  const pathWithoutLocale = pathname.replace(/^\/(ar|en)(\/|$)/, '/');
  const label = nextLocale === 'ar' ? 'عربي' : 'En';
  return (
    <Link
      href={pathWithoutLocale === '/' ? '/' : pathWithoutLocale}
      locale={nextLocale}
      className="flex items-center "
    >
      <Globe className="w-4 h-4 mx-2" />
      {label}
    </Link>
  );
};

/**
 * Header — DESIGN_SYSTEM.md › Page anatomy (2). Parfois layout, theme tokens.
 * One row. Desktop: ☰ + "sk bags" wordmark (start) · underlined search field (center) ·
 *   "My orders" + "Cart" with icons (end).
 * Phone: ☰ + search · logo · cart.
 * Home page, while over the hero: transparent with white text and the
 * wordmark in white. Everywhere else and once scrolled: canvas bar, ink text,
 * no bottom line.
 */
const Navigation = () => {
  const t = useTranslations("Nav");
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);

  // Parfois behaviour: the promo bar scrolls away, the header sticks to the
  // top and stays transparent for as long as it is over the hero; it turns
  // into the solid bar only once the hero has scrolled past.
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > window.innerHeight - 120);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Locale prefix is "never" (src/i18n/routing.ts), so home is always "/".
  const overHero = pathname === "/" && !scrolled;
  // Logo = the drawn SVG wordmark (components/Wordmark.tsx) — geometric
  // monoline letters in the Parfois style; follows the header text colour.

  return (
    <header
      className={`sticky top-0 z-50 w-full transition-colors duration-300 ${
        overHero
          ? "bg-transparent text-white text-shadow-overlay [&_svg]:drop-shadow-overlay"
          : "bg-background text-ink"
      }`}
    >
      {/* Phone & tablet */}
      <div className="flex h-header-mobile items-center px-1 lg:hidden">
        <div className="flex flex-1 items-center">
          <MobileMenu />
          <SearchAndFilters />
        </div>
        <Link href="/" aria-label={t("logo")} className="shrink-0">
          <Wordmark className="h-[17px] w-auto" title={t("brand")} />
        </Link>
        <div className="flex flex-1 items-center justify-end">
          <CartButton isMobile isTransparent={overHero} />
        </div>
      </div>

      {/* Desktop */}
      <div className="ds-gutter hidden h-header-desktop grid-cols-[1fr_auto_1fr] items-center lg:grid">
        <div className="flex items-center gap-3">
          <MobileMenu />
          <Link href="/" aria-label={t("logo")} className="flex items-center gap-3 transition-opacity duration-fast hover:opacity-70">
            <Wordmark className="h-[22px] w-auto" title={t("brand")} />
          </Link>
        </div>

        <SearchAndFilters showLabel />

        <nav className="flex items-center justify-end gap-7" aria-label={t("orders")}>
          <Link href="/my-orders" className="flex items-center gap-2 font-sans text-fine font-semibold transition-opacity duration-fast hover:opacity-70">
            <User className="size-5" strokeWidth={1.25} />
            {t("orders")}
          </Link>
          <CartButton showLabel />
        </nav>
      </div>
    </header>
  );
};

export default Navigation;
