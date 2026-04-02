import { z } from "zod";

// ── Plain TypeScript types (no Drizzle/SQLite) ──────────────────────────────

export type User = {
  id: number;
  username: string;
  password: string;
};

export type Unit = {
  id: number;
  title: string;
  titlePunjabi: string;
  description: string;
  icon: string;
  order: number;
  color: string;
};

export type Lesson = {
  id: number;
  unitId: number;
  title: string;
  titlePunjabi: string;
  description: string;
  order: number;
  type: string;
  content: string;
};

export type UserProgress = {
  id: number;
  lessonId: number;
  completed: boolean;
  score: number;
  lastAccessed: string;
};

export type ChatMessage = {
  id: number;
  role: string;
  content: string;
  timestamp: string;
};

// ── Zod schemas for validation ───────────────────────────────────────────────

export const insertUserSchema = z.object({
  username: z.string(),
  password: z.string(),
});

export const insertProgressSchema = z.object({
  lessonId: z.number(),
  completed: z.boolean(),
  score: z.number(),
  lastAccessed: z.string(),
});

export const insertChatMessageSchema = z.object({
  role: z.string(),
  content: z.string(),
  timestamp: z.string(),
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertProgress = z.infer<typeof insertProgressSchema>;
export type InsertChatMessage = z.infer<typeof insertChatMessageSchema>;
