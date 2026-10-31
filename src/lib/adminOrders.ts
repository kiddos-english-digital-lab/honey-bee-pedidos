import { isOrderStatus, parseOrderView } from '@/lib/orderValidation';
import { supabase } from '@/lib/supabase';
import type { DrinkSize, Temperature } from '@/types/menu';
import type { OrderItemView, OrderStatus, OrderView } from '@/types/orders';

export interface AdminOrder {
  id: string;
  folio: string;
  customerName: string;
  customerPhone: string;
  notes: string;
  total: number;
  status: OrderStatus;
  statusReason: string | null;
  createdAt: string;
  updatedAt: string;
  items: OrderItemView[];
}

const ADMIN_ORDER_COLUMNS =
  'id, folio, customer_name, customer_phone, notes, total, status, status_reason, created_at, updated_at, order_items(product_name, temperature, size, quantity, unit_price, notes)';

function requireClient() {
  if (!supabase) throw new Error('not_configured');
  return supabase;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function parseAdminItem(raw: unknown): OrderItemView | null {
  if (!isRecord(raw)) return null;
  const { product_name, temperature, size, quantity, unit_price, notes } = raw;
  if (typeof product_name !== 'string' || typeof quantity !== 'number' || typeof unit_price !== 'number') return null;
  if (typeof notes !== 'string') return null;
  return {
    productName: product_name,
    temperature: (temperature === 'frio' || temperature === 'caliente' ? temperature : null) as Temperature | null,
    size: (size === 16 || size === 32 ? size : null) as DrinkSize | null,
    quantity,
    unitPrice: unit_price,
    notes,
  };
}

function parseAdminOrder(raw: unknown): AdminOrder | null {
  if (!isRecord(raw)) return null;
  const { id, folio, customer_name, customer_phone, notes, total, status, status_reason, created_at, updated_at, order_items } =
    raw;
  if (typeof id !== 'string' || typeof folio !== 'string' || !isOrderStatus(status)) return null;
  if (typeof customer_name !== 'string' || typeof customer_phone !== 'string' || typeof notes !== 'string') return null;
  if (typeof total !== 'number' || typeof created_at !== 'string' || typeof updated_at !== 'string') return null;
  if (status_reason !== null && typeof status_reason !== 'string') return null;
  if (!Array.isArray(order_items)) return null;

  const items = order_items.map(parseAdminItem);
  if (items.some((item) => item === null)) return null;

  return {
    id,
    folio,
    customerName: customer_name,
    customerPhone: customer_phone,
    notes,
    total,
    status,
    statusReason: status_reason,
    createdAt: created_at,
    updatedAt: updated_at,
    items: items as OrderItemView[],
  };
}

export async function fetchAdminOrders(): Promise<AdminOrder[]> {
  const { data, error } = await requireClient()
    .from('orders')
    .select(ADMIN_ORDER_COLUMNS)
    .order('created_at', { ascending: false })
    .limit(200);
  if (error || !Array.isArray(data)) throw new Error('orders_load_failed');
  const orders = data.map(parseAdminOrder);
  if (orders.some((order) => order === null)) throw new Error('invalid_response');
  return orders as AdminOrder[];
}

export async function fetchIsAdmin(): Promise<boolean> {
  const { data, error } = await requireClient().rpc('is_admin');
  if (error || typeof data !== 'boolean') throw new Error('admin_check_failed');
  return data;
}

export async function updateOrderStatus(orderId: string, nextStatus: OrderStatus, reason: string | null): Promise<OrderView> {
  const { data, error } = await requireClient().rpc('admin_update_order_status', {
    p_order_id: orderId,
    p_next_status: nextStatus,
    p_reason: reason,
  });
  if (error) throw new Error(error.message);
  const view = parseOrderView(data);
  if (!view) throw new Error('invalid_response');
  return view;
}

export async function setOrdersAccepting(open: boolean): Promise<boolean> {
  const { data, error } = await requireClient().rpc('admin_set_order_intake', { p_open: open });
  if (error) throw new Error(error.message);
  if (typeof data !== 'boolean') throw new Error('invalid_response');
  return data;
}
