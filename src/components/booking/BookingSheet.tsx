"use client";

import { useEffect, useRef, useState } from "react";
import { Drawer } from "@base-ui/react/drawer";
import { IconArrowLeft, IconX } from "@tabler/icons-react";
import { booking, cities, site } from "@/content/site";
import {
  emptyBooking,
  formatDate,
  formatPhone,
  serviceLabel,
  todayIso,
  validateStep,
  whatsappUrl,
  type BookingForm,
  type FieldErrors,
} from "@/lib/booking";
import type { ServicePreset } from "@/lib/booking-events";
import { lockScroll } from "@/lib/scroll";
import { WhatsAppLogo } from "@/components/ui/SocialLogo";
import { CheckGlyph } from "@/components/ui/CheckGlyph";
import type { RelayMode } from "./BookingRoot";

type Step = 0 | 1 | 2 | 3; // 3 = done
const STEP_NAMES = ["The car", "You", "Review"] as const;
const FIELD_NAMES: Partial<Record<keyof BookingForm, string>> = {
  service: "service",
  car: "car",
  city: "city",
  date: "date",
  name: "name",
  phone: "mobile number",
  email: "email",
};

type Props = { open: boolean; onOpenChange: (open: boolean) => void; preset: ServicePreset; relay: RelayMode };

/**
 * Booking, in the Google Form's own field order: service, car, city, date, name, phone, email.
 * Bottom sheet on phones (swipe down to dismiss), side panel on desktop. Default submit opens
 * WhatsApp with every field prefilled; the optional relay also posts to Pruvo's Google Form.
 */
