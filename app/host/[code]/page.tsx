'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useRoomState } from '@/lib/use-room-state';
import { SoalView } from '@/components/soal-view';
import { Leaderboard } from '@/components/leaderboard';
import { LeaderToggle } from '@/components/leader-toggle';
import { Podium } from '@/components/podium';
import { Confetti } from '@/components/confetti';
import { ProgressJawaban } from '@/components/progress-jawaban';
import { suara, unlockAudio } from '@/lib/suara';

export default function HostPage() {
  const params = useParams<{ code: string }>();
  const code = params.code.toUpperCase();
  const { state, error, fetchState, broadcastSync, reactions } = useRoomState(code, 'host');
  const [sibuk, setSibuk] = useState(false);
  const [menuBuka, setMenuBuka] = useState(false);
  const [leadingNow, setLeadingNow] = useState<string | null>(null);

  const leading = state?.leaderboard[0]?.username;

  useEffect(() => {
    if (leading && leading !== leadingNow) {
      setLeadingNow(leading);
      suara('fanfare');
    }
  }, [leading, leadingNow]);

  useEffect(() => {
    if (state?.status === 'reveal') suara('reveal');
  }, [state?.status, state?.current_index]);

  async function lanjut() {
    unlockAudio();
    setSibuk(true);
    try {
      const res = await fetch(`/api/rooms/${code}/advance`, { method: 'POST' });
      await res.json().catch(() => ({}));
      broadcastSync();
      await fetchState();
    } finally {
      setSibuk(false);
    }
  }

  if (error && !state) return <main className="center-screen">Room tidak ditemukan atau belum join: {error}</main>;

  if (!state) return <main className="center-screen">Menghubungkan…</main>;

  if (state.status === 'lobby') {
    return (
      <main className="host-lobby">
        <div className="lobby-kode-blok">
          <span className="label-atas">Kode room</span>
          <h1 className="kode-besar">{state.code}</h1>
          <p className="jumlah-pemain">
            {state.players_count} pemain bergabung
          </p>
          <button className="btn btn-besar" disabled={state.players_count === 0 || sibuk} onClick={lanjut}>
            Mulai 👆
          </button>
        </div>
        <Leaderboard state={state} />
      </main>
    );
  }

  if (state.status === 'done') {
    return (
      <main className="host-done">
        <Confetti />
        <h1 className="judul-done">Selesai!</h1>
        <Podium entries={state.podium} />
        <Leaderboard state={state} />
      </main>
    );
  }

return (
  <main className="host-live">
    <header className="host-bar">
      <div className="host-bar-kiri">
        <span className="host-bar-kode">{state.code}</span>
      </div>
      <div className="host-bar-aksi">
        <LeaderToggle state={state} />
        <button className="btn btn-aksi" disabled={sibuk} onClick={lanjut}>
          {state.status === 'playing' ? 'Tutup Soal' : 'Lanjut →'}
        </button>
      </div>
      <button
        className="host-menu-tombol"
        onClick={() => setMenuBuka(true)}
        aria-label="Menu tindakan"
      >
        ☰
      </button>
    </header>
    {state.status === 'playing' && <ProgressJawaban state={state} />}
    <SoalView state={state} role="host" />
    <div className="host-aksi-dock">
      <button
        className="btn btn-aksi host-floating-aksi"
        disabled={sibuk}
        onClick={lanjut}
      >
        {state.status === 'playing' ? 'Tutup Soal' : 'Lanjut →'}
      </button>
    </div>
    {menuBuka && (
      <div className="host-menu-layer" onClick={() => setMenuBuka(false)}>
        <div className="host-menu-popup" onClick={(e) => e.stopPropagation()}>
          <button
            className="host-menu-tutup"
            onClick={() => setMenuBuka(false)}
            aria-label="Tutup menu"
          >
            ✕
          </button>
          <span className="host-menu-label">Progres Menjawab</span>
          <ProgressJawaban state={state} />
          <span className="host-menu-label">Peringkat</span>
          <LeaderToggle state={state} />
        </div>
      </div>
    )}
    <div className="reaksi-layer">
      {reactions.map((r) => (
        <span key={r.key} className="reaksi-float">
          {r.emoji}
        </span>
      ))}
    </div>
  </main>
);
}