# UNSTAGRAM

> Instagram, but we deleted the pictures.

You post a photo. Your followers never see it — they read an AI-written
description instead. The image is never shown and never stored. A satirical,
privacy-by-accident, anti-algorithm anti-Instagram.

This is the **concept prototype**: the full app shape with mock data, so you
can click through the whole thing today. No database, no API keys, no auth yet.

## Run it

```bash
npm install
npm run dev      # http://localhost:3000
```

Other scripts: `npm run build`, `npm run start`, `npm run typecheck`.

## The joke, structurally

It copies Instagram's chrome exactly — three-column shell, stories, a Reels
tab, an engagement bar, "Suggested for you" — and then refuses to show a single
image. The more it looks like Instagram, the harder the bit lands.

```
app/
  page.tsx              Feed — stories row + chronological prose, no ranking
  scrolls/page.tsx      "Scrolls": Reels, but auto-advancing single sentences
  compose/page.tsx      Post flow: pick photo -> see prose -> post / regenerate
  u/[username]/page.tsx  Profile (no follower counts, by design)
  search/page.tsx       Search (deadpan: there are only words)
  messages/page.tsx     DMs placeholder (the one place pictures are allowed)
  notifications/page.tsx  "Nothing is demanding your attention. That's the feature."
  login/page.tsx        Login (faked — Google OAuth slot for later)
  layout.tsx            3-column Instagram shell
components/
  Sidebar.tsx           Left nav rail (Home/Search/Scrolls/Messages/etc.)
  SuggestionsRail.tsx   Right "Suggested for you" rail + footer
  StoriesRow.tsx        Gradient story rings -> ephemeral one-line prose
  ProseCard.tsx         A post (no image, ever)
  EngagementBar.tsx     IG action row, disabled-on-purpose. No likes/counts.
  Composer.tsx          Client-side compose flow
  Scrolls.tsx           The Scrolls player
  Nav.tsx               (legacy single-column nav — unused, safe to delete)
lib/
  types.ts              User / Post / Reply
  mockData.ts           Fake users, posts, stories, scrolls + read helpers
  generateProse.ts      THE PRODUCT. Canned prose today; one TODO to swap in
                        a real vision-LLM call.
tailwind.config.ts      Design tokens from Blueprint §08
```

## Design system (Blueprint §08)

- Background `#0D0D0D` · Accent `#3D8B6A` · Text `#F0F0F0` · Muted `#A0A0A0`
- Prose in Merriweather serif, 18px. UI in system sans. Dark, lots of whitespace.

## The one thing that matters next

`lib/generateProse.ts` is the entire product. It returns canned prose so
everything is clickable. Real version: send the image straight to a
vision-capable LLM with a good prose prompt — one call, image discarded
immediately, never stored. That last part is the honest privacy line (the image
*is* sent to a model; it's just never kept or shown — so the copy should say
"turned into words, then deleted," not "never leaves your device").

If that prose is consistently funny/evocative, the concept works. Tune the
prompt before building anything else.

## Deliberately NOT here (concept stage)

Real auth, database, audio, working DMs, moderation, pricing. All intentionally
deferred — see the blueprint feedback doc.

## Deploy to GitHub Pages (live for review)

Configured for static export, so GitHub Pages can host it. Live URL will be:
**https://markusclaw.github.io/unstagram/**

One-time setup (Markus):

1. Push the code to the repo's `main` branch.
2. On GitHub: **Settings → Pages → Build and deployment → Source = GitHub Actions.**
3. That's it. The included workflow (`.github/workflows/deploy.yml`) builds the
   static export and publishes it on every push to `main`.

Notes:
- The build sets `PAGES=true`, which applies `basePath: /unstagram` so all assets
  and links resolve under the Pages subpath. Local `npm run dev` stays at the root.
- Dynamic profile pages are pre-rendered at build time (`generateStaticParams`),
  since Pages has no server.
- To test the production export locally:
  `PAGES=true npm run build && npx serve out` (then open the `/unstagram/` path).
