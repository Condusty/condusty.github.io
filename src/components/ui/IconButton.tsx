import { forwardRef, type ButtonHTMLAttributes } from 'react';
import { cn } from '@/lib/cn';

export interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  size?: 'sm' | 'md';
  tone?: 'default' | 'danger';
}

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  function IconButton({ className, size = 'md', tone = 'default', type = 'button', ...props }, ref) {
    return (
      <button
        ref={ref}
        type={type}
        className={cn(
          'inline-flex items-center justify-center rounded-md border border-border bg-surface transition-colors ring-focus disabled:opacity-50 disabled:cursor-not-allowed',
          size === 'sm' ? 'h-8 w-8' : 'h-9 w-9',
          tone === 'default'
            ? 'text-fg-muted hover:text-fg hover:bg-surface-2 hover:border-border-strong'
            : 'text-danger hover:bg-[color-mix(in_srgb,var(--danger)_10%,transparent)]',
          className,
        )}
        {...props}
      />
    );
  },
);
