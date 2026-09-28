import { NextResponse } from 'next/server';
import { z } from 'zod';
import { resolveSession } from '@/lib/auth';
import { supabaseServer } from '@/lib/supabase-server';
import { SOAL } from '@/lib/soal';
import { hitungSkor } from '@/lib/skor';

export const runtime = 'nodejs';

const bodySchema = z.object({
  index: z.number().int(),
  answer: z.number().int().min(0).max(3),
});

export async function POST(req: Request, { params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const session = await resolveSession(code);
  if (!session || session.role !== 'player') {
    return NextResponse.json({ error: 'bukan pemain' }, { status: 403 });
  }

  const parsed = bodySchema.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json({ error: 'jawaban tidak valid' }, { status: 400 });
  }
  const { index, answer } = parsed.data;

  const supabase = supabaseServer();
  const room = await supabase
    .from('rooms')
    .select('status, current_index, question_started_at')
    .eq('code', code)
    .maybeSingle();
  if (!room.data) {
    return NextResponse.json({ error: 'room tidak ditemukan' }, { status: 404 });
  }
  if (room.data.status !== 'playing' || room.data.current_index !== index) {
    return NextResponse.json({ error: 'soal belum aktif' }, { status: 409 });
  }

  const soal = SOAL[index];
  if (!soal) {
    return NextResponse.json({ error: 'soal tidak ada' }, { status: 404 });
  }
  if (!room.data.question_started_at) {
    return NextResponse.json({ error: 'soal belum aktif' }, { status: 409 });
  }

  const elapsedMs = Date.now() - new Date(room.data.question_started_at).getTime();
  if (elapsedMs > soal.durasiMs + 500) {
    return NextResponse.json({ error: 'waktu habis' }, { status: 409 });
  }

  const me = await supabase
    .from('players')
    .select('streak, score')
    .eq('room_code', code)
    .eq('username', session.username)
    .maybeSingle();
  if (!me.data) {
    return NextResponse.json({ error: 'bukan pemain' }, { status: 403 });
  }

  const benar = answer === soal.kunci;
  const streak = me.data.streak;
  const points = benar ? Math.round(hitungSkor(index, elapsedMs, soal.durasiMs, streak)) : 0;
  const nextStreak = benar ? streak + 1 : 0;

  const { data: claimed, error } = await supabase.rpc('claim_answer', {
    p_room: code,
    p_username: session.username,
    p_q_index: index,
    p_answer: answer,
    p_new_score: points,
    p_new_streak: nextStreak,
  });
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  if (!claimed) {
    return NextResponse.json({ error: 'sudah menjawab' }, { status: 409 });
  }

  return NextResponse.json({ benar, points, streak: nextStreak });
}