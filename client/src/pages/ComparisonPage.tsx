import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "../lib/queryClient";
import type { Member, Completion } from "@shared/schema";
import { getScheduleForDate, getDayOfWeek, makeChoreKey, WEEK_A, WEEK_B, type DayOfWeek } from "../lib/choreData";
import { Trophy, Flame, Star } from "lucide-react";
import { useState } from "react";

function toISODate(d: Date) { return d.toISOString().split("T")[0]; }

const MEMBER_COLORS: Record<string, string> = {
  roshi:  "#e65100", goku: "#f57f17", gohan: "#2e7d32", bulma: "#7b1fa2",
};

const CHARACTER_LABELS: Record<string, string> = {
  roshi:  "Master Roshi", goku: "Goku", gohan: "Gohan", bulma: "Bulma",
};

type Period = "week" | "month" | "alltime";

export default function ComparisonPage() {
  const [period, setPeriod] = useState<Period>("week");
  const today = new Date();
  const todayStr = toISODate(today);

  const getDateFrom = (): string => {
    const d = new Date(today);
    if (period === "week") d.setDate(today.getDate() - 7);
    else if (period === "month") d.setDate(today.getDate() - 30);
    else d.setFullYear(today.getFullYear() - 5);
    return toISODate(d);
  };
  const dateFrom = getDateFrom();

  const { data: members = [] } = useQuery<Member[]>({ queryKey: ["/api/members"] });

  // Fetch all four members' completions in a single flat query — no hooks inside loops
  const { data: allCompletions = [] } = useQuery<Completion[]>({
    queryKey: ["/api/completions/all", period, dateFrom, todayStr],
    queryFn: async () => {
      const results: Completion[] = [];
      for (const m of members) {
        const res = await apiRequest("GET", `/api/completions/member/${m.id}?from=${dateFrom}&to=${todayStr}`);
        const data: Completion[] = await res.json();
        results.push(...data);
      }
      return results;
    },
    enabled: members.length > 0,
  });

  const getChores = (member: Member, day: DayOfWeek, week: "A" | "B"): string[] => {
    const schedule = week === "A" ? WEEK_A : WEEK_B;
    return schedule[day]?.[member.name.toLowerCase()] || [];
  };

  const getStats = (member: Member) => {
    const comps = allCompletions.filter(c => c.memberId === member.id && c.completed);

    // Streak
    let streak = 0;
    let d = new Date(today);
    outer: while (true) {
      const dateStr = toISODate(d);
      const dow = getDayOfWeek(d);
      const rot = d.getDay() % 2 === 0 ? "A" : "B" as "A" | "B";
      const chores = getChores(member, dow, rot);
      if (chores.length === 0) { d.setDate(d.getDate() - 1); if (streak === 0) break; continue; }
      const keys = chores.map(c => makeChoreKey(member.name.toLowerCase(), dow, c));
      const allDone = keys.every(key => comps.some(c => c.choreKey === key && c.date === dateStr));
      if (allDone) { streak++; d.setDate(d.getDate() - 1); }
      else break;
    }

    // Perfect days in range
    const start = new Date(dateFrom);
    let perfectDays = 0;
    const cur = new Date(start);
    while (cur <= today) {
      const dateStr = toISODate(cur);
      const dow = getDayOfWeek(cur);
      const rot = cur.getDay() % 2 === 0 ? "A" : "B" as "A" | "B";
      const chores = getChores(member, dow, rot);
      if (chores.length > 0) {
        const keys = chores.map(c => makeChoreKey(member.name.toLowerCase(), dow, c));
        if (keys.every(key => comps.some(c => c.choreKey === key && c.date === dateStr))) {
          perfectDays++;
        }
      }
      cur.setDate(cur.getDate() + 1);
    }

    return { completed: comps.length, streak, perfectDays };
  };

  const stats = members.map(m => ({ member: m, ...getStats(m) }));
  const ranked = [...stats].sort((a, b) => b.completed - a.completed);
  const maxCompleted = Math.max(...stats.map(s => s.completed), 1);
  const MEDAL = ["🥇", "🥈", "🥉", "4️⃣"];

  return (
    <div className="p-4 md:p-8 max-w-3xl mx-auto">
      <h1 className="text-xl font-black tracking-tight mb-2 text-foreground">Power Level Standings</h1>
      <p className="text-muted-foreground text-sm mb-6">Who's carrying the household?</p>

      <div className="flex gap-2 mb-6" data-testid="period-selector">
        {(["week", "month", "alltime"] as Period[]).map(p => (
          <button key={p} data-testid={`period-${p}`} onClick={() => setPeriod(p)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${period === p ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"}`}>
            {p === "week" ? "7 Days" : p === "month" ? "30 Days" : "All Time"}
          </button>
        ))}
      </div>

      <div className="space-y-3 mb-8">
        {ranked.map((s, i) => {
          const color = MEMBER_COLORS[s.member.character] || "#888";
          const pct = Math.round((s.completed / maxCompleted) * 100);
          return (
            <div key={s.member.id} data-testid={`ranking-${s.member.id}`}
              className={`bg-card border border-border rounded-xl p-4 ${i === 0 ? "ring-2 ring-yellow-500/40" : ""}`}>
              <div className="flex items-center gap-4">
                <span className="text-2xl w-8 text-center">{MEDAL[i]}</span>
                <span className="text-2xl">{s.member.emoji}</span>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1.5">
                    <div>
                      <span className="font-bold text-sm text-foreground">{s.member.name}</span>
                      <span className="text-xs text-muted-foreground ml-2">{CHARACTER_LABELS[s.member.character]}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      {s.streak > 0 && (
                        <div className="flex items-center gap-1">
                          <Flame className="w-3.5 h-3.5 text-orange-400" />
                          <span className="text-xs text-orange-400 font-bold">{s.streak}d</span>
                        </div>
                      )}
                      <span className="text-sm font-black text-foreground">{s.completed}</span>
                    </div>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-700"
                      style={{ width: `${pct}%`, backgroundColor: color }} />
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="bg-card border border-border rounded-xl p-4">
        <div className="flex items-center gap-2 mb-4">
          <Trophy className="w-4 h-4 text-yellow-500" />
          <span className="font-bold text-sm text-foreground">Hall of Stats</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {stats.map(s => (
            <div key={s.member.id} data-testid={`stats-card-${s.member.id}`} className="text-center">
              <div className="text-2xl mb-1">{s.member.emoji}</div>
              <div className="text-xs text-muted-foreground mb-2">{s.member.name}</div>
              <div className="space-y-2">
                <div>
                  <div className="flex items-center justify-center gap-1">
                    <Flame className="w-3 h-3 text-orange-400" />
                    <span className="text-base font-black" style={{ color: MEMBER_COLORS[s.member.character] }}>{s.streak}</span>
                  </div>
                  <div className="text-xs text-muted-foreground">streak</div>
                </div>
                <div>
                  <div className="flex items-center justify-center gap-1">
                    <Star className="w-3 h-3 text-yellow-400" />
                    <span className="text-base font-black" style={{ color: MEMBER_COLORS[s.member.character] }}>{s.perfectDays}</span>
                  </div>
                  <div className="text-xs text-muted-foreground">perfect days</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
