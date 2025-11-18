"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";

import { useCart } from "@/hooks/useCart";
import { useProducts } from "@/hooks/useProducts";
import { useProduct } from "@/hooks/useProduct";

import ProductImageGallery from "@/components/ProductImageGallery";
import ProductInfo from "@/components/product/ProductInfo";
import ProductHeader from "@/components/product/ProductHeader";
import ProductSpecifications from "@/components/product/ProductSpecifications";
import AddToCartSection from "@/components/product/AddToCartSection";
import RelatedProducts from "@/components/product/RelatedProducts";

import { getOrCreateSessionId } from "@/lib/session";
import { useToast } from "@/components/ui/use-toast";
import { addToCart as addToCartApi } from "@/lib/api/cart";

/* ================= Types returned by Product API ================= */
type Variant = {
  id: number;
  colorId: number;
  colorNameAr?: string;
  colorNameEn?: string;
  sizeId: number;
  name: string;      // e.g., S/M/XL
  quantity: number;  // stock
};

type Color = {
  id: number;
  colorNameAr?: string;
  colorNameEn?: string;
  hexa?: string;
};

type Photo = {
  id: number;
  imageUrl: string;
  colorId: number;
  isMain: boolean;
};

export default function ProductDetailPage() {
  const router = useRouter();
  const locale = useLocale();
  const isAr = locale === "ar";
  const dir = isAr ? "rtl" : "ltr";
  const t = useTranslations("ProductDetail");

  const params = useParams<{ id: string }>();
  const id = Array.isArray(params?.id) ? params?.id[0] : params?.id;
  const numericId = Number.parseInt(id ?? "0", 10);

  const { addToCart } = useCart();
  const { products } = useProducts(); // لعرض المنتجات المتعلقة
  const { toast } = useToast();

  // ✅ منتج واحد من الـ API
  const { product, isLoading, error } = useProduct(
    Number.isFinite(numericId) ? numericId : undefined
  );

  /* ================= UI state ================= */
  const [quantity, setQuantity] = useState(1);
  const [selectedColorId, setSelectedColorId] = useState<number>(0);
  const [selectedSize, setSelectedSize] = useState<string>("");

  const [embroideryOneSide] = useState(false);
  const [embroideryTwoSides] = useState(false);
  const [embroideryName] = useState("");
  const [addLogo] = useState(false);
  const [logoFile] = useState<File | null>(null);
  const [notes] = useState("");
  const [busy, setBusy] = useState(false);

  /* ================= Derived data ================= */
  const allColors: Color[] = useMemo(() => product?.colors ?? [], [product?.colors]);
  const variants: Variant[] = useMemo(() => product?.variants ?? [], [product?.variants]);
  const photos: Photo[] = useMemo(() => product?.photos ?? [], [product?.photos]);

  /* ================= Initial assumptions ================= */
  useEffect(() => {
    if (!product) return;
    const firstInStock = variants.find(v => (v.quantity ?? 0) > 0) || variants[0];

    if (firstInStock) {
      setSelectedColorId(prev => prev || firstInStock.colorId);
      setSelectedSize(prev => prev || (product.hasSizes ? (firstInStock.name || "") : ""));
    } else {
      setSelectedColorId(prev => prev || (allColors?.[0]?.id ?? 0));
      setSelectedSize("");
    }
  }, [product, variants, allColors]);

  /* ================= UI Colors (disable colors with no stock when hasSizes) ================= */
  const uiColors = useMemo(() => {
    return allColors.map((c) => {
      const hasStockForThisColor = variants.some(
        (v) => v.colorId === c.id && (v.quantity ?? 0) > 0
      );
      return {
        id: c.id,
        label: isAr ? (c.colorNameAr || c.colorNameEn || `Color ${c.id}`) : (c.colorNameEn || c.colorNameAr || `Color ${c.id}`),
        hexa: c.hexa,
        disabled: !!product?.hasSizes && !hasStockForThisColor,
      };
    });
  }, [allColors, variants, product?.hasSizes, isAr]);

  /* ================= UI Sizes for selected color ================= */
  const uiSizes = useMemo(() => {
    if (!product?.hasSizes) return [];
    const pool = selectedColorId
      ? variants.filter((v) => v.colorId === selectedColorId)
      : variants;

    const map = new Map<string, { name: string; disabled: boolean }>();
    for (const v of pool) {
      const name = v.name?.trim() || "";
      if (!name) continue;
      const inStock = (v.quantity ?? 0) > 0;
      const existed = map.get(name);
      if (!existed) map.set(name, { name, disabled: !inStock });
      else if (inStock) map.set(name, { name, disabled: false });
    }
    return Array.from(map.values());
  }, [product?.hasSizes, variants, selectedColorId]);

  /* ================= If color changes and current size becomes invalid ================= */
  useEffect(() => {
    if (!product?.hasSizes) return;
    if (!selectedSize) return;
    const names = uiSizes.map((s) => s.name.toLowerCase());
    if (!names.includes(selectedSize.toLowerCase())) {
      const firstAvailable = uiSizes.find((s) => !s.disabled)?.name || uiSizes[0]?.name || "";
      setSelectedSize(firstAvailable);
    }
  }, [uiSizes, product?.hasSizes, selectedSize]);

  /* ================= Resolve sizeId for selectedSize before submit ================= */
  const resolvedSizeId = useMemo(() => {
    if (!product?.hasSizes || !selectedSize) return 0;
    const match = variants.find(
      (v) =>
        v.colorId === selectedColorId &&
        v.name?.trim()?.toLowerCase() === selectedSize.trim().toLowerCase()
    );
    return match?.sizeId ?? 0;
  }, [product?.hasSizes, variants, selectedColorId, selectedSize]);

  /* ================= Main image for selected color ================= */
  const mainImageUrl = useMemo(() => {
    const sameColor = photos.filter((ph) => ph.colorId === selectedColorId);
    const main =
      sameColor.find((p) => p.isMain) ||
      sameColor[0] ||
      photos.find((p) => p.isMain) ||
      photos[0];
    return main?.imageUrl || "/placeholder.png";
  }, [photos, selectedColorId]);

  /* ================= Add-ons price ================= */
  const addOnsPrice = useMemo(() => {
    let sum = 0;
    if (embroideryOneSide) sum += 25;
    if (embroideryTwoSides) sum += 45;
    return sum;
  }, [embroideryOneSide, embroideryTwoSides]);

  /* ================= Total price ================= */
  const totalPrice = useMemo(() => {
    const base = Number(product?.price ?? 0);
    return (base + addOnsPrice) * quantity;
  }, [product, addOnsPrice, quantity]);

  /* ================= Buy Now ================= */
  const handleBuyNow = async () => {
    await handleAddToCart();
    if (!addDisabled) {
      router.push(`/${locale}/checkout`);
    }
  };

  /* ================= Add to Cart ================= */
  const handleAddToCart = async () => {
    if (!product) return;
    const sessionId = getOrCreateSessionId();

    if ((product.colors?.length ?? 0) > 0 && !selectedColorId) {
      toast({ title: t("chooseColorFirst"), variant: "destructive" });
      return;
    }
    if (product.hasSizes && !resolvedSizeId) {
      toast({ title: t("chooseSizeFirst"), variant: "destructive" });
      return;
    }

    try {
      setBusy(true);

      // API
      await addToCartApi({
        sessionId,
        productId: product.id,
        colorId: selectedColorId ?? 0,
        sizeId: resolvedSizeId ?? 0,
        quantity,
      });

      const colorLabel =
        allColors.find(c => c.id === selectedColorId)?.colorNameAr ||
        allColors.find(c => c.id === selectedColorId)?.colorNameEn ||
        "";

      const addOns: string[] = [];
      if (embroideryOneSide) addOns.push(`Embroidery (One Side): ${embroideryName}`);
      if (embroideryTwoSides) addOns.push(`Embroidery (Two Sides): ${embroideryName}`);
      if (addLogo && logoFile) addOns.push("Custom Logo");

      // ✅ إصلاح توقيع الدالة: وسيط واحد فقط
      addToCart({
        id: product.id,
        name: isAr ? (product.nameAr || product.nameEn || "") : (product.nameEn || product.nameAr || ""),
        price: `${Number(product.price ?? 0)} EGP`,
        image: mainImageUrl,
      });

      toast({ title: t("addedToCart"), description: t("savedSelections") });
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : t("unknownError");
      toast({
        title: t("addFailed"),
        description: msg,
        variant: "destructive",
      });
    } finally {
      setBusy(false);
    }
  };

  const addDisabled =
    busy ||
    ((product?.colors?.length ?? 0) > 0 && !selectedColorId) ||
    (product?.hasSizes && !resolvedSizeId);

  /* ================= Loading / Error ================= */
  if (isLoading) {
    return (
      <div className="min-h-screen" dir={dir}>
        <div className="container mx-auto px-4 py-6">
          <ProductHeader onBack={() => router.back()} />
          <div className="animate-pulse space-y-4">
            <div className="h-8 w-1/3 bg-muted rounded" />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              <div className="aspect-[3/4] bg-muted rounded" />
              <div className="space-y-4">
                <div className="h-6 w-1/2 bg-muted rounded" />
                <div className="h-6 w-1/3 bg-muted rounded" />
                <div className="h-10 w-full bg-muted rounded" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen" dir={dir}>
        <div className="container mx-auto px-4 py-6">
          <ProductHeader onBack={() => router.back()} />
          <p className="text-destructive">
            {isAr ? "المنتج غير موجود أو حدث خطأ في التحميل." : "Product not found or failed to load."}
          </p>
        </div>
      </div>
    );
  }

  /* ================= Main render ================= */
  return (
    <div className="min-h-screen" dir={dir}>
      <div className="container mx-auto px-4 py-4">
        <ProductHeader onBack={() => router.back()} />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* عمود الصور + المواصفات (يمين في العربي) */}
          <div className={isAr ? "lg:col-start-1" : ""}>
            <div className="space-y-6">
              <ProductImageGallery
                photos={product.photos ?? []}
                selectedColorId={selectedColorId}
                thumbSide={isAr ? "right" : "left"}
              />

              {/* المواصفات تحت الصور */}
              <ProductSpecifications
                product={{
                  category:
                    isAr
                      ? (product?.categories?.[0]?.arabicName || product?.categories?.[0]?.englishName || "")
                      : (product?.categories?.[0]?.englishName || product?.categories?.[0]?.arabicName || ""),
                  longDescription: isAr ? (product.descriptionAr || product.descriptionEn || "") : (product.descriptionEn || product.descriptionAr || ""),
                  materials: isAr ? "مواد عالية الجودة" : "High-quality materials",
                  care: isAr ? "اغسل بالماء البارد" : "Wash with cold water",
                  shippingReturn: isAr
                    ? "شحن مجاني للطلبات التي تزيد عن 200 جنيه مصري. يُمكن الإرجاع خلال 30 يومًا من تاريخ الشراء."
                    : "Free shipping for orders over EGP 200. Returns accepted within 30 days of purchase."
                }}
              />
            </div>
          </div>

          {/* عمود المعلومات والاختيارات وزر الإضافة للسلة (Sticky) */}
          <div className={isAr ? "lg:col-start-2" : ""}>
            <div className="lg:sticky lg:top-24 space-y-8">
              <ProductInfo
                name={isAr ? (product.nameAr || product.nameEn || "") : (product.nameEn || product.nameAr || "")}
                description={isAr ? (product.descriptionAr || product.descriptionEn || "") : (product.descriptionEn || product.descriptionAr || "")}
                price={Number(product.price ?? 0)}
                selectedColorId={selectedColorId}
                selectedSize={selectedSize}
                quantity={quantity}
                onColorChangeId={setSelectedColorId}
                onSizeChange={setSelectedSize}
                onQuantityChange={setQuantity}
                colorOptions={uiColors}
                sizeOptions={uiSizes}
                hasSizes={!!product.hasSizes}
                sizeChartUrl={product.sizeChartImageUrl}
              />

              

              <AddToCartSection
                totalPrice={Number(totalPrice.toFixed(2))}
                onAddToCart={handleAddToCart}
                onBuyNow={handleBuyNow}
                disabled={addDisabled}
              />
            </div>
          </div>
        </div>

        {/* منتجات متعلقة خارج الجريد عشان sticky يقف هنا */}
        <RelatedProducts products={products} currentProductId={numericId} />
      </div>
    </div>
  );
}
