import { type InferInsertModel, type InferSelectModel } from "drizzle-orm";
import { pgTable, bigserial, integer, text, timestamp, unique } from "drizzle-orm/pg-core";
import { sessionsTable } from "./sessions";
import { createInsertSchema } from "drizzle-zod";

export const sessionExportsTable = pgTable(
  "session_exports",
  {
    id: bigserial("id", { mode: "bigint" }).primaryKey(),
    sessionId: text("session_id").notNull().references(() => sessionsTable.id, { onDelete: "cascade" }),
    version: integer("version").notNull(),
    storagePath: text("storage_path").notNull(), // path inside 'exports' storage bucket
    fileSizeBytes: integer("file_size_bytes").notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => ({
    uniqueSessionVersion: unique().on(table.sessionId, table.version),
  })
);

export const insertSessionExportSchema = createInsertSchema(sessionExportsTable).omit({
  id: true,
  createdAt: true,
});

export type InsertSessionExport = InferInsertModel<typeof sessionExportsTable>;
export type SessionExport = InferSelectModel<typeof sessionExportsTable>;
