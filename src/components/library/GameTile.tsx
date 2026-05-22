import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/Badge';
import { cn } from '@/lib/cn';

interface GameTileProps {
  to: string;
  name: string;
  description: string;
  status: 'available' | 'coming-soon';
  accent?: string;
  glyph?: string;
}

export function GameTile({ to, name, description, status, accent, glyph }: GameTileProps) {
  const isAvailable = status === 'available';
  return (
    <Link
      to={to}
      className={cn(
        'group relative flex flex-col rounded-lg border border-border bg-surface overflow-hidden ring-focus',
        'transition-colors hover:border-border-strong hover:bg-surface-2',
        !isAvailable && 'opacity-80',
      )}
    >
      <div className="relative h-40 border-b border-border overflow-hidden">
        <div
          aria-hidden
          className="absolute inset-0 opacity-90"
          style={{
            backgroundImage: `radial-gradient(circle at 30% 20%, ${accent ?? 'rgba(99,102,241,0.18)'}, transparent 60%), linear-gradient(180deg, var(--surface-2) 0%, var(--surface) 100%)`,
          }}
        />
        <div
          aria-hidden
          className="absolute inset-0"
          style={{
            backgroundImage:
              'linear-gradient(var(--border) 1px, transparent 1px), linear-gradient(90deg, var(--border) 1px, transparent 1px)',
            backgroundSize: '32px 32px',
            opacity: 0.35,
            maskImage: 'radial-gradient(circle at center, black 30%, transparent 75%)',
            WebkitMaskImage: 'radial-gradient(circle at center, black 30%, transparent 75%)',
          }}
        />
        <div className="relative h-full flex items-center justify-center">
          <span
            className="font-mono text-5xl font-bold tracking-tight text-fg/90"
            aria-hidden
          >
            {glyph}
          </span>
        </div>
      </div>
      <div className="flex flex-col gap-1.5 px-5 py-4">
        <div className="flex items-center justify-between gap-2">
          <h3 className="text-base font-semibold text-fg">{name}</h3>
          {isAvailable ? (
            <Badge tone="success">Available</Badge>
          ) : (
            <Badge tone="muted">Coming soon</Badge>
          )}
        </div>
        <p className="text-sm text-fg-muted leading-relaxed">{description}</p>
      </div>
    </Link>
  );
}
