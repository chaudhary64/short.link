import { motion } from "motion/react";
import SectionHeading from "./SectionHeading";

const Card = ({ title, right, children, className = "" }) => (
  <div className={`bg-white border border-[#E8E8EC] rounded-xl flex flex-col ${className}`}>
    <div className="flex items-center justify-between px-5 py-3 border-b border-[#E8E8EC]">
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

const countries = [
  { flag: "🇺🇸", name: "United States", pct: 38 },
  { flag: "🇮🇳", name: "India", pct: 27 },
  { flag: "🇬🇧", name: "United Kingdom", pct: 15 },
  { flag: "🇩🇪", name: "Germany", pct: 9 },
  { flag: "🇧🇷", name: "Brazil", pct: 6 },
];

const devices = [
  { label: "Desktop", pct: 68, color: "#6366F1" },
  { label: "Mobile", pct: 27, color: "#818CF8" },
  { label: "Tablet", pct: 5, color: "#A5B4FC" },
];

const recentActivity = [
  { text: "short.link/launch — 128 clicks today", time: "2m" },
  { text: "New link created: short.link/guides", time: "1h" },
  { text: "QR code downloaded for /github", time: "2h" },
  { text: "Link disabled: short.link/sale", time: "3h" },
];

const Donut = () => {
  const r = 30;
  const c = 2 * Math.PI * r;
  const segments = [
    { pct: 68, color: "#6366F1", offset: 0, label: "Desktop" },
    { pct: 27, color: "#818CF8", offset: 68, label: "Mobile" },
    { pct: 5, color: "#A5B4FC", offset: 95, label: "Tablet" },
  ];

  let acc = 0;
  const arcs = segments.map((s) => {
    const dash = (s.pct / 100) * c;
    const arc = (
      <circle
        key={s.label}
        cx="40"
        cy="40"
        r={r}
        fill="none"
        stroke={s.color}
        strokeWidth="9"
        strokeDasharray={`${dash} ${c - dash}`}
        strokeDashoffset={-acc * (c / 100)}
        transform="rotate(-90 40 40)"
        strokeLinecap="butt"
      />
    );
    acc += s.pct;
    return arc;
  });

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative w-44 h-44 md:w-32 md:h-32">
        <svg viewBox="0 0 80 80" className="w-full h-full">
          <circle cx="40" cy="40" r={r} fill="none" stroke="#F3F4F6" strokeWidth="9" />
          {arcs}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl md:text-lg font-display font-bold text-[#0A0A0A] tabular-nums tracking-[-0.03em]">
            2.4k
          </span>
          <span className="text-[11px] uppercase tracking-[0.12em] text-[#9C9C9C]">clicks</span>
        </div>
      </div>
      <div className="w-full flex flex-col gap-1.5">
        {devices.map((d) => (
          <div key={d.label} className="flex items-center justify-between text-xs">
            <span className="flex items-center gap-2 text-[#6B6B6B]">
              <span
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: d.color }}
              />
              {d.label}
            </span>
            <span className="text-[#9C9C9C] tabular-nums">{d.pct}%</span>
          </div>
        ))}
      </div>
    </div>
  );
};

