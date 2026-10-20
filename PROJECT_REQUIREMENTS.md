# Fortune Tower — Website Requirements

> Domain: **fortunetower.info**
> Source facts: `requirement.md` + posters/banner in this folder.
> Status: **Phase 1 — Homepage built** (backend & app come later)

---

## 1. Goal

A cinematic, 3D, interactive website for **Fortune Tower 1** (the first Fortune Tower project) that:

1. **Builds trust** — real site photos, land-owner list, deed details, approval progress, transparent pricing.
2. **Creates urgency** — 30 of 36 land shares sold, only 6 left.
3. **Converts** — every section leads to "Book your share" (call / WhatsApp / enquiry form).
4. **Scales later** — flat sales, multiple projects, admin → agent/partner → customer portal.

Audience: middle-income Bangladeshi families and expat (NRB) investors, mostly on mobile, many Bangla-first.

---

## 2. Project Facts (single source of truth for the site)

| Item | Value |
|---|---|
| Project | Fortune Tower 1 — modern G+9 residential |
| Location | Kakab (বড় কাকর মৌজা), Birulia, Savar, Dhaka — adjoining Priyanka City & Ashulia Model Town, 4 plots past Markazul Sunnah Central Madrasa |
| Land | 12.06 decimal (শতাংশ), corner plot |
| Roads | 20 ft paved govt. road in front; 10 ft roads on west & north |
| Units | 36 total, 4 per floor, 9 residential floors |
| Flat size | **1,313 sq ft (including parking)** |
| Layout | 3 bed · 3 bath · 3 balcony · formal living · drawing & dining · kitchen |
| Land share price | BDT 6,00,000 + BDT 20,000 registration = **BDT 6,20,000** |
| Payment terms | **BDT 1,00,000 booking** → **BDT 5,00,000 + BDT 20,000 registration fee** before registration |
| Est. construction | BDT 23–24 lakh → full flat ≈ **BDT 29–30 lakh** |
| Handover target | 2030, Insha'Allah |
| Land share | Each share = **0.335 decimal** undivided land (12.06 ÷ 36). Not tied to a specific flat — flats are not allocated yet |
| Shares sold | **30 / 36** (6 available) |
| Current status | Soil test done; drawings & plan going for approval |
| Phone | 01722-395490 |
| Email | contact@fortunetower.info |
| WhatsApp | +8801722395490 (same as phone) |
| Brand | No company — the brand is **Fortune Tower** itself |
| Land owners (বায়না সূত্রে) | মোঃ জাহাঙ্গীর আলম, মোঃ আব্দুল্লাহ আল মামুন বকুল, মোঃ সুজন মিয়া, মোহাম্মদ সাইফুল ইসলাম রাকিব, মোঃ আবুল কালাম আজাদ, মহিদুল ইসলাম |
| Deed refs | খতিয়ান: সি এস-৫০ক, এস এ-৭৩, আর এস-২৮৪, নামজারি খতিয়ান ২২৬৫ ও ৫৯৯৪ · দাগ: সি এস ও এস এ-২২৪, আর এস-২২৬ |

**Travel times:** Inner Circular Ring Road (300 ft, 8-lane) 5 min · Birulia Bridge 5 min · Uttara Sector 18 — 8 min · Navy School/Navy DOHS/Outer Ring Road 10 min · Uttara Metro Center 11 min · Mirpur DOHS 15 · Mirpur 12 — 16 · Mirpur 11 — 18 · Airport 18 · ECB Chattar 20 · Azampur 20 · Abdullahpur 22.

**Nearby universities (visible from plot):** BRAC, City, Manarat, Eastern, Ahsanullah Mission, Daffodil.

### Copy & compliance rules
- Do **not** say "100% guaranteed". Use "Secure & transparent investment", backed by shown proof (deed refs, owners, approval timeline).
- Do **not** show any land registration date.
- All dates and numbers live in one data file so they can be updated without touching design.
- Bilingual: **English + বাংলা** toggle (Bangla is not optional for this audience).

---

## 3. Design Direction — "Navy & Brass" (dark)

Deep navy-black pages, light type, brass buttons and accents. The 3D story runs from a warm sunset (side-lit tower) to night with the windows lit.

