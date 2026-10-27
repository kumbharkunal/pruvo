import { slotSources, focalPosition, type SlotName } from "@/lib/images";

type Props = {
  slot: SlotName;
  /** The `sizes` attribute: how wide this image renders at each breakpoint. */
  sizes: string;
  className?: string;
  imgClassName?: string;
  alt?: string;
  loading?: "eager" | "lazy";
  fetchPriority?: "high" | "low" | "auto";
  /** Aspect ratio of the on-brand placeholder shown while a source image is missing. */
  ratio?: string;
};

/**
 * AVIF/WebP <picture> for one photo slot, with the blur placeholder painted behind the image
 * (getImageProps can't take `placeholder`). Falls back to a blueprint placeholder at the right ratio
 * until the image exists.
 */
export function SmartImage({ slot, sizes, className, imgClassName, alt, loading = "lazy", fetchPriority, ratio = "4 / 3" }: Props) {
  const s = slotSources(slot, { sizes, alt, loading, fetchPriority });
  if (!s) {
    return (
      <div className={`img-placeholder ${className ?? ""}`} style={{ aspectRatio: ratio }} role="img" aria-label={alt ?? "Photo coming soon"}>
        <span>{slot.replace(/-/g, " ")}</span>
      </div>
    );
  }
  const { avif, webp, entry } = s;
  const position = focalPosition(entry);
  return (
    <picture className={className}>
      <source type="image/avif" srcSet={avif.srcSet} sizes={avif.sizes} />
      <img
        {...webp}
        alt={webp.alt}
        className={imgClassName}
        style={{ ...webp.style, objectPosition: position, backgroundImage: `url("${entry.blur}")`, backgroundSize: "cover", backgroundPosition: position }}
      />
    </picture>
  );
}
