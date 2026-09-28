import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { z } from 'zod';
import { supabaseServer } from '@/lib/supabase-server';
import { generateToken, hashToken, cookieName } from '@/lib/room';
import { adminLoggedIn } from '@/lib/admin-auth';

export const runtime = 'nodejs';

const bodySchema = z.object({ code: z.string() });

export async function POST(req: Request) {
  const parsed = bodySchema.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json({ error: 'kode room wajib diisi' }, { status: 400 });
  }
  if (!(await adminLoggedIn())) {
    return NextResponse.json({ error: 'key tidak valid' }, { status: 401 });
  }
  const { code } = parsed.data;

  const supabase = supabaseServer();
  const room = await supabase
    .from('rooms')
    .select('code')
    .eq('code', code)
    .maybeSingle();
  if (!room.data) {
    return NextResponse.json({ error: 'kode room tidak ditemukan' }, { status: 404 });
  }

  const token = generateToken();
  await supabase
    .from('rooms')
    .update({ host_token_hash: hashToken(token) })
    .eq('code', code);

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