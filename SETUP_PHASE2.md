# UNSTAGRAM — Phase 2 setup (Cloudflare Workers + Supabase)

Phase 2 turns the concept into a real app: email/password accounts (invite-only),
posts saved in Postgres, and **real** AI prose from your photos. Architecture:

- **GitHub** — source + CI
- **Cloudflare Workers** (via OpenNext) — runs the app + the `/api/describe` prose route
- **Supabase** — Postgres database + auth
- **Google Gemini** — the vision model that writes the prose (key stays server-side)

The code is done and verified (it builds and packages into a Worker). What's left is
wiring up *your* accounts. ~20 minutes. Follow in order.

---

## 1. Supabase (database + auth)

1. Create a free project at **supabase.com**.
2. **Project Settings → API**: copy your **Project URL** and **anon public key**. You'll
   paste these in a few places below. (Both are safe to expose — Row-Level Security protects the data.)
3. **SQL Editor → New query** → paste the entire contents of `supabase/schema.sql` → **Run**.
   This creates the tables, security rules, the signup trigger, and seed invite codes.
4. **Authentication → Sign In / Providers → Email**: make sure it's enabled.
   For the concept, also turn **off** "Confirm email" (Authentication → Sign In / Up settings)
   so signups log in immediately without an email round-trip.
5. (Optional) Edit invite codes in **Table Editor → invite_codes**, or in the SQL seed.
   Seeded codes: `COWS-IN-VR`, `DELETE-THE-PICTURES`, `SLOW-FEED-001/002/003`.

## 2. Google Gemini (the prose)

1. Get an API key at **aistudio.google.com (Get API key) → API Keys**.
2. Keep it secret — it only ever lives server-side (a Cloudflare secret), never in the browser.

## 3. Put the Supabase values into the app

Paste your Supabase URL + anon key into **`wrangler.jsonc`** (the `vars` block) — these are
used by the Worker at runtime:

```jsonc
"vars": {
  "NEXT_PUBLIC_SUPABASE_URL": "https://YOUR-PROJECT.supabase.co",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY": "YOUR-ANON-KEY"
}
```

## 4. Try it locally (optional but recommended)

```bash
cp .env.example .env.local      # fill in the 3 values
npm install
npm run dev                     # http://localhost:3000
```

Sign up with a seeded invite code, post a photo, watch it become prose.
To test in the real Workers runtime: `cp .dev.vars.example .dev.vars` (fill it), then `npm run preview`.

## 5. Deploy to Cloudflare — pick ONE path

### Path A — Cloudflare dashboard (easiest, recommended)

1. **Cloudflare dashboard → Workers & Pages → Create → Workers → Connect to Git**, pick the `unstagram` repo.
2. Build command: `npx opennextjs-cloudflare build`  ·  Deploy command: `npx wrangler deploy`
3. In the project's **Settings → Variables**:
   - Add **build variables** `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` (your Supabase values).
   - Add a **secret** `GEMINI_API_KEY` (your Gemini key).
4. Deploy. Cloudflare gives you a `unstagram.<account>.workers.dev` URL and redeploys on every push.

### Path B — GitHub Actions (workflow already included)

The repo has `.github/workflows/deploy.yml`. Set these in **GitHub repo → Settings → Secrets and variables → Actions**:

- `CLOUDFLARE_API_TOKEN` (create at Cloudflare → My Profile → API Tokens → "Edit Cloudflare Workers" template)
- `CLOUDFLARE_ACCOUNT_ID` (Cloudflare dashboard, right sidebar)
- `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`

Then set the Gemini key as a Worker secret once, from your machine:

```bash
npx wrangler secret put GEMINI_API_KEY
```

Push to `main` → it builds and deploys automatically.

---

## Notes

- **Privacy line, honest version:** the photo is sent to the model, turned into words, and
  immediately discarded — never stored, never shown. (`app/api/describe/route.ts` keeps nothing.)
- **The prose prompt is the product.** It lives in `app/api/describe/route.ts` (`PROMPT`). Tune it
  there. Default model is `gemini-2.5-flash`; override with a `GEMINI_MODEL` env var.
- **Invite-only** is enforced at signup against the `invite_codes` table. Add codes anytime.
- This replaces the GitHub Pages deploy (Pages can't run server code). The old Pages site can stay
  as the static concept demo, or you point everyone at the new Workers URL.

## Switching prose providers

The `/api/describe` route supports three providers. Set `PROSE_PROVIDER` to
`gemini` (default), `openai`, or `anthropic`, and fill the matching key:

| Provider  | Key var             | Default model       | Notes                          |
| --------- | ------------------- | ------------------- | ------------------------------ |
| gemini    | `GEMINI_API_KEY`    | `gemini-2.5-flash`  | free tier, no billing          |
| openai    | `OPENAI_API_KEY`    | `gpt-4.1-mini`      | needs billing/credit           |
| anthropic | `ANTHROPIC_API_KEY` | `claude-haiku-4-5`  | needs billing                  |

Keep multiple keys in `.env.local`; switching is just changing `PROSE_PROVIDER`
(then restart `npm run dev`). Override any model with `GEMINI_MODEL` / `OPENAI_MODEL` / `ANTHROPIC_MODEL`.
In production set the relevant key as a Cloudflare secret (`wrangler secret put GEMINI_API_KEY`).
