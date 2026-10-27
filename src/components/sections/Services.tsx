import { services } from "@/content/site";
import { SmartImage } from "@/components/ui/SmartImage";
import { ServicesToggle } from "./ServicesToggle";

const SIZES = "(min-width: 1024px) 46vw, 100vw";

export function Services() {
  return (
    <section id="services" className="section section--paper svc-section" data-theme="light" data-sc-act="services" aria-labelledby="services-title">
      <div className="container-x">
        <header className="section-head" data-reveal>
          <h2 id="services-title" className="t-h2">
            {services.title}
          </h2>
          <p className="t-lead">{services.sub}</p>
        </header>
        <ServicesToggle
          images={{
            new: <SmartImage slot="pdi-delivery-bay" sizes={SIZES} className="svc__picture" imgClassName="svc__photo" />,
            used: <SmartImage slot="preowned-inspection" sizes={SIZES} className="svc__picture" imgClassName="svc__photo" />,
          }}
        />
      </div>
    </section>
  );
}
