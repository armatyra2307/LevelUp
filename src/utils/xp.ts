export const XP_PER_REMINDER = 50;
const XP_BASE = 1000;

export function xpForLevel(level: number): number {
  return level * XP_BASE;
}

export function calculateLevel(xp: number): number {
  let level = 1;
  let remaining = xp;
  while (remaining >= xpForLevel(level)) {
    remaining -= xpForLevel(level);
    level += 1;
  }
  return level;
}

export function xpIntoLevel(xp: number): number {
  let remaining = xp;
  let level = 1;
  while (remaining >= xpForLevel(level)) {
    remaining -= xpForLevel(level);
    level += 1;
  }
  return remaining;
}

export function xpCurrentToNext(xp: number): number {
  const level = calculateLevel(xp);
  return xpForLevel(level);
}
