"use client";

import * as React from "react";

export function HeroAtmosphere() {
  const [mousePos, setMousePos] = React.useState({ x: 50, y: 35 });
  const targetPos = React.useRef({ x: 50, y: 35 });
  const currentPos = React.useRef({ x: 50, y: 35 });
  const animFrameId = React.useRef<number | null>(null);

  React.useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const { innerWidth, innerHeight } = window;
      targetPos.current = {
        x: Math.round((e.clientX / innerWidth) * 100),
        y: Math.round((e.clientY / innerHeight) * 100),
      };
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });

    // Smooth spring physics loop for mouse following
    const lerp = (start: number, end: number, factor: number) =>
      start + (end - start) * factor;

    const animate = () => {
      currentPos.current.x = lerp(currentPos.current.x, targetPos.current.x, 0.05);
      currentPos.current.y = lerp(currentPos.current.y, targetPos.current.y, 0.05);

      setMousePos({
        x: Number(currentPos.current.x.toFixed(2)),
        y: Number(currentPos.current.y.toFixed(2)),
      });

      animFrameId.current = requestAnimationFrame(animate);
    };

    animFrameId.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      if (animFrameId.current) cancelAnimationFrame(animFrameId.current);
    };
  }, []);

  return (
    <div
      className="absolute inset-0 overflow-hidden pointer-events-none select-none z-0"
      aria-hidden="true"
    >
      {/* Primary Floating Ambient Glow (Tracks cursor with enhanced luminosity) */}
      <div
        className="absolute w-[600px] h-[600px] sm:w-[950px] sm:h-[950px] rounded-full blur-3xl opacity-50 dark:opacity-40 transition-transform duration-700 ease-out will-change-transform"
        style={{
          background:
            "radial-gradient(circle at center, hsl(var(--accent) / 0.6), hsl(var(--accent) / 0.18) 45%, transparent 70%)",
          left: `${mousePos.x}%`,
          top: `${mousePos.y}%`,
          transform: "translate(-50%, -50%)",
        }}
      />

      {/* Secondary Complementary Orbital Glow with Slow Counter Orbit */}
      <div
        className="absolute w-[500px] h-[500px] sm:w-[750px] sm:h-[750px] rounded-full blur-3xl opacity-35 dark:opacity-30 animate-pulse duration-7000"
        style={{
          background:
            "radial-gradient(circle at center, hsl(var(--accent) / 0.35), hsl(var(--foreground) / 0.1) 50%, transparent 70%)",
          right: "12%",
          top: "15%",
          transform: "translate(20%, -15%)",
        }}
      />

      {/* Floating Stardust / Kiln Embers Particle Dust */}
      <div className="absolute inset-0 pointer-events-none">
        {[
          { left: "15%", top: "25%", delay: "0s", duration: "7s", size: "w-1.5 h-1.5" },
          { left: "30%", top: "65%", delay: "1.5s", duration: "9s", size: "w-2 h-2" },
          { left: "50%", top: "18%", delay: "0.8s", duration: "6s", size: "w-1 h-1" },
          { left: "72%", top: "45%", delay: "2.2s", duration: "8s", size: "w-2.5 h-2.5" },
          { left: "85%", top: "28%", delay: "3s", duration: "10s", size: "w-1.5 h-1.5" },
          { left: "22%", top: "80%", delay: "1.2s", duration: "8.5s", size: "w-2 h-2" },
          { left: "65%", top: "75%", delay: "2.8s", duration: "7.5s", size: "w-1.5 h-1.5" },
        ].map((p, idx) => (
          <div
            key={idx}
            className={`absolute ${p.size} rounded-full bg-accent/60 blur-[0.5px] animate-float-slow`}
            style={{
              left: p.left,
              top: p.top,
              animationDelay: p.delay,
              animationDuration: p.duration,
              boxShadow: "0 0 10px 2px hsl(var(--accent) / 0.5)",
            }}
          />
        ))}
      </div>

      {/* Subtle Studio Architectural Grid Overlay */}
      <div
        className="absolute inset-0 opacity-[0.04] dark:opacity-[0.07] mix-blend-overlay pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(to right, hsl(var(--foreground)) 1px, transparent 1px), linear-gradient(to bottom, hsl(var(--foreground)) 1px, transparent 1px)`,
          backgroundSize: "48px 48px",
        }}
      />
    </div>
  );
}
