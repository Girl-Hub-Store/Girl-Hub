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
