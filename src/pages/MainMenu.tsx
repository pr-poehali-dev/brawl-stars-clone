import Icon from "@/components/ui/icon";
import ParticlesBg from "@/components/game/ParticlesBg";

interface MainMenuProps {
  onNavigate: (screen: string) => void;
}

const MainMenu = ({ onNavigate }: MainMenuProps) => {
  const menuItems = [
    { label: "СРАЖАТЬСЯ", icon: "⚔️", screen: "character-select", primary: true, desc: "1 на 1 · Быстрый бой" },
    { label: "ПЕРСОНАЖИ", icon: "👥", screen: "character-select", primary: false, desc: "Выбор и прокачка" },
    { label: "ПРОФИЛЬ", icon: "👤", screen: "profile", primary: false, desc: "Статистика и достижения" },
    { label: "ЛИДЕРЫ", icon: "🏆", screen: "leaderboard", primary: false, desc: "Мировой рейтинг" },
    { label: "МАГАЗИН", icon: "🛍️", screen: "shop", primary: false, desc: "Скины и улучшения" },
  ];

  return (
    <div className="min-h-screen animated-bg grid-bg relative overflow-hidden flex flex-col items-center justify-center">
      <ParticlesBg count={30} />

      {/* Фоновый декор */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full opacity-10 blur-3xl"
          style={{ background: "radial-gradient(circle, #ff8c00, transparent)" }} />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full opacity-10 blur-3xl"
          style={{ background: "radial-gradient(circle, #a855f7, transparent)" }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full opacity-5 blur-3xl"
          style={{ background: "radial-gradient(circle, #00d4ff, transparent)" }} />
      </div>

      <div className="relative z-10 flex flex-col items-center gap-8 px-4 w-full max-w-md">
        
        {/* Логотип */}
        <div className="text-center animate-slide-in-bottom">
          <div className="relative inline-block">
            <div className="font-orbitron font-black text-5xl md:text-7xl tracking-widest leading-none"
              style={{ 
                background: "linear-gradient(135deg, #ff8c00 0%, #fbbf24 50%, #ff6b00 100%)",
                WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
                filter: "drop-shadow(0 0 30px rgba(255,140,0,0.5))"
              }}>
              BRAWL
            </div>
            <div className="font-orbitron font-black text-5xl md:text-7xl tracking-widest leading-none"
              style={{ 
                background: "linear-gradient(135deg, #00d4ff 0%, #a855f7 100%)",
                WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
                filter: "drop-shadow(0 0 30px rgba(168,85,247,0.5))"
              }}>
              ZONE
            </div>
            {/* Подзаголовок */}
            <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 whitespace-nowrap">
              <span className="font-rajdhani text-xs tracking-[0.4em] text-muted-foreground uppercase">АРЕНА ЭПИЧЕСКИХ БИТВ</span>
            </div>
          </div>
        </div>

        {/* Иконка героя */}
        <div className="animate-slide-in-bottom delay-200 relative">
          <div className="w-24 h-24 rounded-full flex items-center justify-center text-5xl animate-pulse-glow"
            style={{ 
              background: "linear-gradient(135deg, rgba(255,140,0,0.2), rgba(168,85,247,0.2))",
              border: "2px solid rgba(255,140,0,0.5)",
              boxShadow: "0 0 40px rgba(255,140,0,0.3), inset 0 0 20px rgba(168,85,247,0.1)"
            }}>
            ⚔️
          </div>
          <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-red-500 flex items-center justify-center text-xs font-bold animate-bounce">
            3
          </div>
        </div>

        {/* Кнопки меню */}
        <div className="w-full flex flex-col gap-3 animate-slide-in-bottom delay-300">
          {menuItems.map((item, i) => (
            <button
              key={item.label}
              onClick={() => onNavigate(item.screen)}
              className={`w-full flex items-center justify-between px-5 py-4 rounded-xl transition-all duration-200 group ${
                item.primary ? "btn-primary" : "btn-secondary"
              }`}
              style={{ animationDelay: `${0.1 * i}s` }}
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">{item.icon}</span>
                <div className="text-left">
                  <div className={`font-orbitron font-bold text-sm tracking-wider ${item.primary ? "text-white" : ""}`}>
                    {item.label}
                  </div>
                  <div className={`text-xs ${item.primary ? "text-orange-200" : "text-muted-foreground"}`}>
                    {item.desc}
                  </div>
                </div>
              </div>
              <Icon name="ChevronRight" size={18} className={`transition-transform group-hover:translate-x-1 ${item.primary ? "text-white" : "text-purple-400"}`} />
            </button>
          ))}
        </div>

        {/* Статус */}
        <div className="w-full flex items-center justify-between px-4 py-3 rounded-xl animate-slide-in-bottom delay-500"
          style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            <span className="font-exo text-xs text-muted-foreground">Онлайн: <span className="text-green-400 font-semibold">12,847</span></span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-yellow-400">🏆</span>
            <span className="font-exo text-xs text-muted-foreground">Сезон 7 · <span className="text-yellow-400 font-semibold">14 дней</span></span>
          </div>
          <div className="flex items-center gap-2">
            <span>⚡</span>
            <span className="font-exo text-xs text-muted-foreground">v2.4.1</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MainMenu;
