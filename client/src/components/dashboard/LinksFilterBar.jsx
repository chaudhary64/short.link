import { useEffect, useRef } from "react";
import { isTypingTarget } from "../../utils/keyboard";
import { LuSearch, LuX } from "react-icons/lu";

const LinksFilterBar = ({
  searchQuery,
  setSearchQuery,
  statusFilter,
  setStatusFilter,
  hasActiveFilters,
  clearFilters,
  statusCounts = { all: 0, active: 0, disabled: 0 },
}) => {
  const searchRef = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (e.key !== "/" || e.metaKey || e.ctrlKey || e.altKey) return;
      if (isTypingTarget(e.target)) return;
      e.preventDefault();
      searchRef.current?.focus();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, []);

  return (
    <div className="g-controls">
      <div className="g-search">
        <span className="g-search-label">Search</span>
        <LuSearch className="g-search-ico" aria-hidden />
        <input
          ref={searchRef}
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
          placeholder="find a link"
        />
        {searchQuery ? (
          <button
            className="g-search-x"
            onClick={() => setSearchQuery("")}
            title="Clear search"
            aria-label="Clear search"
          >
            <LuX className="w-3.5 h-3.5" />
          </button>
        ) : (
          <span className="g-kbd" aria-hidden>
            /
          </span>
        )}
      </div>

      <div className="g-tabs">
        {["all", "active", "disabled"].map((s) => (
          <button
            key={s}
            className={`g-tab ${statusFilter === s ? "on" : ""}`}
            onClick={() => setStatusFilter(s)}
            aria-pressed={statusFilter === s}
          >
            {s.toUpperCase()} {statusCounts[s]}
          </button>
        ))}
        {hasActiveFilters && (
          <button className="g-tab-clear" onClick={clearFilters}>
            Clear ×
          </button>
        )}
      </div>
    </div>
  );
};

export default LinksFilterBar;
