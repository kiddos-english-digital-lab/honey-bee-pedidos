import { LogIn, Loader2 } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import StatusMessage from '@/components/ui/StatusMessage';
import { supabase } from '@/lib/supabase';

const INPUT_CLASS =
  'w-full rounded-2xl border-2 border-cocoa-200 bg-white px-4 py-3 text-cocoa-700 focus:border-cocoa-700 focus:outline-none disabled:opacity-60';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSigningIn, setIsSigningIn] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!supabase || isSigningIn) return;
    setError(null);
    setIsSigningIn(true);
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });
    setIsSigningIn(false);
    if (signInError) {
      console.error('admin sign-in failed', signInError);
      setError('Correo o contraseña incorrectos. Revisa tus datos e intenta de nuevo.');
      setPassword('');
    }
  }

  return (
    <div className="mx-auto max-w-md rounded-3xl bg-white p-6 shadow-sm ring-1 ring-rose-200 sm:p-8">
      <h2 className="font-display text-3xl text-cocoa-700">Iniciar sesión</h2>
      <p className="mt-2 text-sm text-cocoa-600">Acceso exclusivo para la administración del negocio.</p>

      <form className="mt-6 space-y-5" onSubmit={handleSubmit} noValidate>
        <div className="space-y-2">
          <label htmlFor="admin-email" className="block text-sm font-bold text-cocoa-700">
            Correo
          </label>
          <input
            id="admin-email"
            type="email"
            autoComplete="username"
            required
            maxLength={254}
            value={email}
            disabled={isSigningIn}
            onChange={(event) => setEmail(event.target.value)}
            className={INPUT_CLASS}
          />
        </div>
        <div className="space-y-2">
          <label htmlFor="admin-password" className="block text-sm font-bold text-cocoa-700">
            Contraseña
          </label>
          <input
            id="admin-password"
            type="password"
            autoComplete="current-password"
            required
            maxLength={128}
            value={password}
            disabled={isSigningIn}
            onChange={(event) => setPassword(event.target.value)}
            className={INPUT_CLASS}
          />
        </div>

        {error && <StatusMessage tone="error">{error}</StatusMessage>}

        <button type="submit" disabled={isSigningIn || !email || !password} className="btn-primary w-full">
          {isSigningIn ? (
            <>
              <Loader2 aria-hidden="true" className="h-4 w-4 animate-spin" />
              Entrando…
            </>
          ) : (
            <>
              <LogIn aria-hidden="true" className="h-4 w-4" />
              Entrar
            </>
          )}
        </button>
      </form>
    </div>
  );
}
