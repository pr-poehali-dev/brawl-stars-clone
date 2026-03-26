import Icon from "@/components/ui/icon";
import ParticlesBg from "@/components/game/ParticlesBg";
import { CHARACTERS } from "@/data/gameData";

interface BattleResultsProps {
  onNavigate: (screen: string, data?: unknown) => void;
  win?: boolean;
  character?: typeof CHARACTERS[0];
  turns?: number;
  time?: number;
}

const BattleResults = ({ onNavigate, win = true, character = CHARACTERS[0], turns = 8, time = 47 }: BattleResultsProps) => {
  const trophyChange = win ? Math.floor(Math.random() * 200 + 80) : -Math.floor(Math.random() * 100 + 30);
  const xpGain = win ? Math.floor(Math.random() * 500 + 200) : Math.floor(Math.random() * 100 + 50);
  const coinsGain = win ? Math.floor(Math.random() * 200 + 100) : Math.floor(Math.random() * 50 + 20);

  const formatTime = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, "0")}`;

  const grades = [
    { label: "Урон нанесён", value: `${(Math.random() * 3000 + 1500).toFixed(0)}`, icon: "⚔️" },
    { label: "Урон получен", value: `${(Math.random() * 2000 + 800).toFixed(0)}`, icon: "🛡️" },
    { label: "Критических", value: `${Math.floor(Math.random() * 5 + 1)}`, icon: "💥" },
    { label: "Ходов", value: turns, icon: "🔄" },
  ];

  return (
    <div className="min-h-screen animated-bg relative overflow-hidden flex flex-col items-center justify-center p-4">
      <ParticlesBg count={win ? 40 : 15} colors={win ? ["#fbbf24", "#ff8c00", "#22d3ee"] : ["#4b5563", "#374151"]} />

      <div className="relative z-10 w-full max-w-md">
        
        {/* Заголовок результата */}
        <div className="text-center mb-6 animate-bounce-in">
          <div className="text-7xl mb-3">{win ? "🏆" : "💀"}</div>
          <div className={`font-orbitron font-black text-4xl tracking-widest mb-1 ${win ? "neon-orange" : "neon-purple"}`}>
            {win ? "ПОБЕДА!" : "ПОРАЖЕНИЕ"}
          </div>
          <p className="font-exo text-muted-foreground">
            {win ? "Блестящая победа, боец!" : "В следующий раз повезёт больше"}
          </p>
        </div>

        {/* Персонаж */}
        <div className="flex items-center justify-center gap-4 mb-6 animate-slide-in-bottom delay-200">
          <div className="rounded-xl p-4 flex items-center gap-3"
            style={{ background: `${character.color}15`, border: `1px solid ${character.color}44` }}>
            <span className="text-4xl">{character.emoji}</span>
            <div>
              <div className="font-orbitron font-bold text-white text-sm">{character.name}</div>
              <div className="font-exo text-xs" style={{ color: character.color }}>{character.role}</div>
            </div>
          </div>
          <div className="text-2xl font-orbitron text-muted-foreground">VS</div>
          <div className="rounded-xl p-4 flex items-center gap-3"
            style={{ background: "rgba(239,68,68,0.15)", border: "1px solid rgba(239,68,68,0.44)" }}>
            <span className="text-4xl">{win ? "💀" : "😤"}</span>
            <div>
              <div className="font-orbitron font-bold text-white text-sm">ПРОТИВНИК</div>
              <div className="font-exo text-xs text-red-400">{win ? "Повержен" : "Победил"}</div>
            </div>
          </div>
        </div>

        {/* Награды */}
        <div className="rounded-xl p-4 mb-4 animate-slide-in-bottom delay-300"
          style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
          <div className="font-orbitron font-bold text-xs text-muted-foreground tracking-wider mb-3">НАГРАДЫ</div>
          <div className="grid grid-cols-3 gap-3">
            <div className="text-center rounded-lg p-3" style={{ background: trophyChange > 0 ? "rgba(251,191,36,0.1)" : "rgba(239,68,68,0.1)", border: trophyChange > 0 ? "1px solid rgba(251,191,36,0.3)" : "1px solid rgba(239,68,68,0.3)" }}>
              <div className="text-2xl mb-1">🏆</div>
              <div className={`font-orbitron font-bold text-sm ${trophyChange > 0 ? "text-yellow-400" : "text-red-400"}`}>
                {trophyChange > 0 ? "+" : ""}{trophyChange}
              </div>
              <div className="font-exo text-xs text-muted-foreground">Трофеев</div>
            </div>
            <div className="text-center rounded-lg p-3" style={{ background: "rgba(0,212,255,0.1)", border: "1px solid rgba(0,212,255,0.3)" }}>
              <div className="text-2xl mb-1">⭐</div>
              <div className="font-orbitron font-bold text-sm text-cyan-400">+{xpGain}</div>
              <div className="font-exo text-xs text-muted-foreground">Опыт</div>
            </div>
            <div className="text-center rounded-lg p-3" style={{ background: "rgba(251,191,36,0.1)", border: "1px solid rgba(251,191,36,0.3)" }}>
              <div className="text-2xl mb-1">🪙</div>
              <div className="font-orbitron font-bold text-sm text-yellow-400">+{coinsGain}</div>
              <div className="font-exo text-xs text-muted-foreground">Монеты</div>
            </div>
          </div>
        </div>

        {/* Статистика боя */}
        <div className="rounded-xl p-4 mb-4 animate-slide-in-bottom delay-400"
          style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
          <div className="font-orbitron font-bold text-xs text-muted-foreground tracking-wider mb-3">СТАТИСТИКА БОЯ</div>
          <div className="grid grid-cols-2 gap-2">
            {grades.map(g => (
              <div key={g.label} className="flex items-center justify-between px-3 py-2 rounded-lg"
                style={{ background: "rgba(255,255,255,0.03)" }}>
                <div className="flex items-center gap-2">
                  <span className="text-sm">{g.icon}</span>
                  <span className="font-exo text-xs text-muted-foreground">{g.label}</span>
                </div>
                <span className="font-orbitron font-bold text-xs text-white">{g.value}</span>
              </div>
            ))}
            <div className="flex items-center justify-between px-3 py-2 rounded-lg col-span-2"
              style={{ background: "rgba(255,255,255,0.03)" }}>
              <div className="flex items-center gap-2">
                <span className="text-sm">⏱</span>
                <span className="font-exo text-xs text-muted-foreground">Длительность</span>
              </div>
              <span className="font-orbitron font-bold text-xs text-white">{formatTime(time)}</span>
            </div>
          </div>
        </div>

        {/* Оценка */}
        <div className="text-center mb-4 animate-slide-in-bottom delay-400">
          <div className="font-orbitron font-black text-2xl text-yellow-400">
            {win ? "★★★" : "★☆☆"}
          </div>
          <div className="font-exo text-xs text-muted-foreground mt-1">
            {win ? "Превосходный бой!" : "Тренируйся больше"}
          </div>
        </div>

        {/* Кнопки */}
        <div className="flex gap-3 animate-slide-in-bottom delay-500">
          <button className="btn-primary flex-1 py-3.5 rounded-xl text-sm" onClick={() => onNavigate("character-select")}>
            ⚔️ ЕЩЁ РАЗ
          </button>
          <button className="btn-secondary flex-1 py-3.5 rounded-xl text-sm" onClick={() => onNavigate("menu")}>
            🏠 МЕНЮ
          </button>
        </div>
      </div>
    </div>
  );
};

export default BattleResults;
