-- Girl Hub: per-size/per-color stock migration. Run once in Supabase SQL Editor after backing up store_data/products.
-- Existing products without stockBySizeColor keep the original size-only behavior.
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
  item_color text;
  qty integer;
  pidx integer;
  stock_total numeric;
  stock_size numeric;
  stock_color numeric;
  colors_size jsonb;
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

    if jsonb_typeof(product->'stockBySizeColor')='object'
       and jsonb_typeof(product->'stockBySizeColor'->item_size)='object'
       and item_size<>'' then
      item_color := trim(coalesce(item->>'colorName',''));
      if item_color='' then return jsonb_build_object('ok',false,'message','لازم يتحدد لون المنتج قبل تأكيد الطلب'); end if;
      stock_color := greatest(coalesce(nullif(product->'stockBySizeColor'->item_size->>item_color,'')::numeric,0),0);
      if stock_color < qty then
        return jsonb_build_object('ok',false,'message','المخزون غير كافي للمنتج '||coalesce(product->>'name',item_id)||' مقاس '||item_size||' لون '||item_color);
      end if;
    elsif jsonb_typeof(product->'stockBySize')='object'
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

    if jsonb_typeof(product->'stockBySizeColor')='object'
       and jsonb_typeof(product->'stockBySizeColor'->item_size)='object'
       and item_size<>'' then
      item_color := trim(coalesce(item->>'colorName',''));
      stock_color := greatest(coalesce(nullif(product->'stockBySizeColor'->item_size->>item_color,'')::numeric,0),0) - qty;
      product := jsonb_set(product, array['stockBySizeColor',item_size,item_color], to_jsonb(greatest(stock_color,0)), true);
      colors_size := product->'stockBySizeColor'->item_size;
      select coalesce(sum(greatest(coalesce(nullif(value,'')::numeric,0),0)),0) into stock_size from jsonb_each_text(colors_size);
      product := jsonb_set(product, array['stockBySize',item_size], to_jsonb(stock_size), true);
      select coalesce(sum(greatest(coalesce(nullif(value,'')::numeric,0),0)),0)
        into stock_total from jsonb_each_text(coalesce(product->'stockBySize','{}'::jsonb));
      product := jsonb_set(product, '{stock}', to_jsonb(stock_total), true);
    elsif jsonb_typeof(product->'stockBySize')='object' and item_size<>'' then
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
  item_color text;
  qty integer;
  pidx integer;
  old_status text;
  stock_total numeric;
  stock_size numeric;
  stock_color numeric;
  colors_size jsonb;
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
      item_id:=trim(coalesce(item->>'id','')); item_size:=trim(coalesce(item->>'size','')); item_color:=trim(coalesce(item->>'colorName','')); qty:=greatest(coalesce(nullif(item->>'qty','')::integer,0),0);
      pidx:=null;
      for i in 0..jsonb_array_length(products)-1 loop
        product:=products->i; if coalesce(product->>'id','')=item_id then pidx:=i; exit; end if;
      end loop;
      if pidx is null or qty<=0 then continue; end if;
      product:=products->pidx;
      if should_restore then
        if jsonb_typeof(product->'stockBySizeColor')='object' and jsonb_typeof(product->'stockBySizeColor'->item_size)='object' and item_size<>'' and item_color<>'' then
          stock_color:=greatest(coalesce(nullif(product->'stockBySizeColor'->item_size->>item_color,'')::numeric,0),0)+qty;
          product:=jsonb_set(product,array['stockBySizeColor',item_size,item_color],to_jsonb(stock_color),true);
          colors_size:=product->'stockBySizeColor'->item_size;
          select coalesce(sum(greatest(coalesce(nullif(value,'')::numeric,0),0)),0) into stock_size from jsonb_each_text(colors_size);
          product:=jsonb_set(product,array['stockBySize',item_size],to_jsonb(stock_size),true);
          select coalesce(sum(greatest(coalesce(nullif(value,'')::numeric,0),0)),0) into stock_total from jsonb_each_text(coalesce(product->'stockBySize','{}'::jsonb));
          product:=jsonb_set(product,'{stock}',to_jsonb(stock_total),true);
        elsif jsonb_typeof(product->'stockBySize')='object' and item_size<>'' then
          stock_size:=greatest(coalesce(nullif(product->'stockBySize'->>item_size,'')::numeric,0),0)+qty;
          product:=jsonb_set(product,array['stockBySize',item_size],to_jsonb(stock_size),true);
          select coalesce(sum(greatest(coalesce(nullif(value,'')::numeric,0),0)),0) into stock_total from jsonb_each_text(coalesce(product->'stockBySize','{}'::jsonb));
          product:=jsonb_set(product,'{stock}',to_jsonb(stock_total),true);
        else
          stock_total:=greatest(coalesce(nullif(product->>'stock','')::numeric,0),0)+qty;
          product:=jsonb_set(product,'{stock}',to_jsonb(stock_total),true);
        end if;
      else
        if jsonb_typeof(product->'stockBySizeColor')='object' and jsonb_typeof(product->'stockBySizeColor'->item_size)='object' and item_size<>'' and item_color<>'' then
          stock_color:=greatest(coalesce(nullif(product->'stockBySizeColor'->item_size->>item_color,'')::numeric,0),0);
          if stock_color<qty then return jsonb_build_object('ok',false,'message','المخزون غير كافي لإعادة تفعيل الأوردر'); end if;
          stock_color:=stock_color-qty;
          product:=jsonb_set(product,array['stockBySizeColor',item_size,item_color],to_jsonb(stock_color),true);
          colors_size:=product->'stockBySizeColor'->item_size;
          select coalesce(sum(greatest(coalesce(nullif(value,'')::numeric,0),0)),0) into stock_size from jsonb_each_text(colors_size);
          product:=jsonb_set(product,array['stockBySize',item_size],to_jsonb(stock_size),true);
          select coalesce(sum(greatest(coalesce(nullif(value,'')::numeric,0),0)),0) into stock_total from jsonb_each_text(coalesce(product->'stockBySize','{}'::jsonb));
          product:=jsonb_set(product,'{stock}',to_jsonb(stock_total),true);
        elsif jsonb_typeof(product->'stockBySize')='object' and item_size<>'' then
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
