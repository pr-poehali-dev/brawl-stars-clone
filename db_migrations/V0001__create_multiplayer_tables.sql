
CREATE TABLE t_p82308312_brawl_stars_clone.players (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  trophies INT NOT NULL DEFAULT 1000,
  wins INT NOT NULL DEFAULT 0,
  losses INT NOT NULL DEFAULT 0,
  level INT NOT NULL DEFAULT 1,
  xp INT NOT NULL DEFAULT 0,
  coins INT NOT NULL DEFAULT 5000,
  crystals INT NOT NULL DEFAULT 500,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE t_p82308312_brawl_stars_clone.matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player1_id UUID REFERENCES t_p82308312_brawl_stars_clone.players(id),
  player2_id UUID REFERENCES t_p82308312_brawl_stars_clone.players(id),
  player1_character TEXT NOT NULL,
  player2_character TEXT,
  player1_hp INT NOT NULL DEFAULT 0,
  player2_hp INT NOT NULL DEFAULT 0,
  player1_hp_max INT NOT NULL DEFAULT 0,
  player2_hp_max INT NOT NULL DEFAULT 0,
  current_turn UUID,
  status TEXT NOT NULL DEFAULT 'waiting',
  winner_id UUID REFERENCES t_p82308312_brawl_stars_clone.players(id),
  turn_count INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE t_p82308312_brawl_stars_clone.battle_actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id UUID NOT NULL REFERENCES t_p82308312_brawl_stars_clone.matches(id),
  player_id UUID NOT NULL REFERENCES t_p82308312_brawl_stars_clone.players(id),
  action TEXT NOT NULL,
  damage INT NOT NULL DEFAULT 0,
  heal INT NOT NULL DEFAULT 0,
  description TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_matches_status ON t_p82308312_brawl_stars_clone.matches(status);
CREATE INDEX idx_matches_p1 ON t_p82308312_brawl_stars_clone.matches(player1_id);
CREATE INDEX idx_matches_p2 ON t_p82308312_brawl_stars_clone.matches(player2_id);
CREATE INDEX idx_battle_actions_match ON t_p82308312_brawl_stars_clone.battle_actions(match_id);
