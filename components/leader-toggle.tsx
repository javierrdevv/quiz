'use client';
import { useState } from 'react';
import type { StateApi } from '@/lib/state-api';
import { Leaderboard } from './leaderboard';
import { suara } from '@/lib/suara';

export function LeaderToggle({ state }: { state: StateApi }) {
  const [buka, setBuka] = useState(false);
  const puncak = state.leaderboard[0];

  if (!buka) {
    return (
      <div className="leader-toggle-tebar">
        <button
          className="btn btn-sekunder leader-toggle-tombol"
          onClick={() => {
            setBuka(true);
            suara('start');
          }}
        >
<span className="leader-toggle-ikon">🏆</span>
      {puncak ? (
        <span className="leader-toggle-teks">
          <span className="leader-toggle-peringkat">Peringkat 1:</span>
          <strong>{puncak.username}</strong>
          <em className="leader-toggle-skor">{puncak.score} poin</em>
        </span>
      ) : (
        <span className="leader-toggle-teks">Belum ada skor</span>
      )}
        </button>
      </div>
    );
  }

  return (
    <div className="leader-toggle-modal">
      <button
        className="leader-toggle-tutup"
        onClick={() => setBuka(false)}
        aria-label="Tutup papan peringkat"
      >
        ✕
      </button>
      <h3 className="leader-toggle-judul">Papan Peringkat</h3>
      <Leaderboard state={state} />
    </div>
  );
}