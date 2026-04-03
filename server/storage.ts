import { createClient } from '@supabase/supabase-js';
import type {
  User, InsertUser,
  Unit,
  Lesson,
  UserProgress, InsertProgress,
  ChatMessage, InsertChatMessage,
} from "@shared/schema";

// Prefer proper server-side env vars; VITE_ prefixed vars are client-bundle only
const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseKey) {
  console.error('[Storage] Missing Supabase env vars. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY on Render.');
}

export const db = createClient(supabaseUrl, supabaseKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getUnits(): Promise<Unit[]>;
  getUnit(id: number): Promise<Unit | undefined>;
  getLessonsByUnit(unitId: number): Promise<Lesson[]>;
  getLesson(id: number): Promise<Lesson | undefined>;
  getProgress(userId: string): Promise<UserProgress[]>;
  getProgressByLesson(userId: string, lessonId: number): Promise<UserProgress | undefined>;
  upsertProgress(progress: InsertProgress): Promise<UserProgress>;
  getChatMessages(userId: string): Promise<ChatMessage[]>;
  addChatMessage(message: InsertChatMessage): Promise<ChatMessage>;
  clearChatMessages(userId: string): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const { data } = await db.from('users').select('*').eq('id', id).single();
    return data ?? undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const { data } = await db.from('users').select('*').eq('username', username).single();
    return data ?? undefined;
  }

  // Note: new users are auto-created by the handle_new_user Postgres trigger.
  // This method exists for manual upserts (e.g. updating username).
  async createUser(user: InsertUser): Promise<User> {
    const { data, error } = await db
      .from('users')
      .upsert({ id: user.id, username: user.username }, { onConflict: 'id' })
      .select()
      .single();
    if (error) throw new Error(error.message);
    return data;
  }

  async getUnits(): Promise<Unit[]> {
    const { data, error } = await db.from('units').select('*').order('order', { ascending: true });
    if (error) throw new Error(error.message);
    return (data ?? []).map(mapUnit);
  }

  async getUnit(id: number): Promise<Unit | undefined> {
    const { data } = await db.from('units').select('*').eq('id', id).single();
    return data ? mapUnit(data) : undefined;
  }

  async getLessonsByUnit(unitId: number): Promise<Lesson[]> {
    const { data, error } = await db.from('lessons').select('*').eq('unit_id', unitId).order('order', { ascending: true });
    if (error) throw new Error(error.message);
    return (data ?? []).map(mapLesson);
  }

  async getLesson(id: number): Promise<Lesson | undefined> {
    const { data } = await db.from('lessons').select('*').eq('id', id).single();
    return data ? mapLesson(data) : undefined;
  }

  async getProgress(userId: string): Promise<UserProgress[]> {
    const { data, error } = await db
      .from('user_progress')
      .select('*')
      .eq('user_id', userId);
    if (error) throw new Error(error.message);
    return (data ?? []).map(mapProgress);
  }

  async getProgressByLesson(userId: string, lessonId: number): Promise<UserProgress | undefined> {
    const { data } = await db
      .from('user_progress')
      .select('*')
      .eq('user_id', userId)
      .eq('lesson_id', lessonId)
      .single();
    return data ? mapProgress(data) : undefined;
  }

  async upsertProgress(progress: InsertProgress): Promise<UserProgress> {
    const { data, error } = await db
      .from('user_progress')
      .upsert(
        {
          user_id: progress.userId,
          lesson_id: progress.lessonId,
          completed: progress.completed,
          score: progress.score,
          completed_at: progress.completedAt ?? null,
        },
        { onConflict: 'user_id,lesson_id' }
      )
      .select()
      .single();
    if (error) throw new Error(error.message);
    return mapProgress(data);
  }

  async getChatMessages(userId: string): Promise<ChatMessage[]> {
    const { data, error } = await db
      .from('chat_messages')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: true });
    if (error) throw new Error(error.message);
    return (data ?? []).map(mapChatMessage);
  }

  async addChatMessage(message: InsertChatMessage): Promise<ChatMessage> {
    const { data, error } = await db
      .from('chat_messages')
      .insert({
        user_id: message.userId,
        role: message.role,
        content: message.content,
        // created_at is set automatically by Postgres
      })
      .select()
      .single();
    if (error) throw new Error(error.message);
    return mapChatMessage(data);
  }

  async clearChatMessages(userId: string): Promise<void> {
    const { error } = await db
      .from('chat_messages')
      .delete()
      .eq('user_id', userId);
    if (error) throw new Error(error.message);
  }
}

// Map Supabase snake_case rows → camelCase app types
function mapUnit(row: any): Unit {
  return {
    id: row.id,
    title: row.title,
    titlePunjabi: row.title_punjabi,
    description: row.description,
    icon: row.icon,
    order: row.order,
    color: row.color,
  };
}

function mapLesson(row: any): Lesson {
  return {
    id: row.id,
    unitId: row.unit_id,
    title: row.title,
    titlePunjabi: row.title_punjabi,
    description: row.description,
    order: row.order,
    type: row.type,
    content: row.content,
  };
}

function mapProgress(row: any): UserProgress {
  return {
    id: row.id,
    userId: row.user_id,
    lessonId: row.lesson_id,
    completed: row.completed,
    score: row.score,
    completedAt: row.completed_at,
  };
}

function mapChatMessage(row: any): ChatMessage {
  return {
    id: row.id,
    userId: row.user_id,
    role: row.role,
    content: row.content,
    createdAt: row.created_at,
  };
}

export const storage = new DatabaseStorage();
