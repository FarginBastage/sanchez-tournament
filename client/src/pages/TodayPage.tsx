import { useQuery, useMutation } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { useLocation } from "wouter";
import { apiRequest, queryClient } from "../lib/queryClient";
import { getScheduleForDate, getDayOfWeek, getWeekRotation, makeChoreKey, WEEK_A, WEEK_B, type DayOfWeek } from "../lib/choreData";
import type { Member, Completion, ChoreOverride, ChoreNote } from "@shared/schema";
import { Flame, CheckCircle2, Circle, Crown, Bell, BellOff, X, ChevronLeft, ChevronRight, StickyNote, Trash2, Save } from "lucide-react";
import { playPunch, playPowerUp } from "../lib/sounds";
import { DragonBallTracker } from "../components/DragonBalls";
import { SosSummon } from "../components/SosSummon";
import { showNotification, getNotificationPermission, requestNotificationPermission } from "../lib/notifications";
import { fireConfetti } from "../lib/confetti";

// Map member name (lowercase) to their photo
const MEMBER_PHOTOS: Record<string, string> = {
  jesse:  "/jesse.jpeg",
  angela: "/angela.jpeg",
  jude:   "/jude.jpeg",
  david:  "/david.jpeg",
};

const CHAR_STYLES: Record<string, { headerClass: string; text: string; border: string; accent: string; glow: string }> = {
  roshi:  { headerClass: "char-header-roshi",  text: "text-orange-100", border: "border-orange-500/60", accent: "#ff6d00", glow: "rgba(255,109,0,0.35)" },
  goku:   { headerClass: "char-header-goku",   text: "text-amber-100",  border: "border-amber-400/60",  accent: "#ffa726", glow: "rgba(255,167,38,0.35)" },
  gohan:  { headerClass: "char-header-gohan",  text: "text-green-100",  border: "border-green-400/60",  accent: "#66bb6a", glow: "rgba(102,187,106,0.35)" },
  bulma:  { headerClass: "char-header-bulma",  text: "text-purple-100", border: "border-purple-400/60", accent: "#ce93d8", glow: "rgba(206,147,216,0.35)" },
};

const CHARACTER_TITLES: Record<string, string> = {
  roshi:  "The Turtle Hermit",
  goku:   "Low-Class Warrior",
  gohan:  "The Scholar",
  bulma:  "Genius Inventor",
};

function toISODate(d: Date) { return d.toISOString().split("T")[0]; }

function getWeekStart(d: Date): Date {
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  const mon = new Date(d);
  mon.setDate(d.getDate() + diff);
  return mon;
}

function NotificationBanner() {
  const [perm, setPerm] = useState<"granted" | "denied" | "default" | "unsupported">(getNotificationPermission);
  const [dismissed, setDismissed] = useState(false);

  if (dismissed || perm === "granted" || perm === "unsupported") return null;

  async function handleEnable() {
    const result = await requestNotificationPermission();
    setPerm(result);
  }

  if (perm === "denied") {
    return (
      <div className="mb-4 flex items-start gap-3 rounded-xl border border-amber-700/40 bg-amber-950/30 px-4 py-3 text-sm">
        <BellOff className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
        <div className="flex-1">
          <p className="font-bold text-amber-300">Notifications blocked</p>
          <p className="text-amber-200/60 text-xs mt-0.5">
            To get SOS alerts, go to your browser settings and allow notifications for this site.
          </p>
        </div>
        <button onClick={() => setDismissed(true)} className="text-amber-600 hover:text-amber-400 flex-shrink-0"><X className="w-4 h-4" /></button>
      </div>
    );
  }

  return (
    <div className="mb-4 flex items-center gap-3 rounded-xl border border-amber-500/40 bg-amber-950/20 px-4 py-3 dbz-gold-glow">
      <Bell className="w-5 h-5 text-amber-400 flex-shrink-0 animate-pulse" />
      <div className="flex-1">
        <p className="font-black text-amber-300 text-sm">Enable SOS alerts</p>
        <p className="text-amber-200/60 text-xs mt-0.5">Get a pop-up when someone in the family calls for help.</p>
      </div>
      <div className="flex gap-2 flex-shrink-0">
        <button
          onClick={() => setDismissed(true)}
          className="text-xs text-amber-600 hover:text-amber-400 px-2 py-1"
        >
          Later
        </button>
        <button
          onClick={handleEnable}
          className="text-xs font-black px-3 py-1.5 rounded-lg bg-amber-500 text-black hover:bg-amber-400 transition-colors"
        >
          Enable
        </button>
      </div>
    </div>
  );
}

