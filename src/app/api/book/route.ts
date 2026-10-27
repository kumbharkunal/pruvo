import { NextResponse } from "next/server";
import { bookingSchema, GOOGLE_FORM, googleFormPayload, type BookingForm } from "@/lib/booking";

/**
 * Optional copy of a booking into Pruvo's own Google Form. WhatsApp stays the booking of record.
 *   BOOKING_RELAY=off      (default) 404, nothing happens
 *   BOOKING_RELAY=dry-run  validates and returns the exact payload it WOULD post; never sends it
 *   BOOKING_RELAY=on       posts to the live form
 * Never point dry-run tests at "on": a test would land in Pruvo's real responses.
 */
export async function POST(request: Request) {
  const mode = process.env.BOOKING_RELAY ?? "off";
  if (mode !== "dry-run" && mode !== "on") return NextResponse.json({ ok: false, error: "Relay is off." }, { status: 404 });

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Send JSON." }, { status: 400 });
  }

  const raw = body as Partial<BookingForm>;
  if (raw.company) return NextResponse.json({ ok: true }); // honeypot: pretend success, do nothing

  const parsed = bookingSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: "Check the booking details.", issues: parsed.error.issues.map((i) => ({ field: i.path.join("."), message: i.message })) },
      { status: 422 },
    );
  }

  const form: BookingForm = { ...parsed.data, company: "" };
  const payload = googleFormPayload(form);
  if (mode === "dry-run") return NextResponse.json({ ok: true, mode, url: GOOGLE_FORM.action, body: payload.toString() });

  const res = await fetch(GOOGLE_FORM.action, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: payload,
    redirect: "manual",
  });
  const ok = res.status < 400;
  return NextResponse.json({ ok, mode }, { status: ok ? 200 : 502 });
}
