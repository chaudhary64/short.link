import { useMemo, useState } from "react";
import { motion } from "motion/react";
import SectionHeading from "./SectionHeading";
import { AreaChart, DonutChart, BarMeter } from "../analytics/charts";
import { flagEmoji } from "../../utils/format";
import { Link } from "react-router";
import Button from "../ui/Button";
import {
  LuArrowRight,
  LuCalendarDays,
  LuClock,
  LuMonitor,
  LuMousePointerClick,
  LuPercent,
  LuSmartphone,
  LuTablet,
  LuUsers,
} from "react-icons/lu";

const DAY = 24 * 60 * 60 * 1000;

const RANGES = [
  { key: "7d", label: "7d", days: 7, base: 118, growth: 0.4 },
  { key: "30d", label: "30d", days: 30, base: 126, growth: 0.9 },
  { key: "90d", label: "90d", days: 90, base: 121, growth: 1.6 },
];

const COUNTRY_PCT = [
  { country: "US", pct: 34 },
  { country: "IN", pct: 26 },
  { country: "GB", pct: 16 },
  { country: "DE", pct: 14 },
  { country: "BR", pct: 10 },
];

const DEVICES = [
  { label: "Desktop", pct: 58 },
  { label: "Mobile", pct: 33 },
  { label: "Tablet", pct: 9 },
];

const SHORT_CODES = ["launch", "guides", "sale", "github"];

const DeviceIcon = ({ type, className = "w-3.5 h-3.5" }) => {
  if (type === "mobile") return <LuSmartphone className={className} />;
  if (type === "tablet") return <LuTablet className={className} />;
  return <LuMonitor className={className} />;
};

// Deterministic demo series — no Math.random so the preview never jumps around.
function generateSeries({ days, base, growth }) {
  const out = [];
  const today = new Date();
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today.getTime() - i * DAY);
    const progress = (days - i) / days;
    const wave = Math.sin(i * 0.55 + days) * 22;
    const weekend = d.getDay() === 0 || d.getDay() === 6 ? 0.55 : 1;
    const value = Math.max(14, Math.round((base + wave + progress * growth * 70) * weekend));
    out.push({
      label: d.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      value,
    });
  }
  return out;
}

const timeAgo = (mins) => {
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
};

const Card = ({ title, right, children, className = "" }) => (
  <div className={`bg-white border border-[#D4D4D8] rounded-xl flex flex-col ${className}`}>
    <div className="flex items-center justify-between px-5 py-3 border-b border-[#D4D4D8]">
      <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#9C9C9C]">
        {title}
      </span>
      {right}
    </div>
    <div className="p-5 flex-1">{children}</div>
  </div>
);

const cardMotion = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-60px" },
};

