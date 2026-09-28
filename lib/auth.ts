import 'server-only';
import { cookies } from 'next/headers';
import { supabaseServer } from './supabase-server';
import { hashToken, cookieName } from './room';

export type Session =
  | { role: 'host' }
  | { role: 'player'; username: string }
  | null;

export async function resolveSession(code: string): Promise<Session> {
  const jar = await cookies();
  const supabase = supabaseServer();

  const hostToken = jar.get(cookieName('host', code))?.value;
  if (hostToken) {
    const room = await supabase
      .from('rooms')
      .select('host_token_hash')
      .eq('code', code)
      .eq('host_token_hash', hashToken(hostToken))
      .maybeSingle();
    if (room.data) return { role: 'host' };
  }

  const playerToken = jar.get(cookieName('player', code))?.value;
  if (playerToken) {
    const player = await supabase
      .from('players')
      .select('username')
      .eq('room_code', code)
      .eq('token_hash', hashToken(playerToken))
      .maybeSingle();
    if (player.data) return { role: 'player', username: player.data.username };
  }

  return null;
}