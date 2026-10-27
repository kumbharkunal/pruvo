import { faq, services, site } from "@/content/site";
import { SiteNav } from "@/components/nav/SiteNav";
import { Hero } from "@/components/hero/Hero";
import { WhyInspect } from "@/components/sections/WhyInspect";
import { Services } from "@/components/sections/Services";
import { Checkpoints } from "@/components/sections/Checkpoints";
import { SampleReport } from "@/components/sections/SampleReport";
import { HowItWorks } from "@/components/sections/HowItWorks";
import { WhyPruvo } from "@/components/sections/WhyPruvo";
import { Faq } from "@/components/sections/Faq";
import { BookingSection } from "@/components/sections/BookingSection";
import { Footer } from "@/components/sections/Footer";
import { WhatsAppFab } from "@/components/WhatsAppFab";
import { Enhance } from "@/components/motion/Enhance";

// The whole homepage is prerendered; the build fails if anything ever makes it request-time.
export const ensureStatic = "navigation";

const org = `${site.url}/#org`;
const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": org,
      name: "Pruvo",
      url: site.url,
      logo: `${site.url}/brand/pruvo-logo-light.png`,
      slogan: site.tagline,
      sameAs: [site.links.instagram, site.links.facebook],
      areaServed: { "@type": "Country", name: "India" },
      contactPoint: [{ "@type": "ContactPoint", telephone: "+91-93552-17180", contactType: "customer service", areaServed: "IN" }],
    },
    {
      "@type": "Service",
      "@id": `${site.url}/#pdi`,
      name: "New car pre-delivery inspection (PDI)",
      serviceType: "Car pre-delivery inspection",
      description: services.tabs.new.line,
      provider: { "@id": org },
      areaServed: { "@type": "Country", name: "India" },
    },
    {
      "@type": "Service",
      "@id": `${site.url}/#ppi`,
      name: "Pre-owned car pre-purchase inspection",
      serviceType: "Used car inspection",
      description: services.tabs.used.line,
      provider: { "@id": org },
      areaServed: { "@type": "Country", name: "India" },
    },
    {
      "@type": "FAQPage",
      mainEntity: faq.items.map((i) => ({ "@type": "Question", name: i.q, acceptedAnswer: { "@type": "Answer", text: i.a } })),
    },
  ],
};

export default function Home() {
  return (
    <>
      <SiteNav />
      <main id="main" tabIndex={-1}>
        <Hero />
        <WhyInspect />
        <Services />
        <Checkpoints />
        <SampleReport />
        <HowItWorks />
        <WhyPruvo />
        <Faq />
        <BookingSection />
      </main>
      <Footer />
      <WhatsAppFab />
      <Enhance />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
    </>
  );
}
