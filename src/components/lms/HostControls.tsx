import type { LmsPlayer } from '@/games/lms/types';
import { tintFor } from '@/lib/colors';
import { cn } from '@/lib/cn';

interface HostControlsProps {
  players: LmsPlayer[];
  eliminationOrder: string[];
  onEliminate: (playerId: string) => void;
  onRestore: (playerId: string) => void;
}

export function HostControls({
  players,
  eliminationOrder,
  onEliminate,
  onRestore,
}: HostControlsProps) {
  const eliminated = new Set(eliminationOrder);

  return (
    <ul className="flex flex-col gap-2">
      {players.map((p) => {
        const isOut = eliminated.has(p.id);
        const stepIndex = eliminationOrder.indexOf(p.id);
        return (
          <li
            key={p.id}
            className={cn(
              'flex items-center gap-3 rounded-md border bg-surface px-3 py-2 transition-opacity',
              isOut && 'opacity-60',
            )}
            style={{
              borderColor: 'var(--border)',
              backgroundImage: `linear-gradient(180deg, ${tintFor(p.color)} 0%, transparent 100%)`,
            }}
          >
            <span
              className="h-2.5 w-2.5 rounded-full shrink-0"
              style={{ backgroundColor: p.color, boxShadow: `0 0 0 3px ${tintFor(p.color)}` }}
            />
            <div className="flex flex-col flex-1 min-w-0">
              <span
                className={cn(
                  'text-sm font-medium truncate',
                  isOut ? 'text-fg-muted line-through' : 'text-fg',
                )}
              >
                {p.name || 'Unnamed'}
              </span>
              <span className="text-xs font-mono text-fg-muted">
                {isOut
                  ? `out · #${stepIndex + 1} eliminated`
                  : `score ${p.score}`}
              </span>
            </div>
            {isOut ? (
              <button
                type="button"
                onClick={() => onRestore(p.id)}
                className="h-8 px-3 rounded-md border border-border text-xs font-mono text-fg-muted hover:text-fg hover:bg-surface-2 hover:border-border-strong transition-colors ring-focus"
              >
                Undo
              </button>
            ) : (
              <button
                type="button"
                onClick={() => onEliminate(p.id)}
                className="h-8 px-3 rounded-md border border-[color-mix(in_srgb,var(--danger)_30%,transparent)] text-xs font-mono text-danger hover:bg-[color-mix(in_srgb,var(--danger)_12%,transparent)] hover:border-[color-mix(in_srgb,var(--danger)_45%,var(--border))] transition-colors ring-focus"
              >
                Eliminate
              </button>
            )}
          </li>
        );
      })}
    </ul>
  );
}
