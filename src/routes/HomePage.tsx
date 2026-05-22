import { GameTile } from '@/components/library/GameTile';

interface GameMeta {
  slug: string;
  to: string;
  name: string;
  description: string;
  status: 'available' | 'coming-soon';
  accent: string;
  glyph: string;
}

const games: GameMeta[] = [
  {
    slug: 'jeopardy',
    to: '/jeopardy',
    name: 'Jeopardy',
    description: 'Classic 6 × 5 board. Import a CSV, set up players, host a game.',
    status: 'available',
    accent: 'rgba(99,102,241,0.32)',
    glyph: 'JE',
  },
  {
    slug: 'lms',
    to: '/lms',
    name: 'Last Man Standing',
    description: 'Reveal numbered answer cards by category. Wrong answer? You’re out. Survive to win.',
    status: 'available',
    accent: 'rgba(16,185,129,0.28)',
    glyph: 'LM',
  },
  {
    slug: 'millionaire',
    to: '/games/millionaire',
    name: 'Millionaire',
    description: 'Climb the ladder of escalating questions. Lifelines included.',
    status: 'coming-soon',
    accent: 'rgba(245,158,11,0.28)',
    glyph: 'MI',
  },
  {
    slug: 'buzzer',
    to: '/games/buzzer',
    name: 'Buzzer Round',
    description: 'Fast-paced head-to-head buzzer rounds for any prompt list.',
    status: 'coming-soon',
    accent: 'rgba(244,63,94,0.28)',
    glyph: 'BZ',
  },
];

export function HomePage() {
  return (
    <div className="flex flex-col gap-12">
      <section className="flex flex-col gap-3 max-w-2xl">
        <span className="text-xs uppercase tracking-[0.18em] text-fg-muted font-mono">
          Game studio
        </span>
        <h1 className="text-4xl font-semibold text-fg leading-[1.05] tracking-tight">
          Run small quiz games <br />
          without the cheese.
        </h1>
        <p className="text-base text-fg-muted leading-relaxed mt-1">
          A focused, dark-only host console. Import a CSV, gather your players, and run a clean
          presenter-led game. More formats land soon.
        </p>
      </section>

      <section className="flex flex-col gap-4">
        <div className="flex items-baseline justify-between border-b border-border pb-3">
          <h2 className="text-sm font-semibold tracking-tight text-fg">Library</h2>
          <span className="text-xs text-fg-muted font-mono">
            {games.filter((g) => g.status === 'available').length} live ·{' '}
            {games.filter((g) => g.status === 'coming-soon').length} planned
          </span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {games.map((game) => (
            <GameTile
              key={game.slug}
              to={game.to}
              name={game.name}
              description={game.description}
              status={game.status}
              accent={game.accent}
              glyph={game.glyph}
            />
          ))}
        </div>
      </section>
    </div>
  );
}
