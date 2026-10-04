/**
 * Girl Hub Admin + Orders backend
 * Paste into Apps Script attached to the store's Google Sheet, then deploy as Web App.
 * Keep ADMIN_KEY secret. Anyone with the key can change store data.
 */
const SPREADSHEET_ID = '1DWjQVS7wq-jeqbDKC5aNzc0kou0UN7PtiIuQxhGUToE';
const ADMIN_KEY = 'CHANGE-THIS-TO-A-LONG-RANDOM-SECRET-BEFORE-DEPLOY';
const ORDERS_SHEET = 'Orders';
const DATA_SHEET = 'StoreData';
const ORDER_HEADERS = ['Order ID','Date','Customer Name','Phone','Governorate','Address','Payment','Items','Total','Currency','Status','Paid','Deleted','Items JSON','Promo Code','Shipping'];

function sheet_(name, headers) {
  const ss=SpreadsheetApp.openById(SPREADSHEET_ID);
  let sh=ss.getSheetByName(name); if(!sh) sh=ss.insertSheet(name);
  if(sh.getLastRow()===0 && headers){sh.appendRow(headers);sh.setFrozenRows(1);}
  if(headers && sh.getLastRow()>0){
    const first=sh.getRange(1,1,1,Math.max(sh.getLastColumn(),headers.length)).getValues()[0];
    headers.forEach((h,i)=>{if(!first[i])sh.getRange(1,i+1).setValue(h);});
  }
  return sh;
}
function json_(obj){return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);}
function dataSheet_(){return sheet_(DATA_SHEET,['Key','JSON','Updated At']);}
function readData_(key,fallback){
  const sh=dataSheet_(), rows=sh.getDataRange().getValues();
  for(let i=1;i<rows.length;i++)if(rows[i][0]===key){try{return JSON.parse(rows[i][1]);}catch(e){return fallback;}}
  return fallback;
}
function writeData_(key,value){
  const sh=dataSheet_(), rows=sh.getDataRange().getValues(), json=JSON.stringify(value);
  for(let i=1;i<rows.length;i++)if(rows[i][0]===key){sh.getRange(i+1,2,1,2).setValues([[json,new Date()]]);return;}
  sh.appendRow([key,json,new Date()]);
}
function headersMap_(sh){const h=sh.getRange(1,1,1,sh.getLastColumn()).getValues()[0];const m={};h.forEach((x,i)=>m[String(x)]=i);return m;}
function orderObjects_(){
  const sh=sheet_(ORDERS_SHEET,ORDER_HEADERS), rows=sh.getDataRange().getValues(); if(rows.length<2)return [];
  const h=headersMap_(sh);
  return rows.slice(1).map(r=>{
    let items=[];try{items=JSON.parse(r[h['Items JSON']]||'[]');}catch(e){}
    let status=r[h['Status']]||'جديد',paid=String(r[h['Paid']]).toLowerCase()==='true'||r[h['Paid']]===true,deleted=String(r[h['Deleted']]).toLowerCase()==='true'||r[h['Deleted']]===true;
    return {order:String(r[h['Order ID']]||''),createdAt:r[h['Date']] instanceof Date?r[h['Date']].toISOString():String(r[h['Date']]||''),customer:{name:r[h['Customer Name']]||'',phone:String(r[h['Phone']]||''),governorate:r[h['Governorate']]||'',address:r[h['Address']]||'',payment:r[h['Payment']]||''},itemText:r[h['Items']]||'',items,total:Number(r[h['Total']]||0),currency:r[h['Currency']]||'EGP',status,paid,deleted,promoCode:r[h['Promo Code']]||'',shipping:Number(r[h['Shipping']]||0)};
  }).filter(o=>o.order);
}
function doGet(e){
  const p=(e&&e.parameter)||{}, action=p.action||'ping';
  if(action==='ping')return json_({ok:true,service:'Girl Hub Admin Backend',version:2});
  if(action==='getPublicData')return json_({ok:true,products:readData_('products',null),categories:readData_('categories',null),banners:readData_('banners',null),settings:readData_('settings',null),promos:readData_('promos',null)});
  if(p.adminKey!==ADMIN_KEY)return json_({ok:false,error:'Unauthorized'});
  if(action==='getOrders')return json_({ok:true,orders:orderObjects_()});
  if(action==='getData'){return json_({ok:true,products:readData_('products',[]),categories:readData_('categories',[]),banners:readData_('banners',[]),settings:readData_('settings',{}),promos:readData_('promos',[])});}
  return json_({ok:false,error:'Unknown action'});
}
function doPost(e){
  try{
    if(!e||!e.postData||!e.postData.contents)throw new Error('No request body');
    const body=JSON.parse(e.postData.contents), action=body.action||'newOrder';
    if(action!=='newOrder' && body.adminKey!==ADMIN_KEY)throw new Error('Unauthorized');
    if(action==='ping')return json_({ok:true,service:'Girl Hub Admin Backend',version:2});
    if(action==='saveData'){
      const allowed=['products','orders','promos','categories','banners','settings'];
      if(allowed.indexOf(body.kind)<0)throw new Error('Invalid data kind');
      if(body.kind==='orders'){
        const sh=sheet_(ORDERS_SHEET,ORDER_HEADERS), map=headersMap_(sh), existing=orderObjects_();
        const incoming=Array.isArray(body.value)?body.value:[];
        const byId={};incoming.forEach(o=>byId[String(o.order||o.id)]=o);
        const rows=sh.getDataRange().getValues();
        for(let i=1;i<rows.length;i++){
          const id=String(rows[i][map['Order ID']]||''),o=byId[id];if(!o)continue;
          if(map['Status']!==undefined)sh.getRange(i+1,map['Status']+1).setValue(o.status||'جديد');
          if(map['Paid']!==undefined)sh.getRange(i+1,map['Paid']+1).setValue(!!o.paid);
          if(map['Deleted']!==undefined)sh.getRange(i+1,map['Deleted']+1).setValue(!!o.deleted);
        }
      } else writeData_(body.kind,body.value);
      return json_({ok:true,saved:body.kind});
    }
    if(action==='newOrder'){
      const b=body, c=b.customer||{}, sh=sheet_(ORDERS_SHEET,ORDER_HEADERS);
      const items=(b.items||[]), itemText=items.map(i=>[i.name||'',`Qty:${i.qty||0}`,`Size:${i.size||''}`,`Color:${i.colorName||i.color||''}`,`Unit:${i.unitPrice||0}`,`Line:${i.lineTotal||0}`].join(' | ')).join(' || ');
      sh.appendRow([b.order||'',b.createdAt||new Date().toISOString(),c.name||'',c.phone||'',c.governorate||'',c.address||'',c.payment||'',itemText,Number(b.total||0),b.currency||'EGP','جديد',false,false,JSON.stringify(items),b.promoCode||'',Number(b.shipping||0)]);
      return json_({ok:true,order:b.order||''});
    }
    throw new Error('Unknown action');
  }catch(err){return json_({ok:false,error:String(err)});}
}
/** Run once from Apps Script editor to create tabs/headers and store an initial empty config. */
function setupGirlHub(){
  sheet_(ORDERS_SHEET,ORDER_HEADERS);dataSheet_();
  ['products','orders','promos','categories','banners','settings'].forEach(k=>{if(readData_(k,null)===null)writeData_(k,[]);});
}
