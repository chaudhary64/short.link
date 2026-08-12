import { motion } from "motion/react";
import QRCode from "react-qr-code";
import Chip from "../ui/Chip";
import SectionHeading from "./SectionHeading";
import { fadeUp, staggerContainer } from "../../utils/motion";
import {
  LuChartNoAxesColumn,
  LuFingerprint,
  LuListChecks,
  LuQrCode,
} from "react-icons/lu";

const miniBars = [
  { label: "launch", pct: 78 },
  { label: "guides", pct: 56 },
  { label: "sale", pct: 34 },
  { label: "github", pct: 21 },
];

const analyticsPoints = [
  "Daily clicks & uniques, from 7 to 90 days or any custom range",
  "A live map and leaderboard show where your audience is",
  "Devices, browsers & OS for every screen",
  "Top links ranked by clicks, visitors, and CTR",
  "Every click logged with browser, OS, device, location",
];

const features = [
  {
    title: "Link analytics",
    description:
      "Clicks, unique visitors, countries, and devices for every link — updated live in your dashboard.",
    icon: <LuChartNoAxesColumn className="w-4 h-4" />,
    wide: true,
    visual: (
      <div className="g-feat-visual">
        <ul className="g-feat-list">
          {analyticsPoints.map((p) => (
            <li key={p}>
              <span className="g-sq g-sq-red" aria-hidden="true" />
              {p}
            </li>
          ))}
        </ul>
        <div>
          <div className="g-feat-row">
            <span style={{ color: "var(--g-blue)" }}>TOP LINKS · WEEK</span>
            <span className="g-tnum" style={{ color: "var(--g-muted)" }}>
              {miniBars[0].pct}% ↑
            </span>
          </div>
          <p className="g-feat-note">
            Updated live in your dashboard — no refresh needed.
          </p>
        </div>
      </div>
    ),
  },
  {
    title: "Link management",
    description:
      "Edit destinations, toggle links on or off, and clean up in one screen.",
    icon: <LuListChecks className="w-4 h-4" />,
    visual: (
      <div className="g-feat-visual">
        {[
          { code: "/launch", state: "Active", status: "active" },
          { code: "/sale", state: "Paused", status: "warning" },
        ].map((row) => (
          <div key={row.code} className="g-feat-row">
            <span style={{ color: "var(--g-blue)" }}>{row.code}</span>
            <Chip size="sm" status={row.status}>
              {row.state}
            </Chip>
          </div>
        ))}
      </div>
    ),
  },
  {
    title: "QR codes",
    description:
      "Every link comes with an instant QR code — print it, pin it, scan it anywhere.",
    icon: <LuQrCode className="w-4 h-4" />,
    visual: (
      <div
        className="g-feat-visual"
        style={{ display: "flex", gap: 12, alignItems: "center" }}
      >
        <div
          style={{
            width: 64,
            height: 64,
            border: "2px solid var(--g-ink)",
            padding: 5,
            background: "#fff",
            flexShrink: 0,
          }}
        >
          <QRCode
            value="https://short.link/launch"
            size={50}
            fgColor="#141414"
            bgColor="#FFFFFF"
            level="M"
            style={{ width: "100%", height: "100%" }}
          />
        </div>
        <div className="min-w-0">
          <p
            style={{
              fontFamily: '"JetBrains Mono", monospace',
              fontWeight: 600,
              fontSize: 12,
              color: "var(--g-blue)",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            short{"\u200b"}.link/launch
          </p>
          <p className="g-feat-note" style={{ marginTop: 4 }}>
            Scannable in one tap
          </p>
        </div>
      </div>
    ),
  },
  {
    title: "Guest links",
    description:
      "Shorten without an account — your link lives for 24 hours and converts to a permanent one the moment you sign up.",
    icon: <LuFingerprint className="w-4 h-4" />,
    visual: (
      <div className="g-feat-visual">
        <div className="g-feat-row">
          <span style={{ color: "var(--g-blue)" }}>/guest-2xk9</span>
          <Chip size="sm" status="warning">
            24h lifetime
          </Chip>
        </div>
      </div>
    ),
  },
];

const promises = [
  "No credit card",
  "No trials",
  "No surprise pricing",
  "Every feature, every account",
];

const CoreFeatures = () => {
  return (
    <section className="g-sec">
      <SectionHeading
        eyebrow="Core features"
        title="Everything a short link should be."
        subtitle="The essentials, done well — nothing more, nothing less."
      />

      <motion.div
        variants={staggerContainer(0.08)}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-60px" }}
      >
        <div className="g-feats">
          {features.map((feature) => (
            <motion.div
              key={feature.title}
              variants={fadeUp}
              className={`g-feat ${feature.wide ? "g-feat-wide" : ""}`}
            >
              <span className="g-mark" aria-hidden="true" />
              <span className="g-feat-ico">{feature.icon}</span>
              <h3 className="g-feat-title">{feature.title}</h3>
              <p className="g-feat-desc">{feature.description}</p>
              {feature.visual}
            </motion.div>
          ))}

          <motion.div variants={fadeUp} className="g-inkband">
            <div>
              <span
                className="g-kicker"
                style={{ color: "rgba(245,243,238,0.6)" }}
              >
                Free to start
              </span>
              <p className="g-inkband-title" style={{ marginTop: 10 }}>
                $0 <span className="g-red">today</span>
              </p>
              <p
                style={{
                  color: "rgba(245,243,238,0.7)",
                  fontSize: 13,
                  marginTop: 10,
                  maxWidth: 380,
                  lineHeight: 1.55,
                }}
              >
                Every feature on this page ships with every account. No credit
                card, no trials, no surprise pricing.
              </p>
            </div>
            <ul className="g-inkband-list">
              {promises.map((p) => (
                <li key={p}>
                  <span className="g-sq g-sq-red" aria-hidden="true" />
                  {p}
                </li>
              ))}
            </ul>
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
};

export default CoreFeatures;
