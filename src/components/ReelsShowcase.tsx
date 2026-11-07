"use client";

import useEmblaCarousel from "embla-carousel-react";
import { Play, X, Volume2, VolumeX } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { useLocale, useTranslations } from "next-intl";
import { getFeaturedSocialProofs, type SocialProofVideo } from "@/api/socialProof";
import { formatPrice } from "@/lib/price";

export const ReelsShowcase = () => {
  const t = useTranslations("ReelsShowcase");
  const locale = useLocale();
  const [emblaRef] = useEmblaCarousel({
    align: "center",
    loop: true,
    dragFree: false,
    skipSnaps: false,
    direction: locale === 'ar' ? 'rtl' : 'ltr'
  });

  const [selectedReel, setSelectedReel] = useState<SocialProofVideo | null>(null);
  const [videos, setVideos] = useState<SocialProofVideo[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const local = localStorage.getItem('reels_showcase_cache');
        if (local) return JSON.parse(local);
      } catch (e) {}
    }
    return [];
  });
  const [loading, setLoading] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Load social proof videos — prices now come from the JOIN query directly
  useEffect(() => {
    const loadVideos = async () => {
      try {
        const socialProofVideos = await getFeaturedSocialProofs();
        setVideos(socialProofVideos);
        if (typeof window !== 'undefined') {
          localStorage.setItem('reels_showcase_cache', JSON.stringify(socialProofVideos));
        }
      } catch (error) {
        console.error('Failed to load social proof videos:', error);
      } finally {
        setLoading(false);
      }
    };

    loadVideos();
  }, []);

  const getThumbnail = (video: SocialProofVideo) => {
    if (video.thumbnail_url) return video.thumbnail_url;
    const ytMatch = video.video_url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([^&?]+)/);
    if (ytMatch) return `https://img.youtube.com/vi/${ytMatch[1]}/hqdefault.jpg`;
    return null;
  };

  const isAr = locale === "ar";
  const getTitle = (video: SocialProofVideo) =>
    (isAr ? video.title_ar || video.title_en : video.title_en || video.title_ar) || (isAr ? "فيديو" : "Video");

  const getEmbedUrl = (url: string) => {
    const ytMatch = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([^&?]+)/);
    if (ytMatch) return `https://www.youtube.com/embed/${ytMatch[1]}?autoplay=1&mute=0`;
    const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
    if (vimeoMatch) return `https://player.vimeo.com/video/${vimeoMatch[1]}?autoplay=1&muted=0`;
    return url;
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !videoRef.current.muted;
      setIsMuted(!isMuted);
    }
  };

  const getFormattedPrice = (video: SocialProofVideo) => {
    if (!video.product_price) return null;
    return formatPrice(video.product_price, locale);
  };

  const getFormattedPriceBefore = (video: SocialProofVideo) => {
    if (!video.product_price_before) return null;
    return formatPrice(video.product_price_before, locale);
  };

  if (!mounted || (loading && videos.length === 0)) {
    return null;
  }

  if (videos.length === 0) return null;

  const getCenterClasses = () => {
    const len = videos.length;
    if (len === 1) return "justify-center";
    if (len === 2) return "md:justify-center lg:justify-center";
    if (len <= 4) return "lg:justify-center";
    return "";
  };

  return (
    <section className="bg-beige py-section lg:py-section-lg">
      {/* Header */}
      <h2 className="sr-only">{t('title')}</h2>

      {/* Full-bleed carousel */}
      <div className="overflow-hidden" ref={emblaRef}>
        <div className={`flex -ms-tile ${getCenterClasses()}`}>
          {videos.map((video) => (
            <div key={video.id} className="min-w-0 flex-[0_0_75%] ps-tile md:flex-[0_0_40%] lg:flex-[0_0_24%]">
              <button
                type="button"
                onClick={() => setSelectedReel(video)}
                aria-label={`${isAr ? "تشغيل" : "Play"}: ${getTitle(video)}`}
                className="group relative block aspect-[9/16] w-full overflow-hidden bg-gray-200 focus:outline-none focus-visible:ring-1 focus-visible:ring-inset focus-visible:ring-ink"
              >
                {getThumbnail(video) && (
                  <Image
                    src={getThumbnail(video)!}
                    alt=""
                    fill
                    className="object-cover transition-transform duration-500 ease-brand group-hover:scale-[1.04]"
                    loading="lazy"
                    sizes="(max-width: 768px) 75vw, (max-width: 1024px) 40vw, 30vw"
                  />
                )}
                <span className="absolute inset-0 bg-scrim" />

                {/* Play icon */}
                <span className="absolute inset-0 flex items-center justify-center">
                  <span className="ds-btn-overlay w-button-overlay px-0">
                    <Play strokeWidth={1.25} className="h-4 w-4 fill-current" />
                  </span>
                </span>

                {/* Title */}
                <span className="absolute inset-x-0 bottom-0 px-4 pb-4 text-center">
                  <span className="ds-label ds-on-image">{getTitle(video)}</span>
                </span>
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Reel modal — a real dialog: Esc closes, focus is trapped, page scroll locks */}
      <DialogPrimitive.Root open={!!selectedReel} onOpenChange={(o) => !o && setSelectedReel(null)}>
        <DialogPrimitive.Portal>
          <DialogPrimitive.Overlay className="fixed inset-0 z-[100] bg-ink/90 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
          <DialogPrimitive.Content
            className="fixed left-1/2 top-1/2 z-[101] flex -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center overflow-hidden bg-ink outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95"
            style={{ width: "min(80vw, calc(90vh * 9 / 16))", aspectRatio: "9/16", maxHeight: "90vh" }}
            dir={isAr ? "rtl" : "ltr"}
          >
            {selectedReel && (
              <>
                <DialogPrimitive.Title className="sr-only">{getTitle(selectedReel)}</DialogPrimitive.Title>
                <DialogPrimitive.Description className="sr-only">
                  {isAr ? "فيديو من عملائنا" : "A video from our customers"}
                </DialogPrimitive.Description>

                <DialogPrimitive.Close asChild>
                  <Button type="button" variant="overlay" size="icon" className="absolute start-4 top-4 z-[110]" aria-label={isAr ? "إغلاق" : "Close"}>
                    <X strokeWidth={1.25} />
                  </Button>
                </DialogPrimitive.Close>

                {selectedReel.video_url.includes("youtube") || selectedReel.video_url.includes("vimeo") ? (
                  <iframe
                    src={getEmbedUrl(selectedReel.video_url)}
                    title={getTitle(selectedReel)}
                    className="h-full w-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                ) : (
                  <div className="relative h-full w-full">
                    <video
                      ref={videoRef}
                      src={selectedReel.video_url}
                      autoPlay
                      loop
                      muted={false}
                      playsInline
                      controls
                      className="h-full w-full object-cover"
                    />
                    <Button
                      type="button"
                      variant="overlay"
                      size="icon"
                      onClick={toggleMute}
                      className="absolute end-4 top-4"
                      aria-label={isMuted ? (isAr ? "تشغيل الصوت" : "Unmute") : (isAr ? "كتم الصوت" : "Mute")}
                    >
                      {isMuted ? <VolumeX strokeWidth={1.25} /> : <Volume2 strokeWidth={1.25} />}
                    </Button>
                  </div>
                )}

                {/* Product */}
                {selectedReel.product_id && (selectedReel.product_name_ar || selectedReel.product_name_en) && (
                  <div className="absolute inset-x-4 bottom-4 z-[110]">
                    <div className="flex items-center gap-4 border border-white/30 bg-ink/50 p-4">
                      <Button asChild className="h-11 shrink-0 px-5">
                        <Link href={`/product/${selectedReel.product_id}`}>{isAr ? "تسوقي الآن" : "Shop now"}</Link>
                      </Button>
                      <div className="min-w-0 flex-1 text-end">
                        <p className="truncate font-sans text-[13px] uppercase tracking-[0.04em] text-white">
                          {isAr ? selectedReel.product_name_ar || selectedReel.product_name_en : selectedReel.product_name_en || selectedReel.product_name_ar}
                        </p>
                        {getFormattedPrice(selectedReel) && (
                          <p className="mt-0.5 flex flex-wrap items-baseline justify-end gap-x-2 font-sans text-[13px]">
                            {getFormattedPriceBefore(selectedReel) && (
                              <span className="whitespace-nowrap text-white/60 line-through">{getFormattedPriceBefore(selectedReel)}</span>
                            )}
                            <span className="whitespace-nowrap text-white">{getFormattedPrice(selectedReel)}</span>
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </DialogPrimitive.Content>
        </DialogPrimitive.Portal>
      </DialogPrimitive.Root>
    </section>
  );
};

