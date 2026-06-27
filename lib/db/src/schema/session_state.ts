import { pgTable, uuid, jsonb, timestamp } from "drizzle-orm/pg-core";
import { sessionsTable } from "./sessions";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const sessionStateTable = pgTable("session_state", {
  sessionId: uuid("session_id").primaryKey().references(() => sessionsTable.id, { onDelete: "cascade" }),
  state: jsonb("state").notNull().default({}),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertSessionStateSchema = createInsertSchema(sessionStateTable);

export type InsertSessionState = z.infer<typeof insertSessionStateSchema>;
export type SessionState = typeof sessionStateTable.$inferSelect;
