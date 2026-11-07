import { useEffect, useMemo, useState, lazy, Suspense } from "react";
import { Link, useSearchParams } from "react-router";
import { useQuery } from "@tanstack/react-query";
import {
  LuArrowUpRight,
  LuClock,
  LuCpu,
  LuDownload,
  LuGlobe,
  LuGauge,
  LuLink,
  LuMonitor,
  LuRotateCw,
  LuSlidersHorizontal,
  LuX,
} from "react-icons/lu";
import { getAnalytics } from "../api/analytics";
import { getAllLinks } from "../api/links";
import { BarChart, DonutBreakdown } from "../components/analytics/charts";
import CountryFlag from "../components/analytics/CountryFlag";
import ClickTimeline from "../components/analytics/ClickTimeline";
import {
  BrowserIcon,
  DeviceIcon,
  OsIcon,
} from "../components/analytics/DeviceIcons";
import SearchableSelect from "../components/ui/SearchableSelect";
import { countryNameFromCode } from "../utils/countryCodes";
import { formatDate, formatDateTime, formatShort } from "../utils/format";
import { DEVICE_OPTIONS } from "../utils/timeline";
import { useAnalyticsFilters } from "../hooks/useAnalyticsFilters";
import {
  exportTopLinksCsv,
  exportCountriesCsv,
  exportTimelineCsv,
} from "../utils/exportCsv";
import { POLL_INTERVAL_MS, REFETCH_ON_WINDOW_FOCUS } from "../config/polling";

const WorldMapChart = lazy(() => import("../components/analytics/WorldMap"));

const SECTIONS = [
  { id: "overview", label: "Overview", icon: LuGauge },
  { id: "geography", label: "Geography", icon: LuGlobe },
  { id: "technology", label: "Technology", icon: LuCpu },
  { id: "links", label: "Links", icon: LuLink },
  { id: "timeline", label: "Click feed", icon: LuClock },
];

const RANGES = [
  { key: "7d", label: "7d" },
  { key: "30d", label: "30d" },
  { key: "90d", label: "90d" },
  { key: "custom", label: "Custom" },
];

const sorters = {
  clicks: (a, b) => (a.clicks ?? 0) - (b.clicks ?? 0),
  unique: (a, b) => (a.unique ?? 0) - (b.unique ?? 0),
  countries: (a, b) => (a.countries ?? 0) - (b.countries ?? 0),
  ctr: (a, b) => (a.ctr ?? 0) - (b.ctr ?? 0),
  status: (a, b) => (a.status ?? "").localeCompare(b.status ?? ""),
  last: (a, b) =>
    new Date(a.last_click_at || 0) - new Date(b.last_click_at || 0),
};

const fillGaps = (data, from, to) => {
  const DAY = 24 * 60 * 60 * 1000;
  const map = new Map((data ?? []).map((row) => [row.date, row]));
  const pad2 = (n) => String(n).padStart(2, "0");
  const iso = (t) => {
    const d = new Date(t);
    return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
  };
  const toLocal = (value) => {
    const [y, m, d] = value.split("-").map(Number);
    return new Date(y, m - 1, d);
  };
  const start = toLocal(from).getTime();
  const end = toLocal(to).getTime();
  const collect = (t) => {
    const key = iso(new Date(t));
    return {
      label: key.slice(5),
      value: map.get(key)?.clicks ?? 0,
      visitors: map.get(key)?.visitors ?? 0,
    };
  };

  if (Math.round((end - start) / DAY) + 1 <= 92) {
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
    out.push({ label: iso(new Date(t)).slice(5), value: clicks, visitors });
  }
  return out;
};

const sliceSum = (list, start, end) =>
  list.slice(start, end).reduce((sum, point) => sum + (point.value ?? 0), 0);

const fmt = (value) => Number(value ?? 0).toLocaleString("en-US");

const Delta = ({ value }) => {
  if (value == null) {
    return (
      <span className="delta" data-tone="flat" title="No comparable period">
        —
      </span>
    );
  }
  const tone = Math.abs(value) < 0.05 ? "flat" : value > 0 ? "up" : "down";
  return (
    <span className="delta" data-tone={tone} title="Versus the previous period">
      {value > 0 ? "▲" : value < 0 ? "▼" : "·"} {Math.abs(value).toFixed(1)}%
    </span>
  );
};

