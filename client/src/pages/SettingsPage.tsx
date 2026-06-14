import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "../lib/queryClient";
import { WEEK_A, WEEK_B, DAYS_LIST, type WeekRotation, type DayOfWeek } from "../lib/choreData";
import type { Member, ChoreOverride } from "@shared/schema";
import { Plus, Trash2, RotateCcw, Settings, ChevronDown } from "lucide-react";

const MEMBER_COLORS: Record<string, string> = {
  vegeta: "#1565c0", goku: "#f57f17", gohan: "#2e7d32", bulma: "#7b1fa2",
};

export default function SettingsPage() {
  const [selectedWeek, setSelectedWeek] = useState<WeekRotation>("A");
  const [selectedDay, setSelectedDay] = useState<DayOfWeek>("Monday");
  const [selectedMemberId, setSelectedMemberId] = useState<number | null>(null);
  const [newChore, setNewChore] = useState("");
  const [expandedCell, setExpandedCell] = useState<string | null>(null);

  const { data: members = [] } = useQuery<Member[]>({ queryKey: ["/api/members"] });
  const { data: overrides = [] } = useQuery<ChoreOverride[]>({
    queryKey: ["/api/overrides"],
    queryFn: () => apiRequest("GET", "/api/overrides").then(r => r.json()),
  });

  const upsertOverride = useMutation({
    mutationFn: (payload: { memberId: number; week: string; day: string; chores: string[] }) =>
      apiRequest("POST", "/api/overrides", payload).then(r => r.json()),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["/api/overrides"] }),
  });

  // Get the effective chore list for a member/week/day (override takes precedence)
  const getChores = (memberId: number, week: WeekRotation, day: DayOfWeek): string[] => {
    const override = overrides.find(
      o => o.memberId === memberId && o.week === week && o.day === day
    );
    if (override) {
      try { return JSON.parse(override.chores); } catch { return []; }
    }
    const schedule = week === "A" ? WEEK_A : WEEK_B;
    const member = members.find(m => m.id === memberId);
    if (!member) return [];
    return schedule[day]?.[member.name.toLowerCase()] || [];
  };

  const hasOverride = (memberId: number, week: WeekRotation, day: DayOfWeek) =>
    overrides.some(o => o.memberId === memberId && o.week === week && o.day === day);

  const addChore = (memberId: number) => {
    if (!newChore.trim()) return;
    const current = getChores(memberId, selectedWeek, selectedDay);
    upsertOverride.mutate({
      memberId,
      week: selectedWeek,
      day: selectedDay,
      chores: [...current, newChore.trim()],
    });
    setNewChore("");
  };

  const removeChore = (memberId: number, chore: string) => {
    const current = getChores(memberId, selectedWeek, selectedDay);
    upsertOverride.mutate({
      memberId,
      week: selectedWeek,
      day: selectedDay,
      chores: current.filter(c => c !== chore),
    });
  };

  const resetToDefault = (memberId: number) => {
    const override = overrides.find(
      o => o.memberId === memberId && o.week === selectedWeek && o.day === selectedDay
    );
    if (!override) return;
    // Delete by posting empty — just set to original
    const schedule = selectedWeek === "A" ? WEEK_A : WEEK_B;
    const member = members.find(m => m.id === memberId);
    if (!member) return;
    const defaultChores = schedule[selectedDay]?.[member.name.toLowerCase()] || [];
    upsertOverride.mutate({
      memberId,
      week: selectedWeek,
      day: selectedDay,
      chores: defaultChores,
    });
  };

  const cellKey = (memberId: number) => `${memberId}-${selectedWeek}-${selectedDay}`;

  return (
    <div className="p-4 md:p-8 max-w-3xl mx-auto">
      <div className="flex items-center gap-3 mb-2">
        <Settings className="w-5 h-5 text-primary" />
        <h1 className="text-xl font-black tracking-tight text-foreground">Edit Assignments</h1>
      </div>
      <p className="text-muted-foreground text-sm mb-6">
        Customize chores for any member, week, and day. Changes are saved instantly and override the default rotation chart.
      </p>

      {/* Week + Day selectors */}
      <div className="flex flex-wrap gap-3 mb-6">
        <div className="flex rounded-xl overflow-hidden border border-border">
          {(["A", "B"] as WeekRotation[]).map(w => (
            <button
              key={w}
              data-testid={`week-tab-${w}`}
              onClick={() => setSelectedWeek(w)}
              className={`px-5 py-2 text-sm font-bold transition-colors ${selectedWeek === w ? "bg-primary text-primary-foreground" : "bg-card text-muted-foreground hover:bg-muted"}`}
            >
              Week {w}
            </button>
          ))}
        </div>

        <select
          data-testid="day-select"
          value={selectedDay}
          onChange={e => setSelectedDay(e.target.value as DayOfWeek)}
          className="flex-1 min-w-[140px] bg-card border border-border rounded-xl px-3 py-2 text-sm text-foreground font-medium outline-none focus:ring-1 focus:ring-primary"
        >
          {DAYS_LIST.map(d => (
            <option key={d} value={d}>{d}</option>
          ))}
        </select>
      </div>

      {/* Member chore editors */}
      <div className="space-y-3">
        {members.map(member => {
          const chores = getChores(member.id, selectedWeek, selectedDay);
          const isOverridden = hasOverride(member.id, selectedWeek, selectedDay);
          const key = cellKey(member.id);
          const isExpanded = expandedCell === key;
          const color = MEMBER_COLORS[member.character] || "#888";

          return (
            <div
              key={member.id}
              data-testid={`settings-member-${member.id}`}
              className="bg-card border border-border rounded-xl overflow-hidden"
            >
              {/* Header */}
              <button
                className="w-full flex items-center justify-between px-4 py-3 hover:bg-muted/30 transition-colors"
                onClick={() => setExpandedCell(isExpanded ? null : key)}
                data-testid={`expand-member-${member.id}`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-xl">{member.emoji}</span>
                  <span className="font-bold text-sm text-foreground">{member.name}</span>
                  <span className="text-xs text-muted-foreground">{chores.length} chore{chores.length !== 1 ? "s" : ""}</span>
                  {isOverridden && (
                    <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full font-semibold">
                      Custom
                    </span>
                  )}
                </div>
                <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${isExpanded ? "rotate-180" : ""}`} />
              </button>

              {/* Expanded editor */}
              {isExpanded && (
                <div className="border-t border-border px-4 py-3 space-y-3">
                  {/* Current chore list */}
                  {chores.length === 0 && (
                    <p className="text-muted-foreground text-sm italic">No chores assigned.</p>
                  )}
                  <ul className="space-y-1.5">
                    {chores.map((chore, idx) => (
                      <li
                        key={`${chore}-${idx}`}
                        className="flex items-center justify-between bg-muted/50 rounded-lg px-3 py-2 text-sm text-foreground"
                        data-testid={`chore-item-${member.id}-${idx}`}
                      >
                        <span>{chore}</span>
                        <button
                          data-testid={`remove-chore-${member.id}-${idx}`}
                          onClick={() => removeChore(member.id, chore)}
                          className="ml-3 p-1 rounded-md hover:bg-destructive/20 text-muted-foreground hover:text-destructive transition-colors flex-shrink-0"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </li>
                    ))}
                  </ul>

                  {/* Add chore row */}
                  <div className="flex gap-2">
                    <input
                      data-testid={`input-new-chore-${member.id}`}
                      value={selectedMemberId === member.id ? newChore : ""}
                      onChange={e => { setSelectedMemberId(member.id); setNewChore(e.target.value); }}
                      onKeyDown={e => { if (e.key === "Enter") addChore(member.id); }}
                      placeholder="Add a chore…"
                      className="flex-1 bg-muted/50 border border-border rounded-lg px-3 py-1.5 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-1 focus:ring-primary"
                    />
                    <button
                      data-testid={`btn-add-chore-${member.id}`}
                      onClick={() => addChore(member.id)}
                      disabled={!newChore.trim() || selectedMemberId !== member.id}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold transition-all disabled:opacity-40"
                      style={{ backgroundColor: color, color: "#fff" }}
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Add
                    </button>
                  </div>

                  {/* Reset to default */}
                  {isOverridden && (
                    <button
                      data-testid={`btn-reset-${member.id}`}
                      onClick={() => resetToDefault(member.id)}
                      className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <RotateCcw className="w-3 h-3" />
                      Reset to original rotation chart
                    </button>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Info footer */}
      <p className="mt-6 text-xs text-muted-foreground text-center">
        Changes apply to all future and past views of that week/day. The original rotation chart is always available as the default.
      </p>
    </div>
  );
}
