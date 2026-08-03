const Chip = ({
  status = "default",
  dot = true,
  size = "md",
  className = "",
  children,
}) => {
  const statusClasses = {
    active: "bg-[#10B981]/10 text-[#047857] border-[#10B981]/25",
    disabled: "bg-[#F4F4F5] text-[#71717A] border-[#D4D4D8]",
    warning: "bg-[#F59E0B]/10 text-[#B45309] border-[#F59E0B]/25",
    error: "bg-[#EF4444]/10 text-[#B91C1C] border-[#EF4444]/25",
    default: "bg-[#F4F4F5] text-[#71717A] border-[#D4D4D8]",
  };

  const dotClasses = {
    active: "bg-[#10B981] shadow-[0_0_0_3px_rgba(16,185,129,0.18)]",
    disabled: "bg-[#A1A1AA]",
    warning: "bg-[#F59E0B] shadow-[0_0_0_3px_rgba(245,158,11,0.18)]",
    error: "bg-[#EF4444] shadow-[0_0_0_3px_rgba(239,68,68,0.18)]",
    default: "bg-[#A1A1AA]",
  };

  const cls = statusClasses[status] ?? statusClasses.default;
  const dotCls = dotClasses[status] ?? dotClasses.default;
  const isActive = status === "active";
  const sizeCls =
    size === "sm" ? "px-2.5 py-0.5 min-w-fit" : "px-3 py-1 min-w-[90px]";

  return (
    <span
      className={`inline-flex items-center justify-center gap-1.5 rounded-full border text-xs font-medium shadow-[inset_0_1px_0_rgba(255,255,255,0.7),0_1px_2px_rgba(0,0,0,0.04)] ${sizeCls} ${cls} ${className}`}
    >
      {dot && (
        <span
          className={`w-1.5 h-1.5 rounded-full shrink-0 ${dotCls} ${
            isActive ? "status-dot-pulse" : ""
          }`}
        />
      )}
      <span className="truncate">{children}</span>
    </span>
  );
};

export default Chip;
