'use client';
import { useEffect, useState, useCallback, useRef } from 'react';
import type { RealtimeChannel } from '@supabase/supabase-js';
import { supabaseBrowser } from '@/lib/supabase-browser';
import type { StateApi } from '@/lib/state-api';

export interface Reaksi {
  emoji: string;
  key: number;
}

export function useRoomState(code: string, role: 'host' | 'player', username?: string) {
  const [state, setState] = useState<StateApi | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [reactions, setReactions] = useState<Reaksi[]>([]);
  const channelRef = useRef<RealtimeChannel | null>(null);
  const counterRef = useRef(0);

  const tambahReaksi = useCallback((emoji: string) => {
    const key = ++counterRef.current;
    setReactions((prev) => [...prev.slice(-9), { emoji, key }]);
    setTimeout(() => {
      setReactions((prev) => prev.filter((r) => r.key !== key));
    }, 2600);
  }, []);

  const fetchState = useCallback(async () => {
    try {
      const res = await fetch(`/api/rooms/${code}/state`, { cache: 'no-store' });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        setError(body.error ?? 'gagal mengambil status');
        return;
      }
      setState((await res.json()) as StateApi);
      setError(null);
    } catch {
      setError('koneksi gagal');
    }
  }, [code]);

  useEffect(() => {
    fetchState();
    const sb = supabaseBrowser();
    const channel = sb
      .channel(`room:${code}`)
      .on('broadcast', { event: 'sync' }, () => fetchState())
      .on(
        'broadcast',
        { event: 'reaction' },
        (payload) => {
          const emoji = payload?.payload?.emoji as string | undefined;
          if (typeof emoji === 'string' && emoji) tambahReaksi(emoji);
        }
      )
      .subscribe();
    channelRef.current = channel;
    const interval = window.setInterval(fetchState, 3000);
    return () => {
      window.clearInterval(interval);
      sb.removeChannel(channel);
    };
  }, [code, fetchState, tambahReaksi]);

  const broadcastSync = useCallback(() => {
    channelRef.current?.send({ type: 'broadcast', event: 'sync' });
  }, []);

  return { state, error, fetchState, broadcastSync, reactions };
}