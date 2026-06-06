"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { createClient } from "@/utils/supabase/client";
import { PlusCircle, Terminal, Lock } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface Platform {
  id: string;
  name: string;
  slug: string;
}

interface Category {
  id: string;
  name: string;
}

interface User {
  id: string;
  email?: string;
}

export function SubmitDork() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  const [query, setQuery] = useState("");
  const [description, setDescription] = useState("");
  const [platform, setPlatform] = useState("google");
  const [category, setCategory] = useState("");
  const [platforms, setPlatforms] = useState<Platform[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    async function getInitialData() {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      setUser(authUser as User | null);

      const [platformsRes, categoriesRes] = await Promise.all([
        supabase.from('platforms').select('*').eq('is_active', true),
        supabase.from('categories').select('*')
      ]);

      if (platformsRes.data) setPlatforms(platformsRes.data as Platform[]);
      if (categoriesRes.data) setCategories(categoriesRes.data as Category[]);
    }
    getInitialData();
  }, [supabase]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error("Authentication Required", {
        description: "You must be logged in to submit signatures.",
      });
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase
        .from('dorks')
        .insert([
          {
            query,
            description,
            platform,
            category_id: category || null,
            author_id: user.id,
            success_rate: 100
          }
        ]);

      if (error) throw error;

      toast.success("Submission Received!", {
        description: "Your signature has been queued for admin validation.",
      });
      setOpen(false);
      setQuery("");
      setDescription("");
      router.refresh();
    } catch (err: unknown) {
      console.error(err);
      const errorMessage = err instanceof Error ? err.message : "An unknown error occurred";
      toast.error("Submission failed", {
        description: errorMessage,
      });
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <Button 
        variant="outline" 
        className="border-border bg-background/20 text-muted-foreground hover:bg-primary/5 hover:text-primary hover:border-primary/40 font-bold uppercase tracking-widest text-[10px] h-10 rounded-sm"
        onClick={() => router.push('/login')}
      >
        <Lock className="w-3.5 h-3.5 mr-2" />
        Login
      </Button>
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button className="bg-primary text-black hover:bg-primary/80 font-bold uppercase tracking-widest text-[10px] h-11 px-6 rounded-full shadow-[0_0_20px_rgba(0,255,148,0.2)] transition-all green-glow">
            <PlusCircle className="w-4 h-4 mr-2" />
            Submit Your DORK
          </Button>
        }
      />
      <DialogContent className="sm:max-w-[500px] border border-primary/20 bg-gradient-to-b from-black/90 to-zinc-950/90 backdrop-blur-xl liquid-glass shadow-2xl rounded-3xl font-ibm text-white">      
        <DialogHeader>
          <div className="flex items-center gap-2 text-primary mb-2 green-glow">
            <Terminal className="w-4 h-4" />
            <span className="text-[10px] font-oxanium font-bold uppercase tracking-[0.2em]">DORKHUB</span>
          </div>
          <DialogTitle className="text-2xl font-oxanium font-bold uppercase tracking-tighter text-white">
            Add Dork For <span className="text-primary">DORKHUB</span>
          </DialogTitle>
          <DialogDescription className="text-[10px] font-jetbrains uppercase tracking-widest text-white/40">
            Your Email: {user.email}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 py-6">
          <div className="space-y-2">
            <Label htmlFor="query" className="text-[10px] font-oxanium font-bold uppercase tracking-widest text-primary/60 ml-1">The Dork</Label>  
            <Input
              id="query"
              placeholder='e.g. filetype:log "secret"'
              required
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="bg-green border-white fg-green focus:border-primary/40 font-jetbrains text-xs rounded-xl h-12 text-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category" className="text-[10px] font-oxanium font-bold uppercase tracking-widest text-primary/60 ml-1">Data_Type</Label>   
              <Select value={category} onValueChange={(val: string | null) => val && setCategory(val)}>
                <SelectTrigger className="bg-black/40 border-white/5 focus:border-primary/40 rounded-xl h-12 text-xs font-jetbrains text-white">
                  <SelectValue placeholder="Select Category">
                    {categories.find(c => c.id === category)?.name}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent className="bg-black/90 border-white/10 backdrop-blur-xl rounded-xl">
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id} className="text-xs font-jetbrains text-white hover:bg-primary/10">{cat.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="platform" className="text-[10px] font-oxanium font-bold uppercase tracking-widest text-primary/60 ml-1">Relay_Node</Label>
              <Select value={platform} onValueChange={(val: string | null) => val && setPlatform(val)}>
                <SelectTrigger className="bg-black/40 border-white/5 focus:border-primary/40 rounded-xl h-12 text-xs font-jetbrains text-white">
                  <SelectValue placeholder="Select Platform">
                    {platforms.find(p => p.slug === platform)?.name}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent className="bg-black/90 border-white/10 backdrop-blur-xl rounded-xl">
                  {platforms.map((p) => (
                    <SelectItem key={p.slug} value={p.slug} className="text-xs font-jetbrains text-white hover:bg-primary/10">{p.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="text-[10px] font-oxanium font-bold uppercase tracking-widest text-primary/60 ml-1">Technical_Spec</Label>
            <Textarea
              id="description"
              placeholder="Detailed functionality report..."
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="bg-black/40 border-white/5 focus:border-primary/40 min-h-[100px] font-ibm text-xs rounded-xl p-4 text-white"
            />
          </div>

          <DialogFooter className="pt-4">
            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-primary text-black hover:bg-primary/80 font-bold uppercase tracking-widest text-xs h-14 rounded-xl shadow-[0_0_30px_rgba(0,255,148,0.2)] green-glow transition-all"
            >
              {loading ? "INITIALIZING_STREAM..." : "EXECUTE_SUBMISSION"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
