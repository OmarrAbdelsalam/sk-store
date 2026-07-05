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
    <header className={`w-full sticky top-0 z-50`}>
      {/* Main Navigation */}
      <div className={`pointer-events-auto w-full`}>
        <div className={`h-16 md:h-20 flex items-center bg-white border-b border-[#2D2A26]/10 px-4 md:px-12 shadow-[0_2px_12px_-4px_rgba(0,0,0,0.08)]`}>
          {/* Mobile Layout - يظهر فقط على الموبايل */}
          <div className="md:hidden w-full relative flex items-center justify-between">
            {/* Left: Menu Button */}
            <div className="flex-1 flex justify-start">
              <MobileMenu />
            </div>
            
            {/* Center: Logo */}
            <div className="flex-1 flex justify-center">
              <Link href="/" className="hover:opacity-70 transition-opacity duration-300">
                <Image src="/SK_Logo.svg" alt="SK Bags" width={90} height={36} className="h-9 w-auto mix-blend-multiply" priority />
              </Link>
            </div>
            
            {/* Right: Cart */}
            <div className="flex-1 flex justify-end">
              <CartButton isMobile={true} />
            </div>
          </div>

        {/* Desktop Layout - يظهر فقط على الكمبيوتر */}
        <div className="hidden md:flex items-center justify-between w-full max-w-[1400px] mx-auto">
          {/* Logo + Separator + Categories */}
          <div className="flex items-center gap-10">
            <Link href="/" className="hover:opacity-70 transition-opacity duration-300">
              <Image src="/SK_Logo.svg" alt="SK Bags" width={130} height={44} className="h-11 w-auto mix-blend-multiply" priority />
            </Link>
            <div className="w-px h-8 bg-[#2D2A26]/10"></div>
            <DesktopMenu />
          </div>

          {/* Right Icons + Language Switcher */}
          <div className="flex items-center space-x-4">
            <SearchAndFilters />
            
            <div className="w-px h-5 bg-[#2D2A26]/10 mx-2"></div>
            
            <CartButton isMobile={false} />
            {/* Language switcher hidden for now */}
          </div>
        </div>
        </div>
      </div>
    </header>
  );
};

export default Navigation;