import { z } from "zod";

// ── Plain TypeScript types (aligned with Supabase schema.sql) ────────────────

export type User = {
  id: string;         // uuid — references auth.users(id)
  username: string;
  created_at?: string;
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
  userId: string;
  lessonId: number;
  completed: boolean;
  score: number;
  completedAt: string | null;
  lastAccessed: string | null;  // matches last_accessed in DB
};

export type ChatMessage = {
  id: number;
  userId: string;
  role: string;
  content: string;
  createdAt: string;  // matches created_at in DB
};

// ── Zod schemas for validation ───────────────────────────────────────────────

// createUser is handled automatically by the Supabase trigger handle_new_user
// so InsertUser is only used if you need to manually upsert a profile
export const insertUserSchema = z.object({
  id: z.string(),      // uuid from auth.users
  username: z.string().optional(),
});

export const insertProgressSchema = z.object({
  userId: z.string(),
  lessonId: z.number(),
  completed: z.boolean(),
  score: z.number(),
  completedAt: z.string().nullable().optional(),
  lastAccessed: z.string().optional(),
});

export const insertChatMessageSchema = z.object({
  userId: z.string(),
  role: z.string(),
  content: z.string(),
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertProgress = z.infer<typeof insertProgressSchema>;
export type InsertChatMessage = z.infer<typeof insertChatMessageSchema>;
