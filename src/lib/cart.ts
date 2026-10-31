import { getProductById } from '@/data/menu';
import { getUnitPrice } from '@/lib/pricing';
import type { CartLine, DrinkSize, Product, Selection, Temperature } from '@/types/menu';

export const CART_STORAGE_KEY = 'honeybee-carrito';
export const MIN_LINE_QUANTITY = 1;
export const MAX_LINE_QUANTITY = 99;
export const MAX_NOTES_LENGTH = 200;

export function getLineKey(line: Pick<CartLine, 'productId' | 'temperature' | 'size' | 'notes'>): string {
  return [line.productId, line.temperature ?? '', line.size ?? '', line.notes].join('|');
}

export function addLineToCart(lines: CartLine[], line: CartLine): CartLine[] {
  const key = getLineKey(line);
  if (!lines.some((existing) => getLineKey(existing) === key)) return [...lines, line];
  return lines.map((existing) =>
    getLineKey(existing) === key
      ? { ...existing, quantity: Math.min(existing.quantity + line.quantity, MAX_LINE_QUANTITY) }
      : existing,
  );
}

export function setLineQuantity(lines: CartLine[], key: string, quantity: number): CartLine[] {
  return lines.map((line) => (getLineKey(line) === key ? { ...line, quantity } : line));
}

export function removeLineFromCart(lines: CartLine[], key: string): CartLine[] {
  return lines.filter((line) => getLineKey(line) !== key);
}

export function getLinePricing(line: CartLine): { product: Product; unitPrice: number } | null {
  const product = getProductById(line.productId);
  if (!product) return null;
  const unitPrice = getUnitPrice(product, line);
  return unitPrice === null ? null : { product, unitPrice };
}

export function summarizeCart(lines: CartLine[]): { itemCount: number; total: number } {
  return lines.reduce(
    (summary, line) => {
      const pricing = getLinePricing(line);
      if (!pricing) return summary;
      return {
        itemCount: summary.itemCount + line.quantity,
        total: summary.total + pricing.unitPrice * line.quantity,
      };
    },
    { itemCount: 0, total: 0 },
  );
}

function parseSelection(product: Product, temperature: unknown, size: unknown): Selection | null {
  if (product.kind === 'food') return { temperature: null, size: null };
  const selection = { temperature: temperature as Temperature, size: size as DrinkSize };
  return getUnitPrice(product, selection) === null ? null : selection;
}

function parseCartLine(entry: unknown): CartLine | null {
  if (typeof entry !== 'object' || entry === null) return null;
  const record = entry as Record<string, unknown>;
  const product = typeof record.productId === 'string' ? getProductById(record.productId) : undefined;
  if (!product) return null;

  const { quantity } = record;
  if (typeof quantity !== 'number' || !Number.isInteger(quantity)) return null;
  if (quantity < MIN_LINE_QUANTITY || quantity > MAX_LINE_QUANTITY) return null;

  const selection = parseSelection(product, record.temperature, record.size);
  if (!selection) return null;

  const notes = typeof record.notes === 'string' ? record.notes.trim().slice(0, MAX_NOTES_LENGTH) : '';
  return { productId: product.id, ...selection, notes, quantity };
}

export function parseStoredCart(raw: unknown): CartLine[] {
  if (!Array.isArray(raw)) return [];
  return raw.reduce<CartLine[]>((lines, entry) => {
    const line = parseCartLine(entry);
    return line ? addLineToCart(lines, line) : lines;
  }, []);
}

export function readStoredCart(): CartLine[] {
  try {
    const raw = window.localStorage.getItem(CART_STORAGE_KEY);
    return raw ? parseStoredCart(JSON.parse(raw)) : [];
  } catch {
    return [];
  }
}

export function writeStoredCart(lines: CartLine[]): void {
  try {
    window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(lines));
  } catch {
    // Sin almacenamiento disponible el carrito funciona solo durante la sesión.
  }
}
