# Girl Hub V27 — Restore Clothing Cards

## Fix
- Restored the product visibility/filter behavior used in V22/V23 for storefront product cards.
- Removed the V25/V26 extra `categoryPage` gate that could make the Clothes page render empty while the same products still appeared in Offers.
- Inventory logic was not changed.
- Per-size inventory, promo dashboard, internal categories, and the V26 blank-remote-catalog protection remain intact.

## Root cause
The regression was in `js/main.js`, not the stock values. V25/V26 added an extra category-page condition to `productAllowedInCurrentContext()`. That condition could filter products on `clothes.html` even when the product itself was valid and stocked.
