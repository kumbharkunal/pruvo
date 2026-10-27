/**
 * Every line of homepage copy and every business detail lives here.
 *
 * Lines in quotes marked "their words" are Pruvo's own (Instagram bio, posts and captions).
 * Anything marked CONFIRM WITH CLIENT is an assumption made for the demo; each one is listed in
 * _internal/CLIENT_QUESTIONS.md and must be checked before launch.
 */

/** CONFIRM WITH CLIENT: their posts say 150+ (17 Aug), 300+ (1 and 2 Jun) and 500+ (20 Sep). One constant, used everywhere. */
export const CHECKPOINTS = "300+";

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

export const hero = {
  title: ["Professional eyes,", "better buys."], // their words
  /** "Independent" is derived from their "unbiased" and "We work for you, not the seller." CONFIRM WITH CLIENT. */
  sub: `Independent new-car PDI and pre-owned car inspections. ${CHECKPOINTS} checkpoints, an OBD scan and a photo report, before you pay.`,
  cta: "Book an inspection",
  whatsapp: "WhatsApp",
  trust: ["Certified engineers", `${CHECKPOINTS} checkpoints`, "Photo report", "Across India"],
  readingsNote: "Illustrative readings",
  sliderLabel: "Inspection view",
};

export const whyInspect = {
  title: "A good-looking car isn't always a good buy.", // their words
  lead: "A car can look perfect on the outside. What matters is what you can't see.", // their words, lightly edited
  feeling: {
    label: "The feeling",
    body: "You see the shine and hear the seller's promise. Neither tells you what's under the paint.",
  },
  facts: {
    label: "The facts",
    intro: "What an inspection often turns up",
    groups: [
      {
        title: "New cars, at delivery",
        items: [
          "Scratches or dents from transport and the stockyard",
          "A panel that has been repainted",
          "An older manufacturing date than you were told",
          "Tyres older than the car",
          "Electrical or infotainment faults",
          "Missing accessories or documents",
        ],
      },
      {
        title: "Pre-owned cars",
        items: [
          "Accident repairs under fresh paint or filler",
          "Engine, gearbox or suspension wear",
          "Stored fault codes the dashboard doesn't show",
          "Signs of flood damage",
          "Chassis or engine numbers that don't match the RC",
        ],
      },
    ],
  },
  closing: ["Buy the feeling.", "Verify the facts."], // their words
};

export type ServiceKey = "new" | "used";

export const services = {
  title: "Car PDI and used car inspection",
  sub: "Pre-delivery inspection for new cars. Pre-purchase inspection for pre-owned cars.", // their service names
  tabs: {
    new: {
      label: "New car (PDI)",
      name: "Pre-delivery inspection",
      line: "Don't just take delivery. Inspect it first.", // their words
      /** CONFIRM WITH CLIENT: lead time and where the PDI happens. */
      when: "Book as soon as the dealer gives you a delivery date, before you sign the delivery papers.",
      checks: [
        "Paint thickness and panel gaps",
        "Dents, scratches and glass",
        "Tyres, including their manufacturing date",
        "Engine bay, fluids and leaks",
        "Electricals, infotainment and lights",
        "Airbags, sensors and ADAS",
        "OBD diagnostic scan",
        "Documents, VIN and manufacturing date",
      ],
      image: "pdi-delivery-bay",
    },
    used: {
      label: "Pre-owned car",
      name: "Pre-purchase inspection",
      line: "A clean look doesn't always mean a clean history.", // their words
      when: "Book before you pay a token amount or an advance.",
      checks: [
        "Accident and repair detection",
        "Paint thickness on every panel",
        "Engine, gearbox and clutch",
        "Suspension, steering and brakes",
        "OBD fault codes",
        "Underbody, rust and flood signs",
        "Documents: RC, insurance, chassis and engine numbers",
        "Road test, if the seller allows",
      ],
      image: "preowned-inspection",
    },
  },
} as const;

export type SystemIcon =
  | "engine" | "gearbox" | "suspension" | "brake" | "tyre" | "cooling" | "fuel" | "electrics" | "safety" | "paint" | "underbody" | "obd";

export const checkpoints = {
  title: ["A closer look.", "Because every part matters."], // their words
  sub: `Our engineers check ${CHECKPOINTS} points, from the engine bay to the underbody, and scan the car's computer for stored faults.`,
  count: CHECKPOINTS,
  countLabel: "checkpoints",
  /** `at` = hotspot on the hero-desktop photo, as % of width/height. */
  systems: [
    { id: "engine", icon: "engine", name: "Engine", detail: "Performance, leaks, under-bonnet condition, engine number", at: [52, 49] },
    { id: "transmission", icon: "gearbox", name: "Transmission", detail: "Gearbox, clutch, drive shaft", at: [58.5, 73] },
    { id: "suspension", icon: "suspension", name: "Suspension and steering", detail: "Shocks, struts, bushes, steering play", at: [71, 69] },
    { id: "brakes", icon: "brake", name: "Brakes", detail: "Pads, discs, ABS", at: [71.4, 79.5] },
    { id: "tyres", icon: "tyre", name: "Tyres and wheels", detail: "Tread, alignment, condition, manufacturing date", at: [93.2, 74] },
    { id: "cooling", icon: "cooling", name: "Cooling and AC", detail: "Radiator, hoses, coolant, AC output", at: [47.4, 62.5] },
    { id: "fuel", icon: "fuel", name: "Fuel system", detail: "Tank, pump, lines", at: [91, 56] },
    { id: "electricals", icon: "electrics", name: "Electricals", detail: "Battery, infotainment, lights, glass", at: [63.4, 58] },
    { id: "safety", icon: "safety", name: "Safety systems", detail: "Airbags, sensors, ADAS", at: [66, 41] },
    { id: "body", icon: "paint", name: "Body, paint and panels", detail: "Paint thickness, gaps, dents, accident repairs", at: [83.5, 59], evidence: "paint-gauge-macro" },
    { id: "underbody", icon: "underbody", name: "Interior and underbody", detail: "Seats, trims, dashboard; chassis, rust, impact damage", at: [82, 76], evidence: "underbody-inspection" },
    { id: "obd", icon: "obd", name: "OBD scan and documents", detail: "Stored fault codes; RC, VIN, manufacturing date; road test if allowed", at: [59.6, 46.5], evidence: "obd-scan-closeup" },
  ] as { id: string; icon: SystemIcon; name: string; detail: string; at: [number, number]; evidence?: "paint-gauge-macro" | "underbody-inspection" | "obd-scan-closeup" }[],
};

