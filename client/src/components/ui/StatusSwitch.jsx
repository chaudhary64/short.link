import { useCallback, useId, useRef, useState } from "react";

const StatusSwitch = ({
  status,
  onChange,
  disabled = false,
  className = "",
}) => {
  const isActive = status === "active";
  const label = isActive ? "Active" : "Paused";
  const tooltipId = useId();
  const tooltipRef = useRef(null);
  const hostRef = useRef(null);
  const [flip, setFlip] = useState(false);

  const handleClick = () => {
    if (disabled) return;
    onChange(isActive ? "disabled" : "active");
  };

  const checkPosition = useCallback(() => {
    const tooltip = tooltipRef.current;
    const host = hostRef.current;
    if (!tooltip || !host) return;
    const margin = 12;
    const spaceAbove = host.getBoundingClientRect().top;
    const tooltipHeight = tooltip.getBoundingClientRect().height || 40;
    setFlip(spaceAbove < tooltipHeight + margin);
  }, []);

  const posClass = flip ? "top-full mt-2" : "bottom-full mb-2";

  return (
    <span
      ref={hostRef}
      className="relative inline-flex group/tip"
      onPointerEnter={checkPosition}
      onFocus={checkPosition}
    >
      <button
        type="button"
        role="switch"
        aria-checked={isActive}
        aria-label={`Link status — ${label}. Click to ${
          isActive ? "pause" : "activate"
        }.`}
        aria-describedby={tooltipId}
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

      {!disabled && (
        <span
          id={tooltipId}
          ref={tooltipRef}
          role="tooltip"
          className={`pointer-events-none absolute ${posClass} left-1/2 -translate-x-1/2 z-50 whitespace-nowrap bg-[#141414] px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-[0.12em] text-[#f5f3ee] opacity-0 translate-y-1 transition-all duration-100 group-hover/tip:opacity-100 group-hover/tip:translate-y-0 group-focus-within/tip:opacity-100 group-focus-within/tip:translate-y-0 max-sm:left-0 max-sm:translate-x-0 max-sm:whitespace-normal max-sm:max-w-[calc(100vw-2rem)]`}
        >
          {isActive ? "Click to pause this link" : "Click to activate this link"}
          {flip ? (
            <span className="absolute bottom-full left-1/2 -translate-x-1/2 border-4 border-transparent border-b-[#141414] max-sm:left-2 max-sm:translate-x-0" />
          ) : (
            <span className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-[#141414] max-sm:left-2 max-sm:translate-x-0" />
          )}
        </span>
      )}
    </span>
  );
};

export default StatusSwitch;