### Color tokens
| Token | Hex | Use |
|---|---|---|
| `paper` | `#0a0f1a` | Page background |
| `cream` | `#121a2a` | Cards / surfaces |
| `sand` | `#19233a` | Secondary surfaces |
| `ink` | `#eef1f6` | Main text |
| `mist` | `#93a0b4` | Secondary text |
| `brass` / `brass-bright` / `brass-soft` | `#d4b27a` / `#c9a35c` / `#e8d3a6` | Buttons, accents, italic headline |
| `ember` | `#ec6a43` | Urgency only ("6 left") |
| `available` | `#34d399` | Available shares |
| `sold` | `#4b5a73` | Sold shares |

### Typography
| Role | Font | Notes |
|---|---|---|
| Display / headlines / numbers | **Sora** | Modern, geometric, architectural |
| Body / UI | **Plus Jakarta Sans** | Clean, readable |
| Bangla | **Anek Bangla** (headlines) + **Hind Siliguri** (body) | Proper Bangla rendering |

Scale: hero 96–160px desktop / 48–64px mobile; tight tracking on display, generous line-height on body.

### Motion principles
- Smooth inertia scroll (Lenis); scroll-driven scenes (GSAP ScrollTrigger).
- Cinematic camera moves, not bouncy UI. Ease: `expo.out` / `power3.inOut`.
- Grain overlay + subtle vignette for film feel.
- `prefers-reduced-motion` → static images, no camera flights.
- Must stay smooth on mid-range Android: 3D quality tiers, lazy-loaded, ≤ 3 MB initial load.

---

## 4. Homepage — Sections (Phase 1 scope)

### 0. Preloader
Gold line draws the tower outline floor by floor (0 → 9), counter 0–100%, then fades into the hero.

### 1. Hero — "Rise with Fortune"
- Full-screen **interactive 3D tower** (procedural Three.js model matching the render: G+9, 4 units/floor, glass balconies, gold-lit lobby) on a sunset sky.
- Slow auto-orbit; mouse/gyro parallax; drag to rotate.
- Headline: *"Own the land beneath your future home."* + sub: G+9 · 36 homes · Birulia, Dhaka.
- Live badge: **"30 / 36 shares sold — only 6 left"** (ember pulse).
- CTAs: **Book a Share** (primary gold) · Watch the Story (secondary).

### 2. Scroll Story — "From soil to skyline" (pinned, scroll-driven)
Camera flies around the tower while chapters swap:
1. The Land — 12.06 decimal corner plot, three roads (roads draw on the ground in gold).
2. The Foundation — soil test complete ✓.
3. The Approval — drawings submitted (in progress).
4. The Rise — floors build up as you scroll.
5. The Home — 2030 handover, lobby lights turn on.

### 3. Land Share Grid (urgency centerpiece)
Shares are undivided land, not specific flats, so the visual is the **land**, not the tower's units.
- 3D plot (12.06 decimal) split into **36 glowing tiles**, each 0.335 decimal. On scroll-in, 30 tiles "lock" one after another (ember, dim) and **6 remain glowing green**.
- Hover/tap a tile → "1 land share · 0.335 decimal · BDT 6,20,000". No floor/unit numbers.
- Above the plot, the tower rises as a translucent ghost: "Each share becomes one flat when construction completes."
- Big counter: animated `30 sold · 6 left` with progress ring. CTA: "Book 1 of the last 6".
- Sold count comes from one data file (later the backend). Tiles are not mapped to buyers.

### 4. The Home — Flat layout
- Interactive floor plan (2D SVG with hover-to-highlight rooms; 3D dollhouse later if a model is supplied).
- Spec chips: 3 bed · 3 bath · 3 balcony · living · drawing-dining · kitchen · 1,313 sq ft (incl. parking).
- Interior image carousel (AI renders — see §6).

### 5. Price Breakdown — "Know exactly what you pay"
Animated stacked bar / calculator:
Land share 6,00,000 + Registration 20,000 = **6,20,000** → + Construction 23–24 lakh → **Full flat ≈ 29–30 lakh**.
Payment steps (timeline cards): ① Book with **1,00,000** → ② Pay **5,00,000 + 20,000 registration fee** before registration → ③ Construction cost during build.
Comparison line: typical Uttara flat price vs Fortune Tower (needs a sourced number — optional).

