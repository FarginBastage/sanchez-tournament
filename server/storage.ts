import { drizzle } from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";
import { eq, and } from "drizzle-orm";
import { members, completions, choreOverrides, wishes, sosRequests, messages, choreNotes, type Member, type InsertMember, type Completion, type InsertCompletion, type ChoreOverride, type InsertChoreOverride, type Wish, type InsertWish, type SosRequest, type InsertSosRequest, type Message, type InsertMessage, type ChoreNote, type InsertChoreNote } from "@shared/schema";

const sqlite = new Database("data.db");
const db = drizzle(sqlite);

// Initialize tables
sqlite.exec(`
  CREATE TABLE IF NOT EXISTS members (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    character TEXT NOT NULL,
    color TEXT NOT NULL,
    emoji TEXT NOT NULL
  );
  CREATE TABLE IF NOT EXISTS completions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    member_id INTEGER NOT NULL,
    chore_key TEXT NOT NULL,
    date TEXT NOT NULL,
    completed INTEGER NOT NULL DEFAULT 0
  );
  CREATE TABLE IF NOT EXISTS wishes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    member_id INTEGER NOT NULL,
    week_start TEXT NOT NULL,
    wish TEXT NOT NULL,
    granted_at TEXT NOT NULL,
    emailed_at TEXT
  );
  CREATE TABLE IF NOT EXISTS sos_requests (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    member_name TEXT NOT NULL,
    wish TEXT NOT NULL,
    created_at TEXT NOT NULL,
    emailed_at TEXT
  );
  CREATE TABLE IF NOT EXISTS chore_overrides (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    member_id INTEGER NOT NULL,
    week TEXT NOT NULL,
    day TEXT NOT NULL,
    chores TEXT NOT NULL
  );
  CREATE TABLE IF NOT EXISTS messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    member_id INTEGER NOT NULL,
    content TEXT NOT NULL,
    timestamp TEXT NOT NULL
  );
  CREATE TABLE IF NOT EXISTS chore_notes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    member_id INTEGER NOT NULL,
    chore_key TEXT NOT NULL,
    date TEXT NOT NULL,
    note TEXT NOT NULL
  );
`);

// Migrate: add emailed_at to wishes if it doesn't exist yet
try {
  sqlite.exec(`ALTER TABLE wishes ADD COLUMN emailed_at TEXT`);
} catch (_) { /* column already exists — safe to ignore */ }

// Seed default members if empty
const existingMembers = db.select().from(members).all();
if (existingMembers.length === 0) {
  db.insert(members).values([
    { name: "Jesse", character: "vegeta", color: "#1565c0", emoji: "👑" },
    { name: "Angela", character: "bulma", color: "#7b1fa2", emoji: "💡" },
    { name: "Jude", character: "gohan", color: "#2e7d32", emoji: "⚡" },
    { name: "David", character: "goku", color: "#f57f17", emoji: "🔥" },
  ]).run();
}

export interface IStorage {
  getMembers(): Member[];
  getMember(id: number): Member | undefined;
  getCompletions(date: string): Completion[];
  getCompletionsByMember(memberId: number, dateFrom: string, dateTo: string): Completion[];
  toggleCompletion(memberId: number, choreKey: string, date: string): Completion;
  getWishes(): Wish[];
  getWishByMemberWeek(memberId: number, weekStart: string): Wish | undefined;
  addWish(w: InsertWish): Wish;
  markWishEmailed(id: number): void;
  getPendingWishes(): Wish[];
  addSosRequest(req: InsertSosRequest): SosRequest;
  getPendingSosRequests(): SosRequest[];
  markSosEmailed(id: number): void;
  getChoreOverrides(): ChoreOverride[];
  upsertChoreOverride(memberId: number, week: string, day: string, chores: string[]): ChoreOverride;
  deleteChoreOverride(id: number): void;
  getMessages(): Message[];
  addMessage(msg: InsertMessage): Message;
  getNotesByDate(date: string): ChoreNote[];
  upsertChoreNote(memberId: number, choreKey: string, date: string, note: string): ChoreNote;
  deleteChoreNote(memberId: number, choreKey: string, date: string): void;
}

