import { useState, useMemo, useEffect, lazy, Suspense } from "react";
import { motion } from "motion/react";
import { useQuery } from "@tanstack/react-query";
import { getAnalytics } from "../api/analytics";
import { getAllLinks } from "../api/links";
import { AreaChart, DonutChart, BarMeter } from "../components/analytics/charts";
import { flagEmoji } from "../utils/format";
import AnalyticsSkeleton from "../components/analytics/AnalyticsSkeleton";
import {
  LuArrowDown,
  LuArrowRight,
  LuArrowUp,
  LuCalendarDays,
  LuClock,
  LuCpu,
  LuGlobe,
  LuHouse,
  LuLink,
  LuMapPin,
  LuMonitor,
  LuMousePointerClick,
  LuPercent,
  LuSmartphone,
  LuTablet,
  LuUsers,
  LuZap,
} from "react-icons/lu";

// Code-split the map (Nivo + geo data) out of the main bundle — it only
// loads when the analytics page is opened.
const WorldMapChart = lazy(() => import("../components/analytics/WorldMap"));

const DAY = 24 * 60 * 60 * 1000;

const iso = (t) => new Date(t).toISOString().slice(0, 10);
const daysAgo = (n, base) => iso(new Date(base).getTime() - n * DAY);

const RANGES = [
  { key: "7d", label: "7d" },
  { key: "30d", label: "30d" },
  { key: "90d", label: "90d" },
  { key: "custom", label: "Custom" },
];

const DEVICE_OPTIONS = [
  { value: "desktop", label: "Desktop" },
  { value: "mobile", label: "Mobile" },
  { value: "tablet", label: "Tablet" },
];

function fillGaps(data, from, to) {
  const map = new Map(data.map((d) => [d.date, d]));
  const start = new Date(`${from}T00:00:00Z`).getTime();
  const end = new Date(`${to}T00:00:00Z`).getTime();
  const dayCount = Math.round((end - start) / DAY) + 1;

  const collect = (t) => {
    const key = new Date(t).toISOString().slice(0, 10);
    return {
      label: key.slice(5),
      value: map.get(key)?.clicks ?? 0,
      visitors: map.get(key)?.visitors ?? 0,
    };
  };

  // Daily buckets for ranges up to ~3 months
  if (dayCount <= 92) {
    const out = [];
    for (let t = start; t <= end; t += DAY) out.push(collect(t));
    return out;
  }

  // Longer ranges: bucket weekly to keep the charts light
  const out = [];
  for (let t = start; t <= end; t += 7 * DAY) {
    const weekEnd = Math.min(t + 6 * DAY, end);
    let clicks = 0;
    let visitors = 0;
    for (let d = t; d <= weekEnd; d += DAY) {
      clicks += map.get(new Date(d).toISOString().slice(0, 10))?.clicks ?? 0;
      visitors += map.get(new Date(d).toISOString().slice(0, 10))?.visitors ?? 0;
    }
    out.push({ label: new Date(t).toISOString().slice(5, 10), value: clicks, visitors });
  }
  return out;
}

const formatTime = (isoStr) => {
  if (!isoStr) return "—";
  return new Date(isoStr).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
};

