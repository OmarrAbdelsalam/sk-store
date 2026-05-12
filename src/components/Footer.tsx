"use client";

import { Instagram, Facebook } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslations, useLocale } from 'next-intl';
import { useCategories } from "@/hooks/useCategories";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

const Footer = () => {
  const t = useTranslations();
  const locale = useLocale();
  const router = useRouter();
  const { categories } = useCategories();
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);

  const goToCategory = (id: string, name: string) => {
    const slug = name.toLowerCase().replace(/\s+/g, '-');
    sessionStorage.setItem(`category_${slug}`, id);
    router.push(`/${locale}?category=${encodeURIComponent(slug)}`);
  };

  return (
    <footer className="bg-primary text-primary-foreground py-16">
      <div className="container mx-auto px-4">
        {/* Newsletter Section */}
        <div className="text-center mb-16">
          <h3 className="font-luxury text-3xl font-bold tracking-widest text-white">
            SK Bags
          </h3>
        </div>
        {/* Footer Links */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Brand & Orders */}
          <div className="space-y-6">
            {/* Brand */}
            <div>
              <div className="mb-4">
                <Image 
                  src="/SK_Logo.svg" 
                  alt="SK Bags Logo" 
                  width={120} 
                  height={40} 
                  className="h-10 w-auto"
                />
              </div>
              <p className="text-primary-foreground text-sm leading-relaxed">
                {t('Footer.brandDesc')}
              </p>
            </div>

            {/* Orders */}
            <div>
              <h5 className="font-semibold mb-4">{t('Footer.orders')}</h5>
              <div className="space-y-2">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-primary-foreground hover:text-white justify-start w-full p-0 h-auto"
                  onClick={() => router.push(`/${locale}/my-orders`)}
                >
                  <span className="text-sm">{t('Footer.myOrders')}</span>
                </Button>
              </div>
            </div>
          </div>
          
          {/* Shop Categories */}
          <div>
            <h5 className="font-semibold mb-4">{t('Footer.shop')}</h5>
            <ul className="space-y-2 text-sm">
              {mounted && categories.map((category) => {
                const categoryName = locale === 'ar' ? category.arabicName : category.englishName;
                return (
                  <li key={category.key}>
                    <button
                      onClick={() => goToCategory(category.key, categoryName)}
                      className={`text-primary-foreground hover:text-white transition-colors w-full ${locale === 'ar' ? 'text-right' : 'text-left'}`}
                    >
                      {categoryName}
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
          
          {/* Contact */}
          <div>
            <h5 className="font-semibold mb-4">{t('Footer.contactUs')}</h5>
            <div className="space-y-2">
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-primary-foreground hover:text-white justify-start w-full p-0 h-auto"
                onClick={() => window.open("https://wa.me/+201501881005", "_blank")}
              >
                <span className="text-sm">{t('Footer.whatsapp')}</span>
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-primary-foreground hover:text-white justify-start w-full p-0 h-auto"
                onClick={() => window.open("https://www.facebook.com/skbags/", "_blank")}
              >
                <span className="text-sm">{t('Footer.facebook')}</span>
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-primary-foreground hover:text-white justify-start w-full p-0 h-auto"
                onClick={() => window.open("https://www.instagram.com/skbags/", "_blank")}
              >
                <span className="text-sm">{t('Footer.instagram')}</span>
              </Button>
            </div>
          </div>

          {/* Footer Image */}
          <div className="flex items-center justify-center md:justify-end">
            <Image 
              src="/footer.webp" 
              alt="Footer decoration" 
              width={300}
              height={450}
              className={`w-full h-auto object-contain ${locale === 'ar' ? 'scale-x-[-1]' : ''}`}
              sizes="(max-width: 768px) 100vw, 25vw"
              loading="lazy"
            />
          </div>
        </div>
        {/* Bottom Section */}
        <div className="border-t border-white/10 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-center md:text-left">
              <p className="text-primary-foreground text-sm">
                © {new Date().getFullYear()} SK Bags. {locale === 'ar' ? 'جميع الحقوق محفوظة.' : 'All rights reserved.'}
              </p>
            </div>
            <div className="flex items-center space-x-6">
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-primary-foreground hover:text-white"
                onClick={() => window.open("https://www.instagram.com/skbags/", "_blank")}
                aria-label="Instagram"
              >
                <Instagram className="h-5 w-5" />
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-primary-foreground hover:text-white"
                onClick={() => window.open("https://www.facebook.com/skbags/", "_blank")}
                aria-label="Facebook"
              >
                <Facebook className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
