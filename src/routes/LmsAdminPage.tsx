import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Settings } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { IconButton } from '@/components/ui/IconButton';
import { useToast } from '@/components/ui/Toast';
import { CsvImporter } from '@/components/lms/CsvImporter';
import { QuizList } from '@/components/lms/QuizList';
import { SettingsModal } from '@/components/lms/SettingsModal';
import {
  PlayerSetup,
  makeDefaultPlayers,
  type DraftPlayer,
} from '@/components/lms/PlayerSetup';
import { loadLmsQuizzes, getLmsQuiz } from '@/lib/lmsStorage';
import { useLmsStore } from '@/games/lms/store';
import { LMS_MIN_PLAYERS } from '@/games/lms/constants';
import type { LmsQuiz } from '@/games/lms/types';

export function LmsAdminPage() {
  const navigate = useNavigate();
  const toast = useToast();
  const startGame = useLmsStore((s) => s.startGame);
  const endGame = useLmsStore((s) => s.endGame);
  const activeQuizId = useLmsStore((s) => s.quizId);
  const activeQuizName = useLmsStore((s) => s.quizName);

  const [quizzes, setQuizzes] = useState<LmsQuiz[]>(() => loadLmsQuizzes());
  const [selectedId, setSelectedId] = useState<string | null>(() => {
    const list = loadLmsQuizzes();
    return list[0]?.id ?? null;
  });
  const [players, setPlayers] = useState<DraftPlayer[]>(() => makeDefaultPlayers());
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const refresh = () => {
    const list = loadLmsQuizzes();
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
    return quizzes.find((q) => q.id === selectedId) ?? getLmsQuiz(selectedId);
  }, [quizzes, selectedId]);

  const namedPlayers = players.map((p, i) => ({
    ...p,
    name: p.name.trim() || `Player ${i + 1}`,
  }));

  const canStart =
    selectedQuiz !== null &&
    namedPlayers.length >= LMS_MIN_PLAYERS &&
    new Set(namedPlayers.map((p) => p.name.toLowerCase())).size === namedPlayers.length;

  const openHostInNewTab = () => {
    window.open('/lms/host', '_blank', 'noopener');
  };

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
    navigate('/lms/host');
  };

  const handleResume = () => {
    navigate('/lms/host');
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
        <div className="flex items-start justify-between gap-4">
          <div className="flex flex-col gap-3">
            <span className="text-xs uppercase tracking-[0.18em] text-fg-muted font-mono">
              Last Man Standing · Admin
            </span>
            <h1 className="text-3xl font-semibold text-fg leading-tight tracking-tight">
              Set up your game.
            </h1>
          </div>
          <IconButton
            onClick={() => setIsSettingsOpen(true)}
            title="Game Settings"
            className="mt-1"
          >
            <Settings className="w-4 h-4" />
          </IconButton>
        </div>
        <p className="text-sm text-fg-muted leading-relaxed">
          Import a CSV with one or more rounds (each: a category and the list of correct answers).
          Pick the quiz, name your players, and start. The host console (with answers) and the
          player screen (numbered cards only) live on two separate routes — open <span className="font-mono">/lms/play</span>{' '}
          on the TV, control the game from <span className="font-mono">/lms/host</span> on your laptop.
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
            <Button variant="secondary" size="sm" onClick={openHostInNewTab}>
              Open host in new tab
            </Button>
            <Button size="sm" onClick={handleResume}>
              Resume host
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
            <span className="text-xs text-fg-muted font-mono">2–8</span>
          </div>

          <PlayerSetup players={players} onChange={setPlayers} />

          <div className="rounded-lg border border-border bg-surface p-4 mt-2 flex flex-col gap-3">
            <div className="flex flex-col">
              <span className="text-xs text-fg-muted">Selected quiz</span>
              <span className="text-sm font-medium text-fg truncate">
                {selectedQuiz?.name ?? 'None — pick one above'}
              </span>
              {selectedQuiz && (
                <span className="text-xs text-fg-muted font-mono mt-1">
                  {selectedQuiz.rounds.length} round{selectedQuiz.rounds.length === 1 ? '' : 's'}
                </span>
              )}
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
