# Website Quiz Kebijakan Publik — Desain

Status: menunggu review user
Tanggal: 2026-09-28

## Ringkasan

Website quiz gaya Kahoot untuk dipakai di kelas. 10 soal kebijakan publik
jenjang SMP/MTs. Satu host membuka room dengan kode 6 huruf, semua mahasiswa
join memakai HP dan username. Soal muncul bareng di semua layar, leaderboard
naik tiap detik, jawaban benar baru tampil setelah timer habis.

Deploy ke Vercel. Penyimpanan di Supabase (Postgres + Realtime).

## Keputusan desain

| Pertanyaan | Keputusan | Alasan |
| --- | --- | --- |
| Mode main | Multiplayer real-time ala Kahoot | Dipakai di kelas, paling seru |
| Sumber soal | Hardcoded, disusun di satu file | Nol moving part, tidak butuh admin UI |
| Topik | Kebijakan publik, 10 soal | Untuk tugas matkul |
| Backend realtime | Supabase Realtime (Broadcast) | Gratis, jawaban benar tidak bocor ke HP |
| Skor | 1000 + speed bonus + streak | Makin cepat dan beruntun, makin tinggi |
| Jawaban benar | Tampil setelah waktu habis | Sesuai permintaan |

Tidak dipakai: Firebase, polling, admin panel, tabel soal, user auth.

## Layar

| Route | Siapa | Isi |
| --- | --- | --- |
| `/` | Semua orang | Input username, input kode room, tombol Gabung |
| `/host/[code]` | Host | Kode room besar, jumlah pemain, tombol Mulai dan Lanjut, layar soal lengkap dengan kunci, leaderboard, timer besar |
| `/play/[code]` | Pemain | Nama, tombol pilihan jawaban, countdown, status sudah menjawab |

Layar host dan pemain memakai komponen soal yang sama dengan
`variant: 'host' | 'player'`. Bedanya hanya host yang melihat kunci jawaban,
timer, dan leaderboard. Ini mencegah duplikasi dan layar yang tidak sinkron.

## Alur satu soal (20 detik)

```
Host menekan Lanjut
  -> POST /api/rooms/{code}/advance
  -> server set status='playing', current_index=N, question_started_at=now
  -> host client broadcast event 'sync'
  -> pemain terima 'sync', lalu GET /api/rooms/{code}/state
  -> server MEMBUANG kunci jawaban selama status='playing'
  -> semua render soal, hitung deadline dari server_now + offset jam lokal

20 detik habis, host menekan Lanjut
  -> server set status='reveal'
  -> semua GET state, kali ini kunci dan pembahasan ikut
  -> animasi reveal, konfetti bila benar

5 detik, host menekan Lanjut
  -> index naik satu, atau status='done' di soal terakhir
```

## Arsitektur realtime

Broadcast, bukan `postgres_changes`. Broadcast hanya memberi tahu "ada
perubahan", lalu klien menarik data asli dari server. Jadi channel tidak
mahal, dan broadcast palsu tidak merusak apa pun.

```
channel: room:{CODE}
  event 'sync'  -> tanpa payload, hanya pemicu fetch
```

Auto-advance tanpa host. Kalau proyektor mati, game tidak boleh macet.
`POST /advance` diterima dari klien mana pun bila waktu sudah lewat
`question_started_at + 25000ms`, dan bersifat idempoten sehingga permintaan
yang datang belakangan jadi no-op. Skor di-collapse dengan
`reason: 'host' | 'timeout'` supaya mudah di-debug.

## Kredensial

| Cookie | Diberi ke | Dipakai untuk |
| --- | --- | --- |
| `q_host_{CODE}` | pembuat room | `POST /advance`, dan `GET /state` versi penuh |
| `q_player_{CODE}` | pemain | `POST /answer`, `GET /state` |

`POST /rooms` membuat room dan memberi cookie host. `POST /rooms/{code}/join`
memeriksa kode, menolak username duplikat dengan pesan yang jelas, lalu memberi
cookie pemain. `GET /state` menolak pemain yang belum join.

Kunci jawaban tidak pernah masuk bundle klien. File `soal.ts` diberi
`import 'server-only'`. Kalau ada yang salah import, build gagal, bukan bocor
saat runtime. Ini jaminan build-time, bukan sekadar disiplin.

## Skor

```
benar = 1000
      + 500 * (1 - elapsed / 20000)     // speed bonus, 0..500
      + min(streak * 100, 300)          // streak bonus, cap 300
salah = 0
```

Streak dihitung dari jawaban beruntun sebelum soal ini. Maksimal 1.800 per
soal, total 18.000 untuk 10 soal.

Skor dihitung di server saat `POST /answer`. Server adalah satu-satunya sumber
kebenaran. Kalau penilaian dilakukan di client, satu request yang dimanipulasi
bisa mengubah skor.

## Data

```sql
create table rooms (
  code            text primary key,
  host_token_hash text not null,
  status          text not null default 'lobby',
  current_index   int  not null default -1,
  question_started_at timestamptz,
  created_at      timestamptz not null default now()
);

create table players (
  room_code    text not null references rooms(code) on delete cascade,
  username     text not null,
  token_hash   text not null,
  score        int  not null default 0,
  streak       int  not null default 0,
  answers      jsonb not null default '[]'::jsonb,
  joined_at    timestamptz not null default now(),
  primary key (room_code, username)
);

create table room_events (
  room_code text not null references rooms(code) on delete cascade,
  id        bigint generated always as identity primary key,
  kind      text not null,
  q_index   int,
  payload   jsonb not null default '{}'::jsonb,
  at        timestamptz not null default now()
);
```

