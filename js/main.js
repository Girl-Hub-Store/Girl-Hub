const CART_KEY='girlhub_cart', WISH_KEY='girlhub_wish', LANG_KEY='girlhub_lang', ORDER_KEY='girlhub_last_order';
const $=(s,r=document)=>r.querySelector(s); const $$=(s,r=document)=>[...r.querySelectorAll(s)];
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
function addToCart(id,qty=1,size='M',color='0',colorName='Pink'){
 const c=getCart(),p=getProduct(id);if(!p||!p.available){toast(tr('notAvailable'));return}
 const key=variantKey(id,size,color),x=c.find(i=>i.key===key);
 if(x)x.qty+=qty;else c.push({key,id:Number(id),qty:Number(qty),size:size||'M',color:color||'0',colorName:colorName||'Pink'});
 saveCart(c);refreshBadges();toast(tr('added'));return true;
}
function toggleWish(id){let w=getWish();w=w.includes(Number(id))?w.filter(x=>x!==Number(id)):[...w,Number(id)];saveWish(w);refreshBadges();renderCards();renderWishlist();toast(w.includes(Number(id))?tr('fav'):tr('removed'))}
function card(p){const wished=getWish().includes(p.id);return `<article class="card" data-product-card="${p.id}"><div class="card-media"><a href="product.html?id=${p.id}" aria-label="${productName(p)}"><img src="${p.img}" alt="${productName(p)}"></a>${p.tag?`<span class="tag">${p.tag}</span>`:''}<button class="heart ${wished?'on':''}" data-wish="${p.id}" aria-label="${getLang()==='en'?'Wishlist':'مفضلة'}">${wished?'♥':'♡'}</button></div><div class="card-body"><a href="product.html?id=${p.id}" class="product-card-link"><h3>${productName(p)}</h3><div class="price"><span>${money(p.price)}</span>${p.old?`<span class="old">${money(p.old)}</span>`:''}</div></a><button type="button" class="quick-add" data-add="${p.id}" ${!p.available?'disabled':''}>${p.available?tr('add'):tr('unavailable')}</button></div></article>`}
function renderCards(){ $$('.product-grid').forEach(grid=>{let list=PRODUCTS;const cat=grid.dataset.cat;if(cat)list=list.filter(p=>p.cat===cat);const type=grid.dataset.type;if(type)list=list.filter(p=>p.type===type);const limit=grid.dataset.limit;if(limit)list=list.slice(0,Number(limit));grid.innerHTML=list.map(card).join('')});applyLanguage();}
function renderWishlist(){const g=$('.wishlist-grid');if(!g)return;const w=getWish();g.innerHTML=w.length?PRODUCTS.filter(p=>w.includes(p.id)).map(card).join(''):`<div class="empty" style="grid-column:1/-1"><div class="emoji">♡</div><h2>${getLang()==='en'?'Wishlist is empty':'قائمة المفضلة فارغة'}</h2><p>${getLang()==='en'?'Add the pieces you love here.':'ضيفي المنتجات اللي عجباكي هنا.'}</p><a class="btn" href="clothes.html">${getLang()==='en'?'Browse products':'تصفحي المنتجات'}</a></div>`}
function cartColorName(i){if(i.colorName)return i.colorName;return getLang()==='en'?'Pink':'وردي'}
function renderCart(){const box=$('.cart-list');if(!box)return;const c=getCart();if(!c.length){box.innerHTML=`<div class="empty"><div class="emoji">🛍️</div><h2>${tr('noCart')}</h2><p>${tr('emptyCart')}</p><a class="btn" href="home.html">${tr('shop')}</a></div>`;$('.cart-layout .summary')?.remove();return}
 box.innerHTML=c.map(i=>{const p=getProduct(i.id);if(!p)return '';return `<div class="cart-row"><img src="${p.img}" alt="${productName(p)}"><div><h3>${productName(p)}</h3><small>${tr('size')}: <strong>${i.size||'M'}</strong> · ${tr('color')}: <strong>${cartColorName(i)}</strong><br>${money(p.price)}</small></div><div class="qty"><button data-dec="${i.key}">−</button><span>${i.qty}</span><button data-inc="${i.key}">+</button></div><strong class="row-price">${money(p.price*i.qty)}</strong><button class="iconbtn" data-remove="${i.key}">×</button></div>`}).join('');
 const total=c.reduce((s,i)=>{const p=getProduct(i.id);return s+(p?p.price*i.qty:0)},0);if($('.subtotal'))$('.subtotal').textContent=money(total);if($('.total'))$('.total').textContent=money(total+50);applyLanguage();}
