import type { DrinkSize, Temperature } from '@/types/menu';

export const ORDER_STATUSES = [
  'recibido',
  'confirmado',
  'en_preparacion',
  'listo_para_recoger',
  'entregado',
  'cancelado',
] as const;

export type OrderStatus = (typeof ORDER_STATUSES)[number];

export interface OrderItemView {
  productName: string;
  temperature: Temperature | null;
  size: DrinkSize | null;
  quantity: number;
  unitPrice: number;
  notes: string;
}

export interface OrderView {
  folio: string;
  status: OrderStatus;
  statusReason: string | null;
  customerName: string;
  fulfillment: 'recoger';
  total: number;
  notes: string;
  createdAt: string;
  updatedAt: string;
  items: OrderItemView[];
}

export interface PlacedOrder extends OrderView {
  trackingToken: string;
}

export interface OrderLinePayload {
  productId: string;
  temperature: Temperature | null;
  size: DrinkSize | null;
  quantity: number;
  notes: string;
}
