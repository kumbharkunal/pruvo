import { IconChevronDown } from "@tabler/icons-react";
import { faq, whatsappHello } from "@/content/site";

/** Native <details name="faq">: exclusive, keyboard-ready and readable without JavaScript. */
export function Faq() {
  return (
    <section id="faq" className="section section--paper faq" data-theme="light" data-sc-act="faq" aria-labelledby="faq-title">
      <div className="container-x faq__grid">
        <header className="faq__head" data-reveal>
          <h2 id="faq-title" className="t-h2">
            {faq.title}
          </h2>
          <p className="t-lead">
            Anything else?{" "}
            <a href={whatsappHello} target="_blank" rel="noopener" className="text-link">
              Ask us on WhatsApp
            </a>
            .
          </p>
        </header>
        <div className="faq__list">
          {faq.items.map((item) => (
            <details key={item.q} name="faq" className="faq__item">
              <summary>
                <span>{item.q}</span>
                <IconChevronDown size={20} stroke={1.5} aria-hidden="true" className="faq__chev" />
              </summary>
              <div className="faq__a">
                <p>{item.a}</p>
              </div>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
