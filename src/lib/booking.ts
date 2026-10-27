import { z } from "zod";
import { site } from "@/content/site";

// No eval-compiled parsers: the CSP forbids eval, and Zod's probe for it would be reported as a violation.
z.config({ jitless: true });

/** Shared by the booking sheet (client) and the optional Google Form relay (server). */

export type BookingForm = {
  service: "" | "new" | "used";
  car: string;
  city: string;
  date: string; // yyyy-mm-dd from <input type="date">
  name: string;
  phone: string;
  email: string;
  company: string; // honeypot: real people never see or fill it
};

export const emptyBooking: BookingForm = { service: "", car: "", city: "", date: "", name: "", phone: "", email: "", company: "" };

/** Accepts "98765 43210", "+91 98765-43210", "098765 43210"; returns the bare 10 digits. */
export function normalisePhone(value: string) {
  let digits = value.replace(/\D/g, "");
  if (digits.length === 12 && digits.startsWith("91")) digits = digits.slice(2);
  if (digits.length === 11 && digits.startsWith("0")) digits = digits.slice(1);
  return digits;
}

/** Today in the visitor's time zone, as yyyy-mm-dd. */
export function todayIso() {
  const d = new Date();
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
}

const carStep = z.object({
  service: z.enum(["new", "used"], { error: "Choose new car or pre-owned car." }),
  car: z.string().trim().min(2, "Tell us the make and model."),
  city: z.string().trim().min(2, "Tell us the city."),
  date: z.string().min(1, "Pick a preferred date.").refine((d) => d >= todayIso(), "Pick today or a later date."),
});

const youStep = z.object({
  name: z.string().trim().min(2, "Tell us your name."),
  phone: z
    .string()
    .transform(normalisePhone)
    .refine((v) => /^[6-9]\d{9}$/.test(v), "Enter a 10-digit mobile number starting with 6, 7, 8 or 9."),
  email: z.union([z.literal(""), z.email("Enter a valid email address, or leave it empty.")]),
});

export const stepSchemas = [carStep, youStep] as const;

export const bookingSchema = carStep.extend(youStep.shape).extend({ company: z.string().max(0).optional() });

export type FieldErrors = Partial<Record<keyof BookingForm, string>>;

export function validateStep(step: 0 | 1, form: BookingForm): FieldErrors {
  const result = stepSchemas[step].safeParse(form);
  if (result.success) return {};
  const errors: FieldErrors = {};
  for (const issue of result.error.issues) {
    const key = issue.path[0] as keyof BookingForm;
    if (!errors[key]) errors[key] = issue.message;
  }
  return errors;
}

export const serviceLabel = (s: BookingForm["service"]) => (s === "new" ? "New car PDI" : s === "used" ? "Pre-owned car inspection" : "");

export function formatDate(iso: string) {
  if (!iso) return "";
  return new Date(`${iso}T00:00:00`).toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short", year: "numeric" });
}

export function formatPhone(digits: string) {
  const d = normalisePhone(digits);
  return d.length === 10 ? `+91 ${d.slice(0, 5)} ${d.slice(5)}` : digits;
}

/** The prefilled WhatsApp message: every field, one per line. */
export function whatsappMessage(f: BookingForm) {
  return [
    "Hi Pruvo, I'd like to book an inspection.",
    "",
    `Service: ${serviceLabel(f.service)}`,
    `Car: ${f.car.trim()}`,
    `City: ${f.city.trim()}`,
    `Preferred date: ${formatDate(f.date)}`,
    `Name: ${f.name.trim()}`,
    `Phone: ${formatPhone(f.phone)}`,
    f.email.trim() ? `Email: ${f.email.trim()}` : null,
    "",
    "(Sent from the Pruvo website)",
  ]
    .filter((l) => l !== null)
    .join("\n");
}

export const whatsappUrl = (f: BookingForm) => `https://wa.me/${site.phone.wa}?text=${encodeURIComponent(whatsappMessage(f))}`;

/**
 * Pruvo's own Google Form ("Pruvo PDI Form"). Entry ids were read from the form's FB_PUBLIC_LOAD_DATA_
 * (GET only, 27 Oct 2026); refresh them with `node scripts/form-ids.mjs` if Pruvo edits the form.
 */
export const GOOGLE_FORM = {
  action: "https://docs.google.com/forms/d/e/1FAIpQLSfP_aBurcDh9z5hHIYUKDUVkwgDnLUVMF2sH7itzXts4x_Y9g/formResponse",
  entries: {
    name: "entry.2102053270",
    service: "entry.1803849510",
    car: "entry.2136599660",
    date: "entry.430797105",
    city: "entry.1535809647",
    phone: "entry.1055459441",
    email: "entry.1763560061",
  },
  serviceValues: { new: "New car", used: "Preowned Car" },
} as const;

export function googleFormPayload(f: BookingForm) {
  const e = GOOGLE_FORM.entries;
  const body = new URLSearchParams();
  body.set(e.name, f.name.trim());
  if (f.service) body.set(e.service, GOOGLE_FORM.serviceValues[f.service]);
  body.set(e.car, f.car.trim());
  const [y, m, d] = f.date.split("-");
  body.set(`${e.date}_year`, y);
  body.set(`${e.date}_month`, String(Number(m)));
  body.set(`${e.date}_day`, String(Number(d)));
  body.set(e.city, f.city.trim());
  body.set(e.phone, formatPhone(f.phone));
  if (f.email.trim()) body.set(e.email, f.email.trim());
  return body;
}
