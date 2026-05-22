export interface AccentColor {
  id: string;
  name: string;
  /** Hex shown directly in dark UI; tuned for AA contrast on near-black bg. */
  hex: string;
  /** Soft tint background (rgba) for subtle surfaces. */
  tint: string;
}

export const PLAYER_COLORS: AccentColor[] = [
  { id: 'indigo', name: 'Indigo', hex: '#818cf8', tint: 'rgba(99,102,241,0.18)' },
  { id: 'emerald', name: 'Emerald', hex: '#34d399', tint: 'rgba(16,185,129,0.18)' },
  { id: 'amber', name: 'Amber', hex: '#fbbf24', tint: 'rgba(245,158,11,0.18)' },
  { id: 'rose', name: 'Rose', hex: '#fb7185', tint: 'rgba(244,63,94,0.18)' },
  { id: 'cyan', name: 'Cyan', hex: '#22d3ee', tint: 'rgba(34,211,238,0.18)' },
  { id: 'violet', name: 'Violet', hex: '#c084fc', tint: 'rgba(168,85,247,0.18)' },
];

export function nextAccent(usedHexes: string[]): AccentColor {
  const used = new Set(usedHexes);
  return PLAYER_COLORS.find((c) => !used.has(c.hex)) ?? PLAYER_COLORS[0];
}

export function accentByHex(hex: string): AccentColor | undefined {
  return PLAYER_COLORS.find((c) => c.hex === hex);
}

export function tintFor(hex: string): string {
  return accentByHex(hex)?.tint ?? 'rgba(99,102,241,0.18)';
}
