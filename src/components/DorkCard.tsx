"use client";

import { Dork } from "@/lib/mock-data";
import { 
  Bookmark, 
  Copy, 
  ArrowUpRight,
  Check
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface Platform {
  id: string;
  name: string;
  slug: string;
  icon: string;
  base_url: string;
}

interface DorkCardProps {
  dork: Dork;
  targetDomain: string;
  platforms?: Platform[];
}

export function DorkCard({ dork, targetDomain }: DorkCardProps) {
  const [copied, setCopied] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);

  const getInjectedQuery = () => {
    if (!targetDomain) return dork.query;
    // Common placeholders
    const placeholders = [/target\.com/g, /example\.com/g, /domain\.com/g, /victim\.com/g];
    let query = dork.query;
    let found = false;
    
    placeholders.forEach(p => {
      if (p.test(query)) {
        query = query.replace(p, targetDomain);
        found = true;
      }
    });

    if (!found && !query.toLowerCase().includes("site:")) {
      return `site:${targetDomain} ${query}`;
    }
    return query;
  };

  const injectedQuery = getInjectedQuery();

  const handleCopy = () => {
    navigator.clipboard.writeText(injectedQuery);
    setCopied(true);
    toast.success("Query copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExplain = () => {
    const customWindow = typeof window !== "undefined" ? (window as unknown as { sendPrompt?: (prompt: string) => void }) : null;
    if (customWindow && customWindow.sendPrompt) {
      customWindow.sendPrompt(`Explain why this dork works and how to fix the exposure:\n\n${injectedQuery}`);
    } else {
      const explainQuery = `${injectedQuery}`;
      window.open(`https://www.google.com/search?q=${encodeURIComponent(explainQuery)}`, "_blank");
      toast.info("Explaining dork via search query...", {
        description: "If an AI assistant is configured, this will send it there.",
      });
    }
  };

  const toggleFavorite = () => {
    setIsFavorite(!isFavorite);
    toast.success(isFavorite ? "Removed from collection" : "Added to bug bounty kit");
  };

  const getFormattedDate = () => {
    if (dork.created_at) {
      try {
        return new Date(dork.created_at).toISOString().split('T')[0];
      } catch (e) {
        // ignore
      }
    }
    // Fallback date based on id to look authentic
    const baseDate = new Date('2024-03-11');
    const idNum = parseInt(dork.id) || 1;
    baseDate.setDate(baseDate.getDate() + (idNum % 30));
    return baseDate.toISOString().split('T')[0];
  };

  const getRiskLevel = (rate: number) => {
    if (rate >= 90) {
      return {
        label: "critical risk",
        bg: "rgba(255, 69, 96, 0.1)",
        text: "#ff4560",
        borderColor: "rgba(255, 69, 96, 0.2)",
      };
    }
    if (rate >= 80) {
      return {
        label: "high risk",
        bg: "rgba(255, 69, 96, 0.1)",
        text: "#ff4560",
        borderColor: "rgba(255, 69, 96, 0.2)",
      };
    }
    if (rate >= 60) {
      return {
        label: "medium risk",
        bg: "rgba(255, 184, 0, 0.1)",
        text: "#ffb800",
        borderColor: "rgba(255, 184, 0, 0.2)",
      };
    }
    return {
      label: "low risk",
      bg: "rgba(255, 255, 255, 0.03)",
      text: "var(--color-muted-foreground)",
      borderColor: "rgba(255, 255, 255, 0.08)",
    };
  };

  const risk = getRiskLevel(dork.successRate);
  const formattedId = dork.id.length < 5 ? (7200 + parseInt(dork.id)).toString() : dork.id.substring(0, 6);

  const highlightDorkQuery = (query: string) => {
    const regex = /(-?\b[a-zA-Z_]+:)/g;
    const parts = query.split(regex);
    return parts.map((part, index) => {
      if (regex.test(part)) {
        return (
          <span key={index} className="text-primary font-semibold">
            {part}
          </span>
        );
      } else {
        return (
          <span key={index} className="text-white/95">
            {part}
          </span>
        );
      }
    });
  };

  return (
    <div 
      className={cn(
        "w-full liquid-glass border border-primary rounded-[var(--border-radius-lg)] overflow-hidden snappy-transition hover:border-primary/30 hover:shadow-[0_0_25px_rgba(0,255,148,0.08)] flex flex-col justify-between"
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-primary/10 bg-black/25">
        <div className="flex items-center gap-2">
          <span 
            className="text-[11px] font-oxanium px-2.5 py-0.5 rounded-[var(--border-radius-md)] bg-primary/10 text-primary border border-primary/20 font-semibold lowercase tracking-wide green-glow"
          >
            {dork.category.toLowerCase()}
          </span>
          {/* <span 
            className="text-[11px] font-oxanium px-2.5 py-0.5 rounded-[var(--border-radius-md)] font-semibold lowercase tracking-wide border"
            style={{ backgroundColor: risk.bg, color: risk.text, borderColor: risk.borderColor }}
          >
            {risk.label}
          </span> */}
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={toggleFavorite}
            className={cn(
              "p-1.5 rounded-md hover:bg-white/5 transition-all active:scale-90 text-[var(--color-text-tertiary)] hover:text-white cursor-pointer"
            )}
            title={isFavorite ? "Remove from collection" : "Add to bug bounty kit"}
          >
            <Bookmark className="w-3.5 h-3.5 transition-all" fill={isFavorite ? "#00FF94" : "none"} color={isFavorite ? "#00FF94" : "currentColor"} />
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          {/* Query Terminal Block */}
          <div className="relative group/code">
            <div 
              className="font-jetbrains text-[13px] leading-relaxed bg-black/60 border border-primary/5 rounded-[var(--border-radius-md)] p-3 pr-10 break-all font-mono text-left shadow-[inset_0_0_15px_rgba(0,0,0,0.5)]"
            >
              {highlightDorkQuery(injectedQuery)}
            </div>
            <button 
              onClick={handleCopy}
              className={cn(
                "absolute top-2 right-2 p-1.5 rounded-md border border-white/10 bg-black/80 hover:bg-primary/10 hover:border-primary/30 text-muted-foreground hover:text-primary transition-all active:scale-90 cursor-pointer opacity-70 hover:opacity-100",
                copied && "text-primary border-primary/30 bg-primary/10 opacity-100"
              )}
              title={copied ? "Copied!" : "Copy query"}
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>

          {/* Description */}
          {dork.description && (
            <p className="text-[14px] text-muted-foreground/90 mt-3.5 leading-relaxed font-sans text-left">
              {dork.description}
            </p>
          )}
        </div>

        {/* Footer controls matching the design exactly */}
        <div className="mt-5 pt-3 border-t border-primary/10 flex items-center justify-between">
          <span className="text-[11px] font-mono text-muted-foreground/60 tracking-tight">
            added {getFormattedDate()} &middot; by @{dork.author}
          </span>
          <button 
            onClick={handleExplain}
            className="flex items-center gap-1.5 font-oxanium text-[12px] font-bold uppercase tracking-wider text-primary border border-primary/20 hover:border-primary bg-primary/5 hover:bg-primary hover:text-black rounded-lg px-3 py-1.5 snappy-transition active:scale-95 green-glow cursor-pointer"
          >
            <ArrowUpRight className="w-3.5 h-3.5" />
            launch
          </button>
        </div>
      </div>
    </div>
  );
}
