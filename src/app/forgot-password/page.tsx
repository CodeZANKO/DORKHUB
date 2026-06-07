"use client";

import { useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Terminal, ShieldCheck, Loader2, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  
  const router = useRouter();
  const supabase = createClient();

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/callback?next=/settings`,
      });

      if (error) {
        toast.error("Reset Failed", {
          description: error.message,
        });
      } else {
        toast.success("Recovery Link Sent", {
          description: "Check your email for the recovery protocol instructions.",
        });
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

  return (
    <div className="min-h-screen flex items-center justify-center bg-black p-4 relative overflow-hidden">
      {/* Liquid Background */}
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(0,255,148,0.1),transparent_70%)] pointer-events-none" />
      <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-primary/5 blur-[120px] rounded-full animate-float" />
      
      <div className="absolute top-8 left-8 flex items-center gap-3 opacity-40">
         <div className="w-2 h-2 bg-primary green-glow animate-pulse" />
         <span className="text-[10px] font-jetbrains font-bold uppercase tracking-[0.4em] text-primary">Recovery</span>
      </div>

      <Card className="w-full max-w-md liquid-glass border-white/10 relative z-10 rounded-3xl shadow-[0_32px_64px_rgba(0,0,0,0.5)] overflow-hidden">
        {/* Glossy Header Accent */}
        <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-primary/50 to-transparent" />

        <CardHeader className="space-y-6 text-center pt-12 pb-8">
          <div className="flex justify-center">
            <div className="p-4 bg-primary/5 border border-primary/20 rounded-2xl relative green-glow animate-float">
               <div className="absolute -top-1 -right-1 w-1.5 h-1.5 bg-primary" />
               <Terminal className="w-10 h-10 text-primary" />
            </div>
          </div>
          <div className="space-y-2">
            <CardTitle className="text-4xl font-oxanium font-bold uppercase tracking-tighter text-white">
              DORK<span className="text-primary">HUB</span>
            </CardTitle>
            <div className="bg-primary/10 text-primary text-[10px] font-jetbrains font-bold uppercase tracking-[0.3em] py-1 px-4 inline-block border border-primary/20 rounded-full">
              KEY_RECOVERY
            </div>
          </div>
        </CardHeader>
        
        <form onSubmit={handleReset} className="px-4">
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-[10px] font-oxanium font-bold uppercase tracking-widest text-primary/40 ml-2">Registered Email</Label>
                <Input 
                  id="email" 
                  type="email" 
                  placeholder="User@DORKHUB.XYZ" 
                  required 
                  className="bg-black/50 border-white/5 focus:border-primary/40 rounded-xl h-12 font-jetbrains text-xs text-white"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
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
                  <Terminal className="w-4 h-4 mr-3" />
                  Request Recovery Link
                </span>
              )}
            </Button>
            
            <Link 
              href="/login"
              className="text-[10px] font-bold uppercase tracking-widest text-white/30 hover:text-primary transition-all flex items-center justify-center gap-3 group"
            >
              <ArrowLeft className="w-3 h-3 group-hover:-translate-x-1 transition-transform" />
              Back to Login
            </Link>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
