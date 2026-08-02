const AnalyticsSkeleton = () => {
  return (
    <div className="flex flex-col gap-5 sm:gap-10 w-full animate-pulse">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 sm:w-9 sm:h-9 bg-[#F3F4F6] border border-[#D4D4D8] rounded-lg shrink-0" />
        <div className="flex flex-col gap-1.5">
          <div className="h-4 bg-[#D4D4D8] w-24 rounded" />
          <div className="h-3 bg-[#F3F4F6] w-40 rounded" />
        </div>
      </div>

      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="bg-white border border-[#D4D4D8] rounded-xl p-5 flex flex-col justify-between"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="h-3 bg-[#D4D4D8] w-20 rounded" />
              <div className="w-10 h-10 bg-[#F3F4F6] border border-[#D4D4D8] rounded-lg shrink-0" />
            </div>
            <div className="flex items-end justify-between gap-3 mt-3">
              <div className="flex flex-col gap-2 min-w-0">
                <div className="h-8 bg-[#D4D4D8] w-16 rounded" />
                <div className="h-3 bg-[#F3F4F6] w-28 rounded" />
              </div>
              <div className="h-4 bg-[#F3F4F6] w-10 rounded shrink-0" />
            </div>
            <div className="h-8 bg-[#F3F4F6] rounded mt-4" />
          </div>
        ))}
      </section>

      <div className="flex flex-col gap-5 pt-6 sm:pt-8 border-t border-[#D4D4D8]">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 sm:w-9 sm:h-9 bg-[#F3F4F6] border border-[#D4D4D8] rounded-lg shrink-0" />
          <div className="flex flex-col gap-1.5">
            <div className="h-4 bg-[#D4D4D8] w-16 rounded" />
            <div className="h-3 bg-[#F3F4F6] w-36 rounded" />
          </div>
        </div>

        <div className="bg-white border border-[#D4D4D8] rounded-xl flex flex-col">
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#D4D4D8]">
            <div className="flex items-center gap-2">
              <div className="w-3.5 h-3.5 bg-[#D4D4D8] rounded" />
              <div className="h-3 bg-[#D4D4D8] w-14 rounded" />
            </div>
            <div className="h-6 bg-[#F3F4F6] w-32 rounded-full" />
          </div>
          <div className="p-5 flex flex-col gap-3 flex-1">
            <div className="h-44 sm:h-52 bg-[#F3F4F6] rounded" />
            <div className="flex gap-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-2 bg-[#F3F4F6] w-16 rounded" />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsSkeleton;
