import { useCallback, useEffect, useState } from 'react';
import { fetchIntakeStatus } from '@/lib/orders';
import { getIntakeErrorMessage } from '@/lib/orderValidation';

export type IntakeState =
  | { status: 'loading' }
  | { status: 'ready'; isOpen: boolean }
  | { status: 'error'; message: string };

export function useOrderIntake() {
  const [state, setState] = useState<IntakeState>({ status: 'loading' });

  const refresh = useCallback(() => {
    setState({ status: 'loading' });
    fetchIntakeStatus()
      .then((isOpen) => setState({ status: 'ready', isOpen }))
      .catch((error: unknown) => {
        console.error('order intake check failed', error);
        setState({ status: 'error', message: getIntakeErrorMessage(error) });
      });
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { state, refresh };
}
