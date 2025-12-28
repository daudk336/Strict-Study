import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, CheckCircle2, XCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { Routine } from "@shared/schema";

interface CurrentMissionProps {
  currentRoutine?: Routine;
  nextRoutine?: Routine;
  onLog: (status: "completed" | "skipped") => void;
  isPending: boolean;
}

export function CurrentMission({ currentRoutine, nextRoutine, onLog, isPending }: CurrentMissionProps) {
  if (!currentRoutine) {
    return (
      <Card className="border-dashed border-2 bg-transparent opacity-50">
        <CardContent className="flex flex-col items-center justify-center h-64 text-muted-foreground">
          <p className="font-mono uppercase tracking-widest">No Active Directives</p>
          <p className="text-xs mt-2">Wait for next scheduled block</p>
        </CardContent>
      </Card>
    );
  }

  const importanceColor = 
    currentRoutine.importance === "Critical" ? "text-red-500 border-red-500/50" :
    currentRoutine.importance === "High" ? "text-orange-500 border-orange-500/50" :
    "text-blue-500 border-blue-500/50";

  return (
    <Card className="border-l-4 border-l-primary relative overflow-visible h-full">
      <div className="absolute top-0 right-0 p-4">
        <span className={`px-2 py-1 text-xs font-bold uppercase border ${importanceColor} bg-background`}>
          Priority: {currentRoutine.importance}
        </span>
      </div>

      <CardHeader>
        <div className="flex items-center gap-2 mb-2">
          <div className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
          <span className="text-xs font-mono text-red-500 uppercase tracking-widest">Current Directive</span>
        </div>
        <CardTitle className="text-4xl md:text-5xl mt-2 leading-none">
          {currentRoutine.activity}
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="p-4 bg-background border border-border/50">
              <h4 className="text-xs text-muted-foreground uppercase tracking-wider mb-2 font-mono">Mission Parameters</h4>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-mono">{currentRoutine.startTime}</span>
                <span className="text-muted-foreground text-sm">to</span>
                <span className="text-2xl font-mono">{currentRoutine.endTime}</span>
              </div>
            </div>

            {currentRoutine.whyItMatters && (
              <div className="p-4 bg-primary/5 border border-primary/20">
                <h4 className="text-xs text-primary/70 uppercase tracking-wider mb-2 font-mono flex items-center gap-2">
                  <AlertCircle className="w-3 h-3" />
                  Motivation
                </h4>
                <p className="italic font-serif text-lg leading-relaxed">"{currentRoutine.whyItMatters}"</p>
              </div>
            )}
          </div>

          <div className="flex flex-col justify-end space-y-4">
            <h4 className="text-xs text-muted-foreground uppercase tracking-wider font-mono text-center">Report Status</h4>
            <div className="grid grid-cols-2 gap-4">
              <Button 
                onClick={() => onLog("completed")} 
                disabled={isPending}
                className="h-24 text-lg bg-emerald-600 hover:bg-emerald-500 border-emerald-800 shadow-[0_4px_0_0_#065f46] hover:shadow-[0_2px_0_0_#065f46] hover:translate-y-[2px] transition-all"
              >
                <div className="flex flex-col items-center gap-2">
                  <CheckCircle2 className="w-8 h-8" />
                  <span>COMPLETE</span>
                </div>
              </Button>
              <Button 
                onClick={() => onLog("skipped")} 
                disabled={isPending}
                className="h-24 text-lg bg-red-600 hover:bg-red-500 border-red-800 shadow-[0_4px_0_0_#991b1b] hover:shadow-[0_2px_0_0_#991b1b] hover:translate-y-[2px] transition-all"
              >
                <div className="flex flex-col items-center gap-2">
                  <XCircle className="w-8 h-8" />
                  <span>FAILURE</span>
                </div>
              </Button>
            </div>
          </div>
        </div>

        {nextRoutine && (
          <div className="pt-6 border-t border-border/50">
            <div className="text-xs text-muted-foreground uppercase tracking-widest font-mono mb-2">Up Next</div>
            <div className="flex justify-between items-center opacity-70">
              <span className="text-lg font-bold">{nextRoutine.activity}</span>
              <span className="font-mono text-sm bg-secondary px-2 py-1">{nextRoutine.startTime}</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
