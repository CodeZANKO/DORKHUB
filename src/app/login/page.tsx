"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Terminal, ShieldCheck, Loader2, UserPlus, Shield } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const [socialLoading, setSocialLoading] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (mode === "login") {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) {
          toast.error("Authentication Failed", {
            description: error.message,
          });
        } else {
          toast.success("Access Granted", {
            description: "Welcome back, operator.",
          });
          router.push("/");
          router.refresh();
        }
      } else if (mode === "signup") {
        // Sign Up Mode
        if (!username) {
          toast.error("Missing Metadata", {
            description: "Please provide a codename (username).",
          });
          setLoading(false);
          return;
        }

        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback`,
            data: {
              username: username,
            }
          },
        });

        if (error) {
          toast.error("Registration Failed", {
            description: error.message,
          });
        } else {
          toast.success("Verification Sent", {
            description: "Please check your email to verify your credentials.",
          });
        }
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

  const handleGithubLogin = async () => {
    setSocialLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'github',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      toast.error("Social Auth Failed", {
        description: error.message,
      });
      setSocialLoading(false);
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
         <span className="text-[10px] font-jetbrains font-bold uppercase tracking-[0.4em] text-primary">Authentication</span>
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
              {mode === "login" ? "Login" : "Sign Up"}
            </div>
          </div>
        </CardHeader>
        
        <form onSubmit={handleAuth} className="px-4">
          <CardContent className="space-y-6">
            

            {mode === "login" && (
              <div className="relative flex items-center justify-center py-2">
                <div className="absolute inset-0 flex items-center px-4">
                  <span className="w-full border-t border-white/5" />
                </div>
                <div className="relative flex justify-center text-[8px] uppercase font-bold tracking-[0.5em] bg-transparent backdrop-blur-xl px-4 text-white/20">
                  OR_DIRECT_LINK
                </div>
              </div>
            )}

            <div className="space-y-4">
              {mode === "signup" && (
                <div className="space-y-2">
                  <Label htmlFor="username" className="text-[10px] font-oxanium font-bold uppercase tracking-widest text-primary/40 ml-2">Codename</Label>
                  <Input 
                    id="username" 
                    type="text" 
                    placeholder="Username" 
                    required 
                    className="bg-black/50 border-white/5 focus:border-primary/40 rounded-xl h-12 font-jetbrains text-xs text-white"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                  />
                </div>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="email" className="text-[10px] font-oxanium font-bold uppercase tracking-widest text-primary/40 ml-2">Email</Label>
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
              
              <div className="space-y-2">
                <div className="flex items-center justify-between px-2">
                  <Label htmlFor="password" className="text-[10px] font-oxanium font-bold uppercase tracking-widest text-primary/40">Password</Label>
                  {mode === "login" && (
                    <Link 
                      href="/forgot-password"
                      className="text-[9px] font-bold uppercase tracking-widest text-white/30 hover:text-primary transition-colors underline underline-offset-8"
                    >
                      Forget Password?
                    </Link>
                  )}
                </div>
                <Input 
                  id="password" 
                  type="password" 
                  required 
                  className="bg-black/50 border-white/5 focus:border-primary/40 rounded-xl h-12 font-jetbrains text-xs text-white"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
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
                  {mode === "login" ? <ShieldCheck className="w-4 h-4 mr-3" /> : <UserPlus className="w-4 h-4 mr-3" />}
                  {mode === "login" ? "Login" : "Sign UP"}
                </span>
              )}
            </Button>
            
            <button 
              type="button"
              className="text-[10px] font-bold uppercase tracking-widest text-white/30 hover:text-primary transition-all flex items-center justify-center gap-3 group"
              onClick={() => setMode(mode === "login" ? "signup" : "login")}
            >
              <div className="w-1 h-1 bg-primary group-hover:scale-150 transition-all rounded-full" />
              {mode === "login" ? "Sign UP Page" : "Login Page"}
            </button>
          </CardFooter>
        </form>
      </Card>
      
      {/* <div className="fixed bottom-8 text-[10px] text-white/20 font-jetbrains font-bold uppercase tracking-[0.6em] px-6 py-3 border border-white/5 rounded-full liquid-glass">
        Secure_Protocol: <span className="text-primary green-glow">ENCRYPTED</span>
      </div> */}
    </div>
  );
}
