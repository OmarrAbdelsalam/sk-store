import { Skeleton } from "@/components/ui/skeleton";

const ReportsSkeleton = () => {
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
          <Skeleton className="h-9 lg:h-10 w-full sm:w-48 lg:w-64 rounded-xl lg:rounded-2xl" />
        </div>
      </div>

      {/* Stats Cards Skeleton */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white rounded-[20px] lg:rounded-[24px] p-4 lg:p-5 shadow-lg shadow-gray-200/50">
            <div className="flex items-center gap-2 lg:gap-3 mb-2 lg:mb-3">
              <Skeleton className="w-8 h-8 lg:w-10 lg:h-10 rounded-lg lg:rounded-xl" />
              <Skeleton className="h-3 lg:h-4 w-16 lg:w-24" />
            </div>
            <Skeleton className="h-6 lg:h-9 w-14 lg:w-20" />
          </div>
        ))}
      </div>

      {/* Charts Row Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
        <div className="bg-white rounded-[20px] lg:rounded-[24px] p-4 lg:p-6 shadow-lg shadow-gray-200/50">
          <Skeleton className="h-4 lg:h-5 w-28 lg:w-32 mb-4 lg:mb-6" />
          <Skeleton className="h-[180px] lg:h-[280px] w-full rounded-xl" />
          <div className="flex items-center justify-center gap-4 lg:gap-6 mt-3 lg:mt-4 pt-3 lg:pt-4 border-t border-gray-100">
            <div className="flex items-center gap-2">
              <Skeleton className="w-3 h-3 rounded-full" />
              <Skeleton className="h-3 lg:h-4 w-10 lg:w-12" />
            </div>
            <div className="flex items-center gap-2">
              <Skeleton className="w-3 h-3 rounded-full" />
              <Skeleton className="h-3 lg:h-4 w-10 lg:w-12" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-[20px] lg:rounded-[24px] p-4 lg:p-6 shadow-lg shadow-gray-200/50">
          <Skeleton className="h-4 lg:h-5 w-36 lg:w-48 mb-4 lg:mb-6" />
          <Skeleton className="h-[180px] lg:h-[280px] w-full rounded-xl" />
        </div>
      </div>

      {/* Bar Chart Skeleton */}
      <div className="bg-white rounded-[20px] lg:rounded-[24px] p-4 lg:p-6 shadow-lg shadow-gray-200/50">
        <Skeleton className="h-4 lg:h-5 w-28 lg:w-36 mb-4 lg:mb-6" />
        <Skeleton className="h-[150px] lg:h-[220px] w-full rounded-xl" />
      </div>

      {/* Quick Reports Skeleton */}
      <div className="bg-white rounded-[20px] lg:rounded-[24px] p-4 lg:p-6 shadow-lg shadow-gray-200/50">
        <Skeleton className="h-4 lg:h-5 w-24 lg:w-28 mb-4 lg:mb-6" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="p-3 lg:p-4 rounded-xl lg:rounded-2xl bg-gray-50">
              <Skeleton className="w-10 h-10 lg:w-12 lg:h-12 rounded-lg lg:rounded-xl mb-2 lg:mb-3" />
              <Skeleton className="h-4 w-20 lg:w-28 mb-1" />
              <Skeleton className="h-3 w-24 lg:w-36 mb-2 lg:mb-3" />
              <Skeleton className="h-3 lg:h-4 w-16 lg:w-24" />
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default ReportsSkeleton;
