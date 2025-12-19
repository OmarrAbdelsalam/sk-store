export default function ProductLoading() {
  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-6">
        {/* Header skeleton */}
        <div className="mb-6">
          <div className="h-10 w-24 bg-muted rounded animate-pulse" />
        </div>
        
        {/* Product content skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Image skeleton */}
          <div className="space-y-4">
            <div className="aspect-[3/4] bg-muted rounded-lg animate-pulse" />
            <div className="flex gap-2">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="w-16 h-16 bg-muted rounded animate-pulse" />
              ))}
            </div>
          </div>
          
          {/* Info skeleton */}
          <div className="space-y-6">
            <div className="space-y-3">
              <div className="h-8 w-3/4 bg-muted rounded animate-pulse" />
              <div className="h-6 w-1/2 bg-muted rounded animate-pulse" />
            </div>
            
            <div className="space-y-2">
              <div className="h-4 w-full bg-muted rounded animate-pulse" />
              <div className="h-4 w-5/6 bg-muted rounded animate-pulse" />
              <div className="h-4 w-4/6 bg-muted rounded animate-pulse" />
            </div>
            
            {/* Colors skeleton */}
            <div className="space-y-2">
              <div className="h-4 w-16 bg-muted rounded animate-pulse" />
              <div className="flex gap-2">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="w-8 h-8 bg-muted rounded-full animate-pulse" />
                ))}
              </div>
            </div>
            
            {/* Sizes skeleton */}
            <div className="space-y-2">
              <div className="h-4 w-16 bg-muted rounded animate-pulse" />
              <div className="flex gap-2">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="w-12 h-10 bg-muted rounded animate-pulse" />
                ))}
              </div>
            </div>
            
            {/* Quantity skeleton */}
            <div className="space-y-2">
              <div className="h-4 w-16 bg-muted rounded animate-pulse" />
              <div className="h-10 w-32 bg-muted rounded animate-pulse" />
            </div>
            
            {/* Buttons skeleton */}
            <div className="space-y-3 pt-4">
              <div className="h-12 w-full bg-muted rounded animate-pulse" />
              <div className="h-12 w-full bg-muted rounded animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