const ClickTrendsChart = () => {
  const points = "M0,24 L12,22 L24,18 L36,20 L48,13 L60,15 L72,9 L84,11 L96,6 L100,6";
  const area = `${points} L100,32 L0,32 Z`;

  return (
    <div>
      <div className="flex items-end justify-between mb-3">
        <div>
          <p className="text-2xl font-display font-bold text-[#0A0A0A] tabular-nums tracking-[-0.03em]">
            2,418
          </p>
          <p className="text-[11px] text-[#9C9C9C]">clicks in the last 30 days</p>
        </div>
        <div className="flex gap-1.5">
          {["7d", "30d", "90d"].map((p, i) => (
            <span
              key={p}
              className={`px-3 py-1 text-[11px] font-medium rounded-full transition-colors duration-200 cursor-pointer ${
                i === 1
                  ? "bg-[#6366F1] text-white"
                  : "bg-gray-100 text-[#6B6B6B] hover:bg-gray-200"
              }`}
            >
              {p}
            </span>
          ))}
        </div>
      </div>

      <div className="relative h-32 sm:h-40">
        <svg viewBox="0 0 100 32" preserveAspectRatio="none" className="w-full h-full overflow-visible">
          <defs>
            <linearGradient id="trendFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#6366F1" stopOpacity="0.22" />
              <stop offset="100%" stopColor="#6366F1" stopOpacity="0" />
            </linearGradient>
          </defs>
          {[8, 16, 24].map((y) => (
            <line key={y} x1="0" y1={y} x2="100" y2={y} stroke="#F3F4F6" strokeWidth="0.3" />
          ))}
          <path d={area} fill="url(#trendFill)" />
          <path
            d={points}
            fill="none"
            stroke="#6366F1"
            strokeWidth="1.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            vectorEffect="non-scaling-stroke"
          />
        </svg>
        <span className="absolute right-0 top-[18.75%] w-2 h-2 bg-[#6366F1] rounded-full -translate-y-1/2 translate-x-1/2" />
      </div>

      <div className="flex justify-between mt-2">
        {["May 1", "May 8", "May 15", "May 22", "May 29"].map((d) => (
          <span key={d} className="text-[10px] text-[#9C9C9C]">
            {d}
          </span>
        ))}
      </div>
    </div>
  );
};

const AnalyticsPreview = () => {
  return (
    <section className="relative">
      <div className="mx-auto px-6 py-20 sm:py-28">
        <SectionHeading
          eyebrow="Analytics Preview"
          title="Understand every click."
          subtitle="Click trends, top countries, devices, and a live activity feed — the data you need to make your links work harder."
        />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Click trends */}
          <motion.div {...cardMotion} transition={{ delay: 0, duration: 0.5, ease: [0.16, 1, 0.3, 1] }} className="lg:col-span-2 flex">
            <Card title="Click trends" right={<span className="text-[11px] text-[#9C9C9C]">30 days</span>}>
              <ClickTrendsChart />
            </Card>
          </motion.div>

          {/* Top countries */}
          <motion.div {...cardMotion} transition={{ delay: 0.08, duration: 0.5, ease: [0.16, 1, 0.3, 1] }} className="flex">
            <Card title="Top countries">
              <div className="flex flex-col gap-3">
                {countries.map((c) => (
                  <div key={c.name}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="flex items-center gap-2 text-xs text-[#0A0A0A]">
                        <span className="text-sm leading-none">{c.flag}</span>
                        {c.name}
                      </span>
                      <span className="text-[11px] text-[#9C9C9C] tabular-nums">{c.pct}%</span>
                    </div>
                    <div className="h-1 rounded-full bg-[#F3F4F6] overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        whileInView={{ width: `${c.pct}%` }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                        className="h-full rounded-full bg-[#6366F1]/70"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </motion.div>

          {/* Devices */}
          <motion.div {...cardMotion} transition={{ delay: 0.16, duration: 0.5, ease: [0.16, 1, 0.3, 1] }} className="flex">
            <Card title="Devices">
              <Donut />
            </Card>
          </motion.div>

          {/* Recent activity */}
          <motion.div {...cardMotion} transition={{ delay: 0.16, duration: 0.5, ease: [0.16, 1, 0.3, 1] }} className="lg:col-span-2 flex">
            <Card title="Recent activity">
              <div className="flex flex-col divide-y divide-[#F1F1F4]">
                {recentActivity.map((a, i) => (
                  <div key={i} className="flex items-center gap-2.5 py-2 first:pt-0 last:pb-0">
                    <span className="w-1.5 h-1.5 bg-[#10B981]/50 rounded-full shrink-0" />
                    <p className="text-xs text-[#6B6B6B] truncate">{a.text}</p>
                    <span className="ml-auto text-[10px] text-[#9C9C9C] shrink-0">{a.time}</span>
                  </div>
                ))}
              </div>
            </Card>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default AnalyticsPreview;
