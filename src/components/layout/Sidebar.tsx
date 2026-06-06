"use client";

import { cn } from "@/lib/utils";
import { 
  BookOpen, 
  Compass, 
  History, 
  Library, 
  PlusCircle, 
  Settings,
  ShieldAlert,
  Terminal,
  Lock,
  X,
  LayoutDashboard,
  LogOut,
  User as UserIcon,
  ChevronLeft,
  Menu
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { Button } from "@/components/ui/button";

const navItems = [
  { name: "Explore", icon: Compass, href: "/", public: true },
  // { name: "My Collections", icon: Library, href: "/collections", public: false },
  { name: "Submission Lab", icon: PlusCircle, href: "/submit", public: false },
  // { name: "History", icon: History, href: "/history", public: false },
];

const secondaryItems = [
  { name: "Docs", icon: BookOpen, href: "/docs", public: true },
  { name: "Settings", icon: Settings, href: "/settings", public: false },
];

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

interface User {
  id: string;
  email?: string;
}

interface Profile {
  id: string;
  role: 'admin' | 'user';
  username: string;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    async function getSession() {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      setUser(authUser as User | null);
      
      if (authUser) {
        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', authUser.id)
          .single();
        setProfile(profileData as Profile | null);
      }
      setLoading(false);
    }
    getSession();
  }, [supabase]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  };

  const isAdmin = profile?.role === 'admin';

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-md z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside className={cn(
        "fixed inset-y-0 left-0 z-50 liquid-glass border-r border-white/5 flex flex-col h-screen transition-all duration-500 lg:sticky lg:top-0 lg:translate-x-0",
        isOpen ? "translate-x-0" : "-translate-x-full",
        isCollapsed ? "w-20" : "w-72"
      )}>
        {/* Glossy Top Accent */}
        <div className="h-[2px] w-full bg-gradient-to-r from-transparent via-primary to-transparent opacity-50" />

        <div className={cn(
          "p-6 flex items-center justify-between",
          isCollapsed && "px-0 justify-center"
        )}>
          {!isCollapsed && (
            <div className="flex items-center gap-2 group cursor-pointer overflow-hidden">
              <div className="p-2 rounded-lg bg-primary/10 border border-primary/20 green-glow">
                <Terminal className="w-5 h-5 text-primary" />
              </div>
              <span className="text-xl font-jetbrains font-bold tracking-tighter text-white">
                DORK<span className="text-primary">HUB</span>
              </span>
            </div>
          )}
          
          <Button 
            variant="ghost" 
            size="icon" 
            className="text-muted-foreground hover:text-primary hover:bg-primary/5 rounded-full snappy-transition" 
            onClick={() => {
              if (window.innerWidth < 1024 && onClose) {
                onClose();
              } else {
                setIsCollapsed(!isCollapsed);
              }
            }}
          >
            {isCollapsed ? <Menu className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
          </Button>
        </div>

        <nav className={cn(
          "flex-1 px-4 space-y-8 overflow-y-auto py-6 scrollbar-hide font-ibm",
          isCollapsed && "px-2 space-y-4"
        )}>
          <div className="space-y-2">
            {!isCollapsed && (
              <div className="px-4 py-1">
                <span className="text-[10px] font-oxanium font-bold uppercase tracking-[0.3em] text-primary/40">Main_Matrix</span>
              </div>
            )}
            <div className="space-y-1">
              {navItems.map((item) => {
                const isLocked = !item.public && !user;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={isLocked ? "/login" : item.href}
                    onClick={onClose}
                    className={cn(
                      "flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-300 group relative",
                      isCollapsed && "px-0 justify-center",
                      isActive
                        ? "bg-primary/10 text-primary border border-primary/20 shadow-[0_0_20px_rgba(0,255,148,0.1)]"
                        : "text-muted-foreground hover:text-primary hover:bg-white/5",
                      isLocked && "opacity-30 cursor-not-allowed"
                    )}
                    title={item.name}
                  >
                    <div className="flex items-center gap-3">
                      <item.icon className={cn(
                        "w-4 h-4 transition-all duration-300 shrink-0",
                        isActive ? "text-primary green-glow" : "group-hover:text-primary"
                      )} />
                      {!isCollapsed && <span className="text-sm font-bold tracking-wide">{item.name}</span>}
                    </div>
                    {!isCollapsed && isLocked && <Lock className="w-3 h-3 opacity-50" />}
                  </Link>
                );
              })}
            </div>
          </div>

          <div className="space-y-2">
            {!isCollapsed && (
              <div className="px-4 py-1">
                <span className="text-[10px] font-oxanium font-bold uppercase tracking-[0.3em] text-white/20">Protocol_Docs</span>
              </div>
            )}
            <div className="space-y-1">
              {secondaryItems.map((item) => {
                const isLocked = !item.public && !user;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={isLocked ? "/login" : item.href}
                    onClick={onClose}
                    className={cn(
                      "flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-300 group relative",
                      isCollapsed && "px-0 justify-center",
                      isActive
                        ? "bg-white/10 text-white border border-white/10"
                        : "text-muted-foreground hover:text-white hover:bg-white/5",
                      isLocked && "opacity-30 cursor-not-allowed"
                    )}
                    title={item.name}
                  >
                    <div className="flex items-center gap-3">
                      <item.icon className={cn(
                        "w-4 h-4 transition-all duration-300 shrink-0",
                        isActive ? "text-white" : "group-hover:text-white"
                      )} />
                      {!isCollapsed && <span className="text-sm font-bold tracking-wide">{item.name}</span>}
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </nav>

        <div className={cn(
          "p-6 mt-auto",
          isCollapsed && "px-2"
        )}>
          {user ? (
            <div className={cn(
              "bg-white/5 border border-white/5 rounded-2xl p-4 space-y-4 relative overflow-hidden group hover:bg-white/10 transition-all",
              isCollapsed && "p-0 bg-transparent border-transparent"
            )}>
              <div className={cn(
                "flex items-center gap-3",
                isCollapsed && "justify-center"
              )}>
                <div className="w-10 h-10 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0 green-glow">
                  <UserIcon className="w-5 h-5 text-primary" />
                </div>
                {!isCollapsed && (
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-bold text-white truncate">
                      {profile?.username || user.email?.split('@')[0]}
                    </div>
                    <div className="text-[10px] text-primary font-bold tracking-widest uppercase">
                      {profile?.role || 'OPERATOR'}
                    </div>
                  </div>
                )}
              </div>
              {!isCollapsed && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="w-full justify-start text-[10px] font-bold uppercase tracking-widest text-muted-foreground hover:text-error hover:bg-error/10 rounded-lg h-9"
                  onClick={handleLogout}
                >
                  <LogOut className="w-3.5 h-3.5 mr-2" />
                  Term_Session
                </Button>
              )}
            </div>
          ) : (
            <Link href="/login">
              <Button className={cn(
                "w-full bg-primary text-black font-bold uppercase tracking-widest hover:bg-primary/80 rounded-xl h-12 shadow-[0_0_20px_rgba(0,255,148,0.2)]",
                isCollapsed && "h-12 w-12 p-0 rounded-full"
              )}>
                {isCollapsed ? <Lock className="w-5 h-5" /> : "Login"}
              </Button>
            </Link>
          )}
        </div>
      </aside>
    </>
  );
}
