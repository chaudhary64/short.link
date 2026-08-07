const DashboardSkeleton = () => {
  return (
    <div className="g-page animate-pulse">
      <div className="flex w-full flex-1 flex-col gap-7 pt-8 pb-[60px]">
        <section className="g-band">
          <div className="g-head">
            <div className="min-w-0 flex-1">
              <div className="h-3 bg-[#d8d4ca] w-48 mb-4" />
              <div className="h-12 bg-[#d8d4ca] w-64 sm:w-80" />
              <div className="h-4 bg-[#e4e0d8] w-80 sm:w-96 mt-3" />
            </div>
            <div className="w-full sm:w-auto shrink-0">
              <div className="h-11 bg-[#d8d4ca] w-full sm:w-36" />
            </div>
          </div>
        </section>

        <section className="g-stats">
          {[1, 2, 3].map((i) => (
            <div key={i} className="g-cell">
              <div className="h-3 bg-[#e4e0d8] w-16" />
              <div className="h-11 bg-[#d8d4ca] w-20 mt-4" />
              <div className="h-3 bg-[#e4e0d8] w-32 mt-4" />
            </div>
          ))}
        </section>

        <section>
          <div className="g-controls mb-4">
            <div className="h-10 bg-[#d8d4ca] w-full max-w-[300px]" />
            <div className="h-10 bg-[#d8d4ca] w-64" />
          </div>

          <div className="g-table-wrap hidden lg:block">
            <table className="g-table">
              <tbody>
                {[1, 2, 3, 4, 5].map((i) => (
                  <tr key={i}>
                    <td className="g-idx">
                      <div className="h-3 bg-[#e4e0d8] w-8" />
                    </td>
                    <td>
                      <div className="h-3 bg-[#e4e0d8] w-20" />
                    </td>
                    <td>
                      <div className="h-3 bg-[#e4e0d8] w-full max-w-[320px]" />
                    </td>
                    <td className="g-right">
                      <div className="h-3 bg-[#e4e0d8] w-12 ml-auto" />
                    </td>
                    <td>
                      <div className="h-3 bg-[#e4e0d8] w-16" />
                    </td>
                    <td>
                      <div className="h-6 bg-[#e4e0d8] w-24" />
                    </td>
                    <td>
                      <div className="h-3 bg-[#e4e0d8] w-14" />
                    </td>
                    <td>
                      <div className="flex justify-end gap-2">
                        <div className="h-6 bg-[#e4e0d8] w-12" />
                        <div className="h-6 bg-[#e4e0d8] w-12" />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="g-mobile lg:hidden">
            {[1, 2, 3].map((i) => (
              <div key={i} className="g-mcard">
                <div className="h-4 bg-[#d8d4ca] w-24" />
                <div className="h-3 bg-[#e4e0d8] w-full" />
                <div className="flex justify-between">
                  <div className="h-3 bg-[#e4e0d8] w-20" />
                  <div className="h-6 bg-[#e4e0d8] w-24" />
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default DashboardSkeleton;
