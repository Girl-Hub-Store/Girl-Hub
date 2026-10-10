# Girl Hub V22 — Offers grid and size/color inventory

## Changes in this package
- Replaced the dedicated offers page slider with a responsive product-card grid.
- Added a per-size/per-color inventory matrix to the product editor.
- Product details now select a size first and disable colors whose stock is zero for that size.
- Cart quantity checks use the selected size + color stock.
- Added `SUPABASE-V22-SIZE-COLOR-INVENTORY.sql` to update the existing checkout/status functions so color stock is deducted/restored centrally.

## Important deployment order
1. Back up the current GitHub files and export/backup the current Supabase product data.
2. Upload the contents of `Girl-Hub` to the existing GitHub repository, replacing matching files.
3. Test the offers page and product editor using a low-risk test product first.
4. To make per-color stock deduction work centrally, review and run `SUPABASE-V22-SIZE-COLOR-INVENTORY.sql` in Supabase SQL Editor. This file uses `CREATE OR REPLACE FUNCTION` only; it does not drop tables or delete product/order rows. Still, back up first.
5. On one test product, set stock for each size/color combination. Place one test order and verify only that combination decreases. Then cancel the test order and verify that exact combination is restored.

## Legacy products
Products without `stockBySizeColor` keep their previous size-only inventory behavior until they are edited and saved with a size/color matrix. When editing a legacy product with a total stock but no size-level stock, the editor distributes the existing total across its listed sizes as an initial editable estimate. Review the matrix before saving; it is not historical color-specific stock data.
