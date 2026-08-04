import { useMemo, useState, useRef, useEffect } from "react";
import {
  LuArrowDown,
  LuArrowRight,
  LuChevronRight,
  LuClock,
  LuCrosshair,
  LuLoader,
  LuSearch,
  LuX,
} from "react-icons/lu";
import Card from "../ui/Card";
import CountryFlag from "./CountryFlag";
import Favicon from "./Favicon";
import { BrowserIcon, DeviceIcon, OsIcon } from "./DeviceIcons";
import { countryNameFromCode } from "../../utils/countryCodes";
import { formatDateTime } from "../../utils/format";
import { dayKeyLabel, timeAgo } from "../../utils/timeline";

const DAY = 24 * 60 * 60 * 1000;
const DAY_CHIP_CAP = 14;

const chipBase =
  "inline-flex items-center gap-1 px-2 py-1 text-[11px] font-medium border rounded transition-all duration-150 cursor-pointer whitespace-nowrap";
const chipIdle =
  "border-[#D4D4D8] bg-white text-[#6B6B6B] hover:border-[#C1C1C9] hover:text-[#0A0A0A]";
const chipActive = "border-[#6366F1] bg-[#6366F1] text-white";

const hostOf = (url) => {
  if (!url) return "";
  try {
    return new URL(url).hostname;
  } catch {
    return url;
  }
};

const dayGroupLabel = (isoStr) => {
  const d = new Date(isoStr);
  if (Number.isNaN(d.getTime())) return "—";
  const now = new Date();
  const startOf = (x) => new Date(x.getFullYear(), x.getMonth(), x.getDate());
  const diff = Math.round((startOf(now) - startOf(d)) / DAY);
  if (diff === 0) return "Today";
  if (diff === 1) return "Yesterday";
  return d.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
};

