-- Jalankan sekali di Supabase Dashboard > SQL Editor > New query > Run.
-- Idempoten: aman dijalankan berulang.

create table if not exists rooms (
  code                text primary key,
  host_token_hash     text not null,
  status              text not null default 'lobby',
  current_index       int  not null default -1,
  question_started_at timestamptz,
  created_at          timestamptz not null default now(),
  constraint rooms_status_check check (status in ('lobby','playing','reveal','done'))
);

create table if not exists players (
  room_code  text not null references rooms(code) on delete cascade,
  username   text not null,
  token_hash text not null,
  score      int  not null default 0,
  streak     int  not null default 0,
  answers    jsonb not null default '[]'::jsonb,
  joined_at  timestamptz not null default now(),
  primary key (room_code, username)
);

create index if not exists players_room_score_idx on players (room_code, score desc);

create table if not exists room_events (
  id        bigint generated always as identity primary key,
  room_code text not null references rooms(code) on delete cascade,
  kind      text not null,
  q_index   int,
  payload   jsonb not null default '{}'::jsonb,
  at        timestamptz not null default now()
);

create index if not exists room_events_room_idx on room_events (room_code, id desc);

-- Klaim jawaban secara atomik. Menolak jawaban kedua untuk soal yang sama.
create or replace function public.claim_answer(
  p_room text,
  p_username text,
  p_q_index int,
  p_answer int,
  p_new_score int,
  p_new_streak int
) returns boolean
language plpgsql as $$
declare
  v_claimed int;
begin
  update players set
    answers = answers || jsonb_build_object(p_q_index::text, p_answer),
    score   = score + p_new_score,
    streak  = p_new_streak
  where room_code = p_room
    and username = p_username
    and not (answers ? p_q_index::text);
  get diagnostics v_claimed = row_count;
  return v_claimed > 0;
end;
$$;
