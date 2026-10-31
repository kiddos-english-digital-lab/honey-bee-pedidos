import { useState } from 'react';
import OrderItemsList from '@/components/order/OrderItemsList';
import Modal from '@/components/ui/Modal';
import StatusMessage from '@/components/ui/StatusMessage';
import type { AdminOrder } from '@/lib/adminOrders';
import { CANCEL_REASON_MAX_LENGTH } from '@/lib/orderValidation';
import { formatOrderDate } from '@/lib/orderFormat';
import { NEXT_ORDER_STATUSES, ORDER_STATUS_LABELS, ORDER_STATUS_TONES } from '@/lib/orderStatus';
import type { OrderStatus, OrderView } from '@/types/orders';

interface AdminOrderDetailProps {
  order: AdminOrder;
  onChangeStatus: (orderId: string, nextStatus: OrderStatus, reason: string | null) => Promise<OrderView>;
  onClose: () => void;
}

const ACTION_LABELS: Record<OrderStatus, string> = {
  recibido: 'Recibido',
  confirmado: 'Confirmar pedido',
  en_preparacion: 'Pasar a preparación',
  listo_para_recoger: 'Marcar listo para recoger',
  entregado: 'Marcar como entregado',
  cancelado: 'Cancelar pedido',
};

const UPDATE_ERROR_MESSAGES: Record<string, string> = {
  not_authorized: 'Tu cuenta no tiene permiso para cambiar pedidos.',
  not_found: 'Este pedido ya no existe. Actualiza la lista.',
  invalid_transition: 'Ese cambio de estado no está permitido desde el estado actual.',
  reason_required: 'Escribe un motivo para cancelar el pedido.',
};

const GENERIC_UPDATE_ERROR = 'No pudimos guardar el cambio. El estado anterior se mantiene; intenta de nuevo.';

function getUpdateErrorMessage(error: unknown): string {
  const code = error instanceof Error ? error.message : '';
  return UPDATE_ERROR_MESSAGES[code] ?? GENERIC_UPDATE_ERROR;
}

type Feedback = { tone: 'success' | 'error'; text: string } | null;

export default function AdminOrderDetail({ order, onChangeStatus, onClose }: AdminOrderDetailProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [feedback, setFeedback] = useState<Feedback>(null);
  const [isCancelling, setIsCancelling] = useState(false);
  const [cancelReason, setCancelReason] = useState('');

  const nextStatuses = NEXT_ORDER_STATUSES[order.status];
  const trimmedReason = cancelReason.trim();
  const reasonIsValid = trimmedReason.length > 0 && trimmedReason.length <= CANCEL_REASON_MAX_LENGTH;

  async function save(nextStatus: OrderStatus, reason: string | null) {
    setIsSaving(true);
    setFeedback(null);
    try {
      const view = await onChangeStatus(order.id, nextStatus, reason);
      setIsCancelling(false);
      setCancelReason('');
      setFeedback({ tone: 'success', text: `Estado actualizado a “${ORDER_STATUS_LABELS[view.status]}”.` });
    } catch (error) {
      console.error('status update failed', error);
      setFeedback({ tone: 'error', text: getUpdateErrorMessage(error) });
    } finally {
      setIsSaving(false);
    }
  }

  function handleAction(nextStatus: OrderStatus) {
    if (nextStatus === 'cancelado') {
      setFeedback(null);
      setIsCancelling(true);
      return;
    }
    void save(nextStatus, null);
  }

  return (
    <Modal label={`Pedido ${order.folio}`} title={order.folio} onClose={onClose}>
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <span className={`rounded-full px-4 py-1.5 text-sm font-bold ${ORDER_STATUS_TONES[order.status]}`}>
            {ORDER_STATUS_LABELS[order.status]}
          </span>
          <span className="text-sm text-cocoa-600">{formatOrderDate(order.createdAt)}</span>
        </div>

        <dl className="grid grid-cols-2 gap-4 rounded-2xl bg-white p-4 ring-1 ring-rose-200">
          <div>
            <dt className="text-xs font-bold uppercase tracking-wide text-cocoa-600">Cliente</dt>
            <dd className="font-bold text-cocoa-700">{order.customerName}</dd>
          </div>
          <div>
            <dt className="text-xs font-bold uppercase tracking-wide text-cocoa-600">Teléfono</dt>
            <dd className="font-bold text-cocoa-700">{order.customerPhone}</dd>
          </div>
          {order.statusReason && (
            <div className="col-span-2">
              <dt className="text-xs font-bold uppercase tracking-wide text-cocoa-600">Motivo</dt>
              <dd className="text-cocoa-700">{order.statusReason}</dd>
            </div>
          )}
        </dl>

        <OrderItemsList items={order.items} total={order.total} />

        {order.notes && <p className="text-sm italic text-cocoa-600">Notas generales: {order.notes}</p>}

        <section aria-labelledby="status-actions-title" className="space-y-4 border-t border-rose-200 pt-5">
          <h3 id="status-actions-title" className="font-bold text-cocoa-700">
            Cambiar estado
          </h3>

          {nextStatuses.length === 0 && (
            <p className="text-sm text-cocoa-600">Este pedido ya no tiene cambios disponibles.</p>
          )}

          {nextStatuses.length > 0 && !isCancelling && (
            <div className="flex flex-wrap gap-2">
              {nextStatuses.map((status) => (
                <button
                  key={status}
                  type="button"
                  disabled={isSaving}
                  onClick={() => handleAction(status)}
                  className={status === 'cancelado' ? 'btn-danger' : 'btn-primary'}
                >
                  {ACTION_LABELS[status]}
                </button>
              ))}
            </div>
          )}

          {isCancelling && (
            <div className="space-y-3 rounded-2xl bg-brick-100/60 p-4">
              <label htmlFor="cancel-reason" className="block text-sm font-bold text-brick-700">
                Motivo de cancelación (visible para el cliente)
              </label>
              <textarea
                id="cancel-reason"
                rows={2}
                maxLength={CANCEL_REASON_MAX_LENGTH}
                value={cancelReason}
                disabled={isSaving}
                onChange={(event) => setCancelReason(event.target.value)}
                className="w-full resize-none rounded-2xl border-2 border-brick-100 bg-white px-4 py-3 text-cocoa-700 focus:border-brick-500 focus:outline-none"
              />
              <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                <button type="button" disabled={isSaving} onClick={() => setIsCancelling(false)} className="btn-secondary">
                  Volver
                </button>
                <button
                  type="button"
                  disabled={isSaving || !reasonIsValid}
                  onClick={() => void save('cancelado', trimmedReason)}
                  className="btn-danger"
                >
                  {isSaving ? 'Guardando…' : 'Confirmar cancelación'}
                </button>
              </div>
            </div>
          )}

          {feedback && (
            <StatusMessage tone={feedback.tone === 'success' ? 'success' : 'error'}>{feedback.text}</StatusMessage>
          )}
        </section>
      </div>
    </Modal>
  );
}
