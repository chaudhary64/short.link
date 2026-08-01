import { motion } from "motion/react";
import SectionHeading from "./SectionHeading";
import { LuCheck } from "react-icons/lu";

const reasons = [
  {
    title: "Unlimited links",
    description: "Create as many links as you need — no caps, no tiers.",
  },
  {
    title: "Analytics on everything",
    description: "Every link tracks clicks, uniques, and geography for free.",
  },
  {
    title: "Custom aliases",
    description: "Brand your links with short codes you actually remember.",
  },
  {
    title: "QR codes included",
    description: "Instant, scannable QR codes for every link you make.",
  },
  {
    title: "HTTPS everywhere",
    description: "Secure redirects on every click, from every device.",
  },
  {
    title: "Free forever",
    description: "No credit card, no trials, no surprise pricing — ever.",
  },
];

const highlights = [
  { label: "Avg. redirect", value: "100ms" },
  { label: "Guest link lifetime", value: "24h" },
  { label: "Free forever", value: "∞" },
];

const WhyShortLink = () => {
  return (
    <section className="relative">
      <div className="mx-auto px-6 py-20 sm:py-28">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-start">
          <div>
            <SectionHeading
              eyebrow="Why short.link"
              title="A shortener that respects your links."
              subtitle="Most link tools bury the basics behind pricing tiers. short.link keeps the essentials fast, open, and free."
            />

            <div className="divide-y divide-[#E5E5EA]">
              {reasons.map((r) => (
                <div
                  key={r.title}
                  className="flex items-start gap-3 py-3.5 first:pt-0 last:pb-0 transition-colors duration-150 hover:bg-[#F6F6F9] rounded-lg px-2 -mx-2"
                >
                  <span className="w-5 h-5 rounded-full bg-[#10B981]/10 text-[#10B981] flex items-center justify-center shrink-0 mt-0.5">
                    <LuCheck className="w-3 h-3" />
                  </span>
                  <div>
                    <p className="text-sm font-medium text-[#0A0A0A]">
                      {r.title}
                    </p>
                    <p className="text-[13px] text-[#6B6B6B] mt-0.5 leading-relaxed">
                      {r.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="bg-white border border-[#D4D4D8] rounded-xl p-6 sm:p-8"
          >
            <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#9C9C9C]">
              The short.link promise
            </span>
            <div className="flex flex-col divide-y divide-[#E5E5EA] mt-4">
              {highlights.map((h) => (
                <div
                  key={h.label}
                  className="py-4 first:pt-0 last:pb-0 flex items-baseline justify-between gap-4"
                >
                  <span className="text-sm text-[#6B6B6B]">{h.label}</span>
                  <span className="text-2xl font-display font-bold tracking-[-0.03em] text-[#0A0A0A] tabular-nums">
                    {h.value}
                  </span>
                </div>
              ))}
            </div>
            <p className="text-[13px] text-[#6B6B6B] mt-5 leading-relaxed">
              Try it without an account — guest links live for 24 hours. Sign up
              to keep yours forever.
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default WhyShortLink;
