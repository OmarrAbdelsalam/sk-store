import { Skeleton } from "@/components/ui/skeleton";

export default function OrderSuccessLoading() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20">
        <div className="text-center space-y-8">
          {/* Success Icon */}
          <div className="flex justify-center">
            <Skeleton className="w-16 h-16" />
          </div>

          {/* Success Message */}
          <div className="space-y-3">
            <Skeleton className="h-8 w-64 mx-auto" />
            <Skeleton className="h-px w-12 mx-auto" />
            <Skeleton className="h-4 w-48 mx-auto" />
          </div>

          {/* Order Details */}
          <div className="border border-border text-start">
            <div className="px-5 sm:px-6 py-4 border-b border-border">
              <Skeleton className="h-4 w-32" />
            </div>
            <div className="p-5 sm:p-6 space-y-5">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Skeleton className="h-3 w-20" />
                  <Skeleton className="h-4 w-28" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-3 w-20" />
                  <Skeleton className="h-4 w-32" />
                </div>
              </div>
              <div className="border-t border-border pt-5 space-y-2">
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-4 w-full" />
              </div>
            </div>
          </div>

          {/* Ordered Items */}
          <div className="border border-border text-start">
            <div className="px-5 sm:px-6 py-4 border-b border-border">
              <Skeleton className="h-4 w-28" />
            </div>
            <div className="p-5 sm:p-6 space-y-4">
              {Array.from({ length: 2 }).map((_, i) => (
                <div key={i} className="flex gap-4 items-center py-4 border-b border-border/50">
                  <Skeleton className="w-16 h-20" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                  <Skeleton className="h-4 w-16" />
                </div>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row justify-center gap-3">
            <Skeleton className="h-12 w-40 mx-auto sm:mx-0" />
            <Skeleton className="h-12 w-40 mx-auto sm:mx-0" />
          </div>

          {/* Customer Support */}
          <div className="border border-border p-6 sm:p-8 space-y-3">
            <Skeleton className="h-4 w-32 mx-auto" />
            <Skeleton className="h-3 w-48 mx-auto" />
            <Skeleton className="h-11 w-40 mx-auto" />
          </div>
        </div>
      </div>
    </div>
  );
}
