"use client";

import { useEffect, useRef, useState } from "react";

type Mode = "idle" | "lens" | "bar";

const INTRO_MS = (0.2 + 1.2 + 0.4) * 1000; // delay + sweep + a short hold with every marker locked
const LENS_R = 118;

/**
 * Takes over the hero once the CSS intro has played.
 * - Mouse/trackpad on wide screens: the blueprint dissolves and returns as a lens that follows the
 *   pointer (critically damped), resting on the car when the pointer leaves.
 * - Touch or narrow screens: the blueprint settles into a split with a draggable scan bar, which
 *   auto-sweeps once (under 5 s, so no pause control is needed). touch-action: pan-y keeps vertical
 *   scrolling native.
 * - Everyone: a real range input drives the same view for keyboard and screen-reader users.
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
      // Freeze the intro's end state inline, then hand over (the animation stops applying with the state change).
      xray.style.clipPath = `inset(0 ${((1 - scanTo) * 100).toFixed(2)}% 0 0)`;
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
        pointer = true;
        tx = e.clientX - rect.left;
        ty = e.clientY - rect.top;
      };
      const leave = () => (pointer = false);
      stage.addEventListener("pointermove", move, { passive: true });
      stage.addEventListener("pointerleave", leave);
      window.addEventListener("scroll", refreshRect, { passive: true });
      cleanups.push(() => {
        stage.removeEventListener("pointermove", move);
        stage.removeEventListener("pointerleave", leave);
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
        xray.style.clipPath = `inset(0 ${((1 - split) * 100).toFixed(2)}% 0 0)`;
        handleEl.style.transform = `translate3d(${(split * rect.width).toFixed(1)}px, 0, 0)`;
        const v = Math.round(((split - scanFrom) / (scanTo - scanFrom)) * 100);
        if (range.current) range.current.value = String(v);
      };
      xray.style.clipPath = `inset(0 ${((1 - (reduce ? rest : scanTo)) * 100).toFixed(2)}% 0 0)`;
      stage.dataset.state = "bar";
      requestAnimationFrame(() => {
        if (!reduce) xray.style.transition = "clip-path 0.6s cubic-bezier(0.23, 1, 0.32, 1)";
        apply();
        timers.push(window.setTimeout(() => (xray.style.transition = ""), 650));
      });

      let interacted = false;
      // One gentle sweep to show the bar is draggable (touch, motion allowed), then rest. Under 5 s.
      if (!reduce && !window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
        timers.push(
          window.setTimeout(() => {
            const t0 = performance.now(), dur = 2200, a = rest, b = Math.max(scanFrom + 0.1, 0.36);
            const tick = (now: number) => {
              if (interacted) return;
              const t = Math.min(1, (now - t0) / dur);
              const wave = Math.sin(Math.PI * t); // 0 → 1 → 0
              const eased = wave * wave * (3 - 2 * wave);
              split = a + (b - a) * eased;
              apply();
              if (t < 1) raf = requestAnimationFrame(tick);
            };
            raf = requestAnimationFrame(tick);
          }, 900),
        );
      }

      const toSplit = (clientX: number) => {
        split = Math.min(scanTo, Math.max(scanFrom, (clientX - rect.left) / rect.width));
        apply();
      };
      let dragging = false;
      const down = (e: PointerEvent) => {
        interacted = true;
        cancelAnimationFrame(raf);
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
          interacted = true;
          cancelAnimationFrame(raf);
          split = scanFrom + ((scanTo - scanFrom) * v) / 100;
          apply();
        },
      };
    };

    const start = () => (lensMode ? startLens() : startBar());

    const state = stage.dataset.state;
    if (state === "static") start();
    else if (state === "intro") timers.push(window.setTimeout(start, INTRO_MS));
    else {
      // The inline script hasn't fired yet (images still decoding): wait for it.
      const mo = new MutationObserver(() => {
        const s = stage.dataset.state;
        if (s === "intro") timers.push(window.setTimeout(start, INTRO_MS));
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
