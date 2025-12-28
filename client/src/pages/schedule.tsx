import { Shell } from "@/components/layout/shell";
import { useSchedule } from "@/hooks/use-schedule";
import { Loader2, Plus } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useCreateRoutine } from "@/hooks/use-schedule";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { insertRoutineSchema } from "@shared/schema";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Redirect } from "wouter";
import { useAuth } from "@/hooks/use-auth";

export default function SchedulePage() {
  const { user, isLoading: authLoading } = useAuth();
  const { data: schedule, isLoading } = useSchedule();
  
  if (authLoading) return null;
  if (!user) return <Redirect to="/login" />;

  return (
    <Shell>
      <div className="space-y-6">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h2 className="text-3xl font-black text-white mb-2 uppercase tracking-tighter">Daily Protocol</h2>
            <p className="text-muted-foreground font-mono text-xs">STANDARD OPERATING PROCEDURE // 06:00 - 22:00</p>
          </div>
          <CreateRoutineDialog />
        </header>

        {isLoading ? (
          <div className="py-20 flex justify-center"><Loader2 className="animate-spin text-primary" /></div>
        ) : (
          <div className="relative border-l-2 border-border ml-4 md:ml-8 space-y-8 pl-8 md:pl-12 py-4">
            {schedule?.sort((a, b) => a.startTime.localeCompare(b.startTime)).map((routine, idx) => (
              <div key={routine.id} className="relative group">
                {/* Timeline connector dot */}
                <div className="absolute -left-[43px] md:-left-[59px] top-6 w-5 h-5 bg-background border-4 border-muted group-hover:border-primary rounded-full transition-colors z-10" />
                
                <Card className="hover:border-primary/50 transition-colors">
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-3">
                          <span className="font-mono text-primary font-bold bg-primary/10 px-2 py-1 text-sm">
                            {routine.startTime} - {routine.endTime}
                          </span>
                          <span className={`text-[10px] uppercase font-bold px-2 py-0.5 border ${
                            routine.importance === 'Critical' ? 'border-red-500 text-red-500' :
                            routine.importance === 'High' ? 'border-orange-500 text-orange-500' :
                            'border-blue-500 text-blue-500'
                          }`}>
                            {routine.importance}
                          </span>
                        </div>
                        <h3 className="text-xl font-bold uppercase">{routine.activity}</h3>
                      </div>
                      
                      {(routine.trick || routine.consequence) && (
                         <div className="text-sm text-muted-foreground font-mono border-l border-border pl-4 md:w-1/3">
                           {routine.trick && <div className="mb-1"><span className="text-primary mr-2">TIP:</span>{routine.trick}</div>}
                           {routine.consequence && <div className="text-red-400"><span className="text-red-600 mr-2">OR ELSE:</span>{routine.consequence}</div>}
                         </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            ))}
            
            {(!schedule || schedule.length === 0) && (
               <div className="text-muted-foreground font-mono italic">No protocols defined. Initialize sequence.</div>
            )}
          </div>
        )}
      </div>
    </Shell>
  );
}

function CreateRoutineDialog() {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const { mutate: createRoutine, isPending } = useCreateRoutine();
  
  // Need to strip userId as backend handles it, but schema might require it structurally.
  // Using partial schema or defaults in form.
  const form = useForm<z.infer<typeof insertRoutineSchema>>({
    resolver: zodResolver(insertRoutineSchema),
    defaultValues: {
      title: "",
      activity: "",
      startTime: "08:00",
      endTime: "09:00",
      importance: "Medium",
      whyItMatters: "",
      consequence: "",
      userId: 1 // Dummy, backend ignores/overwrites with auth user usually
    }
  });

  const onSubmit = (data: z.infer<typeof insertRoutineSchema>) => {
    createRoutine(data, {
      onSuccess: () => {
        setOpen(false);
        form.reset();
        toast({ title: "Protocol Added", description: "Routine sequence updated successfully." });
      },
      onError: () => {
        toast({ title: "Error", description: "Failed to add protocol.", variant: "destructive" });
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="military" className="gap-2">
          <Plus className="w-4 h-4" />
          Add Protocol
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] bg-card border-primary/20">
        <DialogHeader>
          <DialogTitle className="uppercase tracking-widest text-primary">New Protocol Entry</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="activity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="uppercase text-xs font-mono">Activity</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="e.g. Deep Work Session" className="bg-background border-border" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="startTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="uppercase text-xs font-mono">Start (HH:MM)</FormLabel>
                    <FormControl>
                      <Input {...field} type="time" className="bg-background border-border" />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="endTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="uppercase text-xs font-mono">End (HH:MM)</FormLabel>
                    <FormControl>
                      <Input {...field} type="time" className="bg-background border-border" />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>
            <FormField
                control={form.control}
                name="importance"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="uppercase text-xs font-mono">Priority Level</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="bg-background border-border">
                          <SelectValue placeholder="Select priority" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Critical">Critical (Mission Critical)</SelectItem>
                        <SelectItem value="High">High (Major Impact)</SelectItem>
                        <SelectItem value="Medium">Medium (Maintenance)</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />
             <FormField
              control={form.control}
              name="whyItMatters"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="uppercase text-xs font-mono">Why It Matters</FormLabel>
                  <FormControl>
                    <Input {...field} className="bg-background border-border" />
                  </FormControl>
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                  <input type="hidden" {...field} value="Routine" />
              )}
            />
            <Button type="submit" className="w-full" disabled={isPending}>
              {isPending ? "Initializing..." : "Confirm Protocol"}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
