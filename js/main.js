const CART_KEY='girlhub_cart', WISH_KEY='girlhub_wish', LANG_KEY='girlhub_lang', ORDER_KEY='girlhub_last_order';
const $=(s,r=document)=>r.querySelector(s); const $$=(s,r=document)=>[...r.querySelectorAll(s)]; const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const LANG={
 ar:{dir:'rtl',code:'AR',money:'ج.م',add:'أضف للسلة',unavailable:'غير متوفر',added:'تمت إضافة المنتج للسلة',notAvailable:'المنتج غير متاح حاليًا',removed:'تم الحذف من المفضلة',fav:'تمت الإضافة للمفضلة',size:'المقاس',color:'اللون',available:'متوفر',notAvailableLabel:'غير متوفر',shipping:'الشحن',total:'الإجمالي',subtotal:'الإجمالي الفرعي',orderSummary:'ملخص الطلب',checkout:'إتمام الطلب',orderItems:'منتجات الطلب',noCart:'السلة فاضية',emptyCart:'لسه مفيش منتجات في السلة.',shop:'ابدئي التسوق',related:'منتجات مشابهة قد تعجبك',home:'الرئيسية',clothes:'ملابس',accessories:'اكسسوارات',contact:'تواصل معنا',search:'البحث',discounts:'خصومات',viewAll:'عرض الكل ←',choose:'عايزه إيه؟',newCollection:'الجديد منووو',shopNow:'تسوق الآن',newProducts:'وصل حديثًا'},
 en:{dir:'ltr',code:'EN',money:'EGP',add:'Add to cart',unavailable:'Unavailable',added:'Product added to cart',notAvailable:'This product is currently unavailable',removed:'Removed from wishlist',fav:'Added to wishlist',size:'Size',color:'Color',available:'Available',notAvailableLabel:'Unavailable',shipping:'Shipping',total:'Total',subtotal:'Subtotal',orderSummary:'Order summary',checkout:'Checkout',orderItems:'Order items',noCart:'Your cart is empty',emptyCart:'There are no products in your cart yet.',shop:'Start shopping',related:'You may also like',home:'Home',clothes:'Clothes',accessories:'Accessories',contact:'Contact us',search:'Search',discounts:'Discounts',viewAll:'View all →',choose:'What are you looking for?',newCollection:'New collection',shopNow:'Shop now',newProducts:'New arrivals'}
};
const PRODUCT_EN={1:'Elegant Pink Linen Dress',2:'Classic Beige Jacket',3:'Wide White Trousers',4:'Soft White Dress',5:'Luxury Burgundy Dress',6:'Beige Blouse',7:'Pink Blouse',8:'Black Shirt',9:'Gold Necklace',10:'Classic Leather Watch',11:'Pink Handbag',12:'Pearl Earrings',13:'Gold Watch',14:'Beige Trousers',15:'Black Handbag',16:'Winter Scarf',17:'Long Pink Dress',18:'White Top'};
const PRODUCT_AR={};
const money=n=>{const lang=getLang();return `${Number(n).toLocaleString(lang==='en'?'en-US':'ar-EG')} ${LANG[lang].money}`};
const getLang=()=>localStorage.getItem(LANG_KEY)==='en'?'en':'ar';
const setLang=l=>localStorage.setItem(LANG_KEY,l);
const tr=k=>LANG[getLang()][k]||k;
function getCart(){let c=JSON.parse(localStorage.getItem(CART_KEY)||'[]');let changed=false;c=c.map((i,idx)=>{if(!i.key){i={...i,key:variantKey(i.id,i.size||'M',i.color||String(idx)),size:i.size||'M',color:i.color||String(idx),colorName:i.colorName||'Pink'};changed=true}return i}).filter(i=>getProduct(i.id));if(changed)localStorage.setItem(CART_KEY,JSON.stringify(c));return c} const saveCart=c=>localStorage.setItem(CART_KEY,JSON.stringify(c));
const getWish=()=>JSON.parse(localStorage.getItem(WISH_KEY)||'[]'); const saveWish=c=>localStorage.setItem(WISH_KEY,JSON.stringify(c));
const variantKey=(id,size='M',color='0')=>`${Number(id)}__${size}__${color}`;
function cartCount(){return getCart().reduce((a,x)=>a+Number(x.qty||0),0)}
function refreshBadges(){$$('.cart-count').forEach(e=>e.textContent=cartCount());$$('.wish-count').forEach(e=>e.textContent=getWish().length)}
function toast(msg){const t=$('.toast');if(!t)return;t.textContent=msg;t.classList.add('show');clearTimeout(window.__toast);window.__toast=setTimeout(()=>t.classList.remove('show'),1800)}
function productName(p){return getLang()==='en'?(p.nameEn||PRODUCT_EN[p.id]||p.name):p.name}
function sizeStock(p,size){const map=p?.stockBySize;if(map&&typeof map==='object'&&Object.keys(map).length){return Math.max(0,Number(map[size]??0))}return Math.max(0,Number(p?.stock||0));}
function syncProductTotalStock(p){if(!p)return 0;const map=p.stockBySize;if(map&&typeof map==='object'&&Object.keys(map).length){p.stock=Object.values(map).reduce((s,v)=>s+Math.max(0,Number(v||0)),0)}return Number(p.stock||0);}
function addToCart(id,qty=1,size='M',color='0',colorName='Pink'){
 const c=getCart(),p=getProduct(id),max=sizeStock(p,size);if(!p||!p.available||max<=0){toast(max<=0?tr('notAvailable'):tr('notAvailable'));return false}
 const key=variantKey(id,size,color),x=c.find(i=>i.key===key),current=x?Number(x.qty||0):0;
 if(current+Number(qty)>max){toast(getLang()==='en'?`Only ${max} left in size ${size}`:`المتاح من مقاس ${size} هو ${max} قطعة بس`);return false}
 if(x)x.qty+=Number(qty);else c.push({key,id:Number(id),qty:Number(qty),size:size||'M',color:color||'0',colorName:colorName||'Pink'});
 saveCart(c);refreshBadges();toast(tr('added'));return true;
}
function toggleWish(id,sourceEl){let w=getWish(),adding=!w.includes(Number(id));w=adding?[...w,Number(id)]:w.filter(x=>x!==Number(id));saveWish(w);refreshBadges();renderCards();renderWishlist();if(adding){const fresh=sourceEl?.closest('[data-product-card],.figma-product-card,.related-card,.detail-image-wrap');const card=fresh||document.querySelector(`[data-product-card="${Number(id)}"]`)||document.querySelector(`.figma-product-card a[href="product.html?id=${Number(id)}"]`)?.closest('.figma-product-card');if(card){card.classList.remove('wish-pop');void card.offsetWidth;card.classList.add('wish-pop');const pop=document.createElement('span');pop.className='wish-pop-heart';pop.textContent='♥';card.appendChild(pop);setTimeout(()=>pop.remove(),900)}}toast(adding?tr('fav'):tr('removed'))}
function imageStyle(o){const z=Math.max(100,Number(o?.imageZoom||100));const x=Number(o?.imagePosX??50),y=Number(o?.imagePosY??50);return `style="object-position:${x}% ${y}%;transform:scale(${z/100});transform-origin:${x}% ${y}%"`;}
function card(p){const wished=getWish().includes(p.id);const ss=getStoreSettings();const stockMap=p.stockBySize&&typeof p.stockBySize==='object'?p.stockBySize:null;const stockHtml=ss.showStockBySize!==false&&stockMap&&Object.keys(stockMap).length?`<div class="card-size-stock">${Object.entries(stockMap).map(([sz,v])=>`<span>${esc(sz)} <b>${Number(v||0)}</b></span>`).join('')}</div>`:'';return `<article class="card" data-product-card="${p.id}"><div class="card-media"><a href="product.html?id=${p.id}" aria-label="${productName(p)}"><img src="${p.img}" ${imageStyle(p)} alt="${productName(p)}"></a>${p.tag?`<span class="tag">${p.tag}</span>`:''}<button class="heart ${wished?'on':''}" data-wish="${p.id}" aria-label="${getLang()==='en'?'Wishlist':'مفضلة'}">${wished?'♥':'♡'}</button></div><div class="card-body"><a href="product.html?id=${p.id}" class="product-card-link"><h3>${productName(p)}</h3><div class="price"><span>${money(p.price)}</span>${p.old?`<span class="old">${money(p.old)}</span>`:''}</div>${stockHtml}</a><button type="button" class="quick-add" data-add="${p.id}" ${!p.available?'disabled':''}>${p.available?tr('add'):tr('unavailable')}</button></div></article>`}
function getManagedCategories(){try{const remote=JSON.parse(localStorage.getItem('girlhub_remote_categories')||'null');if(Array.isArray(remote)&&remote.length)return remote;const local=JSON.parse(localStorage.getItem('gh_admin_categories_v1')||'null');return Array.isArray(local)?local:[]}catch(_){return []}}
function isCategoryClosedForProduct(p){
 const cats=getManagedCategories().filter(c=>c.enabled===false);
 return cats.some(c=>{
  const t=String(c.type||'').toLowerCase(), id=String(c.id||'').toLowerCase(), cat=String(p.cat||'').toLowerCase(), type=String(p.type||'').toLowerCase();
  return (t && (t===type || t===cat)) || (id && (id===cat || id===type));
 });
}
function currentPageOwnsClosedCategory(p){
 const path=location.pathname.toLowerCase(), cats=getManagedCategories().filter(c=>c.enabled===false);
 const currentCat=(new URLSearchParams(location.search).get('cat')||'').toLowerCase();
 return cats.some(c=>{
  const t=String(c.type||'').toLowerCase(), id=String(c.id||'').toLowerCase(), productCat=String(p.cat||'').toLowerCase(), productType=String(p.type||'').toLowerCase();
  const applies=(t && (t===productType||t===productCat)) || (id && (id===productType||id===productCat));
  if(!applies)return false;
  if(t==='clothes'||id==='clothes')return path.endsWith('clothes.html');
  if(t==='accessories'||id==='accessories')return path.endsWith('accessories.html');
  if(path.endsWith('category.html'))return currentCat===t||currentCat===id;
  return false;
 });
}
function productAllowedInCurrentContext(p){return p&&p.visible!==false && (!isCategoryClosedForProduct(p)||currentPageOwnsClosedCategory(p));}
function closedCategoryForCurrentPage(){
 const cats=getManagedCategories().filter(c=>c.enabled===false), path=location.pathname.toLowerCase();
 if(path.endsWith('clothes.html')) return cats.find(c=>String(c.type).toLowerCase()==='clothes'||String(c.id).toLowerCase()==='clothes');
 if(path.endsWith('accessories.html')) return cats.find(c=>String(c.type).toLowerCase()==='accessories'||String(c.id).toLowerCase()==='accessories');
 if(path.endsWith('category.html')){const cat=(new URLSearchParams(location.search).get('cat')||'').toLowerCase();return cats.find(c=>[c.type,c.id].some(v=>String(v||'').toLowerCase()===cat));}
 return null;
}
function applyClosedCategoryPresentation(){
 const cats=getManagedCategories();
 document.querySelectorAll('.choose-card,.accessory-feature,[data-category-type],a[href*=' + '"category.html?cat="' + ']').forEach(card=>{
  const href=card.getAttribute('href')||'', catType=card.dataset.categoryType||'';
  const match=cats.find(c=>c.enabled===false && ((c.type==='clothes'&&/clothes\.html|cat=(shirts|dresses|pants)/i.test(href))||(c.type==='accessories'&&/accessories\.html|cat=(chains|rings|bracelets|watches|bags|sunglasses)/i.test(href))||String(c.type)===catType||String(c.id)===catType||String(c.type)===new URL(href,location.href).searchParams.get('cat')||String(c.id)===new URL(href,location.href).searchParams.get('cat')));
  if(match){card.classList.add('gh-category-sealed');card.dataset.sealMessage=match.message||'SOON';card.setAttribute('aria-label',(card.getAttribute('aria-label')||'')+' — '+(match.message||'SOON'));}
  else {card.classList.remove('gh-category-sealed');delete card.dataset.sealMessage;}
 });
 const pageCat=closedCategoryForCurrentPage();
 document.querySelectorAll('.gh-sealed-page-notice').forEach(n=>n.remove());
 document.body.classList.toggle('gh-category-page-sealed',!!pageCat);
 if(pageCat){const notice=document.createElement('div');notice.className='gh-sealed-page-notice';notice.setAttribute('role','status');notice.textContent=pageCat.message||'SOON';const main=document.querySelector('main')||document.body;main.prepend(notice);}
}
function renderCards(){ $$('.product-grid').forEach(grid=>{let list=PRODUCTS.filter(productAllowedInCurrentContext);const cat=grid.dataset.cat;if(cat)list=list.filter(p=>p.cat===cat);const type=grid.dataset.type;if(type)list=list.filter(p=>p.type===type);if(location.pathname.toLowerCase().endsWith('/clothes.html')){for(let i=list.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[list[i],list[j]]=[list[j],list[i]]}}const limit=grid.dataset.limit;if(limit)list=list.slice(0,Number(limit));grid.innerHTML=list.map(card).join('')});applyLanguage();}
function renderWishlist(){const g=$('.wishlist-grid');if(!g)return;const w=getWish(), visibleWish=PRODUCTS.filter(p=>w.includes(p.id)&&productAllowedInCurrentContext(p));g.innerHTML=visibleWish.length?visibleWish.map(card).join(''):`<div class="empty" style="grid-column:1/-1"><div class="emoji">♡</div><h2>${getLang()==='en'?'Wishlist is empty':'قائمة المفضلة فارغة'}</h2><p>${getLang()==='en'?'Add the pieces you love here.':'ضيفي المنتجات اللي عجباكي هنا.'}</p><a class="btn" href="clothes.html">${getLang()==='en'?'Browse products':'تصفحي المنتجات'}</a></div>`}
function cartColorName(i){if(i.colorName)return i.colorName;return getLang()==='en'?'Pink':'وردي'}
function renderCart(){const box=$('.cart-list');if(!box)return;const c=getCart();if(!c.length){box.innerHTML=`<div class="empty"><div class="emoji">🛍️</div><h2>${tr('noCart')}</h2><p>${tr('emptyCart')}</p><a class="btn" href="home.html">${tr('shop')}</a></div>`;$('.cart-layout .summary')?.remove();return}
 box.innerHTML=c.map(i=>{const p=getProduct(i.id);if(!p)return '';return `<div class="cart-row"><img src="${p.img}" ${imageStyle(p)} alt="${productName(p)}"><div><h3>${productName(p)}</h3><small>${tr('size')}: <strong>${i.size||'M'}</strong> · ${tr('color')}: <strong>${cartColorName(i)}</strong><br>${money(p.price)}</small></div><div class="qty"><button data-dec="${i.key}">−</button><span>${i.qty}</span><button data-inc="${i.key}">+</button></div><strong class="row-price">${money(p.price*i.qty)}</strong><button class="iconbtn" data-remove="${i.key}">×</button></div>`}).join('');
 const total=c.reduce((s,i)=>{const p=getProduct(i.id);return s+(p?p.price*i.qty:0)},0);if($('.subtotal'))$('.subtotal').textContent=money(total);if($('.total'))$('.total').textContent=money(total+50);applyLanguage();}
