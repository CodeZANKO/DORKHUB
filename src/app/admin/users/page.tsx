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
import { Users, Shield, ShieldAlert } from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";

interface Profile {
  id: string;
  username: string;
  role: 'admin' | 'user';
  reputation: number;
  created_at: string;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<string | null>(null);
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
                    <TableCell className="text-right">
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
    </div>
  );
}
