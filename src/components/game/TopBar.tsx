import Icon from "@/components/ui/icon";
import { PLAYER_DATA } from "@/data/gameData";

interface TopBarProps {
  onNavigate: (screen: string) => void;
  currentScreen: string;
}

const TopBar = ({ onNavigate, currentScreen }: TopBarProps) => {
  return (
    <div className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 py-2"
      style={{ background: "linear-gradient(180deg, rgba(10,12,20,0.95) 0%, transparent 100%)", backdropFilter: "blur(10px)" }}>
      
      <button onClick={() => onNavigate("menu")} className="flex items-center gap-2 group">
        <span className="font-orbitron font-black text-xl tracking-widest neon-orange animate-flicker">BRAWLZONE</span>
      </button>

      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full" style={{ background: "rgba(251,191,36,0.15)", border: "1px solid rgba(251,191,36,0.3)" }}>
          <span>🪙</span>
          <span className="font-exo font-bold text-yellow-400 text-sm">{PLAYER_DATA.coins.toLocaleString()}</span>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full" style={{ background: "rgba(0,212,255,0.15)", border: "1px solid rgba(0,212,255,0.3)" }}>
          <span>💎</span>
          <span className="font-exo font-bold text-cyan-400 text-sm">{PLAYER_DATA.crystals.toLocaleString()}</span>
        </div>
        <button onClick={() => onNavigate("profile")} className="w-9 h-9 rounded-full flex items-center justify-center text-lg transition-all hover:scale-110"
          style={{ background: "linear-gradient(135deg, #ff8c00, #a855f7)", boxShadow: "0 0 15px rgba(255,140,0,0.4)" }}>
          ⚔️
        </button>
      </div>
    </div>
  );
};

export default TopBar;
