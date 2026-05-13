"use client"

import { MobileMenu } from "./navigation/MobileMenu";
import { DesktopMenu } from "./navigation/DesktopMenu";
import { SearchAndFilters } from "./navigation/SearchAndFilters";
import { CartButton } from "./navigation/CartButton";
import { useTranslations, useLocale } from 'next-intl';
import { usePathname } from 'next/navigation';
import { Link } from "@/i18n/navigation";
import { Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import Image from "next/image";

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

const Navigation = () => {
  const t = useTranslations();
  const locale = useLocale();

  return (
    <header className="w-full bg-background border-b border-border sticky top-0 z-50">
      {/* Main Navigation */}
      <div className="container mx-auto px-5 h-14 md:h-16 flex items-center">
        {/* Mobile Layout - يظهر فقط على الموبايل */}
        <div className="md:hidden w-full">
          <div className="flex items-center justify-between">
            {/* Left: Menu Button & Logo */}
            <div className="flex items-center gap-2">
              <MobileMenu />
              <Link href="/" className="hover:opacity-80 transition-opacity">
                <Image src="/SK_Logo.svg" alt="SK Bags" width={80} height={32} className="h-8 w-auto" priority />
              </Link>
            </div>
            
            {/* Right: Icons (Search, User, Heart, Cart) */}
            <div className="flex items-center gap-0.5">
              <SearchAndFilters />
              


              <CartButton isMobile={true} />
            </div>
          </div>
        </div>

        {/* Desktop Layout - يظهر فقط على الكمبيوتر */}
        <div className="hidden md:flex items-center justify-between w-full">
          {/* Logo + Separator + Categories */}
          <div className="flex items-center gap-6">
            <Link href="/" className="hover:opacity-80 transition-opacity">
              <Image src="/SK_Logo.svg" alt="SK Bags" width={120} height={40} className="h-10 w-auto" priority />
            </Link>
            <DesktopMenu />
          </div>

          {/* Right Icons + Language Switcher */}
          <div className="flex items-center space-x-2">
            <SearchAndFilters />
            

            

            
            <CartButton isMobile={false} />
            {/* Language switcher hidden for now */}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navigation;