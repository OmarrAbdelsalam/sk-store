/**
 * Loading skeletons that mirror the real page layouts (same grids, paddings
 * and tile ratios), so nothing jumps when the content arrives.
 * Tiles use the gray product-tile colour; text lines are a lighter gray bar.
 */
import { cn } from "@/lib/utils";

const line = "bg-gray-100";

export function Bar({ className }: { className?: string }) {
  return <div className={cn(line, className)} />;
}

/** Product card: 3:4 gray tile, name, price, swatches; phone Quick add. */
export function ProductCardSkeleton() {
  return (
    <div className="flex flex-col">
      <div className="aspect-product w-full bg-beige" />
      <div className="flex flex-col gap-2 px-2.5 pt-3">
        <Bar className="h-3 w-3/4" />
        <Bar className="h-3 w-1/3" />
        <div className="flex gap-1.5 pt-1">
          {[0, 1, 2].map((i) => (
            <div key={i} className="size-3 bg-gray-100" />
          ))}
        </div>
      </div>
      <div className="mx-2.5 mt-3 h-9 border border-gray-200 lg:hidden" />
    </div>
  );
}

/** Products grid as on the shop page: edge to edge on phones, 2px gaps. */
export function ProductGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="ds-grid-page grid grid-cols-2 gap-x-tile gap-y-row-gap md:grid-cols-3 lg:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
}

/** Shop page: small title, category tabs, filter bar, grid. */
export function ProductsPageSkeleton() {
  return (
    <div className="animate-pulse" aria-busy="true">
      <div className="ds-page pb-1 pt-2">
        <Bar className="h-4 w-28" />
      </div>
      <div className="ds-page flex gap-6 overflow-hidden border-b border-gray-200 py-3">
        {[64, 80, 96, 72, 88].map((w, i) => (
          <div key={i} className="h-3 shrink-0 bg-gray-100" style={{ width: w }} />
        ))}
      </div>
      <div className="ds-page flex items-center justify-between py-5">
        <div className="flex gap-3">
          <div className="h-9 w-20 border border-gray-200" />
          <div className="h-9 w-20 border border-gray-200" />
          <div className="hidden h-9 w-24 border border-gray-200 sm:block" />
        </div>
        <div className="h-9 w-28 border border-gray-200" />
      </div>
      <ProductGridSkeleton />
    </div>
  );
}

/** Product page: gallery (carousel on phones, 2-up grid on desktop) + info. */
export function ProductPageSkeleton() {
  return (
    <div className="min-h-screen animate-pulse bg-background pb-section" aria-busy="true">
      <div className="ds-gutter hidden py-4 lg:flex">
        <Bar className="h-2.5 w-48" />
      </div>
      <div className="lg:flex lg:items-start">
        <div className="min-w-0 lg:flex-1">
          <div className="aspect-product w-full bg-beige lg:hidden" />
          <div className="hidden grid-cols-2 gap-tile lg:grid">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="aspect-product bg-beige" />
            ))}
          </div>
        </div>
        <div className="px-gutter pt-6 lg:w-[460px] lg:shrink-0 lg:pe-gutter-lg lg:ps-12 lg:pt-section xl:w-[520px]">
          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-2.5">
              <Bar className="h-5 w-4/5" />
              <Bar className="h-3 w-1/4" />
              <Bar className="h-4 w-1/3" />
            </div>
            <div className="flex gap-2">
              {[0, 1, 2, 3, 4].map((i) => (
                <div key={i} className="size-8 bg-gray-100" />
              ))}
            </div>
            <div className="flex flex-col gap-2">
              <Bar className="h-2.5 w-16" />
              <div className="h-12 w-[132px] border border-gray-200" />
            </div>
            <div className="flex flex-col gap-2">
              <div className="h-12 w-full border border-gray-200" />
              <div className="h-12 w-full bg-gray-200" />
              <Bar className="mx-auto mt-1 h-3 w-32" />
            </div>
            <div className="flex flex-col gap-3 pt-2">
              <div className="flex gap-5">
                {[0, 1, 2, 3].map((i) => (
                  <Bar key={i} className="h-2.5 w-14" />
                ))}
              </div>
              <Bar className="h-2.5 w-full" />
              <Bar className="h-2.5 w-5/6" />
              <Bar className="h-2.5 w-2/3" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/** Cart (Shopify/Dawn table): title row, Product/Quantity/Total, totals. */