### 6. Location — "Minutes from everything"
- Illustrated dark map (SVG, schematic, not to scale): fields around the plot, Turag river, 300-ft Ring Road (under construction), Airport Road, metro line, Uttara and Mirpur blocks, airport runway, pulsing Fortune Tower pin.
- Hover a destination (list or marker) → a gold route draws along the roads with a moving dot and "name · minutes" label. Click → map zooms to that route; "All destinations" zooms back out.
- "Open exact location in Google Maps" → https://maps.app.goo.gl/soU6nXJkmAA8v6cg6
- University chips ("6 universities in sight").

### 7. Trust — Project journey tracker
- Left (sticky on desktop): title, "2/6 milestones complete" with a 6-segment progress bar, "Updated <month>", and a "Documents available on request" panel (land deed & khatian, namjari records, soil test report, architectural drawings) with an "Ask to see the documents" WhatsApp button.
- Right: vertical timeline of 6 phases with descriptions. A brass line fills as you scroll and stops at the current phase, which glows with a "We are here" tag; upcoming phases are dimmed with dashed nodes.
- To update: change `s` (done / now / next) in `trust.steps` and `trust.journey.updated` in `lib/i18n.ts`.

### 9. FAQ
What is a land share (0.335 decimal undivided land, becomes one flat on completion)? · How does payment work (1 lakh booking, 5 lakh + registration fee before registration)? · What if the project is delayed? · Can NRBs buy? · Registration process.

### 10. Final CTA + Contact
Full-bleed sunset tower: "6 homes left in Fortune Tower." Call 01722-395490 · WhatsApp +8801722395490 (same as phone) · contact@fortunetower.info · enquiry form (name, phone, preferred time). Floating WhatsApp button site-wide.

### Header
Logo · EN/বাং toggle · **Login** button (→ `/login`) · **Book a Share**. No section menu.
`/login` is a placeholder ("portal coming soon" + WhatsApp/call) until the Phase 2 portal exists.

