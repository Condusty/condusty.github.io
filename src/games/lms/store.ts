import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { LMS_ACTIVE_GAME_STORAGE_KEY } from './constants';
import type { LmsGameState, LmsPhase, LmsPlayer, LmsQuiz, LmsSettings } from './types';

export interface LmsStore extends LmsGameState {
  hasGame: () => boolean;
  totalRounds: () => number;
  currentRoundData: () => { index: number; category: string } | null;
  isAnswerRevealed: (answerId: string) => boolean;
  isPlayerEliminated: (playerId: string) => boolean;
  remainingPlayers: () => LmsPlayer[];
  allRevealed: () => boolean;

  startGame: (
    quiz: LmsQuiz,
    players: { id: string; name: string; color: string }[],
  ) => void;
  revealAnswer: (answerId: string) => void;
  hideAnswer: (answerId: string) => void;
  eliminatePlayer: (playerId: string) => void;
  unEliminatePlayer: (playerId: string) => void;
  finishRound: () => void;
  nextRound: () => void;
  endGame: () => void;
  updateSettings: (settings: Partial<LmsSettings>) => void;
}

export const defaultLmsSettings: LmsSettings = {
  survivorPointsType: 'standard',
  fixedPointsValue: 5,
  answerCardTimerEnabled: false,
};

const emptyState: LmsGameState = {
  quizId: null,
  quizName: null,
  rounds: [],
  players: [],
  currentRound: 0,
  revealedAnswerIds: [],
  eliminationOrder: [],
  lastRoundPoints: {},
  phase: 'idle' as LmsPhase,
  startedAt: null,
  settings: defaultLmsSettings,
};

/**
 * Pure: distribute points for a single round.
 * - First eliminated -> 1 point, second -> 2, ...
 * - Survivors share the top: each gets N points (N = total players in round).
 */
export function distributeRoundPoints(
  playerIds: string[],
  eliminationOrder: string[],
): Record<string, number> {
  const N = playerIds.length;
  const points: Record<string, number> = {};
  eliminationOrder.forEach((id, i) => {
    if (playerIds.includes(id)) {
      points[id] = i + 1;
    }
  });
  for (const id of playerIds) {
    if (!eliminationOrder.includes(id)) {
      points[id] = N;
    }
  }
  return points;
}

export const useLmsStore = create<LmsStore>()(
  persist(
    (set, get) => ({
      ...emptyState,

      hasGame: () => get().quizId !== null,
      totalRounds: () => get().rounds.length,
      currentRoundData: () => {
        const { rounds, currentRound } = get();
        const round = rounds[currentRound];
        if (!round) return null;
        return { index: round.index, category: round.category };
      },
      isAnswerRevealed: (answerId) => get().revealedAnswerIds.includes(answerId),
      isPlayerEliminated: (playerId) => get().eliminationOrder.includes(playerId),
      remainingPlayers: () => {
        const { players, eliminationOrder } = get();
        const eliminated = new Set(eliminationOrder);
        return players.filter((p) => !eliminated.has(p.id));
      },
      allRevealed: () => {
        const { rounds, currentRound, revealedAnswerIds } = get();
        const round = rounds[currentRound];
        if (!round) return false;
        const ids = new Set(revealedAnswerIds);
        return round.answers.every((a) => ids.has(a.id));
      },

      startGame: (quiz, players) => {
        const fullPlayers: LmsPlayer[] = players.map((p) => ({ ...p, score: 0 }));
        set({
          quizId: quiz.id,
          quizName: quiz.name,
          rounds: quiz.rounds.map((r) => ({
            ...r,
            answers: r.answers.map((a) => ({ ...a })),
          })),
          players: fullPlayers,
          currentRound: 0,
          revealedAnswerIds: [],
          eliminationOrder: [],
          lastRoundPoints: {},
          phase: 'playing',
          startedAt: Date.now(),
        });
      },

      revealAnswer: (answerId) => {
        const { revealedAnswerIds, rounds, currentRound, phase } = get();
        if (phase !== 'playing') return;
        const round = rounds[currentRound];
        if (!round) return;
        if (!round.answers.some((a) => a.id === answerId)) return;
        if (revealedAnswerIds.includes(answerId)) return;
        set({ revealedAnswerIds: [...revealedAnswerIds, answerId] });
      },

      hideAnswer: (answerId) => {
        const { revealedAnswerIds } = get();
        if (!revealedAnswerIds.includes(answerId)) return;
        set({ revealedAnswerIds: revealedAnswerIds.filter((id) => id !== answerId) });
      },

      eliminatePlayer: (playerId) => {
        const { eliminationOrder, players, phase } = get();
        if (phase !== 'playing') return;
        if (!players.some((p) => p.id === playerId)) return;
        if (eliminationOrder.includes(playerId)) return;
        set({ eliminationOrder: [...eliminationOrder, playerId] });
      },

      unEliminatePlayer: (playerId) => {
        const { eliminationOrder } = get();
        if (!eliminationOrder.includes(playerId)) return;
        set({ eliminationOrder: eliminationOrder.filter((id) => id !== playerId) });
      },

      finishRound: () => {
        const { players, eliminationOrder, phase } = get();
        if (phase !== 'playing') return;
        const playerIds = players.map((p) => p.id);
        const pts = distributeRoundPoints(playerIds, eliminationOrder);
        set({
          players: players.map((p) => ({
            ...p,
            score: p.score + (pts[p.id] ?? 0),
          })),
          lastRoundPoints: pts,
          phase: 'round-results',
        });
      },

      nextRound: () => {
        const { rounds, currentRound, phase } = get();
        if (phase !== 'round-results') return;
        const next = currentRound + 1;
        if (next >= rounds.length) {
          set({
            phase: 'final',
            revealedAnswerIds: [],
            eliminationOrder: [],
          });
          return;
        }
        set({
          currentRound: next,
          revealedAnswerIds: [],
          eliminationOrder: [],
          lastRoundPoints: {},
          phase: 'playing',
        });
      },

      endGame: () => {
        const { settings } = get();
        set({ ...emptyState, settings });
      },

      updateSettings: (newSettings) => {
        set((state) => ({
          settings: { ...state.settings, ...newSettings },
        }));
      },
    }),
    {
      name: LMS_ACTIVE_GAME_STORAGE_KEY,
      storage: createJSONStorage(() => localStorage),
      partialize: (state): LmsGameState => ({
        quizId: state.quizId,
        quizName: state.quizName,
        rounds: state.rounds,
        players: state.players,
        currentRound: state.currentRound,
        revealedAnswerIds: state.revealedAnswerIds,
        eliminationOrder: state.eliminationOrder,
        lastRoundPoints: state.lastRoundPoints,
        phase: state.phase,
        startedAt: state.startedAt,
        settings: state.settings,
      }),
      version: 1,
    },
  ),
);

/**
 * Cross-tab sync: when another tab/window writes to the persisted key,
 * rehydrate this tab's store so /lms/host and /lms/play stay in sync.
 */
if (typeof window !== 'undefined') {
  window.addEventListener('storage', (e) => {
    if (e.key === LMS_ACTIVE_GAME_STORAGE_KEY) {
      void useLmsStore.persist.rehydrate();
    }
  });
}
