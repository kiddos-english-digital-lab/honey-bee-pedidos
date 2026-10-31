/*
# Honey Bee order functions

Plain-English summary
Adds the server functions the website calls. Customers place orders, check their own
order with a private link, and read whether the shop is open. Administrators change order
status and open or close reception. Each function checks its inputs and recalculates prices
from the catalog. Nothing is saved unless every check passes.

## New functions
1. `place_order`: validates the customer, phone, notes, items and quantities; prices each line
   from the catalog; applies rate limits; saves the order and its items in one transaction.
   Repeating a call with the same idempotency key returns the same order and does not create a duplicate.
2. `get_order_by_token`: returns one order's status, items and total when given its private token.
   Returns nothing for unknown tokens. Never returns the phone number or the folio alone.
3. `get_order_intake_status`: returns whether reception is open.
4. `admin_update_order_status`: moves an order through its allowed statuses. Cancelling needs a reason.
5. `admin_set_order_intake`: opens or closes reception.
6. `build_order_view`: internal helper that formats an order. Not callable from the browser.
7. `order_folio_seq`: sequence for folios such as HB-1001.

## Security
- `place_order`, `get_order_by_token` and `get_order_intake_status` are callable by visitors (anon and signed-in).
- Admin functions are callable only by signed-in users and check `is_admin()` again inside.
- Functions run with `search_path` locked to empty so they cannot be redirected to other objects.
- Tracking tokens are 64 random hexadecimal characters from the database random generator.

## Notes
1. Rate limits: at most 5 orders per phone every 10 minutes, and at most 30 orders per minute overall.
2. Validation errors are returned as short codes that the website maps to Spanish messages.
3. Order totals are recalculated here; any total sent by the browser is ignored.
*/

CREATE SEQUENCE IF NOT EXISTS public.order_folio_seq START WITH 1001;

CREATE OR REPLACE FUNCTION public.build_order_view(p_order_id uuid)
RETURNS jsonb
LANGUAGE sql
STABLE
SET search_path = ''
AS $$
  SELECT jsonb_build_object(
    'folio', o.folio,
    'status', o.status,
    'statusReason', o.status_reason,
    'customerName', o.customer_name,
    'fulfillment', o.fulfillment,
    'total', o.total,
    'notes', o.notes,
    'createdAt', o.created_at,
    'updatedAt', o.updated_at,
    'items', COALESCE((
      SELECT jsonb_agg(jsonb_build_object(
        'productName', i.product_name,
        'temperature', i.temperature,
        'size', i.size,
        'quantity', i.quantity,
        'unitPrice', i.unit_price,
        'notes', i.notes
      ) ORDER BY i.id)
      FROM public.order_items i
      WHERE i.order_id = o.id
    ), '[]'::jsonb)
  )
  FROM public.orders o
  WHERE o.id = p_order_id;
$$;

REVOKE EXECUTE ON FUNCTION public.build_order_view(uuid) FROM PUBLIC, anon, authenticated;

CREATE OR REPLACE FUNCTION public.get_order_intake_status()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT COALESCE((SELECT bs.orders_accepting FROM public.business_settings bs WHERE bs.id = 1), false);
$$;

REVOKE EXECUTE ON FUNCTION public.get_order_intake_status() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_order_intake_status() TO anon, authenticated;

