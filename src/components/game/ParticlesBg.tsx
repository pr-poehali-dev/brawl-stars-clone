import { useEffect, useRef } from "react";

const ParticlesBg = ({ count = 20, colors = ["#ff8c00", "#a855f7", "#00d4ff"] }) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    const container = ref.current;
    container.innerHTML = "";

    for (let i = 0; i < count; i++) {
      const p = document.createElement("div");
      const size = Math.random() * 4 + 2;
      const color = colors[Math.floor(Math.random() * colors.length)];
      p.style.cssText = `
        position: absolute;
        width: ${size}px;
        height: ${size}px;
        background: ${color};
        border-radius: 50%;
        left: ${Math.random() * 100}%;
        bottom: -10px;
        box-shadow: 0 0 ${size * 2}px ${color};
        animation: float-particle ${5 + Math.random() * 10}s linear ${Math.random() * 5}s infinite;
        opacity: 0;
      `;
      container.appendChild(p);
    }
  }, [count]);

  return (
    <div ref={ref} className="fixed inset-0 pointer-events-none overflow-hidden z-0" />
  );
};

export default ParticlesBg;
