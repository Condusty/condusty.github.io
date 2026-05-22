import { Button } from '@/components/ui/Button';
import type { LmsPlayer } from '@/games/lms/types';
import { tintFor } from '@/lib/colors';
import { cn } from '@/lib/cn';

interface RoundResultsProps {
  /** Player roster used for this round. */
  players: LmsPlayer[];
  /** Order in which players were eliminated this round. */
  eliminationOrder: string[];
  /** Points each player earned this round (already added to score). */
  pointsAwarded: Record<string, number>;
  /** Whether this is the last round of the quiz. */
  isLastRound: boolean;
  /** Display only (host vs read-only on play screen). */
  mode: 'host' | 'play';
  /** Round info for the header. */
  roundIndex: number;
  totalRounds: number;
  category: string;
  /** Host-only actions. */
  onNext?: () => void;
  onEndGame?: () => void;
}

interface RankRow {
  player: LmsPlayer;
  points: number;
  /** Rank label shown to the user (e.g. "1.", "T-2.", "Out"). */
  rankLabel: string;
  /** Free-form description (e.g. "Survivor", "Eliminated 1st"). */
  status: string;
}

function buildRanking(
  players: LmsPlayer[],
  eliminationOrder: string[],
  pointsAwarded: Record<string, number>,
): RankRow[] {
  const eliminatedSet = new Set(eliminationOrder);
  const survivors = players.filter((p) => !eliminatedSet.has(p.id));

  const rows: RankRow[] = [];

  if (survivors.length > 0) {
    const tied = survivors.length > 1;
    survivors.forEach((p) => {
      rows.push({
        player: p,
        points: pointsAwarded[p.id] ?? 0,
        rankLabel: tied ? 'T-1.' : '1.',
        status: tied ? `Survivor (tied with ${survivors.length - 1} other)` : 'Last standing',
      });
    });
  }

  // Eliminated: latest eliminated has the highest rank among the eliminated.
  // eliminationOrder[0] = first out (worst).
  const eliminatedReversed = [...eliminationOrder].reverse();
  eliminatedReversed.forEach((id, idx) => {
    const player = players.find((p) => p.id === id);
    if (!player) return;
    const placeFromTop = survivors.length + idx + 1;
    const eliminationStep = eliminationOrder.indexOf(id) + 1;
    const total = eliminationOrder.length;
    rows.push({
      player,
      points: pointsAwarded[id] ?? 0,
      rankLabel: `${placeFromTop}.`,
      status:
        total === 1
          ? 'Eliminated'
          : `Eliminated ${eliminationStep}${ordinalSuffix(eliminationStep)} of ${total}`,
    });
  });

  return rows;
}

function ordinalSuffix(n: number): string {
  const rem10 = n % 10;
  const rem100 = n % 100;
  if (rem10 === 1 && rem100 !== 11) return 'st';
  if (rem10 === 2 && rem100 !== 12) return 'nd';
  if (rem10 === 3 && rem100 !== 13) return 'rd';
  return 'th';
}

export function RoundResults({
  players,
  eliminationOrder,
  pointsAwarded,
  isLastRound,
  mode,
  roundIndex,
  totalRounds,
  category,
  onNext,
  onEndGame,
}: RoundResultsProps) {
  const ranking = buildRanking(players, eliminationOrder, pointsAwarded);

  return (
    <div className="fixed inset-0 z-40 flex flex-col bg-bg">
      <div
        aria-hidden
        className="absolute inset-0 grid-bg pointer-events-none"
        style={{
          backgroundImage:
            'radial-gradient(circle at 50% 0%, color-mix(in srgb, var(--accent) 12%, transparent), transparent 55%)',
        }}
      />

      <div className="relative flex items-center justify-between px-6 py-4 border-b border-border">
        <div className="flex items-center gap-3 min-w-0">
          <span className="text-xs font-mono uppercase tracking-[0.18em] text-fg-muted">
            Round {roundIndex} / {totalRounds}
          </span>
          <span className="text-fg-muted">·</span>
          <span className="text-sm font-medium text-fg truncate">{category}</span>
        </div>
        <span className="text-xs font-mono text-fg-muted">
          {mode === 'host' ? 'Host · round results' : 'Round results'}
        </span>
      </div>

      <div className="relative flex-1 flex items-center justify-center px-6 py-10 overflow-y-auto">
        <div className="max-w-3xl w-full flex flex-col items-center gap-8">
          <div className="flex flex-col items-center gap-2 text-center">
            <span className="text-xs font-mono uppercase tracking-[0.18em] text-fg-muted">
              Points awarded
            </span>
            <h2 className="text-3xl md:text-4xl font-semibold text-fg leading-tight tracking-tight">
              {isLastRound ? 'Final results' : `Round ${roundIndex} done.`}
            </h2>
          </div>

          <ul className="w-full flex flex-col gap-2">
            {ranking.map((row) => (
              <li
                key={row.player.id}
                className="flex items-center gap-3 rounded-md border border-border bg-surface px-4 py-3"
                style={{
                  backgroundImage: `linear-gradient(180deg, ${tintFor(row.player.color)} 0%, transparent 100%)`,
                }}
              >
                <span className="font-mono text-sm w-12 text-fg-muted">{row.rankLabel}</span>
                <span
                  className="h-2.5 w-2.5 rounded-full shrink-0"
                  style={{
                    backgroundColor: row.player.color,
                    boxShadow: `0 0 0 3px ${tintFor(row.player.color)}`,
                  }}
                />
                <div className="flex flex-col flex-1 min-w-0">
                  <span className="text-sm font-medium text-fg truncate">
                    {row.player.name || 'Unnamed'}
                  </span>
                  <span className="text-xs text-fg-muted">{row.status}</span>
                </div>
                <div className="flex items-baseline gap-2 shrink-0">
                  <span
                    className={cn(
                      'font-mono text-2xl font-semibold',
                      row.points > 0 ? 'text-[color:var(--accent)]' : 'text-fg-muted',
                    )}
                  >
                    +{row.points}
                  </span>
                  <span className="text-xs font-mono text-fg-muted">
                    → {row.player.score}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {mode === 'host' && (
        <div className="relative border-t border-border bg-[color-mix(in_srgb,var(--bg)_90%,transparent)] backdrop-blur">
          <div className="px-6 py-4 flex items-center justify-end gap-2">
            {isLastRound ? (
              <Button size="lg" onClick={onEndGame}>
                Finish quiz →
              </Button>
            ) : (
              <Button size="lg" onClick={onNext}>
                Next round →
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
