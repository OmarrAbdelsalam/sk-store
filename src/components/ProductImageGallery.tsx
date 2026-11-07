"use client";

import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, X, Loader2 } from "lucide-react";
import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import clsx from "clsx";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { motion, AnimatePresence } from "framer-motion";
import { useDropboxImage } from "@/hooks/useDropboxImage";
import { useStudioPhotos } from "@/hooks/useStudioPhotos";

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
  mainImageSecond?: boolean;
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
      <div className={clsx("flex items-center justify-center bg-beige", className)} style={{ width: fill ? '100%' : width, height: fill ? '100%' : height }}>
        <Loader2 className="animate-spin text-gray-400" size={20} strokeWidth={1.25} />
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
      unoptimized
    />
  );
}

const ProductImageGallery = ({
  photos,
  selectedColorId,
  selectedOptionValueId,
  thumbSide,
  mainImageSecond = false,
}: ProductImageGalleryProps) => {
  const t = useTranslations("Gallery");
  const locale = useLocale();
  const dir = locale === "ar" ? "rtl" : "ltr";

  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [direction, setDirection] = useState(0);

  // عرض كل الصور مع إعطاء الأولوية لصور اللون المختار + الـ option value المختار
  const orderedImages = useMemo(() => {
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
    
    // ترتيب: main تبقى تاني صورة لو mainImageSecond مفعّل
    const primaryMains = primaryPhotos.filter((p) => p.isMain);
    const primaryOthers = primaryPhotos.filter((p) => !p.isMain);
    const otherMains = otherPhotos.filter((p) => p.isMain);
    const otherOthers = otherPhotos.filter((p) => !p.isMain);
    
    if (mainImageSecond && primaryOthers.length > 0) {
      // Main image as second: first non-main, then main, then rest
      const [firstOther, ...restOthers] = primaryOthers;
      return [firstOther, ...primaryMains, ...restOthers, ...otherMains, ...otherOthers];
    }
    
    // Default: main first
    return [...primaryMains, ...primaryOthers, ...otherMains, ...otherOthers];
  }, [photos, selectedColorId, selectedOptionValueId, mainImageSecond]);

  // Studio (white-background, cut-out) shots: when the product also has
  // real photos, hide them here — they stay on the cards / quick add. When a
  // product only has studio shots, show them as usual.
  const { studio, ready: studioReady } = useStudioPhotos(orderedImages.map((p) => p.imageUrl));
  const currentImages = useMemo(() => {
    if (orderedImages.length < 2) return orderedImages;
    const hasLifestyle = orderedImages.some((p) => studio[p.imageUrl] === false);
    if (!hasLifestyle) return orderedImages;
    return orderedImages.filter((p) => studio[p.imageUrl] !== true);
  }, [orderedImages, studio]);

  // Real (lifestyle) photos fill the tile edge to edge; only the white-
  // background studio shots are fitted and melted into the gray tile.
  const fitClass = (url?: string) =>
    url && studio[url] === false ? "object-cover object-center" : "ds-blend object-contain";

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

  // Wait for the studio check (max ~2.5s) so a hidden photo never flashes.
  if (orderedImages.length >= 2 && !studioReady) {
    return (
      <div className="grid grid-cols-1 gap-tile lg:grid-cols-2" dir={dir} aria-busy="true">
        <div className="aspect-product animate-pulse bg-beige" />
        <div className="hidden aspect-product animate-pulse bg-beige lg:block" />
      </div>
    );
  }

  if (!currentImages || currentImages.length === 0) {
    return (
      <div
        className="relative flex aspect-product items-center justify-center overflow-hidden bg-beige lg:aspect-tile"
        dir={dir}
      >
        <span className="ds-fine">{t("noImages")}</span>
      </div>
    );
  }

  const isSingle = currentImages.length === 1;

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

      {/* ======== DESKTOP LAYOUT: every image stacked in a 2-up grid on beige ======== */}
      <div className={clsx("hidden lg:grid gap-tile", isSingle ? "grid-cols-1" : "grid-cols-2")}>
        {currentImages.map((img, idx) => (
          <button
            key={img.id}
            type="button"
            className={clsx(
              "relative isolate block w-full overflow-hidden bg-beige cursor-zoom-in focus:outline-none focus-visible:ring-1 focus-visible:ring-inset focus-visible:ring-ink",
              isSingle ? "aspect-tile" : "aspect-product"
            )}
            onClick={() => {
              selectImage(idx);
              setIsLightboxOpen(true);
            }}
            aria-label={t("imageAlt", { index: idx + 1 })}
          >
            <SafeImage
              src={img.imageUrl || FALLBACK}
              alt={t("imageAlt", { index: idx + 1 })}
              className={fitClass(img.imageUrl)}
              fill
              priority={idx < 2}
              loading={idx < 2 ? "eager" : "lazy"}
              sizes={isSingle ? "66vw" : "33vw"}
            />
          </button>
        ))}
      </div>

      {/* ======== MOBILE LAYOUT: full-bleed swipeable carousel ======== */}
      <div className="lg:hidden">
        <div
          className="relative isolate aspect-product w-full overflow-hidden bg-beige cursor-zoom-in"
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
                className={fitClass(currentImages[currentImageIndex]?.imageUrl)}
                fill
                priority={true}
                loading="eager"
                sizes="100vw"
              />
            </motion.div>
          </AnimatePresence>

          {/* Mobile swipe arrows */}
          {currentImages.length > 1 && (
            <>
              <Button
                variant="ghost"
                size="icon"
                className="absolute start-0 top-1/2 z-10 -translate-y-1/2"
                onClick={(e) => {
                  e.stopPropagation();
                  dir === "rtl" ? nextImage() : prevImage();
                }}
                aria-label={dir === "rtl" ? t("next") : t("prev")}
              >
                {dir === "rtl" ? (
                  <ChevronRight className="h-4 w-4 text-ink" strokeWidth={1.25} />
                ) : (
                  <ChevronLeft className="h-4 w-4 text-ink" strokeWidth={1.25} />
                )}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="absolute end-0 top-1/2 z-10 -translate-y-1/2"
                onClick={(e) => {
                  e.stopPropagation();
                  dir === "rtl" ? prevImage() : nextImage();
                }}
                aria-label={dir === "rtl" ? t("prev") : t("next")}
              >
                {dir === "rtl" ? (
                  <ChevronLeft className="h-4 w-4 text-ink" strokeWidth={1.25} />
                ) : (
                  <ChevronRight className="h-4 w-4 text-ink" strokeWidth={1.25} />
                )}
              </Button>
            </>
          )}

          {/* Mobile position indicators — hairlines, no pills */}
          {currentImages.length > 1 && (
            <div className="absolute bottom-3 inset-x-0 z-10 flex justify-center gap-1">
              {currentImages.map((_, idx) => (
                <button
                  key={idx}
                  type="button"
                  className="flex h-4 items-center px-0.5"
                  onClick={(e) => {
                    e.stopPropagation();
                    selectImage(idx);
                  }}
                  aria-label={`Image ${idx + 1}`}
                  aria-current={idx === currentImageIndex ? "true" : undefined}
                >
                  <span
                    className={clsx(
                      "block h-px transition-[width,background-color] duration-fast",
                      idx === currentImageIndex ? "w-5 bg-ink" : "w-3 bg-ink/30"
                    )}
                  />
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ======== Lightbox Dialog ======== */}
      <Dialog open={isLightboxOpen} onOpenChange={setIsLightboxOpen}>
        <DialogContent className="max-w-[95vw] max-h-[95vh] gap-0 rounded-ds border-none bg-background p-0 shadow-none sm:rounded-ds" hideTitle accessibleTitle="Image Gallery">
          <div className="relative isolate flex h-[95vh] w-full items-center justify-center overflow-hidden bg-beige">
            {/* Close button */}
            <Button
              variant="ghost"
              size="icon"
              className="absolute end-2 top-2 z-50"
              onClick={() => setIsLightboxOpen(false)}
            >
              <X className="h-5 w-5" strokeWidth={1.25} />
            </Button>

            {/* Main image with animation */}
            <div className="relative flex h-full w-full items-center justify-center p-8">
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
                    className="ds-blend object-contain"
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
                  className="absolute start-2 top-1/2 z-50 -translate-y-1/2"
                  onClick={(e) => {
                    e.stopPropagation();
                    dir === "rtl" ? nextImage() : prevImage();
                  }}
                >
                  {dir === "rtl" ? (
                    <ChevronRight className="h-6 w-6" strokeWidth={1.25} />
                  ) : (
                    <ChevronLeft className="h-6 w-6" strokeWidth={1.25} />
                  )}
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute end-2 top-1/2 z-50 -translate-y-1/2"
                  onClick={(e) => {
                    e.stopPropagation();
                    dir === "rtl" ? prevImage() : nextImage();
                  }}
                >
                  {dir === "rtl" ? (
                    <ChevronLeft className="h-6 w-6" strokeWidth={1.25} />
                  ) : (
                    <ChevronRight className="h-6 w-6" strokeWidth={1.25} />
                  )}
                </Button>
              </>
            )}

            {/* Lightbox thumbnails strip */}
            {currentImages.length > 1 && (
              <div className="absolute bottom-4 inset-x-0 z-50 mx-auto flex w-fit max-w-[80vw] gap-tile overflow-x-auto scrollbar-hide">
                {currentImages.map((img, idx) => (
                  <button
                    key={`lb-${img.id}`}
                    type="button"
                    className={clsx(
                      "relative isolate h-12 w-12 shrink-0 overflow-hidden border bg-beige transition-[border-color,opacity] duration-fast",
                      idx === currentImageIndex
                        ? "border-ink opacity-100"
                        : "border-gray-200 opacity-60 hover:opacity-100"
                    )}
                    onClick={() => selectImage(idx)}
                  >
                    <SafeImage
                      src={img.imageUrl || FALLBACK}
                      alt=""
                      className="ds-blend object-contain"
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
