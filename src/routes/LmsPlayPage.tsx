import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { RoundBoard } from '@/components/lms/RoundBoard';
import { LmsScoreBar } from '@/components/lms/LmsScoreBar';
import { RoundResults } from '@/components/lms/RoundResults';
import { useLmsStore } from '@/games/lms/store';
import type { LmsAnswer } from '@/games/lms/types';

/**
 * Player-facing screen. Designed to be projected on a TV / second monitor.
 *
 * Hard guarantee: unrevealed answer text is NEVER passed into any child component,
 * so it cannot land in the rendered DOM — not even in attributes / aria-labels.
 * Only the numbered card and (after reveal) the answer text exist on this route.
 */
export function LmsPlayPage() {
  const navigate = useNavigate();
  const quizId = useLmsStore((s) => s.quizId);
  const quizName = useLmsStore((s) => s.quizName);
  const rounds = useLmsStore((s) => s.rounds);
  const players = useLmsStore((s) => s.players);
  const currentRound = useLmsStore((s) => s.currentRound);
  const revealedAnswerIds = useLmsStore((s) => s.revealedAnswerIds);
  const eliminationOrder = useLmsStore((s) => s.eliminationOrder);
  const lastRoundPoints = useLmsStore((s) => s.lastRoundPoints);
  const phase = useLmsStore((s) => s.phase);
  const settings = useLmsStore((s) => s.settings);
  const timerStartedAt = useLmsStore((s) => s.timerStartedAt);

  const [timeLeft, setTimeLeft] = useState<number | null>(null);

  useEffect(() => {
    if (!quizId) {
      navigate('/lms', { replace: true });
    }
  }, [quizId, navigate]);

  useEffect(() => {
    if (settings.answerCardTimerEnabled && timerStartedAt && phase === 'playing') {
      const updateTimer = () => {
        const elapsed = (Date.now() - timerStartedAt) / 1000;
        const duration = settings.answerCardTimerDuration || 120;
        const remaining = Math.max(0, duration - elapsed);
        setTimeLeft(remaining > 0 ? Math.ceil(remaining) : 0);
      };
      updateTimer();
      const interval = setInterval(updateTimer, 1000);
      return () => clearInterval(interval);
    } else {
      setTimeLeft(null);
    }
  }, [settings.answerCardTimerEnabled, timerStartedAt, phase, settings.answerCardTimerDuration]);

  const round = rounds[currentRound];

  /**
   * Defense in depth: blank out the text of unrevealed answers before passing
   * them to any child component, so the secret text never reaches the rendered tree.
   */
  const safeAnswers = useMemo<LmsAnswer[]>(() => {
    if (!round) return [];
    const revealed = new Set(revealedAnswerIds);
    return round.answers.map((a) =>
      revealed.has(a.id) ? a : { id: a.id, text: '' },
    );
  }, [round, revealedAnswerIds]);

  if (!quizId) return null;

  if (phase === 'final') {
    const sorted = [...players].sort((a, b) => b.score - a.score);
    const top = sorted[0];
    return (
      <div className="min-h-full flex flex-col items-center justify-center p-12 gap-10 text-center">
        <span className="text-xs font-mono uppercase tracking-[0.18em] text-fg-muted">
          {quizName ?? 'Game'} · final results
        </span>
        <h1 className="text-5xl md:text-7xl font-semibold text-fg leading-tight tracking-tight">
          {top ? `${top.name || 'Unnamed'} wins` : 'Game over'}
        </h1>
        <ul className="w-full max-w-xl flex flex-col gap-2">
          {sorted.map((p, i) => (
            <li
              key={p.id}
              className="flex items-center gap-3 rounded-md border border-border bg-surface px-4 py-3"
            >
              <span className="font-mono text-sm w-8 text-fg-muted">{i + 1}.</span>
              <span
                className="h-2.5 w-2.5 rounded-full shrink-0"
                style={{ backgroundColor: p.color }}
              />
              <span className="flex-1 text-left text-base font-medium text-fg truncate">
                {p.name || 'Unnamed'}
              </span>
              <span className="font-mono text-3xl font-semibold text-fg">
                {p.score}
              </span>
            </li>
          ))}
        </ul>
      </div>
    );
  }

  if (phase === 'round-results' && round) {
    return (
      <RoundResults
        players={players}
        eliminationOrder={eliminationOrder}
        pointsAwarded={lastRoundPoints}
        isLastRound={currentRound >= rounds.length - 1}
        mode="play"
        roundIndex={currentRound + 1}
        totalRounds={rounds.length}
        category={round.category}
      />
    );
  }

  if (!round) {
    return (
      <div className="min-h-full flex items-center justify-center p-12">
        <p className="text-sm text-fg-muted">Waiting for the host to start the game…</p>
      </div>
    );
  }

  return (
    <div className="min-h-full flex flex-col">
      <header className="border-b border-border bg-[color-mix(in_srgb,var(--bg)_85%,transparent)] backdrop-blur">
        <div className="mx-auto max-w-7xl px-6 py-5 flex items-center justify-between gap-4">
          <div className="flex flex-col">
            <span className="text-xs font-mono uppercase tracking-[0.18em] text-fg-muted">
              Round {currentRound + 1} / {rounds.length}
            </span>
            <h1 className="text-2xl md:text-4xl font-semibold text-fg leading-tight tracking-tight">
              {round.category}
            </h1>
          </div>
          <div className="flex items-center gap-4">
            {timeLeft !== null && (
              <div className="px-3 py-1 rounded bg-[color-mix(in_srgb,var(--accent)_20%,transparent)] border border-[color:var(--accent)] text-[color:var(--accent)] font-mono text-xl font-bold shadow-sm animate-fade-up">
                {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
              </div>
            )}
            <span className="text-xs font-mono text-fg-muted">
              {revealedAnswerIds.length}/{round.answers.length} revealed
            </span>
          </div>
        </div>
      </header>

      <div className="flex-1 mx-auto w-full max-w-7xl px-6 py-8">
        <RoundBoard
          answers={safeAnswers}
          revealedAnswerIds={revealedAnswerIds}
          mode="play"
        />
      </div>

      <div className="sticky bottom-0 border-t border-border bg-[color-mix(in_srgb,var(--bg)_88%,transparent)] backdrop-blur">
        <div className="mx-auto max-w-7xl px-6 py-4">
          <LmsScoreBar players={players} eliminatedIds={eliminationOrder} />
        </div>
      </div>
    </div>
  );
}
