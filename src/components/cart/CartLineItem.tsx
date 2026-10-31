import { Trash2 } from 'lucide-react';
import ProductPhoto from '@/components/ui/ProductPhoto';
import QuantityStepper from '@/components/ui/QuantityStepper';
import { useCart } from '@/context/CartContext';
import { getLineKey, getLinePricing } from '@/lib/cart';
import { formatMXN, getSelectionLabel } from '@/lib/pricing';
import type { CartLine } from '@/types/menu';

interface CartLineItemProps {
  line: CartLine;
}

export default function CartLineItem({ line }: CartLineItemProps) {
  const { setQuantity, removeLine } = useCart();
  const pricing = getLinePricing(line);
  if (!pricing) return null;

  const { product, unitPrice } = pricing;
  const key = getLineKey(line);
  const details = getSelectionLabel(product, line);

  return (
    <li className="flex gap-4 py-4">
      <ProductPhoto src={product.photo} name={product.name} alt="" className="h-20 w-20 shrink-0 rounded-2xl" />
      <div className="flex min-w-0 flex-1 flex-col gap-3">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="font-bold leading-snug text-cocoa-700">{product.name}</p>
            {details && <p className="text-sm text-cocoa-600">{details}</p>}
            {line.notes && <p className="break-words text-sm italic text-cocoa-600">Notas: {line.notes}</p>}
          </div>
          <button
            type="button"
            onClick={() => removeLine(key)}
            aria-label={`Eliminar ${product.name} del carrito`}
            className="icon-btn -mr-2 -mt-2"
          >
            <Trash2 aria-hidden="true" className="h-4 w-4" />
          </button>
        </div>
        <div className="flex items-center justify-between gap-3">
          <QuantityStepper value={line.quantity} onChange={(quantity) => setQuantity(key, quantity)} itemName={product.name} />
          <div className="text-right">
            <p className="font-bold text-cocoa-700">{formatMXN(unitPrice * line.quantity)}</p>
            {line.quantity > 1 && <p className="text-xs text-cocoa-600">{formatMXN(unitPrice)} c/u</p>}
          </div>
        </div>
      </div>
    </li>
  );
}
