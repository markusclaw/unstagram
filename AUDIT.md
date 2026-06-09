# UNSTAGRAM — MVP Audit

_A health check of the app as it stands: a working, deployed, text-only social network (accounts, AI prose, social graph, stories, activity, search, moderation, mobile, multilingual, bot API)._

## Verdict

This is a genuinely solid MVP — more complete than most "v1"s. Nothing here is on fire. The items below are the difference between "works for friends" and "ready for strangers at scale." Prioritized P0 (do before wider launch) → P2 (nice later).

---

## P0 — do before a wider/public launch

1. **Rate-limit the AI route (`/api/describe`).** This is the only endpoint that costs money per call, and it has *no* limit. A logged-in user (or a leaked session) could loop it and burn your Gemini quota/bill. Fix: reuse the `bump_rate` RPC, e.g. 20 describes/min per user. _(Low effort.)_

2. **Add a Privacy Policy + Terms page.** You collect emails, store content, and (soon) run analytics. The footer links "Privacy/Terms" go nowhere. For a real product this is table stakes (and required by app stores / some regions). _(Low effort — static pages.)_

3. **Decide the content visibility model (blocks SEO/GEO).** Right now `posts`, `comments`, `follows` are readable only by **authenticated** users, and `/p/[id]` + `/u/[username]` are behind the login gate. That means **search engines and AI assistants cannot see any of your content** — only `/about`, `/developers`, `/login`, `/signup` are crawlable. To get real SEO/GEO you must expose post + profile pages publicly (read-only). This is a product decision (privacy posture) — see SEO/GEO section.

## P1 — soon

4. **Deduplicate per-request DB calls.** `getCurrentProfile` / `getUnreadActivityCount` are each called by Sidebar, SuggestionsRail, MobileBar, and MobileTopBar — so every page load fires the same `auth.getUser` + profile + ~5 count queries several times over. Wrap those reads in React's `cache()` so they run once per request. Easy, meaningful latency + DB-load win.

5. **Analytics / measurement.** No usage tracking yet. Add privacy-respecting analytics (traffic) + a couple of product metrics (signups, posts, DAU). See Analytics section.

6. **Expired stories accumulate.** Stories are filtered by `expires_at` at read time, but old rows never get deleted. Add a periodic cleanup (cron / scheduled SQL) so the table doesn't grow forever.

7. **Email confirmation is off.** We disabled it for frictionless signup, which means unverified/fake emails can register. Fine for a beta; revisit before scaling (or add later).

## P2 — later / polish

8. **Moderation has no admin view.** Reports land in a table you read manually in Supabase. Fine now; a tiny admin page would help as volume grows.
9. **Sitemap is thin.** Lists only about/login/signup (missing `/developers`, and any public posts/profiles once those exist).
10. **Search hardening.** The `ilike` search strips `% , ( ) *`; fine, but worth a glance if you localize search heavily.
11. **No automated tests.** Acceptable for an MVP; a few smoke tests on the API + auth would pay off as more people touch the code.
12. **`reports`/`reposts`/legacy components** (`EngagementBar.tsx`, `Nav.tsx`, `lib/mockData.ts`, `lib/types.ts`) are unused — safe to delete for tidiness.

---

## What's already good (don't touch)

- **RLS is sound** — every table has row-level security; users only write their own rows; the `invite_codes`/`reports`/`api_rate` tables are locked to RPC/service-role only.
- **Secrets are handled correctly** — AI + service-role keys are server-only; the public Supabase anon key is the only thing in the client (as intended).
- **The privacy promise is true** — images are described then discarded; nothing is uploaded or stored. The client now even strips EXIF by re-encoding. Marketing matches reality.
- **Bot API** is token-hashed, rate-limited, and fails safe.
- **Mobile, i18n, RTL, multi-image, activity feed** are all real and working.

---

## SEO / GEO plan

**The core blocker:** content is login-gated, so crawlers/AI see almost nothing. To fix, make **post pages (`/p/[id]`) and profiles (`/u/[username]`) publicly readable** (the descriptions are meant to be shared — there are no private images to leak). That requires:

- Add **public (anon) RLS read policies** for `posts`, `comments`, `profiles` (profiles already public), `likes` counts.
- Let those routes through the **middleware** for logged-out visitors (read-only).
- Per-post **metadata + Open Graph + JSON-LD** (`SocialMediaPosting`/`Article`) on `/p/[id]`, and `ProfilePage`/`Person` JSON-LD on `/u/[username]`.
- **Dynamic OG images** (text card) so shared links look good.
- **Sitemap** that includes recent public posts + profiles, plus `/developers`.
- A `WebSite` + `SearchAction` JSON-LD on the homepage/about.

This is the single biggest lever for both SEO (Google) and GEO (AI assistants citing your prose). It is a privacy-posture decision — confirm before flipping it on.

## Analytics plan

Two layers, both privacy-respecting (on-brand):

1. **Traffic** — **Cloudflare Web Analytics** (free, cookieless, you're already on Cloudflare) or Plausible. One script tag; no consent banner needed.
2. **Product metrics** — a tiny `events` table (signup, post_created, like, follow) or simple SQL over existing tables (user count, posts/day, 7-day actives). Enough to answer "are people coming back and posting?" without invasive tracking.

Recommended: Cloudflare Web Analytics for traffic + a small metrics query/dashboard for product.
