const URLS = {
  matchmaking: "https://functions.poehali.dev/34293e53-dcb8-4a54-a86d-22e95fbd1752",
  leaderboard: "https://functions.poehali.dev/7f5c2f1c-d9bc-4c12-bd33-c4e45ed80f8d",
  battleAction: "https://functions.poehali.dev/2fa2c8f9-98a7-4cc8-aa0b-611bfa924c9a",
};

export interface MatchState {
  match_id: string;
  player1_id: string;
  player2_id: string | null;
  player1_character: string;
  player2_character: string | null;
  player1_hp: number;
  player2_hp: number;
  player1_hp_max: number;
  player2_hp_max: number;
  current_turn: string | null;
  status: "waiting" | "active" | "finished";
  winner_id: string | null;
  turn_count: number;
  actions?: ActionLog[];
}

export interface ActionLog {
  player_name: string;
  action: string;
  damage: number;
  heal: number;
  description: string;
  time: string;
}

export interface JoinResult {
  match_id: string;
  player_id: string;
  player_number: 1 | 2;
  status: string;
}

export interface LeaderEntry {
  rank: number;
  id: string;
  name: string;
  trophies: number;
  wins: number;
  losses: number;
  level: number;
  winrate: number;
  is_me: boolean;
}

export const api = {
  async joinQueue(playerName: string, characterId: number): Promise<JoinResult> {
    const res = await fetch(URLS.matchmaking, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ player_name: playerName, character_id: characterId }),
    });
    return res.json();
  },

  async getMatch(matchId: string): Promise<MatchState> {
    const res = await fetch(`${URLS.matchmaking}?match_id=${matchId}`);
    return res.json();
  },

  async doAction(matchId: string, playerId: string, action: string): Promise<Partial<MatchState> & { description: string }> {
    const res = await fetch(URLS.battleAction, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ match_id: matchId, player_id: playerId, action }),
    });
    return res.json();
  },

  async getLeaderboard(playerId?: string): Promise<{ leaders: LeaderEntry[]; my_rank: number | null; total: number }> {
    const url = playerId ? `${URLS.leaderboard}?player_id=${playerId}` : URLS.leaderboard;
    const res = await fetch(url);
    return res.json();
  },
};
