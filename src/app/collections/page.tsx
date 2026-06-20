"use client";

import { DorkCard } from "@/components/DorkCard";
import { Sidebar } from "@/components/layout/Sidebar";
import { Badge } from "@/components/ui/badge";
import { Toaster } from "@/components/ui/sonner";
import { MOCK_DORKS } from "@/lib/mock-data";
import { Library, ShieldCheck } from "lucide-react";

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";

interface Platform {
  id: string;
  name: string;
  slug: string;
  icon: string;
  base_url: string;
}

export default function CollectionsPage() {
  const [platforms, setPlatforms] = useState<Platform[]>([]);
  const supabase = createClient();

  useEffect(() => {
    async function fetchPlatforms() {
      const { data } = await supabase.from('platforms').select('*').eq('is_active', true);
      if (data) setPlatforms(data as Platform[]);
    }
    fetchPlatforms();
  }, [supabase]);

  // Mocking favorited dorks
  const favoriteDorks = MOCK_DORKS.slice(0, 2);

  return (
    <div className="flex min-h-screen bg-background text-foreground font-ibm relative overflow-hidden">
      <Sidebar />

      <main className="flex-1 flex flex-col min-h-screen overflow-y-auto">
        <header className="h-16 border-b border-border bg-background/80 backdrop-blur-md flex items-center px-8 sticky top-0 z-20">
          <div className="flex items-center gap-3">
            <Library className="text-secondary w-4 h-4" />
            <h1 className="text-base font-oxanium font-bold uppercase tracking-widest">
              My_<span className="text-secondary">Collections</span>
            </h1>
          </div>
        </header>

        <div className="p-8 max-w-7xl mx-auto w-full space-y-12">
          <section className="space-y-6">
            <div className="flex items-center gap-2">
              <Badge className="bg-secondary/10 text-secondary border-secondary/20 rounded-sm font-jetbrains text-[10px]">BUG BOUNTY KIT</Badge>
              <Badge variant="outline" className="border-border text-muted-foreground uppercase text-[9px] font-jetbrains">PRIVATE</Badge>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-background border border-border rounded-sm flex items-center justify-center">
                <ShieldCheck className="text-secondary w-6 h-6" />
              </div>
              <div>
                <h2 className="text-2xl font-oxanium font-bold uppercase tracking-tight">Recon_Signatures_01</h2>
                <p className="text-muted-foreground text-xs uppercase tracking-tighter mt-1">Target-independent recon signatures for initial attack surface mapping.</p>
              </div>
            </div>
          </section>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-24">
            {favoriteDorks.map((dork) => (
              <DorkCard key={dork.id} dork={dork} targetDomain="" platforms={platforms} />
            ))}
            
            <div className="border border-dashed border-border rounded-md flex flex-col items-center justify-center h-[300px] bg-surface/40 hover:bg-surface hover:border-secondary/40 snappy-transition cursor-pointer group shadow-lg">
              <div className="w-10 h-10 border border-border flex items-center justify-center group-hover:border-secondary/40 transition-colors bg-background">
                <Library className="text-muted-foreground group-hover:text-secondary w-4 h-4 transition-colors" />
              </div>
              <p className="mt-4 text-[10px] font-bold text-muted-foreground group-hover:text-secondary uppercase tracking-widest transition-colors">Create New Collection</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
