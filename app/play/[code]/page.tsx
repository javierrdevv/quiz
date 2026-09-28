'use client';
import { useCallback, useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useRoomState } from '@/lib/use-room-state';
import { SoalView } from '@/components/soal-view';
import { ReaksiPemain } from '@/components/reaksi-pemain';
import { suara, getar, unlockAudio } from '@/lib/suara';

export default function PlayPage() {
  const params = useParams<{ code: string }>();
  const code = params.code.toUpperCase();
  const { state, error, fetchState } = useRoomState(code, 'player');
  const [username, setUsername] = useState('');
  const [answered, setAnswered] = useState(false);
  const [popup, setPopup] = useState<{ benar: boolean; poin: number } | null>(null);

  useEffect(() => {
    const n = state?.my_username;
    if (n) setUsername(n);
  }, [state?.my_username]);

const kirimJawaban = useCallback(
 async (i: number) => {
 if (answered||!state||state.status !== 'playing') return;
 unlockAudio();
 setAnswered(true);
      try {
        const res = await fetch(`/api/rooms/${code}/answer`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ index: state.current_index, answer: i }),
        });
        const body = await res.json().catch(() => ({}));
        if (!res.ok) {
          setAnswered(false);
          throw new Error(body.error ?? 'gagal mengirim');
        }
const benar = body.benar === true;
      setPopup({ benar, poin: body.points ?? 0 });
      window.setTimeout(() => setPopup(null), 3000);
      if (benar) {
          suara('correct');
        } else {
          suara('buzz');
          getar([120, 60, 120]);
        }
      } catch (e) {
        setAnswered(false);
        console.error(e);
      }
    },
    [code, state, answered]
  );

  useEffect(() => {
    setAnswered(false);
    setPopup(null);
  }, [state?.current_index]);

  useEffect(() => {
    if (state?.status === 'reveal') unlockAudio();
  }, [state?.status]);

  if (error && !state) return <main className="center-screen">Room tidak ditemukan atau belum join: {error}</main>;

  if (!state) return <main className="center-screen">Menghubungkan…</main>;

  if (!username) {
    return (
      <main className="center-screen">
        <p>Kamu belum punya nama di room ini.</p>
        <a className="btn btn-utama" href="/">Kembali ke halaman awal</a>
      </main>
    );
  }

  if (state.status === 'lobby') {
    return (
      <main className="play-lobby">
        <div className="spinner-hero">Menunggu host memulai…</div>
        <p className="play-nama">Kamu: <strong>{username}</strong></p>
      </main>
    );
  }

  if (state.status === 'done') {
    const entri = state.leaderboard.find((p) => p.username === username);
    return (
      <main className="play-done">
        <h1>Selesai!</h1>
        <p className="skor-akhir">
          {entri ? `${entri.score} poin` : 'tidak ada skor'}
        </p>
        {state.podium[0]?.username === username && <p className="gelar-juara">🏆 Kamu juara!</p>}
      </main>
    );
  }

  return (
    <main className="play-live">
      <header className="play-bar">
        <span className="play-identitas">
          <strong>{username}</strong>
          {state.score !== undefined && <span className="play-skor">{state.score} poin</span>}
        </span>
        {state.status === 'playing' && <ReaksiPemain code={code} />}
      </header>
      <SoalView
        state={state}
        role="player"
        answered={answered}
        onAnswer={kirimJawaban}
      />
      {popup && (
        <div className={`popup-hasil ${popup.benar ? 'benar' : 'salah'}`} role="dialog">
          <span className="popup-ikon">{popup.benar ? '🎉' : '💥'}</span>
          <h2 className="popup-judul">{popup.benar ? 'Benar!' : 'Belum beruntung'}</h2>
          {popup.benar && <p className="popup-poin">+{popup.poin} poin</p>}
          {!popup.benar && <p className="popup-coba">Coba lagi di soal berikutnya 💪</p>}
        </div>
      )}
    </main>
  );
}