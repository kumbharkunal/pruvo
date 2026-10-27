import { how } from "@/content/site";

export function HowItWorks() {
  return (
    <section id="how" className="section section--paper how" data-theme="light" data-sc-act="how" aria-labelledby="how-title">
      <div className="container-x">
        <header className="section-head" data-reveal>
          <h2 id="how-title" className="t-h2">
            {how.title}
          </h2>
        </header>
        <ol className="how__steps" data-how role="list">
          <span className="how__rule" data-how-rule aria-hidden="true" />
          {how.steps.map((s, i) => (
            <li key={s.title} className="how__step" data-how-step>
              <span className="how__num" aria-hidden="true">
                {i + 1}
              </span>
              <h3 className="how__title">
                <span className="sr-only">Step {i + 1} of {how.steps.length}: </span>
                {s.title}
              </h3>
              <p className="how__body">{s.body}</p>
            </li>
          ))}
        </ol>
        <div className="how__cta">
          <button type="button" className="btn btn--primary btn--lg" data-book="">
            Book an inspection
          </button>
        </div>
      </div>
    </section>
  );
}
