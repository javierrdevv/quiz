import { NextResponse } from 'next/server';
import { z } from 'zod';
import { supabaseServer } from '@/lib/supabase-server';
import { adminLoggedIn } from '@/lib/admin-auth';

export const runtime = 'nodejs';

const bodySchema = z.object({
  action: z.enum(['score', 'clear', 'room']),
});

export async function POST(
  req: Request,
  { params }: { params: Promise<{ code: string }> }
) {
  const parsed = bodySchema.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json({ error: 'aksi tidak valid' }, { status: 400 });
  }
  if (!(await adminLoggedIn())) {
    return NextResponse.json({ error: 'key tidak valid' }, { status: 401 });
  }
  const { code } = await params;
  const roomCode = code.toUpperCase();

  const sb = supabaseServer();
  const { data: room } = await sb.from('rooms').select('code').eq('code', roomCode).maybeSingle();
  if (!room) {
    return NextResponse.json({ error: 'room tidak ditemukan' }, { status: 404 });
  }

  let error;
  if (parsed.data.action === 'score') {
    const { error: e } = await sb
      .from('players')
      .update({ score: 0, streak: 0, answers: {} })
      .eq('room_code', roomCode);
    error = e;
  } else if (parsed.data.action === 'clear') {
    const { error: e } = await sb.from('players').delete().eq('room_code', roomCode);
    error = e;
  } else {
    const { error: e } = await sb
      .from('room_events')
      .delete()
      .eq('room_code', roomCode);
    error = e;
    if (!error) {
      const { error: roomErr2 } = await sb.from('rooms').delete().eq('code', roomCode);
      error = roomErr2;
    }
  }
  if (error) {
    return NextResponse.json({ error: 'gagal menjalankan reset' }, { status: 500 });
  }

  if (parsed.data.action !== 'room') {
    const { error: roomErr } = await sb
      .from('rooms')
      .update({ status: 'lobby', current_index: -1, question_started_at: null })
      .eq('code', roomCode);
    if (roomErr) {
      return NextResponse.json({ error: 'gagal reset room' }, { status: 500 });
    }
  }

  return NextResponse.json({ ok: true });
}