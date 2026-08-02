import { useState, useMemo, useEffect, useRef, lazy, Suspense } from "react";
import { createPortal } from "react-dom";
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
import useStickyFallback from "../hooks/useStickyFallback";
import Card from "../components/ui/Card";
import StatCard from "../components/ui/StatCard";
import ClickTimeline from "../components/analytics/ClickTimeline";
import { BrowserIcon, DeviceIcon, OsIcon } from "../components/analytics/DeviceIcons";
import { formatDate, formatShort } from "../utils/format";
import { DEVICE_OPTIONS } from "../utils/timeline";
import {
  LuArrowDown,
  LuArrowRight,
  LuArrowUp,
  LuArrowUpRight,
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
  LuTriangleAlert,
  LuUsers,
  LuX,
  LuZap,
} from "react-icons/lu";

const WorldMapChart = lazy(() => import("../components/analytics/WorldMap"));

const DAY = 24 * 60 * 60 * 1000;

const pad2 = (n) => String(n).padStart(2, "0");
const iso = (t) => {
  const d = new Date(t);
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
};
const toLocalDate = (dateStr) => {
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(y, m - 1, d);
};
const daysAgo = (n, base) => iso(toLocalDate(base).getTime() - n * DAY);

const RANGES = [
  { key: "7d", label: "7d" },
  { key: "30d", label: "30d" },
  { key: "90d", label: "90d" },
  { key: "custom", label: "Custom" },
];

const SECTIONS = [
  { id: "overview", label: "Overview", icon: "gauge" },
  { id: "geography", label: "Geography", icon: "globe" },
  { id: "technology", label: "Technology", icon: "cpu" },
  { id: "links", label: "Links", icon: "link" },
  { id: "timeline", label: "Timeline", icon: "clock" },
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
  const start = toLocalDate(from).getTime();
  const end = toLocalDate(to).getTime();
  const dayCount = Math.round((end - start) / DAY) + 1;

  const collect = (t) => {
    const key = iso(new Date(t));
    return {
      label: key.slice(5),
      value: map.get(key)?.clicks ?? 0,
      visitors: map.get(key)?.visitors ?? 0,
    };
  };

  if (dayCount <= 92) {
    const out = [];
    for (let t = start; t <= end; t += DAY) out.push(collect(t));
    return out;
  }

  const out = [];
  for (let t = start; t <= end; t += 7 * DAY) {
    const weekEnd = Math.min(t + 6 * DAY, end);
    let clicks = 0;
    let visitors = 0;
    for (let d = t; d <= weekEnd; d += DAY) {
      clicks += map.get(iso(new Date(d)))?.clicks ?? 0;
      visitors += map.get(iso(new Date(d)))?.visitors ?? 0;
    }
    out.push({
      label: iso(new Date(t)).slice(5),
      value: clicks,
      visitors,
    });
  }
  return out;
}

const SegmentedToggle = ({ value, onChange, options }) => (
  <div className="inline-flex items-center gap-0.5 bg-[#F3F4F6] border border-[#D4D4D8] rounded-full p-0.5">
    {options.map((o) => (
      <button
        key={o.value}
        type="button"
        onClick={() => onChange(o.value)}
        className={`px-3 py-1 text-xs font-medium rounded-full transition-all duration-150 cursor-pointer ${
          value === o.value
            ? "bg-white text-[#0A0A0A] shadow-sm ring-1 ring-black/[0.04]"
            : "text-[#6B6B6B] hover:text-[#0A0A0A]"
        }`}
      >
        {o.label}
      </button>
    ))}
  </div>
);

