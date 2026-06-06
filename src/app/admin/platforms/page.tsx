"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { createClient } from "@/utils/supabase/client";
import { 
  PlusCircle, 
  Trash2, 
  Globe, 
  Search, 
  Terminal, 
  Cpu,
  Loader2,
  Settings2,
  ArrowLeft,
  LucideIcon
} from "lucide-react";
import { useEffect, useState, useCallback } from "react";
import { toast } from "sonner";
import Link from "next/link";

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
  base_url: string;
  icon: string;
}

export default function AdminPlatformsPage() {
  const [platforms, setPlatforms] = useState<Platform[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [newPlatform, setNewPlatform] = useState({
    name: "",
    slug: "",
    base_url: "",
    icon: "Globe",
  });

  const supabase = createClient();

  const fetchPlatforms = useCallback(async () => {
    const { data, error } = await supabase
      .from("platforms")
      .select("*")
      .order("created_at", { ascending: true });

    if (error) {
      toast.error("Failed to fetch platforms");
    } else {
      setPlatforms((data as Platform[]) || []);
    }
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    let ignore = false;
    
    const initialFetch = async () => {
      const { data, error } = await supabase
        .from("platforms")
        .select("*")
        .order("created_at", { ascending: true });

      if (ignore) return;
      
      if (error) {
        toast.error("Failed to fetch platforms");
      } else {
        setPlatforms((data as Platform[]) || []);
      }
      setLoading(false);
    };

    initialFetch();
    
    return () => {
      ignore = true;
    };
  }, [supabase]);

  const handleAddPlatform = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const { error } = await supabase.from("platforms").insert([newPlatform]);

    if (error) {
      toast.error("Failed to add platform: " + error.message);
    } else {
      toast.success("Platform added successfully");
      setIsAddDialogOpen(false);
      setNewPlatform({ name: "", slug: "", base_url: "", icon: "Globe" });
      setLoading(true);
      await fetchPlatforms();
    }
    setIsSubmitting(false);
  };

  const handleDeletePlatform = async (id: string) => {
    if (!confirm("Are you sure you want to delete this platform?")) return;

    const { error } = await supabase.from("platforms").delete().eq("id", id);

    if (error) {
      toast.error("Failed to delete platform");
    } else {
      toast.success("Platform deleted");
      setLoading(true);
      await fetchPlatforms();
    }
  };

  return (
    <div className="p-8 space-y-8">
      <header className="flex items-center justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-primary">
            <Link href="/admin" className="hover:text-primary/80 transition-colors">
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <Settings2 className="w-4 h-4" />
            <span className="text-xs font-black uppercase tracking-widest">System Configuration</span>
          </div>
          <h1 className="text-3xl font-black uppercase italic tracking-tighter">
            Search <span className="text-primary">Platforms</span>
          </h1>
        </div>

        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger render={
            <Button className="gap-2 bg-primary text-black hover:bg-primary/90 font-bold">
              <PlusCircle className="w-4 h-4" />
              Add Platform
            </Button>
          } />
          <DialogContent className="bg-card/95 border-white/10 backdrop-blur-xl font-mono">
            <form onSubmit={handleAddPlatform}>
              <DialogHeader>
                <DialogTitle className="text-xl font-black uppercase italic">Initialize New Platform</DialogTitle>
                <DialogDescription>Add a new search engine to the repository.</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-xs font-bold uppercase text-primary">Platform Name</Label>
                  <Input
                    id="name"
                    value={newPlatform.name}
                    onChange={(e) => setNewPlatform({ ...newPlatform, name: e.target.value })}
                    placeholder="e.g. Shodan"
                    className="bg-black/40 border-white/5"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="slug" className="text-xs font-bold uppercase text-primary">Slug (lowercase, no spaces)</Label>
                  <Input
                    id="slug"
                    value={newPlatform.slug}
                    onChange={(e) => setNewPlatform({ ...newPlatform, slug: e.target.value.toLowerCase().replace(/\s+/g, "-") })}
                    placeholder="e.g. shodan"
                    className="bg-black/40 border-white/5"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="base_url" className="text-xs font-bold uppercase text-primary">Search Base URL</Label>
                  <Input
                    id="base_url"
                    value={newPlatform.base_url}
                    onChange={(e) => setNewPlatform({ ...newPlatform, base_url: e.target.value })}
                    placeholder="https://www.google.com/search?q="
                    className="bg-black/40 border-white/5"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="icon" className="text-xs font-bold uppercase text-primary">Icon Identifier</Label>
                  <select 
                    id="icon"
                    className="w-full bg-black/40 border-white/5 rounded-md h-10 px-3 text-sm"
                    value={newPlatform.icon}
                    onChange={(e) => setNewPlatform({ ...newPlatform, icon: e.target.value })}
                  >
                    <option value="Globe">Globe (Default)</option>
                    <option value="Search">Search</option>
                    <option value="Terminal">Terminal</option>
                    <option value="Cpu">CPU/Tech</option>
                  </select>
                </div>
              </div>
              <DialogFooter>
                <Button type="submit" disabled={isSubmitting} className="w-full bg-primary text-black font-black uppercase">
                  {isSubmitting ? "Processing..." : "Confirm Integration"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </header>

      <Card className="bg-card/40 border-white/5 backdrop-blur-xl">
        <CardContent className="p-0">
          {loading ? (
            <div className="h-40 flex items-center justify-center">
              <Loader2 className="w-8 h-8 text-primary animate-spin" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="border-white/5 hover:bg-transparent">
                  <TableHead className="text-primary font-black uppercase text-[10px]">Icon</TableHead>
                  <TableHead className="text-primary font-black uppercase text-[10px]">Name</TableHead>
                  <TableHead className="text-primary font-black uppercase text-[10px]">Slug</TableHead>
                  <TableHead className="text-primary font-black uppercase text-[10px]">Base URL</TableHead>
                  <TableHead className="text-primary font-black uppercase text-[10px] text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {platforms.map((platform) => {
                  const Icon = ICON_MAP[platform.icon] || Globe;
                  return (
                    <TableRow key={platform.id} className="border-white/5 hover:bg-white/5 transition-colors group">
                      <TableCell>
                        <div className="p-2 rounded bg-white/5 w-fit">
                          <Icon className="w-4 h-4 text-primary" />
                        </div>
                      </TableCell>
                      <TableCell className="font-bold">{platform.name}</TableCell>
                      <TableCell className="text-muted-foreground text-xs">{platform.slug}</TableCell>
                      <TableCell className="text-muted-foreground text-xs font-mono truncate max-w-[300px]">
                        {platform.base_url}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeletePlatform(platform.id)}
                          className="text-muted-foreground hover:text-red-500 hover:bg-red-500/10"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
