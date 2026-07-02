import { type InferInsertModel, type InferSelectModel, sql } from "drizzle-orm";
import { pgTable, text, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";

export const sessionsTable = pgTable("sessions", {
  id: text("id").primaryKey().default(sql`gen_random_uuid()::text`),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  status: text("status").notNull().default("in_progress"), // 'in_progress' | 'complete' | 'abandoned'
  exportCount: integer("export_count").notNull().default(0),
});

export const insertSessionSchema = createInsertSchema(sessionsTable).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertSession = InferInsertModel<typeof sessionsTable>;
export type Session = InferSelectModel<typeof sessionsTable>;
