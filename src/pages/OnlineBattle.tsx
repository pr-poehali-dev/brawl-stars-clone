import { useState, useEffect, useRef, useCallback } from "react";
import { api, MatchState, ActionLog } from "@/lib/api";
import { CHARACTERS } from "@/data/gameData";
import Icon from "@/components/ui/icon";

interface OnlineBattleProps {
  onNavigate: (screen: string, data?: unknown) => void;
  matchId: string;
  playerId: string;
  playerNumber: 1 | 2;
  character: typeof CHARACTERS[0];
  playerName: string;
}

type Phase = "waiting" | "active" | "finished";

const OnlineBattle = ({ onNavigate, matchId, playerId, playerNumber, character, playerName }: OnlineBattleProps) => {
  const [match, setMatch] = useState<MatchState | null>(null);
  const [phase, setPhase] = useState<Phase>("waiting");
  const [log, setLog] = useState<ActionLog[]>([]);
  const [acting, setActing] = useState(false);
  const [lastDesc, setLastDesc] = useState("");
  const [shakeMe, setShakeMe] = useState(false);
  const [shakeEnemy, setShakeEnemy] = useState(false);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [abilityUsed, setAbilityUsed] = useState(false);
  const [ultimateCharge, setUltimateCharge] = useState(0);
  const [abilityCD, setAbilityCD] = useState(0);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const logRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const t = setInterval(() => setTimeElapsed(s => s + 1), 1000);
    return () => clearInterval(t);
  }, []);

  const formatTime = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, "0")}`;

  const fetchMatch = useCallback(async () => {
    try {
      const m = await api.getMatch(matchId);
      setMatch(m);
      if (m.actions) setLog(m.actions.slice().reverse());
      if (m.status === "active" && phase !== "active") setPhase("active");
      if (m.status === "finished") {
        setPhase("finished");
        if (pollRef.current) clearInterval(pollRef.current);
      }
    } catch (e) { console.warn("poll error", e); }
  }, [matchId, phase]);

  useEffect(() => {
    fetchMatch();
    pollRef.current = setInterval(fetchMatch, 2000);
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, [fetchMatch]);

  useEffect(() => {
    if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight;
  }, [log]);

  const isMyTurn = match?.current_turn === playerId && phase === "active";

  const myHp = playerNumber === 1 ? (match?.player1_hp ?? character.hp) : (match?.player2_hp ?? character.hp);
  const myHpMax = playerNumber === 1 ? (match?.player1_hp_max ?? character.hp) : (match?.player2_hp_max ?? character.hp);
  const enemyHp = playerNumber === 1 ? (match?.player2_hp ?? 0) : (match?.player1_hp ?? 0);
  const enemyHpMax = playerNumber === 1 ? (match?.player2_hp_max ?? 0) : (match?.player1_hp_max ?? 0);
  const enemyCharName = playerNumber === 1 ? match?.player2_character : match?.player1_character;
  const enemyChar = CHARACTERS.find(c => c.name === enemyCharName) || CHARACTERS[1];

  const doAction = async (action: string) => {
    if (!isMyTurn || acting) return;
    setActing(true);
    try {
      const res = await api.doAction(matchId, playerId, action);
      if (res.description) setLastDesc(res.description);
      if (action === "attack" || action === "ability" || action === "ultimate") {
        setShakeEnemy(true);
        setTimeout(() => setShakeEnemy(false), 400);
        setUltimateCharge(prev => Math.min(100, prev + (action === "ultimate" ? 0 : action === "ability" ? 25 : 15)));
      } else {
        setShakeMe(true);
        setTimeout(() => setShakeMe(false), 400);
      }
      if (action === "ability") {
        setAbilityUsed(true);
        setAbilityCD(3);
        let cd = 3;
        const interval = setInterval(() => {
          cd--;
          setAbilityCD(cd);
          if (cd <= 0) { setAbilityUsed(false); clearInterval(interval); }
        }, 1000);
      }
      if (action === "ultimate") setUltimateCharge(0);
      await fetchMatch();
    } finally {
      setActing(false);
    }
  };

  const myHpPct = myHpMax > 0 ? (myHp / myHpMax) * 100 : 0;
  const enemyHpPct = enemyHpMax > 0 ? (enemyHp / enemyHpMax) * 100 : 0;
  const myHpColor = myHpPct > 50 ? "#22d3ee" : myHpPct > 25 ? "#f59e0b" : "#ef4444";
  const enemyHpColor = enemyHpPct > 50 ? "#ef4444" : enemyHpPct > 25 ? "#f59e0b" : "#22d3ee";

  const iWon = match?.winner_id === playerId;

  if (phase === "finished") {
    return (
      <div className="min-h-screen animated-bg flex flex-col items-center justify-center gap-6 px-4">
        <div className="text-center animate-bounce-in">
          <div className="text-8xl mb-4">{iWon ? "🏆" : "💀"}</div>
          <div className={`font-orbitron font-black text-5xl tracking-widest mb-2 ${iWon ? "neon-orange" : "neon-purple"}`}>
            {iWon ? "ПОБЕДА!" : "ПОРАЖЕНИЕ"}
          </div>
          <p className="font-exo text-muted-foreground text-lg">
            {iWon ? "Отличный бой, боец!" : "Вернись и отомсти!"}
          </p>
        </div>
        <div className="grid grid-cols-3 gap-4 w-full max-w-sm animate-slide-in-bottom delay-200">
          {[
            { label: "Ходов", value: match?.turn_count ?? 0, icon: "⚔️" },
            { label: "Время", value: formatTime(timeElapsed), icon: "⏱" },
            { label: "HP осталось", value: Math.max(0, myHp), icon: "❤️" },
          ].map(s => (
            <div key={s.label} className="rounded-xl p-3 text-center" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}>
              <div className="text-2xl mb-1">{s.icon}</div>
              <div className="font-orbitron font-bold text-white text-sm">{s.value}</div>
              <div className="font-exo text-xs text-muted-foreground">{s.label}</div>
            </div>
          ))}
        </div>
        <div className="flex gap-3">
          <button className="btn-primary px-8 py-3.5 rounded-xl text-sm" onClick={() => onNavigate("character-select")}>
            ⚔️ ЕЩЁ РАЗ
          </button>
          <button className="btn-secondary px-6 py-3.5 rounded-xl text-sm" onClick={() => onNavigate("menu")}>
            🏠 МЕНЮ
          </button>
        </div>
      </div>
    );
  }

  if (phase === "waiting") {
    return (
      <div className="min-h-screen animated-bg flex flex-col items-center justify-center gap-6 px-4">
        <div className="text-center animate-fade-scale-in">
          <div className="text-7xl mb-4 animate-pulse-glow">{character.emoji}</div>
          <div className="font-orbitron font-black text-2xl text-white mb-2">ПОИСК ПРОТИВНИКА</div>
          <p className="font-exo text-muted-foreground">Ожидаем второго игрока...</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-orange-500 animate-bounce" style={{ animationDelay: "0s" }} />
          <div className="w-3 h-3 rounded-full bg-orange-500 animate-bounce" style={{ animationDelay: "0.2s" }} />
          <div className="w-3 h-3 rounded-full bg-orange-500 animate-bounce" style={{ animationDelay: "0.4s" }} />
        </div>
        <div className="rounded-xl px-6 py-3 text-center" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}>
          <div className="font-exo text-xs text-muted-foreground">Ваш персонаж: <span className="text-white font-bold">{character.name}</span></div>
          <div className="font-exo text-xs text-muted-foreground mt-1">Игрок: <span className="text-cyan-400 font-bold">{playerName}</span></div>
        </div>
        <button className="btn-secondary px-6 py-2.5 rounded-xl text-sm" onClick={() => onNavigate("menu")}>
          Отмена
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden flex flex-col"
      style={{ background: "linear-gradient(180deg, #0a0c14 0%, #0d1025 50%, #080a18 100%)" }}>
      <div className="absolute inset-0 grid-bg opacity-30" />

      {/* HP bars */}
      <div className="relative z-10 p-4 grid grid-cols-2 gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xl">{character.emoji}</span>
            <div>
              <div className="font-orbitron font-bold text-xs text-white">{playerName}</div>
              <div className="font-exo text-xs" style={{ color: character.color }}>{character.role}</div>
            </div>
            <span className="ml-auto font-orbitron text-xs text-cyan-400">{Math.max(0, myHp)}</span>
          </div>
          <div className="hp-bar-container">
            <div className="h-full rounded-full transition-all duration-500"
              style={{ width: `${Math.max(0, myHpPct)}%`, background: `linear-gradient(90deg, ${myHpColor}, ${myHpColor}88)`, boxShadow: `0 0 10px ${myHpColor}88` }} />
          </div>
        </div>
        <div className="text-right">
          <div className="flex items-center gap-2 mb-1 flex-row-reverse">
            <span className="text-xl">{enemyChar.emoji}</span>
            <div className="text-right">
              <div className="font-orbitron font-bold text-xs text-white">Противник</div>
              <div className="font-exo text-xs text-red-400">{enemyChar.role}</div>
            </div>
            <span className="mr-auto font-orbitron text-xs text-red-400">{Math.max(0, enemyHp)}</span>
          </div>
          <div className="hp-bar-container">
            <div className="h-full rounded-full transition-all duration-500 ml-auto"
              style={{ width: `${Math.max(0, enemyHpPct)}%`, background: `linear-gradient(270deg, ${enemyHpColor}, ${enemyHpColor}88)`, boxShadow: `0 0 10px ${enemyHpColor}88` }} />
          </div>
        </div>
      </div>

      {/* Статус хода */}
      <div className="flex justify-center mb-2">
        <div className={`px-4 py-1.5 rounded-full font-orbitron font-bold text-xs tracking-wider ${isMyTurn ? "text-green-400" : "text-yellow-400"}`}
          style={{ background: isMyTurn ? "rgba(34,197,94,0.15)" : "rgba(251,191,36,0.15)", border: isMyTurn ? "1px solid rgba(34,197,94,0.4)" : "1px solid rgba(251,191,36,0.4)" }}>
          {isMyTurn ? "⚔️ ВАШ ХОД" : "⏳ Ход противника..."}
        </div>
      </div>

      {/* Бойцы */}
      <div className="flex-1 flex items-center justify-center gap-8 md:gap-20 px-8">
        <div className={`text-center ${shakeMe ? "animate-shake" : ""}`}>
          <div className="text-8xl" style={{ filter: `drop-shadow(0 0 30px ${character.color})` }}>{character.emoji}</div>
          <div className="font-orbitron text-xs text-white mt-2">{character.name}</div>
          <div className="font-exo text-xs mt-1 text-cyan-400">ВЫ</div>
        </div>
        <div className="text-center">
          <div className="font-orbitron font-black text-3xl neon-orange animate-pulse-glow">VS</div>
          <div className="font-exo text-xs text-muted-foreground mt-1">{formatTime(timeElapsed)}</div>
        </div>
        <div className={`text-center ${shakeEnemy ? "animate-shake" : ""}`}>
          <div className="text-8xl" style={{ filter: "drop-shadow(0 0 30px #ef4444)", transform: "scaleX(-1)" }}>{enemyChar.emoji}</div>
          <div className="font-orbitron text-xs text-white mt-2">{enemyChar.name}</div>
          <div className="font-exo text-xs mt-1 text-red-400">ВРАГ</div>
        </div>
      </div>

      {/* Лог */}
      {lastDesc && (
        <div className="mx-4 mb-2 text-center">
          <span className="font-exo text-sm text-yellow-400 animate-fade-scale-in">{lastDesc}</span>
        </div>
      )}
      <div className="px-4 mb-3">
        <div ref={logRef} className="h-20 overflow-y-auto rounded-xl p-3 space-y-1"
          style={{ background: "rgba(0,0,0,0.5)", border: "1px solid rgba(255,255,255,0.08)" }}>
          {log.map((l, i) => (
            <div key={i} className={`font-exo text-xs ${l.player_name === playerName ? "text-cyan-400" : "text-red-400"}`}>
              <span className="text-muted-foreground mr-1">[{l.time}]</span>{l.description}
            </div>
          ))}
        </div>
      </div>

      {/* Кнопки */}
      <div className="relative z-10 p-4 space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <button onClick={() => doAction("attack")} disabled={!isMyTurn || acting}
            className="btn-primary py-4 rounded-xl text-sm font-orbitron font-bold tracking-wider flex items-center justify-center gap-2 disabled:opacity-40">
            <span>⚔️</span> АТАКА
          </button>
          <button onClick={() => doAction("defend")} disabled={!isMyTurn || acting}
            className="btn-secondary py-4 rounded-xl text-sm font-orbitron font-bold tracking-wider flex items-center justify-center gap-2 disabled:opacity-40">
            <span>🛡️</span> ЗАЩИТА
          </button>
        </div>

        <button onClick={() => doAction("ability")} disabled={!isMyTurn || acting || abilityUsed}
          className="w-full py-3.5 rounded-xl text-sm font-orbitron font-bold tracking-wider flex items-center justify-center gap-2 disabled:opacity-40 transition-all"
          style={{
            background: (!abilityUsed && isMyTurn) ? `${character.color}22` : "rgba(255,255,255,0.05)",
            border: (!abilityUsed && isMyTurn) ? `1px solid ${character.color}66` : "1px solid rgba(255,255,255,0.1)",
            color: (!abilityUsed && isMyTurn) ? character.color : "#555",
          }}>
          <span>{character.abilityIcon}</span>
          {character.ability}
          {abilityUsed && <span className="ml-auto text-xs">{abilityCD}с</span>}
        </button>

        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="font-exo text-xs text-yellow-400">⚡ УЛЬТА</span>
            <span className="font-exo text-xs text-muted-foreground">{Math.floor(ultimateCharge)}%</span>
          </div>
          <div className="progress-bar mb-2">
            <div className="progress-fill" style={{ width: `${ultimateCharge}%`, background: "linear-gradient(90deg, #fbbf24, #f59e0b)" }} />
          </div>
          <button onClick={() => doAction("ultimate")} disabled={!isMyTurn || acting || ultimateCharge < 100}
            className="w-full py-3 rounded-xl text-sm font-orbitron font-bold tracking-wider disabled:opacity-40 transition-all"
            style={{
              background: ultimateCharge >= 100 && isMyTurn ? "rgba(251,191,36,0.25)" : "rgba(255,255,255,0.05)",
              border: ultimateCharge >= 100 && isMyTurn ? "1px solid rgba(251,191,36,0.6)" : "1px solid rgba(255,255,255,0.08)",
              color: ultimateCharge >= 100 && isMyTurn ? "#fbbf24" : "#555",
            }}>
            💥 {ultimateCharge >= 100 ? "АКТИВИРОВАТЬ УЛЬТУ!" : "Заряжается..."}
          </button>
        </div>

        <button className="w-full py-2 rounded-xl text-xs text-muted-foreground hover:text-red-400 transition-colors font-exo"
          onClick={() => onNavigate("character-select")}>
          ← Сдаться
        </button>
      </div>
    </div>
  );
};

export default OnlineBattle;