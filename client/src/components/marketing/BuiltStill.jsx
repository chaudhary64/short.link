import ScaledStill from "./ScaledStill";

/**
 * The request-timing still.
 *
 * The section's claim is that tracking never sits in front of a redirect, and
 * this is the screen that proves it: one wall clock, two things sharing it. The
 * redirect is a sliver at the left edge; the log takes the rest of the track
 * and starts only once the response has gone. That is why the bars are drawn to
 * a real scale — a 0.9 ms response beside a 24 ms log — rather than as two
 * ribbons of convenient length.
 *
 * Two compositions, because one cannot serve both ends of the page. The wide
 * version is a waterfall with a time axis; below 900px the same clock becomes
 * one strip with a legend, because a 0.9 ms sliver is not readable as a
 * waterfall on a phone.
 */

const Header = () => (
  <div className="bw-head">
    <span className="bw-title">
      <span className="fs-label">Request timing</span>
      <span className="bw-code">GET /launch</span>
    </span>
    <span className="badge" data-tone="info">
      302 · HTTPS
    </span>
  </div>
);

/* Wide: two lanes on one axis, so the response and the log can be compared. */
const WideStill = () => (
  <ScaledStill width={1000} height={220} className="m-still--wide">
    <div className="m-shot m-shot--wide">
      <Header />

      <div className="bw-body">
        <div className="bw-row">
          <span className="bw-meta">
            <span className="bw-lane">redirect</span>
            <span className="bw-val bw-val--redirect">0.9 ms</span>
          </span>
          <span className="bw-track">
            <i className="bw-bar bw-bar--redirect" />
          </span>
        </div>

        <div className="bw-row">
          <span className="bw-meta">
            <span className="bw-lane">analytics</span>
            <span className="bw-val">24 ms</span>
          </span>
          <span className="bw-track">
            <i className="bw-bar bw-bar--log" />
          </span>
        </div>

        <div className="bw-axis">
          <span />
          <span className="bw-ticks">
            <i style={{ left: "0%" }}>0</i>
            <i style={{ left: "40%" }}>10</i>
            <i style={{ left: "80%" }}>20</i>
            <i style={{ left: "100%" }}>25 ms</i>
          </span>
        </div>
      </div>

      <div className="bw-foot">
        <span className="bw-note">
          fire-and-forget · the log is written after the response
        </span>
      </div>
    </div>
  </ScaledStill>
);

/* Narrow: one strip, then the two clocks read off a legend. */
const NarrowStill = () => (
  <ScaledStill width={360} height={200} className="m-still--narrow">
    <div className="m-shot m-shot--narrow">
      <Header />

      <div className="bw-body">
        <span className="bw-strip">
          <i className="bw-bar bw-bar--redirect" />
          <i className="bw-bar bw-bar--log" />
        </span>

        <div className="bw-legend">
          <span className="bw-key">
            <i className="bw-swatch bw-swatch--redirect" />
            <span className="bw-lane">redirect</span>
            <span className="bw-val">0.9 ms</span>
          </span>
          <span className="bw-key">
            <i className="bw-swatch bw-swatch--log" />
            <span className="bw-lane">analytics</span>
            <span className="bw-val bw-val--muted">24 ms</span>
          </span>
        </div>
      </div>

      <div className="bw-foot">
        <span className="bw-note">logged after the response</span>
      </div>
    </div>
  </ScaledStill>
);

const BuiltStill = () => (
  <>
    <div className="m-built-wide">
      <WideStill />
    </div>
    <div className="m-built-narrow">
      <NarrowStill />
    </div>
  </>
);

export default BuiltStill;
