import { ProductGridSkeleton } from "@/components/skeletons";

/** Home: full-height hero under the transparent header, then New Arrivals. */
export default function Loading() {
  return (
    <div className="min-h-screen animate-pulse bg-background" aria-busy="true">
      <div className="relative -mt-header-mobile h-[88svh] bg-beige lg:-mt-header-desktop lg:h-screen">
        <div className="absolute inset-x-0 bottom-[12%] flex flex-col items-center gap-4 px-gutter">
          <div className="h-3 w-28 bg-gray-200" />
          <div className="h-8 w-72 max-w-full bg-gray-200 md:h-10 md:w-[420px]" />
          <div className="mt-2 h-11 w-48 bg-gray-200" />
        </div>
      </div>
      <section className="py-section">
        <div className="mx-auto mb-8 h-5 w-40 bg-gray-100" />
        <ProductGridSkeleton count={4} />
      </section>
    </div>
  );
}
