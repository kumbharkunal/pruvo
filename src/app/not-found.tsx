import type { Metadata } from "next";
import { Logo } from "@/components/ui/Logo";

export const metadata: Metadata = { title: "Page not found · Pruvo" };

export default function NotFound() {
  return (
    <main className="nf" data-theme="dark">
      <Logo tone="on-dark" className="nf__logo" lazy />
      {/* eslint-disable-next-line @next/next/no-img-element -- decorative line drawing */}
      <img className="nf__car" src="/images/og/hero-lineart.png" alt="" width={760} height={425} loading="lazy" />
      <h1 className="t-h2">We looked closely. This page isn&apos;t here.</h1>
      <p className="t-lead">The link may be old, or the address has a typo.</p>
      {/* eslint-disable-next-line @next/next/no-html-link-for-pages -- a document navigation, so the cross-document view transition plays */}
      <a href="/" className="btn btn--primary btn--lg">
        Back to the homepage
      </a>
    </main>
  );
}
