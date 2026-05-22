import Papa from 'papaparse';
import {
  JEOPARDY_CATEGORY_COUNT,
  JEOPARDY_CELL_COUNT,
  JEOPARDY_VALUES,
} from './constants';
import type { Cell, Quiz } from './types';

const REQUIRED_HEADERS = ['category', 'value', 'question', 'answer'] as const;

type ParseResult =
  | { ok: true; quiz: Quiz }
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

export function parseQuizCsv(input: string, options: ParseOptions = {}): ParseResult {
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

  if (rows.length !== JEOPARDY_CELL_COUNT) {
    errors.push(
      `Expected exactly ${JEOPARDY_CELL_COUNT} rows (${JEOPARDY_CATEGORY_COUNT} categories × ${JEOPARDY_VALUES.length} values), got ${rows.length}.`,
    );
  }

  const seenCells = new Map<string, number>();
  const byCategory = new Map<string, Set<number>>();
  const categoryOrder: string[] = [];
  const cells: Cell[] = [];

  rows.forEach((row, i) => {
    const lineNo = i + 2;
    const category = (row.category ?? '').toString().trim();
    const valueRaw = (row.value ?? '').toString().trim();
    const question = (row.question ?? '').toString().trim();
    const answer = (row.answer ?? '').toString().trim();

    if (!category) errors.push(`Row ${lineNo}: missing category.`);
    if (!question) errors.push(`Row ${lineNo}: missing question.`);
    if (!answer) errors.push(`Row ${lineNo}: missing answer.`);

    const value = Number(valueRaw);
    if (!Number.isFinite(value)) {
      errors.push(`Row ${lineNo}: value "${valueRaw}" is not a number.`);
      return;
    }
    if (!JEOPARDY_VALUES.includes(value as (typeof JEOPARDY_VALUES)[number])) {
      errors.push(
        `Row ${lineNo}: value ${value} is not allowed. Must be one of ${JEOPARDY_VALUES.join(', ')}.`,
      );
      return;
    }

    if (!byCategory.has(category)) {
      byCategory.set(category, new Set());
      categoryOrder.push(category);
    }
    const set = byCategory.get(category)!;
    if (set.has(value)) {
      errors.push(
        `Row ${lineNo}: duplicate cell for "${category}" at value ${value}. Each category needs each value exactly once.`,
      );
    } else {
      set.add(value);
    }

    const key = `${category}__${value}`;
    seenCells.set(key, (seenCells.get(key) ?? 0) + 1);

    cells.push({
      id: key,
      category,
      value,
      question,
      answer,
    });
  });

  if (categoryOrder.length !== JEOPARDY_CATEGORY_COUNT) {
    errors.push(
      `Expected exactly ${JEOPARDY_CATEGORY_COUNT} unique categories, got ${categoryOrder.length}: ${categoryOrder.join(', ') || '(none)'}.`,
    );
  }

  for (const [cat, values] of byCategory.entries()) {
    if (values.size !== JEOPARDY_VALUES.length) {
      errors.push(
        `Category "${cat}" has ${values.size} cells. Each category needs exactly ${JEOPARDY_VALUES.length} (one per ${JEOPARDY_VALUES.join('/')}).`,
      );
    }
  }

  if (errors.length > 0) {
    return { ok: false, errors };
  }

  cells.sort((a, b) => {
    const ai = categoryOrder.indexOf(a.category);
    const bi = categoryOrder.indexOf(b.category);
    if (ai !== bi) return ai - bi;
    return a.value - b.value;
  });

  return {
    ok: true,
    quiz: {
      id: options.id ?? makeId(),
      name: options.name ?? 'Untitled quiz',
      createdAt: Date.now(),
      categories: categoryOrder,
      cells,
    },
  };
}

export function quizToCsv(quiz: Quiz): string {
  const rows = [...quiz.cells].sort((a, b) => {
    const ai = quiz.categories.indexOf(a.category);
    const bi = quiz.categories.indexOf(b.category);
    if (ai !== bi) return ai - bi;
    return a.value - b.value;
  });
  return Papa.unparse(
    rows.map((c) => ({
      category: c.category,
      value: c.value,
      question: c.question,
      answer: c.answer,
    })),
    { columns: [...REQUIRED_HEADERS] },
  );
}