const ClickTimeline = ({
  timeline = [],
  dayCounts = [],
  selectedDay = null,
  onSelectDay,
  limit = 25,
  onLoadMore,
  totalClicks = 0,
  isLoading = false,
  isFetching = false,
  search = "",
  onSearchChange,
  onFocusLink,
}) => {
  const [showAllDays, setShowAllDays] = useState(false);
  const chipsRef = useRef(null);
  const [chipsScroll, setChipsScroll] = useState({ left: 0, max: 0 });

  const dayChips = useMemo(() => {
    return dayCounts
      .filter((d) => d.date && d.clicks > 0)
      .map((d) => ({ date: d.date, count: d.clicks }))
      .sort((a, b) => (a.date < b.date ? 1 : -1));
  }, [dayCounts]);

  const visibleDayChips = useMemo(
    () => (showAllDays ? dayChips : dayChips.slice(0, DAY_CHIP_CAP)),
    [dayChips, showAllDays],
  );
  const hiddenChipCount = dayChips.length - visibleDayChips.length;

  useEffect(() => {
    const el = chipsRef.current;
    if (!el) return;
    const update = () =>
      setChipsScroll({ left: el.scrollLeft, max: el.scrollWidth - el.clientWidth });
    update();
    el.addEventListener("scroll", update);
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => {
      el.removeEventListener("scroll", update);
      ro.disconnect();
    };
  }, [visibleDayChips.length]);

  const groups = useMemo(() => {
    const out = [];
    for (const t of timeline) {
      const label = dayGroupLabel(t.clicked_at);
      const last = out[out.length - 1];
      if (last && last.label === label) last.items.push(t);
      else out.push({ label, items: [t] });
    }
    return out;
  }, [timeline]);

  const itemCount = groups.reduce((acc, g) => acc + g.items.length, 0);

  const isLatest = !selectedDay;
  const activeDayCount = isLatest
    ? totalClicks
    : dayChips.find((c) => c.date === selectedDay)?.count ?? itemCount;

  const isDayLoading = isFetching && isLoading;

  const isLoadingMore = isFetching && !isLoading && timeline.length < limit;

  const searching = search.trim().length > 0;

  const canLoadMore = searching
    ? !isLoading && timeline.length >= limit
    : !isLoading &&
      timeline.length < activeDayCount &&
      (timeline.length >= limit || isLoadingMore);

  const clearSearch = () => onSearchChange?.("");

  return (
    <Card
      icon={<LuClock className="w-3.5 h-3.5" />}
      right={
        <span className="hidden sm:inline-flex items-center gap-1 text-[11px] text-[#71717A]">
          <LuArrowDown className="w-3 h-3" />
          Latest first
        </span>
      }
    >
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-4">
        <div className="relative flex-1 min-w-0">
          <LuSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#71717A] pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => onSearchChange?.(e.target.value)}
            placeholder="Search links, URLs, cities…"
            className="w-full pl-9 pr-8 py-2 border border-[#D4D4D8] rounded-md text-sm text-[#0A0A0A] bg-white focus:outline-none focus:border-[#6366F1] focus-visible:ring-[3px] focus-visible:ring-[#6366F1]/20 transition-all"
          />
          {search && (
            <button
              type="button"
              onClick={clearSearch}
              aria-label="Clear search"
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#71717A] hover:text-[#0A0A0A] transition-colors cursor-pointer focus-visible:ring-[3px] focus-visible:ring-[#6366F1]/20 focus-visible:outline-none"
            >
              <LuX className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      <div className="relative mb-4">
        <div
          ref={chipsRef}
          className="flex items-center gap-2 overflow-x-auto pb-2 -mx-1 px-1 overscroll-contain scroll-smooth"
          aria-busy={isDayLoading}
        >
          <button
            type="button"
            onClick={() => onSelectDay(null)}
            aria-pressed={isLatest}
            disabled={isDayLoading}
            className={`${chipBase} ${isLatest ? chipActive : chipIdle} ${isDayLoading ? "opacity-60 cursor-wait" : ""}`}
          >
            Latest
            <span className={`tabular-nums ${isLatest ? "text-white/80" : "text-[#71717A]"}`}>
              {totalClicks.toLocaleString()}
            </span>
          </button>
          {visibleDayChips.map((c) => {
            const isActive = c.date === selectedDay;
            return (
              <button
                key={c.date}
                type="button"
                onClick={() => onSelectDay(c.date)}
                aria-pressed={isActive}
                disabled={isDayLoading}
                className={`${chipBase} ${isActive ? chipActive : chipIdle} ${isDayLoading ? "opacity-60 cursor-wait" : ""}`}
              >
                <span>{dayKeyLabel(c.date)}</span>
                <span className={`tabular-nums ${isActive ? "text-white/80" : "text-[#71717A]"}`}>
                  {c.count.toLocaleString()}
                </span>
              </button>
            );
          })}
          {hiddenChipCount > 0 && (
            <button
              type="button"
              onClick={() => setShowAllDays((v) => !v)}
              aria-expanded={showAllDays}
              className={`${chipBase} ${chipIdle} text-[#6366F1]`}
            >
              {showAllDays ? "Show fewer" : `+${hiddenChipCount} more days`}
              <LuChevronRight className={`w-3 h-3 transition-transform duration-200 ${showAllDays ? "rotate-90" : ""}`} />
            </button>
          )}
        </div>

        {chipsScroll.left > 0 && (
          <div className="pointer-events-none absolute left-0 top-0 bottom-2 w-6 bg-gradient-to-r from-white to-transparent" />
        )}
        {chipsScroll.left < chipsScroll.max && (
          <div className="pointer-events-none absolute right-0 top-0 bottom-2 w-6 bg-gradient-to-l from-white to-transparent" />
        )}
      </div>

      <div className="flex items-center justify-between mb-2 min-h-4">
        <p className="text-[11px] text-[#71717A]" aria-live="polite">
          {isDayLoading ? (
            <span className="inline-flex items-center gap-1.5">
              <LuLoader className="w-3 h-3 animate-spin" aria-hidden="true" />
              Loading…
            </span>
          ) : searching ? (
            <>
              {itemCount.toLocaleString()}{" "}
              {itemCount === 1 ? "match" : "matches"}
              {selectedDay ? ` · ${dayKeyLabel(selectedDay)}` : " · all clicks"}
            </>
          ) : isLatest ? (
            <>
              Showing {timeline.length.toLocaleString()} of{" "}
              {totalClicks.toLocaleString()} clicks
            </>
          ) : (
            <>
              {activeDayCount.toLocaleString()}{" "}
              {activeDayCount === 1 ? "click" : "clicks"} · {dayKeyLabel(selectedDay)}
            </>
          )}
        </p>
        {search.trim() && (
          <button
            type="button"
            onClick={clearSearch}
            className="text-[11px] font-medium text-[#6366F1] hover:text-[#4F46E5] transition-colors cursor-pointer focus-visible:ring-[3px] focus-visible:ring-[#6366F1]/20 focus-visible:outline-none shrink-0 ml-2"
          >
            Clear search
          </button>
        )}
      </div>

      {isLoading ? (
        <div className="flex flex-col gap-2" aria-busy="true" aria-label="Loading clicks">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="flex items-center gap-3 rounded-lg border border-[#E5E5EA] bg-white px-3.5 py-3 animate-pulse"
            >
              <div className="w-9 h-9 shrink-0 rounded-lg border border-[#E5E5EA] bg-[#F3F4F6]" />
              <div className="flex-1 min-w-0 flex flex-col gap-2">
                <div className="h-3 bg-[#F3F4F6] rounded w-1/3" />
                <div className="h-2.5 bg-[#F3F4F6] rounded w-1/2" />
              </div>
              <div className="w-14 shrink-0 flex flex-col gap-1.5">
                <div className="h-2.5 bg-[#F3F4F6] rounded w-12 ml-auto" />
                <div className="h-2 bg-[#F3F4F6] rounded w-10 ml-auto" />
              </div>
            </div>
          ))}
        </div>
      ) : itemCount === 0 ? (
        <div className="flex flex-col items-center gap-2 py-10 text-center">
          <LuClock className="w-6 h-6 text-[#71717A]" />
          <p className="text-xs text-[#71717A]">
            {search.trim()
              ? "No clicks match your search."
              : "No clicks in this period."}
          </p>
          {search.trim() && (
            <button
              type="button"
              onClick={clearSearch}
              className="text-[11px] font-medium text-[#6366F1] hover:text-[#4F46E5] transition-colors cursor-pointer focus-visible:ring-[3px] focus-visible:ring-[#6366F1]/20 focus-visible:outline-none"
            >
              Clear search
            </button>
          )}
        </div>
      ) : (
        <div
          className="flex flex-col gap-2 max-h-80 sm:max-h-96 overflow-y-auto overscroll-contain pr-1"
          aria-busy={isLoadingMore}
        >
          {groups.map((group) => (
            <div key={group.label} className="flex flex-col gap-2">
              <p className="sticky top-0 z-10 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#71717A] bg-white/95 backdrop-blur-sm py-1 -mx-1 px-1 border-b border-[#F3F4F6]">
                {group.label}
                <span className="ml-1.5 font-normal normal-case tracking-normal text-[#A1A1AA]">
                  {group.items.length} {group.items.length === 1 ? "click" : "clicks"}
                </span>
              </p>
              {group.items.map((t) => {
                const host = hostOf(t.original_url);
                const location =
                  t.city || countryNameFromCode(t.country) || "Unknown location";
                return (
                  <div
                    key={t.id}
                    className="group relative flex items-center gap-3 rounded-lg border border-[#E5E5EA] bg-white px-3.5 py-3 transition-all duration-150 hover:border-[#A5B4FC] hover:shadow-[0_2px_12px_rgba(99,102,241,0.08)]"
                  >
                    <span
                      className="w-9 h-9 shrink-0 rounded-lg border border-[#E5E5EA] bg-[#FAFAFA] flex items-center justify-center overflow-hidden"
                      aria-hidden="true"
                    >
                      <Favicon url={t.original_url} className="w-5 h-5 shrink-0" alt="" />
                    </span>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <a
                          href={t.original_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          title={t.original_url || undefined}
                          className="inline-flex items-center gap-1.5 font-mono text-xs font-semibold text-[#0A0A0A] hover:text-[#6366F1] transition-colors min-w-0 max-w-full"
                        >
                          <span className="truncate shrink-0">{t.short_code}</span>
                          <LuArrowRight className="w-3 h-3 text-[#A1A1AA] shrink-0" aria-hidden="true" />
                          {host && (
                            <span className="text-[11px] font-normal text-[#71717A] truncate min-w-0">
                              {host}
                            </span>
                          )}
                        </a>
                      </div>

                      <div className="flex flex-wrap items-center gap-x-2.5 gap-y-0.5 mt-1 text-[10px] text-[#71717A]">
                        <span className="inline-flex items-center gap-1 min-w-0">
                          <CountryFlag code={t.country} className="w-3.5 h-2.5 rounded-[2px] shrink-0" />
                          <span className="truncate capitalize">{location}</span>
                        </span>
                        <span aria-hidden="true">·</span>
                        <span className="inline-flex items-center gap-1">
                          <DeviceIcon type={t.device_type} className="w-3 h-3 shrink-0" />
                          <span className="capitalize">{t.device_type || "Unknown device"}</span>
                        </span>
                        <span aria-hidden="true">·</span>
                        <span className="inline-flex items-center gap-1">
                          <BrowserIcon name={t.browser} className="w-3 h-3 shrink-0" />
                          {t.browser || "Unknown browser"}
                        </span>
                        <span aria-hidden="true">·</span>
                        <span className="inline-flex items-center gap-1">
                          <OsIcon name={t.os} className="w-3 h-3 shrink-0" />
                          {t.os || "Unknown OS"}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-1 shrink-0">
                      <span className="text-[11px] font-medium text-[#0A0A0A] tabular-nums whitespace-nowrap">
                        {timeAgo(t.clicked_at)}
                      </span>
                      <span className="hidden sm:block text-[10px] text-[#71717A] whitespace-nowrap">
                        {formatDateTime(t.clicked_at)}
                      </span>
                    </div>

                    {onFocusLink && t.link_id != null && (
                      <button
                        type="button"
                        onClick={() => onFocusLink(t.link_id)}
                        title={`Focus analytics for ${t.short_code}`}
                        aria-label={`Focus analytics for ${t.short_code}`}
                        className="shrink-0 inline-flex items-center justify-center w-7 h-7 rounded-md text-[#71717A] hover:text-[#6366F1] hover:bg-[#6366F1]/10 transition-colors duration-150 cursor-pointer md:opacity-0 md:group-hover:opacity-100 md:focus-visible:opacity-100"
                      >
                        <LuCrosshair className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      )}

      {canLoadMore && (
        <div className="flex justify-center pt-3">
          <button
            type="button"
            onClick={onLoadMore}
            disabled={isLoadingMore}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-[11px] font-medium text-[#6366F1] border border-[#6366F1]/20 rounded-md hover:bg-[#6366F1]/5 transition-all duration-150 cursor-pointer disabled:cursor-wait disabled:opacity-60 focus-visible:ring-[3px] focus-visible:ring-[#6366F1]/20 focus-visible:outline-none"
          >
            {isLoadingMore ? (
              <>
                <LuLoader className="w-3.5 h-3.5 animate-spin" aria-hidden="true" />
                Loading…
              </>
            ) : (
              "Load more"
            )}
          </button>
        </div>
      )}
    </Card>
  );
};

export default ClickTimeline;
