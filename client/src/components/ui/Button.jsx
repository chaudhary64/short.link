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
    "font-medium text-center transition-all duration-200 rounded-none outline-none flex items-center justify-center cursor-pointer focus-visible:ring-2 focus-visible:ring-gray-900/30 focus-visible:ring-offset-2";

  const sizeClasses = {
    small: "px-3 py-1.5 text-sm",
    medium: "px-4 py-2 text-sm",
    large: "px-6 py-3 text-base",
  };

  const variants = {
    primary:
      "bg-gray-900 text-white hover:bg-gray-800 active:bg-gray-950 disabled:bg-gray-200 disabled:text-gray-500 disabled:cursor-not-allowed shadow-sm",
    secondary:
      "bg-white text-gray-900 border border-gray-200 hover:bg-gray-50 hover:border-gray-300 shadow-sm",
    accent:
      "bg-gray-900 text-white hover:bg-gray-800 active:bg-gray-950 disabled:bg-gray-200 disabled:text-gray-500 disabled:cursor-not-allowed shadow-sm",
    ghost: "bg-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-100",
    destructive: "bg-red-500 text-white hover:bg-red-600 shadow-sm",
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
          whitespace-nowrap rounded bg-gray-900 px-2.5 py-1.5 text-xs font-medium text-white shadow-lg
          opacity-0 translate-y-1 transition-all duration-200
          group-hover:opacity-100 group-hover:translate-y-0
        "
      >
        {tooltip}

        <span className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900" />
      </span>
    </span>
  );
};

export default Button;
