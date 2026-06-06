"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface CategoryCardProps {
  name: string;
  description: string;
  icon: LucideIcon;
  count: number;
  onClick: () => void;
}

export function CategoryCard({ name, description, icon: Icon, count, onClick }: CategoryCardProps) {
  return (
    <Card 
      className="snappy-transition liquid-glass border-white/5 hover:border-primary/40 group cursor-pointer overflow-hidden relative flex flex-col h-full rounded-2xl shadow-2xl"
      onClick={onClick}
    >
      {/* Dynamic Background Glow */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-3xl rounded-full -mr-16 -mt-16 group-hover:bg-primary/10 transition-colors" />

      <CardHeader className="relative z-10 pb-4 pt-8 px-6">
        <div className="flex items-center justify-between mb-6">
          <div className="p-3.5 rounded-xl bg-primary/10 border border-primary/20 group-hover:scale-110 snappy-transition green-glow">
            <Icon className="w-6 h-6 text-primary" />
          </div>
          <div className="bg-white/5 text-primary text-[9px] font-jetbrains font-bold uppercase tracking-widest px-3 py-1 rounded-full border border-white/10 group-hover:border-primary/30 transition-colors">
            {count} SIGS
          </div>
        </div>
        <CardTitle className="text-xl font-oxanium font-bold uppercase tracking-tight text-white group-hover:text-primary transition-colors">
          {name}
        </CardTitle>
      </CardHeader>
      
      <CardContent className="relative z-10 flex-1 flex flex-col justify-between px-6 pb-8">
        <p className="text-[13px] font-ibm text-muted-foreground leading-relaxed border-l-2 border-primary/10 pl-6 group-hover:border-primary/30 transition-colors">
          {description}
        </p>
        
        <div className="mt-10 flex items-center gap-4 group/btn">
          <span className="text-[10px] font-oxanium font-bold uppercase tracking-[0.3em] text-primary/60 group-hover:text-primary transition-colors">ACCESS_STREAM</span>
          <div className="h-[1px] flex-1 bg-white/5 group-hover/btn:bg-primary/20 transition-all" />
          <div className="w-2.5 h-2.5 bg-primary/20 border border-primary/40 rounded-full group-hover:bg-primary transition-all green-glow" />
        </div>
      </CardContent>
    </Card>
  );
}
