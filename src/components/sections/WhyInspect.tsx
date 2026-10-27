import { whyInspect } from "@/content/site";
import { slotSources } from "@/lib/images";
import { CheckGlyph } from "@/components/ui/CheckGlyph";

const SIZES = "(min-width: 1280px) 1200px, 100vw";

/** Feeling vs facts, shown with the hero car itself: the photo is the feeling, the drawing is the facts. */
function Diptych() {
  const photo = slotSources("hero-desktop", { sizes: SIZES, alt: "" });
  const twin = slotSources("hero-desktop", { sizes: SIZES, variant: "-xray", alt: "" });
  if (!photo || !twin) return null;
  return (
    <figure className="why__split" aria-hidden="true">
      <picture className="why__split-img">
        <source type="image/avif" srcSet={photo.avif.srcSet} sizes={photo.avif.sizes} />
        <img {...photo.webp} alt="" />
      </picture>
      <picture className="why__split-img why__split-img--twin">
        <source type="image/avif" srcSet={twin.avif.srcSet} sizes={twin.avif.sizes} />
        <img {...twin.webp} alt="" />
      </picture>
      <span className="why__split-line" />
      <figcaption>
        <span className="why__tag">{whyInspect.feeling.label}</span>
        <span className="why__tag why__tag--facts">{whyInspect.facts.label}</span>
      </figcaption>
    </figure>
  );
}

export function WhyInspect() {
  const w = whyInspect;
  return (
    <section id="why" className="section section--paper why" data-theme="light" data-sc-act="why" aria-labelledby="why-title">
      <div className="container-x">
        <header className="section-head" data-reveal>
          <h2 id="why-title" className="t-h2">
            {w.title}
          </h2>
          <p className="t-lead">{w.lead}</p>
        </header>

        <Diptych />

        <div className="why__grid">
          <div className="why__feeling" data-reveal>
            <p className="why__label">{w.feeling.label}</p>
            <p className="why__statement">{w.feeling.body}</p>
          </div>
          <div className="why__facts">
            <p className="why__label why__label--facts">
              {w.facts.label}: <span>{w.facts.intro.toLowerCase()}</span>
            </p>
            {w.facts.groups.map((g) => (
              <div key={g.title} className="why__group">
                <h3 className="why__group-title">{g.title}</h3>
                <ul className="why__list" role="list">
                  {g.items.map((item) => (
                    <li key={item}>
                      <CheckGlyph className="why__tick" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <p className="why__closing">
          <span>{w.closing[0]}</span> <span className="why__verify" data-verify-fill>{w.closing[1]}</span>
        </p>
      </div>
    </section>
  );
}
