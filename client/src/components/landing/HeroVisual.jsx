import { motion } from "motion/react";
import { BarChart } from "../analytics/charts";
import Chip from "../ui/Chip";
import { LuCopy, LuQrCode } from "react-icons/lu";
import { EASE } from "../../utils/motion";

const spark = [
  { label: "Mon", value: 42 },
  { label: "Tue", value: 58 },
  { label: "Wed", value: 51 },
  { label: "Thu", value: 74 },
  { label: "Fri", value: 96 },
  { label: "Sat", value: 88 },
  { label: "Sun", value: 121 },
];

const FloatPlate = ({ className = "", enterDelay = 0, children }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: enterDelay, duration: 0.4, ease: EASE }}
      className={`absolute ${className}`}
    >
      {children}
    </motion.div>
  );
};

const HeroVisual = () => {
  return (
    <div className="relative w-full" aria-hidden="true">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25, duration: 0.5, ease: EASE }}
        className="g-spec"
      >
        <span className="g-mark" aria-hidden="true" />

        <div className="g-spec-head">
          <span className="g-spec-label">Your short link</span>
          <Chip size="sm" status="active">
            Active
          </Chip>
        </div>

        <div className="g-spec-code">
          <span className="mono">short.link/launch</span>
          <span className="g-spec-copy" title="Copy short link">
            <LuCopy className="w-3.5 h-3.5" />
          </span>
        </div>

        <div className="g-spec-chart">
          <div className="g-spec-chart-head">
            <span className="g-spec-num">530</span>
            <span className="g-spec-note">Clicks this week</span>
          </div>
          <BarChart data={spark} height={92} />
        </div>

        <div className="g-spec-cells">
          <div className="g-spec-cell">
            <p className="g-spec-cell-label">Top country</p>
            <p className="g-spec-cell-val">United States</p>
          </div>
          <div className="g-spec-cell">
            <p className="g-spec-cell-label">Devices</p>
            <p className="g-spec-cell-val">Desktop · 68%</p>
          </div>
        </div>
      </motion.div>

      <FloatPlate
        className="-top-5 -right-3 sm:-right-5"
        enterDelay={0.6}
      >
        <div className="g-float">
          <span className="g-sq g-sq-red" aria-hidden="true" />
          <span className="g-float-num">QR</span>
          <span className="g-float-label">ready</span>
          <LuQrCode className="w-4 h-4 text-[var(--g-ink)]" />
        </div>
      </FloatPlate>

      <FloatPlate
        className="-bottom-6 -left-3 sm:-left-5"
        enterDelay={0.75}
      >
        <div className="g-float">
          <span className="g-sq g-sq-red g-sq-pulse" aria-hidden="true" />
          <span className="g-float-num">+128</span>
          <span className="g-float-label">today</span>
        </div>
      </FloatPlate>
    </div>
  );
};

export default HeroVisual;
