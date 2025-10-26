# LifeSafe v1.02 (Static, zero-build)

Pure HTML/CSS/JS — upload these files directly to GitHub (no Node/Vite/Actions).

## What's new in V1.02
- Home tab now shows content:
  - **Large full-width blue** “+ Add Record” button (pill shape)
  - 💡 Helper message: “Start organising your life — add your first record”
  - Placeholder list area
- Tabs switch content sections (Home/other tabs are placeholders for now)
- Splash shows **v1.02**

## Upload to GitHub
1. Create a repo (e.g., `LifeSafe`).
2. **Add file → Upload files**, and upload everything in this folder:
   - `index.html`
   - `styles.css`
   - `app.js`
   - `favicon.svg`
   - `README.md`
3. Commit.

### Enable Pages
- **Settings → Pages → Deploy from a branch**
- **Branch:** `main` • **Folder:** `/ (root)`
- Save.

Your app will be live at: `https://<your-username>.github.io/<repo-name>/`

> Uses **relative paths**, so it works automatically with any repo name.
