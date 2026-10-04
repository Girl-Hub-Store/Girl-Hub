# Girl Hub Store

نسخة HTML/CSS/JavaScript من تصميم Figma المرفوع.

## التشغيل
افتح `index.html` مباشرة، أو شغل أي static server.

## التعديل على المنتجات
كل المنتجات موجودة في `js/products.js`، ويمكن تغيير الاسم والسعر والصورة والتصنيف وحالة التوفر.

## GitHub Pages
ارفع محتويات المجلد إلى repository ثم فعّل GitHub Pages من Settings → Pages → Deploy from branch.


## Supabase + Mobile Admin
See `SUPABASE-MOBILE-SETUP.md` and run `supabase-setup.sql` before enabling cloud login or mobile image uploads. Configure `js/supabase-config.js` with the Supabase project URL and anon/public key. Never add a service_role key to frontend files.
