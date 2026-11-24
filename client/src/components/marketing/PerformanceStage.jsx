import { LuArrowRight } from "react-icons/lu";

/**
 * "Built for performance" — two readings from the resolver.
 *
 * Each capability is a panel on the page's own ruled grid: a mono label, the
 * claim, one large tabular number, and a small drawing of the thing that
 * number is measuring (a single hop; a month of clicks). Static on purpose —
 * the page already has motion further down, and a readout reads best at rest.
 */

// Thirty days of click volume. Shape matters, the absolute heights do not:
// the panel's claim is the month total, not any one day.
const CLICK_DAYS = [
  18, 22, 19, 25, 30, 27, 33, 29, 36, 34, 40, 38, 44, 47, 43, 51, 48, 54, 57,
  53, 61, 65, 60, 69, 73, 68, 77, 74, 82, 90,
];

const PerformanceStage = () => (
  <section className="m-section m-perf" id="how" aria-labelledby="perf-title">
    <div className="m-wrap">
      <div className="m-section-head">
        <div>
          <p className="m-eyebrow">Performance</p>
          <h2 className="m-h2" id="perf-title">
            Built for Performance
          </h2>
        </div>
        <p className="m-sub">
          Every capability is engineered for speed, scale and clear reporting,
          giving your links the foundation to resolve, measure and perform in
          production.
        </p>
      </div>

      <div className="m-perf-grid">
        <article className="m-perf-card">
          <p className="m-perf-label">
            <span className="m-perf-pip" aria-hidden="true" />
            Redirect speed
          </p>
          <h3 className="m-perf-claim">One-Hop Resolution</h3>

          <p className="m-perf-value">
            0.9<span className="m-perf-unit">ms</span>
          </p>
          <p className="m-perf-caption">Average global response</p>

          <div className="m-perf-viz">
            <div className="m-perf-hop" aria-hidden="true">
              <span className="m-perf-node">short.link/x7k2</span>
              <span className="m-perf-wire">
                <span className="m-perf-hop-code">302</span>
              </span>
              <span className="m-perf-node">example.com/sale</span>
            </div>
            <p className="m-perf-axis">
              <span>one request</span>
              <span>one redirect</span>
            </p>
          </div>

          <div className="m-perf-foot">
            <span className="m-perf-note">302 over HTTPS · Redis cache</span>
            <a className="m-perf-link" href="#product">
              Learn more
              <LuArrowRight aria-hidden="true" />
            </a>
          </div>
        </article>

        <article className="m-perf-card">
          <p className="m-perf-label">
            <span className="m-perf-pip" aria-hidden="true" />
            Click analytics
          </p>
          <h3 className="m-perf-claim">Full-Visit Context</h3>

          <p className="m-perf-value">
            1.2<span className="m-perf-unit">K</span>
          </p>
          <p className="m-perf-caption">Clicks tracked this month</p>

          <div className="m-perf-viz">
            <div className="m-perf-bars" aria-hidden="true">
              {CLICK_DAYS.map((height, i) => (
                <span key={i} style={{ height: `${height}%` }} />
              ))}
            </div>
            <p className="m-perf-axis">
              <span>30 days ago</span>
              <span>today</span>
            </p>
          </div>

          <div className="m-perf-foot">
            <span className="m-perf-note">
              country · city · device · browser · os
            </span>
            <a className="m-perf-link" href="#product">
              Learn more
              <LuArrowRight aria-hidden="true" />
            </a>
          </div>
        </article>
      </div>
    </div>
  </section>
);

export default PerformanceStage;
