import OptionGroup from '@/components/ui/OptionGroup';
import { formatMXN, getSizes, getTemperatures, getUnitPrice, TEMPERATURE_LABELS } from '@/lib/pricing';
import type { DrinkProduct, DrinkSize, Selection, Temperature } from '@/types/menu';

interface DrinkOptionsProps {
  product: DrinkProduct;
  selection: Selection;
  notice: string | null;
  onTemperatureChange: (temperature: Temperature) => void;
  onSizeChange: (size: DrinkSize) => void;
}

export default function DrinkOptions({
  product,
  selection,
  notice,
  onTemperatureChange,
  onSizeChange,
}: DrinkOptionsProps) {
  const { temperature, size } = selection;
  if (temperature === null || size === null) return null;

  return (
    <div className="space-y-6">
      <OptionGroup
        legend="Temperatura"
        name="temperatura"
        value={temperature}
        onChange={onTemperatureChange}
        options={getTemperatures(product).map((option) => ({
          value: option,
          label: TEMPERATURE_LABELS[option],
        }))}
      />
      <OptionGroup
        legend="Tamaño"
        name="tamano"
        value={size}
        onChange={onSizeChange}
        options={getSizes(product, temperature).map((option) => {
          const price = getUnitPrice(product, { temperature, size: option });
          return {
            value: option,
            label: `${option} oz`,
            description: price === null ? undefined : formatMXN(price),
          };
        })}
      />
      {notice && (
        <p role="status" className="rounded-2xl bg-amber-100 px-4 py-3 text-sm font-bold text-amber-700">
          {notice}
        </p>
      )}
    </div>
  );
}
