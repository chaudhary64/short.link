import { useState } from "react";
import { motion } from "motion/react";
import QRCode from "react-qr-code";
import { group, lift, rise, useReveal } from "./reveal";

/**
 * "How it works" — four steps read as one tab set.
 *
 * Each step owns a card with its own visual, a progress meter and its copy.
 * The meter's 4s animation is the cycle; when it finishes the next step takes
 * over, hovering or focusing holds it, and any card can be picked.
 */

const BARS = [34, 52, 41, 63, 58, 74, 69, 86];

const STEPS = [
  {
    title: "Paste",
    body: "Drop any long address into the field at the top. No account needed to try it.",
    visual: (
      <span className="m-how-field">
        <span className="m-how-url">https://example.com/page?utm=spring</span>
        <span className="m-how-pill">Shorten</span>
      </span>
    ),
  },
  {
    title: "Shorten",
    body: "A unique short.link appears in seconds, ready to copy or scan.",
    visual: (
      <>
        <span className="m-how-code">short.link/x7k2</span>
        <span className="m-how-copied">Copied</span>
      </>
    ),
  },
  {
    title: "Share",
    body: "A bio, an email or a campaign — or print its QR code for the table.",
    visual: (
      <>
        <span className="m-how-qr">
          <QRCode
            value="https://short.link/x7k2"
            size={56}
            bgColor="transparent"
            fgColor="currentColor"
          />
        </span>
        <span className="m-how-tag">link · QR · PNG</span>
      </>
    ),
  },
  {
    title: "Measure",
    body: "Clicks, visitors, countries, devices and browsers collect in your dashboard.",
    visual: (
      <>
        <span className="m-how-chart">
          {BARS.map((height) => (
            <span key={height} style={{ height: `${height}%` }} />
          ))}
        </span>
        <span className="m-how-tag">1.2K clicks this month</span>
      </>
    ),
  },
];

const pad = (index) => String(index + 1).padStart(2, "0");

const HowItWorks = () => {
  const [active, setActive] = useState(0);
  const reveal = useReveal();

  return (
    <section className="m-section m-how" id="how" aria-labelledby="how-title">
      <div className="m-wrap">
        <motion.div className="m-section-head" variants={group} {...reveal}>
          <div>
            <motion.p className="m-eyebrow" variants={rise}>
              How it works
            </motion.p>
            <motion.h2 className="m-h2" id="how-title" variants={rise}>
              From a long address to a live link.
            </motion.h2>
          </div>
          <motion.p className="m-sub" variants={rise}>
            Paste it, shorten it, put it where people look, then read the
            clicks — four steps, and no account needed to try the first one.
          </motion.p>
        </motion.div>

        <motion.ul className="m-how-grid" variants={group} {...reveal}>
          {STEPS.map((step, i) => (
            <motion.li className="m-how-item" key={step.title} variants={lift}>
              <button
                type="button"
                className={`m-how-card${i === active ? " is-active" : ""}`}
                aria-current={i === active ? "step" : undefined}
                onClick={() => setActive(i)}
              >
                <span className="m-how-visual" aria-hidden="true">
                  {step.visual}
                </span>
                <span className="m-how-meter" aria-hidden="true">
                  <span
                    className="m-how-meter-fill"
                    onAnimationEnd={() =>
                      setActive((i) => (i + 1) % STEPS.length)
                    }
                  />
                </span>
                <span className="m-how-meta" aria-hidden="true">
                  {pad(i)}
                </span>
                <span className="m-how-title">{step.title}</span>
                <span className="m-how-body">{step.body}</span>
              </button>
            </motion.li>
          ))}
        </motion.ul>
      </div>
    </section>
  );
};

export default HowItWorks;
