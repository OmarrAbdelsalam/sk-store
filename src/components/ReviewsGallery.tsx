"use client";

import { useTranslations } from "next-intl";
import { useState, useEffect } from "react";
import Image from "next/image";
import { Star } from "lucide-react";
import { customerLoveService, CustomerLoveItem } from "@/services/customerLove";

const ReviewsGallery = () => {
  const t = useTranslations("ReviewsGallery");
  const [mounted, setMounted] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [items, setItems] = useState<CustomerLoveItem[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const local = localStorage.getItem('reviews_gallery_cache');
        if (local) return JSON.parse(local);
      } catch (e) {}
    }
    return [];
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setMounted(true);
    customerLoveService.getActiveItems()
      .then(data => {
        setItems(data);
        if (typeof window !== 'undefined') {
          localStorage.setItem('reviews_gallery_cache', JSON.stringify(data));
        }
      })
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, []);

  if (!mounted || (loading && items.length === 0)) {
    return (
      <section className="py-16 bg-[#F9F9F9]">
        <div className="container mx-auto px-4">
          <div className="text-center mb-10">
            <div className="h-8 w-48 bg-muted animate-pulse mx-auto mb-2 rounded" />
            <div className="h-4 w-64 bg-muted animate-pulse mx-auto mt-2 rounded" />
            <div className="w-24 h-[1px] bg-muted mx-auto mt-4" />
          </div>
          <div className="reviews-grid grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
            {Array.from({ length: 8 }).map((_, index) => (
              <div
                key={index}
                className={`relative aspect-square lg:aspect-[4/3] bg-muted animate-pulse rounded-xl ${index >= 6 ? 'hidden lg:block' : ''}`}
              />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (items.length === 0) return null;

  return (
    <section className="py-16 bg-[#F9F9F9]">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-10">
          <h2 className="font-playfair text-3xl md:text-4xl text-gray-900 mb-2">
            {t("title")}
          </h2>
          <p className="text-gray-600 text-base md:text-lg max-w-2xl mx-auto">
            {t("subtitle")}
          </p>
          <div className="w-24 h-[1px] bg-black mx-auto mt-4"></div>
        </div>

        {/* Gallery Grid */}
        <div className="reviews-grid grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
          {items.slice(0, 8).map((item, index) => {
            // Mobile (2 cols) reversed: positions 1,4,5 → indices 0,3,4
            const mobileRev = [0, 3, 4].includes(index);
            // Desktop (4 cols) reversed: positions 1,3,6,8 → indices 0,2,5,7
            const desktopRev = [0, 2, 5, 7].includes(index);

            return (
            <div
              key={item.id}
              className={`group relative aspect-square lg:aspect-[4/3] overflow-hidden bg-white rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer ${index >= 6 ? 'hidden lg:block' : ''}`}
              onClick={() => setSelectedIndex(index)}
              {...(mobileRev ? { 'data-mobile-rev': '' } : {})}
              {...(desktopRev ? { 'data-desktop-rev': '' } : {})}
            >
              {/* Image */}
              <div className="relative w-full h-full">
                <Image
                  src={item.image_url}
                  alt={`Review by ${item.customer_name || "customer"}`}
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-500"
                  sizes="(max-width: 768px) 50vw, 25vw"
                />
              </div>

              {/* Review Overlay */}
              <div className="review-overlay absolute inset-0 bg-black/60 flex flex-col items-center justify-center p-3 text-white">
                <div className="flex gap-0.5 mb-2">
                  {Array.from({ length: item.rating ?? 5 }).map((_, i) => (
                    <Star key={i} className="w-3 h-3 md:w-4 md:h-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                {item.review_text && (
                  <p className="text-xs md:text-sm font-medium text-center line-clamp-2">
                    {item.review_text}
                  </p>
                )}
                {item.customer_name && (
                  <p className="text-xs text-gray-300 mt-1">- {item.customer_name}</p>
                )}
              </div>
            </div>
            );
          })}
        </div>

        {/* CTA */}
        <div className="text-center mt-12">
          <p className="text-gray-700 text-lg mb-4 font-medium">{t("shareYours")}</p>
          <p className="text-gray-500 text-sm">
            {t("tagUs")} <span className="font-semibold">@skbags</span>
          </p>
        </div>
      </div>

      {/* Lightbox Modal */}
      {selectedIndex !== null && (
        <div
          className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4"
          onClick={() => setSelectedIndex(null)}
        >
          <div className="relative max-w-4xl w-full" onClick={(e) => e.stopPropagation()}>
            {/* Image */}
            <div className="relative w-full aspect-square mb-4">
              <Image
                src={items[selectedIndex].image_url}
                alt={`Review by ${items[selectedIndex].customer_name || "customer"}`}
                fill
                className="object-contain rounded-lg"
                sizes="(max-width: 1024px) 100vw, 1024px"
              />
            </div>

            {/* Review Info */}
            <div className="text-center text-white">
              <div className="flex justify-center gap-1 mb-2">
                {Array.from({ length: items[selectedIndex].rating ?? 5 }).map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              {items[selectedIndex].review_text && (
                <p className="text-lg mb-1">{items[selectedIndex].review_text}</p>
              )}
              {items[selectedIndex].customer_name && (
                <p className="text-gray-400">- {items[selectedIndex].customer_name}</p>
              )}
            </div>

            {/* Navigation */}
            <button
              className="absolute left-4 top-1/2 -translate-y-1/2 text-white bg-black/50 hover:bg-black/70 rounded-full p-3 transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                setSelectedIndex((selectedIndex - 1 + items.length) % items.length);
              }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            <button
              className="absolute right-4 top-1/2 -translate-y-1/2 text-white bg-black/50 hover:bg-black/70 rounded-full p-3 transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                setSelectedIndex((selectedIndex + 1) % items.length);
              }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>

            {/* Close */}
            <button
              className="absolute top-4 right-4 text-white bg-black/50 hover:bg-black/70 rounded-full p-2 transition-colors"
              onClick={() => setSelectedIndex(null)}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </section>
  );
};

export default ReviewsGallery;
