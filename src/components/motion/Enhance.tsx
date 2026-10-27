"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

// GSAP, ScrollTrigger, SplitText and Lenis stay out of first-load JS: they arrive once the browser is
// idle and attach to the server-rendered page. Content is complete and visible without them.
const Animators = dynamic(() => import("./Animators"), { ssr: false });

export function Enhance() {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const start = () => setReady(true);
    if ("requestIdleCallback" in window) {
      const id = window.requestIdleCallback(start, { timeout: 2500 });
      return () => window.cancelIdleCallback(id);
    }
    const id = setTimeout(start, 1200); // Safari has no requestIdleCallback
    return () => clearTimeout(id);
  }, []);
  return ready ? <Animators /> : null;
}
