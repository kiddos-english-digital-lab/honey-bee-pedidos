import { ShoppingBag } from 'lucide-react';
import { useState } from 'react';
import BrandMark from '@/components/layout/BrandMark';

interface SiteHeaderProps {
  itemCount: number;
  onOpenCart: () => void;
}

export default function SiteHeader({ itemCount, onOpenCart }: SiteHeaderProps) {
  return (
    <header className="sticky top-0 z-40 border-b border-rose-200 bg-cream/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <a href="#inicio" className="rounded-full focus-visible:outline-offset-4">
          <BrandMark />
        </a>
        <nav aria-label="Principal" className="flex items-center gap-2 sm:gap-4">
          <a href="#menu" className="rounded-full px-4 py-2 font-bold text-cocoa-700 transition hover:bg-rose-100">
            Menú
          </a>
          <button
            type="button"
            onClick={onOpenCart}
            aria-label={`Abrir carrito, ${itemCount} ${itemCount === 1 ? 'unidad' : 'unidades'}`}
            className="inline-flex min-h-[2.75rem] items-center gap-2 rounded-full bg-rose-200 px-4 py-2 font-bold text-cocoa-700 transition hover:bg-rose-300"
          >
            <ShoppingBag aria-hidden="true" className="h-5 w-5" />
            <span>Carrito</span>
            <CartBadge count={itemCount} />
          </button>
        </nav>
      </div>
    </header>
  );
}

function CartBadge({ count }: { count: number }) {
  const [previousCount, setPreviousCount] = useState(count);
  const [animationKey, setAnimationKey] = useState(0);

  if (previousCount !== count) {
    setPreviousCount(count);
    setAnimationKey((key) => key + 1);
  }

  return (
    <span
      key={animationKey}
      aria-hidden="true"
      className="grid h-6 min-w-[1.5rem] place-items-center rounded-full bg-cocoa-700 px-1.5 text-xs font-bold text-cream motion-safe:animate-pop"
    >
      {count}
    </span>
  );
}