### Footer
Brass skyline edge; brand + "6 left · Book a Share"; Contact (call, WhatsApp, email, Facebook https://www.facebook.com/fortunetowerbd); Visit (address + Google Maps link); © + Back to top; giant fading "FORTUNE TOWER" wordmark.

---

## 5. Tech Stack

| Layer | Choice | Why |
|---|---|---|
| Framework | **Next.js 16 (App Router) + TypeScript** | SEO, i18n routing, API routes for later backend |
| Styling | Tailwind CSS with the tokens above | Fast, consistent |
| 3D | **React Three Fiber + drei** (Three.js) | Procedural tower, land share grid, shaders |
| Motion | **GSAP + ScrollTrigger**, **Lenis** smooth scroll | Cinematic scroll scenes |
| i18n | Small built-in language context (en / bn), remembered per visitor | Bangla toggle, no extra library |
| Forms | Enquiry form opens WhatsApp with a prefilled message; DB later | Lead capture from day 1, no mail server |
| Hosting | **Dokploy** (Docker, `Dockerfile` in repo) on fortunetower.info | See README.md |
| Analytics | GA4 / Meta Pixel (for FB ads traffic) | Track bookings |

**3D model approach:** No 3D file exists, so the tower is built **procedurally** in code (boxes, glass, balconies, emissive lobby) to match `building.jpeg`. If an architect `.glb`/`.fbx`/SketchUp model becomes available, swap it in.

---

## 6. Later Phases (not in Phase 1 — recorded so architecture fits)

**Phase 2 — Backend & roles**
- **Super Admin:** manage projects, units/shares, prices, statuses; invite agents/partners.
- **Agent / Partner:** invited by admin; adds and manages their customers; sees commissions & their sales.
- **Customer:** login; sees their share/unit, payment schedule & receipts, registration and guarantee/agreement documents, construction progress updates.
- Unit status on homepage driven by this database.
- Suggested: Postgres (Supabase) + auth with role-based access + file storage for documents.

**Phase 3** — Flats for sale listing, multiple projects (Fortune Tower 2…), construction progress feed.
**Phase 4** — Mobile app.

---

## 7. Image Prompts (generate in ChatGPT / Midjourney / etc.)

Save into `public/assets/images/` with the given filenames. Keep the building consistent with `building.jpeg` (white/cream facade, dark vertical fins, glass balconies, gold-lit double-height lobby, palm trees). Attach `building.jpeg` as reference when the tool allows.

1. **`hero-sunset-wide.jpg`** (21:9, 3840×1646)
   > Cinematic wide-angle architectural photograph of a modern 10-storey residential tower (G+9) with cream-white facade, dark vertical accent fins, glass balcony railings, and a glowing golden double-height glass lobby, standing on a corner plot beside a paved road in a developing suburb of Dhaka, Bangladesh. Golden hour, dramatic orange and violet sky, warm rim light on the facade, interior lights starting to glow, palm trees at the entrance, light haze, shot on 24mm lens, low angle, photorealistic, ultra-detailed, film grain, no text.

2. **`night-tower.jpg`** (16:9)
   > Same modern G+9 residential tower at blue hour/night, every balcony warmly lit, golden lobby glowing, wet road reflecting lights, a few cars with light trails, deep navy sky with soft stars, cinematic, photorealistic, moody, no text.

3. **`aerial-plot.jpg`** (16:9)
   > Drone aerial view at sunset of a modern 10-storey residential tower on a corner plot with a 20-foot road in front and narrower roads on two sides, surrounded by a growing planned residential area with greenery and a river in the distance, north of Dhaka, Bangladesh. Realistic, warm light, long shadows, no text.

4. **`interior-living.jpg`** (16:9)
   > Interior of a modern Bangladeshi apartment formal living room, 1,313 sq ft flat, warm neutral tones, wooden accents, large sliding glass door to a balcony with a sunset view, soft golden evening light, elegant but attainable, photorealistic architectural visualisation, no text.

5. **`interior-dining.jpg`** (16:9)
   > Open drawing and dining area in a modern Dhaka apartment, 6-seat wooden dining table, pendant lights, beige walls with subtle wood panelling, evening warm lighting, photorealistic, no text.

6. **`interior-bedroom.jpg`** (16:9)
   > Master bedroom in a modern Bangladeshi apartment with attached balcony, calm ivory and warm wood palette, morning light through sheer curtains, photorealistic interior render, no text.

7. **`interior-kitchen.jpg`** (16:9)
   > Modern compact kitchen in a Dhaka apartment, matte cream cabinets, dark stone countertop, warm under-cabinet lighting, window, photorealistic, no text.

8. **`balcony-view.jpg`** (4:5)
   > View from a high-floor glass-railed balcony of a modern apartment looking over a green suburb with universities and a ring road in the distance, north Dhaka, golden hour, a cup of tea on a small table, cinematic, photorealistic, no text.

9. **`lobby-entrance.jpg`** (4:5)
   > Close-up of a luxurious double-height residential lobby entrance with gold-framed glass doors, warm interior glow, marble steps, potted plants and palm trees, dusk, photorealistic, no text.

10. **`family-lifestyle.jpg`** (16:9)
    > Happy Bangladeshi family (parents and two children) standing on the balcony of their new modern apartment at sunset, looking at the view, warm natural light, candid, photorealistic, respectful modest clothing, no text.

11. **`floor-plan-typical.png`** — *Ideally the real architect plan.* If unavailable:
    > Clean top-down architectural floor plan of one floor with 4 apartments around a central lift and stair core, each apartment 3 bedrooms, 3 bathrooms, 3 balconies, living, drawing-dining and kitchen, minimal white lines on a transparent/dark background, labelled rooms, no furniture clutter.

12. **`texture-grain.png`** — subtle film grain overlay (can be generated in code instead).

Also needed (real, not AI): a Fortune Tower logo/wordmark (I can design a typographic one in code), current site photos (wide + drone if possible), any approval/soil-test document photos (can be blurred), team/owner photos (optional).

---

## 8. Open Questions

**Resolved:** flat size 1,313 sq ft incl. parking · no registration date shown · no company (brand = Fortune Tower) · WhatsApp +8801722395490 (same as phone) · payment 1 lakh booking, then 5 lakh + 20k registration fee before registration.

Also resolved: a share is not tied to a flat (flats not built/allocated yet) · 30 shares sold, none mapped to units · each share = 0.335 decimal · email contact@fortunetower.info.

**Still open:** none blocking Phase 1.

---

## 9. Phase 1 Deliverable & Acceptance

- Responsive homepage (mobile-first, 360px → 4K) with sections §4.0–§4.10.
- Procedural interactive 3D tower in hero + 36-tile land share grid.
- English/Bangla toggle; all facts from a single data file.
- Lighthouse: Performance ≥ 80 mobile, Accessibility ≥ 90; reduced-motion fallback.
- Working enquiry form + call/WhatsApp CTAs.
- SEO: title, meta, Open Graph image, local business schema for fortunetower.info.
