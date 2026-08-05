import { useState, useMemo, useEffect, useRef, lazy, Suspense } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "motion/react";
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
import useCountUp from "../hooks/useCountUp";
import Card from "../components/ui/Card";
import StatCard from "../components/ui/StatCard";
import ClickTimeline from "../components/analytics/ClickTimeline";
import { BrowserIcon, DeviceIcon, OsIcon } from "../components/analytics/DeviceIcons";
import { Link } from "react-router";
import {
  formatDate,
  formatDateTime,
  formatShort,
} from "../utils/format";
import { DEVICE_OPTIONS } from "../utils/timeline";
import { useAnalyticsFilters } from "../hooks/useAnalyticsFilters";
import SegmentedToggle from "../components/ui/SegmentedToggle";
import FilterSelect from "../components/ui/FilterSelect";
import SearchableSelect from "../components/ui/SearchableSelect";
import { exportTopLinksCsv, exportCountriesCsv, exportTimelineCsv } from "../utils/exportCsv";
import {
  LuArrowDown,
  LuArrowRight,
  LuArrowUp,
  LuArrowUpRight,
  LuCalendarDays,
  LuChevronDown,
  LuChevronUp,
  LuClock,
  LuCpu,
  LuDownload,
  LuGauge,
  LuGlobe,
  LuHouse,
  LuLink,
  LuMapPin,
  LuMonitor,
  LuMousePointerClick,
  LuSlidersHorizontal,
  LuPercent,
  LuTriangleAlert,
  LuUsers,
  LuX,
  LuZap,
} from "react-icons/lu";

const WorldMapChart = lazy(() => import("../components/analytics/WorldMap"));

const SECTIONS = [
  { id: "overview", label: "Overview", icon: "gauge" },
  { id: "geography", label: "Geography", icon: "globe" },
  { id: "technology", label: "Technology", icon: "cpu" },
  { id: "links", label: "Links", icon: "link" },
  { id: "timeline", label: "Click Feed", icon: "clock" },
];

const METRIC_DEFS = {
  clicks:
    "Total clicks in the selected period — every time a short link is opened, including repeat visits from the same person.",
  visitors:
    "How many different people clicked, counted once each — even if they click many times. We tell people apart using a private, anonymized fingerprint of their IP address, so the same person clicking from the same connection counts as one visitor. The fingerprint can't be reversed, so we never learn or store anyone's real IP.",
  avgPerDay:
    "Average clicks per day — total clicks divided by the number of days in the selected period.",
  ctr: "What percentage of clicks came from distinct visitors. Higher means your traffic reaches more unique people rather than the same visitors clicking repeatedly.",
};

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
  const DAY = 24 * 60 * 60 * 1000;
  const map = new Map(data.map((d) => [d.date, d]));
  const pad2 = (n) => String(n).padStart(2, "0");
  const iso = (t) => {
    const d = new Date(t);
    return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
  };
  const toLocalDate = (dateStr) => {
    const [y, m, d] = dateStr.split("-").map(Number);
    return new Date(y, m - 1, d);
  };

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

const sorters = {
  clicks: (a, b) => (a.clicks ?? 0) - (b.clicks ?? 0),
  unique: (a, b) => (a.unique ?? 0) - (b.unique ?? 0),
  countries: (a, b) => (a.countries ?? 0) - (b.countries ?? 0),
  ctr: (a, b) => (a.ctr ?? 0) - (b.ctr ?? 0),
  status: (a, b) => (a.status ?? "").localeCompare(b.status ?? ""),
  created: (a, b) => new Date(a.created_at || 0) - new Date(b.created_at || 0),
  modified: (a, b) => new Date(a.updated_at || 0) - new Date(b.updated_at || 0),
  last: (a, b) => new Date(a.last_click_at || 0) - new Date(b.last_click_at || 0),
};

const sliceSum = (arr, start, end) =>
  arr.slice(start, end).reduce((acc, s) => acc + (s.value ?? 0), 0);

const SectionLoader = () => (
  <div className="flex flex-col gap-5 animate-pulse">
    <div className="flex items-center gap-3">
      <div className="w-8 h-8 sm:w-9 sm:h-9 bg-[#F3F4F6] border border-[#D4D4D8] rounded-lg" />
      <div className="flex flex-col gap-1.5">
        <div className="h-4 bg-[#D4D4D8] w-20 rounded" />
        <div className="h-3 bg-[#F3F4F6] w-36 rounded" />
      </div>
    </div>
    <div className="bg-white border border-[#D4D4D8] rounded-xl h-64" />
  </div>
);

