import { useMemo, useState } from "react";
import {
  LuArrowDown,
  LuArrowUpRight,
  LuClock,
  LuLink,
  LuSearch,
  LuX,
} from "react-icons/lu";
import Card from "../ui/Card";
import CountryFlag from "./CountryFlag";
import { BrowserIcon, DeviceIcon, OsIcon } from "./DeviceIcons";
import { countryNameFromCode } from "../../utils/countryCodes";
import { formatTime } from "../../utils/format";
import {
  dayLabel,
  deviceAccent,
  timeAgo,
} from "../../utils/timeline";

const ClickTimeline = ({ timeline = [] }) => {
  const [search, setSearch] = useState("");
  const [selectedDayKey, setSelectedDayKey] = useState(null);

  const timelineItems = useMemo(() => {
    const q = search.trim().toLowerCase();
    return timeline.filter((t) => {
      if (q) {
        const hay = `${t.short_code} ${t.original_url ?? ""} ${t.city ?? ""} ${t.country ?? ""}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [timeline, search]);

  const timelineGroups = useMemo(() => {
    const groups = [];
    const index = new Map();
    for (const t of timelineItems) {
      const d = new Date(t.clicked_at);
      const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
      if (!index.has(key)) {
        const group = { key, label: dayLabel(t.clicked_at), items: [] };
        index.set(key, group);
        groups.push(group);
      }
      index.get(key).items.push(t);
    }
    return groups.map((g) => ({
      ...g,
      count: g.items.length,
    }));
  }, [timelineItems]);

  const activeGroup =
    timelineGroups.find((g) => g.key === selectedDayKey) ??
    timelineGroups[0] ??
    null;

  return (
    <Card
      icon={<LuClock className="w-3.5 h-3.5" />}
      right={
        <span className="flex items-center gap-1.5 text-[11px] text-[#9C9C9C]">
          <LuArrowDown className="w-3 h-3" />
          Latest first
        </span>
      }
    >
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-4">
        <div className="relative flex-1 min-w-0">
          <LuSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#9C9C9C] pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search links, URLs, cities…"
            className="w-full pl-9 pr-8 py-2 border border-[#D4D4D8] rounded-md text-sm text-[#0A0A0A] bg-white focus:outline-none focus:border-[#6366F1] focus-visible:ring-[3px] focus-visible:ring-[#6366F1]/12 transition-all"
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch("")}
              aria-label="Clear search"
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#9C9C9C] hover:text-[#0A0A0A] transition-colors cursor-pointer"
            >
              <LuX className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {timelineGroups.length === 0 ? (
        <div className="flex flex-col items-center gap-2 py-10 text-center">
          <LuClock className="w-6 h-6 text-[#9C9C9C]" />
          <p className="text-xs text-[#9C9C9C]">
            {search ? "No clicks match your search." : "No clicks in this period."}
          </p>
          {search && (
            <button
              type="button"
              onClick={() => setSearch("")}
              className="text-[11px] font-medium text-[#6366F1] hover:text-[#4F46E5] transition-colors cursor-pointer"
            >
              Clear search
            </button>
          )}
        </div>
      ) : (
        <div className="flex flex-col">
          <div className="flex items-center gap-2 overflow-x-auto pb-2 -mx-1 px-1 mb-4 overscroll-contain">
            {timelineGroups.map((g) => {
              const isActive = activeGroup?.key === g.key;
              return (
                <button
                  key={g.key}
                  type="button"
                  onClick={() => setSelectedDayKey(g.key)}
                  aria-pressed={isActive}
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold border rounded-full transition-all duration-150 cursor-pointer whitespace-nowrap ${
                    isActive
                      ? "border-[#6366F1] bg-[#6366F1] text-white"
                      : "border-[#D4D4D8] bg-white text-[#6B6B6B] hover:border-[#C1C1C9] hover:text-[#0A0A0A]"
                  }`}
                >
                  {g.label}
                  <span
                    className={`text-[10px] tabular-nums ${
                      isActive ? "text-white/80" : "text-[#9C9C9C]"
                    }`}
                  >
                    {g.count}
                  </span>
                </button>
              );
            })}
          </div>

          {activeGroup && (
            <div className="flex flex-col gap-2 max-h-80 sm:max-h-96 overflow-y-auto overscroll-contain pr-1">
                {activeGroup.items.length === 0 ? (
                  <p className="text-xs text-[#9C9C9C] py-8 text-center">
                    No recent clicks.
                  </p>
                ) : (
                  activeGroup.items.map((t) => (
                    <div
                      key={t.id}
                      className="group relative flex items-center gap-3 rounded-lg border border-[#E5E5EA] bg-white px-4 py-3 transition-all duration-150 hover:border-[#A5B4FC] hover:shadow-[0_2px_12px_rgba(99,102,241,0.08)]"
                    >
                      <span
                        className={`absolute left-0 top-2.5 bottom-2.5 w-[3px] rounded-full ${deviceAccent(t.device_type)}`}
                        aria-hidden="true"
                      />

                      <div className="w-14 shrink-0">
                        <p className="font-mono text-xs font-semibold text-[#0A0A0A] tabular-nums leading-tight">
                          {formatTime(t.clicked_at)}
                        </p>
                        <p className="text-[10px] text-[#9C9C9C] leading-tight">
                          {timeAgo(t.clicked_at)}
                        </p>
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <a
                            href={t.original_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            title={t.original_url || undefined}
                            className="inline-flex items-center gap-1.5 font-mono text-xs font-semibold text-[#4F46E5] hover:text-[#6366F1] transition-colors min-w-0"
                          >
                            <LuLink className="w-3 h-3 shrink-0" />
                            <span className="truncate">{t.short_code}</span>
                          </a>
                          <span className="flex items-center gap-1 text-[11px] text-[#9C9C9C] min-w-0">
                            <CountryFlag code={t.country} className="w-4 h-3 rounded-[2px] shrink-0" />
                            <span className="truncate capitalize">
                              {t.city || countryNameFromCode(t.country) || "—"}
                            </span>
                          </span>
                        </div>

                        <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 mt-0.5 text-[10px] text-[#9C9C9C]">
                          <span className="inline-flex items-center gap-1 capitalize">
                            <DeviceIcon type={t.device_type} className="w-3 h-3" />
                            {t.device_type || "Unknown"}
                          </span>
                          <span>·</span>
                          <span className="inline-flex items-center gap-1">
                            <BrowserIcon className="w-3 h-3" />
                            {t.browser || "Unknown"}
                          </span>
                          <span>·</span>
                          <span className="inline-flex items-center gap-1">
                            <OsIcon className="w-3 h-3" />
                            {t.os || "Unknown"}
                          </span>
                        </div>
                      </div>

                      {t.original_url && (
                        <a
                          href={t.original_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          title={t.original_url}
                          className="hidden md:inline-flex items-center gap-1.5 text-[11px] text-[#9C9C9C] hover:text-[#6366F1] transition-colors min-w-0 max-w-[16rem] shrink-0"
                        >
                          <LuArrowUpRight className="w-3 h-3 shrink-0" />
                          <span className="truncate">{t.original_url}</span>
                        </a>
                      )}
                    </div>
                  ))
                )}
              </div>
          )}
        </div>
      )}
    </Card>
  );
};

export default ClickTimeline;
