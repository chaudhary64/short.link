const SegmentedToggle = ({ value, onChange, options, size = "sm" }) => (
  <div
    className={`inline-flex items-center gap-0.5 bg-[#F3F4F6] border border-[#D4D4D8] rounded-full ${
      size === "md" ? "p-1" : "p-0.5"
    }`}
  >
    {options.map((o) => (
      <button
        key={o.value}
        type="button"
        aria-pressed={value === o.value}
        onClick={() => onChange(o.value)}
        className={`${
          size === "md" ? "px-3 py-2" : "px-3 py-1"
        } text-xs font-medium rounded-full transition-all duration-150 cursor-pointer ${
          value === o.value
            ? "bg-white text-[#0A0A0A] shadow-sm ring-1 ring-black/[0.04]"
            : "text-[#6B6B6B] hover:text-[#0A0A0A]"
        }`}
      >
        {o.label}
      </button>
    ))}
  </div>
);

export default SegmentedToggle;
