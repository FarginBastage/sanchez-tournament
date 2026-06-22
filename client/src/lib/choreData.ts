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

// ── WEEK A ────────────────────────────────────────────────────────────────────
// Structure per photo:
//   Jesse  = Lead dinner cooking (most days) or Do dishes
//   Angela = Do dishes (most days) or Lead dinner cooking
//   Jude   = Set & clear table + dog duties + kitchen support
//   David  = Assist dinner prep + wipe counters

export const WEEK_A: WeekSchedule = {
  Monday: {
    jesse:  ["Lead dinner cooking", "Process mail/packages", "Daily personal reset"],
    angela: ["Empty/Load dishwasher", "Cycle & fold/hang laundry", "Daily personal reset"],
    jude:   ["Feed the dogs", "Clean dog messes", "Set & clear table", "Empty kitchen trash & recycling", "Daily personal reset"],
    david:  ["Assist dinner prep", "Wipe down kitchen counters", "Daily personal reset"],
  },
  Tuesday: {
    jesse:  ["Empty/Load dishwasher", "Cycle & fold/hang laundry", "Daily personal reset"],
    angela: ["Lead dinner cooking", "Collect & sort laundry", "Daily personal reset"],
    jude:   ["Feed the dogs", "Clean dog messes", "Set & clear table", "Empty kitchen trash & recycling", "Take trash/recycling to road", "Reset common areas", "Daily personal reset"],
    david:  ["Assist dinner prep", "Wipe down kitchen counters", "Daily personal reset"],
  },
  Wednesday: {
    jesse:  ["Lead dinner cooking", "Daily personal reset"],
    angela: ["Empty/Load dishwasher", "Cycle & fold/hang laundry", "Collect & sort laundry", "Daily personal reset"],
    jude:   ["Feed the dogs", "Clean dog messes", "Set & clear table", "Empty kitchen trash & recycling", "Reset common areas", "Daily personal reset"],
    david:  ["Assist dinner prep", "Wipe down kitchen counters", "Daily personal reset"],
  },
  Thursday: {
    jesse:  ["Empty/Load dishwasher", "Cycle & fold/hang laundry", "Process mail/packages", "Daily personal reset"],
    angela: ["Lead dinner cooking", "Daily personal reset"],
    jude:   ["Assist dinner prep", "Wipe down kitchen counters", "Daily personal reset"],
    david:  ["Feed the dogs", "Clean dog messes", "Set & clear table", "Empty kitchen trash & recycling", "Reset common areas", "Daily personal reset"],
  },
  Friday: {
    jesse:  ["Lead dinner cooking", "Daily personal reset"],
    angela: ["Empty/Load dishwasher", "Cycle & fold/hang laundry", "Feed & walk dogs", "Daily personal reset"],
    jude:   ["Clean dog messes", "Set & clear table", "Empty kitchen trash & recycling", "Reset common areas", "Daily personal reset"],
    david:  ["Assist dinner prep", "Wipe down kitchen counters", "Daily personal reset"],
  },
  Saturday: {
    jesse:  ["Empty/Load dishwasher", "Meal planning for the week", "Finalize the weekly grocery order", "Weed the yard (with Jude)", "Put away own clean laundry", "Daily personal reset"],
    angela: ["Lead dinner cooking", "Water houseplants", "Put away own clean laundry", "Daily personal reset"],
    jude:   ["Set & clear table", "Empty kitchen trash & recycling", "Wipe down kitchen counters", "Reset common areas", "Weed the yard (with Jesse)", "Wash dog bowls", "Collect & empty small trash cans", "Fridge purge", "Put away own clean laundry", "Daily personal reset"],
    david:  ["Assist dinner prep", "Feed & walk dogs", "Clean dog messes", "Supply audit", "Put away own clean laundry", "Daily personal reset"],
  },
  Sunday: {
    jesse:  ["Lead dinner cooking", "Wash all bed linens (biweekly)", "Strip own bed sheets (biweekly)", "Daily personal reset"],
    angela: ["Empty/Load dishwasher", "Grocery pickup or delivery", "Match socks", "Strip own bed sheets (biweekly)", "Daily personal reset"],
    jude:   ["Assist dinner prep", "Empty kitchen trash & recycling", "Wipe down kitchen counters", "Bathroom restock", "Strip own bed sheets (biweekly)", "Daily personal reset"],
    david:  ["Feed & walk dogs", "Clean dog messes", "Set & clear table", "Reset common areas", "Strip own bed sheets (biweekly)", "Daily personal reset"],
  },
};

