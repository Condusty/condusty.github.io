import { cn } from '@/lib/cn';

interface BoardCellProps {
  value: number;
  used: boolean;
  onClick: () => void;
}

export function BoardCell({ value, used, onClick }: BoardCellProps) {
  return (
    <button
      type="button"
      onClick={used ? undefined : onClick}
      disabled={used}
      className={cn(
        'group relative flex items-center justify-center rounded-md border transition-all duration-150 ring-focus',
        'aspect-[16/10]',
        used
          ? 'border-border/60 bg-transparent cursor-default'
          : 'border-border bg-surface hover:border-border-strong hover:bg-surface-2 active:scale-[0.99]',
      )}
      aria-label={used ? 'Used' : `Pick ${value}`}
    >
      {!used && (
        <>
          <span
            className="font-mono text-3xl md:text-4xl xl:text-5xl font-bold tracking-tight text-fg group-hover:text-fg"
            style={{ textShadow: '0 0 16px color-mix(in srgb, var(--accent) 18%, transparent)' }}
          >
            {value}
          </span>
          <span
            aria-hidden
            className="pointer-events-none absolute inset-0 rounded-md opacity-0 group-hover:opacity-100 transition-opacity"
            style={{
              background:
                'radial-gradient(circle at 50% 100%, color-mix(in srgb, var(--accent) 14%, transparent), transparent 60%)',
            }}
          />
        </>
      )}
      {used && (
        <span className="text-xs font-mono text-fg-muted/40">—</span>
      )}
    </button>
  );
}
