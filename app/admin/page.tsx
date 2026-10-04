'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { unlockAudio } from '@/lib/suara';

type AksiReset = 'score' | 'clear' | 'room';

export default function AdminPage() {
  const router = useRouter();
  const [mode, setMode] = useState<'key' | 'dashboard'>('key');
  const [key, setKey] = useState('');
  const [pesan, setPesan] = useState<string | null>(null);
  const [sibuk, setSibuk] = useState(false);
  const [kodeRoom, setKodeRoom] = useState('');
  const [toast, setToast] = useState<string | null>(null);
  const [siap, setSiap] = useState(false);

  useEffect(() => {
    fetch('/api/admin/session')
      .then((res) => {
        if (res.ok) setMode('dashboard');
      })
      .catch(() => {})
      .finally(() => setSiap(true));
  }, []);

  function tunjukToast(isi: string) {
    setToast(isi);
    window.setTimeout(() => setToast(null), 2600);
  }

  async function bukaKunci() {
    unlockAudio();
    setSibuk(true);
    setPesan(null);
    try {
      const res = await fetch('/api/admin/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        setPesan(body.error ?? 'key salah');
        return;
      }
      setMode('dashboard');
      setKey('');
    } finally {
      setSibuk(false);
    }
  }

  async function buatRoom() {
    setSibuk(true);
    setPesan(null);
    try {
      const res = await fetch('/api/rooms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        setPesan(body.error ?? 'gagal membuat room');
        return;
      }
      router.push(`/host/${body.code}`);
    } finally {
      setSibuk(false);
    }
  }

  async function bukaRoom() {
    if (!kodeRoom.trim()) {
      setPesan('Isi kode room dulu');
      return;
    }
    setSibuk(true);
    setPesan(null);
    try {
      const res = await fetch('/api/admin/host', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: kodeRoom }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        setPesan(body.error ?? 'gagal membuka room');
        return;
      }
      router.push(`/host/${kodeRoom}`);
    } finally {
      setSibuk(false);
    }
  }

  async function resetRoom(aksi: AksiReset) {
    const konfirmasi =
      aksi === 'score'
        ? 'Reset skor semua pemain di semua room?'
        : aksi === 'clear'
          ? 'Hapus SEMUA pemain + log event di semua room?'
          : 'Hapus semua room beserta seluruh datanya?';
    if (!window.confirm(konfirmasi)) return;
    setSibuk(true);
    setPesan(null);
    try {
      const res = await fetch('/api/admin/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: aksi }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        setPesan(body.error ?? 'aksi gagal');
        return;
      }
      tunjukToast(
        aksi === 'score'
          ? 'Skor semua pemain direset ke 0.'
          : aksi === 'clear'
            ? 'Semua pemain + log event dihapus.'
            : 'Semua room dihapus.'
      );
    } finally {
      setSibuk(false);
    }
  }

  return (
    <main className="admin-page">
      <div className="admin-bg" aria-hidden="true" />
      <div className="admin-shell">
        {mode === 'key' ? (
          <div className="admin-login-layar">
            <div className="join-kartu">
              <h1 className="join-logo">HOST</h1>
              <p className="join-tagline">Panel Host</p>
              <input
                className="input input-kode"
                placeholder="Key admin"
                type="password"
                value={key}
                onChange={(e) => setKey(e.target.value)}
              />
              <button className="btn btn-utama" onClick={bukaKunci} disabled={sibuk}>
                Masuk
              </button>
              {pesan && <p className="error-teks">{pesan}</p>}
              <div className="btn-pisah">
                <span className="label-atas">Bukan host?</span>
                <a className="btn btn-sekunder" href="/">
                  Kembali ke halaman pemain
                </a>
              </div>
            </div>
          </div>
        ) : (
          <>
            <div className="admin-brand admin-brand-buttom">
              <span className="admin-brand-bulet">H</span>
              <div>
                <h1 className="admin-logo">Panel Host</h1>
                <p className="admin-sub">Mulai quiz baru, atau buka room yang sudah ada.</p>
              </div>
            </div>

            {pesan && <p className="error-teks">{pesan}</p>}

            <div className="admin-hero">
              <div>
                <span className="admin-hero-ikon">🚀</span>
                <p className="admin-hero-judul">Mulai Quiz Baru</p>
                <p className="admin-hero-ket">
                  Dapat kode otomatis, lalu bagikan ke pemain.
                </p>
              </div>
              <button className="hw-btn hw-btn-lampu" onClick={buatRoom} disabled={sibuk}>
                Bikin Room Baru
              </button>
            </div>

            <div className="admin-pasangan">
              <div className="admin-kartu">
                <span className="admin-badge">ROOM YANG ADA</span>
                <input
                  className="hw-input hw-input-kode"
                  placeholder="Kode room"
                  value={kodeRoom}
                  onChange={(e) => setKodeRoom(e.target.value.toUpperCase())}
                  maxLength={6}
                />
                <button className="hw-btn hw-btn-primary" onClick={bukaRoom} disabled={sibuk}>
                  Buka Room
                </button>
              </div>

              <div className="admin-kartu admin-kartu-danger">
                <span className="admin-badge admin-badge-danger">ZONA KELOLA</span>
                <p className="admin-danger-ket">
                  Aksi langsung tanpa kode room. Butuh konfirmasi sebelum dijalankan.
                </p>
                <div className="admin-stack">
                  <button
                    className="hw-btn hw-btn-pil"
                    onClick={() => resetRoom('score')}
                    disabled={sibuk}
                  >
                    ↩ Reset skor semua pemain
                  </button>
                  <button
                    className="hw-btn hw-btn-pil"
                    onClick={() => resetRoom('clear')}
                    disabled={sibuk}
                  >
                    🗑 Hapus semua pemain
                  </button>
                  <button
                    className="hw-btn hw-btn-danger"
                    onClick={() => resetRoom('room')}
                    disabled={sibuk}
                  >
                    ☠ Hapus semua room
                  </button>
                </div>
</div>
          </div>

          <a className="admin-back" href="/">
              ← Kembali ke halaman pemain
            </a>
          </>
        )}

        {toast && <div className="admin-toast">✅ {toast}</div>}
      </div>
    </main>
  );
}