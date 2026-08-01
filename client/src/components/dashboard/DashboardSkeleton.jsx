const DashboardSkeleton = () => {
  return (
    <div className="flex flex-col flex-1 font-body pb-20 w-full animate-pulse">
      <main className="flex-1 w-full mx-auto px-6 mt-10 flex flex-col gap-10">
        {/* DashboardHeader Skeleton */}
        <section className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between lg:gap-10">
          <div className="min-w-0 flex-1">
            <div className="h-8 bg-[#D4D4D8] w-56 sm:w-72 rounded-lg" />
            <div className="h-4 bg-[#F3F4F6] w-64 sm:w-80 rounded mt-2" />
          </div>
          <div className="w-full sm:w-auto shrink-0">
            <div className="h-10 bg-[#D4D4D8] w-full sm:w-32 rounded-md" />
          </div>
        </section>

        {/* DashboardStats Skeleton */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white p-5 border border-[#D4D4D8] rounded-xl flex flex-col gap-4">
              <div className="flex justify-between items-start">
                <div className="flex flex-col gap-2">
                  <div className="h-4 bg-[#D4D4D8] w-20 rounded" />
                  <div className="h-8 bg-[#D4D4D8] w-14 rounded" />
                </div>
                <div className="w-10 h-10 bg-[#F3F4F6] border border-[#D4D4D8] rounded-lg" />
              </div>
              <div className="h-4 bg-[#F3F4F6] w-3/4 rounded" />
            </div>
          ))}
        </section>

        {/* LinkManagement Skeleton */}
        <section className="flex flex-col gap-4">
          {/* Filter bar skeleton */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="h-5 bg-[#D4D4D8] w-24 rounded" />
              <div className="h-5 bg-[#F3F4F6] w-10 rounded-full" />
            </div>
            <div className="flex gap-2 w-full sm:w-auto">
              <div className="h-10 bg-[#D4D4D8] w-full sm:w-56 rounded-lg" />
              <div className="h-10 bg-[#D4D4D8] w-20 rounded-lg" />
            </div>
          </div>

          {/* Table skeleton */}
          <div className="bg-white border border-[#D4D4D8] rounded-xl hidden lg:block overflow-hidden">
            <div className="bg-[#FAFAFA] border-b border-[#D4D4D8] px-6 py-4 flex gap-8">
              <div className="h-4 bg-[#D4D4D8] w-24 rounded" />
              <div className="h-4 bg-[#D4D4D8] w-32 rounded" />
              <div className="h-4 bg-[#D4D4D8] w-16 rounded" />
              <div className="h-4 bg-[#D4D4D8] w-16 rounded" />
              <div className="h-4 bg-[#D4D4D8] w-20 rounded" />
              <div className="h-4 bg-[#D4D4D8] w-16 rounded ml-auto" />
            </div>
            <div className="divide-y divide-[#E5E5EA]">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="px-6 py-4 flex items-center gap-8">
                  <div className="flex items-center gap-2">
                    <div className="h-5 bg-[#D4D4D8] w-20 rounded" />
                    <div className="w-4 h-4 bg-[#F3F4F6] rounded" />
                  </div>
                  <div className="flex items-center gap-2 flex-1">
                    <div className="w-4 h-4 bg-[#F3F4F6] rounded" />
                    <div className="h-4 bg-[#F3F4F6] w-56 rounded" />
                  </div>
                  <div className="h-4 bg-[#F3F4F6] w-16 rounded" />
                  <div className="h-6 bg-[#F3F4F6] w-16 rounded-full" />
                  <div className="h-4 bg-[#F3F4F6] w-20 rounded" />
                  <div className="flex gap-2 ml-auto">
                    <div className="w-7 h-7 bg-[#F3F4F6] rounded-md" />
                    <div className="w-7 h-7 bg-[#F3F4F6] rounded-md" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Mobile cards skeleton */}
          <div className="flex flex-col gap-4 lg:hidden">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white border border-[#D4D4D8] rounded-xl p-4 flex flex-col gap-4">
                <div className="flex justify-between items-start">
                  <div className="flex flex-col gap-2">
                    <div className="h-5 bg-[#D4D4D8] w-24 rounded" />
                    <div className="h-4 bg-[#F3F4F6] w-20 rounded" />
                  </div>
                  <div className="h-6 bg-[#F3F4F6] w-16 rounded-full" />
                </div>
                <div className="flex flex-col gap-2">
                  <div className="h-3 bg-[#F3F4F6] w-16 rounded uppercase text-[10px]" />
                  <div className="h-4 bg-[#F3F4F6] w-full rounded" />
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-[#E5E5EA]">
                  <div className="h-4 bg-[#D4D4D8] w-16 rounded" />
                  <div className="flex gap-2">
                    <div className="h-8 bg-[#F3F4F6] w-16 rounded-md" />
                    <div className="h-8 bg-[#F3F4F6] w-16 rounded-md" />
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
