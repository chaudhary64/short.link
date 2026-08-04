import { motion } from "motion/react";
import { LuArrowDown, LuArrowUp, LuCheck } from "react-icons/lu";
import InfoTooltip from "./InfoTooltip";

const TONE = {
  positive: {
    color: "text-[#047857]",
    icon: <LuArrowUp className="w-3 h-3 shrink-0" />,
  },
  success: {
    color: "text-[#047857]",
    icon: <LuCheck className="w-3 h-3 shrink-0" />,
  },
  warning: {
    color: "text-[#B45309]",
    icon: <span className="w-1.5 h-1.5 rounded-full bg-current shrink-0" />,
  },
  neutral: { color: "text-[#6B6B6B]", icon: null },
};

const Description = ({ description }) => {
  if (description && typeof description === "object") {
    const tone = TONE[description.tone] ?? TONE.neutral;
    return (
      <p
        className={`text-xs font-medium mt-1 truncate flex items-center gap-1.5 ${tone.color}`}
      >
        {tone.icon}
        <span className="truncate">{description.text}</span>
      </p>
    );
  }
  return <p className="text-xs text-[#6B6B6B] mt-1 truncate">{description}</p>;
};

const StatCard = ({
  title,
  value,
  description,
  icon,
  delta,
  spark,
  sparkMax,
  variants,
  info,
  titleClassName = "text-[#6B6B6B]",
}) => (
  <motion.div
    variants={variants}
    className="bg-white border border-[#D4D4D8] rounded-xl p-5 flex flex-col justify-between transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)]"
  >
    <div className="flex items-start justify-between gap-2">
      <span className={`text-[11px] font-semibold uppercase tracking-[0.12em] flex items-center gap-1 ${titleClassName}`}>
        {title}
        {info && <InfoTooltip text={info} />}
      </span>
      {icon && (
        <span className="w-10 h-10 bg-[#F3F4F6] text-[#0A0A0A] border border-[#D4D4D8] rounded-lg flex items-center justify-center shrink-0">
          {icon}
        </span>
      )}
    </div>
    <div className="flex items-end justify-between gap-3 mt-3">
      <div className="min-w-0">
        <p className="text-3xl font-display font-bold text-[#0A0A0A] tabular-nums tracking-[-0.03em] leading-none truncate">
          {value}
        </p>
        {description && <Description description={description} />}
      </div>
      {delta != null && (
        <span
          title="Change vs the previous period"
          className={`inline-flex items-center gap-0.5 text-xs font-semibold tabular-nums shrink-0 pb-0.5 ${
            delta >= 0 ? "text-[#10B981]" : "text-[#EF4444]"
          }`}
        >
          {delta >= 0 ? (
            <LuArrowUp className="w-3 h-3" />
          ) : (
            <LuArrowDown className="w-3 h-3" />
          )}
          {Math.abs(delta).toFixed(1)}%
        </span>
      )}
    </div>
    {spark && (
      <div className="mt-4 -mx-1">
        {sparkMax != null && (
          <div className="flex justify-end mb-0.5 pr-1">
            <span className="text-[9px] font-medium tabular-nums text-[#71717A]">
              {Number(sparkMax).toLocaleString()}
            </span>
          </div>
        )}
        {spark}
      </div>
    )}
  </motion.div>
);

export default StatCard;
