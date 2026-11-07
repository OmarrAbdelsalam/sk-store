"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "@/components/ui/carousel";

export type SlideData = {
  /** Small line above the title. */
  eyebrow?: string;
  title: string;
  description: string;
  desktopImage: string;
  /** Optional second desktop photo: the hero splits into two halves. */
  desktopImage2?: string;
  /** object-position for each desktop half, so the crop lands on the bag. */
  desktopPositions?: [string, string];
  mobileMedia: string;
  mobileIsVideo: boolean;
  buttonText: string;
  buttonLink: string;
  mobileButtonLink: string;
};

export default function HeroCarousel({ slides }: { slides: SlideData[] }) {
  const [api, setApi] = useState<CarouselApi>();
  const [selectedIndex, setSelectedIndex] = useState(0);
  const isMultiple = slides.length > 1;

  useEffect(() => {
    if (!api || !isMultiple) return;

    const onSelect = () => {
      setSelectedIndex(api.selectedScrollSnap());
    };

    api.on("select", onSelect);
    
    // Set initial index
    onSelect();

    const interval = setInterval(() => {
      if (api.canScrollNext()) {
        api.scrollNext();
      } else {
        api.scrollTo(0);
      }
    }, 5000);

    return () => {
      clearInterval(interval);
      api.off("select", onSelect);
    };
  }, [api, isMultiple]);

  return (
    <Carousel
      setApi={setApi}
      opts={{ loop: isMultiple, watchDrag: isMultiple }}
      className="w-full h-full group"
    >
      <CarouselContent className="h-full ml-0">
        {slides.map((slide, index) => (
          <CarouselItem
            key={index}
            className="pl-0 basis-full h-[88svh] min-h-[520px] lg:h-screen lg:min-h-[640px]"
          >
            {/* Hero — DESIGN_SYSTEM.md › Page anatomy (3): full-bleed media,
                centered light serif title, overlay button. */}
            <div className="relative h-full w-full overflow-hidden bg-beige">
              {slide.mobileIsVideo ? (
                <video
                  src={slide.mobileMedia}
                  autoPlay
                  muted
                  loop
                  playsInline
                  preload="metadata"
                  // @ts-expect-error fetchPriority not yet in React types
                  fetchPriority={index === 0 ? "high" : "auto"}
                  className="absolute inset-0 h-full w-full object-cover lg:hidden"
                />
              ) : (
                <Image
                  src={slide.mobileMedia}
                  alt={slide.title}
                  fill
                  priority={index === 0}
                  className="object-cover object-center lg:hidden"
                  sizes="100vw"
                />
              )}
              {slide.desktopImage2 ? (
                <div className="absolute inset-0 hidden grid-cols-2 gap-tile lg:grid">
                  {[slide.desktopImage, slide.desktopImage2].map((src, i) => (
                    <div key={src} className="relative h-full overflow-hidden">
                      <Image
                        src={src}
                        alt={i === 0 ? slide.title : ""}
                        fill
                        priority={index === 0}
                        className="object-cover"
                        style={{ objectPosition: slide.desktopPositions?.[i] ?? "center" }}
                        sizes="50vw"
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <Image
                  src={slide.desktopImage}
                  alt={slide.title}
                  fill
                  priority={index === 0}
                  className="hidden object-cover object-center lg:block"
                  sizes="100vw"
                />
              )}
              <div className="absolute inset-0 bg-scrim" aria-hidden />
              <div className="absolute inset-0 bg-scrim-center" aria-hidden />
              <div className="absolute inset-x-0 top-0 h-[190px] bg-scrim-top" aria-hidden />
              
              <div className="relative z-10 flex h-full flex-col items-center justify-center px-gutter text-center">
                {slide.eyebrow && <p className="ds-label ds-on-image mb-3">{slide.eyebrow}</p>}
                {index === 0 ? (
                  <h1 className="ds-display-lg ds-on-image mb-8 max-w-3xl">{slide.title}</h1>
                ) : (
                  <h2 className="ds-display-lg ds-on-image mb-8 max-w-3xl">{slide.title}</h2>
                )}
                <Button asChild variant="overlay" className="h-button-overlay">
                  <Link href={slide.buttonLink}>{slide.buttonText || "Shop now"}</Link>
                </Button>
              </div>
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>

      {isMultiple && (
        <div className="absolute bottom-6 start-1/2 z-20 flex -translate-x-1/2 items-center gap-2 rtl:translate-x-1/2">
          {slides.map((_, index) => (
            <button
              key={index}
              className="h-px w-6 bg-white/40 transition-colors duration-fast hover:bg-white/80 aria-selected:bg-background"
              aria-selected={selectedIndex === index}
              onClick={() => api?.scrollTo(index)}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </Carousel>
  );
}