function discountItems(){return PRODUCTS.filter(p=>productAllowedInCurrentContext(p)&&p.offer===true&&p.old&&p.old>p.price).sort((a,b)=>((b.old-b.price)/b.old)-((a.old-a.price)/a.old)).slice(0,12)}
function normalizeProductColors(colors){if(Array.isArray(colors)&&colors.length)return colors.map((c,i)=>typeof c==='string'?{name:c,hex:['#e8a2b8','#ead7ae','#111111','#5b4038','#ffffff'][i%5]}:{name:c.name||c.label||`لون ${i+1}`,hex:c.hex||c.color||'#e8a2b8'});if(typeof colors==='string')return colors.split(',').map((x,i)=>({name:x.trim(),hex:['#e8a2b8','#ead7ae','#111111','#5b4038','#ffffff'][i%5]})).filter(x=>x.name);return [{name:'وردي',hex:'#e8a2b8'},{name:'بيج',hex:'#ead7ae'},{name:'أسود',hex:'#111111'}]}
function initDiscountSlider(){
 const grid=$('#discountGrid');
 if(!grid)return;
 const items=discountItems();
 if(!items.length){if(typeof grid.__discountCleanup==='function')grid.__discountCleanup();grid.innerHTML='';grid.dataset.sliderReady='0';return;}
 if(grid.dataset.sliderReady==='1'){refreshDiscountSliderLanguage(grid,items);return}
 if(typeof grid.__discountCleanup==='function')grid.__discountCleanup();
 grid.dataset.sliderReady='1';
 grid.innerHTML=[...items,...items].map(p=>`<article class="figma-product-card"><a href="product.html?id=${p.id}" class="product-image"><img src="${p.img}" ${imageStyle(p)} alt="${productName(p)}"><span class="discount-badge">${Math.round((1-p.price/p.old)*100)}% ${getLang()==='en'?'OFF':'خصم'}</span></a><div class="product-name">${productName(p)}</div><div class="product-price"><strong>${money(p.price)}</strong><del>${money(p.old)}</del></div></article>`).join('');
 let index=0,timer,dragging=false,startX=0,startY=0,startTranslate=0,lastX=0,suppressClick=false;
 const getVisible=()=>window.innerWidth<=600?2:window.innerWidth<=900?2:4;
 const step=()=>{const first=grid.querySelector('.figma-product-card');if(!first)return 0;return first.getBoundingClientRect().width+(parseFloat(getComputedStyle(grid).gap)||0)};
 const render=(animate=true,px=null)=>{grid.style.transition=animate?'transform .72s cubic-bezier(.16,1,.3,1)':'none';grid.style.transform=`translate3d(${px!==null?px:-index*step()}px,0,0)`};
 const resetLoop=()=>{if(index>=items.length){index=0;render(false)}};
 const moveNext=()=>{index++;render(true);if(index>=items.length)setTimeout(resetLoop,740)};
 const movePrev=()=>{if(index<=0){index=items.length;render(false);requestAnimationFrame(()=>{index=items.length-1;render(true)})}else{index--;render(true)}};
 const prevBtn=$('.discount-prev'),nextBtn=$('.discount-next');
 const onPrevClick=e=>{e.preventDefault();setActive(e.currentTarget);movePrev();restart()};
 const onNextClick=e=>{e.preventDefault();setActive(e.currentTarget);moveNext();restart()};
 const onDiscountCardClick=e=>{const a=e.target.closest('a[href]');if(!a||!grid.contains(a))return;if(window.__discountSuppressClickUntil&&Date.now()<window.__discountSuppressClickUntil)return;e.preventDefault();window.location.assign(a.href)};
 const setActive=(which)=>{$$('.slider-arrows button').forEach(b=>b.classList.remove('active'));which?.classList.add('active');clearTimeout(window.__discountPink);window.__discountPink=setTimeout(()=>which?.classList.remove('active'),950)};
 const restart=()=>{clearInterval(timer);timer=setInterval(moveNext,3800)};
 prevBtn?.addEventListener('click',onPrevClick);nextBtn?.addEventListener('click',onNextClick);grid.addEventListener('click',onDiscountCardClick);
 // Swipe is enabled, but a normal click is NEVER treated as a drag.
 grid.style.touchAction='pan-y';
 const pointerDown=e=>{if(e.pointerType==='mouse'&&e.button!==0)return;clearInterval(timer);dragging=true;moved=false;startX=e.clientX;startY=e.clientY;lastX=e.clientX;startTranslate=-index*step();grid.classList.remove('is-dragging');grid.style.transition='none'};
 const pointerMove=e=>{if(!dragging)return;const dx=e.clientX-startX,dy=e.clientY-startY;if(Math.abs(dy)>Math.abs(dx)+10){dragging=false;grid.classList.remove('is-dragging');restart();return}if(Math.abs(dx)<8)return;moved=true;grid.classList.add('is-dragging');lastX=e.clientX;const resistance=0.78;let px=startTranslate+dx*resistance;const max=-Math.max(0,items.length-1)*step();if(px>35)px=35+(px-35)*.25;if(px<max-35)px=max-35+(px-(max-35))*.25;render(false,px)};
 const pointerUp=()=>{if(!dragging)return;dragging=false;grid.classList.remove('is-dragging');const dx=lastX-startX;const threshold=Math.min(75,Math.max(42,step()*.18));if(moved){window.__discountSuppressClickUntil=Date.now()+320;if(Math.abs(dx)>=threshold){if(dx<0)moveNext();else movePrev()}else render(true)}else{render(true)}setTimeout(restart,900)};
 const onVisibility=()=>{if(document.hidden)clearInterval(timer);else restart()};
 const onPointerLeave=e=>{if(e.pointerType==='mouse'&&dragging&&moved)pointerUp()};
 grid.addEventListener('pointerdown',pointerDown,{passive:true});grid.addEventListener('pointermove',pointerMove,{passive:true});grid.addEventListener('pointerup',pointerUp,{passive:true});grid.addEventListener('pointercancel',pointerUp,{passive:true});document.addEventListener('visibilitychange',onVisibility);grid.addEventListener('pointerleave',onPointerLeave);
 const onResize=()=>render(false);window.addEventListener('resize',onResize);
 render(false);restart();
 const observer=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting)e.target.classList.add('visible')}),{threshold:.1});
 $$('.figma-product-card').forEach(el=>observer.observe(el));
 grid.__discountCleanup=()=>{clearInterval(timer);observer.disconnect();document.removeEventListener('visibilitychange',onVisibility);window.removeEventListener('resize',onResize);grid.removeEventListener('pointerdown',pointerDown);grid.removeEventListener('pointermove',pointerMove);grid.removeEventListener('pointerup',pointerUp);grid.removeEventListener('pointercancel',pointerUp);grid.removeEventListener('pointerleave',onPointerLeave);grid.removeEventListener('click',onDiscountCardClick);prevBtn?.removeEventListener('click',onPrevClick);nextBtn?.removeEventListener('click',onNextClick);};
}
function refreshDiscountSliderLanguage(grid,items){const cards=grid.querySelectorAll('.figma-product-card');cards.forEach((el,i)=>{const p=items[i%items.length];const name=el.querySelector('.product-name'),price=el.querySelector('.product-price strong'),old=el.querySelector('.product-price del'),badge=el.querySelector('.discount-badge');if(name)name.textContent=productName(p);if(price)price.textContent=money(p.price);if(old)old.textContent=money(p.old);if(badge)badge.textContent=`${Math.round((1-p.price/p.old)*100)}% ${getLang()==='en'?'OFF':'خصم'}`})}
function initHeader(){refreshBadges();document.addEventListener('click',e=>{
 const lang=e.target.closest('[data-lang-toggle]');if(lang){e.preventDefault();setLang(getLang()==='ar'?'en':'ar');applyLanguage(true);renderCards();renderWishlist();renderCart();initProduct();initCheckout();initConfirmation();initDiscountSlider();initRevealAnimations();initClothesAnimations();return}
 const a=e.target.closest('[data-add]');if(a){e.preventDefault();e.stopPropagation();addToCart(Number(a.dataset.add));return}
 const w=e.target.closest('[data-wish]');if(w){e.preventDefault();e.stopPropagation();toggleWish(Number(w.dataset.wish),w);return}
 const r=e.target.closest('[data-remove]');if(r){const key=r.dataset.remove;saveCart(getCart().filter(x=>x.key!==key));renderCart();refreshBadges();return}
 const inc=e.target.closest('[data-inc]');if(inc){const c=getCart(),x=c.find(x=>x.key===inc.dataset.inc),p=x&&getProduct(x.id);if(x&&p){const max=sizeStock(p,x.size||'M');if(Number(x.qty||0)>=max){toast(getLang()==='en'?`Only ${max} left in size ${x.size||'M'}`:`المتاح من مقاس ${x.size||'M'} هو ${max} قطعة بس`);return}x.qty++;saveCart(c);renderCart();refreshBadges()}return}
 const dec=e.target.closest('[data-dec]');if(dec){const c=getCart(),x=c.find(x=>x.key===dec.dataset.dec);if(x){x.qty--;const n=x.qty>0?c:c.filter(y=>y.key!==x.key);saveCart(n);renderCart();refreshBadges()}return}
 });}
