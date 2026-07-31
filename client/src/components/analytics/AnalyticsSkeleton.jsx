const AnalyticsSkeleton = () => {
  return (
    <div className="flex flex-col gap-8 w-full animate-pulse">
      {/* Stat cards skeleton */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="bg-white border border-gray-200 shadow-sm p-5 flex flex-col justify-between gap-4"
          >
            <div className="flex items-start justify-between">
              <div className="h-3 bg-gray-200 w-24 rounded" />
              <div className="w-9 h-9 bg-gray-100 border border-gray-200 flex items-center justify-center">
                <div className="w-4 h-4 bg-gray-200 rounded" />
              </div>
            </div>
            <div className="h-8 bg-gray-200 w-16 rounded mt-3" />
            <div className="h-3 bg-gray-100 w-32 rounded mt-1" />
          </div>
        ))}
      </section>

      {/* Large charts skeleton */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {[1, 2].map((i) => (
          <div key={i} className="bg-white border border-gray-200 shadow-sm flex flex-col">
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
              <div className="h-3 bg-gray-200 w-28 rounded" />
              <div className="h-3 bg-gray-100 w-10 rounded" />
            </div>
            <div className="p-4 sm:p-5 flex flex-col gap-4 flex-1">
              <div className="h-8 bg-gray-200 w-16 rounded" />
              <div className="h-40 bg-gray-100 rounded" />
              <div className="flex justify-between">
                <div className="h-3 bg-gray-100 w-12 rounded" />
                <div className="h-3 bg-gray-100 w-12 rounded" />
              </div>
            </div>
          </div>
        ))}
      </section>

      {/* Geography skeleton */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="bg-white border border-gray-200 shadow-sm flex flex-col">
          <div className="px-4 py-3 border-b border-gray-100">
            <div className="h-3 bg-gray-200 w-24 rounded" />
          </div>
          <div className="p-4 sm:p-5 flex flex-col gap-4 flex-1">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex flex-col gap-2">
                <div className="h-3 bg-gray-100 w-32 rounded" />
                <div className="h-1 bg-gray-100 rounded" />
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white border border-gray-200 shadow-sm flex flex-col lg:col-span-2">
          <div className="px-4 py-3 border-b border-gray-100">
            <div className="h-3 bg-gray-200 w-16 rounded" />
          </div>
          <div className="p-4 sm:p-5 flex-1 flex flex-col gap-3">
            <div className="h-36 sm:h-44 bg-gray-100 rounded flex-1" />
            <div className="flex gap-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-4 bg-gray-100 w-20 rounded" />
              ))}
            </div>
          </div>
        </div>

        {/* Top cities skeleton */}
        <div className="bg-white border border-gray-200 shadow-sm flex flex-col lg:col-span-3">
          <div className="px-4 py-3 border-b border-gray-100">
            <div className="h-3 bg-gray-200 w-20 rounded" />
          </div>
          <div className="p-4 sm:p-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="h-3 bg-gray-100 w-24 rounded" />
                <div className="h-3 bg-gray-100 w-10 rounded" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Tech breakdown skeleton */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white border border-gray-200 shadow-sm flex flex-col">
            <div className="px-4 py-3 border-b border-gray-100">
              <div className="h-3 bg-gray-200 w-20 rounded" />
            </div>
            <div className="p-4 sm:p-5 flex-1 flex flex-col items-center gap-4">
              <div className="w-24 h-24 bg-gray-100 rounded-full" />
              <div className="w-full flex flex-col gap-2">
                {[1, 2, 3].map((j) => (
                  <div key={j} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-gray-200 rounded-full" />
                      <div className="h-3 bg-gray-100 w-16 rounded" />
                    </div>
                    <div className="h-3 bg-gray-100 w-8 rounded" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </section>

      {/* Top links table skeleton */}
      <section className="bg-white border border-gray-200 shadow-sm flex flex-col">
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
          <div className="h-3 bg-gray-200 w-20 rounded" />
          <div className="h-3 bg-gray-100 w-32 rounded" />
        </div>
        <div className="hidden lg:block">
          <div className="bg-gray-50 border-b border-gray-100 px-5 py-2.5 flex gap-8">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-3 bg-gray-200 w-16 rounded" />
            ))}
          </div>
          <div className="divide-y divide-gray-50">
            {[1, 2, 3].map((i) => (
              <div key={i} className="px-5 py-3 flex items-center gap-8">
                <div className="h-4 bg-gray-200 w-20 rounded" />
                <div className="h-4 bg-gray-100 w-40 rounded" />
                <div className="h-4 bg-gray-200 w-10 rounded" />
                <div className="h-4 bg-gray-100 w-10 rounded" />
                <div className="h-4 bg-gray-100 w-10 rounded" />
                <div className="h-4 bg-gray-100 w-24 rounded" />
                <div className="h-4 bg-gray-100 w-24 rounded" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline skeleton */}
      <section className="bg-white border border-gray-200 shadow-sm flex flex-col">
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
          <div className="h-3 bg-gray-200 w-24 rounded" />
          <div className="h-3 bg-gray-100 w-16 rounded" />
        </div>
        <div className="px-4 sm:px-5 flex flex-col divide-y divide-gray-50">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex flex-col sm:flex-row sm:items-center gap-3 py-4">
              <div className="flex items-center gap-2.5 sm:w-32 sm:shrink-0">
                <div className="w-8 h-8 bg-gray-100 border border-gray-100 rounded-full shrink-0" />
                <div className="flex flex-col gap-1.5">
                  <div className="h-3 bg-gray-200 w-16 rounded" />
                  <div className="h-2.5 bg-gray-100 w-20 rounded" />
                </div>
              </div>
              <div className="flex-1 w-full grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-3">
                {[1, 2, 3, 4, 5, 6].map((j) => (
                  <div key={j} className="flex flex-col gap-1.5">
                    <div className="h-2 bg-gray-200 w-14 rounded" />
                    <div className="h-3 bg-gray-100 w-24 rounded" />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default AnalyticsSkeleton;
