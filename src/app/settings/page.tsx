"use client";

import { Sidebar } from "@/components/layout/Sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Settings, Shield, User, Zap, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { createClient } from "@/utils/supabase/client";
import { useEffect, useState } from "react";

export default function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<{ username: string; email: string } | null>(null);
  const supabase = createClient();

  useEffect(() => {
    async function loadProfile() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profileData } = await supabase
          .from('profiles')
          .select('username')
          .eq('id', user.id)
          .single();
        
        setProfile({
          username: profileData?.username || "",
          email: user.email || ""
        });
      }
      setLoading(false);
    }
    loadProfile();
  }, [supabase]);

  const handleSave = () => {
    toast.success("Settings updated successfully", {
      description: "Node configuration has been synchronized.",
    });
  };

  return (
    <div className="flex min-h-screen bg-background text-foreground font-mono">
      <Sidebar />

      <main className="flex-1 flex flex-col cyber-grid min-h-screen overflow-y-auto">
        <header className="h-20 border-b border-border bg-card/10 backdrop-blur-md flex items-center px-8 sticky top-0 z-20">
          <div className="flex items-center gap-3">
            <Settings className="text-primary w-6 h-6" />
            <h1 className="text-xl font-black uppercase tracking-widest italic">
              System <span className="text-primary">Config</span>
            </h1>
          </div>
        </header>

        <div className="p-8 max-w-3xl mx-auto w-full space-y-12 pb-24">
          <section className="space-y-6">
            <h2 className="text-2xl font-black uppercase italic flex items-center gap-2 tracking-tighter">
              <User className="text-primary w-5 h-5" />
              Operator Profile
            </h2>
            <div className="space-y-4 bg-card/30 p-6 rounded-xl border border-white/5 backdrop-blur-sm">
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-primary" />
                </div>
              ) : (
                <>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-bold uppercase text-primary tracking-widest">Username</Label>
                    <Input defaultValue={profile?.username} className="bg-black/40 border-white/5" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-bold uppercase text-primary tracking-widest">Email Address</Label>
                    <Input defaultValue={profile?.email} readOnly className="bg-black/40 border-white/5 opacity-60" />
                  </div>
                </>
              )}
            </div>
          </section>

          <section className="space-y-6">
            <h2 className="text-2xl font-black uppercase italic flex items-center gap-2 tracking-tighter">
              <Shield className="text-secondary w-5 h-5" />
              Security & Privacy
            </h2>
            <div className="space-y-4 bg-card/30 p-6 rounded-xl border border-white/5 backdrop-blur-sm">
              <div className="space-y-2">
                <Label className="text-[10px] font-bold uppercase text-secondary tracking-widest">Auto-Injected Domain</Label>
                <Input placeholder="e.g. corp.internal" className="bg-black/40 border-white/5" />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-bold uppercase text-secondary tracking-widest">Default Search Engine</Label>
                <Select defaultValue="google">
                  <SelectTrigger className="bg-black/40 border-white/5">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-white/10">
                    <SelectItem value="google">Google</SelectItem>
                    <SelectItem value="bing">Bing</SelectItem>
                    <SelectItem value="shodan">Shodan</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </section>

          <Button 
            onClick={handleSave}
            className="w-full bg-primary text-black font-black uppercase italic tracking-tighter h-12"
          >
            <Zap className="w-4 h-4 mr-2 fill-current" />
            Synchronize Configuration
          </Button>
        </div>
      </main>
    </div>
  );
}
