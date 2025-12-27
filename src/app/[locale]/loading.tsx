import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Skeleton */}
      <div className="relative h-[60vh] bg-muted animate-pulse">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center space-y-4 px-4">
            <Skeleton className="h-12 w-64 mx-auto" />
            <Skeleton className="h-6 w-96 mx-auto" />
            <Skeleton className="h-12 w-40 mx-auto mt-6" />
          </div>
        </div>
      </div>

      {/* Product Grid Skeleton */}
      <section className="py-4 md:py-12 bg-background">
        <div className="container mx-auto px-4">
          {/* Title - Mobile: text-start, Desktop: text-center */}
          <div className="text-start md:text-center md:mb-12">
            <Skeleton className="h-7 md:h-10 w-40 md:w-64 md:mx-auto mb-2 md:mb-4" />
            {/* Mobile: line under title */}
            <Skeleton className="h-0.5 w-32 mb-3 md:hidden" />
            <Skeleton className="h-3 md:h-4 w-48 md:w-96 md:mx-auto mb-4 md:mb-4" />
            {/* Desktop: decorative lines */}
            <div className="hidden md:flex items-center justify-center gap-2 mb-6">
              <Skeleton className="h-0.5 w-12" />
              <Skeleton className="h-1 w-16" />
              <Skeleton className="h-0.5 w-12" />
            </div>
          </div>

          {/* Products Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-10 lg:gap-12">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="space-y-2 md:space-y-4">
                <Skeleton className="aspect-[3/4] w-full rounded-lg" />
                <div className="space-y-1.5 md:space-y-2">
                  <Skeleton className="h-4 md:h-6 w-3/4" />
                  <Skeleton className="h-3 md:h-4 w-1/2" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
