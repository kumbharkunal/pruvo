/**
 * Sample Vehicle Health Report. EVERY VALUE IS ILLUSTRATIVE (the page says so on the report itself).
 * CONFIRM WITH CLIENT: whether Pruvo's real report has a score, a verdict, paint readings in µm and
 * the engineer's name; adapt this to their actual format.
 */
export type Status = "pass" | "attention" | "fail";

export const PAINT_RANGES = [
  { max: 160, status: "pass" as Status, label: "Factory range" },
  { max: 300, status: "attention" as Status, label: "Repaint likely" },
  { max: Infinity, status: "fail" as Status, label: "Filler or repair likely" },
];

export const paintStatus = (um: number): Status => PAINT_RANGES.find((r) => um <= r.max)!.status;

export const sampleReport = {
  vehicle: "Compact SUV, 2021, diesel",
  odometerKm: 48210,
  type: "Pre-owned inspection",
  score: 84,
  verdict: {
    label: "Negotiate",
    body: "Body repair on the right front fender and a catalyst fault code. Ask the seller to fix both, or price them in.",
  },
  /** Metal panels only: a paint gauge can't read plastic bumpers. Values in µm. */
  panels: [
    { id: "bonnet", label: "Bonnet", value: 118 },
    { id: "roof", label: "Roof", value: 112 },
    { id: "tailgate", label: "Tailgate", value: 121 },
    { id: "lf-fender", label: "Left front fender", value: 126 },
    { id: "rf-fender", label: "Right front fender", value: 512 },
    { id: "lf-door", label: "Left front door", value: 119 },
    { id: "rf-door", label: "Right front door", value: 124 },
    { id: "lr-door", label: "Left rear door", value: 286 },
    { id: "rr-door", label: "Right rear door", value: 117 },
    { id: "l-quarter", label: "Left rear quarter", value: 122 },
    { id: "r-quarter", label: "Right rear quarter", value: 115 },
  ],
  systems: [
    { name: "Engine", status: "pass" as Status, note: "No leaks; idles smoothly" },
    { name: "Transmission", status: "pass" as Status, note: "Clean shifts; clutch within range" },
    { name: "Suspension and steering", status: "attention" as Status, note: "Front left lower-arm bush worn" },
    { name: "Brakes", status: "pass" as Status, note: "Front pads about 60%" },
    { name: "Tyres and wheels", status: "attention" as Status, note: "Rear tyres made in week 38 of 2019" },
    { name: "Electricals", status: "pass" as Status, note: "Battery healthy; all lights work" },
    { name: "Cooling and AC", status: "pass" as Status, note: "AC vent at 7 °C" },
    { name: "Safety systems", status: "pass" as Status, note: "Airbag and ABS lights clear" },
    { name: "Body and paint", status: "fail" as Status, note: "Filler under the right front fender (512 µm)" },
    { name: "Interior", status: "pass" as Status, note: "Normal wear for the age" },
    { name: "Underbody", status: "pass" as Status, note: "Surface rust on exhaust hangers only" },
    { name: "Documents", status: "pass" as Status, note: "Chassis and engine numbers match the RC" },
  ],
  obd: [{ code: "P0420", text: "Catalyst efficiency below threshold", status: "attention" as Status }],
  photos: [
    { slot: "obd-scan-closeup", caption: "OBD scan: 1 stored code" },
    { slot: "paint-gauge-macro", caption: "Paint thickness, panel by panel" },
    { slot: "underbody-inspection", caption: "Underbody and suspension" },
  ] as const,
};
