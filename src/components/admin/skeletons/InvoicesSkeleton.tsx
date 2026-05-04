import { Skeleton } from "@/components/ui/skeleton";

const InvoicesSkeleton = () => {
  return (
    <>
      {/* Header Skeleton */}
      <div className="bg-gray-200 rounded-[24px] lg:rounded-[32px] p-4 sm:p-5 lg:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 lg:gap-4">
          <div className="flex items-center gap-3 lg:gap-4">
            <Skeleton className="w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 rounded-xl lg:rounded-2xl" />
            <div className="space-y-1 lg:space-y-2">
              <Skeleton className="h-5 lg:h-6 w-24 lg:w-28" />
              <Skeleton className="h-3 lg:h-4 w-32 lg:w-48" />
            </div>
          </div>
          <Skeleton className="h-9 lg:h-10 w-full sm:w-56 lg:w-72 rounded-xl lg:rounded-2xl" />
        </div>
      </div>

      {/* Stats Cards Skeleton */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white rounded-[20px] lg:rounded-[24px] p-4 lg:p-5 shadow-lg shadow-gray-200/50 border border-gray-100">
            <div className="flex items-center gap-2 lg:gap-3 mb-2 lg:mb-3">
              <Skeleton className="w-8 h-8 lg:w-10 lg:h-10 rounded-lg lg:rounded-xl" />
              <Skeleton className="h-3 lg:h-4 w-16 lg:w-24" />
            </div>
            <Skeleton className="h-6 lg:h-9 w-20 lg:w-28" />
          </div>
        ))}
      </div>

      {/* Desktop Table Skeleton */}
      <div className="hidden md:block bg-white rounded-[20px] lg:rounded-[24px] shadow-lg shadow-gray-200/50 overflow-hidden">
        <div className="p-4 bg-gray-50 border-b border-gray-100">
          <div className="grid grid-cols-6 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Skeleton key={i} className="h-4 w-full" />
            ))}
          </div>
        </div>
        <div className="divide-y divide-gray-100">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="grid grid-cols-6 gap-4 p-4 items-center">
              <Skeleton className="h-4 w-24 lg:w-28" />
              <Skeleton className="h-4 w-20 lg:w-24" />
              <Skeleton className="h-4 w-20 lg:w-24" />
              <Skeleton className="h-4 w-16 lg:w-20" />
              <Skeleton className="h-6 w-20 lg:w-24 rounded-full" />
              <div className="flex items-center gap-2">
                <Skeleton className="w-8 h-8 lg:w-9 lg:h-9 rounded-lg lg:rounded-xl" />
                <Skeleton className="w-8 h-8 lg:w-9 lg:h-9 rounded-lg lg:rounded-xl" />
                <Skeleton className="w-16 lg:w-20 h-8 lg:h-9 rounded-lg lg:rounded-xl" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Mobile Cards Skeleton */}
      <div className="md:hidden space-y-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="bg-white rounded-[20px] shadow-lg shadow-gray-200/50 p-4">
            <div className="flex items-center justify-between mb-3">
              <Skeleton className="h-5 w-24" />
              <Skeleton className="h-6 w-20 rounded-full" />
            </div>
            <div className="flex items-center justify-between">
              <Skeleton className="h-6 w-28" />
              <Skeleton className="w-5 h-5" />
            </div>
          </div>
        ))}
      </div>
    </>
  );
};

export default InvoicesSkeleton;
