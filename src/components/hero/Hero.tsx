import { hero, whatsappHello } from "@/content/site";
import { heroMarkers, type Marker } from "@/content/hotspots";
import { slotSources, type SlotEntry } from "@/lib/images";
import { CheckGlyph } from "@/components/ui/CheckGlyph";
import { WhatsAppLogo } from "@/components/ui/SocialLogo";
import { HeroLens } from "./HeroLens";

const WIDE = "(min-width: 768px)";
const NARROW = "(max-width: 767.98px)";
const SIZES_WIDE = "(min-width: 1024px) 90vw, 161vw";
const SIZES_NARROW = "100vw";
const SWEEP_S = 1.2;
const SWEEP_DELAY_S = 0.2;

/** cubic-bezier(0.76, 0, 0.24, 1) (--ease-wipe): the time at which the plane has covered `p` of its path. */
function wipeTimeAt(p: number) {
  const [x1, y1, x2, y2] = [0.76, 0, 0.24, 1];
  const bez = (a: number, b: number, s: number) => 3 * a * s * (1 - s) ** 2 + 3 * b * s * s * (1 - s) + s ** 3;
  let lo = 0, hi = 1;
  for (let i = 0; i < 30; i++) {
    const mid = (lo + hi) / 2;
    if (bez(y1, y2, mid) < p) lo = mid;
    else hi = mid;
  }
  return bez(x1, x2, (lo + hi) / 2);
}

/** Scan range and vertical band: the car's own bounds (measured by scripts/xray.mjs) plus a little air. */
function scanRange(entry: SlotEntry) {
  const car = entry.car ?? { x0: 0, x1: 1, y0: 0, y1: 1 };
  return { from: Math.max(0, car.x0 - 0.02), to: Math.min(1, car.x1 + 0.02), top: car.y0, bottom: car.y1 };
}

function Markers({ list, variant, from, to }: { list: Marker[]; variant: "wide" | "narrow"; from: number; to: number }) {
  return (
    <ul className={`hero__markers hero__markers--${variant}`} aria-hidden="true">
      {list.map((mk) => {
        const p = Math.min(1, Math.max(0, (mk.x / 100 - from) / (to - from)));
        const delay = SWEEP_DELAY_S + wipeTimeAt(p) * SWEEP_S;
        return (
          <li key={mk.id} className="marker" data-side={mk.side} style={{ "--x": `${mk.x}%`, "--y": `${mk.y}%`, "--d": `${delay.toFixed(3)}s` } as React.CSSProperties}>
            <span className="marker__dot">
              <CheckGlyph className="marker__check" />
            </span>
            <span className="marker__label">
              <span className="marker__name">{mk.label}</span>
              <span className="marker__value">
                {mk.value != null ? <span className="marker__num" style={{ "--n": mk.value } as React.CSSProperties} /> : mk.text}
                {mk.unit ? <span className="marker__unit"> {mk.unit}</span> : null}
              </span>
            </span>
          </li>
        );
      })}
    </ul>
  );
}

// Runs during HTML parse, before React: start the CSS intro once the photo AND its twin have decoded,
// so the sweep never runs over an empty stage. Reduced motion or a slow network get the static split.
const READY = `(function(){var s=document.getElementById("hero-stage");if(!s)return;if(matchMedia("(prefers-reduced-motion: reduce)").matches){s.dataset.state="static";return}var imgs=[].slice.call(s.querySelectorAll(".hero__layer img")),n=0,done=false;function go(){if(done)return;done=true;requestAnimationFrame(function(){requestAnimationFrame(function(){s.dataset.state="intro"})})}function one(){if(++n>=imgs.length)go()}imgs.forEach(function(i){if(i.complete&&i.naturalWidth)one();else{i.addEventListener("load",one,{once:true});i.addEventListener("error",one,{once:true})}});setTimeout(function(){if(!done){done=true;s.dataset.state="static"}},4500)})();`;

