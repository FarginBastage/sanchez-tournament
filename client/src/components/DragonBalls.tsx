// DragonBalls.tsx — animated SVG Dragon Balls + Shenron wish modal

import { useState, useEffect, useRef } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "../lib/queryClient";
import type { Member, Wish } from "@shared/schema";
import { playPowerUp, playKamehameha } from "../lib/sounds";

// Number of stars per ball (1–7)
const STAR_COUNTS = [1, 2, 3, 4, 5, 6, 7];

interface DragonBallProps {
  stars: number;
  collected: boolean;
  size?: number;
  glowing?: boolean;
}

function StarPath({ cx, cy, r }: { cx: number; cy: number; r: number }) {
  const pts = Array.from({ length: 5 }, (_, i) => {
    const outer = (Math.PI * 2 * i) / 5 - Math.PI / 2;
    const inner = outer + Math.PI / 5;
    return [
      Math.cos(outer) * r + cx, Math.sin(outer) * r + cy,
      Math.cos(inner) * (r * 0.42) + cx, Math.sin(inner) * (r * 0.42) + cy,
    ];
  }).flat();
  const d = pts.reduce((acc, v, i) => {
    if (i === 0) return `M ${v}`;
    if (i % 2 === 0 && i > 0) return `${acc} L ${v}`;
    return `${acc} ${v}`;
  }, "");
  return <path d={d + " Z"} fill="#c62828" />;
}

function DragonBallSVG({ stars, collected, size = 48, glowing = false }: DragonBallProps) {
  const s = size;
  const cx = s / 2, cy = s / 2, r = s / 2 - 2;

  const starLayouts: Record<number, [number, number][]> = {
    1: [[cx, cy]],
    2: [[cx - 8, cy - 5], [cx + 8, cy + 5]],
    3: [[cx, cy - 9], [cx - 8, cy + 5], [cx + 8, cy + 5]],
    4: [[cx - 7, cy - 7], [cx + 7, cy - 7], [cx - 7, cy + 7], [cx + 7, cy + 7]],
    5: [[cx, cy - 10], [cx - 9, cy - 2], [cx + 9, cy - 2], [cx - 6, cy + 9], [cx + 6, cy + 9]],
    6: [[cx - 8, cy - 8], [cx + 8, cy - 8], [cx - 10, cy], [cx + 10, cy], [cx - 8, cy + 8], [cx + 8, cy + 8]],
    7: [[cx, cy - 11], [cx - 9, cy - 5], [cx + 9, cy - 5], [cx - 11, cy + 4], [cx + 11, cy + 4], [cx - 6, cy + 11], [cx + 6, cy + 11]],
  };

  const positions = (starLayouts[stars] || [[cx, cy]]).map(([x, y]) => [
    (x / s) * s, (y / s) * s
  ] as [number, number]);

  return (
    <svg
      viewBox={`0 0 ${s} ${s}`}
      width={s}
      height={s}
      style={{
        filter: collected
          ? glowing
            ? `drop-shadow(0 0 8px #f9a825) drop-shadow(0 0 16px #ff8f00)`
            : `drop-shadow(0 0 4px #f9a82588)`
          : "grayscale(1) opacity(0.3)",
        transition: "filter 0.4s ease",
      }}
    >
      <defs>
        <radialGradient id={`bg-${stars}`} cx="38%" cy="32%" r="60%">
          <stop offset="0%" stopColor={collected ? "#fff176" : "#bbb"} />
          <stop offset="50%" stopColor={collected ? "#ffa000" : "#888"} />
          <stop offset="100%" stopColor={collected ? "#e65100" : "#555"} />
        </radialGradient>
        <radialGradient id={`shine-${stars}`} cx="30%" cy="25%" r="45%">
          <stop offset="0%" stopColor="rgba(255,255,255,0.55)" />
          <stop offset="100%" stopColor="rgba(255,255,255,0)" />
        </radialGradient>
      </defs>
      <circle cx={cx} cy={cy} r={r} fill={`url(#bg-${stars})`} />
      {positions.map(([x, y], i) => (
        <StarPath key={i} cx={x} cy={y} r={s * 0.095} />
      ))}
      <ellipse cx={cx * 0.72} cy={cy * 0.55} rx={r * 0.38} ry={r * 0.22}
        fill={`url(#shine-${stars})`} />
    </svg>
  );
}

