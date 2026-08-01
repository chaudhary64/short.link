import { useState, useMemo, useEffect, lazy, Suspense } from "react";
import { motion } from "motion/react";
import { useQuery } from "@tanstack/react-query";
import { getAnalytics } from "../api/analytics";
import { getAllLinks } from "../api/links";
import {
  BarChart,
  DonutBreakdown,
  Sparkline,
} from "../components/analytics/charts";
import CountryFlag from "../components/analytics/CountryFlag";
import Chip from "../components/ui/Chip";
import { countryNameFromCode } from "../utils/countryCodes";
import AnalyticsSkeleton from "../components/analytics/AnalyticsSkeleton";
import PageHeader from "../components/ui/PageHeader";
import { useScrollSpy } from "../hooks/useScrollSpy";
import {
  LuArrowDown,
  LuArrowRight,
  LuArrowUp,
  LuCalendarDays,
  LuChevronDown,
  LuClock,
  LuCpu,
  LuGauge,
  LuGlobe,
  LuHouse,
  LuLink,
  LuMapPin,
  LuMonitor,
  LuMousePointerClick,
  LuPercent,
  LuSmartphone,
  LuTablet,
  LuTriangleAlert,
  LuUsers,
  LuX,
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

// Section nav — mirrors the Settings page's scroll-spy sidebar so users can
// jump to each part of the analytics page from a sticky left rail.
const SECTIONS = [
  { id: "overview", label: "Overview", icon: "gauge" },
  { id: "traffic", label: "Traffic", icon: "clicks" },
  { id: "geography", label: "Geography", icon: "globe" },
  { id: "technology", label: "Technology", icon: "cpu" },
  { id: "top-links", label: "Top Links", icon: "link" },
  { id: "timeline", label: "Click timeline", icon: "clock" },
];

function SectionIcon({ name, className = "w-4 h-4" }) {
  const icons = {
    gauge: <LuGauge className={className} />,
    clicks: <LuMousePointerClick className={className} />,
    globe: <LuGlobe className={className} />,
    cpu: <LuCpu className={className} />,
    link: <LuLink className={className} />,
    clock: <LuClock className={className} />,
  };
  return icons[name] || null;
}

function SectionHeading({ name, title, subtitle }) {
  return (
    <div className="flex items-center gap-3 mb-4 sm:mb-6">
      <div className="w-8 h-8 sm:w-9 sm:h-9 bg-[#F3F4F6] flex items-center justify-center border border-[#D4D4D8] rounded-lg shrink-0">
        <SectionIcon name={name} className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#0A0A0A]" />
      </div>
      <div>
        <h2 className="text-base font-display font-bold tracking-[-0.02em] text-[#0A0A0A]">{title}</h2>
        <p className="text-xs text-[#6B6B6B]">{subtitle}</p>
      </div>
    </div>
  );
}

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
    out.push({
      label: new Date(t).toISOString().slice(5, 10),
      value: clicks,
      visitors,
    });
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

const formatShort = (isoStr) => {
  if (!isoStr) return "—";
  return new Date(`${isoStr}T00:00:00Z`).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
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

const LinkIcon = ({ className = "w-3.5 h-3.5" }) => (
  <LuLink className={className} />
);

const Card = ({ title, icon, right, className = "", children }) => (
  <div
    className={`bg-white border border-[#D4D4D8] rounded-xl flex flex-col transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)] ${className}`}
  >
    <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#D4D4D8]">
      <span className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-[#9C9C9C]">
        {icon && <span className="text-[#9C9C9C] shrink-0">{icon}</span>}
        {title}
      </span>
      {right}
    </div>
    <div className="p-5 flex-1">{children}</div>
  </div>
);

// KPI card — big tabular number, a meaningful sub, a "vs previous period"
// delta badge, and a quiet sparkline of the underlying trend.
const StatCard = ({ label, value, sub, icon, delta, spark }) => (
  <div className="bg-white border border-[#D4D4D8] rounded-xl p-5 flex flex-col transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)]">
    <div className="flex items-start justify-between gap-2">
      <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#9C9C9C]">
        {label}
      </span>
      {icon && (
        <span className="w-9 h-9 bg-[#F3F4F6] text-[#0A0A0A] border border-[#D4D4D8] rounded-lg flex items-center justify-center shrink-0">
          {icon}
        </span>
      )}
    </div>
    <div className="flex items-end justify-between gap-3 mt-3">
      <div className="min-w-0">
        <p className="text-3xl font-display font-bold text-[#0A0A0A] tabular-nums tracking-[-0.03em] leading-none truncate">
          {value}
        </p>
        {sub && (
          <p className="text-xs text-[#6B6B6B] mt-1.5 truncate">{sub}</p>
        )}
      </div>
      {delta != null && (
        <span
          className={`inline-flex items-center gap-0.5 text-xs font-semibold tabular-nums shrink-0 pb-0.5 ${
            delta >= 0 ? "text-[#10B981]" : "text-[#EF4444]"
          }`}
        >
          {delta >= 0 ? (
            <LuArrowUp className="w-3 h-3" />
          ) : (
            <LuArrowDown className="w-3 h-3" />
          )}
          {Math.abs(delta).toFixed(1)}%
        </span>
      )}
    </div>
    {spark && <div className="mt-4 -mx-1">{spark}</div>}
  </div>
);

const SegmentedToggle = ({ value, onChange, options }) => (
  <div className="inline-flex items-center gap-0.5 bg-[#F3F4F6] border border-[#D4D4D8] rounded-full p-0.5">
    {options.map((o) => (
      <button
        key={o.value}
        type="button"
        onClick={() => onChange(o.value)}
        className={`px-3 py-1 text-xs font-medium rounded-full transition-all duration-150 cursor-pointer ${
          value === o.value
            ? "bg-white text-[#0A0A0A] shadow-sm"
            : "text-[#6B6B6B] hover:text-[#0A0A0A]"
        }`}
      >
        {o.label}
      </button>
    ))}
  </div>
);

const FilterSelect = ({ icon, value, onChange, children }) => (
  <div className="relative">
    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9C9C9C] pointer-events-none">
      {icon}
    </span>
    <select
      value={value}
      onChange={onChange}
      className="w-full pl-9 pr-8 py-2.5 border border-[#D4D4D8] rounded-md text-sm text-[#0A0A0A] bg-white appearance-none cursor-pointer focus:outline-none focus:border-[#6366F1] focus-visible:ring-[3px] focus-visible:ring-[#6366F1]/12 transition-all"
    >
      {children}
    </select>
    <LuChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#9C9C9C] pointer-events-none" />
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
  countries: (a, b) => (a.countries ?? 0) - (b.countries ?? 0),
  ctr: (a, b) => (a.ctr ?? 0) - (b.ctr ?? 0),
  status: (a, b) => (a.status ?? "").localeCompare(b.status ?? ""),
  created: (a, b) => new Date(a.created_at || 0) - new Date(b.created_at || 0),
  last: (a, b) => new Date(a.last_click_at || 0) - new Date(b.last_click_at || 0),
};

// Sum of `value` over a slice of a { label, value } series (pure helper).
const sliceSum = (arr, start, end) =>
  arr.slice(start, end).reduce((acc, s) => acc + (s.value ?? 0), 0);

const Analytics = () => {
  const [range, setRange] = useState("30d");
  const [customFrom, setCustomFrom] = useState("");
  const [customTo, setCustomTo] = useState("");
  const [linkId, setLinkId] = useState("");
  const [country, setCountry] = useState("");
  const [device, setDevice] = useState("");
  const [heroMetric, setHeroMetric] = useState("clicks");
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
    let fromDate;
    let toDate;
    if (range === "custom") {
      fromDate = customFrom || daysAgo(30, today);
      toDate = customTo || today;
    } else {
      const days = range === "7d" ? 7 : range === "90d" ? 90 : 30;
      fromDate = daysAgo(days, today);
      toDate = today;
    }
    // Guard against an inverted custom range (from after to) — swap instead
    // of querying an empty window and showing a confusing empty state.
    if (fromDate && toDate && fromDate > toDate) {
      [fromDate, toDate] = [toDate, fromDate];
    }
    return { from: fromDate, to: toDate };
  }, [range, customFrom, customTo, today]);

  const params = useMemo(() => {
    const p = { from, to };
    if (linkId) p.linkId = linkId;
    if (country) p.country = country;
    if (device) p.device = device;
    return p;
  }, [from, to, linkId, country, device]);

  const {
    data: analytics,
    isLoading,
    isError,
    refetch,
  } = useQuery({
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
  const engagementSeries = useMemo(
    () =>
      series.map((s) => ({
        label: s.label,
        value: s.value > 0 ? Math.round((s.visitors / s.value) * 1000) / 10 : 0,
      })),
    [series],
  );
  const daysInRange = Math.max(
    1,
    Math.round((new Date(to).getTime() - new Date(from).getTime()) / DAY) + 1,
  );
  const avgPerDay = (summary.clicks / daysInRange).toFixed(1);
  const engagementRate =
    summary.clicks > 0
      ? `${((summary.uniqueClicks / summary.clicks) * 100).toFixed(1)}%`
      : "—";

  // "vs previous period" delta: compare the last N buckets with the N before,
  // where N is at most 7 (or half the range for short windows).
  const deltaWindow = Math.max(1, Math.min(7, Math.floor(daysInRange / 2)));

  const clicksDelta = useMemo(() => {
    if (series.length < deltaWindow * 2) return null;
    const prev = sliceSum(series, -deltaWindow * 2, -deltaWindow);
    if (prev <= 0) return null;
    const recent = sliceSum(series, -deltaWindow, series.length);
    return ((recent - prev) / prev) * 100;
  }, [series, deltaWindow]);

  const visitorsDelta = useMemo(() => {
    if (visitorsSeries.length < deltaWindow * 2) return null;
    const prev = sliceSum(visitorsSeries, -deltaWindow * 2, -deltaWindow);
    if (prev <= 0) return null;
    const recent = sliceSum(visitorsSeries, -deltaWindow, visitorsSeries.length);
    return ((recent - prev) / prev) * 100;
  }, [visitorsSeries, deltaWindow]);

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

  const topCountries = a?.topCountries ?? [];
  const maxCountryClicks = Math.max(
    1,
    ...topCountries.map((c) => c.clicks ?? 0),
  );
  const totalCountryClicks = topCountries.reduce(
    (acc, c) => acc + (c.clicks ?? 0),
    0,
  );
  const countryCount = topCountries.length;
  const topCountry = topCountries[0];

  const loading = isLoading;
  const isEmpty = !loading && !isError && summary.clicks === 0 && !hasFilters;
  const noResults = !loading && !isError && summary.clicks === 0 && hasFilters;

  const { activeSection, scrollToSection, registerSection } = useScrollSpy(
    "overview",
    [loading, isError, isEmpty, noResults],
  );

  const heroTotal =
    heroMetric === "visitors"
      ? (summary.uniqueClicks ?? 0)
      : (summary.clicks ?? 0);
  const heroSeries = heroMetric === "visitors" ? visitorsSeries : series;

  const fade = {
    initial: { opacity: 0, y: 16 },
    animate: { opacity: 1, y: 0 },
    transition: { type: "spring", stiffness: 300, damping: 24 },
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.98, filter: "blur(4px)" }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="text-[#0A0A0A] flex flex-col flex-1 font-body pb-20"
    >
      <main className="flex-1 w-full mx-auto px-4 sm:px-6 mt-10 flex flex-col gap-6 sm:gap-8">
        {/* Header — title + subheading left (mirrors Settings), range control right */}
          <PageHeader title="Analytics" subtitle="Understand every click on your links.">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            {range === "custom" && (
              <div className="flex items-center gap-2">
                <input
                  type="date"
                  value={customFrom}
                  onChange={(e) => setCustomFrom(e.target.value)}
                  className="px-3 py-2 border border-[#D4D4D8] rounded-md text-sm text-[#0A0A0A] bg-white focus:outline-none focus:border-[#6366F1] focus-visible:ring-[3px] focus-visible:ring-[#6366F1]/12"
                />
                <LuArrowRight className="w-3.5 h-3.5 text-[#9C9C9C] shrink-0" />
                <input
                  type="date"
                  value={customTo}
                  onChange={(e) => setCustomTo(e.target.value)}
                  className="px-3 py-2 border border-[#D4D4D8] rounded-md text-sm text-[#0A0A0A] bg-white focus:outline-none focus:border-[#6366F1] focus-visible:ring-[3px] focus-visible:ring-[#6366F1]/12"
                />
              </div>
            )}
            <div className="inline-flex items-center gap-1 bg-[#F3F4F6] border border-[#D4D4D8] rounded-full p-1">
              {RANGES.map((r) => (
                <button
                  key={r.key}
                  onClick={() => setRange(r.key)}
                  className={`px-3 py-1 text-xs font-medium rounded-full transition-all duration-150 cursor-pointer ${
                    range === r.key
                      ? "bg-[#6366F1] text-white"
                      : "text-[#6B6B6B] hover:text-[#0A0A0A]"
                  }`}
                >
                  {r.label}
                </button>
              ))}
            </div>
            </div>
          </PageHeader>

        {/* Filter toolbar */}
        <motion.div {...fade} transition={{ delay: 0.1, type: "spring", stiffness: 300, damping: 24 }}>
          <div className="bg-white border border-[#D4D4D8] rounded-xl px-4 py-4 flex flex-col lg:flex-row lg:items-center gap-3">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 flex-1">
              <FilterSelect
                icon={<LuLink className="w-4 h-4" />}
                value={linkId}
                onChange={(e) => setLinkId(e.target.value)}
              >
                <option value="">All links</option>
                {links.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.short_code}
                  </option>
                ))}
              </FilterSelect>
              <FilterSelect
                icon={<LuMapPin className="w-4 h-4" />}
                value={country}
                onChange={(e) => setCountry(e.target.value)}
              >
                <option value="">All countries</option>
                {(a?.filters?.countries ?? []).map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </FilterSelect>
              <FilterSelect
                icon={<LuMonitor className="w-4 h-4" />}
                value={device}
                onChange={(e) => setDevice(e.target.value)}
              >
                <option value="">All devices</option>
                {DEVICE_OPTIONS.map((d) => (
                  <option key={d.value} value={d.value}>
                    {d.label}
                  </option>
                ))}
              </FilterSelect>
            </div>
            {hasFilters && (
              <button
                onClick={clearFilters}
                className="inline-flex items-center justify-center gap-1.5 text-xs font-medium text-[#6B6B6B] hover:text-[#0A0A0A] transition-colors cursor-pointer shrink-0"
              >
                <LuX className="w-3.5 h-3.5" />
                Clear filters
              </button>
            )}
          </div>
        </motion.div>

        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
          {/* Sticky section sidebar (mirrors Settings) */}
          <nav className="hidden lg:flex flex-col w-48 shrink-0 sticky top-24 self-start">
            <div className="border-l border-[#D4D4D8] flex flex-col gap-0.5">
              {SECTIONS.map((sec) => {
                const isActive = activeSection === sec.id;
                return (
                  <button
                    key={sec.id}
                    type="button"
                    onClick={() => scrollToSection(sec.id)}
                    className={`
                      group flex items-center gap-2.5 px-4 py-2.5 text-left text-sm font-medium
                      transition-all duration-150 border-l-2 -ml-px cursor-pointer
                      ${isActive
                        ? "border-[#6366F1] text-[#0A0A0A] bg-[#F3F4F6] font-semibold"
                        : "border-transparent text-[#6B6B6B] hover:text-[#0A0A0A] hover:border-[#C1C1C9]"
                      }
                    `}
                  >
                    <SectionIcon
                      name={sec.icon}
                      className={`w-4 h-4 shrink-0 transition-colors duration-150 ${
                        isActive ? "text-[#6366F1]" : "text-[#9C9C9C] group-hover:text-[#0A0A0A]"
                      }`}
                    />
                    {sec.label}
                  </button>
                );
              })}
            </div>
          </nav>

          {/* Content column */}
          <div className="flex-1 min-w-0 flex flex-col gap-6 sm:gap-8">
            {/* Mobile section pills */}
            <div className="lg:hidden -mt-1">
              <div className="flex flex-wrap gap-2">
                {SECTIONS.map((sec) => {
                  const isActive = activeSection === sec.id;
                  return (
                    <button
                      key={sec.id}
                      type="button"
                      onClick={() => scrollToSection(sec.id)}
                      className={`
                        flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold
                        border transition-all duration-150 cursor-pointer rounded-full
                        ${isActive
                          ? "border-[#6366F1] bg-[#6366F1] text-white"
                          : "border-[#D4D4D8] bg-white text-[#6B6B6B] hover:border-[#C1C1C9] hover:text-[#0A0A0A]"
                        }
                      `}
                    >
                      <SectionIcon
                        name={sec.icon}
                        className={`w-3.5 h-3.5 shrink-0 ${
                          isActive ? "text-white" : "text-[#9C9C9C]"
                        }`}
                      />
                      {sec.label}
                    </button>
                  );
                })}
              </div>
            </div>

        {loading && <AnalyticsSkeleton />}

        {!loading && isError && (
          <div className="bg-white border border-[#EF4444]/30 rounded-xl p-10 text-center">
            <div className="w-12 h-12 bg-[#FEF2F2] flex items-center justify-center mx-auto mb-4 rounded-lg border border-[#EF4444]/30">
              <LuTriangleAlert className="w-6 h-6 text-[#EF4444]" />
            </div>
            <h3 className="text-lg font-display font-bold text-[#0A0A0A] mb-1">
              Failed to load analytics
            </h3>
            <p className="text-sm text-[#6B6B6B] mb-4">
              Something went wrong while fetching your analytics.
            </p>
            <button
              onClick={() => refetch()}
              className="px-4 py-2 text-sm font-medium bg-[#6366F1] text-white rounded-md hover:bg-[#4F46E5] transition-all duration-150 cursor-pointer hover:-translate-y-px"
            >
              Try again
            </button>
          </div>
        )}

        {isEmpty && (
          <div className="bg-white border border-[#D4D4D8] rounded-xl p-10 text-center">
            <div className="w-12 h-12 bg-[#F3F4F6] flex items-center justify-center mx-auto mb-4 rounded-lg border border-[#D4D4D8]">
              <LuMousePointerClick className="w-6 h-6 text-[#0A0A0A]" />
            </div>
            <p className="text-lg font-display font-bold text-[#0A0A0A] mb-1">
              No clicks yet
            </p>
            <p className="text-sm text-[#6B6B6B]">
              Clicks will appear here once your links start getting traffic.
            </p>
          </div>
        )}

        {noResults && (
          <div className="bg-white border border-[#D4D4D8] rounded-xl p-10 text-center">
            <div className="w-12 h-12 bg-[#F3F4F6] flex items-center justify-center mx-auto mb-4 rounded-lg border border-[#D4D4D8]">
              <LuMapPin className="w-6 h-6 text-[#0A0A0A]" />
            </div>
            <p className="text-lg font-display font-bold text-[#0A0A0A] mb-1">
              No results for these filters
            </p>
            <p className="text-sm text-[#6B6B6B] mb-4">
              Try adjusting your filters or selecting a different date range.
            </p>
            <button
              onClick={clearFilters}
              className="px-4 py-2 text-sm font-medium bg-[#6366F1] text-white rounded-md hover:bg-[#4F46E5] transition-all duration-150 cursor-pointer hover:-translate-y-px"
            >
              Clear filters
            </button>
          </div>
        )}

        {!loading && !isError && !isEmpty && !noResults && (
          <>
            {/* KPI row — each card carries its trend sparkline + delta */}
            <motion.section
              id="overview"
              ref={registerSection("overview")}
              {...fade}
              transition={{ delay: 0.14, type: "spring", stiffness: 300, damping: 24 }}
              className="flex flex-col gap-5 scroll-mt-24"
            >
              <SectionHeading
                name="gauge"
                title="Overview"
                subtitle="Key metrics for the selected period."
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              <StatCard
                label="Total clicks"
                value={summary.clicks.toLocaleString()}
                sub={`${formatShort(from)} – ${formatShort(to)}`}
                icon={<LuMousePointerClick className="w-5 h-5" />}
                delta={clicksDelta}
                spark={<Sparkline data={series} />}
              />
              <StatCard
                label="Unique visitors"
                value={(summary.uniqueClicks ?? 0).toLocaleString()}
                sub={`Distinct visitors · last ${deltaWindow}d`}
                icon={<LuUsers className="w-5 h-5" />}
                delta={visitorsDelta}
                spark={<Sparkline data={visitorsSeries} />}
              />
              <StatCard
                label="Avg. clicks / day"
                value={avgPerDay}
                sub={`Across ${daysInRange} days`}
                icon={<LuCalendarDays className="w-5 h-5" />}
                spark={<Sparkline data={series} />}
              />
              <StatCard
                label="Engagement"
                value={engagementRate}
                sub="Unique visitors ÷ clicks"
                icon={<LuPercent className="w-5 h-5" />}
                spark={<Sparkline data={engagementSeries} />}
              />
              </div>
            </motion.section>

            {/* Hero traffic chart */}
            <motion.section
              id="traffic"
              ref={registerSection("traffic")}
              {...fade}
              transition={{ delay: 0.2, type: "spring", stiffness: 300, damping: 24 }}
              className="flex flex-col gap-5 pt-6 sm:pt-8 border-t border-[#D4D4D8] scroll-mt-24"
            >
              <SectionHeading
                name="clicks"
                title="Traffic"
                subtitle="Clicks and visitors over time."
              />
              <Card
                icon={<LuMousePointerClick className="w-3.5 h-3.5" />}
                right={
                  <SegmentedToggle
                    value={heroMetric}
                    onChange={setHeroMetric}
                    options={[
                      { value: "clicks", label: "Clicks" },
                      { value: "visitors", label: "Visitors" },
                    ]}
                  />
                }
              >
                <div className="flex items-end justify-between gap-4 mb-4">
                  <div>
                    <p className="text-3xl font-display font-bold text-[#0A0A0A] tabular-nums tracking-[-0.03em]">
                      {heroTotal.toLocaleString()}
                    </p>
                    <p className="text-xs text-[#6B6B6B] mt-1">
                      {heroMetric === "visitors" ? "Unique visitors" : "Total clicks"} ·{" "}
                      {formatShort(from)} – {formatShort(to)}
                    </p>
                  </div>
                </div>
                <BarChart
                  data={heroSeries}
                  height={220}
                  unit={heroMetric === "visitors" ? "visitors" : "clicks"}
                />
              </Card>
            </motion.section>

            {/* Geography */}
            <motion.section
              id="geography"
              ref={registerSection("geography")}
              {...fade}
              transition={{ delay: 0.26, type: "spring", stiffness: 300, damping: 24 }}
              className="flex flex-col gap-5 pt-6 sm:pt-8 border-t border-[#D4D4D8] scroll-mt-24"
            >
              <SectionHeading
                name="globe"
                title="Geography"
                subtitle="Where your visitors are located."
              />
              <div className="grid grid-cols-1 gap-5">
              <Card
                title="Top countries"
                icon={<LuGlobe className="w-3.5 h-3.5" />}
                right={
                  <span className="text-[11px] text-[#9C9C9C] tabular-nums">
                    {countryCount} {countryCount === 1 ? "country" : "countries"}
                  </span>
                }
              >
                <div className="flex flex-col max-h-72 overflow-y-auto overscroll-contain -mr-1 pr-1">
                  {topCountries.map((c, i) => {
                    const clicks = c.clicks ?? 0;
                    const pct =
                      totalCountryClicks > 0
                        ? Math.round((clicks / totalCountryClicks) * 100)
                        : 0;
                    return (
                      <div
                        key={c.country}
                        className="flex items-center gap-3 py-2 px-1.5 rounded-md hover:bg-[#F6F6F9] transition-colors duration-150"
                      >
                        <span className="w-5 text-[11px] font-mono font-medium text-[#9C9C9C] tabular-nums shrink-0">
                          {String(i + 1).padStart(2, "0")}
                        </span>
                        <span className="w-8 h-6 rounded-[3px] border border-[#D4D4D8] overflow-hidden shrink-0 flex items-center justify-center bg-[#F3F4F6]">
                          <CountryFlag code={c.country} className="w-6 h-4" />
                        </span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2 mb-1">
                            <span className="text-xs font-medium text-[#0A0A0A] truncate capitalize">
                              {countryNameFromCode(c.country) || c.country}
                            </span>
                            <span className="text-[11px] text-[#9C9C9C] tabular-nums shrink-0">
                              {clicks.toLocaleString()}
                              <span className="ml-1 text-[#6B6B6B]">· {pct}%</span>
                            </span>
                          </div>
                          <div className="h-1 rounded-full bg-[#F3F4F6] overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              whileInView={{ width: `${(clicks / maxCountryClicks) * 100}%` }}
                              viewport={{ once: true }}
                              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                              className="h-full rounded-full bg-[#6366F1]"
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  {!countryCount && (
                    <p className="text-xs text-[#9C9C9C] py-4 text-center">No country data yet</p>
                  )}
                </div>
              </Card>

              <Card title="World map">
                <div className="flex flex-wrap items-center gap-x-8 gap-y-2 mb-4">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#9C9C9C]">
                      Countries
                    </p>
                    <p className="text-xl font-display font-bold text-[#0A0A0A] tabular-nums tracking-[-0.03em]">
                      {countryCount}
                    </p>
                  </div>
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#9C9C9C]">
                      Clicks
                    </p>
                    <p className="text-xl font-display font-bold text-[#0A0A0A] tabular-nums tracking-[-0.03em]">
                      {totalCountryClicks.toLocaleString()}
                    </p>
                  </div>
                  {topCountry && (
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#9C9C9C]">
                        Top country
                      </p>
                      <p className="flex items-center gap-1.5 mt-0.5 text-sm font-semibold text-[#0A0A0A]">
                        <CountryFlag code={topCountry.country} className="w-5 h-4" />
                        {countryNameFromCode(topCountry.country) || topCountry.country}
                        <span className="text-[11px] font-normal text-[#9C9C9C]">
                          {totalCountryClicks > 0
                            ? Math.round(((topCountry.clicks ?? 0) / totalCountryClicks) * 100)
                            : 0}
                          %
                        </span>
                      </p>
                    </div>
                  )}
                </div>
                <Suspense
                  fallback={
                    <div className="flex h-[340px] items-center justify-center text-xs text-[#9C9C9C] sm:h-[400px]">
                      Loading map…
                    </div>
                  }
                >
                  <WorldMapChart countries={topCountries} />
                </Suspense>
              </Card>
              </div>
            </motion.section>

            {/* Technology breakdown */}
            <motion.section
              id="technology"
              ref={registerSection("technology")}
              {...fade}
              transition={{ delay: 0.32, type: "spring", stiffness: 300, damping: 24 }}
              className="flex flex-col gap-5 pt-6 sm:pt-8 border-t border-[#D4D4D8] scroll-mt-24"
            >
              <SectionHeading
                name="cpu"
                title="Technology"
                subtitle="Devices, browsers, and operating systems."
              />
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <Card title="Devices" icon={<LuMonitor className="w-3.5 h-3.5" />}>
                <DonutBreakdown
                  data={a?.devices ?? []}
                  title="Devices"
                  icon={<LuMonitor className="w-4 h-4" />}
                  iconFor={(label) => <DeviceIcon type={label} className="w-3.5 h-3.5" />}
                />
              </Card>
              <Card title="Browsers" icon={<LuGlobe className="w-3.5 h-3.5" />}>
                <DonutBreakdown
                  data={a?.browsers ?? []}
                  title="Browsers"
                  icon={<LuGlobe className="w-4 h-4" />}
                  iconFor={() => <BrowserIcon className="w-3.5 h-3.5" />}
                />
              </Card>
              <Card title="Operating systems" icon={<LuCpu className="w-3.5 h-3.5" />}>
                <DonutBreakdown
                  data={a?.os ?? []}
                  title="Operating systems"
                  icon={<LuCpu className="w-4 h-4" />}
                  iconFor={() => <OsIcon className="w-3.5 h-3.5" />}
                />
              </Card>
              </div>
            </motion.section>

            {/* Top links */}
            <motion.section
              id="top-links"
              ref={registerSection("top-links")}
              {...fade}
              transition={{ delay: 0.38, type: "spring", stiffness: 300, damping: 24 }}
              className="flex flex-col gap-5 pt-6 sm:pt-8 border-t border-[#D4D4D8] scroll-mt-24"
            >
              <SectionHeading
                name="link"
                title="Top links"
                subtitle="Your most-clicked links."
              />
              <Card
                icon={<LuLink className="w-3.5 h-3.5" />}
                right={
                  <span className="text-[11px] text-[#9C9C9C]">
                    <span className="hidden lg:inline">Click headers to sort</span>
                    <span className="lg:hidden">Sorted by clicks</span>
                  </span>
                }
              >
                {/* Desktop table */}
                <div className="hidden lg:block -mx-5 overflow-x-auto max-h-96 sm:max-h-120 overflow-y-auto overscroll-contain">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-[#D4D4D8] divide-x divide-[#E5E5EA] text-left">
                        <th className="px-5 py-3 text-[11px] font-semibold uppercase tracking-[0.12em] text-[#9C9C9C] sticky top-0 z-10 bg-white">
                          S. No
                        </th>
                        <th className="px-5 py-3 text-[11px] font-semibold uppercase tracking-[0.12em] text-[#9C9C9C] sticky top-0 z-10 bg-white">
                          Short URL
                        </th>
                        {[
                          { key: "status", label: "Status" },
                          { key: "clicks", label: "Clicks" },
                          { key: "unique", label: "Unique" },
                          { key: "countries", label: "Countries" },
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
                          <td colSpan={9} className="px-5 py-10 text-center text-[#9C9C9C] text-sm">
                            No links received clicks in this period.
                          </td>
                        </tr>
                      )}
                      {topLinks.map((l, index) => (
                        <tr key={l.id} className="divide-x divide-[#E5E5EA] hover:bg-[#F6F6F9] transition-colors">
                          <td className="px-5 py-3 text-sm text-[#9C9C9C] tabular-nums">
                            {index + 1}
                          </td>
                          <td className="px-5 py-3 font-mono text-xs font-medium text-[#0A0A0A]">
                            {l.short_code}
                          </td>
                          <td className="px-5 py-3">
                            <Chip status={l.status}>
                              {l.status === "active" ? "Active" : "Disabled"}
                            </Chip>
                          </td>
                          <td className="px-5 py-3 text-[#0A0A0A] tabular-nums font-medium">
                            {l.clicks.toLocaleString()}
                          </td>
                          <td className="px-5 py-3 text-[#6B6B6B] tabular-nums">
                            {(l.unique ?? 0).toLocaleString()}
                          </td>
                          <td className="px-5 py-3 text-[#6B6B6B] tabular-nums">
                            {(l.countries ?? 0).toLocaleString()}
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
                      <div className="flex items-start justify-between gap-2">
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
                        <Chip status={l.status}>
                          {l.status === "active" ? "Active" : "Disabled"}
                        </Chip>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-2xl font-display font-bold text-[#0A0A0A] tabular-nums leading-none tracking-[-0.03em]">
                          {l.clicks.toLocaleString()}
                        </span>
                        <span className="flex items-center gap-1 text-[11px] font-medium text-[#9C9C9C] uppercase tracking-wider">
                          <LuZap className="w-3 h-3" />
                          clicks
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5 text-[11px] text-[#9C9C9C]">
                        <LuClock className="w-3 h-3 shrink-0" />
                        Last click {formatDate(l.last_click_at)}
                      </div>

                      <div className="grid grid-cols-3 gap-3 pt-3 border-t border-[#E5E5EA]">
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
                        <span className="flex items-center gap-1.5 text-[11px] text-[#9C9C9C] min-w-0">
                          <LuGlobe className="w-3 h-3 shrink-0 text-[#9C9C9C]" />
                          <span className="tabular-nums font-medium text-[#6B6B6B]">{(l.countries ?? 0).toLocaleString()}</span>
                          Countries
                        </span>
                      </div>
                    </a>
                  ))}
                </div>
              </Card>
            </motion.section>

            {/* Click timeline */}
            <motion.section
              id="timeline"
              ref={registerSection("timeline")}
              {...fade}
              transition={{ delay: 0.44, type: "spring", stiffness: 300, damping: 24 }}
              className="flex flex-col gap-5 pt-6 sm:pt-8 border-t border-[#D4D4D8] scroll-mt-24"
            >
              <SectionHeading
                name="clock"
                title="Click timeline"
                subtitle="Latest clicks in real time."
              />
              <Card
                icon={<LuClock className="w-3.5 h-3.5" />}
                right={<span className="text-[11px] text-[#9C9C9C]">Latest first</span>}
              >
                <div className="flex flex-col divide-y divide-[#E5E5EA] -mx-5 max-h-96 sm:max-h-120 overflow-y-auto overscroll-contain">
                  {(a?.timeline ?? []).map((t) => (
                    <div
                      key={t.id}
                      className="flex flex-col gap-3 py-4 sm:py-5 sm:flex-row sm:items-center sm:gap-5 px-5 transition-colors duration-150 hover:bg-[#F6F6F9]"
                    >
                      <div className="flex items-center gap-3 sm:w-32 sm:shrink-0">
                        <span className="shrink-0 w-8 h-8 flex items-center justify-center bg-[#F3F4F6] border border-[#E5E5EA] rounded-full">
                          <CountryFlag code={t.country} className="w-5 h-4" />
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

                      <div className="hidden sm:block w-px self-stretch bg-[#D4D4D8] shrink-0" />

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
                          value={t.city || countryNameFromCode(t.country) || "—"}
                          icon={<CountryFlag code={t.country} className="w-4 h-3" />}
                        />
                        <TimelineField
                          label="Destination"
                          value={t.original_url}
                          icon={<LinkIcon />}
                        />
                      </div>
                    </div>
                  ))}
                  {!(a?.timeline ?? []).length && (
                    <p className="text-xs text-[#9C9C9C] py-4 text-center">No recent clicks.</p>
                  )}
                </div>
              </Card>
            </motion.section>
          </>
        )}
          </div>
        </div>
      </main>
    </motion.div>
  );
};

export default Analytics;
