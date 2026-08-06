import {
  useCallback,
  useId,
  useLayoutEffect,
  useEffect,
  useRef,
  useState,
} from "react";
import { LuCircleHelp } from "react-icons/lu";

const InfoTooltip = ({ text }) => {
  const tooltipId = useId();
  const tooltipRef = useRef(null);
  const hostRef = useRef(null);
  const [align, setAlign] = useState("center");

  const checkPosition = useCallback(() => {
    const tooltip = tooltipRef.current;
    const host = hostRef.current;
    if (!tooltip || !host) return;

    const t = tooltip.getBoundingClientRect();
    const h = host.getBoundingClientRect();
    const margin = 12;
    const rightLimit = window.innerWidth - margin;

    const centerLeft = h.left + (h.width - t.width) / 2;
    const centerRight = centerLeft + t.width;

    const fitsCenter = centerLeft >= margin && centerRight <= rightLimit;
    const fitsRight = h.right <= rightLimit;
    const fitsLeft = h.left >= margin;

    let next = "center";
    if (!fitsCenter) {
      if (centerRight > rightLimit && fitsRight) next = "right";
      else if (centerLeft < margin && fitsLeft) next = "left";
    }
    setAlign((prev) => (prev === next ? prev : next));
  }, []);

  useLayoutEffect(() => {
    checkPosition();
  }, [checkPosition]);

  useEffect(() => {
    window.addEventListener("resize", checkPosition);
    return () => window.removeEventListener("resize", checkPosition);
  }, [checkPosition]);

  return (
    <span
      ref={hostRef}
      className="relative inline-flex group/tip"
      onPointerEnter={checkPosition}
      onFocus={checkPosition}
    >
      <span
        role="img"
        tabIndex={0}
        aria-label={text}
        aria-describedby={tooltipId}
        className="inline-flex items-center justify-center w-4 h-4 border border-[#8a8578] text-[#8a8578] hover:text-[#141414] hover:border-[#141414] transition-colors cursor-help focus:outline-none focus-visible:border-[#1d4ed8]"
      >
        <LuCircleHelp className="w-3 h-3" />
      </span>

      <span
        id={tooltipId}
        ref={tooltipRef}
        role="tooltip"
        className={`pointer-events-none absolute bottom-full mb-2 z-[9999] w-60 max-w-[calc(100vw-2rem)] whitespace-normal border-2 border-[#f5f3ee] bg-[#141414] px-3 py-2 text-xs font-normal text-[#f5f3ee] opacity-0 translate-y-1 transition-all duration-100 group-hover/tip:opacity-100 group-hover/tip:translate-y-0 group-focus-within/tip:opacity-100 group-focus-within/tip:translate-y-0 ${
          align === "left"
            ? "left-0"
            : align === "right"
              ? "right-0"
              : "left-1/2 -translate-x-1/2"
        }`}
      >
        {text}
        <span
          className={`absolute top-full border-4 border-transparent border-t-[#141414] ${
            align === "left"
              ? "left-2.5"
              : align === "right"
                ? "right-2.5"
                : "left-1/2 -translate-x-1/2"
          }`}
        />
      </span>
    </span>
  );
};

export default InfoTooltip;
