/**
 * Hero markers, as % of the source photo (so they stay glued to the car at every crop).
 * Readings are illustrative (the stage says so). Fine-tune positions with `?calibrate` in dev:
 * clicking the hero logs the % coordinates to the console.
 */
export type Side = "left" | "right" | "top" | "bottom";

export type Marker = {
  id: string;
  label: string;
  /** Counted up from 0 on reveal. */
  value?: number;
  unit?: string;
  /** Shown as-is when there is no numeric value. */
  text?: string;
  x: number;
  y: number;
  side: Side;
};

export const heroMarkers: { desktop: Marker[]; mobile: Marker[] } = {
  desktop: [
    { id: "obd", label: "OBD", text: "0 codes", x: 59.6, y: 46.5, side: "top" },
    { id: "gap", label: "Panel gap", text: "4.1 mm", x: 51, y: 50.5, side: "left" },
    { id: "lights", label: "Lights", text: "OK", x: 63.6, y: 58.2, side: "bottom" },
    { id: "tyre", label: "Tyre date", text: "wk 34/26", x: 71.4, y: 79.5, side: "right" },
    { id: "paint", label: "Paint", value: 118, unit: "µm", x: 83.5, y: 59, side: "top" },
  ],
  mobile: [
    { id: "lights", label: "Lights", text: "OK", x: 51, y: 67.9, side: "top" },
    { id: "tyre", label: "Tyre date", text: "wk 34/26", x: 65.9, y: 79, side: "left" },
    { id: "paint", label: "Paint", value: 118, unit: "µm", x: 80.8, y: 68.8, side: "top" },
  ],
};
