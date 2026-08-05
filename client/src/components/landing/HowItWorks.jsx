import { Fragment } from "react";
import { motion } from "motion/react";
import { LuArrowDown, LuArrowRight } from "react-icons/lu";
import SectionHeading from "./SectionHeading";
import { fadeUp, staggerContainer } from "../../utils/motion";

const steps = [
  {
    title: "Paste your URL",
    description:
      "Drop any long web address into the field at the top of the page — no signup required to try it.",
    mono: "https://example.com/your-very-long-url?utm=spring",
  },
  {
    title: "Get a short link",
    description:
      "Receive a compact, unique short.link in seconds, ready to share.",
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
    mono: "clicks · uniques · countries",
  },
];

const HowItWorks = () => {
  return (
    <section className="relative">
      <div className="mx-auto px-6 py-14 sm:py-16">
        <SectionHeading
          eyebrow="How it works"
          title="From long URL to insight in four steps"
          subtitle="No accounts, no setup, no learning curve. Paste, shorten, share, and watch the numbers come in."
        />

        <motion.div
          variants={staggerContainer(0.12)}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
          className="flex flex-col md:flex-row items-stretch gap-6 md:gap-3"
        >
          {steps.map((step, index) => (
            <Fragment key={step.title}>
              <motion.div
                variants={fadeUp}
                className="group flex-1"
              >
                {/* Step numeral */}
                <div className="flex items-center gap-3">
                  <span className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-[#6366F1]/10 text-[#6366F1] font-mono font-semibold text-sm tracking-[-0.02em] transition-colors duration-300 group-hover:bg-[#6366F1] group-hover:text-white">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#9C9C9C]">
                    Step {index + 1}
                  </span>
                </div>

                <h3 className="text-base font-semibold text-[#0A0A0A] mt-4">
                  {step.title}
                </h3>
                <p className="text-sm text-[#6B6B6B] mt-2 leading-relaxed">
                  {step.description}
                </p>

                {/* Terminal-style output strip */}
                <div className="mt-4 rounded-lg bg-[#0A0A0A] border border-[#0A0A0A] px-3 py-2.5 flex items-center gap-2 font-mono text-[11px] transition-colors duration-300 group-hover:border-[#6366F1]">
                  <span className="text-[#10B981] shrink-0">›</span>
                  <span className="text-gray-300 truncate min-w-0">
                    {step.mono}
                  </span>
                </div>
              </motion.div>

              {/* Inline flow arrow between steps — no absolute positioning */}
              {index < steps.length - 1 && (
                <motion.div
                  variants={fadeUp}
                  className="flex items-center justify-center shrink-0 text-[#9C9C9C]"
                  aria-hidden="true"
                >
                  <LuArrowRight className="w-5 h-5 hidden md:block" />
                  <LuArrowDown className="w-5 h-5 md:hidden" />
                </motion.div>
              )}
            </Fragment>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default HowItWorks;
