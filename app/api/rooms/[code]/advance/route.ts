import { NextResponse } from 'next/server';
import { resolveSession } from '@/lib/auth';
import { supabaseServer } from '@/lib/supabase-server';
import { SOAL } from '@/lib/soal';

export const runtime = 'nodejs';

const REVEAL_MS = 5000;

export async function POST(_req: Request, { params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const session = await resolveSession(code);
  if (!session) throw new Error('unauthorized');

  const supabase = supabaseServer();
  const room = await supabase
    .from('rooms')
    .select('status, current_index, question_started_at')
    .eq('code', code)
    .maybeSingle();
  if (!room.data) {
    return NextResponse.json({ error: 'room tidak ditemukan' }, { status: 404 });
  }

  const status = room.data.status;
  const index = room.data.current_index;
  const started = room.data.question_started_at
    ? new Date(room.data.question_started_at).getTime()
    : 0;
  const now = Date.now();

  const durasi = index >= 0 ? SOAL[index]?.durasiMs ?? 25_000 : 25_000;

  if (status === 'done') {
    return NextResponse.json({ ok: true });
  }

  if (status === 'playing' || status === 'reveal') {
    const minElapsed = status === 'playing' ? durasi + 0 : durasi + REVEAL_MS;
    if (started && now - started < minElapsed) {
      return NextResponse.json({ error: 'belum saatnya lanjut' }, { status: 409 });
    }
  }

  let nextStatus: 'lobby' | 'playing' | 'reveal' | 'done';
  let nextIndex = index;
  let nextStarted: string | null;

  if (status === 'lobby') {
    nextStatus = 'playing';
    nextIndex = 0;
    nextStarted = new Date().toISOString();
  } else if (status === 'playing') {
    nextStatus = 'reveal';
    nextStarted = room.data.question_started_at;
  } else {
    nextIndex = index + 1;
    if (nextIndex >= SOAL.length) {
      nextStatus = 'done';
      nextStarted = null;
    } else {
      nextStatus = 'playing';
      nextStarted = new Date().toISOString();
    }
  }

  const { error } = await supabase
    .from('rooms')
    .update({
      status: nextStatus,
      current_index: nextIndex,
      question_started_at: nextStarted,
    })
    .eq('code', code);
  if (error) {
    return NextResponse.json({ error: 'gagal lanjut' }, { status: 500 });
  }

  await supabase.from('room_events').insert({
    room_code: code,
    kind: status === 'lobby' ? 'start' : 'advance',
    q_index: nextIndex >= SOAL.length ? null : nextIndex,
    payload: { from: status, to: nextStatus },
  });

  return NextResponse.json({ ok: true, status: nextStatus, current_index: nextIndex });
}