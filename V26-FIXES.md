# Girl Hub V26

- Fixed storefront remote product sync: an empty `store_data.products` row no longer wipes the bundled/local catalog.
- Fixed admin remote loading: empty remote catalog is ignored and restored from local/bundled products.
- Central inventory SQL remains responsible only for stock deduction (`stockBySize` and total `stock`) and does not hide products.
- Products with zero stock remain visible; they are only unavailable for purchase.
- Product add/edit modal uses a dropdown for internal categories:
  clothes: shirts, dresses, pants
  accessories: chains, rings, bracelets, watches, bags, sunglasses
- Kept V23 dashboard/inventory behavior and V25 restore/category-choice fixes.
