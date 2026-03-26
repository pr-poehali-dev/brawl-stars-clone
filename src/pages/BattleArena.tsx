import { useState, useEffect, useRef } from "react";
import Icon from "@/components/ui/icon";
import { CHARACTERS } from "@/data/gameData";

interface BattleArenaProps {
  onNavigate: (screen: string, data?: unknown) => void;
  character?: typeof CHARACTERS[0];
}

const ENEMY = {
  ...CHARACTERS[1],
  name: "ТЁМНЫЙ ВЕКТОР",
  emoji: "💀",
  color: "#ef4444",
};

type BattleLog = { text: string; type: "player" | "enemy" | "system"; time: string };

const BattleArena = ({ onNavigate, character = CHARACTERS[0] }: BattleArenaProps) => {
  const maxHp = character.hp;
  const enemyMaxHp = ENEMY.hp;

  const [playerHp, setPlayerHp] = useState(maxHp);
  const [enemyHp, setEnemyHp] = useState(enemyMaxHp);
  const [abilityReady, setAbilityReady] = useState(true);
  const [ultimateReady, setUltimateReady] = useState(false);
  const [ultimateCharge, setUltimateCharge] = useState(0);
  const [battleLog, setBattleLog] = useState<BattleLog[]>([
    { text: "⚔️ Бой начался! Первый удар за вами!", type: "system", time: "0:00" }
  ]);
  const [phase, setPhase] = useState<"battle" | "win" | "lose">("battle");
  const [shakePlayer, setShakePlayer] = useState(false);
  const [shakeEnemy, setShakeEnemy] = useState(false);
  const [turn, setTurn] = useState(0);
  const [abilityCD, setAbilityCD] = useState(0);
  const logRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [timeElapsed, setTimeElapsed] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => setTimeElapsed(t => t + 1), 1000);
    return () => clearInterval(interval);
  }, []);

  const formatTime = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, "0")}`;

  useEffect(() => {
    if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight;
  }, [battleLog]);

  const addLog = (text: string, type: BattleLog["type"]) => {
    setBattleLog(prev => [...prev.slice(-20), { text, type, time: formatTime(timeElapsed) }]);
  };

  const checkEnd = (pHp: number, eHp: number) => {
    if (pHp <= 0) { setPhase("lose"); return true; }
    if (eHp <= 0) { setPhase("win"); return true; }
    return false;
  };

  const enemyAttack = (currentPlayerHp: number, currentEnemyHp: number) => {
    const dmg = Math.floor(Math.random() * 180 + 80);
    const newHp = Math.max(0, currentPlayerHp - dmg);
    setPlayerHp(newHp);
    setShakePlayer(true);
    setTimeout(() => setShakePlayer(false), 400);
    addLog(`💀 ${ENEMY.name} наносит ${dmg} урона!`, "enemy");
    checkEnd(newHp, currentEnemyHp);
  };

  const handleAttack = () => {
    if (phase !== "battle") return;
    const dmg = Math.floor(Math.random() * 150 + 100);
    const newEnemyHp = Math.max(0, enemyHp - dmg);
    setEnemyHp(newEnemyHp);
    setShakeEnemy(true);
    setTimeout(() => setShakeEnemy(false), 400);
    setUltimateCharge(prev => Math.min(100, prev + 15));
    if (ultimateCharge >= 85) setUltimateReady(true);
    addLog(`⚔️ Вы наносите ${dmg} урона!`, "player");
    setTurn(t => t + 1);
    if (!checkEnd(playerHp, newEnemyHp)) {
      setTimeout(() => enemyAttack(playerHp, newEnemyHp), 800);
    }
  };

  const handleAbility = () => {
    if (!abilityReady || phase !== "battle") return;
    const dmg = Math.floor(Math.random() * 250 + 200);
    const newEnemyHp = Math.max(0, enemyHp - dmg);
    setEnemyHp(newEnemyHp);
    setShakeEnemy(true);
    setTimeout(() => setShakeEnemy(false), 400);
    setAbilityReady(false);
    setAbilityCD(3);
    setUltimateCharge(prev => Math.min(100, prev + 25));
    if (ultimateCharge >= 75) setUltimateReady(true);
    addLog(`${character.abilityIcon} ${character.ability} — ${dmg} урона!`, "player");
    setTurn(t => t + 1);
    if (!checkEnd(playerHp, newEnemyHp)) {
      setTimeout(() => enemyAttack(playerHp, newEnemyHp), 800);
    }
    let cd = 3;
    const interval = setInterval(() => {
      cd--;
      setAbilityCD(cd);
      if (cd <= 0) { setAbilityReady(true); clearInterval(interval); }
    }, 1000);
  };

  const handleUltimate = () => {
    if (!ultimateReady || phase !== "battle") return;
    const dmg = Math.floor(Math.random() * 600 + 400);
    const newEnemyHp = Math.max(0, enemyHp - dmg);
    setEnemyHp(newEnemyHp);
    setShakeEnemy(true);
    setTimeout(() => setShakeEnemy(false), 600);
    setUltimateReady(false);
    setUltimateCharge(0);
    addLog(`💥 УЛЬТА: ${character.ultimateName} — ${dmg} УРОНА! ⚡`, "player");
    setTurn(t => t + 1);
    checkEnd(playerHp, newEnemyHp);
  };

  const handleDefend = () => {
    if (phase !== "battle") return;
    const heal = Math.floor(Math.random() * 100 + 50);
    setPlayerHp(prev => Math.min(maxHp, prev + heal));
    addLog(`🛡️ Вы блокируете и восстанавливаете ${heal} HP!`, "player");
    setTimeout(() => enemyAttack(playerHp, enemyHp), 800);
  };

  const hpPercent = (playerHp / maxHp) * 100;
  const enemyHpPercent = (enemyHp / enemyMaxHp) * 100;
  const hpColor = hpPercent > 50 ? "#22d3ee" : hpPercent > 25 ? "#f59e0b" : "#ef4444";
  const enemyHpColor = enemyHpPercent > 50 ? "#ef4444" : enemyHpPercent > 25 ? "#f59e0b" : "#22d3ee";

  if (phase === "win" || phase === "lose") {
    return (
      <div className="min-h-screen animated-bg flex flex-col items-center justify-center gap-6 px-4">
        <div className="text-center animate-bounce-in">
          <div className="text-8xl mb-4">{phase === "win" ? "🏆" : "💀"}</div>
          <div className={`font-orbitron font-black text-5xl tracking-widest mb-2 ${phase === "win" ? "neon-orange" : "neon-purple"}`}>
            {phase === "win" ? "ПОБЕДА!" : "ПОРАЖЕНИЕ"}
          </div>
          <p className="font-exo text-muted-foreground text-lg">
            {phase === "win" ? `+${Math.floor(Math.random() * 200 + 100)} трофеев` : `-${Math.floor(Math.random() * 100 + 50)} трофеев`}
          </p>
        </div>

        <div className="grid grid-cols-3 gap-4 w-full max-w-sm animate-slide-in-bottom delay-200">
          {[
            { label: "Ходов", value: turn, icon: "⚔️" },
            { label: "Время", value: formatTime(timeElapsed), icon: "⏱" },
            { label: "HP осталось", value: `${Math.max(0, playerHp)}`, icon: "❤️" },
          ].map(s => (
            <div key={s.label} className="rounded-xl p-3 text-center" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}>
              <div className="text-2xl mb-1">{s.icon}</div>
              <div className="font-orbitron font-bold text-white text-sm">{s.value}</div>
              <div className="font-exo text-xs text-muted-foreground">{s.label}</div>
            </div>
          ))}
        </div>

        <div className="flex gap-3 animate-slide-in-bottom delay-300">
          <button className="btn-primary px-8 py-3.5 rounded-xl text-sm" onClick={() => onNavigate("results", { win: phase === "win", character, turns: turn, time: timeElapsed })}>
            РЕЗУЛЬТАТЫ
          </button>
          <button className="btn-secondary px-6 py-3.5 rounded-xl text-sm" onClick={() => onNavigate("character-select")}>
            НАЗАД
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden flex flex-col"
      style={{ background: "linear-gradient(180deg, #0a0c14 0%, #0d1025 50%, #080a18 100%)" }}>
      
      {/* Арена фон */}
      <div className="absolute inset-0 grid-bg opacity-30" />
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 right-0 h-1/2" style={{ background: "linear-gradient(180deg, rgba(168,85,247,0.1), transparent)" }} />
        <div className="absolute bottom-0 left-0 right-0 h-1/2" style={{ background: "linear-gradient(0deg, rgba(0,212,255,0.08), transparent)" }} />
      </div>

      {/* HP bars верх */}
      <div className="relative z-10 p-4 grid grid-cols-2 gap-4">
        {/* Игрок */}
        <div className="animate-slide-in-left">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xl">{character.emoji}</span>
            <div>
              <div className="font-orbitron font-bold text-xs text-white">{character.name}</div>
              <div className="font-exo text-xs" style={{ color: character.color }}>{character.role}</div>
            </div>
            <span className="ml-auto font-orbitron text-xs text-cyan-400">{Math.max(0, playerHp)}</span>
          </div>
          <div className="hp-bar-container">
            <div className="h-full rounded-full transition-all duration-500"
              style={{ width: `${Math.max(0, hpPercent)}%`, background: `linear-gradient(90deg, ${hpColor}, ${hpColor}88)`, boxShadow: `0 0 10px ${hpColor}88` }} />
          </div>
        </div>

        {/* Враг */}
        <div className="animate-slide-in-right text-right">
          <div className="flex items-center gap-2 mb-1 flex-row-reverse">
            <span className="text-xl">{ENEMY.emoji}</span>
            <div className="text-right">
              <div className="font-orbitron font-bold text-xs text-white">{ENEMY.name}</div>
              <div className="font-exo text-xs text-red-400">Противник</div>
            </div>
            <span className="mr-auto font-orbitron text-xs text-red-400">{Math.max(0, enemyHp)}</span>
          </div>
          <div className="hp-bar-container">
            <div className="h-full rounded-full transition-all duration-500 ml-auto"
              style={{ width: `${Math.max(0, enemyHpPercent)}%`, background: `linear-gradient(270deg, ${enemyHpColor}, ${enemyHpColor}88)`, boxShadow: `0 0 10px ${enemyHpColor}88` }} />
          </div>
        </div>
      </div>

      {/* Таймер и ход */}
      <div className="flex items-center justify-center gap-4 text-xs font-exo text-muted-foreground">
        <span>⏱ {formatTime(timeElapsed)}</span>
        <span>·</span>
        <span>Ход {turn + 1}</span>
      </div>

      {/* Боевое поле */}
      <div className="flex-1 flex items-center justify-center gap-8 md:gap-20 px-8 py-4">
        {/* Персонаж игрока */}
        <div className={`text-center transition-all duration-200 ${shakePlayer ? "animate-shake" : ""}`}>
          <div className="relative">
            <div className="text-8xl md:text-9xl" style={{ filter: `drop-shadow(0 0 30px ${character.color})` }}>
              {character.emoji}
            </div>
            {shakePlayer && (
              <div className="absolute top-0 right-0 font-orbitron font-black text-red-500 text-2xl animate-bounce-in">
                💥
              </div>
            )}
          </div>
          <div className="font-orbitron text-xs text-white mt-2 tracking-wider">{character.name}</div>
          <div className="font-exo text-xs mt-1" style={{ color: character.color }}>ВЫ</div>
        </div>

        {/* VS */}
        <div className="text-center">
          <div className="font-orbitron font-black text-3xl neon-orange animate-pulse-glow">VS</div>
          <div className="font-exo text-xs text-muted-foreground mt-1">АРЕНА</div>
        </div>

        {/* Враг */}
        <div className={`text-center transition-all duration-200 ${shakeEnemy ? "animate-shake" : ""}`}>
          <div className="relative">
            <div className="text-8xl md:text-9xl" style={{ filter: "drop-shadow(0 0 30px #ef4444)", transform: "scaleX(-1)" }}>
              {ENEMY.emoji}
            </div>
            {shakeEnemy && (
              <div className="absolute top-0 left-0 font-orbitron font-black text-red-500 text-2xl animate-bounce-in">
                💥
              </div>
            )}
          </div>
          <div className="font-orbitron text-xs text-white mt-2 tracking-wider">{ENEMY.name}</div>
          <div className="font-exo text-xs mt-1 text-red-400">ПРОТИВНИК</div>
        </div>
      </div>

      {/* Лог боя */}
      <div className="px-4 mb-3">
        <div ref={logRef} className="h-20 overflow-y-auto rounded-xl p-3 space-y-1 scrollbar-thin"
          style={{ background: "rgba(0,0,0,0.5)", border: "1px solid rgba(255,255,255,0.08)" }}>
          {battleLog.map((log, i) => (
            <div key={i} className={`font-exo text-xs ${
              log.type === "player" ? "text-cyan-400" :
              log.type === "enemy" ? "text-red-400" : "text-yellow-400"
            }`}>
              <span className="text-muted-foreground mr-1">[{log.time}]</span>
              {log.text}
            </div>
          ))}
        </div>
      </div>

      {/* Кнопки действий */}
      <div className="relative z-10 p-4 space-y-3">
        
        {/* Главные действия */}
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={handleAttack}
            className="btn-primary py-4 rounded-xl text-sm font-orbitron font-bold tracking-wider flex items-center justify-center gap-2"
          >
            <span>⚔️</span> АТАКА
          </button>
          <button
            onClick={handleDefend}
            className="btn-secondary py-4 rounded-xl text-sm font-orbitron font-bold tracking-wider flex items-center justify-center gap-2"
          >
            <span>🛡️</span> ЗАЩИТА
          </button>
        </div>

        {/* Способность */}
        <button
          onClick={handleAbility}
          disabled={!abilityReady}
          className="w-full py-3.5 rounded-xl text-sm font-orbitron font-bold tracking-wider flex items-center justify-center gap-2 transition-all duration-200"
          style={{
            background: abilityReady ? `linear-gradient(135deg, ${character.color}33, ${character.color}11)` : "rgba(255,255,255,0.05)",
            border: abilityReady ? `1px solid ${character.color}66` : "1px solid rgba(255,255,255,0.1)",
            color: abilityReady ? character.color : "#555",
            opacity: abilityReady ? 1 : 0.5,
          }}
        >
          <span>{character.abilityIcon}</span>
          {character.ability}
          {!abilityReady && <span className="ml-auto text-xs">{abilityCD}с</span>}
        </button>

        {/* Ульта */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="font-exo text-xs text-yellow-400">⚡ УЛЬТА: {character.ultimateName}</span>
            <span className="font-exo text-xs text-muted-foreground">{Math.floor(ultimateCharge)}%</span>
          </div>
          <div className="progress-bar mb-2">
            <div className="progress-fill" style={{ width: `${ultimateCharge}%`, background: "linear-gradient(90deg, #fbbf24, #f59e0b)" }} />
          </div>
          <button
            onClick={handleUltimate}
            disabled={!ultimateReady}
            className="w-full py-3 rounded-xl text-sm font-orbitron font-bold tracking-wider transition-all duration-200"
            style={{
              background: ultimateReady ? "linear-gradient(135deg, rgba(251,191,36,0.3), rgba(245,158,11,0.15))" : "rgba(255,255,255,0.05)",
              border: ultimateReady ? "1px solid rgba(251,191,36,0.6)" : "1px solid rgba(255,255,255,0.08)",
              color: ultimateReady ? "#fbbf24" : "#555",
              boxShadow: ultimateReady ? "0 0 20px rgba(251,191,36,0.3)" : "none",
            }}
          >
            💥 {ultimateReady ? "АКТИВИРОВАТЬ УЛЬТУ!" : "ЗАРЯЖАЕТСЯ..."}
          </button>
        </div>

        {/* Сдаться */}
        <button className="w-full py-2 rounded-xl text-xs text-muted-foreground hover:text-red-400 transition-colors font-exo"
          onClick={() => onNavigate("character-select")}>
          ← Сдаться и выйти
        </button>
      </div>
    </div>
  );
};

export default BattleArena;
