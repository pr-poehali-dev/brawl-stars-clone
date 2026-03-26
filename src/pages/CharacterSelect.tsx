import { useState } from "react";
import Icon from "@/components/ui/icon";
import ParticlesBg from "@/components/game/ParticlesBg";
import TopBar from "@/components/game/TopBar";
import { CHARACTERS } from "@/data/gameData";
import { api } from "@/lib/api";

interface CharacterSelectProps {
  onNavigate: (screen: string, data?: unknown) => void;
}

const StatBar = ({ value, max = 100, color }: { value: number; max?: number; color: string }) => (
  <div className="progress-bar flex-1">
    <div className="progress-fill transition-all duration-700" style={{ width: `${(value / max) * 100}%`, background: color }} />
  </div>
);

const CharacterSelect = ({ onNavigate }: CharacterSelectProps) => {
  const [selected, setSelected] = useState(CHARACTERS[0]);
  const [hoveredId, setHoveredId] = useState<number | null>(null);
  const [playerName, setPlayerName] = useState(() => localStorage.getItem("brawlzone_name") || "");
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState("");

  const rarityColors: Record<string, string> = {
    "Легендарный": "#fbbf24",
    "Эпический": "#a855f7",
    "Редкий": "#22d3ee",
  };

  return (
    <div className="min-h-screen animated-bg relative overflow-hidden">
      <ParticlesBg count={20} colors={[selected.color, "#a855f7", "#ff8c00"]} />
      <TopBar onNavigate={onNavigate} currentScreen="character-select" />

      {/* Фоновое свечение от выбранного персонажа */}
      <div className="fixed inset-0 pointer-events-none transition-all duration-700"
        style={{ background: `radial-gradient(ellipse at 70% 40%, ${selected.color}18 0%, transparent 60%)` }} />

      <div className="pt-16 pb-6 px-4 max-w-7xl mx-auto">
        
        <div className="text-center mb-6 animate-fade-scale-in">
          <h1 className="font-orbitron font-black text-2xl md:text-3xl tracking-wider text-white">ВЫБОР БОЙЦА</h1>
          <p className="font-exo text-muted-foreground text-sm mt-1">Выбери своего героя и вступи в бой</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          
          {/* Сетка персонажей */}
          <div className="lg:col-span-2">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {CHARACTERS.map((char, i) => (
                <div
                  key={char.id}
                  className={`char-card rounded-xl p-4 ${char.bg} animate-fade-scale-in`}
                  style={{
                    border: selected.id === char.id ? `2px solid ${char.color}` : `1px solid ${char.color}33`,
                    boxShadow: selected.id === char.id ? `0 0 20px ${char.color}44, 0 0 40px ${char.color}22` : "none",
                    animationDelay: `${i * 0.08}s`,
                    opacity: 0,
                  }}
                  onClick={() => setSelected(char)}
                  onMouseEnter={() => setHoveredId(char.id)}
                  onMouseLeave={() => setHoveredId(null)}
                >
                  {/* Редкость */}
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-xs font-rajdhani font-bold px-2 py-0.5 rounded-full"
                      style={{ background: `${rarityColors[char.rarity]}22`, color: rarityColors[char.rarity], border: `1px solid ${rarityColors[char.rarity]}44` }}>
                      {char.rarity.toUpperCase()}
                    </span>
                    {selected.id === char.id && (
                      <div className="w-5 h-5 rounded-full flex items-center justify-center text-xs"
                        style={{ background: char.color }}>✓</div>
                    )}
                  </div>

                  {/* Эмодзи персонажа */}
                  <div className="text-center my-3">
                    <div className="text-5xl transition-transform duration-200"
                      style={{ 
                        transform: (hoveredId === char.id || selected.id === char.id) ? "scale(1.2)" : "scale(1)",
                        filter: `drop-shadow(0 0 15px ${char.color}88)`,
                      }}>
                      {char.emoji}
                    </div>
                  </div>

                  {/* Имя и роль */}
                  <div className="text-center">
                    <div className="font-orbitron font-bold text-sm text-white">{char.name}</div>
                    <div className="font-exo text-xs mt-0.5" style={{ color: char.color }}>{char.role}</div>
                  </div>

                  {/* Мини статы */}
                  <div className="mt-3 space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground w-4">⚔</span>
                      <StatBar value={char.attack} color={char.color} />
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground w-4">🛡</span>
                      <StatBar value={char.defense} color={char.color} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Детали выбранного персонажа */}
          <div className="animate-slide-in-right" style={{ opacity: 0 }}>
            <div className="rounded-xl p-5 sticky top-20"
              style={{
                background: `linear-gradient(135deg, ${selected.color}15, rgba(10,12,20,0.9))`,
                border: `1px solid ${selected.color}44`,
                boxShadow: `0 0 30px ${selected.color}22`,
              }}>
              
              {/* Персонаж крупно */}
              <div className="text-center mb-4">
                <div className="text-8xl animate-bounce-in" style={{ filter: `drop-shadow(0 0 25px ${selected.color})` }}>
                  {selected.emoji}
                </div>
                <div className="font-orbitron font-black text-2xl text-white mt-2">{selected.name}</div>
                <div className="flex items-center justify-center gap-2 mt-1">
                  <span className="font-rajdhani font-bold text-sm" style={{ color: selected.color }}>{selected.role}</span>
                  <span className="text-muted-foreground text-xs">·</span>
                  <span className="text-muted-foreground text-xs">{selected.playstyle}</span>
                </div>
                <div className="font-exo text-xs mt-1" style={{ color: rarityColors[selected.rarity] }}>
                  ★ {selected.rarity.toUpperCase()}
                </div>
              </div>

              {/* Лор */}
              <p className="text-muted-foreground text-xs text-center italic mb-4 px-2">{selected.lore}</p>

              {/* Характеристики */}
              <div className="space-y-2.5 mb-4">
                {[
                  { label: "HP", value: selected.hp, max: 4200, icon: "❤️" },
                  { label: "Атака", value: selected.attack, max: 100, icon: "⚔️" },
                  { label: "Защита", value: selected.defense, max: 100, icon: "🛡️" },
                  { label: "Скорость", value: selected.speed, max: 100, icon: "💨" },
                ].map(stat => (
                  <div key={stat.label} className="flex items-center gap-2">
                    <span className="text-xs w-4">{stat.icon}</span>
                    <span className="font-exo text-xs text-muted-foreground w-14">{stat.label}</span>
                    <StatBar value={stat.value} max={stat.max} color={selected.color} />
                    <span className="font-exo text-xs font-bold text-white w-10 text-right">{stat.value}</span>
                  </div>
                ))}
              </div>

              {/* Способности */}
              <div className="space-y-2 mb-4">
                <div className="rounded-lg p-3" style={{ background: `${selected.color}10`, border: `1px solid ${selected.color}22` }}>
                  <div className="flex items-center gap-2 mb-1">
                    <span>{selected.abilityIcon}</span>
                    <span className="font-orbitron font-bold text-xs text-white">{selected.ability}</span>
                    <span className="ml-auto text-xs text-muted-foreground">🔋 Способность</span>
                  </div>
                  <p className="font-exo text-xs text-muted-foreground">{selected.abilityDesc}</p>
                </div>
                <div className="rounded-lg p-3" style={{ background: "rgba(251,191,36,0.08)", border: "1px solid rgba(251,191,36,0.2)" }}>
                  <div className="flex items-center gap-2 mb-1">
                    <span>💥</span>
                    <span className="font-orbitron font-bold text-xs text-yellow-400">{selected.ultimateName}</span>
                    <span className="ml-auto text-xs text-yellow-600">⚡ УЛЬТА</span>
                  </div>
                  <p className="font-exo text-xs text-muted-foreground">{selected.ultimateDesc}</p>
                </div>
              </div>

              {/* Сложность */}
              <div className="flex items-center justify-between mb-4 text-xs">
                <span className="text-muted-foreground font-exo">Сложность</span>
                <span className="text-yellow-400 font-rajdhani font-bold">{selected.difficulty}</span>
              </div>

              {/* Имя игрока */}
              <div className="mb-3">
                <input
                  type="text"
                  placeholder="Ваш никнейм..."
                  value={playerName}
                  maxLength={20}
                  onChange={e => { setPlayerName(e.target.value); localStorage.setItem("brawlzone_name", e.target.value); }}
                  className="w-full px-3 py-2.5 rounded-xl text-sm font-exo text-white placeholder:text-muted-foreground outline-none"
                  style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.15)" }}
                />
                {error && <p className="text-red-400 text-xs mt-1 font-exo">{error}</p>}
              </div>

              {/* Кнопка онлайн-боя */}
              <button
                className="btn-primary w-full py-3.5 rounded-xl text-sm font-orbitron font-bold tracking-widest disabled:opacity-60"
                disabled={searching}
                onClick={async () => {
                  const name = playerName.trim() || "Боец";
                  if (!name) { setError("Введи никнейм"); return; }
                  setError("");
                  setSearching(true);
                  try {
                    const res = await api.joinQueue(name, selected.id);
                    onNavigate("online-battle", {
                      matchId: res.match_id,
                      playerId: res.player_id,
                      playerNumber: res.player_number,
                      character: selected,
                      playerName: name,
                    });
                  } catch {
                    setError("Ошибка сети, попробуй снова");
                  } finally {
                    setSearching(false);
                  }
                }}
              >
                {searching ? "⏳ Поиск..." : "🌐 ОНЛАЙН БОЙ"}
              </button>

              <button
                className="btn-secondary w-full py-3 rounded-xl text-xs mt-2"
                onClick={() => onNavigate("battle", { character: selected })}
              >
                🤖 БОЙ С БОТОМ
              </button>
              <button
                className="btn-secondary w-full py-2.5 rounded-xl text-xs mt-2"
                onClick={() => onNavigate("menu")}
              >
                НАЗАД
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CharacterSelect;