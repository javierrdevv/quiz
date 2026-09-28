export type StateApi = {
  code: string;
  status: 'lobby' | 'playing' | 'reveal' | 'done';
  current_index: number;
  total: number;
  server_now: string;
  players_count: number;
  answered_count: number;
  soal?: {
    index: number;
    teks: string;
    opsi: string[];
    durasiMs: number;
    tema: string;
  };
  question_started_at?: string | null;
  kunci?: 0 | 1 | 2 | 3;
  pembahasan?: string;
  my_answer?: number | null;
  my_username?: string;
  score?: number;
  streak?: number;
  leaderboard: {
    username: string;
    score: number;
    streak: number;
    answers: Record<string, number>;
    joined_at: string;
  }[];
  podium: {
    username: string;
    score: number;
  }[];
};