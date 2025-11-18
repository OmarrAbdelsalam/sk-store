import { Skeleton } from "@/components/ui/skeleton";

export default function OrderSuccessLoading() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto text-center space-y-8">
          {/* Success Icon */}
          <div className="flex justify-center">
            <Skeleton className="w-24 h-24 rounded-full" />
          </div>

          {/* Success Message */}
          <div className="space-y-4">
            <Skeleton className="h-10 w-64 mx-auto" />
            <Skeleton className="h-6 w-48 mx-auto" />
          </div>

          {/* Order Details Card */}
          <div className="border rounded-lg p-6 text-start">
            <Skeleton className="h-6 w-40 mb-6" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-6 w-32" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-6 w-40" />
              </div>
            </div>
            <div className="border-t pt-4">
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          </div>

          {/* Ordered Items */}
          <div className="border rounded-lg p-6 text-start">
            <Skeleton className="h-6 w-40 mb-4" />
            <div className="space-y-4">
              {Array.from({ length: 2 }).map((_, i) => (
                <div key={i} className="flex gap-4 items-center border-b pb-4">
                  <Skeleton className="w-20 h-20 rounded-lg" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-5 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                  <Skeleton className="h-5 w-20" />
                </div>
              ))}
              <div className="flex justify-between items-center pt-4">
                <Skeleton className="h-6 w-24" />
                <Skeleton className="h-6 w-32" />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Skeleton className="h-12 w-40" />
            <Skeleton className="h-12 w-40" />
          </div>

          {/* Customer Support */}
          <div className="border rounded-lg p-6">
            <Skeleton className="h-6 w-32 mx-auto mb-2" />
            <Skeleton className="h-4 w-64 mx-auto mb-4" />
            <Skeleton className="h-10 w-48 mx-auto" />
          </div>
        </div>
      </div>
    </div>
  );
}
