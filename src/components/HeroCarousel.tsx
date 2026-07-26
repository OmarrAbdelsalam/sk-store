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
  title: string;
  description: string;
  desktopImage: string;
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
      className="w-full h-full"
    >
      <CarouselContent className="h-full ml-0">
        {slides.map((slide, index) => (
          <CarouselItem key={index} className="pl-0 basis-full h-[calc(100svh-101px)] lg:h-auto lg:aspect-video">
            <div className="relative h-full w-full overflow-hidden bg-white">
              {/* Mobile/Tablet Layout */}
              <div className="lg:hidden relative h-full w-full">
                {/* Background Media */}
                <div className="absolute inset-0">
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
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                  ) : (
                    <Image
                      src={slide.mobileMedia}
                      alt={slide.title}
                      fill
                      priority={index === 0}
                      className="object-cover object-center"
                      sizes="100vw"
                    />
                  )}
                  <div className="absolute inset-0 bg-black/20" />
                </div>

                {/* Bottom Gradient Overlay for text readability */}
                <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/80 via-black/40 to-transparent pointer-events-none" />

                {/* Content Overlay */}
                <div className="relative z-10 h-full flex flex-col justify-end pb-12 px-6">
                  <div className="w-full flex flex-col items-center text-center animate-slide-up space-y-4">
                    
                    <div className="space-y-2">
                      <h2 className="font-sans font-bold text-3xl md:text-4xl font-bold text-white tracking-wide drop-shadow-md">
                        {slide.title}
                      </h2>
                      {slide.description && (
                        <p className="text-white/90 text-sm md:text-base font-medium max-w-xs mx-auto drop-shadow-sm">
                          {slide.description}
                        </p>
                      )}
                    </div>
                    
                    <Link href={slide.mobileButtonLink} className="w-full max-w-sm mt-4 block">
                      <Button
                        className="w-full h-12 bg-white text-black hover:bg-[#C2A878] hover:text-white rounded-full tracking-widest uppercase text-sm font-bold transition-colors duration-300 shadow-xl"
                      >
                        {slide.buttonText || "SHOP NOW"}
                      </Button>
                    </Link>
                  </div>
                </div>


              </div>

              {/* Desktop Full-Width Layout */}
              <div className="hidden lg:block relative h-full w-full">
                {/* Full-width background image */}
                <Image
                  src={slide.desktopImage}
                  alt={slide.title}
                  fill
                  priority={index === 0}
                  className="object-cover object-center"
                  sizes="100vw"
                />

                {/* Dark overlay for text readability */}
                <div className="absolute inset-0 bg-black/35" />

                {/* Bottom gradient */}
                <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/60 to-transparent pointer-events-none" />

                {/* Text content overlay - center left */}
                <div className="relative z-10 h-full flex flex-col items-start justify-center px-16">
                  <div className="max-w-xl space-y-6 text-left">
                    <h1 className="font-sans text-5xl md:text-7xl text-white font-bold leading-tight drop-shadow-lg">
                      {slide.title}
                    </h1>
                    <p className="text-white/90 text-lg md:text-xl font-light tracking-wide leading-relaxed drop-shadow-md">
                      {slide.description}
                    </p>
                    <div className="pt-2">
                      <Link href={slide.buttonLink}>
                        <Button className="px-10 py-5 min-h-[48px] bg-white text-gray-900 hover:bg-[#C2A878] hover:text-white rounded-full tracking-[0.2em] uppercase text-xs font-bold transition-all duration-300 shadow-xl hover:shadow-2xl hover:-translate-y-1">
                          {slide.buttonText || "SHOP NOW"}
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>
      
      {/* Dots Indicator - only shown when multiple slides */}
      {isMultiple && (
        <div className="absolute bottom-6 lg:bottom-10 left-1/2 transform -translate-x-1/2 flex items-center justify-center gap-2 z-20">
          {slides.map((_, index) => (
            <button
              key={index}
              className="w-2 h-2 rounded-full transition-all duration-300 bg-white/40 hover:bg-white/80 aria-selected:w-8 aria-selected:bg-white"
              aria-selected={selectedIndex === index}
              onClick={() => api?.scrollTo(index)}
            />
          ))}
        </div>
      )}
    </Carousel>
  );
}
