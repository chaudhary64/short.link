const AnalyticsSkeleton = ({ section = "overview" }) => {
  return (
    <div className="flex flex-col gap-7 w-full animate-pulse">
      <div className="flex flex-col gap-2">
        <div className="h-2.5 w-24 bg-[#d6d2c7]" />
        <div className="h-6 w-48 bg-[#d6d2c7]" />
        <div className="h-3 w-80 max-w-full bg-[#e4e1d8]" />
      </div>

      {section === "overview" && (
        <>
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
                  <div
                    key={i}
                    className="flex items-center gap-3 py-3 border-b border-[#141414]/15 last:border-b-0"
                  >
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
        </>
      )}

      {section === "geography" && (
        <>
          <div className="g-panel">
            <div className="g-panel-head">
              <div className="h-3 bg-[#d6d2c7] w-24" />
            </div>
            <div className="g-panel-body">
              <div className="flex flex-col gap-3">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 py-3 border-b border-[#141414]/15 last:border-b-0"
                  >
                    <div className="h-4 bg-[#d6d2c7] w-6" />
                    <div className="h-4 bg-[#d6d2c7] flex-1" />
                    <div className="h-4 bg-[#d6d2c7] w-16" />
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="g-panel">
            <div className="g-panel-head">
              <div className="h-3 bg-[#d6d2c7] w-20" />
            </div>
            <div className="g-panel-body">
              <div className="h-80 bg-[#e4e1d8] border border-dashed border-[#141414]/30" />
            </div>
          </div>
        </>
      )}

      {section === "technology" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3].map((i) => (
            <div key={i} className="g-panel">
              <div className="g-panel-head">
                <div className="h-3 bg-[#d6d2c7] w-20" />
              </div>
              <div className="g-panel-body flex flex-col items-center gap-4 py-6">
                <div className="h-32 w-32 bg-[#e4e1d8] border border-dashed border-[#141414]/30" />
                {[1, 2, 3].map((r) => (
                  <div key={r} className="flex items-center gap-2 w-full">
                    <div className="h-2.5 w-2.5 bg-[#d6d2c7]" />
                    <div className="h-2.5 bg-[#d6d2c7] w-20" />
                    <div className="h-2.5 bg-[#d6d2c7] w-8 ml-auto" />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {section === "links" && (
        <div className="g-panel">
          <div className="g-panel-head">
            <div className="h-3 bg-[#d6d2c7] w-24" />
          </div>
          <div className="g-panel-body">
            <div className="flex items-center gap-3 pb-3 border-b border-[#141414]/15">
              <div className="h-2.5 bg-[#d6d2c7] w-8" />
              <div className="h-2.5 bg-[#d6d2c7] w-24" />
              <div className="h-2.5 bg-[#d6d2c7] w-12" />
              <div className="h-2.5 bg-[#d6d2c7] w-12" />
              <div className="h-2.5 bg-[#d6d2c7] w-12" />
              <div className="h-2.5 bg-[#d6d2c7] w-16" />
              <div className="h-2.5 bg-[#d6d2c7] w-12" />
            </div>
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="flex items-center gap-3 py-3 border-b border-[#141414]/15 last:border-b-0"
              >
                <div className="h-4 bg-[#d6d2c7] w-8" />
                <div className="h-4 bg-[#d6d2c7] flex-1" />
                <div className="h-4 bg-[#d6d2c7] w-12" />
                <div className="h-4 bg-[#d6d2c7] w-12" />
                <div className="h-4 bg-[#d6d2c7] w-12" />
                <div className="h-4 bg-[#d6d2c7] w-16" />
                <div className="h-4 bg-[#d6d2c7] w-12" />
              </div>
            ))}
          </div>
        </div>
      )}

      {section === "timeline" && (
        <div className="g-panel">
          <div className="g-panel-head">
            <div className="h-3 bg-[#d6d2c7] w-24" />
          </div>
          <div className="g-panel-body">
            <div className="flex flex-wrap gap-2 pb-4">
              {[1, 2, 3, 4, 5, 6, 7].map((i) => (
                <div key={i} className="h-8 w-14 bg-[#d6d2c7]" />
              ))}
            </div>
            <div className="flex flex-col gap-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 py-3 border-b border-[#141414]/15 last:border-b-0"
                >
                  <div className="h-4 w-4 bg-[#d6d2c7]" />
                  <div className="h-4 bg-[#d6d2c7] flex-1" />
                  <div className="h-4 bg-[#d6d2c7] w-16" />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AnalyticsSkeleton;
