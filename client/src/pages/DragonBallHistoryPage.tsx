import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "../lib/queryClient";
import type { Member, Wish, Completion, ChoreOverride } from "@shared/schema";
import { DragonBallSVG } from "../components/DragonBalls";
import { getScheduleForDate, getDayOfWeek, getWeekRotation, makeChoreKey, WEEK_A, WEEK_B, type DayOfWeek } from "../lib/choreData";
import { Sparkles, ScrollText } from "lucide-react";

function toISODate(d: Date) { return d.toISOString().split("T")[0]; }

function getWeekStart(d: Date): Date {
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  const mon = new Date(d);
  mon.setDate(d.getDate() + diff);
  return mon;
}

const MEMBER_COLORS: Record<string, string> = {
  vegeta: "#4d90fe", goku: "#ffa726", gohan: "#66bb6a", bulma: "#ce93d8",
};

const MEMBER_GLOWS: Record<string, string> = {
  vegeta: "rgba(77,144,254,0.25)",
  goku:   "rgba(255,167,38,0.25)",
  gohan:  "rgba(102,187,106,0.25)",
  bulma:  "rgba(206,147,216,0.25)",
};

const MEMBER_HEADERS: Record<string, string> = {
  vegeta: "char-header-vegeta",
  goku:   "char-header-goku",
  gohan:  "char-header-gohan",
  bulma:  "char-header-bulma",
};

function getRecentWeekStarts(n: number): Date[] {
  const today = new Date();
  const thisWeek = getWeekStart(today);
  return Array.from({ length: n }, (_, i) => {
    const d = new Date(thisWeek);
    d.setDate(thisWeek.getDate() - i * 7);
    return d;
  });
}

