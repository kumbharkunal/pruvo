/**
 * TEMPORARY logo: cropped from Pruvo's own Instagram artwork by scripts/brand.mjs (never redrawn).
 * "on-light" has the black wordmark, "on-dark" the white one (Pruvo's own dark usage, 2 Jun post).
 * "auto" stacks both and lets the nav's theme pick (CSS crossfade).
 */
type Tone = "on-light" | "on-dark" | "auto";

export function Logo({ tone, className = "" }: { tone: Tone; className?: string }) {
  return (
    <span className={`logo logo--${tone} ${className}`}>
      {tone !== "on-dark" && (
        // eslint-disable-next-line @next/next/no-img-element -- 15 KB static mark, sized by CSS
        <img src="/brand/pruvo-logo-light.webp" width={328} height={96} alt={tone === "auto" ? "" : "Pruvo"} className="logo__img logo__img--light" decoding="async" />
      )}
      {tone !== "on-light" && (
        // eslint-disable-next-line @next/next/no-img-element -- 24 KB static mark, sized by CSS
        <img src="/brand/pruvo-logo-dark.webp" width={339} height={96} alt={tone === "auto" ? "" : "Pruvo"} className="logo__img logo__img--dark" decoding="async" />
      )}
    </span>
  );
}
