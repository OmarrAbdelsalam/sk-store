"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { useCart } from "@/hooks/useCart";
import { getOrCreateSessionId } from "@/lib/session";
import { suppressCartDrawer } from "@/lib/cart-drawer";
import { addToCart as addToCartApi, getCart, updateItemQuantity } from "@/lib/api/cart";
import type { ProductApi } from "@/lib/api/products";

import ProductImageGallery from "@/components/ProductImageGallery";
import ProductInfo from "@/components/product/ProductInfo";
import AddToCartSection from "@/components/product/AddToCartSection";
import ProductSpecifications from "@/components/product/ProductSpecifications";
import RelatedProducts from "@/components/product/RelatedProducts";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:5000";

// Helper function to get image URL
// For Dropbox paths (starting with /), we return as-is - components will fetch fresh links
// For http URLs, we return as-is
// For relative paths, we prepend API_BASE
function getImageUrl(filePath: string): string {
  if (!filePath) return "/placeholder.png";
  // Dropbox paths start with /
  if (filePath.startsWith('/') && !filePath.startsWith('/placeholder')) {
    // Return as-is - let DropboxImage handle it
    return filePath;
  }
  if (filePath.startsWith('http')) return filePath;
  return `${API_BASE}/uploads/${filePath}`;
}

// Convert ProductPhoto to the format expected by ProductImageGallery
function mapPhotosForGallery(photos: ProductApi['photos']) {
  return photos.map(p => ({
    id: p.id,
    imageUrl: getImageUrl(p.imageUrl),
    colorId: p.colorId ?? "",
    optionValueId: p.optionValueId ?? "",
    isMain: p.isMain,
  }));
}

interface ProductDetailContentProps {
  product: ProductApi;
  /** url → is a white-background studio shot (computed on the server). */
  studioMap?: Record<string, boolean>;
}

