import { CheckCircle2, Search } from 'lucide-react';
import Modal from '@/components/ui/Modal';
import OrderItemsList from '@/components/order/OrderItemsList';
import ShareLinkField from '@/components/order/ShareLinkField';
import { ORDER_STATUS_LABELS, ORDER_STATUS_TONES } from '@/lib/orderStatus';
import { buildTrackingPath } from '@/lib/routes';
import type { PlacedOrder } from '@/types/orders';

interface OrderConfirmationProps {
  order: PlacedOrder;
  onClose: () => void;
  onTrack: () => void;
}

export default function OrderConfirmation({ order, onClose, onTrack }: OrderConfirmationProps) {
  const trackingUrl = `${window.location.origin}${buildTrackingPath(order.trackingToken)}`;

  const footer = (
    <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
      <button type="button" onClick={onClose} className="btn-secondary w-full sm:w-auto">
        Volver al menú
      </button>
      <button type="button" onClick={onTrack} className="btn-primary w-full sm:w-auto">
        <Search aria-hidden="true" className="h-4 w-4" />
        Ver seguimiento
      </button>
    </div>
  );

  return (
    <Modal label="Pedido recibido" title="¡Pedido recibido!" onClose={onClose} footer={footer}>
      <div className="space-y-6">
        <div className="flex items-start gap-3 rounded-2xl bg-sage-100 px-4 py-4">
          <CheckCircle2 aria-hidden="true" className="mt-0.5 h-5 w-5 shrink-0 text-sage-700" />
          <p className="font-bold leading-relaxed text-sage-700">
            Recibimos tu pedido. Puedes revisar su estado en cualquier momento desde el enlace de seguimiento.
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm text-cocoa-600">Folio</p>
            <p className="font-display text-3xl font-semibold text-cocoa-700">{order.folio}</p>
          </div>
          <span className={`rounded-full px-4 py-1.5 text-sm font-bold ${ORDER_STATUS_TONES[order.status]}`}>
            {ORDER_STATUS_LABELS[order.status]}
          </span>
        </div>

        <OrderItemsList items={order.items} total={order.total} />

        <ShareLinkField label="Enlace privado para seguir tu pedido" url={trackingUrl} />
        <p className="text-sm text-cocoa-600">
          Guarda este enlace. Quien lo tenga podrá ver el estado de tu pedido.
        </p>
      </div>
    </Modal>
  );
}
