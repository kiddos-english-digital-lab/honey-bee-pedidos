/*
# Remove default table privileges from browser roles

Plain-English summary
New tables in this project receive broad default permissions for browser roles
(anonymous visitors and signed-in users). This migration removes all of them from the
internal tables and grants back only what the website needs: administrators can read orders
and their items, and nobody can read the admin list or write directly.

## Changes
1. Revokes every table privilege on the menu, settings, admin, orders and order item tables
   from the public, anonymous and signed-in roles.
2. Re-grants read access on orders (without the tracking token and idempotency key) and on
   order items, to signed-in users only. Row policies still limit this to administrators.
3. Revokes sequence privileges for the folio sequence from browser roles. Only server functions use it.

## Security
- Visitors cannot read orders, items, the catalog, settings or admin accounts directly.
- Visitors place orders and check tracking only through server functions.

## Notes
1. This migration does not change any function or row policy.
*/

REVOKE ALL ON public.menu_products, public.menu_variants, public.business_settings, public.admin_users,
  public.orders, public.order_items FROM PUBLIC, anon, authenticated;

REVOKE ALL ON SEQUENCE public.order_folio_seq FROM PUBLIC, anon, authenticated;

GRANT SELECT (id, folio, customer_name, customer_phone, notes, fulfillment, total, status, status_reason, created_at, updated_at)
  ON public.orders TO authenticated;
GRANT SELECT ON public.order_items TO authenticated;
