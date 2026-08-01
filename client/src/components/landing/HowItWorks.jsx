import { motion } from "motion/react";
import SectionHeading from "./SectionHeading";

const steps = [
  {
    title: "Paste your URL",
    description:
      "Drop any long web address into the field above — no signup required to try it.",
    mono: "https://example.com/your-very-long-url?utm=spring",
  },
  {
    title: "Get a short link",
    description:
      "Receive a compact, unique short.link in milliseconds, ready to share.",
    mono: "short.link/launch",
  },
  {
    title: "Share anywhere",
    description:
      "Copy the link, grab its QR code, or drop it straight into your bio, emails, and campaigns.",
    mono: "Copied to clipboard ✓",
  },
  {
    title: "Track performance",
    description:
      "Watch clicks, unique visitors, and geographic data accumulate in real time.",
    mono: "530 clicks · 68% desktop",
  },
];

const HowItWorks = () => {
  return (
    <section className="relative">
      <div className="mx-auto px-6 py-20 sm:py-28">
        <SectionHeading
          eyebrow="How it works"
          title="From long URL to insight in four steps"
          subtitle="No accounts, no setup, no learning curve. Paste, shorten, share, and watch the numbers come in."
        />

        <div className="relative">
          {/* Desktop connector line */}
          <div className="hidden md:block absolute left-[12.5%] right-[12.5%] top-7 border-t-2 border-dashed border-[#D4D4D8]" />

          <div className="grid grid-cols-1 md:grid-cols-4 gap-10 md:gap-6">
            {steps.map((step, index) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{
                  delay: index * 0.1,
                  duration: 0.5,
                  ease: [0.16, 1, 0.3, 1],
                }}
                className="relative"
              >
                {/* Ghost numeral */}
                <span className="relative z-10 inline-flex items-center justify-center w-14 h-14 rounded-xl bg-[#0A0A0A] text-white font-display font-bold text-lg tracking-[-0.03em]">
                  {String(index + 1).padStart(2, "0")}
                </span>

                <h3 className="text-base font-semibold text-[#0A0A0A] mt-5">
                  {step.title}
                </h3>
                <p className="text-sm text-[#6B6B6B] mt-2 leading-relaxed">
                  {step.description}
                </p>

                <p className="mt-3 inline-block font-mono text-[11px] text-[#9C9C9C] bg-[#F6F6F9] border border-[#D4D4D8] rounded-md px-2.5 py-1 truncate max-w-full">
                  {step.mono}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
