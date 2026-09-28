import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { z } from 'zod';
import { supabaseServer } from '@/lib/supabase-server';
import { generateToken, hashToken, cookieName } from '@/lib/room';

export const runtime = 'nodejs';

const bodySchema = z.object({ username: z.string().trim().min(1).max(24) });

export async function POST(_req: Request, { params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const parsed = bodySchema.safeParse(await _req.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json({ error: 'nama tidak valid' }, { status: 400 });
  }
  const username = parsed.data.username;

  const supabase = supabaseServer();
  const room = await supabase
    .from('rooms')
    .select('code')
    .eq('code', code)
    .maybeSingle();
  if (!room.data) {
    return NextResponse.json({ error: 'kode room tidak ditemukan' }, { status: 404 });
  }

  const duplicate = await supabase
    .from('players')
    .select('username')
    .eq('room_code', code)
    .eq('username', username)
    .maybeSingle();
  if (duplicate.data) {
    return NextResponse.json(
      { error: 'nama sudah dipakai, pilih yang lain' },
      { status: 409 }
    );
  }

  const token = generateToken();
  const { error } = await supabase.from('players').insert({
    room_code: code,
    username,
    token_hash: hashToken(token),
  });
  if (error) {
    return NextResponse.json({ error: 'gagal bergabung' }, { status: 500 });
  }

  const jar = await cookies();
  jar.set(cookieName('player', code), token, {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 3,
    secure: process.env.NODE_ENV === "production",
  });

  return NextResponse.json({ username });
}