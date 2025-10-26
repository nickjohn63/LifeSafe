# LifeSafe v1.10 (Static, zero-build)

**Renewal alerts (static-friendly)**

New in this version:
- **Due soon** logic: if Renewal Date is within **7 days**, the card shows a yellow **Due soon (Xd)** chip and the tab shows a **banner** ("Heads up: n due within 7 days · m expired").
- **Expired** renewals remain **red ❗** as before.
- **Add to Calendar (.ics)** action on each card and in the Detail View:
  - Creates an all-day event on the renewal date
  - Includes a **1-week reminder (VALARM)** so your phone/calendar will alert even if the site is closed
- Keeps per-tab records (Home + Vehicles enabled), LocalStorage persistence.

## Upload
1) Open your GitHub repo
2) Upload these files to the root:
   - `index.html`
   - `styles.css`
   - `app.js`
   - `favicon.svg`
   - `README.md`
3) Settings → Pages → Deploy from branch → `main` / `(root)`

Then open your site and test:
- Add items with Renewal Dates within the next 7 days → see **Due soon** chip + banner
- Click **Add to Calendar** to download an `.ics` with a **-1 week** alarm
