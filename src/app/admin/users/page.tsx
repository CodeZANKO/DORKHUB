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
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { createClient } from "@/utils/supabase/client";
import { Users, Shield, ShieldAlert, Copy, Eye } from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { WorldMap } from "@/components/admin/WorldMap";

interface Profile {
  id: string;
  username: string;
  role: 'admin' | 'user';
  reputation: number;
  country_code: string | null;
  email: string | null;
  created_at: string;
}

interface UserStats {
  totalDorks: number;
  approvedDorks: number;
  pendingDorks: number;
  rejectedDorks: number;
  totalVotes: number;
  totalFavorites: number;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<Profile | null>(null);
  const [selectedUserStats, setSelectedUserStats] = useState<UserStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(false);
  const supabase = createClient();

  const fetchUsers = useCallback(async () => {
    const { data: { user: authUser } } = await supabase.auth.getUser();
    setCurrentUser(authUser?.id || null);

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      toast.error("Failed to fetch users");
    } else {
      setUsers((data as unknown as Profile[]) || []);
    }
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    let ignore = false;
    
    const initialFetch = async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (ignore) return;
      
      if (error) {
        toast.error("Failed to fetch users");
      } else {
        setUsers((data as unknown as Profile[]) || []);
      }
      setLoading(false);
    };

    initialFetch();
    