function initProduct(){const el=$('[data-product]');if(!el)return;const p=getProduct(new URLSearchParams(location.search).get('id')||el.dataset.product);if(!p)return;const isMain=Number(p.id)===1;const crumb=$('.breadcrumbs');if(crumb){const enCrumb=getLang()==='en';const typeLink=p.type==='accessories'?'accessories.html':'clothes.html';const typeName=enCrumb?(p.type==='accessories'?'Accessories':'Clothes'):(p.type==='accessories'?'اكسسوارات':'ملابس');crumb.innerHTML=`<a href="home.html">${enCrumb?'Home':'الرئيسية'}</a><span>/</span><a href="${typeLink}">${typeName}</a><span>/</span><span>${productName(p)}</span>`;}const meta=isMain?{nameAr:'فستان كتان أنيق',nameEn:'Elegant Linen Dress',collectionAr:'كوليكشن صيف ٢٠٢٦ الفاخر',collectionEn:'Luxury Summer 2026 Collection',price:450,descriptionAr:'تألقي بهذا الفستان المصنوع من أجود خامات الكتان الطبيعي المريح والمنعش، بتميز بقصة مريحة وتفاصيل أنثوية رقيقة تضفي لمسة من الرقي على إطلالتك اليومية أو في المناسبات الخاصة. صمم بعناية فائقة ليمنحك شعورًا بالراحة والجمال.',descriptionEn:'Made from breathable natural linen with a flattering cut and delicate feminine details, this dress brings an effortless elegant feel to everyday looks and special occasions.',colors:[['#e8a2b8','Pink','وردي'],['#ead7ae','Beige','بيج'],['#e3b632','Gold','ذهبي'],['#5b4038','Brown','بني']],sizes:['S','M','L','XL']}:{nameAr:p.name,nameEn:PRODUCT_EN[p.id]||p.name,collectionAr:'تفاصيل المنتج',collectionEn:'Product details',price:p.price,descriptionAr:'قطعة مميزة بتصميم أنيق وجودة عالية، مناسبة لإطلالتك اليومية والمناسبات. اختاري المقاس واللون ثم أضيفيها للسلة.',descriptionEn:'A stylish, high-quality piece designed for everyday looks and special occasions. Choose your size and color, then add it to your cart.',colors:normalizeProductColors(p.colors),sizes:Array.isArray(p.sizes)?p.sizes:String(p.sizes||'S, M, L, XL').split(',').map(x=>x.trim()).filter(Boolean),sizeOptions:Array.isArray(p.sizeOptions)?p.sizeOptions.map(x=>typeof x==='string'?{name:x,enabled:true}:x):String(p.sizes||'S, M, L, XL').split(',').map(x=>({name:x.trim(),enabled:true})).filter(x=>x.name)};
 if(Array.isArray(meta.sizeOptions)){meta.sizeOptions=meta.sizeOptions.map(x=>({...x,stock:sizeStock(p,x.name)}));}

 const en=getLang()==='en',firstAvailableSize=(meta.sizeOptions.find(x=>x.enabled!==false&&Number(x.stock||0)>0)||meta.sizeOptions.find(x=>x.enabled!==false)||meta.sizeOptions[0]||{name:'M'}).name;el.innerHTML=`<div class="detail-image-wrap"><div class="detail-image-gallery">${[...(Array.isArray(p.images)?p.images:[]),p.img].filter(Boolean).filter((v,i,a)=>a.indexOf(v)===i).map((u,i)=>`<button type="button" class="detail-thumb ${i===0?'active':''}" data-detail-image="${i}"><img src="${esc(u)}" alt="${en?meta.nameEn:meta.nameAr} ${i+1}"></button>`).join('')}</div><div class="detail-image"><img src="${p.img}" data-main-product-image alt="${en?meta.nameEn:meta.nameAr}"></div><button class="detail-heart ${getWish().includes(p.id)?'on':''}" data-wish="${p.id}" aria-label="Wishlist">♡</button></div><div class="detail-info"><div class="detail-kicker">${en?meta.collectionEn:meta.collectionAr}</div><h1>${en?meta.nameEn:meta.nameAr}</h1><div class="detail-price">${money(meta.price)}</div><p class="detail-description">${en?meta.descriptionEn:meta.descriptionAr}</p><div class="detail-status-row"><span>${tr('available')}:</span><strong class="status ${p.available?'':'off'}">${p.available?tr('available'):tr('notAvailableLabel')}</strong></div><div class="options detail-option"><label>${tr('size')}:</label><div class="chips size-chips">${meta.sizeOptions.map((x,i)=>{const sold=Number(x.stock||0)<=0;return `<button class="chip ${x.enabled!==false&&!sold?'':'size-disabled'} ${x.enabled!==false&&!sold&&x.name===firstAvailableSize?'active':''}" data-size="${esc(x.name)}" ${x.enabled===false||sold?'disabled':''}><span class="size-label">${esc(x.name)}</span>${getStoreSettings().showStockBySize!==false?`<small class="size-stock-count">${sold?(en?'Out of stock':'نفد'):(en?`${Number(x.stock)} left`:`متبقي ${Number(x.stock)}`)}</small>`:''}${x.enabled===false||sold?'<span class="size-x">×</span>':''}</button>`}).join('')}</div></div><div class="options detail-option"><label>${tr('color')}:</label><div class="color-chips">${meta.colors.map((c,i)=>`<button class="color-chip ${i===0?'active':''}" data-color="${i}" data-color-name="${esc(c.name)}" style="--chip:${esc(c.hex)}" aria-label="${esc(c.name)}"></button>`).join('')}</div></div><div class="purchase-row"><div class="qty detail-qty"><button data-pdec>−</button><span data-pqty>1</span><button data-pinc>+</button></div><button class="btn detail-add" data-padd ${!p.available?'disabled':''}>${p.available?tr('add'):tr('unavailable')}</button></div><div class="shipping-note">${en?'* Shipping is available to all governorates at suitable rates. Contact support for any questions.':'* الشحن متوفر لكافة المحافظات بأسعار رمزية ومناسبة. تواصل مع الدعم لأي استفسار.'}</div></div>`;
 const galleryImages=[...(Array.isArray(p.images)?p.images:[]),p.img].filter(Boolean).filter((v,i,a)=>a.indexOf(v)===i);let galleryIndex=0;const setGalleryImage=i=>{if(!galleryImages.length)return;galleryIndex=(i+galleryImages.length)%galleryImages.length;const im=$('[data-main-product-image]');if(im)im.src=galleryImages[galleryIndex];$$('[data-detail-image]').forEach((x,j)=>x.classList.toggle('active',j===galleryIndex));};$$('[data-detail-image]').forEach(btn=>btn.addEventListener('click',()=>setGalleryImage(Number(btn.dataset.detailImage))));const galleryWrap=$('.detail-image');if(galleryWrap&&galleryImages.length>1){galleryWrap.insertAdjacentHTML('beforeend',`<button type="button" class="gallery-nav gallery-prev" aria-label="الصورة السابقة">‹</button><button type="button" class="gallery-nav gallery-next" aria-label="الصورة التالية">›</button>`);$('.gallery-prev',galleryWrap).onclick=()=>setGalleryImage(galleryIndex-1);$('.gallery-next',galleryWrap).onclick=()=>setGalleryImage(galleryIndex+1);let sx=0,sy=0;galleryWrap.addEventListener('touchstart',e=>{const t=e.changedTouches[0];sx=t.clientX;sy=t.clientY},{passive:true});galleryWrap.addEventListener('touchend',e=>{const t=e.changedTouches[0],dx=t.clientX-sx,dy=t.clientY-sy;if(Math.abs(dx)>45&&Math.abs(dx)>Math.abs(dy)){setGalleryImage(galleryIndex+(dx<0?1:-1))}},{passive:true});}
 let q=1,selectedSize=(meta.sizeOptions.find(x=>x.enabled!==false&&Number(x.stock||0)>0)||meta.sizeOptions.find(x=>x.enabled!==false)||meta.sizeOptions[0]||{name:'M'}).name,selectedColor='0',selectedColorName=en?'Pink':'وردي';const qel=$('[data-pqty]');$('[data-pinc]')?.addEventListener('click',()=>{const max=sizeStock(p,selectedSize);if(q<max){q++;qel.textContent=q}else toast(getLang()==='en'?`Only ${max} left in size ${selectedSize}`:`المتاح من مقاس ${selectedSize} هو ${max} قطعة بس`)});$('[data-pdec]')?.addEventListener('click',()=>{q=Math.max(1,q-1);qel.textContent=q});$('[data-padd]')?.addEventListener('click',()=>addToCart(p.id,q,selectedSize,selectedColor,selectedColorName));
 $$('.size-chips .chip:not(:disabled)').forEach(b=>b.addEventListener('click',()=>{$$('.size-chips .chip').forEach(x=>x.classList.remove('active'));b.classList.add('active');selectedSize=b.dataset.size;q=Math.min(q,Math.max(1,sizeStock(p,selectedSize)));qel.textContent=q}));$$('.color-chip').forEach(b=>b.addEventListener('click',()=>{$$('.color-chip').forEach(x=>x.classList.remove('active'));b.classList.add('active');selectedColor=b.dataset.color;selectedColorName=b.dataset.colorName}));
 const rg=$('[data-related]');if(rg){let candidates=PRODUCTS.filter(x=>x.id!==p.id&&productAllowedInCurrentContext(x));for(let i=candidates.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[candidates[i],candidates[j]]=[candidates[j],candidates[i]]}const related=candidates.slice(0,4);rg.innerHTML=related.map(x=>`<article class="related-card"><a href="product.html?id=${x.id}"><div class="related-media"><img src="${x.img}" alt="${productName(x)}"><button class="related-heart" data-wish="${x.id}" aria-label="Wishlist">♡</button></div><h3>${productName(x)}</h3><div class="related-price">${money(x.price)}</div></a><button type="button" class="related-add" data-add="${x.id}">${tr('add')}</button></article>`).join('')}
}
function initSearch(){const form=$('#searchForm'),input=$('#q');if(!form||!input)return;const results=$('.search-results');let sug=document.querySelector('.search-suggestions');if(!sug){sug=document.createElement('div');sug.className='search-suggestions';input.parentElement.appendChild(sug)}const getMatches=q=>PRODUCTS.filter(p=>productAllowedInCurrentContext(p)&&((p.name||'').toLowerCase().includes(q)||(p.nameEn||'').toLowerCase().includes(q))).slice(0,6);const drawSuggestions=()=>{const q=input.value.trim().toLowerCase();if(!q){sug.innerHTML='';sug.hidden=true;return}const list=getMatches(q);sug.innerHTML=list.map(p=>`<a href="product.html?id=${p.id}"><img src="${p.img}" alt=""><span><b>${productName(p)}</b><small>${money(p.price)}</small></span></a>`).join('');sug.hidden=!list.length};input.addEventListener('input',drawSuggestions);input.addEventListener('focus',drawSuggestions);document.addEventListener('click',e=>{if(!form.contains(e.target)){sug.hidden=true}});form.addEventListener('submit',e=>{e.preventDefault();const q=input.value.trim().toLowerCase();sug.hidden=true;const list=PRODUCTS.filter(p=>productAllowedInCurrentContext(p)&&((p.name||'').toLowerCase().includes(q)||(p.nameEn||'').toLowerCase().includes(q)));results.innerHTML=list.length?list.map(card).join(''):`<div class="empty" style="grid-column:1/-1"><div class="emoji">⌕</div><h2>${getLang()==='en'?'No results':'مفيش نتائج'}</h2><p>${getLang()==='en'?'Try another search term.':'جربي كلمة بحث مختلفة.'}</p></div>`})}
function initConfirmation(){const box=$('#confirmationItems');if(!box)return;const data=JSON.parse(localStorage.getItem(ORDER_KEY)||'null');const order=new URLSearchParams(location.search).get('order')||data?.order||'GH-000000';$('#orderNo')?.replaceChildren(document.createTextNode(order));if(!data||!data.items?.length)return;const en=getLang()==='en';box.innerHTML=`<h3>${en?'Order details':'تفاصيل الطلب'}</h3>`+data.items.map(i=>{const p=getProduct(i.id);return `<div class="confirmation-row"><span>${p?productName(p):(en?'Product':'منتج')} × ${i.qty}<small>${tr('size')}: ${i.size||'M'} · ${tr('color')}: ${i.colorName|| (en?'Pink':'وردي')}</small></span><strong>${money((p?.price||0)*i.qty)}</strong></div>`}).join('')}
const SHEET_WEB_APP_URL='https://script.google.com/macros/s/AKfycbzJljrxc4422H-6zmTVaXDmSz5sYx305m-3gEBk_TFHZFxvClS7dUAr67l08t8J_Vh9/exec';
async function sendOrderToGoogleSheet(data){if(!SHEET_WEB_APP_URL || SHEET_WEB_APP_URL.includes('PASTE_YOUR')) return false;try{await fetch(SHEET_WEB_APP_URL,{method:'POST',mode:'no-cors',headers:{'Content-Type':'text/plain;charset=utf-8'},body:JSON.stringify(data),keepalive:true});return true}catch(err){console.warn('Google Sheets order sync failed',err);return false}}
async function sendOrderToSupabase(order){
 if(!window.GH_SUPABASE_READY||!window.GH_SB)return {ok:false,unavailable:true};
 try{
   const {data,error}=await window.GH_SB.rpc('create_order_with_inventory',{p_order_number:String(order.order),p_created_at:order.createdAt,p_payload:order});
   if(error){
     // Backward-compatible fallback until the new SQL function is installed.
     if(/create_order_with_inventory|does not exist|function .* does not exist/i.test(error.message||'')){
       const direct=await window.GH_SB.from('orders').insert({order_number:String(order.order),created_at:order.createdAt,status:'جديد',paid:false,deleted:false,payload:order});
       if(direct.error)throw direct.error;
       return {ok:true,fallback:true,payload:order};
     }
     throw error;
   }
   if(!data?.ok)return {ok:false,message:data?.message||'المخزون غير متاح بالكمية المطلوبة'};
   if(Array.isArray(data.products)&&data.products.length&&typeof PRODUCTS!=='undefined'){
     PRODUCTS.splice(0,PRODUCTS.length,...data.products);
     try{localStorage.setItem('girlhub_admin_products',JSON.stringify(data.products));localStorage.setItem('girlhub_remote_products',JSON.stringify(data.products));}catch(_){}
     document.dispatchEvent(new CustomEvent('girlhub:data-updated',{detail:{products:data.products}}));
   }
   return {ok:true,payload:data.payload||{...order,inventoryState:'deducted'}};
 }catch(err){console.warn('Supabase order/inventory sync failed',err);return {ok:false,message:'تعذر تأكيد المخزون والطلب: '+(err?.message||'حاولي تاني')}}
}
function applyManagedCheckoutSettings(){const s=getStoreSettings();const sel=$('#paymentMethod');if(sel&&Array.isArray(s.paymentMethods)){const current=sel.value;sel.innerHTML='<option value="">اختاري طريقة الدفع</option>'+s.paymentMethods.filter(x=>x.enabled!==false).map(x=>`<option value="${esc(x.value)}">${esc(x.label)}</option>`).join('');if(s.paymentMethods.some(x=>x.value===current&&x.enabled!==false))sel.value=current;}}
function initCheckout(){
 const f=$('#checkoutForm');if(!f)return;applyManagedCheckoutSettings();
 let amounts=checkoutAmounts();
 const govSelect=$('#governorate');if(govSelect)govSelect.addEventListener('change',()=>{amounts=checkoutAmounts();updateCheckoutTotal();});
 const paymentSelect=$('#paymentMethod'),paymentNote=$('#paymentNote');
 if(paymentSelect&&paymentNote){const updatePaymentNote=()=>{const selectedText=(paymentSelect.options[paymentSelect.selectedIndex]?.text||'').trim();paymentNote.hidden=!(paymentSelect.value==='كاش'||selectedText==='Cash'||selectedText==='كاش'||paymentSelect.value==='انستا باي'||selectedText==='InstaPay'||selectedText==='انستا باي');};paymentSelect.addEventListener('change',updatePaymentNote);updatePaymentNote();}
 const orderList=$('.checkout-items');if(orderList)orderList.innerHTML=amounts.valid.map(i=>{const p=getProduct(i.id);return `<div class="checkout-item"><span>${productName(p)} × ${i.qty}<small>${tr('size')}: ${i.size||'M'} · ${tr('color')}: ${cartColorName(i)}</small></span><strong>${money(p.price*i.qty)}</strong></div>`}).join('');updateCheckoutTotal();
 const promoBtn=$('#applyPromo');
 if(promoBtn&&!promoBtn.dataset.bound){promoBtn.dataset.bound='1';promoBtn.addEventListener('click',()=>{const input=$('#promoCode'),code=(input?.value||'').trim().toUpperCase(),msg=$('#promoMessage');const promo=PROMO_CODES.find(x=>x.code===code&&x.enabled);if(!promo){if(msg)msg.textContent=getLang()==='en'?'Invalid or disabled promo code':'كود الخصم غير صحيح أو متوقف';sessionStorage.removeItem('girlhub_applied_promo');updateCheckoutTotal();return}if(promo.startsAt&&new Date(promo.startsAt+'T00:00:00')>new Date()){if(msg)msg.textContent='الكود لسه ما بدأش';return}if(promo.expiresAt&&new Date(promo.expiresAt)<new Date()){if(msg)msg.textContent=getLang()==='en'?'This promo code has expired':'مدة الكود انتهت';return}if(promo.minOrder&&amounts.subtotal<promo.minOrder){if(msg)msg.textContent=`الحد الأدنى للطلب ${money(promo.minOrder)}`;return}if(promo.maxUses>0&&Number(promo.used||0)>=promo.maxUses){if(msg)msg.textContent=getLang()==='en'?'This code reached its usage limit':'الكود وصل للحد الأقصى للاستخدام';return}sessionStorage.setItem('girlhub_applied_promo',JSON.stringify({code}));if(msg)msg.textContent=getLang()==='en'?'Promo code applied successfully':'تم تفعيل كود الخصم بنجاح';updateCheckoutTotal();});}
 if(f.dataset.bound)return;f.dataset.bound='1';
 f.addEventListener('submit',async e=>{
  e.preventDefault();amounts=checkoutAmounts();if(!amounts.valid.length){toast(tr('emptyCart'));return;}
  const applied=getAppliedPromo();const order='GH-'+Math.floor(100000+Math.random()*900000);const name=$('#customerName')?.value.trim()||'';const phone=$('#customerPhone')?.value.trim()||'';const governorate=$('#governorate')?.value||'';const address=$('#address')?.value.trim()||'';const payment=$('#paymentMethod')?.value||'';
  const btn=f.querySelector('button[type=submit]');if(btn){btn.disabled=true;btn.dataset.originalText=btn.textContent;btn.textContent=getLang()==='en'?'Sending...':'جاري إرسال الطلب...';}
  let centralPromo={ok:true,discount:amounts.promoDiscount,promoPercent:amounts.promoPercent};
  if(applied){centralPromo=await reservePromo(applied,amounts.subtotal,phone,order);if(!centralPromo.ok){const msg=$('#promoMessage');if(msg)msg.textContent=centralPromo.message||'الكود غير متاح';if(btn){btn.disabled=false;btn.textContent=btn.dataset.originalText||'تأكيد الطلب';}return;}}
  if(applied){amounts.promoDiscount=Number(centralPromo.discount||0);amounts.promoPercent=Number(centralPromo.promoPercent||0);amounts.discount=Math.min(amounts.subtotal,amounts.autoDiscount+amounts.promoDiscount);amounts.total=Math.max(0,amounts.subtotal+amounts.shipping-amounts.discount);}
  const items=amounts.valid.map(i=>{const p=getProduct(i.id);return {id:i.id,name:productName(p),qty:i.qty,size:i.size||'M',color:i.color||'0',colorName:cartColorName(i),unitPrice:p.price,lineTotal:p.price*i.qty}});
  let data={order,createdAt:new Date().toISOString(),customer:{name,phone,governorate,address,payment},items,subtotal:amounts.subtotal,shipping:amounts.shipping,discount:amounts.discount,autoDiscount:amounts.autoDiscount,promoCode:applied?.code||'',promoPercent:amounts.promoPercent,promoDiscount:amounts.promoDiscount,total:amounts.total,currency:'EGP'};
  localStorage.setItem(ORDER_KEY,JSON.stringify(data));sessionStorage.removeItem('girlhub_applied_promo');
  const supaResult=await sendOrderToSupabase(data);
  if(!supaResult.ok&&!supaResult.unavailable){
    const msg=supaResult.message||'تعذر تأكيد الطلب بسبب المخزون. حاولي تاني.';
    toast(msg);
    if(btn){btn.disabled=false;btn.textContent=btn.dataset.originalText||'تأكيد الطلب';}
    return;
  }
  if(supaResult.payload){data=supaResult.payload;localStorage.setItem(ORDER_KEY,JSON.stringify(data));}
  await sendOrderToGoogleSheet(data);
  localStorage.removeItem(CART_KEY);location.href=`confirmation.html?order=${order}`;
 });
}
function applyLanguage(){const lang=getLang();document.documentElement.lang=lang;document.documentElement.dir=LANG[lang].dir;$$('[data-lang-toggle]').forEach(b=>b.textContent=lang==='ar'?'EN':'AR');const map={
 'الرئيسية':'Home','ملابس':'Clothes','اكسسوارات':'Accessories','تواصل معنا':'Contact us','المفضلة':'Wishlist','البحث':'Search','خصومات':'Discounts','عرض الكل ←':'View all →','عايزه إيه؟':'What are you looking for?','تسوق الآن':'Shop now','الجديد منووو':'New collection','وصل حديثًا':'New arrivals','سلة التسوق':'Shopping cart','راجعي طلبك قبل إتمام الشراء':'Review your order before checkout','ملخص الطلب':'Order summary','الإجمالي الفرعي':'Subtotal','الشحن':'Shipping','الإجمالي':'Total','إتمام الطلب':'Checkout','إتمام الطلب':'Checkout','بيانات العميل':'Customer details','الاسم بالكامل':'Full name','رقم الهاتف':'Phone number','المحافظة':'Governorate','العنوان بالتفصيل':'Full address','طريقة الدفع':'Payment method','الدفع عند الاستلام':'Cash on delivery','كاش':'Cash','انستا باي':'InstaPay','تأكيد الطلب':'Place order','كود الخصم الترويجي':'Promo code','تطبيق الكود':'Apply code','قيمة الخصم':'Discount amount','اختاري اللي يعجبك':'Find your favorites','سلاسل':'Necklaces','خواتم':'Rings','أساور':'Bracelets','ساعات':'Watches','شنط':'Bags','نظارات':'Sunglasses','اختاري من مجموعة متنوعة من السلاسل الراقية':'Explore elegant necklaces','تفاصيل دقيقة تمنح إطلالتك لمسة فريدة':'Delicate details for your look','اختاري من التصاميم البسيطة أو المزخرفة':'Simple or statement designs','اختاري ساعة تناسب أسلوبك اليومي':'Find a watch for every day','اختاري حقيبة تناسب كل مناسبة':'A bag for every occasion','اختاري نظارات شمسية عصرية ومميزة':'Explore modern sunglasses','تصفح المزيد ←':'Explore more →','الإجمالي شامل الشحن':'Total including shipping','تم تأكيد طلبك بنجاح':'Your order has been confirmed','شكرًا لاختيارك Girl Hub. هنبدأ تجهيز طلبك ونتواصل معاكي قريبًا.':'Thank you for choosing Girl Hub. We will prepare your order and contact you soon.','العودة للتسوق':'Continue shopping','تابعينا علي صفحات السوشيال ميديا يقمررر':'Follow us on social media','صمم بكل حب لـ GIRL HUB © ٢٠٢٦':'Made with love for GIRL HUB © 2026','جميع الحقوق محفوظة لزينب محمود':'All rights reserved to Zeinab Mahmoud','Owned By : Zeinab Mahmoud':'Owned By : Zeinab Mahmoud','الرئيسية':'Home','قريبًا':'Coming soon','SOON':'SOON','متوفر':'Available','غير متوفر':'Unavailable','جديد':'New','خصم':'Discount','العروض والخصومات':'Offers & Discounts','الأقسام':'Categories','منتجات مشابهة قد تعجبك':'You may also like','تفاصيل المنتج':'Product details','كوليكشن صيف ٢٠٢٦ الفاخر':'Luxury Summer 2026 Collection','الشحن متوفر لكافة المحافظات بأسعار رمزية ومناسبة. تواصل مع الدعم لأي استفسار.':'Shipping is available to all governorates at suitable rates. Contact support for any questions.','* الشحن متوفر لكافة المحافظات بأسعار رمزية ومناسبة. تواصل مع الدعم لأي استفسار.':'* Shipping is available to all governorates at suitable rates. Contact support for any questions.','اختاري المقاس واللون ثم أضيفيها للسلة.':'Choose your size and color, then add it to your cart.','قطعة مميزة بتصميم أنيق وجودة عالية، مناسبة لإطلالتك اليومية والمناسبات. اختاري المقاس واللون ثم أضيفيها للسلة.':'A stylish, high-quality piece designed for everyday looks and special occasions. Choose your size and color, then add it to your cart.','خصم':'Discount','المقاس':'Size','اللون':'Color','تابعينا':'Follow us','تواصلي معنا':'Contact us'};
 if(lang==='en')$$('body *').forEach(el=>{if(el.children.length===0){const txt=el.textContent.trim();if(map[txt])el.textContent=map[txt]}});
 if(lang==='ar'){const reverse={};Object.entries(map).forEach(([a,e])=>reverse[e]=a);$$('body *').forEach(el=>{if(el.children.length===0){const txt=el.textContent.trim();if(reverse[txt])el.textContent=reverse[txt]}})}
 if($('#promoCode'))$('#promoCode').placeholder=lang==='en'?'Enter promo code':'اكتبي كود الخصم';
 if($('#customerName'))$('#customerName').placeholder=lang==='en'?'Full name':'الاسم بالكامل';
 if($('#customerPhone'))$('#customerPhone').placeholder=lang==='en'?'Phone number':'رقم الهاتف';
 if($('#address'))$('#address').placeholder=lang==='en'?'Full address':'العنوان بالتفصيل';
 refreshBadges();
}
function initRevealAnimations(){
 const els=$$('.gh-reveal'); if(!els.length)return;
 els.forEach((el,i)=>{el.style.setProperty('--delay',`${i*90}ms`);el.classList.remove('visible')});
 const show=el=>{el.classList.add('visible')};
 if('IntersectionObserver' in window){
  const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){show(entry.target);observer.unobserve(entry.target)}}),{threshold:.12,rootMargin:'0px 0px -40px 0px'});
  els.forEach(el=>observer.observe(el));
 }else els.forEach(show);
}
function initClothesAnimations(){
 const sections=$$('.clothes-category');
 if(!sections.length)return;
 sections.forEach((section,i)=>{section.classList.add('clothes-motion');section.style.setProperty('--section-delay',`${i*120}ms`);section.querySelectorAll('.card').forEach((card,j)=>{card.classList.add('clothes-card-motion');card.style.setProperty('--card-delay',`${j*70}ms`)})});
 const targets=$$('.clothes-category, .clothes-card-motion');
 const reveal=el=>el.classList.add('in-view');
 if('IntersectionObserver' in window){
  const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){reveal(entry.target);observer.unobserve(entry.target)}}),{threshold:.1,rootMargin:'0px 0px -30px 0px'});
  targets.forEach(el=>observer.observe(el));
 }else targets.forEach(reveal);
}
function init(){initHeader();renderCards();renderWishlist();renderCart();initProduct();initSearch();initCheckout();initConfirmation();initDiscountSlider();applyLanguage();initRevealAnimations();initClothesAnimations();const hero=document.querySelector('.gh-hero');if(hero&&!hero.dataset.heroReady){hero.dataset.heroReady='1';renderHero([{img:'assets/images/hero.jpg',title:'الجديد من Girl Hub',subtitle:'تألقي بتشكيلتنا الجديدة',button:'تسوقي الآن',url:'new-products.html'},{img:'assets/images/hero2.jpg',title:'أناقة مختلفة كل يوم',subtitle:'اختاري القطعة اللي شبهك',button:'اكتشفي الجديد',url:'clothes.html'}])}}

