"use client";

import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { Check, Minus, Plus, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import DropboxImage from "@/components/DropboxImage";
import { useCart } from "@/hooks/useCart";
import { formatPrice } from "@/lib/price";

/**
 * Quick add — Dead Sea Luxe pattern, in this theme's tokens.
 * Desktop: 760×380 window, image 380×380 on the start side, info column
 * (32/28px padding): name, price, colour options, quantity stepper + "Add to
 * cart · price", "View full details". Phone: image on top, info below.
 * Backdrop black/45. Esc / backdrop / × close it.
 */

type Color = { id: string | number; colorNameEn?: string | null; colorNameAr?: string | null; hexa?: string | null };

interface QuickAddModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product: {
    id: string | number;
    name: string;
    price: string;
    priceNum: number;
    image: string;
    raw?: any;
  };
  initialColorId?: string | number | null;
}

export default function QuickAddModal({ open, onOpenChange, product, initialColorId = null }: QuickAddModalProps) {
  const locale = useLocale();
  const isAr = locale === "ar";
  const router = useRouter();
  const { addToCart } = useCart();

  const raw = product.raw ?? {};
  const colors: Color[] = raw.colors ?? [];
  const photos: any[] = raw.photos ?? [];
  const variant = raw.variants?.[0];
  const stock = Number(variant?.quantity ?? 0);
  const soldOut = (raw.variants?.length ?? 0) > 0 && stock <= 0;
  const maxQty = stock > 0 ? stock : 99;

  const [colorId, setColorId] = React.useState<string | number | null>(initialColorId ?? colors[0]?.id ?? null);
  const [qty, setQty] = React.useState(1);
  const [added, setAdded] = React.useState(false);

  // Reset each time it opens.
  React.useEffect(() => {
    if (open) {
      setColorId(initialColorId ?? colors[0]?.id ?? null);
      setQty(1);
      setAdded(false);
    }
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  const color = colors.find((c) => String(c.id) === String(colorId)) ?? null;
  const colorName = (c: Color | null) =>
    c ? (isAr ? c.colorNameAr || c.colorNameEn : c.colorNameEn || c.colorNameAr) || "" : "";

  // Main photo for the chosen colour (falls back to the product's main photo).
  const image = React.useMemo(() => {
    const forColor = colorId !== null
      ? photos.filter((p) => String(p.color_id ?? p.colorId) === String(colorId))
      : photos;
    const list = (forColor.length ? forColor : photos).slice().sort(
      (a, b) => Number(Boolean(b.isMain || b.is_main)) - Number(Boolean(a.isMain || a.is_main))
    );
    return (list[0]?.file_path ?? list[0]?.imageUrl) || product.image;
  }, [colorId, photos, product.image]);

  const before = Number(raw.beforePrice ?? raw.compareAtPrice) || 0;
  const onSale = before > product.priceNum && product.priceNum > 0;
  const currency = isAr ? "ج.م" : "EGP";
  const total = formatPrice(product.priceNum * qty, locale);

  const productHref = `/product/${product.id}`;

  const handleAdd = () => {
    if (soldOut) return;
    addToCart(
      {
        productId: String(product.id),
        name: product.name,
        nameAr: raw.nameAr || "",
        nameEn: raw.nameEn || "",
        price: `${product.priceNum} EGP`,
        beforePrice: raw.beforePrice ?? undefined,
        image,
        colorId: color ? String(color.id) : undefined,
        colorName: colorName(color) || undefined,
        colorNameAr: color?.colorNameAr || undefined,
        colorNameEn: color?.colorNameEn || undefined,
        sizeId: variant?.sizeId || undefined,
        sizeName: variant?.name || undefined,
        availableStock: stock || 999,
      },
      qty
    );
    setAdded(true);
    // Close right away — the cart drawer slides in as the confirmation.
    onOpenChange(false);
  };

  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-[100] bg-black/45 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <DialogPrimitive.Content
          dir={isAr ? "rtl" : "ltr"}
          onClick={(e) => e.stopPropagation()}
          // Don't drop keyboard focus on the × when it opens (it drew a focus
          // box); focus the window itself instead.
          onOpenAutoFocus={(e) => {
            e.preventDefault();
            (e.currentTarget as HTMLElement | null)?.focus?.();
          }}
          tabIndex={-1}
          className="fixed left-1/2 top-1/2 z-[101] flex max-h-[90vh] w-[calc(100%-32px)] max-w-[760px] -translate-x-1/2 -translate-y-1/2 flex-col overflow-y-auto bg-white text-ink outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 md:max-h-none md:min-h-[380px] md:flex-row md:overflow-visible"
        >
          <DialogPrimitive.Close
            aria-label={isAr ? "إغلاق" : "Close"}
            className="absolute end-2 top-2 z-10 flex size-11 items-center justify-center text-ink transition-opacity duration-fast hover:opacity-60"
          >
            <X className="size-[18px]" strokeWidth={1.3} />
          </DialogPrimitive.Close>

          {/* Media */}
          <a
            href={productHref}
            onClick={(e) => {
              e.preventDefault();
              onOpenChange(false);
              router.push(productHref);
            }}
            className="ds-cutout-frame relative block aspect-square w-full shrink-0 overflow-hidden md:size-[380px]"
          >
            <DropboxImage
              src={image}
              alt={product.name}
              fill
              sizes="(min-width: 760px) 380px, 100vw"
              className="ds-cutout object-center"
              showLoader={false}
            />
          </a>

          {/* Info */}
          <div className="flex min-w-0 flex-1 flex-col px-7 pb-7 pt-8">
            <div className="flex flex-col gap-2 pe-8">
              <DialogPrimitive.Title asChild>
                <a
                  href={productHref}
                  onClick={(e) => {
                    e.preventDefault();
                    onOpenChange(false);
                    router.push(productHref);
                  }}
                  className="ds-title-sm hover:opacity-70"
                >
                  {product.name}
                </a>
              </DialogPrimitive.Title>
              <div className="flex items-baseline gap-2 font-sans text-[18px] font-semibold">
                {onSale && (
                  <span className="text-[15px] font-normal text-ink/55 line-through">
                    {formatPrice(before, locale)}
                  </span>
                )}
                <span className={onSale ? "text-accent-2" : "text-ink"}>{formatPrice(product.priceNum, locale)}</span>
              </div>
            </div>

            {/* Variation: colour */}
            {colors.length > 0 && (
              <div className="mt-6">
                <p className="font-sans text-[13px] text-ink/65">
                  {isAr ? "اللون" : "Color"}: <span className="text-ink">{colorName(color)}</span>
                </p>
                <div className="mt-3 flex flex-wrap gap-2" role="radiogroup" aria-label={isAr ? "اللون" : "Color"}>
                  {colors.map((c) => {
                    const selected = String(c.id) === String(colorId);
                    return (
                      <button
                        key={String(c.id)}
                        type="button"
                        role="radio"
                        aria-checked={selected}
                        aria-label={colorName(c)}
                        title={colorName(c)}
                        onClick={() => setColorId(c.id)}
                        className={`flex size-7 items-center justify-center border p-[2px] transition-colors duration-fast ${
                          selected ? "border-ink" : "border-transparent hover:border-gray-400"
                        }`}
                      >
                        {/* inner hairline keeps white / cream swatches visible */}
                        <span className="block size-full border border-gray-300" style={{ backgroundColor: c.hexa || undefined }} />
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Quantity + add */}
            <div className="mt-6 flex gap-2.5 md:mt-auto md:pt-6">
              <div className="flex h-12 w-[132px] shrink-0 items-center justify-between border border-gray-300">
                <button
                  type="button"
                  aria-label={isAr ? "تقليل الكمية" : "Decrease quantity"}
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                  disabled={qty <= 1}
                  className="flex h-full w-11 items-center justify-center disabled:opacity-30"
                >
                  <Minus className="size-3.5" strokeWidth={1.5} />
                </button>
                <span aria-live="polite" className="flex-1 text-center font-sans text-[15px]">{qty}</span>
                <button
                  type="button"
                  aria-label={isAr ? "زيادة الكمية" : "Increase quantity"}
                  onClick={() => setQty((q) => Math.min(maxQty, q + 1))}
                  disabled={qty >= maxQty}
                  className="flex h-full w-11 items-center justify-center disabled:opacity-30"
                >
                  <Plus className="size-3.5" strokeWidth={1.5} />
                </button>
              </div>
              <button
                type="button"
                onClick={handleAdd}
                disabled={soldOut || added}
                className="flex h-12 min-w-0 flex-1 items-center justify-center gap-1.5 bg-primary px-3 font-sans text-[12px] uppercase tracking-[0.1em] text-white transition-colors duration-fast hover:bg-night disabled:cursor-not-allowed disabled:bg-gray-500"
              >
                {added && <Check className="size-3.5" strokeWidth={2} />}
                <span className="truncate">
                  {soldOut
                    ? isAr ? "نفدت الكمية" : "Sold out"
                    : added
                      ? isAr ? "تمت الإضافة" : "Added"
                      : `${isAr ? "أضف للسلة" : "Add to cart"} · ${total}`}
                </span>
              </button>
            </div>

            <a
              href={productHref}
              onClick={(e) => {
                e.preventDefault();
                onOpenChange(false);
                router.push(productHref);
              }}
              className="mt-4 self-start font-sans text-[12px] text-ink/70 underline underline-offset-2 hover:text-ink"
            >
              {isAr ? "عرض كل التفاصيل" : "View full details"}
            </a>

            <DialogPrimitive.Description className="sr-only">
              {isAr ? "اختاري اللون والكمية ثم أضيفي للسلة" : "Choose a colour and quantity, then add to cart"}
            </DialogPrimitive.Description>
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
