/* eslint-disable @next/next/no-html-link-for-pages -- every link here is a document navigation, so the cross-document view transition plays */
import type { Metadata } from "next";
import { Logo } from "@/components/ui/Logo";

export const metadata: Metadata = { title: "Page not found · Pruvo" };

export default function NotFound() {
  return (
    <main className="nf" data-theme="dark">
      <a href="/" className="nf__home" aria-label="Pruvo homepage">
        <Logo tone="on-dark" className="nf__logo" lazy />
      </a>
      {/* eslint-disable-next-line @next/next/no-img-element -- decorative line drawing */}
      <img className="nf__car" src="/images/og/hero-lineart.png" alt="" width={760} height={425} loading="lazy" />
      <h1 className="t-h2">We looked closely. This page isn&apos;t here.</h1>
      <p className="t-lead">The link may be old, or the address has a typo.</p>
      <div className="nf__actions">
        <a href="/" className="btn btn--primary btn--lg">
          Back to the homepage
        </a>
        <a href="/#report" className="text-link text-link--dark">
          See a sample report
        </a>
        <a href="/#book" className="text-link text-link--dark">
          Book an inspection
        </a>
      </div>
    </main>
  );
}
