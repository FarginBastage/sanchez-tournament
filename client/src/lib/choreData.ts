// The complete chore rotation system

export type WeekRotation = "A" | "B";
export type DayOfWeek = "Monday" | "Tuesday" | "Wednesday" | "Thursday" | "Friday" | "Saturday" | "Sunday";

export interface ChoreAssignment {
  member: string; // "jesse" | "angela" | "jude" | "david"
  chores: string[];
}

export type DaySchedule = Record<string, string[]>; // member -> chores
export type WeekSchedule = Record<DayOfWeek, DaySchedule>;

const DAYS: DayOfWeek[] = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

// Support tasks for whoever isn't leading or assisting dinner
// SETTER: sets the table before dinner + shared cleanup
const SET_TABLE   = ["Set table", "Empty/Load dishwasher", "Wipe kitchen counters"];
// CLEARER: clears the table after dinner + shared cleanup
const CLEAR_TABLE = ["Clear up table after dinner", "Empty/Load dishwasher", "Wipe kitchen counters"];
// Whoever does NOT have dishwasher duty gets this instead
const COLLECT_DISHES = ["Collect dishes from other rooms"];

// ── WEEK A ────────────────────────────────────────────────────────────────────
// Lead / Assist / Setter / Clearer each day:
//   Mon:  Jesse=Lead,  Jude=Assist   → Angela=Setter, David=Clearer
//   Tue:  Angela=Lead, Jude=Assist   → Jesse=Setter,  David=Clearer
//   Wed:  Jesse=Lead,  David=Assist  → Angela=Setter, Jude=Clearer
//   Thu:  Angela=Lead, David=Assist  → Jesse=Setter,  Jude=Clearer
//   Fri:  Jesse=Lead,  Jude=Assist   → Angela=Setter, David=Clearer
//   Sat:  Angela=Lead, David=Assist  → Jesse=Setter,  Jude=Clearer
//   Sun:  Jesse=Lead,  Jude=Assist   → Angela=Setter, David=Clearer

export const WEEK_A: WeekSchedule = {
  Monday: {
    // Angela=Setter(dishwasher), David=Clearer(dishwasher) → Jesse+Jude collect dishes
    jesse:  ["Lead dinner cooking", "Cycle & fold/hang laundry", "Hand-wash pots/pans", ...COLLECT_DISHES, "Daily personal reset"],
    angela: ["Grocery app management", "Process mail/packages", ...SET_TABLE, "Daily personal reset"],
    jude:   ["Assist dinner prep", "Take out kitchen trash & recycling", ...COLLECT_DISHES, "Daily personal reset"],
    david:  ["Feed & walk dogs", "Clean dog messes", "Reset common areas", ...CLEAR_TABLE, "Daily personal reset"],
  },
  Tuesday: {
    // Jesse=Setter(dishwasher), David=Clearer(dishwasher) → Angela(lead)+Jude collect dishes
    jesse:  ["Cycle & fold/hang laundry", "Hand-wash pots/pans", ...SET_TABLE, "Daily personal reset"],
    angela: ["Lead dinner cooking", "Collect & sort laundry", "Process mail/packages", ...COLLECT_DISHES, "Daily personal reset"],
    jude:   ["Feed & walk dogs", "Clean dog messes", "Reset common areas", "Assist dinner prep", ...COLLECT_DISHES, "Daily personal reset"],
    david:  [...CLEAR_TABLE, "Take out kitchen trash & recycling", "Daily personal reset"],
  },
  Wednesday: {
    // Angela=Setter(dishwasher), David=Clearer(dishwasher) → Jesse+Jude collect dishes
    jesse:  ["Lead dinner cooking", "Cycle & fold/hang laundry", "Hand-wash pots/pans", ...COLLECT_DISHES, "Daily personal reset"],
    angela: ["Collect & sort laundry", "Grocery app management", "Process mail/packages", ...SET_TABLE, "Daily personal reset"],
    jude:   ["Assist dinner prep", "Feed & walk dogs", "Clean dog messes", "Reset common areas", "Take out kitchen trash & recycling", ...COLLECT_DISHES, "Daily personal reset"],
    david:  [...CLEAR_TABLE, "Daily personal reset"],
  },
  Thursday: {
    // Jesse=Setter(dishwasher), Jude=Clearer(dishwasher) → Angela(lead)+David collect dishes
    jesse:  ["Hand-wash pots/pans", "Cycle & fold/hang laundry", ...SET_TABLE, "Daily personal reset"],
    angela: ["Lead dinner cooking", "Feed & walk dogs", "Grocery app management", "Process mail/packages", ...COLLECT_DISHES, "Daily personal reset"],
    jude:   [...CLEAR_TABLE, "Take out kitchen trash & recycling", "Daily personal reset"],
    david:  ["Reset common areas", "Clean dog messes", "Assist dinner prep", ...COLLECT_DISHES, "Daily personal reset"],
  },
  Friday: {
    // Angela=Setter(dishwasher), David=Clearer(dishwasher) → Jesse+Jude collect dishes
    jesse:  ["Lead dinner cooking", "Hand-wash pots/pans", "Cycle & fold/hang laundry", "Feed & walk dogs", ...COLLECT_DISHES, "Daily personal reset"],
    angela: ["Grocery app management", "Process mail/packages", ...SET_TABLE, "Daily personal reset"],
    jude:   ["Assist dinner prep", "Clean dog messes", ...COLLECT_DISHES, "Daily personal reset"],
    david:  [...CLEAR_TABLE, "Reset common areas", "Take out kitchen trash & recycling", "Daily personal reset"],
  },
  Saturday: {
    // Jesse=Setter(dishwasher), Jude=Clearer(dishwasher) → Angela(lead)+David collect dishes
    jesse:  ["Meal planning", "Fridge purge", "Supply audit (TP/Soap)", "Put away own laundry", ...SET_TABLE, "Daily personal reset"],
    angela: ["Lead dinner cooking", "Finalize grocery order", "Water houseplants", "Put away own laundry", ...COLLECT_DISHES, "Daily personal reset"],
    jude:   ["Feed & walk dogs", "Clean dog messes", "Weed the yard", "Wash dog bowls", "Put away own laundry", ...CLEAR_TABLE, "Daily personal reset"],
    david:  ["Assist dinner prep", "Take out kitchen trash & recycling", "Collect all small trash cans", "Put away own laundry", ...COLLECT_DISHES, "Daily personal reset"],
  },
  Sunday: {
    // Angela=Setter(dishwasher), David=Clearer(dishwasher) → Jesse+Jude collect dishes
    jesse:  ["Lead dinner cooking", "Strip own bed sheets (biweekly)", "Wash all bed linens (biweekly)", "Hand-wash pots/pans", ...COLLECT_DISHES, "Daily personal reset"],
    angela: ["Grocery pickup/delivery", "Strip own bed sheets (biweekly)", "Collect & sort laundry", "Match socks", ...SET_TABLE, "Daily personal reset"],
    jude:   ["Strip own bed sheets (biweekly)", "Reset common areas", "Assist dinner prep", "Take out kitchen trash & recycling", ...COLLECT_DISHES, "Daily personal reset"],
    david:  ["Strip own bed sheets (biweekly)", "Feed & walk dogs", "Clean dog messes", "Restock TP & Soap", ...CLEAR_TABLE, "Daily personal reset"],
  },
};

