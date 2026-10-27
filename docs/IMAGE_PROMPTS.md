# Image prompts

Every photo on the homepage has a self-contained prompt below. Each one was written to be pasted into a fresh ChatGPT image chat on its own.

- Drop the resulting PNGs into `assets-src/images/` (git-ignored), then run `npm run images` to build the web versions in `public/images/`.
- The pipeline crops each image around a focal point, so a nearby size is fine. It never upscales.
- The two x-ray "blueprint" twins of the hero are **not** prompted. `scripts/xray.mjs` derives them from the hero photos, so they align pixel for pixel.
- Copy buttons for every prompt: [`image-prompts.html`](./image-prompts.html).

**Consistency tips**
- Generate `hero-desktop` first and attach it as the reference when you generate `hero-mobile`.
- Generate `inspector-portrait` early and attach it to every later prompt that shows the inspector.

**Model constraints:** both sides divisible by 16; an aspect ratio between 1:3 and 3:1; at most the 2560×1440 pixel tier. Transparent backgrounds aren't supported, so every image ends on a seamless navy or pale edge that melts into the page.

| # | File | Used in | Displayed at | Edge colour where it meets the page |
|---|---|---|---|---|
| 1 | `hero-desktop.png` (2560×1440) | Hero ≥768 px, plus its x-ray twin | up to 1920×1080 CSS px | `#0C183C` |
| 2 | `hero-mobile.png` (1152×2048) | Hero <768 px, plus its x-ray twin | 360–430 px wide | `#0C183C` |
| 3 | `pdi-delivery-bay.png` (1536×1152) | Services: New car PDI | ~640×480; full width on phones | ≈`#E9EEF5` → page `#F4F7FB` |
| 4 | `preowned-inspection.png` (1536×1152) | Services: Pre-owned car | ~640×480; full width on phones | ≈`#E3E8EF` → page `#F4F7FB` |
| 5 | `obd-scan-closeup.png` (1536×1152) | Sample report evidence, checkpoint inset | 280–560 px | `#0C183C` |
| 6 | `paint-gauge-macro.png` (1536×1152) | Sample report evidence, checkpoint inset | 280–560 px | `#0C183C` |
| 7 | `underbody-inspection.png` (1536×1152) | Sample report evidence, checkpoint inset | 280–560 px | `#0C183C` |
| 8 | `inspector-portrait.png` (1152×1536) | Why Pruvo | ~420×560; 4:5 crop on phones | `#0C183C` |

---

#### 1. hero-desktop.png
Drop path: `assets-src/images/hero-desktop.png`. Used as the desktop and tablet hero and as the source of the desktop x-ray twin.

```
Create a photorealistic studio photograph as a PNG, exactly 2560 × 1440 pixels (16:9, landscape orientation).

Subject: a brand-new modern compact SUV in pearl white, of no recognisable make: smooth badge-free grille, no emblems anywhere, no number plates (bare bumpers), clean factory-fresh paint. It is a right-hand-drive car as sold in India: the steering wheel is visible on the right side through the windscreen.

Pose and composition: front three-quarter view. The car's nose points towards the left edge of the frame and slightly towards the camera, so we see the front and the car's right-hand side. Place the whole car, wheels, mirrors and roof included, inside the lower right part of the frame: between 44% and 94% of the width and between 38% and 88% of the height. Keep the left 40% of the frame and the top 32% completely empty, plain dark backdrop with no objects, because a large headline and text will sit there. Nothing important within 4% of any edge.

Set: a seamless infinity-cove studio painted deep navy blue (#0C183C), falling off to near-black navy (#060D22) at the edges and corners. Matte floor of the same navy with a soft, short reflection under the car. No horizon line, no props, no people.

Lighting: one large overhead softbox plus two long vertical strip lights behind and to the sides of the car, drawing clean, continuous rim highlights along the roofline, shoulder line, bonnet edge and wheel arches, so the car's whole silhouette is crisply separated from the backdrop. Very subtle cool fill from the front. Headlamps off.

Camera: full-frame camera, 70 mm lens, f/8 for front-to-back sharpness, camera height 75 cm, level horizon, no tilt, no lens distortion. Tack-sharp edges everywhere: no motion blur, no haze, no fog, no light rays, no lens flare.

Colour grade: cool and restrained, like a premium automotive brochure. Deep navy shadows, neutral-cool highlights, low saturation, gentle contrast. The paint is a true cool white, never warm or cream.

Realism: real commercial car photography, not a 3D render. Subtle reflections of the strip lights in the paint, true-to-life tyre rubber and sidewall texture, fine even panel gaps, slight sensor grain.

Do not include: any text, letters or numbers, logos, brand badges or emblems, number plates, watermarks, signatures, frames or UI elements, people, other vehicles, smoke, sparks, neon, glossy CGI look, exaggerated reflections.
```

