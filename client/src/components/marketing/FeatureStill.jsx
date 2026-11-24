import { motion } from "motion/react";
import QRCode from "react-qr-code";
import ScaledStill from "./ScaledStill";

/**
 * Feature stills.
 *
 * Each feature card opens with a small, whole screen of the product rather
 * than an icon or a diagram: one panel on the card's paper-coloured mat, its
 * own header rule, its own footer padding. It is drawn at a fixed design size
 * (340 × 200) and scaled to the card's width, so the panel, its type and its
 * rules keep their proportions at every breakpoint — the way a product shot
 * scales — instead of re-flowing into something the product would never
 * render.
 *
 * Each card carries one gesture, played once when the card comes into view:
 * the trace prints, the chart draws, the code is scanned, the destination is
 * retyped. The variants below hold the choreography; the markup only marks
 * what moves, and the card that owns them sets the state.
 *
 * Timeline (s)
 *   0.15  trace prints, row by row (0.38 each, 0.25 apart)
 *   1.24  the 302 hops: one accent pulse
 *   0.25  the chart draws across (1.10), area and dot follow
 *   0.40  the QR is scanned once
 *   0.45  the destination is retyped (0.70)
 *   1.28  Save presses; 1.40 Download PNG presses
 */

/* Typing: the glyphs are already in the line and the clip catches up with
   them twenty frames at a time, the way a terminal prints. */
const print = (delay, duration = 0.38) => ({
  rest: { clipPath: "inset(0 100% 0 0)" },
  play: {
    clipPath: "inset(0 0% 0 0)",
    transition: {
      duration,
      delay,
      ease: (t) => Math.floor(t * 20) / 20,
    },
  },
});

const hop = {
  play: {
    scale: [1, 1.06, 1],
    transition: {
      duration: 0.85,
      delay: 1.24,
      times: [0, 0.45, 1],
      ease: "easeOut",
    },
  },
};

const draw = {
  rest: { pathLength: 0 },
  play: {
    pathLength: 1,
    transition: { duration: 1.1, delay: 0.25, ease: [0.4, 0, 0.2, 1] },
  },
};

const areaFade = {
  rest: { opacity: 0 },
  play: {
    opacity: 1,
    transition: { duration: 0.5, delay: 0.85, ease: "easeOut" },
  },
};

const dot = {
  rest: { opacity: 0, scale: 0.2 },
  play: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.26, delay: 1.2, ease: [0.22, 1, 0.36, 1] },
  },
};

const scan = {
  rest: { opacity: 0, y: -26 },
  play: {
    opacity: [0, 1, 1, 0],
    y: [-26, 0, 104, 104],
    transition: {
      duration: 1,
      delay: 0.4,
      times: [0, 0.12, 0.8, 1],
      ease: "linear",
    },
  },
};

const press = (delay) => ({
  play: {
    scale: [1, 0.98, 1],
    transition: { duration: 0.26, delay, times: [0, 0.45, 1], ease: "easeOut" },
  },
});

const Fit = ({ children }) => (
  <ScaledStill width={340} height={200}>
    <div className="m-shot">{children}</div>
  </ScaledStill>
);

/* One row of the request trace: a mono label in a fixed lane, a value that
   prints in, and a hairline that stops short of the window's inset. */
const TraceRow = ({ label, children, accent = false, delay }) => (
  <div className="fs-row">
    <span className="fs-row-label">{label}</span>
    <motion.span
      className={accent ? "fs-row-val fs-row-val--accent" : "fs-row-val"}
      variants={accent ? hop : undefined}
    >
      <motion.span className="fs-print" variants={print(delay)}>
        {children}
      </motion.span>
    </motion.span>
  </div>
);

const RedirectStill = () => (
  <Fit>
    <div className="fs-head">
      <span className="fs-code">
        <i className="fs-sq" />
        short.link/launch
      </span>
      <span className="badge" data-tone="active">
        Active
      </span>
    </div>
    <div className="fs-body fs-body--trace">
      <TraceRow label="Request" delay={0.15}>
        GET /launch
      </TraceRow>
      <TraceRow label="Status" accent delay={0.4}>
        302 Found
      </TraceRow>
      <TraceRow label="Location" delay={0.65}>
        example.com/page?utm=spring
      </TraceRow>
      <TraceRow label="Cache" delay={0.9}>
        HIT · 12 ms
      </TraceRow>
    </div>
  </Fit>
);

