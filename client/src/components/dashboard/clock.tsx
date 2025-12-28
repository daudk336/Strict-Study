import { useState, useEffect } from "react";
import { format } from "date-fns";

export function DigitalClock() {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center p-8 bg-black border border-border/50 relative overflow-hidden group">
      {/* Scanning line effect */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/5 to-transparent h-[10px] w-full animate-[scan_3s_linear_infinite] opacity-30 pointer-events-none" />

      <div className="font-mono text-xs text-primary/50 tracking-[0.5em] mb-2 uppercase">
        System Time
      </div>
      <div className="text-6xl md:text-8xl font-black font-mono text-foreground tracking-tighter tabular-nums text-shadow-glow">
        {format(time, "HH:mm:ss")}
      </div>
      <div className="mt-4 flex gap-4 text-xs font-mono text-muted-foreground uppercase tracking-widest">
        <span>{format(time, "EEEE")}</span>
        <span className="text-primary">•</span>
        <span>{format(time, "dd MMM yyyy")}</span>
      </div>
    </div>
  );
}
