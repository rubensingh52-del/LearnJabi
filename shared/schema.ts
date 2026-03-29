import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = sqliteTable("users", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const units = sqliteTable("units", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  title: text("title").notNull(),
  titlePunjabi: text("title_punjabi").notNull(),
  description: text("description").notNull(),
  icon: text("icon").notNull(),
  order: integer("order").notNull(),
  color: text("color").notNull(),
});

export const lessons = sqliteTable("lessons", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  unitId: integer("unit_id").notNull(),
  title: text("title").notNull(),
  titlePunjabi: text("title_punjabi").notNull(),
  description: text("description").notNull(),
  order: integer("order").notNull(),
  type: text("type").notNull(), // "vocabulary" | "phrases" | "grammar" | "practice" | "culture"
  content: text("content").notNull(), // JSON string
});

export const userProgress = sqliteTable("user_progress", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  lessonId: integer("lesson_id").notNull(),
  completed: integer("completed", { mode: "boolean" }).notNull().default(false),
  score: integer("score").notNull().default(0),
  lastAccessed: text("last_accessed").notNull(),
});

export const chatMessages = sqliteTable("chat_messages", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  role: text("role").notNull(), // "user" | "assistant"
  content: text("content").notNull(),
  timestamp: text("timestamp").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertProgressSchema = createInsertSchema(userProgress).omit({ id: true });
export const insertChatMessageSchema = createInsertSchema(chatMessages).omit({ id: true });

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type Unit = typeof units.$inferSelect;
export type Lesson = typeof lessons.$inferSelect;
export type UserProgress = typeof userProgress.$inferSelect;
export type ChatMessage = typeof chatMessages.$inferSelect;
export type InsertProgress = z.infer<typeof insertProgressSchema>;
export type InsertChatMessage = z.infer<typeof insertChatMessageSchema>;
