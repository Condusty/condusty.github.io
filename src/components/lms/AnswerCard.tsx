import { cn } from '@/lib/cn';

export type AnswerCardMode = 'play' | 'host';

interface AnswerCardProps {
  number: number;
  revealed: boolean;
  text: string;
  mode: AnswerCardMode;
  onClick?: () => void;
  disabled?: boolean;
}

/**
 * One answer slot.
 * - mode="play": player-facing. Hidden cards show ONLY the number. Revealed cards show the answer.
 *   The answer text is never rendered into the DOM until the card is revealed.
 * - mode="host": admin-facing. Shows the answer text always; clicking toggles the reveal state.
 *   Visually marks revealed cards as "shown to players".
 */
export function AnswerCard({
  number,
  revealed,
  text,
  mode,
  onClick,
  disabled,
}: AnswerCardProps) {
  const isInteractive = mode === 'host' && !disabled;

  return (
    <button
      type="button"
      onClick={isInteractive ? onClick : undefined}
      disabled={!isInteractive}
      className={cn(
        'group relative flex flex-col items-center justify-center rounded-md border transition-all duration-150 ring-focus aspect-[16/10] p-3 text-center',
        mode === 'play'
          ? revealed
            ? 'border-[color:var(--accent)] bg-[color-mix(in_srgb,var(--accent)_8%,transparent)] cursor-default'
            : 'border-border bg-surface cursor-default'
          : revealed
            ? 'border-[color:var(--accent)] bg-[color-mix(in_srgb,var(--accent)_10%,transparent)] hover:bg-[color-mix(in_srgb,var(--accent)_15%,transparent)] active:scale-[0.99]'
            : 'border-border bg-surface hover:border-border-strong hover:bg-surface-2 active:scale-[0.99]',
      )}
      aria-label={
        mode === 'play'
          ? revealed
            ? `Card ${number}: ${text}`
            : `Card ${number} (hidden)`
          : revealed
            ? `Card ${number}: ${text} (revealed — click to hide)`
            : `Card ${number}: ${text} (hidden — click to reveal)`
      }
    >
      <span
        className={cn(
          'absolute top-1.5 left-2 font-mono text-[11px]',
          revealed ? 'text-fg-muted' : 'text-fg-muted',
        )}
      >
        #{number}
      </span>

      {mode === 'play' ? (
        revealed ? (
          <span className="font-semibold text-base md:text-xl xl:text-2xl tracking-tight text-fg leading-tight px-2 animate-fade-up">
            {text}
          </span>
        ) : (
          <span
            className="font-mono text-3xl md:text-4xl xl:text-5xl font-bold tracking-tight text-fg/70"
            style={{ textShadow: '0 0 16px color-mix(in srgb, var(--accent) 18%, transparent)' }}
          >
            {number}
          </span>
        )
      ) : (
        <>
          <span
            className={cn(
              'font-medium text-sm md:text-base text-fg leading-tight px-2',
              revealed && 'opacity-90',
            )}
          >
            {text}
          </span>
          <span
            className={cn(
              'absolute bottom-1.5 right-2 font-mono text-[10px] tracking-[0.18em] uppercase',
              revealed ? 'text-[color:var(--accent)]' : 'text-fg-muted',
            )}
          >
            {revealed ? 'shown' : 'hidden'}
          </span>
        </>
      )}
    </button>
  );
}