const FilterSelect = ({ label, icon, value, onChange, children }) => (
  <label className="flex flex-col gap-1.5 min-w-0">
    {label && (
      <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#9C9C9C]">
        {label}
      </span>
    )}
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
  </label>
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

  useEffect(() => {
    const now = new Date();
    const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
    const msUntilMidnight = tomorrow.getTime() - now.getTime();
    const timer = setTimeout(() => setToday(iso(Date.now())), msUntilMidnight);
    return () => clearTimeout(timer);
  }, [today]);

  const pillBarRef = useRef(null);
  const { stuck: pillBarStuck, floating: pillBarFloating } =
    useStickyFallback(pillBarRef);

  const mobileGridRef = useRef(null);
  const { stuck: mobileGridStuck, floating: mobileGridFloating } =
    useStickyFallback(mobileGridRef);

  const { from, to } = useMemo(() => {
    let fromDate;
    let toDate;
    if (range === "custom") {
      fromDate = customFrom || daysAgo(29, today);
      toDate = customTo || today;
    } else {
      const days = range === "7d" ? 7 : range === "90d" ? 90 : 30;
      fromDate = daysAgo(days - 1, today);
      toDate = today;
    }
    if (fromDate && toDate && fromDate > toDate) {
      [fromDate, toDate] = [toDate, fromDate];
    }
    return { from: fromDate, to: toDate };
  }, [range, customFrom, customTo, today]);

  const params = useMemo(() => {
    const p = {
      from,
      to,
      tz: Intl.DateTimeFormat().resolvedOptions().timeZone,
    };
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
    refetchInterval: 30_000,
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
  const ctrSeries = useMemo(
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
  const ctr =
    summary.clicks > 0
      ? `${((summary.uniqueClicks / summary.clicks) * 100).toFixed(1)}%`
      : "—";

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

  const ctrDelta = useMemo(() => {
    if (ctrSeries.length < deltaWindow * 2) return null;
    const prev = sliceSum(ctrSeries, -deltaWindow * 2, -deltaWindow);
    if (prev <= 0) return null;
    const recent = sliceSum(ctrSeries, -deltaWindow, ctrSeries.length);
    return ((recent - prev) / prev) * 100;
  }, [ctrSeries, deltaWindow]);

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

  const [activeSection, setActiveSection] = useState("overview");

  const sectionRef = useRef(null);
  const prevSection = useRef(activeSection);

  useEffect(() => {
    if (prevSection.current === activeSection) return;
    prevSection.current = activeSection;
    sectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [activeSection]);

  const focusLink = (id) => {
    setLinkId(String(id));
    setActiveSection("overview");
  };

  const activeChips = [];
  if (linkId) {
    const link = links.find((l) => l.id === Number(linkId));
    activeChips.push({
      key: "link",
      label: link ? `Link: ${link.short_code}` : `Link #${linkId}`,
      clear: () => setLinkId(""),
    });
  }
  if (country) {
    activeChips.push({
      key: "country",
      label: `Country: ${countryNameFromCode(country) || country}`,
      clear: () => setCountry(""),
    });
  }
  if (device) {
    activeChips.push({
      key: "device",
      label: `Device: ${DEVICE_OPTIONS.find((o) => o.value === device)?.label ?? device}`,
      clear: () => setDevice(""),
    });
  }
  if (range !== "30d") {
    activeChips.push({
      key: "range",
      label:
        range === "custom"
          ? `${formatShort(customFrom || from)} – ${formatShort(customTo || to)}`
          : `${range.toUpperCase()} range`,
      clear: () => {
        setRange("30d");
        setCustomFrom("");
        setCustomTo("");
      },
    });
  }

  const rangeLabel =
    range === "7d"
      ? "the last 7 days"
      : range === "90d"
        ? "the last 90 days"
        : range === "custom"
          ? `${formatShort(from)} – ${formatShort(to)}`
          : "the last 30 days";
  const summaryDelta =
    clicksDelta == null
      ? ""
      : ` — ${clicksDelta >= 0 ? "up" : "down"} ${Math.abs(clicksDelta).toFixed(1)}% vs the previous ${deltaWindow}d`;

  const heroSeries = heroMetric === "visitors" ? visitorsSeries : series;

  const fade = {
    initial: { opacity: 0, y: 16 },
    animate: { opacity: 1, y: 0 },
    transition: { type: "spring", stiffness: 300, damping: 24 },
  };

  const desktopSectionRow = (
    <div className="flex flex-wrap items-center gap-2">
      {SECTIONS.map((sec) => {
        const isActive = activeSection === sec.id;
        return (
          <button
            key={sec.id}
            type="button"
            onClick={() => setActiveSection(sec.id)}
            aria-pressed={isActive}
            className={`inline-flex items-center gap-2 px-3.5 py-2 text-sm font-semibold rounded-md border transition-all duration-150 cursor-pointer ${
              isActive
                ? "border-[#6366F1] bg-[#6366F1] text-white shadow-sm"
                : "border-[#D4D4D8] bg-white text-[#0A0A0A] hover:border-[#C1C1C9] hover:bg-[#F6F6F9]"
            }`}
          >
            <SectionIcon
              name={sec.icon}
              className={`w-4 h-4 shrink-0 ${
                isActive ? "text-white" : "text-[#9C9C9C]"
              }`}
            />
            {sec.label}
          </button>
        );
      })}
    </div>
  );

  const mobileSectionGrid = (
    <div className="grid grid-cols-2 gap-2">
      {SECTIONS.map((sec) => {
        const isActive = activeSection === sec.id;
        return (
          <button
            key={sec.id}
            type="button"
            onClick={() => setActiveSection(sec.id)}
            className={`flex items-center gap-2 px-3 py-3 text-xs font-semibold w-full border transition-all duration-150 cursor-pointer h-full ${
              isActive
                ? "border-[#6366F1] bg-[#6366F1] text-white rounded-md"
                : "border-[#D4D4D8] bg-white text-[#6B6B6B] hover:border-[#C1C1C9] hover:text-[#0A0A0A] rounded-md"
            }`}
          >
            <SectionIcon
              name={sec.icon}
              className={`w-4 h-4 shrink-0 ${
                isActive ? "text-white" : "text-[#9C9C9C]"
              }`}
            />
            {sec.label}
          </button>
        );
      })}
    </div>
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.98, filter: "blur(4px)" }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="text-[#0A0A0A] flex flex-col flex-1 font-body pb-20"
    >
      <main className="flex-1 w-full mx-auto px-4 sm:px-6 mt-10 flex flex-col gap-6 sm:gap-8">
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
            <div className="inline-flex items-center gap-1 bg-[#F3F4F6] rounded-full p-1">
              {RANGES.map((r) => (
                <button
                  key={r.key}
                  type="button"
                  aria-pressed={range === r.key}
                  onClick={() => setRange(r.key)}
                  className={`px-3 py-1 text-xs font-medium rounded-full transition-all duration-150 cursor-pointer ${
                    range === r.key
                      ? "bg-white text-[#0A0A0A] shadow-sm ring-1 ring-black/[0.04]"
                      : "text-[#6B6B6B] hover:text-[#0A0A0A]"
                  }`}
                >
                  {r.label}
                </button>
              ))}
            </div>
            </div>
          </PageHeader>

        {!loading && !isError && !isEmpty && !noResults && (
          <motion.div {...fade} transition={{ delay: 0.12, type: "spring", stiffness: 300, damping: 24 }}>
            <div className="bg-white border border-[#D4D4D8] rounded-xl px-4 py-3.5 flex items-center gap-3">
              <span className="w-9 h-9 bg-[#F3F4F6] border border-[#D4D4D8] rounded-lg flex items-center justify-center shrink-0">
                <LuMousePointerClick className="w-4 h-4 text-[#0A0A0A]" />
              </span>
              <p className="text-sm text-[#0A0A0A]">
                <span className="font-display font-bold">
                  {summary.clicks.toLocaleString()} clicks
                </span>{" "}
                <span className="text-[#6B6B6B]">in {rangeLabel}</span>
                <span className="text-[#6B6B6B]">{summaryDelta}</span>
              </p>
            </div>
          </motion.div>
        )}

        <motion.div {...fade} transition={{ delay: 0.1, type: "spring", stiffness: 300, damping: 24 }}>
          <div className="bg-white border border-[#D4D4D8] rounded-xl px-4 py-4 flex flex-col lg:flex-row lg:items-center gap-3">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 flex-1">
              <FilterSelect
                label="Link"
                icon={<LuLink className="w-4 h-4" />}
                value={linkId}
                onChange={(e) => setLinkId(e.target.value)}
              >
                <option value="">All links</option>
                {links.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.short_code} · {l.original_url || "Untitled link"}
                  </option>
                ))}
              </FilterSelect>
              <FilterSelect
                label="Country"
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
                label="Device"
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
          </div>
        </motion.div>

        <div
          ref={pillBarRef}
          className={`hidden lg:block sticky top-14 z-30 bg-[#FAFAFA] border-b border-[#D4D4D8] py-3 -mx-4 px-4 sm:-mx-6 sm:px-6 transition-shadow duration-300 ${
            pillBarStuck ? "shadow-[0_8px_24px_rgba(0,0,0,0.06)]" : "shadow-none"
          }`}
        >
          {desktopSectionRow}
        </div>

        {pillBarFloating &&
          createPortal(
            <div
              className={`hidden lg:block fixed inset-x-0 top-14 z-30 bg-[#FAFAFA] border-b border-[#D4D4D8] py-3 px-4 sm:px-6 transition-shadow duration-300 ${
                pillBarStuck ? "shadow-[0_8px_24px_rgba(0,0,0,0.06)]" : "shadow-none"
              }`}
            >
              {desktopSectionRow}
            </div>,
            document.body,
          )}

        <div className="flex flex-col gap-5 sm:gap-10">
            <div
              ref={mobileGridRef}
              className={`lg:hidden sticky top-14 z-30 bg-[#FAFAFA] border-b border-[#D4D4D8] -mx-4 px-4 sm:-mx-6 sm:px-6 pt-3 pb-4 transition-shadow duration-300 ${
                mobileGridStuck
                  ? "shadow-[0_8px_24px_rgba(0,0,0,0.06)]"
                  : "shadow-none"
              }`}
            >
              {mobileSectionGrid}
            </div>

            {mobileGridFloating &&
              createPortal(
                <div
                  className={`lg:hidden fixed inset-x-0 top-14 z-30 bg-[#FAFAFA] border-b border-[#D4D4D8] px-4 sm:px-6 pt-3 pb-4 transition-shadow duration-300 ${
                    mobileGridStuck
                      ? "shadow-[0_8px_24px_rgba(0,0,0,0.06)]"
                      : "shadow-none"
                  }`}
                >
                  {mobileSectionGrid}
                </div>,
                document.body,
              )}

            {activeChips.length > 0 && (
              <div className="flex flex-wrap items-center gap-1.5">
                {activeChips.map((c) => (
                  <span
                    key={c.key}
                    className="inline-flex items-center gap-1.5 pl-2.5 pr-1 py-1 text-[11px] font-medium bg-white border border-[#D4D4D8] rounded-full text-[#0A0A0A]"
                  >
                    {c.label}
                    <button
                      type="button"
                      onClick={c.clear}
                      aria-label={`Clear ${c.label}`}
                      className="text-[#9C9C9C] hover:text-[#0A0A0A] transition-colors cursor-pointer"
                    >
                      <LuX className="w-3 h-3" />
                    </button>
                  </span>
                ))}
                <button
                  type="button"
                  onClick={clearFilters}
                  className="text-[11px] font-medium text-[#6366F1] hover:text-[#4F46E5] transition-colors cursor-pointer"
                >
                  Clear all
                </button>
              </div>
            )}

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
          <motion.div
            key={activeSection}
            ref={sectionRef}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 28 }}
            className="flex flex-col gap-5 sm:gap-10 scroll-mt-56 lg:scroll-mt-32"
          >
            {activeSection === "overview" && (
              <section
                id="overview"
                className="flex flex-col gap-5"
              >
              <SectionHeading
                name="gauge"
                title="Overview"
                subtitle="Key metrics for the selected period."
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              <StatCard
                title="Total clicks"
                value={summary.clicks.toLocaleString()}
                description={`${formatShort(from)} – ${formatShort(to)}`}
                icon={<LuMousePointerClick className="w-5 h-5" />}
                delta={clicksDelta}
                spark={<Sparkline data={series} />}
              />
              <StatCard
                title="Unique visitors"
                value={(summary.uniqueClicks ?? 0).toLocaleString()}
                description={`Distinct visitors · vs previous ${deltaWindow}d`}
                icon={<LuUsers className="w-5 h-5" />}
                delta={visitorsDelta}
                spark={<Sparkline data={visitorsSeries} />}
              />
              <StatCard
                title="Avg. clicks / day"
                value={avgPerDay}
                description={`Across ${daysInRange} days`}
                icon={<LuCalendarDays className="w-5 h-5" />}
              />
              <StatCard
                title="CTR"
                value={ctr}
                description="Unique visitors ÷ clicks"
                icon={<LuPercent className="w-5 h-5" />}
                delta={ctrDelta}
                spark={<Sparkline data={ctrSeries} />}
              />
              </div>

              <div className="flex flex-col gap-5 pt-6 sm:pt-8 border-t border-[#D4D4D8]">
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
                <BarChart
                  data={heroSeries}
                  height={220}
                  unit={heroMetric === "visitors" ? "visitors" : "clicks"}
                  showAxis
                />
              </Card>
              </div>
              </section>
            )}

            {activeSection === "geography" && (
              <section
                id="geography"
                className="flex flex-col gap-5"
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
              </section>
            )}

            {activeSection === "technology" && (
              <section
                id="technology"
                className="flex flex-col gap-5"
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
              </section>
            )}

            {activeSection === "links" && (
              <section
                id="links"
                className="flex flex-col gap-5"
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
                    <span className="hidden lg:inline">Click a row to focus it · click headers to sort</span>
                    <span className="lg:hidden">Tap a card to focus it</span>
                  </span>
                }
              >
                <div className="hidden lg:block -mx-5 overflow-x-auto max-h-96 sm:max-h-120 overflow-y-auto overscroll-contain">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-[#D4D4D8] divide-x divide-[#E5E5EA] text-left">
                        <th className="px-5 py-3 text-[11px] font-semibold uppercase tracking-[0.12em] text-[#0A0A0A] sticky top-0 z-10 bg-white">
                          S. No
                        </th>
                        <th className="px-5 py-3 text-[11px] font-semibold uppercase tracking-[0.12em] text-[#0A0A0A] sticky top-0 z-10 bg-white">
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
                            className={`px-5 py-3 text-[11px] font-semibold uppercase tracking-[0.12em] whitespace-nowrap cursor-pointer select-none transition-colors hover:text-[#0A0A0A] sticky top-0 z-10 bg-white text-[#0A0A0A] ${
                              sortField === col.key ? "text-[#0A0A0A]" : ""
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
                        <tr
                          key={l.id}
                          onClick={() => focusLink(l.id)}
                          title={`View analytics for ${l.short_code}`}
                          className="divide-x divide-[#E5E5EA] hover:bg-[#F6F6F9] transition-colors cursor-pointer"
                        >
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

                <div className="flex flex-col gap-3 lg:hidden max-h-96 sm:max-h-120 overflow-y-auto overscroll-contain">
                  {topLinks.length === 0 && (
                    <p className="py-8 text-center text-[#9C9C9C] text-sm">
                      No links received clicks in this period.
                    </p>
                  )}
                  {topLinks.map((l) => (
                    <div
                      key={l.id}
                      role="button"
                      tabIndex={0}
                      onClick={() => focusLink(l.id)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          focusLink(l.id);
                        }
                      }}
                      aria-label={`View analytics for ${l.short_code}`}
                      className="bg-white border border-[#D4D4D8] rounded-xl px-4 py-4 flex flex-col gap-3 transition-all duration-150 hover:-translate-y-0.5 hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)] active:bg-[#F6F6F9] active:border-[#D4D4D8] active:scale-[0.99] cursor-pointer"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex flex-col gap-1 min-w-0">
                          <span className="font-mono text-xs font-semibold text-[#0A0A0A] truncate">
                            {l.short_code}
                          </span>
                          {l.original_url && (
                            <a
                              href={l.original_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              className="text-[11px] text-[#9C9C9C] truncate hover:text-[#6366F1] transition-colors"
                            >
                              {l.original_url}
                            </a>
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
                      <div className="flex items-center justify-between pt-1">
                        <span className="text-[11px] font-semibold text-[#6366F1]">
                          View analytics
                        </span>
                        <LuArrowUpRight className="w-3.5 h-3.5 text-[#6366F1]" />
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
              </section>
            )}

            {activeSection === "timeline" && (
              <section
                id="timeline"
                className="flex flex-col gap-5"
              >
              <SectionHeading
                name="clock"
                title="Click timeline"
                subtitle="Latest clicks in real time."
              />
              <ClickTimeline
                timeline={a?.timeline ?? []}
                dayCounts={a?.clicksOverTime ?? []}
              />
              </section>
            )}
          </motion.div>
        )}
        </div>
      </main>
    </motion.div>
  );
};

export default Analytics;
