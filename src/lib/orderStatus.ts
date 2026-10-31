import type { OrderStatus } from '@/types/orders';

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  recibido: 'Recibido',
  confirmado: 'Confirmado',
  en_preparacion: 'En preparación',
  listo_para_recoger: 'Listo para recoger',
  entregado: 'Entregado',
  cancelado: 'Cancelado',
};

export const ORDER_STATUS_TONES: Record<OrderStatus, string> = {
  recibido: 'bg-butter-200 text-cocoa-700',
  confirmado: 'bg-sky-100 text-sky-900',
  en_preparacion: 'bg-amber-100 text-amber-700',
  listo_para_recoger: 'bg-sage-100 text-sage-700',
  entregado: 'bg-cocoa-100 text-cocoa-800',
  cancelado: 'bg-brick-100 text-brick-700',
};

export const PROGRESS_STATUSES: OrderStatus[] = [
  'recibido',
  'confirmado',
  'en_preparacion',
  'listo_para_recoger',
  'entregado',
];

export const NEXT_ORDER_STATUSES: Record<OrderStatus, OrderStatus[]> = {
  recibido: ['confirmado', 'cancelado'],
  confirmado: ['en_preparacion', 'cancelado'],
  en_preparacion: ['listo_para_recoger', 'cancelado'],
  listo_para_recoger: ['entregado', 'cancelado'],
  entregado: [],
  cancelado: [],
};

export function isFinalStatus(status: OrderStatus): boolean {
  return NEXT_ORDER_STATUSES[status].length === 0;
}
