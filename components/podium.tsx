'use client';

export function Podium({
  entries,
}: {
  entries: { username: string; score: number }[];
}) {
  if (entries.length === 0) return null;
  const bars = [
    { rank: 1, entry: entries[0], h: 0.48 },
    { rank: 2, entry: entries[1], h: 0.3 },
    { rank: 3, entry: entries[2], h: 0.18 },
  ].filter((b) => b.entry);

  return (
    <div className="podium">
      {[1, 0, 2].map((slot) => {
        const bar = bars.find((b) => b.rank === slot + 1 && b.entry);
        if (!bar) return <div key={slot} className="podium-kolom kosong" />;
        return (
          <div key={bar.entry.username} className={`podium-kolom ${bar.rank === 1 ? 'podium-pemenang' : ''}`}>
            <span className="podium-medal">{['🥇', '🥈', '🥉'][bar.rank - 1]}</span>
            <span className="podium-nama">{bar.entry.username}</span>
            <span className="podium-skor">{bar.entry.score}</span>
            <span className="podium-kotak" style={{ height: `${bar.h * 100}%` }} />
          </div>
        );
      })}
    </div>
  );
}