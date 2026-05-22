import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { BoardGrid } from '@/components/jeopardy/BoardGrid';
import { QuestionView } from '@/components/jeopardy/QuestionView';
import { ScoreBar } from '@/components/jeopardy/ScoreBar';
import {
  Modal,
  ModalBody,
  ModalDescription,
  ModalFooter,
  ModalHeader,
  ModalTitle,
} from '@/components/ui/Modal';
import { useJeopardyStore } from '@/games/jeopardy/store';
import { JEOPARDY_CELL_COUNT } from '@/games/jeopardy/constants';

export function JeopardyBoardPage() {
  const navigate = useNavigate();
  const quizId = useJeopardyStore((s) => s.quizId);
  const quizName = useJeopardyStore((s) => s.quizName);
  const categories = useJeopardyStore((s) => s.categories);
  const cells = useJeopardyStore((s) => s.cells);
  const usedCellIds = useJeopardyStore((s) => s.usedCellIds);
  const players = useJeopardyStore((s) => s.players);
  const activeCellId = useJeopardyStore((s) => s.activeCellId);
  const phase = useJeopardyStore((s) => s.phase);

  const pickCell = useJeopardyStore((s) => s.pickCell);
  const revealAnswer = useJeopardyStore((s) => s.revealAnswer);
  const closeQuestion = useJeopardyStore((s) => s.closeQuestion);
  const award = useJeopardyStore((s) => s.award);
  const setScore = useJeopardyStore((s) => s.setScore);
  const endGame = useJeopardyStore((s) => s.endGame);

  const [confirmEnd, setConfirmEnd] = useState(false);

  useEffect(() => {
    if (!quizId) {
      navigate('/jeopardy', { replace: true });
    }
  }, [quizId, navigate]);

  if (!quizId) return null;

  const activeCell = activeCellId
    ? cells.find((c) => c.id === activeCellId) ?? null
    : null;
  const remaining = JEOPARDY_CELL_COUNT - usedCellIds.length;

  const handleEndGame = () => {
    setConfirmEnd(false);
    endGame();
    navigate('/jeopardy', { replace: true });
  };

  return (
    <div className="min-h-full flex flex-col">
      <header className="sticky top-0 z-30 border-b border-border bg-[color-mix(in_srgb,var(--bg)_85%,transparent)] backdrop-blur supports-[backdrop-filter]:bg-[color-mix(in_srgb,var(--bg)_70%,transparent)]">
        <div className="mx-auto max-w-7xl px-6 h-14 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <Link
              to="/jeopardy"
              className="text-xs font-mono text-fg-muted hover:text-fg transition-colors ring-focus rounded-md px-2 py-1"
            >
              ← Admin
            </Link>
            <span className="text-fg-muted">·</span>
            <span className="text-sm font-medium text-fg truncate">
              {quizName ?? 'Game'}
            </span>
            <span className="text-xs font-mono text-fg-muted">
              {remaining}/{JEOPARDY_CELL_COUNT} left
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="danger" size="sm" onClick={() => setConfirmEnd(true)}>
              End game
            </Button>
          </div>
        </div>
      </header>

      <div className="flex-1 mx-auto w-full max-w-7xl px-6 py-6 flex flex-col gap-6">
        <BoardGrid
          categories={categories}
          cells={cells}
          usedCellIds={usedCellIds}
          onPick={pickCell}
        />
      </div>

      <div className="sticky bottom-0 border-t border-border bg-[color-mix(in_srgb,var(--bg)_88%,transparent)] backdrop-blur">
        <div className="mx-auto max-w-7xl px-6 py-4">
          <ScoreBar players={players} onSetScore={setScore} />
        </div>
      </div>

      {activeCell && (
        <QuestionView
          cell={activeCell}
          phase={phase}
          players={players}
          onReveal={revealAnswer}
          onClose={closeQuestion}
          onAward={award}
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
