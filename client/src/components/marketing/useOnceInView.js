import { useEffect, useRef, useState } from "react";

const canObserve = () =>
  typeof window !== "undefined" &&
  "IntersectionObserver" in window &&
  !window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

/**
 * True once the element has been on screen, and never again — the stills play
 * their flow a single time rather than looping.
 *
 * Reduced motion (or a browser without IntersectionObserver) starts out true,
 * so every still renders the frame its animation would have ended on.
 */
export default function useOnceInView(threshold = 0.15) {
  const ref = useRef(null);
  const [seen, setSeen] = useState(() => !canObserve());

  useEffect(() => {
    if (seen) return undefined;

    const el = ref.current;
    if (!el) return undefined;

    // Low threshold on purpose: the stacked mobile rails are taller than the
    // viewport, so anything above ~0.2 would never fire there.
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        setSeen(true);
        observer.disconnect();
      },
      { threshold },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [seen, threshold]);

  return [ref, seen];
}
