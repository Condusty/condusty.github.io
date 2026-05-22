export const JEOPARDY_VALUES = [100, 200, 300, 400, 500] as const;
export const JEOPARDY_CATEGORY_COUNT = 6;
export const JEOPARDY_VALUES_PER_CATEGORY = JEOPARDY_VALUES.length;
export const JEOPARDY_CELL_COUNT = JEOPARDY_CATEGORY_COUNT * JEOPARDY_VALUES_PER_CATEGORY;

export const MIN_PLAYERS = 2;
export const MAX_PLAYERS = 6;

export const QUIZ_LIBRARY_STORAGE_KEY = 'gk:quizzes:v1';
export const ACTIVE_GAME_STORAGE_KEY = 'gk:jeopardy:game:v1';
