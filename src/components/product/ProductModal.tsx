import { useState } from 'react';
import DrinkOptions from '@/components/product/DrinkOptions';
import Modal from '@/components/ui/Modal';
import ProductPhoto from '@/components/ui/ProductPhoto';
import QuantityStepper from '@/components/ui/QuantityStepper';
import { useCart } from '@/context/CartContext';
import { MAX_NOTES_LENGTH } from '@/lib/cart';
import { formatMXN, getDefaultSelection, getUnitPrice, selectTemperature } from '@/lib/pricing';
import type { DrinkSize, Product, Selection, Temperature } from '@/types/menu';

const SIZE_ADJUSTED_NOTICE =
  'Las bebidas calientes solo están disponibles en 16 oz. Cambiamos tu selección a 16 oz.';

interface ProductModalProps {
  product: Product;
  onClose: () => void;
}

export default function ProductModal({ product, onClose }: ProductModalProps) {
  const { addLine } = useCart();
  const [selection, setSelection] = useState<Selection>(() => getDefaultSelection(product));
  const [quantity, setQuantity] = useState(1);
  const [notes, setNotes] = useState('');
  const [notice, setNotice] = useState<string | null>(null);

  const unitPrice = getUnitPrice(product, selection);
  const subtotal = unitPrice === null ? 0 : unitPrice * quantity;

  function handleTemperatureChange(temperature: Temperature) {
    if (product.kind !== 'drink') return;
    const next = selectTemperature(product, selection, temperature);
    setSelection(next);
    setNotice(next.size !== selection.size ? SIZE_ADJUSTED_NOTICE : null);
  }

  function handleSizeChange(size: DrinkSize) {
    setSelection((current) => ({ ...current, size }));
    setNotice(null);
  }

  function handleAdd() {
    if (unitPrice === null) return;
    addLine({
      productId: product.id,
      temperature: selection.temperature,
      size: selection.size,
      notes: notes.trim(),
      quantity,
    });
    onClose();
  }

  const footer = (
    <div className="flex items-center justify-between gap-4">
      <div>
        <p className="text-sm text-cocoa-600">
          {unitPrice === null ? 'Selecciona una opción' : `${formatMXN(unitPrice)} c/u`}
        </p>
        <p className="font-display text-2xl font-semibold text-cocoa-700" aria-live="polite">
          Subtotal {formatMXN(subtotal)}
        </p>
      </div>
      <button type="button" onClick={handleAdd} disabled={unitPrice === null} className="btn-primary">
        Agregar al carrito
      </button>
    </div>
  );

  return (
    <Modal label={product.name} title={product.name} onClose={onClose} footer={footer}>
      <div className="space-y-6">
        <div className="flex gap-4">
          <ProductPhoto
            src={product.photo}
            name={product.name}
            className="h-28 w-28 shrink-0 rounded-2xl sm:h-32 sm:w-32"
          />
          {product.description && (
            <p className="text-sm leading-relaxed text-cocoa-600">{product.description}</p>
          )}
        </div>

        {product.kind === 'drink' && (
          <DrinkOptions
            product={product}
            selection={selection}
            notice={notice}
            onTemperatureChange={handleTemperatureChange}
            onSizeChange={handleSizeChange}
          />
        )}

        <div className="flex items-center justify-between gap-4">
          <span className="text-sm font-bold text-cocoa-700">Cantidad</span>
          <QuantityStepper value={quantity} onChange={setQuantity} itemName={product.name} />
        </div>

        <div className="space-y-2">
          <label htmlFor="notas-producto" className="block text-sm font-bold text-cocoa-700">
            Notas para tu pedido (opcional)
          </label>
          <textarea
            id="notas-producto"
            rows={2}
            maxLength={MAX_NOTES_LENGTH}
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            placeholder="Ej. Sin azúcar, por favor"
            className="w-full resize-none rounded-2xl border-2 border-cocoa-200 bg-white px-4 py-3 text-cocoa-700 placeholder:text-cocoa-500 focus:border-cocoa-700 focus:outline-none"
          />
        </div>
      </div>
    </Modal>
  );
}