    return () => {
      ignore = true;
    };
  }, [supabase]);

  useEffect(() => {
    if (!selectedUser) {
      setSelectedUserStats(null);
      return;
    }

    const fetchUserStats = async () => {
      setStatsLoading(true);
      try {
        const { data: dorks, error: dorksError } = await supabase
          .from('dorks')
          .select('status')
          .eq('author_id', selectedUser.id);

        if (dorksError) throw dorksError;

        const totalDorks = dorks?.length || 0;
        const approvedDorks = dorks?.filter(d => d.status === 'approved').length || 0;
        const pendingDorks = dorks?.filter(d => d.status === 'pending').length || 0;
        const rejectedDorks = dorks?.filter(d => d.status === 'rejected').length || 0;

        const { count: totalVotes, error: votesError } = await supabase
          .from('votes')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', selectedUser.id);

        if (votesError) throw votesError;

        const { count: totalFavorites, error: favoritesError } = await supabase
          .from('favorites')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', selectedUser.id);

        if (favoritesError) throw favoritesError;

        setSelectedUserStats({
          totalDorks,
          approvedDorks,
          pendingDorks,
          rejectedDorks,
          totalVotes: totalVotes || 0,
          totalFavorites: totalFavorites || 0
        });
      } catch (err) {
        console.error(err);
        toast.error("Failed to load operator intelligence statistics");
      } finally {
        setStatsLoading(false);
      }
    };

    fetchUserStats();
  }, [selectedUser, supabase]);

  const toggleRole = async (userId: string, currentRole: string) => {
    if (userId === currentUser) {
      toast.error("System Override Prevented", {
        description: "You cannot demote your own account from this terminal."
      });
      return;
    }
    const newRole = currentRole === 'admin' ? 'user' : 'admin';
    
    const { error } = await supabase
      .from('profiles')
      .update({ role: newRole })
      .eq('id', userId);

    if (error) {
      toast.error(`Failed to update role: ${error.message}`);
    } else {
      toast.success(`User role updated to ${newRole}`);
      setLoading(true);
      await fetchUsers();
    }
  };

  return (
    <div className="p-8 space-y-8">
      <header className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-black uppercase italic tracking-tighter flex items-center gap-3">
            <Users className="text-blue-500 w-8 h-8" />
            Operator <span className="text-blue-500">Management</span>
          </h1>
          <p className="text-muted-foreground text-xs uppercase font-bold tracking-widest">
            Manage system access levels and operator privileges.
          </p>
        </div>
      </header>

      <WorldMap users={users} />

      <Card className="bg-card/40 border-white/5 backdrop-blur-xl">
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-white/5">
              <TableRow className="border-white/5 hover:bg-transparent">
                <TableHead className="text-[10px] font-black uppercase tracking-widest py-4">Operator</TableHead>
                <TableHead className="text-[10px] font-black uppercase tracking-widest">Role</TableHead>
                <TableHead className="text-[10px] font-black uppercase tracking-widest">Reputation</TableHead>
                <TableHead className="text-[10px] font-black uppercase tracking-widest">Joined</TableHead>
                <TableHead className="text-[10px] font-black uppercase tracking-widest text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-40 text-center text-muted-foreground animate-pulse font-bold uppercase tracking-widest">
                    Scanning Network...
                  </TableCell>
                </TableRow>
              ) : (
                users.map((user) => (
                  <TableRow key={user.id} className="border-white/5 hover:bg-white/5 transition-colors group">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-bold text-xs">
                          {user.username?.[0]?.toUpperCase() || '?'}
                        </div>
                        <div className="flex flex-col">
                          <span className="font-bold text-sm">{user.username}</span>
                          <span className="text-[10px] text-muted-foreground font-mono uppercase tracking-tighter">{user.id.slice(0, 8)}...</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={
                        user.role === 'admin' ? 'bg-red-500/10 text-red-500 border-red-500/20' : 'bg-blue-500/10 text-blue-500 border-blue-500/20'
                      }>
                        {user.role.toUpperCase()}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-mono text-sm text-primary">
                      {user.reputation} REP
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground font-mono">
                      {new Date(user.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="text-[10px] font-black uppercase tracking-widest h-8 border-white/10 hover:border-primary/50 hover:bg-primary/5 text-muted-foreground hover:text-primary"
                        onClick={() => setSelectedUser(user)}
                      >
                        <Eye className="w-3 h-3 mr-2" />
                        Inspect
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="text-[10px] font-black uppercase tracking-widest h-8 border-white/10 hover:border-red-500/50 hover:bg-red-500/5"
                        onClick={() => toggleRole(user.id, user.role)}
                        disabled={user.id === currentUser}
                      >
                        {user.role === 'admin' ? (
                          <>
                            <ShieldAlert className="w-3 h-3 mr-2 text-red-500" />
                            Demote to User
                          </>
                        ) : (
                          <>
                            <Shield className="w-3 h-3 mr-2 text-primary" />
                            Promote to Admin
                          </>
                        )}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={!!selectedUser} onOpenChange={(open) => { if (!open) setSelectedUser(null); }}>
        <DialogContent className="max-w-md bg-black/95 border border-white/10 rounded-2xl p-6 shadow-[0_0_50px_rgba(0,255,148,0.05)] text-white font-mono">
          <DialogHeader>
            <div className="flex items-center gap-2 text-primary green-glow mb-2">
              <Shield className="w-4 h-4" />
              <span className="text-[9px] font-oxanium font-bold uppercase tracking-[0.3em]">Operator_Intel_Inspector</span>
            </div>
            <DialogTitle className="text-2xl font-oxanium font-bold uppercase tracking-tighter text-white flex items-center justify-between">
              <span>{selectedUser?.username}</span>
              {selectedUser && (
                <Badge className={
                  selectedUser.role === 'admin' ? 'bg-red-500/10 text-red-500 border-red-500/20' : 'bg-blue-500/10 text-blue-500 border-blue-500/20'
                }>
                  {selectedUser.role.toUpperCase()}
                </Badge>
              )}
            </DialogTitle>
          </DialogHeader>

          {selectedUser && (
            <div className="space-y-6 mt-4">
              <div className="space-y-3 p-4 rounded-xl bg-white/5 border border-white/5 font-ibm">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-muted-foreground uppercase tracking-wider">Operator ID</span>
                  <div className="flex items-center gap-2 font-mono">
                    <span className="text-white text-[10px] select-all">{selectedUser.id}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="w-5 h-5 text-muted-foreground hover:text-white"
                      onClick={() => {
                        navigator.clipboard.writeText(selectedUser.id);
                        toast.success("ID copied to clipboard");
                      }}
                    >
                      <Copy className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-muted-foreground uppercase tracking-wider">Reputation Level</span>
                  <span className="text-primary font-bold">{selectedUser.reputation} REP</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-muted-foreground uppercase tracking-wider">Registry Date</span>
                  <span className="text-white font-mono">{new Date(selectedUser.created_at).toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-muted-foreground uppercase tracking-wider">Deployment Node</span>
                  <span className="text-white font-mono uppercase font-bold tracking-wider">{selectedUser.country_code || "Unknown"}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-muted-foreground uppercase tracking-wider">Email Address</span>
                  <span className="text-white font-mono select-all">{selectedUser.email || "No Email Registered"}</span>
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="text-[10px] font-oxanium font-bold uppercase tracking-widest text-primary/60">System_Activity_Telemetry</h3>
                
                {statsLoading ? (
                  <div className="h-32 flex flex-col items-center justify-center border border-white/5 rounded-xl bg-white/2 gap-2 text-xs uppercase tracking-widest text-muted-foreground animate-pulse">
                    <span>Retrieving Telemetry...</span>
                  </div>
                ) : selectedUserStats ? (
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 rounded-xl border border-white/5 bg-white/2 flex flex-col gap-1">
                      <span className="text-[9px] uppercase text-muted-foreground">Total Dorks</span>
                      <span className="text-xl font-bold font-oxanium">{selectedUserStats.totalDorks}</span>
                    </div>
                    <div className="p-3 rounded-xl border border-white/5 bg-white/2 flex flex-col gap-1">
                      <span className="text-[9px] uppercase text-muted-foreground">Approved Dorks</span>
                      <span className="text-xl font-bold font-oxanium text-primary">{selectedUserStats.approvedDorks}</span>
                    </div>
                    <div className="p-3 rounded-xl border border-white/5 bg-white/2 flex flex-col gap-1">
                      <span className="text-[9px] uppercase text-muted-foreground">Pending Review</span>
                      <span className="text-xl font-bold font-oxanium text-warning">{selectedUserStats.pendingDorks}</span>
                    </div>
                    <div className="p-3 rounded-xl border border-white/5 bg-white/2 flex flex-col gap-1">
                      <span className="text-[9px] uppercase text-muted-foreground">Rejected Dorks</span>
                      <span className="text-xl font-bold font-oxanium text-error">{selectedUserStats.rejectedDorks}</span>
                    </div>
                    <div className="p-3 rounded-xl border border-white/5 bg-white/2 flex flex-col gap-1">
                      <span className="text-[9px] uppercase text-muted-foreground">Votes Cast</span>
                      <span className="text-xl font-bold font-oxanium text-secondary">{selectedUserStats.totalVotes}</span>
                    </div>
                    <div className="p-3 rounded-xl border border-white/5 bg-white/2 flex flex-col gap-1">
                      <span className="text-[9px] uppercase text-muted-foreground">Favorites Added</span>
                      <span className="text-xl font-bold font-oxanium text-white/90">{selectedUserStats.totalFavorites}</span>
                    </div>
                  </div>
                ) : (
                  <div className="p-3 rounded-xl border border-white/5 bg-white/2 text-center text-xs uppercase text-error">
                    Error fetching statistics.
                  </div>
                )}
              </div>
            </div>
          )}

          <DialogFooter className="mt-6">
            <Button 
              onClick={() => setSelectedUser(null)} 
              className="w-full bg-primary text-black font-bold uppercase tracking-widest hover:bg-primary/80 rounded-xl h-10 text-xs"
            >
              Close Inspector
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
