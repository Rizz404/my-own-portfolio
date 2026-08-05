import type { MotionVariants } from "@vueuse/motion";
import { useReducedMotion } from "@vueuse/motion";

/**
 * `@vueuse/motion` expresses `duration`/`delay` in seconds, not milliseconds.
 */
const STAGGER_STEP = 0.06;
const MAX_STAGGER_INDEX = 7;

const prefersReducedMotion = useReducedMotion();

/**
 * Delay (in seconds) for the nth item of a staggered grid/list, capped so
 * long grids (paginated Project/Blog views) don't make late items wait too long.
 */
export function staggerDelay(index: number): number {
  return Math.min(index, MAX_STAGGER_INDEX) * STAGGER_STEP;
}

type FadeVariants = MotionVariants<"initial" | "enter" | "visibleOnce">;

/**
 * Fade + rise-in animation that plays as soon as the element mounts.
 * Use for grid items, skeletons and error states that appear/replace each
 * other via v-if/v-else - anything already gated behind a loading state.
 */
export function fadeUp(delay = 0): FadeVariants {
  if (prefersReducedMotion.value) {
    return {
      initial: { opacity: 1, y: 0 },
      enter: { opacity: 1, y: 0, transition: { duration: 0 } },
    };
  }

  return {
    initial: { opacity: 0, y: 16 },
    enter: { opacity: 1, y: 0, transition: { duration: 0.5, delay, ease: "easeOut" } },
  };
}

/**
 * Fade + rise-in animation that only plays once the element scrolls into
 * view. Use for static, below-the-fold sections that aren't gated behind a
 * loading state (so a mount-triggered animation would already be finished by
 * the time the user scrolls to them).
 */
export function revealUp(delay = 0): FadeVariants {
  if (prefersReducedMotion.value) {
    return {
      initial: { opacity: 1, y: 0 },
      visibleOnce: { opacity: 1, y: 0, transition: { duration: 0 } },
    };
  }

  return {
    initial: { opacity: 0, y: 24 },
    visibleOnce: { opacity: 1, y: 0, transition: { duration: 0.7, delay, ease: "easeOut" } },
  };
}
