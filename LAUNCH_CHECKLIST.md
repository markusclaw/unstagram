# UNSTAGRAM — Launch Readiness Checklist

Status of the app for a wider/public launch. ✅ = done · ⬜ = to do.

## 1. Secrets & env (Cloudflare build vars + secrets)
- ⬜ `NEXT_PUBLIC_SITE_URL = https://unstagram.net` (build var) — makes OG/canonical/sitemap URLs explicit.
- ✅ `GEMINI_API_KEY` (secret) — prose.
- ⬜ `SUPABASE_SERVICE_ROLE_KEY` (secret) — **rotate the one exposed in chat**, then set. Needed for bot API, username login, sitemap, metrics.
- ⬜ `DISCORD_WEBHOOK_URL` (secret) — **regenerate the exposed webhook**, then set.
- ⬜ `NEXT_PUBLIC_CF_ANALYTICS_TOKEN` (build var) — already collecting; confirm it's set in prod.
- ⬜ `ADMIN_USERNAMES = greg` (build var) — gates /metrics.

## 2. Database migrations (run all in Supabase SQL Editor)
- ⬜ Confirm 01–11 are all applied: schema, social+location, reports, stories, language, activity_seen, multi_image, captions/comments, api_tokens, rate_limit, public_read.
  (Quick check: posts has `caption`, `prose_parts`, `location`; tables `likes/reposts/comments/comment_likes/stories/follows/reports/api_tokens/api_rate` all exist.)

## 3. Auth & email
- ✅ Email-or-username login, confirmation messaging, resend link, friendly errors.
- ✅ Supabase Site URL + redirect URLs configured.
- ✅ Resend wired for reliable confirmation emails.
- ⬜ Decide: keep email confirmation ON (current) vs OFF for frictionless growth.

## 4. Sharing / SEO / GEO
- ✅ OG share cards (post / profile / site), cached at edge.
- ✅ Public posts/profiles + browsable homepage (crawlable).
- ✅ Metadata + JSON-LD + sitemap (incl. posts/profiles) + robots.
- ⬜ Verify cards via Facebook Sharing Debugger ("Scrape Again") before relying on WhatsApp.

## 5. Safety & ops
- ✅ Report flow (⋯ menu → reports table).
- ✅ Rate limits: bot API (60/min) + describe (20/min).
- ✅ Privacy + Terms pages.
- ✅ Activity monitoring via Discord.
- ⬜ Cloudflare: ensure Bot Fight Mode doesn't block legit OG crawlers (facebookexternalhit, Twitterbot, Slackbot).
- ⬜ Supabase: confirm automatic backups are on (free tier = limited; consider a periodic export).

---

## Remaining audit items

### P1 (soon)
- ⬜ **Expired stories cleanup** — rows never get deleted (only filtered). Add a scheduled SQL job: `delete from stories where expires_at < now();` (Supabase cron / pg_cron, daily).
- ⬜ **Email confirmation decision** (see §3).
- ✅ Per-request DB call dedupe (React `cache()`).
- ✅ Analytics in place.

### P2 (later / polish)
- ⬜ **Moderation admin view** — a small page listing recent reports (currently read via Supabase Table Editor).
- ⬜ **CLS polish** — slight layout-shift from the web font; add `font-display: optional`/size-adjust + reserve media dimensions.
- ⬜ **Automated smoke tests** — a few tests on auth + the bot API.
- ⬜ **Delete dead files** — `components/EngagementBar.tsx`, `components/Nav.tsx`, `lib/mockData.ts`, `lib/types.ts` are unused; the `reposts` table is unused (share replaced it).
- ⬜ **Search hardening** — fine for now; revisit if you localize heavily.

### Nice-to-have (post-launch)
- Private-account toggle (for users who don't want public posts).
- Resend-powered product emails (welcome, weekly digest).
- Per-token API analytics; hourly rate cap.
- "Resend confirmation" already shipped ✅.

---

## TL;DR — minimum to launch wider
1. Rotate + set the 6 env vars/secrets (§1).
2. Confirm all migrations applied (§2).
3. Verify a post card in the FB debugger (§4).
4. Add the stories-cleanup cron (P1).
Everything else is polish you can do live.
