# UNSTAGRAM

> Instagram, but we deleted the pictures.

You post a photo. Your followers never see it — they read AI-written prose instead.
The image is never shown and never stored. A satirical, privacy-by-accident, anti-algorithm anti-Instagram.

**Phase 2 (current):** real accounts (invite-only), posts saved in a database, and real AI prose
from your photos. Runs on Cloudflare Workers + Supabase.
➡️ **Setup is in [`SETUP_PHASE2.md`](./SETUP_PHASE2.md).**

## Stack

- **Next.js 15** (App Router) on **Cloudflare Workers** via the **OpenNext** adapter
- **Supabase** — Postgres + email/password auth
- **Anthropic Claude** (vision) writes the prose; key stays server-side
- **Tailwind** dark/serif design system (Blueprint §08)

## Run locally

```bash
cp .env.example .env.local     # add your Supabase + Anthropic values
npm install
npm run dev                    # http://localhost:3000
```

`npm run preview` runs it in the real Workers runtime. `npm run deploy` builds + deploys to Cloudflare.

## Map

```
app/
  page.tsx               Feed (chronological, from Supabase)
  u/[username]/page.tsx  Profile
  compose/page.tsx       Pick photo → real AI prose → post
  scrolls/page.tsx       "Scrolls": Reels, but auto-advancing sentences
  login • signup         Invite-only email/password auth
  api/describe/route.ts  THE PRODUCT — image → Claude → prose, image discarded
  auth/actions.ts        signIn / signUp / signOut
  post/actions.ts        createPost / addReply
components/              Sidebar, SuggestionsRail, ProseCard, Composer, StoriesRow, Scrolls, EngagementBar
lib/
  supabase/              browser + server clients, session middleware
  db.ts                  feed / profile / posts queries
  format.ts              timeAgo
supabase/schema.sql      tables + RLS + signup trigger + invite-code functions
wrangler.jsonc           Cloudflare Worker config
open-next.config.ts      OpenNext adapter config
```

## Design system (Blueprint §08)

Background `#0D0D0D` · Accent `#3D8B6A` · Text `#F0F0F0` · Muted `#A0A0A0`.
Prose in Merriweather serif, 18px. Dark, lots of whitespace.

## The one thing that matters

`app/api/describe/route.ts` holds the prose `PROMPT`. That single prompt is the product —
if the prose is consistently funny/evocative, the concept works. Tune it there.
