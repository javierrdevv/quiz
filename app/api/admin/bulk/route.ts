import { NextResponse } from 'next/server';
import { z } from 'zod';
import { supabaseServer } from '@/lib/supabase-server';
import { adminLoggedIn } from '@/lib/admin-auth';

export const runtime = 'nodejs';

const bodySchema = z.object({
  action: z.enum(['score', 'clear', 'room']),
});

export async function POST(req: Request) {
  const parsed = bodySchema.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json({ error: 'aksi tidak valid' }, { status: 400 });
  }
  if (!(await adminLoggedIn())) {
    return NextResponse.json({ error: 'key tidak valid' }, { status: 401 });
  }

  const sb = supabaseServer();
  let error;
  if (parsed.data.action === 'score') {
    const { error: e } = await sb.from('players').update({ score: 0, streak: 0, answers: {} }).neq('room_code', '');
    error = e;
  } else if (parsed.data.action === 'clear') {
    const { error: e } = await sb.from('players').delete().neq('room_code', '');
    error = e;
  } else {
    const { error: e } = await sb.from('room_events').delete().neq('id', 0);
    error = e;
    if (!error) {
      const { error: e2 } = await sb.from('rooms').delete().neq('code', '');
      error = e2;
    }
  }

  if (error) {
    return NextResponse.json({ error: 'gagal menjalankan aksi' }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}