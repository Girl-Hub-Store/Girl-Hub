const SPREADSHEET_ID = '1DWjQVS7wq-jeqbDKC5aNzc0kou0UN7PtiIuQxhGUToE';
const SHEET_NAME = 'Orders';

function getOrdersSheet_() {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  let sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) sheet = ss.insertSheet(SHEET_NAME);
  if (sheet.getLastRow() === 0) {
    sheet.appendRow([
      'Order ID','Date','Customer Name','Phone','Governorate','Address',
      'Payment','Items','Total','Currency'
    ]);
    sheet.setFrozenRows(1);
  }
  return sheet;
}

function doGet() {
  return ContentService
    .createTextOutput(JSON.stringify({ok:true, service:'Girl Hub Orders'}))
    .setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  try {
    if (!e || !e.postData || !e.postData.contents) {
      throw new Error('No request body received');
    }

    const body = JSON.parse(e.postData.contents);
    const sheet = getOrdersSheet_();
    const itemText = (body.items || []).map(function(i) {
      return [
        i.name || '',
        'Qty:' + (i.qty || 0),
        'Size:' + (i.size || ''),
        'Color:' + (i.colorName || i.color || ''),
        'Unit:' + (i.unitPrice || 0),
        'Line:' + (i.lineTotal || 0)
      ].join(' | ');
    }).join(' || ');

    const c = body.customer || {};
    sheet.appendRow([
      body.order || '',
      body.createdAt || new Date().toISOString(),
      c.name || '',
      c.phone || '',
      c.governorate || '',
      c.address || '',
      c.payment || '',
      itemText,
      Number(body.total || 0),
      body.currency || 'EGP'
    ]);

    return ContentService
      .createTextOutput(JSON.stringify({ok:true, order:body.order || ''}))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ok:false, error:String(err)}))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