function discountItems(){return PRODUCTS.filter(p=>p.old&&p.old>p.price).sort((a,b)=>((b.old-b.price)/b.old)-((a.old-a.price)/a.old)).slice(0,8)}
function initDiscountSlider(){
 const grid=$('#discountGrid');
 if(!grid)return;
 const items=discountItems();
 if(!items.length)return;
 if(grid.dataset.sliderReady==='1'){refreshDiscountSliderLanguage(grid,items);return}
 grid.dataset.sliderReady='1';
 grid.innerHTML=[...items,...items].map(p=>`<article class="figma-product-card"><a href="product.html?id=${p.id}" class="product-image"><img src="${p.img}" alt="${productName(p)}"><span class="discount-badge">${Math.round((1-p.price/p.old)*100)}% ${getLang()==='en'?'OFF':'خصم'}</span></a><div class="product-name">${productName(p)}</div><div class="product-price"><strong>${money(p.price)}</strong><del>${money(p.old)}</del></div></article>`).join('');
 let index=0,timer,dragging=false,startX=0,startY=0,startTranslate=0,lastX=0,moved=false;
 const getVisible=()=>window.innerWidth<=600?2:window.innerWidth<=900?2:4;
 const step=()=>{const first=grid.querySelector('.figma-product-card');if(!first)return 0;return first.getBoundingClientRect().width+(parseFloat(getComputedStyle(grid).gap)||0)};
 const render=(animate=true,px=null)=>{grid.style.transition=animate?'transform .72s cubic-bezier(.16,1,.3,1)':'none';grid.style.transform=`translate3d(${px!==null?px:-index*step()}px,0,0)`};
 const resetLoop=()=>{if(index>=items.length){index=0;render(false)}};
 const moveNext=()=>{index++;render(true);if(index>=items.length)setTimeout(resetLoop,740)};
 const movePrev=()=>{if(index<=0){index=items.length;render(false);requestAnimationFrame(()=>{index=items.length-1;render(true)})}else{index--;render(true)}};
 const setActive=(which)=>{$$('.slider-arrows button').forEach(b=>b.classList.remove('active'));which?.classList.add('active');clearTimeout(window.__discountPink);window.__discountPink=setTimeout(()=>which?.classList.remove('active'),950)};
 const restart=()=>{clearInterval(timer);timer=setInterval(moveNext,3800)};
 $('.discount-prev')?.addEventListener('click',e=>{e.preventDefault();setActive(e.currentTarget);movePrev();restart()});
 $('.discount-next')?.addEventListener('click',e=>{e.preventDefault();setActive(e.currentTarget);moveNext();restart()});
 // Touch / mouse / trackpad swipe — dragging the products feels like a native mobile carousel.
 grid.style.touchAction='pan-y';
 const pointerDown=e=>{if(e.pointerType==='mouse'&&e.button!==0)return;dragging=true;moved=false;startX=e.clientX;startY=e.clientY;lastX=e.clientX;startTranslate=-index*step();grid.classList.add('is-dragging');grid.style.transition='none';clearInterval(timer)};
 const pointerMove=e=>{if(!dragging)return;const dx=e.clientX-startX,dy=e.clientY-startY;if(Math.abs(dy)>Math.abs(dx)+8){dragging=false;grid.classList.remove('is-dragging');restart();return}lastX=e.clientX;if(Math.abs(dx)>6)moved=true;const resistance=0.78;let px=startTranslate+dx*resistance;const max=-Math.max(0,items.length-1)*step();if(px>35)px=35+(px-35)*.25;if(px<max-35)px=max-35+(px-(max-35))*.25;render(false,px)};
 const pointerUp=()=>{if(!dragging)return;dragging=false;grid.classList.remove('is-dragging');const dx=lastX-startX;const threshold=Math.min(75,Math.max(42,step()*.18));if(Math.abs(dx)>threshold){if(dx<0)moveNext();else movePrev()}else render(true);restart()};
 grid.addEventListener('pointerdown',pointerDown,{passive:true});grid.addEventListener('pointermove',pointerMove,{passive:true});grid.addEventListener('pointerup',pointerUp,{passive:true});grid.addEventListener('pointercancel',pointerUp,{passive:true});grid.addEventListener('pointerleave',e=>{if(e.pointerType==='mouse'&&dragging)pointerUp()});
 grid.addEventListener('click',e=>{if(moved){e.preventDefault();e.stopPropagation();moved=false}},{capture:true});
 window.addEventListener('resize',()=>render(false));
 render(false);restart();
 const observer=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting)e.target.classList.add('visible')}),{threshold:.1});
 $$('.figma-product-card').forEach(el=>observer.observe(el));
}
function refreshDiscountSliderLanguage(grid,items){const cards=grid.querySelectorAll('.figma-product-card');cards.forEach((el,i)=>{const p=items[i%items.length];const name=el.querySelector('.product-name'),price=el.querySelector('.product-price strong'),old=el.querySelector('.product-price del'),badge=el.querySelector('.discount-badge');if(name)name.textContent=productName(p);if(price)price.textContent=money(p.price);if(old)old.textContent=money(p.old);if(badge)badge.textContent=`${Math.round((1-p.price/p.old)*100)}% ${getLang()==='en'?'OFF':'خصم'}`})}
function initHeader(){refreshBadges();document.addEventListener('click',e=>{
 const lang=e.target.closest('[data-lang-toggle]');if(lang){e.preventDefault();setLang(getLang()==='ar'?'en':'ar');applyLanguage(true);renderCards();renderWishlist();renderCart();initProduct();initCheckout();initConfirmation();initDiscountSlider();initRevealAnimations();initClothesAnimations();return}
 const a=e.target.closest('[data-add]');if(a){e.preventDefault();e.stopPropagation();addToCart(Number(a.dataset.add));return}
 const w=e.target.closest('[data-wish]');if(w){e.preventDefault();e.stopPropagation();toggleWish(Number(w.dataset.wish));return}
 const r=e.target.closest('[data-remove]');if(r){const key=r.dataset.remove;saveCart(getCart().filter(x=>x.key!==key));renderCart();refreshBadges();return}
 const inc=e.target.closest('[data-inc]');if(inc){const c=getCart(),x=c.find(x=>x.key===inc.dataset.inc);if(x){x.qty++;saveCart(c);renderCart();refreshBadges()}return}
 const dec=e.target.closest('[data-dec]');if(dec){const c=getCart(),x=c.find(x=>x.key===dec.dataset.dec);if(x){x.qty--;const n=x.qty>0?c:c.filter(y=>y.key!==x.key);saveCart(n);renderCart();refreshBadges()}return}
 });}
