import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { supabaseServer } from '@/lib/supabase-server';
import { generateRoomCode, generateToken, hashToken, cookieName } from '@/lib/room';
import { adminLoggedIn } from '@/lib/admin-auth';

export const runtime = 'nodejs';

export async function POST() {
  if (!(await adminLoggedIn())) {
    return NextResponse.json({ error: 'key tidak valid' }, { status: 401 });
  }

  const supabase = supabaseServer();
  const code = generateRoomCode();
  const token = generateToken();

  const { error } = await supabase.from('rooms').insert({
    code,
    host_token_hash: hashToken(token),
  });
  if (error) {
    return NextResponse.json({ error: 'gagal membuat room' }, { status: 500 });
  }

  const jar = await cookies();
  jar.set(cookieName('host', code), token, {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 3,
    secure: process.env.NODE_ENV === 'production',
  });

  return NextResponse.json({ code });
}