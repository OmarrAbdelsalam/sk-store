import { Skeleton } from "@/components/ui/skeleton";

export default function ProductLoading() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6">
        {/* Back Button */}
        <Skeleton className="h-10 w-32 mb-8" />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Image Gallery Skeleton */}
          <div className="space-y-6">
            <Skeleton className="aspect-[3/4] w-full rounded-lg" />
            <div className="grid grid-cols-6 gap-2">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="aspect-square rounded-lg" />
              ))}
            </div>
          </div>

          {/* Product Info Skeleton */}
          <div className="lg:sticky lg:top-24 space-y-8">
            <div className="space-y-4">
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-6 w-1/2" />
              <Skeleton className="h-10 w-32" />
            </div>

            {/* Colors */}
            <div className="space-y-3">
              <Skeleton className="h-5 w-20" />
              <div className="flex gap-2">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-10 w-10 rounded-full" />
                ))}
              </div>
            </div>

            {/* Sizes */}
            <div className="space-y-3">
              <Skeleton className="h-5 w-24" />
              <div className="flex gap-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-10 w-16 rounded-lg" />
                ))}
              </div>
            </div>

            {/* Quantity */}
            <div className="space-y-3">
              <Skeleton className="h-5 w-20" />
              <Skeleton className="h-12 w-32" />
            </div>

            {/* Buttons */}
            <div className="grid grid-cols-2 gap-3">
              <Skeleton className="h-14 w-full rounded-lg" />
              <Skeleton className="h-14 w-full rounded-lg" />
            </div>
            <Skeleton className="h-14 w-full rounded-lg" />
          </div>
        </div>
      </div>
    </div>
  );
}
