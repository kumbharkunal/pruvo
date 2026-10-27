/** Any "Book an inspection" control can open the booking sheet without being a client component:
 *  give it `data-book` (optionally `data-book="new"` / `"used"`), or call openBooking(). */
export const BOOK_EVENT = "pruvo:book";

export type ServicePreset = "" | "new" | "used";

export function openBooking(service: ServicePreset = "") {
  window.dispatchEvent(new CustomEvent<{ service: ServicePreset }>(BOOK_EVENT, { detail: { service } }));
}