export const report = {
  title: "Proof before purchase.", // their lockup
  sub: "Every inspection ends with a report: clear photos and findings, in plain language.", // their words, lightly edited
  label: "Sample report. Values are illustrative.",
};

export const how = {
  title: "How it works",
  steps: [
    { title: "Book", body: "Send the form or message us on WhatsApp with the car, city and date. Our team will get in touch with you shortly." },
    /** CONFIRM WITH CLIENT: where inspections take place. */
    { title: "An engineer inspects", body: "A certified engineer inspects the car where it is: at the dealership, or wherever the seller keeps it." },
    /** CONFIRM WITH CLIENT: report format and turnaround. */
    { title: "You get the report", body: "A detailed health report with photos, in plain language." },
    { title: "You decide", body: "Accept delivery, ask for fixes first, negotiate the price or walk away." },
  ],
};

export const whyPruvo = {
  title: "We work for you, not the seller.", // their words
  lead: "One job: tell you the truth about the car before you pay for it.",
  points: [
    { title: "Unbiased expert opinion", body: "You hear what the engineer found, good or bad." },
    /** CONFIRM WITH CLIENT: certifying body. */
    { title: "Certified engineers", body: "Inspections are done by certified, experienced inspection engineers." },
    { title: "Reports with photos", body: "Clear photos and findings in an easy-to-understand report." },
    /** CONFIRM WITH CLIENT: cities covered. */
    { title: "Across India", body: "New and pre-owned car inspections for customers across India." },
  ],
  /** CONFIRM WITH CLIENT: permission pending from @savitri_gupta_singh (comment on the 1 Jun post). Never complete the cut-off text. */
  testimonial: {
    quote: "I recently purchased a car and had it inspected by Pruvo. Their inspection was incredibly thorough,",
    by: "Savitri G.",
    via: "via Instagram",
    permissionPending: true,
  },
  portraitNote: "Representative image",
};

export const faq = {
  title: "Common questions",
  items: [
    {
      q: "What is a PDI?",
      a: "A pre-delivery inspection is a check of a new car before you accept delivery: paint, body and panels, tyres, electricals, documents and the manufacturing date. Problems get fixed before you sign, not after.",
    },
    {
      q: "When should I book?",
      a: "For a new car, as soon as the dealer gives you a delivery date. For a pre-owned car, before you pay a token amount or an advance.",
      confirm: true,
    },
    {
      q: "What do you check?",
      a: `${CHECKPOINTS} checkpoints across the engine, transmission, suspension, brakes, tyres, electricals, safety systems, body and paint, interior and underbody, plus an OBD scan, the documents and a road test if it's allowed.`,
    },
    {
      q: "Do you inspect used cars?",
      a: "Yes. A pre-purchase inspection looks for hidden issues, accident repairs, mechanical condition, OBD errors and document mismatches.",
    },
    {
      q: "Will the dealer allow an inspection?",
      a: "Tell your dealer ahead of time that an engineer will check the car with you before delivery. If you're unsure how to ask, message us and we'll help.",
      confirm: true,
    },
    {
      q: "What does the report look like?",
      a: "A detailed health report with photos, written so you can act on it: what's fine, what needs attention and what to fix before you pay.",
      confirm: true,
    },
    {
      q: "Which cities do you cover?",
      a: "We serve customers across India. Tell us your city when you book and we'll confirm the visit.",
      confirm: true,
    },
    {
      q: "How much does it cost?",
      a: "It depends on the car and the inspection. Message us on WhatsApp for a quote.",
    },
  ],
};

export const booking = {
  title: "Book an inspection",
  sub: "Tell us about the car. Our team will get in touch with you shortly.", // their form's note
  cta: "Book an inspection",
  call: `Call ${site.phone.display}`,
  googleForm: "Use the Google Form instead",
};

export const footer = {
  blurb: "Independent new-car PDI and pre-owned car inspections.",
  copyright: "© 2026 Pruvo",
  demoNote: "Demo website. Sample report values are illustrative.",
};

/** City suggestions for the booking form (free text is still accepted). */
export const cities = [
  "Mumbai", "Delhi", "Bengaluru", "Hyderabad", "Ahmedabad", "Chennai", "Kolkata", "Pune", "Surat", "Jaipur",
  "Lucknow", "Kanpur", "Nagpur", "Indore", "Thane", "Bhopal", "Visakhapatnam", "Patna", "Vadodara", "Ghaziabad",
  "Ludhiana", "Agra", "Nashik", "Faridabad", "Meerut", "Rajkot", "Varanasi", "Aurangabad", "Amritsar", "Navi Mumbai",
  "Ranchi", "Coimbatore", "Jabalpur", "Gwalior", "Vijayawada", "Jodhpur", "Madurai", "Raipur", "Kota", "Chandigarh",
  "Guwahati", "Noida", "Gurugram", "Mysuru", "Kochi", "Thiruvananthapuram", "Dehradun", "Bhubaneswar",
];
