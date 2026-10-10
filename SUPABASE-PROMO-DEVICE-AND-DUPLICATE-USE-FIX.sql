-- Girl Hub promo duplicate-use protection (safe migration; does not modify orders/inventory)
-- Run this once in Supabase SQL Editor AFTER uploading the matching site ZIP.

alter table public.promo_redemptions
  add column if not exists device_id text;

create index if not exists promo_redemptions_code_phone_idx
  on public.promo_redemptions (code, customer_phone);
create index if not exists promo_redemptions_code_device_idx
  on public.promo_redemptions (code, device_id);

-- Remove public execution of the old 4-argument entry point so clients cannot bypass device checks.
revoke execute on function public.reserve_promo(text,numeric,text,text) from public, anon, authenticated;
drop function if exists public.reserve_promo(text,numeric,text,text);

create or replace function public.reserve_promo(
  p_code text,
  p_subtotal numeric,
  p_customer_phone text,
  p_order_number text,
  p_device_id text
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
  idx integer := 0;
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
  v_customer_uses integer := 0;
  v_device_uses integer := 0;
  v_phone text;
  v_device text;
begin
  if coalesce(trim(p_code),'') = '' then
    return jsonb_build_object('ok',true,'discount',0,'promoPercent',0,'code','');
  end if;

  -- Normalize Egyptian numbers so 01..., 20 1..., +20 1... are treated consistently.
  v_phone := regexp_replace(coalesce(p_customer_phone,''),'[^0-9]','','g');
  if left(v_phone,4) = '0020' then v_phone := '0' || substr(v_phone,5);
  elsif left(v_phone,2) = '20' and length(v_phone) >= 12 then v_phone := '0' || substr(v_phone,3);
  end if;
  v_device := nullif(trim(coalesce(p_device_id,'')), '');
  if v_device is null then
    return jsonb_build_object('ok',false,'message','تعذر التحقق من الجهاز. حدّثي الصفحة وجربي تاني');
  end if;

  -- Lock the promo row to serialize uses and avoid concurrent double-redemption.
  select data into row_data from public.store_data where kind='promos' for update;
  promos := coalesce(row_data, '[]'::jsonb);
  promo := null;
  idx := 0;
  for promo in select value from jsonb_array_elements(promos) loop
    if upper(coalesce(promo->>'code','')) = upper(trim(p_code)) then exit; end if;
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
  if v_starts is not null and current_date < v_starts then return jsonb_build_object('ok',false,'message','الكود لسه ما بدأش'); end if;
  if v_expires is not null and current_date > v_expires then return jsonb_build_object('ok',false,'message','مدة الكود انتهت'); end if;

  v_max := coalesce(nullif(promo->>'maxUses','')::integer,0);
  v_used := coalesce(nullif(promo->>'used','')::integer,0);
  if v_max > 0 and v_used >= v_max then return jsonb_build_object('ok',false,'message','الكود وصل للحد الأقصى للاستخدام'); end if;
  v_per_customer := greatest(coalesce(nullif(promo->>'perCustomer','')::integer,1),1);

  if v_phone <> '' then
    select count(*) into v_customer_uses from public.promo_redemptions r
      where r.code=v_code and regexp_replace(coalesce(r.customer_phone,''),'[^0-9]','','g') = v_phone;
    if v_customer_uses >= v_per_customer then
      return jsonb_build_object('ok',false,'message','تم استخدام الكود من رقم الموبايل ده قبل كده');
    end if;
  end if;
  select count(*) into v_device_uses from public.promo_redemptions r
    where r.code=v_code and r.device_id=v_device;
  if v_device_uses >= v_per_customer then
    return jsonb_build_object('ok',false,'message','تم استخدام الكود من نفس الجهاز/المتصفح قبل كده');
  end if;

  v_min := coalesce(nullif(promo->>'minOrder','')::numeric,0);
  if coalesce(p_subtotal,0) < v_min then return jsonb_build_object('ok',false,'message','الحد الأدنى للطلب للكود هو '||v_min||' جنيه'); end if;
  v_type := coalesce(promo->>'type','percent');
  v_value := coalesce(nullif(promo->>'value','')::numeric,0);
  if v_type='percent' then v_discount := round(coalesce(p_subtotal,0) * v_value / 100.0);
  else v_discount := least(coalesce(p_subtotal,0),v_value); end if;

  insert into public.promo_redemptions(code,order_number,customer_phone,device_id,subtotal,discount)
    values(v_code,p_order_number,v_phone,v_device,coalesce(p_subtotal,0),v_discount);
  promos := jsonb_set(promos, array[idx::text,'used'], to_jsonb(v_used+1), true);
  if v_max > 0 and v_used+1 >= v_max then promos := jsonb_set(promos, array[idx::text,'enabled'], 'false'::jsonb, true); end if;
  update public.store_data set data=promos,updated_at=now() where kind='promos';
  return jsonb_build_object('ok',true,'code',v_code,'discount',v_discount,'promoPercent',case when v_type='percent' then v_value else 0 end,'type',v_type,'value',v_value);
exception when unique_violation then
  return jsonb_build_object('ok',false,'message','الأوردر أو استخدام الكود اتسجل بالفعل');
end;
$$;

grant execute on function public.reserve_promo(text,numeric,text,text,text) to anon, authenticated;
