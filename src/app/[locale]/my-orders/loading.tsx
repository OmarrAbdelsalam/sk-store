import { Skeleton } from "@/components/ui/skeleton";

export default function MyOrdersLoading() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-12">
        {/* Page Title */}
        <div className="mb-8 sm:mb-12 space-y-3">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-px w-12" />
          <Skeleton className="h-3 w-32" />
        </div>

        {/* Order Cards */}
        <div className="space-y-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="border border-border">
              <div className="p-5 sm:p-6">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <Skeleton className="h-4 w-16" />
                      <Skeleton className="h-5 w-20" />
                    </div>
                    <Skeleton className="h-3 w-40" />
                    <Skeleton className="h-3 w-48" />
                  </div>
                  <Skeleton className="h-6 w-24" />
                </div>
              </div>
              <div className="border-t border-border px-5 sm:px-6 py-3">
                <Skeleton className="h-3 w-28" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
