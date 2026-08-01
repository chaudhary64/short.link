import { motion } from "motion/react";
import SectionHeading from "./SectionHeading";

const steps = [
  {
    title: "Paste your URL",
    description:
      "Drop any long web address into the field on the home page — no signup required to try it.",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
  },
  {
    title: "Generate a short link",
    description:
      "Get a compact, unique short.link in milliseconds — or set a custom alias of your own.",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
  },
  {
    title: "Share anywhere",
    description:
      "Copy the link, grab its QR code, or drop it straight into your bio, emails, and campaigns.",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
      </svg>
    ),
  },
  {
    title: "Track performance",
    description:
      "Watch clicks, unique visitors, and geographic data accumulate in your dashboard.",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
  },
];

const ChevronRight = ({ className = "w-4 h-4" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
  </svg>
);

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
          <div className="hidden md:block absolute left-[8%] right-[8%] top-8 border-t-2 border-dashed border-gray-200" />

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 md:gap-6">
            {steps.map((step, index) => (
              <div key={step.title} className="relative">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-60px" }}
                  transition={{
                    delay: index * 0.1,
                    duration: 0.5,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                  className="group"
                >
                  <div className="relative z-10 w-16 h-16 bg-white border-2 border-gray-200 flex items-center justify-center text-gray-900 transition-colors duration-300 group-hover:border-[#10b981]/50 group-hover:text-[#10b981]">
                    {step.icon}
                    <span className="absolute -bottom-1 -right-1 w-6 h-6 bg-gray-900 text-white text-[10px] font-semibold flex items-center justify-center">
                      {index + 1}
                    </span>
                  </div>

                  <h3 className="text-base font-semibold text-gray-900 mt-5">
                    {step.title}
                  </h3>
                  <p className="text-sm text-gray-500 mt-2 leading-relaxed">
                    {step.description}
                  </p>
                </motion.div>

                {/* Connector arrows between steps (desktop) */}
                {index < steps.length - 1 && (
                  <span className="hidden md:flex absolute top-8 -right-4 -translate-y-1/2 text-gray-400 z-20 pointer-events-none">
                    <ChevronRight />
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
