import Papa from 'papaparse';
import { LMS_MIN_ANSWERS_PER_ROUND } from './constants';
import type { LmsAnswer, LmsQuiz, LmsRound } from './types';

const REQUIRED_HEADERS = ['round', 'category', 'answer'] as const;

type ParseResult =
  | { ok: true; quiz: LmsQuiz }
  | { ok: false; errors: string[] };

interface ParseOptions {
  /** Quiz name; defaults to file basename or "Untitled". */
  name?: string;
  /** Provide a deterministic id (otherwise uses crypto.randomUUID). */
  id?: string;
}

function makeId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

function normaliseHeader(h: string): string {
  return h.trim().toLowerCase();
}

export function parseLmsCsv(input: string, options: ParseOptions = {}): ParseResult {
  const errors: string[] = [];

  const result = Papa.parse<Record<string, string>>(input, {
    header: true,
    skipEmptyLines: 'greedy',
    transformHeader: normaliseHeader,
    transform: (value) => (typeof value === 'string' ? value.trim() : value),
  });

  if (result.errors.length > 0) {
    for (const err of result.errors) {
      errors.push(`CSV parse error on row ${err.row ?? '?'}: ${err.message}`);
    }
  }

  const headers = result.meta.fields ?? [];
  const missing = REQUIRED_HEADERS.filter((h) => !headers.includes(h));
  if (missing.length > 0) {
    errors.push(
      `Missing required column(s): ${missing.join(', ')}. Header must be exactly: ${REQUIRED_HEADERS.join(',')}.`,
    );
  }

  if (errors.length > 0) {
    return { ok: false, errors };
  }

  const rows = result.data.filter((row) =>
    REQUIRED_HEADERS.some((h) => (row[h] ?? '').toString().length > 0),
  );

  if (rows.length === 0) {
    return { ok: false, errors: ['No data rows found.'] };
  }

  type Bucket = { category: string; answers: string[]; firstLine: number };
  const byRound = new Map<number, Bucket>();
  const seenAnswersPerRound = new Map<number, Set<string>>();

  rows.forEach((row, i) => {
    const lineNo = i + 2;
    const roundRaw = (row.round ?? '').toString().trim();
    const category = (row.category ?? '').toString().trim();
    const answer = (row.answer ?? '').toString().trim();

    if (!roundRaw) errors.push(`Row ${lineNo}: missing round.`);
    if (!category) errors.push(`Row ${lineNo}: missing category.`);
    if (!answer) errors.push(`Row ${lineNo}: missing answer.`);

    const round = Number(roundRaw);
    if (!Number.isFinite(round) || !Number.isInteger(round) || round < 1) {
      errors.push(`Row ${lineNo}: round "${roundRaw}" must be a positive integer.`);
      return;
    }

    if (!byRound.has(round)) {
      byRound.set(round, { category, answers: [], firstLine: lineNo });
      seenAnswersPerRound.set(round, new Set());
    }
    const bucket = byRound.get(round)!;
    if (bucket.category !== category) {
      errors.push(
        `Row ${lineNo}: round ${round} has conflicting categories "${bucket.category}" (row ${bucket.firstLine}) and "${category}". Each round must have exactly one category.`,
      );
    }

    if (answer) {
      const seen = seenAnswersPerRound.get(round)!;
      const key = answer.toLowerCase();
      if (seen.has(key)) {
        errors.push(`Row ${lineNo}: duplicate answer "${answer}" in round ${round}.`);
      } else {
        seen.add(key);
        bucket.answers.push(answer);
      }
    }
  });

  const roundNumbers = [...byRound.keys()].sort((a, b) => a - b);
  if (roundNumbers.length === 0) {
    errors.push('No valid rounds found.');
  } else {
    for (let i = 0; i < roundNumbers.length; i++) {
      const expected = i + 1;
      if (roundNumbers[i] !== expected) {
        errors.push(
          `Round numbers must be contiguous starting at 1. Expected ${expected}, got ${roundNumbers[i]}.`,
        );
        break;
      }
    }
  }

  for (const [round, bucket] of byRound.entries()) {
    if (bucket.answers.length < LMS_MIN_ANSWERS_PER_ROUND) {
      errors.push(
        `Round ${round} ("${bucket.category}") has ${bucket.answers.length} answer(s). Each round needs at least ${LMS_MIN_ANSWERS_PER_ROUND}.`,
      );
    }
  }

  if (errors.length > 0) {
    return { ok: false, errors };
  }

  const quizId = options.id ?? makeId();
  const rounds: LmsRound[] = roundNumbers.map((roundNo) => {
    const bucket = byRound.get(roundNo)!;
    const answers: LmsAnswer[] = bucket.answers.map((text, idx) => ({
      id: `${quizId}__r${roundNo}__a${idx}`,
      text,
    }));
    return {
      index: roundNo,
      category: bucket.category,
      answers,
    };
  });

  return {
    ok: true,
    quiz: {
      id: quizId,
      name: options.name ?? 'Untitled quiz',
      createdAt: Date.now(),
      rounds,
    },
  };
}

export function lmsQuizToCsv(quiz: LmsQuiz): string {
  const rows: { round: number; category: string; answer: string }[] = [];
  const sorted = [...quiz.rounds].sort((a, b) => a.index - b.index);
  for (const round of sorted) {
    for (const answer of round.answers) {
      rows.push({
        round: round.index,
        category: round.category,
        answer: answer.text,
      });
    }
  }
  return Papa.unparse(rows, { columns: [...REQUIRED_HEADERS] });
}
