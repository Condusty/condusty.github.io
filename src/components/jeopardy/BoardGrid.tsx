import { JEOPARDY_VALUES } from '@/games/jeopardy/constants';
import type { Cell } from '@/games/jeopardy/types';
import { BoardCell } from './BoardCell';

interface BoardGridProps {
  categories: string[];
  cells: Cell[];
  usedCellIds: string[];
  onPick: (cellId: string) => void;
}

export function BoardGrid({ categories, cells, usedCellIds, onPick }: BoardGridProps) {
  const used = new Set(usedCellIds);
  const cellByKey = new Map<string, Cell>();
  for (const c of cells) cellByKey.set(c.id, c);

  return (
    <div
      className="grid gap-2 md:gap-3"
      style={{ gridTemplateColumns: `repeat(${categories.length}, minmax(0, 1fr))` }}
    >
      {categories.map((cat) => (
        <div
          key={cat}
          className="flex h-16 md:h-20 items-center justify-center rounded-md border border-border bg-surface px-3 text-center"
        >
          <span className="font-mono text-[11px] md:text-xs uppercase tracking-[0.18em] text-fg leading-tight line-clamp-2">
            {cat}
          </span>
        </div>
      ))}

      {JEOPARDY_VALUES.map((value) =>
        categories.map((cat) => {
          const id = `${cat}__${value}`;
          const cell = cellByKey.get(id);
          if (!cell) {
            return (
              <div
                key={id}
                className="aspect-[16/10] rounded-md border border-dashed border-border"
              />
            );
          }
          return (
            <BoardCell
              key={id}
              value={cell.value}
              used={used.has(cell.id)}
              onClick={() => onPick(cell.id)}
            />
          );
        }),
      )}
    </div>
  );
}
