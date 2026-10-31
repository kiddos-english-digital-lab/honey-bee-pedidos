import { LogOut, Loader2 } from 'lucide-react';
import { useState } from 'react';
import AdminDashboard from '@/components/admin/AdminDashboard';
import AdminLogin from '@/components/admin/AdminLogin';
import BrandMark from '@/components/layout/BrandMark';
import StatusMessage from '@/components/ui/StatusMessage';
import { useAdminSession } from '@/hooks/useAdminSession';
import { isSupabaseConfigured, supabase } from '@/lib/supabase';

export default function AdminPage() {
  const session = useAdminSession();
  const [logoutError, setLogoutError] = useState<string | null>(null);
  const [isSigningOut, setIsSigningOut] = useState(false);

  async function handleSignOut() {
    if (!supabase || isSigningOut) return;
    setLogoutError(null);
    setIsSigningOut(true);
    const { error } = await supabase.auth.signOut();
    setIsSigningOut(false);
    if (error) {
      console.error('sign-out failed', error);
      setLogoutError('No pudimos cerrar la sesión. Intenta de nuevo.');
    }
  }

  const email = session.status === 'loading' || session.status === 'signed_out' ? '' : session.email;
  const canSignOut = session.status !== 'loading' && session.status !== 'signed_out';

  return (
    <div className="min-h-screen">
      <header className="border-b border-rose-200 bg-cream/95">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <div className="flex items-center gap-4">
            <a href="/" className="rounded-full">
              <BrandMark />
            </a>
            <span className="text-sm font-bold text-cocoa-600">Administración</span>
          </div>
          {canSignOut && (
            <div className="flex items-center gap-3">
              {email && <span className="hidden text-sm text-cocoa-600 sm:inline">{email}</span>}
              <button type="button" onClick={handleSignOut} disabled={isSigningOut} className="btn-secondary">
                {isSigningOut ? <Loader2 aria-hidden="true" className="h-4 w-4 animate-spin" /> : <LogOut aria-hidden="true" className="h-4 w-4" />}
                Cerrar sesión
              </button>
            </div>
          )}
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
        {logoutError && (
          <div className="mb-6">
            <StatusMessage tone="error">{logoutError}</StatusMessage>
          </div>
        )}

        {!isSupabaseConfigured && (
          <StatusMessage tone="error">
            Falta configurar la conexión con la base de datos. Agrega las variables VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY
            para usar el panel.
          </StatusMessage>
        )}

        {isSupabaseConfigured && session.status === 'loading' && (
          <div className="flex items-center justify-center gap-3 py-24 text-cocoa-700">
            <Loader2 aria-hidden="true" className="h-5 w-5 animate-spin" />
            <span className="font-bold">Verificando acceso…</span>
          </div>
        )}

        {isSupabaseConfigured && session.status === 'signed_out' && <AdminLogin />}

        {isSupabaseConfigured && session.status === 'forbidden' && (
          <StatusMessage tone="warning">
            Tu cuenta no tiene permisos de administración. Pide a la persona responsable que la autorice.
          </StatusMessage>
        )}

        {isSupabaseConfigured && session.status === 'error' && (
          <StatusMessage tone="error">
            No pudimos verificar tus permisos en este momento. Cierra sesión e intenta de nuevo.
          </StatusMessage>
        )}

        {isSupabaseConfigured && session.status === 'admin' && <AdminDashboard />}
      </main>
    </div>
  );
}
