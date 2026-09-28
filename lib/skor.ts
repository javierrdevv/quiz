import 'server-only';
import { SOAL } from './soal';

export function hitungSkor(
  index: number,
  elapsedMs: number,
  durasiMs: number,
  streak: number
): number {
  const kunci = SOAL[index]?.kunci;
  if (kunci === undefined) return 0;
  const base = 1000;
  const clamp = Math.max(0, Math.min(1, 1 - elapsedMs / durasiMs));
  const speed = Math.round(500 * clamp);
  const streakBonus = Math.min(streak * 100, 300);
  return base + speed + streakBonus;
}