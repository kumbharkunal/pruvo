/**
 * Contact details and section links: the only content client components need, kept apart from site.ts so
 * the browser never downloads the rest of the copy. site.ts re-exports everything here.
 */

export const site = {
  name: "Pruvo",
  tagline: "Professional eyes, better buys.", // their words
  lockup: "Proof before purchase", // their logo lockup
  serving: "Serving customers across India", // their words (bio)
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://pruvo-homepage.vercel.app",
  phone: { display: "+91 93552 17180", tel: "+919355217180", wa: "919355217180" },
  /** CONFIRM WITH CLIENT: appears only in the 9 Sep post ("Book your PDI now"). Not shown on the page. */
  altPhone: { display: "+91 96679 70553", tel: "+919667970553" },
  links: {
    instagram: "https://www.instagram.com/pruvo.in/",
    facebook: "https://www.facebook.com/p/Pruvo-61594130137720/",
    /** CONFIRM WITH CLIENT: found on 27 Oct 2026 ("Pruvo inspection service", Hinglish PDI videos). */
    youtube: "https://www.youtube.com/@pruvo_cars",
    googleForm: "https://forms.gle/6ZHGXvpCisUuXv8r6",
  },
};

export const whatsappHello = `https://wa.me/${site.phone.wa}?text=${encodeURIComponent("Hi Pruvo, I'd like to book a car inspection.")}`;

export const nav = [
  { href: "#services", label: "Services" },
  { href: "#checkpoints", label: "Checkpoints" },
  { href: "#report", label: "Sample report" },
  { href: "#faq", label: "FAQ" },
] as const;

/** Every section link in page order (mobile menu, footer); the desktop pill keeps the shorter `nav`. */
export const pageNav = [nav[0], nav[1], nav[2], { href: "#how", label: "How it works" }, nav[3]] as const;
