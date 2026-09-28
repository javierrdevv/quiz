import 'server-only';
import { createHash, randomBytes } from 'crypto';

export function generateRoomCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let out = '';
  for (let i = 0; i < 6; i++) out += chars[randomBytes(1)[0] % chars.length];
  return out;
}

export function generateToken(): string {
  return randomBytes(24).toString('hex');
}

export function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

export const HOST_COOKIE = 'q_host';
export const PLAYER_COOKIE = 'q_player';

export function cookieName(role: 'host' | 'player', roomCode: string): string {
  return `${role === 'host' ? HOST_COOKIE : PLAYER_COOKIE}_${roomCode}`;
}