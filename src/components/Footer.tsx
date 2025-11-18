"use client";

import { Instagram, Facebook } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslations, useLocale } from 'next-intl';
import { useEffect, useState } from 'react';
import { getCategories, type CategoryOption } from "@/api/categories";
import { useRouter } from "next/navigation";

const Footer = () => {
  const t = useTranslations();
  const locale = useLocale();
  const router = useRouter();
  const [categories, setCategories] = useState<CategoryOption[]>([]);

  useEffect(() => {
    getCategories()
      .then(setCategories)
      .catch(() => setCategories([]));
  }, []);

  const goToCategory = (id: string, name: string) => {
    const slug = name.toLowerCase().replace(/\s+/g, '-');
    sessionStorage.setItem(`category_${slug}`, id);
    router.push(`/?category=${encodeURIComponent(slug)}`);
  };

  return (
    <footer className="bg-primary text-primary-foreground py-16">
      <div className="container mx-auto px-4">
        {/* Newsletter Section */}
        <div className="text-center mb-16">
          <h3 className="font-luxury text-3xl font-medium mb-4">
            {t('Footer.brand')}
          </h3>
        </div>
        {/* Footer Links */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Brand & Orders */}
          <div className="space-y-6">
            {/* Brand */}
            <div>
              <h4 className="font-luxury text-xl font-medium mb-4">{t('Footer.brand')}</h4>
              <p className="text-primary-foreground/80 text-sm leading-relaxed">
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
                  className="text-primary-foreground/80 hover:text-white justify-start w-full p-0 h-auto"
                  onClick={() => router.push('/my-orders')}
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
              {categories.map((category) => {
                const categoryName = locale === 'ar' ? category.arabicName : category.englishName;
                return (
                  <li key={category.key}>
                    <button
                      onClick={() => goToCategory(category.key, categoryName)}
                      className={`text-primary-foreground/80 hover:text-white transition-colors w-full ${locale === 'ar' ? 'text-right' : 'text-left'}`}
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
                className="text-primary-foreground/80 hover:text-white justify-start w-full p-0 h-auto"
                onClick={() => window.open("https://wa.me/+201501881005", "_blank")}
              >
                <span className="text-sm">{t('Footer.whatsapp')}</span>
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-primary-foreground/80 hover:text-white justify-start w-full p-0 h-auto"
                onClick={() => window.open("https://www.facebook.com/housescrub/", "_blank")}
              >
                <span className="text-sm">{t('Footer.facebook')}</span>
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-primary-foreground/80 hover:text-white justify-start w-full p-0 h-auto"
                onClick={() => window.open("https://www.instagram.com/housescrub/", "_blank")}
              >
                <span className="text-sm">{t('Footer.instagram')}</span>
              </Button>
            </div>
          </div>

          {/* Footer Image */}
          <div className="flex items-center justify-center">
            <img 
              src="/footer.jpg" 
              alt="Footer decoration" 
              className={`w-full h-auto object-contain ${locale === 'ar' ? 'scale-x-[-1]' : ''}`}
              style={{ mixBlendMode: 'screen' }}
            />
          </div>
        </div>
        {/* Bottom Section */}
        <div className="border-t border-white/10 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-primary-foreground/60 text-sm mb-4 md:mb-0">
              {t('Footer.copyright')}
            </p>
            <div className="flex items-center space-x-6">
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-primary-foreground/60 hover:text-white"
                onClick={() => window.open("https://www.instagram.com/housescrub/", "_blank")}
              >
                <Instagram className="h-5 w-5" />
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-primary-foreground/60 hover:text-white"
                onClick={() => window.open("https://www.facebook.com/housescrub/", "_blank")}
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