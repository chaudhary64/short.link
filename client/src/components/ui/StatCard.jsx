const StatCard = ({ title, value, description, icon }) => {
  return (
    <div className="bg-white border border-[#E8E8EC] rounded-xl p-5 flex flex-col justify-between transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)]">
      <div className="flex justify-between items-start gap-2 mb-4">
        <div>
          <h4 className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#9C9C9C] mb-1">
            {title}
          </h4>
          <span className="text-3xl font-display font-bold text-[#0A0A0A] tabular-nums tracking-[-0.03em]">
            {value}
          </span>
        </div>
        {icon && (
          <div className="w-10 h-10 bg-gray-50 flex items-center justify-center text-[#0A0A0A] border border-[#E8E8EC] rounded-lg shrink-0">
            {icon}
          </div>
        )}
      </div>
      {description && <p className="text-xs text-[#9C9C9C] mt-1">{description}</p>}
    </div>
  );
};

export default StatCard;
