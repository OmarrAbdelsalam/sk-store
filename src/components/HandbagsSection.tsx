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

const HandbagsSection = () => {
  const t = useTranslations("Handbags");
  const locale = useLocale();
  const { products, isLoading: loading } = useProducts();
  const [emblaRef, emblaApi] = useEmblaCarousel({ 
    align: "start",
    loop: false,
    skipSnaps: false,
    dragFree: true
  });

  const [mounted, setMounted] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [scrollSnaps, setScrollSnaps] = useState<number[]>([]);
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(true);

  // Ensure component only renders on client to avoid hydration mismatch
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

  // Don't render until mounted to avoid hydration mismatch
  if (!mounted || (loading && products.length === 0)) {
    return (
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-10">
            <div className="h-8 w-48 bg-muted animate-pulse mx-auto mb-2 rounded" />
            <div className="w-24 h-[1px] bg-muted mx-auto mt-3" />
          </div>
          <div className="overflow-hidden">
            <div className="flex -ml-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex-[0_0_50%] md:flex-[0_0_33.33%] lg:flex-[0_0_25%] pl-4 min-w-0">
                  <div className="space-y-4 animate-pulse">
                    <div className="aspect-[3/4] w-full rounded-lg bg-muted" />
                    <div className="space-y-2">
                      <div className="h-4 bg-muted rounded w-3/4" />
                      <div className="h-4 bg-muted rounded w-1/2" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    );
  }
  
  if (!products || products.length === 0) return null;

  // Filter products by category "Handbag" or similar
  const handbagProducts = products.filter(product => 
    product.category?.toLowerCase().includes('handbag') || 
    product.category?.toLowerCase().includes('حقيبة يد')
  );

  // If no handbag products found, don't render the section
  if (handbagProducts.length === 0) return null;

  // Take up to 8 handbag products
  const displayProducts = handbagProducts.slice(0, 8);

  return (
    <section className="py-16 bg-background">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-10">
          <h2 className="font-playfair text-3xl md:text-4xl text-gray-900 mb-2">
            {t('title')}
          </h2>
          <div className="w-24 h-[1px] bg-black mx-auto mt-3"></div>
        </div>

        {/* Carousel */}
        <div className="relative group">
          <div className="overflow-hidden" ref={emblaRef}>
            <div className="flex -ml-4">
              {displayProducts.map((product, index) => (
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
                index === selectedIndex ? "bg-black w-4" : "bg-gray-300 hover:bg-gray-400"
              )}
              onClick={() => emblaApi?.scrollTo(index)}
            />
          ))}
        </div>

        {/* View All Button */}
        <div className="text-center mt-12">
          <Link href="/products">
            <Button 
              className="px-10 py-6 bg-black text-white hover:bg-gray-800 rounded-none tracking-[0.2em] uppercase text-sm transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-1"
            >
              {t('viewAll')}
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default HandbagsSection;
