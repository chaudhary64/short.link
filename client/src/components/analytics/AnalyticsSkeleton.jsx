const AnalyticsSkeleton = () => {
  return (
    <div className="flex flex-col gap-7 w-full animate-pulse">
      <div className="g-panel">
        <div className="g-panel-head">
          <div className="h-3 bg-[#d6d2c7] w-24" />
          <div className="h-6 bg-[#d6d2c7] w-32" />
        </div>
        <div className="g-panel-body">
          <div className="h-44 bg-[#e4e1d8] border border-dashed border-[#141414]/30" />
        </div>
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
          <div className="h-52 bg-[#e4e1d8] border border-dashed border-[#141414]/30" />
        </div>
      </div>
    </div>
  );
};

export default AnalyticsSkeleton;
