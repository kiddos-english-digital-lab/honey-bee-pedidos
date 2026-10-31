import { Star } from 'lucide-react';
import { useState } from 'react';
import { MENU_FILTERS, products } from '@/data/menu';
import CategoryFilter, { type CategoryFilterValue } from '@/components/menu/CategoryFilter';
import ProductCard from '@/components/menu/ProductCard';
import type { Product } from '@/types/menu';

interface MenuSectionProps {
  onSelectProduct: (product: Product) => void;
}

export default function MenuSection({ onSelectProduct }: MenuSectionProps) {
  const [filter, setFilter] = useState<CategoryFilterValue>('todo');
  const visibleProducts = filter === 'todo' ? products : products.filter((product) => product.category === filter);

  return (
    <section id="menu" aria-labelledby="menu-titulo" className="scroll-mt-24 space-y-8 py-12 lg:py-16">
      <div className="space-y-4">
        <p className="eyebrow">Menú</p>
        <h2 id="menu-titulo" className="font-display text-4xl text-cocoa-700 sm:text-5xl">
          Nuestro menú
        </h2>
        <p className="inline-flex items-start gap-2 rounded-2xl bg-butter-200 px-4 py-3 text-sm font-bold leading-relaxed text-cocoa-700">
          <Star aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0 fill-honey-500 text-honey-700" />
          Bebidas de 16 oz • Opción de 32 oz solo en bebidas frías • Preparadas con leche deslactosada
        </p>
      </div>

      <CategoryFilter options={MENU_FILTERS} value={filter} onChange={setFilter} />

      <ul className="grid gap-6 sm:grid-cols-2">
        {visibleProducts.map((product) => (
          <li key={product.id}>
            <ProductCard product={product} onSelect={onSelectProduct} />
          </li>
        ))}
      </ul>
    </section>
  );
}
