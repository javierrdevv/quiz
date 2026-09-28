'use client';
import { useState } from 'react';
import { supabaseBrowser } from '@/lib/supabase-browser';

const EMOJI_LIST = ['🔥', '😂', '👏', '😱'];

export function ReaksiPemain({ code }: { code: string }) {
  const [kirim, setKirim] = useState(false);

  async function kirimEmoji(emoji: string) {
    if (kirim) return;
    setKirim(true);
    setTimeout(() => setKirim(false), 2500);
    const sb = supabaseBrowser();
    try {
      await fetch(`/api/rooms/${code}/reaction`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ emoji }),
      });
      await sb
        .channel(`room:${code}`)
        .send({ type: 'broadcast', event: 'reaction', payload: { emoji } });
    } catch {
      /* abaikan */
    }
  }

  return (
    <div className="reaksi-pemain">
      {EMOJI_LIST.map((e) => (
        <button
          key={e}
          className="reaksi-tombol"
          onClick={() => kirimEmoji(e)}
          disabled={kirim}
          aria-label={`Kirim reaksi ${e}`}
        >
          {e}
        </button>
      ))}
    </div>
  );
}