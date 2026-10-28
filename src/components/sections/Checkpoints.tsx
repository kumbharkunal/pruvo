import { checkpoints } from "@/content/site";
import { getSlot, slotSources } from "@/lib/images";
import { CheckGlyph } from "@/components/ui/CheckGlyph";
import { SmartImage } from "@/components/ui/SmartImage";
import { SystemIcon } from "@/components/ui/icons";

/** Crop of the desktop twin that frames just the car (bounds measured by scripts/xray.mjs). */
function carCrop() {
  const e = getSlot("hero-desktop");
  const car = e?.car ?? { x0: 0.33, y0: 0.3, x1: 0.97, y1: 0.9 };
  const aspectImg = (e?.width ?? 1672) / (e?.height ?? 941);
  const x0 = Math.max(0, car.x0 - 0.03), x1 = Math.min(1, car.x1 + 0.03);
  const y0 = Math.max(0, car.y0 - 0.06), y1 = Math.min(1, car.y1 + 0.05);
  const cw = x1 - x0, ch = y1 - y0;
  const aspect = (cw * aspectImg) / ch; // figure aspect (w/h)
  const boxW = 1 / cw; // box width in figure widths
  const boxH = boxW / aspectImg; // box height in figure widths
  return {
    aspect: aspect.toFixed(4),
    width: `${(boxW * 100).toFixed(3)}%`,
    left: `${(-x0 * boxW * 100).toFixed(3)}%`,
    top: `${((-y0 * boxH) / (1 / aspect)) * 100}%`,
  };
}

export function Checkpoints() {
  const c = checkpoints;
  const crop = carCrop();
  const twin = slotSources("hero-desktop", { sizes: "(min-width: 1024px) 90vw, 150vw", variant: "-xray", alt: "" });
  return (
    <section id="checkpoints" className="section section--bay cp" data-theme="dark" data-sc-act="checkpoints" aria-labelledby="cp-title">
      <div className="container-x">
        <header className="cp__head" data-reveal>
          <h2 id="cp-title" className="t-h2">
            <span className="cp__title-line">{c.title[0]}</span> <span className="cp__title-line cp__title-line--soft">{c.title[1]}</span>
          </h2>
          <p className="cp__count">
            <span className="cp__num">{c.count}</span>
            <span className="cp__unit">{c.countLabel}</span>
          </p>
          <p className="t-lead cp__sub">{c.sub}</p>
        </header>

        <div className="cp__stage" data-cp-stage>
          <figure className="cp__figure" style={{ aspectRatio: crop.aspect }}>
            <div className="cp__box" style={{ width: crop.width, left: crop.left, top: crop.top }}>
              {twin && (
                <picture className="cp__twin">
                  <source type="image/avif" srcSet={twin.avif.srcSet} sizes={twin.avif.sizes} />
                  <img {...twin.webp} alt="" />
                </picture>
              )}
              {c.systems.map((s) => (
                <span
                  key={s.id}
                  className="cp__spot"
                  data-cp-spot
                  data-side={s.at[0] > 72 ? "left" : "right"}
                  aria-hidden="true"
                  style={{ "--x": `${s.at[0]}%`, "--y": `${s.at[1]}%` } as React.CSSProperties}
                >
                  <span className="cp__spot-ring" />
                  <span className="cp__spot-label">{s.name}</span>
                </span>
              ))}
            </div>
            {c.systems
              .filter((s) => s.evidence)
              .map((s) => (
                <div key={s.id} className="cp__inset" data-cp-inset={s.id} aria-hidden="true">
                  <SmartImage slot={s.evidence!} sizes="240px" imgClassName="cp__inset-img" alt="" />
                </div>
              ))}
            <figcaption className="cp__progress">
              <span className="cp__bar" aria-hidden="true">
                <span data-cp-bar />
              </span>
              <span className="cp__step" data-cp-count aria-hidden="true">
                {c.systems.length} systems
              </span>
            </figcaption>
          </figure>

          <div className="cp__after">
            <button type="button" className="btn btn--primary btn--lg" data-book="">
              Book an inspection
            </button>
            <a href="#report" className="text-link text-link--dark">
              See a sample report
            </a>
          </div>

          <ol className="cp__list" role="list">
            {c.systems.map((s) => (
              <li key={s.id} className="cp__row" data-cp-row={s.id}>
                <span className="cp__icon">
                  <SystemIcon name={s.icon} size={22} />
                </span>
                <span className="cp__text">
                  <span className="cp__name">{s.name}</span>
                  <span className="cp__detail">{s.detail}</span>
                </span>
                <CheckGlyph className="cp__check" />
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
