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
  const baseClasses =
    "font-medium text-center transition-all duration-200 rounded-md outline-none flex items-center justify-center cursor-pointer focus-visible:ring-[3px] focus-visible:ring-[#6366F1]/12 hover:-translate-y-px active:translate-y-0";

  const sizeClasses = {
    small: "px-3 py-1.5 text-sm",
    medium: "px-4 py-2.5 text-sm",
    large: "px-6 py-[10px] text-base",
  };

  const variants = {
    primary:
      "bg-[#6366F1] text-white hover:bg-[#4F46E5] hover:shadow-[0_4px_12px_rgba(99,102,241,0.35)] disabled:bg-gray-200 disabled:text-gray-500 disabled:hover:bg-gray-200 disabled:hover:shadow-none disabled:cursor-not-allowed",
    secondary:
      "bg-white text-[#0A0A0A] border border-[#E8E8EC] hover:bg-gray-50 hover:border-[#D9D9DE]",
    ghost: "bg-transparent text-[#6B6B6B] hover:text-[#0A0A0A] hover:bg-gray-100",
    destructive:
      "bg-white text-[#EF4444] border border-[#EF4444]/40 hover:bg-red-50 hover:border-[#EF4444] disabled:hover:bg-white disabled:cursor-not-allowed",
  };

  const disabledClasses = disabled ? "cursor-not-allowed opacity-60" : "";

  const isNativeButton = Component === "button";

  const button = (
    <Component
      className={`${baseClasses} ${sizeClasses[size]} ${variants[variant]} ${disabledClasses} ${className}`}
      {...(isNativeButton ? { type, disabled } : { "aria-disabled": disabled })}
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
          whitespace-nowrap rounded bg-[#0A0A0A] px-2.5 py-1.5 text-xs font-medium text-white shadow-lg
          opacity-0 translate-y-1 transition-all duration-200
          group-hover:opacity-100 group-hover:translate-y-0
        "
      >
        {tooltip}

        <span className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-[#0A0A0A]" />
      </span>
    </span>
  );
};

export default Button;
