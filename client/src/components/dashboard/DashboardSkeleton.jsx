const DashboardSkeleton = () => {
  return (
    <div className="flex flex-col flex-1 font-body pb-20 w-full animate-pulse">
      <main className="flex-1 w-full mx-auto px-6 mt-10 flex flex-col gap-10">
        
        {/* DashboardHeader Skeleton */}
        <section className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-5">
          <div className="flex flex-col gap-3">
            <div className="h-3 bg-[#E8E8EC] w-20 rounded" />
            <div className="h-8 bg-[#E8E8EC] w-40 rounded" />
            <div className="h-4 bg-[#F3F4F6] w-48 rounded" />
          </div>
          <div className="h-10 bg-[#E8E8EC] w-32 rounded-md" />
        </section>

        {/* DashboardStats Skeleton */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white p-5 border border-[#E8E8EC] rounded-xl flex flex-col gap-4">
              <div className="flex justify-between items-start">
                <div className="h-4 bg-[#E8E8EC] w-20 rounded" />
                <div className="w-10 h-10 bg-[#F3F4F6] border border-[#E8E8EC] rounded-lg flex items-center justify-center">
                  <div className="w-5 h-5 bg-[#E8E8EC] rounded" />
                </div>
              </div>
              <div className="h-9 bg-[#E8E8EC] w-14 rounded mt-1" />
              <div className="h-4 bg-[#F3F4F6] w-3/4 rounded mt-1" />
            </div>
          ))}
        </section>

        {/* LinkManagement Skeleton */}
        <section className="flex flex-col gap-4">
          {/* Filter bar skeleton */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div className="h-5 bg-[#E8E8EC] w-24 rounded" />
            <div className="flex gap-2 w-full sm:w-auto">
              <div className="h-10 bg-[#E8E8EC] w-full sm:w-56 rounded-md" />
              <div className="h-10 bg-[#E8E8EC] w-20 rounded-md" />
            </div>
          </div>

          {/* Table skeleton */}
          <div className="bg-white border border-[#E8E8EC] rounded-xl hidden lg:block overflow-hidden">
            {/* Table header */}
            <div className="bg-[#FAFAFA] border-b border-[#E8E8EC] px-6 py-4 flex gap-8">
              <div className="h-4 bg-[#E8E8EC] w-24 rounded" />
              <div className="h-4 bg-[#E8E8EC] w-32 rounded" />
              <div className="h-4 bg-[#E8E8EC] w-16 rounded" />
              <div className="h-4 bg-[#E8E8EC] w-16 rounded" />
              <div className="h-4 bg-[#E8E8EC] w-20 rounded" />
              <div className="h-4 bg-[#E8E8EC] w-16 rounded ml-auto" />
            </div>
            {/* Table rows */}
            <div className="divide-y divide-[#F1F1F4]">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="px-6 py-4 flex items-center gap-8">
                  <div className="flex items-center gap-2">
                    <div className="h-5 bg-[#E8E8EC] w-20 rounded" />
                    <div className="w-4 h-4 bg-[#F3F4F6] rounded" />
                  </div>
                  <div className="h-4 bg-[#F3F4F6] w-56 rounded" />
                  <div className="h-4 bg-[#E8E8EC] w-8 rounded font-mono" />
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
              <div key={i} className="bg-white border border-[#E8E8EC] rounded-xl p-4 flex flex-col gap-4">
                <div className="flex justify-between items-start">
                  <div className="flex flex-col gap-2">
                    <div className="h-5 bg-[#E8E8EC] w-24 rounded" />
                    <div className="h-4 bg-[#F3F4F6] w-20 rounded" />
                  </div>
                  <div className="h-6 bg-[#F3F4F6] w-16 rounded-full" />
                </div>
                <div className="flex flex-col gap-2">
                  <div className="h-3 bg-[#F3F4F6] w-16 rounded uppercase text-[10px]" />
                  <div className="h-4 bg-[#F3F4F6] w-full rounded" />
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-[#F1F1F4]">
                  <div className="h-4 bg-[#E8E8EC] w-16 rounded" />
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
