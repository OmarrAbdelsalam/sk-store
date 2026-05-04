import { Skeleton } from "@/components/ui/skeleton";

const WarehousesSkeleton = () => {
  return (
    <>
      {/* Header Skeleton */}
      <div className="bg-gray-200 rounded-[24px] lg:rounded-[32px] p-4 sm:p-5 lg:p-6">
        <div className="flex items-center gap-3 lg:gap-4">
          <Skeleton className="w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 rounded-xl lg:rounded-2xl" />
          <div className="space-y-1 lg:space-y-2">
            <Skeleton className="h-5 lg:h-6 w-24 lg:w-32" />
            <Skeleton className="h-3 lg:h-4 w-40 lg:w-64" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
        {/* Current Warehouse Skeleton */}
        <div className="lg:col-span-2 bg-white rounded-[20px] lg:rounded-[24px] p-4 lg:p-6 shadow-lg shadow-gray-200/50">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 lg:mb-6">
            <div className="flex items-center gap-2 lg:gap-3">
              <Skeleton className="w-10 h-10 lg:w-12 lg:h-12 rounded-lg lg:rounded-xl" />
              <div className="space-y-1 lg:space-y-2">
                <Skeleton className="h-4 lg:h-5 w-24 lg:w-28" />
                <Skeleton className="h-3 lg:h-4 w-28 lg:w-36" />
              </div>
            </div>
            <Skeleton className="h-5 lg:h-6 w-14 lg:w-16 rounded-full self-start sm:self-auto" />
          </div>
          <div className="grid grid-cols-2 gap-3 lg:gap-4 mb-4 lg:mb-6">
            <div className="p-3 lg:p-4 rounded-xl lg:rounded-2xl bg-gray-50">
              <Skeleton className="h-3 lg:h-4 w-20 lg:w-24 mb-1 lg:mb-2" />
              <Skeleton className="h-6 lg:h-8 w-12 lg:w-16" />
            </div>
            <div className="p-3 lg:p-4 rounded-xl lg:rounded-2xl bg-gray-50">
              <Skeleton className="h-3 lg:h-4 w-20 lg:w-24 mb-1 lg:mb-2" />
              <Skeleton className="h-6 lg:h-8 w-12 lg:w-16" />
            </div>
          </div>
          <div className="mb-4 lg:mb-6">
            <Skeleton className="h-4 lg:h-5 w-28 lg:w-32 mb-2 lg:mb-3" />
            <div className="space-y-2 lg:space-y-3">
              {[1, 2].map((i) => (
                <div key={i} className="flex items-center justify-between p-3 lg:p-4 rounded-xl lg:rounded-2xl border-2 border-dashed border-gray-200">
                  <div className="flex items-center gap-2 lg:gap-3">
                    <Skeleton className="w-8 h-8 lg:w-10 lg:h-10 rounded-lg lg:rounded-xl" />
                    <div className="space-y-1">
                      <Skeleton className="h-4 w-24 lg:w-32" />
                      <Skeleton className="h-3 w-16 lg:w-20" />
                    </div>
                  </div>
                  <Skeleton className="h-5 lg:h-6 w-12 lg:w-16 rounded-full" />
                </div>
              ))}
            </div>
          </div>
          <div>
            <div className="flex items-center justify-between mb-2">
              <Skeleton className="h-3 lg:h-4 w-28 lg:w-32" />
              <Skeleton className="h-3 lg:h-4 w-12 lg:w-16" />
            </div>
            <Skeleton className="h-2 lg:h-3 w-full rounded-full" />
          </div>
        </div>

        {/* Plan Card Skeleton */}
        <div className="bg-gray-200 rounded-[20px] lg:rounded-[24px] p-4 lg:p-6">
          <div className="flex items-center gap-2 lg:gap-3 mb-4 lg:mb-6">
            <Skeleton className="w-8 h-8 lg:w-10 lg:h-10 rounded-lg lg:rounded-xl" />
            <Skeleton className="h-4 lg:h-5 w-24 lg:w-28" />
          </div>
          <div className="text-center mb-4 lg:mb-6 space-y-2">
            <Skeleton className="h-4 lg:h-5 w-28 lg:w-32 mx-auto" />
            <Skeleton className="h-6 lg:h-8 w-32 lg:w-40 mx-auto" />
          </div>
          <div className="space-y-2 lg:space-y-3 mb-4 lg:mb-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-2">
                <Skeleton className="w-4 h-4 rounded-full" />
                <Skeleton className="h-3 lg:h-4 w-20 lg:w-24" />
              </div>
            ))}
          </div>
          <Skeleton className="h-10 lg:h-12 w-full rounded-xl lg:rounded-2xl" />
        </div>
      </div>

      {/* Other Warehouses Skeleton */}
      <div className="bg-white rounded-[20px] lg:rounded-[24px] p-4 lg:p-6 shadow-lg shadow-gray-200/50">
        <div className="flex items-center justify-between mb-4 lg:mb-6">
          <Skeleton className="h-4 lg:h-5 w-32 lg:w-40" />
          <Skeleton className="h-3 lg:h-4 w-16 lg:w-20" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 lg:gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="p-3 lg:p-4 rounded-xl lg:rounded-2xl bg-gray-50">
              <div className="flex items-center justify-between mb-2 lg:mb-3">
                <Skeleton className="w-8 h-8 lg:w-10 lg:h-10 rounded-lg lg:rounded-xl" />
                <Skeleton className="h-5 lg:h-6 w-12 lg:w-14 rounded-full" />
              </div>
              <Skeleton className="h-4 lg:h-5 w-20 lg:w-24 mb-1" />
              <Skeleton className="h-3 lg:h-4 w-14 lg:w-16 mb-1 lg:mb-2" />
              <Skeleton className="h-3 lg:h-4 w-10 lg:w-12" />
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default WarehousesSkeleton;
