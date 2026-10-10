# V22 Banner Ordering and Crop Orientation Update

- Added per-banner move-up and move-down controls. The banner order is saved through the existing `persist('banners')` flow, so the homepage uses the saved order.
- Added horizontal (16:7) and vertical (4:5) crop choices in the banner editor and cropper popup.
- Saved each banner's `cropOrientation`; vertical banners use a contained portrait image in the homepage hero instead of being forcibly cropped to landscape.
- No SQL changes and no order/inventory function changes.

After uploading, test by reordering two banners, then edit one banner and upload a test image choosing horizontal and vertical. Confirm the homepage shows the saved order and orientation.