function initPageTransitions(){
 document.body.classList.add('gh-page-ready');
 document.addEventListener('click',e=>{
   if(window.__discountSuppressClickUntil&&Date.now()<window.__discountSuppressClickUntil){e.preventDefault();e.stopPropagation();return;}
   const a=e.target.closest('a');
   if(!a)return;
   const href=a.getAttribute('href');
   if(!href||href.startsWith('#')||href.startsWith('mailto:')||href.startsWith('tel:')||a.target==='_blank'||a.hasAttribute('download'))return;
   let url;try{url=new URL(href,location.href)}catch{return}
   if(url.origin!==location.origin)return;
   if(a.closest('#discountGrid'))return;
   const closedCats=getManagedCategories().filter(c=>c.enabled===false);
   const hrefText=url.pathname.toLowerCase()+url.search.toLowerCase();
   const closedLink=closedCats.find(c=>{const t=String(c.type||'').toLowerCase(),id=String(c.id||'').toLowerCase();if((t==='clothes'||id==='clothes')&&hrefText.includes('clothes.html'))return true;if((t==='accessories'||id==='accessories')&&hrefText.includes('accessories.html'))return true;if(url.pathname.toLowerCase().endsWith('category.html')){const q=(url.searchParams.get('cat')||'').toLowerCase();return q===t||q===id;}return false;});
   if(closedLink){e.preventDefault();e.stopPropagation();toast(closedLink.message||'SOON');return;}
   if(url.pathname===location.pathname&&url.search===location.search)return;
   if(e.defaultPrevented)return;
   e.preventDefault();
   document.body.classList.remove('gh-page-ready');
   document.body.classList.add('gh-page-leave');
   setTimeout(()=>{location.href=url.href},280);
 },true);
}


