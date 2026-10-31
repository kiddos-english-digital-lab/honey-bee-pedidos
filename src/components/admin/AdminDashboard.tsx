import { ChevronRight, RefreshCw } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import AdminOrderDetail from '@/components/admin/AdminOrderDetail';
import IntakeSwitch from '@/components/admin/IntakeSwitch';
import StatusMessage from '@/components/ui/StatusMessage';
import { fetchAdminOrders, updateOrderStatus, type AdminOrder } from '@/lib/adminOrders';
import { formatOrderDate } from '@/lib/orderFormat';
import { ORDER_STATUS_LABELS, ORDER_STATUS_TONES } from '@/lib/orderStatus';
import { formatMXN } from '@/lib/pricing';
import { ORDER_STATUSES, type OrderStatus, type OrderView } from '@/types/orders';

const ADMIN_REFRESH_INTERVAL_MS = 30_000;

type StatusFilter = 'todos' | OrderStatus;

export default function AdminDashboard() {
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [filter, setFilter] = useState<StatusFilter>('todos');
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const loadOrders = useCallback(async () => {
    try {
      const data = await fetchAdminOrders();
      setOrders(data);
      setLoadError(null);
    } catch (error) {
      console.error('admin orders load failed', error);
      setLoadError('No pudimos cargar los pedidos. Revisa tu conexión e intenta de nuevo.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadOrders();
    const intervalId = window.setInterval(() => void loadOrders(), ADMIN_REFRESH_INTERVAL_MS);
    return () => window.clearInterval(intervalId);
  }, [loadOrders]);

  async function changeStatus(orderId: string, nextStatus: OrderStatus, reason: string | null): Promise<OrderView> {
    const view = await updateOrderStatus(orderId, nextStatus, reason);
    setOrders((current) =>
      current.map((order) =>
        order.id === orderId
          ? { ...order, status: view.status, statusReason: view.statusReason, updatedAt: view.updatedAt }
          : order,
      ),
    );
    return view;
  }

  const visibleOrders = filter === 'todos' ? orders : orders.filter((order) => order.status === filter);
  const selectedOrder = orders.find((order) => order.id === selectedId) ?? null;

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-6 rounded-3xl bg-white p-5 shadow-sm ring-1 ring-rose-200 sm:flex-row sm:items-center sm:justify-between sm:p-6">
        <div>
          <p className="eyebrow">Pedidos</p>
          <h1 className="mt-1 font-display text-3xl text-cocoa-700">Pedidos recientes</h1>
        </div>
        <IntakeSwitch />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <FilterChip label="Todos" count={orders.length} active={filter === 'todos'} onClick={() => setFilter('todos')} />
        {ORDER_STATUSES.map((status) => (
          <FilterChip
            key={status}
            label={ORDER_STATUS_LABELS[status]}
            count={orders.filter((order) => order.status === status).length}
            active={filter === status}
            onClick={() => setFilter(status)}
          />
        ))}
        <button
          type="button"
          onClick={() => void loadOrders()}
          aria-label="Actualizar pedidos"
          className="icon-btn ml-auto"
        >
          <RefreshCw aria-hidden="true" className="h-4 w-4" />
        </button>
      </div>

      {loadError && <StatusMessage tone="error">{loadError}</StatusMessage>}

      {isLoading && orders.length === 0 && !loadError && (
        <p className="py-16 text-center font-bold text-cocoa-600">Cargando pedidos…</p>
      )}

      {!isLoading && !loadError && visibleOrders.length === 0 && (
        <p className="rounded-3xl bg-white px-6 py-16 text-center text-cocoa-600 ring-1 ring-rose-200">
          {orders.length === 0 ? 'Todavía no hay pedidos.' : 'No hay pedidos con este estado.'}
        </p>
      )}

      {visibleOrders.length > 0 && (
        <ul className="divide-y divide-rose-200 overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-rose-200">
          {visibleOrders.map((order) => (
            <li key={order.id}>
              <button
                type="button"
                onClick={() => setSelectedId(order.id)}
                className="group flex w-full items-center gap-4 px-5 py-4 text-left transition hover:bg-rose-100/50 sm:px-6"
              >
                <div className="min-w-0 flex-1 space-y-1">
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                    <span className="font-display text-xl text-cocoa-700">{order.folio}</span>
                    <span className={`rounded-full px-3 py-0.5 text-xs font-bold ${ORDER_STATUS_TONES[order.status]}`}>
                      {ORDER_STATUS_LABELS[order.status]}
                    </span>
                  </div>
                  <p className="truncate text-sm text-cocoa-600">
                    {order.customerName} · {formatOrderDate(order.createdAt)}
                  </p>
                </div>
                <div className="shrink-0 text-right">
                  <p className="font-bold text-cocoa-700">{formatMXN(order.total)}</p>
                  <p className="text-xs text-cocoa-600">
                    {order.items.reduce((sum, item) => sum + item.quantity, 0)} uds.
                  </p>
                </div>
                <ChevronRight aria-hidden="true" className="h-5 w-5 shrink-0 text-cocoa-500 transition group-hover:translate-x-0.5" />
              </button>
            </li>
          ))}
        </ul>
      )}

      {selectedOrder && (
        <AdminOrderDetail
          key={selectedOrder.id}
          order={selectedOrder}
          onChangeStatus={changeStatus}
          onClose={() => setSelectedId(null)}
        />
      )}
    </div>
  );
}

interface FilterChipProps {
  label: string;
  count: number;
  active: boolean;
  onClick: () => void;
}

function FilterChip({ label, count, active, onClick }: FilterChipProps) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={`rounded-full px-4 py-2 text-sm font-bold transition ${
        active ? 'bg-cocoa-700 text-cream' : 'bg-white text-cocoa-700 ring-1 ring-rose-200 hover:bg-rose-100'
      }`}
    >
      {label} <span className="opacity-70">({count})</span>
    </button>
  );
}