// ── WEEK B ────────────────────────────────────────────────────────────────────

export const WEEK_B: WeekSchedule = {
  Monday: {
    jesse:  ["Lead dinner cooking", "Process mail/packages", "Daily personal reset"],
    angela: ["Empty/Load dishwasher", "Cycle & fold/hang laundry", "Daily personal reset"],
    jude:   ["Feed the dogs", "Clean dog messes", "Set & clear table", "Empty kitchen trash & recycling", "Take trash/recycling to road", "Reset common areas", "Daily personal reset"],
    david:  ["Assist dinner prep", "Wipe down kitchen counters", "Daily personal reset"],
  },
  Tuesday: {
    jesse:  ["Empty/Load dishwasher", "Cycle & fold/hang laundry", "Daily personal reset"],
    angela: ["Lead dinner cooking", "Collect & sort laundry", "Daily personal reset"],
    jude:   ["Feed the dogs", "Clean dog messes", "Set & clear table", "Empty kitchen trash & recycling", "Daily personal reset"],
    david:  ["Assist dinner prep", "Wipe down kitchen counters", "Daily personal reset"],
  },
  Wednesday: {
    jesse:  ["Lead dinner cooking", "Daily personal reset"],
    angela: ["Empty/Load dishwasher", "Cycle & fold/hang laundry", "Collect & sort laundry", "Daily personal reset"],
    jude:   ["Feed the dogs", "Clean dog messes", "Set & clear table", "Empty kitchen trash & recycling", "Reset common areas", "Daily personal reset"],
    david:  ["Assist dinner prep", "Wipe down kitchen counters", "Daily personal reset"],
  },
  Thursday: {
    jesse:  ["Empty/Load dishwasher", "Cycle & fold/hang laundry", "Process mail/packages", "Daily personal reset"],
    angela: ["Lead dinner cooking", "Daily personal reset"],
    jude:   ["Assist dinner prep", "Wipe down kitchen counters", "Daily personal reset"],
    david:  ["Feed the dogs", "Clean dog messes", "Set & clear table", "Empty kitchen trash & recycling", "Reset common areas", "Daily personal reset"],
  },
  Friday: {
    jesse:  ["Lead dinner cooking", "Daily personal reset"],
    angela: ["Empty/Load dishwasher", "Cycle & fold/hang laundry", "Feed & walk dogs", "Daily personal reset"],
    jude:   ["Clean dog messes", "Set & clear table", "Empty kitchen trash & recycling", "Reset common areas", "Daily personal reset"],
    david:  ["Assist dinner prep", "Wipe down kitchen counters", "Daily personal reset"],
  },
  Saturday: {
    jesse:  ["Empty/Load dishwasher", "Water houseplants", "Fridge purge", "Put away own clean laundry", "Daily personal reset"],
    angela: ["Lead dinner cooking", "Meal planning for the week", "Finalize the weekly grocery order", "Weed the yard (with David)", "Put away own clean laundry", "Daily personal reset"],
    jude:   ["Set & clear table", "Empty kitchen trash & recycling", "Wipe down kitchen counters", "Reset common areas", "Collect & empty small trash cans", "Supply audit", "Put away own clean laundry", "Daily personal reset"],
    david:  ["Assist dinner prep", "Feed & walk dogs", "Clean dog messes", "Weed the yard (with Angela)", "Wash dog bowls", "Put away own clean laundry", "Daily personal reset"],
  },
  Sunday: {
    jesse:  ["Lead dinner cooking", "Grocery pickup or delivery", "Daily personal reset"],
    angela: ["Empty/Load dishwasher", "Match socks", "Daily personal reset"],
    jude:   ["Assist dinner prep", "Empty kitchen trash & recycling", "Wipe down kitchen counters", "Bathroom restock", "Daily personal reset"],
    david:  ["Feed & walk dogs", "Clean dog messes", "Set & clear table", "Reset common areas", "Daily personal reset"],
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