// Shenron SVG
function ShenronSVG({ size = 240, animate = false }: { size?: number; animate?: boolean }) {
  return (
    <svg
      viewBox="0 0 200 200"
      width={size}
      height={size}
      aria-label="Shenron the Eternal Dragon"
      style={animate ? {
        animation: "shenron-rise 1.2s cubic-bezier(0.34,1.56,0.64,1) forwards",
      } : undefined}
    >
      <style>{`
        @keyframes shenron-rise {
          0%   { transform: translateY(40px) scale(0.6); opacity: 0; filter: brightness(3) drop-shadow(0 0 30px #00e676); }
          60%  { filter: brightness(1.5) drop-shadow(0 0 20px #00e676); opacity: 1; }
          100% { transform: translateY(0) scale(1); opacity: 1; filter: brightness(1) drop-shadow(0 0 8px #00c853); }
        }
        @keyframes shenron-float {
          0%, 100% { transform: translateY(0px); }
          50%       { transform: translateY(-6px); }
        }
      `}</style>
      <defs>
        <radialGradient id="shenron-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#00e676" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#00c853" stopOpacity="0" />
        </radialGradient>
      </defs>
      <circle cx="100" cy="100" r="95" fill="url(#shenron-glow)" />
      <path d="M 60 170 Q 30 140 50 110 Q 70 80 100 90 Q 130 100 140 70 Q 150 40 130 20 Q 120 10 110 18"
        stroke="#2e7d32" strokeWidth="18" fill="none" strokeLinecap="round" />
      <path d="M 60 170 Q 30 140 50 110 Q 70 80 100 90 Q 130 100 140 70 Q 150 40 130 20 Q 120 10 110 18"
        stroke="#43a047" strokeWidth="14" fill="none" strokeLinecap="round" />
      <path d="M 65 162 Q 38 138 55 112 Q 72 86 100 94 Q 128 103 137 74 Q 146 46 128 24"
        stroke="#66bb6a" strokeWidth="6" fill="none" strokeLinecap="round" opacity="0.5" />
      <ellipse cx="108" cy="22" rx="14" ry="10" fill="#2e7d32" />
      <ellipse cx="108" cy="22" rx="11" ry="7" fill="#388e3c" />
      <circle cx="103" cy="18" r="3" fill="#ff1744" />
      <circle cx="113" cy="18" r="3" fill="#ff1744" />
      <circle cx="103" cy="18" r="1.5" fill="#fff" />
      <circle cx="113" cy="18" r="1.5" fill="#fff" />
      <line x1="100" y1="14" x2="93" y2="5" stroke="#1b5e20" strokeWidth="3" strokeLinecap="round" />
      <line x1="116" y1="14" x2="123" y2="5" stroke="#1b5e20" strokeWidth="3" strokeLinecap="round" />
      <line x1="96" y1="24" x2="80" y2="20" stroke="#81c784" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="96" y1="27" x2="79" y2="28" stroke="#81c784" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="120" y1="24" x2="136" y2="20" stroke="#81c784" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="120" y1="27" x2="137" y2="28" stroke="#81c784" strokeWidth="1.5" strokeLinecap="round" />
      <g transform="translate(48, 108) rotate(-30)">
        <line x1="0" y1="0" x2="-8" y2="-6" stroke="#1b5e20" strokeWidth="3" strokeLinecap="round" />
        <line x1="0" y1="0" x2="-10" y2="0" stroke="#1b5e20" strokeWidth="3" strokeLinecap="round" />
        <line x1="0" y1="0" x2="-8" y2="6" stroke="#1b5e20" strokeWidth="3" strokeLinecap="round" />
      </g>
      <g transform="translate(132, 72) rotate(20)">
        <line x1="0" y1="0" x2="8" y2="-6" stroke="#1b5e20" strokeWidth="3" strokeLinecap="round" />
        <line x1="0" y1="0" x2="10" y2="0" stroke="#1b5e20" strokeWidth="3" strokeLinecap="round" />
        <line x1="0" y1="0" x2="8" y2="6" stroke="#1b5e20" strokeWidth="3" strokeLinecap="round" />
      </g>
      <path d="M 58 168 Q 70 178 65 185 Q 60 190 72 188" stroke="#2e7d32" strokeWidth="8" fill="none" strokeLinecap="round" />
      <circle cx="30" cy="50" r="2" fill="#f9a825" opacity="0.7" />
      <circle cx="170" cy="40" r="1.5" fill="#f9a825" opacity="0.6" />
      <circle cx="160" cy="155" r="2" fill="#f9a825" opacity="0.5" />
      <circle cx="40" cy="145" r="1.5" fill="#f9a825" opacity="0.6" />
      <circle cx="100" cy="170" r="2.5" fill="#f9a825" opacity="0.8" />
    </svg>
  );
}

