"use client";

import { Sidebar } from "@/components/layout/Sidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Toaster } from "@/components/ui/sonner";
import { Textarea } from "@/components/ui/textarea";
import { PlusCircle, Terminal, Clock, CheckCircle2, XCircle, Search } from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { createClient } from "@/utils/supabase/client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface User {
  id: string;
  email?: string;
}

interface Category {
  id: string;
  name: string;
}

interface Platform {
  id: string;
  name: string;
  slug: string;
}

interface UserDork {
  id: string;
  query: string;
  description: string | null;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  platform: string;
  categories?: {
    name: string;
  };
}

export default function SubmitPage() {
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState("");
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [platform, setPlatform] = useState("google");
  const [user, setUser] = useState<User | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [platforms, setPlatforms] = useState<Platform[]>([]);
  const [userDorks, setUserDorks] = useState<UserDork[]>([]);
  const [fetchingDorks, setFetchingDorks] = useState(true);
  
  const supabase = createClient();

  const fetchUserDorks = useCallback(async (userId: string) => {
    setFetchingDorks(true);
    const { data, error } = await supabase
      .from('dorks')
      .select('*, categories(name)')
      .eq('author_id', userId)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error("Error fetching user dorks:", error);
    } else if (data) {
      setUserDorks(data as any[]);
    }
    setFetchingDorks(false);
  }, [supabase]);

  useEffect(() => {
    async function getData() {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user as User | null);

      if (user) {
        fetchUserDorks(user.id);
      }

      const [categoriesRes, platformsRes] = await Promise.all([
        supabase.from('categories').select('id, name').order('name'),
        supabase.from('platforms').select('id, name, slug').eq('is_active', true).order('name')
      ]);

      if (categoriesRes.data) {
        setCategories(categoriesRes.data);
        if (categoriesRes.data.length > 0) setCategoryId(categoriesRes.data[0].id);
      }
      if (platformsRes.data) {
        setPlatforms(platformsRes.data);
      }
    }
    getData();
  }, [supabase, fetchUserDorks]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error("Authentication Required");
      return;
    }

    if (!categoryId) {
      toast.error("Please select a category");
      return;
    }

    setLoading(true);
    
    const { data: duplicateDorks, error: duplicateError } = await supabase
      .from('dorks')
      .select('id')
      .eq('query', query.trim())
      .limit(1);

    if (duplicateError) {
      toast.error(`Validation failed: ${duplicateError.message}`);
      setLoading(false);
      return;
    }

    if (duplicateDorks && duplicateDorks.length > 0) {
      toast.error("Duplicate Signature", {
        description: "This dork has already been submitted to the database.",
      });
      setLoading(false);
      return;
    }

    const { error } = await supabase
      .from('dorks')
      .insert([
        {
          query: query.trim(),
          description: description || null,
          platform,
          category_id: categoryId,
          author_id: user.id,
          status: 'pending'
        }
      ]);

    setLoading(false);

    if (error) {
      toast.error(`Submission failed: ${error.message}`);
    } else {
      toast.success("Dork submitted for admin review!", {
        description: "It will appear in the repository once validated.",
      });
      setQuery("");
      setDescription("");
      fetchUserDorks(user.id);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved': return <CheckCircle2 className="w-3 h-3 text-primary" />;
      case 'rejected': return <XCircle className="w-3 h-3 text-destructive" />;
      default: return <Clock className="w-3 h-3 text-yellow-500" />;
    }
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'approved': return 'default';
      case 'rejected': return 'destructive';
      default: return 'outline';
    }
  };

  return (
    <div className="flex min-h-screen bg-background text-foreground font-mono">
      <Sidebar />

      <main className="flex-1 flex flex-col cyber-grid min-h-screen overflow-y-auto">
        <header className="h-20 border-b border-border bg-card/10 backdrop-blur-md flex items-center px-8 sticky top-0 z-20">
          <div className="flex items-center gap-3">
            <PlusCircle className="text-primary w-6 h-6" />
            <h1 className="text-xl font-black uppercase tracking-widest italic">
              Submission <span className="text-primary">Lab</span>
            </h1>
          </div>
        </header>

        <div className="p-8 max-w-5xl mx-auto w-full space-y-12 pb-24">
          <Card className="border-primary/20 bg-card/40 backdrop-blur-xl">
            <CardHeader>
              <div className="flex items-center gap-2 text-primary mb-2">
                <Terminal className="w-5 h-5" />
                <span className="text-xs font-black uppercase tracking-widest">TRANSMISSION_TERMINAL</span>
              </div>
              <CardTitle className="text-3xl font-black italic uppercase">
                Add Dork to the <span className="text-primary"> DORKHUB</span>
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                Share a verified search signature. Submissions require admin validation before being listed.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="query" className="text-xs font-bold uppercase text-primary">Dork Signature</Label>
                  <Input
                    id="query"
                    placeholder='e.g. filetype:log "password"'
                    required
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className="
                      bg-black/40
                      border border-white/10
                      hover:border-white/20
                      focus-visible:border-primary
                      focus-visible:ring-2
                      focus-visible:ring-primary/20
                      font-mono
                      text-secondary
                      transition-all
                    "
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="category" className="text-xs font-bold uppercase text-primary">Category</Label>
                    <Select value={categoryId || ""} onValueChange={(val) => val && setCategoryId(val)}>
                      <SelectTrigger className="bg-black/40 border-white/5 focus:border-primary/50">
                        <SelectValue placeholder="Select Category">
                          {categories.find(c => c.id === categoryId)?.name}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent className="bg-zinc-900 border border-white/10">
                        {categories.map((cat) => (
                          <SelectItem key={cat.id} value={cat.id}>
                            {cat.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="platform" className="text-xs font-bold uppercase text-primary">Target Platform</Label>
                    <Select value={platform || "google"} onValueChange={(val) => val && setPlatform(val)}>
                      <SelectTrigger
                        className="
                          bg-black/40
                          border border-white/10
                          hover:border-white/20
                          focus:ring-2
                          focus:ring-primary/20
                          focus:border-primary
                          transition-all
                        "
                      >
                        <SelectValue placeholder="Select Platform">
                          {platforms.find(p => p.slug === platform)?.name || platform}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent className="bg-zinc-900 border border-white/10">
                        {platforms.map((p) => (
                          <SelectItem key={p.id} value={p.slug}>
                            {p.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description" className="text-xs font-bold uppercase text-primary">Technical Description</Label>
                  <Textarea
                    id="description"
                    placeholder="What does this dork find? Be specific."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="
                      min-h-[100px]
                      bg-black/40
                      border border-white/10
                      hover:border-white/20
                      focus-visible:border-primary
                      focus-visible:ring-2
                      focus-visible:ring-primary/20
                      transition-all
                    "
                  />
                </div>

                <Button 
                  type="submit" 
                  disabled={loading}
                  className="w-full bg-primary text-black hover:bg-primary/90 font-black uppercase tracking-tighter italic h-12 text-lg"
                >
                  {loading ? "INITIALIZING UPLOAD..." : "EXECUTE SUBMISSION"}
                </Button>
              </form>
            </CardContent>
          </Card>

          <section className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Search className="text-primary w-5 h-5" />
                <h2 className="text-xl font-black uppercase tracking-widest italic">
                  My <span className="text-primary">Submissions</span>
                </h2>
              </div>
              <Badge variant="outline" className="border-primary/30 text-primary font-mono">
                {userDorks.length} TOTAL_ENTRIES
              </Badge>
            </div>

            <Card className="border-white/5 bg-black/40 backdrop-blur-md overflow-hidden">
              <Table>
                <TableHeader className="bg-white/5">
                  <TableRow className="hover:bg-transparent border-white/5">
                    <TableHead className="text-primary font-black uppercase tracking-tighter italic">Signature</TableHead>
                    <TableHead className="text-primary font-black uppercase tracking-tighter italic">Category</TableHead>
                    <TableHead className="text-primary font-black uppercase tracking-tighter italic">Status</TableHead>
                    <TableHead className="text-primary font-black uppercase tracking-tighter italic text-right">Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {fetchingDorks ? (
                    <TableRow>
                      <TableCell colSpan={4} className="h-24 text-center text-muted-foreground animate-pulse">
                        SCANNING_DATABASE...
                      </TableCell>
                    </TableRow>
                  ) : userDorks.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="h-24 text-center text-muted-foreground italic">
                        NO_SUBMISSIONS_FOUND
                      </TableCell>
                    </TableRow>
                  ) : (
                    userDorks.map((dork) => (
                      <TableRow key={dork.id} className="border-white/5 hover:bg-white/5 transition-colors group">
                        <TableCell className="font-mono text-xs max-w-[300px] truncate">
                          <code className="text-secondary group-hover:text-primary transition-colors">
                            {dork.query}
                          </code>
                        </TableCell>
                        <TableCell>
                          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                            {dork.categories?.name || 'Uncategorized'}
                          </span>
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant={getStatusVariant(dork.status)} 
                            className={cn(
                              "gap-1.5 px-2 py-0.5 text-[10px] uppercase font-black italic",
                              dork.status === 'pending' && "border-yellow-500/50 text-yellow-500 bg-yellow-500/10"
                            )}
                          >
                            {getStatusIcon(dork.status)}
                            {dork.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right text-[10px] text-muted-foreground font-mono">
                          {new Date(dork.created_at).toLocaleDateString()}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </Card>
          </section>
        </div>

        <Toaster position="bottom-right" theme="dark" closeButton richColors />
      </main>
    </div>
  );
}
