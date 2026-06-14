import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "../lib/queryClient";
import { getDayOfWeek, getWeekRotation, makeChoreKey, WEEK_A, WEEK_B } from "../lib/choreData";
import type { Member, Completion, ChoreOverride } from "@shared/schema";
import { ChevronLeft, ChevronRight, CheckCircle2, Circle, Calendar, CalendarDays, X } from "lucide-react";

function toISODate(d: Date) { return d.toISOString().split("T")[0]; }

function getWeekStart(d: Date): Date {
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  const n = new Date(d);
  n.setDate(d.getDate() + diff);
  return n;
}

const CHAR_STYLES: Record<string, { accent: string; header: string; glow: string }> = {
  vegeta: { accent: "#4d90fe", header: "char-header-vegeta", glow: "rgba(77,144,254,0.3)" },
  goku:   { accent: "#ffa726", header: "char-header-goku",   glow: "rgba(255,167,38,0.3)" },
  gohan:  { accent: "#66bb6a", header: "char-header-gohan",  glow: "rgba(102,187,106,0.3)" },
  bulma:  { accent: "#ce93d8", header: "char-header-bulma",  glow: "rgba(206,147,216,0.3)" },
};

const DOT_COLORS: Record<string, string> = {
  vegeta: "#4d90fe", goku: "#ffa726", gohan: "#66bb6a", bulma: "#ce93d8",
};

type ViewMode = "month" | "week";

// ─── Day Detail Panel ────────────────────────────────────────────────────────
interface DayDetailProps {
  date: Date;
  members: Member[];
  completions: Completion[];
  overrides: ChoreOverride[];
  onClose: () => void;
}

