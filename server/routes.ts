import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { setupAuth } from "./replit_integrations/auth";
import { z } from "zod";

// We'll use the OpenAI blueprint's client if available, or mock if not ready yet.
// For now, let's assume we can import the integration logic or just implement a simple handler.
// Since we used the blueprint, it might expose a helper, but often we just use the API key 
// via the environment variables provided by Replit's secret management if it was an API key one.
// The "Replit AI Integration" blueprint usually injects some environment variables or a proxy.
// Actually, `blueprint:javascript_openai_ai_integrations` uses `openai` package and Replit's model.

import OpenAI from "openai";

// Seed data from the text file
const SEED_ROUTINES = [
  {
    title: "Wake + Hydrate", startTime: "06:00", endTime: "06:10",
    activity: "Wake up, drink 500ml water, piss, wash face",
    importance: "Critical",
    whyItMatters: "Sets biological rhythm. Dehydration = brain fog all morning.",
    consequence: "Skip this and your brain runs at 60% capacity until lunch.",
    motivation: "Your body just spent 8 hours repairing. Now fuel it. First win of the day starts here.",
    trick: "Keep water bottle next to bed. Drink before touching phone."
  },
  {
    title: "Morning Reflection", startTime: "06:10", endTime: "06:30",
    activity: "Sit with coffee/chai, write 3 goals for today, review yesterday",
    importance: "Critical",
    whyItMatters: "Winners plan. Losers react. Design your day instead of letting it happen to you.",
    consequence: "No reflection = operating on autopilot.",
    motivation: "Today's strategy gets written now. You're either directing your day or getting dragged by it.",
    trick: "Write fast, don't edit. Stream of consciousness."
  },
  {
    title: "Breakfast", startTime: "06:30", endTime: "07:00",
    activity: "Eat real food (paratha + eggs)",
    importance: "High",
    whyItMatters: "Fuel for 2-hour work block. Hunger kills focus.",
    consequence: "Skip this and you'll crash at 9am.",
    motivation: "Eating isn't a break. It's loading ammunition for the battle ahead."
  },
  {
    title: "Smoke Break #1", startTime: "07:00", endTime: "07:10",
    activity: "Smoke, mentally prep for first work block",
    importance: "Medium",
    whyItMatters: "Nicotine + mental transition into work mode.",
    motivation: "Last smoke for an hour. Make this work block count."
  },
  {
    title: "WORK BLOCK 1", startTime: "07:10", endTime: "09:10",
    activity: "Deep work on client projects (GHL funnels, widgets, workflows)",
    importance: "CRITICAL",
    whyItMatters: "This is revenue generation time.",
    consequence: "Skip this and you stay broke. Clients hire people who deliver.",
    motivation: "Two focused hours = what most people do in 8 distracted hours.",
    subTasks: ["10 squats every 10 min", "Upper body shuffle every 30 min", "Quick smoke at 08:10"]
  },
  {
    title: "Break + Movement", startTime: "09:10", endTime: "09:30",
    activity: "Walk around, stretch, hydrate",
    importance: "High",
    whyItMatters: "Brain needs oxygen. Sitting 2 hours straight = mental fog.",
    motivation: "Movement = mental reset. You're sharpening the blade."
  },
  {
    title: "WORK BLOCK 2", startTime: "09:30", endTime: "11:30",
    activity: "Client work OR prospecting/outreach",
    importance: "CRITICAL",
    whyItMatters: "Build funnel pipeline or deliver for existing clients.",
    consequence: "Skip this and you're 4 hours behind.",
    motivation: "Block 2 is where discipline shows up. Winners do Block 2.",
    subTasks: ["10 squats every 10 min", "Upper body shuffle every 30 min", "Smoke break at 10:30"]
  },
  {
    title: "Lunch Prep + Eat", startTime: "11:30", endTime: "12:00",
    activity: "Cook or order, eat slowly",
    importance: "High",
    whyItMatters: "Midday fuel. Mental break.",
    consequence: "Skip lunch = energy crash at 2pm.",
    motivation: "Lunch isn't lazy. It's strategic refueling."
  },
  {
    title: "Smoke Break #4", startTime: "12:00", endTime: "12:10",
    activity: "Smoke, let lunch digest",
    importance: "Medium",
    motivation: "Halfway through work. You're doing the thing."
  },
  {
    title: "WORK BLOCK 3", startTime: "12:10", endTime: "14:10",
    activity: "Deep work on toughest task of the day",
    importance: "CRITICAL",
    whyItMatters: "Prime focus time. Brain is fed, body awake.",
    consequence: "Waste Block 3 and you'll scramble in Block 4.",
    motivation: "This block is for the hard stuff. The stuff that pays the most.",
    subTasks: ["10 squats every 10 min", "Upper body shuffle every 30 min", "Smoke break at 13:10"]
  },
  {
    title: "Afternoon Reset", startTime: "14:10", endTime: "14:30",
    activity: "Step outside, stretch, breathe, hydrate",
    importance: "High",
    whyItMatters: "6 hours of work = mental fatigue. Reset now.",
    motivation: "You're not a machine. Even machines need maintenance."
  },
  {
    title: "WORK BLOCK 4", startTime: "14:30", endTime: "16:30",
    activity: "Final push OR admin tasks",
    importance: "High",
    whyItMatters: "Last work block. Finish strong.",
    motivation: "Block 4 is the closer. Don't leave wins on the table.",
    subTasks: ["10 squats every 10 min", "Upper body shuffle every 30 min", "Smoke break at 15:30"]
  },
  {
    title: "Smoke Break #7", startTime: "16:30", endTime: "16:40",
    activity: "Smoke, decompress",
    importance: "Medium",
    motivation: "8 hours done. You showed up. Now reset your brain."
  },
  {
    title: "Snack + Hydrate", startTime: "16:40", endTime: "17:00",
    activity: "Light snack, drink 300ml water",
    importance: "Medium",
    whyItMatters: "Fuel before snooker."
  },
  {
    title: "SNOOKER SESSION", startTime: "17:00", endTime: "19:00",
    activity: "Play snooker (solo practice or with friends)",
    importance: "CRITICAL",
    whyItMatters: "Mental reset + flow state training.",
    consequence: "Skip snooker and you'll burn out. Creativity dies.",
    motivation: "Flow state unlocks creativity. This isn't wasted time. It's brain maintenance."
  },
  {
    title: "Smoke Break #8", startTime: "19:00", endTime: "19:10",
    activity: "Smoke after snooker",
    importance: "Medium",
    motivation: "Mental reset complete."
  },
  {
    title: "Dinner", startTime: "19:10", endTime: "20:00",
    activity: "Eat slowly, no screens",
    importance: "High",
    whyItMatters: "Recovery meal.",
    motivation: "Eating is not multitasking time. Sit. Eat. Enjoy."
  },
  {
    title: "Evening Reflection", startTime: "20:00", endTime: "20:30",
    activity: "Review work, write 1 thing learned, plan tomorrow",
    importance: "CRITICAL",
    whyItMatters: "Without reflection, you don't learn.",
    consequence: "Skip this and tomorrow will be chaotic.",
    motivation: "Today's data = tomorrow's strategy."
  },
  {
    title: "Free Time", startTime: "20:30", endTime: "22:00",
    activity: "Do whatever you want",
    importance: "High",
    whyItMatters: "Brain needs downtime.",
    motivation: "You earned this."
  },
  {
    title: "Night Routine", startTime: "22:00", endTime: "22:15",
    activity: "Brush teeth, shower, alarm set",
    importance: "Critical",
    whyItMatters: "Good sleep starts with good pre-sleep routine.",
    motivation: "Sleep is building your future self."
  },
  {
    title: "SLEEP", startTime: "22:15", endTime: "06:00",
    activity: "Sleep",
    importance: "CRITICAL",
    whyItMatters: "Brain repairs. Memories consolidate.",
    consequence: "Sleep 6 hours and tomorrow you'll be 40% dumber.",
    motivation: "Every hour you sleep = 2 hours of productive work tomorrow."
  }
];

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Set up Replit Auth
  setupAuth(app);

  // Seed Data
  await storage.seedRoutines(SEED_ROUTINES);

  // --- API ROUTES ---

  app.get(api.schedule.list.path, async (req, res) => {
    // In a real app, we might filter by user, but for now global schedule is fine for a personal app
    // or we copy the seed to the user's list.
    const routines = await storage.getRoutines();
    res.json(routines);
  });

  app.get(api.logs.list.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const userId = (req.user as any).id;
    const date = req.query.date as string | undefined;
    const logs = await storage.getDailyLogs(userId, date);
    res.json(logs);
  });

  app.post(api.logs.create.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const userId = (req.user as any).id;
    try {
      const input = api.logs.create.input.parse({ ...req.body, userId });
      const log = await storage.createDailyLog(input);
      res.status(201).json(log);
    } catch (e) {
      res.status(400).json({ message: "Invalid input" });
    }
  });

  // Chat / Coaching
  app.get(api.chat.history.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const userId = (req.user as any).id;
    const logs = await storage.getChatLogs(userId);
    res.json(logs);
  });

  app.post(api.chat.send.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const userId = (req.user as any).id;
    const { message } = req.body;

    // Save user message
    await storage.addChatLog({
      userId,
      role: "user",
      content: message
    });

    // Call OpenAI
    try {
      const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
      const completion = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          { 
            role: "system", 
            content: "You are a strict, no-nonsense accountability coach for Muhammad Daud Khan, a Level 10 Mage and GHL developer. You speak directly, concisely, and focus on discipline, revenue, and execution. Do not coddle him. Remind him of the consequences of failure and the glory of success. Use the context of his strict daily routine." 
          },
          { role: "user", content: message }
        ],
      });

      const responseContent = completion.choices[0].message.content || "Stay focused.";

      // Save assistant message
      await storage.addChatLog({
        userId,
        role: "assistant",
        content: responseContent
      });

      res.json({ response: responseContent });
    } catch (error) {
      console.error("OpenAI Error:", error);
      res.status(500).json({ message: "Coach is offline." });
    }
  });

  return httpServer;
}
