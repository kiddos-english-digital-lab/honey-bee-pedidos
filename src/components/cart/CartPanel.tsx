import { ArrowRight, ShoppingBag } from 'lucide-react';
import CartLineItem from '@/components/cart/CartLineItem';
import { useCart } from '@/context/CartContext';
import { getLineKey, summarizeCart } from '@/lib/cart';
import { formatMXN } from '@/lib/pricing';

interface CartPanelProps {
  onReview: () => void;
  onBrowseMenu: () => void;
}

export default function CartPanel({ onReview, onBrowseMenu }: CartPanelProps) {
  const { lines } = useCart();
  const { itemCount, total } = summarizeCart(lines);

  return (
    <section aria-labelledby="carrito-titulo" className="flex h-full min-h-0 flex-col">
      <header className="flex items-center gap-3 border-b border-rose-200 px-5 py-4">
        <ShoppingBag aria-hidden="true" className="h-5 w-5 text-cocoa-700" />
        <h2 id="carrito-titulo" className="font-display text-2xl text-cocoa-700">
          Tu carrito{itemCount > 0 && ` (${itemCount})`}
        </h2>
      </header>

      {lines.length === 0 ? (
        <div className="flex flex-col items-center gap-4 px-6 py-12 text-center">
          <span className="grid h-16 w-16 place-items-center rounded-full bg-butter-200">
            <ShoppingBag aria-hidden="true" className="h-7 w-7 text-cocoa-700" />
          </span>
          <div className="space-y-2">
            <p className="font-display text-xl text-cocoa-700">Tu carrito está vacío</p>
            <p className="text-sm leading-relaxed text-cocoa-600">
              Agrega tus bebidas y bagels favoritos desde el menú.
            </p>
          </div>
          <button type="button" onClick={onBrowseMenu} className="btn-secondary">
            Ver menú
          </button>
        </div>
      ) : (
        <>
          <ul className="min-h-0 flex-1 divide-y divide-rose-100 overflow-y-auto px-5">
            {lines.map((line) => (
              <CartLineItem key={getLineKey(line)} line={line} />
            ))}
          </ul>
          <div className="space-y-4 border-t border-rose-200 px-5 py-5">
            <div className="flex items-baseline justify-between gap-4">
              <span className="font-bold text-cocoa-700">Total</span>
              <span className="font-display text-3xl font-semibold text-cocoa-700">{formatMXN(total)}</span>
            </div>
            <button type="button" onClick={onReview} className="btn-primary w-full">
              Revisar pedido
              <ArrowRight aria-hidden="true" className="h-4 w-4" />
            </button>
          </div>
        </>
      )}
    </section>
  );
}
