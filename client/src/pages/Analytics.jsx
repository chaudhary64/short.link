import { useState, useMemo, useEffect, lazy, Suspense } from "react";
import { motion } from "motion/react";
import { useQuery } from "@tanstack/react-query";
import { getAnalytics } from "../api/analytics";
import { getAllLinks } from "../api/links";
import { AreaChart, DonutChart, BarMeter } from "../components/analytics/charts";
import { flagEmoji } from "../utils/format";
import AnalyticsSkeleton from "../components/analytics/AnalyticsSkeleton";

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
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
    <circle cx="12" cy="12" r="9" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 12h18M12 3a15.3 15.3 0 010 18 15.3 15.3 0 010-18z" />
  </svg>
);

const DeviceIcon = ({ type, className = "w-3.5 h-3.5" }) => {
  if (type === "mobile") {
    return (
      <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
        <rect x="7" y="2" width="10" height="20" rx="2" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 18h.01" />
      </svg>
    );
  }
  if (type === "tablet") {
    return (
      <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
        <rect x="4" y="2" width="16" height="20" rx="2" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 17.5h.01" />
      </svg>
    );
  }
  // desktop / smarttv / console / embedded
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
      <rect x="2" y="3" width="20" height="14" rx="1" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M8 21h8m-4-4v4" />
    </svg>
  );
};

