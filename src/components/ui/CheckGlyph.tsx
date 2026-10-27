/**
 * The "verified" glyph, after the check in Pruvo's shield. It draws on (stroke-dashoffset 1 → 0)
 * wherever a parent marks something verified; with no animation it is simply drawn.
 */
export function CheckGlyph({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={`check-glyph ${className}`} aria-hidden="true" fill="none">
      <path d="M5 12.8l4.4 4.4L19 7.6" pathLength={1} />
    </svg>
  );
}
