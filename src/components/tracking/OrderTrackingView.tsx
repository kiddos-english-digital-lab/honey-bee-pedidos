import { Check, CircleX, PartyPopper } from 'lucide-react';
import OrderItemsList from '@/components/order/OrderItemsList';
import { formatOrderDate } from '@/lib/orderFormat';
import { ORDER_STATUS_LABELS, ORDER_STATUS_TONES, PROGRESS_STATUSES, isFinalStatus } from '@/lib/orderStatus';
import type { OrderView } from '@/types/orders';

interface OrderTrackingViewProps {
  order: OrderView;
}

export default function OrderTrackingView({ order }: OrderTrackingViewProps) {
  const isCancelled = order.status === 'cancelado';
  const isReady = order.status === 'listo_para_recoger';
  const currentIndex = PROGRESS_STATUSES.indexOf(order.status);

  return (
    <article className="space-y-8">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow">Pedido para recoger</p>
          <h1 className="mt-2 font-display text-4xl text-cocoa-700">{order.folio}</h1>
          <p className="mt-1 text-sm text-cocoa-600">
            A nombre de {order.customerName} · {formatOrderDate(order.createdAt)}
          </p>
        </div>
        <span className={`rounded-full px-4 py-1.5 text-sm font-bold ${ORDER_STATUS_TONES[order.status]}`}>
          {ORDER_STATUS_LABELS[order.status]}
        </span>
      </header>

      {isReady && (
        <div role="status" className="flex items-center gap-4 rounded-3xl bg-sage-700 px-5 py-5 text-cream shadow-lg motion-safe:animate-pop sm:px-6">
          <PartyPopper aria-hidden="true" className="h-8 w-8 shrink-0" />
          <p className="font-display text-2xl leading-snug">¡Tu pedido está listo! Ya puedes pasar a recogerlo</p>
        </div>
      )}

      {isCancelled && (
        <div role="status" className="flex items-start gap-4 rounded-3xl bg-brick-100 px-5 py-5 text-brick-700">
          <CircleX aria-hidden="true" className="mt-0.5 h-6 w-6 shrink-0" />
          <div className="space-y-1">
            <p className="font-bold">Tu pedido fue cancelado</p>
            {order.statusReason && <p className="text-sm leading-relaxed">Motivo: {order.statusReason}</p>}
          </div>
        </div>
      )}

      {!isCancelled && (
        <ol aria-label="Progreso del pedido" className="grid gap-3 sm:grid-cols-5">
          {PROGRESS_STATUSES.map((status, index) => {
            const isDone = currentIndex >= index;
            const isCurrent = currentIndex === index;
            return (
              <li
                key={status}
                aria-current={isCurrent ? 'step' : undefined}
                className={`flex items-center gap-3 rounded-2xl px-4 py-3 sm:flex-col sm:text-center ${
                  isDone ? 'bg-white ring-1 ring-sage-500' : 'bg-rose-100/60'
                }`}
              >
                <span
                  className={`grid h-7 w-7 shrink-0 place-items-center rounded-full text-xs font-bold ${
                    isDone ? 'bg-sage-500 text-white' : 'bg-cocoa-200 text-cocoa-700'
                  }`}
                >
                  {isDone ? <Check aria-hidden="true" className="h-4 w-4" /> : index + 1}
                </span>
                <span className={`text-sm font-bold ${isDone ? 'text-cocoa-700' : 'text-cocoa-600'}`}>
                  {ORDER_STATUS_LABELS[status]}
                </span>
              </li>
            );
          })}
        </ol>
      )}

      <section aria-labelledby="order-detail-title" className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-rose-200 sm:p-6">
        <h2 id="order-detail-title" className="font-display text-2xl text-cocoa-700">
          Tu pedido
        </h2>
        <div className="mt-4">
          <OrderItemsList items={order.items} total={order.total} />
        </div>
        {order.notes && <p className="mt-4 text-sm italic text-cocoa-600">Notas generales: {order.notes}</p>}
      </section>

      {!isFinalStatus(order.status) && (
        <p className="text-center text-sm text-cocoa-600">Esta página se actualiza sola cada pocos segundos.</p>
      )}
    </article>
  );
}
