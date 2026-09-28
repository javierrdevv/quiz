import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import {
  ADMIN_COOKIE,
  adminCookieValue,
  adminLoggedIn,
  cocokkanKeyAdmin,
} from '@/lib/admin-auth';

export async function GET() {
  if (await adminLoggedIn()) {
    return NextResponse.json({ ok: true });
  }
  return NextResponse.json({ ok: false }, { status: 401 });
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  if (!(await cocokkanKeyAdmin(body.key))) {
    return NextResponse.json({ error: 'key tidak valid' }, { status: 401 });
  }
  const jar = await cookies();
  jar.set(ADMIN_COOKIE, adminCookieValue(), {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 12,
    secure: process.env.NODE_ENV === 'production',
  });
  return NextResponse.json({ ok: true });
}