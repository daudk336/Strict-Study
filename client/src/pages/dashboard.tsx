import { Shell } from "@/components/layout/shell";
import { DigitalClock } from "@/components/dashboard/clock";
import { CurrentMission } from "@/components/dashboard/current-mission";
import { useSchedule, useDailyLogs, useCreateLog } from "@/hooks/use-schedule";
import { useAuth } from "@/hooks/use-auth";
import { format } from "date-fns";
import { Loader2 } from "lucide-react";
import { Redirect } from "wouter";
import { useEffect, useState } from "react";
import type { Routine } from "@shared/schema";

export default function DashboardPage() {
  const { user, isLoading: authLoading } = useAuth();
  const { data: schedule, isLoading: scheduleLoading } = useSchedule();
  const today = format(new Date(), "yyyy-MM-dd");
  const { data: logs } = useDailyLogs(today);
  const { mutate: logStatus, isPending } = useCreateLog();

  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000); // Check minute updates
    return () => clearInterval(timer);
  }, []);

  if (authLoading) return <div className="h-screen bg-black flex items-center justify-center text-primary"><Loader2 className="animate-spin w-12 h-12" /></div>;
  if (!user) return <Redirect to="/login" />;

  // Logic to find current routine block
  const currentMinutes = currentTime.getHours() * 60 + currentTime.getMinutes();
  
  const getRoutineMinutes = (timeStr: string) => {
    const [h, m] = timeStr.split(':').map(Number);
    return h * 60 + m;
  };

  const currentRoutine = schedule?.find((r: Routine) => {
    const start = getRoutineMinutes(r.startTime);
    const end = getRoutineMinutes(r.endTime);
    return currentMinutes >= start && currentMinutes < end;
  });

  // Find next routine
  const nextRoutine = schedule?.find((r: Routine) => {
    const start = getRoutineMinutes(r.startTime);
    return start > currentMinutes;
  });

  const handleLog = (status: "completed" | "skipped") => {
    if (!currentRoutine) return;
    logStatus({
      routineId: currentRoutine.id,
      status,
      date: today,
    });
  };

  return (
    <Shell>
      <div className="space-y-6">
        <header className="mb-8">
          <h2 className="text-4xl font-black text-white mb-2 uppercase tracking-tighter">Command Center</h2>
          <p className="text-muted-foreground font-mono text-sm">Review objectives and maintain protocol.</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <DigitalClock />
          </div>
          
          <div className="lg:col-span-2">
            {scheduleLoading ? (
              <div className="h-full flex items-center justify-center border border-border bg-card/50">
                <Loader2 className="animate-spin text-primary" />
              </div>
            ) : (
              <CurrentMission 
                currentRoutine={currentRoutine} 
                nextRoutine={nextRoutine}
                onLog={handleLog}
                isPending={isPending}
              />
            )}
          </div>
        </div>

        {/* Recent Logs Quick View */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
           <div className="p-6 bg-card border border-border">
             <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
               <span className="w-2 h-2 bg-emerald-500 rounded-full" />
               Completed Today
             </h3>
             <div className="text-4xl font-mono font-bold text-emerald-500">
               {logs?.filter((l: any) => l.status === 'completed').length || 0}
             </div>
           </div>
           
           <div className="p-6 bg-card border border-border">
             <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
               <span className="w-2 h-2 bg-red-500 rounded-full" />
               Skipped
             </h3>
             <div className="text-4xl font-mono font-bold text-red-500">
               {logs?.filter((l: any) => l.status === 'skipped').length || 0}
             </div>
           </div>

           <div className="p-6 bg-card border border-border">
             <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
               <span className="w-2 h-2 bg-blue-500 rounded-full" />
               Compliance Rate
             </h3>
             <div className="text-4xl font-mono font-bold text-blue-500">
               {logs && logs.length > 0 
                 ? Math.round((logs.filter((l: any) => l.status === 'completed').length / logs.length) * 100) 
                 : 0}
               %
             </div>
           </div>
        </div>
      </div>
    </Shell>
  );
}
