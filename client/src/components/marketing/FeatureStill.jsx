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
 * Each card carries one gesture, played once when the grid comes into view
 * and described in marketing.css under "Feature motion": the trace prints,
 * the chart draws, the code is scanned, the destination is retyped. The
 * markup here only marks what moves.
 */
const Fit = ({ children }) => (
  <ScaledStill width={340} height={200}>
    <div className="m-shot">{children}</div>
  </ScaledStill>
);

/* One row of the request trace: a mono label in a fixed lane, a value, and a
   hairline that stops short of the window's inset. */
const TraceRow = ({ label, children, accent = false }) => (
  <div className="fs-row">
    <span className="fs-row-label">{label}</span>
    <span className={accent ? "fs-row-val fs-row-val--accent" : "fs-row-val"}>
      {children}
    </span>
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
      <TraceRow label="Request">
        <span className="fs-print">GET /launch</span>
      </TraceRow>
      <TraceRow label="Status" accent>
        <span className="fs-print">302 Found</span>
      </TraceRow>
      <TraceRow label="Location">
        <span className="fs-print">example.com/page?utm=spring</span>
      </TraceRow>
      <TraceRow label="Cache">
        <span className="fs-print">HIT · 12 ms</span>
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
          <polygon className="fs-chart-area" points={area} />
          <polyline className="fs-chart-line" points={line} />
        </svg>
        <span
          className="fs-chart-dot"
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
        <i className="fs-scan" aria-hidden="true" />
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
        <span className="fs-btn">
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
        </span>
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
          <span className="fs-field-url fs-print">
            example.com/spring-sale
          </span>
        </span>
        <span className="fs-btn fs-btn--solid">Save</span>
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
