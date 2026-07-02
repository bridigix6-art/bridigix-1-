import { type InferInsertModel, type InferSelectModel } from "drizzle-orm";
import { pgTable, text, jsonb, timestamp } from "drizzle-orm/pg-core";
import { sessionsTable } from "./sessions";
import { createInsertSchema } from "drizzle-zod";

export const sessionStateTable = pgTable("session_state", {
  sessionId: text("session_id").primaryKey().references(() => sessionsTable.id, { onDelete: "cascade" }),
  state: jsonb("state").notNull().default({}),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertSessionStateSchema = createInsertSchema(sessionStateTable);

export type InsertSessionState = InferInsertModel<typeof sessionStateTable>;
export type SessionState = InferSelectModel<typeof sessionStateTable>;
