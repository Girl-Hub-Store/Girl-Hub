# Girl Hub V22 — Requested fixes

This patch is based on the currently uploaded working V22 archive. It keeps the existing store data structure and Supabase RPC/database code unchanged.

## Changes
- Fixed product detail thumbnails to follow the saved image order, with `img` always treated as the main image and `images` as the remaining gallery.
- Matched storefront product image frames to the 4:5 crop used by the dashboard for product photos, including product cards and the product detail image.
- Made the existing dashboard logout action visible on mobile instead of hiding the entire bottom sidebar section.
- Added a per-color “ظاهر على الموقع” checkbox. The `enabled` property is retained in the product JSON; hidden colors are filtered only from the storefront picker, not deleted from product data. Color changes flow through the existing product save and Supabase realtime path.

## Deployment safety
- No SQL changes are required.
- No Supabase schema, RPC, orders, or inventory functions were changed.
- Keep a backup of the current GitHub version before replacing files.
- After deployment, hard-refresh the dashboard and storefront (`Ctrl+Shift+R`). Test color visibility on one product first, then confirm that its price, stock, sizes, and orders are unchanged.