function renderHero(banners){const hero=document.querySelector('.gh-hero');if(!hero)return;const safe=banners.filter(b=>b&&b.img);if(!safe.length)return;hero.dataset.heroReady='1';hero.innerHTML=`<div class="gh-hero-slides">${safe.map((b,i)=>`<div class="gh-hero-slide ${i===0?'is-active':''}"><img class="gh-hero-bg" src="${esc(b.img)}" ${imageStyle(b)} alt="${esc(b.title||'Girl Hub')}"><div class="gh-hero-shade"></div><div class="gh-hero-content"><div class="gh-hero-eyebrow">GIRL HUB / ٢٠٢٦</div><h1>${esc(b.title||'')}</h1><p>${esc(b.subtitle||'')}</p><a class="gh-hero-btn" href="${esc(b.url||'new-products.html')}">${esc(b.button||'تسوق الآن')} <span>←</span></a></div></div>`).join('')}</div><div class="gh-hero-dots" aria-label="تبديل صور الهيرو">${safe.map((_,i)=>`<i class="${i===0?'active':''}" data-hero-dot="${i}"></i>`).join('')}</div><button class="gh-hero-nav gh-hero-prev" type="button" aria-label="الصورة السابقة">‹</button><button class="gh-hero-nav gh-hero-next" type="button" aria-label="الصورة التالية">›</button>`;let index=0,timer;const slides=[...hero.querySelectorAll('.gh-hero-slide')],dots=[...hero.querySelectorAll('[data-hero-dot]')];const show=n=>{index=(n+safe.length)%safe.length;slides.forEach((x,i)=>x.classList.toggle('is-active',i===index));dots.forEach((x,i)=>x.classList.toggle('active',i===index));hero.classList.remove('hero-pulse');void hero.offsetWidth;hero.classList.add('hero-pulse')};const restart=()=>{clearInterval(timer);if(safe.length>1)timer=setInterval(()=>show(index+1),6000)};hero.querySelector('.gh-hero-next').onclick=()=>{show(index+1);restart()};hero.querySelector('.gh-hero-prev').onclick=()=>{show(index-1);restart()};dots.forEach((d,i)=>d.onclick=()=>{show(i);restart()});hero.classList.add('loaded');show(0);restart();}


