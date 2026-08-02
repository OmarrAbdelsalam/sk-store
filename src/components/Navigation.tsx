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

const Navigation = () => {
  const t = useTranslations();
  const locale = useLocale();
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);

  // Transparent only on homepage at scroll point 0
  const isHome = pathname === '/' || pathname === `/${locale}` || pathname === `/${locale}/`;
  const isTransparent = isHome && !isScrolled;

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header className="w-full sticky top-0 z-50 transition-all duration-300">
      {/* Main Navigation */}
      <div className="pointer-events-auto w-full">
        <div 
          className={`h-16 md:h-20 flex items-center px-4 sm:px-6 lg:px-4 xl:px-8 2xl:px-12 transition-all duration-300 ${
            isTransparent 
              ? "bg-white border-b border-gray-900/10 shadow-[0_2px_12px_-4px_rgba(0,0,0,0.08)] lg:bg-transparent lg:border-transparent lg:shadow-none"
              : "bg-white/95 backdrop-blur-md border-b border-gray-900/10 shadow-[0_2px_12px_-4px_rgba(0,0,0,0.08)]"
          }`}
        >
          {/* Mobile & Tablet Layout - يظهر حتى مقاس lg (768px وأصغر) */}
          <div className="lg:hidden w-full relative flex items-center justify-between">
            {/* Left: Menu Button */}
            <div className="flex-1 flex justify-start items-center">
              <MobileMenu />
            </div>
            
            {/* Center: Logo */}
            <div className="flex-1 flex justify-center items-center">
              <Link href="/" className="hover:opacity-70 transition-opacity duration-300">
                <Image src="/sk.png" alt="SK Bags" width={110} height={40} className="h-9 sm:h-10 w-auto object-contain" priority />
              </Link>
            </div>
            
            {/* Right: Search & Cart */}
            <div className="flex-1 flex justify-end items-center gap-1 sm:gap-2">
              <SearchAndFilters />
              <CartButton isMobile={true} />
            </div>
          </div>

          {/* Desktop Layout - يظهر على الشاشات من lg (1024px) وما فوق */}
          <div className="hidden lg:flex items-center justify-between w-full max-w-[1440px] mx-auto gap-2">
            {/* Logo + Separator + Categories */}
            <div className="flex items-center gap-3 lg:gap-3.5 xl:gap-6 2xl:gap-8 min-w-0 shrink">
              <Link href="/" className="hover:opacity-70 transition-opacity duration-300 shrink-0">
                <Image 
                  src="/sk.png" 
                  alt="SK Bags" 
                  width={130} 
                  height={44} 
                  className={`h-9 xl:h-10 2xl:h-11 w-auto object-contain transition-all duration-300 ${
                    isTransparent ? "invert brightness-200" : ""
                  }`} 
                  priority 
                />
              </Link>
              <div className={`w-px h-7 xl:h-8 transition-colors duration-300 shrink-0 ${isTransparent ? "bg-white/25" : "bg-black/10"}`}></div>
              <DesktopMenu isTransparent={isTransparent} />
            </div>

            {/* Right Icons */}
            <div className="flex items-center space-x-1.5 xl:space-x-3 shrink-0 ml-2">
              <SearchAndFilters isTransparent={isTransparent} />
              
              <div className={`w-px h-5 mx-0.5 xl:mx-1 transition-colors duration-300 ${isTransparent ? "bg-white/25" : "bg-black/10"}`}></div>
              
              <CartButton isMobile={false} isTransparent={isTransparent} />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navigation;
