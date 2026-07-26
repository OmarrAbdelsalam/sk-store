"use client";

import { useTranslations, useLocale } from "next-intl";
import { Link } from "@/i18n/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import useEmblaCarousel from "embla-carousel-react";
import { useProducts } from "@/hooks/useProducts";
import { useState, useCallback, useEffect } from "react";
import { cn } from "@/lib/utils";
import ProductCard from "@/components/product/ProductCard";

const BestSellers = () => {
  const t = useTranslations("BestSellers");
  const locale = useLocale();
  const { products, isLoading: loading } = useProducts();
  const [emblaRef, emblaApi] = useEmblaCarousel({ 
    align: "start",
    loop: false,
    skipSnaps: false,
    dragFree: true
  });

  const [selectedIndex, setSelectedIndex] = useState(0);
  const [scrollSnaps, setScrollSnaps] = useState<number[]>([]);
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(true);

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const scrollPrev = useCallback(() => emblaApi && emblaApi.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi && emblaApi.scrollNext(), [emblaApi]);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
    setCanScrollPrev(emblaApi.canScrollPrev());
    setCanScrollNext(emblaApi.canScrollNext());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    setScrollSnaps(emblaApi.scrollSnapList());
    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", onSelect);
  }, [emblaApi, onSelect]);

  // Prevent hydration mismatch
  if (!mounted) return null;

  // Don't render if no data
  if (loading && products.length === 0) {
    return null;
  }
  
  if (!products || products.length === 0) return null;

  // Get best sellers - for now, we'll use the first 8 products
  // In the future, this should be based on actual sales data
  const bestSellers = products.slice(0, 8);

  return (
    <section className="bg-white">
      <div className="container mx-auto px-5">
        {/* Header */}
        <div className="text-center mb-10">
          <h2 className="font-sans font-bold text-3xl md:text-4xl text-gray-900 mb-2">
            {t('title')}
          </h2>
          <div className="w-24 h-1 bg-[#C2A878] mx-auto rounded-full"></div>
        </div>

        {/* Carousel */}
        <div className="relative">
          <div className="overflow-hidden" ref={emblaRef}>
            <div className="flex -ml-4">
              {bestSellers.map((product, index) => (
                <div 
                  key={product.id} 
                  className="flex-[0_0_50%] md:flex-[0_0_33.33%] lg:flex-[0_0_25%] pl-4 min-w-0"
                >
                  <ProductCard 
                    product={product as any} 
                    index={index}
                    showNewBadge={false}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Navigation Arrows */}
          <button
            onClick={scrollPrev}
            className={cn(
              "absolute left-0 top-1/2 -translate-y-1/2 -ml-4 md:-ml-12 z-20 p-2 text-gray-800 hover:text-black transition-colors disabled:opacity-30 disabled:cursor-not-allowed hidden md:block",
              !canScrollPrev && "md:hidden"
            )}
            disabled={!canScrollPrev}
          >
            <ChevronLeft className="w-8 h-8 md:w-10 md:h-10" />
          </button>

          <button
            onClick={scrollNext}
            className={cn(
              "absolute right-0 top-1/2 -translate-y-1/2 -mr-4 md:-mr-12 z-20 p-2 text-gray-800 hover:text-black transition-colors disabled:opacity-30 disabled:cursor-not-allowed hidden md:block",
              !canScrollNext && "md:hidden"
            )}
            disabled={!canScrollNext}
          >
            <ChevronRight className="w-8 h-8 md:w-10 md:h-10" />
          </button>
        </div>

        {/* Pagination Dots */}
        <div className="flex justify-center gap-2 mt-8">
          {scrollSnaps.map((_, index) => (
            <button
              key={index}
              className={cn(
                "w-2 h-2 rounded-full transition-all duration-300",
                index === selectedIndex ? "bg-[#C2A878] w-4" : "bg-gray-300 hover:bg-gray-400"
              )}
              onClick={() => emblaApi?.scrollTo(index)}
            />
          ))}
        </div>

        {/* View All Button */}
        <div className="text-center mt-12">
          <Link href="/products">
            <Button className="px-8 py-3 bg-black text-white hover:bg-[#C2A878] rounded-full tracking-[0.2em] font-sans font-medium uppercase text-xs transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-1">
              {t('viewAll')}
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default BestSellers;




