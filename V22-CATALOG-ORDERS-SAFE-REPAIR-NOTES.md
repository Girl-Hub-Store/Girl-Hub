Girl Hub V22 — Catalog and Orders Safe Repair

Based on the exact uploaded V22 Safe Multi Admin Repair ZIP.
- Adds a separate visible Supabase/Google Sheets order-loading status.
- Adds a 12-second timeout message for stalled Supabase reads.
- Protects an already-cached fuller product catalog from being silently replaced by a smaller response.
- If the remote products row is missing, it no longer clears the current product list.
- Does not run SQL, delete Supabase rows, seed products, or change existing order data.

Upload carefully:
1. Keep a copy of the current GitHub repository first.
2. Unzip this archive.
3. Upload the contents of the inner Girl-Hub folder to the existing repository root, replacing matching files only.
4. Hard refresh the dashboard (Ctrl+Shift+R).
5. Open Products and Orders and read both status messages.

Important: if Supabase has fewer products than the current browser cache, this version preserves the larger catalog locally and warns in the dashboard; it does not automatically rewrite Supabase. This is a safety guard, not a replacement for reviewing the actual remote catalog before saving product edits.
