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
import { ProductCardSkeleton } from "@/components/skeletons";

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

  const isAr = locale === "ar";

  // Until the products are in, hold the space with the same 4-up card
  // skeleton so the page doesn't jump when the row arrives.
  if (!mounted || (loading && products.length === 0)) {
    return (
      <section className="bg-background py-section lg:py-section-lg" aria-busy="true">
        <div className="mx-auto mb-8 h-7 w-48 animate-pulse bg-gray-100 lg:mb-10" />
        <div className="grid animate-pulse grid-cols-2 gap-x-tile lg:grid-cols-4">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className={i > 1 ? "hidden lg:block" : ""}>
              <ProductCardSkeleton />
            </div>
          ))}
        </div>
      </section>
    );
  }
  
  if (!products || products.length === 0) return null;

  // Get best sellers - filter by best_seller badge
  // Fallback to latest products if none have the badge
  let bestSellers = products.filter(p => p.raw?.badge === 'best_seller');
  if (bestSellers.length === 0) {
    bestSellers = products.slice(0, 8);
  } else {
    bestSellers = bestSellers.slice(0, 8);
  }

  return (
    <section className="bg-background py-section lg:py-section-lg">
      {/* Header */}
      <h2 className="ds-gutter ds-display-md mb-8 text-center text-ink lg:mb-10">{t('title')}</h2>

      {/* Carousel (full-bleed) */}
      <div className="relative">
        <div className="overflow-hidden" ref={emblaRef}>
          <div className="flex -ms-tile">
            {bestSellers.map((product, index) => (
              <div
                key={product.id}
                className="min-w-0 flex-[0_0_50%] ps-tile lg:flex-[0_0_25%]"
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
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={scrollPrev}
          className={cn(
            "absolute start-0 top-1/2 z-20 hidden -translate-y-1/2 md:inline-flex",
            !canScrollPrev && "md:hidden"
          )}
          disabled={!canScrollPrev}
          aria-label={isAr ? "السابق" : "Previous"}
        >
          <ChevronLeft strokeWidth={1.25} className="rtl:rotate-180" />
        </Button>

        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={scrollNext}
          className={cn(
            "absolute end-0 top-1/2 z-20 hidden -translate-y-1/2 md:inline-flex",
            !canScrollNext && "md:hidden"
          )}
          disabled={!canScrollNext}
          aria-label={isAr ? "التالي" : "Next"}
        >
          <ChevronRight strokeWidth={1.25} className="rtl:rotate-180" />
        </Button>
      </div>

      {/* Pagination */}
      <div className="flex justify-center gap-2 py-3 lg:hidden">
        {scrollSnaps.map((_, index) => (
          <button
            key={index}
            type="button"
            className="py-2"
            onClick={() => emblaApi?.scrollTo(index)}
            aria-label={isAr ? `شريحة ${index + 1}` : `Slide ${index + 1}`}
            aria-current={index === selectedIndex}
          >
            <span
              className={cn(
                "block h-px w-6 transition-colors duration-fast",
                index === selectedIndex ? "bg-ink" : "bg-gray-200 hover:bg-gray-400"
              )}
            />
          </button>
        ))}
      </div>

      {/* View All Button */}
      <div className="ds-gutter mt-8 text-center">
        <Button asChild variant="outline">
          <Link href="/products">{t('viewAll')}</Link>
        </Button>
      </div>
    </section>
  );
};

export default BestSellers;




