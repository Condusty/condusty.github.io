import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { useJeopardyStore } from '@/games/jeopardy/store';
import type { Cell, Phase, Player } from '@/games/jeopardy/types';
import { tintFor } from '@/lib/colors';
import { cn } from '@/lib/cn';

interface QuestionViewProps {
  cell: Cell;
  phase: Phase;
  players: Player[];
  onReveal: () => void;
  onClose: () => void;
  onAward: (playerId: string, delta: number) => void;
}

export function QuestionView({
  cell,
  phase,
  players,
  onReveal,
  onClose,
  onAward,
}: QuestionViewProps) {
  const settings = useJeopardyStore((s) => s.settings);
  const [timeLeft, setTimeLeft] = useState(settings.answerTimeLimit);

  useEffect(() => {
    if (settings.answerTimeLimit > 0 && phase === 'question') {
      setTimeLeft(settings.answerTimeLimit);
      const interval = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            onReveal();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [settings.answerTimeLimit, phase, onReveal]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
        return;
      }
      if ((e.key === ' ' || e.key === 'Spacebar') && phase === 'question') {
        e.preventDefault();
        onReveal();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose, onReveal, phase]);

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-bg">
      <div
        aria-hidden
        className="absolute inset-0 grid-bg pointer-events-none"
        style={{
          backgroundImage:
            'radial-gradient(circle at 50% 0%, color-mix(in srgb, var(--accent) 10%, transparent), transparent 55%)',
        }}
      />

      <div className="relative flex items-center justify-between px-6 py-4 border-b border-border">
        <div className="flex items-center gap-3">
          <span className="text-xs font-mono uppercase tracking-[0.18em] text-fg-muted">
            {cell.category}
          </span>
          <span className="text-fg-muted">·</span>
          <span className="font-mono text-sm text-fg">{cell.value}</span>
          {settings.answerTimeLimit > 0 && phase === 'question' && (
            <>
              <span className="text-fg-muted">·</span>
              <span className={cn(
                "font-mono text-sm font-bold",
                timeLeft <= 5 ? "text-danger animate-pulse" : "text-fg"
              )}>
                {timeLeft}s
              </span>
            </>
          )}
        </div>
        <button
          type="button"
          onClick={onClose}
          className="text-xs text-fg-muted hover:text-fg transition-colors font-mono ring-focus rounded-md px-2 py-1"
          aria-label="Back to board (Esc)"
        >
          Back to board (Esc)
        </button>
      </div>

      <div className="relative flex-1 flex items-center justify-center px-6 py-10">
        <div className="max-w-4xl w-full flex flex-col items-center text-center gap-10">
          <p className="text-3xl md:text-5xl xl:text-6xl font-semibold leading-[1.15] tracking-tight text-fg">
            {cell.question}
          </p>
          {phase === 'answer' ? (
            <div className="flex flex-col items-center gap-3 animate-fade-up">
              <span className="text-xs font-mono uppercase tracking-[0.18em] text-fg-muted">
                Answer
              </span>
              <p className="text-2xl md:text-3xl font-medium text-[color:var(--accent)]">
                {cell.answer}
              </p>
            </div>
          ) : (
            <Button size="lg" onClick={onReveal}>
              Reveal answer (Space)
            </Button>
          )}
        </div>
      </div>

      <div className="relative border-t border-border bg-[color-mix(in_srgb,var(--bg)_90%,transparent)] backdrop-blur">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-mono uppercase tracking-[0.18em] text-fg-muted">
              Award points
            </span>
            <span className="text-xs text-fg-muted">
              Click +{cell.value} for the player who got it · −{cell.value} on a wrong answer · or Back if no one got it
            </span>
          </div>
          <div
            className="grid gap-2"
            style={{ gridTemplateColumns: `repeat(${Math.min(players.length, 6)}, minmax(0, 1fr))` }}
          >
            {players.map((p) => (
              <div
                key={p.id}
                className={cn(
                  'flex items-center gap-2 rounded-md border bg-surface px-3 py-2',
                )}
                style={{ borderColor: 'var(--border-strong)' }}
              >
                <span
                  className="h-2.5 w-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: p.color, boxShadow: `0 0 0 3px ${tintFor(p.color)}` }}
                />
                <div className="flex flex-col flex-1 min-w-0">
                  <span className="text-sm font-medium text-fg truncate">
                    {p.name || 'Unnamed'}
                  </span>
                  <span className="text-xs font-mono text-fg-muted">
                    {p.score >= 0 ? p.score : `−${Math.abs(p.score)}`}
                  </span>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={() => onAward(p.id, -cell.value)}
                    className="h-8 w-12 rounded-md border border-border text-sm font-mono text-danger hover:bg-[color-mix(in_srgb,var(--danger)_12%,transparent)] hover:border-[color-mix(in_srgb,var(--danger)_35%,var(--border))] transition-colors ring-focus"
                  >
                    −{cell.value}
                  </button>
                  <button
                    type="button"
                    onClick={() => onAward(p.id, cell.value)}
                    className="h-8 w-12 rounded-md border border-border text-sm font-mono text-success hover:bg-[color-mix(in_srgb,var(--success)_12%,transparent)] hover:border-[color-mix(in_srgb,var(--success)_35%,var(--border))] transition-colors ring-focus"
                  >
                    +{cell.value}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
