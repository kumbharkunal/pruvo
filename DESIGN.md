# DESIGN.md: Pruvo, "the proof layer"

The design system as shipped. Tokens live in `src/app/globals.css` (`@theme` and `:root`); this file explains them.

## 1. Visual theme and atmosphere

Every car has two layers: the shine the seller shows you, and the proof an engineer finds. The page is built on one gesture, **revealing the proof layer**: a plane of light sweeps across a white SUV in a navy studio and turns it into its engineering drawing, markers lock onto readings, and the drawing becomes a lens (desktop) or a scan bar (phones) the visitor controls.

- **Two surfaces.** *Inspection bay* (navy) is where the car is. *Report paper* (cool white) is where the facts are. Switching between them signals "here is the evidence".
- **Mood:** precise, calm, unbiased. An engineering document, not a showroom brochure, and never a fear-selling dealer site.
- **One peak.** The hero is the only large motion. Everything else uses the same grammar at lower volume: hotspots light up, checks draw, readings resolve.
- **Pruvo's own language, cleaned up.** Their navy posts, their x-ray post, their green check and the blue/green two-colour rule from their lockups.

## 2. Colour palette and roles

| Token | Hex | Role |
|---|---|---|
| `bay-950` | `#060D22` | footer, deepest navy |
| `bay-900` | `#0C183C` | inspection-bay background |
| `bay-800` | `#14244F` | raised elements on navy (icon wells) |
| `bay-700` | `#1E3368` | hover and pressed on navy |
| `paper` | `#F4F7FB` | report-paper background (cool, never cream) |
| `sheet` | `#FFFFFF` | report sheet, inputs, booking sheet |
| `line-paper` | `#DCE3EE` | hairlines on paper (decorative only) |
| `ink-900` | `#0E1838` | text on paper (16.2:1) |
| `ink-700` | `#3A4566` | secondary text, input borders (8.8:1) |
| `ink-500` | `#56617F` | tertiary text (5.7:1) |
| `blue-600` | `#3B66CC` | **Pruvo blue**: primary buttons, active states (white text 5.3:1) |
| `blue-700` | `#2F55B0` | links on paper, primary hover |
| `blue-500` | `#4A7DD5` | logo blue, graphics only |
| `blue-300` | `#93B3F5` | blue text and line-work on navy |
| `green-700` | `#3A6E2E` | "verified" text on paper |
| `green-500` | `#548E45` | logo green, graphics only (check glyph, rule) |
| `green-300` | `#8FCB7A` | "verified" on navy, locked-on checks |
| `fog` | `#A9B5D6` | secondary text on navy (8.5:1) |
| `amber-700` / `amber-300` | `#8A5300` / `#F2B65A` | report "attention" only |
| `red-700` / `red-300` | `#B42318` / `#FF9087` | report "fail" only |

