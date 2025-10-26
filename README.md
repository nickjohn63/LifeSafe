# LifeSafe v1.09 (Static, zero-build)

**Per-tab record keeping — Phase 1: Vehicles**

What's new:
- **Vehicles tab** now works the same as Home:
  - Own **+ Add Record** button
  - Hint hidden once you add the first item
  - List of cards with Title, Type, Description, Start/Renewal dates (expired highlight)
  - Tap a card → **Detail View** (with Edit/Delete)
  - Edit/Delete also available on the list
- **LocalStorage** now saves data **per tab** using a single key:
  - `lifesafe_tabbed_records_v109` storing `{ home:[], vehicles:[], ... }`
- **Home** continues working as before.
- Other tabs (**Health, Finance, IDs & Docs, Pets, Other**) remain placeholders for now and will be enabled one-by-one next.

## Upload
1) Open your GitHub repo
2) Upload these files to the root:
   - `index.html`
   - `styles.css`
   - `app.js`
   - `favicon.svg`
   - `README.md`
3) Settings → Pages → Deploy from branch → `main` / `(root)`

Then open your site and try:
- Add a record on **Home**
- Switch to **Vehicles** → add a vehicle-related record (e.g., MOT due date) → it appears under Vehicles only
- Tap a card → **details** → edit/delete