function renderManagedCategoryTiles(){
 const settings=getStoreSettings();
 let tiles=Array.isArray(settings.categoryTiles)?settings.categoryTiles:[];
 if(!tiles.length)return;
 tiles=tiles.map(x=>({...x,group:x.group||(String(x.type||x.id).match(/^(shirts|dresses|pants)$/i)?'clothes':'accessories')}));
 const accessoryGrid=document.querySelector('.accessories-grid');
 if(accessoryGrid){
   accessoryGrid.querySelectorAll('.accessory-feature').forEach(card=>{
     const type=card.dataset.categoryType||new URL(card.href,location.href).searchParams.get('cat')||'';
     const tile=tiles.find(x=>String(x.type||x.id)===String(type));
     if(tile){card.style.display='';card.classList.toggle('gh-tile-sealed',tile.enabled===false);card.dataset.categoryClosed=tile.enabled===false?'true':'false';card.dataset.sealMessage=tile.closedMessage||'SOON';const img=card.querySelector('img');if(img){img.src=tile.img||img.src;img.setAttribute('style',`object-position:${Number(tile.imagePosX??50)}% ${Number(tile.imagePosY??50)}%;transform:scale(${Math.max(1,Number(tile.imageZoom||100)/100)})`);}const st=card.querySelector('strong'),sm=card.querySelector('small');if(st)st.textContent=tile.name||st.textContent;if(sm)sm.textContent=tile.subtitle||sm.textContent;}
   });
   const visible=tiles.filter(x=>x.group==='accessories');
   if(visible.length && accessoryGrid.children.length===0){
     accessoryGrid.innerHTML=visible.map(x=>`<a class="accessory-feature" href="category.html?cat=${encodeURIComponent(x.type||x.id)}" data-category-type="${esc(x.type||x.id)}"><img src="${esc(x.img||'assets/images/necklace.jpg')}" alt="${esc(x.name||'قسم')}"><span class="accessory-shade"></span><span class="accessory-copy"><strong>${esc(x.name||'قسم')}</strong><small>${esc(x.subtitle||'اكتشفي المجموعة')}</small></span><b class="accessory-btn">تصفح المزيد ←</b></a>`).join('');
   }
 }
 document.querySelectorAll('.clothes-category').forEach(section=>{
   const link=section.querySelector('.clothes-category-head a');
   const cat=link?new URL(link.href,location.href).searchParams.get('cat'):'';
   const tile=tiles.find(x=>String(x.type||x.id)===String(cat));
   if(tile){section.style.display='';section.classList.toggle('gh-tile-sealed',tile.enabled===false);section.dataset.categoryClosed=tile.enabled===false?'true':'false';section.dataset.sealMessage=tile.closedMessage||'SOON';}
 });
 applyClosedCategoryPresentation();
}

