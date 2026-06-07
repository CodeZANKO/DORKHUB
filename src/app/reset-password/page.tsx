"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Terminal, ShieldCheck, Loader2, KeyRound } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast.error("Validation Failed", {
        description: "Passwords do not match the required protocol.",
      });
      return;
    }

    if (password.length < 6) {
      toast.error("Insecure Key", {
        description: "Password must be at least 6 characters long.",
      });
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({
        password: password,
      });

      if (error) {
        toast.error("Update Failed", {
          description: error.message,
        });
      } else {
        toast.success("Security Updated", {
          description: "Your access keys have been rotated. Redirecting to login...",
        });
        setTimeout(() => {
          router.push("/login");
        }, 2000);
      }
    } catch (err) {
      console.error(err);
      toast.error("System Error", {
        description: "An unexpected error occurred during the protocol.",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!isMounted) {
    return <div className="min-h-screen bg-black" />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-black p-4 relative overflow-hidden" suppressHydrationWarning>
      {/* Liquid Background */}
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(0,255,148,0.1),transparent_70%)] pointer-events-none" />
      <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-primary/5 blur-[120px] rounded-full animate-float" />
      
      <div className="absolute top-8 left-8 flex items-center gap-3 opacity-40">
         <div className="w-2 h-2 bg-primary green-glow animate-pulse" />
         <span className="text-[10px] font-jetbrains font-bold uppercase tracking-[0.4em] text-primary">Security_Reset</span>
      </div>

      <Card className="w-full max-w-md liquid-glass border-white/10 relative z-10 rounded-3xl shadow-[0_32px_64px_rgba(0,0,0,0.5)] overflow-hidden">
        {/* Glossy Header Accent */}
        <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-primary/50 to-transparent" />

        <CardHeader className="space-y-6 text-center pt-12 pb-8">
          <div className="flex justify-center">
            <div className="p-4 bg-primary/5 border border-primary/20 rounded-2xl relative green-glow animate-float">
               <div className="absolute -top-1 -right-1 w-1.5 h-1.5 bg-primary" />
               <KeyRound className="w-10 h-10 text-primary" />
            </div>
          </div>
          <div className="space-y-2">
            <CardTitle className="text-4xl font-oxanium font-bold uppercase tracking-tighter text-white">
              DORK<span className="text-primary">HUB</span>
            </CardTitle>
            <div className="bg-primary/10 text-primary text-[10px] font-jetbrains font-bold uppercase tracking-[0.3em] py-1 px-4 inline-block border border-primary/20 rounded-full">
              NEW_CREDENTIALS
            </div>
          </div>
        </CardHeader>
        
        <form onSubmit={handleReset} className="px-4">
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password" className="text-[10px] font-oxanium font-bold uppercase tracking-widest text-primary/40 ml-2">New Password</Label>
                <Input 
                  id="password" 
                  type="password" 
                  placeholder="••••••••" 
                  required 
                  className="bg-black/50 border-white/5 focus:border-primary/40 rounded-xl h-12 font-jetbrains text-xs text-white"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-[10px] font-oxanium font-bold uppercase tracking-widest text-primary/40 ml-2">Confirm Password</Label>
                <Input 
                  id="confirmPassword" 
                  type="password" 
                  placeholder="••••••••" 
                  required 
                  className="bg-black/50 border-white/5 focus:border-primary/40 rounded-xl h-12 font-jetbrains text-xs text-white"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>
            </div>
          </CardContent>
          
          <CardFooter className="flex flex-col gap-6 mt-6 pb-12">
            <Button 
              type="submit" 
              className="w-full font-bold uppercase tracking-widest h-14 bg-primary text-black hover:bg-primary/80 text-xs rounded-xl shadow-[0_0_30px_rgba(0,255,148,0.25)] transition-all green-glow"
              disabled={loading}
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                <span className="flex items-center">
                  <ShieldCheck className="w-4 h-4 mr-3" />
                  Update Access Key
                </span>
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
