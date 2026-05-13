"use client";

import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, ChevronUp, ChevronDown, X, ZoomIn, Loader2 } from "lucide-react";
import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import clsx from "clsx";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { motion, AnimatePresence } from "framer-motion";
import { useDropboxImage } from "@/hooks/useDropboxImage";

type Photo = {
  id: string | number;
  imageUrl: string;
  colorId: string | number;
  optionValueId?: string | number;
  isMain: boolean;
};

interface ProductImageGalleryProps {
  photos: Photo[];
  selectedColorId: string | number;
  selectedOptionValueId?: string | number;
  thumbSide?: "left" | "right";
}

const FALLBACK = "/placeholder.png";

function SafeImage({
  src,
  alt,
  className,
  fill,
  width,
  height,
  sizes,
  priority,
  loading,
  onMouseMove,
  onMouseLeave,
  style,
}: {
  src: string;
  alt: string;
  className?: string;
  fill?: boolean;
  width?: number;
  height?: number;
  sizes?: string;
  priority?: boolean;
  loading?: "lazy" | "eager";
  onMouseMove?: React.MouseEventHandler;
  onMouseLeave?: React.MouseEventHandler;
  style?: React.CSSProperties;
}) {
  const [failed, setFailed] = useState(false);
  
  // Use Dropbox hook for paths starting with / (Dropbox paths)
  const isDropboxPath = src?.startsWith('/') && !src.startsWith('/placeholder');
  const { url: dropboxUrl, loading: dropboxLoading } = useDropboxImage(isDropboxPath ? src : undefined);
  
  // Determine the effective source
  let effectiveSrc = src || FALLBACK;
  if (isDropboxPath) {
    effectiveSrc = dropboxUrl;
  }
  if (failed) {
    effectiveSrc = FALLBACK;
  }

  // Show loader while loading Dropbox URL
  if (isDropboxPath && dropboxLoading) {
    return (
      <div className={clsx("flex items-center justify-center bg-gray-100", className)} style={{ width: fill ? '100%' : width, height: fill ? '100%' : height }}>
        <Loader2 className="animate-spin text-gray-400" size={24} />
      </div>
    );
  }

  return (
    <Image
      src={effectiveSrc}
      alt={alt}
      className={className}
      onError={() => setFailed(true)}
      {...(fill
        ? { fill: true, sizes: sizes || "(max-width: 1024px) 100vw, 50vw" }
        : { width: width ?? 80, height: height ?? 80 })}
      priority={priority}
      loading={loading || (priority ? "eager" : "lazy")}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
      style={style}
    />
  );
}