export const storage: IStorage = {
  getMembers() {
    return db.select().from(members).all();
  },
  getMember(id) {
    return db.select().from(members).where(eq(members.id, id)).get();
  },
  getCompletions(date) {
    return db.select().from(completions).where(eq(completions.date, date)).all();
  },
  getCompletionsByMember(memberId, dateFrom, dateTo) {
    return db.select().from(completions)
      .where(and(eq(completions.memberId, memberId), eq(completions.completed, true)))
      .all()
      .filter(c => c.date >= dateFrom && c.date <= dateTo);
  },
  toggleCompletion(memberId, choreKey, date) {
    const existing = db.select().from(completions)
      .where(and(
        eq(completions.memberId, memberId),
        eq(completions.choreKey, choreKey),
        eq(completions.date, date)
      )).get();

    if (existing) {
      db.update(completions)
        .set({ completed: !existing.completed })
        .where(eq(completions.id, existing.id))
        .run();
      return db.select().from(completions).where(eq(completions.id, existing.id)).get()!;
    } else {
      return db.insert(completions).values({ memberId, choreKey, date, completed: true }).returning().get();
    }
  },
  getWishes() {
    return db.select().from(wishes).all();
  },
  getWishByMemberWeek(memberId, weekStart) {
    return db.select().from(wishes)
      .where(and(eq(wishes.memberId, memberId), eq(wishes.weekStart, weekStart)))
      .get();
  },
  addWish(w) {
    return db.insert(wishes).values(w).returning().get();
  },
  markWishEmailed(id) {
    db.update(wishes).set({ emailedAt: new Date().toISOString() }).where(eq(wishes.id, id)).run();
  },
  getPendingWishes() {
    return db.select().from(wishes).all().filter(w => !w.emailedAt);
  },
  addSosRequest(req) {
    return db.insert(sosRequests).values(req).returning().get();
  },
  getPendingSosRequests() {
    return db.select().from(sosRequests).all().filter(s => !s.emailedAt);
  },
  markSosEmailed(id) {
    db.update(sosRequests).set({ emailedAt: new Date().toISOString() }).where(eq(sosRequests.id, id)).run();
  },
  getChoreOverrides() {
    return db.select().from(choreOverrides).all();
  },
  upsertChoreOverride(memberId, week, day, chores) {
    const existing = db.select().from(choreOverrides)
      .where(and(
        eq(choreOverrides.memberId, memberId),
        eq(choreOverrides.week, week),
        eq(choreOverrides.day, day)
      )).get();
    if (existing) {
      db.update(choreOverrides)
        .set({ chores: JSON.stringify(chores) })
        .where(eq(choreOverrides.id, existing.id))
        .run();
      return db.select().from(choreOverrides).where(eq(choreOverrides.id, existing.id)).get()!;
    } else {
      return db.insert(choreOverrides).values({ memberId, week, day, chores: JSON.stringify(chores) }).returning().get();
    }
  },
  deleteChoreOverride(id) {
    db.delete(choreOverrides).where(eq(choreOverrides.id, id)).run();
  },
  getMessages() {
    return db.select().from(messages).all().slice(-100);
  },
  addMessage(msg) {
    return db.insert(messages).values(msg).returning().get();
  },
  getNotesByDate(date) {
    return db.select().from(choreNotes).where(eq(choreNotes.date, date)).all();
  },
  upsertChoreNote(memberId, choreKey, date, note) {
    const existing = db.select().from(choreNotes)
      .where(and(eq(choreNotes.memberId, memberId), eq(choreNotes.choreKey, choreKey), eq(choreNotes.date, date)))
      .get();
    if (existing) {
      db.update(choreNotes).set({ note }).where(eq(choreNotes.id, existing.id)).run();
      return db.select().from(choreNotes).where(eq(choreNotes.id, existing.id)).get()!;
    }
    return db.insert(choreNotes).values({ memberId, choreKey, date, note }).returning().get();
  },
  deleteChoreNote(memberId, choreKey, date) {
    db.delete(choreNotes)
      .where(and(eq(choreNotes.memberId, memberId), eq(choreNotes.choreKey, choreKey), eq(choreNotes.date, date)))
      .run();
  },
};
