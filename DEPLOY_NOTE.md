# UNSTAGRAM — deploy handoff (for Markus)

The prototype is configured to go live on GitHub Pages at
**https://markusclaw.github.io/unstagram/**

## Step 1 — push the code (from the project folder)

```bash
cd /Users/markusp./.openclaw/workspace/unstagram
rm -rf .git                 # clears the broken half-clone from earlier
git init -b main
git remote add origin https://github.com/markusclaw/unstagram.git
git add -A
git commit -m "UNSTAGRAM prototype: feed, stories, scrolls, compose + Pages deploy"
git push -u origin main     # add --force if the repo already has commits
```

## Step 2 — turn on Pages (once)

GitHub repo → **Settings → Pages → Source → "GitHub Actions"**.

Done. The workflow in `.github/workflows/deploy.yml` builds and deploys
automatically on every push to `main`. First deploy takes ~1–2 min; watch it
under the repo's **Actions** tab. When it's green, send RJ the URL above.

## What RJ is reviewing

A clickable concept: Instagram's exact layout (3 columns, stories, Reels tab,
engagement bar, suggestions) — with prose where every image should be. Mock
data only; the real image→prose step is one stubbed function (`lib/generateProse.ts`).