const ProductImageGallery = ({
  photos,
  selectedColorId,
  selectedOptionValueId,
  thumbSide,
}: ProductImageGalleryProps) => {
  const t = useTranslations("Gallery");
  const locale = useLocale();
  const dir = locale === "ar" ? "rtl" : "ltr";

  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [direction, setDirection] = useState(0);

  // عرض كل الصور مع إعطاء الأولوية لصور اللون المختار + الـ option value المختار
  const currentImages = useMemo(() => {
    if (!photos || photos.length === 0) return [];
    
    // فلترة بناءً على اللون والـ option value
    let filteredByColor = selectedColorId
      ? photos.filter((p) => p.colorId === selectedColorId)
      : [];
    
    // لو فيه option value مختار (مثل chain type)، نفلتر كمان
    let filteredByBoth: Photo[] = [];
    if (selectedOptionValueId && filteredByColor.length > 0) {
      filteredByBoth = filteredByColor.filter((p) => p.optionValueId === selectedOptionValueId);
    }
    if (selectedOptionValueId && filteredByColor.length === 0) {
      // لو مفيش فلتر لون، نفلتر بالـ option value بس
      filteredByBoth = photos.filter((p) => p.optionValueId === selectedOptionValueId);
    }
    
    // الأولوية: صور مطابقة للون + option value > صور مطابقة للون بس > كل الصور
    const primaryPhotos = filteredByBoth.length > 0 
      ? filteredByBoth 
      : filteredByColor.length > 0 
        ? filteredByColor 
        : photos;
    
    // باقي الصور (اللي مش في الـ primary)
    const primaryIds = new Set(primaryPhotos.map(p => p.id));
    const otherPhotos = photos.filter(p => !primaryIds.has(p.id));
    
    // ترتيب: main أولاً
    const primaryMains = primaryPhotos.filter((p) => p.isMain);
    const primaryOthers = primaryPhotos.filter((p) => !p.isMain);
    const otherMains = otherPhotos.filter((p) => p.isMain);
    const otherOthers = otherPhotos.filter((p) => !p.isMain);
    
    return [...primaryMains, ...primaryOthers, ...otherMains, ...otherOthers];
  }, [photos, selectedColorId, selectedOptionValueId]);

  // Reset index عند تغيير اللون أو الصور أو الـ option value
  useEffect(() => {
    setCurrentImageIndex(0);
  }, [selectedColorId, selectedOptionValueId, photos]);

  const nextImage = () => {
    if (currentImages.length <= 1) return;
    setDirection(1);
    setCurrentImageIndex((prev) => (prev + 1) % currentImages.length);
  };

  const prevImage = () => {
    if (currentImages.length <= 1) return;
    setDirection(-1);
    setCurrentImageIndex(
      (prev) => (prev - 1 + currentImages.length) % currentImages.length
    );
  };

  const selectImage = (index: number) => {
    if (index === currentImageIndex) return;
    setDirection(index > currentImageIndex ? 1 : -1);
    setCurrentImageIndex(index);
  };

  // ✅ Touch swipe handling
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);
  const minSwipeDistance = 50;

  const onTouchStart = (e: React.TouchEvent) => {
    touchEndX.current = null;
    touchStartX.current = e.targetTouches[0].clientX;
  };

  const onTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const onTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return;
    
    const distance = touchStartX.current - touchEndX.current;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (currentImages.length > 1) {
      if (locale === "ar") {
        if (isLeftSwipe) prevImage();
        else if (isRightSwipe) nextImage();
      } else {
        if (isLeftSwipe) nextImage();
        else if (isRightSwipe) prevImage();
      }
    }

    touchStartX.current = null;
    touchEndX.current = null;
  };

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? '100%' : '-100%',
      opacity: 1
    }),
    center: {
      x: 0,
      opacity: 1
    },
    exit: (direction: number) => ({
      x: direction > 0 ? '-100%' : '100%',
      opacity: 1
    })
  };

  // ======== Thumbnail scroll ========
  const thumbsScrollRef = useRef<HTMLDivElement | null>(null);
  const [canScrollUp, setCanScrollUp] = useState(false);
  const [canScrollDown, setCanScrollDown] = useState(false);

  const updateScrollState = useCallback(() => {
    const sc = thumbsScrollRef.current;
    if (!sc) return;
    setCanScrollUp(sc.scrollTop > 0);
    setCanScrollDown(sc.scrollTop + sc.clientHeight < sc.scrollHeight - 1);
  }, []);

  useEffect(() => {
    updateScrollState();
    const sc = thumbsScrollRef.current;
    if (sc) {
      sc.addEventListener("scroll", updateScrollState, { passive: true });
      const ro = new ResizeObserver(updateScrollState);
      ro.observe(sc);
      return () => {
        sc.removeEventListener("scroll", updateScrollState);
        ro.disconnect();
      };
    }
  }, [updateScrollState, currentImages]);

  // Auto-scroll to active thumbnail
  useEffect(() => {
    const sc = thumbsScrollRef.current;
    if (!sc) return;
    const activeThumb = sc.children[currentImageIndex] as HTMLElement;
    if (activeThumb) {
      activeThumb.scrollIntoView({ block: "nearest", behavior: "smooth" });
    }
  }, [currentImageIndex]);

  const scrollThumbsBy = (delta: number) => {
    const sc = thumbsScrollRef.current;
    if (!sc) return;
    sc.scrollBy({ top: delta, behavior: "smooth" });
  };

  if (!currentImages || currentImages.length === 0) {
    return (
      <div
        className="relative aspect-[4/5] bg-gray-50 overflow-hidden flex items-center justify-center lg:rounded-lg lg:aspect-[4/3]"
        dir={dir}
      >
        <span className="text-muted-foreground">{t("noImages")}</span>
      </div>
    );
  }

  return (
    <div dir={dir}>
      {/* 🚀 Preload all gallery images in the background to make swiping instant */}
      <div className="hidden">
        {currentImages.map((img) => (
          <SafeImage
            key={img.id}
            src={img.imageUrl || FALLBACK}
            alt="preload"
            fill
            priority
            loading="eager"
            sizes="1px" // Minimal sizes attribute for preload
          />
        ))}
      </div>

      {/* ======== DESKTOP LAYOUT: Thumbnails + Main Image side by side ======== */}
      <div className="hidden lg:flex gap-3" style={{ direction: dir === "rtl" ? "rtl" : "ltr" }}>
        
        {/* Vertical Thumbnails Column */}
        {currentImages.length > 1 && (
          <div className="relative flex flex-col items-center w-[72px] shrink-0">
            {/* Scroll up arrow */}
            {canScrollUp && (
              <button
                className="absolute -top-1 left-1/2 -translate-x-1/2 z-10 w-8 h-8 flex items-center justify-center bg-white/90 rounded-full shadow-sm hover:bg-white transition-colors"
                onClick={() => scrollThumbsBy(-160)}
                aria-label="Scroll up"
              >
                <ChevronUp className="w-4 h-4 text-gray-600" />
              </button>
            )}

            {/* Thumbnails scroll area */}
            <div
              ref={thumbsScrollRef}
              className="flex flex-col gap-2 overflow-y-auto scrollbar-hide max-h-[520px] py-1"
              style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
            >
              {currentImages.map((img, idx) => (
                <button
                  key={img.id}
                  className={clsx(
                    "relative w-16 h-16 rounded-md overflow-hidden shrink-0 transition-all duration-200 border-2",
                    idx === currentImageIndex
                      ? "border-black ring-1 ring-black/10 opacity-100"
                      : "border-transparent opacity-60 hover:opacity-100 hover:border-gray-300"
                  )}
                  onClick={() => selectImage(idx)}
                  aria-label={t("imageAlt", { index: idx + 1 })}
                >
                  <SafeImage
                    src={img.imageUrl || FALLBACK}
                    alt={t("imageAlt", { index: idx + 1 })}
                    className="object-cover"
                    fill
                    sizes="72px"
                  />
                </button>
              ))}
            </div>

            {/* Scroll down arrow */}
            {canScrollDown && (
              <button
                className="absolute -bottom-1 left-1/2 -translate-x-1/2 z-10 w-8 h-8 flex items-center justify-center bg-white/90 rounded-full shadow-sm hover:bg-white transition-colors"
                onClick={() => scrollThumbsBy(160)}
                aria-label="Scroll down"
              >
                <ChevronDown className="w-4 h-4 text-gray-600" />
              </button>
            )}
          </div>
        )}

        {/* Main Image */}
        <div className="flex-1 min-w-0">
          <div
            className={clsx(
              "relative aspect-[4/5] bg-gray-50 overflow-hidden rounded-lg cursor-zoom-in group"
            )}
            onClick={() => setIsLightboxOpen(true)}
          >
            {/* Normal Image */}
            <SafeImage
              src={currentImages[currentImageIndex]?.imageUrl || FALLBACK}
              alt={t("imageAlt", { index: currentImageIndex + 1 })}
              className="object-cover"
              fill
              priority={true}
              loading="eager"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />

            {/* Zoom hint icon */}
            <div className="absolute top-3 right-3 bg-black/40 backdrop-blur-sm rounded-full p-2 transition-opacity duration-300 opacity-0 group-hover:opacity-100 pointer-events-none z-10">
               <ZoomIn className="h-4 w-4 text-white" />
            </div>

            {/* Image counter */}
            {currentImages.length > 1 && (
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-black/50 text-white px-3 py-1 rounded-full text-xs backdrop-blur-sm z-10">
                {currentImageIndex + 1} / {currentImages.length}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ======== MOBILE LAYOUT: Swipeable carousel ======== */}
      <div className="lg:hidden">
        <div
          className="relative aspect-[4/5] bg-gray-50 overflow-hidden cursor-zoom-in group"
          onClick={() => setIsLightboxOpen(true)}
        >
          <AnimatePresence initial={false} custom={direction}>
            <motion.div
              key={currentImageIndex}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{
                x: { type: "spring", stiffness: 300, damping: 30 },
                opacity: { duration: 0.15 }
              }}
              onTouchStart={onTouchStart}
              onTouchMove={onTouchMove}
              onTouchEnd={onTouchEnd}
              className="absolute inset-0"
            >
              <SafeImage
                src={currentImages[currentImageIndex]?.imageUrl || FALLBACK}
                alt={t("imageAlt", { index: currentImageIndex + 1 })}
                className="object-cover"
                fill
                priority={true}
                loading="eager"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
            </motion.div>
          </AnimatePresence>

          {/* Zoom icon */}
          <div className="absolute top-3 right-3 bg-black/40 backdrop-blur-sm rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-10">
            <ZoomIn className="h-4 w-4 text-white" />
          </div>

          {/* Mobile swipe arrows */}
          {currentImages.length > 1 && (
            <>
              <Button
                variant="ghost"
                size="sm"
                className={clsx(
                  "absolute top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white/90 rounded-full p-2",
                  dir === "rtl" ? "right-2" : "left-2"
                )}
                onClick={(e) => {
                  e.stopPropagation();
                  dir === "rtl" ? nextImage() : prevImage();
                }}
                aria-label={dir === "rtl" ? t("next") : t("prev")}
              >
                {dir === "rtl" ? (
                  <ChevronRight className="h-4 w-4" />
                ) : (
                  <ChevronLeft className="h-4 w-4" />
                )}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className={clsx(
                  "absolute top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white/90 rounded-full p-2",
                  dir === "rtl" ? "left-2" : "right-2"
                )}
                onClick={(e) => {
                  e.stopPropagation();
                  dir === "rtl" ? prevImage() : nextImage();
                }}
                aria-label={dir === "rtl" ? t("prev") : t("next")}
              >
                {dir === "rtl" ? (
                  <ChevronLeft className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
              </Button>
            </>
          )}

          {/* Mobile dot indicators */}
          {currentImages.length > 1 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
              {currentImages.map((_, idx) => (
                <button
                  key={idx}
                  className={clsx(
                    "rounded-full transition-all duration-300",
                    idx === currentImageIndex
                      ? "w-6 h-2 bg-white"
                      : "w-2 h-2 bg-white/50"
                  )}
                  onClick={(e) => {
                    e.stopPropagation();
                    selectImage(idx);
                  }}
                  aria-label={`Image ${idx + 1}`}
                />
              ))}
            </div>
          )}
        </div>

        {/* Mobile thumbnail strip below image */}
        {currentImages.length > 1 && (
          <div className="flex gap-2 px-4 mt-3 overflow-x-auto scrollbar-hide pb-1" style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}>
            {currentImages.map((img, idx) => (
              <button
                key={img.id}
                className={clsx(
                  "relative w-14 h-14 rounded-md overflow-hidden shrink-0 transition-all duration-200 border-2",
                  idx === currentImageIndex
                    ? "border-black opacity-100"
                    : "border-transparent opacity-50 hover:opacity-80"
                )}
                onClick={() => selectImage(idx)}
              >
                <SafeImage
                  src={img.imageUrl || FALLBACK}
                  alt={t("imageAlt", { index: idx + 1 })}
                  className="object-cover"
                  fill
                  sizes="56px"
                />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ======== Lightbox Dialog ======== */}
      <Dialog open={isLightboxOpen} onOpenChange={setIsLightboxOpen}>
        <DialogContent className="max-w-[95vw] max-h-[95vh] p-0 bg-black/95 border-none" hideTitle accessibleTitle="Image Gallery">
          <div className="relative w-full h-[95vh] flex items-center justify-center overflow-hidden">
            {/* Close button */}
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-4 right-4 z-50 bg-white/10 hover:bg-white/20 text-white rounded-full"
              onClick={() => setIsLightboxOpen(false)}
            >
              <X className="h-6 w-6" />
            </Button>

            {/* Main image with animation */}
            <div className="relative w-full h-full flex items-center justify-center p-8">
              <AnimatePresence initial={false} custom={direction}>
                <motion.div
                  key={`lightbox-${currentImageIndex}`}
                  custom={direction}
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{
                    x: { type: "spring", stiffness: 300, damping: 30 },
                    opacity: { duration: 0.15 }
                  }}
                  onTouchStart={onTouchStart}
                  onTouchMove={onTouchMove}
                  onTouchEnd={onTouchEnd}
                  className="absolute inset-0 flex items-center justify-center p-8"
                >
                  <SafeImage
                    src={currentImages[currentImageIndex]?.imageUrl || FALLBACK}
                    alt={t("imageAlt", { index: currentImageIndex + 1 })}
                    className="object-contain"
                    fill
                    priority
                  />
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Navigation arrows */}
            {currentImages.length > 1 && (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  className={clsx(
                    "absolute top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 text-white rounded-full z-50",
                    dir === "rtl" ? "right-4" : "left-4"
                  )}
                  onClick={(e) => {
                    e.stopPropagation();
                    dir === "rtl" ? nextImage() : prevImage();
                  }}
                >
                  {dir === "rtl" ? (
                    <ChevronRight className="h-6 w-6" />
                  ) : (
                    <ChevronLeft className="h-6 w-6" />
                  )}
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className={clsx(
                    "absolute top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 text-white rounded-full z-50",
                    dir === "rtl" ? "left-4" : "right-4"
                  )}
                  onClick={(e) => {
                    e.stopPropagation();
                    dir === "rtl" ? prevImage() : nextImage();
                  }}
                >
                  {dir === "rtl" ? (
                    <ChevronLeft className="h-6 w-6" />
                  ) : (
                    <ChevronRight className="h-6 w-6" />
                  )}
                </Button>
              </>
            )}

            {/* Lightbox thumbnails strip */}
            {currentImages.length > 1 && (
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-50 max-w-[80vw] overflow-x-auto px-4 py-2 bg-black/40 backdrop-blur-sm rounded-xl" style={{ scrollbarWidth: "none" }}>
                {currentImages.map((img, idx) => (
                  <button
                    key={`lb-${img.id}`}
                    className={clsx(
                      "relative w-12 h-12 rounded-md overflow-hidden shrink-0 transition-all duration-200 border-2",
                      idx === currentImageIndex
                        ? "border-white opacity-100"
                        : "border-transparent opacity-50 hover:opacity-80"
                    )}
                    onClick={() => selectImage(idx)}
                  >
                    <SafeImage
                      src={img.imageUrl || FALLBACK}
                      alt=""
                      className="object-cover"
                      fill
                      sizes="48px"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProductImageGallery;
