import { ArrowLeft, Loader2, SearchX } from 'lucide-react';
import type { ReactNode } from 'react';
import BrandMark from '@/components/layout/BrandMark';
import OrderTrackingView from '@/components/tracking/OrderTrackingView';
import StatusMessage from '@/components/ui/StatusMessage';
import { useOrderTracking } from '@/hooks/useOrderTracking';
import { isTrackingToken } from '@/lib/orderValidation';

interface TrackingPageProps {
  token: string;
}

export default function TrackingPage({ token }: TrackingPageProps) {
  if (!isTrackingToken(token)) return <TrackingShell><NotFound /></TrackingShell>;
  return <TrackingLoader key={token} token={token} />;
}

function TrackingLoader({ token }: TrackingPageProps) {
  const state = useOrderTracking(token);

  return (
    <TrackingShell>
      {state.status === 'loading' && (
        <div className="flex items-center justify-center gap-3 py-24 text-cocoa-700">
          <Loader2 aria-hidden="true" className="h-5 w-5 animate-spin" />
          <span className="font-bold">Buscando tu pedido…</span>
        </div>
      )}
      {state.status === 'not_found' && <NotFound />}
      {state.status === 'error' && (
        <StatusMessage tone="error">
          No pudimos consultar tu pedido en este momento. Lo intentaremos de nuevo en unos segundos.
        </StatusMessage>
      )}
      {state.status === 'ready' && <OrderTrackingView order={state.order} />}
    </TrackingShell>
  );
}

function NotFound() {
  return (
    <div className="mx-auto max-w-md space-y-4 py-16 text-center">
      <SearchX aria-hidden="true" className="mx-auto h-10 w-10 text-cocoa-600" />
      <h1 className="font-display text-3xl text-cocoa-700">No encontramos este pedido</h1>
      <p className="text-cocoa-600">Revisa que el enlace esté completo. Si lo perdiste, no podemos buscarlo por folio.</p>
    </div>
  );
}

function TrackingShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen">
      <header className="border-b border-rose-200 bg-cream/95">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <a href="/" className="rounded-full">
            <BrandMark />
          </a>
          <a href="/" className="inline-flex items-center gap-2 rounded-full px-4 py-2 font-bold text-cocoa-700 transition hover:bg-rose-100">
            <ArrowLeft aria-hidden="true" className="h-4 w-4" />
            Menú
          </a>
        </div>
      </header>
      <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6">{children}</main>
    </div>
  );
}
