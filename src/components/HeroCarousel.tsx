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
      className="w-full h-full group"
    >
      <CarouselContent className="h-full ml-0">
        {slides.map((slide, index) => (
          <CarouselItem key={index} className="pl-0 basis-full h-[calc(100svh-101px)] lg:h-[85vh] lg:min-h-[600px]">
            <div className="relative h-full w-full overflow-hidden bg-[#f9f9f9]">
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
                      className="absolute inset-0 w-full h-full object-cover scale-105"
                    />
                  ) : (
                    <Image
                      src={slide.mobileMedia}
                      alt={slide.title}
                      fill
                      priority={index === 0}
                      className="object-cover object-center scale-105"
                      sizes="100vw"
                    />
                  )}
                  {/* Subtle darkening for contrast */}
                  <div className="absolute inset-0 bg-black/10 transition-opacity duration-700" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
                </div>

                {/* Content Overlay */}
                <div className="relative z-10 h-full flex flex-col justify-end pb-16 px-6">
                  <div className="w-full flex flex-col items-center text-center space-y-5 animate-in slide-in-from-bottom-4 duration-700 fade-in">
                    
                    <div className="space-y-3">
                      <h2 className="font-sans font-normal text-4xl sm:text-5xl text-white tracking-wider">
                        {slide.title}
                      </h2>
                      {slide.description && (
                        <p className="text-white/80 text-sm font-light max-w-xs mx-auto tracking-wide leading-relaxed">
                          {slide.description}
                        </p>
                      )}
                    </div>
                    
                    <Link href={slide.mobileButtonLink} className="mt-6 block w-[200px]">
                      <Button
                        variant="outline"
                        className="w-full h-12 bg-transparent text-white border-white/80 hover:bg-white hover:text-black rounded-none tracking-[0.2em] uppercase text-xs transition-all duration-500 font-medium"
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
                  className="object-cover object-center scale-100 group-hover:scale-105 transition-transform duration-[10s] ease-out"
                  sizes="100vw"
                />

                {/* Elegant gradients for text readability without being muddy */}
                <div className="absolute inset-0 bg-black/15" />
                <div className="absolute inset-y-0 left-0 w-1/2 bg-gradient-to-r from-black/50 via-black/20 to-transparent" />

                {/* Text content overlay - center left */}
                <div className="relative z-10 h-full flex flex-col items-start justify-center px-24 2xl:px-32">
                  <div className="max-w-2xl space-y-8 text-left animate-in slide-in-from-left-8 duration-1000 fade-in delay-150 fill-mode-both">
                    <h1 className="font-sans text-6xl xl:text-7xl text-white font-normal leading-[1.1] tracking-wide">
                      {slide.title}
                    </h1>
                    <p className="text-white/80 text-lg xl:text-xl font-light tracking-wide leading-relaxed max-w-lg">
                      {slide.description}
                    </p>
                    <div className="pt-6">
                      <Link href={slide.buttonLink}>
                        <Button 
                          variant="outline"
                          className="px-12 h-14 bg-white/5 backdrop-blur-sm text-white border-white/60 hover:bg-white hover:text-black hover:border-white rounded-none tracking-[0.25em] uppercase text-xs transition-all duration-500 font-medium"
                        >
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
      
      {/* Elegant minimalist dots Indicator */}
      {isMultiple && (
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex items-center justify-center gap-3 z-20">
          {slides.map((_, index) => (
            <button
              key={index}
              className="w-1.5 h-1.5 rounded-full transition-all duration-500 bg-white/40 hover:bg-white/80 aria-selected:w-6 aria-selected:bg-white"
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
