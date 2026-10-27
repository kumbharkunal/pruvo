"use client";

import { useEffect, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { useGSAP } from "@gsap/react";
import { ReactLenis, useLenis } from "lenis/react";
import { setLenis } from "@/lib/scroll";

gsap.registerPlugin(ScrollTrigger, SplitText, useGSAP);
ScrollTrigger.config({ ignoreMobileResize: true });

const INK = "#0E1838";
const VERIFIED = "#3A6E2E";

/** Smooth scrolling only where it helps: mouse/trackpad, motion allowed. Touch stays native. */
const wantsSmooth = () =>
  window.matchMedia("(hover: hover) and (pointer: fine)").matches && !window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/** Checkpoints: pinned "closer look" on desktop (systems light up in sequence); checks draw on enter on phones. */
function checkpoints(desktop: boolean) {
  const section = document.getElementById("checkpoints");
  if (!section) return;
  const rows = gsap.utils.toArray<HTMLElement>("[data-cp-row]", section);
  const spots = gsap.utils.toArray<HTMLElement>("[data-cp-spot]", section);
  const insets = gsap.utils.toArray<HTMLElement>("[data-cp-inset]", section);
  const counter = section.querySelector<HTMLElement>("[data-cp-count]");
  const bar = section.querySelector<HTMLElement>("[data-cp-bar]");
  section.classList.add("is-armed");

  if (desktop) {
    const stage = section.querySelector<HTMLElement>("[data-cp-stage]");
    if (!stage) return;
    let current = -2;
    const setActive = (i: number) => {
      if (i === current) return;
      current = i;
      rows.forEach((r, k) => {
        r.classList.toggle("is-active", k === i);
        r.classList.toggle("is-done", k <= i);
      });
      spots.forEach((s, k) => s.classList.toggle("is-active", k === i));
      const id = rows[i]?.dataset.cpRow;
      insets.forEach((el) => el.classList.toggle("is-active", el.dataset.cpInset === id));
      if (counter) counter.textContent = `${Math.max(1, i + 1)} of ${rows.length}`;
    };
    setActive(-1);
    ScrollTrigger.create({
      trigger: stage,
      start: "top top+=84",
      end: `+=${rows.length * 92}`,
      pin: true,
      anticipatePin: 1,
      invalidateOnRefresh: true,
      onUpdate: (self) => {
        setActive(Math.min(rows.length - 1, Math.floor(self.progress * rows.length)));
        if (bar) bar.style.transform = `scaleX(${self.progress.toFixed(4)})`;
      },
      onLeaveBack: () => setActive(-1),
    });
  } else {
    ScrollTrigger.batch(rows, {
      start: "top 88%",
      once: true,
      onEnter: (els) => els.forEach((el, k) => gsap.delayedCall(k * 0.06, () => el.classList.add("is-done"))),
    });
  }
  return () => section.classList.remove("is-armed");
}

/** "Verify the facts." fills from ink to verified green, word by word, as it scrolls in. */
function verifyFacts() {
  const el = document.querySelector<HTMLElement>("[data-verify-fill]");
  if (!el) return;
  SplitText.create(el, {
    type: "words",
    autoSplit: true,
    onSplit(self) {
      return gsap.fromTo(
        self.words,
        { color: INK },
        { color: VERIFIED, stagger: 0.18, ease: "none", scrollTrigger: { trigger: el, start: "top 85%", end: "top 55%", scrub: 0.4 } },
      );
    },
  });
}

/** Section openers rise 14px once. Anything already on screen is left alone (no flash). */
function reveals() {
  gsap.utils.toArray<HTMLElement>("[data-reveal]").forEach((el) => {
    if (ScrollTrigger.isInViewport(el, 0.01)) return;
    gsap.from(el, { y: 14, autoAlpha: 0, duration: 0.62, ease: "expo.out", scrollTrigger: { trigger: el, start: "top 88%", once: true } });
  });
}

/** How it works: the connector draws along the sequence, steps follow it. */
function howItWorks() {
  const list = document.querySelector<HTMLElement>("[data-how]");
  if (!list || ScrollTrigger.isInViewport(list, 0.2)) return;
  const tl = gsap.timeline({ scrollTrigger: { trigger: list, start: "top 82%", once: true } });
  tl.from("[data-how-rule]", { scaleX: 0, scaleY: 0, duration: 0.9, ease: "expo.out" }).from(
    "[data-how-step]",
    { y: 14, autoAlpha: 0, stagger: 0.06, duration: 0.62, ease: "expo.out" },
    0.1,
  );
}

/** Why Pruvo: the portrait is uncovered from the bottom, once. */
function portrait() {
  const el = document.querySelector<HTMLElement>("[data-portrait]");
  if (!el || ScrollTrigger.isInViewport(el, 0.1)) return;
  gsap.fromTo(
    el,
    { clipPath: "inset(100% 0% 0% 0%)" },
    { clipPath: "inset(0% 0% 0% 0%)", duration: 0.9, ease: "expo.out", scrollTrigger: { trigger: el, start: "top 85%", once: true } },
  );
}

/**
 * One clock for everything: GSAP's ticker drives Lenis (autoRaf off), and every Lenis scroll updates
 * ScrollTrigger. Reads the instance from context, so it can never miss it.
 */
function LenisBridge() {
  const lenis = useLenis();
  useEffect(() => {
    if (!lenis) return;
    setLenis(lenis);
    lenis.on("scroll", ScrollTrigger.update);
    const tick = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);
    return () => {
      gsap.ticker.remove(tick);
      lenis.off("scroll", ScrollTrigger.update);
      setLenis(null);
    };
  }, [lenis]);
  return null;
}

export default function Animators() {
  const [smooth] = useState(wantsSmooth);

  useGSAP(() => {
    const mm = gsap.matchMedia();
    mm.add({ desktop: "(min-width: 1024px)", motion: "(prefers-reduced-motion: no-preference)" }, (ctx) => {
      const { desktop, motion } = ctx.conditions as { desktop: boolean; motion: boolean };
      if (!motion) return;
      const undoCheckpoints = checkpoints(desktop);
      verifyFacts();
      reveals();
      howItWorks();
      portrait();
      return () => undoCheckpoints?.();
    });
    // Pin and trigger positions depend on web fonts and images; measure again once they're in.
    document.fonts?.ready.then(() => ScrollTrigger.refresh());
    window.addEventListener("load", () => ScrollTrigger.refresh(), { once: true });
    return () => mm.revert();
  });

  return smooth ? (
    <ReactLenis root options={{ autoRaf: false, lerp: 0.12, smoothWheel: true, anchors: { offset: -80 } }}>
      <LenisBridge />
    </ReactLenis>
  ) : null;
}
