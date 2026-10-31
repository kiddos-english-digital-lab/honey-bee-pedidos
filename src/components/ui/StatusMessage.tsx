import { AlertTriangle, CheckCircle2, Info } from 'lucide-react';
import type { ReactNode } from 'react';

type Tone = 'success' | 'error' | 'info' | 'warning';

const TONE_STYLES: Record<Tone, { container: string; icon: typeof Info }> = {
  success: { container: 'bg-sage-100 text-sage-700', icon: CheckCircle2 },
  error: { container: 'bg-brick-100 text-brick-700', icon: AlertTriangle },
  info: { container: 'bg-butter-200 text-cocoa-700', icon: Info },
  warning: { container: 'bg-amber-100 text-amber-700', icon: AlertTriangle },
};

interface StatusMessageProps {
  tone: Tone;
  children: ReactNode;
}

export default function StatusMessage({ tone, children }: StatusMessageProps) {
  const { container, icon: Icon } = TONE_STYLES[tone];
  return (
    <div
      role={tone === 'error' ? 'alert' : 'status'}
      className={`flex items-start gap-3 rounded-2xl px-4 py-3 text-sm font-bold leading-relaxed ${container}`}
    >
      <Icon aria-hidden="true" className="mt-0.5 h-5 w-5 shrink-0" />
      <div className="min-w-0">{children}</div>
    </div>
  );
}
