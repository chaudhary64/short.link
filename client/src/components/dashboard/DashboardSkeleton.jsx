const DashboardSkeleton = () => {
  return (
    <div className="flex flex-col flex-1 font-sans pb-20 w-full animate-pulse">
      <main className="flex-1 w-full mx-auto px-6 mt-10 flex flex-col gap-10">
        
        {/* UserOverview Skeleton */}
        <section className="flex flex-col justify-between items-center sm:items-end sm:flex-row gap-6 bg-white p-6 sm:p-8 border border-gray-200 shadow-sm relative overflow-hidden">
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-gray-50 border border-gray-100 rotate-45 pointer-events-none" />
          <div className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-6 w-full sm:w-auto relative z-10">
            <div className="w-20 h-20 rounded-full bg-gray-200 shrink-0" />
            <div className="flex flex-col items-center sm:items-start gap-3 mt-2">
              <div className="h-8 bg-gray-200 w-48 rounded" />
              <div className="h-4 bg-gray-200 w-32 rounded" />
              <div className="flex gap-2 mt-1">
                <div className="h-6 bg-gray-100 w-32 rounded-full border border-gray-200" />
              </div>
            </div>
          </div>
          <div className="flex gap-3 w-full sm:w-auto mt-4 sm:mt-0 relative z-10">
            <div className="h-10 bg-gray-200 w-28 rounded flex-1 sm:flex-none" />
            <div className="h-10 bg-gray-900 w-28 rounded flex-1 sm:flex-none opacity-60" />
          </div>
        </section>

        {/* DashboardStats Skeleton */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white p-6 border border-gray-100 shadow-sm flex flex-col gap-4">
              <div className="flex justify-between items-start">
                <div className="h-4 bg-gray-200 w-20 rounded" />
                <div className="w-10 h-10 bg-gray-100 border border-gray-200 flex items-center justify-center">
                  <div className="w-5 h-5 bg-gray-200 rounded" />
                </div>
              </div>
              <div className="h-9 bg-gray-200 w-14 rounded mt-1" />
              <div className="h-4 bg-gray-100 w-3/4 rounded mt-1" />
            </div>
          ))}
        </section>

        {/* LinkManagement Skeleton */}
        <section className="flex flex-col gap-4">
          {/* Filter bar skeleton */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div className="h-5 bg-gray-200 w-24 rounded" />
            <div className="flex gap-2 w-full sm:w-auto">
              <div className="h-10 bg-gray-200 w-full sm:w-56 rounded" />
              <div className="h-10 bg-gray-200 w-20 rounded" />
            </div>
          </div>

          {/* Table skeleton */}
          <div className="bg-white border border-gray-200 shadow-sm hidden lg:block">
            {/* Table header */}
            <div className="bg-gray-50 border-b border-gray-200 px-6 py-4 flex gap-8">
              <div className="h-4 bg-gray-200 w-24 rounded" />
              <div className="h-4 bg-gray-200 w-32 rounded" />
              <div className="h-4 bg-gray-200 w-16 rounded" />
              <div className="h-4 bg-gray-200 w-16 rounded" />
              <div className="h-4 bg-gray-200 w-20 rounded" />
              <div className="h-4 bg-gray-200 w-16 rounded ml-auto" />
            </div>
            {/* Table rows */}
            <div className="divide-y divide-gray-100">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="px-6 py-4 flex items-center gap-8">
                  <div className="flex items-center gap-2">
                    <div className="h-5 bg-gray-200 w-20 rounded" />
                    <div className="w-4 h-4 bg-gray-100 rounded" />
                  </div>
                  <div className="h-4 bg-gray-100 w-56 rounded" />
                  <div className="h-4 bg-gray-200 w-8 rounded font-mono" />
                  <div className="h-6 bg-gray-100 w-16 rounded-full" />
                  <div className="h-4 bg-gray-100 w-20 rounded" />
                  <div className="flex gap-2 ml-auto">
                    <div className="w-7 h-7 bg-gray-100 rounded" />
                    <div className="w-7 h-7 bg-gray-100 rounded" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Mobile cards skeleton */}
          <div className="flex flex-col gap-4 lg:hidden">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white border border-gray-100 shadow-sm p-4 flex flex-col gap-4">
                <div className="flex justify-between items-start">
                  <div className="flex flex-col gap-2">
                    <div className="h-5 bg-gray-200 w-24 rounded" />
                    <div className="h-4 bg-gray-100 w-20 rounded" />
                  </div>
                  <div className="h-6 bg-gray-100 w-16 rounded-full" />
                </div>
                <div className="flex flex-col gap-2">
                  <div className="h-3 bg-gray-100 w-16 rounded uppercase text-[10px]" />
                  <div className="h-4 bg-gray-100 w-full rounded" />
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-gray-100">
                  <div className="h-4 bg-gray-200 w-16 rounded" />
                  <div className="flex gap-2">
                    <div className="h-8 bg-gray-100 w-16 rounded" />
                    <div className="h-8 bg-gray-100 w-16 rounded" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

      </main>
    </div>
  );
};

export default DashboardSkeleton;