const formatDate = (isoStr) => {
  if (!isoStr) return "—";
  return new Date(isoStr).toLocaleDateString("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  });
};

const BrowserIcon = ({ className = "w-3.5 h-3.5" }) => (
  <LuGlobe className={className} />
);

const DeviceIcon = ({ type, className = "w-3.5 h-3.5" }) => {
  if (type === "mobile") return <LuSmartphone className={className} />;
  if (type === "tablet") return <LuTablet className={className} />;
  // desktop / smarttv / console / embedded
  return <LuMonitor className={className} />;
};

const OsIcon = ({ className = "w-3.5 h-3.5" }) => <LuCpu className={className} />;

const LinkIcon = ({ className = "w-3.5 h-3.5" }) => <LuLink className={className} />;

const ClockIcon = ({ className = "w-3.5 h-3.5" }) => <LuClock className={className} />;

const LocationIcon = ({ className = "w-3 h-3" }) => <LuMapPin className={className} />;

const Card = ({ title, right, className = "", children }) => (
  <div
    className={`bg-white border border-[#D4D4D8] rounded-xl flex flex-col transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)] ${className}`}
  >
    <div className="flex items-center justify-between px-5 py-3 border-b border-[#D4D4D8]">
      <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#9C9C9C]">
        {title}
      </span>
      {right}
    </div>
    <div className="p-5 flex-1">{children}</div>
  </div>
);

const StatCard = ({ label, value, sub, icon }) => (
  <div className="bg-white border border-[#D4D4D8] rounded-xl p-5 flex flex-col justify-between transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)]">
    <div className="flex items-start justify-between gap-2">
      <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#9C9C9C]">
        {label}
      </span>
      {icon && (
        <span className="w-10 h-10 bg-gray-50 text-[#0A0A0A] border border-[#D4D4D8] rounded-lg flex items-center justify-center shrink-0">
          {icon}
        </span>
      )}
    </div>
    <p className="text-3xl font-display font-bold text-[#0A0A0A] tabular-nums tracking-[-0.03em] mt-3">
      {value}
    </p>
    {sub && <p className="text-xs text-[#9C9C9C] mt-1">{sub}</p>}
  </div>
);

const TimelineField = ({ label, value, icon, mono = false, capitalize = false }) => (
  <div className="min-w-0">
    <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#9C9C9C] mb-1">
      {label}
    </p>
    <p className="flex items-center gap-1.5 text-sm text-[#0A0A0A] min-w-0">
      {icon && <span className="text-[#9C9C9C] shrink-0">{icon}</span>}
      <span
        className={`truncate ${
          mono ? "font-mono text-xs font-medium text-[#0A0A0A]" : ""
        } ${capitalize ? "capitalize" : ""}`}
      >
        {value || "—"}
      </span>
    </p>
  </div>
);

const sorters = {
  clicks: (a, b) => (a.clicks ?? 0) - (b.clicks ?? 0),
  unique: (a, b) => (a.unique ?? 0) - (b.unique ?? 0),
  ctr: (a, b) => (a.ctr ?? 0) - (b.ctr ?? 0),
  created: (a, b) => new Date(a.created_at || 0) - new Date(b.created_at || 0),
  last: (a, b) => new Date(a.last_click_at || 0) - new Date(b.last_click_at || 0),
};

const Analytics = () => {
  const [range, setRange] = useState("30d");
  const [customFrom, setCustomFrom] = useState("");
  const [customTo, setCustomTo] = useState("");
  const [linkId, setLinkId] = useState("");
  const [country, setCountry] = useState("");
  const [device, setDevice] = useState("");
  const [sortField, setSortField] = useState("clicks");
  const [sortDir, setSortDir] = useState("desc");

  const [today, setToday] = useState(() => iso(Date.now()));

  // Refresh "today" at midnight so date calculations stay correct
  useEffect(() => {
    const now = new Date();
    const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
    const msUntilMidnight = tomorrow.getTime() - now.getTime();
    const timer = setTimeout(() => setToday(iso(Date.now())), msUntilMidnight);
    return () => clearTimeout(timer);
  }, [today]);

  const { from, to } = useMemo(() => {
    if (range === "custom") {
      return { from: customFrom || daysAgo(30, today), to: customTo || today };
    }
    const days = range === "7d" ? 7 : range === "90d" ? 90 : 30;
    return { from: daysAgo(days, today), to: today };
  }, [range, customFrom, customTo, today]);

  const params = useMemo(() => {
    const p = { from, to };
    if (linkId) p.linkId = linkId;
    if (country) p.country = country;
    if (device) p.device = device;
    return p;
  }, [from, to, linkId, country, device]);

  const { data: analytics, isLoading, isError } = useQuery({
    queryKey: ["ANALYTICS", JSON.stringify(params)],
    queryFn: () => getAnalytics(params),
    staleTime: 30_000,
  });

  const { data: linksData } = useQuery({
    queryKey: ["LINKS_INFO"],
    queryFn: getAllLinks,
  });
  const links = linksData?.data?.links ?? [];

  const a = analytics?.data;
  const summary = a?.summary ?? { clicks: 0, uniqueClicks: 0 };
  const series = useMemo(
    () => fillGaps(a?.clicksOverTime ?? [], from, to),
    [a, from, to],
  );
  const visitorsSeries = useMemo(
    () => series.map((s) => ({ label: s.label, value: s.visitors })),
    [series],
  );
  const daysInRange = Math.max(
    1,
    Math.round((new Date(to).getTime() - new Date(from).getTime()) / DAY) + 1,
  );
  const avgPerDay = (summary.clicks / daysInRange).toFixed(1);

  const hasFilters = !!(linkId || country || device || range === "custom");
  const clearFilters = () => {
    setRange("30d");
    setCustomFrom("");
    setCustomTo("");
    setLinkId("");
    setCountry("");
    setDevice("");
  };

  const toggleSort = (field) => {
    if (sortField === field) {
      setSortDir((d) => (d === "desc" ? "asc" : "desc"));
    } else {
      setSortField(field);
      setSortDir("desc");
    }
  };

  const topLinks = useMemo(() => {
    const rows = [...(a?.topLinks ?? [])];
    const sorter = sorters[sortField] ?? sorters.clicks;
    rows.sort((x, y) => (sortDir === "desc" ? sorter(y, x) : sorter(x, y)));
    return rows;
  }, [a, sortField, sortDir]);

  const maxCountryClicks = Math.max(...(a?.topCountries ?? []).map((c) => c.clicks), 1);

  const loading = isLoading;
  const isEmpty = !loading && !isError && summary.clicks === 0 && !hasFilters;
  const noResults = !loading && !isError && summary.clicks === 0 && hasFilters;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.98, filter: "blur(4px)" }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="text-[#0A0A0A] flex flex-col flex-1 font-body"
    >
      <main className="flex-1 w-full mx-auto px-4 sm:px-6 mt-10 pb-20 flex flex-col gap-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="w-1.5 h-1.5 bg-[#10B981] rounded-full shrink-0" />
              <span className="text-[11px] font-semibold tracking-[0.12em] uppercase text-[#9C9C9C]">
                Analytics
              </span>
            </div>
            <h1 className="text-[28px] sm:text-[32px] font-display font-bold tracking-[-0.03em] text-[#0A0A0A]">
              Link analytics
            </h1>
            <p className="text-[15px] text-[#6B6B6B] mt-1">
              Understand every click on your links.
            </p>
          </div>

          {hasFilters && (
            <button
              onClick={clearFilters}
              className="text-xs font-medium text-[#6366F1] hover:text-[#4F46E5] transition-colors cursor-pointer"
            >
              Clear filters
            </button>
          )}
        </div>

        {/* Filters */}
        <div className="bg-white border border-[#D4D4D8] rounded-xl p-5 flex flex-col gap-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#9C9C9C] mr-1">
              Date
            </span>
            <div className="flex gap-1.5">
              {RANGES.map((r) => (
                <button
                  key={r.key}
                  onClick={() => setRange(r.key)}
                  className={`px-3 py-1 text-xs font-medium rounded-full transition-all duration-150 cursor-pointer hover:-translate-y-px ${
                    range === r.key
                      ? "bg-[#6366F1] text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-900"
                  }`}
                >
                  {r.label}
                </button>
              ))}
            </div>
            {range === "custom" && (
              <div className="flex items-center gap-2 ml-2">
                <input
                  type="date"
                  value={customFrom}
                  onChange={(e) => setCustomFrom(e.target.value)}
                  className="px-3.5 py-2.5 border border-[#D4D4D8] rounded-md text-sm text-[#0A0A0A] bg-white focus:outline-none focus:border-[#6366F1] focus-visible:ring-[3px] focus-visible:ring-[#6366F1]/12"
                />
                <LuArrowRight className="w-3.5 h-3.5 text-[#9C9C9C]" />
                <input
                  type="date"
                  value={customTo}
                  onChange={(e) => setCustomTo(e.target.value)}
                  className="px-3.5 py-2.5 border border-[#D4D4D8] rounded-md text-sm text-[#0A0A0A] bg-white focus:outline-none focus:border-[#6366F1] focus-visible:ring-[3px] focus-visible:ring-[#6366F1]/12"
                />
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <select
              value={linkId}
              onChange={(e) => setLinkId(e.target.value)}
              className="px-3.5 py-2.5 border border-[#D4D4D8] rounded-md text-sm text-[#0A0A0A] bg-white focus:outline-none focus:border-[#6366F1] focus-visible:ring-[3px] focus-visible:ring-[#6366F1]/12 cursor-pointer"
            >
              <option value="">All links</option>
              {links.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.short_code}
                </option>
              ))}
            </select>
            <select
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              className="px-3.5 py-2.5 border border-[#D4D4D8] rounded-md text-sm text-[#0A0A0A] bg-white focus:outline-none focus:border-[#6366F1] focus-visible:ring-[3px] focus-visible:ring-[#6366F1]/12 cursor-pointer"
            >
              <option value="">All countries</option>
              {(a?.filters?.countries ?? []).map((c) => (
                <option key={c} value={c}>
                  {flagEmoji(c)} {c}
                </option>
              ))}
            </select>
            <select
              value={device}
              onChange={(e) => setDevice(e.target.value)}
              className="px-3.5 py-2.5 border border-[#D4D4D8] rounded-md text-sm text-[#0A0A0A] bg-white focus:outline-none focus:border-[#6366F1] focus-visible:ring-[3px] focus-visible:ring-[#6366F1]/12 cursor-pointer"
            >
              <option value="">All devices</option>
              {DEVICE_OPTIONS.map((d) => (
                <option key={d.value} value={d.value}>
                  {d.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {loading && <AnalyticsSkeleton />}

        {!loading && isError && (
          <div className="bg-white border border-[#EF4444]/30 rounded-xl p-8 text-center">
            <h3 className="text-lg font-display font-bold text-[#EF4444] mb-1">
              Failed to load analytics
            </h3>
            <p className="text-sm text-[#6B6B6B]">
              Something went wrong while fetching your analytics.
            </p>
          </div>
        )}

        {isEmpty && (
          <div className="bg-white border border-[#D4D4D8] rounded-xl p-10 text-center">
            <p className="text-sm font-medium text-[#0A0A0A] mb-1">No clicks yet</p>
            <p className="text-sm text-[#6B6B6B]">
              Clicks will appear here once your links start getting traffic.
            </p>
          </div>
        )}

        {noResults && (
          <div className="bg-white border border-[#D4D4D8] rounded-xl p-10 text-center">
            <p className="text-sm font-medium text-[#0A0A0A] mb-1">No results for these filters</p>
            <p className="text-sm text-[#6B6B6B]">
              Try adjusting your filters or selecting a different date range.
            </p>
            <button
              onClick={clearFilters}
              className="mt-3 text-xs font-medium text-[#6366F1] hover:text-[#4F46E5] transition-colors cursor-pointer"
            >
              Clear filters
            </button>
          </div>
        )}

        {!loading && !isError && !isEmpty && (
          <>
            {/* Stat cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              <StatCard
                label="Total clicks"
                value={summary.clicks.toLocaleString()}
                sub={`${from} → ${to}`}
                icon={<LuMousePointerClick className="w-5 h-5" />}
              />
              <StatCard
                label="Unique clicks"
                value={(summary.uniqueClicks ?? 0).toLocaleString()}
                sub="Distinct visitors"
                icon={<LuUsers className="w-5 h-5" />}
              />
              <StatCard
                label="Avg. clicks / day"
                value={avgPerDay}
                sub={`Across ${daysInRange} days`}
                icon={<LuCalendarDays className="w-5 h-5" />}
              />
              <StatCard
                label="Engagement"
                value={
                  summary.clicks > 0
                    ? `${((summary.uniqueClicks / summary.clicks) * 100).toFixed(1)}%`
                    : "—"
                }
                sub="Unique ÷ clicks"
                icon={<LuPercent className="w-5 h-5" />}
              />
            </div>

            {/* Large charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              <Card title="Clicks this week" right={<span className="text-[11px] text-[#9C9C9C]">{range === "custom" ? "Custom" : range}</span>}>
                <div className="flex items-end justify-between mb-3">
                  <p className="text-2xl font-display font-bold text-[#0A0A0A] tabular-nums tracking-[-0.03em]">
                    {summary.clicks.toLocaleString()}
                  </p>
                </div>
                <AreaChart data={series} height={180} />
              </Card>

              <Card title="Visitors this week" right={<span className="text-[11px] text-[#9C9C9C]">Unique per day</span>}>
                <div className="flex items-end justify-between mb-3">
                  <p className="text-2xl font-display font-bold text-[#0A0A0A] tabular-nums tracking-[-0.03em]">
                    {(summary.uniqueClicks ?? 0).toLocaleString()}
                  </p>
                </div>
                <AreaChart data={visitorsSeries} height={180} />
              </Card>
            </div>

            {/* Geography */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
              <Card title="Top countries">
                <div className="flex flex-col gap-3 max-h-64 sm:max-h-80 overflow-y-auto overscroll-contain pr-2">
                  {(a?.topCountries ?? []).map((c) => (
                    <BarMeter
                      key={c.country}
                      label={`${flagEmoji(c.country)}`}
                      value={c.clicks}
                      pct={(c.clicks / maxCountryClicks) * 100}
                    />
                  ))}
                  {!(a?.topCountries ?? []).length && (
                    <p className="text-xs text-[#9C9C9C]">No country data yet</p>
                  )}
                </div>
              </Card>

              <Card title="Map" className="lg:col-span-2">
                <Suspense
                  fallback={
                    <div className="flex h-[340px] items-center justify-center text-xs text-[#9C9C9C] sm:h-[460px]">
                      Loading map…
                    </div>
                  }
                >
                  <WorldMapChart countries={a?.topCountries ?? []} />
                </Suspense>
              </Card>
            </div>

            {/* Tech breakdown */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <Card title="Devices">
                <DonutChart data={a?.devices ?? []} />
              </Card>
              <Card title="Browsers">
                <DonutChart data={a?.browsers ?? []} />
              </Card>
              <Card title="Operating systems">
                <DonutChart data={a?.os ?? []} />
              </Card>
            </div>

            {/* Top links */}
            <Card
              title="Top links"
              right={
                <span className="text-[11px] text-[#9C9C9C]">
                  <span className="hidden lg:inline">Click headers to sort</span>
                  <span className="lg:hidden text-[#9C9C9C]">Sorted by clicks</span>
                </span>
              }
            >
              {/* Desktop table */}
              <div className="hidden lg:block -mx-5 overflow-x-auto max-h-96 sm:max-h-120 overflow-y-auto overscroll-contain">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-[#D4D4D8] text-left">
                      <th className="px-5 py-3 text-[11px] font-semibold uppercase tracking-[0.12em] text-[#9C9C9C] sticky top-0 z-10 bg-white">
                        Short URL
                      </th>
                      {[
                        { key: "clicks", label: "Clicks" },
                        { key: "unique", label: "Unique" },
                        { key: "ctr", label: "CTR" },
                        { key: "created", label: "Created" },
                        { key: "last", label: "Last click" },
                      ].map((col) => (
                        <th
                          key={col.key}
                          onClick={() => toggleSort(col.key)}
                          className={`px-5 py-3 text-[11px] font-semibold uppercase tracking-[0.12em] whitespace-nowrap cursor-pointer select-none transition-colors hover:text-[#6B6B6B] sticky top-0 z-10 bg-white ${
                            sortField === col.key ? "text-[#0A0A0A]" : "text-[#9C9C9C]"
                          }`}
                        >
                          {col.label}
                          {sortField === col.key && (
                            <span className="ml-1 text-[#6366F1] inline-flex items-center">
                              {sortDir === "desc" ? (
                                <LuArrowDown className="w-3 h-3" />
                              ) : (
                                <LuArrowUp className="w-3 h-3" />
                              )}
                            </span>
                          )}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E5E5EA]">
                    {topLinks.length === 0 && (
                      <tr>
                        <td colSpan={6} className="px-5 py-10 text-center text-[#9C9C9C] text-sm">
                          No links received clicks in this period.
                        </td>
                      </tr>
                    )}
                    {topLinks.map((l) => (
                      <tr key={l.id} className="hover:bg-[#F6F6F9] transition-colors">
                        <td className="px-5 py-3 font-mono text-xs font-medium text-[#0A0A0A]">
                          {l.short_code}
                        </td>
                        <td className="px-5 py-3 text-[#0A0A0A] tabular-nums font-medium">
                          {l.clicks.toLocaleString()}
                        </td>
                        <td className="px-5 py-3 text-[#6B6B6B] tabular-nums">
                          {(l.unique ?? 0).toLocaleString()}
                        </td>
                        <td className="px-5 py-3 text-[#6B6B6B] tabular-nums">{(l.ctr ?? 0)}%</td>
                        <td className="px-5 py-3 text-[#6B6B6B] whitespace-nowrap">
                          {formatDate(l.created_at)}
                        </td>
                        <td className="px-5 py-3 text-[#6B6B6B] whitespace-nowrap">
                          {formatDate(l.last_click_at)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile cards */}
              <div className="flex flex-col gap-3 lg:hidden max-h-96 sm:max-h-120 overflow-y-auto overscroll-contain">
                {topLinks.length === 0 && (
                  <p className="py-8 text-center text-[#9C9C9C] text-sm">
                    No links received clicks in this period.
                  </p>
                )}
                {topLinks.map((l) => (
                  <a
                    key={l.id}
                    href={l.original_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`Open original URL for ${l.short_code}`}
                    className="bg-white border border-[#D4D4D8] rounded-xl px-4 py-4 flex flex-col gap-3 transition-all duration-150 hover:-translate-y-0.5 hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)] active:bg-[#F6F6F9] active:border-[#D4D4D8] active:scale-[0.99]"
                  >
                    {/* Short code + original URL (truncated) */}
                    <div className="flex flex-col gap-1 min-w-0">
                      <span className="font-mono text-xs font-semibold text-[#0A0A0A] truncate">
                        {l.short_code}
                      </span>
                      {l.original_url && (
                        <span className="text-[11px] text-[#9C9C9C] truncate">
                          {l.original_url}
                        </span>
                      )}
                    </div>

                    {/* Primary metric: click count */}
                    <div className="flex items-center gap-2">
                      <span className="text-2xl font-display font-bold text-[#0A0A0A] tabular-nums leading-none tracking-[-0.03em]">
                        {l.clicks.toLocaleString()}
                      </span>
                      <span className="flex items-center gap-1 text-[11px] font-medium text-[#9C9C9C] uppercase tracking-wider">
                        <LuZap className="w-3 h-3" />
                        clicks
                      </span>
                    </div>

                    {/* Last click */}
                    <div className="flex items-center gap-1.5 text-[11px] text-[#9C9C9C]">
                      <LuClock className="w-3 h-3 shrink-0" />
                      Last click {formatDate(l.last_click_at)}
                    </div>

                    {/* Secondary metrics: 2-column aligned */}
                    <div className="grid grid-cols-2 gap-3 pt-3 border-t border-[#E5E5EA]">
                      <span className="flex items-center gap-1.5 text-[11px] text-[#9C9C9C] min-w-0">
                        <LuHouse className="w-3 h-3 shrink-0 text-[#9C9C9C]" />
                        <span className="tabular-nums font-medium text-[#6B6B6B]">{(l.ctr ?? 0)}%</span>
                        CTR
                      </span>
                      <span className="flex items-center gap-1.5 text-[11px] text-[#9C9C9C] min-w-0">
                        <LuUsers className="w-3 h-3 shrink-0 text-[#9C9C9C]" />
                        <span className="tabular-nums font-medium text-[#6B6B6B]">{(l.unique ?? 0).toLocaleString()}</span>
                        Unique
                      </span>
                    </div>
                  </a>
                ))}
              </div>
            </Card>

            {/* Timeline */}
            <Card title="Click timeline" right={<span className="text-[11px] text-[#9C9C9C]">Latest first</span>}>
              <div className="flex flex-col divide-y divide-[#E5E5EA] -mx-5 max-h-96 sm:max-h-120 overflow-y-auto overscroll-contain">
                {(a?.timeline ?? []).map((t) => (
                  <div
                    key={t.id}
                    className="flex flex-col gap-3 py-4 sm:py-5 sm:flex-row sm:items-center sm:gap-5 px-5 transition-colors duration-150 hover:bg-[#F6F6F9]"
                  >
                    {/* Time block — flag, time, date */}
                    <div className="flex items-center gap-3 sm:w-32 sm:shrink-0">
                      <span className="text-base shrink-0 w-8 h-8 flex items-center justify-center bg-gray-50 border border-[#E5E5EA] rounded-full">
                        {flagEmoji(t.country)}
                      </span>
                      <div className="flex flex-col leading-tight">
                        <span className="text-sm font-semibold text-[#0A0A0A] tabular-nums">
                          {formatTime(t.clicked_at)}
                        </span>
                        <span className="text-[11px] text-[#6B6B6B]">
                          {formatDate(t.clicked_at)}
                        </span>
                      </div>
                    </div>

                    {/* Vertical divider (desktop) */}
                    <div className="hidden sm:block w-px self-stretch bg-[#D4D4D8] shrink-0" />

                    {/* Labeled click details */}
                    <div className="flex-1 min-w-0 grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-3">
                      <TimelineField
                        label="Short code"
                        value={t.short_code}
                        mono
                        icon={<LinkIcon />}
                      />
                      <TimelineField
                        label="Browser"
                        value={t.browser}
                        icon={<BrowserIcon />}
                      />
                      <TimelineField
                        label="OS"
                        value={t.os}
                        icon={<OsIcon />}
                      />
                      <TimelineField
                        label="Device"
                        value={t.device_type}
                        capitalize
                        icon={<DeviceIcon type={t.device_type} />}
                      />
                      <TimelineField
                        label="Country"
                        value={[t.city, t.country && flagEmoji(t.country)].filter(Boolean).join(" ")}
                        icon={<LocationIcon />}
                      />
                      <TimelineField
                        label="Time"
                        value={`${formatDate(t.clicked_at)} · ${formatTime(t.clicked_at)}`}
                        icon={<ClockIcon />}
                      />
                    </div>
                  </div>
                ))}
                {!(a?.timeline ?? []).length && (
                  <p className="text-xs text-[#9C9C9C] py-4 text-center">No recent clicks.</p>
                )}
              </div>
            </Card>
          </>
        )}
      </main>
    </motion.div>
  );
};

export default Analytics;
