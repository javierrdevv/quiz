'use client';
import { useMemo } from 'react';
import type { StateApi } from '@/lib/state-api';

const WARNA = ['#e0433f', '#2f6cf6', '#eeb81c', '#12a04c'];

export function ProgressJawaban({ state }: { state: StateApi }) {
  const qIndex = state.current_index;
  const total = state.players_count || 1;

  const counts = useMemo(() => {
    const c = [0, 0, 0, 0];
    for (const p of state.leaderboard) {
      const a = p.answers?.[qIndex];
      if (a !== undefined && a >= 0 && a < 4) c[a] += 1;
    }
    return c;
  }, [state.leaderboard, qIndex]);

  return (
    <div className="progress-jawaban">
      <div className="progress-jawaban-row">
        <span>Menjawab</span>
        <div className="progress-bar-wadah">
          {counts.map((n, i) => {
            const lebar = n === 0 ? 0 : Math.max(6, (n / total) * 100);
            return (
              <span
                key={i}
                className="progress-bar-isi"
                style={{ width: `${lebar}%`, background: WARNA[i] }}
              />
            );
          })}
        </div>
        <span>{state.answered_count}/{state.players_count}</span>
      </div>
    </div>
  );
}