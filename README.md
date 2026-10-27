# Pruvo homepage (demo)

A single-page site for **Pruvo**, an independent car inspection service in India: new-car pre-delivery inspection (PDI) and pre-purchase inspection for pre-owned cars. Built as a pitch demo.

- Live demo: https://pruvo-homepage.vercel.app (kept out of search engines while `NEXT_PUBLIC_SITE_ENV=demo`)
- Design system: [DESIGN.md](DESIGN.md) · product context: [PRODUCT.md](PRODUCT.md) · notes for coding agents: [CLAUDE.md](CLAUDE.md)

## Stack

Next.js 16 (App Router, Turbopack, fully static page) · React 19 · TypeScript · Tailwind CSS 4 (CSS-first tokens in `src/app/globals.css`) · GSAP 3 + ScrollTrigger, Lenis (desktop pointers only) and Motion, all loaded after the page is idle · Base UI Drawer for booking · zod · sharp for the image pipeline.

## Run it

```bash
npm install
npm run dev          # http://localhost:3000
npm run build        # production build (fails if the homepage stops being static)
npm run start        # serve the build
npm run lint
npm run typecheck
```

Node 20.9 or newer.

## Environment

Copy `.env.example` to `.env.local`. None of these are secrets.

| Variable | Values | What it does |
|---|---|---|
| `NEXT_PUBLIC_SITE_URL` | e.g. `https://pruvo-homepage.vercel.app` | Canonical URL, Open Graph, sitemap, JSON-LD |
| `NEXT_PUBLIC_SITE_ENV` | `demo` (default) or `live` | `demo` adds `noindex` (meta tag and `X-Robots-Tag` header) |
| `BOOKING_RELAY` | `off` (default), `dry-run`, `on` | Optional copy of each booking into Pruvo's Google Form (see below) |

## Content

All copy, contact details and links live in [`src/content/site.ts`](src/content/site.ts). Anything not yet confirmed by Pruvo carries `confirm: true` or a `CONFIRM WITH CLIENT` comment; search for those before going live. The sample report's illustrative values are in [`src/content/report.ts`](src/content/report.ts), and the hero and checkpoint hotspot positions are in [`src/content/hotspots.ts`](src/content/hotspots.ts) and `site.ts`.

## Images

Photos are AI stand-ins until Pruvo supplies real ones. Prompts for every slot are in [docs/IMAGE_PROMPTS.md](docs/IMAGE_PROMPTS.md), and [docs/image-prompts.html](docs/image-prompts.html) has a copy button per prompt.

1. Save the PNGs to `assets-src/images/` with the file names from the prompts (this folder is git-ignored).
2. Run `npm run images`. For every slot in [`scripts/image-slots.mjs`](scripts/image-slots.mjs) it writes AVIF and WebP files at fixed widths, with content hashes in their names, to `public/images/`, plus a blur placeholder. For the two hero photos it also draws the x-ray "engineering drawing" twin ([`scripts/xray.mjs`](scripts/xray.mjs)) and measures the car's bounds. Everything lands in `src/content/images.manifest.json`.
3. If a hero photo changes, re-check the marker positions: run `npm run dev`, open `/?calibrate`, click a point on the car, and copy the logged percentages into `src/content/hotspots.ts`.

A slot without a file renders an on-brand placeholder, so the page never breaks.

## Brand assets

The logo is a **temporary** crop of Pruvo's own Instagram artwork (`npm run brand`, sources in the git-ignored `_references/`). It is never redrawn or recoloured. Replace `public/brand/*` and the icons in `src/app/` when Pruvo sends a vector logo.

## Booking

Every "Book an inspection" button opens one booking sheet (bottom sheet on phones, side panel on desktop) with the Google Form's own fields in three steps. The default submit opens WhatsApp with every field prefilled, so nothing is stored by this site.

The optional relay at `src/app/api/book/route.ts` posts the same booking to Pruvo's Google Form:

- `off`: the route returns 404.
- `dry-run`: validates and returns the exact payload it would send, without sending it. **Test only with this.**
- `on`: posts to the live form. Never point tests at it; they would land in Pruvo's real responses.

If Pruvo edits the form, run `node scripts/form-ids.mjs` (GET only) to check the pinned entry ids in `src/lib/booking.ts`.

## QA

- `npm run shots -- --full --devices` captures every width from 320 to 1920 px plus Pixel 7 and iPhone 15 against `http://localhost:4400` (`npx next start -p 4400`), and reports horizontal overflow and console errors. Add `--reduced` for reduced motion.
- `npm run secret-scan` checks tracked files for API keys and tokens. A local `pre-push` hook runs it with `--pre-push`, which also scans the outgoing commits.

## Deploy

Vercel project `pruvo-homepage`, connected to this repo (pushes to `main` deploy to production). Set the three environment variables above in the Vercel project settings.
