# Girl Hub — Supabase Safe Repair

النسخة دي بتعتبر Supabase هو المصدر الوحيد للحقيقة عند استخدام لوحة التحكم.

## مهم
1. افتح Supabase → SQL Editor.
2. نفّذ الملف `SUPABASE-REPAIR-SAFE.sql` مرة واحدة بالكامل.
3. الملف **لا يمسح المنتجات أو الأوردرات الموجودة**؛ بيعيد إنشاء/تثبيت الجداول والسياسات والـ RPCs المطلوبة لو كانت ناقصة.
4. بعد التنفيذ، اعمل Sign out ثم Sign in في لوحة التحكم بالحسابين.

## إضافة Admin جديد
بعد إنشاء المستخدم من Supabase Auth، أضفه إلى `public.admin_users`:

```sql
insert into public.admin_users (user_id, role, active)
select id, 'manager', true
from auth.users
where email = 'EMAIL_OF_NEW_USER'
on conflict (user_id)
do update set role='manager', active=true;
```

## حماية مهمة
الكود الجديد لا يقوم بعمل seed لبيانات محلية عند دخول جهاز جديد. لو Supabase لا يرجع بيانات، سيظهر تحذير بدل ما يرفع نسخة محلية فوق البيانات المركزية.
