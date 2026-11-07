"use client";

import { useLocale } from "next-intl";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
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

  return (
    <section ref={sectionRef} className="overflow-hidden bg-background">
      {/* Full-bleed editorial video */}
      <div className="relative h-[82svh] w-full bg-beige lg:h-[80vh]">
        {/* Always mounted with preload="metadata" and a #t fragment, so the
            first frame paints right away as a poster instead of an empty
            gray block; it starts playing once the section is in view. */}
        <video
          ref={videoRef}
          className="absolute inset-0 h-full w-full object-cover"
          muted
          loop
          playsInline
          preload={isVisible ? "auto" : "metadata"}
          src={`${videoUrl}#t=0.1`}
          aria-hidden="true"
        />
        <div className="absolute inset-0 bg-scrim" />

        <div className="absolute inset-x-0 bottom-0 flex flex-col items-center gap-8 px-gutter pb-12 text-center lg:pb-16">
          <h2 className="ds-display-lg ds-on-image">{title}</h2>
          <Button asChild variant="overlay">
            <Link href={href}>{buttonText}</Link>
          </Button>
        </div>
      </div>

      {/* Banner only, like the reference; subtitle/description stay for
          screen readers. */}
      {(subtitle || description) && (
        <div className="sr-only">
          {subtitle && <p>{subtitle}</p>}
          {description && <p>{description}</p>}
        </div>
      )}
    </section>
  );
};

export default MaisonClutchClient;


