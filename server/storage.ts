import {
  type User, type InsertUser, users,
  type Unit, units,
  type Lesson, lessons,
  type UserProgress, userProgress, type InsertProgress,
  type ChatMessage, chatMessages, type InsertChatMessage,
} from "@shared/schema";
import { drizzle } from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";
import { eq, asc, desc } from "drizzle-orm";

const sqlite = new Database("data.db");
sqlite.pragma("journal_mode = WAL");

export const db = drizzle(sqlite);

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getUnits(): Promise<Unit[]>;
  getUnit(id: number): Promise<Unit | undefined>;
  getLessonsByUnit(unitId: number): Promise<Lesson[]>;
  getLesson(id: number): Promise<Lesson | undefined>;
  getProgress(): Promise<UserProgress[]>;
  getProgressByLesson(lessonId: number): Promise<UserProgress | undefined>;
  upsertProgress(progress: InsertProgress): Promise<UserProgress>;
  getChatMessages(): Promise<ChatMessage[]>;
  addChatMessage(message: InsertChatMessage): Promise<ChatMessage>;
  clearChatMessages(): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    return db.select().from(users).where(eq(users.id, id)).get();
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return db.select().from(users).where(eq(users.username, username)).get();
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    return db.insert(users).values(insertUser).returning().get();
  }

  async getUnits(): Promise<Unit[]> {
    return db.select().from(units).orderBy(asc(units.order)).all();
  }

  async getUnit(id: number): Promise<Unit | undefined> {
    return db.select().from(units).where(eq(units.id, id)).get();
  }

  async getLessonsByUnit(unitId: number): Promise<Lesson[]> {
    return db.select().from(lessons).where(eq(lessons.unitId, unitId)).orderBy(asc(lessons.order)).all();
  }

  async getLesson(id: number): Promise<Lesson | undefined> {
    return db.select().from(lessons).where(eq(lessons.id, id)).get();
  }

  async getProgress(): Promise<UserProgress[]> {
    return db.select().from(userProgress).all();
  }

  async getProgressByLesson(lessonId: number): Promise<UserProgress | undefined> {
    return db.select().from(userProgress).where(eq(userProgress.lessonId, lessonId)).get();
  }

  async upsertProgress(progress: InsertProgress): Promise<UserProgress> {
    const existing = await this.getProgressByLesson(progress.lessonId);
    if (existing) {
      db.update(userProgress)
        .set({ completed: progress.completed, score: progress.score, lastAccessed: progress.lastAccessed })
        .where(eq(userProgress.id, existing.id))
        .run();
      return db.select().from(userProgress).where(eq(userProgress.id, existing.id)).get()!;
    }
    return db.insert(userProgress).values(progress).returning().get();
  }

  async getChatMessages(): Promise<ChatMessage[]> {
    return db.select().from(chatMessages).orderBy(asc(chatMessages.id)).all();
  }

  async addChatMessage(message: InsertChatMessage): Promise<ChatMessage> {
    return db.insert(chatMessages).values(message).returning().get();
  }

  async clearChatMessages(): Promise<void> {
    db.delete(chatMessages).run();
  }
}

export const storage = new DatabaseStorage();
