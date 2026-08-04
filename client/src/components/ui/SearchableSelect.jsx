import { useState, useEffect, useRef } from "react";
import { LuCheck, LuChevronDown } from "react-icons/lu";
import InfoTooltip from "./InfoTooltip";

const SearchableSelect = ({
  label,
  info,
  icon,
  value,
  onChange,
  options,
  placeholder = "All",
  searchPlaceholder = "Search…",
  emptyText = "No matches",
  renderLeading,
  labelClassName = "",
}) => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const rootRef = useRef(null);
  const searchRef = useRef(null);

  const selected =
    options.find((o) => o.value === value) ||
    (value ? { value, label: value, hint: "" } : undefined);

  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (rootRef.current && !rootRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const t = setTimeout(() => searchRef.current?.focus(), 50);
    return () => clearTimeout(t);
  }, [open]);

  const filtered = options
    .filter((o) =>
      `${o.label} ${o.hint ?? ""}`
        .toLowerCase()
        .includes(query.trim().toLowerCase()),
    )
    .sort((a, b) => a.label.localeCompare(b.label));

  return (
    <div ref={rootRef} className="flex flex-col gap-1.5 min-w-0">
      {label && (
        <span className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#0A0A0A]">
          {label}
          {info && <InfoTooltip text={info} />}
        </span>
      )}

      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9C9C9C] pointer-events-none">
          {icon}
        </span>
        <button
          type="button"
          onClick={() => {
            setOpen((o) => !o);
            setQuery("");
          }}
          aria-haspopup="listbox"
          aria-expanded={open}
          className={`w-full pl-9 pr-8 py-2.5 border rounded-md text-sm bg-white appearance-none cursor-pointer focus:outline-none focus:border-[#6366F1] focus-visible:ring-[3px] focus-visible:ring-[#6366F1]/12 transition-all flex items-center gap-2 text-left ${
            open
              ? "border-[#6366F1] ring-[3px] ring-[#6366F1]/12"
              : "border-[#D4D4D8]"
          }`}
        >
          {selected ? (
            <>
              {renderLeading?.(selected)}
              <span className={`truncate text-[#0A0A0A] ${labelClassName}`}>
                {selected.label}
              </span>
              {selected.hint && (
                <span className="text-[11px] text-[#9C9C9C] truncate ml-auto">
                  {selected.hint}
                </span>
              )}
            </>
          ) : (
            <span className="text-[#9C9C9C]">{placeholder}</span>
          )}
        </button>
        <LuChevronDown
          className={`absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#9C9C9C] pointer-events-none transition-transform duration-200 ${
            open ? "rotate-180" : ""
          }`}
        />
      </div>

      {open && (
        <div className="relative z-40">
          <div className="absolute left-0 right-0 top-1.5 bg-white border border-[#D4D4D8] rounded-lg shadow-lg overflow-hidden animate-in">
            <div className="p-2 border-b border-[#E5E5EA]">
              <input
                ref={searchRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={searchPlaceholder}
                className="w-full px-3 py-2 border border-[#D4D4D8] rounded-md text-sm text-[#0A0A0A] placeholder:text-[#9C9C9C] focus:outline-none focus:border-[#6366F1] focus-visible:ring-[3px] focus-visible:ring-[#6366F1]/12 bg-white"
              />
            </div>
            <ul role="listbox" className="max-h-56 overflow-y-auto overscroll-contain py-1">
              <li role="option" aria-selected={!value}>
                <button
                  type="button"
                  onClick={() => {
                    onChange("");
                    setOpen(false);
                  }}
                  className={`w-full flex items-center gap-2 px-3 py-2 text-sm text-left transition-colors duration-150 cursor-pointer ${
                    !value
                      ? "bg-[#6366F1]/5 text-[#0A0A0A] font-medium"
                      : "text-[#6B6B6B] hover:bg-[#F6F6F9] hover:text-[#0A0A0A]"
                  }`}
                >
                  <span className="w-4 shrink-0" />
                  <span className="truncate">{placeholder}</span>
                  {!value && (
                    <LuCheck className="w-3.5 h-3.5 text-[#6366F1] ml-auto shrink-0" />
                  )}
                </button>
              </li>
              {filtered.map((o) => {
                const isSelected = o.value === value;
                return (
                  <li key={o.value} role="option" aria-selected={isSelected}>
                    <button
                      type="button"
                      onClick={() => {
                        onChange(o.value);
                        setOpen(false);
                      }}
                      className={`w-full flex items-center gap-2 px-3 py-2 text-sm text-left transition-colors duration-150 cursor-pointer ${
                        isSelected
                          ? "bg-[#6366F1]/5 text-[#0A0A0A] font-medium"
                          : "text-[#0A0A0A] hover:bg-[#F6F6F9]"
                      }`}
                    >
                      {renderLeading ? (
                        renderLeading(o)
                      ) : (
                        <span className="w-4 shrink-0" />
                      )}
                      <span className="flex-1 min-w-0">
                        <span className={`truncate block ${labelClassName}`}>
                          {o.label}
                        </span>
                        {o.hint && (
                          <span className="text-[11px] text-[#9C9C9C] truncate block">
                            {o.hint}
                          </span>
                        )}
                      </span>
                      {isSelected && (
                        <LuCheck className="w-3.5 h-3.5 text-[#6366F1] shrink-0" />
                      )}
                    </button>
                  </li>
                );
              })}
              {filtered.length === 0 && (
                <li className="px-3 py-6 text-xs text-[#9C9C9C] text-center">
                  {emptyText}
                  {query ? ` "${query}"` : ""}
                </li>
              )}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchableSelect;
