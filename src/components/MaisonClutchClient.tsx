"use client";

import { useLocale } from "next-intl";
import { Button } from "@/components/ui/button";
import { useRouter } from "@/i18n/navigation";
import { useEffect, useRef, useState } from "react";

interface MaisonClutchClientProps {
  titleEn: string;
  titleAr: string;
  subtitleEn: string;
  subtitleAr: string;
  descriptionEn: string;
  descriptionAr: string;
  buttonTextEn: string;
  buttonTextAr: string;
  href: string;
  videoUrl: string;
}

const MaisonClutchClient = ({
  titleEn,
  titleAr,
  subtitleEn,
  subtitleAr,
  descriptionEn,
  descriptionAr,
  buttonTextEn,
  buttonTextAr,
  href,
  videoUrl,
}: MaisonClutchClientProps) => {
  const locale = useLocale();
  const router = useRouter();
  const isAr = locale === "ar";
  const videoRef = useRef<HTMLVideoElement>(null);
  const sectionRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  const title = isAr ? titleAr : titleEn;
  const subtitle = isAr ? subtitleAr : subtitleEn;
  const description = isAr ? descriptionAr : descriptionEn;
  const buttonText = isAr ? buttonTextAr : buttonTextEn;

  // Lazy load video using Intersection Observer
  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: "200px" } // Start loading 200px before visible
    );

    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  // Play video when visible
  useEffect(() => {
    if (isVisible && videoRef.current) {
      videoRef.current.play().catch(() => {
        // Autoplay may be blocked, that's fine
      });
    }
  }, [isVisible]);

  const handleShopClick = () => {
    router.push(href);
  };

  return (
    <section ref={sectionRef} className="bg-[#F0EBE3] py-12 md:py-16 overflow-hidden">
      <div className="container mx-auto px-5">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Text Content */}
          <div className="order-2 lg:order-1 flex flex-col items-center lg:items-start text-center lg:text-left space-y-8">
            <h2 className="font-sans font-bold text-3xl md:text-5xl lg:text-6xl text-gray-900 leading-tight">
              {title}
            </h2>

            <div className="space-y-6 max-w-xl">
              <p className="text-gray-600 text-base md:text-lg leading-relaxed font-light">
                {subtitle}
              </p>
              <p className="text-gray-600 text-base md:text-lg leading-relaxed font-light">
                {description}
              </p>
            </div>

            <Button
              onClick={handleShopClick}
              className="px-8 py-3 min-h-[48px] bg-black text-white hover:bg-[#C2A878] rounded-full tracking-[0.2em] uppercase text-xs transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-1"
            >
              {buttonText}
            </Button>
          </div>

          {/* Video Content */}
          <div className="order-1 lg:order-2 w-full h-[500px] lg:h-[700px] relative bg-gray-100 rounded overflow-hidden">
            {isVisible && (
              <video
                ref={videoRef}
                className="absolute inset-0 w-full h-full object-cover"
                muted
                loop
                playsInline
                preload="none"
                src={videoUrl}
              />
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default MaisonClutchClient;


