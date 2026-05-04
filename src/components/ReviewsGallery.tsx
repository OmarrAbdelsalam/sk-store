"use client";

import { useTranslations } from "next-intl";
import { useState, useEffect } from "react";
import Image from "next/image";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

// Mock data - replace with actual API call
const reviewImages = [
  {
    id: 1,
    image: "/discover1.webp",
    customerName: "Sarah Ahmed",
    rating: 5,
    comment: "Amazing quality and beautiful design!"
  },
  {
    id: 2,
    image: "/discover2.webp",
    customerName: "Nour Hassan",
    rating: 5,
    comment: "Love the handmade details"
  },
  {
    id: 3,
    image: "/hero.webp",
    customerName: "Layla Mohamed",
    rating: 5,
    comment: "Perfect for everyday use"
  },
  {
    id: 4,
    image: "/footer.webp",
    customerName: "Mona Ali",
    rating: 5,
    comment: "Exceeded my expectations"
  },
  {
    id: 5,
    image: "/discover1.webp",
    customerName: "Hana Khaled",
    rating: 5,
    comment: "Absolutely gorgeous!"
  },
  {
    id: 6,
    image: "/discover2.webp",
    customerName: "Yasmin Omar",
    rating: 5,
    comment: "Best purchase ever"
  }
];

const ReviewsGallery = () => {
  const t = useTranslations("ReviewsGallery");
  const [mounted, setMounted] = useState(false);
  const [selectedImage, setSelectedImage] = useState<number | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="font-playfair text-3xl md:text-4xl text-gray-900 mb-3">
            {t('title')}
          </h2>
          <p className="text-gray-600 text-base md:text-lg max-w-2xl mx-auto">
            {t('subtitle')}
          </p>
          <div className="w-24 h-[1px] bg-black mx-auto mt-4"></div>
        </div>

        {/* Gallery Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-4">
          {reviewImages.map((review, index) => (
            <div
              key={review.id}
              className="group relative aspect-square overflow-hidden bg-white rounded-lg shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer"
              onClick={() => setSelectedImage(index)}
            >
              {/* Image */}
              <div className="relative w-full h-full">
                <Image
                  src={review.image}
                  alt={`Review by ${review.customerName}`}
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-500"
                  sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 16vw"
                />
              </div>

              {/* Overlay on hover */}
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center p-3 text-white">
                <div className="flex gap-0.5 mb-2">
                  {Array.from({ length: review.rating }).map((_, i) => (
                    <Star key={i} className="w-3 h-3 md:w-4 md:h-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-xs md:text-sm font-medium text-center line-clamp-2">
                  {review.comment}
                </p>
                <p className="text-xs text-gray-300 mt-1">
                  - {review.customerName}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center mt-12">
          <p className="text-gray-700 text-lg mb-4 font-medium">
            {t('shareYours')}
          </p>
          <p className="text-gray-500 text-sm">
            {t('tagUs')} <span className="font-semibold">@skbags</span>
          </p>
        </div>
      </div>

      {/* Lightbox Modal */}
      {selectedImage !== null && (
        <div
          className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative max-w-4xl w-full" onClick={(e) => e.stopPropagation()}>
            {/* Image Container */}
            <div className="relative w-full aspect-square mb-4">
              <Image
                src={reviewImages[selectedImage].image}
                alt={`Review by ${reviewImages[selectedImage].customerName}`}
                fill
                className="object-contain rounded-lg"
                sizes="(max-width: 1024px) 100vw, 1024px"
              />
            </div>

            {/* Review Info */}
            <div className="text-center text-white">
              <div className="flex justify-center gap-1 mb-2">
                {Array.from({ length: reviewImages[selectedImage].rating }).map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <p className="text-lg mb-1">{reviewImages[selectedImage].comment}</p>
              <p className="text-gray-400">- {reviewImages[selectedImage].customerName}</p>
            </div>

            {/* Navigation Buttons */}
            <button
              className="absolute left-4 top-1/2 -translate-y-1/2 text-white bg-black/50 hover:bg-black/70 rounded-full p-3 transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                setSelectedImage((selectedImage - 1 + reviewImages.length) % reviewImages.length);
              }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            <button
              className="absolute right-4 top-1/2 -translate-y-1/2 text-white bg-black/50 hover:bg-black/70 rounded-full p-3 transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                setSelectedImage((selectedImage + 1) % reviewImages.length);
              }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>

            {/* Close Button */}
            <button
              className="absolute top-4 right-4 text-white bg-black/50 hover:bg-black/70 rounded-full p-2 transition-colors"
              onClick={() => setSelectedImage(null)}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>
      )}
    </section>
  );
};

export default ReviewsGallery;
