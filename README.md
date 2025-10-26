# LifeSafe v1.06 (Static, zero-build)

Adds **date fields** + expiry highlighting.

## New
- **Start Date** and **Renewal Date** in Add/Edit popup (both optional, standard date pickers)
- Dates are **shown on cards** under the description:
  - `Start: dd/mm/yyyy`
  - `Renewal: dd/mm/yyyy` (turns **red** with ❗ if the date is in the past)
- Records continue to **persist in LocalStorage** (same key as v1.05). 
- You can still **Edit** and **Delete** records.

## Upload
1) Open your GitHub repo
2) Upload these files to the root:
   - index.html
   - styles.css
   - app.js
   - favicon.svg
   - README.md
3) Settings → Pages → Deploy from branch → `main` / `(root)`

Then open your site and add a record with dates to see them on the card.
