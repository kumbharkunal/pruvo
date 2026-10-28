"use client";

import { useEffect, useRef, useState } from "react";

type Mode = "idle" | "lens" | "bar";

const INTRO_MS = (0.15 + 0.95 + 0.35) * 1000; // delay + sweep + a short hold with every marker locked
const LENS_R = 118;

/**
 * Takes over the hero once the CSS intro has played.
 * - Mouse/trackpad on wide screens: the blueprint dissolves and returns as a lens that follows the
 *   pointer anywhere in the hero, even over the copy (critically damped, kept on the car), and rests on
 *   the car when the pointer leaves or is on a button.
 * - Touch or narrow screens: the blueprint settles into a split with a draggable scan bar that rides the
 *   blueprint's edge as it settles (its grip carries the drag cue, so nothing moves on its own).
 *   touch-action: pan-y keeps vertical scrolling native.
 * - Everyone: a real range input (transparent, laid over the car) drives the same view for keyboard and
 *   screen-reader users; its focus ring frames the car.
 * Only transform, opacity and clip-path change; all work pauses while the hero is off screen.
 */
export function HeroLens({ label }: { label: string }) {
  const ring = useRef<HTMLSpanElement>(null);
  const handle = useRef<HTMLSpanElement>(null);
  const range = useRef<HTMLInputElement>(null);
  const [value, setValue] = useState(62);
  const mode = useRef<Mode>("idle");
  const api = useRef<{ setFromRange: (v: number) => void } | null>(null);

  useEffect(() => {
    const box = ring.current?.closest<HTMLElement>(".hero__box");
    const stage = box?.closest<HTMLElement>("#hero-stage");
    const xray = box?.querySelector<HTMLElement>(".hero__xray");
    if (!box || !stage || !xray || !ring.current || !handle.current) return;
    const ringEl = ring.current, handleEl = handle.current;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const lensMode = window.matchMedia("(min-width: 1024px) and (hover: hover) and (pointer: fine)").matches && !reduce;
    const vars = getComputedStyle(box);
    const pct = (name: string, fallback: number) => parseFloat(vars.getPropertyValue(name)) / 100 || fallback;
    const wide = window.matchMedia("(min-width: 768px)").matches;
    const scanFrom = wide ? pct("--scan-from-w", 0.33) : pct("--scan-from-n", 0.02);
    const scanTo = wide ? pct("--scan-to-w", 0.99) : pct("--scan-to-n", 0.99);
    const carTop = parseFloat(vars.getPropertyValue("--car-top-w")) || 0.32;
    const carBot = parseFloat(vars.getPropertyValue("--car-bot-w")) || 0.89;
    // The headline and CTA layers sit above the stage, so the lens listens on the whole hero.
    const hero = stage.closest<HTMLElement>(".hero") ?? stage;

    let rect = box.getBoundingClientRect();
    const ro = new ResizeObserver(() => (rect = box.getBoundingClientRect()));
    ro.observe(box);
    const refreshRect = () => (rect = box.getBoundingClientRect());

    let visible = true;
    const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting));
    io.observe(stage);

    let raf = 0;
    const timers: number[] = [];
    const cleanups: (() => void)[] = [];

    // Dev-only: click the hero to log a marker position as % of the photo.
    if (process.env.NODE_ENV !== "production" && new URLSearchParams(location.search).has("calibrate")) {
      const log = (e: MouseEvent) => {
        const r = box.getBoundingClientRect();
        console.log(`[calibrate] x: ${(((e.clientX - r.left) / r.width) * 100).toFixed(1)}, y: ${(((e.clientY - r.top) / r.height) * 100).toFixed(1)}`);
      };
      box.addEventListener("click", log);
      box.style.outline = "1px dashed #93B3F5";
      cleanups.push(() => box.removeEventListener("click", log));
    }

    const startLens = () => {
      mode.current = "lens";
      // Freeze what is showing (the intro's end, or the static split) inline, then hand over: the animation
      // stops applying with the state change.
      xray.style.clipPath = getComputedStyle(xray).clipPath;
      stage.dataset.state = "lens";
      xray.style.opacity = "0";
      const restX = () => rect.width * ((scanFrom + scanTo) / 2 + 0.02);
      const restY = () => rect.height * 0.62;
      let x = restX(), y = restY(), tx = x, ty = y, r = 0;
      const tr = LENS_R;
      let pointer = false;
      timers.push(
        window.setTimeout(() => {
          xray.style.opacity = "1";
          ringEl.style.opacity = "1";
          const frame = () => {
            raf = requestAnimationFrame(frame);
            if (!visible) return;
            if (!pointer) {
              tx = restX();
              ty = restY();
            }
            // Critically damped follow: ~0.4 s to settle, frame-rate independent enough at 60-120 Hz.
            x += (tx - x) * 0.16;
            y += (ty - y) * 0.16;
            r += (tr - r) * 0.14;
            xray.style.clipPath = `circle(${r.toFixed(1)}px at ${x.toFixed(1)}px ${y.toFixed(1)}px)`;
            ringEl.style.transform = `translate3d(${(x - LENS_R).toFixed(1)}px, ${(y - LENS_R).toFixed(1)}px, 0) scale(${(r / LENS_R).toFixed(3)})`;
          };
          raf = requestAnimationFrame(frame);
        }, 420),
      );
      const move = (e: PointerEvent) => {
        if (e.pointerType !== "mouse" && e.pointerType !== "pen") return;
        // On a button or link the lens waits on the car; anywhere else it follows, kept over the car.
        pointer = !(e.target as Element | null)?.closest?.("a, button");
        tx = Math.min(rect.width * scanTo, Math.max(rect.width * scanFrom, e.clientX - rect.left));
        ty = Math.min(rect.height * carBot, Math.max(rect.height * carTop, e.clientY - rect.top));
      };
      const leave = () => (pointer = false);
      hero.addEventListener("pointermove", move, { passive: true });
      hero.addEventListener("pointerleave", leave);
      window.addEventListener("scroll", refreshRect, { passive: true });
      cleanups.push(() => {
        hero.removeEventListener("pointermove", move);
        hero.removeEventListener("pointerleave", leave);
        window.removeEventListener("scroll", refreshRect);
      });
      api.current = {
        setFromRange: (v) => {
          pointer = true;
          tx = rect.width * (scanFrom + ((scanTo - scanFrom) * v) / 100);
          ty = restY();
        },
      };
    };

    const startBar = () => {
      mode.current = "bar";
      // Rest where no marker label sits under the bar: 62% of the photo on phones, 68% on the tablet crop.
      const rest = window.matchMedia("(min-width: 768px)").matches ? 0.68 : 0.62;
      let split = rest;
      const apply = () => {
        xray.style.clipPath = `inset(0 ${((1 - split) * 100).toFixed(2)}% 0 ${(scanFrom * 100).toFixed(2)}%)`;
        handleEl.style.transform = `translate3d(${(split * rect.width).toFixed(1)}px, 0, 0)`;
        const v = Math.round(((split - scanFrom) / (scanTo - scanFrom)) * 100);
        if (range.current) range.current.value = String(v);
      };
      // After the intro the bar appears on the blueprint's edge and settles to rest with it; from the static
      // split (reduced motion, slow network) it simply appears there.
      const fromIntro = stage.dataset.state === "intro";
      xray.style.clipPath = getComputedStyle(xray).clipPath;
      handleEl.style.transform = `translate3d(${((fromIntro ? scanTo : rest) * rect.width).toFixed(1)}px, 0, 0)`;
      stage.dataset.state = "bar";
      requestAnimationFrame(() => {
        if (fromIntro) {
          handleEl.getBoundingClientRect(); // the bar was display: none until now; give its transition a start
          const ease = "0.5s cubic-bezier(0.23, 1, 0.32, 1)";
          xray.style.transition = `clip-path ${ease}`;
          handleEl.style.transition = `transform ${ease}`;
        }
        apply();
        timers.push(
          window.setTimeout(() => {
            xray.style.transition = "";
            handleEl.style.transition = "";
          }, 650),
        );
      });

      const toSplit = (clientX: number) => {
        split = Math.min(scanTo, Math.max(scanFrom, (clientX - rect.left) / rect.width));
        apply();
      };
      let dragging = false;
      const down = (e: PointerEvent) => {
        dragging = true;
        refreshRect();
        handleEl.setPointerCapture(e.pointerId);
        toSplit(e.clientX);
      };
      const moveBar = (e: PointerEvent) => dragging && toSplit(e.clientX);
      const up = () => (dragging = false);
      handleEl.addEventListener("pointerdown", down);
      handleEl.addEventListener("pointermove", moveBar);
      handleEl.addEventListener("pointerup", up);
      handleEl.addEventListener("pointercancel", up);
      cleanups.push(() => {
        handleEl.removeEventListener("pointerdown", down);
        handleEl.removeEventListener("pointermove", moveBar);
        handleEl.removeEventListener("pointerup", up);
        handleEl.removeEventListener("pointercancel", up);
      });
      api.current = {
        setFromRange: (v) => {
          split = scanFrom + ((scanTo - scanFrom) * v) / 100;
          apply();
        },
      };
    };

    const start = () => (lensMode ? startLens() : startBar());
    // Hand over when the intro ends, timed from when it started (the inline script stamps data-at), not from
    // when this component hydrated.
    const afterIntro = () => {
      const at = Number(stage.dataset.at);
      timers.push(window.setTimeout(start, at ? Math.max(0, INTRO_MS - (performance.now() - at)) : INTRO_MS));
    };

    const state = stage.dataset.state;
    if (state === "static") start();
    else if (state === "intro") afterIntro();
    else {
      // The inline script hasn't fired yet (images still decoding): wait for it.
      const mo = new MutationObserver(() => {
        const s = stage.dataset.state;
        if (s === "intro") afterIntro();
        else if (s === "static") start();
        else return;
        mo.disconnect();
      });
      mo.observe(stage, { attributes: true, attributeFilter: ["data-state"] });
      cleanups.push(() => mo.disconnect());
    }

    return () => {
      cancelAnimationFrame(raf);
      timers.forEach(clearTimeout);
      cleanups.forEach((fn) => fn());
      ro.disconnect();
      io.disconnect();
    };
  }, []);

  return (
    <>
      <span ref={ring} className="hero__lens" aria-hidden="true" />
      <span ref={handle} className="hero__handle" aria-hidden="true">
        <span className="hero__grip" />
      </span>
      <input
        ref={range}
        type="range"
        className="hero__range"
        min={0}
        max={100}
        step={1}
        defaultValue={value}
        aria-label={label}
        aria-valuetext={`Blueprint view, ${value}%`}
        onChange={(e) => {
          const v = Number(e.target.value);
          setValue(v);
          api.current?.setFromRange(v);
        }}
      />
    </>
  );
}