#### 2. hero-mobile.png
Drop path: `assets-src/images/hero-mobile.png`. Used as the phone hero and as the source of the phone x-ray twin. Attach `hero-desktop.png` as the reference.

```
Create a photorealistic studio photograph as a PNG, exactly 1152 × 2048 pixels (9:16, portrait orientation). If a reference image is attached, show the exact same car, studio and lighting.

Subject: a brand-new modern compact SUV in pearl white, of no recognisable make: smooth badge-free grille, no emblems anywhere, no number plates (bare bumpers), clean factory-fresh paint. It is a right-hand-drive car as sold in India: the steering wheel is visible on the right side through the windscreen.

Pose and composition: front three-quarter view, slightly more frontal than a classic three-quarter. The car's nose points towards the lower left of the frame. Place the whole car, wheels, mirrors and roof included, in the lower part of the frame: between 6% and 94% of the width and between 56% and 88% of the height. Keep the top 54% of the frame completely empty, plain dark backdrop, because a headline and buttons will sit there. The bottom 10% is plain dark floor.

Set: a seamless infinity-cove studio painted deep navy blue (#0C183C), falling off to near-black navy (#060D22) at the top and the corners. Matte navy floor with a soft, short reflection under the car. No horizon line, no props, no people.

Lighting: one large overhead softbox plus two long strip lights behind and to the sides of the car, drawing clean, continuous rim highlights along the roofline, shoulder line, bonnet edge and wheel arches, so the whole silhouette is crisply separated from the backdrop. Very subtle cool fill from the front. Headlamps off.

Camera: full-frame camera, 50 mm lens, f/8, camera height 70 cm, level horizon, no tilt, no distortion. Tack-sharp edges: no motion blur, no haze, no lens flare.

Colour grade: cool and restrained, premium automotive brochure. Deep navy shadows, neutral-cool highlights, low saturation, gentle contrast, a true cool-white paint (never warm or cream).

Realism: real commercial car photography, not a 3D render: subtle strip-light reflections, true tyre rubber texture, fine panel gaps, slight sensor grain.

Do not include: any text, letters or numbers, logos, brand badges or emblems, number plates, watermarks, frames or UI elements, people, other vehicles, smoke, neon, glossy CGI look.
```

#### 3. pdi-delivery-bay.png
Drop path: `assets-src/images/pdi-delivery-bay.png`. Used in Services, on the New car PDI tab. Attach the inspector portrait if you have it.

```
Create a photorealistic documentary-style photograph as a PNG, exactly 1536 × 1152 pixels (4:3, landscape orientation).

Scene: the delivery bay of a modern car dealership in an Indian city, mid-morning. Clean light-grey epoxy floor, white walls, large glass windows letting in soft daylight, flat LED ceiling panels. A brand-new compact sedan in deep metallic blue of no recognisable make (badge-free grille and boot lid, no emblems, no number plates) waits for delivery, with clear protective film still on the door sills and a paper floor mat inside. It is right-hand drive: the steering wheel is on the right.

Action: a vehicle inspector crouches beside the car's front-right wheel arch and holds a small handheld paint-thickness gauge flat against the front fender, studying it closely; the gauge's screen faces away from the camera. Two steps behind him, the buyer, a South Asian woman in her early thirties in smart-casual clothes, watches with interest, holding her phone.

The inspector (keep exactly this description): a South Asian man in his early thirties, medium athletic build, short neatly trimmed black beard and short black hair, wearing a plain navy-blue polo shirt with no logo or text, dark charcoal trousers and black nitrile gloves. Calm, focused expression. If a reference portrait is attached, it is the same man.

Composition: the inspector and the front of the car fill the left two-thirds; the buyer is slightly out of focus in the right third. Keep the top 20% calm (wall and window). Keep everything important inside the central 80% so the image can be cropped to 16:10 or 1:1.

Camera: full-frame, 35 mm lens, f/2.8, camera height 1.1 m, slight three-quarter angle, natural perspective.

Light and colour: soft natural daylight with cool LED fill. Cool, clean, low-saturation grade: shadows lean deep navy (#0C183C), whites stay cool (#F4F7FB), skin tones natural. The image edges are a light cool grey (close to #E9EEF5) so the photo can fade into a pale page background.

Realism: candid, unposed documentary feel; real reflections in the paint; natural skin texture; accurate hands with five fingers each; gloves that fit naturally; slight film grain.

Do not include: any readable text, letters or numbers, logos, brand badges or emblems, number plates, signage, watermarks, UI overlays, balloons, ribbons or bows on the car, exaggerated smiles, plastic-looking skin, AI gloss.
```

