import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

function Logo() {
  return (
    <Link to="/" className="flex items-center gap-2 group" aria-label="GameKnight home">
      <span className="relative flex h-7 w-7 items-center justify-center rounded-md border border-border-strong bg-surface">
        <span className="absolute inset-0.5 rounded-[5px] bg-gradient-to-br from-[color-mix(in_srgb,var(--accent)_30%,transparent)] to-transparent" />
        <span className="relative font-mono text-[11px] font-bold tracking-tight text-fg">GK</span>
      </span>
      <span className="text-sm font-semibold tracking-tight text-fg">
        GameKnight
        <span className="text-fg-muted font-normal"> /</span>
        <span className="text-fg-muted font-normal"> studio</span>
      </span>
    </Link>
  );
}

function TopNavLink({ to, children }: { to: string; children: ReactNode }) {
  return (
    <NavLink
      to={to}
      end
      className={({ isActive }) =>
        cn(
          'h-8 inline-flex items-center px-3 rounded-md text-sm transition-colors ring-focus',
          isActive
            ? 'bg-surface text-fg border border-border'
            : 'text-fg-muted hover:text-fg hover:bg-surface',
        )
      }
    >
      {children}
    </NavLink>
  );
}

export function Layout() {
  const location = useLocation();
  const onChromeFreeRoute =
    location.pathname.startsWith('/jeopardy/play') ||
    location.pathname.startsWith('/lms/host') ||
    location.pathname.startsWith('/lms/play');

  return (
    <div className="min-h-full flex flex-col grid-bg">
      {!onChromeFreeRoute && (
        <header className="sticky top-0 z-40 border-b border-border bg-[color-mix(in_srgb,var(--bg)_85%,transparent)] backdrop-blur supports-[backdrop-filter]:bg-[color-mix(in_srgb,var(--bg)_70%,transparent)]">
          <div className="mx-auto max-w-6xl px-6 h-14 flex items-center justify-between gap-6">
            <Logo />
            <nav className="flex items-center gap-1">
              <TopNavLink to="/">Library</TopNavLink>
              <TopNavLink to="/jeopardy">Jeopardy</TopNavLink>
              <TopNavLink to="/lms">Last Man Standing</TopNavLink>
            </nav>
          </div>
        </header>
      )}
      <main className={cn('flex-1', !onChromeFreeRoute && 'mx-auto w-full max-w-6xl px-6 py-10')}>
        <Outlet />
      </main>
      {!onChromeFreeRoute && (
        <footer className="border-t border-border">
          <div className="mx-auto max-w-6xl px-6 h-12 flex items-center justify-between text-xs text-fg-muted">
            <span>GameKnight · v0.1</span>
            <span className="font-mono">offline · local-first</span>
          </div>
        </footer>
      )}
    </div>
  );
}
