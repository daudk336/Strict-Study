import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { insertRoutineSchema, type Routine, type DailyLog } from "@shared/schema";
import { z } from "zod";

// --- Routines (Schedule) Hooks ---

export function useSchedule() {
  return useQuery({
    queryKey: [api.schedule.list.path],
    queryFn: async () => {
      const res = await fetch(api.schedule.list.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch schedule");
      return api.schedule.list.responses[200].parse(await res.json());
    },
  });
}

export function useCreateRoutine() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: z.infer<typeof insertRoutineSchema>) => {
      const res = await fetch(api.schedule.create.path, {
        method: api.schedule.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to create routine");
      return api.schedule.create.responses[201].parse(await res.json());
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [api.schedule.list.path] }),
  });
}

// --- Daily Logs Hooks ---

export function useDailyLogs(date: string) {
  return useQuery({
    queryKey: [api.logs.list.path, { date }],
    queryFn: async () => {
      const url = buildUrl(api.logs.list.path) + `?date=${date}`;
      const res = await fetch(url, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch logs");
      return api.logs.list.responses[200].parse(await res.json());
    },
  });
}

export function useCreateLog() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { routineId: number; status: string; date: string; notes?: string }) => {
      const res = await fetch(api.logs.create.path, {
        method: api.logs.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: 0, ...data }), // userId handled by backend session usually, but schema demands it if not omitted. Assuming backend handles it or we pass a dummy if schema requires input.
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to log status");
      return api.logs.create.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.logs.list.path] });
    },
  });
}
