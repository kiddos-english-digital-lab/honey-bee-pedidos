import { useEffect, useState } from 'react';

export function usePathname(): string {
  const [pathname, setPathname] = useState(() => window.location.pathname);

  useEffect(() => {
    function handleChange() {
      setPathname(window.location.pathname);
    }
    window.addEventListener('popstate', handleChange);
    return () => window.removeEventListener('popstate', handleChange);
  }, []);

  return pathname;
}

export function navigateTo(path: string, state: Record<string, unknown> | null = null): void {
  window.history.pushState(state, '', path);
  window.dispatchEvent(new PopStateEvent('popstate', { state }));
  window.scrollTo({ top: 0 });
}
