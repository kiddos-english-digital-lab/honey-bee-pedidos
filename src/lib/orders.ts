import { supabase } from '@/lib/supabase';
import { parseOrderView, parsePlacedOrder } from '@/lib/orderValidation';
import type { OrderLinePayload, OrderView, PlacedOrder } from '@/types/orders';

function requireClient() {
  if (!supabase) throw new Error('not_configured');
  return supabase;
}

export interface PlaceOrderInput {
  idempotencyKey: string;
  name: string;
  phone: string;
  notes: string;
  items: OrderLinePayload[];
}

export async function fetchIntakeStatus(): Promise<boolean> {
  const { data, error } = await requireClient().rpc('get_order_intake_status');
  if (error) {
    console.error('get_order_intake_status failed', error);
    throw new Error('intake_status_failed');
  }
  if (typeof data !== 'boolean') {
    console.error('get_order_intake_status returned an unexpected value', data);
    throw new Error('invalid_response');
  }
  return data;
}

export async function placeOrder(input: PlaceOrderInput): Promise<PlacedOrder> {
  const { data, error } = await requireClient().rpc('place_order', {
    p_idempotency_key: input.idempotencyKey,
    p_customer_name: input.name.trim(),
    p_customer_phone: input.phone,
    p_notes: input.notes.trim(),
    p_fulfillment: 'recoger',
    p_items: input.items,
  });
  if (error) throw new Error(error.message);
  const placed = parsePlacedOrder(data);
  if (!placed) throw new Error('invalid_response');
  return placed;
}

export async function fetchOrderByToken(token: string): Promise<OrderView | null> {
  const { data, error } = await requireClient().rpc('get_order_by_token', { p_token: token });
  if (error) throw new Error('order_lookup_failed');
  if (data === null) return null;
  const order = parseOrderView(data);
  if (!order) throw new Error('invalid_response');
  return order;
}