// ─── Note Dialog (inline popover per chore) ─────────────────────────────────
interface NoteDialogProps {
  memberId: number;
  choreKey: string;
  date: string;
  existingNote: string;
  accent: string;
  onClose: () => void;
}

function NoteDialog({ memberId, choreKey, date, existingNote, accent, onClose }: NoteDialogProps) {
  const [text, setText] = useState(existingNote);

  const noteMutation = useMutation({
    mutationFn: ({ note }: { note: string }) =>
      apiRequest("POST", "/api/notes", { memberId, choreKey, date, note }).then(r => r.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/notes", date] });
      onClose();
    },
  });

  function handleSave() { noteMutation.mutate({ note: text.trim() }); }
  function handleDelete() { noteMutation.mutate({ note: "" }); }

  return (
    // Backdrop
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="w-full max-w-sm rounded-2xl bg-card border p-5 shadow-2xl"
        style={{ borderColor: accent + "60" }}
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <StickyNote className="w-4 h-4" style={{ color: accent }} />
            <span className="font-black text-sm text-foreground">Chore Note</span>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <textarea
          autoFocus
          className="w-full h-28 rounded-xl border border-border bg-muted/40 px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground resize-none focus:outline-none focus:ring-2 transition-all"
          style={{ focusRingColor: accent } as any}
          placeholder="Add a note for this chore…"
          value={text}
          onChange={e => setText(e.target.value)}
          onKeyDown={e => { if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) handleSave(); }}
        />
        <p className="text-[10px] text-muted-foreground mt-1 mb-3">⌘↩ to save</p>

        <div className="flex gap-2">
          {existingNote && (
            <button
              onClick={handleDelete}
              disabled={noteMutation.isPending}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold text-red-400 hover:bg-red-950/30 border border-red-800/40 transition-all disabled:opacity-50"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Delete
            </button>
          )}
          <button
            onClick={handleSave}
            disabled={noteMutation.isPending}
            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-black transition-all disabled:opacity-50"
            style={{ backgroundColor: accent, color: "#000" }}
          >
            <Save className="w-3.5 h-3.5" />
            {noteMutation.isPending ? "Saving…" : "Save Note"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function TodayPage() {
  const [, navigate] = useLocation();
  const today = new Date();
  const todayStr = toISODate(today);

  // viewDate is what we're displaying — defaults to today, can go back
  const [viewDate, setViewDate] = useState<Date>(today);
  const viewDateStr = toISODate(viewDate);
  const isToday = viewDateStr === todayStr;

  // Note dialog state: { memberId, choreKey } or null
  const [noteDialog, setNoteDialog] = useState<{ memberId: number; choreKey: string } | null>(null);

  function goBack() {
    setViewDate(d => { const n = new Date(d); n.setDate(n.getDate() - 1); return n; });
  }
  function goForward() {
    setViewDate(d => {
      const n = new Date(d);
      n.setDate(n.getDate() + 1);
      return toISODate(n) <= todayStr ? n : d;
    });
  }

  const dayOfWeek = getDayOfWeek(viewDate);
  const weekRotation = getWeekRotation(viewDate);
  const weekStart = getWeekStart(viewDate);
  const weekStartStr = toISODate(weekStart);

  // All 7 dates of the viewed week
  const weekDates = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart);
    d.setDate(weekStart.getDate() + i);
    return toISODate(d);
  });

  const { data: members = [] } = useQuery<Member[]>({ queryKey: ["/api/members"] });

  // Poll messages every 15s — detect new SOS posts and fire browser notification
  const seenMsgIds = useRef<Set<number>>(new Set());
  const { data: messages = [] } = useQuery<{ id: number; memberId: number; content: string; timestamp: string }[]>({
    queryKey: ["/api/messages"],
    queryFn: () => apiRequest("GET", "/api/messages").then(r => r.json()),
    refetchInterval: 15000,
  });

  useEffect(() => {
    if (!messages.length) return;
    // On first load, seed seen IDs silently so we don't spam on mount
    if (seenMsgIds.current.size === 0) {
      messages.forEach(m => seenMsgIds.current.add(m.id));
      return;
    }
    // Check for new SOS messages
    messages.forEach(m => {
      if (!seenMsgIds.current.has(m.id)) {
        seenMsgIds.current.add(m.id);
        if (m.content.startsWith("🚨")) {
          // Find sender name
          const sender = members.find(mb => mb.id === m.memberId);
          const name = sender?.name ?? "Someone";
          showNotification(
            `🚨 ${name} needs help!`,
            m.content.replace(/\*[^*]+\*/g, "").replace(/\n+/g, " ").trim(),
            () => navigate("/chat"),
          );
        }
      }
    });
  }, [messages, members, navigate]);

  // Viewed day's completions — poll every 15s so family see each other's checks
  const { data: todayCompletions = [], isLoading: loadingToday } = useQuery<Completion[]>({
    queryKey: ["/api/completions", viewDateStr],
    queryFn: () => apiRequest("GET", `/api/completions?date=${viewDateStr}`).then(r => r.json()),
    refetchInterval: 15000,
  });

  const { data: overrides = [] } = useQuery<ChoreOverride[]>({
    queryKey: ["/api/overrides"],
    queryFn: () => apiRequest("GET", "/api/overrides").then(r => r.json()),
  });

  // Notes for today's date
  const { data: notes = [] } = useQuery<ChoreNote[]>({
    queryKey: ["/api/notes", viewDateStr],
    queryFn: () => apiRequest("GET", `/api/notes?date=${viewDateStr}`).then(r => r.json()),
  });

  // All week completions in one query (for Dragon Ball counting) — no hooks in loops
  const { data: weekCompletions = {} } = useQuery<Record<string, Completion[]>>({
    queryKey: ["/api/completions/week", weekStartStr],
    queryFn: async () => {
      const map: Record<string, Completion[]> = {};
      for (const ds of weekDates) {
        const res = await apiRequest("GET", `/api/completions?date=${ds}`);
        map[ds] = await res.json();
      }
      return map;
    },
  });

  // Streak data — all members, last 60 days, single query
  const sixtyAgo = new Date(today);
  sixtyAgo.setDate(today.getDate() - 60);
  const { data: streakMap = {} } = useQuery<Record<number, Completion[]>>({
    queryKey: ["/api/completions/streaks", viewDateStr],
    queryFn: async () => {
      const map: Record<number, Completion[]> = {};
      for (const m of members) {
        const res = await apiRequest("GET", `/api/completions/member/${m.id}?from=${toISODate(sixtyAgo)}&to=${todayStr}`);
        map[m.id] = await res.json();
      }
      return map;
    },
    enabled: members.length > 0,
  });

  const toggle = useMutation({
    mutationFn: ({ memberId, choreKey, date }: { memberId: number; choreKey: string; date: string }) =>
      apiRequest("POST", "/api/completions/toggle", { memberId, choreKey, date }).then(r => r.json()),
    onSuccess: (_data, vars) => {
      queryClient.invalidateQueries({ queryKey: ["/api/completions", viewDateStr] });
      queryClient.invalidateQueries({ queryKey: ["/api/completions/week", weekStartStr] });
    },
  });

  const getChores = (member: Member, day: DayOfWeek, week: "A" | "B"): string[] => {
    const override = overrides.find(o => o.memberId === member.id && o.week === week && o.day === day);
    if (override) { try { return JSON.parse(override.chores as string); } catch { return []; } }
    const schedule = week === "A" ? WEEK_A : WEEK_B;
    return schedule[day]?.[member.name.toLowerCase()] || [];
  };

  const isCompleted = (pool: Completion[], memberId: number, choreKey: string) =>
    pool.some(c => c.memberId === memberId && c.choreKey === choreKey && c.completed);

  const getMemberProgress = (member: Member, pool: Completion[] = todayCompletions) => {
    const chores = getChores(member, dayOfWeek, weekRotation);
    const keys = chores.map(c => makeChoreKey(member.name.toLowerCase(), dayOfWeek, c));
    const done = keys.filter(key => isCompleted(pool, member.id, key));
    const total = chores.length;
    return { total, done: done.length, pct: total > 0 ? Math.round((done.length / total) * 100) : 0 };
  };

  const getDragonBalls = (member: Member): number => {
    let count = 0;
    weekDates.forEach(ds => {
      if (ds > viewDateStr) return;
      const d = new Date(ds);
      const pool = weekCompletions[ds] || [];
      const dow = getDayOfWeek(d);
      const rot = getWeekRotation(d);
      const chores = getChores(member, dow, rot);
      if (chores.length === 0) return;
      const keys = chores.map(c => makeChoreKey(member.name.toLowerCase(), dow, c));
      if (keys.every(key => isCompleted(pool, member.id, key))) count++;
    });
    return Math.min(count, 7);
  };

  const getStreak = (member: Member): number => {
    const streakData = streakMap[member.id] || [];
    let streak = 0;
    let d = new Date(viewDate);
    while (true) {
      const dateStr = toISODate(d);
      const dow = getDayOfWeek(d);
      const rot = getWeekRotation(d);
      const chores = getChores(member, dow, rot);
      if (chores.length === 0) { d.setDate(d.getDate() - 1); if (streak === 0) break; continue; }
      const keys = chores.map(c => makeChoreKey(member.name.toLowerCase(), dow, c));
      const pool = dateStr === viewDateStr ? todayCompletions : streakData;
      if (keys.every(key => isCompleted(pool, member.id, key))) { streak++; d.setDate(d.getDate() - 1); }
      else break;
    }
    return streak;
  };

  const getNoteForChore = (memberId: number, choreKey: string): string => {
    const n = notes.find(n => n.memberId === memberId && n.choreKey === choreKey);
    return n?.note ?? "";
  };

  // Handle chore toggle + confetti
  function handleToggle(member: Member, choreKey: string) {
    playPunch();
    toggle.mutate(
      { memberId: member.id, choreKey, date: viewDateStr },
      {
        onSuccess: (_data, vars) => {
          // After toggle, optimistically check if all chores are now complete
          // We need to re-read from fresh data, so we use the updated query cache
          // Use queryClient to get the latest completions
          const freshCompletions: Completion[] = queryClient.getQueryData(["/api/completions", viewDateStr]) ?? [];
          // Build what the new completion state would look like
          // The toggle flips: if it was done, it's now undone; if undone, now done
          const wasCompleted = isCompleted(freshCompletions, member.id, choreKey);
          // After toggle the server will have inverted it — we don't know yet since
          // the invalidation hasn't refetched, so let's just check if the chore is
          // newly being marked done (wasCompleted means before this mutation it was done,
          // so after toggle it'll be UNdone — no confetti). If it was NOT done, now it is.
          if (!wasCompleted) {
            // Check if this was the last remaining chore
            const chores = getChores(member, dayOfWeek, weekRotation);
            const keys = chores.map(c => makeChoreKey(member.name.toLowerCase(), dayOfWeek, c));
            const otherKeys = keys.filter(k => k !== choreKey);
            const allOthersDone = otherKeys.every(k => isCompleted(freshCompletions, member.id, k));
            if (allOthersDone && chores.length > 0) {
              // This was the last chore — fire confetti + power-up sound!
              setTimeout(() => {
                playPowerUp();
                fireConfetti();
              }, 150);
            }
          }
        },
      }
    );
  }

  const displayDate = viewDate.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });

  // Find note dialog context
  const activeNote = noteDialog
    ? { memberId: noteDialog.memberId, choreKey: noteDialog.choreKey }
    : null;
  const activeNoteText = activeNote
    ? getNoteForChore(activeNote.memberId, activeNote.choreKey)
    : "";
  const activeMember = activeNote ? members.find(m => m.id === activeNote.memberId) : null;
  const activeStyle = activeMember ? (CHAR_STYLES[activeMember.character] || CHAR_STYLES.goku) : CHAR_STYLES.goku;

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto">
      {/* Note dialog */}
      {noteDialog && (
        <NoteDialog
          memberId={noteDialog.memberId}
          choreKey={noteDialog.choreKey}
          date={viewDateStr}
          existingNote={activeNoteText}
          accent={activeStyle.accent}
          onClose={() => setNoteDialog(null)}
        />
      )}

      {/* Notification permission banner */}
      <NotificationBanner />

      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
          <span className="font-black text-amber-400">Week {weekRotation}</span>
          <span className="text-amber-600/50">·</span>
          <span>{displayDate}</span>
        </div>
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-black tracking-tight dbz-title">
            {isToday ? "Today's Battle" : "Past Battle"}
          </h1>
          {!isToday && (
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-amber-900/40 text-amber-400 border border-amber-700/40">
              Back-fill mode
            </span>
          )}
        </div>
        <p className="text-muted-foreground text-sm mt-1">
          Check off your chores. Complete all 7 days this week to summon Shenron.
        </p>
      </div>

      {/* Day navigation */}
      <div className="flex items-center justify-between mb-5">
        <button
          onClick={goBack}
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-bold text-amber-300 hover:bg-amber-900/30 transition-colors border border-amber-700/30"
        >
          <ChevronLeft className="w-4 h-4" />
          Prev Day
        </button>
        <div className="text-center">
          {!isToday && (
            <button
              onClick={() => setViewDate(new Date(today))}
              className="text-xs text-amber-500 hover:text-amber-300 underline"
            >
              Back to today
            </button>
          )}
        </div>
        <button
          onClick={goForward}
          disabled={isToday}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-bold transition-colors border ${
            isToday
              ? "text-muted-foreground border-muted/20 opacity-40 cursor-not-allowed"
              : "text-amber-300 hover:bg-amber-900/30 border-amber-700/30"
          }`}
        >
          Next Day
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* SOS Summon button */}
      <SosSummon members={members} />

      {/* Family overview bar */}
      <div className="mb-6 p-4 rounded-xl bg-card border border-amber-600/30 dbz-gold-glow">
        <div className="flex items-center gap-2 mb-3">
          <Crown className="w-4 h-4 text-amber-400" />
          <span className="text-sm font-black tracking-wide text-amber-300">Family Battle Power</span>
          <span className="ml-auto text-xs text-amber-600/70 font-semibold">{loadingToday ? "Syncing…" : "Live"}</span>
        </div>
        <div className="space-y-2">
          {members.map(m => {
            const { total, done, pct } = getMemberProgress(m);
            const style = CHAR_STYLES[m.character] || CHAR_STYLES.goku;
            return (
              <div key={m.id} className="flex items-center gap-3" data-testid={`overview-bar-${m.id}`}>
                <span className="text-base w-6 text-center">{m.emoji}</span>
                <span className="text-sm w-14 text-muted-foreground">{m.name}</span>
                <div className="flex-1 h-2.5 bg-muted rounded-full overflow-hidden">
                  <div className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${pct}%`, backgroundColor: style.accent }} />
                </div>
                <span className="text-xs font-bold tabular-nums w-10 text-right"
                  style={{ color: done === total && total > 0 ? style.accent : undefined }}>
                  {done}/{total}
                </span>
                {done === total && total > 0 && (
                  <CheckCircle2 className="w-4 h-4 flex-shrink-0" style={{ color: style.accent }} />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Member cards — always fully expanded */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {members.map(member => {
          const style = CHAR_STYLES[member.character] || CHAR_STYLES.goku;
          const chores = getChores(member, dayOfWeek, weekRotation);
          const { total, done, pct } = getMemberProgress(member);
          const streak = getStreak(member);
          const balls = getDragonBalls(member);

          return (
            <div key={member.id} data-testid={`member-card-${member.id}`}
              className={`rounded-xl border ${style.border} bg-card overflow-hidden flex flex-col`}
              style={{ boxShadow: `0 0 0 1px ${style.glow}, 0 4px 24px ${style.glow}` }}>

              {/* Header */}
              <div className={`${style.headerClass} px-4 py-3 flex items-center justify-between`}>
                <div className="flex items-center gap-3">
                  {/* Photo avatar with emoji badge */}
                  <div className="relative flex-shrink-0">
                    {MEMBER_PHOTOS[member.name.toLowerCase()] ? (
                      <div className="w-12 h-12 rounded-full overflow-hidden"
                        style={{
                          border: `2px solid ${style.accent}`,
                          boxShadow: `0 0 10px ${style.glow}`,
                        }}>
                        <img
                          src={MEMBER_PHOTOS[member.name.toLowerCase()]}
                          alt={member.name}
                          className="w-full h-full object-cover object-top"
                        />
                      </div>
                    ) : (
                      <span className="text-2xl">{member.emoji}</span>
                    )}
                    {/* Emoji badge */}
                    <span className="absolute -bottom-1 -right-1 text-sm leading-none">{member.emoji}</span>
                  </div>
                  <div>
                    <div className={`font-black text-base ${style.text}`}>{member.name}</div>
                    <div className={`text-xs opacity-60 ${style.text}`}>{CHARACTER_TITLES[member.character]}</div>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1">
                  {streak > 0 && (
                    <div className="flex items-center gap-1 bg-orange-500/20 rounded-full px-2 py-0.5">
                      <Flame className="w-3.5 h-3.5 text-orange-400" />
                      <span className="text-orange-300 text-xs font-bold">{streak}d</span>
                    </div>
                  )}
                  <div className={`text-base font-black ${style.text}`}>
                    {done}/{total}
                    <span className={`text-xs opacity-50 ml-1 ${style.text}`}>{pct}%</span>
                  </div>
                </div>
              </div>

              {/* Progress bar */}
              <div className="h-1.5 bg-muted">
                <div className="h-full transition-all duration-500"
                  style={{ width: `${pct}%`, backgroundColor: style.accent }} />
              </div>

              {/* Dragon Balls */}
              <div className="px-4 pt-3 pb-2 border-b border-border">
                <DragonBallTracker member={member} ballsCollected={balls} weekStart={weekStartStr} />
              </div>

              {/* Chore checklist — always visible */}
              <div className="px-4 py-3 space-y-2 flex-1">
                {chores.length === 0 ? (
                  <p className="text-muted-foreground text-sm italic text-center py-4">No chores today — enjoy the rest!</p>
                ) : chores.map(chore => {
                  const key = makeChoreKey(member.name.toLowerCase(), dayOfWeek, chore);
                  const isDone = isCompleted(todayCompletions, member.id, key);
                  const isPending = toggle.isPending &&
                    toggle.variables?.memberId === member.id &&
                    toggle.variables?.choreKey === key;
                  const hasNote = !!getNoteForChore(member.id, key);

                  return (
                    <div key={key} className="flex items-center gap-2">
                      {/* Chore toggle button */}
                      <button
                        data-testid={`chore-btn-${member.id}-${key}`}
                        onClick={() => handleToggle(member, key)}
                        disabled={isPending}
                        className={`flex-1 flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all text-sm
                          ${isDone ? "bg-primary/10 text-primary" : "bg-muted/40 text-foreground hover:bg-muted active:scale-[0.98]"}
                          ${isPending ? "opacity-50" : ""}`}
                      >
                        {isDone
                          ? <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-primary" />
                          : <Circle className="w-4 h-4 flex-shrink-0 text-muted-foreground" />}
                        <span className={`flex-1 ${isDone ? "line-through opacity-50" : ""}`}>{chore}</span>
                        {isDone && <span className="text-[10px] font-bold text-primary opacity-60 flex-shrink-0">✓</span>}
                      </button>

                      {/* Note button */}
                      <button
                        data-testid={`note-btn-${member.id}-${key}`}
                        onClick={() => setNoteDialog({ memberId: member.id, choreKey: key })}
                        className={`flex-shrink-0 p-2 rounded-lg transition-all ${
                          hasNote
                            ? "text-amber-400 bg-amber-500/15 hover:bg-amber-500/25"
                            : "text-muted-foreground hover:text-amber-300 hover:bg-muted"
                        }`}
                        title={hasNote ? "View note" : "Add note"}
                      >
                        <StickyNote className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  );
                })}
              </div>

              {/* Note previews — show any notes for this member below chores */}
              {notes.filter(n => n.memberId === member.id).length > 0 && (
                <div className="px-4 pb-3 space-y-1.5 border-t border-border/50 pt-2">
                  {notes.filter(n => n.memberId === member.id).map(n => (
                    <button
                      key={n.id}
                      onClick={() => setNoteDialog({ memberId: n.memberId, choreKey: n.choreKey })}
                      className="w-full text-left flex items-start gap-2 px-2 py-1.5 rounded-lg bg-amber-500/8 hover:bg-amber-500/15 transition-all"
                    >
                      <StickyNote className="w-3 h-3 text-amber-400 flex-shrink-0 mt-0.5" />
                      <span className="text-[11px] text-amber-300/80 line-clamp-1">{n.note}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