#### 4. preowned-inspection.png
Drop path: `assets-src/images/preowned-inspection.png`. Used in Services, on the Pre-owned car tab. Attach the inspector portrait.

```
Create a photorealistic documentary-style photograph as a PNG, exactly 1536 × 1152 pixels (4:3, landscape orientation).

Scene: the open-air parking area of a residential housing society in an Indian city, late afternoon, in soft shade. Painted parking bays, concrete pillars of the apartment building, a few parked cars softly blurred in the background, potted plants along a wall. In front: a six-year-old silver hatchback of no recognisable make (no badges or emblems, no number plates), clean but with normal signs of use. It is right-hand drive: the steering wheel is on the right. The bonnet is open.

Action: a vehicle inspector leans over the engine bay, shining a small LED torch at the engine and checking for leaks; a tablet with a dark screen rests on a protective fender cover beside him. A few metres back, the seller, a South Asian man in his late forties in a casual shirt, stands with his arms folded, watching.

The inspector (keep exactly this description): a South Asian man in his early thirties, medium athletic build, short neatly trimmed black beard and short black hair, wearing a plain navy-blue polo shirt with no logo or text, dark charcoal trousers and black nitrile gloves. Calm, focused expression. If a reference portrait is attached, it is the same man.

Composition: the front of the car and the inspector on the left and centre; the seller out of focus on the right. Keep the main action inside the central 80% so the image can be cropped to 16:10 or 1:1.

Camera: full-frame, 35 mm lens, f/2.8, camera height 1.2 m, three-quarter front angle.

Light and colour: soft, even shade light; the torch adds a small cool-white highlight. Cool, clean, low-saturation grade: shadows lean deep navy (#0C183C), whites cool, skin natural. The image edges are neutral light-grey concrete (close to #E3E8EF) so the photo can fade into a pale page background.

Realism: candid documentary photo, real dust and minor wear on the car, natural skin texture, accurate hands with five fingers, slight film grain.

Do not include: any readable text, letters or numbers, logos, brand badges or emblems, number plates, signs, watermarks, UI overlays, dramatic lighting, plastic-looking skin, AI gloss.
```

#### 5. obd-scan-closeup.png
Drop path: `assets-src/images/obd-scan-closeup.png`. Used as sample-report evidence and as the checkpoint inset for OBD.

```
Create a photorealistic close-up photograph as a PNG, exactly 1536 × 1152 pixels (4:3, landscape orientation).

Subject: inside the driver's footwell of a right-hand-drive car, with the steering column on the right. A hand in a black nitrile glove plugs a compact OBD-II diagnostic connector into the car's OBD port under the dashboard, near the steering column. The connector's thick cable curves out of the frame. In the soft-focus background, the edge of a tablet shows abstract coloured line graphs with no readable text.

Composition: the connector and port slightly right of centre and sharp; everything else falls off softly. Keep the main subject inside the central 70% so the image can be cropped to 1:1.

Camera: full-frame, 100 mm macro lens, f/4, low angle from the footwell, shallow depth of field.

Light and colour: a small cool LED work light from the upper left; deep shadows that fall to dark navy (#0C183C). Cool, clean, low-saturation grade. The image edges are dark navy (close to #0C183C) so the photo can fade into a dark page background.

Realism: real plastic dashboard textures, fine dust, natural glove wrinkles, a correct hand with five fingers, slight sensor grain.

Do not include: any readable text, letters, numbers or codes, logos, brand badges, watermarks, UI overlays, glowing sci-fi effects, AI gloss.
```

#### 6. paint-gauge-macro.png
Drop path: `assets-src/images/paint-gauge-macro.png`. Used as sample-report evidence and as the checkpoint inset for body and paint.

