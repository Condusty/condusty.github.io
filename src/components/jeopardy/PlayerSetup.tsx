import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { IconButton } from '@/components/ui/IconButton';
import { MAX_PLAYERS, MIN_PLAYERS } from '@/games/jeopardy/constants';
import { PLAYER_COLORS, nextAccent } from '@/lib/colors';
import { cn } from '@/lib/cn';

export interface DraftPlayer {
  id: string;
  name: string;
  color: string;
}

interface PlayerSetupProps {
  players: DraftPlayer[];
  onChange: (players: DraftPlayer[]) => void;
}

function makeId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

export function makeDefaultPlayers(): DraftPlayer[] {
  return [
    { id: makeId(), name: '', color: PLAYER_COLORS[0].hex },
    { id: makeId(), name: '', color: PLAYER_COLORS[1].hex },
  ];
}

export function PlayerSetup({ players, onChange }: PlayerSetupProps) {
  const addPlayer = () => {
    if (players.length >= MAX_PLAYERS) return;
    const usedColors = players.map((p) => p.color);
    const accent = nextAccent(usedColors);
    onChange([...players, { id: makeId(), name: '', color: accent.hex }]);
  };

  const removePlayer = (id: string) => {
    if (players.length <= MIN_PLAYERS) return;
    onChange(players.filter((p) => p.id !== id));
  };

  const updateName = (id: string, name: string) => {
    onChange(players.map((p) => (p.id === id ? { ...p, name } : p)));
  };

  const cycleColor = (id: string) => {
    const player = players.find((p) => p.id === id);
    if (!player) return;
    const usedByOthers = players.filter((p) => p.id !== id).map((p) => p.color);
    const currentIndex = PLAYER_COLORS.findIndex((c) => c.hex === player.color);
    for (let i = 1; i <= PLAYER_COLORS.length; i++) {
      const candidate = PLAYER_COLORS[(currentIndex + i) % PLAYER_COLORS.length];
      if (!usedByOthers.includes(candidate.hex)) {
        onChange(players.map((p) => (p.id === id ? { ...p, color: candidate.hex } : p)));
        return;
      }
    }
  };

  return (
    <div className="flex flex-col gap-3">
      <ul className="flex flex-col gap-2">
        {players.map((p, i) => (
          <li
            key={p.id}
            className="flex items-center gap-2 rounded-md border border-border bg-surface px-3 py-2"
          >
            <span className="text-xs font-mono text-fg-muted w-5 text-center">{i + 1}</span>
            <button
              type="button"
              onClick={() => cycleColor(p.id)}
              aria-label="Change color"
              className="h-6 w-6 shrink-0 rounded-full border border-border-strong ring-focus"
              style={{ backgroundColor: p.color }}
            />
            <Input
              value={p.name}
              onChange={(e) => updateName(p.id, e.target.value)}
              placeholder={`Player ${i + 1}`}
              className="h-8 flex-1 bg-transparent border-0 px-2 hover:bg-surface-2 focus:bg-surface-2"
            />
            <IconButton
              tone="danger"
              size="sm"
              onClick={() => removePlayer(p.id)}
              disabled={players.length <= MIN_PLAYERS}
              aria-label="Remove player"
            >
              ×
            </IconButton>
          </li>
        ))}
      </ul>
      <div className="flex items-center justify-between">
        <Button
          variant="secondary"
          size="sm"
          onClick={addPlayer}
          disabled={players.length >= MAX_PLAYERS}
        >
          + Add player
        </Button>
        <span className={cn('text-xs font-mono', players.length >= MAX_PLAYERS ? 'text-fg-muted' : 'text-fg-muted')}>
          {players.length} / {MAX_PLAYERS}
        </span>
      </div>
    </div>
  );
}
