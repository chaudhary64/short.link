const AnalyticsSkeleton = () => {
  return (
    <div className="flex flex-col gap-6 sm:gap-8 w-full animate-pulse">
      {/* KPI cards skeleton — each with a sparkline bar */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="bg-white border border-[#D4D4D8] rounded-xl p-5 flex flex-col"
          >
            <div className="flex items-start justify-between">
              <div className="h-3 bg-[#D4D4D8] w-24 rounded" />
              <div className="w-9 h-9 bg-[#F3F4F6] border border-[#D4D4D8] rounded-lg flex items-center justify-center">
                <div className="w-4 h-4 bg-[#D4D4D8] rounded" />
              </div>
            </div>
            <div className="h-8 bg-[#D4D4D8] w-16 rounded mt-3" />
            <div className="h-3 bg-[#F3F4F6] w-32 rounded mt-2" />
            <div className="h-8 bg-[#F3F4F6] rounded mt-4" />
          </div>
        ))}
      </section>

      {/* Hero chart skeleton */}
      <section className="bg-white border border-[#D4D4D8] rounded-xl flex flex-col">
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#D4D4D8]">
          <div className="h-3 bg-[#D4D4D8] w-20 rounded" />
          <div className="h-6 bg-[#F3F4F6] w-32 rounded-full" />
        </div>
        <div className="p-5 flex flex-col gap-4 flex-1">
          <div className="h-8 bg-[#D4D4D8] w-20 rounded" />
          <div className="h-48 bg-[#F3F4F6] rounded" />
        </div>
      </section>

      {/* Geography skeleton */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="bg-white border border-[#D4D4D8] rounded-xl flex flex-col">
          <div className="px-5 py-3.5 border-b border-[#D4D4D8]">
            <div className="h-3 bg-[#D4D4D8] w-28 rounded" />
          </div>
          <div className="p-5 flex flex-col gap-4 flex-1">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex flex-col gap-2">
                <div className="h-3 bg-[#F3F4F6] w-32 rounded" />
                <div className="h-1 bg-[#F3F4F6] rounded-full" />
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white border border-[#D4D4D8] rounded-xl flex flex-col lg:col-span-2">
          <div className="px-5 py-3.5 border-b border-[#D4D4D8]">
            <div className="h-3 bg-[#D4D4D8] w-20 rounded" />
          </div>
          <div className="p-5 flex-1 flex flex-col gap-3">
            <div className="h-44 sm:h-52 bg-[#F3F4F6] rounded flex-1" />
            <div className="flex gap-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-2 bg-[#F3F4F6] w-16 rounded" />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Technology donuts skeleton */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white border border-[#D4D4D8] rounded-xl flex flex-col">
            <div className="px-5 py-3.5 border-b border-[#D4D4D8]">
              <div className="h-3 bg-[#D4D4D8] w-16 rounded" />
            </div>
            <div className="p-5 flex flex-col items-center gap-3 flex-1">
              <div className="w-32 h-32 rounded-full bg-[#F3F4F6] border-[10px] border-[#E5E5EA]" />
              {[1, 2, 3].map((j) => (
                <div key={j} className="h-3 bg-[#F3F4F6] w-full rounded" />
              ))}
            </div>
          </div>
        ))}
      </section>

      {/* Table skeleton */}
      <section className="bg-white border border-[#D4D4D8] rounded-xl flex flex-col">
        <div className="px-5 py-3.5 border-b border-[#D4D4D8]">
          <div className="h-3 bg-[#D4D4D8] w-20 rounded" />
        </div>
        <div className="flex flex-col">
          <div className="flex gap-8 px-5 py-3 border-b border-[#D4D4D8]">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-3 bg-[#D4D4D8] w-12 rounded" />
            ))}
          </div>
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex gap-8 px-5 py-4 border-b border-[#E5E5EA] last:border-b-0">
              {[1, 2, 3, 4, 5].map((j) => (
                <div key={j} className="h-3 bg-[#F3F4F6] w-14 rounded" />
              ))}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default AnalyticsSkeleton;
