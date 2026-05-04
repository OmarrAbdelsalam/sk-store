export default function ProductLoading() {
  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-4 md:py-6">
        {/* Header skeleton */}
        <div className="mb-4 md:mb-6">
          <div className="h-8 md:h-10 w-20 md:w-24 bg-muted rounded animate-pulse" />
        </div>

        {/* Product content skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-12">
          {/* Image skeleton */}
          <div className="space-y-3 md:space-y-4">
            <div className="aspect-[3/3.5] md:aspect-[3/4] bg-muted rounded-lg animate-pulse" />
            <div className="flex gap-2 overflow-x-auto">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="flex-shrink-0 w-14 h-14 md:w-16 md:h-16 bg-muted rounded animate-pulse"
                />
              ))}
            </div>
          </div>

          {/* Info skeleton */}
          <div className="space-y-4 md:space-y-6">
            <div className="space-y-2 md:space-y-3">
              <div className="h-6 md:h-8 w-3/4 bg-muted rounded animate-pulse" />
              <div className="h-5 md:h-6 w-1/3 bg-muted rounded animate-pulse" />
            </div>

            <div className="space-y-1.5 md:space-y-2">
              <div className="h-3 md:h-4 w-full bg-muted rounded animate-pulse" />
              <div className="h-3 md:h-4 w-5/6 bg-muted rounded animate-pulse" />
            </div>

            {/* Colors skeleton */}
            <div className="space-y-2">
              <div className="h-3 md:h-4 w-14 md:w-16 bg-muted rounded animate-pulse" />
              <div className="flex gap-2">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="w-7 h-7 md:w-8 md:h-8 bg-muted rounded-full animate-pulse"
                  />
                ))}
              </div>
            </div>

            {/* Sizes skeleton */}
            <div className="space-y-2">
              <div className="h-3 md:h-4 w-14 md:w-16 bg-muted rounded animate-pulse" />
              <div className="flex gap-2">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="w-10 h-8 md:w-12 md:h-10 bg-muted rounded animate-pulse"
                  />
                ))}
              </div>
            </div>

            {/* Buttons skeleton */}
            <div className="space-y-2 md:space-y-3 pt-2 md:pt-4">
              <div className="h-10 md:h-12 w-full bg-muted rounded animate-pulse" />
              <div className="h-10 md:h-12 w-full bg-muted rounded animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
