"use client";

import useEmblaCarousel from "embla-carousel-react";
import { Play, X, Volume2, VolumeX } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { useLocale, useTranslations } from "next-intl";
import { getFeaturedSocialProofs, type SocialProofVideo } from "@/api/socialProof";

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

  // Prevent scroll when modal is open
  useEffect(() => {
    if (selectedReel) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [selectedReel]);

  const getThumbnail = (video: SocialProofVideo) => {
    if (video.thumbnail_url) return video.thumbnail_url;
    const ytMatch = video.video_url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([^&?]+)/);
    if (ytMatch) return `https://img.youtube.com/vi/${ytMatch[1]}/hqdefault.jpg`;
    return null;
  };

  const getTitle = (video: SocialProofVideo) => {
    return locale === 'ar' ? video.title_ar : video.title_en;
  };

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
    return `${video.product_price} ${locale === 'ar' ? 'ج.م' : 'EGP'}`;
  };

  const getFormattedPriceBefore = (video: SocialProofVideo) => {
    if (!video.product_price_before) return null;
    return `${video.product_price_before} ${locale === 'ar' ? 'ج.م' : 'EGP'}`;
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
    <section className="bg-[#F0EBE3] py-12 md:py-16">
      <div className="container mx-auto px-5">
        {/* Header */}
        <div className="text-center mb-10">
          <h2 className="font-sans font-bold text-3xl md:text-4xl text-gray-900 mb-2">
            {t('title')}
          </h2>
          <div className="w-24 h-[2px] bg-[#C2A878] rounded-full mx-auto mt-3"></div>
        </div>

        <div className="overflow-hidden -mx-5 md:mx-0" ref={emblaRef}>
          <div className={`flex -ml-4 ${getCenterClasses()}`}>
            {videos.map((video) => (
              <div
                key={video.id}
                className="flex-[0_0_75%] md:flex-[0_0_40%] lg:flex-[0_0_24%] pl-4 min-w-0"
                onClick={() => setSelectedReel(video)}
              >
                <div className="relative aspect-[9/16] bg-gray-200 rounded-xl overflow-hidden group cursor-pointer shadow-sm">
                  {getThumbnail(video) ? (
                    <Image
                      src={getThumbnail(video)!}
                      alt={getTitle(video) || "فيديو"}
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                      loading="lazy"
                      sizes="(max-width: 768px) 75vw, (max-width: 1024px) 40vw, 30vw"
                    />
                  ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-100 to-purple-100 transition-opacity duration-300 opacity-80 group-hover:opacity-100" />
                  )}

                  {/* Play Icon */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-12 h-12 bg-white/30 backdrop-blur-md rounded-full flex items-center justify-center text-white border border-white/50 group-hover:scale-110 transition-transform duration-300">
                      <Play className="w-5 h-5 fill-current ml-1" />
                    </div>
                  </div>

                  {/* Text Overlay */}
                  <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/60 to-transparent pt-12">
                    <p className="text-white font-medium text-sm md:text-base drop-shadow-md">
                      {getTitle(video) || "فيديو"}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Reel Modal */}
      <AnimatePresence>
        {selectedReel && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedReel(null)}
              className="absolute inset-0 bg-black/90 backdrop-blur-sm"
            />

            {/* Modal Content */}
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="relative bg-black rounded-2xl overflow-hidden shadow-2xl flex flex-col items-center justify-center"
              style={{ width: "min(80vw, calc(90vh * 9 / 16))", aspectRatio: "9/16", maxHeight: "90vh" }}
            >
              {/* Close Button */}
              <button
                onClick={() => setSelectedReel(null)}
                className="absolute top-4 left-4 z-[110] bg-white/20 hover:bg-white/40 backdrop-blur-md text-white p-2 rounded-full transition-colors"
                aria-label="Close"
              >
                <X className="w-6 h-6" />
              </button>

              {/* Video Player */}
              {selectedReel.video_url.includes('youtube') || selectedReel.video_url.includes('vimeo') ? (
                <iframe
                  src={getEmbedUrl(selectedReel.video_url)}
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                <div className="relative w-full h-full">
                  <video
                    ref={videoRef}
                    src={selectedReel.video_url}
                    autoPlay
                    loop
                    muted={false}
                    playsInline
                    controls
                    className="w-full h-full object-cover"
                  />

                  {/* Sound Control Button */}
                  <button
                    onClick={toggleMute}
                    className="absolute top-4 right-4 bg-black/50 hover:bg-black/70 text-white p-3 rounded-full transition-all duration-200 backdrop-blur-sm border border-white/20"
                    aria-label={isMuted ? "تشغيل الصوت" : "كتم الصوت"}
                  >
                    {isMuted ? (
                      <VolumeX className="w-5 h-5" />
                    ) : (
                      <Volume2 className="w-5 h-5" />
                    )}
                  </button>
                </div>
              )}

              {/* Product Info Overlay */}
              {selectedReel.product_id && (selectedReel.product_name_ar || selectedReel.product_name_en) && (
                <div className="absolute bottom-4 left-4 right-4 z-[110]">
                  <div className="bg-black/40 backdrop-blur-xl border border-white/20 rounded-2xl p-4 flex items-center gap-4">
                    {/* Shop Button */}
                    <Link href={`/product/${selectedReel.product_id}`} className="shrink-0">
                      <button className="bg-[#004D40] hover:bg-[#003d33] text-white px-4 py-2 rounded-lg text-sm font-bold transition-colors">
                        {locale === 'ar' ? 'تسوق الآن' : 'SHOP NOW'}
                      </button>
                    </Link>

                    {/* Product Details */}
                    <div className="flex-1 min-w-0 text-right">
                      <h4 className="text-white text-sm font-medium truncate mb-1">
                        {locale === 'ar' ? selectedReel.product_name_ar : selectedReel.product_name_en}
                      </h4>

                      {/* Product Price - from JOIN */}
                      {getFormattedPrice(selectedReel) && (
                        <div className="flex items-center justify-end gap-2">
                          {getFormattedPriceBefore(selectedReel) && (
                            <span className="text-gray-300 text-xs line-through">
                              {getFormattedPriceBefore(selectedReel)}
                            </span>
                          )}
                          <span className="text-white text-sm font-bold">
                            {getFormattedPrice(selectedReel)}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
};

