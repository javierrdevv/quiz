import { NextResponse } from 'next/server';
import { resolveSession } from '@/lib/auth';
import { buildState } from '@/lib/state';

export const runtime = 'nodejs';

export async function GET(_req: Request, { params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const session = await resolveSession(code);
  if (!session) {
    return NextResponse.json({ error: 'belum bergabung' }, { status: 401 });
  }
  const state =
    session.role === 'host'
      ? await buildState(code, 'host')
      : await buildState(code, 'player', session.username);
  if (!state) {
    return NextResponse.json({ error: 'room tidak ditemukan' }, { status: 404 });
  }
  return NextResponse.json(state);
}