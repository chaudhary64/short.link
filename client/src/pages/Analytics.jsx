import { useState, useMemo, useEffect, useRef, lazy, Suspense } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import { useQuery } from "@tanstack/react-query";
import { getAnalytics } from "../api/analytics";
import { getAllLinks } from "../api/links";
import {
  BarChart,
  DonutBreakdown,
  Sparkline,
} from "../components/analytics/charts";
import CountryFlag from "../components/analytics/CountryFlag";
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
import { POLL_INTERVAL_MS, REFETCH_ON_WINDOW_FOCUS } from "../config/polling";
import { useAnalyticsFilters } from "../hooks/useAnalyticsFilters";
import SegmentedToggle from "../components/ui/SegmentedToggle";
import SearchableSelect from "../components/ui/SearchableSelect";
import { exportTopLinksCsv, exportCountriesCsv, exportTimelineCsv } from "../utils/exportCsv";
import {
  LuArrowRight,
  LuArrowUpRight,
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
    "Every link open in this period, including repeats.",
  visitors:
    "Unique people who clicked, counted once each via an anonymized fingerprint.",
  avgPerDay:
    "Total clicks divided by the number of days in the period.",
  ctr: "Share of clicks from unique visitors vs total clicks.",
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

function SectionHeading({ title, subtitle }) {
  return (
    <div className="g-sec-head">
      <h2 className="g-sec-title">
        <span className="g-sq g-sq-red" aria-hidden />
        {title}
      </h2>
      <p className="g-sec-sub">{subtitle}</p>
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
      <span className="g-sq g-sq-red" aria-hidden />
      <div className="h-3 bg-[#d6d2c7] w-24" />
    </div>
    <div className="g-panel">
      <div className="h-64 bg-[#e4e1d8] border border-dashed border-[#141414]/30" />
    </div>
  </div>
);

const StatusCell = ({ status }) => (
  <span className="inline-flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-[0.14em] whitespace-nowrap">
    <span className={`g-sq ${status === "active" ? "g-sq-red" : "g-sq-yellow"}`} aria-hidden />
    {status === "active" ? "ACTIVE" : "PAUSED"}
  </span>
);

const Analytics = () => {
  const [heroMetric, setHeroMetric] = useState("clicks");
  const [sortField, setSortField] = useState("clicks");
  const [sortDir, setSortDir] = useState("desc");
  const [activeSection, setActiveSection] = useState("overview");
  const [selectedDay, setSelectedDay] = useState(null);
  const [timelineLimit, setTimelineLimit] = useState(25);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const reduceMotion = useReducedMotion();
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
    refetchInterval: POLL_INTERVAL_MS,
    refetchOnWindowFocus: REFETCH_ON_WINDOW_FOCUS,
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
    staleTime: POLL_INTERVAL_MS,
    refetchInterval: POLL_INTERVAL_MS,
    refetchOnWindowFocus: REFETCH_ON_WINDOW_FOCUS,
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

  const sectionTab = (sec) => {
    const isActive = activeSection === sec.id;
    return (
      <button
        key={sec.id}
        type="button"
        onClick={() => setActiveSection(sec.id)}
        aria-pressed={isActive}
        className={`g-tab2 ${isActive ? "on" : ""}`}
      >
        <SectionIcon
          name={sec.icon}
          className={`w-3.5 h-3.5 shrink-0 ${isActive ? "text-white" : "text-[#8a8578]"}`}
        />
        {sec.label}
      </button>
    );
  };

  const desktopSectionRow = (
    <div className="flex flex-wrap items-center gap-2">
      <span className="g-kicker2 mr-1">Sections</span>
      {SECTIONS.map(sectionTab)}
    </div>
  );

  const mobileSectionGrid = (
    <div className="flex flex-col gap-2">
      <span className="g-kicker2">Sections</span>
      <div className="flex flex-wrap gap-2">
        {SECTIONS.map(sectionTab)}
      </div>
    </div>
  );

  return (
    <div className="g-page">
      <main className="flex w-full flex-1 flex-col gap-7 pt-8 pb-[60px]">
        <PageHeader
          kicker="ANALYTICS · CLICK DATA"
          title="Analytics"
          subtitle={dateRangeLabel}
        />

        <motion.div {...fade} transition={{ delay: 0.1, type: "spring", stiffness: 300, damping: 24 }}>
          <div className="g-filter-box">
            <div className="g-filter-head">
              <h2 className="g-filter-label">
                <LuSlidersHorizontal className="w-3.5 h-3.5" />
                Filters
                {fActiveFilterCount > 0 && (
                  <span className="g-filter-count">{fActiveFilterCount}</span>
                )}
              </h2>

              <div className="flex items-center gap-2">
                {(activeSection === "links" || activeSection === "geography" || activeSection === "timeline") && (
                  <button
                    type="button"
                    onClick={() => {
                      if (activeSection === "links") exportTopLinksCsv(topLinks);
                      else if (activeSection === "geography") exportCountriesCsv(topCountries, totalCountryClicks);
                      else if (activeSection === "timeline") exportTimelineCsv(a?.timeline ?? []);
                    }}
                    className="g-btn g-btn-line g-btn-sm"
                    title={`Export ${activeSection} as CSV`}
                  >
                    <LuDownload className="w-3 h-3" />
                    <span className="hidden sm:inline">Export</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => setFiltersOpen((o) => !o)}
                  className="g-btn g-btn-line g-btn-sm"
                  aria-expanded={filtersOpen}
                >
                  {filtersOpen ? (
                    <>
                      <LuChevronUp className="w-3 h-3" />
                      <span className="hidden sm:inline">Hide</span>
                    </>
                  ) : (
                    <>
                      <LuChevronDown className="w-3 h-3" />
                      <span className="hidden sm:inline">Filters</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            <AnimatePresence initial={false}>
              {filtersOpen && (
                <motion.div
                  initial={reduceMotion ? { opacity: 0 } : { height: 0, opacity: 0 }}
                  animate={reduceMotion ? { opacity: 1 } : { height: "auto", opacity: 1 }}
                  exit={reduceMotion ? { opacity: 0 } : { height: 0, opacity: 0 }}
                  transition={{ duration: reduceMotion ? 0.12 : 0.22, ease: "easeInOut" }}
                  className="overflow-hidden"
                >
                  <div className="flex flex-col gap-5 pt-8">
                    <div className="flex flex-col sm:flex-row sm:items-end gap-4 flex-wrap">
                      <div className="flex flex-col gap-1.5 shrink-0">
                        <span className="g-flabel">Range</span>
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

                      {fRange === "custom" && (
                        <div className="flex flex-col gap-1.5">
                          <span className="g-flabel">Custom dates</span>
                          <div className="flex items-center gap-2">
                            <div className="flex flex-col gap-1">
                              <span className="text-[10px] text-[#8a8578]">From</span>
                              <input
                                type="date"
                                value={fCustomFrom}
                                onChange={(e) => fSetCustomFrom(e.target.value)}
                                aria-label="Custom range start date"
                                className="g-select"
                              />
                            </div>
                            <LuArrowRight className="w-3.5 h-3.5 text-[#8a8578] shrink-0 mt-4" />
                            <div className="flex flex-col gap-1">
                              <span className="text-[10px] text-[#8a8578]">To</span>
                              <input
                                type="date"
                                value={fCustomTo}
                                onChange={(e) => fSetCustomTo(e.target.value)}
                                aria-label="Custom range end date"
                                className="g-select"
                              />
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="g-filter-grid">
                      <SearchableSelect
                        label="Link"
                        info="Focus analytics on a single link. Respects your other filters."
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
                        info="Focus analytics on a single country. Respects your other filters."
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
                      <SearchableSelect
                        label="Device"
                        icon={<LuMonitor className="w-4 h-4" />}
                        value={fDevice}
                        onChange={fSetDevice}
                        options={DEVICE_OPTIONS.map((d) => ({
                          value: d.value,
                          label: d.label,
                        }))}
                        placeholder="All devices"
                        searchPlaceholder="Search devices…"
                        emptyText="No devices match"
                      />
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        <div
          ref={pillBarRef}
          className={`hidden lg:block sticky top-14 z-30 bg-[#f5f3ee] border-b-2 border-[#141414] py-3 ${
            pillBarStuck ? "shadow-none" : ""
          }`}
        >
          {desktopSectionRow}
        </div>

        {pillBarFloating &&
          createPortal(
            <div
              className={`hidden lg:block fixed inset-x-0 top-14 z-30 bg-[#f5f3ee] border-b-2 border-[#141414] py-3 ${
                pillBarStuck ? "shadow-none" : ""
              }`}
            >
              {desktopSectionRow}
            </div>,
            document.body,
          )}

        <div className="flex flex-col gap-7">
          <div
            ref={mobileGridRef}
            className={`lg:hidden sticky top-14 z-30 bg-[#f5f3ee] border-b-2 border-[#141414] pt-3 pb-4 ${
              mobileGridStuck ? "shadow-none" : ""
            }`}
          >
            {mobileSectionGrid}
          </div>

          {mobileGridFloating &&
            createPortal(
              <div
                className={`lg:hidden fixed inset-x-0 top-14 z-30 bg-[#f5f3ee] border-b-2 border-[#141414] px-4 sm:px-6 pt-3 pb-4 ${
                  mobileGridStuck ? "shadow-none" : ""
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
                  className="g-chip"
                >
                  {c.label}
                  <button
                    type="button"
                    onClick={c.clear}
                    aria-label={`Clear ${c.label}`}
                    className="text-[#8a8578] hover:text-[#141414] transition-colors cursor-pointer"
                  >
                    <LuX className="w-3 h-3" />
                  </button>
                </span>
              ))}
              <button
                type="button"
                onClick={fClearFilters}
                className="g-tab-clear"
              >
                CLEAR ALL
              </button>
            </div>
          )}

          {loading && <AnalyticsSkeleton />}

          {!loading && isError && (
            <div className="g-empty">
              <div className="g-empty-glyph">!</div>
              <h2 className="g-empty-title">Failed to load analytics</h2>
              <p className="g-empty-sub">
                Something went wrong while fetching your analytics.
              </p>
              <button className="g-btn g-btn-sm" onClick={() => refetch()}>
                Try Again
              </button>
            </div>
          )}

          {isEmpty && (
            <div className="g-empty">
              <div className="g-empty-glyph">∅</div>
              <h2 className="g-empty-title">No clicks yet</h2>
              <p className="g-empty-sub">
                Clicks will appear here once your links start getting traffic.
              </p>
              <Link to="/dashboard" className="g-btn g-btn-sm">
                Create your first link
              </Link>
            </div>
          )}

          {noResults && (
            <div className="g-empty">
              <div className="g-empty-glyph">∅</div>
              <h2 className="g-empty-title">No results for these filters</h2>
              <p className="g-empty-sub">
                Try adjusting your filters or selecting a different date range.
              </p>
              <button className="g-btn g-btn-sm" onClick={fClearFilters}>
                Clear Filters
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
              className="flex flex-col gap-7"
            >
              {!sectionReady ? (
                <SectionLoader />
              ) : (
                <>
                  {activeSection === "overview" && (
                    <section id="overview" className="flex flex-col gap-7">
                      <SectionHeading
                        name="gauge"
                        title="Overview"
                        subtitle="Key metrics for the selected period — hover any card for a quick definition."
                      />

                      <div className="g-cells">
                        <StatCard
                          title="Total clicks"
                          value={clicksDisplay.toLocaleString()}
                          description={`${formatShort(fFrom)} – ${formatShort(fTo)}`}
                          delta={clicksDelta}
                          spark={<Sparkline data={series} />}
                          sparkMax={maxClicksInSeries}
                          info={METRIC_DEFS.clicks}
                        />
                        <StatCard
                          title="Unique visitors"
                          value={visitorsDisplay.toLocaleString()}
                          description={`Distinct visitors · vs previous ${deltaWindow}d`}
                          delta={visitorsDelta}
                          spark={<Sparkline data={visitorsSeries} />}
                          sparkMax={maxVisitorsInSeries}
                          info={METRIC_DEFS.visitors}
                        />
                        <StatCard
                          title="Avg. clicks / day"
                          value={avgPerDayDisplay.toFixed(1)}
                          description={`Across ${fDaysInRange} days`}
                          info={METRIC_DEFS.avgPerDay}
                        />
                        <StatCard
                          title="Visitor ratio"
                          value={summary.clicks > 0 ? `${ctrDisplay.toFixed(1)}%` : "—"}
                          description="Unique visitors ÷ total clicks"
                          delta={ctrDelta}
                          spark={<Sparkline data={ctrSeries} />}
                          info={METRIC_DEFS.ctr}
                        />
                      </div>

                      <div className="flex flex-col gap-5 pt-2">
                        <SectionHeading
                          name="clicks"
                          title="Traffic"
                          subtitle="Clicks and visitors over time."
                        />
                        <Card
                          icon={
                            <LuMousePointerClick className="w-3.5 h-3.5" />
                          }
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
                    <section id="geography" className="flex flex-col gap-7">
                      <SectionHeading
                        name="globe"
                        title="Geography"
                        subtitle="Where your visitors are located, ranked by clicks."
                      />
                      <div className="flex flex-col gap-7">
                        <Card
                          title="Top countries"
                          icon={
                            <LuGlobe className="w-3.5 h-3.5" />
                          }
                          right={
                            <span className="text-[11px] text-[#8a8578] tabular-nums">
                              {countryCount} {countryCount === 1 ? "COUNTRY" : "COUNTRIES"}
                            </span>
                          }
                        >
                          <p className="text-xs text-[#8a8578] leading-relaxed mb-4">
                            Each click is attributed to the country your visitor was in
                            when they opened your link, detected from their location at
                            click time.
                          </p>
                          <div className="g-hairline flex flex-col max-h-72 overflow-y-auto overscroll-contain">
                            {topCountries.map((c, i) => {
                              const clicks = c.clicks ?? 0;
                              const pct =
                                totalCountryClicks > 0
                                  ? Math.round((clicks / totalCountryClicks) * 100)
                                  : 0;
                              return (
                                <div key={c.country} className="g-row">
                                  <span className="w-5 text-[11px] font-mono font-medium g-muted tabular-nums shrink-0">
                                    {String(i + 1).padStart(2, "0")}
                                  </span>
                                  <span className="w-10 h-7 border border-current bg-current/10 overflow-hidden shrink-0 flex items-center justify-center">
                                    <CountryFlag code={c.country} className="w-7 h-5" />
                                  </span>
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between gap-2 mb-1">
                                      <span className="text-xs font-medium truncate">
                                        {countryNameFromCode(c.country) || c.country}
                                      </span>
                                      <span className="text-[11px] g-muted tabular-nums shrink-0">
                                        {clicks.toLocaleString()}
                                        <span className="ml-1 g-muted">· {pct}%</span>
                                      </span>
                                    </div>
                                    <div className="h-1 bg-current/10">
                                      <motion.div
                                        initial={{ width: 0 }}
                                        whileInView={{ width: `${(clicks / maxCountryClicks) * 100}%` }}
                                        viewport={{ once: true }}
                                        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                                        className={`g-bar h-full ${i === 0 ? "on" : ""}`}
                                      />
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                            {!countryCount && (
                              <p className="text-xs text-[#8a8578] py-4 text-center">No country data yet</p>
                            )}
                          </div>
                        </Card>

                        <Card title="World map">
                          <div className="flex flex-wrap items-center gap-x-8 gap-y-2 mb-4">
                            <div>
                              <p className="g-kicker2">Countries</p>
                              <p className="text-xl font-extrabold text-[#141414] tabular-nums tracking-[-0.03em]">
                                {countriesDisplay}
                              </p>
                            </div>
                            <div>
                              <p className="g-kicker2">Clicks</p>
                              <p className="text-xl font-extrabold text-[#141414] tabular-nums tracking-[-0.03em]">
                                {geoClicksDisplay.toLocaleString()}
                              </p>
                            </div>
                            {topCountry && (
                              <div>
                                <p className="g-kicker2">Top country</p>
                                <span className="g-chip mt-1">
                                  <CountryFlag code={topCountry.country} className="w-4 h-3" />
                                  <span className="font-bold text-[#141414]">
                                    {countryNameFromCode(topCountry.country) || topCountry.country}
                                  </span>
                                  <span className="text-[11px] font-normal text-[#8a8578]">
                                    {totalCountryClicks > 0
                                      ? Math.round(((topCountry.clicks ?? 0) / totalCountryClicks) * 100)
                                      : 0}
                                    %
                                  </span>
                                </span>
                              </div>
                            )}
                          </div>
                          <Suspense
                            fallback={
                              <div className="flex h-[340px] items-center justify-center text-xs text-[#8a8578] sm:h-[400px]">
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
                    <section id="technology" className="flex flex-col gap-7">
                      <SectionHeading
                        name="cpu"
                        title="Technology"
                        subtitle="The devices, browsers, and operating systems your visitors use."
                      />
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                        <Card title="Devices" icon={<LuMonitor className="w-3.5 h-3.5" />}>
                          <DonutBreakdown
                            data={a?.devices ?? []}
                            title="Devices"
                            icon={<LuMonitor className="w-4 h-4" />}
                            iconFor={(label) => <DeviceIcon type={label} className="w-3.5 h-3.5" />}
                            palette={["#141414", "#d62828", "#1d4ed8"]}
                          />
                        </Card>
                        <Card title="Browsers" icon={<LuGlobe className="w-3.5 h-3.5" />}>
                          <DonutBreakdown
                            data={a?.browsers ?? []}
                            title="Browsers"
                            icon={<LuGlobe className="w-4 h-4" />}
                            iconFor={(label) => <BrowserIcon name={label} className="w-3.5 h-3.5" />}
                            palette={["#141414", "#1d4ed8", "#d62828", "#1e7d4f", "#eab308"]}
                          />
                        </Card>
                        <Card title="Operating systems" icon={<LuCpu className="w-3.5 h-3.5" />}>
                          <DonutBreakdown
                            data={a?.os ?? []}
                            title="Operating systems"
                            icon={<LuCpu className="w-4 h-4" />}
                            iconFor={(label) => <OsIcon name={label} className="w-3.5 h-3.5" />}
                            palette={["#141414", "#1d4ed8", "#8a8578", "#d62828", "#eab308"]}
                          />
                        </Card>
                      </div>
                    </section>
                  )}

                  {activeSection === "links" && (
                    <section id="links" className="flex flex-col gap-7">
                      <SectionHeading
                        name="link"
                        title="Top links"
                        subtitle="Your most-clicked links — click a row to focus its analytics."
                      />
                      <Card
                        icon={
                          <LuLink className="w-3.5 h-3.5" />
                        }
                        right={
                          <span className="text-[11px] text-[#8a8578]">
                            <span className="hidden lg:inline">Click a row to focus it · click headers to sort</span>
                            <span className="lg:hidden">Tap a card to focus it</span>
                          </span>
                        }
                      >
                        <div className="hidden lg:block -mx-5 overflow-x-auto max-h-96 sm:max-h-120 overflow-y-auto overscroll-contain">
                          <table className="g-table">
                            <thead>
                              <tr>
                                <th className="g-idx g-center">S. No</th>
                                <th>Short URL</th>
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
                                      className={`g-sort whitespace-nowrap ${col.key === "clicks" ? "g-right" : ""} ${
                                        col.key === "unique" || col.key === "countries" ? "g-right" : ""
                                      } ${col.key === "ctr" ? "g-right" : ""}`}
                                    >
                                      {col.label}
                                      {active && (
                                        <span className="g-tri">
                                          {sortDir === "desc" ? "▼" : "▲"}
                                        </span>
                                      )}
                                    </th>
                                  );
                                })}
                              </tr>
                            </thead>
                            <tbody>
                              {topLinks.length === 0 && (
                                <tr>
                                  <td colSpan={9} className="px-5 py-10 text-center text-[#8a8578] text-sm">
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
                                >
                                  <td className="g-idx g-center g-tnum">{index + 1}</td>
                                  <td className="min-w-0">
                                    <span className="g-code block truncate">
                                      {l.short_code}
                                    </span>
                                    {l.original_url && (
                                      <span className="block text-[10px] text-[#8a8578] truncate max-w-[14rem]" title={l.original_url}>
                                        {l.original_url}
                                      </span>
                                    )}
                                  </td>
                                  <td>
                                    <StatusCell status={l.status} />
                                  </td>
                                  <td className="g-right g-tnum font-medium">{l.clicks.toLocaleString()}</td>
                                  <td className="g-right g-tnum text-[#8a8578]">
                                    {(l.unique ?? 0).toLocaleString()}
                                  </td>
                                  <td className="g-right g-tnum text-[#8a8578]">
                                    {(l.countries ?? 0).toLocaleString()}
                                  </td>
                                  <td className="g-right g-tnum text-[#8a8578]">{(l.ctr ?? 0)}%</td>
                                  <td className="hidden lg:table-cell g-tnum text-[#8a8578] whitespace-nowrap">
                                    {formatDateTime(l.updated_at)}
                                  </td>
                                  <td className="g-tnum text-[#8a8578] whitespace-nowrap">
                                    {formatDateTime(l.last_click_at)}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>

                        <div className="flex flex-col gap-3 lg:hidden max-h-96 sm:max-h-120 overflow-y-auto overscroll-contain">
                          {topLinks.length === 0 && (
                            <p className="py-8 text-center text-[#8a8578] text-sm">
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
                              className="g-mcard cursor-pointer"
                            >
                              <div className="flex items-start justify-between gap-2">
                                <div className="flex flex-col gap-1 min-w-0">
                                  <span className="g-code text-xs font-semibold truncate">
                                    {l.short_code}
                                  </span>
                                  {l.original_url && (
                                    <a
                                      href={l.original_url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      onClick={(e) => e.stopPropagation()}
                                      className="text-[11px] text-[#8a8578] truncate hover:text-[#1d4ed8] transition-colors"
                                    >
                                      {l.original_url}
                                    </a>
                                  )}
                                </div>
                                <StatusCell status={l.status} />
                              </div>

                              <div className="flex items-center gap-2">
                                <span className="text-2xl font-extrabold text-[#141414] tabular-nums leading-none tracking-[-0.03em]">
                                  {l.clicks.toLocaleString()}
                                </span>
                                <span className="flex items-center gap-1 text-[11px] font-medium text-[#8a8578] uppercase tracking-wider">
                                  <LuZap className="w-3 h-3" />
                                  clicks
                                </span>
                              </div>

                              <div className="flex items-center gap-1.5 text-[11px] text-[#8a8578]">
                                <LuClock className="w-3 h-3 shrink-0" />
                                Last click {formatDate(l.last_click_at)}
                              </div>

                              <div className="grid grid-cols-3 gap-3 pt-3 border-t border-[#141414]/30">
                                <span className="flex items-center gap-1.5 text-[11px] text-[#8a8578] min-w-0">
                                  <LuHouse className="w-3 h-3 shrink-0 text-[#8a8578]" />
                                  <span className="tabular-nums font-medium text-[#6B6B6B]">{(l.ctr ?? 0)}%</span>
                                  Visitor ratio
                                </span>
                                <span className="flex items-center gap-1.5 text-[11px] text-[#8a8578] min-w-0">
                                  <LuUsers className="w-3 h-3 shrink-0 text-[#8a8578]" />
                                  <span className="tabular-nums font-medium text-[#6B6B6B]">{(l.unique ?? 0).toLocaleString()}</span>
                                  Unique
                                </span>
                                <span className="flex items-center gap-1.5 text-[11px] text-[#8a8578] min-w-0">
                                  <LuGlobe className="w-3 h-3 shrink-0 text-[#8a8578]" />
                                  <span className="tabular-nums font-medium text-[#6B6B6B]">{(l.countries ?? 0).toLocaleString()}</span>
                                  Countries
                                </span>
                              </div>
                              <div className="flex items-center justify-between pt-1">
                                <span className="text-[11px] font-bold text-[#1d4ed8] uppercase tracking-wider">
                                  View analytics
                                </span>
                                <LuArrowUpRight className="w-3.5 h-3.5 text-[#1d4ed8]" />
                              </div>
                            </div>
                          ))}
                        </div>
                      </Card>
                    </section>
                  )}

                  {activeSection === "timeline" && (
                    <section id="timeline" className="flex flex-col gap-7">
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
    </div>
  );
};

export default Analytics;
