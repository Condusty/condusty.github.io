import { useState } from 'react';
import { Input } from '@/components/ui/Input';
import type { Player } from '@/games/jeopardy/types';
import { tintFor } from '@/lib/colors';
import { cn } from '@/lib/cn';

interface ScoreBarProps {
  players: Player[];
  onSetScore: (playerId: string, score: number) => void;
}

export function ScoreBar({ players, onSetScore }: ScoreBarProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState('');

  const startEdit = (p: Player) => {
    setEditingId(p.id);
    setDraft(String(p.score));
  };

  const commit = () => {
    if (!editingId) return;
    const n = Number(draft);
    if (Number.isFinite(n)) {
      onSetScore(editingId, Math.trunc(n));
    }
    setEditingId(null);
    setDraft('');
  };

  return (
    <div
      className="grid gap-2"
      style={{ gridTemplateColumns: `repeat(${Math.min(players.length, 6)}, minmax(0, 1fr))` }}
    >
      {players.map((p) => {
        const isEditing = editingId === p.id;
        return (
          <div
            key={p.id}
            className={cn(
              'flex items-center gap-3 rounded-md border bg-surface px-3 py-2',
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
              <span className="text-xs text-fg-muted truncate">
                {p.name || 'Unnamed'}
              </span>
              {isEditing ? (
                <Input
                  value={draft}
                  type="number"
                  autoFocus
                  onChange={(e) => setDraft(e.target.value)}
                  onBlur={commit}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') commit();
                    if (e.key === 'Escape') {
                      setEditingId(null);
                      setDraft('');
                    }
                  }}
                  className="h-7 text-base font-mono px-1"
                />
              ) : (
                <button
                  type="button"
                  onClick={() => startEdit(p)}
                  className="text-left text-base font-mono font-semibold text-fg hover:text-[color:var(--accent)] transition-colors"
                  aria-label={`Edit ${p.name} score`}
                >
                  {p.score >= 0 ? p.score : `−${Math.abs(p.score)}`}
                </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
