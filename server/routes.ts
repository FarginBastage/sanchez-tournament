import type { Express } from "express";
import { type Server } from "http";
import { storage } from "./storage";
import { insertMessageSchema } from "@shared/schema";

export function registerRoutes(httpServer: Server, app: Express): Server {
  // Members
  app.get("/api/members", (_req, res) => {
    res.json(storage.getMembers());
  });

  // Completions for a date
  app.get("/api/completions", (req, res) => {
    const date = req.query.date as string;
    if (!date) return res.status(400).json({ error: "date required" });
    res.json(storage.getCompletions(date));
  });

  // Completions for a member in a date range (for streaks/comparison)
  app.get("/api/completions/member/:id", (req, res) => {
    const memberId = parseInt(req.params.id);
    const dateFrom = req.query.from as string || "";
    const dateTo = req.query.to as string || "";
    res.json(storage.getCompletionsByMember(memberId, dateFrom, dateTo));
  });

  // Toggle completion
  app.post("/api/completions/toggle", (req, res) => {
    const { memberId, choreKey, date } = req.body;
    if (!memberId || !choreKey || !date) return res.status(400).json({ error: "Missing fields" });
    const result = storage.toggleCompletion(memberId, choreKey, date);
    res.json(result);
  });

  // Wishes / Dragon Ball summons
  app.get("/api/wishes", (_req, res) => {
    res.json(storage.getWishes());
  });

  app.post("/api/wishes", (req, res) => {
    const { memberId, weekStart, wish } = req.body;
    if (!memberId || !weekStart || !wish) return res.status(400).json({ error: "Missing fields" });
    // Prevent duplicates
    const existing = storage.getWishByMemberWeek(memberId, weekStart);
    if (existing) return res.json(existing);
    // Store wish — cron relay will pick it up and email the family
    const result = storage.addWish({ memberId, weekStart, wish, grantedAt: new Date().toISOString() });
    res.json(result);
  });

  // Chore overrides
  app.get("/api/overrides", (_req, res) => {
    res.json(storage.getChoreOverrides());
  });

  app.post("/api/overrides", (req, res) => {
    const { memberId, week, day, chores } = req.body;
    if (!memberId || !week || !day || !Array.isArray(chores)) {
      return res.status(400).json({ error: "Missing fields" });
    }
    const result = storage.upsertChoreOverride(memberId, week, day, chores);
    res.json(result);
  });

  app.delete("/api/overrides/:id", (req, res) => {
    storage.deleteChoreOverride(parseInt(req.params.id));
    res.json({ ok: true });
  });

  // SOS — store in DB; cron relay will pick up and email the family
  app.post("/api/sos", (req, res) => {
    const { memberName, wish } = req.body;
    if (!memberName || !wish) return res.status(400).json({ error: "Missing fields" });
    storage.addSosRequest({ memberName, wish, createdAt: new Date().toISOString() });
    res.json({ ok: true });
  });

  // Pending emails — polled by external cron relay every 5 minutes
  // Returns wishes and SOS requests that haven't been emailed yet
  app.get("/api/pending-emails", (_req, res) => {
    const pendingWishes = storage.getPendingWishes();
    const pendingSos = storage.getPendingSosRequests();
    res.json({ wishes: pendingWishes, sos: pendingSos });
  });

  // Mark a wish as emailed (called by cron after sending)
  app.post("/api/pending-emails/mark-wish", (req, res) => {
    const { id } = req.body;
    if (!id) return res.status(400).json({ error: "id required" });
    storage.markWishEmailed(parseInt(id));
    res.json({ ok: true });
  });

  // Mark an SOS as emailed (called by cron after sending)
  app.post("/api/pending-emails/mark-sos", (req, res) => {
    const { id } = req.body;
    if (!id) return res.status(400).json({ error: "id required" });
    storage.markSosEmailed(parseInt(id));
    res.json({ ok: true });
  });

  // Chore notes
  app.get("/api/notes", (req, res) => {
    const date = req.query.date as string;
    if (!date) return res.status(400).json({ error: "date required" });
    res.json(storage.getNotesByDate(date));
  });

  app.post("/api/notes", (req, res) => {
    const { memberId, choreKey, date, note } = req.body;
    if (!memberId || !choreKey || !date || note === undefined) return res.status(400).json({ error: "Missing fields" });

    // Derive a human-readable chore name from the key (member_day_chore-name)
    const choreName = choreKey
      .split("_")
      .slice(2)
      .join(" ")
      .replace(/-/g, " ")
      .replace(/\b\w/g, (c: string) => c.toUpperCase());

    const member = storage.getMember(memberId);
    const memberName = member?.name ?? "Someone";

    if (note === "") {
      storage.deleteChoreNote(memberId, choreKey, date);
      // Post deletion notice to chat
      storage.addMessage({
        memberId,
        content: `📝 ${memberName} removed their note on "${choreName}" (${date})`,
        timestamp: new Date().toISOString(),
      });
      return res.json({ ok: true });
    }

    const result = storage.upsertChoreNote(memberId, choreKey, date, note);

    // Post note to group chat
    storage.addMessage({
      memberId,
      content: `📝 ${memberName} added a note on "${choreName}" (${date}):\n"${note}"`,
      timestamp: new Date().toISOString(),
    });

    res.json(result);
  });

  // Messages
  app.get("/api/messages", (_req, res) => {
    res.json(storage.getMessages());
  });

  app.post("/api/messages", (req, res) => {
    const parsed = insertMessageSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error });
    const msg = storage.addMessage(parsed.data);
    res.json(msg);
  });

  return httpServer;
}
