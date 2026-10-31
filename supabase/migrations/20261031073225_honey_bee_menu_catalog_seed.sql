/*
# Honey Bee menu catalog and reception switch

Plain-English summary
Loads the current menu and its prices into the database so the server can price orders
without trusting the browser. Also creates the open/closed switch and sets it to closed,
so the shop does not accept orders until an administrator opens it.

## Changes
1. `menu_products`: nine products (six drinks, three bagels).
2. `menu_variants`: current prices. Drinks are priced per temperature and size.
   Bagels use a single row with no temperature or size.
3. `business_settings`: row id = 1 with `orders_accepting = false`.

## Security
No new grants or policies. These tables stay closed to browser roles.

## Notes
1. These values must match the menu shown in the app. If prices change, update both places.
2. Re-running this migration is safe: rows are upserted by identifier.
*/

INSERT INTO public.menu_products (id, name, kind) VALUES
  ('banana-latte', 'Banana Latte', 'drink'),
  ('banana-matcha', 'Banana Matcha', 'drink'),
  ('caramel-latte', 'Caramel Latte', 'drink'),
  ('vanilla-sea-matcha', 'Vanilla Sea Matcha', 'drink'),
  ('pumpkin-spice', 'Pumpkin Spice', 'drink'),
  ('toffee-nut', 'Toffee Nut', 'drink'),
  ('green-bee-bagel', 'Green Bee Bagel', 'food'),
  ('turkey-bee-bagel', 'Turkey Bee Bagel', 'food'),
  ('morning-bee-bagel', 'Morning Bee Bagel', 'food')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, kind = EXCLUDED.kind;

INSERT INTO public.menu_variants (product_id, temperature, size, price)
SELECT v.product_id, v.temperature, v.size, v.price
FROM (VALUES
  ('banana-latte', 'frio', 16, 45),
  ('banana-latte', 'frio', 32, 75),
  ('banana-matcha', 'frio', 16, 45),
  ('banana-matcha', 'frio', 32, 80),
  ('caramel-latte', 'frio', 16, 50),
  ('caramel-latte', 'caliente', 16, 50),
  ('caramel-latte', 'frio', 32, 80),
  ('vanilla-sea-matcha', 'frio', 16, 50),
  ('vanilla-sea-matcha', 'frio', 32, 85),
  ('pumpkin-spice', 'frio', 16, 60),
  ('pumpkin-spice', 'caliente', 16, 60),
  ('pumpkin-spice', 'frio', 32, 85),
  ('toffee-nut', 'caliente', 16, 50)
) AS v(product_id, temperature, size, price)
ON CONFLICT (product_id, COALESCE(temperature, ''), COALESCE(size, 0))
  DO UPDATE SET price = EXCLUDED.price;

INSERT INTO public.menu_variants (product_id, temperature, size, price)
SELECT v.product_id, NULL, NULL, v.price
FROM (VALUES
  ('green-bee-bagel', 65),
  ('turkey-bee-bagel', 65),
  ('morning-bee-bagel', 70)
) AS v(product_id, price)
ON CONFLICT (product_id, COALESCE(temperature, ''), COALESCE(size, 0))
  DO UPDATE SET price = EXCLUDED.price;

INSERT INTO public.business_settings (id, orders_accepting)
VALUES (1, false)
ON CONFLICT (id) DO NOTHING;
