const Chip = ({
  status = "default",
  dot = true,
  pulse = true,
  size = "md",
  className = "",
  children,
}) => {
  const statusMeta = {
    active: { dot: "g-sq-red", text: "text-[var(--g-red)]" },
    disabled: { dot: "g-sq-muted", text: "text-[var(--g-muted)]" },
    warning: { dot: "g-sq-yellow", text: "text-[var(--g-ink)]" },
    error: { dot: "g-sq-red", text: "text-[var(--g-red)]" },
    default: { dot: "g-sq-muted", text: "text-[var(--g-muted)]" },
  };

  const meta = statusMeta[status] ?? statusMeta.default;
  const sizeCls = size === "sm" ? "g-chip-sm" : "";
  const dotCls = pulse && status === "active" ? `${meta.dot} g-sq-pulse` : meta.dot;

  return (
    <span className={`g-chip ${sizeCls} ${meta.text} ${className}`}>
      {dot && <span className={`g-sq ${dotCls}`} aria-hidden="true" />}
      <span className="truncate">{children}</span>
    </span>
  );
};

export default Chip;
