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

// After load, while the visitor reads the first screen, fetch the below-the-fold photos one by one so they
// are ready when scrolled to (native lazy loading waits too long on slow 4G). Skipped on Save-Data and 2G.
// Waits until the hero's x-ray twin has arrived (the stage gets a data-state), so they never compete with it.
const WARM_IMAGES = `addEventListener("load",function(){var c=navigator.connection;if(c&&(c.saveData||/2g/.test(c.effectiveType||"")))return;function go(){[].filter.call(document.querySelectorAll('img[loading="lazy"]'),function(i){return !i.checkVisibility||i.checkVisibility()}).forEach(function(i,k){setTimeout(function(){i.loading="eager"},k*120)})}function idle(){window.requestIdleCallback?requestIdleCallback(go,{timeout:4000}):setTimeout(go,2000)}var s=document.getElementById("hero-stage");if(!s||s.dataset.state)idle();else{var m=new MutationObserver(function(){if(s.dataset.state){m.disconnect();idle()}});m.observe(s,{attributes:true,attributeFilter:["data-state"]})}},{once:true});`;

// A short tap of haptic feedback on every button, link and control, where the device supports vibration
// (Android browsers; iOS Safari has no Vibration API, so it stays silent there).
const HAPTICS = `document.addEventListener("click",function(e){var t=e.target;if(!navigator.vibrate||!t||!t.closest)return;if(t.closest('a[href],button,summary,label,select,[role="button"],[role="tab"],[role="radio"],[role="menuitem"],input[type="radio"],input[type="checkbox"],input[type="submit"]'))try{navigator.vibrate(12)}catch(_){}},{capture:true,passive:true});`;
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
        <script dangerouslySetInnerHTML={{ __html: WARM_IMAGES }} />
        <script dangerouslySetInnerHTML={{ __html: HAPTICS }} />
      </body>
    </html>
  );
}
