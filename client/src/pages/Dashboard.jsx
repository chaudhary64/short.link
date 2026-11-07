import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router";
import { useQuery } from "@tanstack/react-query";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  LuArrowUpRight,
  LuChartLine,
  LuLink2,
  LuPlus,
  LuRotateCw,
} from "react-icons/lu";
import { getAnalytics } from "../api/analytics";
import { getAllLinks } from "../api/links";
import { useAuthToken } from "../features/auth/useAuthActions";
import { countryNameFromCode } from "../utils/countryCodes";
import { POLL_INTERVAL_MS, REFETCH_ON_WINDOW_FOCUS } from "../config/polling";

const DAY = 24 * 60 * 60 * 1000;
const RANGES = [
  { key: "7d", label: "7d", days: 7 },
  { key: "30d", label: "30d", days: 30 },
  { key: "90d", label: "90d", days: 90 },
];

const pad = (n) => String(n).padStart(2, "0");
const iso = (date) =>
  `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
const fromIso = (value) => {
  const [y, m, d] = value.split("-").map(Number);
  return new Date(y, m - 1, d);
};

const fillSeries = (rows, from, to) => {
  const map = new Map((rows ?? []).map((row) => [row.date, row]));
  const out = [];
  for (let t = fromIso(from).getTime(); t <= fromIso(to).getTime(); t += DAY) {
    const key = iso(new Date(t));
    out.push({
      date: key,
      label: key.slice(5).replace("-", "/"),
      clicks: map.get(key)?.clicks ?? 0,
      visitors: map.get(key)?.visitors ?? 0,
    });
  }
  return out;
};

const pctChange = (current, previous) => {
  if (!previous) return null;
  return ((current - previous) / previous) * 100;
};

const fmt = (value) => Number(value ?? 0).toLocaleString("en-US");
const tz = () => Intl.DateTimeFormat().resolvedOptions().timeZone;

function Delta({ value }) {
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
}

function TrafficTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="g-chart-tip">
      <div style={{ fontWeight: 600, marginBottom: 2 }}>{label}</div>
      <div>{fmt(payload[0]?.value)} clicks</div>
    </div>
  );
}

const OverviewSkeleton = () => (
  <div className="page" aria-busy="true">
    <div className="page-head">
      <div style={{ display: "grid", gap: 8 }}>
        <div className="skeleton" style={{ width: 90, height: 10 }} />
        <div className="skeleton" style={{ width: 190, height: 26 }} />
      </div>
      <div className="skeleton" style={{ width: 160, height: 30 }} />
    </div>
    <div className="metric-grid">
      {[0, 1, 2, 3].map((i) => (
        <div className="metric" key={i}>
          <div className="skeleton" style={{ width: 72, height: 10 }} />
          <div className="skeleton" style={{ width: 110, height: 26 }} />
          <div className="skeleton" style={{ width: 130, height: 10 }} />
        </div>
      ))}
    </div>
    <div className="panel">
      <div className="panel-head">
        <div className="skeleton" style={{ width: 120, height: 12 }} />
      </div>
      <div className="panel-body">
        <div className="skeleton" style={{ width: "100%", height: 220 }} />
      </div>
    </div>
  </div>
);

const Dashboard = () => {
  const accessToken = useAuthToken();
  const navigate = useNavigate();
  const [rangeKey, setRangeKey] = useState("30d");
  const range = RANGES.find((r) => r.key === rangeKey) ?? RANGES[1];

  const { from, to, prevFrom, prevTo } = useMemo(() => {
    const end = new Date();
    const start = new Date(end.getTime() - (range.days - 1) * DAY);
    const previousEnd = new Date(start.getTime() - DAY);
    const previousStart = new Date(
      previousEnd.getTime() - (range.days - 1) * DAY,
    );
    return {
      from: iso(start),
      to: iso(end),
      prevFrom: iso(previousStart),
      prevTo: iso(previousEnd),
    };
  }, [range.days]);

  const linksQuery = useQuery({
    queryKey: ["LINKS_INFO"],
    queryFn: getAllLinks,
    enabled: !!accessToken,
    staleTime: POLL_INTERVAL_MS,
    refetchInterval: POLL_INTERVAL_MS,
    refetchOnWindowFocus: REFETCH_ON_WINDOW_FOCUS,
  });

  const currentQuery = useQuery({
    queryKey: ["OVERVIEW", from, to],
    queryFn: () =>
      getAnalytics({ from, to, tz: tz(), view: "geography" }),
    enabled: !!accessToken,
    staleTime: POLL_INTERVAL_MS,
    refetchInterval: POLL_INTERVAL_MS,
    refetchOnWindowFocus: REFETCH_ON_WINDOW_FOCUS,
  });

  const topLinksQuery = useQuery({
    queryKey: ["OVERVIEW_TOP_LINKS", from, to],
    queryFn: () => getAnalytics({ from, to, tz: tz(), view: "links" }),
    enabled: !!accessToken,
    staleTime: POLL_INTERVAL_MS,
    refetchOnWindowFocus: REFETCH_ON_WINDOW_FOCUS,
  });

  const previousQuery = useQuery({
    queryKey: ["OVERVIEW_PREV", prevFrom, prevTo],
    queryFn: () =>
      getAnalytics({ from: prevFrom, to: prevTo, tz: tz(), view: "overview" }),
    enabled: !!accessToken,
    staleTime: POLL_INTERVAL_MS,
    refetchOnWindowFocus: REFETCH_ON_WINDOW_FOCUS,
  });

  const links = linksQuery.data?.data?.links ?? [];
  const analytics = currentQuery.data?.data;
  const summary = analytics?.summary ?? { clicks: 0, uniqueClicks: 0 };
  const previous = previousQuery.data?.data?.summary;
  const topLinks = topLinksQuery.data?.data?.topLinks ?? [];
  const countries = analytics?.topCountries ?? [];

  const series = useMemo(
    () => fillSeries(analytics?.clicksOverTime, from, to),
    [analytics, from, to],
  );

  const totalCountryClicks = countries.reduce(
    (sum, country) => sum + (country.clicks ?? 0),
    0,
  );
  const activeCount = links.filter((link) => link.status === "active").length;
  const pausedCount = links.length - activeCount;
  const peak = series.reduce(
    (best, point) => (point.clicks > (best?.clicks ?? -1) ? point : best),
    null,
  );
  const clicksPerDay = summary.clicks / range.days;

  const isInitialLoading =
    linksQuery.isLoading || (currentQuery.isLoading && !analytics);
  const hasError = currentQuery.isError && !analytics;

  if (isInitialLoading) return <OverviewSkeleton />;

  const isEmpty = !linksQuery.isLoading && links.length === 0;

  return (
    <div className="page">
      <header className="page-head">
        <div>
          <div className="page-eyebrow">Workspace overview</div>
          <h1 className="page-title">Overview</h1>
          <p className="page-desc">
            {isEmpty
              ? "Create your first short link to start collecting traffic."
              : `Traffic across ${links.length} ${
                  links.length === 1 ? "link" : "links"
                } · last ${range.days} days`}
          </p>
        </div>
        <div className="page-actions">
          <div className="segmented" role="group" aria-label="Date range">
            {RANGES.map((option) => (
              <button
                key={option.key}
                type="button"
                aria-pressed={rangeKey === option.key}
                onClick={() => setRangeKey(option.key)}
              >
                {option.label}
              </button>
            ))}
          </div>
          <button
            type="button"
            className="ui-btn ui-btn--sm"
            onClick={() => navigate("/links?create=1")}
          >
            <LuPlus className="w-3.5 h-3.5" aria-hidden />
            New link
          </button>
        </div>
      </header>

      {hasError && (
        <div className="empty" role="alert">
          <div className="empty-glyph">!</div>
          <h2 className="empty-title">Could not load your overview</h2>
          <p className="empty-sub">
            The analytics request failed. Your links are unaffected.
          </p>
          <div className="empty-actions">
            <button
              type="button"
              className="ui-btn ui-btn--secondary ui-btn--sm"
              onClick={() => currentQuery.refetch()}
            >
              <LuRotateCw className="w-3 h-3" aria-hidden />
              Try again
            </button>
          </div>
        </div>
      )}

      {!hasError && isEmpty && (
        <div className="empty">
          <div className="empty-glyph">
            <LuLink2 className="w-4 h-4" aria-hidden />
          </div>
          <h2 className="empty-title">No links yet</h2>
          <p className="empty-sub">
            Shorten a destination and every click is attributed here by
            country, device and referrer. Nothing is pre-filled — this space
            stays empty until you have traffic.
          </p>
          <div className="empty-actions">
            <Link className="ui-btn ui-btn--sm" to="/links?create=1">
              <LuPlus className="w-3.5 h-3.5" aria-hidden />
              Create your first link
            </Link>
          </div>
        </div>
      )}

      {!hasError && !isEmpty && (
        <>
          <section className="metric-grid" aria-label="Key metrics">
            <div className="metric">
              <span className="metric-label">Clicks</span>
              <div className="metric-row">
                <span className="metric-value">{fmt(summary.clicks)}</span>
                <Delta value={pctChange(summary.clicks, previous?.clicks)} />
              </div>
              <span className="metric-meta">vs previous {range.days} days</span>
            </div>

            <div className="metric">
              <span className="metric-label">Unique visitors</span>
              <div className="metric-row">
                <span className="metric-value">
                  {fmt(summary.uniqueClicks)}
                </span>
                <Delta
                  value={pctChange(summary.uniqueClicks, previous?.uniqueClicks)}
                />
              </div>
              <span className="metric-meta">
                {summary.clicks > 0
                  ? `${Math.round(
                      (summary.uniqueClicks / summary.clicks) * 100,
                    )}% of clicks`
                  : "No clicks in this period"}
              </span>
            </div>

            <div className="metric">
              <span className="metric-label">Clicks per day</span>
              <div className="metric-row">
                <span className="metric-value">{clicksPerDay.toFixed(1)}</span>
              </div>
              <span className="metric-meta">
                {peak && peak.clicks > 0
                  ? `Peak ${fmt(peak.clicks)} on ${peak.label}`
                  : "No traffic yet"}
              </span>
            </div>

            <div className="metric">
              <span className="metric-label">Active links</span>
              <div className="metric-row">
                <span className="metric-value">
                  {activeCount}
                  <span
                    style={{
                      fontSize: "var(--text-md)",
                      color: "var(--ink-4)",
                      fontWeight: 500,
                    }}
                  >
                    /{links.length}
                  </span>
                </span>
              </div>
              <span className="metric-meta">
                {pausedCount === 0
                  ? "All links live"
                  : `${pausedCount} paused`}
              </span>
            </div>
          </section>

          <section className="panel" aria-label="Clicks over time">
            <div className="panel-head">
              <div>
                <h2 className="panel-title">Clicks over time</h2>
                <p className="panel-sub">Daily total, all links</p>
              </div>
              <Link className="panel-link" to="/analytics">
                Full analytics
                <LuArrowUpRight className="w-3.5 h-3.5" aria-hidden />
              </Link>
            </div>
            <div className="panel-body" style={{ paddingTop: 12 }}>
              <div style={{ height: 236 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={series}
                    margin={{ top: 4, right: 8, left: -18, bottom: 0 }}
                  >
                    <CartesianGrid
                      vertical={false}
                      stroke="var(--chart-grid)"
                      strokeDasharray="2 3"
                    />
                    <XAxis
                      dataKey="label"
                      tickLine={false}
                      axisLine={false}
                      minTickGap={28}
                      tick={{ fill: "var(--ink-4)", fontSize: 11 }}
                    />
                    <YAxis
                      tickLine={false}
                      axisLine={false}
                      width={44}
                      allowDecimals={false}
                      tick={{ fill: "var(--ink-4)", fontSize: 11 }}
                    />
                    <Tooltip
                      content={<TrafficTooltip />}
                      cursor={{ stroke: "var(--line-strong)" }}
                    />
                    <Area
                      type="monotone"
                      dataKey="clicks"
                      stroke="var(--chart-1)"
                      strokeWidth={1.75}
                      fill="var(--chart-1)"
                      fillOpacity={0.08}
                      activeDot={{ r: 3, strokeWidth: 2 }}
                      dot={false}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </section>

          <div className="split">
            <section className="panel" aria-label="Top links">
              <div className="panel-head">
                <h2 className="panel-title">Top links</h2>
                <span className="panel-sub">by clicks</span>
                <Link className="panel-link" to="/links">
                  All links
                  <LuArrowUpRight className="w-3.5 h-3.5" aria-hidden />
                </Link>
              </div>
              <div className="panel-body" style={{ padding: 0 }}>
                {topLinks.length === 0 ? (
                  <p
                    className="empty-sub"
                    style={{ padding: "var(--space-5)" }}
                  >
                    No link received clicks in this period.
                  </p>
                ) : (
                  topLinks.slice(0, 5).map((link) => {
                    const share =
                      summary.clicks > 0
                        ? (link.clicks / summary.clicks) * 100
                        : 0;
                    return (
                      <div
                        key={link.id}
                        style={{
                          display: "grid",
                          gridTemplateColumns: "1fr 64px",
                          gap: "var(--space-3)",
                          alignItems: "center",
                          padding: "var(--space-3) var(--space-4)",
                          borderTop: "1px solid var(--line)",
                        }}
                      >
                        <div style={{ minWidth: 0 }}>
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 8,
                            }}
                          >
                            <span className="ui-code">{link.short_code}</span>
                            {link.status === "disabled" && (
                              <span className="badge" data-tone="paused">
                                Paused
                              </span>
                            )}
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
                                width: `${Math.max(share, 1)}%`,
                                height: "100%",
                                background: "var(--chart-1)",
                              }}
                            />
                          </div>
                        </div>
                        <div style={{ textAlign: "right" }}>
                          <div
                            style={{
                              fontSize: "var(--text-base)",
                              fontVariantNumeric: "tabular-nums",
                              color: "var(--ink)",
                            }}
                          >
                            {fmt(link.clicks)}
                          </div>
                          <div className="metric-meta">{share.toFixed(0)}%</div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </section>

            <section className="panel" aria-label="Top countries">
              <div className="panel-head">
                <h2 className="panel-title">Where clicks come from</h2>
                <Link className="panel-link" to="/analytics?view=geography">
                  Map
                  <LuArrowUpRight className="w-3.5 h-3.5" aria-hidden />
                </Link>
              </div>
              <div className="panel-body" style={{ padding: 0 }}>
                {countries.length === 0 ? (
                  <p
                    className="empty-sub"
                    style={{ padding: "var(--space-5)" }}
                  >
                    No location data yet.
                  </p>
                ) : (
                  countries.slice(0, 5).map((country) => {
                    const pct =
                      totalCountryClicks > 0
                        ? (country.clicks / totalCountryClicks) * 100
                        : 0;
                    return (
                      <div
                        key={country.country}
                        style={{
                          display: "grid",
                          gridTemplateColumns: "1fr auto",
                          gap: "var(--space-2)",
                          padding: "10px var(--space-4)",
                          borderTop: "1px solid var(--line)",
                          alignItems: "center",
                        }}
                      >
                        <span
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 8,
                            minWidth: 0,
                            fontSize: "var(--text-sm)",
                            color: "var(--ink-2)",
                          }}
                        >
                          <span className="badge badge--plain">
                            {country.country}
                          </span>
                          <span
                            style={{
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {countryNameFromCode(country.country) ||
                              country.country}
                          </span>
                        </span>
                        <span className="metric-meta">
                          {fmt(country.clicks)} · {pct.toFixed(0)}%
                        </span>
                      </div>
                    );
                  })
                )}
              </div>
            </section>
          </div>

          {summary.clicks === 0 && (
            <div className="panel">
              <div className="panel-body" style={{ display: "flex", gap: 10 }}>
                <LuChartLine
                  className="w-4 h-4 shrink-0"
                  style={{ color: "var(--ink-4)", marginTop: 2 }}
                  aria-hidden
                />
                <p className="empty-sub" style={{ margin: 0 }}>
                  Your links exist but haven&apos;t received clicks in the last{" "}
                  {range.days} days. Sharing a link or opening its QR code will
                  populate this view — nothing here is simulated.
                </p>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Dashboard;
