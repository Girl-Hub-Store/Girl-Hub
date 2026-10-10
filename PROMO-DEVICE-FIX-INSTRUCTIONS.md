Girl Hub — Promo duplicate-use protection

1) Back up the current GitHub files and Supabase project before changing anything.
2) Upload the contents of this ZIP's Girl-Hub folder to the existing GitHub Pages repository.
3) In Supabase Dashboard > SQL Editor, run SUPABASE-PROMO-DEVICE-AND-DUPLICATE-USE-FIX.sql exactly once.
4) Hard-refresh the storefront (Ctrl+Shift+R) and test with a NEW promo code or a code with remaining uses. First order should work; second order with same phone OR same browser device should be rejected.

Important behavior/limits:
- This identifies the browser installation using a random ID in localStorage, not a hardware fingerprint. Clearing site data, private browsing, or another browser may create a new ID. Phone checking still blocks the same normalized phone across browsers.
- Existing redemption rows remain and continue counting by phone. They do not have historical device IDs, so they cannot block prior devices by device ID.
- SQL migration removes the old 4-argument reserve_promo function and grants execution only on the new 5-argument version. The storefront must be uploaded together with the migration; otherwise promo checkout will fail closed instead of granting an unverified discount.
- No orders, inventory, or stock functions are changed by this patch.
