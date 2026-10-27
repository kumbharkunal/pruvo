"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { BOOK_EVENT, type ServicePreset } from "@/lib/booking-events";

export type RelayMode = "off" | "dry-run" | "on";

const BookingSheet = dynamic(() => import("./BookingSheet"), { ssr: false });
const warmSheet = () => void import("./BookingSheet");

/**
 * One delegated listener opens the sheet from any [data-book] control, so CTAs stay server-rendered.
 * The sheet's code (Base UI Drawer + zod) is fetched on hover, touch or focus of a CTA, or once the
 * page is idle, so it never weighs on first load.
 */
export function BookingRoot({ relay }: { relay: RelayMode }) {
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);
  const [preset, setPreset] = useState<ServicePreset>("");

  useEffect(() => {
    const show = (s: ServicePreset) => {
      setPreset(s);
      setMounted(true);
      setOpen(true);
    };
    const onClick = (e: MouseEvent) => {
      const trigger = (e.target as Element | null)?.closest?.<HTMLElement>("[data-book]");
      if (!trigger) return;
      e.preventDefault();
      const v = trigger.dataset.book;
      show(v === "new" || v === "used" ? v : "");
    };
    const onEvent = (e: Event) => show((e as CustomEvent<{ service: ServicePreset }>).detail?.service ?? "");
    const warm = (e: Event) => {
      if ((e.target as Element | null)?.closest?.("[data-book]")) warmSheet();
    };
    document.addEventListener("click", onClick);
    window.addEventListener(BOOK_EVENT, onEvent);
    document.addEventListener("pointerover", warm, { passive: true });
    document.addEventListener("touchstart", warm, { passive: true });
    document.addEventListener("focusin", warm);
    const hasIdle = typeof window.requestIdleCallback === "function"; // Safari has none
    const idle = hasIdle ? window.requestIdleCallback(warmSheet, { timeout: 6000 }) : setTimeout(warmSheet, 4000);
    return () => {
      document.removeEventListener("click", onClick);
      window.removeEventListener(BOOK_EVENT, onEvent);
      document.removeEventListener("pointerover", warm);
      document.removeEventListener("touchstart", warm);
      document.removeEventListener("focusin", warm);
      if (hasIdle) window.cancelIdleCallback(idle as number);
      else clearTimeout(idle as ReturnType<typeof setTimeout>);
    };
  }, []);

  useEffect(() => {
    document.documentElement.toggleAttribute("data-sheet-open", open);
  }, [open]);

  return mounted ? <BookingSheet open={open} onOpenChange={setOpen} preset={preset} relay={relay} /> : null;
}
