"use client"

import { useIsMobile } from "@/hooks/use-mobile";
import { MobileMenu } from "./navigation/MobileMenu";
import { DesktopMenu } from "./navigation/DesktopMenu";
import { SearchAndFilters } from "./navigation/SearchAndFilters";
import { CartButton } from "./navigation/CartButton";
import { useTranslations, useLocale } from 'next-intl';
import { usePathname } from 'next/navigation';
import { Link } from "@/i18n/navigation";
import { Globe } from "lucide-react";

export const LanguageSwitcher = () => {
  const locale = useLocale();
  const pathname = usePathname();
  const nextLocale = locale === 'ar' ? 'en' : 'ar';
  // إزالة أول جزء إذا كان هو locale
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

const Navigation = () => {
  const isMobile = useIsMobile();
  const t = useTranslations();

  return (
    <header className="w-full bg-background/95 backdrop-blur-sm border-b border-border sticky top-0 z-50">
      {/* Main Navigation */}
      <div className="container mx-auto px-4 py-2 md:py-4">
        <div className="flex items-center justify-between">
          {/* Mobile Layout */}
          {isMobile && (
            <>
              <MobileMenu />
              <div className="flex-1 text-center mr-4">
                <Link href="/" className="font-luxury text-lg font-semibold tracking-wider hover:text-primary transition-colors">
                  {t('Nav.logo')}
                </Link>
              </div>
            </>
          )}

          {/* Desktop Layout: Logo + Separator + Categories */}
          {!isMobile && (
            <div className="flex items-center gap-4">
              <Link href="/" className="font-luxury text-2xl font-semibold tracking-wider hover:text-primary transition-colors">
                {t('Nav.logo')}
              </Link>
              <div className="h-6 w-px bg-border"></div>
              <DesktopMenu />
            </div>
          )}

          {/* Right Icons + Language Switcher */}
          <div className="flex items-center space-x-4">
            {isMobile && <CartButton isMobile={true} />}
            <SearchAndFilters />
            {!isMobile && <CartButton isMobile={false} />}
            {!isMobile && <LanguageSwitcher />}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navigation;