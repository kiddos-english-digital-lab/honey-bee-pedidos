import { Plus } from 'lucide-react';
import ProductPhoto from '@/components/ui/ProductPhoto';
import { formatMXN, getAvailabilityLabel, getStartingPrice, hasPriceRange } from '@/lib/pricing';
import type { Product } from '@/types/menu';

interface ProductCardProps {
  product: Product;
  onSelect: (product: Product) => void;
}

export default function ProductCard({ product, onSelect }: ProductCardProps) {
  const showFromLabel = hasPriceRange(product);

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-rose-200 transition duration-300 hover:-translate-y-1 hover:shadow-xl motion-reduce:transform-none">
      <div className="aspect-[4/3] overflow-hidden">
        <ProductPhoto
          src={product.photo}
          name={product.name}
          className="h-full w-full transition duration-500 group-hover:scale-105 motion-reduce:transform-none"
        />
      </div>

      <div className="flex flex-1 flex-col gap-3 p-5">
        <div className="space-y-2">
          <h3 className="font-display text-2xl leading-tight text-cocoa-700">{product.name}</h3>
          {product.kind === 'drink' && (
            <span className="inline-flex rounded-full bg-rose-100 px-3 py-1 text-xs font-bold text-rose-900">
              {getAvailabilityLabel(product)}
            </span>
          )}
        </div>

        {product.description && <p className="text-sm leading-relaxed text-cocoa-600">{product.description}</p>}

        <div className="mt-auto flex items-end justify-between gap-3 pt-2">
          <div>
            {showFromLabel && <p className="text-xs font-bold uppercase tracking-wide text-cocoa-600">Desde</p>}
            <p className="font-display text-2xl font-semibold text-cocoa-700">{formatMXN(getStartingPrice(product))}</p>
          </div>
          <button
            type="button"
            onClick={() => onSelect(product)}
            aria-label={`Agregar ${product.name}`}
            className="btn-primary"
          >
            <Plus aria-hidden="true" className="h-4 w-4" />
            Agregar
          </button>
        </div>
      </div>
    </article>
  );
}
