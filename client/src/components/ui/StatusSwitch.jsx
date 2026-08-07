const StatusSwitch = ({
  status,
  onChange,
  disabled = false,
  className = "",
}) => {
  const isActive = status === "active";
  const label = isActive ? "Active" : "Paused";

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
        isActive ? "pause" : "activate"
      }.`}
      title={isActive ? "Pause link" : "Activate link"}
      onClick={handleClick}
      disabled={disabled}
      className={`g-status ${className}`}
    >
      <span
        className={`g-sq ${isActive ? "g-sq-red" : "g-sq-yellow"}`}
        aria-hidden
      />
      <span>{label.toUpperCase()}</span>
    </button>
  );
};

export default StatusSwitch;
