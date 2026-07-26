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
      price: `${p.price} ${locale === "ar" ? "جنيه" : "EGP"}`,
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

  return (
    <>
      {/* Carousel - renders products immediately, embla enhances after hydration */}
      <div className="relative">
        <div className="overflow-hidden" ref={emblaRef}>
          <div className="flex -ml-4">
            {mappedProducts.map((product, index) => (
              <div
                key={product.id}
                className="flex-[0_0_50%] md:flex-[0_0_33.33%] lg:flex-[0_0_25%] pl-4 min-w-0"
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
      {scrollSnaps.length > 1 && (
        <div className="flex justify-center gap-2 mt-8">
          {scrollSnaps.map((_, index) => (
            <button
              key={index}
              className={cn(
                "w-2 h-2 rounded-full transition-all duration-300",
                index === selectedIndex
                  ? "bg-[#C2A878] w-4"
                  : "bg-gray-300 hover:bg-gray-400"
              )}
              onClick={() => emblaApi?.scrollTo(index)}
            />
          ))}
        </div>
      )}

      <div className="text-center mt-12">
        <Link href="/products">
          <Button className="px-8 py-3 bg-black text-white hover:bg-[#C2A878] rounded-full tracking-[0.2em] font-sans font-medium uppercase text-xs transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-1">
            {viewAllText}
          </Button>
        </Link>
      </div>
    </>
  );
};

export default NewArrivalsCarousel;


