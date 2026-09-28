import 'server-only';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/lib/types';

let client: SupabaseClient<Database> | null = null;

export function supabaseServer(): SupabaseClient<Database> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error('SUPABASE env tidak lengkap untuk server');
  client ??= createClient<Database>(url, key, { auth: { persistSession: false } });
  return client;
}