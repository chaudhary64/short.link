const Chip = ({ status = 'default', children }) => {
  const statusClasses = {
    active:   "bg-[#10B981]/10 text-[#047857] border-[#10B981]/30",
    disabled: "bg-gray-100  text-gray-500  border-gray-200",
    warning:  "bg-[#F59E0B]/10 text-[#B45309] border-[#F59E0B]/30",
    error:    "bg-[#EF4444]/10 text-[#B91C1C] border-[#EF4444]/30",
    default:  "bg-gray-100  text-gray-600  border-gray-200",
  };

  const dotClasses = {
    active:   "bg-[#10B981]",
    disabled: "bg-gray-400",
    warning:  "bg-[#F59E0B]",
    error:    "bg-[#EF4444]",
    default:  "bg-gray-400",
  };

  const cls = statusClasses[status] ?? statusClasses.default;
  const dot = dotClasses[status]    ?? dotClasses.default;

  return (
    <div className={`inline-flex items-center justify-center gap-1.5 border rounded-full px-3 py-1 text-xs font-medium min-w-[90px] ${cls}`}>
      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${dot}`} />
      {children}
    </div>
  );
};

export default Chip;
