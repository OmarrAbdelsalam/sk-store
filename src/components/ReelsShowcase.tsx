"use client";

import useEmblaCarousel from "embla-carousel-react";
import { Play, X, ShoppingCart, Volume2, VolumeX } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { useLocale, useTranslations } from "next-intl";
import { getFeaturedSocialProofs, type SocialProofVideo } from "@/api/socialProof";
import { getProductById } from "@/lib/api/products";

// Extended interface to include product pricing
interface SocialProofVideoWithPrice extends SocialProofVideo {
  product_price?: string;
  product_price_before?: string;
}

export const ReelsShowcase = () => {
  const t = useTranslations("ReelsShowcase");
  const [emblaRef] = useEmblaCarousel({
    align: "start",
    loop: false,
    dragFree: true,
    skipSnaps: false
  });

  const [selectedReel, setSelectedReel] = useState<SocialProofVideoWithPrice | null>(null);
  const [videos, setVideos] = useState<SocialProofVideoWithPrice[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const local = localStorage.getItem('reels_showcase_cache');
        if (local) return JSON.parse(local);
      } catch (e) {}
    }
    return [];
  });
  const [loading, setLoading] = useState(true);
  const [isMuted, setIsMuted] = useState(false); // Start with sound enabled
  const videoRef = useRef<HTMLVideoElement>(null);
  const locale = useLocale();

  const [mounted, setMounted] = useState(false);

  // Ensure component only renders on client to avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  // Load social proof videos and fetch product prices
  useEffect(() => {
    const loadVideos = async () => {
      try {
        const socialProofVideos = await getFeaturedSocialProofs();
        
        // Fetch product details for videos that have product_id
        const videosWithPrices = await Promise.all(
          socialProofVideos.map(async (video) => {
            if (video.product_id) {
              try {
                const product = await getProductById(video.product_id);
                console.log('Product fetched for video:', video.product_id, product);
                
                if (product) {
                  return {
                    ...video,
                    product_price: `${product.price} ${locale === 'ar' ? 'ج.م' : 'EGP'}`,
                    product_price_before: product.beforePrice ? `${product.beforePrice} ${locale === 'ar' ? 'ج.م' : 'EGP'}` : undefined
                  };
                }
              } catch (error) {
                console.error(`Failed to fetch product ${video.product_id}:`, error);
              }
            }
            return video;
          })
        );
        
        console.log('Videos with prices:', videosWithPrices);
        setVideos(videosWithPrices);
        if (typeof window !== 'undefined') {
          localStorage.setItem('reels_showcase_cache', JSON.stringify(videosWithPrices));
        }
      } catch (error) {
        console.error('Failed to load social proof videos:', error);
      } finally {
        setLoading(false);
      }
    };

    loadVideos();
  }, [locale]);

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

  // Get video thumbnail
  const getThumbnail = (video: SocialProofVideoWithPrice) => {
    if (video.thumbnail_url) return video.thumbnail_url;
    
    // Extract YouTube thumbnail if it's a YouTube video
    const ytMatch = video.video_url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([^&?]+)/);
    if (ytMatch) return `https://img.youtube.com/vi/${ytMatch[1]}/hqdefault.jpg`;
    
    return null;
  };

  // Get video title
  const getTitle = (video: SocialProofVideoWithPrice) => {
    return locale === 'ar' ? video.title_ar : video.title_en;
  };

  // Get embed URL for video
  const getEmbedUrl = (url: string) => {
    // YouTube
    const ytMatch = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([^&?]+)/);
    if (ytMatch) return `https://www.youtube.com/embed/${ytMatch[1]}?autoplay=1&mute=0`; // Enable sound by default
    
    // Vimeo
    const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
    if (vimeoMatch) return `https://player.vimeo.com/video/${vimeoMatch[1]}?autoplay=1&muted=0`; // Enable sound by default
    
    // Direct video URL
    return url;
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !videoRef.current.muted;
      setIsMuted(!isMuted);
    }
  };

  if (!mounted || (loading && videos.length === 0)) {
    return (
      <section className="py-16 bg-[#F9F9F9]">
        <div className="container mx-auto px-4">
          <div className="text-center mb-10">
            <div className="h-8 w-48 bg-muted animate-pulse mx-auto mb-2 rounded" />
            <div className="w-24 h-[1px] bg-muted mx-auto mt-3" />
          </div>
          <div className="overflow-hidden">
            <div className="flex -ml-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="flex-[0_0_60%] md:flex-[0_0_40%] lg:flex-[0_0_30%] pl-4 min-w-0">
                  <div className="aspect-[2/3] bg-muted rounded-xl animate-pulse" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (videos.length === 0) {
    return null; // Don't show the section if no videos
  }

  return (
    <section className="py-16 bg-[#F9F9F9]">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-10">
          <h2 className="font-playfair text-3xl md:text-4xl text-gray-900 mb-2">
            {t('title')}
          </h2>
          <div className="w-24 h-[1px] bg-black mx-auto mt-3"></div>
        </div>

      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex -ml-4">
          {videos.map((video) => (
            <div 
              key={video.id} 
              className="flex-[0_0_60%] md:flex-[0_0_40%] lg:flex-[0_0_30%] pl-4 min-w-0"
              onClick={() => setSelectedReel(video)}
            >
              <div className="relative aspect-[2/3] bg-gray-200 rounded-xl overflow-hidden group cursor-pointer shadow-sm">
                {/* Video Thumbnail */}
                {getThumbnail(video) ? (
                  <Image
                    src={getThumbnail(video)!}
                    alt={getTitle(video) || "فيديو"}
                    fill
                    className="object-cover transition-opacity duration-300 opacity-80 group-hover:opacity-100"
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
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="relative w-[85vw] aspect-[9/16] max-h-[90vh] md:w-[50vw] md:h-[80vh] md:max-w-[450px] md:aspect-auto bg-black rounded-2xl md:rounded-3xl overflow-hidden shadow-2xl flex flex-col items-center justify-center"
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
                    muted={false} // Start with sound enabled
                    playsInline
                    controls
                    className="w-full h-full object-cover"
                  />
                  
                  {/* Sound Control Button for direct videos */}
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

              {/* Product Info Overlay - Only show if product is linked */}
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
                      
                      {/* Product Price */}
                      {selectedReel.product_price && (
                        <div className="flex items-center justify-end gap-2">
                          {selectedReel.product_price_before && (
                            <span className="text-gray-300 text-xs line-through">
                              {selectedReel.product_price_before}
                            </span>
                          )}
                          <span className="text-white text-sm font-bold">
                            {selectedReel.product_price}
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
