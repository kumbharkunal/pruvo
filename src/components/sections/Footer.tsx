import { footer, pageNav, site, whatsappHello } from "@/content/site";
import { Logo } from "@/components/ui/Logo";
import { keep } from "@/components/ui/Keep";
import { FacebookLogo, InstagramLogo, WhatsAppLogo, YouTubeLogo } from "@/components/ui/SocialLogo";

export function Footer() {
  return (
    <footer className="footer" data-theme="dark" aria-label="Footer">
      <div className="container-x footer__grid">
        <div className="footer__brand">
          <Logo tone="on-dark" className="footer__logo" />
          <p className="footer__tag">{site.tagline}</p>
          <p className="footer__lockup">
            <span className="bicolor-rule" aria-hidden="true" />
            {site.lockup}
          </p>
          <p className="footer__blurb">{keep(footer.blurb)}</p>
        </div>

        <nav className="footer__nav" aria-label="Footer">
          <p className="footer__heading">On this page</p>
          <ul role="list">
            {pageNav.map((n) => (
              <li key={n.href}>
                <a href={n.href}>{n.label}</a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="footer__contact">
          <p className="footer__heading">Talk to us</p>
          <ul role="list">
            <li>
              <a href={`tel:${site.phone.tel}`}>{site.phone.display}</a>
            </li>
            <li>
              <a href={whatsappHello} target="_blank" rel="noopener" className="footer__wa">
                <WhatsAppLogo className="footer__wa-logo" /> WhatsApp
              </a>
            </li>
            <li>
              <a href={site.links.googleForm} target="_blank" rel="noopener">
                Booking form
              </a>
            </li>
          </ul>
        </div>

        <div className="footer__social">
          <p className="footer__heading">Follow</p>
          <ul role="list" className="footer__icons">
            <li>
              <a href={site.links.instagram} target="_blank" rel="noopener" aria-label="Pruvo on Instagram">
                <InstagramLogo uid="footer" />
              </a>
            </li>
            <li>
              <a href={site.links.facebook} target="_blank" rel="noopener" aria-label="Pruvo on Facebook">
                <FacebookLogo uid="footer" />
              </a>
            </li>
            <li>
              <a href={site.links.youtube} target="_blank" rel="noopener" aria-label="Pruvo on YouTube">
                <YouTubeLogo />
              </a>
            </li>
          </ul>
        </div>
      </div>
      <div className="container-x footer__base">
        <span>{site.serving}</span>
        <span>{footer.copyright}</span>
        <span>{footer.demoNote}</span>
      </div>
    </footer>
  );
}
