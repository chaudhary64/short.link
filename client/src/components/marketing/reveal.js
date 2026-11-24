import { useReducedMotion } from "motion/react";

/**
 * Entrance motion shared by the marketing sections.
 *
 * Everything here is "rest → play": a section puts its own motion element in
 * the play state when it scrolls into view, and that state travels down to
 * every child declaring the same variant names.
 */
const EASE = [0.22, 1, 0.36, 1];

/** Parent: its children play one after another. */
export const group = {
  rest: {},
  play: { transition: { staggerChildren: 0.08 } },
};

/** Section-head lines: a short rise. */
export const rise = {
  rest: { opacity: 0, y: 14 },
  play: { opacity: 1, y: 0, transition: { duration: 0.5, ease: EASE } },
};

/** Cards: the same rise, from a little further down. */
export const lift = {
  rest: { opacity: 0, y: 18 },
  play: { opacity: 1, y: 0, transition: { duration: 0.5, ease: EASE } },
};

/**
 * The props a reveal needs: play once when this much of the block is in view.
 * Reduced motion starts in "play", so the finished frame is simply there.
 */
export function useReveal(amount = 0.15) {
  const reduced = useReducedMotion();
  return {
    initial: reduced ? "play" : "rest",
    whileInView: "play",
    viewport: { once: true, amount },
  };
}
