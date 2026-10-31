import { useState } from 'react';
import { useOrderIntake } from '@/hooks/useOrderIntake';
import StatusMessage from '@/components/ui/StatusMessage';
import { setOrdersAccepting } from '@/lib/adminOrders';

export default function IntakeSwitch() {
  const { state, refresh } = useOrderIntake();
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedMessage, setSavedMessage] = useState<string | null>(null);

  if (state.status === 'loading') {
    return <p className="text-sm font-bold text-cocoa-600">Cargando recepción…</p>;
  }

  if (state.status === 'error') {
    return (
      <div className="space-y-2">
        <StatusMessage tone="error">
          <p>No se pudo leer la recepción de pedidos.</p>
          <p className="mt-1 font-normal">{state.message}</p>
        </StatusMessage>
        <button type="button" onClick={refresh} className="btn-secondary">
          Reintentar
        </button>
      </div>
    );
  }

  const isOpen = state.isOpen;

  async function handleToggle() {
    if (isSaving || state.status !== 'ready') return;
    setIsSaving(true);
    setError(null);
    setSavedMessage(null);
    try {
      const saved = await setOrdersAccepting(!isOpen);
      setSavedMessage(saved ? 'Recepción de pedidos abierta.' : 'Recepción de pedidos cerrada.');
      refresh();
    } catch (saveError) {
      console.error('intake update failed', saveError);
      setError('No pudimos guardar el cambio. La recepción sigue como estaba; intenta de nuevo.');
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="flex flex-col items-start gap-2 sm:items-end">
      <button
        type="button"
        role="switch"
        aria-checked={isOpen}
        disabled={isSaving}
        onClick={handleToggle}
        className="flex items-center gap-3 rounded-full bg-cream px-2 py-1.5 pr-4 ring-1 ring-cocoa-200 transition hover:bg-rose-50 disabled:opacity-60"
      >
        <span
          className={`relative inline-flex h-7 w-12 shrink-0 items-center rounded-full transition-colors ${
            isOpen ? 'bg-sage-500' : 'bg-cocoa-300'
          }`}
        >
          <span
            className={`inline-block h-5 w-5 rounded-full bg-white shadow transition-transform ${
              isOpen ? 'translate-x-6' : 'translate-x-1'
            }`}
          />
        </span>
        <span className="text-sm font-bold text-cocoa-700">
          Recepción de pedidos {isOpen ? 'abierta' : 'cerrada'}
        </span>
      </button>
      {savedMessage && <p role="status" className="text-sm font-bold text-sage-700">{savedMessage}</p>}
      {error && <StatusMessage tone="error">{error}</StatusMessage>}
    </div>
  );
}
