import { TEMPERATURE_LABELS } from '@/lib/pricing';
import type { OrderItemView } from '@/types/orders';

export function formatOrderItemDetails(item: OrderItemView): string {
  if (!item.temperature || !item.size) return '';
  return `${TEMPERATURE_LABELS[item.temperature]} · ${item.size} oz`;
}

const dateFormatter = new Intl.DateTimeFormat('es-MX', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
});

export function formatOrderDate(iso: string): string {
  const date = new Date(iso);
  return Number.isNaN(date.getTime()) ? '' : dateFormatter.format(date);
}
