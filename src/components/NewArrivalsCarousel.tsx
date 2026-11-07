"use client";

import { useCallback, useEffect, useState } from "react";
import { Link } from "@/i18n/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import useEmblaCarousel from "embla-carousel-react";
import { cn } from "@/lib/utils";
import ProductCard from "@/components/product/ProductCard";
import { useLocale } from "next-intl";
import type { ProductApi } from "@/api/products";
import { formatPrice } from "@/lib/price";

interface NewArrivalsCarouselProps {
  products: ProductApi[];
  viewAllText: string;
}

const NewArrivalsCarousel = ({ products, viewAllText }: NewArrivalsCarouselProps) => {
  const locale = useLocale();
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: "start",
    loop: false,
    skipSnaps: false,
    dragFree: true,
  });

  const [selectedIndex, setSelectedIndex] = useState(0);
  const [scrollSnaps, setScrollSnaps] = useState<number[]>([]);
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(true);

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

  // Map ProductApi to the format ProductCard expects
  const mappedProducts = products.map((p) => {
    const mainImage =
      p.photos?.find((ph) => ph.isMain)?.imageUrl ||
      p.photos?.[0]?.imageUrl ||
      "/placeholder-product.jpg";

    return {
      id: p.id,
      name: locale === "ar" ? p.nameAr : p.nameEn,
      nameAr: p.nameAr,
      nameEn: p.nameEn,
      price: formatPrice(p.price, locale),
      priceNum: p.price,
      image: mainImage,
      description:
        locale === "ar"
          ? p.descriptionAr || p.descriptionEn || ""
          : p.descriptionEn || p.descriptionAr || "",
      gender: "unisex",
      availableColors:
        p.colors?.map((c) => ({
          name:
            locale === "ar"
              ? c.colorNameAr || c.colorNameEn || ""
              : c.colorNameEn || c.colorNameAr || "",
          hex: c.hexa || "#000000",
        })) || [],
      raw: p,
    };
  });

  const isAr = locale === "ar";

  return (
    <>
      {/* Carousel - renders products immediately, embla enhances after hydration */}
      <div className="relative">
        <div className="overflow-hidden" ref={emblaRef}>
          <div className="flex -ms-tile">
            {mappedProducts.map((product, index) => (
              <div
                key={product.id}
                className="min-w-0 flex-[0_0_50%] ps-tile lg:flex-[0_0_25%]"
              >
                <ProductCard
                  product={product as any}
                  index={index}
                  showNewBadge={true}
                  hideStockBadge={true}
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

      {/* Pagination (phones only — desktop shows the 4-up row with arrows) */}
      {scrollSnaps.length > 1 && (
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
      )}

      {/* View all — same as Best Sellers */}
      {viewAllText && (
        <div className="ds-gutter mt-8 text-center">
          <Button asChild variant="outline">
            <Link href="/products?badge=new_arrival">{viewAllText}</Link>
          </Button>
        </div>
      )}
    </>
  );
};

export default NewArrivalsCarousel;


