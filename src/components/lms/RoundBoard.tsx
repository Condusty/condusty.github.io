import type { LmsAnswer } from '@/games/lms/types';
import { AnswerCard, type AnswerCardMode } from './AnswerCard';

interface RoundBoardProps {
  answers: LmsAnswer[];
  revealedAnswerIds: string[];
  mode: AnswerCardMode;
  onCardClick?: (answerId: string) => void;
  disabled?: boolean;
}

function pickColumns(count: number): number {
  if (count <= 4) return count;
  if (count <= 6) return 3;
  if (count <= 12) return 4;
  if (count <= 20) return 5;
  return 6;
}

export function RoundBoard({
  answers,
  revealedAnswerIds,
  mode,
  onCardClick,
  disabled,
}: RoundBoardProps) {
  const revealed = new Set(revealedAnswerIds);
  const cols = pickColumns(answers.length);

  return (
    <div
      className="grid gap-2 md:gap-3"
      style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
    >
      {answers.map((a, i) => (
        <AnswerCard
          key={a.id}
          number={i + 1}
          revealed={revealed.has(a.id)}
          text={a.text}
          mode={mode}
          onClick={onCardClick ? () => onCardClick(a.id) : undefined}
          disabled={disabled}
        />
      ))}
    </div>
  );
}
