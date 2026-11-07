import { useState, useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
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
  disabled = false,
}) => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const rootRef = useRef(null);
  const triggerRef = useRef(null);
  const searchRef = useRef(null);
  const [triggerRect, setTriggerRect] = useState(null);

  const selected =
    options.find((o) => o.value === value) ||
    (value ? { value, label: value, hint: "" } : undefined);

  const updateRect = useCallback(() => {
    if (triggerRef.current) {
      setTriggerRect(triggerRef.current.getBoundingClientRect());
    }
  }, []);

  useEffect(() => {
    if (!open) return;
    updateRect();
    const handler = (e) => {
      if (rootRef.current && !rootRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    // Close on outside click (not mousedown) so an option button stays in the
    // DOM long enough for its click event to fire before the dropdown unmounts.
    document.addEventListener("click", handler);
    window.addEventListener("resize", updateRect);
    window.addEventListener("scroll", updateRect, true);
    return () => {
      document.removeEventListener("click", handler);
      window.removeEventListener("resize", updateRect);
      window.removeEventListener("scroll", updateRect, true);
    };
  }, [open, updateRect]);

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

  const dropdown =
    open && triggerRect
      ? createPortal(
          <div
            className="fixed z-[60] select-popup"
            style={{
              top: triggerRect.bottom + 6,
              left: triggerRect.left,
              width: triggerRect.width,
            }}
          >
            <div className="select-popup-search">
              <input
                ref={searchRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={searchPlaceholder}
                className="w-full px-3 py-2 g-input"
              />
            </div>
            <ul
              role="listbox"
              className="max-h-56 overflow-y-auto overscroll-contain py-1"
            >
              <li role="option" aria-selected={!value}>
                <button
                  type="button"
                  onClick={() => {
                    onChange("");
                    setOpen(false);
                  }}
                  className={`select-popup-option ${!value ? "is-selected" : ""}`}
                >
                  <span className="w-4 shrink-0" />
                  <span className="truncate">{placeholder}</span>
                  {!value && (
                    <LuCheck
                      className="w-3.5 h-3.5 ml-auto shrink-0"
                      style={{ color: "var(--accent)" }}
                    />
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
                      className={`select-popup-option ${isSelected ? "is-selected" : ""}`}
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
                          <span className="select-popup-hint truncate block">
                            {o.hint}
                          </span>
                        )}
                      </span>
                      {isSelected && (
                        <LuCheck
                          className="w-3.5 h-3.5 shrink-0"
                          style={{ color: "var(--accent)" }}
                        />
                      )}
                    </button>
                  </li>
                );
              })}
              {filtered.length === 0 && (
                <li className="select-popup-empty">
                  {emptyText}
                  {query ? ` "${query}"` : ""}
                </li>
              )}
            </ul>
          </div>,
          document.body,
        )
      : null;

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
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--ink-4)] pointer-events-none">
            {icon}
          </span>
        )}
        <button
          ref={triggerRef}
          type="button"
          onClick={() => {
            setOpen((o) => !o);
            setQuery("");
          }}
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-disabled={disabled || undefined}
          disabled={disabled}
          className={`g-select flex items-center gap-2 text-left ${icon ? "g-select-icon" : ""} ${disabled ? "opacity-60 cursor-not-allowed" : ""}`}
        >
          {selected ? (
            <>
              {renderLeading?.(selected)}
              <span
                className={`truncate ${labelClassName}`}
                style={{ color: "var(--ink)" }}
              >
                {selected.label}
              </span>
              {selected.hint && (
                <span
                  className="select-popup-hint truncate ml-auto"
                >
                  {selected.hint}
                </span>
              )}
            </>
          ) : (
            <span style={{ color: "var(--ink-4)" }}>{placeholder}</span>
          )}
        </button>
        <LuChevronDown
          className={`absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[var(--ink-4)] pointer-events-none transition-transform duration-200 ${
            open ? "rotate-180" : ""
          }`}
        />
      </div>

      {dropdown}
    </div>
  );
};

export default SearchableSelect;
