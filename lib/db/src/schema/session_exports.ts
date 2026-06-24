import { pgTable, bigserial, uuid, integer, text, timestamp, unique } from "drizzle-orm/pg-core";
import { sessionsTable } from "./sessions";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const sessionExportsTable = pgTable(
  "session_exports",
  {
    id: bigserial("id", { mode: "bigint" }).primaryKey(),
    sessionId: uuid("session_id").notNull().references(() => sessionsTable.id, { onDelete: "cascade" }),
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

export type InsertSessionExport = z.infer<typeof insertSessionExportSchema>;
export type SessionExport = typeof sessionExportsTable.$inferSelect;
