"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dork } from "@/lib/mock-data";
import { 
  Bookmark, 
  ChevronDown, 
  ChevronUp, 
  Copy, 
  ExternalLink, 
  Share2, 
  Search,
  Globe,
  Terminal,
  Cpu,
  Loader2,
  LucideIcon
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { createClient } from "@/utils/supabase/client";
import { cn } from "@/lib/utils";

interface DorkCardProps {
  dork: Dork;
  targetDomain: string;
}

const ICON_MAP: Record<string, LucideIcon> = {
  Globe,
  Search,
  Terminal,
  Cpu,
};

interface Platform {
  id: string;
  name: string;
  slug: string;
  icon: string;
  base_url: string;
}

export function DorkCard({ dork, targetDomain }: DorkCardProps) {
  const [copied, setCopied] = useState(false);
  const [votes, setVotes] = useState(0);
  const [voted, setVoted] = useState<"up" | "down" | null>(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [platforms, setPlatforms] = useState<Platform[]>([]);
  const [loadingPlatforms, setLoadingPlatforms] = useState(true);

  const supabase = createClient();

  useEffect(() => {
    let ignore = false;
    
    // Set random votes on client side to avoid hydration mismatch
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setVotes(Math.floor(Math.random() * 50) + 10);

    const initialFetch = async () => {
      const { data } = await supabase
        .from('platforms')
        .select('*')
        .eq('is_active', true);
      
      if (ignore) return;
      if (data) setPlatforms(data as Platform[]);
      setLoadingPlatforms(false);
    };

    initialFetch();
    
    return () => {
      ignore = true;
    };
  }, [supabase]);

  const getInjectedQuery = () => {
    if (!targetDomain) return dork.query;
    if (dork.query.includes("target.com")) {
      return dork.query.replace(/target\.com/g, targetDomain);
    }
    return `site:${targetDomain} ${dork.query}`;
  };

  const injectedQuery = getInjectedQuery();

  const handleLaunch = (platformSlug: string) => {
    const platform = platforms.find(p => p.slug === platformSlug);
    if (!platform) return;

    const encodedQuery = encodeURIComponent(injectedQuery);
    const url = `${platform.base_url}${encodedQuery}`;
    
    window.open(url, "_blank");
    toast.info("Opening query on " + platform.name.toUpperCase(), {
      description: "Ensure your pop-up blocker is disabled.",
    });
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(injectedQuery);
    setCopied(true);
    toast.success("Query copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleVote = (type: "up" | "down") => {
    if (voted === type) {
      setVoted(null);
      setVotes(prev => type === "up" ? prev - 1 : prev + 1);
    } else {
      setVotes(prev => {
        if (voted === "up") return prev - 2;
        if (voted === "down") return prev + 2;
        return type === "up" ? prev + 1 : prev - 1;
      });
      setVoted(type);
      toast.info(type === "up" ? "Upvoted signature" : "Downvoted signature");
    }
  };

  const toggleFavorite = () => {
    setIsFavorite(!isFavorite);
    toast.success(isFavorite ? "Removed from collection" : "Added to bug bounty kit");
  };

  return (
    <Card className="snappy-transition liquid-glass border-white/5 hover:border-primary/40 group relative overflow-hidden flex flex-col rounded-2xl shadow-2xl">
      <CardHeader className="pb-4 pt-8 px-6 relative z-10">
        <div className="flex justify-between items-start mb-6">
          <div className="bg-primary/5 text-primary text-[9px] font-oxanium font-bold uppercase tracking-[0.2em] px-3 py-1.5 rounded-full border border-primary/20 group-hover:bg-primary/10 transition-all green-glow">
            {dork.category}
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={toggleFavorite}
              className={cn(
                "p-2.5 rounded-full border border-white/5 transition-all hover:scale-110",
                isFavorite ? "bg-primary/10 text-primary border-primary/30 green-glow" : "bg-white/5 text-muted-foreground hover:border-primary/20"
              )}
            >
              <Bookmark className="w-4 h-4" fill={isFavorite ? "currentColor" : "none"} />
            </button>
          </div>
        </div>
        
        <CardTitle className="text-xl font-oxanium font-bold uppercase tracking-tight text-white group-hover:text-primary transition-colors leading-tight">
          {dork.description}
        </CardTitle>
        
        <div className="flex items-center gap-2 mt-4">
          <div className="w-1.5 h-1.5 rounded-full bg-primary/40" />
          <span className="text-[10px] font-jetbrains text-muted-foreground tracking-widest uppercase">NODE: @{dork.author}</span>
        </div>
      </CardHeader>

      <CardContent className="space-y-8 flex-1 relative z-10 px-6 pb-8">
        <div className="relative group/code">
          <div className="relative bg-black/60 p-6 rounded-xl border border-white/5 font-jetbrains text-[12px] text-primary/80 overflow-x-auto whitespace-pre leading-relaxed min-h-[70px] flex items-center shadow-inner backdrop-blur-md">
            <span className="text-primary/30 mr-4 select-none">$</span>
            {injectedQuery}
          </div>
          <button 
            onClick={handleCopy}
            className="absolute top-4 right-4 p-2 rounded-lg bg-black/80 border border-white/10 hover:border-primary/40 text-muted-foreground hover:text-primary transition-all opacity-0 group-hover/code:opacity-100 z-20 shadow-2xl"
          >
            {copied ? <span className="text-[9px] font-bold px-1 uppercase tracking-widest text-primary">DONE</span> : <Copy className="w-4 h-4" />}
          </button>
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-4">
             <span className="text-[10px] font-oxanium font-bold uppercase tracking-[0.4em] text-white/20">Execution_Relays</span>
             <div className="h-[1px] flex-1 bg-white/5" />
          </div>
          
          <div className="grid grid-cols-4 gap-3">
            {loadingPlatforms ? (
              <div className="col-span-4 h-12 flex items-center justify-center">
                <Loader2 className="w-5 h-5 text-primary animate-spin" />
              </div>
            ) : (
              platforms.map((p) => {
                const Icon = ICON_MAP[p.icon] || Globe;
                const isActive = dork.platform === p.slug;
                return (
                  <button
                    key={p.id}
                    onClick={() => handleLaunch(p.slug)}
                    className={cn(
                      "group/plat h-11 rounded-xl border border-white/5 bg-white/5 hover:bg-primary/5 flex items-center justify-center transition-all relative overflow-hidden",
                      isActive && "border-primary/30 bg-primary/10 green-glow"
                    )}
                    title={`Relay: ${p.name}`}
                  >
                    <Icon className={cn("w-4 h-4 transition-colors", isActive ? "text-primary" : "text-muted-foreground group-hover/plat:text-primary/80")} />
                  </button>
                );
              })
            )}
          </div>
        </div>

        <div className="flex items-center justify-between pt-6 border-t border-white/5">
          <div className="flex items-center bg-black/40 rounded-full border border-white/5 p-1">
            <button 
              onClick={() => handleVote("up")}
              className={cn(
                "p-2 rounded-full hover:bg-primary/10 transition-colors",
                voted === "up" ? "text-primary bg-primary/5" : "text-muted-foreground"
              )}
            >
              <ChevronUp className="w-4 h-4" />
            </button>
            <span className={cn(
              "px-4 text-[11px] font-jetbrains font-bold tracking-widest min-w-[40px] text-center",
              voted === "up" ? "text-primary green-glow" : voted === "down" ? "text-error" : "text-muted-foreground"
            )}>
              {votes}
            </span>
            <button 
              onClick={() => handleVote("down")}
              className={cn(
                "p-2 rounded-full hover:bg-error/10 transition-colors",
                voted === "down" ? "text-error bg-error/5" : "text-muted-foreground"
              )}
            >
              <ChevronDown className="w-4 h-4" />
            </button>
          </div>

          <Button 
            variant="ghost" 
            size="sm"
            className="h-10 px-6 rounded-full border border-white/5 bg-white/5 hover:bg-primary/5 hover:border-primary/40 hover:text-primary text-[10px] font-bold uppercase tracking-widest transition-all"
          >
            <ExternalLink className="w-4 h-4 mr-2" />
            DECRYPT
          </Button>
        </div>
      </CardContent>
    </Card>

  );
}
