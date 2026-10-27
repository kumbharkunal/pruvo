"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { m } from "motion/react";
import { nav, pageNav, site, whatsappHello } from "@/content/site";
import { Logo } from "@/components/ui/Logo";
import { FacebookLogo, InstagramLogo, WhatsAppLogo, YouTubeLogo } from "@/components/ui/SocialLogo";
import { openBooking } from "@/lib/booking-events";
import { lockScroll, scrollToHash } from "@/lib/scroll";

type Theme = "dark" | "light";
const NAV_IDS = new Set<string>(nav.map((n) => n.href.slice(1)));
const EASE_DRAWER = "cubic-bezier(0.32, 0.72, 0, 1)";

/**
 * Floating glass pill. The section under the pill sets its tone (data-theme on each section); the
 * section in the middle of the viewport sets the active link. On phones the pill grows into a menu
 * sheet: a native modal <dialog> (focus trap, inert page, Esc and focus return for free) whose panel
 * animates its clip-path out of the pill's own rectangle. The animation is one WAAPI Animation that is
 * reversed to close, so taps mid-flight simply turn it around.
 */
export function SiteNav() {
  const [theme, setTheme] = useState<Theme>("dark");
  const [compact, setCompact] = useState(false);
  const [active, setActive] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  const sentinel = useRef<HTMLDivElement>(null);
  const pill = useRef<HTMLElement>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const sheet = useRef<HTMLDivElement>(null);
  const toggle = useRef<HTMLButtonElement>(null);
  const anim = useRef<Animation | null>(null);
  const unlock = useRef<(() => void) | null>(null);
  const afterClose = useRef<(() => void) | null>(null);

  // Glass tone follows the section under the pill.
  useEffect(() => {
    const sections = Array.from(document.querySelectorAll<HTMLElement>("[data-theme]"));
    let io: IntersectionObserver | null = null;
    const build = () => {
      io?.disconnect();
      const line = 34;
      io = new IntersectionObserver(
        (entries) => {
          for (const e of entries) if (e.isIntersecting) setTheme((e.target as HTMLElement).dataset.theme as Theme);
        },
        { rootMargin: `-${line}px 0px -${Math.max(0, window.innerHeight - line - 1)}px 0px` },
      );
      sections.forEach((s) => io!.observe(s));
    };
    build();
    window.addEventListener("resize", build);
    return () => {
      io?.disconnect();
      window.removeEventListener("resize", build);
    };
  }, []);

  // Active link follows the section crossing the middle of the viewport.
  useEffect(() => {
    const sections = Array.from(document.querySelectorAll<HTMLElement>("main > section[id]"));
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) if (e.isIntersecting) setActive(NAV_IDS.has(e.target.id) ? e.target.id : null);
      },
      { rootMargin: "-45% 0px -54% 0px" },
    );
    sections.forEach((s) => io.observe(s));
    return () => io.disconnect();
  }, []);

  // Compact once the page has moved 80px (a sentinel, not a scroll listener).
  useEffect(() => {
    const el = sentinel.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setCompact(!e.isIntersecting));
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const finishClose = useCallback(() => {
    const d = dialog.current;
    anim.current?.cancel();
    anim.current = null;
    if (d?.open) d.close();
    setMenuOpen(false);
    unlock.current?.();
    unlock.current = null;
    const then = afterClose.current;
    afterClose.current = null;
    then?.();
  }, []);

  const openMenu = useCallback(() => {
    const d = dialog.current, s = sheet.current, p = pill.current;
    if (!d || !s || !p) return;
    if (d.open) {
      // Tapped again while closing: turn the animation around.
      if (anim.current && anim.current.playbackRate < 0) {
        afterClose.current = null;
        anim.current.reverse();
      }
      return;
    }
    d.showModal();
    setMenuOpen(true);
    unlock.current = lockScroll();
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const sr = s.getBoundingClientRect(), pr = p.getBoundingClientRect();
    const from = `inset(${Math.max(0, pr.top - sr.top)}px ${Math.max(0, sr.right - pr.right)}px ${Math.max(0, sr.bottom - pr.bottom)}px ${Math.max(0, pr.left - sr.left)}px round 999px)`;
    const a = s.animate(
      reduce ? [{ opacity: 0 }, { opacity: 1 }] : [{ clipPath: from }, { clipPath: "inset(0px 0px 0px 0px round 24px)" }],
      { duration: reduce ? 160 : 320, easing: EASE_DRAWER, fill: "both" },
    );
    a.onfinish = () => {
      if (a.playbackRate < 0) finishClose();
    };
    anim.current = a;
  }, [finishClose]);

  const closeMenu = useCallback(
    (then?: () => void) => {
      const d = dialog.current;
      if (!d?.open) {
        then?.();
        return;
      }
      afterClose.current = then ?? null;
      const a = anim.current;
      if (!a) return finishClose();
      if (a.playbackRate > 0) a.reverse();
    },
    [finishClose],
  );

  // Resizing to desktop closes the phone menu at once.
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const onChange = () => {
      if (mq.matches && dialog.current?.open) finishClose();
    };
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, [finishClose]);

  const go = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const href = e.currentTarget.getAttribute("href") ?? "#top";
    if (dialog.current?.open) closeMenu(() => scrollToHash(href));
    else scrollToHash(href);
  };

  return (
    <>
      <div ref={sentinel} className="nav-sentinel" aria-hidden="true" />
      <header className="site-nav" data-nav-theme={theme} data-compact={compact ? "" : undefined}>
        <nav ref={pill} className="nav-pill" aria-label="Main">
          <a href="#top" className="nav-logo" aria-label="Pruvo, back to top" onClick={go}>
            <Logo tone="auto" />
          </a>
          <ul className="nav-links" role="list">
            {nav.map((item) => {
              const id = item.href.slice(1);
              return (
                <li key={item.href}>
                  <a href={item.href} className="nav-link" aria-current={active === id ? "true" : undefined} onClick={go}>
                    {active === id && <m.span layoutId="nav-indicator" className="nav-indicator" transition={{ type: "spring", duration: 0.42, bounce: 0.14 }} />}
                    <span className="nav-link__label">{item.label}</span>
                  </a>
                </li>
              );
            })}
          </ul>
          <div className="nav-actions">
            <a href={whatsappHello} className="nav-wa" target="_blank" rel="noopener" aria-label="Chat with Pruvo on WhatsApp">
              <WhatsAppLogo className="nav-wa__logo" />
            </a>
            <button type="button" className="btn btn--primary btn--sm nav-book" data-book="">
              <span className="nav-book__long">Book an inspection</span>
              <span className="nav-book__short" aria-hidden="true">Book</span>
            </button>
            <button ref={toggle} type="button" className="nav-toggle" aria-expanded={menuOpen} aria-controls="mobile-menu" aria-label="Open menu" onClick={openMenu}>
              <span />
              <span />
            </button>
          </div>
        </nav>
      </header>

      <dialog
        ref={dialog}
        id="mobile-menu"
        className="menu-dialog"
        aria-label="Menu"
        onCancel={(e) => {
          e.preventDefault();
          closeMenu();
        }}
        onClick={(e) => {
          if (e.target === e.currentTarget) closeMenu();
        }}
      >
        <div ref={sheet} className="menu-sheet">
          <div className="menu-head">
            <a href="#top" className="nav-logo" aria-label="Pruvo, back to top" onClick={go}>
              <Logo tone="on-dark" />
            </a>
            <button type="button" className="btn btn--primary btn--sm" onClick={() => closeMenu(() => openBooking())}>
              Book
            </button>
            <button type="button" className="nav-toggle is-x" aria-label="Close menu" onClick={() => closeMenu()}>
              <span />
              <span />
            </button>
          </div>
          <ul className="menu-links" role="list">
            {pageNav.map((item, i) => (
              <li key={item.href} style={{ "--i": i } as React.CSSProperties}>
                <a href={item.href} onClick={go}>
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
          <div className="menu-contact">
            <a href={`tel:${site.phone.tel}`} className="btn btn--ghost-dark">
              Call {site.phone.display}
            </a>
            <a href={whatsappHello} className="btn btn--ghost-dark" target="_blank" rel="noopener">
              <WhatsAppLogo className="btn__logo" /> WhatsApp
            </a>
          </div>
          <div className="menu-social">
            <a href={site.links.instagram} target="_blank" rel="noopener" aria-label="Pruvo on Instagram">
              <InstagramLogo uid="menu" />
            </a>
            <a href={site.links.facebook} target="_blank" rel="noopener" aria-label="Pruvo on Facebook">
              <FacebookLogo uid="menu" />
            </a>
            <a href={site.links.youtube} target="_blank" rel="noopener" aria-label="Pruvo on YouTube">
              <YouTubeLogo />
            </a>
          </div>
        </div>
      </dialog>
    </>
  );
}
