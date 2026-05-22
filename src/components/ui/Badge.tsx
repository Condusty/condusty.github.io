import type { HTMLAttributes } from 'react';
import { cn } from '@/lib/cn';

type Tone = 'default' | 'accent' | 'success' | 'muted';

const toneClasses: Record<Tone, string> = {
  default: 'bg-surface-2 text-fg border-border',
  accent:
    'bg-[color-mix(in_srgb,var(--accent)_18%,transparent)] text-[color-mix(in_srgb,var(--accent)_70%,white)] border-[color-mix(in_srgb,var(--accent)_25%,transparent)]',
  success:
    'bg-[color-mix(in_srgb,var(--success)_15%,transparent)] text-[color-mix(in_srgb,var(--success)_70%,white)] border-[color-mix(in_srgb,var(--success)_25%,transparent)]',
  muted: 'bg-transparent text-fg-muted border-border',
};

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: Tone;
}

export function Badge({ className, tone = 'default', ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium',
        toneClasses[tone],
        className,
      )}
      {...props}
    />
  );
}
