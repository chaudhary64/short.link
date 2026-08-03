import { useRef } from "react";
import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
} from "motion/react";
import { BarChart } from "../analytics/charts";
import { LuCheck, LuCopy, LuQrCode } from "react-icons/lu";
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

const FloatingChip = ({
  className = "",
  floatDelay = 0,
  enterDelay = 0,
  children,
}) => {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9, y: 12 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ delay: enterDelay, duration: 0.5, ease: EASE }}
      className={`absolute ${className}`}
    >
      <motion.div
        animate={
          reduceMotion ? {} : { y: [0, -7, 0], rotate: [0, 1.5, 0] }
        }
        transition={{
          duration: 5.5,
          delay: floatDelay,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        {children}
      </motion.div>
    </motion.div>
  );
};

const HeroVisual = () => {
  const reduceMotion = useReducedMotion();
  const ref = useRef(null);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], [24, -24]);

  return (
    <motion.div
      ref={ref}
      style={reduceMotion ? undefined : { y }}
      className="relative mx-auto w-full max-w-md lg:max-w-none"
      aria-hidden="true"
    >
      <motion.div
        initial={{ opacity: 0, y: 28 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35, duration: 0.6, ease: EASE }}
        className="relative bg-white border border-[#D4D4D8] rounded-xl p-5 sm:p-6 shadow-[0_8px_30px_rgba(0,0,0,0.06)]"
      >
        <div className="flex items-center justify-between mb-4">
          <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#9C9C9C]">
            Your short link
          </span>
          <span className="flex items-center gap-1.5 text-[11px] font-semibold text-[#10B981]">
            <span className="w-1.5 h-1.5 bg-[#10B981] rounded-full animate-pulse" />
            Active
          </span>
        </div>

        <div className="flex items-center gap-2 bg-[#F6F6F9] border border-[#D4D4D8] rounded-lg px-3.5 py-3 mb-4">
          <span className="font-mono text-sm sm:text-base font-medium text-[#0A0A0A] truncate flex-1">
            short.link/launch
          </span>
          <span className="shrink-0 w-7 h-7 flex items-center justify-center bg-white border border-[#D4D4D8] rounded-md text-[#6B6B6B]">
            <LuCopy className="w-3.5 h-3.5" />
          </span>
        </div>

        <div className="mb-1">
          <div className="flex items-end justify-between mb-2">
            <p className="text-2xl font-display font-bold text-[#0A0A0A] tabular-nums tracking-[-0.03em]">
              530
            </p>
            <span className="text-[11px] text-[#9C9C9C]">clicks this week</span>
          </div>
          <BarChart data={spark} height={92} />
        </div>

        <div className="grid grid-cols-2 gap-3 mt-4">
          <div className="border border-[#D4D4D8] rounded-lg p-3">
            <p className="text-[10px] uppercase tracking-[0.12em] text-[#9C9C9C] mb-1">
              Top country
            </p>
            <p className="text-sm font-medium text-[#0A0A0A]">🇺🇸 United States</p>
          </div>
          <div className="border border-[#D4D4D8] rounded-lg p-3">
            <p className="text-[10px] uppercase tracking-[0.12em] text-[#9C9C9C] mb-1">
              Devices
            </p>
            <p className="text-sm font-medium text-[#0A0A0A]">Desktop · 68%</p>
          </div>
        </div>
      </motion.div>

      <FloatingChip className="-top-6 -right-3 sm:-right-6" floatDelay={0.8} enterDelay={0.7}>
        <div className="bg-white border border-[#D4D4D8] rounded-xl p-3 shadow-[0_8px_30px_rgba(0,0,0,0.08)]">
          <div className="w-11 h-11 bg-[#0A0A0A] text-white flex items-center justify-center rounded-lg">
            <LuQrCode className="w-5 h-5" />
          </div>
          <p className="text-[10px] font-medium text-[#6B6B6B] text-center mt-1.5">
            QR ready
          </p>
        </div>
      </FloatingChip>

      <FloatingChip className="-bottom-6 -left-3 sm:-left-6" floatDelay={1.6} enterDelay={0.9}>
        <div className="bg-white border border-[#D4D4D8] rounded-xl px-3.5 py-2.5 shadow-[0_8px_30px_rgba(0,0,0,0.08)]">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-[#10B981] rounded-full animate-pulse" />
            <span className="text-xs font-semibold text-[#0A0A0A] tabular-nums">
              +128 clicks
            </span>
            <span className="text-[11px] text-[#9C9C9C]">today</span>
          </div>
        </div>
      </FloatingChip>

      <FloatingChip
        className="top-1/2 -right-2 sm:-right-6 hidden sm:block"
        floatDelay={2.4}
        enterDelay={1.1}
      >
        <div className="bg-white border border-[#D4D4D8] rounded-full pl-2 pr-3 py-1.5 shadow-[0_8px_30px_rgba(0,0,0,0.08)] flex items-center gap-1.5">
          <span className="w-4 h-4 rounded-full bg-[#6366F1]/10 text-[#6366F1] flex items-center justify-center">
            <LuCheck className="w-2.5 h-2.5" />
          </span>
          <span className="text-[11px] font-medium text-[#0A0A0A]">Free forever</span>
        </div>
      </FloatingChip>
    </motion.div>
  );
};

export default HeroVisual;
