import 'server-only';
import { SOAL } from './soal';
import { supabaseServer } from './supabase-server';

export type StatusRoom = 'lobby' | 'playing' | 'reveal' | 'done';

export async function buildState(
  code: string,
  role: 'host' | 'player',
  selfUsername?: string
) {
  const supabase = supabaseServer();

  const [roomRes, playersRes, eventsRes] = await Promise.all([
    supabase.from('rooms').select('*').eq('code', code).maybeSingle(),
    supabase
      .from('players')
      .select('username, score, streak, answers, joined_at')
      .eq('room_code', code)
      .order('score', { ascending: false }),
    supabase
      .from('room_events')
      .select('kind')
      .eq('room_code', code)
      .eq('kind', 'reveal')
      .order('id', { ascending: true }),
  ]);

  const room = roomRes.data;
  if (!room) return null;

  const status = room.status as StatusRoom;
  const index = room.current_index;
  const soal = index >= 0 && index < SOAL.length ? SOAL[index] : undefined;
  const players = playersRes.data ?? [];
  const answeredCount =
    status === 'playing'
      ? players.filter((p) => p.answers && p.answers[index] !== undefined).length
      : 0;

  const podium = players.slice(0, 3).map((p) => ({ username: p.username, score: p.score }));

  const self = selfUsername ? players.find((p) => p.username === selfUsername) : undefined;
  const myUsernamePart = role === 'player' && self
    ? { my_username: self.username, score: self.score, streak: self.streak }
    : {};

  const base = {
    code,
    status,
    current_index: index,
    total: SOAL.length,
    server_now: new Date().toISOString(),
    players_count: players.length,
    answered_count: answeredCount,
    leaderboard: players.map((p) => ({
      username: p.username,
      score: p.score,
      streak: p.streak,
      answers: p.answers ?? {},
      joined_at: p.joined_at,
    })),
    podium,
  };

  if (status === 'lobby' || status === 'done') {
    return { ...base, ...myUsernamePart };
  }
  const myAnswer =
    self && soal ? (self.answers?.[index] as number | undefined) : undefined;

  const common = {
    ...base,
    soal: soal
      ? {
          index,
          teks: soal.teks,
          opsi: soal.opsi,
          durasiMs: soal.durasiMs,
          tema: soal.tema,
        }
      : undefined,
    question_started_at: room.question_started_at,
    my_answer: myAnswer ?? null,
    my_username: self?.username,
  };

  const showKunci = role === 'host' || status === 'reveal';
  const kunciPart = showKunci && soal
    ? { kunci: soal.kunci, pembahasan: soal.pembahasan }
    : {};

  const selfPart =
    role === 'player' && self
      ? { score: self.score, streak: self.streak }
      : {};

  return { ...common, ...kunciPart, ...selfPart };
}