import { useEffect, useState } from 'react';
import type { Session } from '@supabase/supabase-js';
import { fetchIsAdmin } from '@/lib/adminOrders';
import { supabase } from '@/lib/supabase';

export type AdminSessionState =
  | { status: 'loading' }
  | { status: 'signed_out' }
  | { status: 'forbidden'; email: string }
  | { status: 'admin'; email: string }
  | { status: 'error'; email: string };

export function useAdminSession(): AdminSessionState {
  const [state, setState] = useState<AdminSessionState>({ status: 'loading' });

  useEffect(() => {
    if (!supabase) return;
    const client = supabase;
    let active = true;

    async function resolve(session: Session | null) {
      if (!session) {
        if (active) setState({ status: 'signed_out' });
        return;
      }
      const email = session.user.email ?? '';
      if (active) setState({ status: 'loading' });
      try {
        const isAdmin = await fetchIsAdmin();
        if (active) setState(isAdmin ? { status: 'admin', email } : { status: 'forbidden', email });
      } catch (error) {
        console.error('admin check failed', error);
        if (active) setState({ status: 'error', email });
      }
    }

    const { data } = client.auth.onAuthStateChange((_event, session) => {
      window.setTimeout(() => {
        void resolve(session);
      }, 0);
    });

    return () => {
      active = false;
      data.subscription.unsubscribe();
    };
  }, []);

  return state;
}
