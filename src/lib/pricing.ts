import type { DrinkProduct, DrinkSize, Product, Selection, Temperature } from '@/types/menu';

const TEMPERATURE_ORDER: Temperature[] = ['frio', 'caliente'];

export const TEMPERATURE_LABELS: Record<Temperature, string> = {
  frio: 'Frío',
  caliente: 'Caliente',
};

const priceFormatter = new Intl.NumberFormat('es-MX', {
  style: 'currency',
  currency: 'MXN',
  maximumFractionDigits: 0,
});

export function formatMXN(amount: number): string {
  return priceFormatter.format(amount);
}

export function getTemperatures(product: DrinkProduct): Temperature[] {
  return TEMPERATURE_ORDER.filter((temperature) =>
    product.variants.some((variant) => variant.temperature === temperature),
  );
}

export function getSizes(product: DrinkProduct, temperature: Temperature): DrinkSize[] {
  return product.variants
    .filter((variant) => variant.temperature === temperature)
    .map((variant) => variant.size)
    .sort((a, b) => a - b);
}

function findDrinkPrice(product: DrinkProduct, temperature: Temperature, size: DrinkSize): number | null {
  return product.variants.find((variant) => variant.temperature === temperature && variant.size === size)?.price ?? null;
}

export function getDefaultSelection(product: Product): Selection {
  if (product.kind === 'food') return { temperature: null, size: null };
  const temperature = getTemperatures(product)[0];
  return { temperature, size: getSizes(product, temperature)[0] };
}

export function selectTemperature(product: DrinkProduct, current: Selection, temperature: Temperature): Selection {
  const sizes = getSizes(product, temperature);
  const size = current.size !== null && sizes.includes(current.size) ? current.size : sizes[0];
  return { temperature, size };
}

export function getUnitPrice(product: Product, selection: Selection): number | null {
  if (product.kind === 'food') return product.price;
  if (selection.temperature === null || selection.size === null) return null;
  return findDrinkPrice(product, selection.temperature, selection.size);
}

export function getStartingPrice(product: Product): number {
  if (product.kind === 'food') return product.price;
  return Math.min(...product.variants.map((variant) => variant.price));
}

export function hasPriceRange(product: Product): boolean {
  if (product.kind === 'food') return false;
  return new Set(product.variants.map((variant) => variant.price)).size > 1;
}

export function getAvailabilityLabel(product: DrinkProduct): string {
  const temperatures = getTemperatures(product);
  if (temperatures.length > 1) return 'Frío y caliente';
  return temperatures[0] === 'frio' ? 'Solo frío' : 'Solo caliente';
}

export function getSelectionLabel(product: Product, selection: Selection): string {
  if (product.kind === 'food' || selection.temperature === null || selection.size === null) return '';
  return `${TEMPERATURE_LABELS[selection.temperature]} · ${selection.size} oz`;
}
