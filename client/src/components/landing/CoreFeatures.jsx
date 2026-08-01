import { motion } from "motion/react";
import SectionHeading from "./SectionHeading";
import {
  LuChartNoAxesColumn,
  LuLink,
  LuListChecks,
  LuQrCode,
  LuShield,
  LuZap,
} from "react-icons/lu";

const miniBars = [
  { label: "launch", pct: 78 },
  { label: "guides", pct: 56 },
  { label: "sale", pct: 34 },
  { label: "github", pct: 21 },
];

const features = [
  {
    title: "Link analytics",
    description:
      "Total clicks, unique visitors, countries, and devices for every link — updated live in your dashboard.",
    icon: <LuChartNoAxesColumn className="w-5 h-5" />,
    large: true,
    visual: (
      <div className="mt-6 flex flex-col gap-3">
        {miniBars.map((b) => (
          <div key={b.label}>
            <div className="flex items-center justify-between mb-1">
              <span className="font-mono text-xs text-[#0A0A0A]">/{b.label}</span>
              <span className="text-[11px] text-[#9C9C9C] tabular-nums">{b.pct}%</span>
            </div>
            <div className="h-1.5 rounded-full bg-[#F3F4F6] overflow-hidden">
              <div
                className="h-full rounded-full bg-[#6366F1]"
                style={{ width: `${b.pct}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    ),
  },
  {
    title: "Instant redirects",
    description: "Every click resolves in a single hop from a Redis-backed cache.",
    icon: <LuZap className="w-5 h-5" />,
  },
  {
    title: "Link management",
    description: "Edit destinations, toggle links on or off, and clean up in one screen.",
    icon: <LuListChecks className="w-5 h-5" />,
  },
  {
    title: "QR codes",
    description: "Every link comes with an instant QR code, ready to scan.",
    icon: <LuQrCode className="w-5 h-5" />,
    wide: true,
  },
  {
    title: "Secure HTTPS redirects",
    description: "All redirects are served over HTTPS, so every link stays safe.",
    icon: <LuShield className="w-5 h-5" />,
  },
  {
    title: "Free forever",
    description:
      "No credit card, no trials, no surprise pricing — ever. Every feature on this page ships with every account.",
    icon: <LuLink className="w-5 h-5" />,
    wide: true,
  },
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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{
                delay: index * 0.06,
                duration: 0.5,
                ease: [0.16, 1, 0.3, 1],
              }}
              className={`group bg-white border border-[#D4D4D8] rounded-xl p-6 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)] ${
                feature.large ? "lg:col-span-2 lg:row-span-1" : ""
              } ${feature.wide ? "lg:col-span-2" : ""}`}
            >
              <div className="w-11 h-11 bg-gray-50 border border-[#D4D4D8] rounded-lg text-[#0A0A0A] flex items-center justify-center transition-colors duration-300 group-hover:bg-[#F3F4F6]">
                {feature.icon}
              </div>
              <h3 className="text-base font-semibold text-[#0A0A0A] mt-4">
                {feature.title}
              </h3>
              <p className="text-sm text-[#6B6B6B] mt-2 leading-relaxed max-w-lg">
                {feature.description}
              </p>
              {feature.visual}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CoreFeatures;
