import { db } from "./db";
import {
  users, routines, dailyLogs, chatLogs,
  type User, type InsertUser,
  type Routine, type DailyLog, type ChatLog
} from "@shared/schema";
import { eq, and } from "drizzle-orm";

export interface IStorage {
  // User
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Routine
  getRoutines(): Promise<Routine[]>;
  createRoutine(routine: any): Promise<Routine>; // using any to bypass strict insert schema if needed for bulk
  seedRoutines(routinesData: any[]): Promise<void>;

  // Logs
  getDailyLogs(userId: string, date?: string): Promise<DailyLog[]>;
  createDailyLog(log: any): Promise<DailyLog>;

  // Chat
  getChatLogs(userId: string): Promise<ChatLog[]>;
  addChatLog(log: any): Promise<ChatLog>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    // Note: Replit Auth 'users' table has 'email', not 'username'. 
    // We'll map username to email if needed, or just return undefined if not present.
    // The blueprint users table has: id, email, firstName, lastName.
    const [user] = await db.select().from(users).where(eq(users.email, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async getRoutines(): Promise<Routine[]> {
    // Return all routines, sorted by start time roughly (string sort works for 24h format "06:00")
    return await db.select().from(routines).orderBy(routines.startTime);
  }

  async createRoutine(routine: any): Promise<Routine> {
    const [r] = await db.insert(routines).values(routine).returning();
    return r;
  }

  async seedRoutines(routinesData: any[]): Promise<void> {
    const existing = await this.getRoutines();
    if (existing.length === 0) {
      await db.insert(routines).values(routinesData);
    }
  }

  async getDailyLogs(userId: string, date?: string): Promise<DailyLog[]> {
    if (date) {
      return await db.select().from(dailyLogs).where(
        and(eq(dailyLogs.userId, userId), eq(dailyLogs.date, date))
      );
    }
    return await db.select().from(dailyLogs).where(eq(dailyLogs.userId, userId));
  }

  async createDailyLog(log: any): Promise<DailyLog> {
    const [l] = await db.insert(dailyLogs).values(log).returning();
    return l;
  }

  async getChatLogs(userId: string): Promise<ChatLog[]> {
    return await db.select().from(chatLogs).where(eq(chatLogs.userId, userId));
  }

  async addChatLog(log: any): Promise<ChatLog> {
    const [l] = await db.insert(chatLogs).values(log).returning();
    return l;
  }
}

export const storage = new DatabaseStorage();
