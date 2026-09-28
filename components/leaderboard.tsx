'use client';
import { useMemo } from 'react';
import type { StateApi } from '@/lib/state-api';

export function Leaderboard({ state }: { state: StateApi }) {
  const top = useMemo(() => state.leaderboard.slice(0, 8), [state.leaderboard]);
  return (
    <ul className="leaderboard">
      {top.map((p, i) => (
        <li key={p.username} className="leader-bar">
          <span className="leader-pos">{i + 1}</span>
          <span className="leader-avatar">
            {p.username.trim().charAt(0).toUpperCase() || '•'}
          </span>
          <span className="leader-nama">{p.username}</span>
          <span className="leader-skor">{p.score}</span>
        </li>
      ))}
    </ul>
  );
}