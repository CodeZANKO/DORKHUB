import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@/utils/supabase/server";
import { 
  Users, 
  Database, 
  ShieldCheck, 
  AlertTriangle,
  ArrowRight,
  Layers,
  Globe
} from "lucide-react";
import NextLink from "next/link";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default async function AdminDashboard() {
  const supabase = await createClient();

  // Fetch some basic stats
  const { count: userCount } = await supabase.from('profiles').select('*', { count: 'exact', head: true });
  const { count: pendingDorks } = await supabase.from('dorks').select('*', { count: 'exact', head: true }).eq('status', 'pending');
  const { count: totalDorks } = await supabase.from('dorks').select('*', { count: 'exact', head: true });
  const { count: voteCount } = await supabase.from('votes').select('*', { count: 'exact', head: true });
  const { count: favoriteCount } = await supabase.from('favorites').select('*', { count: 'exact', head: true });

  const stats = [
    { label: "Total Operators", value: userCount || 0, icon: Users, color: "text-blue-500" },
    { label: "Pending Approvals", value: pendingDorks || 0, icon: AlertTriangle, color: "text-yellow-500" },
    { label: "Active Signatures", value: totalDorks || 0, icon: Database, color: "text-primary" },
    { label: "Community Engagement", value: (voteCount || 0) + (favoriteCount || 0), icon: ShieldCheck, color: "text-secondary" },
  ];

  return (
    <div className="p-8 space-y-10 relative">
      <header className="space-y-4">
        <div className="flex items-center gap-3 text-error green-glow">
          <ShieldCheck className="w-5 h-5" />
          <span className="text-[10px] font-oxanium font-bold uppercase tracking-[0.4em]">ROOT_ACCESS / COMMAND_CENTER</span>
        </div>
        <h1 className="text-4xl font-oxanium font-bold uppercase tracking-tighter text-white">
          Admin_<span className="text-primary">Dashboard</span>
        </h1>
        <p className="text-muted-foreground text-xs uppercase tracking-widest leading-relaxed border-l-2 border-primary/20 pl-6 max-w-3xl font-ibm">
          Central intelligence hub. Monitor matrix activity, validate incoming stream signatures, and manage core system relays.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card key={stat.label} className="liquid-glass border-white/5 rounded-2xl shadow-xl transition-all hover:border-primary/20">
            <CardHeader className="pb-4">
              <stat.icon className={cn("w-5 h-5 mb-3", stat.color)} />
              <CardDescription className="text-[9px] font-jetbrains font-bold uppercase tracking-widest opacity-40">{stat.label}</CardDescription>
              <CardTitle className="text-3xl font-oxanium font-bold text-white tracking-tighter">{stat.value}</CardTitle>
            </CardHeader>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="liquid-glass border-white/5 rounded-3xl overflow-hidden shadow-2xl group transition-all hover:border-warning/20">
          <div className="h-1 bg-gradient-to-r from-transparent via-warning to-transparent opacity-30" />
          <CardHeader className="pt-8">
            <CardTitle className="text-xl font-oxanium font-bold uppercase tracking-widest text-white">Stream_Moderation</CardTitle>
            <CardDescription className="text-[10px] uppercase font-ibm">Validate community-broadcast signatures.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 pb-8">
            <div className="p-5 bg-warning/5 border border-warning/10 rounded-2xl flex items-center justify-between transition-all group-hover:bg-warning/10">
              <div className="flex items-center gap-4">
                <AlertTriangle className="text-warning w-5 h-5" />
                <span className="text-[10px] font-jetbrains font-bold uppercase tracking-widest text-warning">{pendingDorks} SIGNATURES_PENDING</span>
              </div>
              <NextLink href="/admin/dorks">
                <Button variant="ghost" size="sm" className="text-warning hover:bg-warning/10 rounded-full text-[9px] font-bold tracking-widest">
                  REVIEW_MATRIX <ArrowRight className="ml-2 w-3.5 h-3.5" />
                </Button>
              </NextLink>
            </div>
          </CardContent>
        </Card>

        <Card className="liquid-glass border-white/5 rounded-3xl overflow-hidden shadow-2xl group transition-all hover:border-primary/20">
          <div className="h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-30" />
          <CardHeader className="pt-8">
            <CardTitle className="text-xl font-oxanium font-bold uppercase tracking-widest text-white">Core_Matrix_Relays</CardTitle>
            <CardDescription className="text-[10px] uppercase font-ibm">Manage system relays and data categories.</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-2 lg:grid-cols-3 gap-4 pb-8">
            <NextLink href="/admin/categories" className="block">
              <Button variant="outline" className="w-full h-24 flex-col gap-3 border-white/5 bg-white/5 hover:border-primary/40 hover:bg-primary/5 rounded-2xl transition-all group/btn">
                <Layers className="w-5 h-5 text-primary transition-all group-hover/btn:scale-110" />
                <span className="text-[9px] font-jetbrains font-bold uppercase tracking-widest opacity-60 group-hover/btn:opacity-100">Categories</span>
              </Button>
            </NextLink>
            <NextLink href="/admin/platforms" className="block">
              <Button variant="outline" className="w-full h-24 flex-col gap-3 border-white/5 bg-white/5 hover:border-secondary/40 hover:bg-secondary/5 rounded-2xl transition-all group/btn">
                <Globe className="w-5 h-5 text-secondary transition-all group-hover/btn:scale-110" />
                <span className="text-[9px] font-jetbrains font-bold uppercase tracking-widest opacity-60 group-hover/btn:opacity-100">Platforms</span>
              </Button>
            </NextLink>
            <NextLink href="/admin/users" className="block">
              <Button variant="outline" className="w-full h-24 flex-col gap-3 border-white/5 bg-white/5 hover:border-blue-500/40 hover:bg-blue-500/5 rounded-2xl transition-all group/btn">
                <Users className="w-5 h-5 text-blue-500 transition-all group-hover/btn:scale-110" />
                <span className="text-[9px] font-jetbrains font-bold uppercase tracking-widest opacity-60 group-hover/btn:opacity-100">Users</span>
              </Button>
            </NextLink>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