```
Create a photorealistic macro photograph as a PNG, exactly 1536 × 1152 pixels (4:3, landscape orientation).

Subject: the probe of a handheld digital paint-thickness gauge pressed flat against the metallic dark-blue door panel of a car, right next to the door's edge, so the thin panel gap between the door and the fender is visible. Fingers in black nitrile gloves hold the gauge. The gauge's screen is turned away and out of focus, so no digits are visible.

Composition: the probe tip slightly left of centre and sharp; the panel gap runs diagonally; long, smooth reflections of an overhead light strip run across the paint. Keep the main subject inside the central 70% so the image can be cropped to 1:1.

Camera: full-frame, 100 mm macro lens, f/5.6, close focus, slight angle along the panel.

Light and colour: one long overhead strip light reflecting in the paint; deep shadows falling to dark navy (#0C183C). Cool, clean, low-saturation grade with the fine metallic flake visible in the paint. The image edges are dark navy (close to #0C183C).

Realism: real paint texture with faint micro swirl marks and tiny dust specks, a correct hand with five fingers, slight sensor grain.

Do not include: any readable text, letters or numbers, logos, brand badges, watermarks, UI overlays, CGI look, AI gloss.
```

#### 7. underbody-inspection.png
Drop path: `assets-src/images/underbody-inspection.png`. Used as sample-report evidence and as the checkpoint inset for underbody. Attach the inspector portrait.

```
Create a photorealistic documentary-style photograph as a PNG, exactly 1536 × 1152 pixels (4:3, landscape orientation).

Subject: the underside of a family sedan parked in a dimly lit residential basement car park in an Indian city. A vehicle inspector lies on a low mechanic's creeper beside the car, his head and shoulders under the side sill, shining a small LED torch up at the underbody: the front suspension arm, the exhaust pipe with its hangers and the chassis rail. The torch beam lights them clearly; there is light surface rust on the exhaust hangers and a little road dust.

The inspector (keep exactly this description): a South Asian man in his early thirties, medium athletic build, short neatly trimmed black beard and short black hair, wearing a plain navy-blue polo shirt with no logo or text, dark charcoal trousers and black nitrile gloves. If a reference portrait is attached, it is the same man.

Composition: the camera is almost at floor level, looking along the underside of the car; the lit underbody parts are centre-right; the inspector's face and torch are on the left, in profile. Keep the main subject inside the central 75%.

Camera: full-frame, 24 mm lens, f/4, camera height 15 cm, level.

Light and colour: the torch is the key light (cool white) with dim ambient basement light; shadows fall to dark navy (#0C183C). Cool, low-saturation grade. The image edges are dark navy (close to #0C183C) so the photo can fade into a dark page background.

Realism: real grime and metal textures, believable proportions of a car's underbody, a correct hand with five fingers, slight grain.

Do not include: any readable text, letters or numbers, logos, brand badges, number plates, watermarks, UI overlays, sparks, smoke, dramatic sci-fi lighting, AI gloss.
```

#### 8. inspector-portrait.png
Drop path: `assets-src/images/inspector-portrait.png`. Used in Why Pruvo. Generate this one early.

```
Create a photorealistic environmental portrait as a PNG, exactly 1152 × 1536 pixels (3:4, portrait orientation).

Subject (keep exactly this description): a South Asian man in his early thirties, medium athletic build, short neatly trimmed black beard and short black hair, wearing a plain navy-blue polo shirt with no logo or text, dark charcoal trousers and black nitrile gloves. He holds a tablet with its dark screen turned towards himself, so the screen is not visible. Waist-up framing, body turned three-quarters, face towards the camera, calm and confident expression with a slight natural smile. He looks like an experienced automotive engineer.

Background: a dark navy studio (#0C183C); behind him and out of focus, the bonnet edge and headlamp of a white car catching a thin rim light.

Composition: the subject slightly right of centre, eyes about 35% from the top, generous headroom. Keep the face and hands inside the central 70% so the image can be cropped to 4:5 or 1:1.

Camera: full-frame, 85 mm lens, f/2.2, eye level, natural perspective.

Light and colour: a large soft key light from the left and a gentle rim light from the right separating him from the background. Cool, clean, low-saturation grade with natural skin tones; shadows fall to deep navy (#0C183C); the image edges are dark navy so the photo can fade into a dark page background.

Realism: real skin texture with pores, natural beard detail, the fabric texture of the polo, correct hands with five fingers each, slight film grain. A real photograph, not a render.

Do not include: any text, letters or numbers, logos or badges on clothing, watermarks, UI overlays, exaggerated smile, plastic or airbrushed skin, AI gloss.
```
