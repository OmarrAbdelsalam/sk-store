"use client";

import { useState } from "react";
import Image from "next/image";
import { Star } from "lucide-react";
import { CustomerLoveItem } from "@/services/customerLove";

interface ReviewsGalleryClientProps {
  items: CustomerLoveItem[];
  title: string;
  subtitle: string;
  shareYours: string;
  tagUs: string;
}

const ReviewsGalleryClient = ({ items, title, subtitle, shareYours, tagUs }: ReviewsGalleryClientProps) => {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  if (items.length === 0) return null;

  return (
    <section className="bg-[#F0EBE3] py-12 md:py-16">
      <div className="container mx-auto px-5">
        {/* Header */}
        <div className="text-center mb-10">
          <h2 className="font-sans font-normal text-3xl md:text-4xl text-gray-800 mb-2">
            {title}
          </h2>
          <p className="text-gray-600 text-base md:text-lg max-w-2xl mx-auto">
            {subtitle}
          </p>
          <div className="w-24 h-[2px] bg-[#C2A878] rounded-full mx-auto mt-4"></div>
        </div>

        {/* Gallery Grid */}
        <div className="reviews-grid grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
          {items.slice(0, 8).map((item, index) => {
            const mobileRev = [0, 3, 4].includes(index);
            const desktopRev = [0, 2, 5, 7].includes(index);

            return (
              <div
                key={item.id}
                className={`group relative aspect-square lg:aspect-[4/3] overflow-hidden bg-white rounded shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer ${index >= 6 ? 'hidden lg:block' : ''}`}
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
                    loading="lazy"
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
                    <p className="text-xs text-gray-400 mt-1">- {item.customer_name}</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* CTA */}
        <div className="text-center mt-12">
          <p className="text-gray-700 text-lg mb-4 font-medium">{shareYours}</p>
          <p className="text-gray-500 text-sm">
            {tagUs} <span className="font-semibold">@skbags</span>
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
                <p className="text-gray-500">- {items[selectedIndex].customer_name}</p>
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

export default ReviewsGalleryClient;

