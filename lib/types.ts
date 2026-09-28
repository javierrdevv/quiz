export type Database = {
  public: {
    Tables: {
      rooms: {
        Row: {
          code: string;
          host_token_hash: string;
          status: 'lobby' | 'playing' | 'reveal' | 'done';
          current_index: number;
          question_started_at: string | null;
          created_at: string;
        };
        Insert: {
          code: string;
          host_token_hash: string;
          status?: Database['public']['Tables']['rooms']['Row']['status'];
          current_index?: number;
          question_started_at?: string | null;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['rooms']['Insert']>;
        Relationships: [];
      };
      players: {
        Row: {
          room_code: string;
          username: string;
          token_hash: string;
          score: number;
          streak: number;
          answers: Record<string, number>;
          joined_at: string;
        };
        Insert: {
          room_code: string;
          username: string;
          token_hash: string;
          score?: number;
          streak?: number;
          answers?: Record<string, number>;
          joined_at?: string;
        };
        Update: Partial<Database['public']['Tables']['players']['Insert']>;
        Relationships: [];
      };
      room_events: {
        Row: {
          id: number;
          room_code: string;
          kind: string;
          q_index: number | null;
          payload: Record<string, unknown>;
          at: string;
        };
        Insert: {
          id?: number;
          room_code: string;
          kind: string;
          q_index?: number | null;
          payload?: Record<string, unknown>;
          at?: string;
        };
        Update: Partial<Database['public']['Tables']['room_events']['Insert']>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      claim_answer: {
        Args: {
          p_room: string;
          p_username: string;
          p_q_index: number;
          p_answer: number;
          p_new_score: number;
          p_new_streak: number;
        };
        Returns: boolean;
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};