// ── WEEK B ────────────────────────────────────────────────────────────────────
// Lead / Assist / Setter / Clearer each day:
//   Mon:  Jesse=Lead,  David=Assist  → Angela=Setter, Jude=Clearer
//   Tue:  Angela=Lead, David=Assist  → Jesse=Setter,  Jude=Clearer
//   Wed:  Jesse=Lead,  Jude=Assist   → Angela=Setter, David=Clearer
//   Thu:  Angela=Lead, Jude=Assist   → Jesse=Setter,  David=Clearer
//   Fri:  Jesse=Lead,  David=Assist  → Angela=Setter, Jude=Clearer
//   Sat:  Angela=Lead, Jude=Assist   → Jesse=Setter,  David=Clearer
//   Sun:  Jesse=Lead,  David=Assist  → Angela=Setter, Jude=Clearer

export const WEEK_B: WeekSchedule = {
  Monday: {
    // Angela=Setter(dishwasher), Jude=Clearer(dishwasher) → Jesse+David collect dishes
    jesse:  ["Lead dinner cooking", "Cycle & fold/hang laundry", "Hand-wash pots/pans", ...COLLECT_DISHES, "Daily personal reset"],
    angela: ["Grocery app management", "Process mail/packages", ...SET_TABLE, "Daily personal reset"],
    jude:   ["Feed & walk dogs", "Clean dog messes", "Reset common areas", ...CLEAR_TABLE, "Daily personal reset"],
    david:  ["Assist dinner prep", "Take out kitchen trash & recycling", ...COLLECT_DISHES, "Daily personal reset"],
  },
  Tuesday: {
    // Jesse=Setter(dishwasher), Jude=Clearer(dishwasher) → Angela(lead)+David collect dishes
    jesse:  ["Cycle & fold/hang laundry", "Hand-wash pots/pans", ...SET_TABLE, "Daily personal reset"],
    angela: ["Lead dinner cooking", "Collect & sort laundry", "Process mail/packages", ...COLLECT_DISHES, "Daily personal reset"],
    jude:   [...CLEAR_TABLE, "Take out kitchen trash & recycling", "Daily personal reset"],
    david:  ["Feed & walk dogs", "Clean dog messes", "Reset common areas", "Assist dinner prep", ...COLLECT_DISHES, "Daily personal reset"],
  },
  Wednesday: {
    // Angela=Setter(dishwasher), David=Clearer(dishwasher) → Jesse+Jude collect dishes
    jesse:  ["Lead dinner cooking", "Cycle & fold/hang laundry", "Hand-wash pots/pans", ...COLLECT_DISHES, "Daily personal reset"],
    angela: ["Collect & sort laundry", "Grocery app management", "Process mail/packages", ...SET_TABLE, "Daily personal reset"],
    jude:   ["Feed & walk dogs", "Clean dog messes", "Assist dinner prep", ...COLLECT_DISHES, "Daily personal reset"],
    david:  [...CLEAR_TABLE, "Reset common areas", "Take out kitchen trash & recycling", "Daily personal reset"],
  },
  Thursday: {
    // Jesse=Setter(dishwasher), David=Clearer(dishwasher) → Angela(lead)+Jude collect dishes
    jesse:  ["Hand-wash pots/pans", "Cycle & fold/hang laundry", "Feed & walk dogs", ...SET_TABLE, "Daily personal reset"],
    angela: ["Lead dinner cooking", "Grocery app management", "Process mail/packages", ...COLLECT_DISHES, "Daily personal reset"],
    jude:   ["Reset common areas", "Clean dog messes", "Assist dinner prep", "Take out kitchen trash & recycling", ...COLLECT_DISHES, "Daily personal reset"],
    david:  [...CLEAR_TABLE, "Daily personal reset"],
  },
  Friday: {
    // Angela=Setter(dishwasher), Jude=Clearer(dishwasher) → Jesse+David collect dishes
    jesse:  ["Lead dinner cooking", "Hand-wash pots/pans", "Cycle & fold/hang laundry", ...COLLECT_DISHES, "Daily personal reset"],
    angela: ["Feed & walk dogs", "Grocery app management", "Process mail/packages", ...SET_TABLE, "Daily personal reset"],
    jude:   [...CLEAR_TABLE, "Reset common areas", "Take out kitchen trash & recycling", "Daily personal reset"],
    david:  ["Clean dog messes", "Assist dinner prep", ...COLLECT_DISHES, "Daily personal reset"],
  },
  Saturday: {
    // Jesse=Setter(dishwasher), David=Clearer(dishwasher) → Angela(lead)+Jude collect dishes
    jesse:  ["Meal planning", "Fridge purge", "Supply audit (TP/Soap)", "Put away own laundry", ...SET_TABLE, "Daily personal reset"],
    angela: ["Lead dinner cooking", "Finalize grocery order", "Water houseplants", "Put away own laundry", ...COLLECT_DISHES, "Daily personal reset"],
    jude:   ["Assist dinner prep", "Take out kitchen trash & recycling", "Collect all small trash cans", "Put away own laundry", ...COLLECT_DISHES, "Daily personal reset"],
    david:  ["Feed & walk dogs", "Clean dog messes", "Weed the yard", "Wash dog bowls", "Put away own laundry", ...CLEAR_TABLE, "Daily personal reset"],
  },
  Sunday: {
    // Angela=Setter(dishwasher), Jude=Clearer(dishwasher) → Jesse+David collect dishes
    jesse:  ["Lead dinner cooking", "Hand-wash pots/pans", ...COLLECT_DISHES, "Daily personal reset"],
    angela: ["Grocery pickup/delivery", "Collect & sort laundry", "Match socks", ...SET_TABLE, "Daily personal reset"],
    jude:   ["Feed & walk dogs", "Clean dog messes", "Reset common areas", ...CLEAR_TABLE, "Daily personal reset"],
    david:  ["Restock TP & Soap", "Assist dinner prep", "Take out kitchen trash & recycling", ...COLLECT_DISHES, "Daily personal reset"],
  },
};

export function getWeekRotation(date: Date): WeekRotation {
  // Use ISO week number: even weeks = A, odd weeks = B
  const startOfYear = new Date(date.getFullYear(), 0, 1);
  const weekNum = Math.ceil(((date.getTime() - startOfYear.getTime()) / 86400000 + startOfYear.getDay() + 1) / 7);
  return weekNum % 2 === 0 ? "A" : "B";
}

export function getDayOfWeek(date: Date): DayOfWeek {
  const days: DayOfWeek[] = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  return days[date.getDay()];
}

export function getScheduleForDate(date: Date): DaySchedule {
  const rotation = getWeekRotation(date);
  const day = getDayOfWeek(date);
  const schedule = rotation === "A" ? WEEK_A : WEEK_B;
  return schedule[day];
}

export function makeChoreKey(member: string, day: DayOfWeek, chore: string): string {
  return `${member}_${day}_${chore.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "")}`;
}

export const MEMBER_NAMES = ["jesse", "angela", "jude", "david"];
export const DAYS_LIST = DAYS;
