import { useEffect, useRef, useState } from "react";

const useCountUp = (
  target,
  { duration = 800, decimals = 0, delay = 0, enabled = true } = {},
) => {
  const [display, setDisplay] = useState(0);
  const fromRef = useRef(0);

  useEffect(() => {
    if (!enabled || !Number.isFinite(target)) {
      return undefined;
    }

    const reduceMotion = window.matchMedia?.(
      "(prefers-reduced-motion: reduce)",
    )?.matches;
    if (reduceMotion) {
      fromRef.current = target;
      const timer = setTimeout(() => setDisplay(target), delay);
      return () => clearTimeout(timer);
    }

    const from = fromRef.current;
    const factor = 10 ** decimals;
    let raf;
    let timer = null;

    const begin = () => {
      const start = performance.now();
      const tick = (now) => {
        const p = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - p, 3);
        const value =
          Math.round((from + (target - from) * eased) * factor) / factor;
        fromRef.current = value;
        setDisplay(value);
        if (p < 1) raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
    };

    if (delay > 0) {
      timer = setTimeout(begin, delay);
    } else {
      begin();
    }

    return () => {
      if (timer !== null) clearTimeout(timer);
      cancelAnimationFrame(raf);
    };
  }, [target, duration, decimals, delay, enabled]);

  return display;
};

export default useCountUp;
