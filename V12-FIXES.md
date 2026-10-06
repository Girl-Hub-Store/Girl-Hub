# Girl Hub V12 fixes

- Product colors are managed from Admin by name + exact HEX color and are used on the product page.
- Products can be included/excluded from the Offers page directly from Admin.
- Hero banners are no longer limited to two. Add as many enabled banners as needed; each banner keeps its own title/subtitle/button/link.
- Fixed hero captions being reused from the first banner.
- Fixed Supabase order mapping to the existing `orders` schema (`order_number` + `payload`) so Admin can receive storefront orders.
- Improved promo-code field readability on checkout.
- Offer/product cards point directly to `product.html?id=...`.
- Added semantic category artwork for Rings, Bracelets, and Sunglasses.

## Important for orders
The included Supabase schema already uses `order_number` and `payload`; the updated code now matches that schema. If the database tables/policies were never created, run `supabase-setup.sql` in Supabase SQL Editor.
