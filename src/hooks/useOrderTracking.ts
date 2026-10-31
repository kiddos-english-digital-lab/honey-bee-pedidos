import { useEffect, useState } from 'react';
import { fetchOrderByToken } from '@/lib/orders';
import { isFinalStatus } from '@/lib/orderStatus';
import type { OrderView } from '@/types/orders';

export const TRACKING_POLL_INTERVAL_MS = 25_000;

export type TrackingState =
  | { status: 'loading' }
  | { status: 'ready'; order: OrderView }
  | { status: 'not_found' }
  | { status: 'error' };

export function useOrderTracking(token: string): TrackingState {
  const [state, setState] = useState<TrackingState>({ status: 'loading' });

  useEffect(() => {
    let cancelled = false;
    let timer: number | undefined;

    async function load() {
      try {
        const order = await fetchOrderByToken(token);
        if (cancelled) return;
        if (!order) {
          setState({ status: 'not_found' });
          return;
        }
        setState({ status: 'ready', order });
        if (!isFinalStatus(order.status)) {
          timer = window.setTimeout(load, TRACKING_POLL_INTERVAL_MS);
        }
      } catch (error) {
        console.error('order tracking failed', error);
        if (cancelled) return;
        setState((current) => (current.status === 'ready' ? current : { status: 'error' }));
        timer = window.setTimeout(load, TRACKING_POLL_INTERVAL_MS);
      }
    }

    load();
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [token]);

  return state;
}
