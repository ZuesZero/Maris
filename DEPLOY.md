# Deployment Guide: Vercel & GitHub Pages

This guide outlines how to deploy **Mari's Atelier** to **Vercel** and **GitHub Pages**.

---

## 1. Deploying to Vercel (Recommended — 2 Minutes)

Vercel provides automatic deployments, global CDN distribution, and free SSL certificates.

### Method A: Via Vercel Web Dashboard (Easiest)
1. Push this project to your GitHub repository (or export from AI Studio).
2. Go to [https://vercel.com/new](https://vercel.com/new) and log in.
3. Import your GitHub repository.
4. Vercel automatically detects the `vercel.json` and Vite framework:
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
5. *(Optional)* If using Gemini AI Concierge features, add your `GEMINI_API_KEY` under **Environment Variables**.
6. Click **Deploy**. Your site will be live on `https://<your-project>.vercel.app`.

### Method B: Via Vercel CLI
```bash
npm i -g vercel
vercel login
vercel
```
Follow the prompts (accept the defaults). To deploy to production:
```bash
vercel --prod
```

---

## 2. Deploying to GitHub Pages (Automated via GitHub Actions)

The repository includes a ready-to-use GitHub Actions workflow in `.github/workflows/deploy.yml`.

### Setup Steps:
1. Push this project to your GitHub repository on the `main` (or `master`) branch.
2. In your GitHub repository:
   - Go to **Settings** → **Pages** (in the left sidebar).
   - Under **Build and deployment** → **Source**, select **GitHub Actions**.
3. Push any commit to `main`, or manually trigger the workflow:
   - Go to the **Actions** tab in GitHub.
   - Select **Deploy to GitHub Pages**.
   - Click **Run workflow**.
4. Once completed, your site will be live at:
   `https://<your-username>.github.io/<repository-name>/`

### Notes on GitHub Pages:
- Asset paths are configured with relative URLs (`base: './'`) in `vite.config.ts`, so assets load correctly on any GitHub Pages subpath.
- `public/404.html` is included to handle SPA single-page routing seamlessly.

---

## Build Commands Summary
- `npm run build`: Compiles the client bundle into the `dist/` folder.
- `npm run start`: Starts the full-stack server (used for Node.js / Cloud Run hosting).
- `npm run dev`: Runs the local development server on port 3000.
