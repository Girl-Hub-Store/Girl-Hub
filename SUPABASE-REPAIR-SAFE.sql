-- Girl Hub Supabase setup. Run in Supabase SQL Editor as project owner.
create extension if not exists pgcrypto;

create table if not exists public.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  role text not null default 'manager' check (role in ('owner','manager')),
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create or replace function public.is_store_admin()
returns boolean language sql stable security definer set search_path = public
as $$ select exists(select 1 from public.admin_users a where a.user_id = auth.uid() and a.active = true); $$;

create table if not exists public.store_data (
  kind text primary key check (kind in ('products','promos','categories','banners','settings','orders')),
  data jsonb not null default '[]'::jsonb,
  updated_at timestamptz not null default now()
);


create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  order_number text not null unique,
  created_at timestamptz not null default now(),
  status text not null default 'جديد',
  paid boolean not null default false,
  deleted boolean not null default false,
  payload jsonb not null default '{}'::jsonb
);
alter table public.orders enable row level security;
drop policy if exists "public can submit orders" on public.orders;
create policy "public can submit orders" on public.orders for insert to anon, authenticated with check (length(order_number) between 3 and 40);
drop policy if exists "admins read orders" on public.orders;
create policy "admins read orders" on public.orders for select to authenticated using (public.is_store_admin());
drop policy if exists "admins update orders" on public.orders;
create policy "admins update orders" on public.orders for update to authenticated using (public.is_store_admin()) with check (public.is_store_admin());
drop policy if exists "admins delete orders" on public.orders;
create policy "admins delete orders" on public.orders for delete to authenticated using (public.is_store_admin());
grant insert on public.orders to anon, authenticated;
grant select, update, delete on public.orders to authenticated;
create index if not exists orders_created_at_idx on public.orders(created_at desc);
create index if not exists orders_status_idx on public.orders(status);

alter table public.admin_users enable row level security;
alter table public.store_data enable row level security;

-- Only a signed-in, explicitly allowlisted manager can see the allowlist.
drop policy if exists "admin can read own membership" on public.admin_users;
create policy "admin can read own membership" on public.admin_users for select to authenticated using (user_id = auth.uid());
-- Storefront visitors can read only public store configuration, never the orders payload.
drop policy if exists "public reads storefront data" on public.store_data;
create policy "public reads storefront data" on public.store_data for select to anon, authenticated using (kind in ('products','promos','categories','banners','settings'));
drop policy if exists "admins read all store data" on public.store_data;
create policy "admins read all store data" on public.store_data for select to authenticated using (public.is_store_admin());
drop policy if exists "admins write store data" on public.store_data;
create policy "admins write store data" on public.store_data for all to authenticated using (public.is_store_admin()) with check (public.is_store_admin());

grant select on public.store_data to anon, authenticated;
grant insert, update, delete on public.store_data to authenticated;
grant select on public.admin_users to authenticated;

-- Product/banner image bucket. Public read means the product image URLs work in the storefront.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('store-images','store-images',true,8388608,array['image/jpeg','image/png','image/webp','image/gif'])
on conflict (id) do update set public = true, file_size_limit = 8388608, allowed_mime_types = array['image/jpeg','image/png','image/webp','image/gif'];

drop policy if exists "public can view store images" on storage.objects;
create policy "public can view store images" on storage.objects for select to anon, authenticated using (bucket_id = 'store-images');
drop policy if exists "admins upload store images" on storage.objects;
create policy "admins upload store images" on storage.objects for insert to authenticated with check (bucket_id = 'store-images' and public.is_store_admin());
drop policy if exists "admins update store images" on storage.objects;
create policy "admins update store images" on storage.objects for update to authenticated using (bucket_id = 'store-images' and public.is_store_admin()) with check (bucket_id = 'store-images' and public.is_store_admin());
drop policy if exists "admins delete store images" on storage.objects;
create policy "admins delete store images" on storage.objects for delete to authenticated using (bucket_id = 'store-images' and public.is_store_admin());

-- Do not seed empty store_data rows. On first authorized dashboard login, current local defaults are uploaded only if the table is empty.

-- Central promo usage: prevents max-use limits from being bypassed by another phone/browser.
create table if not exists public.promo_redemptions (
  id uuid primary key default gen_random_uuid(),
  code text not null,
  order_number text not null unique,
  customer_phone text,
  subtotal numeric not null default 0,
  discount numeric not null default 0,
  created_at timestamptz not null default now()
);
alter table public.promo_redemptions enable row level security;
drop policy if exists "admins read promo redemptions" on public.promo_redemptions;
create policy "admins read promo redemptions" on public.promo_redemptions for select to authenticated using (public.is_store_admin());
grant select on public.promo_redemptions to authenticated;

