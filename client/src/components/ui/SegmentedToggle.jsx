const SegmentedToggle = ({ value, onChange, options, size = "sm" }) => (
  <div className="g-tabs">
    {options.map((o) => (
      <button
        key={o.value}
        type="button"
        aria-pressed={value === o.value}
        onClick={() => onChange(o.value)}
        className={`g-tab ${size === "md" ? "" : "g-tab-sm"} ${
          value === o.value ? "on" : ""
        }`}
      >
        {o.label}
      </button>
    ))}
  </div>
);

export default SegmentedToggle;
