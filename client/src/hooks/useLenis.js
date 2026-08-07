import { useCallback, useEffect, useRef } from "react";
import Lenis from "lenis";

const useLenis = (options = {}) => {
  const lenisRef = useRef(null);

  useEffect(() => {
    const reduceMotion = window.matchMedia?.(
      "(prefers-reduced-motion: reduce)",
    )?.matches;
    if (reduceMotion) return;

    const lenis = new Lenis({
      autoRaf: true,
      ...options,
    });
    lenisRef.current = lenis;
    return () => {
      lenis.destroy();
      lenisRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const scrollTo = useCallback((target, opts = {}) => {
    const lenis = lenisRef.current;
    if (lenis) {
      lenis.scrollTo(target, opts);
      return;
    }

    const reduceMotion = window.matchMedia?.(
      "(prefers-reduced-motion: reduce)",
    )?.matches;
    const behavior = reduceMotion ? "auto" : "smooth";
    if (typeof target === "number") {
      window.scrollTo({ top: target, behavior });
    } else if (typeof target === "string") {
      document
        .querySelector(target)
        ?.scrollIntoView({ behavior, block: "start" });
    } else if (target?.scrollIntoView) {
      target.scrollIntoView({ behavior, block: "start" });
    }
  }, []);

  return scrollTo;
};

export default useLenis;