export function CartSkeleton() {
  return (
    <div className="animate-pulse" aria-busy="true">
      <div className="flex items-end justify-between">
        <Bar className="h-8 w-40 sm:h-10 sm:w-48" />
        <Bar className="h-3.5 w-32" />
      </div>
      <div className="mt-8 grid grid-cols-1 border-b border-gray-200 pb-3 md:grid-cols-[minmax(0,1fr)_200px_140px] md:gap-x-6">
        <Bar className="h-2.5 w-16" />
        <Bar className="hidden h-2.5 w-16 md:block" />
        <Bar className="ms-auto hidden h-2.5 w-12 md:block" />
      </div>
      {[0, 1].map((i) => (
        <div
          key={i}
          className="grid grid-cols-[96px_minmax(0,1fr)] gap-x-4 border-b border-gray-200 py-6 md:grid-cols-[minmax(0,1fr)_200px_140px] md:gap-x-6 md:py-8"
        >
          <div className="contents md:flex md:gap-6">
            <div className="aspect-product w-[96px] bg-beige md:w-[120px]" />
            <div className="flex flex-col gap-2.5">
              <Bar className="h-3.5 w-40 max-w-full" />
              <Bar className="h-3 w-24" />
              <Bar className="h-3 w-20" />
              <div className="mt-2 h-12 w-[132px] border border-gray-200 md:hidden" />
            </div>
          </div>
          <div className="hidden h-12 w-[132px] border border-gray-200 md:block" />
          <Bar className="hidden h-3.5 w-20 md:block" />
        </div>
      ))}
      <div className="mt-8 flex justify-end">
        <div className="w-full space-y-3 md:max-w-[380px]">
          <div className="flex justify-between">
            <Bar className="h-4 w-32" />
            <Bar className="h-5 w-24" />
          </div>
          <Bar className="ms-auto h-3 w-3/4" />
          <div className="hidden h-[52px] w-full bg-gray-200 md:block" />
        </div>
      </div>
    </div>
  );
}