Cooldown 2 detik per soal ditentukan dari `room_events`. Ini menutup celah
double-click yang mengirim banyak `answer` sekaligus.

Kolom `answers` di `players` menyimpan jawaban pada indeks soal sebagai kunci.
Sifatnya append-only, ditulis sekali saat menjawab, dibaca saat reveal.

## Yang bikin kelas ramai

Semua efek murni CSS dan Web Audio, tanpa aset eksternal dan tanpa library
tambahan.

Tegang saat menjawab
- Countdown sebagai cincin yang menyusut, hijau lalu kuning lalu merah
- Tick tiap detik, nada naik pada lima detik terakhir
- Bar "7 dari 24 sudah menjawab", ini yang membuat orang buru-buru

Bantah saat salah
- Getaran HP lewat `navigator.vibrate`, bunyi buzz, kartu soal goyang
- Benar: kilau hijau dan nada naik

Ritual dan sensasi
- Tiap soal punya tema berbeda di layar host: warna, pola latar, animasi masuk
- Konfeti di layar host saat reveal
- Podium tiga teratas dengan animasi naik ke posisi

SuaraKesemuanya memakai Web Audio API lewat oscillator, bukan file mp3. Sembilan
efek: `tick`, `tickUrgent`, `buzz`, `correct`, `reveal`, `countdown`, `fanfare`,
`join`, `start`. Nol byte unduhan.

Animasi memakai `transform` dan `opacity` saja, tidak menyentuh `width`,
`height`, atau `top`, supaya tetap 60fps di HP murah.

## Struktur folder

```
app/
  layout.tsx            root layout, font, metadata
  page.tsx              join: username + kode room
  host/[code]/page.tsx  layar host
  play/[code]/page.tsx  layar pemain
  api/rooms/route.ts            POST buat room
  api/rooms/[code]/join/route.ts   POST gabung
  api/rooms/[code]/state/route.ts  GET state
  api/rooms/[code]/answer/route.ts POST jawab
  api/rooms/[code]/advance/route.ts POST lanjut
lib/
  soal.ts               10 soal + kunci + pembahasan. import 'server-only'
  supabase-server.ts    createClient dengan service role
  supabase-browser.ts   createClient untuk browser, anon key
  room.ts              token, cookie, hashing
  skor.ts              rumus skor, dipanggil server
components/
  soal-view.tsx         soal + timer, variant host/player
  leaderboard.tsx
  podium.tsx
  countdown.tsx
  confetti.tsx
  tombol-suara.tsx      tombol unlock Web Audio
```

## Library

| Paket | Untuk apa |
| --- | --- |
| `next` | App Router, API routes, deploy ke Vercel |
| `react`, `react-dom` | UI |
| `@supabase/supabase-js` | query Postgres dan channel realtime |
| `zod` | validasi input API route |
| `typescript`, `@types/*` | tipe |

Tanpa Tailwind, tanpa Framer Motion, tanpa library UI. CSS biasa di
`app/globals.css` dengan custom property. Alasannya: efek visual di sini
cukup dengan keyframe, dan menambah dependency berarti menambah bisa gagal
saat deploy.

## Kasus tepi

- Host yang menekan Lanjut terlalu cepat sebelum reveal selesai. Server
  menolak `advance` kalau `status='playing'` dan timer belum habis, kecuali
  Through `reason: 'timeout'`
- Pemain join di tengah quiz. Diizinkan, akan mendapat soal yang sedang
  berjalan lewat `GET /state`
- Late join, pemain belum menjawab soal-soal sebelumnya, current_index menentukan
  dari mana backstory dimulai
- Koneksi putus. Klien retry `GET /state` tiap 2 detik, dan `Broadcast`
  hanya pemicu jadi data tetap benar setelah reconnect
- Refresh di tengah soal. State ada di server, jadi tinggal diambil lagi
- Dua host menekan Lanjut barengan. `advance` idempoten, yang kedua no-op

## Deploy

Vercel, tanpa konfigurasi khusus.syarat hanya tiga environment variable
`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, dan
`SUPABASE_SERVICE_ROLE_KEY`. Service role hanya dipakai di server route dan
tidak boleh punya prefix `NEXT_PUBLIC_`.

Tabel dibuat lewat SQL Editor di dashboard Supabase, bukan lewat migration
otomatis, karena proyek ini tidak memakai tool migrasi.

## Verifikasi

- `npm run build` harus lulus, termasuk gagal keras kalau `soal.ts` sampai
  ter-import di komponen klien
- Satu pemain joins dengan dua browser, satu jadi host satu jadi pemain
- Jalankan `GET /state` dengan cookie pemain saat `status='playing'`, jawaban
  benar harus tidak ada di response
- Akses `/play/[code]` tanpa cookie, harus dapat 401
- DevTools HP, buka tab Network, kunci jawaban tidak boleh muncul saat status
  masih `playing`