const OsIcon = ({ className = "w-3.5 h-3.5" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
    <rect x="6" y="6" width="12" height="12" rx="2" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 2v4m6-4v4M9 18v4m6-4v4M2 9h4m-4 6h4m12-6h4m-4 6h4" />
  </svg>
);

const LinkIcon = ({ className = "w-3.5 h-3.5" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 010 5.656l-4 4a4 4 0 01-5.656-5.656l1.5-1.5M10.172 13.828a4 4 0 010-5.656l4-4a4 4 0 015.656 5.656l-1.5 1.5" />
  </svg>
);

const ClockIcon = ({ className = "w-3.5 h-3.5" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
    <circle cx="12" cy="12" r="9" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 7v5l3 2" />
  </svg>
);

const LocationIcon = ({ className = "w-3 h-3" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 21s-7-5.1-7-11a7 7 0 1114 0c0 5.9-7 11-7 11z" />
    <circle cx="12" cy="10" r="2.5" />
  </svg>
);

const Card = ({ title, right, className = "", children }) => (
  <div className={`bg-white border border-gray-200 shadow-sm flex flex-col ${className}`}>
    <div className="flex items-center justify-between px-4 py-2.5 border-b border-gray-100">
      <span className="text-[10px] font-semibold uppercase tracking-[0.15em] text-gray-400">
        {title}
      </span>
      {right}
    </div>
    <div className="p-4 sm:p-5 flex-1">{children}</div>
  </div>
);

const StatCard = ({ label, value, sub, icon }) => (
  <div className="bg-white border border-gray-200 shadow-sm p-5 flex flex-col justify-between">
    <div className="flex items-start justify-between gap-2">
      <span className="text-[10px] font-semibold uppercase tracking-[0.15em] text-gray-400">
        {label}
      </span>
      {icon && (
        <span className="w-9 h-9 bg-[#10b981]/10 text-[#10b981] flex items-center justify-center shrink-0">
          {icon}
        </span>
      )}
    </div>
    <p className="text-3xl font-bold text-gray-900 tabular-nums mt-3">{value}</p>
    {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
  </div>
);

const TimelineField = ({ label, value, icon, mono = false, capitalize = false }) => (
  <div className="min-w-0">
    <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-gray-400 mb-1">
      {label}
    </p>
    <p className="flex items-center gap-1.5 text-sm text-gray-700 min-w-0">
      {icon && <span className="text-gray-400 shrink-0">{icon}</span>}
      <span
        className={`truncate ${
          mono ? "font-mono text-xs font-medium text-gray-900" : ""
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
      className="text-gray-900 flex flex-col flex-1 font-sans"
    >
      <main className="flex-1 w-full mx-auto px-4 sm:px-6 mt-10 pb-20 flex flex-col gap-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="w-1.5 h-1.5 bg-[#10b981] shrink-0" />
              <span className="text-xs font-semibold tracking-[0.15em] uppercase text-gray-400">
                Analytics
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900">
              Link analytics
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Understand every click on your links.
            </p>
          </div>

          {hasFilters && (
            <button
              onClick={clearFilters}
              className="text-xs font-medium text-[#10b981] hover:text-[#059669] transition-colors cursor-pointer"
            >
              Clear filters
            </button>
          )}
        </div>

        {/* Filters */}
        <div className="bg-white border border-gray-200 shadow-sm p-4 flex flex-col gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[10px] font-semibold uppercase tracking-[0.15em] text-gray-400 mr-1">
              Date
            </span>
            <div className="flex gap-1">
              {RANGES.map((r) => (
                <button
                  key={r.key}
                  onClick={() => setRange(r.key)}
                  className={`px-3 py-1.5 text-xs font-medium border transition-colors duration-150 cursor-pointer ${
                    range === r.key
                      ? "border-gray-900 bg-gray-900 text-white"
                      : "border-gray-200 text-gray-500 hover:border-gray-300 hover:text-gray-700"
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
                  className="px-2 py-1.5 border border-gray-200 text-xs focus:outline-none focus:border-gray-900"
                />
                <span className="text-gray-400 text-xs">→</span>
                <input
                  type="date"
                  value={customTo}
                  onChange={(e) => setCustomTo(e.target.value)}
                  className="px-2 py-1.5 border border-gray-200 text-xs focus:outline-none focus:border-gray-900"
                />
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            <select
              value={linkId}
              onChange={(e) => setLinkId(e.target.value)}
              className="px-3 py-2 border border-gray-200 text-sm focus:outline-none focus:border-gray-900 bg-white"
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
              className="px-3 py-2 border border-gray-200 text-sm focus:outline-none focus:border-gray-900 bg-white"
            >
              <option value="">All countries</option>
              {(a?.filters?.countries ?? []).map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            <select
              value={device}
              onChange={(e) => setDevice(e.target.value)}
              className="px-3 py-2 border border-gray-200 text-sm focus:outline-none focus:border-gray-900 bg-white"
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
          <div className="bg-white border border-red-200 shadow-sm p-8 text-center">
            <h3 className="text-lg font-semibold text-gray-900 mb-1">
              Failed to load analytics
            </h3>
            <p className="text-sm text-gray-500">
              Something went wrong while fetching your analytics.
            </p>
          </div>
        )}

        {isEmpty && (
          <div className="bg-white border border-gray-200 shadow-sm p-10 text-center">
            <p className="text-sm font-medium text-gray-900 mb-1">No clicks yet</p>
            <p className="text-sm text-gray-500">
              Clicks will appear here once your links start getting traffic.
            </p>
          </div>
        )}

        {noResults && (
          <div className="bg-white border border-gray-200 shadow-sm p-10 text-center">
            <p className="text-sm font-medium text-gray-900 mb-1">No results for these filters</p>
            <p className="text-sm text-gray-500">
              Try adjusting your filters or selecting a different date range.
            </p>
            <button
              onClick={clearFilters}
              className="mt-3 text-xs font-medium text-[#10b981] hover:text-[#059669] transition-colors cursor-pointer"
            >
              Clear filters
            </button>
          </div>
        )}

        {!loading && !isError && !isEmpty && (
          <>
            {/* Stat cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard
                label="Total clicks"
                value={summary.clicks.toLocaleString()}
                sub={`${from} → ${to}`}
                icon={
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                }
              />
              <StatCard
                label="Unique clicks"
                value={(summary.uniqueClicks ?? 0).toLocaleString()}
                sub="Distinct visitors"
                icon={
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                }
              />
              <StatCard
                label="Avg. clicks / day"
                value={avgPerDay}
                sub={`Across ${daysInRange} days`}
                icon={
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                }
              />
              <StatCard
                label="Engagement"
                value={
                  summary.clicks > 0
                    ? `${((summary.uniqueClicks / summary.clicks) * 100).toFixed(1)}%`
                    : "—"
                }
                sub="Unique ÷ clicks"
                icon={
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                }
              />
            </div>

            {/* Large charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <Card title="Clicks over time" right={<span className="text-[10px] text-gray-400">{range === "custom" ? "Custom" : range}</span>}>
                <div className="flex items-end justify-between mb-3">
                  <p className="text-2xl font-bold text-gray-900 tabular-nums">
                    {summary.clicks.toLocaleString()}
                  </p>
                </div>
                <AreaChart data={series} height={180} />
              </Card>

              <Card title="Visitors" right={<span className="text-[10px] text-gray-400">Unique per day</span>}>
                <div className="flex items-end justify-between mb-3">
                  <p className="text-2xl font-bold text-gray-900 tabular-nums">
                    {(summary.uniqueClicks ?? 0).toLocaleString()}
                  </p>
                </div>
                <AreaChart data={visitorsSeries} height={180} />
              </Card>
            </div>

            {/* Geography */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <Card title="Top countries">
                <div className="flex flex-col gap-3 max-h-64 sm:max-h-80 overflow-y-auto overscroll-contain pr-2">
                  {(a?.topCountries ?? []).map((c) => (
                    <BarMeter
                      key={c.country}
                      label={`${flagEmoji(c.country)} ${c.country}`}
                      value={c.clicks}
                      pct={(c.clicks / maxCountryClicks) * 100}
                    />
                  ))}
                  {!(a?.topCountries ?? []).length && (
                    <p className="text-xs text-gray-400">No country data yet</p>
                  )}
                </div>
              </Card>

              <Card title="Map" className="lg:col-span-2">
                <Suspense
                  fallback={
                    <div className="flex h-[340px] items-center justify-center text-xs text-gray-400 sm:h-[460px]">
                      Loading map…
                    </div>
                  }
                >
                  <WorldMapChart countries={a?.topCountries ?? []} />
                </Suspense>
              </Card>
            </div>

            {/* Tech breakdown */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                <span className="text-[10px] text-gray-400">
                  <span className="hidden lg:inline">Click headers to sort</span>
                  <span className="lg:hidden text-gray-300">Sorted by clicks</span>
                </span>
              }
            >
              {/* Desktop table */}
              <div className="hidden lg:block -mx-5 overflow-x-auto max-h-96 sm:max-h-120 overflow-y-auto overscroll-contain">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100 text-left">
                      <th className="px-4 sm:px-5 py-2.5 text-[10px] font-semibold uppercase tracking-[0.15em] text-gray-400 sticky top-0 z-10 bg-white">
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
                          className={`px-4 sm:px-5 py-2.5 text-[10px] font-semibold uppercase tracking-[0.15em] whitespace-nowrap cursor-pointer select-none transition-colors hover:text-gray-700 sticky top-0 z-10 bg-white ${
                            sortField === col.key ? "text-gray-900" : "text-gray-400"
                          }`}
                        >
                          {col.label}
                          {sortField === col.key && (
                            <span className="ml-1 text-[#10b981]">{sortDir === "desc" ? "↓" : "↑"}</span>
                          )}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {topLinks.length === 0 && (
                      <tr>
                        <td colSpan={6} className="px-5 py-10 text-center text-gray-400 text-sm">
                          No links received clicks in this period.
                        </td>
                      </tr>
                    )}
                    {topLinks.map((l) => (
                      <tr key={l.id} className="hover:bg-gray-50/70 transition-colors">
                        <td className="px-4 sm:px-5 py-3 font-mono text-xs font-medium text-gray-900">
                          {l.short_code}
                        </td>
                        <td className="px-4 sm:px-5 py-3 text-gray-700 tabular-nums">
                          {l.clicks.toLocaleString()}
                        </td>
                        <td className="px-4 sm:px-5 py-3 text-gray-500 tabular-nums">
                          {(l.unique ?? 0).toLocaleString()}
                        </td>
                        <td className="px-4 sm:px-5 py-3 text-gray-500 tabular-nums">{(l.ctr ?? 0)}%</td>
                        <td className="px-4 sm:px-5 py-3 text-gray-500 whitespace-nowrap">
                          {formatDate(l.created_at)}
                        </td>
                        <td className="px-4 sm:px-5 py-3 text-gray-500 whitespace-nowrap">
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
                  <p className="py-8 text-center text-gray-400 text-sm">
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
                    className="bg-white border border-gray-200 shadow-sm rounded-xl px-4 py-4 flex flex-col gap-3 transition-all duration-150 active:bg-gray-50 active:border-gray-300 active:scale-[0.99]"
                  >
                    {/* Short code + original URL (truncated) */}
                    <div className="flex flex-col gap-1 min-w-0">
                      <span className="font-mono text-xs font-semibold text-gray-900 truncate">
                        {l.short_code}
                      </span>
                      {l.original_url && (
                        <span className="text-[11px] text-gray-400 truncate">
                          {l.original_url}
                        </span>
                      )}
                    </div>

                    {/* Primary metric: click count */}
                    <div className="flex items-center gap-2">
                      <span className="text-2xl font-bold text-gray-900 tabular-nums leading-none">
                        {l.clicks.toLocaleString()}
                      </span>
                      <span className="flex items-center gap-1 text-[11px] font-medium text-gray-400 uppercase tracking-wider">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                        clicks
                      </span>
                    </div>

                    {/* Last click */}
                    <div className="flex items-center gap-1.5 text-[11px] text-gray-400">
                      <svg className="w-3 h-3 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Last click {formatDate(l.last_click_at)}
                    </div>

                    {/* Secondary metrics: 2-column aligned */}
                    <div className="grid grid-cols-2 gap-3 pt-3 border-t border-gray-100">
                      <span className="flex items-center gap-1.5 text-[11px] text-gray-400 min-w-0">
                        <svg className="w-3 h-3 shrink-0 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                        </svg>
                        <span className="tabular-nums font-medium text-gray-600">{(l.ctr ?? 0)}%</span>
                        CTR
                      </span>
                      <span className="flex items-center gap-1.5 text-[11px] text-gray-400 min-w-0">
                        <svg className="w-3 h-3 shrink-0 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                        <span className="tabular-nums font-medium text-gray-600">{(l.unique ?? 0).toLocaleString()}</span>
                        Unique
                      </span>
                    </div>
                  </a>
                ))}
              </div>
            </Card>

            {/* Timeline */}
            <Card title="Click timeline" right={<span className="text-[10px] text-gray-400">Latest first</span>}>
              <div className="flex flex-col divide-y divide-gray-200 -mx-4 sm:-mx-5 max-h-96 sm:max-h-120 overflow-y-auto overscroll-contain">
                {(a?.timeline ?? []).map((t) => (
                  <div
                    key={t.id}
                    className="flex flex-col gap-3 py-4 sm:py-5 sm:flex-row sm:items-center sm:gap-5 px-4 sm:px-5 transition-colors duration-150 hover:bg-gray-50/60"
                  >
                    {/* Time block — flag, time, date */}
                    <div className="flex items-center gap-3 sm:w-32 sm:shrink-0">
                      <span className="text-base shrink-0 w-8 h-8 flex items-center justify-center bg-gray-50 border border-gray-100 rounded-full">
                        {flagEmoji(t.country)}
                      </span>
                      <div className="flex flex-col leading-tight">
                        <span className="text-sm font-semibold text-gray-900 tabular-nums">
                          {formatTime(t.clicked_at)}
                        </span>
                        <span className="text-[11px] text-gray-500">
                          {formatDate(t.clicked_at)}
                        </span>
                      </div>
                    </div>

                    {/* Vertical divider (desktop) */}
                    <div className="hidden sm:block w-px self-stretch bg-gray-200 shrink-0" />

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
                        value={[t.city, t.country].filter(Boolean).join(", ")}
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
                  <p className="text-xs text-gray-400 py-4 text-center">No recent clicks.</p>
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