function initProduct(){const el=$('[data-product]');if(!el)return;const p=getProduct(new URLSearchParams(location.search).get('id')||el.dataset.product);if(!p)return;const isMain=Number(p.id)===1;const meta=isMain?{nameAr:'فستان كتان أنيق',nameEn:'Elegant Linen Dress',collectionAr:'كوليكشن صيف ٢٠٢٦ الفاخر',collectionEn:'Luxury Summer 2026 Collection',price:450,descriptionAr:'تألقي بهذا الفستان المصنوع من أجود خامات الكتان الطبيعي المريح والمنعش، بتميز بقصة مريحة وتفاصيل أنثوية رقيقة تضفي لمسة من الرقي على إطلالتك اليومية أو في المناسبات الخاصة. صمم بعناية فائقة ليمنحك شعورًا بالراحة والجمال.',descriptionEn:'Made from breathable natural linen with a flattering cut and delicate feminine details, this dress brings an effortless elegant feel to everyday looks and special occasions.',colors:[['#e8a2b8','Pink','وردي'],['#ead7ae','Beige','بيج'],['#e3b632','Gold','ذهبي'],['#5b4038','Brown','بني']],sizes:['S','M','L','XL']}:{nameAr:p.name,nameEn:PRODUCT_EN[p.id]||p.name,collectionAr:'تفاصيل المنتج',collectionEn:'Product details',price:p.price,descriptionAr:'قطعة مميزة بتصميم أنيق وجودة عالية، مناسبة لإطلالتك اليومية والمناسبات. اختاري المقاس واللون ثم أضيفيها للسلة.',descriptionEn:'A stylish, high-quality piece designed for everyday looks and special occasions. Choose your size and color, then add it to your cart.',colors:[['#e8a2b8','Pink','وردي'],['#ead7ae','Beige','بيج'],['#5b4038','Brown','بني']],sizes:['S','M','L','XL']};
 const en=getLang()==='en';el.innerHTML=`<div class="detail-image-wrap"><div class="detail-image"><img src="${p.img}" alt="${en?meta.nameEn:meta.nameAr}"></div><button class="detail-heart ${getWish().includes(p.id)?'on':''}" data-wish="${p.id}" aria-label="Wishlist">♡</button></div><div class="detail-info"><div class="detail-kicker">${en?meta.collectionEn:meta.collectionAr}</div><h1>${en?meta.nameEn:meta.nameAr}</h1><div class="detail-price">${money(meta.price)}</div><p class="detail-description">${en?meta.descriptionEn:meta.descriptionAr}</p><div class="detail-status-row"><span>${tr('available')}:</span><strong class="status ${p.available?'':'off'}">${p.available?tr('available'):tr('notAvailableLabel')}</strong></div><div class="options detail-option"><label>${tr('size')}:</label><div class="chips size-chips">${meta.sizes.map(x=>`<button class="chip ${x==='M'?'active':''}" data-size="${x}">${x}</button>`).join('')}</div></div><div class="options detail-option"><label>${tr('color')}:</label><div class="color-chips">${meta.colors.map((c,i)=>`<button class="color-chip ${i===0?'active':''}" data-color="${i}" data-color-name="${en?c[1]:c[2]}" style="--chip:${c[0]}" aria-label="${en?c[1]:c[2]}"></button>`).join('')}</div></div><div class="purchase-row"><div class="qty detail-qty"><button data-pdec>−</button><span data-pqty>1</span><button data-pinc>+</button></div><button class="btn detail-add" data-padd ${!p.available?'disabled':''}>${p.available?tr('add'):tr('unavailable')}</button></div><div class="shipping-note">${en?'* Shipping is available to all governorates at suitable rates. Contact support for any questions.':'* الشحن متوفر لكافة المحافظات بأسعار رمزية ومناسبة. تواصل مع الدعم لأي استفسار.'}</div></div>`;
 let q=1,selectedSize='M',selectedColor='0',selectedColorName=en?'Pink':'وردي';const qel=$('[data-pqty]');$('[data-pinc]')?.addEventListener('click',()=>{q++;qel.textContent=q});$('[data-pdec]')?.addEventListener('click',()=>{q=Math.max(1,q-1);qel.textContent=q});$('[data-padd]')?.addEventListener('click',()=>addToCart(p.id,q,selectedSize,selectedColor,selectedColorName));
 $$('.size-chips .chip').forEach(b=>b.addEventListener('click',()=>{$$('.size-chips .chip').forEach(x=>x.classList.remove('active'));b.classList.add('active');selectedSize=b.dataset.size}));$$('.color-chip').forEach(b=>b.addEventListener('click',()=>{$$('.color-chip').forEach(x=>x.classList.remove('active'));b.classList.add('active');selectedColor=b.dataset.color;selectedColorName=b.dataset.colorName}));
 const rg=$('[data-related]');if(rg){let candidates=PRODUCTS.filter(x=>x.id!==p.id);for(let i=candidates.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[candidates[i],candidates[j]]=[candidates[j],candidates[i]]}const related=candidates.slice(0,4);rg.innerHTML=related.map(x=>`<article class="related-card"><a href="product.html?id=${x.id}"><div class="related-media"><img src="${x.img}" alt="${productName(x)}"><button class="related-heart" data-wish="${x.id}" aria-label="Wishlist">♡</button></div><h3>${productName(x)}</h3><div class="related-price">${money(x.price)}</div></a><button type="button" class="related-add" data-add="${x.id}">${tr('add')}</button></article>`).join('')}
}
function initSearch(){const form=$('#searchForm');if(!form)return;form.addEventListener('submit',e=>{e.preventDefault();const q=$('#q').value.trim().toLowerCase();const g=$('.search-results');const list=PRODUCTS.filter(p=>p.name.toLowerCase().includes(q)||(p.nameEn||'').toLowerCase().includes(q));g.innerHTML=list.length?list.map(card).join(''):`<div class="empty" style="grid-column:1/-1"><div class="emoji">⌕</div><h2>${getLang()==='en'?'No results':'مفيش نتائج'}</h2><p>${getLang()==='en'?'Try another search term.':'جربي كلمة بحث مختلفة.'}</p></div>`})}
function initConfirmation(){const box=$('#confirmationItems');if(!box)return;const data=JSON.parse(localStorage.getItem(ORDER_KEY)||'null');const order=new URLSearchParams(location.search).get('order')||data?.order||'GH-000000';$('#orderNo')?.replaceChildren(document.createTextNode(order));if(!data||!data.items?.length)return;const en=getLang()==='en';box.innerHTML=`<h3>${en?'Order details':'تفاصيل الطلب'}</h3>`+data.items.map(i=>{const p=getProduct(i.id);return `<div class="confirmation-row"><span>${p?productName(p):(en?'Product':'منتج')} × ${i.qty}<small>${tr('size')}: ${i.size||'M'} · ${tr('color')}: ${i.colorName|| (en?'Pink':'وردي')}</small></span><strong>${money((p?.price||0)*i.qty)}</strong></div>`}).join('')}
const SHEET_WEB_APP_URL='https://script.google.com/macros/s/AKfycbzJljrxc4422H-6zmTVaXDmSz5sYx305m-3gEBk_TFHZFxvClS7dUAr67l08t8J_Vh9/exec';
async function sendOrderToGoogleSheet(data){if(!SHEET_WEB_APP_URL || SHEET_WEB_APP_URL.includes('PASTE_YOUR')) return false;try{await fetch(SHEET_WEB_APP_URL,{method:'POST',mode:'no-cors',headers:{'Content-Type':'text/plain;charset=utf-8'},body:JSON.stringify(data),keepalive:true});return true}catch(err){console.warn('Google Sheets order sync failed',err);return false}}
function initCheckout(){const f=$('#checkoutForm');if(!f)return;const c=getCart();const valid=c.filter(i=>getProduct(i.id));const total=valid.reduce((s,i)=>s+getProduct(i.id).price*i.qty,0)+50;if($('.checkout-total'))$('.checkout-total').textContent=money(total);const paymentSelect=$('#paymentMethod'),paymentNote=$('#paymentNote');if(paymentSelect&&paymentNote){const updatePaymentNote=()=>{const selectedText=(paymentSelect.options[paymentSelect.selectedIndex]?.text||'').trim();const isCash=paymentSelect.value==='كاش'||selectedText==='كاش';const isInstapay=paymentSelect.value==='انستا باي'||selectedText==='انستا باي';paymentNote.hidden=!(isCash||isInstapay);};paymentSelect.addEventListener('change',updatePaymentNote);updatePaymentNote();}const orderList=$('.checkout-items');if(orderList)orderList.innerHTML=valid.map(i=>{const p=getProduct(i.id);return `<div class="checkout-item"><span>${productName(p)} × ${i.qty}<small>${tr('size')}: ${i.size||'M'} · ${tr('color')}: ${cartColorName(i)}</small></span><strong>${money(p.price*i.qty)}</strong></div>`}).join('');if(f.dataset.bound)return;f.dataset.bound='1';f.addEventListener('submit',async e=>{e.preventDefault();if(!valid.length){toast(tr('emptyCart'));return}const order='GH-'+Math.floor(100000+Math.random()*900000);const name=$('#customerName')?.value.trim()||'';const phone=$('#customerPhone')?.value.trim()||'';const governorate=$('#governorate')?.value||'';const address=$('#address')?.value.trim()||'';const payment=$('#paymentMethod')?.value||'';const items=valid.map(i=>{const p=getProduct(i.id);return {id:i.id,name:productName(p),qty:i.qty,size:i.size||'M',color:i.color||'0',colorName:cartColorName(i),unitPrice:p.price,lineTotal:p.price*i.qty}});const data={order,createdAt:new Date().toISOString(),customer:{name,phone,governorate,address,payment},items,total,currency:getLang()==='en'?'EGP':'EGP'};localStorage.setItem(ORDER_KEY,JSON.stringify(data));const btn=f.querySelector('button[type=submit]');if(btn){btn.disabled=true;btn.dataset.originalText=btn.textContent;btn.textContent=getLang()==='en'?'Sending...':'جاري إرسال الطلب...'}await sendOrderToGoogleSheet(data);localStorage.removeItem(CART_KEY);location.href=`confirmation.html?order=${order}`})}
function applyLanguage(){const lang=getLang();document.documentElement.lang=lang;document.documentElement.dir=LANG[lang].dir;$$('[data-lang-toggle]').forEach(b=>b.textContent=lang==='ar'?'EN':'AR');const map={
 'الرئيسية':'Home','ملابس':'Clothes','اكسسوارات':'Accessories','تواصل معنا':'Contact us','المفضلة':'Wishlist','البحث':'Search','خصومات':'Discounts','عرض الكل ←':'View all →','عايزه إيه؟':'What are you looking for?','تسوق الآن':'Shop now','الجديد منووو':'New collection','وصل حديثًا':'New arrivals','سلة التسوق':'Shopping cart','راجعي طلبك قبل إتمام الشراء':'Review your order before checkout','ملخص الطلب':'Order summary','الإجمالي الفرعي':'Subtotal','الشحن':'Shipping','الإجمالي':'Total','إتمام الطلب':'Checkout','إتمام الطلب':'Checkout','بيانات العميل':'Customer details','الاسم بالكامل':'Full name','رقم الهاتف':'Phone number','المحافظة':'Governorate','العنوان بالتفصيل':'Full address','طريقة الدفع':'Payment method','الدفع عند الاستلام':'Cash on delivery','كاش':'Cash','انستا باي':'InstaPay','تأكيد الطلب':'Place order','الإجمالي شامل الشحن':'Total including shipping','تم تأكيد طلبك بنجاح':'Your order has been confirmed','شكرًا لاختيارك Girl Hub. هنبدأ تجهيز طلبك ونتواصل معاكي قريبًا.':'Thank you for choosing Girl Hub. We will prepare your order and contact you soon.','العودة للتسوق':'Continue shopping'};
 if(lang==='en')$$('body *').forEach(el=>{if(el.children.length===0){const txt=el.textContent.trim();if(map[txt])el.textContent=map[txt]}});
 if(lang==='ar'){const reverse={};Object.entries(map).forEach(([a,e])=>reverse[e]=a);$$('body *').forEach(el=>{if(el.children.length===0){const txt=el.textContent.trim();if(reverse[txt])el.textContent=reverse[txt]}})}
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
function init(){initHeader();renderCards();renderWishlist();renderCart();initProduct();initSearch();initCheckout();initConfirmation();initDiscountSlider();applyLanguage();initRevealAnimations();initClothesAnimations()}

function initPageTransitions(){
 document.body.classList.add('gh-page-ready');
 document.addEventListener('click',e=>{
   const a=e.target.closest('a');
   if(!a)return;
   const href=a.getAttribute('href');
   if(!href||href.startsWith('#')||href.startsWith('mailto:')||href.startsWith('tel:')||a.target==='_blank'||a.hasAttribute('download'))return;
   let url;try{url=new URL(href,location.href)}catch{return}
   if(url.origin!==location.origin)return;
   if(url.pathname===location.pathname&&url.search===location.search)return;
   if(e.defaultPrevented)return;
   e.preventDefault();
   document.body.classList.remove('gh-page-ready');
   document.body.classList.add('gh-page-leave');
   setTimeout(()=>{location.href=url.href},280);
 },true);
}

document.addEventListener('DOMContentLoaded',()=>{init();initPageTransitions()});
