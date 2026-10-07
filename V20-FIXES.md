# Girl Hub V20 — Offers, Mobile Hero, Closed Sections & Live Inventory

- Offers now respect the dashboard `offer` switch strictly; unchecked products no longer appear as offers just because they have an old price.
- The full offers page now updates when Supabase remote data changes and shows an empty state when there are no active offers.
- Discount carousel clears itself when the managed offer list becomes empty and keeps normal product links clickable unless the gesture was an actual swipe.
- Hero/banner dashboard rows are redesigned for small screens: full-width image, readable text, stacked controls, no narrow/wide overflow.
- Closing a category no longer redirects or visually locks the whole page. Header and footer remain usable; the closed section shows its SOON notice and hides its product grid.
- Inventory now reconciles with incoming orders created after this release. New orders deduct item quantities from product stock; canceled orders restore the quantities. Admin polls orders every 20 seconds while open.
- Cart quantity increases are capped by the managed stock value, and adding an out-of-stock product is blocked.