function enforceClosedRoutes(){const path=location.pathname.toLowerCase(),params=new URLSearchParams(location.search),cat=params.get('cat'),pid=params.get('id');if(cat&&path.endsWith('category.html')&&isTileClosed(cat)){location.replace('home.html');return}if(pid){const p=getProduct(pid);if(p){const tile=(getStoreSettings().categoryTiles||[]).find(x=>String(x.type||x.id)===String(p.cat));if(tile&&tile.enabled===false){location.replace('home.html');}}}}
function isTileClosed(type){const settings=getStoreSettings();const key=String(type||'').toLowerCase();const tile=(settings.categoryTiles||[]).find(x=>String(x.type||x.id).toLowerCase()===key);if(tile&&tile.enabled===false)return true;const parentClosed=(getManagedCategories()||[]).find(c=>c.enabled===false&&((String(c.type||'').toLowerCase()==='clothes'&&['shirts','dresses','pants'].includes(key))||(String(c.type||'').toLowerCase()==='accessories'&&['chains','rings','bracelets','watches','bags','sunglasses'].includes(key))));return !!parentClosed;}
document.addEventListener('click',e=>{const a=e.target.closest('a');if(!a)return;let url;try{url=new URL(a.href,location.href)}catch{return}const cat=url.searchParams.get('cat');if(cat&&url.pathname.toLowerCase().endsWith('category.html')&&isTileClosed(cat)){e.preventDefault();e.stopPropagation();toast('القسم ده متوقف حاليًا');return}if((a.dataset.categoryClosed==='true'||a.closest('.gh-tile-sealed'))){e.preventDefault();e.stopPropagation();toast('القسم ده متوقف حاليًا');return}},true);
document.addEventListener('DOMContentLoaded',enforceClosedRoutes);

