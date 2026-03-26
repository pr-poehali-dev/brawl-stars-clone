import { useState } from "react";
import Icon from "@/components/ui/icon";
import TopBar from "@/components/game/TopBar";
import { SHOP_ITEMS, PLAYER_DATA } from "@/data/gameData";

interface ShopProps {
  onNavigate: (screen: string) => void;
}

const Shop = ({ onNavigate }: ShopProps) => {
  const [activeCategory, setActiveCategory] = useState("all");
  const [boughtId, setBoughtId] = useState<number | null>(null);

  const categories = [
    { id: "all", label: "Всё", icon: "🛍️" },
    { id: "currency", label: "Валюта", icon: "💎" },
    { id: "skin", label: "Скины", icon: "👤" },
    { id: "boost", label: "Бусты", icon: "⚡" },
    { id: "pass", label: "Пасс", icon: "🏆" },
  ];

  const filtered = activeCategory === "all" ? SHOP_ITEMS : SHOP_ITEMS.filter(i => i.category === activeCategory);

  const handleBuy = (id: number) => {
    setBoughtId(id);
    setTimeout(() => setBoughtId(null), 2000);
  };

  return (
    <div className="min-h-screen animated-bg">
      <TopBar onNavigate={onNavigate} currentScreen="shop" />

      <div className="pt-16 pb-6 px-4 max-w-2xl mx-auto">

        {/* Заголовок */}
        <div className="text-center mb-5 animate-fade-scale-in">
          <h1 className="font-orbitron font-black text-2xl md:text-3xl tracking-wider text-white">МАГАЗИН</h1>
          <p className="font-exo text-muted-foreground text-sm mt-1">Эксклюзивные предметы для бойцов</p>
        </div>

        {/* Баланс */}
        <div className="flex gap-3 mb-5 animate-slide-in-bottom delay-100">
          <div className="flex-1 flex items-center gap-3 rounded-xl px-4 py-3"
            style={{ background: "rgba(251,191,36,0.08)", border: "1px solid rgba(251,191,36,0.2)" }}>
            <span className="text-2xl">🪙</span>
            <div>
              <div className="font-orbitron font-bold text-yellow-400">{PLAYER_DATA.coins.toLocaleString()}</div>
              <div className="font-exo text-xs text-muted-foreground">Монеты</div>
            </div>
          </div>
          <div className="flex-1 flex items-center gap-3 rounded-xl px-4 py-3"
            style={{ background: "rgba(0,212,255,0.08)", border: "1px solid rgba(0,212,255,0.2)" }}>
            <span className="text-2xl">💎</span>
            <div>
              <div className="font-orbitron font-bold text-cyan-400">{PLAYER_DATA.crystals.toLocaleString()}</div>
              <div className="font-exo text-xs text-muted-foreground">Кристаллы</div>
            </div>
          </div>
        </div>

        {/* Категории */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-5 animate-slide-in-bottom delay-200 no-scrollbar">
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-full whitespace-nowrap text-sm font-exo font-semibold transition-all duration-200 flex-shrink-0"
              style={{
                background: activeCategory === cat.id ? "rgba(255,140,0,0.2)" : "rgba(255,255,255,0.04)",
                border: activeCategory === cat.id ? "1px solid rgba(255,140,0,0.6)" : "1px solid rgba(255,255,255,0.08)",
                color: activeCategory === cat.id ? "#ff8c00" : "#888",
                boxShadow: activeCategory === cat.id ? "0 0 15px rgba(255,140,0,0.2)" : "none",
              }}
            >
              <span>{cat.icon}</span>
              {cat.label}
            </button>
          ))}
        </div>

        {/* Особое предложение */}
        <div className="rounded-2xl p-5 mb-5 relative overflow-hidden animate-slide-in-bottom delay-200"
          style={{
            background: "linear-gradient(135deg, rgba(251,191,36,0.15), rgba(245,158,11,0.05))",
            border: "1px solid rgba(251,191,36,0.3)",
            boxShadow: "0 0 30px rgba(251,191,36,0.15)",
          }}>
          <div className="absolute top-3 right-3 px-2 py-1 rounded-full text-xs font-orbitron font-bold"
            style={{ background: "#ef4444", color: "white" }}>
            🔥 АКЦИЯ
          </div>
          <div className="flex items-center gap-4">
            <div className="text-5xl">🏆</div>
            <div className="flex-1">
              <div className="font-orbitron font-bold text-white text-sm">БАТЛ ПАСС СЕЗОН 7</div>
              <p className="font-exo text-xs text-muted-foreground mt-1">150+ наград · Эксклюзивные скины · 2x XP</p>
              <div className="flex items-center gap-2 mt-2">
                <span className="font-orbitron font-bold text-yellow-400 text-lg">499 ₽</span>
                <span className="font-exo text-xs line-through text-muted-foreground">749 ₽</span>
                <span className="font-exo text-xs text-green-400">-33%</span>
              </div>
            </div>
            <button className="btn-primary px-4 py-2 rounded-xl text-xs font-orbitron flex-shrink-0"
              onClick={() => handleBuy(99)}>
              {boughtId === 99 ? "✓ КУПЛЕНО" : "КУПИТЬ"}
            </button>
          </div>
        </div>

        {/* Сетка товаров */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 animate-slide-in-bottom delay-300">
          {filtered.map((item, i) => (
            <div key={item.id}
              className="rounded-xl overflow-hidden transition-all duration-200 hover:scale-[1.02] hover:-translate-y-1"
              style={{
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.08)",
                animationDelay: `${0.05 * i}s`,
              }}>
              
              {/* Тег */}
              {item.tag && (
                <div className="px-3 py-1 text-center text-xs font-orbitron font-bold tracking-wider"
                  style={{ background: `${item.tagColor}22`, color: item.tagColor, borderBottom: `1px solid ${item.tagColor}33` }}>
                  {item.tag}
                </div>
              )}
              
              <div className="p-4">
                <div className="flex items-start gap-3">
                  <div className="text-4xl">{item.icon}</div>
                  <div className="flex-1 min-w-0">
                    <div className="font-rajdhani font-bold text-white text-sm">{item.name}</div>
                    <div className="font-exo text-xs text-muted-foreground mt-0.5">{item.desc}</div>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="font-orbitron font-bold text-yellow-400">{item.price} {item.currency}</span>
                      {item.oldPrice && (
                        <span className="font-exo text-xs line-through text-muted-foreground">{item.oldPrice} {item.currency}</span>
                      )}
                    </div>
                  </div>
                </div>
                <button
                  className="w-full mt-3 py-2.5 rounded-xl text-xs font-orbitron font-bold tracking-wider transition-all duration-200"
                  style={{
                    background: boughtId === item.id ? "rgba(34,197,94,0.2)" : "rgba(255,140,0,0.15)",
                    border: boughtId === item.id ? "1px solid rgba(34,197,94,0.5)" : "1px solid rgba(255,140,0,0.4)",
                    color: boughtId === item.id ? "#22c55e" : "#ff8c00",
                  }}
                  onClick={() => handleBuy(item.id)}
                >
                  {boughtId === item.id ? "✓ КУПЛЕНО!" : `КУПИТЬ · ${item.price} ${item.currency}`}
                </button>
              </div>
            </div>
          ))}
        </div>

        <button className="btn-secondary w-full py-3 rounded-xl text-sm mt-4 animate-slide-in-bottom delay-500" onClick={() => onNavigate("menu")}>
          🏠 В МЕНЮ
        </button>
      </div>
    </div>
  );
};

export default Shop;
