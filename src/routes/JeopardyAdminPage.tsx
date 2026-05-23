import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Settings } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { IconButton } from '@/components/ui/IconButton';
import { useToast } from '@/components/ui/Toast';
import { CsvImporter } from '@/components/jeopardy/CsvImporter';
import { QuizList } from '@/components/jeopardy/QuizList';
import { SettingsModal } from '@/components/jeopardy/SettingsModal';
import { PlayerSetup, makeDefaultPlayers, type DraftPlayer } from '@/components/jeopardy/PlayerSetup';
import { loadQuizzes, getQuiz } from '@/lib/storage';
import { useJeopardyStore } from '@/games/jeopardy/store';
import { MIN_PLAYERS } from '@/games/jeopardy/constants';
import type { Quiz } from '@/games/jeopardy/types';

export function JeopardyAdminPage() {
  const navigate = useNavigate();
  const toast = useToast();
  const startGame = useJeopardyStore((s) => s.startGame);
  const endGame = useJeopardyStore((s) => s.endGame);
  const activeQuizId = useJeopardyStore((s) => s.quizId);
  const activeQuizName = useJeopardyStore((s) => s.quizName);

  const [quizzes, setQuizzes] = useState<Quiz[]>(() => loadQuizzes());
  const [selectedId, setSelectedId] = useState<string | null>(() => {
    const list = loadQuizzes();
    return list[0]?.id ?? null;
  });
  const [players, setPlayers] = useState<DraftPlayer[]>(() => makeDefaultPlayers());
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const refresh = () => {
    const list = loadQuizzes();
    setQuizzes(list);
    if (selectedId && !list.some((q) => q.id === selectedId)) {
      setSelectedId(list[0]?.id ?? null);
    }
  };

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const selectedQuiz = useMemo(() => {
    if (!selectedId) return null;
    return quizzes.find((q) => q.id === selectedId) ?? getQuiz(selectedId);
  }, [quizzes, selectedId]);

  const namedPlayers = players.map((p, i) => ({
    ...p,
    name: p.name.trim() || `Player ${i + 1}`,
  }));

  const canStart =
    selectedQuiz !== null &&
    namedPlayers.length >= MIN_PLAYERS &&
    new Set(namedPlayers.map((p) => p.name.toLowerCase())).size === namedPlayers.length;

  const handleStart = () => {
    if (!selectedQuiz) return;
    if (!canStart) {
      toast.show({
        title: 'Cannot start',
        description: 'Need at least 2 players with unique names.',
        tone: 'error',
      });
      return;
    }
    startGame(
      selectedQuiz,
      namedPlayers.map((p) => ({ id: p.id, name: p.name, color: p.color })),
    );
    navigate('/jeopardy/play');
  };

  const handleResume = () => {
    navigate('/jeopardy/play');
  };

  const handleAbandon = () => {
    if (!window.confirm('Discard the in-progress game?')) return;
    endGame();
    toast.show({ title: 'Game discarded' });
  };

  const hasInProgress = activeQuizId !== null;

  return (
    <div className="flex flex-col gap-10">
      <section className="flex flex-col gap-3 max-w-2xl">
        <Link
          to="/"
          className="text-xs font-mono text-fg-muted hover:text-fg transition-colors w-fit ring-focus rounded-md"
        >
          ← Library
        </Link>
        <span className="text-xs uppercase tracking-[0.18em] text-fg-muted font-mono">
          Jeopardy · Admin
        </span>
        <div className="flex items-center justify-between gap-4">
          <h1 className="text-3xl font-semibold text-fg leading-tight tracking-tight">
            Set up your game.
          </h1>
          <IconButton
            onClick={() => setIsSettingsOpen(true)}
            aria-label="Game Settings"
          >
            <Settings className="w-5 h-5" />
          </IconButton>
        </div>
        <p className="text-sm text-fg-muted leading-relaxed">
          Import a CSV, pick which quiz to use, name your players, and start. Mid-game state
          auto-saves so a refresh won't lose your place.
        </p>
      </section>

      {hasInProgress && (
        <section className="rounded-lg border border-[color-mix(in_srgb,var(--accent)_30%,var(--border))] bg-[color-mix(in_srgb,var(--accent)_8%,transparent)] p-4 flex items-center justify-between gap-4">
          <div className="flex flex-col">
            <p className="text-sm font-medium text-fg">Game in progress</p>
            <p className="text-xs text-fg-muted">
              You can resume "{activeQuizName}" or discard and start fresh.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={handleAbandon}>
              Discard
            </Button>
            <Button size="sm" onClick={handleResume}>
              Resume
            </Button>
          </div>
        </section>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-[1.4fr_1fr] gap-8">
        <section className="flex flex-col gap-4">
          <div className="flex items-baseline justify-between border-b border-border pb-3">
            <h2 className="text-sm font-semibold tracking-tight text-fg">Quizzes</h2>
            <span className="text-xs text-fg-muted font-mono">
              {quizzes.length} saved
            </span>
          </div>

          <CsvImporter onImported={(q) => { refresh(); setSelectedId(q.id); }} />

          <QuizList
            quizzes={quizzes}
            selectedId={selectedId}
            onSelect={setSelectedId}
            onChanged={refresh}
          />
        </section>

        <section className="flex flex-col gap-4">
          <div className="flex items-baseline justify-between border-b border-border pb-3">
            <h2 className="text-sm font-semibold tracking-tight text-fg">Players</h2>
            <span className="text-xs text-fg-muted font-mono">2–6</span>
          </div>

          <PlayerSetup players={players} onChange={setPlayers} />

          <div className="rounded-lg border border-border bg-surface p-4 mt-2 flex flex-col gap-3">
            <div className="flex flex-col">
              <span className="text-xs text-fg-muted">Selected quiz</span>
              <span className="text-sm font-medium text-fg truncate">
                {selectedQuiz?.name ?? 'None — pick one above'}
              </span>
            </div>
            <Button
              size="lg"
              onClick={handleStart}
              disabled={!canStart}
            >
              Start game →
            </Button>
            {!canStart && (
              <p className="text-xs text-fg-muted">
                {!selectedQuiz
                  ? 'Pick a quiz to enable.'
                  : 'Need at least 2 players with unique names.'}
              </p>
            )}
          </div>
        </section>
      </div>

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />
    </div>
  );
}
