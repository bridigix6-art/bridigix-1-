import { type InferInsertModel, type InferSelectModel } from "drizzle-orm";
import { pgTable, bigserial, text, timestamp } from "drizzle-orm/pg-core";
import { sessionsTable } from "./sessions";
import { createInsertSchema } from "drizzle-zod";

export const chatMessagesTable = pgTable("chat_messages", {
  id: bigserial("id", { mode: "bigint" }).primaryKey(),
  sessionId: text("session_id").notNull().references(() => sessionsTable.id, { onDelete: "cascade" }),
  role: text("role").notNull(), // 'user' | 'assistant'
  content: text("content").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertChatMessageSchema = createInsertSchema(chatMessagesTable).omit({
  id: true,
  createdAt: true,
});

export type InsertChatMessage = InferInsertModel<typeof chatMessagesTable>;
export type ChatMessage = InferSelectModel<typeof chatMessagesTable>;
