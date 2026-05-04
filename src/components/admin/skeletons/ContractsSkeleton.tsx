import { Skeleton } from "@/components/ui/skeleton";

const ContractsSkeleton = () => {
  return (
    <>
      {/* Header Skeleton */}
      <div className="bg-gray-200 rounded-[24px] lg:rounded-[32px] p-4 sm:p-5 lg:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 lg:gap-4">
          <div className="flex items-center gap-3 lg:gap-4">
            <Skeleton className="w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 rounded-xl lg:rounded-2xl" />
            <div className="space-y-1 lg:space-y-2">
              <Skeleton className="h-5 lg:h-6 w-24 lg:w-32" />
              <Skeleton className="h-3 lg:h-4 w-32 lg:w-48" />
            </div>
          </div>
          <Skeleton className="h-9 lg:h-10 w-full sm:w-40 lg:w-48 rounded-xl lg:rounded-2xl" />
        </div>
      </div>

      {/* Stats Cards Skeleton */}
      <div className="grid grid-cols-3 gap-2 sm:gap-3 lg:gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white rounded-[20px] lg:rounded-[24px] p-4 lg:p-5 shadow-lg shadow-gray-200/50">
            <div className="flex items-center gap-2 lg:gap-3 mb-2 lg:mb-3">
              <Skeleton className="w-8 h-8 lg:w-10 lg:h-10 rounded-lg lg:rounded-xl" />
              <Skeleton className="h-3 lg:h-4 w-12 sm:w-16 lg:w-24" />
            </div>
            <Skeleton className="h-6 lg:h-9 w-8 lg:w-12" />
          </div>
        ))}
      </div>

      {/* Contracts List Skeleton */}
      <div className="space-y-3 lg:space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white rounded-[20px] lg:rounded-[24px] shadow-lg shadow-gray-200/50 overflow-hidden">
            <div className="p-4 lg:p-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3 lg:gap-4">
                  <Skeleton className="w-10 h-10 lg:w-12 lg:h-12 rounded-lg lg:rounded-xl" />
                  <div className="space-y-1 lg:space-y-2">
                    <Skeleton className="h-4 lg:h-5 w-24 lg:w-32" />
                    <Skeleton className="h-3 lg:h-4 w-32 lg:w-48" />
                  </div>
                </div>
                <div className="flex items-center justify-between sm:justify-end gap-2 lg:gap-4">
                  <Skeleton className="h-5 lg:h-6 w-14 lg:w-16 rounded-full" />
                  <div className="flex items-center gap-1 lg:gap-2">
                    <Skeleton className="w-8 h-8 lg:w-9 lg:h-9 rounded-lg lg:rounded-xl" />
                    <Skeleton className="w-8 h-8 lg:w-9 lg:h-9 rounded-lg lg:rounded-xl" />
                    <Skeleton className="w-4 lg:w-5 h-4 lg:h-5" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
};

export default ContractsSkeleton;
