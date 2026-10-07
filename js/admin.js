(()=>{'use strict';
const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const KEYS={products:'gh_admin_products_v1',orders:'gh_admin_orders_v1',promos:'gh_admin_promos_v1',categories:'gh_admin_categories_v1',banners:'gh_admin_banners_v1',settings:'gh_admin_settings_v1',pass:'gh_admin_password_v1',backend:'gh_admin_backend_v1',activity:'gh_admin_activity_v1'};
const normalizeColors=colors=>{if(Array.isArray(colors))return colors.map((c,i)=>typeof c==='string'?{name:c,hex:['#e8a2b8','#ead7ae','#5b4038','#111111','#ffffff'][i%5]}:{name:c.name||c.label||`لون ${i+1}`,hex:c.hex||c.color||'#e8a2b8'});if(typeof colors==='string')return colors.split(',').map((x,i)=>({name:x.trim(),hex:['#e8a2b8','#ead7ae','#5b4038','#111111','#ffffff'][i%5]})).filter(x=>x.name);return [{name:'وردي',hex:'#e8a2b8'},{name:'بيج',hex:'#ead7ae'},{name:'أسود',hex:'#111111'}]};
const seedProducts=()=>typeof PRODUCTS!=='undefined'&&Array.isArray(PRODUCTS)?PRODUCTS.map(p=>({...p,stock:Number(p.stock??10),visible:p.visible!==false, sizes:p.sizes||'S, M, L, XL',colors:normalizeColors(p.colors),offer:p.offer!==false&&(p.old>p.price)})):[];
const defaultCategories=[{id:'clothes',name:'الملابس',type:'clothes',enabled:true,message:'SOON',icon:'♧'},{id:'accessories',name:'الإكسسوارات',type:'accessories',enabled:true,message:'SOON',icon:'◇'},{id:'offers',name:'العروض والخصومات',type:'offers',enabled:true,message:'العروض قريبًا',icon:'％'},{id:'new',name:'وصل حديثًا',type:'new',enabled:true,message:'SOON',icon:'✦'}];
const defaultCategoryTiles=[{id:'chains',group:'accessories',name:'سلاسل',type:'chains',subtitle:'اختاري من مجموعة متنوعة من السلاسل الراقية',img:'assets/images/necklace.jpg',enabled:true},{id:'rings',group:'accessories',name:'خواتم',type:'rings',subtitle:'تفاصيل دقيقة تمنح إطلالتك لمسة فريدة',img:'assets/images/category-rings.svg',enabled:true},{id:'bracelets',group:'accessories',name:'أساور',type:'bracelets',subtitle:'اختاري من التصاميم البسيطة أو المزخرفة',img:'assets/images/category-bracelets.svg',enabled:true},{id:'watches',group:'accessories',name:'ساعات',type:'watches',subtitle:'اختاري ساعة تناسب أسلوبك اليومي',img:'assets/images/watch.jpg',enabled:true},{id:'bags',group:'accessories',name:'شنط',type:'bags',subtitle:'اختاري حقيبة تناسب كل مناسبة',img:'assets/images/black-bag.jpg',enabled:true},{id:'sunglasses',group:'accessories',name:'نظارات',type:'sunglasses',subtitle:'اختاري نظارات شمسية عصرية ومميزة',img:'assets/images/category-sunglasses.svg',enabled:true},{id:'shirts',group:'clothes',name:'قمصان',type:'shirts',subtitle:'قمصان بتصاميم مختلفة لكل إطلالة',img:'assets/images/black-shirt.jpg',enabled:true},{id:'dresses',group:'clothes',name:'فساتين',type:'dresses',subtitle:'فساتين أنيقة للمناسبات واليوميات',img:'assets/images/dress.jpg',enabled:true},{id:'pants',group:'clothes',name:'بناطيل',type:'pants',subtitle:'بناطيل عملية وأنيقة',img:'assets/images/pants.jpg',enabled:true}];
const defaultPaymentMethods=[{value:'الدفع عند الاستلام',label:'الدفع عند الاستلام',enabled:true},{value:'كاش',label:'كاش',enabled:true},{value:'انستا باي',label:'انستا باي',enabled:true}];
const defaultPromos=[{id:1,code:'GIRL10',type:'percent',value:10,startsAt:'2026-01-01',expiresAt:'2027-12-31',maxUses:100,used:0,perCustomer:1,minOrder:0,enabled:true},{id:2,code:'WELCOME50',type:'fixed',value:50,startsAt:'2026-01-01',expiresAt:'2027-12-31',maxUses:50,used:0,perCustomer:1,minOrder:0,enabled:true}];
const defaultBanners=[{id:1,title:'الجديد من Girl Hub',subtitle:'تألقي بتشكيلتنا الجديدة',img:'assets/images/hero.jpg',button:'تسوقي الآن',url:'new-products.html',enabled:true},{id:2,title:'أناقة مختلفة كل يوم',subtitle:'اختاري القطعة اللي شبهك',img:'assets/images/hero2.jpg',button:'اكتشفي الجديد',url:'clothes.html',enabled:true},{id:3,title:'تفاصيل تكمل إطلالتك',subtitle:'إكسسوارات مختارة بعناية',img:'assets/images/hero3.svg',button:'تصفحي الإكسسوارات',url:'accessories.html',enabled:true}];
let data={products:[],orders:[],promos:[],categories:[],banners:[],settings:{},backend:{url:'',key:''}};
const read=(key,fallback)=>{try{let v=JSON.parse(localStorage.getItem(key));return v??fallback}catch{return fallback}};
const save=(key,val)=>localStorage.setItem(KEYS[key],JSON.stringify(val));
const sb=()=>window.GH_SUPABASE_READY&&window.GH_SB?window.GH_SB:null;
const adminAllowed=async()=>{const c=sb();if(!c)return false;const {data:{user},error}=await c.auth.getUser();if(error||!user)return false;const {data:member,error:e}=await c.from('admin_users').select('user_id,role,active').eq('user_id',user.id).eq('active',true).maybeSingle();return !!member&&!e;};
async function uploadImage(file){const c=sb();if(!c||!file)throw new Error('Supabase غير مضبوط أو لم تختاري صورة');if(!file.type.startsWith('image/'))throw new Error('اختاري ملف صورة فقط');if(file.size>8*1024*1024)throw new Error('حجم الصورة يجب أن يكون أقل من 8 ميجابايت');const ext=(file.name.split('.').pop()||'jpg').toLowerCase().replace(/[^a-z0-9]/g,'')||'jpg';const path=`${Date.now()}-${Math.random().toString(36).slice(2,9)}.${ext}`;const {error}=await c.storage.from('store-images').upload(path,file,{cacheControl:'3600',upsert:false,contentType:file.type});if(error)throw error;const {data}=c.storage.from('store-images').getPublicUrl(path);return data.publicUrl;}
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const money=n=>`${Number(n||0).toLocaleString('en-US')} ج.م`;
const dateText=s=>{if(!s)return '—';let d=new Date(s);return isNaN(d)?esc(s):d.toLocaleString('ar-EG',{dateStyle:'short',timeStyle:'short'})};
const toast=m=>{let t=$('#toast');t.textContent=m;t.classList.add('show');clearTimeout(window.__ght);window.__ght=setTimeout(()=>t.classList.remove('show'),2600)};
const activity=(action,detail)=>{let a=read('activity',[]);a.unshift({at:new Date().toISOString(),action,detail});save('activity',a.slice(0,200))};
const syncProductsToStore=()=>{try{localStorage.setItem('girlhub_admin_products',JSON.stringify(data.products))}catch{}};
const api=async(action,payload={})=>{if(!data.backend.url||!data.backend.key)return {ok:false,local:true};try{const r=await fetch(data.backend.url,{method:'POST',headers:{'Content-Type':'text/plain;charset=utf-8'},body:JSON.stringify({action,adminKey:data.backend.key,...payload})});return await r.json()}catch(e){return {ok:false,error:String(e)}}};
async function backendGet(action){if(!data.backend.url||!data.backend.key)return null;try{let u=new URL(data.backend.url);u.searchParams.set('action',action);u.searchParams.set('adminKey',data.backend.key);let r=await fetch(u);return await r.json()}catch{return null}}
async function persist(kind){
save(kind,data[kind]);
const c=sb();
if(c){
 try{
  if(kind==='orders'){
   for(const o of data.orders){
    const payload={...o};
    delete payload.supabaseId;
    const row={order_number:String(o.order),status:o.status||'جديد',paid:!!o.paid,deleted:!!o.deleted,created_at:o.createdAt||new Date().toISOString(),payload};
    if(o.supabaseId){
     const {error}=await c.from('orders').update(row).eq('id',o.supabaseId);
     if(error)throw error;
    }else{
     const {data:inserted,error}=await c.from('orders').upsert(row,{onConflict:'order_number'}).select('id').single();
     if(error)throw error;
     if(inserted?.id)o.supabaseId=inserted.id;
    }
   }
   save('orders',data.orders);
  }else{
   const {error}=await c.from('store_data').upsert({kind:kind,data:data[kind],updated_at:new Date().toISOString()},{onConflict:'kind'});
   if(error)throw error;
  }
  $('#backendNotice').textContent='متصل بـ Supabase — تم حفظ التغييرات أونلاين.';
  $('#backendNotice').classList.add('connected');
  return;
 }catch(error){console.error(error);toast('تعذر الحفظ على Supabase: '+error.message);return;}
}
if(data.backend.url&&data.backend.key)api('saveData',{kind,value:data[kind]}).then(r=>{if(!r.ok&&!r.local)toast('تعذر المزامنة مع الخلفية؛ التغييرات محفوظة محليًا')});}
const statusClass=s=>({'جديد':'pink','قيد التجهيز':'orange','تم الشحن':'orange','تم التسليم':'green','ملغي':'red'}[s]||'');
function normalizeOrder(o,i){return {...o,order:o.order||o.id||`GH-${String(i+1).padStart(5,'0')}`,createdAt:o.createdAt||o.date||new Date().toISOString(),customer:o.customer||{name:o.name||o.customerName,phone:o.phone,governorate:o.governorate,address:o.address,payment:o.payment},total:Number(o.total||0),status:o.status||'جديد',paid:!!o.paid,items:o.items||[],deleted:!!o.deleted};}

// Inventory sync starts with orders created after this release so existing stock is not double-deducted.
const INVENTORY_SYNC_FROM='2026-10-07T00:00:00+03:00';
function reconcileOrderInventory(o){
  if(!o||!Array.isArray(o.items)||!o.items.length)return false;
  if(new Date(o.createdAt)<new Date(INVENTORY_SYNC_FROM))return false;
  const state=o.inventoryState||'none';
  const canceled=o.status==='ملغي';
  if(!canceled && state==='deducted')return false;
  if(canceled && state!=='deducted')return false;
  const direction=canceled?1:-1;
  let changed=false;
  for(const item of o.items){
    const product=data.products.find(p=>Number(p.id)===Number(item.id));
    const qty=Math.max(0,Number(item.qty||0));
    if(!product||!qty)continue;
    const before=Number(product.stock||0);
    product.stock=Math.max(0,before+(direction*qty));
    if(product.stock!==before)changed=true;
  }
  o.inventoryState=canceled?'restored':'deducted';
  return changed;
}
async function syncInventoryFromOrders(){
  let productsChanged=false,ordersChanged=false;
  for(const o of data.orders){
    const before=o.inventoryState||'none';
    if(reconcileOrderInventory(o)){productsChanged=true;ordersChanged=true;}
    if(before!==o.inventoryState)ordersChanged=true;
  }
  if(productsChanged){syncProductsToStore();await persist('products');}
  if(ordersChanged)await persist('orders');
  return {productsChanged,ordersChanged};
}
function init(){
data.products=read('products',seedProducts());data.orders=read('orders',[]).map(normalizeOrder);data.promos=read('promos',defaultPromos);data.categories=read('categories',defaultCategories);data.banners=read('banners',defaultBanners);data.settings=read('settings',{storeName:'Girl Hub',whatsapp:'201279860213',shipping:50,shippingByGovernorate:{},minimum:0,announcement:'عروض مميزة لكل يوم ✨',announcementEnabled:true,categoryTiles:defaultCategoryTiles,paymentMethods:defaultPaymentMethods,orderDiscountEnabled:false,orderDiscountMin:0,orderDiscountType:'percent',orderDiscountValue:0,orderDiscountPercent:0,freeShippingMin:0,socialLinks:{instagram:'https://www.instagram.com/girl_hub.gh?stkn=MWRkdGl4OGZ2dW5hYg==',facebook:'',tiktok:'https://www.tiktok.com/@girl.hub21?is_from_webapp=1&sender_device=pc',whatsapp:'https://chat.whatsapp.com/KddbvTR3t7h7am8utFqufA?mode=wwt&utm_source=ig&utm_medium=social&utm_content=link_in_bio&fbclid=PAdGRleAUfnOhwZG9mAmZkaWQWUO7RNK2dDAsek2Nqx7L5ocn9f15ijmV4g4D4DYWVtAjExAHNydGMGYXBwX2lkDzEyNDAyNDU3NDI4NzQxNAABpwRUv5Ft_xYJ88VnKRo1eBglYrhMq__wOM8lETQP56IEx6SSwwP9T671zy0d_aem_R09L8hRhdFI-nruHdQwtcA'},pageMeta:{}});
data.settings.categoryTiles=Array.isArray(data.settings.categoryTiles)&&data.settings.categoryTiles.length?data.settings.categoryTiles:defaultCategoryTiles;
data.settings.socialLinks=data.settings.socialLinks||{};
data.settings.socialLinks.instagram=data.settings.socialLinks.instagram||'https://www.instagram.com/girl_hub.gh?stkn=MWRkdGl4OGZ2dW5hYg==';
data.settings.socialLinks.tiktok=data.settings.socialLinks.tiktok||'https://www.tiktok.com/@girl.hub21?is_from_webapp=1&sender_device=pc';
data.settings.socialLinks.whatsapp=data.settings.socialLinks.whatsapp||'https://chat.whatsapp.com/KddbvTR3t7h7am8utFqufA?mode=wwt&utm_source=ig&utm_medium=social&utm_content=link_in_bio&fbclid=PAdGRleAUfnOhwZG9mAmZkaWQWUO7RNK2dDAsek2Nqx7L5ocn9f15ijmV4g4D4DYWVtAjExAHNydGMGYXBwX2lkDzEyNDAyNDU3NDI4NzQxNAABpwRUv5Ft_xYJ88VnKRo1eBglYrhMq__wOM8lETQP56IEx6SSwwP9T671zy0d_aem_R09L8hRhdFI-nruHdQwtcA';

// Migrate older settings: add missing clothes tiles and infer their group.
const tileById=new Map(data.settings.categoryTiles.map(x=>[x.id,x]));
defaultCategoryTiles.forEach(def=>{if(!tileById.has(def.id))data.settings.categoryTiles.push({...def});});
data.settings.categoryTiles=data.settings.categoryTiles.map(x=>({...x,group:x.group||(String(x.type||x.id).match(/^(shirts|dresses|pants)$/i)?'clothes':'accessories')}));
data.settings.paymentMethods=Array.isArray(data.settings.paymentMethods)&&data.settings.paymentMethods.length?data.settings.paymentMethods:defaultPaymentMethods;data.backend=read('backend',{url:'',key:''});
$('#backendUrl').value=data.backend.url||'';$('#backendKey').value=data.backend.key||'';if(sb()){$('#loginHint').textContent='استخدمي البريد وكلمة المرور لحساب مضاف إلى قائمة مديري المتجر في Supabase.';$('#adminEmail').required=true;}else{$('#loginHint').textContent='للتجربة المحلية فقط: GH-admin-2026. لا ترفعي الموقع قبل إعداد Supabase.';}
const logged=localStorage.getItem('gh_admin_session')==='supabase'||sessionStorage.getItem('gh_admin_session')==='yes'||sessionStorage.getItem('gh_admin_session')==='supabase';if(logged){if(sb())adminAllowed().then(ok=>ok?showApp():(localStorage.removeItem('gh_admin_session'),sessionStorage.removeItem('gh_admin_session'),$('#login').hidden=false));else showApp();}if(sb())sb().auth.onAuthStateChange((_event,session)=>{if(session?.user)adminAllowed().then(ok=>{if(ok)showApp()});});
$('#loginForm').addEventListener('submit',async e=>{
  e.preventDefault();

  const email=($('#adminEmail')?.value||'').trim();
  const password=$('#adminPassword').value;
  const c=sb();

  if(!c){
    $('#loginError').textContent='Supabase غير متصل. تأكدي من إعداد js/supabase-config.js.';
    return;
  }

  if(!email||!password){
    $('#loginError').textContent='اكتبي البريد الإلكتروني وكلمة المرور.';
    return;
  }

  $('#loginError').textContent='جاري تسجيل الدخول...';

  try{

    // تسجيل الدخول الحقيقي من Supabase Auth
    const {data,error}=await c.auth.signInWithPassword({
      email:email,
      password:password
    });

    if(error) throw error;

    if(!data?.user){
      throw new Error('لم يتم العثور على حساب بعد تسجيل الدخول.');
    }

    // التأكد أن الحساب مدير للمتجر
    const {data:member,error:memberError}=await c
      .from('admin_users')
      .select('user_id,role,active')
      .eq('user_id',data.user.id)
      .eq('active',true)
      .maybeSingle();

    if(memberError){
      throw new Error(
        'تعذر التحقق من صلاحيات المدير: '+memberError.message
      );
    }

    if(!member){

      await c.auth.signOut();

      throw new Error(
        'هذا الحساب غير مضاف كمدير للمتجر في Supabase.'
      );
    }

    // حفظ حالة الدخول فقط، وليس كلمة المرور
    sessionStorage.setItem('gh_admin_session','supabase');
    localStorage.setItem('gh_admin_session','supabase');

    $('#loginError').textContent='';

    showApp();

  }catch(err){

    console.error('Admin login error:',err);

    $('#loginError').textContent=
      err?.message || 'تعذر تسجيل الدخول.';
  }
});
$('#logoutBtn').onclick=async()=>{sessionStorage.removeItem('gh_admin_session');localStorage.removeItem('gh_admin_session');if(sb())await sb().auth.signOut();location.reload()};
$('#nav').addEventListener('click',e=>{let b=e.target.closest('[data-tab]');if(b)openTab(b.dataset.tab)});
$$('[data-goto]').forEach(b=>b.addEventListener('click',()=>openTab(b.dataset.goto)));
$('#refreshBtn').onclick=()=>refreshAll();$('#reloadOrders').onclick=loadOrders;$('#orderSearch').oninput=renderOrders;['dateFrom','dateTo','govFilter','statusFilter'].forEach(id=>$('#'+id).addEventListener('change',renderOrders));$('#clearFilters').onclick=()=>{['orderSearch','dateFrom','dateTo','govFilter','statusFilter'].forEach(id=>$('#'+id).value='');renderOrders()};
$('#exportOrders').onclick=exportOrders;$('#addProduct').onclick=()=>productModal();$('#productSearch').oninput=renderProducts;$('#productTypeFilter').onchange=renderProducts;$('#productVisibility').onchange=renderProducts;
$('#addCategory').onclick=()=>categoryModal();$('#addCategoryTile').onclick=()=>categoryTileModal();$('#addPromo').onclick=()=>promoModal();$('#addBanner').onclick=()=>bannerModal();
$('#storeSettings').addEventListener('submit',e=>{e.preventDefault();let f=new FormData(e.currentTarget);data.settings={...data.settings,storeName:f.get('storeName'),whatsapp:f.get('whatsapp'),shipping:Number(f.get('shipping')),shippingByGovernorate:{...(data.settings.shippingByGovernorate||{})},minimum:Number(f.get('minimum')),announcement:f.get('announcement'),announcementEnabled:f.has('announcementEnabled'),orderDiscountEnabled:f.has('orderDiscountEnabled'),orderDiscountMin:Number(f.get('orderDiscountMin')||0),orderDiscountType:f.get('orderDiscountType')||'percent',orderDiscountValue:Number(f.get('orderDiscountValue')||0),orderDiscountPercent:Number(f.get('orderDiscountValue')||0),freeShippingMin:Number(f.get('freeShippingMin')||0),socialLinks:{instagram:f.get('instagram')||'',facebook:f.get('facebook')||'',tiktok:f.get('tiktok')||'',whatsapp:f.get('socialWhatsapp')||''},pageMeta:{homeTitle:f.get('homeTitle')||'الرئيسية',homeCaption:f.get('homeCaption')||'',clothesTitle:f.get('clothesTitle')||'ملابس',clothesCaption:f.get('clothesCaption')||'',accessoriesTitle:f.get('accessoriesTitle')||'اكسسوارات',accessoriesCaption:f.get('accessoriesCaption')||'',offersTitle:f.get('offersTitle')||'العروض والخصومات',offersCaption:f.get('offersCaption')||'',newTitle:f.get('newTitle')||'وصل حديثًا',newCaption:f.get('newCaption')||'',searchTitle:f.get('searchTitle')||'البحث',searchCaption:f.get('searchCaption')||'',wishlistTitle:f.get('wishlistTitle')||'المفضلة',wishlistCaption:f.get('wishlistCaption')||''}};persist('settings');activity('تعديل إعدادات المتجر','إعدادات عامة');toast('تم حفظ الإعدادات');renderShippingSettings();});
$('#passwordForm').addEventListener('submit',async e=>{
  e.preventDefault();

  const f=new FormData(e.currentTarget);

  const oldPassword=String(
    f.get('oldPassword')||''
  );

  const newPassword=String(
    f.get('newPassword')||''
  );

  const confirmPassword=String(
    f.get('confirmPassword')||''
  );

  const c=sb();

  if(!c){
    $('#passwordMessage').textContent=
      'Supabase غير متصل.';
    return;
  }

  if(newPassword!==confirmPassword){
    $('#passwordMessage').textContent=
      'تأكيد كلمة المرور غير مطابق';
    return;
  }

  if(newPassword.length<6){
    $('#passwordMessage').textContent=
      'كلمة المرور الجديدة يجب أن تكون 6 أحرف على الأقل';
    return;
  }

  try{

    // معرفة الحساب الحالي
    const {
      data:{user},
      error:getUserError
    }=await c.auth.getUser();

    if(getUserError||!user){
      throw new Error(
        'يجب تسجيل الدخول أولًا.'
      );
    }

    // التأكد من الباسورد القديم عن طريق Supabase
    const {
      error:signError
    }=await c.auth.signInWithPassword({
      email:user.email,
      password:oldPassword
    });

    if(signError){
      throw new Error(
        'كلمة المرور الحالية غير صحيحة'
      );
    }

    // تغيير الباسورد داخل Supabase Auth
    const {
      error:updateError
    }=await c.auth.updateUser({
      password:newPassword
    });

    if(updateError){
      throw updateError;
    }

    // حذف أي باسورد قديم مخزن محليًا
    localStorage.removeItem(KEYS.pass);

    $('#passwordMessage').textContent=
      'تم تغيير كلمة المرور في Supabase بنجاح';

    e.currentTarget.reset();

    toast('تم تغيير كلمة المرور');

  }catch(err){

    console.error(err);

    $('#passwordMessage').textContent=
      err?.message ||
      'تعذر تغيير كلمة المرور';
  }
});
$('#saveBackend').onclick=async()=>{data.backend={url:$('#backendUrl').value.trim(),key:$('#backendKey').value.trim()};save('backend',data.backend);let r=await backendGet('ping');$('#backendMessage').textContent=sb()?'Supabase مضبوط في ملف الإعدادات؛ سجّلي الخروج ثم الدخول بحساب مصرح له.':(r?.ok?'تم الاتصال بالخلفية القديمة':(data.backend.url?'لم يتم التحقق من الاتصال. تأكدي من رابط Code.gs.':'أكملي إعداد Supabase في js/supabase-config.js.')); if(r?.ok){$('#backendNotice').textContent='متصل بالخلفية المركزية. ستتم مزامنة التغييرات مع قاعدة بيانات المتجر.';$('#backendNotice').classList.add('connected');loadOrders()}};
$('#backupBtn').onclick=backup;$('#restoreInput').onchange=restore;
renderAll();fillSettings();loadRemoteData();loadOrders();window.__ghOrdersTimer=setInterval(()=>{if(!document.hidden)loadOrders()},20000);
}
function showApp(){$('#login').hidden=true;$('#app').hidden=false;renderAll();loadRemoteData()}
async function loadRemoteData(){
 const c=sb();
 if(c){
  const ok=await adminAllowed();
  if(!ok){$('#backendNotice').textContent='سجّلي الدخول بحساب مضاف إلى قائمة مديري المتجر في Supabase.';return;}
  const {data:rows,error}=await c.from('store_data').select('kind,data');
  if(error){console.error(error);$('#backendNotice').textContent='فشل تحميل بيانات Supabase: '+error.message;return;}
  const remoteKinds=new Set((rows||[]).map(row=>row.kind));
  for(const row of rows||[])if(['products','promos','categories','banners','settings'].includes(row.kind)){data[row.kind]=row.data;save(row.kind,data[row.kind]);}
  // Keep category tile controls complete even when an older remote settings object is loaded.
  data.settings=data.settings||{};
  const remoteTiles=Array.isArray(data.settings.categoryTiles)?data.settings.categoryTiles:[];
  const remoteMap=new Map(remoteTiles.map(x=>[x.id,x]));
  defaultCategoryTiles.forEach(def=>{if(!remoteMap.has(def.id))remoteTiles.push({...def});});
  data.settings.categoryTiles=remoteTiles.map(x=>({...x,group:x.group||(String(x.type||x.id).match(/^(shirts|dresses|pants)$/i)?'clothes':'accessories')}));
  if(!remoteKinds.has('settings') || remoteTiles.length!==((rows||[]).find(r=>r.kind==='settings')?.data?.categoryTiles||[]).length){await c.from('store_data').upsert({kind:'settings',data:data.settings,updated_at:new Date().toISOString()},{onConflict:'kind'});}
  const initialRows=['products','promos','categories','banners','settings'].filter(kind=>!remoteKinds.has(kind)).map(kind=>({kind:kind,data:data[kind],updated_at:new Date().toISOString()}));
  if(initialRows.length){const {error:seedError}=await c.from('store_data').upsert(initialRows,{onConflict:'kind'});if(seedError){console.error(seedError);$('#backendNotice').textContent='تعذر تهيئة البيانات في Supabase: '+seedError.message;return;}}
  syncProductsToStore();renderAll();fillSettings();
  $('#backendNotice').textContent='متصل بـ Supabase — التعديلات تُحفظ مركزيًا وتظهر على الأجهزة الأخرى.';$('#backendNotice').classList.add('connected');
  for(const k of ['products','promos','categories','banners','settings'])try{localStorage.setItem('girlhub_remote_'+k,JSON.stringify(data[k]))}catch(_){}
  document.dispatchEvent(new CustomEvent('girlhub:data-updated',{detail:{products:data.products,promos:data.promos,categories:data.categories,banners:data.banners,settings:data.settings}}));
  return;
 }
 const r=await backendGet('getData');
 if(!r?.ok){$('#backendNotice').textContent='وضع محلي: التعديلات لا تتزامن بين الأجهزة حتى يتم إعداد Supabase.';return;}
 ['products','promos','categories','banners'].forEach(k=>{if(Array.isArray(r[k])&&r[k].length){data[k]=r[k];save(k,data[k]);}});
 if(r.settings&&typeof r.settings==='object'&&Object.keys(r.settings).length){data.settings=r.settings;save('settings',data.settings);}
 syncProductsToStore();renderAll();fillSettings();$('#backendNotice').textContent='متصل بالخلفية القديمة.';$('#backendNotice').classList.add('connected');
}
function openTab(tab){$$('.panel').forEach(p=>p.classList.toggle('active',p.id==='tab-'+tab));$$('.nav-item').forEach(b=>b.classList.toggle('active',b.dataset.tab===tab));let titles={overview:'نظرة عامة',orders:'إدارة الأوردرات',products:'المنتجات والمخزون',categories:'الأقسام والصفحات',promos:'الخصومات والأكواد',hero:'الهيرو والبنرات',settings:'إعدادات المتجر'};$('#pageTitle').textContent=titles[tab]||'لوحة التحكم';if(tab==='orders')renderOrders();if(tab==='products')renderProducts()}
function renderAll(){renderOverview();renderOrders();renderProducts();renderCategories();renderPromos();renderBanners();fillSettings()}
function refreshAll(){renderAll();loadOrders();toast('تم تحديث البيانات')}
function renderOverview(){let active=data.products.filter(p=>p.visible!==false).length,low=data.products.filter(p=>p.visible!==false&&Number(p.stock)<=3);let today=new Date().toDateString(),todayOrders=data.orders.filter(o=>new Date(o.createdAt).toDateString()===today&&!o.deleted);let delivered=data.orders.filter(o=>o.status==='تم التسليم'&&!o.deleted);let revenue=delivered.filter(o=>o.paid).reduce((s,o)=>s+o.total,0);
$('#stats').innerHTML=[['إجمالي الأوردرات',data.orders.filter(o=>!o.deleted).length,'▤','كل الطلبات المسجلة'],['أوردرات اليوم',todayOrders.length,'◷','طلبات وصلت النهارده'],['مبيعات محصلة',money(revenue),'ج.','الأوردرات المسلّمة والمدفوعة'],['منتجات ظاهرة',active,'◇',`${low.length} منتجات مخزونها منخفض`]].map(x=>`<div class="stat"><div class="stat-top"><span>${x[0]}</span><span class="stat-icon">${x[2]}</span></div><strong>${x[1]}</strong><small>${x[3]}</small></div>`).join('');
let recent=data.orders.filter(o=>!o.deleted).slice().sort((a,b)=>new Date(b.createdAt)-new Date(a.createdAt)).slice(0,5);
$('#recentOrders').innerHTML=recent.length?`<div class="table-wrap"><table><thead><tr><th>الأوردر</th><th>العميل</th><th>الإجمالي</th><th>الحالة</th></tr></thead><tbody>${recent.map(o=>`<tr><td class="order-id">${esc(o.order)}</td><td>${esc(o.customer?.name||'—')}</td><td>${money(o.total)}</td><td><span class="pill ${statusClass(o.status)}">${esc(o.status)}</span></td></tr>`).join('')}</tbody></table></div>`:'<div class="empty">لسه مفيش أوردرات متاحة للعرض.</div>';
$('#stockAlerts').innerHTML=low.length?low.slice(0,7).map(p=>`<div class="category-row"><div class="category-icon">!</div><div class="category-info"><b>${esc(p.name)}</b><small>المتبقي ${Number(p.stock)} قطعة</small></div><span class="pill ${Number(p.stock)===0?'red':'orange'}">${Number(p.stock)===0?'نفد المخزون':'مخزون منخفض'}</span></div>`).join(''):'<div class="empty">المخزون شكله تمام ✨</div>';
$('#newOrdersBadge').textContent=data.orders.filter(o=>!o.deleted&&o.status==='جديد').length;
}
function fillGovernorates(){let sel=$('#govFilter'),current=sel.value,govs=[...new Set(data.orders.filter(o=>!o.deleted).map(o=>o.customer?.governorate).filter(Boolean))].sort();sel.innerHTML='<option value="">كل المحافظات</option>'+govs.map(g=>`<option>${esc(g)}</option>`).join('');sel.value=current}
function renderOrders(){if(!$('#ordersRows'))return;fillGovernorates();let q=($('#orderSearch').value||'').trim().toLowerCase(),from=$('#dateFrom').value,to=$('#dateTo').value,gov=$('#govFilter').value,st=$('#statusFilter').value;
let list=data.orders.filter(o=>!o.deleted).filter(o=>{let d=new Date(o.createdAt),c=o.customer||{},text=[o.order,c.name,c.phone,c.governorate].join(' ').toLowerCase();return(!q||text.includes(q))&&(!from||d>=new Date(from+'T00:00:00'))&&(!to||d<=new Date(to+'T23:59:59'))&&(!gov||c.governorate===gov)&&(!st||o.status===st)}).sort((a,b)=>new Date(b.createdAt)-new Date(a.createdAt));
$('#ordersRows').innerHTML=list.length?list.map(o=>`<tr><td class="order-id">${esc(o.order)}</td><td>${dateText(o.createdAt)}</td><td><span class="customer">${esc(o.customer?.name||'—')}</span><span class="subline">${esc(o.customer?.phone||'')}</span></td><td>${esc(o.customer?.governorate||'—')}</td><td><b>${money(o.total)}</b></td><td><select class="status-select" data-status="${esc(o.order)}">${['جديد','قيد التجهيز','تم الشحن','تم التسليم','ملغي'].map(s=>`<option ${o.status===s?'selected':''}>${s}</option>`).join('')}</select></td><td><button class="mini-btn ${o.paid?'':'danger'}" data-paid="${esc(o.order)}">${o.paid?'✓ مدفوع':'غير مدفوع'}</button></td><td><div class="row-actions"><button class="mini-btn" data-details="${esc(o.order)}">تفاصيل</button><button class="mini-btn danger" data-delete-order="${esc(o.order)}">حذف</button></div></td></tr>`).join(''):'<tr><td colspan="8" class="empty">مفيش أوردرات مطابقة للفلاتر دي.</td></tr>';
const mobile=$('#ordersMobileList');if(mobile)mobile.innerHTML=list.length?list.map(o=>`<article class="order-mobile-card"><div class="order-mobile-top"><b class="order-id">${esc(o.order)}</b><b>${money(o.total)}</b></div><div class="order-mobile-meta"><span>${esc(o.customer?.name||'—')}</span><span>${esc(o.customer?.phone||'—')}</span><span>${esc(o.customer?.governorate||'—')}</span><span>${dateText(o.createdAt)}</span></div><div class="order-mobile-actions"><select class="status-select" data-status="${esc(o.order)}">${['جديد','قيد التجهيز','تم الشحن','تم التسليم','ملغي'].map(s=>`<option ${o.status===s?'selected':''}>${s}</option>`).join('')}</select><button class="mini-btn ${o.paid?'':'danger'}" data-paid="${esc(o.order)}">${o.paid?'✓ مدفوع':'غير مدفوع'}</button><button class="mini-btn" data-details="${esc(o.order)}">تفاصيل</button><button class="mini-btn danger" data-delete-order="${esc(o.order)}">حذف</button></div></article>`).join(''):'<div class="empty">مفيش أوردرات مطابقة للفلاتر دي.</div>';
$('#ordersCount').textContent=`عرض ${list.length} من ${data.orders.filter(o=>!o.deleted).length} أوردر`;
$('#tab-orders').querySelectorAll('[data-status]').forEach(s=>s.onchange=()=>{let o=data.orders.find(o=>o.order===s.dataset.status);if(o){o.status=s.value;const inventoryChanged=reconcileOrderInventory(o);persist('orders');if(inventoryChanged){syncProductsToStore();persist('products');renderProducts();}activity('تغيير حالة أوردر',`${o.order} ← ${o.status}`);renderOverview();toast('تم تحديث حالة الأوردر')}});
$('#tab-orders').querySelectorAll('[data-paid]').forEach(b=>b.onclick=()=>{let o=data.orders.find(o=>o.order===b.dataset.paid);if(o){o.paid=!o.paid;persist('orders');activity('تحديث حالة الدفع',o.order);renderOrders();renderOverview();toast(o.paid?'تم وضع علامة مدفوع':'تم إلغاء علامة مدفوع')}});
$('#tab-orders').querySelectorAll('[data-delete-order]').forEach(b=>b.onclick=()=>{let o=data.orders.find(o=>o.order===b.dataset.deleteOrder);if(o&&confirm(`متأكدة إنك عايزة تحذفي الأوردر ${o.order}؟ الأفضل تصدير نسخة قبل الحذف.`)){o.deleted=true;persist('orders');activity('حذف أوردر',o.order);renderOrders();renderOverview();toast('تم حذف الأوردر من العرض')}});
$('#tab-orders').querySelectorAll('[data-details]').forEach(b=>b.onclick=()=>orderDetails(b.dataset.details));
}
async function loadOrders(){
 const c=sb();
 if(c){
  const {data:rows,error}=await c.from('orders').select('id,order_number,payload,status,paid,deleted,created_at').order('created_at',{ascending:false});
  if(error){console.error(error);$('#backendNotice').textContent='تعذر تحميل الطلبات من Supabase: '+error.message;}
  else{data.orders=(rows||[]).map((r,i)=>normalizeOrder({...((r.payload)||{}),supabaseId:r.id,order:r.order_number||r.payload?.order||`GH-${String(i+1).padStart(5,'0')}`,createdAt:r.created_at,status:r.status||r.payload?.status||'جديد',paid:typeof r.paid==='boolean'?r.paid:!!r.payload?.paid,deleted:typeof r.deleted==='boolean'?r.deleted:!!r.payload?.deleted},i));save('orders',data.orders);await syncInventoryFromOrders();}
  renderOrders();renderOverview();return;
 }
 let r=await backendGet('getOrders');
 if(r?.ok&&Array.isArray(r.orders)){data.orders=r.orders.map(normalizeOrder);save('orders',data.orders);await syncInventoryFromOrders();$('#backendNotice').textContent='متصل بالخلفية المركزية. بيانات الأوردرات تُقرأ من Google Sheets.';$('#backendNotice').classList.add('connected');}
 renderOrders();renderOverview();
}
function orderDetails(id){let o=data.orders.find(o=>o.order===id);if(!o)return;let c=o.customer||{};modal(`تفاصيل الأوردر ${esc(o.order)}`,`<div class="modal-form"><label>اسم العميل<input readonly value="${esc(c.name||'—')}"></label><label>الهاتف<input readonly value="${esc(c.phone||'—')}"></label><label>المحافظة<input readonly value="${esc(c.governorate||'—')}"></label><label>طريقة الدفع<input readonly value="${esc(c.payment||'—')}"></label><label class="full">العنوان<textarea readonly>${esc(c.address||'—')}</textarea></label><div class="full"><b>المنتجات</b><p>${(o.items||[]).map(i=>`${esc(i.name||i.title||'منتج')} × ${Number(i.qty||1)} — ${esc(i.size||'')} ${esc(i.colorName||'')}`).join('<br>')||esc(o.itemText||'تفاصيل المنتجات غير متاحة في البيانات القديمة')}</p><div class="order-discount-details"><b>كود الخصم:</b> ${esc(o.promoCode||'—')}<br><b>نسبة خصم الكود:</b> ${o.promoPercent?esc(o.promoPercent)+'%':'—'}<br><b>قيمة خصم الكود:</b> ${money(o.promoDiscount||0)}<br><b>الخصم التلقائي:</b> ${money(o.autoDiscount||0)}<br><b>إجمالي الخصومات:</b> ${money(o.discount||0)}</div><b>الإجمالي: ${money(o.total)}</b></div></div><div class="modal-actions"><button class="btn light" data-close>إغلاق</button><button class="btn" id="detailPaid">${o.paid?'إلغاء علامة مدفوع':'تحديد كمدفوع'}</button></div>`);
$('#detailPaid').onclick=()=>{o.paid=!o.paid;persist('orders');renderOrders();renderOverview();closeModal();toast('تم تحديث الدفع')}}
function exportOrders(){let list=data.orders.filter(o=>!o.deleted),cols=['Order','Date','Customer','Phone','Governorate','Address','Payment','Status','Paid','Total','Items'];let rows=list.map(o=>[o.order,o.createdAt,o.customer?.name,o.customer?.phone,o.customer?.governorate,o.customer?.address,o.customer?.payment,o.status,o.paid?'Yes':'No',o.total,(o.items||[]).map(i=>`${i.name} x${i.qty}`).join(' | ')]);let csv=[cols,...rows].map(r=>r.map(v=>'"'+String(v??'').replace(/"/g,'""')+'"').join(',')).join('\r\n');download(new Blob(['\ufeff'+csv],{type:'text/csv;charset=utf-8'}),'girl-hub-orders.csv');}
function renderProducts(){if(!$('#productsGrid'))return;let q=($('#productSearch').value||'').toLowerCase(),type=$('#productTypeFilter').value,vis=$('#productVisibility').value;let list=data.products.filter(p=>(!q||`${p.name} ${p.nameEn||''}`.toLowerCase().includes(q))&&(!type||p.type===type)&&(!vis||(vis==='visible'?p.visible!==false:p.visible===false)));
$('#productsGrid').innerHTML=list.length?list.map(p=>`<article class="product-card"><img src="${esc(p.img)}" alt="${esc(p.name)}" onerror="this.src='assets/images/logo.png'"><div class="product-content"><div class="product-title">${esc(p.name)}</div><div class="product-meta"><span>${p.type==='accessories'?'إكسسوارات':'ملابس'} · ${esc(p.cat||'بدون قسم')}</span><span class="pill ${p.visible===false?'red':'green'}">${p.visible===false?'مخفي':'ظاهر'}</span><span class="pill ${p.available===false?'red':'green'}">${p.available===false?'غير متاح للشراء':'متاح'}</span></div><div class="product-price">${money(p.price)} ${p.old?`<del class="subline">${money(p.old)}</del>`:''}</div><div class="product-meta"><span>المخزون: ${Number(p.stock||0)}</span><span>${esc(p.tag||'')}</span></div><div class="product-meta"><span>ألوان: ${normalizeColors(p.colors).length}</span><span class="pill ${p.offer?'green':'red'}">${p.offer?'ضمن العروض':'مش ضمن العروض'}</span></div><div class="product-buttons"><button class="mini-btn" data-edit-product="${p.id}">تعديل</button><button class="mini-btn" data-toggle-product="${p.id}">${p.visible===false?'إظهار':'إخفاء'}</button><button class="mini-btn" data-toggle-available="${p.id}">${p.available===false?'تفعيل الشراء':'إيقاف الشراء'}</button><button class="mini-btn danger" data-remove-product="${p.id}">حذف</button></div></div></article>`).join(''):'<div class="empty">مفيش منتجات مطابقة.</div>';
$('#productsGrid').querySelectorAll('[data-edit-product]').forEach(b=>b.onclick=()=>productModal(Number(b.dataset.editProduct)));$('#productsGrid').querySelectorAll('[data-toggle-product]').forEach(b=>b.onclick=()=>{let p=data.products.find(x=>x.id===Number(b.dataset.toggleProduct));p.visible=p.visible===false;persist('products');syncProductsToStore();activity('تغيير ظهور منتج',p.name);renderProducts();toast(p.visible?'تم إظهار المنتج':'تم إخفاء المنتج')});$('#productsGrid').querySelectorAll('[data-toggle-available]').forEach(b=>b.onclick=()=>{let p=data.products.find(x=>x.id===Number(b.dataset.toggleAvailable));if(!p)return;p.available=p.available===false;persist('products');syncProductsToStore();activity('تغيير توفر منتج',p.name);renderProducts();toast(p.available?'المنتج متاح للشراء':'تم إيقاف شراء المنتج')});$('#productsGrid').querySelectorAll('[data-remove-product]').forEach(b=>b.onclick=()=>{let p=data.products.find(x=>x.id===Number(b.dataset.removeProduct));if(p&&confirm(`حذف المنتج "${p.name}" نهائيًا من هذه البيانات؟`)){data.products=data.products.filter(x=>x.id!==p.id);persist('products');syncProductsToStore();activity('حذف منتج',p.name);renderProducts();renderOverview();toast('تم حذف المنتج')}})}
function productModal(id){
 let p=data.products.find(x=>x.id===id)||{id:Math.max(0,...data.products.map(x=>Number(x.id)||0))+1,name:'',nameEn:'',type:'clothes',cat:'dresses',price:0,old:0,img:'assets/images/dress.jpg',tag:'',available:true,visible:true,offer:false,stock:10,sizes:'S, M, L, XL',sizeOptions:[{name:'S',enabled:true},{name:'M',enabled:true},{name:'L',enabled:true},{name:'XL',enabled:true}],colors:normalizeColors(),images:[]};
 p.colors=normalizeColors(p.colors);
 const colorRows=p.colors.map((c,i)=>`<div class="color-editor-row" data-color-row><input name="colorName" value="${esc(c.name)}" placeholder="اسم اللون"><input name="colorHex" type="color" value="${/^#[0-9a-fA-F]{6}$/.test(c.hex)?c.hex:'#e8a2b8'}"><button type="button" class="mini-btn danger" data-remove-color>حذف</button></div>`).join('');
 modal(id?'تعديل المنتج':'إضافة منتج جديد',`<form id="productForm" class="modal-form"><label>اسم المنتج بالعربي<input name="name" required value="${esc(p.name)}"></label><label>الاسم بالإنجليزي<input name="nameEn" value="${esc(p.nameEn||'')}"></label><label>القسم الداخلي<input name="cat" value="${esc(p.cat||'')}"></label><label>النوع<select name="type"><option value="clothes" ${p.type==='clothes'?'selected':''}>ملابس</option><option value="accessories" ${p.type==='accessories'?'selected':''}>إكسسوارات</option></select></label><label>السعر الحالي بالجنيه<input name="price" type="number" min="0" required value="${Number(p.price)||0}"></label><label>السعر قبل الخصم<input name="old" type="number" min="0" value="${Number(p.old)||0}"></label><label>الكمية بالمخزون<input name="stock" type="number" min="0" value="${Number(p.stock)||0}"></label><label>الشارة على المنتج<input name="tag" value="${esc(p.tag||'')}" placeholder="جديد / خصم 20%"></label><label class="full">صور المنتج<input name="img" value="${esc(p.img||'')}"><small>الصورة الأولى هي الرئيسية. تقدري تضيفي أكتر من صورة للمنتج.</small><input type="file" name="imageFile" accept="image/*" multiple><div class="product-gallery-admin">${[...(Array.isArray(p.images)?p.images:[]),p.img].filter(Boolean).filter((v,i,a)=>a.indexOf(v)===i).map((u,i)=>`<div class="product-gallery-admin-item"><img src="${esc(u)}" alt="صورة ${i+1}"><button type="button" class="gallery-remove" data-remove-product-image="${i}" aria-label="حذف الصورة">×</button>${i===0?'<small>الرئيسية</small>':''}</div>`).join('')}</div></label><div class="full size-manager"><div class="color-manager-head"><b>المقاسات</b><button type="button" class="mini-btn" id="addSizeRow">＋ إضافة مقاس</button></div><div id="sizeRows">${(p.sizeOptions||String(p.sizes||'S, M, L, XL').split(',').map(x=>({name:x.trim(),enabled:true}))).map(x=>`<div class="size-editor-row" data-size-row><input name="sizeName" value="${esc(x.name)}" placeholder="مثال: M"><label class="check-inline"><input type="checkbox" name="sizeEnabled" ${x.enabled!==false?'checked':''}> متاح</label><button type="button" class="mini-btn danger" data-remove-size>حذف</button></div>`).join('')}</div><small>المقاس المقفول يفضل ظاهر للعميلة لكن باهت وعليه ×، والمقاسات اللي تشيلها نهائيًا تختفي.</small></div><div class="full color-manager"><div class="color-manager-head"><b>ألوان المنتج</b><button type="button" class="mini-btn" id="addColorRow">＋ إضافة لون</button></div><div id="colorRows">${colorRows}</div><small>اختاري اسم اللون والدرجة من لوحة الألوان، وهي اللي هتظهر للعميلة في صفحة المنتج.</small></div><label class="check"><input type="checkbox" name="offer" ${p.offer?'checked':''}> إظهار المنتج في صفحة العروض والخصومات</label><label class="check"><input type="checkbox" name="visible" ${p.visible!==false?'checked':''}> إظهار المنتج في المتجر</label><label class="check"><input type="checkbox" name="available" ${p.available!==false?'checked':''}> السماح بالشراء</label><div class="full modal-actions"><button class="btn">حفظ المنتج</button><button type="button" class="btn light" data-close>إلغاء</button></div></form>`);
 const rows=()=>[...document.querySelectorAll('#colorRows [data-color-row]')];
 $('#addColorRow').onclick=()=>{const d=document.createElement('div');d.className='color-editor-row';d.dataset.colorRow='';d.innerHTML='<input name="colorName" placeholder="اسم اللون"><input name="colorHex" type="color" value="#e8a2b8"><button type="button" class="mini-btn danger" data-remove-color>حذف</button>';$('#colorRows').appendChild(d);bindRemove()};
 $('#addSizeRow').onclick=()=>{const d=document.createElement('div');d.className='size-editor-row';d.dataset.sizeRow='';d.innerHTML='<input name="sizeName" placeholder="مثال: XXL"><label class="check-inline"><input type="checkbox" name="sizeEnabled" checked> متاح</label><button type="button" class="mini-btn danger" data-remove-size>حذف</button>';$('#sizeRows').appendChild(d);bindSizeRemove()}; function bindSizeRemove(){document.querySelectorAll('[data-remove-size]').forEach(b=>b.onclick=()=>b.closest('[data-size-row]')?.remove())} bindSizeRemove();
 function bindRemove(){document.querySelectorAll('[data-remove-color]').forEach(b=>b.onclick=()=>b.closest('[data-color-row]')?.remove())} bindRemove();
 document.querySelectorAll('[data-remove-product-image]').forEach(b=>b.onclick=()=>{const i=Number(b.dataset.removeProductImage);const all=[...(Array.isArray(p.images)?p.images:[]),p.img].filter(Boolean).filter((v,j,a)=>a.indexOf(v)===j);if(all.length<=1){toast('لازم المنتج يفضل له صورة واحدة على الأقل');return}all.splice(i,1);p.img=all[0];p.images=all.slice(1);productModal(p.id)});
 $('#productForm').onsubmit=async e=>{e.preventDefault();let f=new FormData(e.currentTarget),img=f.get('img').trim(),files=[...f.getAll('imageFile')].filter(x=>x&&x.size);try{let uploaded=[];for(let idx=0;idx<files.length;idx++){let file=files[idx];if(idx===0)file=await getCroppedFile(e.currentTarget.id,file);uploaded.push(await uploadImage(file));}if(uploaded.length)img=uploaded[0];const existingImages=Array.isArray(p.images)?p.images.filter(Boolean):[];const images=[...uploaded,...existingImages].filter((u,i,a)=>a.indexOf(u)===i);const colors=rows().map(r=>({name:r.querySelector('[name=colorName]').value.trim(),hex:r.querySelector('[name=colorHex]').value})).filter(c=>c.name);const sizeOptions=[...document.querySelectorAll('#sizeRows [data-size-row]')].map(r=>({name:r.querySelector('[name=sizeName]').value.trim(),enabled:!!r.querySelector('[name=sizeEnabled]')?.checked})).filter(x=>x.name);let obj={...p,images,id:Number(p.id),name:f.get('name').trim(),nameEn:f.get('nameEn').trim(),cat:f.get('cat').trim()||'general',type:f.get('type'),price:Number(f.get('price')),old:Number(f.get('old')),stock:Number(f.get('stock')),tag:f.get('tag').trim(),img,sizeOptions,sizes:sizeOptions.filter(x=>x.enabled).map(x=>x.name),colors:colors.length?colors:normalizeColors(),offer:f.has('offer'),visible:f.has('visible'),available:f.has('available')};let idx=data.products.findIndex(x=>x.id===obj.id);if(idx>=0)data.products[idx]=obj;else data.products.push(obj);persist('products');syncProductsToStore();activity(idx>=0?'تعديل منتج':'إضافة منتج',obj.name);closeModal();renderProducts();renderOverview();toast('تم حفظ المنتج');}catch(err){toast('فشل رفع الصورة: '+err.message)}}}
function renderCategories(){if(!$('#categoriesList'))return;$('#categoriesList').innerHTML=data.categories.map(c=>`<div class="category-row"><div class="category-icon">${esc(c.icon||'◇')}</div><div class="category-info"><b>${esc(c.name)}</b><small>الرابط/النوع: ${esc(c.type)} · ${c.enabled?'ظاهر للزوار':'مغلق للزوار'}</small><small>${c.enabled?'القسم متاح':'رسالة الزوار: '+esc(c.message||'قريبًا')}</small></div><input class="switch" type="checkbox" data-category-toggle="${c.id}" ${c.enabled?'checked':''} title="إظهار القسم"><button class="mini-btn" data-edit-category="${c.id}">تعديل</button><button class="mini-btn danger" data-delete-category="${c.id}">حذف</button></div>`).join('')||'<div class="empty">لم تتم إضافة أقسام بعد.</div>';
$('#categoriesList').querySelectorAll('[data-category-toggle]').forEach(b=>b.onchange=()=>{let c=data.categories.find(c=>c.id===b.dataset.categoryToggle);c.enabled=b.checked;persist('categories');activity('تغيير حالة قسم',c.name);renderCategories();toast('تم تحديث القسم')});$('#categoriesList').querySelectorAll('[data-edit-category]').forEach(b=>b.onclick=()=>categoryModal(b.dataset.editCategory));$('#categoriesList').querySelectorAll('[data-delete-category]').forEach(b=>b.onclick=()=>{let c=data.categories.find(c=>c.id===b.dataset.deleteCategory);if(c&&confirm(`حذف القسم ${c.name}؟`)){data.categories=data.categories.filter(x=>x.id!==c.id);persist('categories');renderCategories()}})}
function categoryModal(id){let c=data.categories.find(c=>c.id===id)||{id:'cat-'+Date.now(),name:'',type:'custom',enabled:true,message:'SOON',icon:'◇'};modal(id?'تعديل القسم':'إضافة قسم',`<form id="categoryForm" class="modal-form"><label>اسم القسم<input name="name" required value="${esc(c.name)}"></label><label>معرّف/نوع القسم<input name="type" required value="${esc(c.type)}"></label><label>رمز بسيط للقسم<input name="icon" value="${esc(c.icon||'◇')}"></label><label class="full">رسالة الشريط الأصفر عند إغلاق القسم<textarea name="message" rows="3" placeholder="مثال: SOON">${esc(c.message||'SOON')}</textarea></label><label class="check full"><input type="checkbox" name="enabled" ${c.enabled?'checked':''}> القسم متاح للزوار</label><div class="full modal-actions"><button class="btn">حفظ</button><button type="button" class="btn light" data-close>إلغاء</button></div></form>`);$('#categoryForm').onsubmit=e=>{e.preventDefault();let f=new FormData(e.currentTarget),obj={...c,name:f.get('name'),type:f.get('type'),icon:f.get('icon'),message:f.get('message'),enabled:f.has('enabled')},i=data.categories.findIndex(x=>x.id===c.id);if(i>=0)data.categories[i]=obj;else data.categories.push(obj);persist('categories');activity('تعديل قسم',obj.name);closeModal();renderCategories();toast('تم حفظ القسم')}}
function renderCategoryTiles(){const box=$('#categoryTilesList');if(!box)return;const tiles=Array.isArray(data.settings.categoryTiles)?data.settings.categoryTiles:[];box.innerHTML=tiles.map(x=>`<div class="category-row"><div class="category-icon"><img src="${esc(x.img||'assets/images/necklace.jpg')}" style="width:45px;height:45px;object-fit:cover;border-radius:10px"></div><div class="category-info"><b>${esc(x.name)}</b><small>${x.group==='clothes'?'ملابس':'إكسسوارات'} · ${esc(x.subtitle||'')} · ${x.enabled?'ظاهر':'مخفي'}</small></div><input class="switch" type="checkbox" data-tile-toggle="${esc(x.id)}" ${x.enabled?'checked':''}><button class="mini-btn" data-edit-tile="${esc(x.id)}">تعديل</button><button class="mini-btn danger" data-delete-tile="${esc(x.id)}">حذف</button></div>`).join('')||'<div class="empty">مفيش خانات أقسام.</div>';box.querySelectorAll('[data-tile-toggle]').forEach(b=>b.onchange=()=>{let x=tiles.find(v=>v.id===b.dataset.tileToggle);if(x){x.enabled=b.checked;data.settings.categoryTiles=tiles;persist('settings');renderCategoryTiles()}});box.querySelectorAll('[data-edit-tile]').forEach(b=>b.onclick=()=>categoryTileModal(b.dataset.editTile));box.querySelectorAll('[data-delete-tile]').forEach(b=>b.onclick=()=>{if(confirm('حذف خانة القسم؟')){data.settings.categoryTiles=tiles.filter(x=>x.id!==b.dataset.deleteTile);persist('settings');renderCategoryTiles()}})}
function categoryTileModal(id){const tiles=data.settings.categoryTiles||[];const x=tiles.find(v=>v.id===id)||{id:'tile-'+Date.now(),group:'accessories',name:'',type:'chains',subtitle:'',img:'assets/images/necklace.jpg',enabled:true,closedMessage:'SOON',imageZoom:100,imagePosX:50,imagePosY:50};modal(id?'تعديل خانة قسم':'إضافة خانة قسم',`<form id="tileForm" class="modal-form"><label>مكان الخانة<select name="group"><option value="accessories" ${x.group!=='clothes'?'selected':''}>داخل الإكسسوارات</option><option value="clothes" ${x.group==='clothes'?'selected':''}>داخل الملابس</option></select></label><label>اسم الخانة<input name="name" required value="${esc(x.name)}"></label><label>المعرّف<input name="type" required value="${esc(x.type||x.id)}"></label><label class="full">الكابشن/الوصف<input name="subtitle" value="${esc(x.subtitle||'')}"></label><label class="full">رسالة الشريط الأصفر عند الإغلاق<input name="closedMessage" value="${esc(x.closedMessage||'SOON')}"></label><label class="full">رابط الصورة<input name="img" required value="${esc(x.img)}"><small>أو اختاري صورة من الجهاز</small><input type="file" name="imageFile" accept="image/*"><small class="crop-hint">بعد اختيار الصورة هتفتح نافذة قص مستقلة.</small></label><label class="check full"><input type="checkbox" name="enabled" ${x.enabled!==false?'checked':''}> الخانة متاحة — عند الإغلاق هتفضل ظاهرة بشكل Soon</label><div class="full modal-actions"><button class="btn">حفظ</button><button type="button" class="btn light" data-close>إلغاء</button></div></form>`);$('#tileForm').onsubmit=async e=>{e.preventDefault();const f=new FormData(e.currentTarget);let img=f.get('img').trim();try{let files=[...f.getAll('imageFile')].filter(x=>x&&x.size);let uploaded=[];if(files.length){for(let idx=0;idx<files.length;idx++){let file=files[idx];if(idx===0)file=await getCroppedFile(e.currentTarget.id,file);uploaded.push(await uploadImage(file));}img=uploaded[0]||img;}const obj={...x,group:f.get('group')||'accessories',name:f.get('name').trim(),type:f.get('type').trim(),subtitle:f.get('subtitle').trim(),closedMessage:f.get('closedMessage').trim()||'SOON',img,enabled:f.has('enabled')};const i=tiles.findIndex(v=>v.id===x.id);if(i>=0)tiles[i]=obj;else tiles.push(obj);data.settings.categoryTiles=tiles;persist('settings');closeModal();renderCategoryTiles();toast('تم حفظ خانة القسم')}catch(err){toast('فشل رفع الصورة: '+err.message)}}}
function renderPromos(){if(!$('#promosRows'))return;let today=new Date().toISOString().slice(0,10);data.promos.forEach(p=>{if(p.enabled&&((p.expiresAt&&p.expiresAt<today)||(Number(p.maxUses)>0&&Number(p.used||0)>=Number(p.maxUses)))){p.enabled=false;persist('promos')}});let active=data.promos.filter(p=>p.enabled&&p.expiresAt>=today&&p.startsAt<=today).length;
$('#promoSummary').innerHTML=`<div class="promo-chip"><b>${data.promos.length}</b> إجمالي الأكواد</div><div class="promo-chip"><b>${active}</b> أكواد فعالة الآن</div><div class="promo-chip"><b>${data.promos.reduce((s,p)=>s+Number(p.used||0),0)}</b> مرات استخدام مسجلة</div>`;
$('#promosRows').innerHTML=data.promos.map(p=>`<tr><td><b class="order-id">${esc(p.code)}</b></td><td>${p.type==='percent'?'نسبة مئوية':'مبلغ ثابت'}</td><td>${p.type==='percent'?`${p.value}%`:money(p.value)}</td><td>${esc(p.startsAt||'—')}<span class="subline">إلى ${esc(p.expiresAt||'—')}</span></td><td>${Number(p.used||0)} / ${Number(p.maxUses||0)}<span class="subline">للعميل: ${Number(p.perCustomer||1)} مرة</span></td><td><span class="pill ${p.enabled?'green':'red'}">${p.enabled?'مفعّل':'متوقف'}</span></td><td><div class="row-actions"><button class="mini-btn" data-edit-promo="${p.id}">تعديل</button><button class="mini-btn" data-toggle-promo="${p.id}">${p.enabled?'إيقاف':'تفعيل'}</button><button class="mini-btn danger" data-delete-promo="${p.id}">حذف</button></div></td></tr>`).join('')||'<tr><td colspan="7" class="empty">لا توجد أكواد خصم.</td></tr>';
$('#promosRows').querySelectorAll('[data-edit-promo]').forEach(b=>b.onclick=()=>promoModal(Number(b.dataset.editPromo)));$('#promosRows').querySelectorAll('[data-toggle-promo]').forEach(b=>b.onclick=()=>{let p=data.promos.find(x=>x.id===Number(b.dataset.togglePromo));p.enabled=!p.enabled;persist('promos');renderPromos();toast('تم تحديث الكود')});$('#promosRows').querySelectorAll('[data-delete-promo]').forEach(b=>b.onclick=()=>{if(confirm('حذف كود الخصم نهائيًا؟')){data.promos=data.promos.filter(p=>p.id!==Number(b.dataset.deletePromo));persist('promos');renderPromos()}})}
function promoModal(id){let p=data.promos.find(p=>p.id===id)||{id:Date.now(),code:'GIRL'+Math.random().toString(36).slice(2,6).toUpperCase(),type:'percent',value:10,startsAt:new Date().toISOString().slice(0,10),expiresAt:'2027-12-31',maxUses:100,used:0,perCustomer:1,minOrder:0,enabled:true};modal(id?'تعديل كود الخصم':'إنشاء كود خصم',`<form id="promoForm" class="modal-form"><label>الكود<input name="code" required value="${esc(p.code)}" style="text-transform:uppercase"></label><label>نوع الخصم<select name="type"><option value="percent" ${p.type==='percent'?'selected':''}>نسبة مئوية %</option><option value="fixed" ${p.type==='fixed'?'selected':''}>مبلغ ثابت بالجنيه</option></select></label><label>قيمة الخصم<input name="value" type="number" min="1" required value="${Number(p.value)}"></label><label>أقصى عدد استخدامات إجمالي<input name="maxUses" type="number" min="1" required value="${Number(p.maxUses)}"></label><label>تاريخ البداية<input name="startsAt" type="date" required value="${esc(p.startsAt)}"></label><label>تاريخ الانتهاء<input name="expiresAt" type="date" required value="${esc(p.expiresAt)}"></label><label>مرات الاستخدام لكل عميل<input name="perCustomer" type="number" min="1" value="${Number(p.perCustomer||1)}"></label><label>الحد الأدنى لقيمة الطلب<input name="minOrder" type="number" min="0" value="${Number(p.minOrder||0)}"></label><label class="check full"><input type="checkbox" name="enabled" ${p.enabled?'checked':''}> تفعيل الكود</label><div class="full modal-actions"><button class="btn">حفظ الكود</button><button type="button" class="btn light" data-close>إلغاء</button></div><p class="full subline">تنبيه: تقييد عدد الاستخدامات لكل العملاء بشكل موثوق يحتاج التحقق المركزي في الخلفية المنشورة، وليس المتصفح فقط.</p></form>`);$('#promoForm').onsubmit=e=>{e.preventDefault();let f=new FormData(e.currentTarget),start=f.get('startsAt'),end=f.get('expiresAt');if(end<start){toast('تاريخ الانتهاء يجب أن يكون بعد البداية');return}let obj={...p,code:f.get('code').trim().toUpperCase().replace(/\s+/g,''),type:f.get('type'),value:Number(f.get('value')),maxUses:Number(f.get('maxUses')),startsAt:start,expiresAt:end,perCustomer:Number(f.get('perCustomer')||1),minOrder:Number(f.get('minOrder')||0),enabled:f.has('enabled')};if(data.promos.some(x=>x.code===obj.code&&x.id!==obj.id)){toast('الكود ده موجود بالفعل');return}let i=data.promos.findIndex(x=>x.id===p.id);if(i>=0)data.promos[i]=obj;else data.promos.push(obj);persist('promos');activity('حفظ كود خصم',obj.code);closeModal();renderPromos();toast('تم حفظ كود الخصم')}}
function renderBanners(){if(!$('#heroList'))return;$('#heroList').innerHTML=data.banners.map(b=>`<div class="banner-row"><img src="${esc(b.img)}" onerror="this.src='assets/images/hero.jpg'"><div class="banner-info"><b>${esc(b.title)}</b><small>${esc(b.subtitle||'')}<br>الصورة: ${esc(b.img)}</small><small>${b.enabled?'ظاهر':'مخفي'} · ${esc(b.url||'')}</small></div><input class="switch" type="checkbox" data-banner-toggle="${b.id}" ${b.enabled?'checked':''}><button class="mini-btn" data-edit-banner="${b.id}">تعديل</button><button class="mini-btn danger" data-delete-banner="${b.id}">حذف</button></div>`).join('');
$('#heroList').querySelectorAll('[data-banner-toggle]').forEach(x=>x.onchange=()=>{let b=data.banners.find(b=>b.id===Number(x.dataset.bannerToggle));b.enabled=x.checked;persist('banners');renderBanners()});$('#heroList').querySelectorAll('[data-edit-banner]').forEach(x=>x.onclick=()=>bannerModal(Number(x.dataset.editBanner)));$('#heroList').querySelectorAll('[data-delete-banner]').forEach(x=>x.onclick=()=>{if(confirm('حذف هذا البانر؟')){data.banners=data.banners.filter(b=>b.id!==Number(x.dataset.deleteBanner));persist('banners');renderBanners()}})}
function bannerModal(id){let b=data.banners.find(b=>b.id===id)||{id:Date.now(),title:'بانر جديد',subtitle:'',img:'assets/images/hero.jpg',button:'تسوقي الآن',url:'clothes.html',enabled:true,imageZoom:100,imagePosX:50,imagePosY:50};modal(id?'تعديل البانر':'إضافة بانر',`<form id="bannerForm" class="modal-form"><label>اسم البانر<input name="title" required value="${esc(b.title)}"></label><label>الكابشن<input name="subtitle" value="${esc(b.subtitle||'')}"></label><label class="full">رابط الصورة<input name="img" required value="${esc(b.img)}"><small>أو اختاري صورة من الموبايل لرفعها سحابيًا</small><input type="file" name="imageFile" accept="image/*"><small class="crop-hint">بعد اختيار الصورة هتفتح نافذة قص مستقلة.</small></label><label>نص الزر<input name="button" value="${esc(b.button||'تسوقي الآن')}"></label><label>رابط الزر<input name="url" value="${esc(b.url||'clothes.html')}"></label><label class="check full"><input type="checkbox" name="enabled" ${b.enabled?'checked':''}> إظهار البانر</label><div class="full modal-actions"><button class="btn">حفظ البانر</button><button type="button" class="btn light" data-close>إلغاء</button></div></form>`);$('#bannerForm').onsubmit=async e=>{e.preventDefault();let f=new FormData(e.currentTarget),img=f.get('img').trim(),file=f.get('imageFile');try{if(file&&file.size)file=await getCroppedFile(e.currentTarget.id,file),img=await uploadImage(file);let obj={...b,title:f.get('title'),subtitle:f.get('subtitle'),img,button:f.get('button'),url:f.get('url'),enabled:f.has('enabled')},i=data.banners.findIndex(x=>x.id===b.id);if(i>=0)data.banners[i]=obj;else data.banners.push(obj);persist('banners');activity('تعديل بانر',obj.title);closeModal();renderBanners();toast('تم حفظ البانر');}catch(err){toast('فشل رفع الصورة: '+err.message)}}}
const GOVERNORATES=['القاهرة','الجيزة','الإسكندرية','القليوبية','الدقهلية','الشرقية','الغربية','المنوفية','البحيرة','كفر الشيخ','دمياط','بورسعيد','الإسماعيلية','السويس','شمال سيناء','جنوب سيناء','بني سويف','الفيوم','المنيا','أسيوط','سوهاج','قنا','الأقصر','أسوان','البحر الأحمر','الوادي الجديد','مطروح'];
function renderShippingSettings(){const box=$('#shippingGovernorates');if(!box)return;const map=data.settings.shippingByGovernorate||{};box.innerHTML=GOVERNORATES.map(g=>`<label class="shipping-gov-row"><span>${esc(g)}</span><input type="number" min="0" step="1" data-shipping-gov="${esc(g)}" value="${map[g]!==undefined?Number(map[g]):Number(data.settings.shipping||0)}" placeholder="${Number(data.settings.shipping||0)}"></label>`).join('');box.querySelectorAll('[data-shipping-gov]').forEach(i=>i.addEventListener('change',()=>{data.settings.shippingByGovernorate={...(data.settings.shippingByGovernorate||{}),[i.dataset.shippingGov]:Number(i.value||0)};persist('settings');activity('تعديل شحن محافظة',i.dataset.shippingGov);toast('تم حفظ سعر شحن '+i.dataset.shippingGov);}));}
function renderPaymentMethods(){const box=$('#paymentMethodsManager');if(!box)return;const methods=data.settings.paymentMethods||defaultPaymentMethods;box.innerHTML=methods.map((m,i)=>`<label class="payment-method-row"><span>${esc(m.label)}</span><input class="switch" type="checkbox" data-payment-toggle="${i}" ${m.enabled!==false?'checked':''}></label>`).join('');box.querySelectorAll('[data-payment-toggle]').forEach(b=>b.onchange=()=>{methods[Number(b.dataset.paymentToggle)].enabled=b.checked;data.settings.paymentMethods=methods;persist('settings');toast('تم تحديث طرق الدفع')})}
function fillSettings(){let f=$('#storeSettings');if(!f)return;Object.entries(data.settings).forEach(([k,v])=>{let el=f.elements.namedItem(k);if(el&&k!=='shippingByGovernorate'&&k!=='categoryTiles'&&k!=='paymentMethods'&&k!=='socialLinks'&&k!=='pageMeta'){if(el.type==='checkbox')el.checked=!!v;else el.value=v}});renderShippingSettings();renderPaymentMethods();renderCategoryTiles();const sl=data.settings.socialLinks||{},pm=data.settings.pageMeta||{};['instagram','facebook','tiktok'].forEach(k=>{const el=f.elements.namedItem(k);if(el)el.value=sl[k]||''});const sw=f.elements.namedItem('socialWhatsapp');if(sw)sw.value=sl.whatsapp||'';Object.keys(pm).forEach(k=>{const el=f.elements.namedItem(k);if(el)el.value=pm[k]||''});}
let GH_CROPPERS={};
function openCropper(file,aspect,onDone){
 const url=URL.createObjectURL(file);
 const wrap=document.createElement('div');wrap.className='cropper-popover';wrap.innerHTML=`<div class="cropper-dialog"><div class="cropper-head"><b>قص الصورة</b><button type="button" class="cropper-close">×</button></div><div class="cropper-stage"><img alt="معاينة القص"></div><div class="cropper-help">حرّكي الصورة داخل الإطار وحددي الجزء اللي عايزة يظهر</div><div class="modal-actions"><button type="button" class="btn cropper-save">استخدام الصورة</button><button type="button" class="btn light cropper-cancel">إلغاء</button></div></div>`;
 document.body.appendChild(wrap);const img=wrap.querySelector('img');img.src=url;
 img.onload=()=>{const crop=new Cropper(img,{aspectRatio:aspect,viewMode:1,dragMode:'move',autoCropArea:.9,background:false,responsive:true,zoomable:true,scalable:false});wrap.querySelector('.cropper-save').onclick=()=>{crop.getCroppedCanvas({imageSmoothingEnabled:true,imageSmoothingQuality:'high'}).toBlob(blob=>{crop.destroy();URL.revokeObjectURL(url);wrap.remove();onDone(new File([blob],(file.name||'image').replace(/\.[^.]+$/,'')+'-crop.jpg',{type:'image/jpeg'}));},'image/jpeg',.92)};wrap.querySelector('.cropper-cancel').onclick=wrap.querySelector('.cropper-close').onclick=()=>{crop.destroy();URL.revokeObjectURL(url);wrap.remove();};};
}
function initCropInputs(){document.querySelectorAll('#modalRoot form input[type=file][name=imageFile]').forEach(input=>{if(input.dataset.cropBound)return;input.dataset.cropBound='1';const form=input.closest('form');input.addEventListener('change',()=>{const file=input.files?.[0];if(!file)return;const aspect=form.id==='bannerForm'?16/7:form.id==='productForm'?4/5:1;openCropper(file,aspect,cropped=>{input._croppedFile=cropped;});});});}
function getCroppedFile(formId,original){const input=document.querySelector(`#${formId} input[name="imageFile"]`);return Promise.resolve(input?._croppedFile||original);}
function modal(title,html){$('#modalRoot').innerHTML=`<div class="modal-backdrop"><div class="modal"><h2>${title}</h2>${html}</div></div>`;$('#modalRoot').querySelectorAll('[data-close]').forEach(b=>b.onclick=closeModal);$('#modalRoot').querySelector('.modal-backdrop').onclick=e=>{if(e.target.classList.contains('modal-backdrop'))closeModal()};initCropInputs()}
function closeModal(){$('#modalRoot').innerHTML=''}
function download(blob,name){let a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000)}
function backup(){let payload={version:1,exportedAt:new Date().toISOString(),products:data.products,orders:data.orders,promos:data.promos,categories:data.categories,banners:data.banners,settings:data.settings,activity:read('activity',[])};download(new Blob([JSON.stringify(payload,null,2)],{type:'application/json'}),'girl-hub-backup.json');toast('تم تجهيز النسخة الاحتياطية')}
function restore(e){let file=e.target.files?.[0];if(!file)return;let r=new FileReader();r.onload=()=>{try{let x=JSON.parse(r.result);['products','orders','promos','categories','banners','settings'].forEach(k=>{if(x[k]!==undefined){data[k]=x[k];save(k,data[k]);if(sb())persist(k)}});syncProductsToStore();renderAll();toast('تم استيراد النسخة الاحتياطية')}catch{toast('ملف النسخة الاحتياطية غير صالح')}};r.readAsText(file);e.target.value=''}
document.addEventListener('DOMContentLoaded',init);
})();