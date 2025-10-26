# LifeSafe v1.10e (Static, zero-build)

**Fix:** On iOS/Safari, "Add to Calendar" now opens a **Calendar-ready** `.ics` using a `data:` URL fallback (Safari sometimes blocks Blob downloads).  
Other browsers still use a normal file download.

Includes all v1.10 features:
- **Due soon** chips and per-tab **banner** summary
- **Add to Calendar (.ics)** with **-1 week** reminder
- Per-tab records (Home + Vehicles), LocalStorage persistence, detail view, edit/delete.

## Upload
1) Open your GitHub repo
2) Upload these files to the root:
   - `index.html`
   - `styles.css`
   - `app.js`
   - `favicon.svg`
   - `README.md`
3) Settings → Pages → Deploy from branch → `main` / `(root)`

### iOS usage tip
Tap **Add to Calendar** → if a preview opens, choose **Open in “Calendar”** (or **Share** → **Calendar**).
