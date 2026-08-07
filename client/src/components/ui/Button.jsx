const Button = ({
  as: Component = "button",
  type = "button",
  variant = "primary",
  size = "medium",
  disabled = false,
  tooltip = "",
  className = "",
  children,
  ...props
}) => {
  const variants = {
    primary: "g-btn",
    secondary: "g-btn g-btn-line",
    ghost: "g-btn-ghost",
    destructive: "g-btn g-btn-red",
  };

  const sizes = {
    small: "g-btn-sm",
    medium: "",
    large: "g-btn-lg",
  };

  const cls = `g-btn-common ${variants[variant]} ${sizes[size]} ${className}`;

  const button = (
    <Component
      className={cls}
      {...(Component === "button"
        ? { type, disabled }
        : { "aria-disabled": disabled })}
      {...props}
    >
      {children}
    </Component>
  );

  if (!tooltip) return button;

  return (
    <span className="relative inline-flex group">
      {button}
      <span
        role="tooltip"
        className="
          pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-2
          whitespace-nowrap bg-[#141414] px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-[0.12em] text-white
          opacity-0 translate-y-1 transition-all duration-200
          group-hover:opacity-100 group-hover:translate-y-0
          max-sm:left-0 max-sm:translate-x-0 max-sm:whitespace-normal max-sm:max-w-[calc(100vw-2rem)]
        "
      >
        {tooltip}
        <span className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-[#141414] max-sm:left-2 max-sm:translate-x-0" />
      </span>
    </span>
  );
};

export default Button;
