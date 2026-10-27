"use client";

import { LazyMotion, MotionConfig, domMax } from "motion/react";
import * as m from "motion/react-m";

/**
 * The nav's sliding active-section indicator (one shared layoutId across the links). It only exists once
 * a section is active, so Motion and its layout features load then, never with the page.
 */
export default function NavIndicator() {
  return (
    <LazyMotion features={domMax} strict>
      <MotionConfig reducedMotion="user">
        <m.span layoutId="nav-indicator" className="nav-indicator" transition={{ type: "spring", duration: 0.42, bounce: 0.14 }} />
      </MotionConfig>
    </LazyMotion>
  );
}
