import { useEffect, useState } from "react";
import { useLocation } from "wouter";

export default function SplashPage() {
  const [, navigate] = useLocation();
  const [phase, setPhase] = useState<"intro" | "title" | "ready">("intro");

  // Animation sequence
  useEffect(() => {
    const t1 = setTimeout(() => setPhase("title"), 600);
    const t2 = setTimeout(() => setPhase("ready"), 2200);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  return (
    <div
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center overflow-hidden cursor-pointer select-none"
      style={{ background: "radial-gradient(ellipse at 50% 60%, #0a0a2e 0%, #000005 100%)" }}
      onClick={() => navigate("/")}
    >
      {/* Starfield */}
      <Stars />

      {/* Flickering energy lines */}
      <EnergyLines />

      {/* Main content */}
      <div className="relative z-10 flex flex-col items-center gap-6 px-6 text-center">

        {/* Photo — Vegeta-style power portrait */}
        <div
          className="relative transition-all duration-700"
          style={{
            opacity: phase === "intro" ? 0 : 1,
            transform: phase === "intro" ? "scale(0.85) translateY(20px)" : "scale(1) translateY(0)",
          }}
        >
          {/* Aura rings */}
          <div className="absolute inset-0 rounded-full"
            style={{
              background: "radial-gradient(ellipse, rgba(77,144,254,0.35) 0%, transparent 70%)",
              transform: "scale(1.6)",
              animation: "pulse-aura 2.4s ease-in-out infinite",
            }} />
          <div className="absolute inset-0 rounded-full"
            style={{
              background: "radial-gradient(ellipse, rgba(251,191,36,0.2) 0%, transparent 60%)",
              transform: "scale(2.0)",
              animation: "pulse-aura 3s ease-in-out infinite reverse",
            }} />

          {/* Photo frame */}
          <div className="relative rounded-full overflow-hidden"
            style={{
              width: 180,
              height: 180,
              border: "3px solid #fbbf24",
              boxShadow: "0 0 0 2px #1565c0, 0 0 40px rgba(251,191,36,0.5), 0 0 80px rgba(77,144,254,0.3)",
            }}>
            <img
              src="/jesse.jpeg"
              alt="Jesse — Vegeta, Prince of All Saiyans"
              className="w-full h-full object-cover object-top"
              style={{ filter: "contrast(1.1) saturate(1.1)" }}
            />
            {/* Blue power tint overlay */}
            <div className="absolute inset-0 mix-blend-color"
              style={{ background: "rgba(21,101,192,0.15)" }} />
          </div>
        </div>

        {/* Name + character */}
        <div
          className="transition-all duration-700 delay-200"
          style={{
            opacity: phase === "intro" ? 0 : 1,
            transform: phase === "intro" ? "translateY(12px)" : "translateY(0)",
          }}
        >
          <div className="text-xs font-black tracking-[0.4em] uppercase text-amber-400/70 mb-1">
            Created & Commanded by
          </div>
          <div className="text-3xl font-black tracking-wide text-white"
            style={{ textShadow: "0 0 20px rgba(77,144,254,0.8), 0 2px 4px rgba(0,0,0,0.8)" }}>
            Jesse Sanchez
          </div>
          <div className="text-sm font-bold tracking-widest text-blue-400 mt-1"
            style={{ textShadow: "0 0 12px rgba(77,144,254,0.6)" }}>
            👑 VEGETA — PRINCE OF ALL SAIYANS
          </div>
        </div>

        {/* Divider */}
        <div
          className="w-48 h-px transition-all duration-700 delay-300"
          style={{
            background: "linear-gradient(90deg, transparent, #fbbf24, transparent)",
            opacity: phase === "intro" ? 0 : 0.7,
          }}
        />

        {/* Main title */}
        <div
          className="transition-all duration-700 delay-[400ms]"
          style={{
            opacity: phase === "intro" ? 0 : 1,
            transform: phase === "intro" ? "scale(0.92)" : "scale(1)",
          }}
        >
          <div
            className="text-4xl md:text-5xl font-black tracking-tight leading-tight"
            style={{
              background: "linear-gradient(135deg, #fbbf24 0%, #f97316 50%, #fbbf24 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              textShadow: "none",
              filter: "drop-shadow(0 0 20px rgba(251,191,36,0.5))",
            }}
          >
            SANCHEZ
          </div>
          <div
            className="text-lg md:text-xl font-black tracking-[0.3em] uppercase text-white/80 -mt-1"
            style={{ textShadow: "0 0 16px rgba(255,255,255,0.3)" }}
          >
            Tournament of Cleaning
          </div>
        </div>

        {/* Production credit */}
        <div
          className="transition-all duration-700 delay-500"
          style={{
            opacity: phase === "intro" ? 0 : 1,
            transform: phase === "intro" ? "translateY(8px)" : "translateY(0)",
          }}
        >
          <div className="text-xs tracking-widest uppercase text-white/30 mb-0.5">presented by</div>
          <div
            className="text-base font-black italic tracking-wide"
            style={{
              color: "#fbbf24",
              textShadow: "0 0 16px rgba(251,191,36,0.4)",
            }}
          >
            A Fargin Bastage Production
          </div>
        </div>

        {/* Tap to enter */}
        <div
          className="mt-2 transition-all duration-500"
          style={{
            opacity: phase === "ready" ? 1 : 0,
            transform: phase === "ready" ? "translateY(0)" : "translateY(6px)",
          }}
        >
          <div
            className="text-xs font-bold tracking-widest uppercase text-amber-400/60"
            style={{ animation: "blink 1.6s ease-in-out infinite" }}
          >
            — tap to enter —
          </div>
        </div>
      </div>

      {/* Inline keyframe styles */}
      <style>{`
        @keyframes pulse-aura {
          0%, 100% { opacity: 0.6; transform: scale(1.6); }
          50% { opacity: 1; transform: scale(1.75); }
        }
        @keyframes blink {
          0%, 100% { opacity: 0.6; }
          50% { opacity: 0.15; }
        }
        @keyframes twinkle {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.2; }
        }
        @keyframes drift {
          0% { transform: translateX(0) translateY(0); }
          33% { transform: translateX(2px) translateY(-3px); }
          66% { transform: translateX(-2px) translateY(1px); }
          100% { transform: translateX(0) translateY(0); }
        }
        @keyframes energy-flicker {
          0%, 100% { opacity: 0; }
          10%, 11% { opacity: 0.4; }
          20%, 21% { opacity: 0.2; }
          50%, 51% { opacity: 0.3; }
          80%, 81% { opacity: 0.15; }
        }
      `}</style>
    </div>
  );
}

// ─── Starfield ───────────────────────────────────────────────────────────────
function Stars() {
  const stars = Array.from({ length: 80 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 2 + 0.5,
    delay: Math.random() * 4,
    duration: 2 + Math.random() * 3,
  }));

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {stars.map(s => (
        <div
          key={s.id}
          className="absolute rounded-full bg-white"
          style={{
            left: `${s.x}%`,
            top: `${s.y}%`,
            width: s.size,
            height: s.size,
            animation: `twinkle ${s.duration}s ${s.delay}s ease-in-out infinite`,
          }}
        />
      ))}
    </div>
  );
}

// ─── Energy Lines ─────────────────────────────────────────────────────────────
function EnergyLines() {
  const lines = Array.from({ length: 8 }, (_, i) => ({
    id: i,
    angle: i * 22.5,
    delay: i * 0.3,
    color: i % 2 === 0 ? "rgba(77,144,254,0.3)" : "rgba(251,191,36,0.2)",
  }));

  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
      {lines.map(l => (
        <div
          key={l.id}
          className="absolute"
          style={{
            width: "200vmax",
            height: 1,
            background: `linear-gradient(90deg, transparent 0%, ${l.color} 45%, ${l.color} 55%, transparent 100%)`,
            transform: `rotate(${l.angle}deg)`,
            animation: `energy-flicker ${3 + l.id * 0.4}s ${l.delay}s ease-in-out infinite`,
          }}
        />
      ))}
    </div>
  );
}