/** Checkout (Shopify layout): slim header, form column, gray summary column. */
export function CheckoutSkeleton() {
  const field = <div className="h-[52px] w-full border border-gray-200" />;
  return (
    <div className="min-h-screen animate-pulse bg-white" aria-busy="true">
      <div className="flex h-[64px] items-center justify-between border-b border-gray-200 px-gutter lg:grid lg:h-[84px] lg:grid-cols-2 lg:px-0">
        <div className="lg:flex lg:justify-end">
          <div className="lg:w-full lg:max-w-[600px] lg:px-[38px]">
            <Bar className="h-4 w-28 lg:h-5 lg:w-32" />
          </div>
        </div>
        <div className="flex justify-end lg:w-full lg:max-w-[520px] lg:px-[38px]">
          <div className="size-6 bg-gray-100" />
        </div>
      </div>

      {/* Phone summary bar */}
      <div className="flex items-center justify-between border-b border-gray-200 bg-beige px-gutter py-4 lg:hidden">
        <Bar className="h-4 w-40 bg-gray-200" />
        <Bar className="h-5 w-20 bg-gray-200" />
      </div>

      <div className="lg:grid lg:min-h-[calc(100vh-84px)] lg:grid-cols-2">
        <div className="lg:flex lg:justify-end">
          <div className="w-full space-y-9 px-gutter pb-12 pt-8 lg:max-w-[600px] lg:px-[38px] lg:pt-[38px]">
            <div className="space-y-3.5">
              <Bar className="h-6 w-24" />
              {field}
            </div>
            <div className="space-y-3">
              <Bar className="mb-3.5 h-6 w-24" />
              {field}
              {field}
              {field}
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {field}
                {field}
              </div>
              {field}
            </div>
            <div className="space-y-3.5">
              <Bar className="h-6 w-40" />
              <div className="h-[52px] w-full bg-beige" />
            </div>
            <div className="space-y-3.5">
              <Bar className="h-6 w-24" />
              <div className="h-32 w-full border border-gray-200" />
            </div>
            <div className="h-14 w-full bg-gray-200" />
          </div>
        </div>
        <div className="hidden border-s border-gray-200 bg-beige lg:block">
          <div className="w-full max-w-[520px] space-y-6 px-[38px] py-[38px]">
            {[0, 1].map((i) => (
              <div key={i} className="flex items-center gap-3.5">
                <div className="size-16 border border-gray-200 bg-gray-100" />
                <div className="flex-1 space-y-2">
                  <Bar className="h-3.5 w-3/4 bg-gray-200" />
                  <Bar className="h-3 w-1/4 bg-gray-200" />
                </div>
                <Bar className="h-3.5 w-20 bg-gray-200" />
              </div>
            ))}
            <div className="flex gap-3">
              <div className="h-[52px] flex-1 border border-gray-200 bg-white" />
              <div className="h-[52px] w-20 bg-gray-200" />
            </div>
            <div className="space-y-3">
              <div className="flex justify-between">
                <Bar className="h-3.5 w-28 bg-gray-200" />
                <Bar className="h-3.5 w-20 bg-gray-200" />
              </div>
              <div className="flex justify-between">
                <Bar className="h-3.5 w-20 bg-gray-200" />
                <Bar className="h-3.5 w-28 bg-gray-200" />
              </div>
              <div className="flex justify-between pt-3">
                <Bar className="h-6 w-16 bg-gray-200" />
                <Bar className="h-6 w-28 bg-gray-200" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/** My orders: title + subtitle, then order cards (header row + toggle). */
export function MyOrdersSkeleton() {
  return (
    <div className="mx-auto max-w-3xl animate-pulse px-gutter py-8 sm:py-section lg:px-gutter-lg" aria-busy="true">
      <Bar className="h-8 w-44 sm:h-10 sm:w-52" />
      <Bar className="mt-3 h-3.5 w-64 max-w-full" />
      <div className="mt-8 space-y-4">
        {[0, 1, 2].map((i) => (
          <div key={i} className="border border-gray-200">
            <div className="flex flex-col gap-3 p-5 sm:flex-row sm:justify-between sm:p-6">
              <div className="space-y-2">
                <div className="flex gap-3">
                  <Bar className="h-4 w-28" />
                  <Bar className="h-4 w-20" />
                </div>
                <Bar className="h-3 w-40" />
                <Bar className="h-3 w-52" />
              </div>
              <Bar className="h-5 w-24" />
            </div>
            <div className="flex justify-between border-t border-gray-200 px-5 py-4 sm:px-6">
              <Bar className="h-3 w-24" />
              <Bar className="h-3 w-3" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/** Order confirmation: centred heading, then the beige detail panels. */
export function OrderSuccessSkeleton() {
  return (
    <div className="mx-auto max-w-2xl animate-pulse px-gutter py-12 sm:py-20 lg:px-gutter-lg" aria-busy="true">
      <div className="flex flex-col items-center gap-3">
        <div className="size-12 rounded-full bg-gray-100" />
        <Bar className="h-8 w-64 max-w-full" />
        <Bar className="h-3.5 w-48" />
      </div>
      <div className="mt-10 space-y-4">
        <div className="space-y-3 bg-beige p-6">
          <Bar className="h-3 w-24 bg-gray-200" />
          <Bar className="h-4 w-40 bg-gray-200" />
          <Bar className="h-4 w-56 bg-gray-200" />
        </div>
        <div className="space-y-4 bg-beige p-6">
          {[0, 1].map((i) => (
            <div key={i} className="flex items-center gap-4">
              <div className="aspect-product w-16 bg-gray-200" />
              <div className="flex-1 space-y-2">
                <Bar className="h-3.5 w-3/4 bg-gray-200" />
                <Bar className="h-3 w-1/3 bg-gray-200" />
              </div>
              <Bar className="h-3.5 w-16 bg-gray-200" />
            </div>
          ))}
        </div>
        <div className="mx-auto h-12 w-56 bg-gray-200" />
      </div>
    </div>
  );
}
