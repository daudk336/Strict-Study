import { Shell } from "@/components/layout/shell";
import { useChatHistory, useSendMessage } from "@/hooks/use-chat";
import { useAuth } from "@/hooks/use-auth";
import { Redirect } from "wouter";
import { useEffect, useRef, useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send, Bot, Mic, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export default function CoachPage() {
  const { user, isLoading: authLoading } = useAuth();
  const { data: messages, isLoading: historyLoading } = useChatHistory();
  const { mutate: sendMessage, isPending } = useSendMessage();
  const [inputValue, setInputValue] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  if (authLoading) return null;
  if (!user) return <Redirect to="/login" />;

  const handleSend = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!inputValue.trim() || isPending) return;
    sendMessage(inputValue);
    setInputValue("");
  };

  return (
    <Shell>
       <div className="h-[calc(100vh-8rem)] flex flex-col gap-4">
        <header>
          <h2 className="text-3xl font-black text-white uppercase tracking-tighter flex items-center gap-3">
             <Bot className="w-8 h-8 text-primary" />
             AI Accountability Coach
          </h2>
          <p className="text-muted-foreground font-mono text-xs mt-1">
             STATUS: ONLINE // DIRECTIVE: UNCOMPROMISING
          </p>
        </header>

        <Card className="flex-1 flex flex-col overflow-hidden border-primary/20 bg-black/50 backdrop-blur-sm">
           <div className="flex-1 overflow-y-auto p-4 space-y-6" ref={scrollRef}>
             {historyLoading && <div className="flex justify-center p-4"><Loader2 className="animate-spin text-primary" /></div>}
             
             {messages?.map((msg, i) => (
               <div key={i} className={cn(
                 "flex gap-4 max-w-[80%]",
                 msg.role === 'user' ? "ml-auto flex-row-reverse" : ""
               )}>
                  <div className={cn(
                    "w-8 h-8 rounded-sm flex items-center justify-center shrink-0 border",
                    msg.role === 'user' 
                      ? "bg-secondary border-secondary-foreground/20 text-secondary-foreground" 
                      : "bg-primary/10 border-primary/50 text-primary"
                  )}>
                    {msg.role === 'user' ? "U" : <Bot className="w-4 h-4" />}
                  </div>
                  <div className={cn(
                    "p-4 text-sm leading-relaxed border",
                    msg.role === 'user'
                      ? "bg-secondary text-secondary-foreground border-transparent"
                      : "bg-card text-foreground border-primary/20 shadow-[0_0_15px_rgba(255,0,0,0.1)]"
                  )}>
                    {msg.content}
                  </div>
               </div>
             ))}
             {isPending && (
                <div className="flex gap-4 max-w-[80%]">
                  <div className="w-8 h-8 rounded-sm bg-primary/10 border border-primary/50 text-primary flex items-center justify-center shrink-0">
                    <Loader2 className="w-4 h-4 animate-spin" />
                  </div>
                  <div className="p-4 text-sm text-muted-foreground font-mono uppercase tracking-widest animate-pulse">
                    Analyzing...
                  </div>
                </div>
             )}
           </div>

           <div className="p-4 border-t border-border bg-card">
             <form onSubmit={handleSend} className="flex gap-2">
               <Button type="button" variant="outline" size="icon" className="shrink-0" title="Voice Input (Simulated)">
                 <Mic className="w-4 h-4" />
               </Button>
               <Input 
                 value={inputValue}
                 onChange={(e) => setInputValue(e.target.value)}
                 placeholder="Report status or request directive..."
                 className="bg-background border-border focus-visible:ring-primary font-mono text-sm"
               />
               <Button type="submit" disabled={isPending || !inputValue} className="bg-primary hover:bg-primary/90 text-black font-bold">
                 <Send className="w-4 h-4" />
               </Button>
             </form>
           </div>
        </Card>
       </div>
    </Shell>
  );
}
