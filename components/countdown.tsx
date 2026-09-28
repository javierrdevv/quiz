'use client';
import { useEffect, useMemo, useRef, useState } from 'react';
import { suara } from '@/lib/suara';

export function Countdown({
  startedAt,
  durasiMs,
  color,
}: {
  startedAt?: string | null;
  durasiMs: number;
  color: string;
}) {
  const [now, setNow] = useState(() => Date.now());
  const lastSec = useRef(-1);

  const start = startedAt ? new Date(startedAt).getTime() : Date.now();
  const tersisa = useMemo(
    () => Math.max(0, Math.round((start + durasiMs - now) / 1000)),
    [start, durasiMs, now]
  );
  const persen = Math.max(0, Math.min(100, ((start + durasiMs - now) / durasiMs) * 100));

  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 100);
    return () => window.clearInterval(id);
  }, []);

  useEffect(() => {
    if (tersisa !== lastSec.current) {
      lastSec.current = tersisa;
      if (tersisa <= 5 && tersisa > 0) suara('tickUrgent');
      else if (tersisa > 0) suara('tick');
    }
  }, [tersisa]);

  const warna =
    tersisa <= 5 ? 'hsl(0 80% 50%)' : tersisa <= 10 ? 'hsl(40 90% 45%)' : color;

  const r = 54;
  const c = 2 * Math.PI * r;
  const offset = c - (persen / 100) * c;

  return (
    <div className="countdown" style={{ '--cd': warna } as React.CSSProperties}>
      <svg viewBox="0 0 128 128" className="cincin">
        <circle cx="64" cy="64" r={r} className="cincin-track" />
        <circle
          cx="64"
          cy="64"
          r={r}
          className="cincin-fill"
          strokeDasharray={c}
          strokeDashoffset={offset}
        />
      </svg>
      <span className="countdown-angka">{tersisa}</span>
    </div>
  );
}