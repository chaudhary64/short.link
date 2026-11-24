import { useEffect, useRef } from "react";
import Lenis from "lenis";
import "lenis/dist/lenis.css";

/**
 * Lenis on the marketing page, and only there: the instance is created when
 * the home page mounts and destroyed when it unmounts, so the app's own
 * scrolling is never touched.
 *
 * The returned ref is what the page's anchor scrolling uses — Lenis owns the
 * scroll position while it runs, and its stylesheet turns native smooth
 * scrolling off, so `window.scrollTo` would jump.
 */
export default function useLenis() {
  const lenisRef = useRef(null);

  useEffect(() => {
    const lenis = new Lenis({
      autoRaf: true,
      // Smooth wheel scrolling is motion; honour the same preference the
      // page's animations do.
      smoothWheel: !window.matchMedia("(prefers-reduced-motion: reduce)")
        .matches,
    });
    lenisRef.current = lenis;

    return () => {
      lenis.destroy();
      lenisRef.current = null;
    };
  }, []);

  return lenisRef;
}