const EmptyState = ({ title, body, action }) => (
  <div className="empty" role="status">
    <div className="empty-glyph">∅</div>
    <h2 className="empty-title">{title}</h2>
    <p className="empty-sub">{body}</p>
    {action && <div className="empty-actions">{action}</div>}
  </div>
);

const AnalyticsSkeleton = () => (
  <div style={{ display: "flex", flexDirection: "column", gap: 16 }} aria-busy="true">
    <div className="metric-grid">
      {[0, 1, 2, 3].map((i) => (
        <div className="metric" key={i}>
          <div className="skeleton" style={{ width: 70, height: 10 }} />
          <div className="skeleton" style={{ width: 100, height: 24 }} />
          <div className="skeleton" style={{ width: 120, height: 10 }} />
        </div>
      ))}
    </div>
    <div className="panel">
      <div className="panel-head">
        <div className="skeleton" style={{ width: 130, height: 12 }} />
      </div>
      <div className="panel-body">
        <div className="skeleton" style={{ height: 240, width: "100%" }} />
      </div>
    </div>
  </div>
);

const SortHeader = ({ label, field, sortField, sortDir, onSort, align }) => {
  const active = sortField === field;
  return (
    <th
      className={align === "right" ? "num" : undefined}
      aria-sort={
        active ? (sortDir === "desc" ? "descending" : "ascending") : "none"
      }
    >
      <button
        type="button"
        onClick={() => onSort(field)}
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 4,
          border: 0,
          background: "transparent",
          color: active ? "var(--ink-2)" : "inherit",
          font: "inherit",
          textTransform: "inherit",
          letterSpacing: "inherit",
          cursor: "pointer",
          padding: 0,
        }}
      >
        {label}
        <span className="g-tri" aria-hidden>
          {active ? (sortDir === "desc" ? "▼" : "▲") : ""}
        </span>
      </button>
    </th>
  );
};

