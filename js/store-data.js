// Local preview bridge + optional published backend sync.
// Run the dashboard and storefront under the same Live Server origin for local edits to appear.
(function(){
 'use strict';
 const API='https://script.google.com/macros/s/AKfycbzJljrxc4422H-6zmTVaXDmSz5sYx305m-3gEBk_TFHZFxvClS7dUAr67l08t8J_Vh9/exec';
 const pairs={products:['gh_admin_products_v1','girlhub_admin_products'],promos:['gh_admin_promos_v1','girlhub_remote_promos'],categories:['gh_admin_categories_v1','girlhub_remote_categories'],banners:['gh_admin_banners_v1','girlhub_remote_banners'],settings:['gh_admin_settings_v1','girlhub_remote_settings']};
 function read(key){try{return JSON.parse(localStorage.getItem(key)||'null')}catch(_){return null}}
 function bridgeLocal(){
  let detail={},hasLocal=false;
  Object.entries(pairs).forEach(([kind,keys])=>{
   const value=read(keys[0]);
   if(value!==null){hasLocal=true;detail[kind]=value;try{localStorage.setItem(keys[1],JSON.stringify(value))}catch(_){}}
  });
  const products=detail.products;
  if(Array.isArray(products)&&typeof PRODUCTS!=='undefined'){
   PRODUCTS.splice(0,PRODUCTS.length,...products);
  }
  if(Object.keys(detail).length){document.dispatchEvent(new CustomEvent('girlhub:data-updated',{detail}));}
  return hasLocal;
 }
 const localAdminData=bridgeLocal();
 // Supabase is the source of truth for published storefronts once configured.
 // Never prefer stale device-local data over the remote copy.
 async function refreshRemote(){
  if(!(window.GH_SUPABASE_READY && window.GH_SB)) return;
  const {data:rows,error}=await window.GH_SB.from('store_data').select('kind,data,updated_at').in('kind',['products','promos','categories','banners','settings']);
  if(error){console.warn('Girl Hub Supabase public data unavailable:',error.message);return;}
  const d={};
  (rows||[]).forEach(row=>{
    const stamp=row.updated_at||'';
    if(row.kind==='products' && Array.isArray(row.data)){
      let previous=null;try{previous=JSON.parse(localStorage.getItem('girlhub_remote_products')||'null')}catch(_){}
      const currentCount=Array.isArray(previous)?previous.length:(typeof PRODUCTS!=='undefined'&&Array.isArray(PRODUCTS)?PRODUCTS.length:0);
      if(currentCount>row.data.length){console.warn('Girl Hub protected cached catalog from smaller Supabase response.',{cached:currentCount,remote:row.data.length});return;}
    }
    let oldStamp='';try{oldStamp=localStorage.getItem('girlhub_remote_updated_'+row.kind)||''}catch(_){}
    try{localStorage.setItem('girlhub_remote_'+row.kind,JSON.stringify(row.data));localStorage.setItem('girlhub_remote_updated_'+row.kind,stamp)}catch(_){}
    if(stamp!==oldStamp)d[row.kind]=row.data;
    if(row.kind==='products'&&stamp!==oldStamp&&Array.isArray(row.data)&&typeof PRODUCTS!=='undefined'){
      PRODUCTS.splice(0,PRODUCTS.length,...row.data);try{localStorage.setItem('girlhub_admin_products',JSON.stringify(row.data))}catch(_){}
    }
  });
  if(Object.keys(d).length)document.dispatchEvent(new CustomEvent('girlhub:data-updated',{detail:d}));
 }
 if(window.GH_SUPABASE_READY && window.GH_SB){
  refreshRemote();
  window.__girlHubRemoteTimer=setInterval(refreshRemote,3000);
  try{const channel=window.GH_SB.channel('girlhub-store-data-live');channel.on('postgres_changes',{event:'*',schema:'public',table:'store_data'},payload=>{const row=payload?.new||payload?.record||{};if(!row.kind||!['products','promos','categories','banners','settings'].includes(row.kind))return;if(row.kind==='products'&&Array.isArray(row.data)){let previous=null;try{previous=JSON.parse(localStorage.getItem('girlhub_remote_products')||'null')}catch(_){};if(Array.isArray(previous)&&previous.length>row.data.length){console.warn('Girl Hub ignored realtime catalog shrink.',{cached:previous.length,remote:row.data.length});return;}}const detail={[row.kind]:row.data};try{localStorage.setItem('girlhub_remote_'+row.kind,JSON.stringify(row.data));localStorage.setItem('girlhub_remote_updated_'+row.kind,row.updated_at||new Date().toISOString())}catch(_){}if(row.kind==='products'&&Array.isArray(row.data)&&typeof PRODUCTS!=='undefined')PRODUCTS.splice(0,PRODUCTS.length,...row.data);document.dispatchEvent(new CustomEvent('girlhub:data-updated',{detail}));}).subscribe(status=>console.log('Girl Hub realtime:',status));window.__girlHubRealtimeChannel=channel;}catch(err){console.warn('Girl Hub realtime unavailable:',err)}
 window.addEventListener('focus',()=>refreshRemote());
 window.addEventListener('pageshow',()=>refreshRemote());
 document.addEventListener('visibilitychange',()=>{if(!document.hidden)refreshRemote()});
 } else if(!localAdminData){
  fetch(API+'?action=getPublicData').then(r=>r.json()).then(d=>{
   if(!d||!d.ok)return;
   if(Array.isArray(d.products)&&typeof PRODUCTS!=='undefined'){
    if(PRODUCTS.length>d.products.length){console.warn('Girl Hub kept existing catalog instead of applying smaller Google Apps Script catalog.',{current:PRODUCTS.length,incoming:d.products.length});}
    else{PRODUCTS.splice(0,PRODUCTS.length,...d.products);try{localStorage.setItem('girlhub_admin_products',JSON.stringify(d.products))}catch(_){}}
   }
   ['promos','categories','banners','settings'].forEach(k=>{if(d[k]!==undefined){try{localStorage.setItem('girlhub_remote_'+k,JSON.stringify(d[k]))}catch(_){}}});
   document.dispatchEvent(new CustomEvent('girlhub:data-updated',{detail:d}));
  }).catch(err=>console.warn('Girl Hub public data sync unavailable:',err));
 }
 // Keep an already-open storefront preview in sync when the dashboard is saved in another tab.
 window.addEventListener('storage',e=>{
  if(Object.values(pairs).some(keys=>keys.includes(e.key))){bridgeLocal();}
 });
 document.addEventListener('DOMContentLoaded',bridgeLocal);
})();
