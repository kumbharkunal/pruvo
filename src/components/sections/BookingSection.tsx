import { booking, site, whatsappHello } from "@/content/site";
import { WhatsAppLogo } from "@/components/ui/SocialLogo";

export function BookingSection() {
  return (
    <section id="book" className="section section--bay book" data-theme="dark" data-sc-act="book" aria-labelledby="book-title">
      <div className="book__art" aria-hidden="true">
        {/* eslint-disable-next-line @next/next/no-img-element -- decorative line drawing of the hero car */}
        <img src="/images/og/hero-lineart.png" alt="" width={760} height={425} loading="lazy" decoding="async" />
        <span className="book__lens" />
      </div>
      <div className="container-x book__inner">
        <div className="book__copy" data-reveal>
          <h2 id="book-title" className="t-h2">
            {booking.title}
          </h2>
          <p className="t-lead">{booking.sub}</p>
          <p className="book__asks">We&apos;ll ask for the car, your city, a preferred date, your name and a mobile number. It takes about a minute.</p>
        </div>
        <div className="book__actions">
          <button type="button" className="btn btn--primary btn--xl" data-book="">
            {booking.cta}
          </button>
          <a href={whatsappHello} className="btn btn--ghost-dark btn--xl" target="_blank" rel="noopener">
            <WhatsAppLogo className="btn__logo" />
            WhatsApp
          </a>
          <ul className="book__alt" role="list">
            <li>
              <a href={`tel:${site.phone.tel}`} className="text-link text-link--dark">
                {booking.call}
              </a>
            </li>
            <li>
              <a href={site.links.googleForm} target="_blank" rel="noopener" className="text-link text-link--dark">
                {booking.googleForm}
              </a>
            </li>
          </ul>
        </div>
      </div>
    </section>
  );
}