const Analytics = () => {
  const [heroMetric, setHeroMetric] = useState("clicks");
  const [sortField, setSortField] = useState("clicks");
  const [sortDir, setSortDir] = useState("desc");
  const [activeSection, setActiveSection] = useState("overview");
  const [selectedDay, setSelectedDay] = useState(null);
  const [timelineLimit, setTimelineLimit] = useState(25);
  const [filtersOpen, setFiltersOpen] = useState(true);
  const [timelineSearch, setTimelineSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const pillBarRef = useRef(null);
  const { stuck: pillBarStuck, floating: pillBarFloating } =
    useStickyFallback(pillBarRef);

  const mobileGridRef = useRef(null);
  const { stuck: mobileGridStuck, floating: mobileGridFloating } =
    useStickyFallback(mobileGridRef);

  const { data: linksData } = useQuery({
    queryKey: ["LINKS_INFO"],
    queryFn: getAllLinks,
  });
  const links = linksData?.data?.links ?? [];

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(timelineSearch), 350);
    return () => clearTimeout(t);
  }, [timelineSearch]);

  const {
    range: fRange, setRange: fSetRange,
    customFrom: fCustomFrom, setCustomFrom: fSetCustomFrom,
    customTo: fCustomTo, setCustomTo: fSetCustomTo,
    linkId: fLinkId, setLinkId: fSetLinkId,
    country: fCountry, setCountry: fSetCountry,
    device: fDevice, setDevice: fSetDevice,
    from: fFrom, to: fTo,
    params,
    hasFilters: fHasFilters,
    activeFilterCount: fActiveFilterCount,
    clearFilters: fClearFilters,
    activeChips: fActiveChips,
    daysInRange: fDaysInRange,
  } = useAnalyticsFilters(links, null, activeSection, selectedDay, timelineLimit);

  const paramsWithSearch = useMemo(() => {
    if (activeSection !== "timeline" || !debouncedSearch.trim()) return params;
    return { ...params, q: debouncedSearch.trim() };
  }, [params, activeSection, debouncedSearch]);

  const {
    data: analytics,
    isLoading,
    isFetching,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["ANALYTICS", JSON.stringify(paramsWithSearch)],
    queryFn: () => getAnalytics(paramsWithSearch),
    placeholderData: (prev) => prev,
    staleTime: 30_000,
    refetchInterval: 30_000,
  });

  const a = analytics?.data;
  const summary = a?.summary ?? { clicks: 0, uniqueClicks: 0 };
  const series = useMemo(
    () => fillGaps(a?.clicksOverTime ?? [], fFrom, fTo),
    [a, fFrom, fTo],
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

  const clicksDisplay = useCountUp(summary.clicks);
  const visitorsDisplay = useCountUp(summary.uniqueClicks ?? 0);
  const avgPerDayValue = summary.clicks / fDaysInRange;
  const avgPerDayDisplay = useCountUp(avgPerDayValue, { decimals: 1 });
  const ctrValue =
    summary.clicks > 0 ? (summary.uniqueClicks / summary.clicks) * 100 : 0;
  const ctrDisplay = useCountUp(ctrValue, { decimals: 1 });

  const maxClicksInSeries = Math.max(...series.map((s) => s.value ?? 0), 0);
  const maxVisitorsInSeries = Math.max(...visitorsSeries.map((s) => s.value ?? 0), 0);

  const deltaWindow = Math.max(1, Math.min(7, Math.floor(fDaysInRange / 2)));

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
  const maxCountryClicks = Math.max(1, ...topCountries.map((c) => c.clicks ?? 0));
  const totalCountryClicks = topCountries.reduce((acc, c) => acc + (c.clicks ?? 0), 0);
  const countryCount = topCountries.length;
  const topCountry = topCountries[0];
  const countriesReady = activeSection === "geography" && a?.view === "geography";
  const countriesDisplay = useCountUp(countryCount, { enabled: countriesReady });
  const geoClicksDisplay = useCountUp(totalCountryClicks, { enabled: countriesReady });

  const loading = isLoading;
  const sectionReady = a?.view === activeSection;
  const timelineReady = a?.view === "timeline" && a?.day === (selectedDay ?? null);
  const isEmpty = !loading && !isError && summary.clicks === 0 && !fHasFilters;
  const noResults = !loading && !isError && summary.clicks === 0 && fHasFilters;

  const sectionRef = useRef(null);
  const prevSection = useRef(activeSection);

  useEffect(() => {
    if (prevSection.current === activeSection) return;
    prevSection.current = activeSection;
    const el = sectionRef.current;
    if (!el) return;
    const nav = document.querySelector("header");
    const navHeight = nav?.getBoundingClientRect().height ?? 56;
    const bar = pillBarRef.current?.offsetHeight
      ? pillBarRef.current
      : mobileGridRef.current;
    const barHeight = bar?.getBoundingClientRect().height ?? 0;
    const top = el.getBoundingClientRect().top + window.scrollY - navHeight - barHeight - 24;
    window.scrollTo({ top, behavior: "smooth" });
  }, [activeSection]);

  const filterResetKey = [fRange, fCustomFrom, fCustomTo, fLinkId, fCountry, fDevice].join("|");
  const prevFilterResetKey = useRef(filterResetKey);
  useEffect(() => {
    if (prevFilterResetKey.current !== filterResetKey) {
      prevFilterResetKey.current = filterResetKey;
      setSelectedDay(null);
      setTimelineLimit(25);
    }
  }, [filterResetKey]);

  const focusLink = (id) => {
    fSetLinkId(String(id));
    setActiveSection("overview");
  };

  const heroSeries = heroMetric === "visitors" ? visitorsSeries : series;

  const fade = {
    initial: { opacity: 0, y: 16 },
    animate: { opacity: 1, y: 0 },
    transition: { type: "spring", stiffness: 300, damping: 24 },
  };

  const dateRangeLabel = useMemo(() => {
    const fromStr = formatShort(fFrom);
    const toStr = formatShort(fTo);
    return `${fromStr} – ${toStr} · ${fDaysInRange} days`;
  }, [fFrom, fTo, fDaysInRange]);

  const desktopSectionRow = (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#0A0A0A] mr-1">
        Sections
      </span>
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
              className={`w-4 h-4 shrink-0 ${isActive ? "text-white" : "text-[#71717A]"}`}
            />
            {sec.label}
          </button>
        );
      })}
    </div>
  );

  const mobileSectionGrid = (
    <div className="flex flex-col gap-2">
      <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#0A0A0A]">
        Sections
      </span>
      <div className="flex flex-wrap gap-2">
        {SECTIONS.map((sec) => {
          const isActive = activeSection === sec.id;
          return (
            <button
              key={sec.id}
              type="button"
              onClick={() => setActiveSection(sec.id)}
              className={`inline-flex items-center gap-2 px-3 py-2 text-sm font-semibold rounded-md border transition-all duration-150 cursor-pointer ${
                isActive
                  ? "border-[#6366F1] bg-[#6366F1] text-white shadow-sm"
                  : "border-[#D4D4D8] bg-white text-[#0A0A0A] hover:border-[#C1C1C9] hover:bg-[#F6F6F9]"
              }`}
            >
              <SectionIcon
                name={sec.icon}
                className={`w-4 h-4 shrink-0 ${isActive ? "text-white" : "text-[#71717A]"}`}
              />
              {sec.label}
            </button>
          );
        })}
      </div>
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
        <PageHeader
          title="Analytics"
          subtitle={dateRangeLabel}
        />

        
        <motion.div {...fade} transition={{ delay: 0.1, type: "spring", stiffness: 300, damping: 24 }}>
          <div className="bg-white border border-[#D4D4D8] rounded-xl px-4 py-4">
            
            <div className="flex items-center gap-2.5">
              <span className="w-8 h-8 bg-[#F3F4F6] border border-[#D4D4D8] rounded-lg flex items-center justify-center shrink-0">
                <LuSlidersHorizontal className="w-4 h-4 text-[#0A0A0A]" />
              </span>
              <div className="flex-1 min-w-0">
                <h2 className="text-sm font-display font-bold tracking-[-0.02em] text-[#0A0A0A]">
                  Filters
                  {fActiveFilterCount > 0 && (
                    <span className="ml-1.5 inline-flex items-center justify-center w-5 h-5 text-[10px] font-bold bg-[#6366F1] text-white rounded-full">
                      {fActiveFilterCount}
                    </span>
                  )}
                </h2>
                <p className="text-xs text-[#6B6B6B]">
                  Narrow your analytics by time range, link, country, or device.
                </p>
              </div>

              
              {(activeSection === "links" || activeSection === "geography" || activeSection === "timeline") && (
              <button
                type="button"
                onClick={() => {
                  if (activeSection === "links") exportTopLinksCsv(topLinks);
                  else if (activeSection === "geography") exportCountriesCsv(topCountries, totalCountryClicks);
                  else if (activeSection === "timeline") exportTimelineCsv(a?.timeline ?? []);
                }}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-[#6366F1] border border-[#6366F1]/20 rounded-md hover:bg-[#6366F1]/5 transition-colors cursor-pointer focus-visible:ring-[3px] focus-visible:ring-[#6366F1]/20 focus-visible:outline-none"
                title={`Export ${activeSection} as CSV`}
              >
                  <LuDownload className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Export</span>
                </button>
              )}

              
              <button
                type="button"
                onClick={() => setFiltersOpen((o) => !o)}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-[#6B6B6B] border border-[#D4D4D8] rounded-md hover:bg-[#F6F6F9] transition-colors cursor-pointer focus-visible:ring-[3px] focus-visible:ring-[#6366F1]/20 focus-visible:outline-none"
                aria-expanded={filtersOpen}
              >
                {filtersOpen ? (
                  <>
                    <LuChevronUp className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Hide</span>
                  </>
                ) : (
                  <>
                    <LuChevronDown className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Filters</span>
                  </>
                )}
              </button>
            </div>

            
            <AnimatePresence initial={false}>
              {filtersOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
                  className="overflow-hidden"
                >
                  <div className="flex flex-col lg:flex-row lg:items-end gap-4 mt-4 pt-4 border-t border-[#E5E5EA]">
                    <div className="flex flex-col gap-1.5 shrink-0">
                      <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#0A0A0A]">
                        Range
                      </span>
                      <div className="self-start">
                        <SegmentedToggle
                          size="md"
                          value={fRange}
                          onChange={fSetRange}
                          options={[
                            { key: "7d", label: "7d" },
                            { key: "30d", label: "30d" },
                            { key: "90d", label: "90d" },
                            { key: "custom", label: "Custom" },
                          ].map((r) => ({ value: r.key, label: r.label }))}
                        />
                      </div>
                    </div>

                    {fRange === "custom" && (
                      <div className="flex flex-col gap-1.5">
                        <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#0A0A0A]">
                          Custom dates
                        </span>
                        <div className="flex items-center gap-2">
                          <div className="flex flex-col gap-1">
                            <span className="text-[10px] text-[#6B6B6B]">From</span>
                            <input
                              type="date"
                              value={fCustomFrom}
                              onChange={(e) => fSetCustomFrom(e.target.value)}
                              aria-label="Custom range start date"
                              className="px-3 py-2 border border-[#D4D4D8] rounded-md text-sm text-[#0A0A0A] bg-white focus:outline-none focus:border-[#6366F1] focus-visible:ring-[3px] focus-visible:ring-[#6366F1]/20"
                            />
                          </div>
                          <LuArrowRight className="w-3.5 h-3.5 text-[#71717A] shrink-0 mt-4" />
                          <div className="flex flex-col gap-1">
                            <span className="text-[10px] text-[#6B6B6B]">To</span>
                            <input
                              type="date"
                              value={fCustomTo}
                              onChange={(e) => fSetCustomTo(e.target.value)}
                              aria-label="Custom range end date"
                              className="px-3 py-2 border border-[#D4D4D8] rounded-md text-sm text-[#0A0A0A] bg-white focus:outline-none focus:border-[#6366F1] focus-visible:ring-[3px] focus-visible:ring-[#6366F1]/20"
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 flex-1">
                      <SearchableSelect
                        label="Link"
                        info="Every link you've created is listed here, sorted alphabetically with a search box. Pick one to focus on just that link — the list also respects your country, device, and date range filters."
                        icon={<LuLink className="w-4 h-4" />}
                        value={fLinkId}
                        onChange={fSetLinkId}
                        options={links.map((l) => ({
                          value: String(l.id),
                          label: l.short_code,
                          hint: l.original_url || "Untitled link",
                        }))}
                        placeholder="All links"
                        searchPlaceholder="Search links…"
                        emptyText="No links match"
                        labelClassName="font-mono text-xs"
                      />
                      <SearchableSelect
                        label="Country"
                        info="Every country with clicks in this period is listed here, sorted alphabetically with a search box. Pick one to focus on just that country — the list also respects your link, device, and date range filters."
                        icon={<LuMapPin className="w-4 h-4" />}
                        value={fCountry}
                        onChange={fSetCountry}
                        options={(a?.filters?.countries ?? []).map((c) => ({
                          value: c,
                          label: countryNameFromCode(c) || c,
                        }))}
                        placeholder="All countries"
                        searchPlaceholder="Search countries…"
                        emptyText="No countries match"
                        renderLeading={(o) => (
                          <CountryFlag code={o.value} className="w-4 h-3 shrink-0" />
                        )}
                      />
                      <FilterSelect
                        label="Device"
                        icon={<LuMonitor className="w-4 h-4" />}
                        value={fDevice}
                        onChange={(e) => fSetDevice(e.target.value)}
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
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        
        <div
          ref={pillBarRef}
          className={`hidden lg:block sticky top-14 z-30 bg-[#FAFAFA] border-b border-[#D4D4D8] py-3 -mx-4 px-4 sm:-mx-6 sm:px-6 transition-shadow duration-300 ${
            pillBarStuck ? "shadow-[0_8px_24px_rgba(0,0,0,0.08)]" : "shadow-none"
          }`}
        >
          {desktopSectionRow}
        </div>

        {pillBarFloating &&
          createPortal(
            <div
              className={`hidden lg:block fixed inset-x-0 top-14 z-30 bg-[#FAFAFA] border-b border-[#D4D4D8] py-3 px-4 sm:px-6 transition-shadow duration-300 ${
                pillBarStuck ? "shadow-[0_8px_24px_rgba(0,0,0,0.08)]" : "shadow-none"
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
                ? "shadow-[0_8px_24px_rgba(0,0,0,0.08)]"
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
                    ? "shadow-[0_8px_24px_rgba(0,0,0,0.08)]"
                    : "shadow-none"
                }`}
              >
                {mobileSectionGrid}
              </div>,
              document.body,
            )}

          
          {fActiveChips.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5">
              {fActiveChips.map((c) => (
                <span
                  key={c.key}
                  className="inline-flex items-center gap-1.5 pl-2.5 pr-1 py-1 text-[11px] font-medium bg-white border border-[#D4D4D8] rounded-full text-[#0A0A0A]"
                >
                  {c.label}
                  <button
                    type="button"
                    onClick={c.clear}
                    aria-label={`Clear ${c.label}`}
                    className="text-[#71717A] hover:text-[#0A0A0A] transition-colors cursor-pointer"
                  >
                    <LuX className="w-3 h-3" />
                  </button>
                </span>
              ))}
              <button
                type="button"
                onClick={fClearFilters}
                className="text-[11px] font-medium text-[#6366F1] hover:text-[#4F46E5] transition-colors cursor-pointer focus-visible:ring-[3px] focus-visible:ring-[#6366F1]/20 focus-visible:outline-none"
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
                className="px-4 py-2 text-sm font-medium bg-[#6366F1] text-white rounded-md hover:bg-[#4F46E5] transition-all duration-150 cursor-pointer hover:-translate-y-px focus-visible:ring-[3px] focus-visible:ring-[#6366F1]/20 focus-visible:outline-none"
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
              <p className="text-sm text-[#6B6B6B] mb-4">
                Clicks will appear here once your links start getting traffic.
              </p>
              <Link
                to="/dashboard"
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium bg-[#6366F1] text-white rounded-md hover:bg-[#4F46E5] transition-all duration-150 hover:-translate-y-px focus-visible:ring-[3px] focus-visible:ring-[#6366F1]/20 focus-visible:outline-none"
              >
                <LuLink className="w-4 h-4" />
                Create your first link
              </Link>
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
                onClick={fClearFilters}
                className="px-4 py-2 text-sm font-medium bg-[#6366F1] text-white rounded-md hover:bg-[#4F46E5] transition-all duration-150 cursor-pointer hover:-translate-y-px focus-visible:ring-[3px] focus-visible:ring-[#6366F1]/20 focus-visible:outline-none"
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
              className="flex flex-col gap-5 sm:gap-10"
            >
              {!sectionReady ? (
                <SectionLoader />
              ) : (
                <>
                  
                  {activeSection === "overview" && (
                    <section id="overview" className="flex flex-col gap-5">
                      <SectionHeading
                        name="gauge"
                        title="Overview"
                        subtitle="Key metrics for the selected period — hover any card for a quick definition."
                      />
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                        <StatCard
                          title="Total clicks"
                          value={clicksDisplay.toLocaleString()}
                          description={`${formatShort(fFrom)} – ${formatShort(fTo)}`}
                          icon={<LuMousePointerClick className="w-5 h-5" />}
                          delta={clicksDelta}
                          spark={<Sparkline data={series} />}
                          sparkMax={maxClicksInSeries}
                          info={METRIC_DEFS.clicks}
                          titleClassName="text-[#0A0A0A]"
                        />
                        <StatCard
                          title="Unique visitors"
                          value={visitorsDisplay.toLocaleString()}
                          description={`Distinct visitors · vs previous ${deltaWindow}d`}
                          icon={<LuUsers className="w-5 h-5" />}
                          delta={visitorsDelta}
                          spark={<Sparkline data={visitorsSeries} />}
                          sparkMax={maxVisitorsInSeries}
                          info={METRIC_DEFS.visitors}
                          titleClassName="text-[#0A0A0A]"
                        />
                        <StatCard
                          title="Avg. clicks / day"
                          value={avgPerDayDisplay.toFixed(1)}
                          description={`Across ${fDaysInRange} days`}
                          icon={<LuCalendarDays className="w-5 h-5" />}
                          info={METRIC_DEFS.avgPerDay}
                          titleClassName="text-[#0A0A0A]"
                        />
                        <StatCard
                          title="Visitor ratio"
                          value={summary.clicks > 0 ? `${ctrDisplay.toFixed(1)}%` : "—"}
                          description="Unique visitors ÷ total clicks"
                          icon={<LuPercent className="w-5 h-5" />}
                          delta={ctrDelta}
                          spark={<Sparkline data={ctrSeries} />}
                          info={METRIC_DEFS.ctr}
                          titleClassName="text-[#0A0A0A]"
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
                    <section id="geography" className="flex flex-col gap-5">
                      <SectionHeading
                        name="globe"
                        title="Geography"
                        subtitle="Where your visitors are located, ranked by clicks."
                      />
                      <div className="grid grid-cols-1 gap-5">
                        <Card
                          title="Top countries"
                          icon={<LuGlobe className="w-3.5 h-3.5" />}
                          right={
                            <span className="text-[11px] text-[#71717A] tabular-nums">
                              {countryCount} {countryCount === 1 ? "country" : "countries"}
                            </span>
                          }
                        >
                          <p className="text-xs text-[#6B6B6B] leading-relaxed mb-4">
                            Each click is attributed to the country your visitor was in
                            when they opened your link, detected from their location at
                            click time.
                          </p>
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
                                  <span className="w-5 text-[11px] font-mono font-medium text-[#71717A] tabular-nums shrink-0">
                                    {String(i + 1).padStart(2, "0")}
                                  </span>
                                  <span className="w-10 h-7 rounded-[3px] border border-[#D4D4D8] overflow-hidden shrink-0 flex items-center justify-center bg-[#F3F4F6]">
                                    <CountryFlag code={c.country} className="w-7 h-5" />
                                  </span>
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between gap-2 mb-1">
                                      <span className="text-xs font-medium text-[#0A0A0A] truncate">
                                        {countryNameFromCode(c.country) || c.country}
                                      </span>
                                      <span className="text-[11px] text-[#71717A] tabular-nums shrink-0">
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
                              <p className="text-xs text-[#71717A] py-4 text-center">No country data yet</p>
                            )}
                          </div>
                        </Card>

                        <Card title="World map">
                          <div className="flex flex-wrap items-center gap-x-8 gap-y-2 mb-4">
                            <div>
                              <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#71717A]">
                                Countries
                              </p>
                              <p className="text-xl font-display font-bold text-[#0A0A0A] tabular-nums tracking-[-0.03em]">
                                {countriesDisplay}
                              </p>
                            </div>
                            <div>
                              <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#71717A]">
                                Clicks
                              </p>
                              <p className="text-xl font-display font-bold text-[#0A0A0A] tabular-nums tracking-[-0.03em]">
                                {geoClicksDisplay.toLocaleString()}
                              </p>
                            </div>
                            {topCountry && (
                              <div>
                                <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#71717A]">
                                  Top country
                                </p>
                                <Chip status="default" dot={false} className="mt-0.5">
                                  <CountryFlag code={topCountry.country} className="w-4 h-3" />
                                  <span className="font-medium text-[#0A0A0A]">
                                    {countryNameFromCode(topCountry.country) || topCountry.country}
                                  </span>
                                  <span className="text-[11px] font-normal text-[#71717A]">
                                    {totalCountryClicks > 0
                                      ? Math.round(((topCountry.clicks ?? 0) / totalCountryClicks) * 100)
                                      : 0}
                                    %
                                  </span>
                                </Chip>
                              </div>
                            )}
                          </div>
                          <Suspense
                            fallback={
                              <div className="flex h-[340px] items-center justify-center text-xs text-[#71717A] sm:h-[400px]">
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
                    <section id="technology" className="flex flex-col gap-5">
                      <SectionHeading
                        name="cpu"
                        title="Technology"
                        subtitle="The devices, browsers, and operating systems your visitors use."
                      />
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                        <Card title="Devices" icon={<LuMonitor className="w-3.5 h-3.5" />} titleClassName="text-[#0A0A0A]">
                          <DonutBreakdown
                            data={a?.devices ?? []}
                            title="Devices"
                            icon={<LuMonitor className="w-4 h-4" />}
                            iconFor={(label) => <DeviceIcon type={label} className="w-3.5 h-3.5" />}
                            palette={["#6366F1", "#10B981", "#F59E0B"]}
                          />
                        </Card>
                        <Card title="Browsers" icon={<LuGlobe className="w-3.5 h-3.5" />} titleClassName="text-[#0A0A0A]">
                          <DonutBreakdown
                            data={a?.browsers ?? []}
                            title="Browsers"
                            icon={<LuGlobe className="w-4 h-4" />}
                            iconFor={(label) => <BrowserIcon name={label} className="w-3.5 h-3.5" />}
                            palette={["#4285F4", "#0F7FC0", "#FF7139", "#0078D7", "#FF1B2D"]}
                          />
                        </Card>
                        <Card title="Operating systems" icon={<LuCpu className="w-3.5 h-3.5" />} titleClassName="text-[#0A0A0A]">
                          <DonutBreakdown
                            data={a?.os ?? []}
                            title="Operating systems"
                            icon={<LuCpu className="w-4 h-4" />}
                            iconFor={(label) => <OsIcon name={label} className="w-3.5 h-3.5" />}
                            palette={["#00A4EF", "#3DDC84", "#A2AAAD", "#6366F1", "#F59E0B"]}
                          />
                        </Card>
                      </div>
                    </section>
                  )}

                  
                  {activeSection === "links" && (
                    <section id="links" className="flex flex-col gap-5">
                      <SectionHeading
                        name="link"
                        title="Top links"
                        subtitle="Your most-clicked links — click a row to focus its analytics."
                      />
                      <Card
                        icon={<LuLink className="w-3.5 h-3.5" />}
                        right={
                          <span className="text-[11px] text-[#71717A]">
                            <span className="hidden lg:inline">Click a row to focus it · click headers to sort</span>
                            <span className="lg:hidden">Tap a card to focus it</span>
                          </span>
                        }
                      >
                        
                        <div className="hidden lg:block -mx-5 overflow-x-auto max-h-96 sm:max-h-120 overflow-y-auto overscroll-contain">
                          <table className="w-full text-sm">
                            <thead>
                              <tr className="border-b border-[#D4D4D8] divide-x divide-[#E5E5EA] text-left">
                                <th className="hidden lg:table-cell px-3 py-3 text-[11px] font-semibold uppercase tracking-[0.12em] text-[#0A0A0A] sticky top-0 z-10 bg-white">
                                  S. No
                                </th>
                                <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.12em] text-[#0A0A0A] sticky top-0 z-10 bg-white">
                                  Short URL
                                </th>
                                {[
                                  { key: "status", label: "Status" },
                                  { key: "clicks", label: "Clicks" },
                                  { key: "unique", label: "Unique" },
                                  { key: "countries", label: "Countries" },
                                  { key: "ctr", label: "Visitor ratio" },
                                  { key: "modified", label: "Modified" },
                                  { key: "last", label: "Last click" },
                                ].map((col) => {
                                  const active = sortField === col.key;
                                  return (
                                  <th
                                    key={col.key}
                                    onClick={() => toggleSort(col.key)}
                                    onKeyDown={(e) => {
                                      if (e.key === "Enter" || e.key === " ") {
                                        e.preventDefault();
                                        toggleSort(col.key);
                                      }
                                    }}
                                    aria-sort={
                                      active
                                        ? sortDir === "desc"
                                          ? "descending"
                                          : "ascending"
                                        : "none"
                                    }
                                    tabIndex={0}
                                    className={`px-3 py-3 text-[11px] font-semibold uppercase tracking-[0.12em] whitespace-nowrap cursor-pointer select-none transition-colors hover:text-[#0A0A0A] sticky top-0 z-10 bg-white text-[#0A0A0A] focus-visible:ring-[3px] focus-visible:ring-[#6366F1]/20 focus-visible:outline-none ${
                                      active ? "text-[#0A0A0A]" : ""
                                    }`}
                                  >
                                    {col.label}
                                    {active && (
                                      <span className="ml-1 text-[#6366F1] inline-flex items-center">
                                        {sortDir === "desc" ? (
                                          <LuArrowDown className="w-3 h-3" />
                                        ) : (
                                          <LuArrowUp className="w-3 h-3" />
                                        )}
                                      </span>
                                    )}
                                  </th>
                                  );
                                })}
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-[#E5E5EA]">
                              {topLinks.length === 0 && (
                                <tr>
                                  <td colSpan={9} className="px-5 py-10 text-center text-[#71717A] text-sm">
                                    {links.length === 0
                                      ? "You haven't created any links yet — create one on the dashboard to start tracking clicks."
                                      : "No links received clicks in this period."}
                                  </td>
                                </tr>
                              )}
                              {topLinks.map((l, index) => (
                                <tr
                                  key={l.id}
                                  onClick={() => focusLink(l.id)}
                                  onKeyDown={(e) => {
                                    if (e.key === "Enter" || e.key === " ") {
                                      e.preventDefault();
                                      focusLink(l.id);
                                    }
                                  }}
                                  tabIndex={0}
                                  role="button"
                                  aria-label={`View analytics for ${l.short_code}`}
                                  title={`View analytics for ${l.short_code}`}
                                  className="divide-x divide-[#E5E5EA] hover:bg-[#F6F6F9] transition-colors cursor-pointer focus-visible:bg-[#F6F6F9] focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[#6366F1]/20 focus-visible:ring-inset"
                                >
                                  <td className="hidden lg:table-cell px-3 py-3 text-[11px] text-[#71717A] tabular-nums">
                                    {index + 1}
                                  </td>
                                  <td className="px-4 py-3 min-w-0">
                                    <span className="block font-mono text-xs font-medium text-[#0A0A0A] truncate">
                                      {l.short_code}
                                    </span>
                                    {l.original_url && (
                                      <span className="block text-[10px] text-[#71717A] truncate max-w-[14rem]" title={l.original_url}>
                                        {l.original_url}
                                      </span>
                                    )}
                                  </td>
                                  <td className="px-3 py-3">
                                    <Chip status={l.status}>
                                      {l.status === "active" ? "Active" : "Disabled"}
                                    </Chip>
                                  </td>
                                  <td className="px-3 py-3 text-[#0A0A0A] tabular-nums font-medium">
                                    {l.clicks.toLocaleString()}
                                  </td>
                                  <td className="px-3 py-3 text-[#6B6B6B] tabular-nums">
                                    {(l.unique ?? 0).toLocaleString()}
                                  </td>
                                  <td className="px-3 py-3 text-[#6B6B6B] tabular-nums">
                                    {(l.countries ?? 0).toLocaleString()}
                                  </td>
                                  <td className="px-3 py-3 text-[#6B6B6B] tabular-nums">{(l.ctr ?? 0)}%</td>
                                  <td className="hidden lg:table-cell px-3 py-3 text-[#6B6B6B] whitespace-nowrap">
                                    {formatDateTime(l.updated_at)}
                                  </td>
                                  <td className="px-3 py-3 text-[#6B6B6B] whitespace-nowrap">
                                    {formatDateTime(l.last_click_at)}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>

                        
                        <div className="flex flex-col gap-3 lg:hidden max-h-96 sm:max-h-120 overflow-y-auto overscroll-contain">
                          {topLinks.length === 0 && (
                            <p className="py-8 text-center text-[#71717A] text-sm">
                              {links.length === 0
                                ? "You haven't created any links yet — create one on the dashboard to start tracking clicks."
                                : "No links received clicks in this period."}
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
                                      className="text-[11px] text-[#71717A] truncate hover:text-[#6366F1] transition-colors"
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
                                <span className="flex items-center gap-1 text-[11px] font-medium text-[#71717A] uppercase tracking-wider">
                                  <LuZap className="w-3 h-3" />
                                  clicks
                                </span>
                              </div>

                              <div className="flex items-center gap-1.5 text-[11px] text-[#71717A]">
                                <LuClock className="w-3 h-3 shrink-0" />
                                Last click {formatDate(l.last_click_at)}
                              </div>

                              <div className="grid grid-cols-3 gap-3 pt-3 border-t border-[#E5E5EA]">
                                <span className="flex items-center gap-1.5 text-[11px] text-[#71717A] min-w-0">
                                  <LuHouse className="w-3 h-3 shrink-0 text-[#71717A]" />
                                  <span className="tabular-nums font-medium text-[#6B6B6B]">{(l.ctr ?? 0)}%</span>
                                  Visitor ratio
                                </span>
                                <span className="flex items-center gap-1.5 text-[11px] text-[#71717A] min-w-0">
                                  <LuUsers className="w-3 h-3 shrink-0 text-[#71717A]" />
                                  <span className="tabular-nums font-medium text-[#6B6B6B]">{(l.unique ?? 0).toLocaleString()}</span>
                                  Unique
                                </span>
                                <span className="flex items-center gap-1.5 text-[11px] text-[#71717A] min-w-0">
                                  <LuGlobe className="w-3 h-3 shrink-0 text-[#71717A]" />
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
                    <section id="timeline" className="flex flex-col gap-5">
                      <SectionHeading
                        name="clock"
                        title="Click feed"
                        subtitle="Every click as it happens — pick a day to zoom in."
                      />
                      <ClickTimeline
                        timeline={timelineReady ? a?.timeline ?? [] : []}
                        dayCounts={a?.clicksOverTime ?? []}
                        selectedDay={selectedDay}
                        onSelectDay={setSelectedDay}
                        limit={timelineLimit}
                        onLoadMore={() => setTimelineLimit((l) => Math.min(l + 25, 500))}
                        totalClicks={summary.clicks}
                        isLoading={!timelineReady}
                        isFetching={isFetching}
                        search={timelineSearch}
                        onSearchChange={setTimelineSearch}
                        onFocusLink={(id) => focusLink(id)}
                      />
                    </section>
                  )}
                </>
              )}
            </motion.div>
          )}
        </div>
      </main>
    </motion.div>
  );
};

export default Analytics;
