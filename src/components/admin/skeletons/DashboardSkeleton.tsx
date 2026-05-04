import { Skeleton } from "@/components/ui/skeleton";

const DashboardSkeleton = () => {
  return (
    <>
      {/* Welcome Card Skeleton */}
      <div className="bg-white rounded-[24px] lg:rounded-[32px] p-4 sm:p-6 lg:p-8 shadow-xl shadow-gray-200/50 border border-gray-100">
        <div className="flex flex-col lg:flex-row items-center gap-6 lg:gap-12">
          <div className="flex-1 space-y-3 lg:space-y-4 text-center lg:text-right w-full">
            <Skeleton className="h-8 lg:h-10 w-32 lg:w-48 mx-auto lg:mx-0" />
            <Skeleton className="h-5 lg:h-6 w-40 lg:w-64 mx-auto lg:mx-0" />
            <Skeleton className="h-4 w-full max-w-[280px] lg:max-w-[320px] mx-auto lg:mx-0" />
            <Skeleton className="h-4 w-3/4 max-w-[240px] lg:max-w-[280px] mx-auto lg:mx-0" />
          </div>
          <Skeleton className="w-[180px] h-[180px] sm:w-[220px] sm:h-[220px] lg:w-[280px] lg:h-[280px] rounded-full flex-shrink-0" />
        </div>
      </div>

      {/* Stats Cards Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 lg:gap-4">
        <div className="bg-gray-100 rounded-[20px] lg:rounded-[24px] p-4 lg:p-6">
          <div className="flex items-center justify-between mb-4 lg:mb-6">
            <Skeleton className="w-10 h-10 lg:w-12 lg:h-12 rounded-xl lg:rounded-2xl" />
            <Skeleton className="w-14 lg:w-16 h-5 lg:h-6 rounded-full" />
          </div>
          <Skeleton className="h-12 lg:h-16 w-16 lg:w-20 mx-auto mb-2" />
          <Skeleton className="h-3 lg:h-4 w-20 lg:w-24 mx-auto" />
          <div className="flex justify-between mt-3 lg:mt-4 pt-3 lg:pt-4 border-t border-gray-200">
            <Skeleton className="h-6 lg:h-8 w-10 lg:w-12" />
            <Skeleton className="h-6 lg:h-8 w-10 lg:w-12" />
            <Skeleton className="h-6 lg:h-8 w-10 lg:w-12" />
          </div>
        </div>
        {[1, 2].map((i) => (
          <div key={i} className="bg-white rounded-[20px] lg:rounded-[24px] p-4 lg:p-6 shadow-lg shadow-gray-200/50">
            <Skeleton className="h-12 lg:h-16 w-16 lg:w-20 mb-2" />
            <Skeleton className="h-4 lg:h-5 w-14 lg:w-16 mb-1" />
            <Skeleton className="h-3 lg:h-4 w-16 lg:w-20" />
            <Skeleton className="h-3 lg:h-4 w-20 lg:w-24 mt-3 lg:mt-4" />
          </div>
        ))}
      </div>

      {/* Invoices Skeleton */}
      <div className="bg-white rounded-[20px] lg:rounded-[24px] p-4 lg:p-6 shadow-lg shadow-gray-200/50">
        <div className="flex items-center justify-between mb-4 lg:mb-6">
          <div className="flex items-center gap-2 lg:gap-3">
            <Skeleton className="w-8 h-8 lg:w-10 lg:h-10 rounded-lg lg:rounded-xl" />
            <Skeleton className="h-5 lg:h-6 w-20 lg:w-24" />
          </div>
          <Skeleton className="h-4 w-14 lg:w-16" />
        </div>
        <div className="space-y-2 lg:space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex flex-col sm:flex-row sm:items-center gap-3 p-3 lg:p-4 rounded-xl lg:rounded-2xl border border-gray-100">
              <div className="flex items-center gap-3 flex-1">
                <Skeleton className="w-9 h-9 lg:w-10 lg:h-10 rounded-lg lg:rounded-xl" />
                <div className="flex-1 space-y-1 lg:space-y-2">
                  <Skeleton className="h-4 w-24 lg:w-32" />
                  <Skeleton className="h-3 w-32 lg:w-40" />
                </div>
              </div>
              <div className="flex items-center justify-between sm:justify-end gap-3">
                <div className="space-y-1 lg:space-y-2">
                  <Skeleton className="h-4 w-16 lg:w-20" />
                  <Skeleton className="h-3 w-12 lg:w-16" />
                </div>
                <div className="flex gap-1 lg:gap-2">
                  <Skeleton className="w-7 h-7 lg:w-8 lg:h-8 rounded-lg" />
                  <Skeleton className="w-7 h-7 lg:w-8 lg:h-8 rounded-lg" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default DashboardSkeleton;
