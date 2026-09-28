# AGENTS.md

Status: scaffolded from spec, not yet built/verified.

## Verifikasi

- **Build adadudake kamu**: `npm run build` dijalankan OTW user — jangan klaim
  hijau tanpa bukti.
- Jalankan `npx tsc --noEmit` dulu untuk cek tipe.
- Test run dan deploy Vercel dipegang user.

## Rangkuman sistem

Quiz multiplayer ala Kahoot untuk matkul kebijakan publik. Next.js App Router
(peta `app/`), Supabase Postgres + Realtime. Sudah menginstal: `@supabase/supabase-js`,
`zod`, `server-only`.

| Bagian | Lokasi | Catatan |
| --- | --- | --- |
| Soal (rahasia) | `lib/soal.ts` | `import 'server-only'`; 10 soal + kunci + pembahasan. JANGAN diimport dari komponen klien |
| Supabase server | `lib/supabase-server.ts` | pakai `SUPABASE_SERVICE_ROLE_KEY`, hanya route server |
| Supabase browser | `lib/supabase-browser.ts` | pakai `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` |
| Skor | `lib/skor.ts` | dihitung di server, bukan client |
| State api | `lib/state.ts` + `lib/state-api.ts` | `buildState` MENYEMBUNYIKAN `kunci` saat `status='playing'` dan role bukan host. Cek ini saat ubah. |
| Hook | `lib/use-room-state.ts` | fetch `/api/rooms/{code}/state` tiap 3s + channel broadcast `sync` |
| Suara | `lib/suara.ts` | Web Audio, perlu panggil `unlockAudio()` (produk) |

## Kontrak terpenting

- **Kunci jawaban tidak boleh bocor ke client.** `state.ts` menaruh `kunci`/
  `pembahasan` hanya saat `role='host'` atau `status='reveal'`. Jangan
  dihapus. `lib/soal.ts` di-server-only sebagai jaring pengaman build.
- **Jawaban ganda ditolak lewat RPC `public.claim_answer`** (di
  `supabase/schema.sql`). Jangan ganti jadi logika read-then-write.
- Rooms dianggap hidup di status `lobby|playing|reveal|done`; transisi di
  `app/api/rooms/[code]/advance/route.ts` (state machine). Auto-advance
  diizinkan juga dari non-host.
- Session via cookie `httpOnly`: `q_host_{CODE}` / `q_player_{CODE}` sebagai
  token; DB hanya simpan hash (`lib/auth.ts`, `lib/room.ts`).

## Setup

- `.env.local` dibutuhkan (env var ada di `.env.example`). `SUPABASE_SERVICE_ROLE_KEY`
  belum diisi — minta ke user untuk kunci service role dashboard Supabase.
- SQL schema di `supabase/schema.sql`; JADI dijalankan 1x manual di SQL Editor
  (termasuk fungsi `claim_answer`). Belum dikirim ke DB.
- Types Supabase manual di `lib/types.ts` (bukan generated) — update saat
  schema berubah.

## Env & git

Tanpa git repo — belum pernah diup. Jangan commit tanpa izin.