// ── Summon sequence phases ────────────────────────────────────────────────────
// Phase 0: not started
// Phase 1: sky darkens, balls glow (1.5s)
// Phase 2: rhyme appears word by word (3s)
// Phase 3: Shenron rises with animation
// Phase 4: wish input shown
// Phase 5: wish granted

const RHYME_WORDS = [
  "Come", "forth,", "Divine", "Dragon", "and", "grant", "my", "wish,", "peas", "and", "carrots!"
];

// ── Main exported component ───────────────────────────────────────────────────

interface DragonBallTrackerProps {
  member: Member;
  ballsCollected: number;
  weekStart: string;
}

export function DragonBallTracker({ member, ballsCollected, weekStart }: DragonBallTrackerProps) {
  const [phase, setPhase] = useState<0|1|2|3|4|5>(0);
  const [rhymeIdx, setRhymeIdx] = useState(0);
  const [wishText, setWishText] = useState("");
  const [grantedWish, setGrantedWish] = useState("");
  const prevBalls = useRef(ballsCollected);
  const rhymeTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  // Play power-up when a new ball is earned
  useEffect(() => {
    if (ballsCollected > prevBalls.current) playPowerUp();
    prevBalls.current = ballsCollected;
  }, [ballsCollected]);

  // Clean up timer on unmount
  useEffect(() => () => { if (rhymeTimer.current) clearInterval(rhymeTimer.current); }, []);

  const { data: wishes = [] } = useQuery<Wish[]>({
    queryKey: ["/api/wishes"],
    queryFn: () => apiRequest("GET", "/api/wishes").then(r => r.json()),
  });

  const existingWish = wishes.find(w => w.memberId === member.id && w.weekStart === weekStart);
  const allCollected = ballsCollected >= 7;

  const grantWish = useMutation({
    mutationFn: (wish: string) =>
      apiRequest("POST", "/api/wishes", { memberId: member.id, weekStart, wish, memberName: member.name }).then(r => r.json()),
    onSuccess: (_, wish) => {
      queryClient.invalidateQueries({ queryKey: ["/api/wishes"] });
      // Post to group chat so everyone sees the wish
      apiRequest("POST", "/api/messages", {
        memberId: member.id,
        content: `🐉 *SHENRON HAS BEEN SUMMONED!* Come forth, Divine Dragon and grant my wish, peas and carrots!\n\n“${wish}”`,
        timestamp: new Date().toISOString(),
      }).then(() => queryClient.invalidateQueries({ queryKey: ["/api/messages"] }));
      setGrantedWish(wish);
      setPhase(5);
    },
  });

  function startSummon() {
    playKamehameha();
    setPhase(1);
    setRhymeIdx(0);

    // Phase 1 → 2 after 1.5s
    setTimeout(() => {
      setPhase(2);
      let idx = 0;
      rhymeTimer.current = setInterval(() => {
        idx++;
        setRhymeIdx(idx);
        if (idx >= RHYME_WORDS.length) {
          clearInterval(rhymeTimer.current!);
          // Phase 2 → 3 (Shenron rises)
          setTimeout(() => setPhase(3), 600);
          // Phase 3 → 4 (wish form) after full short (~33s)
          setTimeout(() => setPhase(4), 33000);
        }
      }, 240);
    }, 1500);
  }

  function closeModal() {
    setPhase(0);
    setRhymeIdx(0);
    setWishText("");
    setGrantedWish("");
    if (rhymeTimer.current) clearInterval(rhymeTimer.current);
  }

  const MEMBER_COLORS: Record<string, string> = {
    roshi:  "#e65100", goku: "#f57f17", gohan: "#2e7d32", bulma: "#7b1fa2",
  };
  const color = MEMBER_COLORS[member.character] || "#888";

  return (
    <>
      <div className="flex flex-col items-center gap-2">
        {/* Dragon Balls row */}
        <div className="flex gap-1 flex-wrap justify-center">
          {STAR_COUNTS.map((stars, i) => (
            <div
              key={stars}
              data-testid={`dragonball-${member.id}-${stars}`}
              title={i < ballsCollected ? `Day ${stars} — collected!` : `Day ${stars} — not yet`}
              className="cursor-default"
            >
              <DragonBallSVG
                stars={stars}
                collected={i < ballsCollected}
                size={32}
                glowing={allCollected}
              />
            </div>
          ))}
        </div>

        {/* Summon button or wish display */}
        {allCollected && !existingWish && phase === 0 && (
          <button
            data-testid={`summon-btn-${member.id}`}
            onClick={startSummon}
            className="mt-1 text-xs font-black tracking-wide px-3 py-1 rounded-full animate-pulse"
            style={{ backgroundColor: color, color: "#fff" }}
          >
            ✨ SUMMON SHENRON
          </button>
        )}
        {existingWish && (
          <div className="text-xs text-center text-muted-foreground italic max-w-[180px]">
            🐉 Wish: "{existingWish.wish}"
          </div>
        )}
        {!allCollected && (
          <div className="text-xs text-muted-foreground">
            {ballsCollected}/7 Dragon Balls
          </div>
        )}
      </div>

      {/* ── Summon overlay ── */}
      {phase > 0 && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-hidden"
          style={{
            backgroundColor: phase === 1
              ? "rgba(0,0,0,0.92)"
              : "rgba(0,5,0,0.95)",
            transition: "background-color 1.5s ease",
          }}
          onClick={e => { if (e.target === e.currentTarget && (phase === 4 || phase === 5)) closeModal(); }}
        >
          {/* Background aura */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: phase >= 2
                ? "radial-gradient(ellipse at center, #003300 0%, transparent 70%)"
                : "transparent",
              transition: "all 1s ease",
            }}
          />

          {/* Floating light particles */}
          {phase >= 2 && (
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              {Array.from({ length: 18 }).map((_, i) => (
                <div
                  key={i}
                  className="absolute rounded-full"
                  style={{
                    width: `${2 + (i % 3)}px`,
                    height: `${2 + (i % 3)}px`,
                    backgroundColor: i % 3 === 0 ? "#f9a825" : "#00e676",
                    left: `${5 + (i * 17) % 90}%`,
                    top: `${10 + (i * 23) % 80}%`,
                    opacity: 0.6,
                    animation: `float-particle ${2 + (i % 3)}s ease-in-out ${(i * 0.3) % 2}s infinite alternate`,
                  }}
                />
              ))}
              <style>{`
                @keyframes float-particle {
                  from { transform: translateY(0px) scale(1); opacity: 0.4; }
                  to   { transform: translateY(-20px) scale(1.5); opacity: 0.9; }
                }
              `}</style>
            </div>
          )}

          <div
            className="relative max-w-sm w-full rounded-2xl border-2 p-6 text-center shadow-2xl"
            style={{
              backgroundColor: "#060f06",
              borderColor: "#2e7d32",
              boxShadow: "0 0 60px #00e67633, 0 0 120px #00c85311 inset",
              transform: phase === 1 ? "scale(0.95)" : "scale(1)",
              transition: "transform 0.5s ease",
            }}
          >
            {/* Inner glow ring */}
            <div className="absolute inset-0 rounded-2xl pointer-events-none"
              style={{ boxShadow: "0 0 40px #00e67644 inset" }} />

            {/* Phase 1: sky darkens + all balls pulse */}
            {phase === 1 && (
              <div className="py-8">
                <div className="flex gap-2 justify-center mb-6">
                  {STAR_COUNTS.map((stars) => (
                    <DragonBallSVG key={stars} stars={stars} collected size={28} glowing />
                  ))}
                </div>
                <p className="text-green-300 text-sm animate-pulse font-semibold tracking-widest uppercase">
                  The sky grows dark…
                </p>
              </div>
            )}

            {/* Phase 2: rhyme appears */}
            {phase === 2 && (
              <div className="py-6">
                <div className="flex gap-2 justify-center mb-4">
                  {STAR_COUNTS.map((stars) => (
                    <DragonBallSVG key={stars} stars={stars} collected size={24} glowing />
                  ))}
                </div>
                <p className="text-yellow-300 text-lg font-black mb-2 tracking-wide">
                  {RHYME_WORDS.slice(0, rhymeIdx).join(" ")}
                  <span className="animate-pulse">_</span>
                </p>
                <p className="text-green-400 text-xs opacity-60 mt-3 tracking-widest uppercase">
                  The Dragon Balls are glowing…
                </p>
              </div>
            )}

            {/* Phase 3: Shenron rises — YouTube video plays */}
            {phase === 3 && (
              <div className="py-2">
                <p className="text-yellow-300 text-base font-black mb-3">
                  {RHYME_WORDS.join(" ")}
                </p>
                <div className="relative w-full rounded-xl overflow-hidden mb-3" style={{ paddingBottom: "56.25%" }}>
                  <iframe
                    src="https://www.youtube.com/embed/UQMP6lo75fo?autoplay=1&mute=0&controls=0&loop=1&playlist=UQMP6lo75fo&modestbranding=1&rel=0"
                    className="absolute inset-0 w-full h-full"
                    allow="autoplay; encrypted-media"
                    allowFullScreen
                    title="Super Shenron Summoning"
                  />
                </div>
                <p className="text-green-300 text-sm animate-pulse font-semibold">
                  SHENRON RISES…
                </p>
              </div>
            )}

            {/* Phase 4: wish input */}
            {phase === 4 && (
              <>
                <div className="flex justify-center mb-3"
                  style={{ animation: "shenron-float 3s ease-in-out infinite" }}>
                  <style>{`
                    @keyframes shenron-float {
                      0%, 100% { transform: translateY(0px); }
                      50%       { transform: translateY(-6px); }
                    }
                  `}</style>
                  <ShenronSVG size={160} />
                </div>
                <h2 className="text-lg font-black text-green-400 mb-1">SHENRON APPEARS!</h2>
                <p className="text-sm text-green-200 mb-4 opacity-80">
                  I am the Eternal Dragon. You have collected all seven Dragon Balls,{" "}
                  <span className="font-bold text-yellow-300">{member.name}</span>.
                  Speak your wish — it will be heard by all.
                </p>
                <textarea
                  data-testid="wish-input"
                  value={wishText}
                  onChange={e => setWishText(e.target.value)}
                  placeholder="State your wish…"
                  rows={2}
                  className="w-full rounded-xl px-3 py-2 text-sm outline-none resize-none mb-3"
                  style={{ backgroundColor: "#1a2e1a", border: "1px solid #2e7d32", color: "#c8e6c9" }}
                />
                <div className="flex gap-2">
                  <button
                    onClick={closeModal}
                    className="flex-1 py-2 rounded-xl text-sm font-semibold text-green-300 border border-green-900 hover:bg-green-950 transition-colors"
                  >
                    Later
                  </button>
                  <button
                    data-testid="grant-wish-btn"
                    disabled={!wishText.trim() || grantWish.isPending}
                    onClick={() => grantWish.mutate(wishText.trim())}
                    className="flex-1 py-2 rounded-xl text-sm font-black transition-all disabled:opacity-40"
                    style={{ backgroundColor: "#2e7d32", color: "#fff" }}
                  >
                    {grantWish.isPending ? "Sending…" : "Grant My Wish!"}
                  </button>
                </div>
              </>
            )}

            {/* Phase 5: granted */}
            {phase === 5 && (
              <>
                <div className="flex justify-center mb-3">
                  <ShenronSVG size={140} />
                </div>
                <h2 className="text-lg font-black text-green-400 mb-2">YOUR WISH IS GRANTED!</h2>
                <p className="text-green-200 text-sm mb-2 italic">"{grantedWish || existingWish?.wish}"</p>
                <p className="text-xs text-yellow-300 opacity-80 mb-1">
                  📧 The whole family has been notified.
                </p>
                <p className="text-xs text-green-400 opacity-60 mb-4">
                  Until we meet again, {member.name}. Farewell.
                </p>
                <button
                  onClick={closeModal}
                  className="w-full py-2 rounded-xl text-sm font-black"
                  style={{ backgroundColor: "#2e7d32", color: "#fff" }}
                >
                  Farewell, Shenron
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}

export { DragonBallSVG };