export default function DragonBallHistoryPage() {
  const today = new Date();
  const todayStr = toISODate(today);
  const weeks = getRecentWeekStarts(4);

  const { data: members = [] } = useQuery<Member[]>({ queryKey: ["/api/members"] });
  const { data: wishes = [] } = useQuery<Wish[]>({
    queryKey: ["/api/wishes"],
    queryFn: () => apiRequest("GET", "/api/wishes").then(r => r.json()),
  });
  const { data: overrides = [] } = useQuery<ChoreOverride[]>({
    queryKey: ["/api/overrides"],
    queryFn: () => apiRequest("GET", "/api/overrides").then(r => r.json()),
  });

  const fourWeeksAgo = new Date(today);
  fourWeeksAgo.setDate(today.getDate() - 28);

  // Single query per member — no hooks inside loops
  const { data: completionsMap = {} } = useQuery<Record<number, Completion[]>>({
    queryKey: ["/api/completions/history-all", todayStr],
    queryFn: async () => {
      const map: Record<number, Completion[]> = {};
      for (const m of members) {
        const res = await apiRequest("GET", `/api/completions/member/${m.id}?from=${toISODate(fourWeeksAgo)}&to=${todayStr}`);
        map[m.id] = await res.json();
      }
      return map;
    },
    enabled: members.length > 0,
  });

  const getChores = (member: Member, day: DayOfWeek, week: "A" | "B"): string[] => {
    const override = overrides.find(o => o.memberId === member.id && o.week === week && o.day === day);
    if (override) { try { return JSON.parse(override.chores as string); } catch { return []; } }
    const schedule = week === "A" ? WEEK_A : WEEK_B;
    return schedule[day]?.[member.name.toLowerCase()] || [];
  };

  const getBallsForWeek = (member: Member, weekStart: Date): number => {
    const comps = completionsMap[member.id] || [];
    let count = 0;
    for (let i = 0; i < 7; i++) {
      const d = new Date(weekStart);
      d.setDate(weekStart.getDate() + i);
      if (d > today) continue;
      const dateStr = toISODate(d);
      const dow = getDayOfWeek(d);
      const rot = getWeekRotation(d);
      const chores = getChores(member, dow, rot);
      if (chores.length === 0) continue;
      const keys = chores.map(c => makeChoreKey(member.name.toLowerCase(), dow, c));
      if (keys.every(key => comps.some(c => c.choreKey === key && c.completed && c.date === dateStr))) count++;
    }
    return Math.min(count, 7);
  };

  const formatWeekLabel = (ws: Date): string => {
    const end = new Date(ws);
    end.setDate(ws.getDate() + 6);
    const isThisWeek = toISODate(ws) === toISODate(getWeekStart(today));
    if (isThisWeek) return "This Week";
    return `${ws.toLocaleDateString("en-US", { month: "short", day: "numeric" })} – ${end.toLocaleDateString("en-US", { month: "short", day: "numeric" })}`;
  };

  return (
    <div className="p-4 md:p-8 max-w-3xl mx-auto">
      {/* Page header */}
      <div className="flex items-center gap-3 mb-2">
        <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center dbz-gold-glow">
          <Sparkles className="w-5 h-5 text-amber-400" />
        </div>
        <div>
          <h1 className="text-xl font-black tracking-tight dbz-title">Dragon Ball History</h1>
          <p className="text-muted-foreground text-xs">Complete every chore every day to collect all 7 and summon Shenron.</p>
        </div>
      </div>

      <div className="h-px bg-gradient-to-r from-amber-500/40 via-amber-300/20 to-transparent my-6" />

      <div className="space-y-10">
        {weeks.map(ws => {
          const wsStr = toISODate(ws);
          const isThisWeek = wsStr === toISODate(getWeekStart(today));
          return (
            <div key={wsStr}>
              {/* Week label */}
              <div className="flex items-center gap-3 mb-4">
                <div className={`text-xs font-black tracking-widest uppercase px-3 py-1 rounded-full border ${
                  isThisWeek
                    ? "bg-amber-500/20 border-amber-500/50 text-amber-300"
                    : "bg-muted/40 border-border text-muted-foreground"
                }`}>
                  {formatWeekLabel(ws)}
                </div>
                <div className="flex-1 h-px bg-border/50" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {members.map(member => {
                  const balls = getBallsForWeek(member, ws);
                  const wish = wishes.find(w => w.memberId === member.id && w.weekStart === wsStr);
                  const color = MEMBER_COLORS[member.character] || "#888";
                  const glow = MEMBER_GLOWS[member.character] || "transparent";
                  const headerClass = MEMBER_HEADERS[member.character] || "";
                  const hasAll7 = balls === 7;

                  return (
                    <div key={member.id} data-testid={`history-card-${member.id}-${wsStr}`}
                      className={`bg-card rounded-xl overflow-hidden border transition-all ${
                        hasAll7
                          ? "border-amber-400/60 ring-1 ring-amber-400/30"
                          : "border-border"
                      }`}
                      style={hasAll7 ? { boxShadow: `0 0 0 1px ${glow}, 0 4px 32px ${glow}` } : undefined}
                    >
                      {/* Character header stripe */}
                      <div className={`${headerClass} px-4 py-2.5 flex items-center justify-between`}>
                        <div className="flex items-center gap-2">
                          <span className="text-xl">{member.emoji}</span>
                          <span className="font-black text-sm text-white/90">{member.name}</span>
                        </div>
                        {hasAll7 && (
                          <span className="text-xs font-black text-yellow-300 bg-black/30 px-2 py-0.5 rounded-full border border-yellow-400/40">
                            ✨ ALL 7!
                          </span>
                        )}
                      </div>

                      {/* Dragon Balls row */}
                      <div className="px-4 pt-3 pb-2">
                        <div className="flex gap-1.5 mb-3">
                          {[1,2,3,4,5,6,7].map((stars, i) => (
                            <DragonBallSVG key={stars} stars={stars} collected={i < balls} size={30} glowing={hasAll7} />
                          ))}
                        </div>

                        {/* Wish or progress */}
                        {wish ? (
                          <div className="rounded-xl px-3 py-2.5 border text-xs font-medium"
                            style={{
                              backgroundColor: color + "18",
                              borderColor: color + "50",
                              color,
                            }}>
                            <div className="flex items-center gap-1.5 mb-0.5">
                              <span>🐉</span>
                              <span className="font-black opacity-70 text-[10px] uppercase tracking-wider">Wish Granted</span>
                            </div>
                            <p className="italic">"{wish.wish}"</p>
                          </div>
                        ) : hasAll7 ? (
                          <div className="text-xs text-amber-300/70 italic px-1">Wish not yet spoken…</div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                              <div className="h-full rounded-full transition-all"
                                style={{ width: `${(balls / 7) * 100}%`, backgroundColor: color }} />
                            </div>
                            <span className="text-xs font-bold tabular-nums" style={{ color }}>{balls}/7</span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Wish Scroll — vivid history */}
      {wishes.length > 0 && (
        <div className="mt-12">
          <div className="h-px bg-gradient-to-r from-amber-500/40 via-amber-300/20 to-transparent mb-6" />
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center">
              <ScrollText className="w-4 h-4 text-amber-400" />
            </div>
            <h2 className="text-sm font-black tracking-widest uppercase text-amber-300">
              The Wish Scroll
            </h2>
          </div>
          <div className="space-y-2.5">
            {[...wishes].reverse().map(w => {
              const member = members.find(m => m.id === w.memberId);
              if (!member) return null;
              const color = MEMBER_COLORS[member.character] || "#888";
              const glow = MEMBER_GLOWS[member.character] || "transparent";
              const headerClass = MEMBER_HEADERS[member.character] || "";
              const d = new Date(w.grantedAt);
              return (
                <div key={w.id} data-testid={`wish-log-${w.id}`}
                  className="rounded-xl overflow-hidden border border-amber-500/20 bg-card"
                  style={{ boxShadow: `0 2px 16px ${glow}` }}
                >
                  {/* Colored top stripe */}
                  <div className={`${headerClass} px-4 py-2 flex items-center gap-3`}>
                    <span className="text-lg">{member.emoji}</span>
                    <span className="font-black text-sm text-white/90">{member.name}</span>
                    <span className="ml-auto text-[10px] text-white/50">
                      {d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                    </span>
                  </div>
                  <div className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">🐉</span>
                      <p className="text-sm italic font-medium" style={{ color }}>"{w.wish}"</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
