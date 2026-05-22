export type Player = {
  id: string;
  name: string;
  color: string;
  score: number;
};

export type Cell = {
  id: string;
  category: string;
  value: number;
  question: string;
  answer: string;
};

export type Quiz = {
  id: string;
  name: string;
  createdAt: number;
  categories: string[];
  cells: Cell[];
};

export type Phase = 'idle' | 'question' | 'answer';

export type GameState = {
  quizId: string | null;
  quizName: string | null;
  categories: string[];
  cells: Cell[];
  players: Player[];
  usedCellIds: string[];
  activeCellId: string | null;
  phase: Phase;
  startedAt: number | null;
};
