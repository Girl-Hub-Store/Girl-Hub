Girl Hub V22 — Orders and inventory repair notes

Changes in this build:
- Restored the Google Apps Script Web App URL previously supplied in the conversation in both the storefront fallback and public-data bridge.
- Added a separate orders-connection status inside the Orders tab so a successful product sync cannot hide an orders-read error.
- Changed the dashboard initial message to say it is checking the central connection.
- Supabase remains the source of truth for order creation and stock deduction via create_order_with_inventory_v22. Google Apps Script is only the fallback/Google Sheets path.

After uploading:
1. Upload the contents of Girl-Hub to the existing GitHub repository, replacing same-name files.
2. Confirm GitHub Pages deployment completes, then hard refresh the dashboard.
3. In the Orders tab, read the new status line below the heading. It will show the exact Supabase read error or the number of orders loaded.
4. Do not run SQL or delete existing rows just because the status is an error.

Important: the Google Apps Script URL must still point to an active deployment containing the matching Code.gs, with a real spreadsheet ID and configured ADMIN_KEY. This build does not change the deployed Apps Script project or Supabase data.
