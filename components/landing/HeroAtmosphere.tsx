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
      {/* Primary Floating Ambient Glow (Tracks cursor) */}
      <div
        className="absolute w-[600px] h-[600px] sm:w-[900px] sm:h-[900px] rounded-full blur-3xl opacity-35 dark:opacity-25 transition-transform duration-700 ease-out will-change-transform"
        style={{
          background:
            "radial-gradient(circle at center, hsl(var(--accent) / 0.45), hsl(var(--accent) / 0.1) 50%, transparent 75%)",
          left: `${mousePos.x}%`,
          top: `${mousePos.y}%`,
          transform: "translate(-50%, -50%)",
        }}
      />

      {/* Secondary Complementary Orbital Glow */}
      <div
        className="absolute w-[500px] h-[500px] sm:w-[700px] sm:h-[700px] rounded-full blur-3xl opacity-25 dark:opacity-20 animate-pulse duration-10000"
        style={{
          background:
            "radial-gradient(circle at center, hsl(var(--foreground) / 0.15), transparent 70%)",
          right: "15%",
          top: "20%",
          transform: "translate(30%, -20%)",
        }}
      />

      {/* Subtle Studio Grain Overlay */}
      <div
        className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05] mix-blend-overlay pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(hsl(var(--foreground)) 1px, transparent 1px)`,
          backgroundSize: "24px 24px",
        }}
      />
    </div>
  );
}
