import { ArrowLeft, Loader2, RotateCw, Send } from 'lucide-react';
import { useState } from 'react';
import CheckoutForm from '@/components/review/CheckoutForm';
import Modal from '@/components/ui/Modal';
import StatusMessage from '@/components/ui/StatusMessage';
import { useCart } from '@/context/CartContext';
import { useOrderIntake } from '@/hooks/useOrderIntake';
import { getLineKey, getLinePricing, summarizeCart } from '@/lib/cart';
import { placeOrder } from '@/lib/orders';
import { getOrderErrorMessage, normalizePhone, validateCheckout, type CheckoutErrors, type CheckoutFields } from '@/lib/orderValidation';
import { formatMXN, getSelectionLabel } from '@/lib/pricing';
import type { PlacedOrder } from '@/types/orders';

interface OrderReviewModalProps {
  onClose: () => void;
  onPlaced: (order: PlacedOrder) => void;
}

const EMPTY_FIELDS: CheckoutFields = { name: '', phone: '', notes: '' };

export default function OrderReviewModal({ onClose, onPlaced }: OrderReviewModalProps) {
  const { lines, clearCart } = useCart();
  const { itemCount, total } = summarizeCart(lines);
  const { state: intake, refresh: refreshIntake } = useOrderIntake();
  const [fields, setFields] = useState<CheckoutFields>(EMPTY_FIELDS);
  const [errors, setErrors] = useState<CheckoutErrors>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);
  const [idempotencyKey] = useState(() => crypto.randomUUID());

  const isOpen = intake.status === 'ready' && intake.isOpen;
  const canSubmit = isOpen && lines.length > 0 && !isSending;

  function handleFieldChange(field: keyof CheckoutFields, value: string) {
    setFields((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
  }

  async function handleSubmit() {
    if (!canSubmit) return;

    const validation = validateCheckout(fields);
    setErrors(validation);
    if (Object.keys(validation).length > 0) return;

    setSubmitError(null);
    setIsSending(true);
    try {
      const placed = await placeOrder({
        idempotencyKey,
        name: fields.name,
        phone: normalizePhone(fields.phone),
        notes: fields.notes,
        items: lines.map((line) => ({
          productId: line.productId,
          temperature: line.temperature,
          size: line.size,
          quantity: line.quantity,
          notes: line.notes,
        })),
      });
      clearCart();
      onPlaced(placed);
    } catch (error) {
      console.error('order submit failed', error);
      setSubmitError(getOrderErrorMessage(error));
      setIsSending(false);
    }
  }

  const footer = (
    <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
      <button type="button" onClick={onClose} disabled={isSending} className="btn-secondary w-full sm:w-auto">
        <ArrowLeft aria-hidden="true" className="h-4 w-4" />
        Seguir editando
      </button>
      <button
        type="submit"
        form="checkout-form"
        disabled={!canSubmit}
        className="btn-primary w-full sm:w-auto"
      >
        {isSending ? (
          <>
            <Loader2 aria-hidden="true" className="h-4 w-4 animate-spin" />
            Enviando…
          </>
        ) : (
          <>
            <Send aria-hidden="true" className="h-4 w-4" />
            Enviar pedido
          </>
        )}
      </button>
    </div>
  );

  return (
    <Modal label="Revisión del pedido" title="Revisa tu pedido" onClose={onClose} footer={footer}>
      <div className="space-y-6">
        {intake.status === 'loading' && (
          <StatusMessage tone="info">Comprobando si estamos recibiendo pedidos…</StatusMessage>
        )}
        {intake.status === 'error' && (
          <div className="space-y-3">
            <StatusMessage tone="error">
              <p>No pudimos comprobar si estamos recibiendo pedidos. Revisa tu conexión e intenta de nuevo.</p>
              <p className="mt-1 font-normal">{intake.message}</p>
            </StatusMessage>
            <button type="button" onClick={refreshIntake} className="btn-secondary">
              <RotateCw aria-hidden="true" className="h-4 w-4" />
              Reintentar
            </button>
          </div>
        )}
        {intake.status === 'ready' && !intake.isOpen && (
          <StatusMessage tone="warning">
            Por ahora no estamos recibiendo pedidos. Puedes seguir revisando el menú y tu carrito.
          </StatusMessage>
        )}

        <ul className="divide-y divide-rose-100">
          {lines.map((line) => {
            const pricing = getLinePricing(line);
            if (!pricing) return null;
            const { product, unitPrice } = pricing;
            const details = getSelectionLabel(product, line);
            return (
              <li key={getLineKey(line)} className="flex items-start justify-between gap-4 py-4">
                <div className="min-w-0">
                  <p className="font-bold text-cocoa-700">
                    {line.quantity} × {product.name}
                  </p>
                  {details && <p className="text-sm text-cocoa-600">{details}</p>}
                  {line.notes && <p className="break-words text-sm italic text-cocoa-600">Notas: {line.notes}</p>}
                </div>
                <p className="shrink-0 font-bold text-cocoa-700">{formatMXN(unitPrice * line.quantity)}</p>
              </li>
            );
          })}
        </ul>

        <div className="flex items-baseline justify-between gap-4 border-t border-rose-200 pt-5">
          <span className="font-bold text-cocoa-700">Total ({itemCount} {itemCount === 1 ? 'unidad' : 'unidades'})</span>
          <span className="font-display text-3xl font-semibold text-cocoa-700">{formatMXN(total)}</span>
        </div>

        <CheckoutForm
          fields={fields}
          errors={errors}
          disabled={isSending || !isOpen}
          onChange={handleFieldChange}
          onSubmit={handleSubmit}
        />

        {submitError && <StatusMessage tone="error">{submitError}</StatusMessage>}
      </div>
    </Modal>
  );
}
