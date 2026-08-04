import { LuChevronDown } from "react-icons/lu";
import InfoTooltip from "./InfoTooltip";

const FilterSelect = ({ label, info, icon, value, onChange, children }) => (
  <label className="flex flex-col gap-1.5 min-w-0">
    {label && (
      <span className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#0A0A0A]">
        {label}
        {info && <InfoTooltip text={info} />}
      </span>
    )}
    <div className="relative">
      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#71717A] pointer-events-none">
        {icon}
      </span>
      <select
        value={value}
        onChange={onChange}
        className="w-full pl-9 pr-8 py-2.5 border border-[#D4D4D8] rounded-md text-sm text-[#0A0A0A] bg-white appearance-none cursor-pointer focus:outline-none focus:border-[#6366F1] focus-visible:ring-[3px] focus-visible:ring-[#6366F1]/20 transition-all"
      >
        {children}
      </select>
      <LuChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#71717A] pointer-events-none" />
    </div>
  </label>
);

export default FilterSelect;