const Analytics = () => {
  const [heroMetric, setHeroMetric] = useState("clicks");
  const [sortField, setSortField] = useState("clicks");
  const [sortDir, setSortDir] = useState("desc");
  const [selectedDay, setSelectedDay] = useState(null);
  const [timelineLimit, setTimelineLimit] = useState(25);
  const [timelineSearch, setTimelineSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const [searchParams, setSearchParams] = useSearchParams();
  const viewParam = searchParams.get("view");
  const [activeSection, setActiveSection] = useState(
    SECTIONS.some((section) => section.id === viewParam) ? viewParam : "overview",
  );

  const changeSection = (id) => {
    setActiveSection(id);
    const next = new URLSearchParams(searchParams);
    if (id === "overview") next.delete("view");
    else next.set("view", id);
    setSearchParams(next, { replace: true });
  };

  const { data: linksData } = useQuery({
    queryKey: ["LINKS_INFO"],
    queryFn: getAllLinks,
    refetchInterval: POLL_INTERVAL_MS,
    refetchOnWindowFocus: REFETCH_ON_WINDOW_FOCUS,
  });
  const links = linksData?.data?.links ?? [];

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(timelineSearch), 350);
    return () => clearTimeout(timer);
  }, [timelineSearch]);

  const {
    range,
    setRange,
    customFrom,
    setCustomFrom,
    customTo,
    setCustomTo,
    linkId,
    setLinkId,
    country,
    setCountry,
    device,
    setDevice,
    from,
    to,
    params,
    hasFilters,
    activeFilterCount,
    clearFilters,
    activeChips,
    daysInRange,
  } = useAnalyticsFilters(
    links,
    null,
    activeSection,
    selectedDay,
    timelineLimit,
  );

  const paramsWithSearch = useMemo(() => {
    if (activeSection !== "timeline" || !debouncedSearch.trim()) return params;
    return { ...params, q: debouncedSearch.trim() };
  }, [params, activeSection, debouncedSearch]);

  const { data: analytics, isLoading, isError, refetch } = useQuery({
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
    () => fillGaps(a?.clicksOverTime, from, to),
    [a, from, to],
  );
  const visitorsSeries = useMemo(
    () => series.map((point) => ({ label: point.label, value: point.visitors })),
    [series],
  );

  const deltaWindow = Math.max(1, Math.min(7, Math.floor(daysInRange / 2)));

  const clicksDelta = useMemo(() => {
    if (series.length < deltaWindow * 2) return null;
    const prev = sliceSum(series, -deltaWindow * 2, -deltaWindow);
    if (prev <= 0) return null;
    return ((sliceSum(series, -deltaWindow) - prev) / prev) * 100;
  }, [series, deltaWindow]);

  const visitorsDelta = useMemo(() => {
    if (visitorsSeries.length < deltaWindow * 2) return null;
    const prev = sliceSum(visitorsSeries, -deltaWindow * 2, -deltaWindow);
    if (prev <= 0) return null;
    return ((sliceSum(visitorsSeries, -deltaWindow) - prev) / prev) * 100;
  }, [visitorsSeries, deltaWindow]);

  const toggleSort = (field) => {
    if (sortField === field) {
      setSortDir((dir) => (dir === "desc" ? "asc" : "desc"));
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
  const totalCountryClicks = topCountries.reduce(
    (sum, item) => sum + (item.clicks ?? 0),
    0,
  );
  const maxCountryClicks = Math.max(
    1,
    ...topCountries.map((item) => item.clicks ?? 0),
  );
  const topCountry = topCountries[0];

  const loading = isLoading;
  const sectionReady = a?.view === activeSection;
  const timelineReady =
    a?.view === "timeline" && a?.day === (selectedDay ?? null);
  const isEmpty = !loading && !isError && summary.clicks === 0 && !hasFilters;
  const noResults = !loading && !isError && summary.clicks === 0 && hasFilters;

  const resetKey = [range, customFrom, customTo, linkId, country, device].join("|");
  const [filterKey, setFilterKey] = useState(resetKey);
  if (filterKey !== resetKey) {
    setFilterKey(resetKey);
    if (selectedDay !== null) setSelectedDay(null);
    if (timelineLimit !== 25) setTimelineLimit(25);
  }

  const focusLink = (id) => {
    setLinkId(String(id));
    changeSection("overview");
  };

  const rangeLabel = `${formatShort(from)} – ${formatShort(to)} · ${daysInRange} days`;
  const heroSeries = heroMetric === "visitors" ? visitorsSeries : series;

  const exportCurrent = () => {
    if (activeSection === "links") exportTopLinksCsv(topLinks);
    else if (activeSection === "geography")
      exportCountriesCsv(topCountries, totalCountryClicks);
    else if (activeSection === "timeline") exportTimelineCsv(a?.timeline ?? []);
  };

  const showExport = ["links", "geography", "timeline"].includes(activeSection);

  return (
    <div className="page">
      <header className="page-head">
        <div>
          <div className="page-eyebrow">Click data</div>
          <h1 className="page-title">Analytics</h1>
          <p className="page-desc">
            {rangeLabel} ·{" "}
            {fLinkIdLabel(linkId, links) || "all links"}
            {activeFilterCount > 0
              ? ` · ${activeFilterCount} filter${activeFilterCount > 1 ? "s" : ""}`
              : ""}
          </p>
        </div>

        <div className="page-actions">
          <div className="segmented" role="group" aria-label="Date range">
            {RANGES.map((option) => (
              <button
                key={option.key}
                type="button"
                aria-pressed={range === option.key}
                onClick={() => setRange(option.key)}
              >
                {option.label}
              </button>
            ))}
          </div>
          {showExport && (
            <button
              type="button"
              className="ui-btn ui-btn--secondary ui-btn--sm"
              onClick={exportCurrent}
            >
              <LuDownload className="w-3.5 h-3.5" aria-hidden />
              Export CSV
            </button>
          )}
        </div>
      </header>

      <section className="panel" aria-label="Filters">
        <div className="panel-head">
          <LuSlidersHorizontal
            className="w-3.5 h-3.5"
            style={{ color: "var(--ink-4)" }}
            aria-hidden
          />
          <h2 className="panel-title">Filters</h2>
          {activeFilterCount > 0 && (
            <span className="badge">{activeFilterCount}</span>
          )}
          {hasFilters && (
            <button
              type="button"
              className="g-tab-clear"
              style={{ marginLeft: "auto" }}
              onClick={clearFilters}
            >
              Clear all
            </button>
          )}
        </div>
        <div className="panel-body">
          {range === "custom" && (
            <div
              className="toolbar"
              style={{ marginBottom: "var(--space-3)" }}
            >
              <label className="ui-field" style={{ maxWidth: 180 }}>
                <span className="ui-label">From</span>
                <input
                  type="date"
                  value={customFrom}
                  onChange={(event) => setCustomFrom(event.target.value)}
                  className="ui-input"
                />
              </label>
              <label className="ui-field" style={{ maxWidth: 180 }}>
                <span className="ui-label">To</span>
                <input
                  type="date"
                  value={customTo}
                  onChange={(event) => setCustomTo(event.target.value)}
                  className="ui-input"
                />
              </label>
            </div>
          )}

          <div className="g-filter-grid">
            <SearchableSelect
              label="Link"
              icon={<LuLink className="w-4 h-4" />}
              value={linkId}
              onChange={setLinkId}
              options={links.map((link) => ({
                value: String(link.id),
                label: link.short_code,
                hint: link.original_url || "Untitled link",
              }))}
              placeholder="All links"
              searchPlaceholder="Search links…"
              emptyText="No links match"
            />
            <SearchableSelect
              label="Country"
              icon={<LuGlobe className="w-4 h-4" />}
              value={country}
              onChange={setCountry}
              options={(a?.filters?.countries ?? []).map((code) => ({
                value: code,
                label: countryNameFromCode(code) || code,
              }))}
              placeholder="All countries"
              searchPlaceholder="Search countries…"
              emptyText="No countries match"
              renderLeading={(option) => (
                <CountryFlag code={option.value} className="w-4 h-3 shrink-0" />
              )}
            />
            <SearchableSelect
              label="Device"
              icon={<LuMonitor className="w-4 h-4" />}
              value={device}
              onChange={setDevice}
              options={DEVICE_OPTIONS.map((option) => ({
                value: option.value,
                label: option.label,
              }))}
              placeholder="All devices"
              searchPlaceholder="Search devices…"
              emptyText="No devices match"
            />
          </div>

          {activeChips.length > 0 && (
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: 6,
                marginTop: "var(--space-3)",
              }}
            >
              {activeChips.map((chip) => (
                <span key={chip.key} className="chip">
                  {chip.label}
                  <button
                    type="button"
                    onClick={chip.clear}
                    aria-label={`Remove ${chip.label}`}
                    style={{
                      border: 0,
                      background: "transparent",
                      color: "var(--ink-4)",
                      cursor: "pointer",
                      display: "grid",
                      placeItems: "center",
                      padding: 0,
                    }}
                  >
                    <LuX className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>
      </section>

      <div className="tabs" role="tablist" aria-label="Analytics sections">
        {SECTIONS.map((section) => {
          const Icon = section.icon;
          return (
            <button
              key={section.id}
              type="button"
              role="tab"
              aria-selected={activeSection === section.id}
              aria-current={activeSection === section.id ? "page" : undefined}
              className="tab"
              onClick={() => changeSection(section.id)}
            >
              <Icon className="w-3.5 h-3.5" aria-hidden />
              {section.label}
            </button>
          );
        })}
      </div>

      {loading && <AnalyticsSkeleton />}

      {!loading && isError && (
        <EmptyState
          title="Could not load analytics"
          body="The analytics request failed. Your links and clicks are unaffected."
          action={
            <button
              type="button"
              className="ui-btn ui-btn--secondary ui-btn--sm"
              onClick={() => refetch()}
            >
              <LuRotateCw className="w-3 h-3" aria-hidden />
              Try again
            </button>
          }
        />
      )}

      {isEmpty && (
        <EmptyState
          title="No clicks yet"
          body="Clicks appear here once your links start receiving traffic."
          action={
            <Link className="ui-btn ui-btn--sm" to="/links?create=1">
              Create a link
            </Link>
          }
        />
      )}

      {noResults && (
        <EmptyState
          title="No results for these filters"
          body="Adjust the range or clear the filters to see the full picture."
          action={
            <button
              type="button"
              className="ui-btn ui-btn--secondary ui-btn--sm"
              onClick={clearFilters}
            >
              Clear filters
            </button>
          }
        />
      )}

      {!loading && !isError && !isEmpty && !noResults && sectionReady && (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {activeSection === "overview" && (
            <>
              <div className="metric-grid">
                <div className="metric">
                  <span className="metric-label">Clicks</span>
                  <div className="metric-row">
                    <span className="metric-value">{fmt(summary.clicks)}</span>
                    <Delta value={clicksDelta} />
                  </div>
                  <span className="metric-meta">{rangeLabel}</span>
                </div>
                <div className="metric">
                  <span className="metric-label">Unique visitors</span>
                  <div className="metric-row">
                    <span className="metric-value">
                      {fmt(summary.uniqueClicks)}
                    </span>
                    <Delta value={visitorsDelta} />
                  </div>
                  <span className="metric-meta">
                    {summary.clicks > 0
                      ? `${((summary.uniqueClicks / summary.clicks) * 100).toFixed(1)}% of clicks`
                      : "No clicks in this period"}
                  </span>
                </div>
                <div className="metric">
                  <span className="metric-label">Clicks per day</span>
                  <div className="metric-row">
                    <span className="metric-value">
                      {(summary.clicks / daysInRange).toFixed(1)}
                    </span>
                  </div>
                  <span className="metric-meta">Across {daysInRange} days</span>
                </div>
                <div className="metric">
                  <span className="metric-label">Countries</span>
                  <div className="metric-row">
                    <span className="metric-value">
                      {fmt(topCountries.length)}
                    </span>
                  </div>
                  <span className="metric-meta">
                    {topCountry
                      ? `Top: ${countryNameFromCode(topCountry.country) || topCountry.country} ${Math.round((topCountry.clicks / Math.max(totalCountryClicks, 1)) * 100)}%`
                      : "No location data"}
                  </span>
                </div>
              </div>

              <section className="panel">
                <div className="panel-head">
                  <h2 className="panel-title">Traffic</h2>
                  <span className="panel-sub">
                    {heroMetric === "visitors"
                      ? "Unique visitors per day"
                      : "Clicks per day"}
                  </span>
                  <div
                    className="segmented"
                    style={{ marginLeft: "auto" }}
                    role="group"
                    aria-label="Traffic metric"
                  >
                    <button
                      type="button"
                      aria-pressed={heroMetric === "clicks"}
                      onClick={() => setHeroMetric("clicks")}
                    >
                      Clicks
                    </button>
                    <button
                      type="button"
                      aria-pressed={heroMetric === "visitors"}
                      onClick={() => setHeroMetric("visitors")}
                    >
                      Visitors
                    </button>
                  </div>
                </div>
                <div className="panel-body">
                  <BarChart
                    data={heroSeries}
                    height={260}
                    unit={heroMetric === "visitors" ? "visitors" : "clicks"}
                    showAxis
                  />
                </div>
              </section>
            </>
          )}

          {activeSection === "geography" && (
            <div className="split">
              <section className="panel">
                <div className="panel-head">
                  <h2 className="panel-title">Top countries</h2>
                  <span className="panel-sub">
                    {topCountries.length}{" "}
                    {topCountries.length === 1 ? "country" : "countries"}
                  </span>
                </div>
                <div className="panel-body" style={{ padding: 0 }}>
                  {topCountries.length === 0 && (
                    <p className="empty-sub" style={{ padding: 20 }}>
                      No country data in this period.
                    </p>
                  )}
                  {topCountries.map((item, index) => {
                    const pct =
                      totalCountryClicks > 0
                        ? Math.round((item.clicks / totalCountryClicks) * 100)
                        : 0;
                    return (
                      <div
                        key={item.country}
                        style={{
                          display: "grid",
                          gridTemplateColumns: "26px 1fr auto",
                          gap: 10,
                          alignItems: "center",
                          padding: "10px 16px",
                          borderTop: index ? "1px solid var(--line)" : 0,
                        }}
                      >
                        <span className="metric-meta">
                          {String(index + 1).padStart(2, "0")}
                        </span>
                        <div style={{ minWidth: 0 }}>
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 8,
                              fontSize: "var(--text-sm)",
                              color: "var(--ink-2)",
                            }}
                          >
                            <CountryFlag
                              code={item.country}
                              className="w-4 h-3 shrink-0"
                            />
                            <span
                              style={{
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                              }}
                            >
                              {countryNameFromCode(item.country) ||
                                item.country}
                            </span>
                          </div>
                          <div
                            style={{
                              height: 3,
                              marginTop: 6,
                              borderRadius: 2,
                              background: "var(--surface-3)",
                              overflow: "hidden",
                            }}
                          >
                            <div
                              style={{
                                width: `${Math.max((item.clicks / maxCountryClicks) * 100, 1)}%`,
                                height: "100%",
                                background: "var(--chart-1)",
                              }}
                            />
                          </div>
                        </div>
                        <span className="metric-meta" style={{ textAlign: "right" }}>
                          {fmt(item.clicks)}
                          <br />
                          {pct}%
                        </span>
                      </div>
                    );
                  })}
                </div>
              </section>

              <section className="panel">
                <div className="panel-head">
                  <h2 className="panel-title">World map</h2>
                  <span className="panel-sub">Clicks by location</span>
                </div>
                <div className="panel-body">
                  <Suspense
                    fallback={
                      <div
                        style={{
                          height: 320,
                          display: "grid",
                          placeItems: "center",
                          color: "var(--ink-4)",
                          fontSize: "var(--text-sm)",
                        }}
                      >
                        Loading map…
                      </div>
                    }
                  >
                    <WorldMapChart countries={topCountries} />
                  </Suspense>
                </div>
              </section>
            </div>
          )}

          {activeSection === "technology" && (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
                gap: 16,
              }}
            >
              <section className="panel">
                <div className="panel-head">
                  <h2 className="panel-title">Devices</h2>
                </div>
                <div className="panel-body">
                  <DonutBreakdown
                    data={a?.devices ?? []}
                    title="Devices"
                    icon={<LuMonitor className="w-4 h-4" />}
                    iconFor={(label) => (
                      <DeviceIcon type={label} className="w-3.5 h-3.5" />
                    )}
                    palette={["var(--chart-1)", "var(--chart-2)", "var(--chart-3)"]}
                  />
                </div>
              </section>
              <section className="panel">
                <div className="panel-head">
                  <h2 className="panel-title">Browsers</h2>
                </div>
                <div className="panel-body">
                  <DonutBreakdown
                    data={a?.browsers ?? []}
                    title="Browsers"
                    icon={<LuGlobe className="w-4 h-4" />}
                    iconFor={(label) => (
                      <BrowserIcon name={label} className="w-3.5 h-3.5" />
                    )}
                    palette={[
                      "var(--chart-1)",
                      "var(--chart-2)",
                      "var(--chart-3)",
                      "var(--chart-4)",
                    ]}
                  />
                </div>
              </section>
              <section className="panel">
                <div className="panel-head">
                  <h2 className="panel-title">Operating systems</h2>
                </div>
                <div className="panel-body">
                  <DonutBreakdown
                    data={a?.os ?? []}
                    title="Operating systems"
                    icon={<LuCpu className="w-4 h-4" />}
                    iconFor={(label) => (
                      <OsIcon name={label} className="w-3.5 h-3.5" />
                    )}
                    palette={[
                      "var(--chart-1)",
                      "var(--chart-2)",
                      "var(--chart-3)",
                      "var(--chart-4)",
                    ]}
                  />
                </div>
              </section>
            </div>
          )}

          {activeSection === "links" && (
            <section className="panel">
              <div className="panel-head">
                <h2 className="panel-title">Top links</h2>
                <span className="panel-sub">
                  Click a row to focus its analytics
                </span>
              </div>
              <div style={{ overflowX: "auto" }}>
                <table className="ui-table">
                  <thead>
                    <tr>
                      <th style={{ width: 42 }}>#</th>
                      <th>Link</th>
                      <SortHeader
                        label="Status"
                        field="status"
                        sortField={sortField}
                        sortDir={sortDir}
                        onSort={toggleSort}
                      />
                      <SortHeader
                        label="Clicks"
                        field="clicks"
                        sortField={sortField}
                        sortDir={sortDir}
                        onSort={toggleSort}
                        align="right"
                      />
                      <SortHeader
                        label="Visitors"
                        field="unique"
                        sortField={sortField}
                        sortDir={sortDir}
                        onSort={toggleSort}
                        align="right"
                      />
                      <SortHeader
                        label="Countries"
                        field="countries"
                        sortField={sortField}
                        sortDir={sortDir}
                        onSort={toggleSort}
                        align="right"
                      />
                      <th className="num">Last click</th>
                    </tr>
                  </thead>
                  <tbody>
                    {topLinks.length === 0 && (
                      <tr>
                        <td colSpan={7} style={{ textAlign: "center", padding: 24 }}>
                          <span className="empty-sub">
                            {links.length === 0
                              ? "No links yet — create one to start tracking."
                              : "No links received clicks in this period."}
                          </span>
                        </td>
                      </tr>
                    )}
                    {topLinks.map((link, index) => (
                      <tr
                        key={link.id}
                        tabIndex={0}
                        role="button"
                        aria-label={`View analytics for ${link.short_code}`}
                        style={{ cursor: "pointer" }}
                        onClick={() => focusLink(link.id)}
                        onKeyDown={(event) => {
                          if (event.key === "Enter" || event.key === " ") {
                            event.preventDefault();
                            focusLink(link.id);
                          }
                        }}
                      >
                        <td className="g-idx">{index + 1}</td>
                        <td>
                          <div className="ui-cell-primary">
                            <span className="ui-code">{link.short_code}</span>
                          </div>
                          {link.original_url && (
                            <div className="ui-cell-sub" title={link.original_url}>
                              {link.original_url}
                            </div>
                          )}
                        </td>
                        <td>
                          {link.status === "active" ? (
                            <span className="badge" data-tone="active">
                              Live
                            </span>
                          ) : (
                            <span className="badge" data-tone="paused">
                              Paused
                            </span>
                          )}
                        </td>
                        <td className="num">{fmt(link.clicks)}</td>
                        <td className="num">{fmt(link.unique)}</td>
                        <td className="num">{fmt(link.countries)}</td>
                        <td className="num" style={{ color: "var(--ink-3)" }}>
                          {formatDateTime(link.last_click_at)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {activeSection === "timeline" && (
            <section className="panel">
              <div className="panel-head">
                <h2 className="panel-title">Click feed</h2>
                <span className="panel-sub">
                  Every click as it happens — pick a day to zoom in
                </span>
              </div>
              <div className="panel-body">
                <ClickTimeline
                  timeline={timelineReady ? (a?.timeline ?? []) : []}
                  dayCounts={a?.clicksOverTime ?? []}
                  selectedDay={selectedDay}
                  onSelectDay={setSelectedDay}
                  limit={timelineLimit}
                  onLoadMore={() =>
                    setTimelineLimit((limit) => Math.min(limit + 25, 500))
                  }
                  totalClicks={summary.clicks}
                  isLoading={!timelineReady}
                  isFetching={false}
                  search={timelineSearch}
                  onSearchChange={setTimelineSearch}
                  onFocusLink={(id) => focusLink(id)}
                />
              </div>
            </section>
          )}

          <p className="metric-meta" style={{ display: "flex", gap: 6 }}>
            <LuArrowUpRight className="w-3 h-3" aria-hidden />
            Data refreshes every {Math.round(POLL_INTERVAL_MS / 1000)} seconds
            · time zone {Intl.DateTimeFormat().resolvedOptions().timeZone} ·{" "}
            {formatDate(to)}
          </p>
        </div>
      )}

      {!loading && !isError && !isEmpty && !noResults && !sectionReady && (
        <AnalyticsSkeleton />
      )}
    </div>
  );
};

function fLinkIdLabel(linkId, links) {
  if (!linkId) return "";
  const match = links.find((link) => link.id === Number(linkId));
  return match ? `link ${match.short_code}` : `link #${linkId}`;
}

export default Analytics;
