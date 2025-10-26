# LifeSafe v1.05 (Static, zero-build)

**Edit + Delete + Persistence**

What's new:
- Tap **Edit** on a card → opens popup pre-filled → **Save changes**
- Tap **Delete** → confirm → removes the card
- Records are now **saved to LocalStorage** (survive refresh)
- Splash shows v1.05

## Upload
1) Open your GitHub repo
2) Upload these files to the root:
   - index.html
   - styles.css
   - app.js
   - favicon.svg
   - README.md
3) Settings → Pages → Deploy from branch → `main` / `(root)`

Then open your site and try:
- **Add Record** → Save → see card
- **Edit** → change fields → Save changes
- **Delete** → confirm → removed
- Refresh page → cards remain (LocalStorage)
