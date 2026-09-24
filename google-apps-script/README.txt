Google Sheets setup (one time):
1) Create/open a Google Sheet.
2) Extensions -> Apps Script.
3) Paste Code.gs into the editor and save.
4) Deploy -> New deployment -> Web app. Execute as: Me. Who has access: Anyone.
5) Copy the Web app URL.
6) Open js/main.js and replace PASTE_YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL_HERE with that URL.
7) Upload the updated site.

Each order will create/update a sheet tab named Orders and append: order ID, date, customer name, phone, governorate, address, payment, item details including size/color/qty, total and currency.
