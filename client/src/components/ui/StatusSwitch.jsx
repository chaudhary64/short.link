const StatusSwitch = ({ status, onChange, disabled = false, className = "" }) => {
  const isActive = status === "active";
  const label =
    status === "warning" ? "Flagged" : isActive ? "Active" : "Disabled";

  const handleClick = () => {
    if (disabled) return;
    onChange(isActive ? "disabled" : "active");
  };

  return (
    <button
      type="button"
      role="switch"
      aria-checked={isActive}
      aria-label={`Link status — ${label}. Click to ${
        isActive ? "disable" : "activate"
      }.`}
      title={isActive ? "Disable link" : "Activate link"}
      onClick={handleClick}
      disabled={disabled}
      className={`inline-flex items-center gap-2 rounded-full border text-xs font-medium transition-all duration-200 cursor-pointer focus:outline-none focus-visible:ring-[3px] focus-visible:ring-[#6366F1]/12 disabled:cursor-not-allowed disabled:opacity-60 px-3 py-1 ${className} ${
        isActive
          ? "bg-[rgba(var(--status-active-rgb),0.1)] text-[#92400E] border-[rgba(var(--status-active-rgb),0.25)] hover:bg-[rgba(var(--status-active-rgb),0.18)]"
          : "bg-[#F4F4F5] text-[#71717A] border-[#D4D4D8] hover:bg-[#E9E9EE] hover:border-[#C1C1C9]"
      }`}
    >
      <span
        className={`w-1.5 h-1.5 rounded-full shrink-0 ${
          isActive
            ? "bg-[rgb(var(--status-active-rgb))] status-dot-pulse"
            : "bg-[#A1A1AA]"
        }`}
      />
      <span className="truncate">{label}</span>
      <span
        aria-hidden="true"
        className={`relative inline-flex items-center w-7 h-4 rounded-full transition-colors duration-200 shrink-0 ${
          isActive ? "bg-[rgb(var(--status-active-rgb))]" : "bg-[#C1C1C9]"
        }`}
      >
        <span
          className={`inline-block w-3 h-3 bg-white rounded-full shadow-sm transition-transform duration-200 ${
            isActive ? "translate-x-3.5" : "translate-x-0.5"
          }`}
        />
      </span>
    </button>
  );
};

export default StatusSwitch;
