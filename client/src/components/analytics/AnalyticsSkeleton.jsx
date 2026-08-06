const AnalyticsSkeleton = () => {
  return (
    <div className="flex flex-col gap-7 w-full animate-pulse">
      <div className="g-filter-box">
        <div className="g-filter-head">
          <div className="flex items-center gap-2">
            <div className="h-3.5 w-3.5 bg-[#d6d2c7]" />
            <div className="h-3 bg-[#d6d2c7] w-16" />
          </div>
          <div className="h-7 w-16 bg-[#d6d2c7]" />
        </div>
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <div className="h-2.5 bg-[#d6d2c7] w-12" />
            <div className="flex gap-2">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-8 w-12 bg-[#d6d2c7]" />
              ))}
            </div>
          </div>
          <div className="g-filter-grid">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex flex-col gap-1.5">
                <div className="h-2.5 bg-[#d6d2c7] w-16" />
                <div className="h-9 bg-[#d6d2c7] w-full" />
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex gap-2">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="h-8 w-20 bg-[#d6d2c7]" />
        ))}
      </div>

      <div className="g-cells">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="g-cell">
            <div className="h-2.5 bg-[#d6d2c7] w-20" />
            <div className="h-8 bg-[#d6d2c7] w-16 mt-2" />
            <div className="h-2.5 bg-[#e4e1d8] w-28 mt-2" />
          </div>
        ))}
      </div>

      <div className="g-panel">
        <div className="g-panel-head">
          <div className="h-3 bg-[#d6d2c7] w-20" />
        </div>
        <div className="g-panel-body">
          <div className="h-64 bg-[#e4e1d8] border border-dashed border-[#141414]/30" />
        </div>
      </div>

      <div className="g-panel">
        <div className="g-panel-head">
          <div className="h-3 bg-[#d6d2c7] w-24" />
        </div>
        <div className="g-panel-body">
          <div className="flex flex-col gap-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center gap-3 py-3 border-b border-[#141414]/15 last:border-b-0">
                <div className="h-4 bg-[#d6d2c7] w-12" />
                <div className="h-4 bg-[#d6d2c7] flex-1" />
                <div className="h-4 bg-[#d6d2c7] w-16" />
                <div className="h-4 bg-[#d6d2c7] w-20" />
                <div className="h-4 bg-[#d6d2c7] w-16" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsSkeleton;