export function Hero() {
  const photoWide = slotSources("hero-desktop", { sizes: SIZES_WIDE, loading: "eager", fetchPriority: "high" });
  const photoNarrow = slotSources("hero-mobile", { sizes: SIZES_NARROW, loading: "eager", fetchPriority: "high" });
  const twinWide = slotSources("hero-desktop", { sizes: SIZES_WIDE, variant: "-xray", alt: "", loading: "eager", fetchPriority: "low" });
  const twinNarrow = slotSources("hero-mobile", { sizes: SIZES_NARROW, variant: "-xray", alt: "", loading: "eager", fetchPriority: "low" });

  const wide = photoWide ? scanRange(photoWide.entry) : { from: 0.33, to: 0.99, top: 0.32, bottom: 0.89 };
  const narrow = photoNarrow ? scanRange(photoNarrow.entry) : { from: 0.02, to: 0.99, top: 0.53, bottom: 0.85 };
  const heroVars = {
    "--scan-from-w": `${(wide.from * 100).toFixed(2)}%`,
    "--scan-to-w": `${(wide.to * 100).toFixed(2)}%`,
    "--scan-from-n": `${(narrow.from * 100).toFixed(2)}%`,
    "--scan-to-n": `${(narrow.to * 100).toFixed(2)}%`,
    "--car-top-w": wide.top.toFixed(4),
    "--car-bot-w": wide.bottom.toFixed(4),
    "--car-top-n": narrow.top.toFixed(4),
    "--car-bot-n": narrow.bottom.toFixed(4),
  } as React.CSSProperties;

  return (
    <section id="top" className="hero" data-theme="dark" data-sc-act="hero" aria-labelledby="hero-title" style={heroVars}>
      {/* The LCP image, preloaded per art direction (React hoists these into <head>). Never faded in. */}
      {photoWide && <link rel="preload" as="image" type="image/avif" imageSrcSet={photoWide.avif.srcSet} imageSizes={photoWide.avif.sizes} media={WIDE} fetchPriority="high" />}
      {photoNarrow && <link rel="preload" as="image" type="image/avif" imageSrcSet={photoNarrow.avif.srcSet} imageSizes={photoNarrow.avif.sizes} media={NARROW} fetchPriority="high" />}

      <div className="hero__stage" id="hero-stage" suppressHydrationWarning>
        <div className="hero__box">
          {photoWide && photoNarrow && (
            <picture className="hero__layer hero__photo">
              <source media={WIDE} type="image/avif" srcSet={photoWide.avif.srcSet} sizes={photoWide.avif.sizes} />
              <source media={WIDE} type="image/webp" srcSet={photoWide.webp.srcSet} sizes={photoWide.webp.sizes} />
              <source type="image/avif" srcSet={photoNarrow.avif.srcSet} sizes={photoNarrow.avif.sizes} />
              <img {...photoNarrow.webp} alt={photoNarrow.entry.alt} />
            </picture>
          )}
          {twinWide && twinNarrow && (
            <picture className="hero__layer hero__xray">
              <source media={WIDE} type="image/avif" srcSet={twinWide.avif.srcSet} sizes={twinWide.avif.sizes} />
              <source media={WIDE} type="image/webp" srcSet={twinWide.webp.srcSet} sizes={twinWide.webp.sizes} />
              <source type="image/avif" srcSet={twinNarrow.avif.srcSet} sizes={twinNarrow.avif.sizes} />
              <img {...twinNarrow.webp} alt="" />
            </picture>
          )}
          <span className="hero__plane" aria-hidden="true" />
          <Markers list={heroMarkers.desktop} variant="wide" from={wide.from} to={wide.to} />
          <Markers list={heroMarkers.mobile} variant="narrow" from={narrow.from} to={narrow.to} />
          <HeroLens label={hero.sliderLabel} />
        </div>
        <span className="hero__note" aria-hidden="true">
          {hero.readingsNote}
        </span>
      </div>

      <div className="hero__top container-x">
        <h1 id="hero-title" className="t-display hero__title">
          <span className="hero__line">{hero.title[0]}</span> <span className="hero__line">{hero.title[1]}</span>
        </h1>
        <p className="hero__sub">{hero.sub}</p>
      </div>

      <div className="hero__bottom container-x">
        <div className="hero__ctas">
          <button type="button" className="btn btn--primary btn--lg" data-book="">
            {hero.cta}
          </button>
          <a href={whatsappHello} className="btn btn--ghost-dark btn--lg" target="_blank" rel="noopener" aria-label="Chat with Pruvo on WhatsApp">
            <WhatsAppLogo className="btn__logo" />
            <span className="hero__wa-label">{hero.whatsapp}</span>
          </a>
        </div>
        <ul className="hero__trust" role="list">
          {hero.trust.map((t) => (
            <li key={t}>
              <CheckGlyph className="hero__trust-check" />
              {t}
            </li>
          ))}
        </ul>
        <p className="hero__note hero__note--foot" aria-hidden="true">
          {hero.readingsNote}
        </p>
      </div>

      <script dangerouslySetInnerHTML={{ __html: READY }} />
      <noscript>
        <style>{`#hero-stage .hero__xray{clip-path:inset(0 50% 0 0)}#hero-stage .hero__markers .marker{opacity:1}`}</style>
      </noscript>
    </section>
  );
}
