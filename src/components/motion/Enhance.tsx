"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

// GSAP, ScrollTrigger, SplitText and Lenis stay out of first-load JS. They arrive with the visitor's first
// scroll, touch, key or mouse movement (everything they animate is below the fold or follows a gesture),
// so the first paint and hydration never compete with them. Content is complete and visible without them.
const Animators = dynamic(() => import("./Animators"), { ssr: false });

export const FIRST_INTERACTION = ["scroll", "wheel", "touchstart", "pointerdown", "pointermove", "keydown"] as const;

export function Enhance() {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const start = () => {
      stop();
      setReady(true);
    };
    const stop = () => FIRST_INTERACTION.forEach((type) => window.removeEventListener(type, start));
    FIRST_INTERACTION.forEach((type) => window.addEventListener(type, start, { passive: true }));
    return stop;
  }, []);
  return ready ? <Animators /> : null;
}
