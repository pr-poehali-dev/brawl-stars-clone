import Icon from "@/components/ui/icon";
import TopBar from "@/components/game/TopBar";
import { PLAYER_DATA, CHARACTERS } from "@/data/gameData";

interface PlayerProfileProps {
  onNavigate: (screen: string) => void;
}

const PlayerProfile = ({ onNavigate }: PlayerProfileProps) => {
  const favChar = CHARACTERS.find(c => c.name === PLAYER_DATA.favoriteChar) || CHARACTERS[4];

  const achievements = [
    { icon: "🏆", name: "Первая победа", desc: "Победи в своём первом бою", done: true },
    { icon: "💀", name: "Берсерк", desc: "Выиграй 100 боёв", done: true },
    { icon: "⚡", name: "Молния", desc: "Победи за менее чем минуту", done: true },
    { icon: "🛡️", name: "Несокрушимый", desc: "Выиграй не получив урон", done: false },
    { icon: "🌟", name: "Легенда", desc: "Достигни 10,000 трофеев", done: false },
    { icon: "💎", name: "Коллекционер", desc: "Открой всех персонажей", done: false },
  ];

  const rankColors: Record<string, string> = {
    "Золото III": "#fbbf24",
    "Платина I": "#a855f7",
    "Бронза I": "#cd7f32",
  };

  return (
    <div className="min-h-screen animated-bg">
      <TopBar onNavigate={onNavigate} currentScreen="profile" />

      <div className="pt-16 pb-6 px-4 max-w-2xl mx-auto">

        {/* Шапка профиля */}
        <div className="rounded-2xl p-6 mb-4 animate-fade-scale-in relative overflow-hidden"
          style={{
            background: `linear-gradient(135deg, ${favChar.color}20, rgba(10,12,20,0.9))`,
            border: `1px solid ${favChar.color}33`,
          }}>
          
          {/* Декор */}
          <div className="absolute top-0 right-0 text-[120px] opacity-10 leading-none">{favChar.emoji}</div>

          <div className="flex items-start gap-4 relative z-10">
            {/* Аватар */}
            <div className="w-20 h-20 rounded-2xl flex items-center justify-center text-4xl flex-shrink-0"
              style={{
                background: `linear-gradient(135deg, ${favChar.color}33, ${favChar.color}11)`,
                border: `2px solid ${favChar.color}66`,
                boxShadow: `0 0 20px ${favChar.color}44`,
              }}>
              {favChar.emoji}
            </div>

            <div className="flex-1 min-w-0">
              <div className="font-orbitron font-black text-xl text-white">{PLAYER_DATA.name}</div>
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                <span className="font-rajdhani font-bold px-2 py-0.5 rounded-full text-xs"
                  style={{ background: `${rankColors[PLAYER_DATA.rank] || "#fbbf24"}22`, color: rankColors[PLAYER_DATA.rank] || "#fbbf24", border: `1px solid ${rankColors[PLAYER_DATA.rank] || "#fbbf24"}44` }}>
                  {PLAYER_DATA.rankIcon} {PLAYER_DATA.rank}
                </span>
                <span className="font-exo text-xs text-muted-foreground">Уровень {PLAYER_DATA.level}</span>
              </div>

              {/* XP Bar */}
              <div className="mt-2">
                <div className="flex justify-between text-xs mb-1">
                  <span className="font-exo text-muted-foreground">XP</span>
                  <span className="font-exo text-cyan-400">{PLAYER_DATA.xp.toLocaleString()} / {PLAYER_DATA.xpMax.toLocaleString()}</span>
                </div>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: `${(PLAYER_DATA.xp / PLAYER_DATA.xpMax) * 100}%`, background: "linear-gradient(90deg, #00d4ff, #a855f7)" }} />
                </div>
              </div>

              <div className="flex gap-3 mt-2">
                <span className="font-exo text-xs text-muted-foreground">Дата вступления: <span className="text-white">{PLAYER_DATA.joinDate}</span></span>
              </div>
            </div>
          </div>
        </div>

        {/* Главная статистика */}
        <div className="grid grid-cols-2 gap-3 mb-4 animate-slide-in-bottom delay-200">
          {[
            { label: "Трофеи", value: PLAYER_DATA.trophies.toLocaleString(), icon: "🏆", color: "#fbbf24" },
            { label: "Побед", value: PLAYER_DATA.wins, icon: "⚔️", color: "#22d3ee" },
            { label: "Поражений", value: PLAYER_DATA.losses, icon: "💀", color: "#ef4444" },
            { label: "Винрейт", value: `${PLAYER_DATA.winrate}%`, icon: "📊", color: "#a855f7" },
          ].map(s => (
            <div key={s.label} className="rounded-xl p-4 text-center"
              style={{ background: `${s.color}0f`, border: `1px solid ${s.color}22` }}>
              <div className="text-2xl mb-1">{s.icon}</div>
              <div className="font-orbitron font-bold text-lg" style={{ color: s.color }}>{s.value}</div>
              <div className="font-exo text-xs text-muted-foreground">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Дополнительная стата */}
        <div className="rounded-xl p-4 mb-4 animate-slide-in-bottom delay-300"
          style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
          <div className="font-orbitron font-bold text-xs text-muted-foreground tracking-wider mb-3">РЕКОРДЫ</div>
          <div className="space-y-2">
            {[
              { label: "Всего боёв", value: PLAYER_DATA.totalBattles, icon: "🎮" },
              { label: "Лучшая серия", value: `${PLAYER_DATA.longestWinStreak} побед подряд`, icon: "🔥" },
              { label: "Текущая серия", value: `${PLAYER_DATA.currentStreak} побед`, icon: "⚡" },
              { label: "Любимый персонаж", value: PLAYER_DATA.favoriteChar, icon: favChar.emoji },
            ].map(r => (
              <div key={r.label} className="flex items-center justify-between py-1.5"
                style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                <div className="flex items-center gap-2">
                  <span className="text-sm">{r.icon}</span>
                  <span className="font-exo text-sm text-muted-foreground">{r.label}</span>
                </div>
                <span className="font-orbitron font-bold text-sm text-white">{r.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Достижения */}
        <div className="animate-slide-in-bottom delay-400">
          <div className="font-orbitron font-bold text-xs text-muted-foreground tracking-wider mb-3">ДОСТИЖЕНИЯ</div>
          <div className="grid grid-cols-2 gap-2">
            {achievements.map(a => (
              <div key={a.name} className="rounded-xl p-3 flex items-center gap-3 transition-all"
                style={{
                  background: a.done ? "rgba(251,191,36,0.08)" : "rgba(255,255,255,0.03)",
                  border: a.done ? "1px solid rgba(251,191,36,0.3)" : "1px solid rgba(255,255,255,0.06)",
                  opacity: a.done ? 1 : 0.5,
                }}>
                <div className="text-2xl">{a.icon}</div>
                <div className="min-w-0">
                  <div className={`font-rajdhani font-bold text-xs ${a.done ? "text-yellow-400" : "text-muted-foreground"}`}>{a.name}</div>
                  <div className="font-exo text-xs text-muted-foreground truncate">{a.desc}</div>
                </div>
                {a.done && <Icon name="Check" size={14} className="text-yellow-400 flex-shrink-0 ml-auto" />}
              </div>
            ))}
          </div>
        </div>

        {/* Кнопки */}
        <div className="flex gap-3 mt-4 animate-slide-in-bottom delay-500">
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

export default PlayerProfile;
