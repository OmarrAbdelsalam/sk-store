import { Skeleton } from "@/components/ui/skeleton";

export default function CheckoutLoading() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <Skeleton className="h-10 w-32 mb-8" />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Checkout Form */}
          <div className="space-y-6">
            <Skeleton className="h-10 w-48 mb-6" />

            {/* Personal Info */}
            <div className="border rounded-lg p-6 space-y-4">
              <Skeleton className="h-6 w-40 mb-4" />
              <div className="grid grid-cols-2 gap-4">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>

            {/* Shipping Address */}
            <div className="border rounded-lg p-6 space-y-4">
              <Skeleton className="h-6 w-40 mb-4" />
              <Skeleton className="h-10 w-full" />
              <div className="grid grid-cols-2 gap-4">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
              <Skeleton className="h-10 w-full" />
              <div className="grid grid-cols-2 gap-4">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
              <Skeleton className="h-20 w-full" />
            </div>

            <Skeleton className="h-14 w-full rounded-lg" />
          </div>

          {/* Order Summary */}
          <div className="lg:sticky lg:top-8 lg:h-fit">
            <div className="border rounded-lg p-6 space-y-4">
              <Skeleton className="h-6 w-32 mb-4" />
              {Array.from({ length: 2 }).map((_, i) => (
                <div key={i} className="flex gap-4 pb-4 border-b">
                  <Skeleton className="w-16 h-16 rounded-lg" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                  <Skeleton className="h-4 w-16" />
                </div>
              ))}
              <div className="space-y-3 pt-4">
                <div className="flex justify-between">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-20" />
                </div>
                <div className="flex justify-between">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-20" />
                </div>
                <div className="border-t pt-3 flex justify-between">
                  <Skeleton className="h-6 w-24" />
                  <Skeleton className="h-6 w-24" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
