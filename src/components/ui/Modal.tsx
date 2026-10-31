import { X } from 'lucide-react';
import { useEffect, useRef, type ReactNode } from 'react';

interface ModalProps {
  label: string;
  title?: string;
  onClose: () => void;
  children: ReactNode;
  footer?: ReactNode;
  placement?: 'center' | 'end';
  flush?: boolean;
}

const FOCUSABLE_SELECTOR = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'textarea:not([disabled])',
  'select:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',');

function getFocusable(container: HTMLElement): HTMLElement[] {
  return Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR));
}

export default function Modal({
  label,
  title,
  onClose,
  children,
  footer,
  placement = 'center',
  flush = false,
}: ModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const onCloseRef = useRef(onClose);

  useEffect(() => {
    onCloseRef.current = onClose;
  });

  useEffect(() => {
    const dialog = dialogRef.current;
    const previouslyFocused = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    if (dialog) {
      const [firstFocusable] = getFocusable(dialog);
      (firstFocusable ?? dialog).focus();
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        event.preventDefault();
        onCloseRef.current();
        return;
      }
      if (event.key !== 'Tab' || !dialog) return;

      const focusable = getFocusable(dialog);
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = previousOverflow;
      previouslyFocused?.focus();
    };
  }, []);

  const isEnd = placement === 'end';

  return (
    <div className={`fixed inset-0 z-50 flex bg-cocoa-900/40 motion-safe:animate-fade-in ${isEnd ? 'justify-end' : 'items-end justify-center p-0 sm:items-center sm:p-4'}`} onMouseDown={(event) => {
      if (event.target === event.currentTarget) onClose();
    }}>
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label={label}
        tabIndex={-1}
        className={`flex max-h-[92vh] w-full flex-col bg-cream shadow-2xl focus:outline-none ${
          isEnd
            ? 'h-full max-w-md motion-safe:animate-slide-in-right sm:rounded-l-3xl'
            : 'max-w-lg rounded-t-3xl motion-safe:animate-slide-up sm:rounded-3xl'
        }`}
      >
        <div className="flex items-center justify-between gap-4 border-b border-rose-200 px-5 py-4 sm:px-6">
          {title ? <h2 className="font-display text-2xl text-cocoa-700">{title}</h2> : <span />}
          <button type="button" onClick={onClose} aria-label="Cerrar" className="icon-btn">
            <X aria-hidden="true" className="h-5 w-5" />
          </button>
        </div>
        <div className={`min-h-0 flex-1 overflow-y-auto ${flush ? '' : 'px-5 py-5 sm:px-6'}`}>{children}</div>
        {footer && <div className="border-t border-rose-200 px-5 py-4 sm:px-6">{footer}</div>}
      </div>
    </div>
  );
}
