'use client';
import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { unlockAudio } from '@/lib/suara';

export default function JoinPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [kode, setKode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [sibuk, setSibuk] = useState(false);

  async function gabung(e: FormEvent) {
    e.preventDefault();
    unlockAudio();
    if (!username.trim()) {
      setError('masukkan dulu nama kamu');
      return;
    }
    if (!kode.trim()) {
      setError('masukkan kode room');
      return;
    }
    setSibuk(true);
    setError(null);
    try {
      const res = await fetch(`/api/rooms/${kode.trim().toUpperCase()}/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: username.trim() }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body.error ?? 'gagal bergabung');
      router.push(`/play/${kode.trim().toUpperCase()}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'gagal bergabung');
    } finally {
      setSibuk(false);
    }
  }

  return (
    <main className="join-layar">
      <div className="join-kartu">
        <h1 className="join-logo">Quiz</h1>
        <p className="join-tagline">Kebijakan Publik</p>

        <form onSubmit={gabung}>
          <input
            className="input"
            placeholder="Nama kamu"
            value={username}
            maxLength={24}
            onChange={(e) => setUsername(e.target.value)}
            autoComplete="off"
          />
          <input
            className="input input-kode"
            placeholder="Kode Room"
            value={kode}
            onChange={(e) => setKode(e.target.value.toUpperCase())}
            maxLength={6}
          />
          <button className="btn btn-utama" disabled={sibuk}>
            Gabung
          </button>
        </form>

        {error && <p className="error-teks">{error}</p>}
      </div>
    </main>
  );
}