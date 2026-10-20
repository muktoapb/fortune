# Fortune Tower — fortunetower.info

Cinematic 3D homepage for Fortune Tower (Phase 1). Next.js 16 · React Three Fiber · GSAP · Lenis · Tailwind 4.

## Run locally
```bash
npm install
npm run dev        # http://localhost:3000
npm run build && npm start   # production check
```

## Update project facts
- Numbers (shares sold, prices, phone, WhatsApp, email): `lib/site.ts`
- All text, English + বাংলা: `lib/i18n.ts`
- Images: `public/assets/images/` (AI renders go here), posters in `public/assets/posters/`, gallery list in `lib/site.ts`

## Deploy on Dokploy
1. Push this folder to a Git repo (GitHub/GitLab).
2. Dokploy → Create Application → connect the repo, branch `main`.
3. Build type: **Dockerfile** (path `./Dockerfile`).
4. Port: **3000**.
5. Domains → add `fortunetower.info` (and `www.fortunetower.info`), container port 3000, enable HTTPS (Let's Encrypt).
6. At your domain registrar, point an `A` record for `@` and `www` to the Dokploy server IP.
7. Deploy. Every push to `main` can auto-redeploy (enable the webhook in Dokploy).

No environment variables are needed for Phase 1. The enquiry form opens WhatsApp with a prefilled message, so there is no mail server to configure.

## Structure
```
app/                  layout (fonts, SEO, schema), page, robots, sitemap
components/three/     TowerModel (procedural building), StoryScene (scroll story), ShareScene (36-share grid)
components/sections/  Experience (hero + story), Shares, Home, Price, Location, Trust, Gallery, Faq, Contact
lib/                  site.ts (facts), i18n.ts (copy), scroll.ts (shared scroll state)
```
