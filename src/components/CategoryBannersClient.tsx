"use client";

import { useLocale } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import Image from "next/image";
import type { CategoryOption } from "@/api/categories";

const FALLBACK_COLORS = ["#C94A4A", "#2B8282", "#D48C29", "#4A55A2", "#347952"];

interface CategoryBannerProps {
  title: string;
  image: string | null;
  mobileImage?: string | null;
  colorHex?: string;
  onClick?: () => void;
  className?: string;
}

const CategoryBanner = ({ title, image, mobileImage, colorHex = "#6D5F52", onClick, className = "" }: CategoryBannerProps) => {
  const hasImage = Boolean(image && image !== '/hero.webp');
  const hasMobileImage = Boolean(mobileImage);
  const isExternalUrl = hasImage && image?.startsWith('http');
  const isMobileExternalUrl = hasMobileImage && mobileImage?.startsWith('http');

  return (
    <div
      className={`relative group overflow-hidden ${className} h-full w-full rounded cursor-pointer`}
      onClick={onClick}
    >
      <div 
        className="absolute inset-0 transition-transform duration-700 group-hover:scale-105"
        style={!hasImage && !hasMobileImage ? { backgroundColor: colorHex } : undefined}
      >
        {/* Desktop Image */}
        {hasImage && (
          <div className={`absolute inset-0 ${hasMobileImage ? 'hidden md:block' : ''}`}>
            {isExternalUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={image!}
                alt={title}
                className="absolute inset-0 w-full h-full object-cover"
              />
            ) : (
              <Image
                src={image!}
                alt={title}
                fill
                className="object-cover"
              />
            )}
          </div>
        )}
        {/* Mobile Image */}
        {hasMobileImage && (
          <div className={`absolute inset-0 ${hasImage ? 'block md:hidden' : ''}`}>
            {isMobileExternalUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={mobileImage!}
                alt={title}
                className="absolute inset-0 w-full h-full object-cover"
              />
            ) : (
              <Image
                src={mobileImage!}
                alt={title}
                fill
                className="object-cover"
              />
            )}
          </div>
        )}
      </div>
      
      {/* Overlay on hover only */}
      <div className={`absolute inset-0 transition-colors duration-300 ${hasImage || hasMobileImage ? 'bg-black/0 group-hover:bg-black/10' : 'bg-black/10 group-hover:bg-black/20'}`} />
    </div>
  );
};

interface ClothingShowcaseClientProps {
  categories: CategoryOption[];
  sectionTitle: string;
}

const ClothingShowcaseClient = ({ categories, sectionTitle }: ClothingShowcaseClientProps) => {
  const locale = useLocale();
  const router = useRouter();

  if (categories.length === 0) return null;

  // Filter out General/عام categories and take first 3
  const filteredCategories = categories.filter(cat => {
    const arabicName = (cat.arabicName || '').toLowerCase();
    const englishName = (cat.englishName || '').toLowerCase();

    const isGeneral =
      arabicName.includes('عام') ||
      arabicName.includes('عامة') ||
      englishName.includes('general') ||
      englishName.includes('misc') ||
      englishName.includes('other');

    return !isGeneral;
  });

  const displayCategories = filteredCategories.slice(0, 3);

  const handleCategoryClick = (cat: CategoryOption) => {
    const categoryName = locale === 'ar' ? cat.arabicName : cat.englishName;
    if (!categoryName) return;

    const slug = categoryName.toLowerCase().replace(/\s+/g, '-');
    if (typeof window !== 'undefined') {
      sessionStorage.setItem(`category_${slug}`, cat.key);
    }
    router.push(`/products?category=${encodeURIComponent(slug)}`);
  };

  const getTitle = (cat: CategoryOption) => locale === 'ar' ? cat.arabicName : cat.englishName;
  const getImageUrl = (cat: CategoryOption) => {
    if (!cat.imageUrl) return null;
    if (cat.imageUrl.startsWith('/')) return cat.imageUrl;
    if (cat.imageUrl.startsWith('http')) return cat.imageUrl;
    return null;
  };

  const getMobileImageUrl = (cat: CategoryOption) => {
    if (!cat.mobileImageUrl) return null;
    if (cat.mobileImageUrl.startsWith('/')) return cat.mobileImageUrl;
    if (cat.mobileImageUrl.startsWith('http')) return cat.mobileImageUrl;
    return null;
  };

  return (
    <section>
      <div className="container mx-auto px-5">
        {/* Header */}
        <div className="text-center mb-10">
          <h2 className="font-playfair text-3xl md:text-4xl text-[#2D2A26] mb-2">
            {sectionTitle}
          </h2>
          <div className="w-24 h-[2px] bg-[#C2A878] rounded-full mx-auto mt-3"></div>
        </div>

        <div className="flex flex-row gap-3 h-[300px] md:h-[400px]">
          {displayCategories.length >= 3 ? (
            <>
              {/* Big one (Left column) */}
              <div className="w-1/2 h-full">
                <CategoryBanner
                  title={getTitle(displayCategories[0])}
                  image={getImageUrl(displayCategories[0])}
                  mobileImage={getMobileImageUrl(displayCategories[0])}
                  colorHex={FALLBACK_COLORS[0]}
                  onClick={() => handleCategoryClick(displayCategories[0])}
                />
              </div>
              {/* Two small ones (Right column) */}
              <div className="w-1/2 flex flex-col gap-3 h-full">
                <div className="flex-1 overflow-hidden">
                  <CategoryBanner
                    title={getTitle(displayCategories[1])}
                    image={getImageUrl(displayCategories[1])}
                    mobileImage={getMobileImageUrl(displayCategories[1])}
                    colorHex={FALLBACK_COLORS[1]}
                    onClick={() => handleCategoryClick(displayCategories[1])}
                    className="h-full"
                  />
                </div>
                <div className="flex-1 overflow-hidden">
                  <CategoryBanner
                    title={getTitle(displayCategories[2])}
                    image={getImageUrl(displayCategories[2])}
                    mobileImage={getMobileImageUrl(displayCategories[2])}
                    colorHex={FALLBACK_COLORS[2]}
                    onClick={() => handleCategoryClick(displayCategories[2])}
                    className="h-full"
                  />
                </div>
              </div>
            </>
          ) : (
            displayCategories.map((cat, idx) => (
              <div key={cat.key} className="flex-1">
                <CategoryBanner
                  title={getTitle(cat)}
                  image={getImageUrl(cat)}
                  mobileImage={getMobileImageUrl(cat)}
                  colorHex={FALLBACK_COLORS[idx % FALLBACK_COLORS.length]}
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

export default ClothingShowcaseClient;

