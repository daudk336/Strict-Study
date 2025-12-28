import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { LayoutDashboard, CalendarClock, Bot, LogOut } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";

export function Shell({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const { logout, user } = useAuth();

  const navItems = [
    { href: "/", label: "Operations", icon: LayoutDashboard },
    { href: "/schedule", label: "Timeline", icon: CalendarClock },
    { href: "/coach", label: "Accountability", icon: Bot },
  ];

  if (!user) return <>{children}</>;

  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row">
      {/* Sidebar / Topbar */}
      <aside className="w-full md:w-64 border-b md:border-b-0 md:border-r border-border bg-card flex flex-col shrink-0 z-20">
        <div className="p-6 border-b border-border/50">
          <h1 className="text-xl font-black text-primary tracking-tighter uppercase flex items-center gap-2">
            <div className="w-3 h-3 bg-primary animate-pulse" />
            Protocol 7
          </h1>
          <p className="text-[10px] text-muted-foreground font-mono mt-1 tracking-widest">
            UNIT: {user.username.toUpperCase()}
          </p>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href}>
              <Button
                variant={location === item.href ? "default" : "ghost"}
                className={cn(
                  "w-full justify-start gap-3",
                  location === item.href ? "bg-primary/10 text-primary border-r-2 border-primary" : "text-muted-foreground"
                )}
              >
                <item.icon className="w-4 h-4" />
                {item.label}
              </Button>
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-border/50">
          <Button 
            variant="outline" 
            className="w-full justify-start gap-3 text-destructive hover:bg-destructive/10 hover:text-destructive border-destructive/20"
            onClick={() => logout()}
          >
            <LogOut className="w-4 h-4" />
            DISENGAGE
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-gray-900 via-background to-background">
        <div className="max-w-6xl mx-auto p-4 md:p-8 animate-in fade-in duration-500">
          {children}
        </div>
      </main>
    </div>
  );
}
