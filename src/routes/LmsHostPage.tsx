import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import {
  Modal,
  ModalBody,
  ModalDescription,
  ModalFooter,
  ModalHeader,
  ModalTitle,
} from '@/components/ui/Modal';
import { useToast } from '@/components/ui/Toast';
import { RoundBoard } from '@/components/lms/RoundBoard';
import { HostControls } from '@/components/lms/HostControls';
import { LmsScoreBar } from '@/components/lms/LmsScoreBar';
import { RoundResults } from '@/components/lms/RoundResults';
import { useLmsStore } from '@/games/lms/store';

export function LmsHostPage() {
  const navigate = useNavigate();
  const toast = useToast();

  const quizId = useLmsStore((s) => s.quizId);
  const quizName = useLmsStore((s) => s.quizName);
  const rounds = useLmsStore((s) => s.rounds);
  const players = useLmsStore((s) => s.players);
  const currentRound = useLmsStore((s) => s.currentRound);
  const revealedAnswerIds = useLmsStore((s) => s.revealedAnswerIds);
  const eliminationOrder = useLmsStore((s) => s.eliminationOrder);
  const lastRoundPoints = useLmsStore((s) => s.lastRoundPoints);
  const phase = useLmsStore((s) => s.phase);

  const revealAnswer = useLmsStore((s) => s.revealAnswer);
  const hideAnswer = useLmsStore((s) => s.hideAnswer);
  const eliminatePlayer = useLmsStore((s) => s.eliminatePlayer);
  const unEliminatePlayer = useLmsStore((s) => s.unEliminatePlayer);
  const finishRound = useLmsStore((s) => s.finishRound);
  const nextRound = useLmsStore((s) => s.nextRound);
  const endGame = useLmsStore((s) => s.endGame);

  const [confirmEnd, setConfirmEnd] = useState(false);

  useEffect(() => {
    if (!quizId) {
      navigate('/lms', { replace: true });
    }
  }, [quizId, navigate]);

  if (!quizId) return null;

  const round = rounds[currentRound];
  const isLastRound = currentRound >= rounds.length - 1;
  const totalRounds = rounds.length;

  const openPlayInNewTab = () => {
    window.open('/lms/play', '_blank', 'noopener');
  };

  const handleToggleReveal = (answerId: string) => {
    if (phase !== 'playing') return;
    if (revealedAnswerIds.includes(answerId)) {
      hideAnswer(answerId);
    } else {
      revealAnswer(answerId);
    }
  };

  const handleFinishRound = () => {
    finishRound();
  };

  const handleNext = () => {
    nextRound();
  };

  const handleEndGame = () => {
    setConfirmEnd(false);
    endGame();
    toast.show({ title: 'Game ended' });
    navigate('/lms', { replace: true });
  };

  const remainingCount = round
    ? round.answers.length - revealedAnswerIds.length
    : 0;
  const aliveCount = players.length - eliminationOrder.length;
  const allRevealed = round
    ? round.answers.every((a) => revealedAnswerIds.includes(a.id))
    : false;
  const onlyOneLeft = aliveCount <= 1;

  return (
    <div className="min-h-full flex flex-col">
      <header className="sticky top-0 z-30 border-b border-border bg-[color-mix(in_srgb,var(--bg)_85%,transparent)] backdrop-blur supports-[backdrop-filter]:bg-[color-mix(in_srgb,var(--bg)_70%,transparent)]">
        <div className="mx-auto max-w-7xl px-6 h-14 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <Link
              to="/lms"
              className="text-xs font-mono text-fg-muted hover:text-fg transition-colors ring-focus rounded-md px-2 py-1"
            >
              ← Admin
            </Link>
            <span className="text-fg-muted">·</span>
            <span className="text-sm font-medium text-fg truncate">
              {quizName ?? 'Game'}
            </span>
            <span className="text-xs font-mono text-fg-muted">
              R{currentRound + 1}/{totalRounds}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={openPlayInNewTab}>
              Open player screen
            </Button>
            <Button variant="danger" size="sm" onClick={() => setConfirmEnd(true)}>
              End game
            </Button>
          </div>
        </div>
      </header>

      {phase === 'playing' && round && (
        <div className="flex-1 mx-auto w-full max-w-7xl px-6 py-6 grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
          <section className="flex flex-col gap-4">
            <div className="flex items-baseline justify-between">
              <div className="flex flex-col">
                <span className="text-xs font-mono uppercase tracking-[0.18em] text-fg-muted">
                  Round {currentRound + 1} · category
                </span>
                <h1 className="text-2xl md:text-3xl font-semibold text-fg leading-tight tracking-tight">
                  {round.category}
                </h1>
              </div>
              <span className="text-xs font-mono text-fg-muted">
                {remainingCount}/{round.answers.length} hidden
              </span>
            </div>

            <RoundBoard
              answers={round.answers}
              revealedAnswerIds={revealedAnswerIds}
              mode="host"
              onCardClick={handleToggleReveal}
            />

            <p className="text-xs text-fg-muted">
              Click a card to reveal/hide it on the player screen. Cards labelled "shown" are
              currently visible to players.
            </p>
          </section>

          <aside className="flex flex-col gap-4">
            <div className="rounded-lg border border-border bg-surface p-4 flex flex-col gap-3">
              <div className="flex items-baseline justify-between">
                <span className="text-xs font-mono uppercase tracking-[0.18em] text-fg-muted">
                  Players
                </span>
                <span className="text-xs font-mono text-fg-muted">
                  {aliveCount} alive · {eliminationOrder.length} out
                </span>
              </div>
              <HostControls
                players={players}
                eliminationOrder={eliminationOrder}
                onEliminate={eliminatePlayer}
                onRestore={unEliminatePlayer}
              />
            </div>

            <div className="rounded-lg border border-border bg-surface p-4 flex flex-col gap-3">
              <span className="text-xs font-mono uppercase tracking-[0.18em] text-fg-muted">
                End of round
              </span>
              <p className="text-xs text-fg-muted leading-relaxed">
                {allRevealed
                  ? 'All cards revealed. '
                  : onlyOneLeft
                    ? 'Only one player left. '
                    : 'Click "Finish round" once you’re ready to score. '}
                Points: first eliminated = 1, then 2, 3, … survivors share the top.
              </p>
              <Button onClick={handleFinishRound}>
                Finish round →
              </Button>
            </div>
          </aside>
        </div>
      )}

      {phase === 'final' && (
        <div className="flex-1 mx-auto w-full max-w-3xl px-6 py-12 flex flex-col items-center text-center gap-8">
          <span className="text-xs font-mono uppercase tracking-[0.18em] text-fg-muted">
            Quiz complete
          </span>
          <h1 className="text-4xl font-semibold text-fg leading-tight tracking-tight">
            Final scoreboard
          </h1>
          <ul className="w-full flex flex-col gap-2">
            {[...players]
              .sort((a, b) => b.score - a.score)
              .map((p, i) => (
                <li
                  key={p.id}
                  className="flex items-center gap-3 rounded-md border border-border bg-surface px-4 py-3"
                >
                  <span className="font-mono text-sm w-8 text-fg-muted">{i + 1}.</span>
                  <span
                    className="h-2.5 w-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: p.color }}
                  />
                  <span className="flex-1 text-left text-sm font-medium text-fg truncate">
                    {p.name || 'Unnamed'}
                  </span>
                  <span className="font-mono text-2xl font-semibold text-fg">
                    {p.score}
                  </span>
                </li>
              ))}
          </ul>
          <Button size="lg" onClick={() => setConfirmEnd(true)}>
            Back to admin
          </Button>
        </div>
      )}

      {phase === 'playing' && (
        <div className="sticky bottom-0 border-t border-border bg-[color-mix(in_srgb,var(--bg)_88%,transparent)] backdrop-blur">
          <div className="mx-auto max-w-7xl px-6 py-4">
            <LmsScoreBar players={players} eliminatedIds={eliminationOrder} />
          </div>
        </div>
      )}

      {phase === 'round-results' && round && (
        <RoundResults
          players={players}
          eliminationOrder={eliminationOrder}
          pointsAwarded={lastRoundPoints}
          isLastRound={isLastRound}
          mode="host"
          roundIndex={currentRound + 1}
          totalRounds={totalRounds}
          category={round.category}
          onNext={handleNext}
          onEndGame={() => setConfirmEnd(true)}
        />
      )}

      <Modal open={confirmEnd} onClose={() => setConfirmEnd(false)}>
        <ModalHeader>
          <ModalTitle>End the game?</ModalTitle>
          <ModalDescription>
            Scores and the board will be cleared. You'll be returned to the admin view.
          </ModalDescription>
        </ModalHeader>
        <ModalBody>
          <ul className="rounded-md border border-border bg-surface-2 px-3 py-2 text-xs font-mono text-fg-muted">
            {players.map((p) => (
              <li key={p.id} className="flex items-center justify-between py-0.5">
                <span className="text-fg">{p.name || 'Unnamed'}</span>
                <span>{p.score}</span>
              </li>
            ))}
          </ul>
        </ModalBody>
        <ModalFooter>
          <Button variant="ghost" onClick={() => setConfirmEnd(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleEndGame}>
            End game
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
}
