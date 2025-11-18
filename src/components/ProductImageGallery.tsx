"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, ChevronUp, ChevronDown } from "lucide-react";
import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import clsx from "clsx";

type Photo = {
  id: number;
  imageUrl: string;
  colorId: number;
  isMain: boolean;
};

interface ProductImageGalleryProps {
  photos: Photo[];
  selectedColorId: number;
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
}: {
  src: string;
  alt: string;
  className?: string;
  fill?: boolean;
  width?: number;
  height?: number;
  sizes?: string;
  priority?: boolean;
}) {
  const [failed, setFailed] = useState(false);
  const effectiveSrc = failed ? FALLBACK : src || FALLBACK;

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
    />
  );
}

const ProductImageGallery = ({
  photos,
  selectedColorId,
  thumbSide,
}: ProductImageGalleryProps) => {
  const t = useTranslations("Gallery");
  const locale = useLocale();
  const dir = locale === "ar" ? "rtl" : "ltr";

  // في العربي الترتيب يكون معكوس على الديسكتوب
  const desktopRowClass = dir === "rtl" ? "lg:flex-row-reverse" : "lg:flex-row";

  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // عرض كل الصور مع إعطاء الأولوية لصور اللون المختار
  const currentImages = useMemo(() => {
    if (!photos || photos.length === 0) return [];
    
    // صور اللون المختار
    const selectedColorPhotos = selectedColorId
      ? photos.filter((p) => p.colorId === selectedColorId)
      : [];
    
    // باقي الصور
    const otherPhotos = selectedColorId
      ? photos.filter((p) => p.colorId !== selectedColorId)
      : photos;
    
    // ترتيب صور اللون المختار: main أولاً
    const selectedMains = selectedColorPhotos.filter((p) => p.isMain);
    const selectedOthers = selectedColorPhotos.filter((p) => !p.isMain);
    
    // ترتيب باقي الصور: main أولاً
    const otherMains = otherPhotos.filter((p) => p.isMain);
    const otherOthers = otherPhotos.filter((p) => !p.isMain);
    
    // الترتيب النهائي: صور اللون المختار أولاً ثم باقي الصور
    return [...selectedMains, ...selectedOthers, ...otherMains, ...otherOthers];
  }, [photos, selectedColorId]);

  // Reset index عند تغيير اللون أو الصور
  useEffect(() => {
    setCurrentImageIndex(0);
  }, [selectedColorId, photos]);

  const nextImage = () => {
    if (currentImages.length <= 1) return;
    setCurrentImageIndex((prev) => (prev + 1) % currentImages.length);
  };

  const prevImage = () => {
    if (currentImages.length <= 1) return;
    setCurrentImageIndex(
      (prev) => (prev - 1 + currentImages.length) % currentImages.length
    );
  };

  // ====== مراجع وقياسات (بقت غير مهمة للديسكتوب لأننا لغينا عمود الثمبنيلز) ======
  const imageBoxRef = useRef<HTMLDivElement | null>(null);
  const thumbsScrollRef = useRef<HTMLDivElement | null>(null);
  const [imageHeight, setImageHeight] = useState<number | undefined>(undefined);
  const [canScrollUp, setCanScrollUp] = useState(false);
  const [canScrollDown, setCanScrollDown] = useState(false);

  useEffect(() => {
    const updateHeights = () => {
      const h = imageBoxRef.current?.getBoundingClientRect().height ?? 0;
      setImageHeight(h > 0 ? h : undefined);
      const sc = thumbsScrollRef.current;
      if (sc) {
        setCanScrollUp(sc.scrollTop > 0);
        setCanScrollDown(sc.scrollTop + sc.clientHeight < sc.scrollHeight - 1);
      }
    };

    updateHeights();
    const ro = new ResizeObserver(updateHeights);
    if (imageBoxRef.current) ro.observe(imageBoxRef.current);
    if (thumbsScrollRef.current) ro.observe(thumbsScrollRef.current);

    const to = setTimeout(updateHeights, 50);

    window.addEventListener("resize", updateHeights);
    return () => {
      window.removeEventListener("resize", updateHeights);
      clearTimeout(to);
      ro.disconnect();
    };
  }, [currentImageIndex]);

  const scrollThumbsBy = (delta: number) => {
    const sc = thumbsScrollRef.current;
    if (!sc) return;
    sc.scrollBy({ top: delta, behavior: "smooth" });
  };

  const onThumbsScroll = () => {
    const sc = thumbsScrollRef.current;
    if (!sc) return;
    setCanScrollUp(sc.scrollTop > 0);
    setCanScrollDown(sc.scrollTop + sc.clientHeight < sc.scrollHeight - 1);
  };

  if (!currentImages || currentImages.length === 0) {
    return (
      <div
        className="relative aspect-[3/4] bg-luxury-cream rounded-lg overflow-hidden flex items-center justify-center"
        dir={dir}
      >
        <span className="text-muted-foreground">{t("noImages")}</span>
      </div>
    );
  }

  return (
    <div
      className={clsx(
        "flex flex-col lg:gap-4 space-y-4 lg:space-y-0",
        desktopRowClass
      )}
      dir={dir}
    >
      {/* ======== (تم إلغاء) عمود الثمبنيلز في الديسكتوب ======== */}
      {/* كان: hidden lg:flex ...  تم تحويله إلى hidden بالكامل */}
      {currentImages.length > 1 && (
        <div className="hidden" style={{ height: imageHeight }}>
          <div
            ref={thumbsScrollRef}
            onScroll={onThumbsScroll}
            className="flex-1 overflow-hidden"
          >
            <div className="flex flex-col gap-2 pr-0.5 pl-0.5" />
          </div>
        </div>
      )}

      {/* ======== الصورة الرئيسية ======== */}
      <div className={clsx("lg:flex-1", "lg:order-2")}>
        <div
          ref={imageBoxRef}
          className={clsx(
            // موبايل وتابلت: حافظ على النسبة
            "relative aspect-[3/4] bg-luxury-cream rounded-lg overflow-hidden",
            // ديسكتوب: ارتفاع ثابت 70vh (تصغير الارتفاع)
            "lg:aspect-auto lg:h-[70vh]"
          )}
        >
          <SafeImage
            src={currentImages[currentImageIndex]?.imageUrl || FALLBACK}
            alt={t("imageAlt", { index: currentImageIndex + 1 })}
            className="object-cover"
            fill
            priority
          />

          {/* أسهم الكاروسيل — تظهر على الشاشات الصغيرة فقط */}
          {currentImages.length > 1 && (
            <>
              <Button
                variant="ghost"
                size="sm"
                className={clsx(
                  "absolute top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white/90 rounded-full p-2",
                  dir === "rtl" ? "right-2" : "left-2",
                  "lg:hidden" // إخفاء في الديسكتوب
                )}
                onClick={dir === "rtl" ? nextImage : prevImage}
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
                  dir === "rtl" ? "left-2" : "right-2",
                  "lg:hidden" // إخفاء في الديسكتوب
                )}
                onClick={dir === "rtl" ? prevImage : nextImage}
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

          {/* العداد — يظهر على الشاشات الصغيرة فقط */}
          {currentImages.length > 1 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/60 text-white px-3 py-1 rounded-full text-sm lg:hidden">
              {t("counter", {
                index: currentImageIndex + 1,
                total: currentImages.length,
              })}
            </div>
          )}
        </div>

        {/* ======== ثَمبنيلز أسفل الصورة — موبايل فقط (زي ما كانت) ======== */}
        {currentImages.length > 1 && (
          <div className="flex gap-2 overflow-x-auto mt-4 lg:hidden">
            {currentImages.map((img, index) => (
              <button
                key={img.id ?? index}
                onClick={() => setCurrentImageIndex(index)}
                className={clsx(
                  "flex-shrink-0 w-16 h-16 md:w-20 md:h-20 rounded-lg overflow-hidden border-2 transition-all",
                  index === currentImageIndex
                    ? "border-primary shadow-md"
                    : "border-gray-200 hover:border-gray-300"
                )}
                title={t("thumbTitle", { index: index + 1 })}
                aria-label={t("thumbTitle", { index: index + 1 })}
              >
                <SafeImage
                  src={img.imageUrl}
                  alt={t("thumbAlt", { index: index + 1 })}
                  className="object-cover w-full h-full"
                  width={80}
                  height={80}
                />
              </button>
            ))}
          </div>
        )}

        {/* ======== ثَمبنيلز أسفل الصورة — ديسكتوب (Grid بدون كاروسيل) ======== */}
        {currentImages.length > 1 && (
          <div className="hidden lg:grid mt-4 gap-2"
               // 6 أعمدة افتراضيًا، وتقل على الشاشات الأكبر/الأصغر حسب الحاجة
               style={{ gridTemplateColumns: "repeat(6, minmax(0, 1fr))" }}>
            {currentImages.map((img, index) => (
              <button
                key={img.id ?? index}
                onClick={() => setCurrentImageIndex(index)}
                className={clsx(
                  "w-full aspect-square rounded-lg overflow-hidden border-2 transition-all",
                  index === currentImageIndex
                    ? "border-primary shadow-md"
                    : "border-gray-200 hover:border-gray-300"
                )}
                title={t("thumbTitle", { index: index + 1 })}
                aria-label={t("thumbTitle", { index: index + 1 })}
              >
                <SafeImage
                  src={img.imageUrl}
                  alt={t("thumbAlt", { index: index + 1 })}
                  className="object-cover w-full h-full"
                  width={120}
                  height={120}
                />
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductImageGallery;
