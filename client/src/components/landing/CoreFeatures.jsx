import { motion } from "motion/react";
import QRCode from "react-qr-code";
import Chip from "../ui/Chip";
import SectionHeading from "./SectionHeading";
import { fadeUp, staggerContainer } from "../../utils/motion";
import {
  LuChartNoAxesColumn,
  LuCheck,
  LuFingerprint,
  LuListChecks,
  LuLock,
  LuQrCode,
  LuShield,
} from "react-icons/lu";

const miniBars = [
  { label: "launch", pct: 78 },
  { label: "guides", pct: 56 },
  { label: "sale", pct: 34 },
  { label: "github", pct: 21 },
];

const analyticsPoints = [
  {
    title: "Click & visitor trends",
    body: "Daily clicks and uniques, from 7 to 90 days or any custom range.",
  },
  {
    title: "Top countries & world map",
    body: "A live map and leaderboard show exactly where your audience is.",
  },
  {
    title: "Devices, browsers & OS",
    body: "Know how your links are opened on every screen.",
  },
  {
    title: "Top links, ranked",
    body: "Sort by clicks, unique visitors, and CTR in one glance.",
  },
  {
    title: "Full click timeline",
    body: "Every click logged with browser, OS, device, and location.",
  },
];

const features = [
  {
    title: "Link analytics",
    description:
      "Clicks, unique visitors, countries, and devices for every link — updated live in your dashboard.",
    icon: <LuChartNoAxesColumn className="w-5 h-5" />,
    className: "md:col-span-2 lg:col-span-3",
    visual: (
      <div className="mt-6 pt-6 border-t border-[#E5E5EA] grid grid-cols-1 lg:grid-cols-3 gap-x-8 gap-y-6">
        <ul className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
          {analyticsPoints.map((p) => (
            <li key={p.title} className="flex items-start gap-2.5">
              <span className="w-5 h-5 rounded-full bg-[#6366F1]/10 text-[#6366F1] flex items-center justify-center shrink-0 mt-0.5">
                <LuCheck className="w-3 h-3" />
              </span>
              <div className="min-w-0">
                <p className="text-sm font-medium text-[#0A0A0A]">{p.title}</p>
                <p className="text-[12px] text-[#6B6B6B] mt-0.5 leading-snug">
                  {p.body}
                </p>
              </div>
            </li>
          ))}
        </ul>

        <div className="lg:border-l lg:border-[#E5E5EA] lg:pl-8">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#9C9C9C]">
              Top links
            </span>
            <span className="text-[11px] text-[#9C9C9C]">This week</span>
          </div>
          <div className="flex flex-col gap-2.5">
            {miniBars.map((b) => (
              <div key={b.label}>
                <div className="flex items-center justify-between mb-1">
                  <span className="font-mono text-xs text-[#0A0A0A]">/{b.label}</span>
                  <span className="text-[11px] text-[#9C9C9C] tabular-nums">{b.pct}%</span>
                </div>
                <div className="h-1.5 rounded-full bg-[#F3F4F6] overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    whileInView={{ width: `${b.pct}%` }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                    className="h-full rounded-full bg-[#6366F1]"
                  />
                </div>
              </div>
            ))}
          </div>
          <p className="text-[11px] text-[#9C9C9C] mt-4">
            Updated live in your dashboard, no refresh needed.
          </p>
        </div>
      </div>
    ),
  },
  {
    title: "Link management",
    description:
      "Edit destinations, toggle links on or off, and clean up in one screen.",
    icon: <LuListChecks className="w-5 h-5" />,
    visual: (
      <div className="mt-auto pt-6 flex flex-col gap-2">
        {[
          { code: "launch", state: "Active" },
          { code: "sale", state: "Paused" },
        ].map((row) => (
          <div
            key={row.code}
            className="flex items-center justify-between rounded-lg border border-[#E5E5EA] bg-[#F6F6F9] px-3 py-2.5"
          >
            <span className="font-mono text-xs font-medium text-[#0A0A0A]">
              /{row.code}
            </span>
            <Chip
              size="sm"
              status={row.state === "Active" ? "active" : "warning"}
            >
              {row.state}
            </Chip>
          </div>
        ))}
      </div>
    ),
  },
  {
    title: "QR codes",
    description:
      "Every link comes with an instant QR code — print it, pin it, scan it anywhere.",
    icon: <LuQrCode className="w-5 h-5" />,
    visual: (
      <div className="mt-auto pt-6 flex items-center gap-3">
        <div className="shrink-0 w-16 h-16 rounded-lg border border-[#E5E5EA] bg-white p-1.5 transition-transform duration-300 group-hover:scale-105">
          <QRCode
            value="https://short.link/launch"
            size={52}
            fgColor="#0A0A0A"
            bgColor="#FFFFFF"
            level="M"
            style={{ width: "100%", height: "100%" }}
          />
        </div>
        <div className="min-w-0">
          <p className="font-mono text-xs font-medium text-[#0A0A0A] truncate">
            short.link/launch
          </p>
          <p className="text-[11px] text-[#9C9C9C] mt-0.5">Scannable in one tap</p>
        </div>
      </div>
    ),
  },
  {
    title: "Guest links",
    description:
      "Shorten without an account — your link lives for 24 hours and converts to a permanent one the moment you sign up.",
    icon: <LuFingerprint className="w-5 h-5" />,
    visual: (
      <div className="mt-auto pt-6 flex items-center justify-between rounded-lg border border-[#E5E5EA] bg-[#F6F6F9] px-3 py-2.5">
        <span className="font-mono text-xs font-medium text-[#0A0A0A] truncate">
          /guest-2xk9
        </span>
        <Chip size="sm" status="warning" className="shrink-0">
          24h lifetime
        </Chip>
      </div>
    ),
  },
  {
    title: "Secure HTTPS redirects",
    description:
      "All redirects are served over HTTPS, so every link stays safe end to end.",
    icon: <LuShield className="w-5 h-5" />,
    className: "md:col-span-2 lg:col-span-1",
    visual: (
      <div className="mt-auto pt-6 flex flex-col gap-2">
        <div className="flex items-center gap-2 rounded-lg border border-[#E5E5EA] bg-[#F6F6F9] px-3 py-2.5">
          <LuLock className="w-3.5 h-3.5 text-[#10B981] shrink-0" />
          <span className="font-mono text-xs text-[#0A0A0A] truncate">
            https://short.link/launch
          </span>
        </div>
        <p className="text-[11px] text-[#9C9C9C]">TLS on every hop · never plain HTTP</p>
      </div>
    ),
  },
];

const promises = [
  "No credit card",
  "No trials",
  "No surprise pricing",
  "Every feature, every account",
];

const CoreFeatures = () => {
  return (
    <section className="relative">
      <div className="mx-auto px-6 py-20 sm:py-28">
        <SectionHeading
          eyebrow="Core features"
          title="Everything a short link should be."
          subtitle="The essentials, done well — nothing more, nothing less."
        />

        <motion.div
          variants={staggerContainer(0.08)}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5"
        >
          {features.map((feature) => (
            <motion.div
              key={feature.title}
              variants={fadeUp}
              className={`group flex flex-col h-full bg-white border border-[#D4D4D8] rounded-xl p-6 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)] ${feature.className}`}
            >
              <div className="w-11 h-11 bg-gray-50 border border-[#D4D4D8] rounded-lg text-[#0A0A0A] flex items-center justify-center transition-colors duration-300 group-hover:bg-[#6366F1] group-hover:text-white group-hover:border-[#6366F1]">
                {feature.icon}
              </div>
              <h3 className="text-base font-semibold text-[#0A0A0A] mt-4">
                {feature.title}
              </h3>
              <p className="text-sm text-[#6B6B6B] mt-2 leading-relaxed max-w-lg">
                {feature.description}
              </p>
              {feature.stat && (
                <div className="mt-6 flex items-baseline gap-2">
                  <span className="font-display text-3xl font-bold tracking-[-0.03em] text-[#0A0A0A] tabular-nums">
                    {feature.stat.value}
                  </span>
                  <span className="text-[11px] text-[#9C9C9C]">
                    {feature.stat.sub}
                  </span>
                </div>
              )}
              {feature.visual}
            </motion.div>
          ))}

          <motion.div
            variants={fadeUp}
            className="md:col-span-2 lg:col-span-2 rounded-xl bg-[#0A0A0A] text-white p-8 sm:p-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8"
          >
            <div>
              <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#9C9C9C]">
                Free forever
              </span>
              <p className="mt-3 text-4xl sm:text-5xl font-display font-bold tracking-[-0.03em]">
                $0 <span className="text-[#818CF8] text-2xl sm:text-3xl">forever</span>
              </p>
              <p className="mt-3 text-[15px] text-gray-400 leading-relaxed max-w-md">
                Every feature on this page ships with every account. No credit
                card, no trials, no surprise pricing — ever.
              </p>
            </div>
            <div className="flex flex-col gap-3">
              {promises.map((p) => (
                <div key={p} className="flex items-center gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-[#6366F1]/20 text-[#818CF8] flex items-center justify-center shrink-0">
                    <LuCheck className="w-3 h-3" />
                  </span>
                  <span className="text-sm text-gray-300">{p}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default CoreFeatures;