create or replace function public.reserve_promo(
  p_code text,
  p_subtotal numeric,
  p_customer_phone text,
  p_order_number text
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  row_data jsonb;
  promos jsonb;
  promo jsonb;
  idx integer;
  v_code text;
  v_type text;
  v_value numeric;
  v_max integer;
  v_used integer;
  v_per_customer integer;
  v_min numeric;
  v_starts date;
  v_expires date;
  v_discount numeric;
  v_customer_uses integer;
begin
  if coalesce(trim(p_code),'') = '' then
    return jsonb_build_object('ok',true,'discount',0,'promoPercent',0,'code','');
  end if;

  select data into row_data from public.store_data where kind='promos' for update;
  promos := coalesce(row_data, '[]'::jsonb);
  idx := 0;
  promo := null;
  for promo in select value from jsonb_array_elements(promos) loop
    if upper(coalesce(promo->>'code','')) = upper(trim(p_code)) then
      exit;
    end if;
    idx := idx + 1;
  end loop;
  if promo is null or coalesce(promo->>'code','') = '' then
    return jsonb_build_object('ok',false,'message','كود الخصم غير موجود');
  end if;

  v_code := upper(trim(promo->>'code'));
  if coalesce((promo->>'enabled')::boolean,false) = false then
    return jsonb_build_object('ok',false,'message','الكود متوقف');
  end if;
  v_starts := nullif(promo->>'startsAt','')::date;
  v_expires := nullif(promo->>'expiresAt','')::date;
  if v_starts is not null and current_date < v_starts then
    return jsonb_build_object('ok',false,'message','الكود لسه ما بدأش');
  end if;
  if v_expires is not null and current_date > v_expires then
    return jsonb_build_object('ok',false,'message','مدة الكود انتهت');
  end if;

  v_max := coalesce(nullif(promo->>'maxUses','')::integer,0);
  v_used := coalesce(nullif(promo->>'used','')::integer,0);
  if v_max > 0 and v_used >= v_max then
    return jsonb_build_object('ok',false,'message','الكود وصل للحد الأقصى للاستخدام');
  end if;

  v_per_customer := greatest(coalesce(nullif(promo->>'perCustomer','')::integer,1),1);
  select count(*) into v_customer_uses from public.promo_redemptions
    where code=v_code and coalesce(customer_phone,'')=coalesce(p_customer_phone,'');
  if coalesce(p_customer_phone,'') <> '' and v_customer_uses >= v_per_customer then
    return jsonb_build_object('ok',false,'message','تم استخدام الكود للعميل ده الحد المسموح');
  end if;

  v_min := coalesce(nullif(promo->>'minOrder','')::numeric,0);
  if coalesce(p_subtotal,0) < v_min then
    return jsonb_build_object('ok',false,'message','الحد الأدنى للطلب للكود هو '||v_min||' جنيه');
  end if;

  v_type := coalesce(promo->>'type','percent');
  v_value := coalesce(nullif(promo->>'value','')::numeric,0);
  if v_type='percent' then
    v_discount := round(coalesce(p_subtotal,0) * v_value / 100.0);
  else
    v_discount := least(coalesce(p_subtotal,0),v_value);
  end if;

  insert into public.promo_redemptions(code,order_number,customer_phone,subtotal,discount)
  values(v_code,p_order_number,p_customer_phone,p_subtotal,v_discount);

  promos := jsonb_set(promos, array[idx::text,'used'], to_jsonb(v_used+1), true);
  if v_max > 0 and v_used+1 >= v_max then
    promos := jsonb_set(promos, array[idx::text,'enabled'], 'false'::jsonb, true);
  end if;
  update public.store_data set data=promos,updated_at=now() where kind='promos';

  return jsonb_build_object('ok',true,'code',v_code,'discount',v_discount,'promoPercent',case when v_type='percent' then v_value else 0 end,'type',v_type,'value',v_value);
exception when unique_violation then
  return jsonb_build_object('ok',false,'message','الأوردر أو استخدام الكود اتسجل بالفعل');
end;
$$;

grant execute on function public.reserve_promo(text,numeric,text,text) to anon, authenticated;


-- ============================================================
-- V22 SAFE CENTRAL INVENTORY
-- Built ONLY for Girl Hub V22.
-- It never runs on page load and never replaces the catalog with
-- an empty array. It changes only stock/stockBySize when an order
-- is successfully created, inside the same database transaction.
-- ============================================================

create or replace function public.create_order_with_inventory_v22(
  p_order_number text,
  p_created_at timestamptz,
  p_payload jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  row_data jsonb;
  products jsonb;
  items jsonb;
  item jsonb;
  product jsonb;
  item_id text;
  item_size text;
  qty integer;
  pidx integer;
  stock_total numeric;
  stock_size numeric;
  new_payload jsonb;
  existing_order uuid;
begin
  if coalesce(trim(p_order_number),'') = '' then
    return jsonb_build_object('ok',false,'message','رقم الأوردر غير صالح');
  end if;
  if p_payload is null or jsonb_typeof(p_payload) <> 'object' then
    return jsonb_build_object('ok',false,'message','بيانات الأوردر غير صالحة');
  end if;

  -- Idempotency: the same order can never deduct stock twice.
  select id into existing_order from public.orders where order_number=p_order_number limit 1;
  if existing_order is not null then
    select data into row_data from public.store_data where kind='products';
    return jsonb_build_object('ok',true,'already_exists',true,'products',coalesce(row_data,'[]'::jsonb));
  end if;

  -- Lock ONLY the products row. No empty/default catalog is ever written.
  select data into row_data
  from public.store_data
  where kind='products'
  for update;

  if row_data is null or jsonb_typeof(row_data) <> 'array' or jsonb_array_length(row_data)=0 then
    return jsonb_build_object('ok',false,'message','كتالوج المنتجات غير متاح حاليًا');
  end if;

  products := row_data;
  items := coalesce(p_payload->'items','[]'::jsonb);
  if jsonb_typeof(items) <> 'array' or jsonb_array_length(items)=0 then
    return jsonb_build_object('ok',false,'message','الأوردر مفيهوش منتجات');
  end if;

  -- Validate every item BEFORE changing anything.
  for item in select value from jsonb_array_elements(items) loop
    item_id := trim(coalesce(item->>'id',''));
    item_size := trim(coalesce(item->>'size',''));
    qty := greatest(coalesce(nullif(item->>'qty','')::integer,0),0);
    if item_id='' or qty<=0 then
      return jsonb_build_object('ok',false,'message','بيانات أحد المنتجات غير صالحة');
    end if;

    pidx := null;
    for i in 0..jsonb_array_length(products)-1 loop
      product := products->i;
      if coalesce(product->>'id','') = item_id then pidx := i; exit; end if;
    end loop;
    if pidx is null then
      return jsonb_build_object('ok',false,'message','المنتج غير موجود: '||item_id);
    end if;

    if coalesce((product->>'available')::boolean,true)=false or coalesce((product->>'visible')::boolean,true)=false then
      return jsonb_build_object('ok',false,'message','المنتج غير متاح حاليًا');
    end if;

    if jsonb_typeof(product->'stockBySize')='object'
       and product->'stockBySize' <> '{}'::jsonb
       and item_size<>'' then
      stock_size := greatest(coalesce(nullif(product->'stockBySize'->>item_size,'')::numeric,0),0);
      if stock_size < qty then
        return jsonb_build_object('ok',false,'message','المخزون غير كافي للمنتج '||coalesce(product->>'name',item_id)||' مقاس '||item_size);
      end if;
    else
      stock_total := greatest(coalesce(nullif(product->>'stock','')::numeric,0),0);
      if stock_total < qty then
        return jsonb_build_object('ok',false,'message','المخزون غير كافي للمنتج '||coalesce(product->>'name',item_id));
      end if;
    end if;
  end loop;

  -- Deduct only the requested stock fields; every other product field is preserved.
  for item in select value from jsonb_array_elements(items) loop
    item_id := trim(coalesce(item->>'id',''));
    item_size := trim(coalesce(item->>'size',''));
    qty := greatest(coalesce(nullif(item->>'qty','')::integer,0),0);
    pidx := null;
    for i in 0..jsonb_array_length(products)-1 loop
      product := products->i;
      if coalesce(product->>'id','') = item_id then pidx := i; exit; end if;
    end loop;
    product := products->pidx;

    if jsonb_typeof(product->'stockBySize')='object' and item_size<>'' then
      stock_size := greatest(coalesce(nullif(product->'stockBySize'->>item_size,'')::numeric,0),0) - qty;
      product := jsonb_set(product, array['stockBySize',item_size], to_jsonb(greatest(stock_size,0)), true);
      select coalesce(sum(greatest(coalesce(nullif(value,'')::numeric,0),0)),0)
        into stock_total from jsonb_each_text(coalesce(product->'stockBySize','{}'::jsonb));
      product := jsonb_set(product, '{stock}', to_jsonb(stock_total), true);
    else
      stock_total := greatest(coalesce(nullif(product->>'stock','')::numeric,0),0) - qty;
      product := jsonb_set(product, '{stock}', to_jsonb(greatest(stock_total,0)), true);
    end if;
    products := jsonb_set(products, array[pidx::text], product, false);
  end loop;

  new_payload := p_payload || jsonb_build_object('inventoryState','deducted');

  insert into public.orders(order_number,created_at,status,paid,deleted,payload)
  values(p_order_number,coalesce(p_created_at,now()),'جديد',false,false,new_payload);

  update public.store_data
  set data=products,updated_at=now()
  where kind='products';

  return jsonb_build_object('ok',true,'order',p_order_number,'payload',new_payload,'products',products);
exception when unique_violation then
  select data into row_data from public.store_data where kind='products';
  return jsonb_build_object('ok',true,'already_exists',true,'products',coalesce(row_data,'[]'::jsonb));
end;
$$;

grant execute on function public.create_order_with_inventory_v22(text,timestamptz,jsonb) to anon, authenticated;

create or replace function public.update_order_status_with_inventory_v22(
  p_order_id uuid,
  p_status text
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  o public.orders%rowtype;
  row_data jsonb;
  products jsonb;
  item jsonb;
  product jsonb;
  item_id text;
  item_size text;
  qty integer;
  pidx integer;
  old_status text;
  stock_total numeric;
  stock_size numeric;
  should_restore boolean;
  should_deduct boolean;
begin
  if auth.uid() is null or not public.is_store_admin() then
    return jsonb_build_object('ok',false,'message','غير مصرح');
  end if;
  select * into o from public.orders where id=p_order_id for update;
  if not found then return jsonb_build_object('ok',false,'message','الأوردر غير موجود'); end if;
  old_status:=coalesce(o.status,'جديد');
  if old_status=p_status then return jsonb_build_object('ok',true,'products',(select data from public.store_data where kind='products')); end if;

  should_restore := old_status <> 'ملغي' and p_status='ملغي';
  should_deduct := old_status='ملغي' and p_status<>'ملغي';
  if should_restore or should_deduct then
    select data into row_data from public.store_data where kind='products' for update;
    if row_data is null or jsonb_typeof(row_data)<>'array' or jsonb_array_length(row_data)=0 then
      return jsonb_build_object('ok',false,'message','كتالوج المنتجات غير متاح حاليًا');
    end if;
    products:=row_data;
    for item in select value from jsonb_array_elements(coalesce(o.payload->'items','[]'::jsonb)) loop
      item_id:=trim(coalesce(item->>'id','')); item_size:=trim(coalesce(item->>'size','')); qty:=greatest(coalesce(nullif(item->>'qty','')::integer,0),0);
      pidx:=null;
      for i in 0..jsonb_array_length(products)-1 loop
        product:=products->i; if coalesce(product->>'id','')=item_id then pidx:=i; exit; end if;
      end loop;
      if pidx is null or qty<=0 then continue; end if;
      product:=products->pidx;
      if should_restore then
        if jsonb_typeof(product->'stockBySize')='object' and item_size<>'' then
          stock_size:=greatest(coalesce(nullif(product->'stockBySize'->>item_size,'')::numeric,0),0)+qty;
          product:=jsonb_set(product,array['stockBySize',item_size],to_jsonb(stock_size),true);
          select coalesce(sum(greatest(coalesce(nullif(value,'')::numeric,0),0)),0) into stock_total from jsonb_each_text(coalesce(product->'stockBySize','{}'::jsonb));
          product:=jsonb_set(product,'{stock}',to_jsonb(stock_total),true);
        else
          stock_total:=greatest(coalesce(nullif(product->>'stock','')::numeric,0),0)+qty;
          product:=jsonb_set(product,'{stock}',to_jsonb(stock_total),true);
        end if;
      else
        if jsonb_typeof(product->'stockBySize')='object' and item_size<>'' then
          stock_size:=greatest(coalesce(nullif(product->'stockBySize'->>item_size,'')::numeric,0),0);
          if stock_size<qty then return jsonb_build_object('ok',false,'message','المخزون غير كافي لإعادة تفعيل الأوردر'); end if;
          stock_size:=stock_size-qty;
          product:=jsonb_set(product,array['stockBySize',item_size],to_jsonb(stock_size),true);
          select coalesce(sum(greatest(coalesce(nullif(value,'')::numeric,0),0)),0) into stock_total from jsonb_each_text(coalesce(product->'stockBySize','{}'::jsonb));
          product:=jsonb_set(product,'{stock}',to_jsonb(stock_total),true);
        else
          stock_total:=greatest(coalesce(nullif(product->>'stock','')::numeric,0),0);
          if stock_total<qty then return jsonb_build_object('ok',false,'message','المخزون غير كافي لإعادة تفعيل الأوردر'); end if;
          product:=jsonb_set(product,'{stock}',to_jsonb(stock_total-qty),true);
        end if;
      end if;
      products:=jsonb_set(products,array[pidx::text],product,false);
    end loop;
    update public.store_data set data=products,updated_at=now() where kind='products';
  end if;

  update public.orders set status=p_status,payload=jsonb_set(coalesce(payload,'{}'::jsonb),'{status}',to_jsonb(p_status),true) where id=p_order_id;
  return jsonb_build_object('ok',true,'products',coalesce(products,row_data));
end;
$$;

grant execute on function public.update_order_status_with_inventory_v22(uuid,text) to authenticated;