export default function BookingSheet({ open, onOpenChange, preset, relay }: Props) {
  const [form, setForm] = useState<BookingForm>(emptyBooking);
  const [step, setStep] = useState<Step>(0);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [status, setStatus] = useState("");
  const [wide, setWide] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- sync the preset chosen by the CTA that opened the sheet
    if (open && preset) setForm((f) => ({ ...f, service: preset }));
  }, [open, preset]);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const sync = () => setWide(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    if (!open) return;
    return lockScroll();
  }, [open]);

  // After a finished booking, the next open starts fresh (the details are kept if it was just closed).
  const onOpenChangeComplete = (isOpen: boolean) => {
    if (isOpen || step !== 3) return;
    setForm(emptyBooking);
    setStep(0);
    setStatus("");
  };

  const set = <K extends keyof BookingForm>(key: K, value: BookingForm[K]) => {
    setForm((f) => ({ ...f, [key]: value }));
    if (errors[key]) setErrors((e) => ({ ...e, [key]: undefined }));
  };

  const focusFirstError = (errs: FieldErrors) => {
    const first = Object.keys(errs)[0];
    if (!first) return;
    requestAnimationFrame(() => formRef.current?.querySelector<HTMLElement>(`[name="${first}"]`)?.focus());
  };

  const next = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (step === 0 || step === 1) {
      const errs = validateStep(step, form);
      setErrors(errs);
      const keys = Object.keys(errs) as (keyof BookingForm)[];
      if (keys.length) {
        setStatus(`Check ${keys.length === 1 ? "the" : keys.length} ${keys.map((k) => FIELD_NAMES[k]).join(" and ")} field${keys.length === 1 ? "" : "s"}.`);
        focusFirstError(errs);
        return;
      }
      setStatus("");
      setStep((s) => (s + 1) as Step);
      requestAnimationFrame(() => formRef.current?.querySelector<HTMLElement>("[data-step-focus]")?.focus());
    }
  };

  const back = () => {
    setErrors({});
    setStatus("");
    setStep((s) => Math.max(0, s - 1) as Step);
  };

  const send = () => {
    if (relay !== "off" && !form.company) {
      // Fire and forget: WhatsApp is the booking of record, the relay is a convenience copy.
      fetch("/api/book", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form), keepalive: true }).catch(() => {});
    }
    // Let the link open WhatsApp first, then show what happens next.
    window.setTimeout(() => {
      setStep(3);
      setStatus(relay === "on" ? "Booking sent." : "Your booking is ready in WhatsApp.");
    }, 50);
  };

  const field = (key: keyof BookingForm) => ({
    id: `bk-${key}`,
    name: key,
    value: form[key],
    "aria-invalid": errors[key] ? true : undefined,
    "aria-describedby": errors[key] ? `bk-${key}-err` : undefined,
    onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
      set(key, (key === "phone" ? e.target.value.replace(/^\s*(?:\+|00)91[\s-]*/, "") : e.target.value) as never),
  });
  const err = (key: keyof BookingForm) =>
    errors[key] ? (
      <p id={`bk-${key}-err`} className="bk-error">
        {errors[key]}
      </p>
    ) : null;

  return (
    <Drawer.Root open={open} onOpenChange={(o) => onOpenChange(o)} onOpenChangeComplete={onOpenChangeComplete} swipeDirection={wide ? "right" : "down"} modal>
      <Drawer.Portal>
        <Drawer.Backdrop className="sheet-backdrop" />
        <Drawer.Viewport className="sheet-viewport" data-side={wide ? "right" : "bottom"}>
          <Drawer.Popup className="sheet" data-side={wide ? "right" : "bottom"}>
            <Drawer.Content className="sheet__content">
              {!wide && <div className="sheet__handle" aria-hidden="true" />}
              <header className="sheet__head">
                <div>
                  <Drawer.Title className="sheet__title">{booking.title}</Drawer.Title>
                  <Drawer.Description className="sheet__desc">{booking.sub}</Drawer.Description>
                </div>
                <Drawer.Close className="sheet__close" aria-label="Close booking">
                  <IconX size={22} stroke={1.75} aria-hidden="true" />
                </Drawer.Close>
              </header>

              {step < 3 && (
                <div className="bk-progress">
                  <p className="bk-progress__label" aria-live="polite">
                    <span className="sr-only">Step </span>
                    {step + 1} of 3<span className="bk-progress__name">{STEP_NAMES[step as 0 | 1 | 2]}</span>
                  </p>
                  <span className="bk-progress__bar" aria-hidden="true">
                    <span style={{ transform: `scaleX(${(step + 1) / 3})` }} />
                  </span>
                </div>
              )}

              <form ref={formRef} className="bk-form" noValidate onSubmit={next}>
                {step === 0 && (
                  <div className="bk-step">
                    <fieldset className="bk-field">
                      <legend className="bk-label" data-step-focus tabIndex={-1}>
                        Which inspection?
                      </legend>
                      <div className="bk-choice" role="radiogroup" aria-describedby={errors.service ? "bk-service-err" : undefined}>
                        {(["new", "used"] as const).map((s) => (
                          <label key={s} className="bk-choice__opt">
                            <input type="radio" name="service" value={s} checked={form.service === s} onChange={() => set("service", s)} />
                            <span className="bk-choice__box">
                              <span className="bk-choice__title">{s === "new" ? "New car PDI" : "Pre-owned car"}</span>
                              <span className="bk-choice__sub">{s === "new" ? "Before you take delivery" : "Before you pay the seller"}</span>
                            </span>
                          </label>
                        ))}
                      </div>
                      {err("service")}
                    </fieldset>
                    <div className="bk-field">
                      <label className="bk-label" htmlFor="bk-car">
                        Car
                      </label>
                      <input {...field("car")} type="text" className="bk-input" autoComplete="off" placeholder="Make and model, e.g. Tata Nexon" enterKeyHint="next" />
                      {err("car")}
                    </div>
                    <div className="bk-row">
                      <div className="bk-field">
                        <label className="bk-label" htmlFor="bk-city">
                          City
                        </label>
                        <input {...field("city")} type="text" className="bk-input" list="bk-cities" autoComplete="address-level2" placeholder="e.g. Pune" enterKeyHint="next" />
                        <datalist id="bk-cities">
                          {cities.map((c) => (
                            <option key={c} value={c} />
                          ))}
                        </datalist>
                        {err("city")}
                      </div>
                      <div className="bk-field">
                        <label className="bk-label" htmlFor="bk-date">
                          Preferred date
                        </label>
                        <input {...field("date")} type="date" className="bk-input" min={todayIso()} enterKeyHint="next" />
                        {err("date")}
                      </div>
                    </div>
                  </div>
                )}

                {step === 1 && (
                  <div className="bk-step">
                    <div className="bk-field">
                      <label className="bk-label" htmlFor="bk-name" data-step-focus tabIndex={-1}>
                        Your name
                      </label>
                      <input {...field("name")} type="text" className="bk-input" autoComplete="name" enterKeyHint="next" />
                      {err("name")}
                    </div>
                    <div className="bk-field">
                      <label className="bk-label" htmlFor="bk-phone">
                        Mobile number
                      </label>
                      <div className="bk-phone">
                        <span className="bk-phone__cc" aria-hidden="true">
                          +91
                        </span>
                        <input {...field("phone")} type="tel" className="bk-input" autoComplete="tel-national" inputMode="tel" maxLength={16} placeholder="98765 43210" enterKeyHint="next" />
                      </div>
                      {err("phone")}
                    </div>
                    <div className="bk-field">
                      <label className="bk-label" htmlFor="bk-email">
                        Email <span className="bk-optional">(optional)</span>
                      </label>
                      <input {...field("email")} type="email" className="bk-input" autoComplete="email" enterKeyHint="done" />
                      {err("email")}
                    </div>
                    {/* Honeypot: hidden from people and assistive tech; bots fill it. */}
                    <div className="bk-hp" aria-hidden="true">
                      <label>
                        Company
                        <input name="company" tabIndex={-1} autoComplete="off" value={form.company} onChange={(e) => set("company", e.target.value)} />
                      </label>
                    </div>
                  </div>
                )}

                {step === 2 && (
                  <div className="bk-step">
                    <h3 className="bk-review-title" data-step-focus tabIndex={-1}>
                      Check your details
                    </h3>
                    <dl className="bk-review">
                      {[
                        ["Service", serviceLabel(form.service), 0],
                        ["Car", form.car, 0],
                        ["City", form.city, 0],
                        ["Preferred date", formatDate(form.date), 0],
                        ["Name", form.name, 1],
                        ["Mobile", formatPhone(form.phone), 1],
                        ["Email", form.email || "Not given", 1],
                      ].map(([k, v, s]) => (
                        <div key={k as string} className="bk-review__row">
                          <dt>{k}</dt>
                          <dd>{v}</dd>
                          <button type="button" className="bk-edit" onClick={() => setStep(s as Step)} aria-label={`Edit ${String(k).toLowerCase()}`}>
                            Edit
                          </button>
                        </div>
                      ))}
                    </dl>
                    <p className="bk-privacy">
                      We use these details only to arrange your inspection. They go to Pruvo on WhatsApp, and you can ask us to correct or delete them at any time
                      (Digital Personal Data Protection Act, 2023).
                    </p>
                  </div>
                )}

                {step === 3 && (
                  <div className="bk-done" role="status">
                    <span className="bk-done__mark">
                      <CheckGlyph />
                    </span>
                    <h3 className="bk-done__title" data-step-focus tabIndex={-1}>
                      {relay === "on" ? "Booking sent." : "Your booking is ready in WhatsApp."}
                    </h3>
                    <p className="bk-done__body">
                      {relay === "on" ? "Our team will get in touch with you shortly." : "Tap send there, and our team will get in touch with you shortly."}
                    </p>
                  </div>
                )}

                <p className="sr-only" role="status" aria-live="polite">
                  {status}
                </p>

                <div className="bk-actions">
                  {step === 0 || step === 1 ? (
                    <>
                      {step === 1 && (
                        <button type="button" className="btn btn--quiet" onClick={back}>
                          <IconArrowLeft size={18} stroke={1.75} aria-hidden="true" /> Back
                        </button>
                      )}
                      <button type="submit" className="btn btn--primary btn--lg bk-continue">
                        Continue
                      </button>
                    </>
                  ) : step === 2 ? (
                    <>
                      <a href={whatsappUrl(form)} target="_blank" rel="noopener" className="btn btn--primary btn--lg bk-send" onClick={send}>
                        <WhatsAppLogo className="btn__logo btn__logo--on-blue" />
                        Send booking on WhatsApp
                      </a>
                    </>
                  ) : (
                    <>
                      {relay !== "on" && (
                        <a href={whatsappUrl(form)} target="_blank" rel="noopener" className="btn btn--ghost-light">
                          <WhatsAppLogo className="btn__logo" /> Open WhatsApp again
                        </a>
                      )}
                      <button type="button" className="btn btn--primary btn--lg" onClick={() => onOpenChange(false)}>
                        Done
                      </button>
                    </>
                  )}
                </div>
              </form>

              <ul className="bk-alt" role="list">
                <li>
                  <a href={site.links.googleForm} target="_blank" rel="noopener" className="text-link">
                    {booking.googleForm}
                  </a>
                </li>
                <li>
                  <a href={`tel:${site.phone.tel}`} className="text-link">
                    {booking.call}
                  </a>
                </li>
              </ul>
            </Drawer.Content>
          </Drawer.Popup>
        </Drawer.Viewport>
      </Drawer.Portal>
    </Drawer.Root>
  );
}
