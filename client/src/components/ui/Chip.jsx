const Chip = ({
  status = "default",
  dot = true,
  size = "md",
  className = "",
  children,
}) => {
  const statusMeta = {
    active: { dot: "g-sq-red g-sq-pulse", text: "text-[var(--g-red)]" },
    disabled: { dot: "g-sq-muted", text: "text-[var(--g-muted)]" },
    warning: { dot: "g-sq-yellow", text: "text-[var(--g-ink)]" },
    error: { dot: "g-sq-red", text: "text-[var(--g-red)]" },
    default: { dot: "g-sq-muted", text: "text-[var(--g-muted)]" },
  };

  const meta = statusMeta[status] ?? statusMeta.default;
  const sizeCls = size === "sm" ? "g-chip-sm" : "";

  return (
    <span className={`g-chip ${sizeCls} ${meta.text} ${className}`}>
      {dot && <span className={`g-sq ${meta.dot}`} aria-hidden="true" />}
      <span className="truncate">{children}</span>
    </span>
  );
};

export default Chip;
