// SosSummon.tsx — Emergency "Call on your team!" button with full Shenron sequence

import { useState, useRef, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "../lib/queryClient";
import type { Member } from "@shared/schema";
import { playKamehameha } from "../lib/sounds";

const RHYME_WORDS = [
  "Come", "forth,", "Divine", "Dragon", "and", "grant", "my", "wish,", "peas", "and", "carrots!"
];

// Minimal inline Shenron for the SOS modal
function ShenronMini({ animate }: { animate?: boolean }) {
  return (
    <svg
      viewBox="0 0 200 200"
      width={150}
      height={150}
      aria-label="Shenron"
      style={animate ? { animation: "sos-rise 1.2s cubic-bezier(0.34,1.56,0.64,1) forwards" } : undefined}
    >
      <style>{`
        @keyframes sos-rise {
          0%   { transform: translateY(30px) scale(0.7); opacity: 0; filter: brightness(3) drop-shadow(0 0 20px #00e676); }
          100% { transform: translateY(0) scale(1); opacity: 1; filter: brightness(1) drop-shadow(0 0 8px #00c853); }
        }
        @keyframes sos-float {
          0%, 100% { transform: translateY(0px); }
          50%       { transform: translateY(-5px); }
        }
      `}</style>
      <defs>
        <radialGradient id="sos-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#00e676" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#00c853" stopOpacity="0" />
        </radialGradient>
      </defs>
      <circle cx="100" cy="100" r="95" fill="url(#sos-glow)" />
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
      <path d="M 58 168 Q 70 178 65 185 Q 60 190 72 188" stroke="#2e7d32" strokeWidth="8" fill="none" strokeLinecap="round" />
    </svg>
  );
}

interface SosSummonProps {
  members: Member[];
}

export function SosSummon({ members }: SosSummonProps) {
  const [phase, setPhase] = useState<0 | 1 | 2 | 3 | 4 | 5>(0);
  const [rhymeIdx, setRhymeIdx] = useState(0);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [wishText, setWishText] = useState("");
  const [grantedWish, setGrantedWish] = useState("");
  const [emailFailed, setEmailFailed] = useState(false);
  const rhymeTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => () => { if (rhymeTimer.current) clearInterval(rhymeTimer.current); }, []);

  const sendSos = useMutation({
    mutationFn: async ({ memberName, wish }: { memberName: string; wish: string }) => {
      const r = await apiRequest("POST", "/api/sos", { memberName, wish });
      const data = await r.json();
      if (!r.ok) throw new Error(data.error || "Unknown error");
      return data;
    },
    onSuccess: (_, { memberName, wish }) => {
      // Post SOS to group chat
      apiRequest("POST", "/api/messages", {
        memberId: selectedMember?.id ?? 1,
        content: `🚨 *SOS — ${memberName} NEEDS HELP!* The team has been summoned!\n\n“${wish}”`,
        timestamp: new Date().toISOString(),
      }).then(() => queryClient.invalidateQueries({ queryKey: ["/api/messages"] }));
      setGrantedWish(wish);
      setPhase(5);
    },
    onError: (err: any) => {
      console.error("[SOS] send failed:", err.message);
      setGrantedWish(wishText);
      setEmailFailed(true);
      setPhase(5);
    },
  });

  function startSummon(member: Member) {
    setSelectedMember(member);
    playKamehameha();
    setPhase(1);
    setRhymeIdx(0);

    setTimeout(() => {
      setPhase(2);
      let idx = 0;
      rhymeTimer.current = setInterval(() => {
        idx++;
        setRhymeIdx(idx);
        if (idx >= RHYME_WORDS.length) {
          clearInterval(rhymeTimer.current!);
          setTimeout(() => setPhase(3), 600);
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
    setEmailFailed(false);
    setSelectedMember(null);
    if (rhymeTimer.current) clearInterval(rhymeTimer.current);
  }

  const CHAR_COLORS: Record<string, string> = {
    vegeta: "#1565c0", goku: "#f57f17", gohan: "#2e7d32", bulma: "#7b1fa2",
  };

  return (
    <>
      {/* ── The SOS button panel ── */}
      <div className="mb-6 rounded-xl border-2 border-dashed border-red-800/60 bg-red-950/20 p-4 text-center">
        <p className="text-red-300 font-black text-sm tracking-wide uppercase mb-1">
          🚨 Need help with your chores?
        </p>
        <p className="text-red-200/70 text-xs mb-3">
          Call on your team and summon Shenron now!!!
        </p>
        {/* Pick who you are, then summon */}
        <div className="flex flex-wrap gap-2 justify-center">
          {members.map(m => (
            <button
              key={m.id}
              data-testid={`sos-btn-${m.id}`}
              onClick={() => startSummon(m)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-black border-2 transition-all active:scale-95"
              style={{
                borderColor: CHAR_COLORS[m.character] || "#888",
                color: "#fff",
                backgroundColor: `${CHAR_COLORS[m.character] || "#888"}33`,
              }}
            >
              {m.emoji} {m.name}
            </button>
          ))}
        </div>
      </div>

      {/* ── Summon overlay ── */}
      {phase > 0 && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-hidden"
          style={{
            backgroundColor: phase === 1 ? "rgba(0,0,0,0.92)" : "rgba(0,5,0,0.95)",
            transition: "background-color 1.5s ease",
          }}
          onClick={e => { if (e.target === e.currentTarget && (phase === 4 || phase === 5)) closeModal(); }}
        >
          {/* Background aura */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: phase >= 2
                ? "radial-gradient(ellipse at center, #1a0000 0%, transparent 70%)"
                : "transparent",
              transition: "all 1s ease",
            }}
          />

          {/* Particles */}
          {phase >= 2 && (
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              {Array.from({ length: 16 }).map((_, i) => (
                <div
                  key={i}
                  className="absolute rounded-full"
                  style={{
                    width: `${2 + (i % 3)}px`,
                    height: `${2 + (i % 3)}px`,
                    backgroundColor: i % 2 === 0 ? "#ff5252" : "#f9a825",
                    left: `${5 + (i * 19) % 90}%`,
                    top: `${10 + (i * 23) % 80}%`,
                    animation: `sos-particle ${2 + (i % 3)}s ease-in-out ${(i * 0.3) % 2}s infinite alternate`,
                  }}
                />
              ))}
              <style>{`
                @keyframes sos-particle {
                  from { transform: translateY(0px) scale(1); opacity: 0.4; }
                  to   { transform: translateY(-18px) scale(1.5); opacity: 0.9; }
                }
              `}</style>
            </div>
          )}

          <div
            className="relative max-w-sm w-full rounded-2xl border-2 p-6 text-center shadow-2xl"
            style={{
              backgroundColor: "#0f0404",
              borderColor: "#b71c1c",
              boxShadow: "0 0 60px #ff000033, 0 0 120px #ff000011 inset",
            }}
          >
            <div className="absolute inset-0 rounded-2xl pointer-events-none"
              style={{ boxShadow: "0 0 40px #ff000022 inset" }} />

            {/* Phase 1: sky darkens */}
            {phase === 1 && (
              <div className="py-8">
                <p className="text-4xl mb-4">🚨</p>
                <p className="text-red-300 text-sm animate-pulse font-black tracking-widest uppercase">
                  {selectedMember?.name} calls for help…
                </p>
                <p className="text-red-200/50 text-xs mt-2">The sky grows dark…</p>
              </div>
            )}

            {/* Phase 2: rhyme */}
            {phase === 2 && (
              <div className="py-6">
                <p className="text-4xl mb-4">🐉</p>
                <p className="text-yellow-300 text-lg font-black mb-2 tracking-wide">
                  {RHYME_WORDS.slice(0, rhymeIdx).join(" ")}
                  <span className="animate-pulse">_</span>
                </p>
                <p className="text-red-300/60 text-xs mt-3 tracking-widest uppercase">
                  Summoning the Eternal Dragon…
                </p>
              </div>
            )}

            {/* Phase 3: YouTube + Shenron */}
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

            {/* Phase 4: SOS wish input */}
            {phase === 4 && (
              <>
                <div className="flex justify-center mb-3"
                  style={{ animation: "sos-float 3s ease-in-out infinite" }}>
                  <ShenronMini />
                </div>
                <h2 className="text-lg font-black text-green-400 mb-1">SHENRON APPEARS!</h2>
                <p className="text-sm text-green-200 mb-1 opacity-80">
                  <span className="font-bold text-yellow-300">{selectedMember?.name}</span>, speak your wish.
                  Your team will be summoned to help.
                </p>
                <p className="text-xs text-red-300/60 mb-3 italic">
                  (Your wish will be emailed to the whole family)
                </p>
                <textarea
                  data-testid="sos-wish-input"
                  value={wishText}
                  onChange={e => setWishText(e.target.value)}
                  placeholder="I need help with…"
                  rows={2}
                  className="w-full rounded-xl px-3 py-2 text-sm outline-none resize-none mb-3"
                  style={{ backgroundColor: "#1a0a0a", border: "1px solid #b71c1c", color: "#ffcdd2" }}
                />
                <div className="flex gap-2">
                  <button
                    onClick={closeModal}
                    className="flex-1 py-2 rounded-xl text-sm font-semibold text-red-300 border border-red-900 hover:bg-red-950 transition-colors"
                  >
                    Never mind
                  </button>
                  <button
                    data-testid="sos-grant-btn"
                    disabled={!wishText.trim() || sendSos.isPending}
                    onClick={() => sendSos.mutate({ memberName: selectedMember?.name || "Someone", wish: wishText.trim() })}
                    className="flex-1 py-2 rounded-xl text-sm font-black transition-all disabled:opacity-40"
                    style={{ backgroundColor: "#b71c1c", color: "#fff" }}
                  >
                    {sendSos.isPending ? "Sending…" : "🚨 Call the Team!"}
                  </button>
                </div>
              </>
            )}

            {/* Phase 5: sent */}
            {phase === 5 && (
              <>
                <div className="flex justify-center mb-3">
                  <ShenronMini />
                </div>
                <h2 className="text-lg font-black text-green-400 mb-2">WISH SENT!</h2>
                <p className="text-green-200 text-sm mb-2 italic">"{grantedWish}"</p>
                {emailFailed ? (
                  <p className="text-xs text-red-400 opacity-90 mb-1">
                    ⚠️ Email could not be sent — but your wish was heard.
                  </p>
                ) : (
                  <p className="text-xs text-yellow-300 opacity-80 mb-1">
                    💬 Posted to group chat!
                  </p>
                )}
                <p className="text-xs text-green-400/60 mb-4">
                  Help is on the way, {selectedMember?.name}. Farewell.
                </p>
                <button
                  onClick={closeModal}
                  className="w-full py-2 rounded-xl text-sm font-black"
                  style={{ backgroundColor: "#b71c1c", color: "#fff" }}
                >
                  Thank you, Shenron
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
