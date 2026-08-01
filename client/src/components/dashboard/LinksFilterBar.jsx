import { useState, useEffect, useRef } from "react";
import Button from "../ui/Button";
import { LuCheck, LuSearch, LuSlidersHorizontal, LuX } from "react-icons/lu";

const LinksFilterBar = ({
  searchQuery,
  setSearchQuery,
  statusFilter,
  setStatusFilter,
  hasActiveFilters,
  clearFilters,
  totalLinksCount,
  filteredLinksCount,
}) => {
  const [filterOpen, setFilterOpen] = useState(false);
  const filterRef = useRef(null);

  useEffect(() => {
    if (!filterOpen) return;
    const handler = (e) => {
      if (filterRef.current && !filterRef.current.contains(e.target)) {
        setFilterOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    document.addEventListener("touchstart", handler);
    return () => {
      document.removeEventListener("mousedown", handler);
      document.removeEventListener("touchstart", handler);
    };
  }, [filterOpen]);

  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-2">
      <div className="flex items-center gap-3">
        <h2 className="text-xl font-display font-bold tracking-[-0.03em] text-[#0A0A0A]">
          All links
        </h2>
        <span className="rounded-full bg-[#F3F4F6] border border-[#D4D4D8] px-2.5 py-0.5 text-[11px] font-semibold text-[#6B6B6B] tabular-nums">
          {hasActiveFilters ? `${filteredLinksCount} / ${totalLinksCount}` : totalLinksCount}
        </span>
      </div>
      <div className="flex flex-col sm:flex-row w-full sm:w-auto gap-2">
        <div className="relative w-full sm:w-64">
          <LuSearch className="w-4 h-4 text-[#9C9C9C] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            name="dashboard-search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Escape") {
                setSearchQuery("");
                e.currentTarget.blur();
              }
            }}
            placeholder="Search links…"
            className="px-3.5 py-2.5 pl-9 pr-8 border border-[#D4D4D8] rounded-lg text-sm text-[#0A0A0A] bg-white focus:outline-none focus:border-[#6366F1] focus-visible:ring-[3px] focus-visible:ring-[#6366F1]/12 w-full transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-[#9C9C9C] hover:text-[#0A0A0A] hover:bg-[#F3F4F6] rounded transition-colors cursor-pointer"
              title="Clear search"
              aria-label="Clear search"
            >
              <LuX className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
        <div className="relative" ref={filterRef}>
          <Button
            variant="secondary"
            className="px-4 w-full sm:w-auto flex gap-2 items-center"
            onClick={() => setFilterOpen((o) => !o)}
          >
            <LuSlidersHorizontal className="w-3.5 h-3.5" />
            Filter
            {statusFilter !== "all" && (
              <span className="w-2 h-2 rounded-full bg-[#6366F1] inline-block" />
            )}
          </Button>
          {filterOpen && (
            <div className="absolute right-0 top-full mt-1 w-44 bg-white border border-[#D4D4D8] rounded-lg shadow-lg z-50 overflow-hidden">
              {[["all", "All"], ["active", "Active"], ["disabled", "Disabled"]].map(
                ([value, label]) => (
                  <button
                    key={value}
                    onClick={() => { setStatusFilter(value); setFilterOpen(false); }}
                    className={`w-full text-left px-4 py-2.5 text-sm flex items-center justify-between transition-colors
                      ${statusFilter === value
                        ? "bg-[#6366F1] text-white"
                        : "text-[#0A0A0A] hover:bg-[#F6F6F9]"
                      }`}
                  >
                    {label}
                    {statusFilter === value && (
                      <LuCheck className="w-3.5 h-3.5" />
                    )}
                  </button>
                )
              )}
            </div>
          )}
        </div>
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="text-xs font-medium text-[#6366F1] hover:text-[#4F46E5] whitespace-nowrap self-center"
          >
            Clear filters
          </button>
        )}
      </div>
    </div>
  );
};

export default LinksFilterBar;
