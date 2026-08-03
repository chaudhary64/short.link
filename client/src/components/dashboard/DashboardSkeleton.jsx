const DashboardSkeleton = () => {
  return (
    <div className="flex flex-col flex-1 font-body pb-20 w-full animate-pulse">
      <main className="flex-1 w-full mx-auto px-6 mt-10 flex flex-col gap-10">
        <section className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between lg:gap-10">
          <div className="min-w-0 flex-1">
            <div className="h-8 bg-[#D4D4D8] w-56 sm:w-72 rounded-lg" />
            <div className="h-4 bg-[#F3F4F6] w-64 sm:w-80 rounded mt-2" />
          </div>
          <div className="w-full sm:w-auto shrink-0">
            <div className="h-10 bg-[#D4D4D8] w-full sm:w-32 rounded-md" />
          </div>
        </section>

        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-white p-5 border border-[#D4D4D8] rounded-xl flex flex-col justify-between gap-4"
            >
              <div className="flex justify-between items-start">
                <div className="h-3 bg-[#D4D4D8] w-16 rounded" />
                <div className="w-10 h-10 bg-[#F3F4F6] border border-[#D4D4D8] rounded-lg" />
              </div>
              <div className="h-8 bg-[#D4D4D8] w-14 rounded" />
              <div className="h-3 bg-[#F3F4F6] w-3/4 rounded" />
            </div>
          ))}
        </section>

        <section className="flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-2">
            <div className="flex items-center gap-3">
              <div className="h-6 bg-[#D4D4D8] w-24 rounded" />
              <div className="h-5 bg-[#F3F4F6] w-10 rounded-full border border-[#D4D4D8]" />
            </div>
            <div className="flex flex-col sm:flex-row w-full sm:w-auto gap-2">
              <div className="h-10 bg-[#D4D4D8] w-full sm:w-64 rounded-lg" />
              <div className="h-10 bg-[#D4D4D8] w-full sm:w-20 rounded-lg" />
            </div>
          </div>

          <div className="hidden lg:block overflow-hidden bg-white border border-[#D4D4D8] rounded-xl">
            <div className="bg-[#FAFAFA] border-b border-[#D4D4D8] px-5 py-3 flex items-center divide-x divide-[#E5E5EA]">
              <div className="w-[5%] px-2"><div className="h-3 bg-[#D4D4D8] w-8 rounded" /></div>
              <div className="w-[11%] px-2"><div className="h-3 bg-[#D4D4D8] w-14 rounded" /></div>
              <div className="w-[24%] px-2"><div className="h-3 bg-[#D4D4D8] w-24 rounded" /></div>
              <div className="w-[9%] px-2"><div className="h-3 bg-[#D4D4D8] w-12 rounded" /></div>
              <div className="w-[12%] px-2"><div className="h-3 bg-[#D4D4D8] w-14 rounded" /></div>
              <div className="w-[12%] px-2"><div className="h-3 bg-[#D4D4D8] w-12 rounded" /></div>
              <div className="w-[11%] px-2"><div className="h-3 bg-[#D4D4D8] w-14 rounded" /></div>
              <div className="w-[16%] px-2"><div className="h-3 bg-[#D4D4D8] w-16 rounded ml-auto" /></div>
            </div>
            <div className="divide-y divide-[#E5E5EA]">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="px-5 py-3.5 flex items-center divide-x divide-[#E5E5EA]">
                  <div className="w-[5%] px-2"><div className="h-3 bg-[#F3F4F6] w-8 rounded" /></div>
                  <div className="w-[11%] px-2"><div className="h-3 bg-[#F3F4F6] w-14 rounded" /></div>
                  <div className="w-[24%] px-2">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-[#F3F4F6] rounded shrink-0" />
                      <div className="h-3 bg-[#F3F4F6] w-full rounded" />
                    </div>
                  </div>
                  <div className="w-[9%] px-2"><div className="h-3 bg-[#F3F4F6] w-10 rounded" /></div>
                  <div className="w-[12%] px-2"><div className="h-3 bg-[#F3F4F6] w-14 rounded" /></div>
                  <div className="w-[12%] px-2"><div className="h-5 bg-[#F3F4F6] w-16 rounded-full" /></div>
                  <div className="w-[11%] px-2"><div className="h-3 bg-[#F3F4F6] w-14 rounded" /></div>
                  <div className="w-[16%] px-2">
                    <div className="flex justify-end gap-1">
                      <div className="w-8 h-8 bg-[#F3F4F6] rounded-md" />
                      <div className="w-8 h-8 bg-[#F3F4F6] rounded-md" />
                      <div className="w-8 h-8 bg-[#F3F4F6] rounded-md" />
                      <div className="w-8 h-8 bg-[#F3F4F6] rounded-md" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-4 lg:hidden">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white border border-[#D4D4D8] rounded-xl overflow-hidden">
                <div className="flex items-center gap-3 px-4 py-3.5">
                  <div className="w-8 h-8 rounded-lg bg-[#F3F4F6] border border-[#E5E5EA] flex items-center justify-center shrink-0">
                    <div className="w-4 h-4 bg-[#D4D4D8] rounded" />
                  </div>
                  <div className="flex-1 min-w-0 flex flex-col gap-1.5">
                    <div className="h-4 bg-[#D4D4D8] w-24 rounded" />
                    <div className="h-3 bg-[#F3F4F6] w-full rounded" />
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="h-3 bg-[#F3F4F6] w-8 rounded" />
                    <div className="w-7 h-7 bg-[#F3F4F6] rounded-lg" />
                  </div>
                </div>
                <div className="flex items-center justify-between gap-2 px-4 py-2 border-t border-[#E5E5EA] bg-[#FAFAFA]">
                  <div className="h-3 bg-[#F3F4F6] w-28 rounded" />
                  <div className="h-5 bg-[#F3F4F6] w-14 rounded-full" />
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
