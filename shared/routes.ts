import { z } from 'zod';
import { insertRoutineSchema, insertDailyLogSchema, insertChatLogSchema, routines, dailyLogs, chatLogs } from './schema';

export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  internal: z.object({
    message: z.string(),
  }),
};

export const api = {
  schedule: {
    list: {
      method: 'GET' as const,
      path: '/api/schedule',
      responses: {
        200: z.array(z.custom<typeof routines.$inferSelect>()),
      },
    },
    // Admin/Seed usage mostly, but useful
    create: {
      method: 'POST' as const,
      path: '/api/schedule',
      input: insertRoutineSchema,
      responses: {
        201: z.custom<typeof routines.$inferSelect>(),
      },
    }
  },
  logs: {
    list: {
      method: 'GET' as const,
      path: '/api/logs',
      input: z.object({ date: z.string() }).optional(),
      responses: {
        200: z.array(z.custom<typeof dailyLogs.$inferSelect>()),
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/logs',
      input: insertDailyLogSchema,
      responses: {
        201: z.custom<typeof dailyLogs.$inferSelect>(),
      },
    },
  },
  chat: {
    history: {
      method: 'GET' as const,
      path: '/api/chat',
      responses: {
        200: z.array(z.custom<typeof chatLogs.$inferSelect>()),
      },
    },
    send: {
      method: 'POST' as const,
      path: '/api/chat',
      input: z.object({ message: z.string() }),
      responses: {
        200: z.object({ 
          response: z.string(),
          audioUrl: z.string().optional() // If we add TTS later
        }),
      },
    },
  },
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}
