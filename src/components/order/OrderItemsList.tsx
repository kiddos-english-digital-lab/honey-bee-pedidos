import { formatMXN } from '@/lib/pricing';
import { formatOrderItemDetails } from '@/lib/orderFormat';
import type { OrderItemView } from '@/types/orders';

interface OrderItemsListProps {
  items: OrderItemView[];
  total: number;
}

export default function OrderItemsList({ items, total }: OrderItemsListProps) {
  return (
    <div>
      <ul className="divide-y divide-rose-100">
        {items.map((item, index) => {
          const details = formatOrderItemDetails(item);
          return (
            <li key={`${item.productName}-${index}`} className="flex items-start justify-between gap-4 py-3">
              <div className="min-w-0">
                <p className="font-bold text-cocoa-700">
                  {item.quantity} × {item.productName}
                </p>
                {details && <p className="text-sm text-cocoa-600">{details}</p>}
                {item.notes && <p className="break-words text-sm italic text-cocoa-600">Notas: {item.notes}</p>}
              </div>
              <p className="shrink-0 font-bold text-cocoa-700">{formatMXN(item.unitPrice * item.quantity)}</p>
            </li>
          );
        })}
      </ul>
      <div className="mt-2 flex items-baseline justify-between gap-4 border-t border-rose-200 pt-4">
        <span className="font-bold text-cocoa-700">Total</span>
        <span className="font-display text-3xl font-semibold text-cocoa-700">{formatMXN(total)}</span>
      </div>
    </div>
  );
}
