const Card = ({ title, icon, right, className = "", titleClassName = "", children }) => (
  <div
    className={`bg-white border border-[#D4D4D8] rounded-xl flex flex-col transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)] ${className}`}
  >
    {(title || icon || right) && (
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#D4D4D8]">
        <span className={`flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.12em] ${titleClassName || "text-[#71717A]"}`}>
          {icon && <span className={`${titleClassName || "text-[#71717A]"} shrink-0`}>{icon}</span>}
          {title}
        </span>
        {right}
      </div>
    )}
    <div className="p-5 flex-1">{children}</div>
  </div>
);

export default Card;
