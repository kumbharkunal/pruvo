import Link from "next/link";
import { Logo } from "@/components/ui/Logo";

export default function NotFound() {
  return (
    <main className="nf" data-theme="dark">
      <Logo tone="on-dark" className="nf__logo" />
      {/* eslint-disable-next-line @next/next/no-img-element -- decorative line drawing */}
      <img className="nf__car" src="/images/og/hero-lineart.png" alt="" width={760} height={425} />
      <h1 className="t-h2">We looked closely. This page isn&apos;t here.</h1>
      <p className="t-lead">The link may be old, or the address has a typo.</p>
      <Link href="/" className="btn btn--primary btn--lg">
        Back to the homepage
      </Link>
    </main>
  );
}
