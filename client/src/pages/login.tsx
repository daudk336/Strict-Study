import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ShieldCheck } from "lucide-react";

export default function LoginPage() {
  const handleLogin = () => {
    window.location.href = "/api/login";
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-gray-900 to-black p-4">
      <Card className="w-full max-w-md border-primary/30 shadow-[0_0_50px_rgba(255,0,0,0.1)]">
        <CardHeader className="text-center space-y-4 pb-8">
          <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center border border-primary/50 mb-4 animate-pulse">
            <ShieldCheck className="w-8 h-8 text-primary" />
          </div>
          <CardTitle className="text-3xl font-black uppercase tracking-tighter text-white">
            Protocol 7
          </CardTitle>
          <p className="text-muted-foreground font-mono text-xs uppercase tracking-widest">
            Authorization Required
          </p>
        </CardHeader>
        <CardContent>
          <Button 
            className="w-full h-14 text-lg bg-primary hover:bg-primary/90 text-black font-bold shadow-[4px_4px_0_0_rgba(255,255,255,0.2)] hover:translate-y-[2px] hover:shadow-[2px_2px_0_0_rgba(255,255,255,0.2)] transition-all"
            onClick={handleLogin}
          >
            Authenticate with Replit
          </Button>
          
          <div className="mt-8 text-center">
            <p className="text-[10px] text-muted-foreground font-mono">
              SECURE SYSTEM // UNAUTHORIZED ACCESS PROHIBITED
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
