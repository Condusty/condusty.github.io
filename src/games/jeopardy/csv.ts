import Papa from 'papaparse';
import {
  JEOPARDY_CATEGORY_COUNT,
  JEOPARDY_VALUES,
} from './constants';
import type { Cell, Quiz } from './types';

export type ParseResult =
  | { ok: true; quiz: Quiz }
  | { ok: false; errors: string[] };

export interface ParseOptions {
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

export function parseQuizCsv(input: string, options: ParseOptions = {}): ParseResult {
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

  const categoryHeaders = rows[0];
  if (!categoryHeaders || categoryHeaders.length !== JEOPARDY_CATEGORY_COUNT) {
    errors.push(`Expected exactly ${JEOPARDY_CATEGORY_COUNT} categories as column headers in the first row. Found ${categoryHeaders?.length || 0}.`);
  }

  const expectedRows = 1 + (JEOPARDY_VALUES.length * 2);
  if (rows.length !== expectedRows) {
    errors.push(`Expected exactly ${expectedRows} rows total (1 row for categories, and ${JEOPARDY_VALUES.length * 2} rows for ${JEOPARDY_VALUES.length} values of alternating Question/Answer rows). Found ${rows.length}.`);
  }

  if (errors.length > 0) {
    return { ok: false, errors };
  }

  const cells: Cell[] = [];
  const quizId = options.id ?? makeId();

  for (let c = 0; c < JEOPARDY_CATEGORY_COUNT; c++) {
    const category = categoryHeaders[c];
    if (!category) {
      errors.push(`Missing category name in column ${c + 1}`);
      continue;
    }

    for (let vIdx = 0; vIdx < JEOPARDY_VALUES.length; vIdx++) {
      const value = JEOPARDY_VALUES[vIdx];
      const qRow = 1 + (vIdx * 2);
      const aRow = qRow + 1;

      const question = rows[qRow]?.[c];
      const answer = rows[aRow]?.[c];

      if (!question) errors.push(`Missing question for "${category}" at value ${value} (Row ${qRow + 1})`);
      if (!answer) errors.push(`Missing answer for "${category}" at value ${value} (Row ${aRow + 1})`);

      if (question && answer) {
        cells.push({
          id: `${quizId}__${category}__${value}`,
          category,
          value,
          question,
          answer
        });
      }
    }
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
      categories: categoryHeaders.filter(c => c !== undefined && c.trim() !== ''),
      cells,
    },
  };
}

export function quizToCsv(quiz: Quiz): string {
  const result: string[][] = [];
  const cats = [...new Set(quiz.cells.map(c => c.category))];
  result.push(cats);

  for (const val of JEOPARDY_VALUES) {
    const qRow: string[] = [];
    const aRow: string[] = [];
    for (const cat of cats) {
      const cell = quiz.cells.find(c => c.category === cat && c.value === val);
      qRow.push(cell?.question ?? '');
      aRow.push(cell?.answer ?? '');
    }
    result.push(qRow);
    result.push(aRow);
  }

  return Papa.unparse(result, { header: false });
}