CREATE OR REPLACE FUNCTION public.place_order(
  p_idempotency_key uuid,
  p_customer_name text,
  p_customer_phone text,
  p_notes text,
  p_fulfillment text,
  p_items jsonb
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_existing_id uuid;
  v_order_id uuid;
  v_token text;
  v_folio text;
  v_name text := btrim(COALESCE(p_customer_name, ''));
  v_phone text := regexp_replace(COALESCE(p_customer_phone, ''), '[^0-9]', '', 'g');
  v_notes text := btrim(COALESCE(p_notes, ''));
  v_item jsonb;
  v_product_id text;
  v_product_name text;
  v_temperature text;
  v_size_text text;
  v_size integer;
  v_quantity_text text;
  v_quantity integer;
  v_item_notes text;
  v_unit_price integer;
  v_lines jsonb := '[]'::jsonb;
  v_total integer := 0;
BEGIN
  IF p_idempotency_key IS NULL THEN
    RAISE EXCEPTION 'invalid_request';
  END IF;

  SELECT o.id, o.tracking_token INTO v_existing_id, v_token
  FROM public.orders o
  WHERE o.idempotency_key = p_idempotency_key;

  IF v_existing_id IS NOT NULL THEN
    RETURN public.build_order_view(v_existing_id) || jsonb_build_object('trackingToken', v_token);
  END IF;

  IF NOT COALESCE((SELECT bs.orders_accepting FROM public.business_settings bs WHERE bs.id = 1), false) THEN
    RAISE EXCEPTION 'intake_closed';
  END IF;

  IF char_length(v_name) NOT BETWEEN 2 AND 60 THEN
    RAISE EXCEPTION 'invalid_name';
  END IF;

  IF length(v_phone) <> 10 THEN
    RAISE EXCEPTION 'invalid_phone';
  END IF;

  IF char_length(v_notes) > 300 THEN
    RAISE EXCEPTION 'invalid_notes';
  END IF;

  IF p_fulfillment IS DISTINCT FROM 'recoger' THEN
    RAISE EXCEPTION 'invalid_fulfillment';
  END IF;

  IF jsonb_typeof(p_items) IS DISTINCT FROM 'array' THEN
    RAISE EXCEPTION 'invalid_items';
  END IF;

  IF jsonb_array_length(p_items) NOT BETWEEN 1 AND 20 THEN
    RAISE EXCEPTION 'invalid_items';
  END IF;

  IF (
    SELECT count(*) FROM public.orders o
    WHERE o.customer_phone = v_phone AND o.created_at > now() - interval '10 minutes'
  ) >= 5 THEN
    RAISE EXCEPTION 'rate_limited';
  END IF;

  IF (
    SELECT count(*) FROM public.orders o
    WHERE o.created_at > now() - interval '1 minute'
  ) >= 30 THEN
    RAISE EXCEPTION 'rate_limited';
  END IF;

  FOR v_item IN SELECT value FROM jsonb_array_elements(p_items) LOOP
    IF jsonb_typeof(v_item) IS DISTINCT FROM 'object'
      OR jsonb_typeof(v_item->'productId') IS DISTINCT FROM 'string' THEN
      RAISE EXCEPTION 'invalid_item';
    END IF;

    v_product_id := v_item->>'productId';

    SELECT mp.name INTO v_product_name
    FROM public.menu_products mp
    WHERE mp.id = v_product_id;

    IF v_product_name IS NULL THEN
      RAISE EXCEPTION 'invalid_item';
    END IF;

    v_temperature := NULLIF(v_item->>'temperature', '');

    v_size_text := NULLIF(v_item->>'size', '');
    IF v_size_text IS NOT NULL AND v_size_text !~ '^[0-9]{1,3}$' THEN
      RAISE EXCEPTION 'invalid_item';
    END IF;
    v_size := v_size_text::integer;

    IF v_size = 32 AND v_temperature IS DISTINCT FROM 'frio' THEN
      RAISE EXCEPTION 'cold_only_32';
    END IF;

    v_quantity_text := v_item->>'quantity';
    IF v_quantity_text IS NULL OR v_quantity_text !~ '^[0-9]{1,3}$' THEN
      RAISE EXCEPTION 'invalid_quantity';
    END IF;
    v_quantity := v_quantity_text::integer;
    IF v_quantity NOT BETWEEN 1 AND 99 THEN
      RAISE EXCEPTION 'invalid_quantity';
    END IF;

    v_item_notes := btrim(COALESCE(v_item->>'notes', ''));
    IF char_length(v_item_notes) > 200 THEN
      RAISE EXCEPTION 'invalid_notes';
    END IF;

    SELECT mv.price INTO v_unit_price
    FROM public.menu_variants mv
    WHERE mv.product_id = v_product_id
      AND mv.temperature IS NOT DISTINCT FROM v_temperature
      AND mv.size IS NOT DISTINCT FROM v_size;

    IF v_unit_price IS NULL THEN
      RAISE EXCEPTION 'invalid_item';
    END IF;

    v_total := v_total + v_unit_price * v_quantity;
    v_lines := v_lines || jsonb_build_array(jsonb_build_object(
      'product_id', v_product_id,
      'product_name', v_product_name,
      'temperature', v_temperature,
      'size', v_size,
      'quantity', v_quantity,
      'unit_price', v_unit_price,
      'notes', v_item_notes
    ));
  END LOOP;

  v_folio := 'HB-' || lpad(nextval('public.order_folio_seq')::text, 4, '0');
  v_token := replace(gen_random_uuid()::text || gen_random_uuid()::text, '-', '');

  INSERT INTO public.orders (folio, idempotency_key, tracking_token, customer_name, customer_phone, notes, fulfillment, total)
  VALUES (v_folio, p_idempotency_key, v_token, v_name, v_phone, v_notes, 'recoger', v_total)
  ON CONFLICT (idempotency_key) DO NOTHING
  RETURNING id INTO v_order_id;

  IF v_order_id IS NULL THEN
    SELECT o.id, o.tracking_token INTO v_existing_id, v_token
    FROM public.orders o
    WHERE o.idempotency_key = p_idempotency_key;
    RETURN public.build_order_view(v_existing_id) || jsonb_build_object('trackingToken', v_token);
  END IF;

  INSERT INTO public.order_items (order_id, product_id, product_name, temperature, size, quantity, unit_price, notes)
  SELECT v_order_id, x.product_id, x.product_name, x.temperature, x.size, x.quantity, x.unit_price, x.notes
  FROM jsonb_to_recordset(v_lines) AS x(
    product_id text,
    product_name text,
    temperature text,
    size integer,
    quantity integer,
    unit_price integer,
    notes text
  );

  RETURN public.build_order_view(v_order_id) || jsonb_build_object('trackingToken', v_token);
END;
$$;

REVOKE EXECUTE ON FUNCTION public.place_order(uuid, text, text, text, text, jsonb) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.place_order(uuid, text, text, text, text, jsonb) TO anon, authenticated;

CREATE OR REPLACE FUNCTION public.get_order_by_token(p_token text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_order_id uuid;
BEGIN
  IF p_token IS NULL OR p_token !~ '^[0-9a-f]{64}$' THEN
    RETURN NULL;
  END IF;

  SELECT o.id INTO v_order_id
  FROM public.orders o
  WHERE o.tracking_token = p_token;

  IF v_order_id IS NULL THEN
    RETURN NULL;
  END IF;

  RETURN public.build_order_view(v_order_id);
END;
$$;

REVOKE EXECUTE ON FUNCTION public.get_order_by_token(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_order_by_token(text) TO anon, authenticated;

CREATE OR REPLACE FUNCTION public.admin_update_order_status(
  p_order_id uuid,
  p_next_status text,
  p_reason text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_status text;
  v_reason text := NULLIF(btrim(COALESCE(p_reason, '')), '');
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'not_authorized';
  END IF;

  SELECT o.status INTO v_status
  FROM public.orders o
  WHERE o.id = p_order_id
  FOR UPDATE;

  IF v_status IS NULL THEN
    RAISE EXCEPTION 'not_found';
  END IF;

  IF NOT (
    (v_status = 'recibido' AND p_next_status IN ('confirmado', 'cancelado'))
    OR (v_status = 'confirmado' AND p_next_status IN ('en_preparacion', 'cancelado'))
    OR (v_status = 'en_preparacion' AND p_next_status IN ('listo_para_recoger', 'cancelado'))
    OR (v_status = 'listo_para_recoger' AND p_next_status IN ('entregado', 'cancelado'))
  ) THEN
    RAISE EXCEPTION 'invalid_transition';
  END IF;

  IF p_next_status = 'cancelado' THEN
    IF v_reason IS NULL OR char_length(v_reason) > 200 THEN
      RAISE EXCEPTION 'reason_required';
    END IF;
  ELSE
    v_reason := NULL;
  END IF;

  UPDATE public.orders
  SET status = p_next_status, status_reason = v_reason, updated_at = now()
  WHERE id = p_order_id;

  RETURN public.build_order_view(p_order_id);
END;
$$;

REVOKE EXECUTE ON FUNCTION public.admin_update_order_status(uuid, text, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_update_order_status(uuid, text, text) TO authenticated;

CREATE OR REPLACE FUNCTION public.admin_set_order_intake(p_open boolean)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'not_authorized';
  END IF;

  IF p_open IS NULL THEN
    RAISE EXCEPTION 'invalid_request';
  END IF;

  UPDATE public.business_settings
  SET orders_accepting = p_open, updated_at = now()
  WHERE id = 1;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'not_found';
  END IF;

  RETURN p_open;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.admin_set_order_intake(boolean) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_set_order_intake(boolean) TO authenticated;
