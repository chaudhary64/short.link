import { motion } from "motion/react";
import SectionHeading from "./SectionHeading";
import { fadeUp, staggerContainer } from "../../utils/motion";

const steps = [
  {
    title: "Paste your URL",
    description:
      "Drop any long web address into the field at the top of the page — no signup required to try it.",
    mono: "https://example.com/…?utm=spring",
  },
  {
    title: "Get a short link",
    description:
      // \u200b zero-width space prevents auto-linkification of the brand name
      "Receive a compact, unique short\u200b.link in seconds, ready to share.",
    mono: "short\u200b.link/launch",
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
    <section className="g-sec">
      <SectionHeading
        eyebrow="How it works"
        title="From long URL to insight in four steps"
        subtitle="No accounts, no setup, no learning curve. Paste, shorten, share, and watch the numbers come in."
      />

      <motion.div
        variants={staggerContainer(0.1)}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-60px" }}
        className="g-steps"
      >
        {steps.map((step, index) => (
          <motion.div key={step.title} variants={fadeUp} className="g-step">
            <span className="g-mark" aria-hidden="true" />
            <span className="g-step-idx">
              {String(index + 1).padStart(2, "0")}
            </span>
            <h3 className="g-step-title">{step.title}</h3>
            <p className="g-step-desc">{step.description}</p>
            <div className="g-step-mono">
              <span className="caret">›</span>
              <span className="mono">{step.mono}</span>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
};

export default HowItWorks;
