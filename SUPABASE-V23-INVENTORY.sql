-- Central inventory reservation: atomically checks and deducts every ordered size
-- before the public order is created. This makes stock interactive across devices
-- and prevents two customers from buying the last piece at the same time.
create or replace function public.create_order_with_inventory(
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
  i integer;
  v_item jsonb;
begin
  if coalesce(trim(p_order_number),'') = '' then
    return jsonb_build_object('ok',false,'message','رقم الأوردر غير صحيح');
  end if;

  if not jsonb_typeof(coalesce(p_payload->'items','null'::jsonb)) = 'array' then
    return jsonb_build_object('ok',false,'message','تفاصيل المنتجات غير صحيحة');
  end if;

  select data into row_data
  from public.store_data
  where kind='products'
  for update;

  if row_data is null or jsonb_typeof(row_data) <> 'array' then
    return jsonb_build_object('ok',false,'message','مخزون المتجر غير متاح حاليًا');
  end if;

  products := row_data;
  items := p_payload->'items';

  -- First pass: validate every requested variant before changing anything.
  for item in select value from jsonb_array_elements(items) loop
    item_id := coalesce(item->>'id','');
    item_size := trim(coalesce(item->>'size',''));
    qty := greatest(coalesce(nullif(item->>'qty','')::integer,0),0);
    if qty <= 0 then
      continue;
    end if;

    pidx := -1;
    i := 0;
    for v_item in select value from jsonb_array_elements(products) loop
      if coalesce(v_item->>'id','') = item_id then
        pidx := i;
        product := v_item;
        exit;
      end if;
      i := i + 1;
    end loop;

    if pidx < 0 then
      return jsonb_build_object('ok',false,'message','أحد المنتجات لم يعد موجودًا');
    end if;

    if jsonb_typeof(product->'stockBySize') = 'object'
       and jsonb_object_length(product->'stockBySize') > 0
       and item_size <> '' then
      stock_size := greatest(coalesce(nullif(product->'stockBySize'->>item_size,'')::numeric,0),0);
      if stock_size < qty then
        return jsonb_build_object('ok',false,'message','المخزون غير كافي للمقاس '||item_size,'productId',item_id,'size',item_size,'available',stock_size);
      end if;
    else
      stock_total := greatest(coalesce(nullif(product->>'stock','')::numeric,0),0);
      if stock_total < qty then
        return jsonb_build_object('ok',false,'message','المخزون غير كافي لهذا المنتج','productId',item_id,'available',stock_total);
      end if;
    end if;
  end loop;

  -- Second pass: deduct the validated quantities.
  for item in select value from jsonb_array_elements(items) loop
    item_id := coalesce(item->>'id','');
    item_size := trim(coalesce(item->>'size',''));
    qty := greatest(coalesce(nullif(item->>'qty','')::integer,0),0);
    if qty <= 0 then continue; end if;

    pidx := -1;
    i := 0;
    for v_item in select value from jsonb_array_elements(products) loop
      if coalesce(v_item->>'id','') = item_id then
        pidx := i;
        product := v_item;
        exit;
      end if;
      i := i + 1;
    end loop;

    if jsonb_typeof(product->'stockBySize') = 'object'
       and jsonb_object_length(product->'stockBySize') > 0
       and item_size <> '' then
      stock_size := greatest(coalesce(nullif(product->'stockBySize'->>item_size,'')::numeric,0),0) - qty;
      product := jsonb_set(product, ARRAY['stockBySize',item_size], to_jsonb(greatest(stock_size,0)), true);
      select coalesce(sum(greatest(coalesce(nullif(value #>> '{}','')::numeric,0),0)),0)
        into stock_total
        from jsonb_each(coalesce(product->'stockBySize','{}'::jsonb));
      product := jsonb_set(product, '{stock}', to_jsonb(stock_total), true);
    else
      stock_total := greatest(coalesce(nullif(product->>'stock','')::numeric,0),0) - qty;
      product := jsonb_set(product, '{stock}', to_jsonb(greatest(stock_total,0)), true);
    end if;

    products := jsonb_set(products, ARRAY[pidx::text], product, false);
  end loop;

  new_payload := jsonb_set(coalesce(p_payload,'{}'::jsonb), '{inventoryState}', '"deducted"'::jsonb, true);

  insert into public.orders(order_number,created_at,status,paid,deleted,payload)
  values(p_order_number,coalesce(p_created_at,now()),'جديد',false,false,new_payload);

  update public.store_data
  set data=products,updated_at=now()
  where kind='products';

  return jsonb_build_object('ok',true,'order',p_order_number,'payload',new_payload,'products',products);
exception
  when unique_violation then
    return jsonb_build_object('ok',false,'message','الأوردر اتسجل بالفعل');
end;
$$;

grant execute on function public.create_order_with_inventory(text,timestamptz,jsonb) to anon, authenticated;


