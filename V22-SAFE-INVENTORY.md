# V22 Safe Central Inventory

This build starts from Girl Hub V22 only. It adds central Supabase inventory without using any V23+ code.

- `create_order_with_inventory_v22` is called only when checkout is confirmed.
- It locks the products row, validates requested stock, deducts only stock fields, then inserts the order in the same transaction.
- Empty product data is rejected; it is never written back.
- `update_order_status_with_inventory_v22` restores stock when an order becomes cancelled and deducts it again when a cancelled order is reactivated.
- The V22 dashboard no longer performs the old local inventory reconciliation when orders are loaded from Supabase.

Run `SUPABASE-V22-SAFE-INVENTORY.sql` in Supabase SQL Editor. Do not run the old V23/V26 inventory SQL.
