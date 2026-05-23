import Papa from 'papaparse';
import { LMS_MIN_ANSWERS_PER_ROUND } from './constants';
import type { LmsQuiz, LmsRound } from './types';

function makeId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

export type ParseOptions = {
  /** Quiz name; defaults to file basename or "Untitled". */
  name?: string;
  /** Provide a deterministic id (otherwise uses crypto.randomUUID). */
  id?: string;
};

export type ParseResult =
  | { ok: true; quiz: LmsQuiz }
  | { ok: false, errors: string[] };

export function parseLmsCsv(input: string, options: ParseOptions = {}): ParseResult {
  const errors: string[] = [];

  const result = Papa.parse<string[]>(input, {
    header: false,
    skipEmptyLines: 'greedy',
    transform: (value) => (typeof value === 'string' ? value.trim() : value),
  });

  if (result.errors.length > 0) {
    for (const err of result.errors) {
      errors.push(`CSV parse error on row ${err.row ?? '?'}: ${err.message}`);
    }
  }

  if (errors.length > 0) {
    return { ok: false, errors };
  }

  const rows = result.data.filter((row) => row.some((cell) => cell.length > 0));

  if (rows.length === 0) {
    return { ok: false, errors: ['No data found.'] };
  }

  const headerRow = rows[0];
  if (!headerRow || headerRow.length === 0) {
    return { ok: false, errors: ['No columns/categories found in the first row.'] };
  }

  const rounds: LmsRound[] = [];
  const quizId = options.id ?? makeId();

  // Each column is a round.
  for (let colIdx = 0; colIdx < headerRow.length; colIdx++) {
    const category = headerRow[colIdx];
    if (!category) {
      errors.push(`Column ${colIdx + 1} has no category name in the header row.`);
      continue;
    }

    const roundNo = colIdx + 1;
    const answers: string[] = [];
    const seenAnswers = new Set<string>();

    for (let rowIdx = 1; rowIdx < rows.length; rowIdx++) {
      const row = rows[rowIdx];
      const answer = row[colIdx];

      if (answer) {
        const key = answer.toLowerCase();
        if (seenAnswers.has(key)) {
          errors.push(`Column ${roundNo} ("${category}"): duplicate answer "${answer}" on row ${rowIdx + 1}.`);
        } else {
          seenAnswers.add(key);
          answers.push(answer);
        }
      }
    }

    if (answers.length < LMS_MIN_ANSWERS_PER_ROUND && category) {
      errors.push(
        `Round ${roundNo} ("${category}") has ${answers.length} answer(s). Each round needs at least ${LMS_MIN_ANSWERS_PER_ROUND}.`,
      );
    }

    rounds.push({
      index: roundNo,
      category,
      answers: answers.map((text, idx) => ({
        id: `${quizId}__r${roundNo}__a${idx}`,
        text,
      })),
    });
  }

  if (errors.length > 0) {
    return { ok: false, errors };
  }

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
  const sortedRounds = [...quiz.rounds].sort((a, b) => a.index - b.index);
  const categories = sortedRounds.map(r => r.category);

  const maxAnswers = Math.max(0, ...sortedRounds.map(r => r.answers.length));

  const rows: string[][] = [categories];

  for (let i = 0; i < maxAnswers; i++) {
    const row: string[] = [];
    for (const round of sortedRounds) {
      row.push(round.answers[i] ? round.answers[i].text : '');
    }
    rows.push(row);
  }

  return Papa.unparse(rows, { header: false });
}
