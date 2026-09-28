'use client';
import type { StateApi } from '@/lib/state-api';
import { Countdown } from './countdown';

const TEMA_CLASS: Record<string, string> = {
  biru: 'tema-biru',
  hijau: 'tema-hijau',
  ungu: 'tema-ungu',
  oranye: 'tema-oranye',
  merah: 'tema-merah',
  toska: 'tema-toska',
  pink: 'tema-pink',
  kuning: 'tema-kuning',
  navy: 'tema-navy',
  teal: 'tema-teal',
};

function warnaTema(tema: string): string {
  return (
    {
      biru: 'hsl(210 80% 45%)',
      hijau: 'hsl(140 65% 40%)',
      ungu: 'hsl(270 65% 45%)',
      oranye: 'hsl(25 85% 45%)',
      merah: 'hsl(0 75% 45%)',
      toska: 'hsl(180 60% 40%)',
      pink: 'hsl(330 70% 45%)',
      kuning: 'hsl(45 90% 38%)',
      navy: 'hsl(225 70% 35%)',
      teal: 'hsl(160 60% 40%)',
    }[tema] ?? 'hsl(210 80% 45%)'
  );
}

export function SoalView({
  state,
  role,
  onAnswer,
  answered = false,
}: {
  state: StateApi;
  role: 'host' | 'player';
  onAnswer?: (index: number) => void;
  answered?: boolean;
}) {
  const soal = state.soal;
  const tema = soal?.tema ?? 'biru';
  const color = warnaTema(tema);
  const reveal = state.status === 'reveal';

  return (
    <div className={`layar-soal ${TEMA_CLASS[tema]}`}>
      <header className="soal-header">
        <span className="soal-nomor">Soal {state.current_index + 1}/{state.total}</span>
      </header>

      <p className="soal-teks">{soal?.teks}</p>

      <div className="opsi-grid">
        {soal?.opsi.map((opsi, i) => {
          const isKunci = state.kunci === i;
          const isPilihan = state.my_answer === i;
let kelas = `opsi-${'abcd'[i] ?? 'a'}`;
    if (reveal && isKunci) kelas += ' opsi-benar';
    else if (role === 'player' && isPilihan && reveal) kelas += ' opsi-salah';
    else if (role === 'player' && isPilihan) kelas += ' opsi-terpilih';
          return (
            <button
              key={i}
              className={`opsi ${kelas}`}
              disabled={role === 'host' || answered || (reveal && role === 'player')}
              onClick={() => {
                if (reveal && role === 'player') return;
                onAnswer?.(i);
              }}
            >
              <span className="opsi-label">{['A', 'B', 'C', 'D'][i]}</span>
              <span className="opsi-teks">{opsi}</span>
            </button>
          );
        })}
      </div>

{state.status === 'playing' && soal?.durasiMs && (
<Countdown
startedAt={state.question_started_at}
durasiMs={soal.durasiMs}
color={color}
/>
)}

      {role === 'host' && state.status === 'reveal' && (
        <p className="reveal-hint">Tekan Lanjut untuk soal berikutnya</p>
      )}

      {role === 'player' && answered && state.status === 'playing' && (
        <p className="sudah-menjawab">Jawaban terkirim, tunggu yang lain…</p>
      )}

      {state.status === 'reveal' && state.pembahasan && (
        <div className="pembahasan">
          <span className="kunci-chip">
            Jawaban: {['A', 'B', 'C', 'D'][state.kunci ?? 0]}
          </span>
          <p>{state.pembahasan}</p>
        </div>
      )}
    </div>
  );
}