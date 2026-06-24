import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Family members
export const members = sqliteTable("members", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  character: text("character").notNull(), // roshi, goku, gohan, bulma
  color: text("color").notNull(),
  emoji: text("emoji").notNull(),
});

export const insertMemberSchema = createInsertSchema(members).omit({ id: true });
export type InsertMember = z.infer<typeof insertMemberSchema>;
export type Member = typeof members.$inferSelect;

// Chore completions
export const completions = sqliteTable("completions", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  memberId: integer("member_id").notNull(),
  choreKey: text("chore_key").notNull(), // e.g. "jesse_monday_lead-dinner-cooking"
  date: text("date").notNull(), // ISO date string "2026-06-13"
  completed: integer("completed", { mode: "boolean" }).notNull().default(false),
});

export const insertCompletionSchema = createInsertSchema(completions).omit({ id: true });
export type InsertCompletion = z.infer<typeof insertCompletionSchema>;
export type Completion = typeof completions.$inferSelect;

// Dragon Ball wishes — granted when a member collects all 7 balls in a week
export const wishes = sqliteTable("wishes", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  memberId: integer("member_id").notNull(),
  weekStart: text("week_start").notNull(), // ISO date of Monday that week
  wish: text("wish").notNull(),
  grantedAt: text("granted_at").notNull(),
  emailedAt: text("emailed_at"),  // null = not yet emailed via relay
});

export const insertWishSchema = createInsertSchema(wishes).omit({ id: true });
export type InsertWish = z.infer<typeof insertWishSchema>;
export type Wish = typeof wishes.$inferSelect;

// SOS requests — stored so the cron relay can pick them up and email the family
export const sosRequests = sqliteTable("sos_requests", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  memberName: text("member_name").notNull(),
  wish: text("wish").notNull(),
  createdAt: text("created_at").notNull(),
  emailedAt: text("emailed_at"),  // null = not yet emailed
});

export const insertSosRequestSchema = createInsertSchema(sosRequests).omit({ id: true });
export type InsertSosRequest = z.infer<typeof insertSosRequestSchema>;
export type SosRequest = typeof sosRequests.$inferSelect;

// Custom chore overrides (stored per member/day/week so assignments can be edited)
export const choreOverrides = sqliteTable("chore_overrides", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  memberId: integer("member_id").notNull(),
  week: text("week").notNull(),       // "A" or "B"
  day: text("day").notNull(),         // "Monday" … "Sunday"
  chores: text("chores").notNull(),   // JSON array of strings
});

export const insertChoreOverrideSchema = createInsertSchema(choreOverrides).omit({ id: true });
export type InsertChoreOverride = z.infer<typeof insertChoreOverrideSchema>;
export type ChoreOverride = typeof choreOverrides.$inferSelect;

// Chore notes — short text note attached to a specific chore on a specific date
export const choreNotes = sqliteTable("chore_notes", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  memberId: integer("member_id").notNull(),
  choreKey: text("chore_key").notNull(),
  date: text("date").notNull(),
  note: text("note").notNull(),
});

export const insertChoreNoteSchema = createInsertSchema(choreNotes).omit({ id: true });
export type InsertChoreNote = z.infer<typeof insertChoreNoteSchema>;
export type ChoreNote = typeof choreNotes.$inferSelect;

// Messages
export const messages = sqliteTable("messages", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  memberId: integer("member_id").notNull(),
  content: text("content").notNull(),
  timestamp: text("timestamp").notNull(),
});

export const insertMessageSchema = createInsertSchema(messages).omit({ id: true });
export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type Message = typeof messages.$inferSelect;