const AnalyticsPreview = () => {
  const [rangeKey, setRangeKey] = useState("30d");
  const range = RANGES.find((r) => r.key === rangeKey);

  const series = useMemo(() => generateSeries(range), [range]);
  const totalClicks = useMemo(
    () => series.reduce((sum, s) => sum + s.value, 0),
    [series],
  );
  const uniqueClicks = Math.round(totalClicks * 0.68);

  const countries = COUNTRY_PCT.map((c) => ({
    country: c.country,
    clicks: Math.max(8, Math.round((c.pct / 100) * totalClicks)),
    pct: c.pct,
  }));
  const maxCountryClicks = countries[0].clicks;

  const devices = DEVICES.map((d) => ({
    label: d.label,
    value: Math.round((d.pct / 100) * uniqueClicks),
  }));

  const activity = useMemo(() => {
    const browsers = ["Chrome", "Safari", "Firefox", "Edge"];
    const countriesArr = COUNTRY_PCT.map((c) => c.country);
    return Array.from({ length: 5 }).map((_, i) => ({
      id: i,
      short_code: SHORT_CODES[i % SHORT_CODES.length],
      browser: browsers[i % browsers.length],
      device_type: ["desktop", "mobile", "desktop", "tablet", "mobile"][i],
      country: countriesArr[i % countriesArr.length],
      minsAgo: [2, 14, 38, 85, 200][i],
    }));
  }, []);

  const stats = [
    {
      label: "Total clicks",
      value: totalClicks.toLocaleString(),
      sub: `${range.days} days`,
      icon: <LuMousePointerClick className="w-5 h-5" />,
    },
    {
      label: "Unique clicks",
      value: uniqueClicks.toLocaleString(),
      sub: "Distinct visitors",
      icon: <LuUsers className="w-5 h-5" />,
    },
    {
      label: "Avg. clicks / day",
      value: (totalClicks / range.days).toFixed(0),
      sub: `Across ${range.days} days`,
      icon: <LuCalendarDays className="w-5 h-5" />,
    },
    {
      label: "Engagement",
      value: `${((uniqueClicks / totalClicks) * 100).toFixed(0)}%`,
      sub: "Unique ÷ clicks",
      icon: <LuPercent className="w-5 h-5" />,
    },
  ];

  return (
    <section className="relative">
      <div className="mx-auto px-6 py-20 sm:py-28">
        <SectionHeading
          eyebrow="Analytics"
          title="See every click, live."
          subtitle="This is the real analytics dashboard — try the date ranges and hover the charts. Click trends, countries, devices, and a live activity feed."
        />

        <motion.div
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="relative"
        >
          {/* Browser chrome */}
          <div className="bg-white border border-[#D4D4D8] rounded-xl overflow-hidden">
            {/* Address bar */}
            <div className="flex items-center gap-3 px-4 sm:px-5 py-3 border-b border-[#E5E5EA]">
              <div className="flex gap-1.5 shrink-0">
                <span className="w-2.5 h-2.5 rounded-full bg-[#D4D4D8]" />
                <span className="w-2.5 h-2.5 rounded-full bg-[#D4D4D8]" />
                <span className="w-2.5 h-2.5 rounded-full bg-[#D4D4D8]" />
              </div>
              <div className="flex-1 max-w-md mx-auto bg-[#F6F6F9] border border-[#D4D4D8] rounded-md px-3 py-1 text-[11px] font-mono text-[#6B6B6B] truncate">
                app.short.link/analytics
              </div>
              <span className="hidden sm:inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-[#10B981] shrink-0">
                <span className="w-1.5 h-1.5 bg-[#10B981] rounded-full animate-pulse" />
                Live demo
              </span>
            </div>

            {/* Analytics body */}
            <div className="p-4 sm:p-6 flex flex-col gap-5">
              {/* Stat cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                {stats.map((s) => (
                  <div
                    key={s.label}
                    className="bg-white border border-[#D4D4D8] rounded-xl p-4 flex flex-col justify-between transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)]"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#9C9C9C]">
                        {s.label}
                      </span>
                      <span className="w-8 h-8 bg-gray-50 text-[#0A0A0A] border border-[#D4D4D8] rounded-lg flex items-center justify-center shrink-0">
                        {s.icon}
                      </span>
                    </div>
                    <p className="text-xl sm:text-2xl font-display font-bold text-[#0A0A0A] tabular-nums tracking-[-0.03em] mt-2">
                      {s.value}
                    </p>
                    <p className="text-[11px] text-[#9C9C9C] mt-0.5">{s.sub}</p>
                  </div>
                ))}
              </div>

              {/* Charts row */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                <motion.div {...cardMotion} className="lg:col-span-2 flex">
                  <Card
                    title="Click trends"
                    right={
                      <div className="flex gap-1.5">
                        {RANGES.map((r) => (
                          <button
                            key={r.key}
                            onClick={() => setRangeKey(r.key)}
                            className={`px-2.5 py-0.5 text-[11px] font-medium rounded-full transition-all duration-150 cursor-pointer hover:-translate-y-px ${
                              rangeKey === r.key
                                ? "bg-[#6366F1] text-white"
                                : "bg-gray-100 text-[#6B6B6B] hover:bg-gray-200"
                            }`}
                          >
                            {r.label}
                          </button>
                        ))}
                      </div>
                    }
                  >
                    <div className="flex items-end justify-between mb-3">
                      <p className="text-2xl font-display font-bold text-[#0A0A0A] tabular-nums tracking-[-0.03em]">
                        {totalClicks.toLocaleString()}
                      </p>
                      <span className="text-[11px] text-[#9C9C9C]">
                        clicks · last {range.days} days
                      </span>
                    </div>
                    <AreaChart data={series} height={170} />
                  </Card>
                </motion.div>

                <motion.div {...cardMotion} transition={{ delay: 0.08, duration: 0.5, ease: [0.16, 1, 0.3, 1] }} className="flex">
                  <Card title="Devices" right={<span className="text-[11px] text-[#9C9C9C]">Unique</span>}>
                    <DonutChart data={devices} />
                  </Card>
                </motion.div>
              </div>

              {/* Bottom row */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                <motion.div {...cardMotion} transition={{ delay: 0.16, duration: 0.5, ease: [0.16, 1, 0.3, 1] }} className="lg:col-span-2 flex">
                  <Card title="Top countries">
                    <div className="flex flex-col gap-3">
                      {countries.map((c) => (
                        <BarMeter
                          key={c.country}
                          label={`${flagEmoji(c.country)} ${c.country}`}
                          value={c.clicks}
                          pct={(c.clicks / maxCountryClicks) * 100}
                        />
                      ))}
                    </div>
                  </Card>
                </motion.div>

                <motion.div {...cardMotion} transition={{ delay: 0.16, duration: 0.5, ease: [0.16, 1, 0.3, 1] }} className="flex">
                  <Card title="Recent activity" right={<span className="text-[11px] text-[#9C9C9C]">Live</span>}>
                    <div className="flex flex-col divide-y divide-[#E5E5EA]">
                      {activity.map((a) => (
                        <div key={a.id} className="flex items-center gap-2.5 py-2 first:pt-0 last:pb-0">
                          <span className="w-6 h-6 flex items-center justify-center text-sm shrink-0 bg-gray-50 border border-[#E5E5EA] rounded-full">
                            {flagEmoji(a.country)}
                          </span>
                          <div className="flex-1 min-w-0">
                            <p className="font-mono text-[11px] font-medium text-[#0A0A0A] truncate">
                              {a.short_code}
                            </p>
                            <p className="flex items-center gap-1 text-[10px] text-[#9C9C9C] capitalize min-w-0">
                              <DeviceIcon type={a.device_type} className="w-2.5 h-2.5" />
                              <span className="truncate">{a.browser}</span>
                            </p>
                          </div>
                          <span className="text-[10px] text-[#9C9C9C] shrink-0 tabular-nums">
                            {timeAgo(a.minsAgo)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </Card>
                </motion.div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* CTA under the demo */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-3"
        >
          <Button
            as={Link}
            to="/signup"
            variant="primary"
            size="large"
            className="w-full sm:w-auto px-8! group"
          >
            Start tracking for free
            <LuArrowRight className="w-4 h-4 ml-2 transition-transform duration-200 group-hover:translate-x-0.5" />
          </Button>
          <span className="flex items-center gap-1.5 text-xs text-[#9C9C9C]">
            <LuClock className="w-3.5 h-3.5" />
            No credit card · Free forever
          </span>
        </motion.div>
      </div>
    </section>
  );
};

export default AnalyticsPreview;
