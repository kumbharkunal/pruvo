import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { CHECKPOINTS, site } from "@/content/site";
import { BookingRoot, type RelayMode } from "@/components/booking/BookingRoot";

// One variable family: the width axis gives the expanded display cut, the text cut and condensed data labels.
// Self-hosted and cut down by scripts/fonts.mjs (Basic Latin plus the copy's symbols, weights 400–700,
// widths 87–125%): 44 KB instead of 89 KB for Google's full latin file.
const archivo = localFont({
  src: [{ path: "../assets/fonts/archivo-latin-var.woff2", weight: "400 700", style: "normal" }],
  declarations: [{ prop: "font-stretch", value: "87% 125%" }],
  display: "swap",
  adjustFontFallback: "Arial",
  variable: "--font-archivo",
});

const isDemo = (process.env.NEXT_PUBLIC_SITE_ENV ?? "demo") === "demo";
const relay = (["off", "dry-run", "on"].includes(process.env.BOOKING_RELAY ?? "") ? process.env.BOOKING_RELAY : "off") as RelayMode;

const title = "Pruvo car inspection: new-car PDI and used car inspection";
const description = `Pre-delivery inspection (PDI) for new cars and pre-purchase inspection for used cars by certified engineers. ${CHECKPOINTS} checkpoints, OBD scan and a photo report.`;

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  interactiveWidget: "resizes-content",
  themeColor: "#0C183C",
  colorScheme: "light",
};

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title,
  description,
  applicationName: "Pruvo",
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "en_IN",
    siteName: "Pruvo",
    url: "/",
    title: "Pruvo: Professional eyes, better buys.",
    description: "Independent new-car PDI and used car inspections across India. Book on WhatsApp in a minute.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Pruvo: Professional eyes, better buys.",
    description: "Independent new-car PDI and used car inspections across India.",
  },
  robots: isDemo ? { index: false, follow: false } : { index: true, follow: true },
  formatDetection: { telephone: false, email: false, address: false },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en-IN" className={archivo.variable} suppressHydrationWarning>
      <head>
        {/* Marks JS as available before first paint, so progressive-enhancement styles never flash. */}
        <script dangerouslySetInnerHTML={{ __html: "document.documentElement.classList.add('js')" }} />
      </head>
      <body>
        <a href="#main" className="skip-link">
          Skip to content
        </a>
        {children}
        <BookingRoot relay={relay} />
      </body>
    </html>
  );
}
