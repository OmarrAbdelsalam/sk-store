"use client";

import Image from "next/image";
import { useTranslations, useLocale } from "next-intl";

const DiscoverSection = () => {
  const t = useTranslations("DiscoverSection");
  const locale = useLocale();

  return (
    <section className="py-16 bg-background overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <h2 className="font-playfair text-3xl md:text-5xl text-gray-900 mb-4 tracking-tight">
            {t("title")}
          </h2>
          <div className="w-24 h-[1px] bg-black mx-auto mt-3"></div>
        </div>
        
        <div className="grid grid-cols-2 gap-3 md:gap-8">
          <div className="relative aspect-[4/5] overflow-hidden group cursor-pointer shadow-md md:shadow-lg">
            <Image
              src="/discover1.webp"
              alt="Discover 1"
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-110"
              sizes="(max-width: 768px) 50vw, 50vw"
            />
            <div className="absolute inset-0 bg-black/5 group-hover:bg-black/20 transition-colors duration-500"></div>
          </div>
          
          <div className="relative aspect-[4/5] overflow-hidden group cursor-pointer shadow-md md:shadow-lg">
            <Image
              src="/discover2.webp"
              alt="Discover 2"
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-110"
              sizes="(max-width: 768px) 50vw, 50vw"
            />
            <div className="absolute inset-0 bg-black/5 group-hover:bg-black/20 transition-colors duration-500"></div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default DiscoverSection;
