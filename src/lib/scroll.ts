import type Lenis from "lenis";

/**
 * Smooth scrolling exists only on fine pointers with motion allowed (see motion/Animators.tsx).
 * Everything else uses native scrolling, so callers must treat Lenis as optional.
 */
let instance: Lenis | null = null;

export const setLenis = (lenis: Lenis | null) => {
  instance = lenis;
};

export const getLenis = () => instance;

/** Locks page scroll for an open menu or sheet. Returns the unlock function. */
export function lockScroll() {
  const html = document.documentElement;
  const prev = { overflow: html.style.overflow, gutter: html.style.scrollbarGutter };
  // Keep the scrollbar's space while it is hidden, so the page behind doesn't shift sideways.
  html.style.scrollbarGutter = "stable";
  html.style.overflow = "hidden";
  instance?.stop();
  return () => {
    html.style.overflow = prev.overflow;
    html.style.scrollbarGutter = prev.gutter;
    instance?.start();
  };
}

/** Scrolls to an in-page anchor, through Lenis when it is running. */
export function scrollToHash(hash: string) {
  const target = document.querySelector(hash);
  if (!target) return;
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (instance) instance.scrollTo(target as HTMLElement, { offset: -80, immediate: reduce });
  else target.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
  history.replaceState(null, "", hash);
}
