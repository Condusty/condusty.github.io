import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { ACTIVE_GAME_STORAGE_KEY } from './constants';
import type { Cell, GameState, Phase, Player, Quiz, JeopardySettings } from './types';

export interface JeopardyStore extends GameState {
  hasGame: () => boolean;
  isCellUsed: (cellId: string) => boolean;
  activeCell: () => Cell | null;
  startGame: (quiz: Quiz, players: { id: string; name: string; color: string }[]) => void;
  pickCell: (cellId: string) => void;
  revealAnswer: () => void;
  closeQuestion: () => void;
  award: (playerId: string, delta: number) => void;
  setScore: (playerId: string, score: number) => void;
  updateSettings: (settings: Partial<JeopardySettings>) => void;
  endGame: () => void;
}

const defaultSettings: JeopardySettings = {
  wrongAnswerPenalty: 1.0,
  answerTimeLimit: 0,
};

const emptyState: GameState = {
  quizId: null,
  quizName: null,
  categories: [],
  cells: [],
  players: [],
  usedCellIds: [],
  activeCellId: null,
  phase: 'idle' as Phase,
  startedAt: null,
  settings: defaultSettings,
};

export const useJeopardyStore = create<JeopardyStore>()(
  persist(
    (set, get) => ({
      ...emptyState,

      hasGame: () => get().quizId !== null,
      isCellUsed: (cellId: string) => get().usedCellIds.includes(cellId),
      activeCell: () => {
        const { activeCellId, cells } = get();
        if (!activeCellId) return null;
        return cells.find((c) => c.id === activeCellId) ?? null;
      },

      startGame: (quiz, players) => {
        const fullPlayers: Player[] = players.map((p) => ({ ...p, score: 0 }));
        set({
          quizId: quiz.id,
          quizName: quiz.name,
          categories: [...quiz.categories],
          cells: quiz.cells.map((c) => ({ ...c })),
          players: fullPlayers,
          usedCellIds: [],
          activeCellId: null,
          phase: 'idle',
          startedAt: Date.now(),
        });
      },

      pickCell: (cellId) => {
        const { isCellUsed } = get();
        if (isCellUsed(cellId)) return;
        set({ activeCellId: cellId, phase: 'question' });
      },

      revealAnswer: () => {
        if (!get().activeCellId) return;
        set({ phase: 'answer' });
      },

      closeQuestion: () => {
        const { activeCellId, usedCellIds } = get();
        if (!activeCellId) return;
        set({
          activeCellId: null,
          phase: 'idle',
          usedCellIds: usedCellIds.includes(activeCellId)
            ? usedCellIds
            : [...usedCellIds, activeCellId],
        });
      },

      award: (playerId, delta) => {
        const { players, activeCellId, usedCellIds, settings } = get();

        // Calculate adjusted delta if negative (wrong answer)
        const adjustedDelta = delta < 0 ? delta * settings.wrongAnswerPenalty : delta;

        const nextPlayers = players.map((p) =>
          p.id === playerId ? { ...p, score: p.score + adjustedDelta } : p,
        );
        set({
          players: nextPlayers,
          activeCellId: null,
          phase: 'idle',
          usedCellIds:
            activeCellId && !usedCellIds.includes(activeCellId)
              ? [...usedCellIds, activeCellId]
              : usedCellIds,
        });
      },

      setScore: (playerId, score) => {
        const { players } = get();
        set({
          players: players.map((p) => (p.id === playerId ? { ...p, score } : p)),
        });
      },

      updateSettings: (newSettings) => {
        set((state) => ({
          settings: { ...state.settings, ...newSettings },
        }));
      },

      endGame: () => {
        const currentSettings = get().settings;
        set({ ...emptyState, settings: currentSettings });
      },
    }),
    {
      name: ACTIVE_GAME_STORAGE_KEY,
      storage: createJSONStorage(() => localStorage),
      partialize: (state): GameState => ({
        quizId: state.quizId,
        quizName: state.quizName,
        categories: state.categories,
        cells: state.cells,
        players: state.players,
        usedCellIds: state.usedCellIds,
        activeCellId: state.activeCellId,
        phase: state.phase,
        startedAt: state.startedAt,
        settings: state.settings,
      }),
      version: 1,
    },
  ),
);
