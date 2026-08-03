import { motion } from "motion/react";
import { LuArrowDown, LuArrowUp, LuCircleHelp } from "react-icons/lu";

const StatCard = ({ title, value, description, icon, delta, spark, variants, info }) => (
  <motion.div
    variants={variants}
    className="bg-white border border-[#D4D4D8] rounded-xl p-5 flex flex-col justify-between transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)]"
  >
    <div className="flex items-start justify-between gap-2">
      <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#9C9C9C] flex items-center gap-1">
        {title}
        {info && (
          <span
            role="img"
            title={info}
            aria-label={info}
            className="inline-flex items-center justify-center w-4 h-4 rounded-full text-[#9C9C9C] hover:text-[#0A0A0A] hover:bg-[#F3F4F6] transition-colors cursor-help"
          >
            <LuCircleHelp className="w-3.5 h-3.5" />
          </span>
        )}
      </span>
      {icon && (
        <span className="w-10 h-10 bg-gray-50 text-[#0A0A0A] border border-[#D4D4D8] rounded-lg flex items-center justify-center shrink-0">
          {icon}
        </span>
      )}
    </div>
    <div className="flex items-end justify-between gap-3 mt-3">
      <div className="min-w-0">
        <p className="text-3xl font-display font-bold text-[#0A0A0A] tabular-nums tracking-[-0.03em] leading-none truncate">
          {value}
        </p>
        {description && (
          <p className="text-xs text-[#6B6B6B] mt-1 truncate">{description}</p>
        )}
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
    {spark && <div className="mt-4 -mx-1">{spark}</div>}
  </motion.div>
);

export default StatCard;
