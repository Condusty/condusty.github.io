import type { LmsPlayer } from '@/games/lms/types';
import { tintFor } from '@/lib/colors';
import { cn } from '@/lib/cn';

interface LmsScoreBarProps {
  players: LmsPlayer[];
  /** Players that are currently eliminated this round (visual only). */
  eliminatedIds?: string[];
}

export function LmsScoreBar({ players, eliminatedIds = [] }: LmsScoreBarProps) {
  const eliminated = new Set(eliminatedIds);
  const cols = Math.min(Math.max(players.length, 1), 8);

  return (
    <div
      className="grid gap-2"
      style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
    >
      {players.map((p) => {
        const isOut = eliminated.has(p.id);
        return (
          <div
            key={p.id}
            className={cn(
              'flex items-center gap-3 rounded-md border bg-surface px-3 py-2 transition-opacity',
              isOut && 'opacity-50',
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
                  'text-xs truncate',
                  isOut ? 'text-fg-muted line-through' : 'text-fg-muted',
                )}
              >
                {p.name || 'Unnamed'}
              </span>
              <span className="text-base font-mono font-semibold text-fg">
                {p.score}
              </span>
            </div>
            {isOut && (
              <span className="text-[10px] font-mono uppercase tracking-[0.18em] text-danger">
                out
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}
