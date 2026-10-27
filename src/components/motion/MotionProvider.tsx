"use client";

import { LazyMotion, MotionConfig } from "motion/react";

// domMax (needed for layoutId) loads after hydration, so it adds nothing to first-load JS.
const loadFeatures = () => import("./motion-features").then((mod) => mod.default);

export function MotionProvider({ children }: { children: React.ReactNode }) {
  return (
    <LazyMotion features={loadFeatures} strict>
      <MotionConfig reducedMotion="user">{children}</MotionConfig>
    </LazyMotion>
  );
}
