"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

// GSAP, ScrollTrigger, SplitText and Lenis stay out of first-load JS. They arrive with the visitor's first
// scroll, touch, key or mouse movement (everything they animate is below the fold or follows a gesture),
// once the hero's intro sweep has played, so neither the first paint, hydration nor the sweep compete with
// them. Content is complete and visible without them.
const Animators = dynamic(() => import("./Animators"), { ssr: false });

export const FIRST_INTERACTION = ["scroll", "wheel", "touchstart", "pointerdown", "pointermove", "keydown"] as const;

/**
 * Calls `fn` once the hero's intro sweep has played, or at once when there is none, so heavy script
 * evaluation never lands on the sweep's frames (its clip-path reveal runs on the main thread).
 * Returns a cancel function.
 */
export function afterHeroIntro(fn: () => void): () => void {
  const stage = document.getElementById("hero-stage");
  const playing = () => !!stage && (!stage.dataset.state || stage.dataset.state === "intro");
  if (!stage || !playing()) {
    fn();
    return () => {};
  }
  let timer = 0;
  const mo = new MutationObserver(() => {
    if (playing()) return;
    mo.disconnect();
    clearTimeout(timer);
    // The lens or scan bar is taking over at this moment: give it its first second.
    timer = window.setTimeout(fn, 1000);
  });
  mo.observe(stage, { attributes: true, attributeFilter: ["data-state"] });
  // Never wait forever (the inline script settles the stage within 8 s, the handover follows 1.5 s later).
  timer = window.setTimeout(() => {
    mo.disconnect();
    fn();
  }, 10000);
  return () => {
    mo.disconnect();
    clearTimeout(timer);
  };
}

export function Enhance() {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    let cancel = () => {};
    const start = () => {
      stop();
      cancel = afterHeroIntro(() => setReady(true));
    };
    const stop = () => FIRST_INTERACTION.forEach((type) => window.removeEventListener(type, start));
    FIRST_INTERACTION.forEach((type) => window.addEventListener(type, start, { passive: true }));
    return () => {
      stop();
      cancel();
    };
  }, []);
  return ready ? <Animators /> : null;
}
