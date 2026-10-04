# Girl Hub: Supabase + mobile dashboard setup

This package adds the Supabase integration code, direct mobile image upload, shared data storage, and allowlisted admin login. It is **not live-connected until the project URL/key and admin membership are configured**.

## 1. Create Supabase project
1. Create a project at https://supabase.com/ and save the database password safely.
2. Open **Project Settings → API**. Copy the **Project URL** and **anon/public key** (never use `service_role`).
3. In `js/supabase-config.js`, set `GH_SUPABASE_URL` and `GH_SUPABASE_ANON_KEY`.

## 2. Create tables and image bucket
1. Open **SQL Editor → New query**.
2. Paste and run all of `supabase-setup.sql`.
3. In **Authentication → Users**, add an account for each person who should manage the store. Use their email and a strong temporary password; ask each person to change it after signing in.
4. Copy each allowed user's UUID from Authentication → Users, then run this query with the actual UUID:

```sql
insert into public.admin_users (user_id, role, active)
values ('PASTE-AUTH-USER-UUID-HERE', 'owner', true)
on conflict (user_id) do update set role = excluded.role, active = true;
```

Repeat for each authorized manager. Do not add unknown users. The browser only contains the public anon key; RLS protects admin writes.

## 3. Import current data safely
- Before switching, open the old dashboard and use **Download backup** to save a JSON backup.
- Keep the existing Google Sheet and Apps Script untouched until new order flow has been tested.
- Once Supabase is configured, sign in to the dashboard and use **Import backup** to load products, promos, categories, banners, settings and any locally held orders. Review the values before saving.
- Orders that exist only in Google Sheets or another browser are not automatically copied by the local backup. Export them separately from their source and archive the sheet. Do not delete the old source until reconciliation is complete.

## 4. Upload from phone
The product and banner forms now have a file picker. Choose **Camera** or **Photo Library**, then save. Images up to 8 MB (JPEG, PNG, WebP, GIF) upload to the `store-images` bucket and the returned public URL is saved in the product/banner data.

## 5. Test before publishing
1. Serve the project over HTTPS or Live Server, not `file://`.
2. Sign in with an allowlisted email and password.
3. Add a test product with a test image; edit its price; reload dashboard.
4. Open the storefront in a private/incognito window or another device and verify product/image/price appear.
5. Test a banner and a category seal message.
6. Verify a non-allowlisted account cannot access the dashboard data or upload images.
7. Compare order totals and counts with the old Google Sheet before moving order operations.

## Important limitations to resolve before production
- New checkouts are sent to both the legacy Google Apps Script endpoint (to preserve the current sheet workflow) and Supabase `orders`. The dashboard reads new/current orders from Supabase when configured. This dual-write is a transition step, not a permanent architecture.
- Historical orders already in Google Sheets are not automatically imported. Before relying on Supabase for all history, export the sheet to CSV/JSON, map the fields, import into `orders`, then reconcile order counts and totals. Keep the old sheet as an archive until this is verified.
- Supabase public image URLs are readable by anyone, which is appropriate for public product/banner photos. Never upload private customer files there.
- No service-role key belongs in browser JavaScript.
