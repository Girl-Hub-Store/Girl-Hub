# Girl Hub V22 — Inventory + Promo + Dashboard Fixes

## 1) Size-by-size inventory
- Product inventory supports a separate quantity for every size.
- Product cards can show the quantity for each size when enabled.
- Product details show remaining quantity beside each size.
- Selecting a size updates the purchase quantity limit for that size.
- Cart quantity is still capped by the selected size stock.
- Dashboard product cards show a compact per-size inventory summary.
- Added a dashboard setting to show/hide size stock on the storefront.

## 2) Promo code reset
- A promo automatically becomes disabled when its expiry date is reached or its global usage limit is reached.
- Automatic shutdown is marked as `autoClosed`.
- Re-enabling an automatically closed promo resets its usage counter to zero.
- If the old campaign period is already over, the promo gets a fresh period starting today using the previous duration.

## 3) Homepage offers click
- Removed the extra click interception from the homepage offers carousel.
- The real product anchor is now responsible for navigation.
- Swipe handling remains separate so a swipe does not accidentally open a product.

## 4) Closed categories
- Closing Clothes or Accessories no longer redirects or seals the whole page.
- The page shell, header, footer, and navigation remain usable.
- Category/subcategory cards remain visible with the yellow/black SOON seal.
- Direct subcategory routes still refuse to open when their parent category is closed.

## 5) Dashboard UI
- Replaced the side navigation layout with a fixed top header navigation.
- Navigation stays visible while dashboard content scrolls.
- Mobile dashboard keeps a compact horizontal fixed menu.
- Existing login screen is automatically skipped whenever a valid Supabase session already exists.
