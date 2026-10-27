import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

// The first thing the client sees is this card in a WhatsApp preview. Flat navy and line art keep the
// PNG small (WhatsApp is picky above ~300 KB); fonts and images are local so it stays build-time static.
export const alt = "Pruvo car inspection. Professional eyes, better buys.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const toArrayBuffer = (b: Buffer) => b.buffer.slice(b.byteOffset, b.byteOffset + b.byteLength) as ArrayBuffer;

/** Cached so the card is prerendered at build time (uncached file reads would make the route dynamic). */
async function assets() {
  "use cache";
  // Literal paths so the build traces only these four files.
  const [display, text, logo, car] = await Promise.all([
    readFile(join(process.cwd(), "src/assets/fonts/Archivo-ExpandedSemiBold.ttf")),
    readFile(join(process.cwd(), "src/assets/fonts/Archivo-Regular.ttf")),
    readFile(join(process.cwd(), "public/brand/pruvo-logo-dark.png")),
    readFile(join(process.cwd(), "public/images/og/hero-lineart.png")),
  ]);
  return {
    display: toArrayBuffer(display),
    text: toArrayBuffer(text),
    logo: `data:image/png;base64,${logo.toString("base64")}`,
    car: `data:image/png;base64,${car.toString("base64")}`,
  };
}

export default async function OpengraphImage() {
  const { display, text, logo, car } = await assets();

  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", position: "relative", background: "#0C183C", color: "#fff", fontFamily: "Display" }}>
        {/* eslint-disable-next-line @next/next/no-img-element -- ImageResponse renders plain <img> */}
        <img src={car} width={700} height={391} alt="" style={{ position: "absolute", right: -10, bottom: 34, opacity: 0.95 }} />
        <div style={{ position: "absolute", left: 72, right: 72, bottom: 64, height: 2, display: "flex" }}>
          <div style={{ width: "60%", background: "#3B66CC" }} />
          <div style={{ width: "40%", background: "#548E45" }} />
        </div>
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", padding: "60px 72px 96px", width: "100%" }}>
          {/* eslint-disable-next-line @next/next/no-img-element -- ImageResponse renders plain <img> */}
          <img src={logo} width={190} height={54} alt="" />
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ fontSize: 74, lineHeight: 1, letterSpacing: -2, display: "flex" }}>Professional eyes,</div>
            <div style={{ fontSize: 74, lineHeight: 1.06, letterSpacing: -2, color: "#8FCB7A", display: "flex" }}>better buys.</div>
            <div style={{ marginTop: 26, fontSize: 28, color: "#A9B5D6", fontFamily: "Text", display: "flex" }}>New-car PDI and used car inspections across India</div>
          </div>
          <div style={{ display: "flex", alignItems: "center", fontFamily: "Text", fontSize: 24, color: "#E8EEFB" }}>
            <svg width="30" height="30" viewBox="0 0 24 24" style={{ marginRight: 12 }}>
              <path d="M5 12.8l4.4 4.4L19 7.6" fill="none" stroke="#8FCB7A" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Book on WhatsApp: +91 93552 17180
          </div>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: "Display", data: display, weight: 600, style: "normal" },
        { name: "Text", data: text, weight: 400, style: "normal" },
      ],
    },
  );
}