function applyPageMeta(pm){const p=location.pathname.split('/').pop()||'home.html';const map=p==='home.html'?['homeTitle','homeCaption']:p==='clothes.html'?['clothesTitle','clothesCaption']:p==='accessories.html'?['accessoriesTitle','accessoriesCaption']:p==='offers.html'?['offersTitle','offersCaption']:p==='new-products.html'?['newTitle','newCaption']:p==='search.html'?['searchTitle','searchCaption']:p==='wishlist.html'?['wishlistTitle','wishlistCaption']:null;if(!map)return;const h=document.querySelector('.page-head h1, .accessories-head h1');const c=document.querySelector('.page-head p');if(h&&pm[map[0]])h.textContent=pm[map[0]];if(c&&pm[map[1]])c.textContent=pm[map[1]];if(h&&pm[map[0]])document.title='Girl Hub | '+pm[map[0]];}
function applyRemoteStoreContent(detail){
 const d=detail||{};
 if(Array.isArray(d.promos)){PROMO_CODES=d.promos.filter(p=>p.enabled!==false).map(p=>({code:p.code,type:p.type,value:Number(p.value),expiresAt:(p.expiresAt||'')+'T23:59:59',startsAt:p.startsAt,maxUses:Number(p.maxUses||0),used:Number(p.used||0),enabled:p.enabled!==false,minOrder:Number(p.minOrder||0),perCustomer:Number(p.perCustomer||1),promoPercent:p.type==='percent'?Number(p.value):0}));}
 const cats=Array.isArray(d.categories)?d.categories:JSON.parse(localStorage.getItem('girlhub_remote_categories')||'[]');
 cats.forEach(c=>{const links=[...document.querySelectorAll('.choose-card')];links.forEach(a=>{const href=a.getAttribute('href')||'';const match=(c.type==='clothes'&&href.includes('clothes.html'))||(c.type==='accessories'&&href.includes('accessories.html'));if(match){a.classList.toggle('category-closed',c.enabled===false);a.dataset.categoryEnabled=c.enabled===false?'false':'true';a.dataset.closedMessage=c.message||'قريبًا';const strong=a.querySelector('strong'),small=a.querySelector('small');if(c.name&&strong)strong.textContent=c.name;if(c.enabled===false&&small)small.textContent=c.message||'قريبًا';}});});
 const banners=Array.isArray(d.banners)?d.banners:JSON.parse(localStorage.getItem('girlhub_remote_banners')||'[]');
 const hero=document.querySelector('.gh-hero'),visible=banners.filter(b=>b.enabled!==false);
 if(hero&&visible.length){renderHero(visible);}
 const settings=d.settings||JSON.parse(localStorage.getItem('girlhub_remote_settings')||'null');
 if(settings){try{localStorage.setItem('girlhub_remote_settings',JSON.stringify(settings))}catch(_){}
  renderManagedCategoryTiles(); const topbar=document.querySelector('.topbar');if(topbar&&settings.announcementEnabled!==false&&settings.announcement)topbar.textContent=settings.announcement;else if(topbar&&settings.announcementEnabled===false)topbar.style.display='none';document.querySelectorAll('a[href*="wa.me/"],a[href*="api.whatsapp.com"]').forEach(a=>{const n=settings.socialLinks?.whatsapp||settings.whatsapp;if(n)a.href=String(n).startsWith('http')?n:'https://wa.me/'+String(n).replace(/\D/g,'');});const social=settings.socialLinks||{};document.querySelectorAll('[data-social=instagram]').forEach(a=>a.href=social.instagram||'#');document.querySelectorAll('[data-social=facebook]').forEach(a=>a.href=social.facebook||'#');document.querySelectorAll('[data-social=tiktok]').forEach(a=>a.href=social.tiktok||'#');applyPageMeta(settings.pageMeta||{});}
}

document.addEventListener('girlhub:data-updated',e=>{applyRemoteStoreContent(e.detail);applyClosedCategoryPresentation();enforceClosedRoutes();if(typeof applyManagedCheckoutSettings==='function')applyManagedCheckoutSettings();if(typeof renderCards==='function')renderCards();if(typeof renderCart==='function')renderCart();if(typeof renderWishlist==='function')renderWishlist();if(typeof updateCheckoutTotal==='function')updateCheckoutTotal();if(document.querySelector('#discountGrid')){const g=document.querySelector('#discountGrid');g.dataset.sliderReady='';initDiscountSlider();}});
document.addEventListener('DOMContentLoaded',()=>{applyClosedCategoryPresentation();try{applyRemoteStoreContent({promos:JSON.parse(localStorage.getItem('girlhub_remote_promos')||'null'),categories:JSON.parse(localStorage.getItem('girlhub_remote_categories')||'[]'),banners:JSON.parse(localStorage.getItem('girlhub_remote_banners')||'[]'),settings:JSON.parse(localStorage.getItem('girlhub_remote_settings')||'null')})}catch(e){}});

document.addEventListener('DOMContentLoaded',()=>{init();initPageTransitions()});
