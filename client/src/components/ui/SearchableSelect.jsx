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
        <span className="flex items-center gap-1.5 g-flabel">
          {label}
          {info && <InfoTooltip text={info} />}
        </span>
      )}

      <div className="relative">
        {icon && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8a8578] pointer-events-none">
            {icon}
          </span>
        )}
        <button
          type="button"
          onClick={() => {
            setOpen((o) => !o);
            setQuery("");
          }}
          aria-haspopup="listbox"
          aria-expanded={open}
          className={`g-select flex items-center gap-2 text-left ${
            icon ? "pl-9" : ""
          } ${open ? "border-[#1d4ed8]" : ""}`}
        >
          {selected ? (
            <>
              {renderLeading?.(selected)}
              <span className={`truncate text-[#141414] ${labelClassName}`}>
                {selected.label}
              </span>
              {selected.hint && (
                <span className="text-[11px] text-[#8a8578] truncate ml-auto">
                  {selected.hint}
                </span>
              )}
            </>
          ) : (
            <span className="text-[#8a8578]">{placeholder}</span>
          )}
        </button>
        <LuChevronDown
          className={`absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#8a8578] pointer-events-none transition-transform duration-200 ${
            open ? "rotate-180" : ""
          }`}
        />
      </div>

      {open && (
        <div className="relative z-40">
          <div className="absolute left-0 right-0 top-1.5 bg-[#f5f3ee] border-2 border-[#141414] shadow-[8px_8px_0_#141414] overflow-hidden animate-in">
            <div className="p-2 border-b border-[#141414]">
              <input
                ref={searchRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={searchPlaceholder}
                className="w-full px-3 py-2 g-input"
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
                      ? "bg-[#141414] text-[#f5f3ee] font-bold"
                      : "text-[#8a8578] hover:bg-[#141414] hover:text-[#f5f3ee]"
                  }`}
                >
                  <span className="w-4 shrink-0" />
                  <span className="truncate">{placeholder}</span>
                  {!value && (
                    <LuCheck className="w-3.5 h-3.5 text-[#eab308] ml-auto shrink-0" />
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
                          ? "bg-[#141414] text-[#f5f3ee] font-bold"
                          : "text-[#141414] hover:bg-[#141414] hover:text-[#f5f3ee]"
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
                          <span className="text-[11px] text-[#8a8578] truncate block">
                            {o.hint}
                          </span>
                        )}
                      </span>
                      {isSelected && (
                        <LuCheck className="w-3.5 h-3.5 text-[#eab308] shrink-0" />
                      )}
                    </button>
                  </li>
                );
              })}
              {filtered.length === 0 && (
                <li className="px-3 py-6 text-xs text-[#8a8578] text-center">
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
