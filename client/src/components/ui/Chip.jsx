import React from 'react';

const Chip = ({ status = 'default', children }) => {
  const statusClasses = {
    active:   "bg-emerald-50 text-emerald-700 border-emerald-200",
    disabled: "bg-gray-100  text-gray-500  border-gray-200",
    warning:  "bg-amber-50  text-amber-700  border-amber-200",
    error:    "bg-red-50    text-red-700    border-red-200",
    default:  "bg-gray-100  text-gray-600  border-gray-200",
  };

  const dotClasses = {
    active:   "bg-emerald-500",
    disabled: "bg-gray-400",
    warning:  "bg-amber-500",
    error:    "bg-red-500",
    default:  "bg-gray-400",
  };

  const cls = statusClasses[status] ?? statusClasses.default;
  const dot = dotClasses[status]    ?? dotClasses.default;

  return (
    <div className={`inline-flex items-center justify-center gap-1.5 border rounded-none px-2.5 py-0.5 text-xs font-medium min-w-[80px] ${cls}`}>
      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${dot}`} />
      {children}
    </div>
  );
};

export default Chip;
