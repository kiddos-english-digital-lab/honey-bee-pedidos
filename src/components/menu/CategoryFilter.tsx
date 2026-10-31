import type { ProductCategory } from '@/types/menu';

export type CategoryFilterValue = ProductCategory | 'todo';

interface CategoryFilterProps {
  options: { value: CategoryFilterValue; label: string }[];
  value: CategoryFilterValue;
  onChange: (value: CategoryFilterValue) => void;
}

export default function CategoryFilter({ options, value, onChange }: CategoryFilterProps) {
  return (
    <div role="group" aria-label="Filtrar menú por categoría" className="flex flex-wrap gap-2">
      {options.map((option) => {
        const isActive = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            aria-pressed={isActive}
            onClick={() => onChange(option.value)}
            className={`min-h-[2.75rem] rounded-full px-5 py-2 font-bold transition ${
              isActive
                ? 'bg-cocoa-700 text-cream shadow-md'
                : 'bg-white text-cocoa-700 ring-1 ring-cocoa-200 hover:bg-rose-100'
            }`}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
