import { QUIZ_LIBRARY_STORAGE_KEY } from '@/games/jeopardy/constants';
import type { Quiz } from '@/games/jeopardy/types';

interface QuizLibrary {
  version: 1;
  quizzes: Quiz[];
}

function emptyLibrary(): QuizLibrary {
  return { version: 1, quizzes: [] };
}

function readLibrary(): QuizLibrary {
  if (typeof localStorage === 'undefined') return emptyLibrary();
  try {
    const raw = localStorage.getItem(QUIZ_LIBRARY_STORAGE_KEY);
    if (!raw) return emptyLibrary();
    const parsed = JSON.parse(raw) as QuizLibrary;
    if (!parsed || parsed.version !== 1 || !Array.isArray(parsed.quizzes)) {
      return emptyLibrary();
    }
    return parsed;
  } catch {
    return emptyLibrary();
  }
}

function writeLibrary(lib: QuizLibrary): void {
  if (typeof localStorage === 'undefined') return;
  localStorage.setItem(QUIZ_LIBRARY_STORAGE_KEY, JSON.stringify(lib));
}

function makeId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

export function loadQuizzes(): Quiz[] {
  const lib = readLibrary();
  return [...lib.quizzes].sort((a, b) => b.createdAt - a.createdAt);
}

export function getQuiz(id: string): Quiz | null {
  return readLibrary().quizzes.find((q) => q.id === id) ?? null;
}

export function saveQuiz(quiz: Quiz): Quiz {
  const lib = readLibrary();
  const existing = lib.quizzes.findIndex((q) => q.id === quiz.id);
  if (existing >= 0) {
    lib.quizzes[existing] = quiz;
  } else {
    lib.quizzes.push(quiz);
  }
  writeLibrary(lib);
  return quiz;
}

export function renameQuiz(id: string, name: string): Quiz | null {
  const lib = readLibrary();
  const quiz = lib.quizzes.find((q) => q.id === id);
  if (!quiz) return null;
  quiz.name = name.trim() || quiz.name;
  writeLibrary(lib);
  return quiz;
}

export function deleteQuiz(id: string): void {
  const lib = readLibrary();
  lib.quizzes = lib.quizzes.filter((q) => q.id !== id);
  writeLibrary(lib);
}

export function duplicateQuiz(id: string): Quiz | null {
  const lib = readLibrary();
  const original = lib.quizzes.find((q) => q.id === id);
  if (!original) return null;
  const copy: Quiz = {
    ...original,
    id: makeId(),
    name: `${original.name} (copy)`,
    createdAt: Date.now(),
    cells: original.cells.map((c) => ({ ...c })),
    categories: [...original.categories],
  };
  lib.quizzes.push(copy);
  writeLibrary(lib);
  return copy;
}
