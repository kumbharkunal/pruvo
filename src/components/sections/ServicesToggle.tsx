"use client";

import { useEffect, useRef, useState } from "react";
import { m } from "motion/react";
import { services, type ServiceKey } from "@/content/site";
import { CheckGlyph } from "@/components/ui/CheckGlyph";

const KEYS: ServiceKey[] = ["new", "used"];

/**
 * New car / Pre-owned: a tabs pattern (arrow keys, Home/End) with a shared-layout thumb. The selector
 * changes the scene, not just the copy: photo, line, timing and checklist all switch together.
 * Choice is kept in ?service= and carried into the booking sheet by the CTA.
 */
export function ServicesToggle({ images }: { images: Record<ServiceKey, React.ReactNode> }) {
  const [active, setActive] = useState<ServiceKey>("new");
  const tabs = useRef<Record<ServiceKey, HTMLButtonElement | null>>({ new: null, used: null });

  useEffect(() => {
    const p = new URLSearchParams(location.search).get("service");
    // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time read of the URL after hydration
    if (p === "new" || p === "used") setActive(p);
  }, []);

  const select = (k: ServiceKey, focus = false) => {
    setActive(k);
    if (focus) tabs.current[k]?.focus();
    const url = new URL(location.href);
    url.searchParams.set("service", k);
    history.replaceState(null, "", url);
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    const i = KEYS.indexOf(active);
    const next =
      e.key === "ArrowRight" ? KEYS[(i + 1) % KEYS.length] : e.key === "ArrowLeft" ? KEYS[(i - 1 + KEYS.length) % KEYS.length] : e.key === "Home" ? KEYS[0] : e.key === "End" ? KEYS[KEYS.length - 1] : null;
    if (next) {
      e.preventDefault();
      select(next, true);
    }
  };

  return (
    <div className="svc">
      <div role="tablist" aria-label="Choose a service" className="seg" onKeyDown={onKeyDown}>
        {KEYS.map((k) => (
          <button
            key={k}
            ref={(el) => {
              tabs.current[k] = el;
            }}
            type="button"
            role="tab"
            id={`svc-tab-${k}`}
            aria-selected={active === k}
            aria-controls={`svc-panel-${k}`}
            tabIndex={active === k ? 0 : -1}
            className="seg__btn"
            onClick={() => select(k)}
          >
            {active === k && <m.span layoutId="svc-thumb" className="seg__thumb" transition={{ type: "spring", duration: 0.42, bounce: 0.12 }} />}
            <span className="seg__label">{services.tabs[k].label}</span>
          </button>
        ))}
      </div>

      <div className="svc__body">
        <div className="svc__media">
          {KEYS.map((k) => (
            <div key={k} className="svc__img" data-active={active === k ? "" : undefined}>
              {images[k]}
            </div>
          ))}
        </div>

        {KEYS.map((k) => {
          const t = services.tabs[k];
          return (
            <div key={k} role="tabpanel" id={`svc-panel-${k}`} aria-labelledby={`svc-tab-${k}`} hidden={active !== k} className="svc__panel" tabIndex={0}>
              <h3 className="svc__name">{t.name}</h3>
              <p className="svc__line">{t.line}</p>
              <p className="svc__when">
                <span className="svc__when-label">When to book</span>
                {t.when}
              </p>
              <ul className="svc__checks" role="list">
                {t.checks.map((c, i) => (
                  <li key={c} style={{ "--i": i } as React.CSSProperties}>
                    <CheckGlyph className="svc__check" />
                    {c}
                  </li>
                ))}
              </ul>
              <button type="button" className="btn btn--primary btn--lg" data-book={k}>
                Book an inspection
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
