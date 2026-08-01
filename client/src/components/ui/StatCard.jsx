const StatCard = ({ title, value, description, icon }) => {
  return (
    <div className="bg-white border border-[#D4D4D8] rounded-xl p-5 flex flex-col justify-between transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)]">
      <div className="flex items-start justify-between gap-2">
        <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#9C9C9C]">
          {title}
        </span>
        {icon && (
          <span className="w-10 h-10 bg-gray-50 text-[#0A0A0A] border border-[#D4D4D8] rounded-lg flex items-center justify-center shrink-0">
            {icon}
          </span>
        )}
      </div>
      <p className="text-3xl font-display font-bold text-[#0A0A0A] tabular-nums tracking-[-0.03em] mt-3">
        {value}
      </p>
      {description && <p className="text-xs text-[#6B6B6B] mt-1">{description}</p>}
    </div>
  );
};

export default StatCard;
