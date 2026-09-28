import { cookies } from 'next/headers';
import { hashToken } from '@/lib/room';
import 'server-only';

export const KEY_ADMIN = process.env.ADMIN_KEY ?? 'publik';
export const ADMIN_COOKIE = 'q_admin';

export function adminCookieValue(): string {
  return hashToken(`admin:${KEY_ADMIN}`);
}

export async function adminLoggedIn(): Promise<boolean> {
  const jar = await cookies();
  return jar.get(ADMIN_COOKIE)?.value === adminCookieValue();
}

export async function cocokkanKeyAdmin(key: unknown): Promise<boolean> {
  return (
    typeof key === 'string' &&
    key.trim().toLowerCase() === KEY_ADMIN.toLowerCase()
  );
}