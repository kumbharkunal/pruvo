// Every photo slot on the homepage. Sources are PNGs in assets-src/images/ (git-ignored).
// `widths` are the files generated per format (never wider than the source; never upscaled).
// `focal` is the object-position used for crops ([x, y] as 0..1).
// Keep these widths in step with images.deviceSizes / imageSizes in next.config.ts.
export const SLOTS = {
  "hero-desktop": {
    src: "hero-desktop.png",
    widths: [640, 828, 1080, 1280, 1672],
    focal: [0.66, 0.62],
    xray: true,
    alt: "A white compact SUV in a dark navy studio, lit along its roofline and wheel arches",
  },
  "hero-mobile": {
    src: "hero-mobile.png",
    widths: [480, 640, 828, 941],
    focal: [0.5, 0.7],
    xray: true,
    alt: "A white compact SUV in a dark navy studio, lit along its roofline and wheel arches",
  },
  "pdi-delivery-bay": {
    src: "pdi-delivery-bay.png",
    widths: [480, 640, 828, 1080, 1280, 1448],
    focal: [0.55, 0.5],
    alt: "A Pruvo engineer checks paint thickness on a new blue sedan's front fender in a dealership delivery bay while the buyer watches",
  },
  "preowned-inspection": {
    src: "preowned-inspection.png",
    widths: [480, 640, 828, 1080, 1280, 1448],
    focal: [0.5, 0.5],
    alt: "A Pruvo engineer inspects the engine bay of a used silver hatchback with a torch in a housing-society parking area as the seller looks on",
  },
  "obd-scan-closeup": {
    src: "obd-scan-closeup.png",
    widths: [320, 480, 640, 828, 1080],
    focal: [0.62, 0.45],
    alt: "A gloved hand plugs an OBD diagnostic connector into the port under a car's dashboard, with live graphs on a tablet behind",
  },
  "paint-gauge-macro": {
    src: "paint-gauge-macro.png",
    widths: [320, 480, 640, 828, 1080],
    focal: [0.4, 0.45],
    alt: "A paint-thickness gauge pressed against a dark blue door panel next to the panel gap",
  },
  "underbody-inspection": {
    src: "underbody-inspection.png",
    widths: [320, 480, 640, 828, 1080],
    focal: [0.55, 0.45],
    alt: "An engineer on a creeper shines a torch at a car's suspension arm and exhaust hangers in a basement car park",
  },
  "inspector-portrait": {
    src: "inspector-portrait.png",
    widths: [480, 640, 828, 1086],
    focal: [0.55, 0.32],
    alt: "A Pruvo inspection engineer in a navy polo and black gloves holds a tablet in front of a white car",
  },
};
