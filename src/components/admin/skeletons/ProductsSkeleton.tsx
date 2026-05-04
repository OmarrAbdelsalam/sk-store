import { Skeleton } from "@/components/ui/skeleton";

const ProductsSkeleton = () => {
  return (
    <>
      {/* Header Skeleton */}
      <div className="bg-gray-200 rounded-[24px] lg:rounded-[32px] p-4 sm:p-5 lg:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 lg:gap-4">
          <div className="flex items-center gap-3 lg:gap-4">
            <Skeleton className="w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 rounded-xl lg:rounded-2xl" />
            <div className="space-y-1 lg:space-y-2">
              <Skeleton className="h-5 lg:h-6 w-32 lg:w-48" />
              <Skeleton className="h-3 lg:h-4 w-40 lg:w-64" />
            </div>
          </div>
          <div className="flex items-center gap-2 lg:gap-3">
            <Skeleton className="h-9 lg:h-10 w-full sm:w-32 lg:w-40 rounded-xl lg:rounded-2xl" />
            <Skeleton className="h-9 lg:h-10 w-9 lg:w-10 rounded-lg lg:rounded-xl" />
          </div>
        </div>
      </div>

      {/* Stats Cards Skeleton */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white rounded-[20px] lg:rounded-[24px] p-4 lg:p-5 shadow-lg shadow-gray-200/50">
            <div className="flex items-center gap-2 lg:gap-3 mb-2 lg:mb-3">
              <Skeleton className="w-8 h-8 lg:w-10 lg:h-10 rounded-lg lg:rounded-xl" />
              <Skeleton className="h-3 lg:h-4 w-16 lg:w-28" />
            </div>
            <Skeleton className="h-7 lg:h-9 w-12 lg:w-16" />
          </div>
        ))}
      </div>

      {/* Operations Table Skeleton */}
      <div className="bg-white rounded-[20px] lg:rounded-[24px] shadow-lg shadow-gray-200/50 overflow-hidden">
        <div className="p-4 lg:p-6 border-b border-gray-100">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2 lg:gap-3">
              <Skeleton className="w-9 h-9 lg:w-10 lg:h-10 rounded-lg lg:rounded-xl" />
              <div className="space-y-1">
                <Skeleton className="h-4 lg:h-5 w-24 lg:w-28" />
                <Skeleton className="h-3 w-28 lg:w-36" />
              </div>
            </div>
            <Skeleton className="h-9 lg:h-10 w-full sm:w-40 lg:w-48 rounded-xl lg:rounded-2xl" />
          </div>
        </div>
        <div className="hidden md:block">
          <div className="px-4 lg:px-6 py-2 lg:py-3 bg-gray-50">
            <div className="grid grid-cols-8 gap-4">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <Skeleton key={i} className="h-3 lg:h-4 w-full" />
              ))}
            </div>
          </div>
          <div className="divide-y divide-gray-100">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="grid grid-cols-8 gap-4 px-4 lg:px-6 py-3 lg:py-4 items-center">
                <Skeleton className="h-5 lg:h-6 w-14 lg:w-16 rounded-full" />
                <div className="flex items-center gap-2">
                  <Skeleton className="w-7 h-7 lg:w-8 lg:h-8 rounded-lg" />
                  <Skeleton className="h-3 lg:h-4 w-16 lg:w-20" />
                </div>
                <Skeleton className="h-3 lg:h-4 w-20 lg:w-24" />
                <Skeleton className="h-3 lg:h-4 w-16 lg:w-20" />
                <Skeleton className="h-3 lg:h-4 w-10 lg:w-12" />
                <Skeleton className="h-5 lg:h-6 w-16 lg:w-20 rounded-lg" />
                <div className="space-y-1">
                  <Skeleton className="h-3 lg:h-4 w-14 lg:w-16" />
                  <Skeleton className="h-2 lg:h-3 w-16 lg:w-20" />
                </div>
                <Skeleton className="w-7 h-7 lg:w-8 lg:h-8 rounded-lg lg:rounded-xl" />
              </div>
            ))}
          </div>
        </div>
        {/* Mobile skeleton */}
        <div className="md:hidden divide-y divide-gray-100">
          {[1, 2, 3].map((i) => (
            <div key={i} className="p-4 space-y-3">
              <div className="flex items-center justify-between">
                <Skeleton className="h-5 w-20 rounded-full" />
                <Skeleton className="h-5 w-16 rounded-full" />
              </div>
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          ))}
        </div>
      </div>

      {/* Inventory Table Skeleton */}
      <div className="bg-white rounded-[20px] lg:rounded-[24px] shadow-lg shadow-gray-200/50 overflow-hidden">
        <div className="p-4 lg:p-6 border-b border-gray-100">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2 lg:gap-3">
              <Skeleton className="w-9 h-9 lg:w-10 lg:h-10 rounded-lg lg:rounded-xl" />
              <Skeleton className="h-4 lg:h-5 w-24 lg:w-32" />
            </div>
            <Skeleton className="h-9 lg:h-10 w-full sm:w-48 lg:w-64 rounded-xl lg:rounded-2xl" />
          </div>
        </div>
        <div className="hidden md:block">
          <div className="px-4 lg:px-6 py-2 lg:py-3 bg-gray-50">
            <div className="grid grid-cols-6 gap-4">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Skeleton key={i} className="h-3 lg:h-4 w-full" />
              ))}
            </div>
          </div>
          <div className="divide-y divide-gray-100">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="grid grid-cols-6 gap-4 px-4 lg:px-6 py-3 lg:py-4 items-center">
                <div className="flex items-center gap-2 lg:gap-3">
                  <Skeleton className="w-8 h-8 lg:w-10 lg:h-10 rounded-lg lg:rounded-xl" />
                  <Skeleton className="h-3 lg:h-4 w-16 lg:w-24" />
                </div>
                <Skeleton className="h-3 lg:h-4 w-16 lg:w-20" />
                <Skeleton className="h-3 lg:h-4 w-12 lg:w-16" />
                <Skeleton className="h-3 lg:h-4 w-10 lg:w-12" />
                <Skeleton className="h-5 lg:h-6 w-16 lg:w-20 rounded-lg" />
                <Skeleton className="h-5 lg:h-6 w-14 lg:w-16 rounded-full" />
              </div>
            ))}
          </div>
        </div>
        {/* Mobile skeleton */}
        <div className="md:hidden divide-y divide-gray-100">
          {[1, 2, 3].map((i) => (
            <div key={i} className="p-4 space-y-3">
              <div className="flex items-center justify-between">
                <Skeleton className="h-5 w-24" />
                <Skeleton className="h-5 w-16 rounded-full" />
              </div>
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default ProductsSkeleton;
