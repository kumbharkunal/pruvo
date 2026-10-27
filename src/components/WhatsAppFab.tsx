"use client";

import { useEffect, useState } from "react";
import { whatsappHello } from "@/content/contact";
import { WhatsAppLogo } from "@/components/ui/SocialLogo";

/**
 * Appears once the hero has scrolled away; steps aside over the booking band, the footer and an open sheet,
 * and on desktop over the pinned checkpoints list (it would sit on the last rows).
 */
export function WhatsAppFab() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const hero = document.getElementById("top");
    const desktop = window.matchMedia("(min-width: 1024px)");
    const pinned = document.getElementById("checkpoints");
    const zones = [document.getElementById("book"), document.querySelector("footer"), pinned].filter((z): z is HTMLElement => !!z);
    let pastHero = false;
    const inZone = new Set<Element>();
    const blocked = () => [...inZone].some((z) => z !== pinned || desktop.matches);
    const update = () => setShow(pastHero && !blocked() && !document.documentElement.hasAttribute("data-sheet-open"));

    const heroIo = new IntersectionObserver(([e]) => {
      pastHero = !e.isIntersecting;
      update();
    });
    if (hero) heroIo.observe(hero);
    const zoneIo = new IntersectionObserver((entries) => {
      for (const e of entries) {
        if (e.isIntersecting) inZone.add(e.target);
        else inZone.delete(e.target);
      }
      update();
    });
    zones.forEach((z) => zoneIo.observe(z));
    const mo = new MutationObserver(update);
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ["data-sheet-open"] });
    desktop.addEventListener("change", update);
    return () => {
      heroIo.disconnect();
      zoneIo.disconnect();
      mo.disconnect();
      desktop.removeEventListener("change", update);
    };
  }, []);

  return (
    <a
      href={whatsappHello}
      target="_blank"
      rel="noopener"
      className="wa-fab"
      data-show={show ? "" : undefined}
      aria-label="Chat with Pruvo on WhatsApp"
      aria-hidden={show ? undefined : true}
      tabIndex={show ? undefined : -1}
    >
      <WhatsAppLogo className="wa-fab__logo" />
    </a>
  );
}