const CHART = [26, 34, 29, 41, 36, 48, 44, 56, 51, 62, 58, 68];

const AnalyticsStill = () => {
  const chartW = 342;
  const chartH = 74;
  const step = chartW / (CHART.length - 1);
  const points = CHART.map((v, i) => [i * step, chartH - (v / 72) * chartH]);
  const line = points.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(" ");
  const area = `0,${chartH} ${line} ${chartW},${chartH}`;

  return (
    <Fit>
      <div className="fs-head">
        <span className="fs-label">Last 30 days</span>
        <span className="fs-meta">24 countries</span>
      </div>
      <div className="fs-cells">
        <div className="fs-cell">
          <span className="fs-label">Clicks</span>
          <span className="fs-num">1,284</span>
        </div>
        <div className="fs-cell">
          <span className="fs-label">Visitors</span>
          <span className="fs-num">892</span>
        </div>
      </div>
      <div className="fs-chart">
        <svg viewBox={`0 0 ${chartW} ${chartH}`} preserveAspectRatio="none">
          <motion.polygon
            className="fs-chart-area"
            points={area}
            variants={areaFade}
          />
          <motion.polyline
            className="fs-chart-line"
            points={line}
            variants={draw}
          />
        </svg>
        <motion.span
          className="fs-chart-dot"
          variants={dot}
          style={{
            /* Percentages, not the viewBox's pixels: the svg is stretched to
               the panel (preserveAspectRatio="none"), so a px offset would put
               the dot outside the card wherever the still is scaled up. */
            left: `${(points[points.length - 1][0] / chartW) * 100}%`,
            top: `${(points[points.length - 1][1] / chartH) * 100}%`,
          }}
        />
      </div>
    </Fit>
  );
};

const QrStill = () => (
  <Fit>
    <div className="fs-head">
      <span className="fs-label">QR code</span>
      <span className="fs-meta">PNG</span>
    </div>
    <div className="fs-qr">
      <span className="fs-qr-tile">
        <motion.i className="fs-scan" aria-hidden="true" variants={scan} />
        <QRCode
          value="https://short.link/launch"
          size={76}
          level="M"
          fgColor="#191810"
          bgColor="#ffffff"
        />
      </span>
      <div className="fs-qr-side">
        <span className="fs-code fs-code--plain">short.link/launch</span>
        <motion.span className="fs-btn" variants={press(1.4)}>
          <svg viewBox="0 0 16 16" className="fs-btn-ico">
            <path
              d="M8 2v8m0 0 3-3m-3 3L5 7M3 12.5h10"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          Download PNG
        </motion.span>
        <span className="fs-note">1024 × 1024</span>
      </div>
    </div>
  </Fit>
);

const ControlStill = () => (
  <Fit>
    <div className="fs-head">
      <span className="fs-code">
        <i className="fs-sq" />
        short.link/launch
      </span>
      <span className="badge" data-tone="active">
        Active
      </span>
    </div>
    <div className="fs-body fs-body--tight">
      <span className="fs-label">Destination</span>
      <div className="fs-edit">
        <span className="fs-field">
          <motion.span className="fs-field-url fs-print" variants={print(0.45, 0.7)}>
            example.com/spring-sale
          </motion.span>
        </span>
        <motion.span className="fs-btn fs-btn--solid" variants={press(1.28)}>
          Save
        </motion.span>
      </div>
      <div className="fs-ops">
        <span className="fs-op">Edit</span>
        <span className="fs-op">Pause</span>
        <span className="fs-op fs-op--danger">Delete</span>
      </div>
    </div>
  </Fit>
);

const STILLS = {
  redirect: RedirectStill,
  analytics: AnalyticsStill,
  qr: QrStill,
  control: ControlStill,
};

const FeatureStill = ({ kind }) => {
  const Still = STILLS[kind] ?? RedirectStill;
  return <Still />;
};

export default FeatureStill;
