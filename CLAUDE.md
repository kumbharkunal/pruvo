# CLAUDE.md

Notes for coding agents working on the Pruvo homepage. Read [DESIGN.md](DESIGN.md) before changing anything visual and [PRODUCT.md](PRODUCT.md) before changing copy.

@AGENTS.md

## Commands

```bash
npm run dev            # dev server
npm run build          # production build; must stay green and keep "/" static
npm run lint           # eslint
npm run typecheck      # tsc --noEmit
npm run images         # assets-src/images/*.png -> public/images + src/content/images.manifest.json
npm run brand          # temporary logo crops from _references/ -> public/brand, app icons
npm run shots -- --full --devices   # Playwright screenshots; needs `npx next start -p 4400`
npm run secret-scan    # scan tracked files for secrets
node scripts/form-ids.mjs           # GET-only check of the Google Form entry ids
```

## Folder map

```
src/app/            layout (fonts, metadata, viewport), page (sections + JSON-LD), globals.css (all tokens and styles),
                    opengraph-image (static, built from local fonts and line art), robots, sitemap, not-found, api/book (relay)
src/content/        site.ts (all copy, contacts, CONFIRM flags), report.ts (illustrative sample report), hotspots.ts,
                    images.manifest.json (generated; do not edit by hand)
src/components/     hero/ (CSS intro + HeroLens), nav/, sections/, booking/ (lazy sheet), motion/ (idle-loaded animators), ui/
src/lib/            images (custom loader over pre-generated files), booking (zod schema, WhatsApp text, form payload), scroll
scripts/            image pipeline, x-ray twin, brand crops, OG fonts, screenshots, secret scan, form ids, prompts page
docs/               image prompts (md + html)
_internal/, _references/, assets-src/   private and git-ignored; never commit, never quote from them in public files
```

## How the page is put together

- `page.tsx` is a Server Component and the route is static (`ensureStatic = "navigation"` fails the build otherwise).
- Client islands: nav, hero lens, services toggle, report, FAQ (native `<details>`), WhatsApp button, booking root.
- The hero intro is CSS only, started by an inline script once both hero images have decoded. Reduced motion and slow networks get a static split.
- GSAP, ScrollTrigger, SplitText and Lenis load after `requestIdleCallback` (`motion/Enhance.tsx`) and only decorate server-rendered content; everything is readable without them. Lenis runs on fine pointers only.
- One owner per element: CSS for the hero intro, GSAP for scroll, Motion for component state (`layoutId`), a plain rAF loop for the lens.
- Images never use the runtime optimiser: `src/lib/images.ts` maps `(slot, width)` to the pre-generated files. Keep `next.config.ts` `images.deviceSizes` in step with `scripts/image-slots.mjs`.

## Rules

- Never invent business facts: no stats, prices, addresses, reviews, certifications or partner logos. Unconfirmed claims stay flagged in `site.ts` and listed for the client.
- "300+" checkpoints is one constant (`CHECKPOINTS`); never write the number anywhere else.
- The logo is a crop of Pruvo's artwork: never redraw, recolour or distort it. Social logos are the official SVGs, self-hosted.
- The Instagram testimonial is quoted only up to where it was cut off and stays marked permission pending. Never complete it.
- Never send a test booking to the live Google Form. Test the relay with `BOOKING_RELAY=dry-run` only.
- Copy style: sentence case, no em dashes, no eyebrow labels, no pill badges, headlines at most two lines at every width. Statuses are an icon plus a word, never colour alone.
- Motion: animate transform, opacity and clip-path only; respect `prefers-reduced-motion`; no idle loops or scroll-jacking.
- Secrets: this project has none. Never add API keys, tokens or `.env` files with secrets. The repo is public; run `npm run secret-scan` before every push (the local pre-push hook does it too). Never force-push.
- Commit in logical steps.
