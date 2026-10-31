/*
# Honey Bee order schema

Plain-English summary
Creates the tables that store the menu catalog used for pricing, the open/closed
reception switch, customer orders, the items inside each order, and the list of
administrator accounts. Customers never read or write these tables directly. They
use server functions (created in a later migration) that validate every value.

## New tables
1. `menu_products`: product identifiers, names and kind (drink or food).
2. `menu_variants`: authoritative prices per product option (temperature and size).
   Foods use a row with empty temperature and size. Hot 32 oz is rejected here too.
3. `business_settings`: a single row (id = 1) with `orders_accepting`, the open/closed switch.
4. `admin_users`: user ids allowed to use the admin panel. Only the database owner adds rows.
5. `orders`: customer orders with folio, idempotency key, private tracking token,
   customer name, phone, notes, total and status.
6. `order_items`: the lines of each order with a snapshot of name and unit price.

## Security
- RLS is enabled on every table.
- Catalog, settings and admin tables have no grants for browser roles.
- `orders` and `order_items` are readable only by signed-in administrators (through `is_admin()`).
  The tracking token and idempotency key columns are not granted to any browser role.
- `is_admin()` checks `admin_users` for the calling user. It cannot be changed from the client.

## Notes
1. Only SELECT policies exist for admins. All writes go through server functions.
2. Status values are restricted by a CHECK constraint and by transition rules in functions.
3. A cancelled order must carry a visible reason.
*/

CREATE TABLE IF NOT EXISTS public.menu_products (
  id text PRIMARY KEY,
  name text NOT NULL,
  kind text NOT NULL CHECK (kind IN ('drink', 'food'))
);

CREATE TABLE IF NOT EXISTS public.menu_variants (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  product_id text NOT NULL REFERENCES public.menu_products (id) ON DELETE CASCADE,
  temperature text CHECK (temperature IN ('frio', 'caliente')),
  size integer CHECK (size IN (16, 32)),
  price integer NOT NULL CHECK (price > 0),
  CONSTRAINT menu_variants_cold_only_32 CHECK (size IS DISTINCT FROM 32 OR temperature = 'frio')
);

CREATE UNIQUE INDEX IF NOT EXISTS menu_variants_unique_option
  ON public.menu_variants (product_id, COALESCE(temperature, ''), COALESCE(size, 0));

CREATE TABLE IF NOT EXISTS public.business_settings (
  id integer PRIMARY KEY CHECK (id = 1),
  orders_accepting boolean NOT NULL DEFAULT false,
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.admin_users (
  user_id uuid PRIMARY KEY REFERENCES auth.users (id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  folio text NOT NULL UNIQUE,
  idempotency_key uuid NOT NULL UNIQUE,
  tracking_token text NOT NULL UNIQUE CHECK (tracking_token ~ '^[0-9a-f]{64}$'),
  customer_name text NOT NULL CHECK (char_length(customer_name) BETWEEN 2 AND 60),
  customer_phone text NOT NULL CHECK (customer_phone ~ '^[0-9]{10}$'),
  notes text NOT NULL DEFAULT '' CHECK (char_length(notes) <= 300),
  fulfillment text NOT NULL DEFAULT 'recoger' CHECK (fulfillment IN ('recoger')),
  total integer NOT NULL CHECK (total > 0),
  status text NOT NULL DEFAULT 'recibido' CHECK (
    status IN ('recibido', 'confirmado', 'en_preparacion', 'listo_para_recoger', 'entregado', 'cancelado')
  ),
  status_reason text CHECK (char_length(status_reason) BETWEEN 1 AND 200),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT orders_cancel_reason_required CHECK (status <> 'cancelado' OR status_reason IS NOT NULL)
);

CREATE INDEX IF NOT EXISTS orders_created_at_idx ON public.orders (created_at DESC);
CREATE INDEX IF NOT EXISTS orders_phone_created_idx ON public.orders (customer_phone, created_at DESC);

CREATE TABLE IF NOT EXISTS public.order_items (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  order_id uuid NOT NULL REFERENCES public.orders (id) ON DELETE CASCADE,
  product_id text NOT NULL REFERENCES public.menu_products (id),
  product_name text NOT NULL,
  temperature text CHECK (temperature IN ('frio', 'caliente')),
  size integer CHECK (size IN (16, 32)),
  quantity integer NOT NULL CHECK (quantity BETWEEN 1 AND 99),
  unit_price integer NOT NULL CHECK (unit_price > 0),
  notes text NOT NULL DEFAULT '' CHECK (char_length(notes) <= 200),
  CONSTRAINT order_items_cold_only_32 CHECK (size IS DISTINCT FROM 32 OR temperature = 'frio')
);

CREATE INDEX IF NOT EXISTS order_items_order_id_idx ON public.order_items (order_id);

ALTER TABLE public.menu_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.menu_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.business_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT EXISTS (SELECT 1 FROM public.admin_users au WHERE au.user_id = auth.uid());
$$;

REVOKE EXECUTE ON FUNCTION public.is_admin() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;

GRANT SELECT (id, folio, customer_name, customer_phone, notes, fulfillment, total, status, status_reason, created_at, updated_at)
  ON public.orders TO authenticated;
GRANT SELECT ON public.order_items TO authenticated;

DROP POLICY IF EXISTS "admin_select_orders" ON public.orders;
CREATE POLICY "admin_select_orders" ON public.orders
  FOR SELECT TO authenticated
  USING (public.is_admin());

DROP POLICY IF EXISTS "admin_select_order_items" ON public.order_items;
CREATE POLICY "admin_select_order_items" ON public.order_items
  FOR SELECT TO authenticated
  USING (public.is_admin());
