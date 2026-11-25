import { useRef } from "react";
import { motion, useInView, useReducedMotion } from "motion/react";
import QRCode from "react-qr-code";
import { group, lift, rise, useReveal } from "./reveal";

/**
 * "How it works" — four steps, each with a visual that plays itself once.
 *
 * Nothing cycles and no step is picked: the cards are plain, and each card
 * watches its own crossing into the viewport. When it arrives its visual plays
 * once and stays on the finished frame, so scrolling down walks the reader
 * through paste → shorten → share → measure.
 */

/**
 * Entering elements: a decelerate curve (Material 3's emphasized decelerate),
 * durations kept short because nothing travels more than a few pixels, and one
 * beat between a piece and whatever follows it. The slowest card — the eight
 * bars — settles in about 0.8s.
 */
const EASE = [0.05, 0.7, 0.1, 1];
const ENTER = 0.34;
const LABEL = 0.24;
const BEAT = 0.08;
const SLICE = 0.035;

const BARS = [34, 52, 41, 63, 58, 74, 69, 86];

/**
 * Motion props for an entrance that runs once. Before the trigger nothing is
 * set, so the stylesheet's finished frame is what a card shows.
 */
const play = (playing, frames, transition) =>
  playing ? { animate: frames, transition } : {};

/** One piece of a step visual. */
const Piece = ({
  playing,
  className,
  frames,
  style,
  delay = 0,
  duration = ENTER,
  children,
}) => (
  <motion.span
    className={className}
    style={style}
    {...play(playing, frames, { duration, delay, ease: EASE })}
  >
    {children}
  </motion.span>
);

const PasteVisual = ({ playing, delay }) => (
  <span className="m-how-field">
    <Piece
      className="m-how-url"
      playing={playing}
      delay={delay}
      frames={{ opacity: [0, 1], x: [-6, 0] }}
    >
      https://example.com/page?utm=spring
    </Piece>
    <Piece
      className="m-how-pill"
      playing={playing}
      delay={delay + BEAT}
      duration={LABEL}
      frames={{ opacity: [0, 1], scale: [0.94, 1] }}
    >
      Shorten
    </Piece>
  </span>
);

const ShortenVisual = ({ playing, delay }) => (
  <>
    <Piece
      className="m-how-code"
      playing={playing}
      delay={delay}
      frames={{ opacity: [0, 1], y: [8, 0] }}
    >
      short.link/x7k2
    </Piece>
    <Piece
      className="m-how-copied"
      playing={playing}
      delay={delay + BEAT}
      duration={LABEL}
      frames={{ opacity: [0, 1], y: [4, 0] }}
    >
      Copied
    </Piece>
  </>
);

const ShareVisual = ({ playing, delay }) => (
  <>
    <Piece
      className="m-how-qr"
      playing={playing}
      delay={delay}
      frames={{ opacity: [0, 1], scale: [0.94, 1], rotate: [-4, 0] }}
    >
      <QRCode
        value="https://short.link/x7k2"
        size={56}
        bgColor="transparent"
        fgColor="currentColor"
      />
    </Piece>
    <Piece
      className="m-how-tag"
      playing={playing}
      delay={delay + BEAT}
      duration={LABEL}
      frames={{ opacity: [0, 1], y: [4, 0] }}
    >
      link · QR · PNG
    </Piece>
  </>
);

const MeasureVisual = ({ playing, delay }) => (
  <>
    <span className="m-how-chart">
      {BARS.map((height, i) => (
        <Piece
          key={height}
          playing={playing}
          style={{ height: `${height}%` }}
          delay={delay + i * SLICE}
          frames={{ scaleY: [0.2, 1] }}
        />
      ))}
    </span>
    <Piece
      className="m-how-tag"
      playing={playing}
      delay={delay + (BARS.length - 1) * SLICE + BEAT}
      duration={LABEL}
      frames={{ opacity: [0, 1], y: [4, 0] }}
    >
      1.2K clicks this month
    </Piece>
  </>
);

const STEPS = [
  {
    title: "Paste",
    body: "Drop any long address into the field at the top. No account needed to try it.",
    visual: PasteVisual,
  },
  {
    title: "Shorten",
    body: "A unique short.link appears in seconds, ready to copy or scan.",
    visual: ShortenVisual,
  },
  {
    title: "Share",
    body: "A bio, an email or a campaign — or print its QR code for the table.",
    visual: ShareVisual,
  },
  {
    title: "Measure",
    body: "Clicks, visitors, countries, devices and browsers collect in your dashboard.",
    visual: MeasureVisual,
  },
];

const pad = (index) => String(index + 1).padStart(2, "0");

/** One card, watching its own entry so its visual plays exactly once. */
const HowCard = ({ step, index, reduce }) => {
  const ref = useRef(null);

  /* A little early (the bottom margin) so the reset to the first frame happens
     before the card is really on screen. */
  const inView = useInView(ref, {
    once: true,
    amount: 0.2,
    margin: "0px 0px 10% 0px",
  });

  const Visual = step.visual;

  return (
    <motion.li className="m-how-item" variants={lift} ref={ref}>
      <div className="m-how-card">
        <span className="m-how-visual" aria-hidden="true">
          <Visual playing={inView && !reduce} delay={index * BEAT} />
        </span>
        <span className="m-how-meta" aria-hidden="true">
          {pad(index)}
        </span>
        <span className="m-how-title">{step.title}</span>
        <span className="m-how-body">{step.body}</span>
      </div>
    </motion.li>
  );
};

const HowItWorks = () => {
  const reveal = useReveal();
  const reduce = useReducedMotion();

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
            <HowCard key={step.title} step={step} index={i} reduce={reduce} />
          ))}
        </motion.ul>
      </div>
    </section>
  );
};

export default HowItWorks;
