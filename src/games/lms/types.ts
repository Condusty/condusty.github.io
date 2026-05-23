export type LmsAnswer = {
  id: string;
  text: string;
};

export type LmsRound = {
  index: number;
  category: string;
  answers: LmsAnswer[];
};

export type LmsQuiz = {
  id: string;
  name: string;
  createdAt: number;
  rounds: LmsRound[];
};

export type LmsPlayer = {
  id: string;
  name: string;
  color: string;
  score: number;
};

export type LmsPhase = 'idle' | 'playing' | 'round-results' | 'final';

export type SurvivorPointsType = 'standard' | 'half' | 'double' | 'fixed';

export interface LmsSettings {
  survivorPointsType: SurvivorPointsType;
  fixedPointsValue: number;
  answerCardTimerEnabled: boolean;
  answerCardTimerDuration: number;
}

export type LmsGameState = {
  quizId: string | null;
  quizName: string | null;
  rounds: LmsRound[];
  players: LmsPlayer[];
  currentRound: number;
  revealedAnswerIds: string[];
  eliminationOrder: string[];
  lastRoundPoints: Record<string, number>;
  phase: LmsPhase;
  startedAt: number | null;
  settings: LmsSettings;
  timerStartedAt: number | null;
};
