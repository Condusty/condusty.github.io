import { Link, useParams } from 'react-router-dom';

const labels: Record<string, { name: string; tagline: string }> = {
  trivia: {
    name: 'Trivia',
    tagline: 'Multiple-choice rapid-fire rounds.',
  },
  millionaire: {
    name: 'Millionaire',
    tagline: 'Escalating questions with lifelines.',
  },
  buzzer: {
    name: 'Buzzer Round',
    tagline: 'Head-to-head buzzer rounds.',
  },
};

export function PlaceholderPage() {
  const { slug = '' } = useParams();
  const meta = labels[slug] ?? { name: 'Coming soon', tagline: 'This game is on the roadmap.' };

  return (
    <div className="flex flex-col gap-8 max-w-2xl">
      <div className="flex flex-col gap-3">
        <span className="text-xs uppercase tracking-[0.18em] text-fg-muted font-mono">
          {meta.name}
        </span>
        <h1 className="text-3xl font-semibold text-fg leading-tight tracking-tight">
          Not built yet.
        </h1>
        <p className="text-base text-fg-muted leading-relaxed">
          {meta.tagline} It's on the roadmap and the platform is structured to slot it in
          without disrupting the host workflow you'll learn with Jeopardy.
        </p>
      </div>

      <div className="rounded-lg border border-border bg-surface p-5">
        <p className="text-sm text-fg-muted">
          Want this prioritised? Use Jeopardy first, then we'll know which patterns matter.
        </p>
      </div>

      <div className="flex items-center gap-3">
        <Link
          to="/"
          className="inline-flex h-10 items-center rounded-md border border-border bg-surface px-4 text-sm font-medium text-fg transition-colors hover:bg-surface-2 hover:border-border-strong ring-focus"
        >
          Back to library
        </Link>
        <Link
          to="/jeopardy"
          className="text-sm text-fg-muted hover:text-fg transition-colors ring-focus rounded-md px-2 py-1"
        >
          Try Jeopardy →
        </Link>
      </div>
    </div>
  );
}
