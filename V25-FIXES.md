# Girl Hub V25

- Restored catalog safety: an empty Supabase `products` row can no longer wipe the bundled/local catalog.
- If the remote products row is empty, the admin restores the local/seed catalog to Supabase instead of saving an empty catalog.
- Storefront ignores empty remote product payloads.
- Category closing no longer globally hides products from homepage/search/new-products; category-specific pages still respect closed categories.
- Product add/edit now uses a grouped dropdown for all internal categories:
  - Clothes: Shirts, Dresses, Pants
  - Accessories: Chains, Rings, Bracelets, Watches, Bags, Sunglasses
- Selecting an internal category automatically sets the product type to Clothes or Accessories.
