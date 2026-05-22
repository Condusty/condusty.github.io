import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '@/lib/cn';

type ToastTone = 'default' | 'error' | 'success';

interface ToastItem {
  id: number;
  title: string;
  description?: string;
  tone: ToastTone;
}

interface ToastApi {
  show: (input: { title: string; description?: string; tone?: ToastTone }) => void;
}

const ToastContext = createContext<ToastApi | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const idRef = useRef(0);

  const dismiss = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const show = useCallback<ToastApi['show']>(({ title, description, tone = 'default' }) => {
    const id = ++idRef.current;
    setToasts((prev) => [...prev, { id, title, description, tone }]);
    window.setTimeout(() => dismiss(id), tone === 'error' ? 6000 : 3500);
  }, [dismiss]);

  return (
    <ToastContext.Provider value={{ show }}>
      {children}
      {createPortal(
        <div className="pointer-events-none fixed top-4 right-4 z-[60] flex flex-col gap-2 max-w-sm">
          {toasts.map((t) => (
            <div
              key={t.id}
              className={cn(
                'pointer-events-auto rounded-md border bg-surface px-4 py-3 shadow-lg',
                t.tone === 'error' && 'border-[color-mix(in_srgb,var(--danger)_40%,var(--border))]',
                t.tone === 'success' && 'border-[color-mix(in_srgb,var(--success)_40%,var(--border))]',
                t.tone === 'default' && 'border-border-strong',
              )}
              role="status"
            >
              <div className="text-sm font-medium text-fg">{t.title}</div>
              {t.description && (
                <div className="mt-1 text-xs text-fg-muted whitespace-pre-line">{t.description}</div>
              )}
            </div>
          ))}
        </div>,
        document.body,
      )}
    </ToastContext.Provider>
  );
}

export function useToast(): ToastApi {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used inside ToastProvider');
  return ctx;
}