export default function ProductDetailContent({ product, studioMap }: ProductDetailContentProps) {
  const router = useRouter();
  const locale = useLocale();
  const isAr = locale === "ar";
  const t = useTranslations("ProductDetail");

  const { addToCart } = useCart();

  const [quantity, setQuantity] = useState(1);
  const [selectedColorId, setSelectedColorId] = useState<string>("");
  const [selectedSizeId, setSelectedSizeId] = useState<string>("");
  const [selectedVariantId, setSelectedVariantId] = useState<string>("");
  const [selectedChainId, setSelectedChainId] = useState<string>("");
  const [busy, setBusy] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const allColors = product?.colors ?? [];
  const variants = product?.variants ?? [];
  const photos = product?.photos ?? [];
  const options = product?.options ?? [];

  // Find color and size options from product options
  const colorOption = options.find((o: any) => 
    o.name_en?.toLowerCase().includes('color') || 
    o.name_ar?.includes('لون')
  );
  const sizeOption = options.find((o: any) => 
    o.name_en?.toLowerCase().includes('size') || 
    o.name_ar?.includes('مقاس')
  );

  // Find chain type option
  const chainOption = options.find((o: any) => 
    o.name_en?.toLowerCase().includes('chain') || 
    o.name_ar?.includes('سلسلة')
  );

  // Initialize selections
  useEffect(() => {
    if (!product) return;
    
    // Select first available color
    if (allColors.length > 0 && !selectedColorId) {
      setSelectedColorId(allColors[0].id);
    }
    
    // Select first variant if no selections
    if (variants.length > 0 && !selectedVariantId) {
      const firstInStock = variants.find(v => (v.quantity ?? 0) > 0) || variants[0];
      if (firstInStock) {
        setSelectedVariantId(firstInStock.id);
        
        // Extract color and size from variant option_values
        (firstInStock as any).option_values?.forEach((ov: any) => {
          if (ov.option_name_en?.toLowerCase().includes('color')) {
            // Find matching color by name
            const matchingColor = allColors.find(c => 
              c.colorNameEn === ov.value_en || c.colorNameAr === ov.value_ar
            );
            if (matchingColor) {
              setSelectedColorId(matchingColor.id);
            }
          }
          if (ov.option_name_en?.toLowerCase().includes('size')) {
            setSelectedSizeId(ov.id);
          }
        });
      }
    }
  }, [product, variants, allColors, selectedColorId, selectedVariantId]);

  // Default chain selection to Silver
  useEffect(() => {
    if (chainOption && !selectedChainId) {
      const silver = chainOption.values.find((v: any) => 
        v.value_en?.toLowerCase() === 'silver'
      );
      if (silver) {
        setSelectedChainId(silver.id);
      }
    }
  }, [chainOption, selectedChainId]);

  // Map colors to UI format
  const uiColors = useMemo(() => {
    return allColors.map((c) => ({
      id: c.id,
      label: isAr 
        ? (c.colorNameAr || c.colorNameEn || `Color`) 
        : (c.colorNameEn || c.colorNameAr || `Color`),
      hexa: c.hexa,
      disabled: false,
    }));
  }, [allColors, isAr]);

  // Map sizes to UI format (from product options)
  const uiSizes = useMemo(() => {
    if (!sizeOption) return [];
    return (sizeOption.values || []).map((v: any) => ({
      id: v.id,
      name: isAr ? (v.value_ar || v.value_en) : (v.value_en || v.value_ar),
      disabled: false,
    }));
  }, [sizeOption, isAr]);

  // Find matching variant based on selections
  const matchingVariant = useMemo(() => {
    if (!selectedColorId && !selectedSizeId) return variants[0];
    
    return variants.find(v => {
      const optionValues = (v as any).option_values || [];
      
      // Check if variant matches selected color
      let colorMatch = !selectedColorId;
      let sizeMatch = !selectedSizeId;
      
      optionValues.forEach((ov: any) => {
        if (selectedColorId) {
          const matchingColor = allColors.find(c => c.id === selectedColorId);
          if (matchingColor) {
            const valEn = (ov.value_en || "").toString().toLowerCase().trim();
            const valAr = (ov.value_ar || "").toString().toLowerCase().trim();
            const colorEn = (matchingColor.colorNameEn || "").toString().toLowerCase().trim();
            const colorAr = (matchingColor.colorNameAr || "").toString().toLowerCase().trim();
            
            if (valEn === colorEn || valAr === colorAr || valEn.includes(colorEn) || colorEn.includes(valEn)) {
              colorMatch = true;
            }
          }
        }
        if (selectedSizeId && String(ov.id) === String(selectedSizeId)) {
          sizeMatch = true;
        }
      });
      
      return colorMatch && sizeMatch;
    }) || variants[0];
  }, [variants, selectedColorId, selectedSizeId, allColors]);

  // Update selectedVariantId when matching variant changes
  useEffect(() => {
    if (matchingVariant) {
      setSelectedVariantId(matchingVariant.id);
    }
  }, [matchingVariant]);

  // Get main image based on selected color and chain type
  const mainImageUrl = useMemo(() => {
    // Try to find image matching both color and chain type
    let candidates = photos;
    
    if (selectedColorId) {
      const colorFiltered = photos.filter((ph) => ph.colorId === selectedColorId);
      if (colorFiltered.length > 0) candidates = colorFiltered;
    }
    
    if (selectedChainId && candidates.length > 0) {
      const chainFiltered = candidates.filter((ph) => ph.optionValueId === selectedChainId);
      if (chainFiltered.length > 0) candidates = chainFiltered;
    }
    
    const main = candidates.find((p) => p.isMain) || candidates[0] || photos.find((p) => p.isMain) || photos[0];
    return main ? getImageUrl(main.imageUrl) : "/placeholder.png";
  }, [photos, selectedColorId, selectedChainId]);

  const [cartItems, setCartItems] = useState<any[]>([]);
  const addToCartSentinelRef = useRef<HTMLDivElement>(null);

  // Fetch cart on load
  useEffect(() => {
    let cancelled = false;
    
    const fetchCartItems = async () => {
      try {
        const sessionId = getOrCreateSessionId();
        const cartData = await getCart(sessionId);
        if (!cancelled) {
          setCartItems(cartData.items || []);
        }
      } catch (error) {
        if (!cancelled) {
          console.error('Error fetching cart:', error);
          setCartItems([]);
        }
      }
    };
    
    const timer = setTimeout(fetchCartItems, 100);
    
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, []);

  // Calculate available stock
  const { availableStock, quantityInCart } = useMemo(() => {
    if (!product) return { availableStock: 0, quantityInCart: 0 };
    
    // Force unlimited stock logic
    const stockInInventory = 999; // matchingVariant?.quantity ?? 0;
    
    // Calculate quantity in cart for this variant
    const qtyInCart = cartItems.reduce((total, item) => {
      if (item.variant_id === matchingVariant?.id) {
        return total + (item.quantity || 0);
      }
      return total;
    }, 0);
    
    return { 
      // Ensure availableStock is high enough
      availableStock: 999, 
      quantityInCart: qtyInCart 
    };
  }, [product, matchingVariant, cartItems]);

  // Reset quantity when selection changes
  useEffect(() => {
    if (availableStock > 0 && quantity > availableStock) {
      setQuantity(availableStock);
    } else if (availableStock === 0 && quantity > 1) {
      setQuantity(1);
    }
  }, [selectedColorId, selectedSizeId, availableStock, quantity]);

  const totalPrice = Number(product?.price ?? 0) * quantity;

  // Buy now after Add to cart must not add the same selection twice.
  const selectionKey = `${product?.id ?? ""}|${selectedColorId ?? ""}|${selectedSizeId ?? ""}|${selectedChainId ?? ""}`;
  const lastAddedKeyRef = useRef<string | null>(null);

  const handleAddToCart = async () => {
    if (!product) return;
    const sessionId = getOrCreateSessionId();
    setErrorMessage(null);

    // Relaxed validation: "This site doesn't have variants" mode
    // If user hasn't selected specific options, we just grab the first available variant
    // effectively treating it as a simple product.
    
    let targetVariant = matchingVariant;
    
    // Fallback to first variant if no specific match
    if (!targetVariant && variants.length > 0) {
       targetVariant = variants[0];
    }

    /*
    if (!targetVariant) {
      // Should not happen due to self-healing backend, but just in case
      // We can try to proceed if the API supports productId-only (it might not, but let's try or error)
      setErrorMessage(isAr ? "حدث خطأ غير متوقع، حاول التحديث" : "Unexpected error, please refresh");
      return;
    }
    */

    /* 
    // Validation removed as per user request to treat product as simple
    if (allColors.length > 0 && !selectedColorId) {
      setErrorMessage(t("chooseColorFirst"));
      return;
    }
    if (uiSizes.length > 0 && !selectedSizeId) {
      setErrorMessage(t("chooseSizeFirst"));
      return;
    }
    */
    
    if (quantity > availableStock) {
       // Logic to allow adding even if local stock says no (backend will handle/fake it)
       // setErrorMessage(t("availableQuantity", { quantity: availableStock }));
       // return;
    }

    try {
      setBusy(true);

      // Get color and size names for the cart item
      const selectedColor = allColors.find(c => c.id === selectedColorId);
      const selectedSize = uiSizes.find((s: any) => s.id === selectedSizeId);

      // Add to local cart only (no API call - using localStorage)
      addToCart({
        productId: String(product.id),
        name: isAr ? (product.nameAr || product.nameEn || "") : (product.nameEn || product.nameAr || ""),
        nameAr: product.nameAr || "",
        nameEn: product.nameEn || "",
        price: `${Number(product.price ?? 0)} EGP`,
        // Carried into the cart so the discount stays visible after the product
        // page — same figure that's struck through above the price here.
        beforePrice: product.beforePrice ?? undefined,
        image: mainImageUrl,
        colorId: selectedColorId || undefined,
        colorName: selectedColor ? (isAr ? (selectedColor.colorNameAr || selectedColor.colorNameEn || undefined) : (selectedColor.colorNameEn || selectedColor.colorNameAr || undefined)) : undefined,
        colorNameAr: selectedColor?.colorNameAr || undefined,
        colorNameEn: selectedColor?.colorNameEn || undefined,
        sizeId: selectedSizeId || undefined,
        sizeName: selectedSize?.name,
        availableStock: availableStock,
      }, quantity);
      lastAddedKeyRef.current = selectionKey;

    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : t("unknownError");
      console.error("AddToCart Error:", e);
      setErrorMessage(msg);
    } finally {
      setBusy(false);
    }
  };

  const handleBuyNow = async () => {
    // Going straight to checkout — skip the cart drawer.
    suppressCartDrawer();
    // Already added from this page with the same colour/size/option → just
    // go to checkout. Otherwise (Buy now pressed directly) add it first.
    if (lastAddedKeyRef.current === selectionKey) {
      router.push(`/checkout`);
      return;
    }
    await handleAddToCart();
    if (!addDisabled) {
      router.push(`/checkout`);
    }
  };

  const addDisabled =
    busy ||
    availableStock === 0 ||
    (allColors.length > 0 && !selectedColorId) ||
    (uiSizes.length > 0 && !selectedSizeId);

  // Convert photos for gallery component
  const galleryPhotos = mapPhotosForGallery(photos);

  const productDescription = isAr
    ? (product.descriptionAr || product.descriptionEn || "")
    : (product.descriptionEn || product.descriptionAr || "");

  return (
    <>
      <div className="lg:flex lg:items-start lg:gap-gutter-lg">
        {/* Start side (~2/3): gallery — full-bleed on phone, 2-up grid on desktop */}
        <div className="min-w-0 lg:flex-1">
          <ProductImageGallery
            photos={galleryPhotos}
            selectedColorId={selectedColorId}
            selectedOptionValueId={selectedChainId}
            thumbSide={isAr ? "right" : "left"}
            mainImageSecond={!!product?.main_image_second}
            studioMap={studioMap}
          />
        </div>

        {/* End side: narrow sticky info column */}
        <div className="px-gutter pt-6 lg:sticky lg:top-header-desktop lg:w-[460px] lg:shrink-0 lg:ps-12 lg:pe-gutter-lg lg:pt-section xl:w-[520px]">
          {/* Sentinel: observed to show/hide the sticky add to cart bar */}
          <div ref={addToCartSentinelRef} />
          <div className="flex flex-col gap-6">
            <ProductInfo
              name={isAr ? (product.nameAr || product.nameEn || "") : (product.nameEn || product.nameAr || "")}
              price={Number(product.price ?? 0)}
              beforePrice={product.beforePrice}
              productId={String(product.id)}
              selectedColorId={selectedColorId}
              selectedSize={uiSizes.find((s: any) => s.id === selectedSizeId)?.name || ""}
              quantity={quantity}
              onColorChangeId={(colorId) => {
                const color = allColors.find(c => c.id === colorId);
                if (color) {
                  setSelectedColorId(color.id);
                  setQuantity(1);
                }
              }}
              onSizeChange={(sizeName) => {
                const size = uiSizes.find((s: any) => s.name === sizeName);
                if (size) {
                  setSelectedSizeId(size.id);
                  setQuantity(1);
                }
              }}
              onQuantityChange={setQuantity}
              colorOptions={uiColors.map(c => ({ ...c, hexa: c.hexa ?? undefined }))}
              sizeOptions={uiSizes}
              hasSizes={uiSizes.length > 0}
              sizeChartUrl={product.sizeChartImageUrl ?? undefined}
              maxQuantity={availableStock}
              quantityInCart={quantityInCart}
              chainOptions={chainOption ? chainOption.values.map((v: any) => ({
                id: v.id,
                name: isAr ? (v.value_ar || v.value_en) : (v.value_en || v.value_ar),
              })) : []}
              selectedChainId={selectedChainId}
              onChainChange={(id) => setSelectedChainId(id)}
            />

            {errorMessage && (
              <div className="bg-danger-soft p-3 text-fine text-danger" role="alert">
                {errorMessage}
              </div>
            )}

            <AddToCartSection
              totalPrice={Number(totalPrice.toFixed(2))}
              onAddToCart={handleAddToCart}
              onBuyNow={handleBuyNow}
              disabled={addDisabled}
              inlineRef={addToCartSentinelRef}
              productId={product ? String(product.id) : undefined}
              productName={
                product
                  ? (isAr
                      ? product.nameAr || product.nameEn
                      : product.nameEn || product.nameAr) || undefined
                  : undefined
              }
            />

            {/* Tabs: Services / Description / Details / Care */}
            <ProductSpecifications
              product={{
                category:
                  isAr
                    ? (product?.categories?.[0]?.arabicName || product?.categories?.[0]?.englishName || "")
                    : (product?.categories?.[0]?.englishName || product?.categories?.[0]?.arabicName || ""),
                longDescription: productDescription,
                // Real material only — no invented fabric copy.
                materials: (isAr
                  ? product.material_ar?.trim() || product.material_en?.trim()
                  : product.material_en?.trim() || product.material_ar?.trim()) || (product as any).material?.trim() || "",
                // General care for a hand-crocheted bag (not clothing).
                care: isAr
                  ? "نظفيها بقطعة قماش مبلولة بهدوء على المكان المتبقع بس. متتغسلش في الغسالة ومتتنشفش في النشافة. خزنيها محشية بورق عشان تحافظ على شكلها، وبعيد عن الشمس المباشرة."
                  : "Spot clean gently with a damp cloth. Do not machine wash or tumble dry. Store it stuffed with paper to keep its shape, away from direct sunlight.",
              }}
            />
          </div>
        </div>
      </div>

      {/* Related products ("You may also like") */}
      <RelatedProducts 
        currentProductId={product?.id || 0}
        relatedProducts={(product?.relatedProducts || []).map(rp => ({
          id: rp.id,
          nameAr: rp.nameAr,
          nameEn: rp.nameEn,
        }))}
        categoryId={product?.categories?.[0]?.id}
      />
    </>
  );
}
