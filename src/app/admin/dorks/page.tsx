"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { createClient } from "@/utils/supabase/client";
import { Check, X, ExternalLink, Terminal, Trash2 } from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

interface Dork {
  id: string;
  query: string;
  description: string | null;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  profiles: { username: string | null } | null;
  categories: { name: string | null } | null;
}

export default function AdminDorksPage() {
  const [dorks, setDorks] = useState<Dork[]>([]);
  const [loading, setLoading] = useState(true);
  const [dorkToDelete, setDorkToDelete] = useState<string | null>(null);
  const supabase = createClient();

  const fetchDorks = useCallback(async () => {
    const { data, error } = await supabase
      .from('dorks')
      .select('*, profiles!author_id(username), categories!category_id(name)')
      .order('created_at', { ascending: false });

    if (error) {
      toast.error("Failed to fetch dorks");
    } else {
      setDorks((data as unknown as Dork[]) || []);
    }
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    let ignore = false;
    
    const initialFetch = async () => {
      const { data, error } = await supabase
        .from('dorks')
        .select('*, profiles!author_id(username), categories!category_id(name)')
        .order('created_at', { ascending: false });

      if (ignore) return;
      
      if (error) {
        toast.error("Failed to fetch dorks");
      } else {
        setDorks((data as unknown as Dork[]) || []);
      }
      setLoading(false);
    };

    initialFetch();
    
    return () => {
      ignore = true;
    };
  }, [supabase]);

  const handleStatusUpdate = async (id: string, newStatus: 'approved' | 'rejected') => {
    const { error } = await supabase
      .from('dorks')
      .update({ status: newStatus })
      .eq('id', id);

    if (error) {
      toast.error(`Failed to update status: ${error.message}`);
    } else {
      toast.success(`Dork ${newStatus} successfully`);
      setLoading(true);
      await fetchDorks();
    }
  };

  const handleDeleteDork = async (id: string) => {
    const { error } = await supabase
      .from('dorks')
      .delete()
      .eq('id', id);

    if (error) {
      toast.error(`Failed to delete dork: ${error.message}`);
    } else {
      toast.success("Dork deleted successfully");
      setLoading(true);
      await fetchDorks();
    }
  };

  return (
    <div className="p-8 space-y-8">
      <header className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-black uppercase italic tracking-tighter flex items-center gap-3">
            <Terminal className="text-primary w-8 h-8" />
            Dork <span className="text-primary">Moderation</span>
          </h1>
          <p className="text-muted-foreground text-xs uppercase font-bold tracking-widest">
            Validate search signatures before deployment to main repository.
          </p>
        </div>
      </header>

      <Card className="bg-card/40 border-white/5 backdrop-blur-xl">
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-white/5">
              <TableRow className="border-white/5 hover:bg-transparent">
                <TableHead className="text-[10px] font-black uppercase tracking-widest py-4">Status</TableHead>
                <TableHead className="text-[10px] font-black uppercase tracking-widest">Signature</TableHead>
                <TableHead className="text-[10px] font-black uppercase tracking-widest">Category</TableHead>
                <TableHead className="text-[10px] font-black uppercase tracking-widest">Author</TableHead>
                <TableHead className="text-[10px] font-black uppercase tracking-widest text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-40 text-center text-muted-foreground animate-pulse font-bold uppercase tracking-widest">
                    Decrypting Database...
                  </TableCell>
                </TableRow>
              ) : dorks.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-40 text-center text-muted-foreground font-bold uppercase tracking-widest">
                    No signatures found
                  </TableCell>
                </TableRow>
              ) : (
                dorks.map((dork) => (
                  <TableRow key={dork.id} className="border-white/5 hover:bg-white/5 transition-colors group">
                    <TableCell>
                      <Badge className={
                        dork.status === 'approved' ? 'bg-green-500/10 text-green-500 border-green-500/20' :
                        dork.status === 'rejected' ? 'bg-red-500/10 text-red-500 border-red-500/20' :
                        'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'
                      }>
                        {dork.status.toUpperCase()}
                      </Badge>
                    </TableCell>
                    <TableCell className="max-w-md">
                      <div className="flex flex-col gap-1">
                        <code className="text-secondary font-bold text-sm bg-black/40 px-2 py-1 rounded border border-white/5 group-hover:border-primary/30 transition-colors">
                          {dork.query}
                        </code>
                        <span className="text-[10px] text-muted-foreground line-clamp-1 italic">{dork.description || 'No description provided'}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-xs font-bold text-muted-foreground">
                      {dork.categories?.name || 'Uncategorized'}
                    </TableCell>
                    <TableCell className="text-xs font-bold text-primary">
                      {dork.profiles?.username || 'Unknown'}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        {dork.status === 'pending' && (
                          <>
                            <Button 
                              size="icon" 
                              variant="ghost" 
                              className="h-8 w-8 text-green-500 hover:text-green-400 hover:bg-green-500/10"
                              onClick={() => handleStatusUpdate(dork.id, 'approved')}
                              title="Approve"
                            >
                              <Check className="w-4 h-4" />
                            </Button>
                            <Button 
                              size="icon" 
                              variant="ghost" 
                              className="h-8 w-8 text-red-500 hover:text-red-400 hover:bg-red-500/10"
                              onClick={() => handleStatusUpdate(dork.id, 'rejected')}
                              title="Reject"
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </>
                        )}
                        <Button 
                          size="icon" 
                          variant="ghost" 
                          className="h-8 w-8 text-muted-foreground hover:text-primary hover:bg-primary/10"
                          onClick={() => window.open(`https://www.google.com/search?q=${encodeURIComponent(dork.query)}`, '_blank')}
                          title="Test Query"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </Button>
                        <Button 
                          size="icon" 
                          variant="ghost" 
                          className="h-8 w-8 text-muted-foreground hover:text-red-500 hover:bg-red-500/10"
                          onClick={() => setDorkToDelete(dork.id)}
                          title="Delete Signature"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={dorkToDelete !== null} onOpenChange={(open) => !open && setDorkToDelete(null)}>
        <DialogContent className="border border-red-500/20 bg-gradient-to-b from-black/90 to-zinc-950/90 backdrop-blur-xl liquid-glass shadow-2xl rounded-3xl font-ibm text-white sm:max-w-[400px]">
          <DialogHeader>
            <div className="flex items-center gap-2 text-red-500 mb-2">
              <Trash2 className="w-4 h-4" />
              <span className="text-[10px] font-oxanium font-bold uppercase tracking-[0.2em]">SECURITY_PROTOCOL</span>
            </div>
            <DialogTitle className="text-xl font-oxanium font-bold uppercase tracking-tighter text-white">
              Confirm <span className="text-red-500">Purge</span>
            </DialogTitle>
            <DialogDescription className="text-xs font-jetbrains uppercase tracking-wide text-white/60 leading-relaxed">
              Are you sure you want to permanently delete this search signature from the system index? This action is irreversible.
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/5 mt-4">
            <Button
              variant="outline"
              onClick={() => setDorkToDelete(null)}
              className="border-white/10 hover:bg-white/5 text-xs font-bold uppercase tracking-widest h-10 rounded-xl"
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                if (dorkToDelete) {
                  handleDeleteDork(dorkToDelete);
                  setDorkToDelete(null);
                }
              }}
              className="bg-red-500 hover:bg-red-600 text-white text-xs font-bold uppercase tracking-widest h-10 px-4 rounded-xl shadow-[0_0_20px_rgba(239,68,68,0.2)] transition-all"
            >
              Confirm Purge
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
