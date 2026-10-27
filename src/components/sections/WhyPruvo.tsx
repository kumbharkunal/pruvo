import { whyPruvo } from "@/content/site";
import { SmartImage } from "@/components/ui/SmartImage";
import { CheckGlyph } from "@/components/ui/CheckGlyph";

export function WhyPruvo() {
  const w = whyPruvo;
  return (
    <section id="why-pruvo" className="section section--bay wp" data-theme="dark" data-sc-act="why-pruvo" aria-labelledby="wp-title">
      <div className="container-x wp__grid">
        <figure className="wp__portrait">
          <div className="wp__frame" data-portrait>
            <SmartImage slot="inspector-portrait" sizes="(min-width: 1024px) 36vw, 100vw" imgClassName="wp__img" ratio="3 / 4" />
          </div>
          <figcaption className="wp__note">{w.portraitNote}</figcaption>
        </figure>

        <div className="wp__content">
          <header data-reveal>
            <h2 id="wp-title" className="t-h2">
              {w.title}
            </h2>
            <p className="t-lead">{w.lead}</p>
          </header>
          <dl className="wp__points">
            {w.points.map((p) => (
              <div key={p.title} className="wp__point">
                <dt>
                  <CheckGlyph className="wp__check" />
                  {p.title}
                </dt>
                <dd>{p.body}</dd>
              </div>
            ))}
          </dl>
          {/* Permission pending (see CLIENT_QUESTIONS). The comment is cut off on Instagram and is never completed here. */}
          <figure className="wp__quote">
            <blockquote>
              <p>“{w.testimonial.quote}…”</p>
            </blockquote>
            <figcaption>
              {w.testimonial.by} <span>{w.testimonial.via}</span>
            </figcaption>
          </figure>
        </div>
      </div>
    </section>
  );
}
