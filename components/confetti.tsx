'use client';
import { useMemo } from 'react';

const WARNA = ['#ff5a5f', '#ffce00', '#00b8a9', '#4d96ff', '#ff8c42', '#b06ab3'];

export function Confetti({ asap = 120 }: { asap?: number }) {
  const pieces = useMemo(
    () =>
      Array.from({ length: asap }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        delay: Math.random() * 0.6,
        dur: 2.2 + Math.random() * 1.8,
        warna: WARNA[i % WARNA.length],
        rot: Math.random() * 360,
      })),
    [asap]
  );

  return (
    <div className="confetti-layer" aria-hidden>
      {pieces.map((p) => (
        <span
          key={p.id}
          className="confetti-potong"
          style={
            {
              left: `${p.left}%`,
              background: p.warna,
              animationDelay: `${p.delay}s`,
              animationDuration: `${p.dur}s`,
              transform: `rotate(${p.rot}deg)`,
            } as React.CSSProperties
          }
        />
      ))}
    </div>
  );
}