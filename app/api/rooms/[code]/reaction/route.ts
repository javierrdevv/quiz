import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase-server';
import { resolveSession } from '@/lib/auth';

export async function POST(
  req: Request,
  { params }: { params: Promise<{ code: string }> }
) {
  const { code } = await params;
  const roomCode = code.toUpperCase();
  const session = await resolveSession(roomCode);
  if (!session || session.role !== 'player') {
    return NextResponse.json({ error: 'Belum join sebagai pemain' }, { status: 403 });
  }
  const body = await req.json().catch(() => ({}));
  const emoji = String(body.emoji ?? '').trim();
  if (!emoji || emoji.length > 4) {
    return NextResponse.json({ error: 'Emoji tidak valid' }, { status: 400 });
  }
  const sb = supabaseServer();
  const { error } = await sb.from('room_events').insert({
    room_code: roomCode,
    kind: 'reaction',
    payload: { username: session.username, emoji },
  });
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}