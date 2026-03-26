import Icon from "@/components/ui/icon";
import TopBar from "@/components/game/TopBar";
import { LEADERBOARD, CHARACTERS } from "@/data/gameData";

interface LeaderboardProps {
  onNavigate: (screen: string) => void;
}

const Leaderboard = ({ onNavigate }: LeaderboardProps) => {
  const getCharEmoji = (name: string) => {
    const c = CHARACTERS.find(c => c.name === name);
    return c ? c.emoji : "⚔️";
  };

  const rankStyle = (rank: number) => {
    if (rank === 1) return { color: "#fbbf24", label: "🥇" };
    if (rank === 2) return { color: "#9ca3af", label: "🥈" };
    if (rank === 3) return { color: "#cd7f32", label: "🥉" };
    return { color: "#6b7280", label: `#${rank}` };
  };

  return (
    <div className="min-h-screen animated-bg">
      <TopBar onNavigate={onNavigate} currentScreen="leaderboard" />

      <div className="pt-16 pb-6 px-4 max-w-2xl mx-auto">

        {/* Заголовок */}
        <div className="text-center mb-6 animate-fade-scale-in">
          <h1 className="font-orbitron font-black text-2xl md:text-3xl tracking-wider text-white">ТАБЛИЦА ЛИДЕРОВ</h1>
          <p className="font-exo text-muted-foreground text-sm mt-1">Сезон 7 · Обновляется каждые 24 часа</p>
        </div>

        {/* Топ-3 пьедестал */}
        <div className="flex items-end justify-center gap-4 mb-6 animate-slide-in-bottom delay-100">
          {/* 2 место */}
          <div className="text-center animate-slide-in-left">
            <div className="w-16 h-16 rounded-full flex items-center justify-center text-3xl mx-auto mb-2"
              style={{ background: "rgba(156,163,175,0.2)", border: "2px solid rgba(156,163,175,0.5)" }}>
              {getCharEmoji(LEADERBOARD[1].character)}
            </div>
            <div className="font-orbitron font-bold text-xs text-gray-400 mb-1 truncate max-w-[70px]">{LEADERBOARD[1].name}</div>
            <div className="font-exo text-xs text-muted-foreground">{LEADERBOARD[1].trophies.toLocaleString()} 🏆</div>
            <div className="mt-2 rounded-t-xl py-4 px-3" style={{ background: "rgba(156,163,175,0.1)", border: "1px solid rgba(156,163,175,0.2)", minHeight: "60px" }}>
              <div className="font-orbitron font-black text-2xl text-gray-400">🥈</div>
            </div>
          </div>

          {/* 1 место */}
          <div className="text-center animate-slide-in-bottom">
            <div className="w-20 h-20 rounded-full flex items-center justify-center text-4xl mx-auto mb-2 animate-pulse-glow"
              style={{ background: "rgba(251,191,36,0.2)", border: "2px solid rgba(251,191,36,0.7)", boxShadow: "0 0 20px rgba(251,191,36,0.4)" }}>
              {getCharEmoji(LEADERBOARD[0].character)}
            </div>
            <div className="font-orbitron font-bold text-sm text-yellow-400 mb-1 truncate max-w-[90px]">{LEADERBOARD[0].name}</div>
            <div className="font-exo text-xs text-yellow-600">{LEADERBOARD[0].trophies.toLocaleString()} 🏆</div>
            <div className="mt-2 rounded-t-xl py-6 px-4" style={{ background: "rgba(251,191,36,0.1)", border: "1px solid rgba(251,191,36,0.3)", minHeight: "90px" }}>
              <div className="font-orbitron font-black text-3xl text-yellow-400">🥇</div>
            </div>
          </div>

          {/* 3 место */}
          <div className="text-center animate-slide-in-right">
            <div className="w-16 h-16 rounded-full flex items-center justify-center text-3xl mx-auto mb-2"
              style={{ background: "rgba(205,127,50,0.2)", border: "2px solid rgba(205,127,50,0.5)" }}>
              {getCharEmoji(LEADERBOARD[2].character)}
            </div>
            <div className="font-orbitron font-bold text-xs text-amber-600 mb-1 truncate max-w-[70px]">{LEADERBOARD[2].name}</div>
            <div className="font-exo text-xs text-muted-foreground">{LEADERBOARD[2].trophies.toLocaleString()} 🏆</div>
            <div className="mt-2 rounded-t-xl py-4 px-3" style={{ background: "rgba(205,127,50,0.1)", border: "1px solid rgba(205,127,50,0.2)", minHeight: "45px" }}>
              <div className="font-orbitron font-black text-2xl text-amber-700">🥉</div>
            </div>
          </div>
        </div>

        {/* Полный список */}
        <div className="space-y-2 animate-slide-in-bottom delay-300">
          {LEADERBOARD.map((player, i) => {
            const rs = rankStyle(player.rank);
            return (
              <div key={player.rank}
                className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 hover:scale-[1.01]"
                style={{
                  background: player.isMe ? "rgba(0,212,255,0.08)" : "rgba(255,255,255,0.03)",
                  border: player.isMe ? "1px solid rgba(0,212,255,0.4)" : "1px solid rgba(255,255,255,0.06)",
                  animationDelay: `${0.05 * i}s`,
                }}>
                
                {/* Ранг */}
                <div className="w-8 text-center">
                  <span className="font-orbitron font-bold text-sm" style={{ color: rs.color }}>
                    {rs.label}
                  </span>
                </div>

                {/* Персонаж-аватар */}
                <div className="w-10 h-10 rounded-full flex items-center justify-center text-xl flex-shrink-0"
                  style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.12)" }}>
                  {getCharEmoji(player.character)}
                </div>

                {/* Инфо */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className={`font-orbitron font-bold text-sm ${player.isMe ? "text-cyan-400" : "text-white"}`}>
                      {player.country} {player.name}
                    </span>
                    {player.isMe && (
                      <span className="font-exo text-xs px-2 py-0.5 rounded-full text-cyan-400"
                        style={{ background: "rgba(0,212,255,0.15)", border: "1px solid rgba(0,212,255,0.3)" }}>
                        ВЫ
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 mt-0.5">
                    <span className="font-exo text-xs text-muted-foreground">Ур. {player.level}</span>
                    <span className="font-exo text-xs text-muted-foreground">{player.wins} побед</span>
                    <span className="font-exo text-xs text-green-400">{player.winrate}% WR</span>
                  </div>
                </div>

                {/* Трофеи */}
                <div className="text-right flex-shrink-0">
                  <div className="font-orbitron font-bold text-sm text-yellow-400">{player.trophies.toLocaleString()}</div>
                  <div className="font-exo text-xs text-muted-foreground">🏆</div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex gap-3 mt-4">
          <button className="btn-primary flex-1 py-3 rounded-xl text-sm" onClick={() => onNavigate("character-select")}>
            ⚔️ В БОЙ
          </button>
          <button className="btn-secondary flex-1 py-3 rounded-xl text-sm" onClick={() => onNavigate("menu")}>
            🏠 МЕНЮ
          </button>
        </div>
      </div>
    </div>
  );
};

export default Leaderboard;