- Blue means **act**, green means **verified**. Amber and red appear only inside the sample report.
- Lines on navy: `rgb(196 212 255 / 0.14)`. Every component edge that carries meaning reaches 3:1.
- **Bicolour rule** (Pruvo's lockup motif): a 2 px line, 60% `blue` then 40% `green`. Used for the checkpoint progress, the How-it-works connector, the booking progress and the footer lockup.
- The two-tone headline happens once: "Buy the feeling. **Verify the facts.**", whose second sentence fills from ink to `green-700` as it scrolls in.

## 3. Typography

**Archivo**, one variable family (`next/font/google`, `axes: ["wdth"]`), width 62–125, with tabular figures. No monospace anywhere: readings, OBD codes and scores use Archivo's tabular figures at a condensed width.

| Role | Size | Width / weight | Leading | Use |
|---|---|---|---|---|
| Display | phones `clamp(2.375rem, 1.3rem + 5.4vw, 3.25rem)`, tablet `clamp(3.25rem, 1.2rem + 4.4vw, 4.4rem)`, desktop `clamp(3.75rem, 1.6rem + 4.4vw, 6.5rem)` | 88% → 110% → 125%, 620 | 0.95–0.98, −0.03em | H1 only, two lines at every width |
| Heading | `clamp(1.75rem, 1.2rem + 2.2vw, 3rem)` | 112%, 600 | 1.05, −0.02em | H2, `text-wrap: balance` |
| Lead | `clamp(1.125rem, 1.02rem + 0.45vw, 1.4375rem)` | 100%, 430 | 1.4 | section leads, max 54ch |
| Body | `clamp(1rem, 0.96rem + 0.22vw, 1.125rem)` | 100%, 400 | 1.55 | running text; inputs never below 16 px |
| Data | `0.8125rem` (13 px floor) | 87%, 620, `tabular-nums slashed-zero` | 1.2–1.4 | readings, marker labels, legends |

- The Pruvo wordmark is the only heavy thing on the page; headings get emphasis from width and size.
- Sentence case everywhere. No tracked capitals, no eyebrow labels.

## 4. Components

- **Buttons** (`.btn`): 4 px radius, 600 weight, `min-height` 44 / 52 (`--lg`) / 60 (`--xl`). Primary: `blue-600` on white text, hover `blue-700`. Ghost on navy: `rgb(255 255 255 / .04)` fill, `rgb(214 226 255 / .34)` border. Ghost on paper: `ink-700` border. Press: `scale(0.97)` over 120 ms. Hover styles only under `(hover: hover) and (pointer: fine)`.
- **Glass pill nav** (the only glass): fixed, centred, 999 px radius, `color-mix(bay-900 76%)` with `blur(12px) saturate(160%)`, 1 px light border and an inset top highlight. Over paper sections it turns into paper at 80%. It falls back to opaque colour without `backdrop-filter` or under `prefers-reduced-transparency`. A sliding indicator (Motion `layoutId`) marks the section in view.
- **Phone menu:** a native `<dialog>` whose sheet grows out of the pill (`clip-path` from the pill's rectangle, 320 ms `--ease-drawer`) and carries its own copy of the pill header, so the menu button you see is always the one inside the modal.
- **Booking sheet:** Base UI Drawer, bottom sheet on phones (swipe down to dismiss) and a 460 px side panel on desktop. Three steps ("1 of 3 The car") with a bicolour progress line, radio cards, 16 px inputs with `ink-700` borders, errors in `red-700` tied to fields with `aria-describedby`.
- **Segmented control** (services): a pill track with a sliding dark thumb (`layoutId`), tab semantics and arrow keys.
- **Markers and hotspots:** a 24 px ring in `green-300` holding the check glyph, and a dark label (`rgb(6 13 34 / .84)`, 4 px radius) with the name in `fog` and the value in white tabular figures.
- **Status:** always an icon plus a word: Pass (circle check, green), Attention (triangle, amber), Fail (circle x, red). Never a pill badge, never colour alone.
- **Report sheet:** white, 1 px `line-paper` border, 4 px radius, rows divided by hairlines. A visible "Sample report. Values are illustrative." label.
- **Links:** underlined, 1 px, 3 px offset; `blue-700` on paper and `blue-300` on navy.

## 5. Layout

- Container: max 1280 px content, gutters `clamp(16px, 4vw, 40px)`, 16 px on phones.
- Section padding: `clamp(80px, 10vw, 128px)` vertically; two paper sections in a row share one gap.
- Spacing steps (px): 4, 8, 12, 16, 24, 32, 48, 64, 96, 128.
- Radii: 0 for structure, 4 px for sheets, inputs and buttons, 8 px for thumbnails, 999 px only for the nav, toggles and icon buttons.
- Rhythm: hero (bay) · why inspect (paper) · services (paper) · checkpoints (bay) · sample report (paper) · how it works (paper) · why Pruvo (bay) · FAQ (paper) · booking (bay) · footer (bay-950).
- Heights use `svh`/`dvh`; there is no `100vh`.

## 6. Depth and elevation

No drop shadows on content. Depth comes from the navy steps (950 → 900 → 800), photography and 1 px lines. Only floating UI casts a shadow: the nav pill (`0 12px 32px -16px`), the WhatsApp button and the booking sheet. Image edges melt into their section colour with `mask-image` gradients instead of borders.

## 7. Motion and interaction

| Token | Value | Use |
|---|---|---|
| `--ease-out` | `cubic-bezier(.23, 1, .32, 1)` | UI enter and exit, presses |
| `--ease-in-out` | `cubic-bezier(.77, 0, .175, 1)` | things moving on screen |
| `--ease-drawer` | `cubic-bezier(.32, .72, 0, 1)` | menu sheet, booking sheet |
| `--ease-wipe` | `cubic-bezier(.76, 0, .24, 1)` | the scan plane |
| `--ease-expo` | `cubic-bezier(.16, 1, .3, 1)` | reveals of 600 ms or more |

- **Hero intro (CSS only, before hydration):** an inline script waits for the photo and its twin to decode, then sets `data-state="intro"`. The plane sweeps the car's measured bounds in 1.2 s; the twin's `clip-path` follows; each marker locks on as the plane passes it (ring 220 ms, check draws 260 ms, integer readings count up through `@property --n`).
- **Handoff:** desktop mouse gets a 236 px lens that follows the pointer through a damped rAF loop; touch and tablets get a scan bar that sweeps once (under 5 s) and rests clear of the labels. Both are also an `<input type="range">` labelled "Inspection view".
- **Scroll (GSAP, idle-loaded):** section openers rise 14 px once; "Verify the facts." fills word by word; the checkpoints stage pins on desktop for 12 × 92 px while systems light up in order with their hotspot label, check and evidence photo; on phones each check draws as its row enters. The How-it-works connector draws, then the steps follow. The portrait is uncovered from the bottom.
- **Smooth scroll:** Lenis on fine pointers only, driven by GSAP's ticker. Touch scrolling stays native.
- **Reduced motion:** no Lenis, no pinning, a static hero split with markers shown, instant states.
- **Never:** `transition: all`, animated blur or shadows, bounce or elastic easing, idle loops, scrambled text, preloaders, scroll-jacking. Hover effects only for fine pointers.

## 8. Do's and don'ts

**Do**
- Show proof: readings, photos, a verdict, each labelled illustrative where it is.
- Keep every claim traceable to Pruvo's own words, or flagged for confirmation.
- Use blue for actions and green for verification, and nothing else.
- Give every control a visible focus ring (`blue-600` on paper, `blue-300` on navy) and a 44 px target.
- Let photography and the line drawing carry the drama.

**Don't**
- Invent statistics, prices, reviews, certifications or partner logos.
- Use fear numbers, counters, urgency tickers or "Trusted by thousands".
- Add eyebrows, pill badges, icon-card grids or emoji icons.
- Use glass anywhere but the nav, or shadows on content.
- Use a monospace font for "technical" flavour.
- Animate layout properties or anything on keyboard-triggered actions.
- Redraw, recolour or stretch the Pruvo logo or the social logos.
- Write headlines longer than two lines, or use em dashes in copy.

## 9. Responsive behaviour

| Range | Hero | Rest of the page |
|---|---|---|
| < 768 px | copy above; the phone photo slides up under the copy so the roof sits just below it; scan bar; CTAs and trust row below; "Illustrative readings" under the CTAs | single column; checkpoints as a list (no pin); report as Summary, Paint, Systems and Photos views |
| 768–1023 px | copy above an 8:5 crop of the desktop photo; scan bar | single column, wider measure |
| ≥ 1024 px | the stage fills the screen; H1 over the empty studio, CTAs bottom left, car bottom right; lens | two-column sections; pinned checkpoints; three-column report |

- Checked at 320, 360, 375, 390, 414, 768, 1024, 1280, 1440 and 1920 px with no horizontal scroll.
- Touch targets 44 px minimum with 8 px between them; inputs 16 px so iOS doesn't zoom.
- Below 360 px the hero's WhatsApp button keeps its logo and accessible name and drops the word.
- The viewport uses `viewport-fit=cover` and `interactive-widget=resizes-content`; the nav respects safe-area insets.

## 10. Agent prompt guide

**Key colours:** navy `#0C183C`, paper `#F4F7FB`, ink `#0E1838`, Pruvo blue `#3B66CC`, verified green `#548E45` / `#8FCB7A`, fog `#A9B5D6`.

**Example prompts**
1. "Add a section on paper (`#F4F7FB`) with an Archivo heading at width 112%, a lead paragraph in `ink-700`, and a list whose rows are separated by `#DCE3EE` hairlines, each with a green check glyph. No cards, no shadows."
2. "Create a navy (`#0C183C`) band with one statement in white and one primary button (`#3B66CC`, 4 px radius, 52 px tall). The only motion is a 14 px rise on first view, `cubic-bezier(.16,1,.3,1)`, 620 ms."
3. "Show a measured reading the Pruvo way: a 24 px green ring with a check, and a dark 4 px-radius label with the name in `#A9B5D6` and the value in white tabular figures, marked as illustrative."

**Iteration tips**
- If a section feels generic, show something an inspector would measure rather than adding decoration.
- Adjust emphasis with Archivo's width axis before weight.
- Check new copy against `PRODUCT.md`: Pruvo's voice is plain, unhurried and on the buyer's side.
- Re-run `npm run shots -- --full --devices`; nothing may scroll sideways at 320 px.
- Under reduced motion every new effect must end in a sensible static state.
