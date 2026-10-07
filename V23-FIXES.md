# Girl Hub V23 — Dashboard + Offers + Live Inventory

## What changed

1. Restored the dashboard design to the previous sidebar layout (V21). The V22 fixed top header was removed.
2. Fixed the login screen staying visible after authentication. The `[hidden]` state is now respected and the dashboard restores the Supabase session on refresh.
3. Fixed the homepage discount cards so clicking a product reliably opens `product.html?id=...`; normal clicks are separated from swipe/drag gestures.
4. Inventory is now central and interactive when the new Supabase SQL function is installed:
   - each size is checked against its own stock;
   - the order cannot be placed if a selected size has insufficient stock;
   - stock is deducted atomically when the order is created;
   - the storefront receives the updated product stock immediately;
   - the admin order cancellation flow restores stock;
   - total stock is recalculated from `stockBySize`.
5. The product-page `+` quantity button now stops at the available stock for the selected size.
6. Existing per-size controls remain in the dashboard, including showing/hiding stock on the storefront.
7. Promo-code auto-close/reset behavior remains from V22.

## Important — run the new SQL once

Open Supabase → SQL Editor and run the `create_order_with_inventory(...)` function from `supabase-setup.sql` in this release.

The storefront has a backward-compatible fallback if the function is not installed yet, but central stock deduction will only be guaranteed after the SQL function is installed.

## Existing products

For old products that do not have `stockBySize`, open **المنتجات والمخزون → تعديل** and enter stock for each size once. After that, the total stock is calculated automatically from the sizes.
