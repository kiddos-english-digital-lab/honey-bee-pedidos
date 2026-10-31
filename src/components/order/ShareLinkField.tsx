import { Check, Copy } from 'lucide-react';
import { useRef, useState } from 'react';

interface ShareLinkFieldProps {
  label: string;
  url: string;
}

async function copyText(text: string, fallback: HTMLInputElement | null): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    if (!fallback) return false;
    fallback.focus();
    fallback.select();
    return document.execCommand('copy');
  }
}

export default function ShareLinkField({ label, url }: ShareLinkFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [status, setStatus] = useState<'idle' | 'copied' | 'failed'>('idle');

  async function handleCopy() {
    const copied = await copyText(url, inputRef.current);
    setStatus(copied ? 'copied' : 'failed');
    window.setTimeout(() => setStatus('idle'), 2400);
  }

  return (
    <div className="space-y-2">
      <label htmlFor="share-link" className="block text-sm font-bold text-cocoa-700">
        {label}
      </label>
      <div className="flex flex-col gap-2 sm:flex-row">
        <input
          id="share-link"
          ref={inputRef}
          readOnly
          value={url}
          onFocus={(event) => event.currentTarget.select()}
          className="min-w-0 flex-1 rounded-2xl border-2 border-cocoa-200 bg-white px-4 py-3 text-sm text-cocoa-700 focus:border-cocoa-700 focus:outline-none"
        />
        <button type="button" onClick={handleCopy} className="btn-secondary shrink-0">
          {status === 'copied' ? (
            <Check aria-hidden="true" className="h-4 w-4" />
          ) : (
            <Copy aria-hidden="true" className="h-4 w-4" />
          )}
          {status === 'copied' ? 'Copiado' : 'Copiar enlace'}
        </button>
      </div>
      <p role="status" className="min-h-5 text-sm font-bold text-cocoa-700">
        {status === 'failed' && 'No pudimos copiarlo. Selecciona el enlace y cópialo manualmente.'}
      </p>
    </div>
  );
}
