"use client";

import { useTranslations, useLocale } from "next-intl";
import { Link, useRouter } from "@/i18n/navigation";
import Image from "next/image";
import { useCategories } from "@/hooks/useCategories";

const CategoryBanner = ({ 
  title, 
  image, 
  href, 
  onClick,
  className = "" 
}: { 
  title: string; 
  image: string; 
  href: string;
  onClick?: () => void;
  className?: string;
}) => {
  const t = useTranslations("Banners");
  
  // All images are either Supabase Storage URLs (https://) or local public files (/)
  const isExternalUrl = image?.startsWith('http');

  return (
    <div 
      className={`relative group overflow-hidden ${className} h-full w-full rounded-2xl cursor-pointer`}
      onClick={onClick}
    >
      <div className="absolute inset-0 bg-gray-200">
        {isExternalUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={image}
            alt={title}
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
        ) : (
          <Image
            src={image || '/hero.webp'}
            alt={title}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-105"
          />
        )}
        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors duration-300" />
      </div>
      
      <div className="relative z-10 h-full flex flex-col items-center justify-center text-center p-4">
        <h3 className="font-playfair text-2xl md:text-3xl lg:text-4xl text-white drop-shadow-md">
          {title}
        </h3>
      </div>
    </div>
  );
};

export const BagShowcase = () => {
  // Keeping BagShowcase as is or similar if needed, but the main request is for dynamic categories
  return null; 
};

export const ClothingShowcase = () => {
  const { categories, isLoading } = useCategories();
  const locale = useLocale();
  const router = useRouter();

  if (isLoading || categories.length === 0) return null;

  // Filter out General/عام categories and take first 3
  const filteredCategories = categories.filter(cat => {
    const arabicName = (cat.arabicName || '').toLowerCase();
    const englishName = (cat.englishName || '').toLowerCase();
    
    // Filter out categories with names like "general", "عام", etc.
    const isGeneral = 
      arabicName.includes('عام') || 
      arabicName.includes('عامة') ||
      englishName.includes('general') ||
      englishName.includes('misc') ||
      englishName.includes('other');
    
    return !isGeneral;
  });
  
  const displayCategories = filteredCategories.slice(0, 3);

  const handleCategoryClick = (cat: any) => {
    const categoryName = locale === 'ar' ? cat.arabicName : cat.englishName;
    if (!categoryName) return;
    
    const slug = categoryName.toLowerCase().replace(/\s+/g, '-');
    if (typeof window !== 'undefined') {
      sessionStorage.setItem(`category_${slug}`, cat.key);
    }
    router.push(`/products?category=${encodeURIComponent(slug)}`);
  };

  const getHref = (cat: any) => {
    const categoryName = locale === 'ar' ? cat.arabicName : cat.englishName;
    const slug = categoryName ? categoryName.toLowerCase().replace(/\s+/g, '-') : '';
    return `/products?category=${encodeURIComponent(slug)}`;
  };

  const getTitle = (cat: any) => locale === 'ar' ? cat.arabicName : cat.englishName;
  const getImageUrl = (cat: any) => {
    if (!cat.imageUrl) return "/hero.webp";
    // If it starts with /, it's a Dropbox path - return as-is
    if (cat.imageUrl.startsWith('/')) return cat.imageUrl;
    // If it's already a full URL, return as-is
    if (cat.imageUrl.startsWith('http')) return cat.imageUrl;
    // Otherwise return placeholder
    return "/hero.webp";
  };

  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        <div className="flex flex-row gap-3 h-[300px] md:h-[400px]">
          {displayCategories.length >= 3 ? (
            <>
              {/* Big one (Left column) */}
              <div className="w-1/2 h-full">
                <CategoryBanner
                  title={getTitle(displayCategories[0])}
                  image={getImageUrl(displayCategories[0])}
                  href={getHref(displayCategories[0])}
                  onClick={() => handleCategoryClick(displayCategories[0])}
                />
              </div>
              {/* Two small ones (Right column) */}
              <div className="w-1/2 flex flex-col gap-3 h-full">
                <div className="flex-1 overflow-hidden">
                  <CategoryBanner
                    title={getTitle(displayCategories[1])}
                    image={getImageUrl(displayCategories[1])}
                    href={getHref(displayCategories[1])}
                    onClick={() => handleCategoryClick(displayCategories[1])}
                    className="h-full"
                  />
                </div>
                <div className="flex-1 overflow-hidden">
                  <CategoryBanner
                    title={getTitle(displayCategories[2])}
                    image={getImageUrl(displayCategories[2])}
                    href={getHref(displayCategories[2])}
                    onClick={() => handleCategoryClick(displayCategories[2])}
                    className="h-full"
                  />
                </div>
              </div>
            </>
          ) : (
            /* Fallback for 1-2 categories */
            displayCategories.map((cat) => (
              <div key={cat.key} className="flex-1">
                <CategoryBanner
                  title={getTitle(cat)}
                  image={getImageUrl(cat)}
                  href={getHref(cat)}
                  onClick={() => handleCategoryClick(cat)}
                />
              </div>
            ))
          )}
        </div>
      </div>
    </section>
  );
};