function DayDetail({ date, members, completions, overrides, onClose }: DayDetailProps) {
  const dayOfWeek = getDayOfWeek(date);
  const rotation = getWeekRotation(date);

  function getChores(member: Member): string[] {
    const override = overrides.find(
      o => o.memberId === member.id && o.week === rotation && o.day === dayOfWeek
    );
    if (override) { try { return JSON.parse(override.chores as string); } catch { return []; } }
    const schedule = rotation === "A" ? WEEK_A : WEEK_B;
    return schedule[dayOfWeek]?.[member.name.toLowerCase()] || [];
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-6 bg-black/70 backdrop-blur-sm"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="w-full sm:max-w-2xl max-h-[85vh] overflow-y-auto rounded-t-2xl sm:rounded-2xl bg-background border border-amber-500/30 shadow-2xl"
        style={{ boxShadow: "0 0 40px rgba(251,191,36,0.15)" }}>

        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between px-5 py-4 bg-background border-b border-border">
          <div>
            <div className="text-lg font-black dbz-title">
              {date.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
            </div>
            <div className="text-xs text-amber-400 font-bold mt-0.5">Week {rotation}</div>
          </div>
          <button onClick={onClose}
            className="p-2 rounded-xl hover:bg-muted transition-colors text-muted-foreground hover:text-foreground">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Member chore cards */}
        <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
          {members.map(member => {
            const chores = getChores(member);
            const style = CHAR_STYLES[member.character] || CHAR_STYLES.goku;
            const keys = chores.map(c => makeChoreKey(member.name.toLowerCase(), dayOfWeek, c));
            const done = keys.filter(k => completions.some(c => c.memberId === member.id && c.choreKey === k && c.completed));
            const pct = chores.length > 0 ? Math.round((done.length / chores.length) * 100) : 0;

            return (
              <div key={member.id} className="rounded-xl border border-border overflow-hidden"
                style={{ boxShadow: `0 2px 12px ${style.glow}` }}>
                {/* Character header */}
                <div className={`${style.header} px-4 py-2.5 flex items-center justify-between`}>
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{member.emoji}</span>
                    <span className="font-black text-sm text-white/90">{member.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-white/70 font-bold">{done.length}/{chores.length}</span>
                    {done.length === chores.length && chores.length > 0 && (
                      <span className="text-xs font-black text-yellow-300">✓</span>
                    )}
                  </div>
                </div>

                {/* Progress bar */}
                <div className="h-1 bg-muted">
                  <div className="h-full transition-all" style={{ width: `${pct}%`, backgroundColor: style.accent }} />
                </div>

                {/* Chore list */}
                <div className="px-4 py-3 space-y-1.5">
                  {chores.length === 0 ? (
                    <p className="text-xs text-muted-foreground italic">No chores today</p>
                  ) : chores.map(chore => {
                    const key = makeChoreKey(member.name.toLowerCase(), dayOfWeek, chore);
                    const isDone = completions.some(c => c.memberId === member.id && c.choreKey === key && c.completed);
                    return (
                      <div key={key} className={`flex items-center gap-2 text-sm ${isDone ? "text-primary" : "text-foreground/80"}`}>
                        {isDone
                          ? <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0 text-primary" />
                          : <Circle className="w-3.5 h-3.5 flex-shrink-0 text-muted-foreground" />}
                        <span className={isDone ? "line-through opacity-50" : ""}>{chore}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── Member completion dots for a cell ──────────────────────────────────────
interface CellDotsProps {
  date: Date;
  members: Member[];
  completionsMap: Record<string, Completion[]>;
  overrides: ChoreOverride[];
  compact?: boolean;
}

function CellDots({ date, members, completionsMap, overrides, compact }: CellDotsProps) {
  const dateStr = toISODate(date);
  const pool = completionsMap[dateStr] || [];
  const dayOfWeek = getDayOfWeek(date);
  const rotation = getWeekRotation(date);

  return (
    <div className={`flex gap-0.5 flex-wrap justify-center ${compact ? "mt-0.5" : "mt-1"}`}>
      {members.map(member => {
        function getChores() {
          const override = overrides.find(
            o => o.memberId === member.id && o.week === rotation && o.day === dayOfWeek
          );
          if (override) { try { return JSON.parse(override.chores as string); } catch { return []; } }
          const schedule = rotation === "A" ? WEEK_A : WEEK_B;
          return schedule[dayOfWeek]?.[member.name.toLowerCase()] || [];
        }
        const chores = getChores();
        if (chores.length === 0) return <div key={member.id} className={`${compact ? "w-1.5 h-1.5" : "w-2 h-2"} rounded-full bg-muted/30`} />;
        const keys = chores.map((c: string) => makeChoreKey(member.name.toLowerCase(), dayOfWeek, c));
        const allDone = keys.every((k: string) => pool.some((c: Completion) => c.memberId === member.id && c.choreKey === k && c.completed));
        const anyDone = keys.some((k: string) => pool.some((c: Completion) => c.memberId === member.id && c.choreKey === k && c.completed));
        const color = DOT_COLORS[member.character] || "#888";
        return (
          <div key={member.id}
            className={`${compact ? "w-1.5 h-1.5" : "w-2 h-2"} rounded-full transition-all`}
            style={{
              backgroundColor: allDone ? color : anyDone ? color + "80" : "transparent",
              border: `1.5px solid ${color}`,
              boxShadow: allDone ? `0 0 4px ${color}` : "none",
            }}
          />
        );
      })}
    </div>
  );
}

// ─── Month View ──────────────────────────────────────────────────────────────
interface MonthViewProps {
  viewYear: number;
  viewMonth: number;
  today: Date;
  selectedDate: Date | null;
  members: Member[];
  completionsMap: Record<string, Completion[]>;
  overrides: ChoreOverride[];
  onSelectDate: (d: Date) => void;
}

function MonthView({ viewYear, viewMonth, today, selectedDate, members, completionsMap, overrides, onSelectDate }: MonthViewProps) {
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const firstDow = new Date(viewYear, viewMonth, 1).getDay();
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const blanks = Array.from({ length: firstDow });

  const todayStr = toISODate(today);

  return (
    <div className="grid grid-cols-7 border-t border-border">
      {blanks.map((_, i) => (
        <div key={`b-${i}`} className="border-b border-r border-border/40 min-h-[80px] md:min-h-[100px] bg-muted/10" />
      ))}
      {days.map(d => {
        const cellDate = new Date(viewYear, viewMonth, d);
        const dateStr = toISODate(cellDate);
        const isToday = dateStr === todayStr;
        const isSel = selectedDate && toISODate(selectedDate) === dateStr;
        const isFuture = dateStr > todayStr;

        return (
          <button
            key={d}
            data-testid={`calendar-day-${d}`}
            onClick={() => onSelectDate(cellDate)}
            className={`group border-b border-r border-border/40 min-h-[80px] md:min-h-[100px] p-2 flex flex-col items-center transition-all text-left
              ${isSel ? "bg-amber-500/15 ring-inset ring-2 ring-amber-400/60" : "hover:bg-muted/50"}
              ${isFuture ? "opacity-40" : ""}`}
          >
            {/* Day number */}
            <div className={`w-7 h-7 flex items-center justify-center rounded-full text-sm font-black transition-all
              ${isToday ? "bg-amber-500 text-black shadow-lg shadow-amber-500/40" : "text-foreground group-hover:text-amber-300"}`}>
              {d}
            </div>

            {/* Member dots */}
            {!isFuture && (
              <CellDots
                date={cellDate}
                members={members}
                completionsMap={completionsMap}
                overrides={overrides}
                compact
              />
            )}
          </button>
        );
      })}
    </div>
  );
}

// ─── Week View ───────────────────────────────────────────────────────────────
interface WeekViewProps {
  weekStart: Date;
  today: Date;
  selectedDate: Date | null;
  members: Member[];
  completionsMap: Record<string, Completion[]>;
  overrides: ChoreOverride[];
  onSelectDate: (d: Date) => void;
}

function WeekView({ weekStart, today, selectedDate, members, completionsMap, overrides, onSelectDate }: WeekViewProps) {
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart);
    d.setDate(weekStart.getDate() + i);
    return d;
  });
  const todayStr = toISODate(today);

  return (
    <div className="grid grid-cols-7 border-t border-border">
      {days.map((day, idx) => {
        const dateStr = toISODate(day);
        const isToday = dateStr === todayStr;
        const isSel = selectedDate && toISODate(selectedDate) === dateStr;
        const isFuture = dateStr > todayStr;
        const dayOfWeek = getDayOfWeek(day);
        const rotation = getWeekRotation(day);
        const pool = completionsMap[dateStr] || [];

        function getChores(member: Member): string[] {
          const override = overrides.find(o => o.memberId === member.id && o.week === rotation && o.day === dayOfWeek);
          if (override) { try { return JSON.parse(override.chores as string); } catch { return []; } }
          const schedule = rotation === "A" ? WEEK_A : WEEK_B;
          return schedule[dayOfWeek]?.[member.name.toLowerCase()] || [];
        }

        return (
          <button key={dateStr}
            onClick={() => onSelectDate(day)}
            className={`group border-r border-border/40 min-h-[260px] md:min-h-[320px] p-3 flex flex-col gap-2 transition-all text-left
              ${isSel ? "bg-amber-500/15 ring-inset ring-2 ring-amber-400/60" : "hover:bg-muted/40"}
              ${isFuture ? "opacity-40" : ""}`}
          >
            {/* Day label */}
            <div className="flex flex-col items-center gap-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                {["Sun","Mon","Tue","Wed","Thu","Fri","Sat"][idx]}
              </span>
              <div className={`w-8 h-8 flex items-center justify-center rounded-full text-sm font-black
                ${isToday ? "bg-amber-500 text-black shadow-lg shadow-amber-500/40" : "text-foreground group-hover:text-amber-300"}`}>
                {day.getDate()}
              </div>
            </div>

            {/* Per-member chore summary */}
            {!isFuture && members.map(member => {
              const chores = getChores(member);
              if (chores.length === 0) return null;
              const keys = chores.map(c => makeChoreKey(member.name.toLowerCase(), dayOfWeek, c));
              const doneCount = keys.filter(k => pool.some(c => c.memberId === member.id && c.choreKey === k && c.completed)).length;
              const allDone = doneCount === chores.length;
              const color = DOT_COLORS[member.character] || "#888";

              return (
                <div key={member.id}
                  className="rounded-lg px-2 py-1.5 text-left transition-all"
                  style={{
                    backgroundColor: allDone ? color + "22" : "rgba(255,255,255,0.04)",
                    border: `1px solid ${color}${allDone ? "60" : "30"}`,
                  }}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-black" style={{ color }}>{member.emoji} {member.name}</span>
                    <span className="text-[9px] font-bold text-muted-foreground">{doneCount}/{chores.length}</span>
                  </div>
                  {/* Mini chore list — first 3 + overflow */}
                  <div className="space-y-0.5">
                    {chores.slice(0, 3).map(chore => {
                      const key = makeChoreKey(member.name.toLowerCase(), dayOfWeek, chore);
                      const isDone = pool.some(c => c.memberId === member.id && c.choreKey === key && c.completed);
                      return (
                        <div key={key} className={`text-[9px] leading-tight flex items-center gap-1 ${isDone ? "opacity-40 line-through" : "opacity-70"}`}>
                          <span className="flex-shrink-0" style={{ color: isDone ? color : undefined }}>
                            {isDone ? "✓" : "·"}
                          </span>
                          <span className="truncate">{chore}</span>
                        </div>
                      );
                    })}
                    {chores.length > 3 && (
                      <div className="text-[9px] opacity-40 pl-3">+{chores.length - 3} more</div>
                    )}
                  </div>
                </div>
              );
            })}

            {isFuture && (
              <div className="flex-1 flex items-center justify-center">
                <span className="text-[10px] text-muted-foreground/40 italic">upcoming</span>
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function CalendarPage() {
  const today = new Date();
  const todayStr = toISODate(today);

  const [viewMode, setViewMode] = useState<ViewMode>("month");
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [weekStart, setWeekStart] = useState<Date>(() => getWeekStart(today));
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  // Month navigation
  const prevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); }
    else setViewMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); }
    else setViewMonth(m => m + 1);
  };

  // Week navigation
  const prevWeek = () => setWeekStart(d => { const n = new Date(d); n.setDate(d.getDate() - 7); return n; });
  const nextWeek = () => setWeekStart(d => {
    const n = new Date(d);
    n.setDate(d.getDate() + 7);
    return n;
  });

  // Sync week ↔ month when switching modes
  function switchMode(m: ViewMode) {
    setViewMode(m);
    if (m === "week") {
      // Jump week view to whatever month is currently shown
      const firstOfMonth = new Date(viewYear, viewMonth, 1);
      setWeekStart(getWeekStart(firstOfMonth));
    } else {
      // Jump month view to whatever week is shown
      setViewMonth(weekStart.getMonth());
      setViewYear(weekStart.getFullYear());
    }
  }

  const monthLabel = new Date(viewYear, viewMonth, 1).toLocaleString("en-US", { month: "long", year: "numeric" });

  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);
  const weekLabel = weekStart.getMonth() === weekEnd.getMonth()
    ? `${weekStart.toLocaleString("en-US", { month: "long" })} ${weekStart.getDate()}–${weekEnd.getDate()}, ${weekStart.getFullYear()}`
    : `${weekStart.toLocaleString("en-US", { month: "short", day: "numeric" })} – ${weekEnd.toLocaleString("en-US", { month: "short", day: "numeric", year: "numeric" })}`;

  const { data: members = [] } = useQuery<Member[]>({ queryKey: ["/api/members"] });

  const { data: overrides = [] } = useQuery<ChoreOverride[]>({
    queryKey: ["/api/overrides"],
    queryFn: () => apiRequest("GET", "/api/overrides").then(r => r.json()),
  });

  // Fetch completions for visible date range
  const visibleDates: string[] = viewMode === "month"
    ? Array.from({ length: new Date(viewYear, viewMonth + 1, 0).getDate() }, (_, i) =>
        toISODate(new Date(viewYear, viewMonth, i + 1)))
    : Array.from({ length: 7 }, (_, i) => {
        const d = new Date(weekStart);
        d.setDate(weekStart.getDate() + i);
        return toISODate(d);
      });

  const rangeKey = visibleDates[0] + "_" + visibleDates[visibleDates.length - 1];

  const { data: completionsMap = {} } = useQuery<Record<string, Completion[]>>({
    queryKey: ["/api/completions/range", rangeKey],
    queryFn: async () => {
      const map: Record<string, Completion[]> = {};
      const past = visibleDates.filter(d => d <= todayStr);
      await Promise.all(past.map(async ds => {
        const res = await apiRequest("GET", `/api/completions?date=${ds}`);
        map[ds] = await res.json();
      }));
      return map;
    },
    enabled: visibleDates.length > 0,
    refetchInterval: 30000,
  });

  // Completions for detail panel
  const selectedDateStr = selectedDate ? toISODate(selectedDate) : null;
  const { data: detailCompletions = [] } = useQuery<Completion[]>({
    queryKey: ["/api/completions", selectedDateStr],
    queryFn: () => apiRequest("GET", `/api/completions?date=${selectedDateStr}`).then(r => r.json()),
    enabled: !!selectedDateStr,
  });

  function handleSelectDate(d: Date) {
    // Toggle: tap same day again to close
    if (selectedDate && toISODate(selectedDate) === toISODate(d)) {
      setSelectedDate(null);
    } else {
      setSelectedDate(d);
    }
  }

  const DOW_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto">
      {/* Page header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-black tracking-tight dbz-title">Battle Calendar</h1>

        {/* Month / Week toggle */}
        <div className="flex items-center gap-1 bg-muted/50 rounded-xl p-1 border border-border">
          <button
            onClick={() => switchMode("month")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              viewMode === "month" ? "bg-amber-500 text-black shadow-md" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            Month
          </button>
          <button
            onClick={() => switchMode("week")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              viewMode === "week" ? "bg-amber-500 text-black shadow-md" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <CalendarDays className="w-3.5 h-3.5" />
            Week
          </button>
        </div>
      </div>

      {/* Calendar card */}
      <div className="bg-card border border-amber-600/30 rounded-2xl overflow-hidden dbz-gold-glow">

        {/* Nav bar */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <button
            onClick={viewMode === "month" ? prevMonth : prevWeek}
            className="flex items-center gap-1 px-3 py-2 rounded-xl text-sm font-bold text-amber-300 hover:bg-amber-900/30 transition-colors border border-amber-700/30"
          >
            <ChevronLeft className="w-4 h-4" />
            {viewMode === "month" ? "Prev" : "Prev Week"}
          </button>

          <div className="text-center">
            <div className="font-black text-base text-foreground">
              {viewMode === "month" ? monthLabel : weekLabel}
            </div>
            {viewMode === "week" && (
              <div className="text-[11px] text-amber-400 font-bold mt-0.5">
                Week {getWeekRotation(weekStart)}
              </div>
            )}
          </div>

          <button
            onClick={viewMode === "month" ? nextMonth : nextWeek}
            className="flex items-center gap-1 px-3 py-2 rounded-xl text-sm font-bold text-amber-300 hover:bg-amber-900/30 transition-colors border border-amber-700/30"
          >
            {viewMode === "month" ? "Next" : "Next Week"}
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Day-of-week headers */}
        <div className="grid grid-cols-7 border-b border-border">
          {DOW_LABELS.map(d => (
            <div key={d} className="py-2.5 text-center text-xs font-black uppercase tracking-wider text-muted-foreground">
              {d}
            </div>
          ))}
        </div>

        {/* Calendar body */}
        {viewMode === "month" ? (
          <MonthView
            viewYear={viewYear}
            viewMonth={viewMonth}
            today={today}
            selectedDate={selectedDate}
            members={members}
            completionsMap={completionsMap}
            overrides={overrides}
            onSelectDate={handleSelectDate}
          />
        ) : (
          <WeekView
            weekStart={weekStart}
            today={today}
            selectedDate={selectedDate}
            members={members}
            completionsMap={completionsMap}
            overrides={overrides}
            onSelectDate={handleSelectDate}
          />
        )}

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-4 px-5 py-3 border-t border-border/50 bg-muted/10">
          {members.map(m => {
            const color = DOT_COLORS[m.character] || "#888";
            return (
              <div key={m.id} className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full border-2" style={{ backgroundColor: color, borderColor: color }} />
                <span className="text-xs text-muted-foreground font-medium">{m.emoji} {m.name}</span>
              </div>
            );
          })}
          <div className="flex items-center gap-1.5 ml-auto">
            <div className="w-2.5 h-2.5 rounded-full border-2 border-amber-400 bg-transparent" />
            <span className="text-xs text-muted-foreground">In progress</span>
            <div className="w-2.5 h-2.5 rounded-full border-2 border-amber-400 ml-2" style={{ backgroundColor: "#ffa726" }} />
            <span className="text-xs text-muted-foreground">Done</span>
          </div>
        </div>
      </div>

      {/* Tap-to-view hint */}
      <p className="text-center text-xs text-muted-foreground/50 mt-3">
        Tap any day to see the full chore list
      </p>

      {/* Day detail modal */}
      {selectedDate && (
        <DayDetail
          date={selectedDate}
          members={members}
          completions={detailCompletions}
          overrides={overrides}
          onClose={() => setSelectedDate(null)}
        />
      )}
    </div>
  );
}
