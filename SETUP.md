# Resource Manager — Setup Guide

This app uses **React + Vite** for the frontend, **Supabase** for the database,
and **GitHub Pages** for free hosting.

---

## Already set up previously?
If you ran an earlier version of `supabase_schema.sql`, run `supabase_migrate.sql` instead — it patches the three critical bugs without touching your existing data.

---

## Step 1 — Set up Supabase (free database)

1. Go to https://supabase.com and create a free account
2. Click **New Project**, give it a name (e.g. "resource-manager"), set a password, choose a region
3. Wait ~2 minutes for the project to provision
4. Go to **SQL Editor** → **New Query**
5. Copy the entire contents of `supabase_schema.sql` and paste it in, then click **Run**
6. Go to **Project Settings** → **API**
7. Copy your **Project URL** and **anon public** key

---

## Step 2 — Add your Supabase credentials

Open `src/supabaseClient.js` and replace the placeholder values:

```js
const SUPABASE_URL = 'https://YOUR_PROJECT_ID.supabase.co'  // ← paste Project URL here
const SUPABASE_ANON_KEY = 'YOUR_ANON_PUBLIC_KEY'            // ← paste anon key here
```

---

## Step 3 — Set up the GitHub repository

1. Go to https://github.com and create a new **public** repository
   - Name it exactly `resource-manager` (or update `base` in `vite.config.js` to match)
2. Push this project folder to that repository:

```bash
cd resource-manager
git init
git add .
git commit -m "initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/resource-manager.git
git push -u origin main
```

---

## Step 4 — Deploy to GitHub Pages

Install dependencies and deploy:

```bash
npm install
npm run deploy
```

This builds the app and pushes it to the `gh-pages` branch automatically.

Then in GitHub:
1. Go to your repository → **Settings** → **Pages**
2. Set **Source** to `Deploy from a branch`
3. Set **Branch** to `gh-pages` / `/ (root)`
4. Click **Save**

Your app will be live at:
**https://YOUR_USERNAME.github.io/resource-manager/**

---

## Step 5 — Future updates

Any time you make changes to the code, redeploy with:

```bash
npm run deploy
```

---

## How it works

- **Persistent state** — all data is stored in Supabase (PostgreSQL), not in the browser
- **Multi-session** — any number of people can use the app simultaneously at the same URL
- **Real-time sync** — changes made by one user appear instantly for all other users
- **Free** — Supabase free tier supports up to 500MB storage and 2GB bandwidth/month,
  which is more than sufficient for internal tooling at most team sizes

---

## Troubleshooting

| Problem | Fix |
|---|---|
| Red "sync error" in the header | Check your Supabase URL and anon key in `src/supabaseClient.js` |
| Blank page after deploying | Make sure the `base` in `vite.config.js` matches your repo name exactly |
| Data not updating live | Make sure you ran the `alter publication supabase_realtime` lines in the SQL schema |
| "permission denied" errors | Make sure you ran the `create policy` lines in the SQL schema |
