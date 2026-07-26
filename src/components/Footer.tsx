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
    <footer className="bg-black text-white py-16 mt-12 relative z-20 overflow-hidden">
      <div className="container mx-auto px-6 md:px-10">
        
        {/* Top Section */}
        <div className="flex flex-col items-center justify-center mb-16 text-center space-y-4">
          <h2 className="text-3xl md:text-4xl font-black tracking-widest text-white uppercase">
            SK BAGS
          </h2>
          <p className="text-sm md:text-base font-light text-gray-400 max-w-xl leading-relaxed">
            {t('Footer.brandDesc') || "Handcrafted crochet bags that blend elegance with everyday functionality. Each piece is unique, just like you."}
          </p>
        </div>

        {/* Footer Links & Image */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16 border-t border-white/10 pt-16">
          
          {/* Shop Categories */}
          <div className="flex flex-col items-center md:items-start text-center md:text-start">
            <h5 className="text-sm font-bold mb-6 tracking-widest text-white uppercase">{t('Footer.shop')}</h5>
            <ul className="space-y-3 text-sm">
              {mounted && categories.map((category) => {
                const categoryName = locale === 'ar' ? category.arabicName : category.englishName;
                return (
                  <li key={category.key} className="group">
                    <button
                      onClick={() => goToCategory(category.key, categoryName)}
                      className={`text-gray-200 hover:text-white transition-all duration-300 ${locale === 'ar' ? 'group-hover:-translate-x-2 text-right' : 'group-hover:translate-x-2 text-left'}`}
                    >
                      {categoryName}
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
          
          {/* Orders & Help */}
          <div className="flex flex-col items-center md:items-start text-center md:text-start">
            <h5 className="text-sm font-bold mb-6 tracking-widest text-white uppercase">{t('Footer.orders')}</h5>
            <div className="space-y-3">
              <div className="group">
                <button 
                  className={`text-gray-200 hover:text-white transition-all duration-300 ${locale === 'ar' ? 'group-hover:-translate-x-2 text-right' : 'group-hover:translate-x-2 text-left'}`}
                  onClick={() => router.push(`/${locale}/my-orders`)}
                >
                  {t('Footer.myOrders')}
                </button>
              </div>
            </div>
          </div>
          
          {/* Contact */}
          <div className="flex flex-col items-center md:items-start text-center md:text-start">
            <h5 className="text-sm font-bold mb-6 tracking-widest text-white uppercase">{t('Footer.contactUs')}</h5>
            <div className="space-y-3">
              <div className="group">
                <button 
                  className={`text-gray-200 hover:text-white transition-all duration-300 ${locale === 'ar' ? 'group-hover:-translate-x-2 text-right' : 'group-hover:translate-x-2 text-left'}`}
                  onClick={() => window.open("https://wa.me/+201501881005", "_blank")}
                >
                  {t('Footer.whatsapp')}
                </button>
              </div>
              <div className="group">
                <button 
                  className={`text-gray-200 hover:text-white transition-all duration-300 ${locale === 'ar' ? 'group-hover:-translate-x-2 text-right' : 'group-hover:translate-x-2 text-left'}`}
                  onClick={() => window.open("https://www.facebook.com/skbags/", "_blank")}
                >
                  {t('Footer.facebook')}
                </button>
              </div>
              <div className="group">
                <button 
                  className={`text-gray-200 hover:text-white transition-all duration-300 ${locale === 'ar' ? 'group-hover:-translate-x-2 text-right' : 'group-hover:translate-x-2 text-left'}`}
                  onClick={() => window.open("https://www.instagram.com/skbags/", "_blank")}
                >
                  {t('Footer.instagram')}
                </button>
              </div>
            </div>
          </div>

          {/* 4th Column: Footer Image */}
          <div className="flex flex-col items-center md:items-start text-center md:text-start mt-8 md:mt-0">
            <div className="relative w-full h-[250px] sm:h-[300px] md:h-full md:min-h-[160px] overflow-hidden opacity-90 hover:opacity-100 transition-opacity duration-300">
              <Image 
                src="/footer.webp" 
                alt="SK Bags Collection"
                fill
                className="object-cover object-center"
              />
            </div>
          </div>

        </div>

        {/* Bottom Section */}
        <div className="border-t border-white/10 pt-8 pb-4">
          <div className="flex flex-col-reverse md:flex-row justify-between items-center gap-6">
            <div className="text-center md:text-left">
              <p className="text-white/80 text-sm tracking-wide">
                © {new Date().getFullYear()} SK Bags. {locale === 'ar' ? 'جميع الحقوق محفوظة.' : 'All rights reserved.'}
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <button 
                className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white hover:bg-white hover:text-black hover:scale-110 transition-all duration-300"
                onClick={() => window.open("https://www.instagram.com/skbags/", "_blank")}
                aria-label="Instagram"
              >
                <Instagram className="h-4 w-4" />
              </button>
              <button 
                className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white hover:bg-white hover:text-black hover:scale-110 transition-all duration-300 ml-4"
                onClick={() => window.open("https://www.facebook.com/skbags/", "_blank")}
                aria-label="Facebook"
              >
                <Facebook className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
