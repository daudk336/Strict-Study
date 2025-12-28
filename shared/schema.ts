import { pgTable, text, serial, integer, boolean, timestamp, jsonb, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Import Auth and Chat models from blueprints
export * from "./models/auth";
export * from "./models/chat";

import { users } from "./models/auth";

// Routine/Schedule Definition
export const routines = pgTable("routines", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id), // Global or specific user
  title: text("title").notNull(),
  startTime: text("start_time").notNull(), // "06:00"
  endTime: text("end_time").notNull(),     // "06:10"
  activity: text("activity").notNull(),
  importance: text("importance").notNull(), // "Critical", "High", "Medium"
  whyItMatters: text("why_it_matters"),
  consequence: text("consequence"),
  motivation: text("motivation"),
  trick: text("trick"),
  subTasks: jsonb("sub_tasks"), // Array of strings or objects
});

// Daily Tracking Logs
export const dailyLogs = pgTable("daily_logs", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  routineId: integer("routine_id").references(() => routines.id),
  date: text("date").notNull(), // "YYYY-MM-DD"
  status: text("status").notNull(), // "completed", "skipped", "partial"
  notes: text("notes"),
  completedAt: timestamp("completed_at").defaultNow(),
});

// Chat/Coaching Logs - Note: chat blueprint has 'messages' table, but we can have our own or use that.
// We'll use our own 'chatLogs' for the specific coaching context if different, or just use the blueprint's.
// The blueprint's 'messages' table is linked to 'conversations'. 
// We will stick to our simple chatLogs for the coach interface for now, or adapt to blueprint.
// Let's use our simple table for the "Coach" specific history if we want linear chat.
export const chatLogs = pgTable("chat_logs", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  role: text("role").notNull(), // "user" or "assistant"
  content: text("content").notNull(),
  timestamp: timestamp("timestamp").defaultNow(),
});

// Schemas
export const insertRoutineSchema = createInsertSchema(routines).omit({ id: true });
export const insertDailyLogSchema = createInsertSchema(dailyLogs).omit({ id: true, completedAt: true });
export const insertChatLogSchema = createInsertSchema(chatLogs).omit({ id: true, timestamp: true });

// Types
export type Routine = typeof routines.$inferSelect;
export type DailyLog = typeof dailyLogs.$inferSelect;
export type ChatLog = typeof chatLogs.$inferSelect;
