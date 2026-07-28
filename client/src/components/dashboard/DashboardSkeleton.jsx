const DashboardSkeleton = () => {
  return (
    <div className="bg-[#fafafa] flex flex-col flex-1 font-sans pb-20 w-full animate-pulse">
      <main className="flex-1 w-full mx-auto px-6 mt-10 flex flex-col gap-10">
        
        {/* UserOverview Skeleton */}
        <section className="flex flex-col justify-between items-center sm:items-end sm:flex-row gap-6 bg-white p-6 sm:p-8 border border-gray-200 shadow-sm relative overflow-hidden">
          <div className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-6 w-full sm:w-auto">
            <div className="w-20 h-20 rounded-full bg-gray-200 shrink-0"></div>
            <div className="flex flex-col items-center sm:items-start gap-3 mt-2">
              <div className="h-8 bg-gray-200 w-48 rounded"></div>
              <div className="h-4 bg-gray-200 w-32 rounded"></div>
              <div className="h-6 bg-gray-200 w-24 rounded mt-2"></div>
            </div>
          </div>
          <div className="flex gap-3 w-full sm:w-auto mt-4 sm:mt-0">
            <div className="h-10 bg-gray-200 w-28 rounded flex-1 sm:flex-none"></div>
            <div className="h-10 bg-gray-200 w-28 rounded flex-1 sm:flex-none"></div>
          </div>
        </section>

        {/* DashboardStats Skeleton */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white p-6 border border-gray-200 shadow-sm flex flex-col gap-4">
              <div className="flex justify-between items-start">
                <div className="h-5 bg-gray-200 w-24 rounded"></div>
                <div className="w-6 h-6 bg-gray-200 rounded"></div>
              </div>
              <div className="h-8 bg-gray-200 w-16 rounded mt-2"></div>
              <div className="h-4 bg-gray-200 w-3/4 rounded mt-1"></div>
            </div>
          ))}
        </section>

        {/* LinkManagement Skeleton */}
        <section className="bg-white border border-gray-200 shadow-sm flex flex-col mt-4">
          <div className="p-5 sm:p-6 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="h-6 bg-gray-200 w-32 rounded"></div>
            <div className="h-10 bg-gray-200 w-full sm:w-64 rounded"></div>
          </div>
          
          <div className="divide-y divide-gray-100">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="p-5 sm:p-6 flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
                <div className="flex flex-col gap-2 w-full md:w-auto">
                  <div className="h-5 bg-gray-200 w-48 rounded"></div>
                  <div className="h-4 bg-gray-200 w-64 rounded"></div>
                  <div className="flex gap-2 mt-1">
                    <div className="h-5 bg-gray-200 w-16 rounded-full"></div>
                    <div className="h-5 bg-gray-200 w-24 rounded-full"></div>
                  </div>
                </div>
                <div className="flex gap-2 w-full md:w-auto mt-2 md:mt-0 justify-end">
                  <div className="w-9 h-9 bg-gray-200 rounded"></div>
                  <div className="w-9 h-9 bg-gray-200 rounded"></div>
                  <div className="w-9 h-9 bg-gray-200 rounded"></div>
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
