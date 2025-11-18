"use client";

import { useState, useEffect, useMemo, lazy, Suspense } from "react";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { useCart } from "@/hooks/useCart";
import { useToast } from "@/components/ui/use-toast";
import { getOrCreateSessionId } from "@/lib/session";
import { addToCart as addToCartApi } from "@/lib/api/cart";
import type { ProductApi } from "@/lib/api/products";

import ProductImageGallery from "@/components/ProductImageGallery";
import ProductInfo from "@/components/product/ProductInfo";
import AddToCartSection from "@/components/product/AddToCartSection";

const ProductSpecifications = lazy(() => import("@/components/product/ProductSpecifications"));

type Variant = {
  id: number;
  colorId: number;
  colorNameAr?: string;
  colorNameEn?: string;
  sizeId: number;
  name: string;
  quantity: number;
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

interface ProductDetailContentProps {
  product: ProductApi;
}

export default function ProductDetailContent({ product }: ProductDetailContentProps) {
  const router = useRouter();
  const locale = useLocale();
  const isAr = locale === "ar";
  const t = useTranslations("ProductDetail");

  const { addToCart } = useCart();
  const { toast } = useToast();

  const [quantity, setQuantity] = useState(1);
  const [selectedColorId, setSelectedColorId] = useState<number>(0);
  const [selectedSize, setSelectedSize] = useState<string>("");
  const [busy, setBusy] = useState(false);

  const allColors: Color[] = product?.colors ?? [];
  const variants: Variant[] = product?.variants ?? [];
  const photos: Photo[] = product?.photos ?? [];

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

  useEffect(() => {
    if (!product?.hasSizes) return;
    if (!selectedSize) return;
    const names = uiSizes.map((s) => s.name.toLowerCase());
    if (!names.includes(selectedSize.toLowerCase())) {
      const firstAvailable = uiSizes.find((s) => !s.disabled)?.name || uiSizes[0]?.name || "";
      setSelectedSize(firstAvailable);
    }
  }, [uiSizes, product?.hasSizes, selectedSize]);

  const resolvedSizeId = useMemo(() => {
    if (!product?.hasSizes || !selectedSize) return 0;
    const match = variants.find(
      (v) =>
        v.colorId === selectedColorId &&
        v.name?.trim()?.toLowerCase() === selectedSize.trim().toLowerCase()
    );
    return match?.sizeId ?? 0;
  }, [product?.hasSizes, variants, selectedColorId, selectedSize]);

  const mainImageUrl = useMemo(() => {
    const sameColor = photos.filter((ph) => ph.colorId === selectedColorId);
    const main =
      sameColor.find((p) => p.isMain) ||
      sameColor[0] ||
      photos.find((p) => p.isMain) ||
      photos[0];
    return main?.imageUrl || "/placeholder.png";
  }, [photos, selectedColorId]);

  const totalPrice = Number(product?.price ?? 0) * quantity;

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

      await addToCartApi({
        sessionId,
        productId: product.id,
        colorId: selectedColorId ?? 0,
        sizeId: resolvedSizeId ?? 0,
        quantity,
      });

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

  const handleBuyNow = async () => {
    await handleAddToCart();
    if (!addDisabled) {
      router.push(`/${locale}/checkout`);
    }
  };

  const addDisabled =
    busy ||
    ((product?.colors?.length ?? 0) > 0 && !selectedColorId) ||
    (product?.hasSizes && !resolvedSizeId);

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* العمود الأيسر: الصور + المواصفات */}
        <div className={`order-1 lg:order-1 ${isAr ? "lg:col-start-1" : ""}`}>
          <div className="space-y-8">
            {/* الصور */}
            <ProductImageGallery
              photos={product.photos ?? []}
              selectedColorId={selectedColorId}
              thumbSide={isAr ? "right" : "left"}
            />

            {/* المواصفات - تظهر تحت الصور في الديسكتوب، وفي الآخر في الموبايل */}
            <div className="hidden lg:block">
              <Suspense fallback={<div className="h-40 animate-pulse bg-muted rounded" />}>
                <ProductSpecifications
                  product={{
                    category:
                      isAr
                        ? (product?.categories?.[0]?.arabicName || product?.categories?.[0]?.englishName || "")
                        : (product?.categories?.[0]?.englishName || product?.categories?.[0]?.arabicName || ""),
                    longDescription: isAr ? (product.descriptionAr || product.descriptionEn || "") : (product.descriptionEn || product.descriptionAr || ""),
                    materials: isAr ? "قطن 100% عالي الجودة، مريح وقابل للتنفس" : "100% high-quality cotton, comfortable and breathable",
                    care: isAr ? "يُغسل بالماء البارد، لا يُستخدم المُبيض، يُجفف على حرارة منخفضة" : "Wash with cold water, do not bleach, tumble dry low",
                  }}
                />
              </Suspense>
            </div>
          </div>
        </div>

        {/* العمود الأيمن: المعلومات */}
        <div className={`order-2 lg:order-2 ${isAr ? "lg:col-start-2" : ""}`}>
          <div className="lg:sticky lg:top-24 space-y-6">
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

      {/* المواصفات في الموبايل - في الآخر */}
      <div className="mt-12 lg:hidden">
        <Suspense fallback={<div className="h-40 animate-pulse bg-muted rounded" />}>
          <ProductSpecifications
            product={{
              category:
                isAr
                  ? (product?.categories?.[0]?.arabicName || product?.categories?.[0]?.englishName || "")
                  : (product?.categories?.[0]?.englishName || product?.categories?.[0]?.arabicName || ""),
              longDescription: isAr ? (product.descriptionAr || product.descriptionEn || "") : (product.descriptionEn || product.descriptionAr || ""),
              materials: isAr ? "قطن 100% عالي الجودة، مريح وقابل للتنفس" : "100% high-quality cotton, comfortable and breathable",
              care: isAr ? "يُغسل بالماء البارد، لا يُستخدم المُبيض، يُجفف على حرارة منخفضة" : "Wash with cold water, do not bleach, tumble dry low",
            }}
          />
        </Suspense>
      </div>
    </>
  );
}
