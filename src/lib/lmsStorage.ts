import { LMS_QUIZ_LIBRARY_STORAGE_KEY } from '@/games/lms/constants';
import type { LmsQuiz } from '@/games/lms/types';

interface LmsLibrary {
  version: 1;
  quizzes: LmsQuiz[];
}

function emptyLibrary(): LmsLibrary {
  return { version: 1, quizzes: [] };
}

function readLibrary(): LmsLibrary {
  if (typeof localStorage === 'undefined') return emptyLibrary();
  try {
    const raw = localStorage.getItem(LMS_QUIZ_LIBRARY_STORAGE_KEY);
    if (!raw) return emptyLibrary();
    const parsed = JSON.parse(raw) as LmsLibrary;
    if (!parsed || parsed.version !== 1 || !Array.isArray(parsed.quizzes)) {
      return emptyLibrary();
    }
    return parsed;
  } catch {
    return emptyLibrary();
  }
}

function writeLibrary(lib: LmsLibrary): void {
  if (typeof localStorage === 'undefined') return;
  localStorage.setItem(LMS_QUIZ_LIBRARY_STORAGE_KEY, JSON.stringify(lib));
}

function makeId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

export function loadLmsQuizzes(): LmsQuiz[] {
  const lib = readLibrary();
  return [...lib.quizzes].sort((a, b) => b.createdAt - a.createdAt);
}

export function getLmsQuiz(id: string): LmsQuiz | null {
  return readLibrary().quizzes.find((q) => q.id === id) ?? null;
}

export function saveLmsQuiz(quiz: LmsQuiz): LmsQuiz {
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

export function renameLmsQuiz(id: string, name: string): LmsQuiz | null {
  const lib = readLibrary();
  const quiz = lib.quizzes.find((q) => q.id === id);
  if (!quiz) return null;
  quiz.name = name.trim() || quiz.name;
  writeLibrary(lib);
  return quiz;
}

export function deleteLmsQuiz(id: string): void {
  const lib = readLibrary();
  lib.quizzes = lib.quizzes.filter((q) => q.id !== id);
  writeLibrary(lib);
}

export function duplicateLmsQuiz(id: string): LmsQuiz | null {
  const lib = readLibrary();
  const original = lib.quizzes.find((q) => q.id === id);
  if (!original) return null;
  const newId = makeId();
  const copy: LmsQuiz = {
    ...original,
    id: newId,
    name: `${original.name} (copy)`,
    createdAt: Date.now(),
    rounds: original.rounds.map((r) => ({
      ...r,
      answers: r.answers.map((a, idx) => ({
        id: `${newId}__r${r.index}__a${idx}`,
        text: a.text,
      })),
    })),
  };
  lib.quizzes.push(copy);
  writeLibrary(lib);
  return copy;
}
