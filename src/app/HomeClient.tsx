"use client";

import NextLink from "next/link";
import { useState, useEffect, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import { 
  Globe, 
  Search, 
  Target, 
  Terminal, 
  LogOut, 
  Shield, 
  Menu,
  ChevronRight,
  LayoutGrid,
  ArrowLeft,
  Filter,
  User as UserIcon
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

import { DorkCard } from "@/components/DorkCard";
import { CategoryCard } from "@/components/CategoryCard";
import { Sidebar } from "@/components/layout/Sidebar";
import { SubmitDork } from "@/components/SubmitDork";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { createClient } from "@/utils/supabase/client";
import { CATEGORY_METADATA, ICON_MAP } from "@/lib/category-metadata";
import { Dork } from "@/lib/mock-data";

// ─── Hero morph constants ────────────────────────────────────────────────────
const MORPH_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#@$%&*!?';
const MORPH_SEQ_1 = ['DORK', 'RECON', 'QUERY',"Kurd","Cyber","Dork"];
const MORPH_SEQ_2 = ['HUB', 'NET', 'LAB','iStan','Security','Ing'];

function getRand() {
  return MORPH_CHARS[Math.floor(Math.random() * MORPH_CHARS.length)];
}

function morphWord(
  el: HTMLElement,
  fromWord: string,
  toWord: string,
  color: string,
  onDone?: () => void
) {
  const DELAY = 60;
  const SCRAMBLE = 3;

  function setEl(text: string, cls: string) {
    el.innerHTML = '';
    for (const ch of text) {
      const s = document.createElement('span');
      s.className = `dh-char ${ch === '_' ? 'morph' : cls}`;
      s.textContent = ch === '_' ? getRand() : ch;
      el.appendChild(s);
    }
  }

  function deleteChars(word: string, pos: number) {
    if (pos < 0) { addChars('', 0); return; }
    setTimeout(() => {
      setEl(word.slice(0, pos) + '_', color);
      deleteChars(word.slice(0, pos), pos - 1);
    }, DELAY);
  }

  function addChars(built: string, pos: number) {
    if (pos > toWord.length) { onDone?.(); return; }
    setTimeout(() => {
      let sc = 0;
      function scrambleStep() {
        setEl(built + '_', color);
        if (sc < SCRAMBLE) { sc++; setTimeout(scrambleStep, DELAY / 2); }
        else {
          const ch = toWord[pos];
          if (!ch) { setEl(toWord, color); onDone?.(); }
          else { const nb = built + ch; setEl(nb, color); addChars(nb, pos + 1); }
        }
      }
      scrambleStep();
    }, DELAY);
  }

  deleteChars(fromWord, fromWord.length - 1);
}

function setWordEl(el: HTMLElement, text: string, color: string) {
  el.innerHTML = '';
  for (const ch of text) {
    const s = document.createElement('span');
    s.className = `dh-char ${color}`;
    s.textContent = ch;
    el.appendChild(s);
  }
}

function countUp(el: HTMLElement, target: number, suffix: string, duration: number) {
  const start = performance.now();
  function frame(now: number) {
    const t = Math.min((now - start) / duration, 1);
    el.textContent = Math.round(t * target).toLocaleString() + suffix;
    if (t < 1) requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
}
// ─────────────────────────────────────────────────────────────────────────────

export interface Platform {
  id: string;
  name: string;
  slug: string;
  is_active: boolean;
  base_url: string;
  icon: string;
}

export interface User {
  id: string;
  email?: string;
}

interface HomeClientProps {
  initialDorks: Dork[];
  initialPlatforms: Platform[];
  initialCategories: { name: string; description: string | null; icon: string | null; platform: string }[];
  initialUser: User | null;
}

export function HomeClient({
  initialDorks,
  initialPlatforms,
  initialCategories,
  initialUser
}: HomeClientProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [targetDomain, setTargetDomain] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [dorks] = useState<Dork[]>(initialDorks);
  const [user, setUser] = useState<User | null>(initialUser);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [platforms] = useState<Platform[]>(initialPlatforms);
  const [dbCategories] = useState<any[]>(initialCategories);
  
  const [view, setView] = useState<'categories' | 'dorks'>('categories');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  
  // Hero refs
  const w1Ref = useRef<HTMLSpanElement>(null);
  const w2Ref = useRef<HTMLSpanElement>(null);
  const s1Ref = useRef<HTMLSpanElement>(null);
  const s2Ref = useRef<HTMLSpanElement>(null);
  const s3Ref = useRef<HTMLSpanElement>(null);
  const seq1 = useRef(0);
  const seq2 = useRef(0);
  const morphTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const router = useRouter();
  const supabase = createClient();

  // Hero morph effect
  useEffect(() => {
    if (w1Ref.current) setWordEl(w1Ref.current, 'DORK', 'white');
    if (w2Ref.current) setWordEl(w2Ref.current, 'HUB', 'green');

    function cycle() {
      const n1 = (seq1.current + 1) % MORPH_SEQ_1.length;
      const n2 = (seq2.current + 1) % MORPH_SEQ_2.length;
      const from1 = MORPH_SEQ_1[seq1.current];
      const to1   = MORPH_SEQ_1[n1];
      const from2 = MORPH_SEQ_2[seq2.current];
      const to2   = MORPH_SEQ_2[n2];
      let done1 = false, done2 = false;
      function tryNext() {
        if (done1 && done2) {
          seq1.current = n1; seq2.current = n2;
          morphTimer.current = setTimeout(cycle, 2200);
        }
      }
      if (w1Ref.current) morphWord(w1Ref.current, from1, to1, 'white', () => { done1 = true; tryNext(); });
      setTimeout(() => {
        if (w2Ref.current) morphWord(w2Ref.current, from2, to2, 'green', () => { done2 = true; tryNext(); });
      }, 300);
    }

    morphTimer.current = setTimeout(cycle, 2000);
    return () => { if (morphTimer.current) clearTimeout(morphTimer.current); };
  }, []);

  // Stats countUp effect
  useEffect(() => {
    setTimeout(() => {
      if (s1Ref.current) countUp(s1Ref.current, dorks.length, '+', 1600);
      if (s2Ref.current) countUp(s2Ref.current, platforms.length, '', 1000);
      if (s3Ref.current) countUp(s3Ref.current, dbCategories.length, '', 1400);
    }, 400);
  }, [dorks.length, platforms.length, dbCategories.length]);

  useEffect(() => {
    async function getSession() {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user as User | null);
    }
    getSession();
  }, [supabase]);

  const categoryCounts = useMemo(() => {
    return dorks.reduce((acc: Record<string, number>, dork) => {
      if (activeTab === "all" || dork.platform === activeTab) {
        acc[dork.category] = (acc[dork.category] || 0) + 1;
      }
      return acc;
    }, {});
  }, [dorks, activeTab]);

  const filteredDorks = dorks.filter((dork) => {
    const matchesSearch =
      dork.query.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (dork.description || "").toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !selectedCategory || dork.category === selectedCategory;
    const matchesTab = activeTab === "all" || dork.platform === activeTab;
    return matchesSearch && matchesCategory && matchesTab;
  });

  const handleSearchChange = (val: string) => {
    setSearchQuery(val);
    if (val.length > 0 && view === 'categories') setView('dorks');
  };

  const handleCategoryClick = (category: string) => {
    setSelectedCategory(category);
    setView('dorks');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackToCategories = () => {
    setSelectedCategory(null);
    setView('categories');
    setSearchQuery("");
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.refresh();
    setUser(null);
  };

  return (
    <div className="flex h-screen bg-background text-foreground font-ibm relative overflow-hidden selection:bg-primary/30 selection:text-primary">
      {/* Liquid Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_-20%,rgba(0,255,148,0.1),transparent_50%)] pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-full h-full bg-[radial-gradient(circle_at_80%_120%,rgba(0,212,255,0.05),transparent_50%)] pointer-events-none" />

      {/* Hero morph styles */}
      <style>{`
        .dh-char { display: inline-block; transition: color 0.1s; }
        .dh-char.white { color: white; }
        .dh-char.green { color: #00ff78; }
        .dh-char.morph {
          color: rgba(0,255,120,0.5);
          animation: dhflicker 0.08s steps(1) infinite;
        }
        @keyframes dhflicker {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
        .dh-cursor {
          display: inline-block;
          width: 3px;
          height: 0.8em;
          background: #00ff78;
          margin-left: 4px;
          vertical-align: middle;
          animation: dhblink 1s step-start infinite;
        }
        @keyframes dhblink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
        .dh-scanline {
          position: absolute;
          inset: 0;
          background: repeating-linear-gradient(
            0deg, transparent, transparent 3px,
            rgba(0,255,120,0.015) 3px, rgba(0,255,120,0.015) 4px
          );
          pointer-events: none;
        }
        .dh-grid {
          position: absolute;
          inset: 0;
          background-image:
            linear-gradient(rgba(0,255,120,0.04) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0,255,120,0.04) 1px, transparent 1px);
          background-size: 40px 40px;
          pointer-events: none;
        }
        .dh-corner {
          position: absolute;
          width: 20px;
          height: 20px;
          border-color: rgba(0,255,120,0.4);
          border-style: solid;
        }
        .dh-corner.tl { top: 12px; left: 12px; border-width: 1.5px 0 0 1.5px; }
        .dh-corner.tr { top: 12px; right: 12px; border-width: 1.5px 1.5px 0 0; }
        .dh-corner.bl { bottom: 12px; left: 12px; border-width: 0 0 1.5px 1.5px; }
        .dh-corner.br { bottom: 12px; right: 12px; border-width: 0 1.5px 1.5px 0; }
        .dh-tag {
          font-size: 11px;
          padding: 4px 10px;
          border: 0.5px solid rgba(0,255,120,0.3);
          border-radius: 4px;
          color: rgba(0,255,120,0.8);
          letter-spacing: 0.08em;
          background: rgba(0,255,120,0.04);
          cursor: default;
          transition: background 0.15s, border-color 0.15s;
          font-family: var(--font-jetbrains, monospace);
          text-transform: uppercase;
        }
        .dh-tag:hover {
          background: rgba(0,255,120,1);
          border-color: rgba(0,255,120,0.6);
        }
      `}</style>

      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      <main className="flex-1 flex flex-col min-h-screen relative z-10 overflow-y-auto">
        {/* Navbar */}
        <header className="h-20 border-b border-white/5 liquid-glass flex items-center justify-between px-6 md:px-10 sticky top-0 z-40">
          <div className="flex items-center gap-6 flex-1 max-w-5xl">
            <Button 
              variant="ghost" 
              size="icon" 
              className="lg:hidden text-primary hover:bg-primary/10 rounded-full transition-all" 
              onClick={() => setIsSidebarOpen(true)}
            >
              <Menu className="w-5 h-5" />
            </Button>

            <div className="flex items-center gap-2 lg:hidden">
              <span className="text-xl font-jetbrains font-bold tracking-tighter">
                DORK<span className="text-primary">HUB</span>
              </span>
            </div>

            <div className="relative flex-1 group hidden sm:block max-w-md">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors z-10" />
              <Input
                placeholder="grep repository..."
                className="pl-12 bg-white/5 border-white/5 focus:border-primary/30 transition-all h-11 font-jetbrains text-sm rounded-xl"        
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
              />
            </div>

            <div className="relative w-full sm:w-64 group">
              <Target className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary group-focus-within:text-secondary transition-colors z-10" />
              <Input
                placeholder="set target"
                className="pl-12 bg-secondary/5 border-white/5 focus:border-secondary/30 transition-all h-11 text-secondary placeholder:text-secondary/30 font-jetbrains text-sm rounded-xl"
                value={targetDomain}
                onChange={(e) => setTargetDomain(e.target.value)}
              />
            </div>
          </div>
        </header>

        {/* ── HERO ────────────────────────────────────────────────────────── */}
        <section
          className="mx-6 md:mx-10 my-8 px-8 md:px-16 pt-12 pb-110 md:pt-20 md:pb-110 relative overflow-hidden rounded-xl border border-primary/15 bg-white/[0.01] liquid-glass shadow-2xl"
        >
          <div className="dh-scanline" />
          <div className="dh-grid" />
          <div className="dh-corner tl" />
          <div className="dh-corner tr" />
          <div className="dh-corner bl" />
          <div className="dh-corner br" />

          <div className="max-w-7xl mx-auto relative z-5">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 border border-primary/20 rounded-full green-glow mb-6">
              <div className="w-2 h-2 bg-primary animate-pulse rounded-full" />
              <span className="text-[10px] font-jetbrains font-bold uppercase tracking-widest text-primary">
                Platform Of Dorks
              </span>
            </div>

            {/* Morphing title — min-height prevents collapse before refs populate */}
            <h1
              className="font-oxanium font-bold tracking-tighter uppercase text-white flex items-baseline gap-[0.1em] mb-6"
              style={{ fontSize: 'clamp(52px, 8vw, 88px)', lineHeight: 0.9, minHeight: '1em' }}
            >
              <span ref={w1Ref}>DORK</span>
              <span ref={w2Ref} style={{ color: '#00ff78' }}>HUB</span>
              <span className="dh-cursor" />
            </h1>

            {/* Subtitle */}
            <p className="max-w-2xl text-muted-foreground text-sm md:text-base uppercase tracking-tight leading-relaxed font-ibm mb-6">
              Best Platform Of Dorks{' '}
              <span className="text-primary">Google, Shodan, Bing, Censys</span>
              <br />
              You Can Add Dork For DORKHUB
            </p>

            {/* Engine tags */}
            <div className="flex gap-2 flex-wrap mb-8">
              {['GOOGLE', 'SHODAN', 'BING', 'CENSYS', 'FOFA', 'ZOOMEYE'].map((t) => (
                <span key={t} className="dh-tag">{t}</span>
              ))}
            </div>

            {/* Stats */}
            <div
              className="flex flex-wrap gap-6 pt-8 mt-6"
              style={{ borderTop: '0.5px solid rgba(0,255,120,0.12)' }}
            >
              {[
                { ref: s1Ref, label: 'Dorks' },
                { ref: s2Ref, label: 'Platforms' },
                { ref: s3Ref, label: 'Categories' },
              ].map(({ ref, label }) => (
                <div 
                  key={label} 
                  className="flex flex-col gap-2 px-5 py-3 bg-white/[0.02] border border-white/[0.04] rounded-2xl min-w-[130px] snappy-transition hover:bg-primary/[0.02] hover:border-primary/20 hover:scale-[1.02] shadow-sm"
                >
                  <span
                    ref={ref}
                    className="font-oxanium font-bold text-primary text-2xl md:text-3xl tracking-tight leading-none"
                  >
                    0
                  </span>
                  <span className="text-[10px] font-jetbrains uppercase tracking-widest text-muted-foreground/60 mt-0.5">
                    {label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>
        <div className="absolute inset-0 pointer-events-none z-0">
          <div className="w-full h-full bg-[radial-gradient(circle_at_50%_-20%,rgba(0,255,148,0.1),transparent_50%)]" />
        </div>
        {/* ── END HERO ─────────────────────────────────────────────────────── */}

        {/* Repository Section */}
        <section id="repository" className="py-16 px-6 md:px-12 max-w-7xl mx-auto w-full space-y-12">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <nav className="flex items-center gap-4 text-[11px] font-bold uppercase tracking-widest">
              <button 
                onClick={handleBackToCategories}
                className={cn(
                  "flex items-center gap-3 snappy-transition px-5 py-2.5 rounded-full border",
                  view === 'categories' 
                    ? 'text-primary border-primary/40 bg-primary/10 green-glow' 
                    : 'text-muted-foreground border-white/5 bg-white/5 hover:text-primary'
                )}
              >
                <LayoutGrid className="w-4 h-4" />
                Categories
              </button>
              
              {view === 'dorks' && (
                <>
                  <ChevronRight className="w-4 h-4 text-white/10" />
                  <span className="text-primary flex items-center gap-3 px-5 py-2.5 rounded-full border border-primary/40 bg-primary/10 green-glow">
                    <Terminal className="w-4 h-4" />
                    {selectedCategory || (searchQuery ? "SEARCH_RESULTS" : "ALL_SIGNATURES")}
                  </span>
                </>
              )}
            </nav>

            <div className="flex items-center gap-6">
              <div className="hidden lg:flex items-center gap-6 text-[14px] font-jetbrains text-muted-foreground uppercase">
                <span className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary/40" />
                 ToTal Dorks<span className="text-primary">{dorks.length} </span> 
                </span>
              
              </div>
              <SubmitDork />
            </div>
          </div>

          <div className="liquid-glass p-4 rounded-2xl border border-white/5 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-2xl">
            <Tabs defaultValue="all" className="w-full sm:w-auto" onValueChange={setActiveTab}>
              <TabsList className="bg-black/50 border border-white/5 h-11 rounded-full p-1">
                <TabsTrigger value="all" className="data-[state=active]:bg-primary data-[state=active]:text-black font-bold text-[10px] h-9 px-6 rounded-full transition-all">ALL</TabsTrigger>
                {platforms.map((p) => (
                  <TabsTrigger 
                    key={p.slug} 
                    value={p.slug} 
                    className="data-[state=active]:bg-primary data-[state=active]:text-black font-bold text-[10px] h-9 px-6 rounded-full uppercase transition-all"
                  >
                    {p.name}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          </div>

          {view === 'categories' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-24">
              {dbCategories
                .filter(cat => activeTab === 'all' || cat.platform === 'all' || cat.platform === activeTab)
                .map((cat) => {
                  const count = categoryCounts[cat.name] || 0;
                  const IconComponent = (cat.icon && ICON_MAP[cat.icon]) || CATEGORY_METADATA[cat.name]?.icon || Terminal;
                  return (
                    <CategoryCard 
                      key={cat.name}
                      name={cat.name}
                      description={cat.description || (CATEGORY_METADATA[cat.name]?.description || "Search signatures for this category.")}
                      icon={IconComponent}
                      count={count}
                      onClick={() => handleCategoryClick(cat.name)}
                    />
                  );
                })}
              <div 
                className="liquid-glass border-dashed border-white/10 rounded-2xl flex flex-col items-center justify-center h-full min-h-[220px] hover:border-primary/40 snappy-transition cursor-pointer group shadow-2xl"
                onClick={() => setView('dorks')}
              >
                <div className="w-12 h-12 rounded-full border border-white/5 flex items-center justify-center mb-4 group-hover:border-primary/30 group-hover:bg-primary/5 transition-all">
                  <Filter className="w-6 h-6 text-muted-foreground/30 group-hover:text-primary transition-colors" />
                </div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/40 group-hover:text-primary transition-colors">Browse_All</p>
              </div>
            </div>
          ) : (
            <div className="space-y-10">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-32">
                {filteredDorks.length > 0 ? (
                  filteredDorks.map((dork) => (
                    <DorkCard key={dork.id} dork={dork} targetDomain={targetDomain} platforms={platforms} />
                  ))
                ) : (
                  <div className="col-span-full h-96 liquid-glass flex flex-col items-center justify-center border border-dashed border-white/10 rounded-3xl shadow-2xl">
                    <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mb-6">
                      <Search className="w-10 h-10 text-muted-foreground/10" />
                    </div>
                    <p className="text-muted-foreground/30 font-bold uppercase tracking-widest text-sm">Matrix_Search_Empty</p>
                    <Button 
                      variant="link" 
                      onClick={handleBackToCategories}
                      className="mt-4 text-primary uppercase text-[10px] font-bold tracking-widest"
                    >
                      [ RESET_MATRIX_CONNECTION ]
                    </Button>
                  </div>
                )}
              </div>
            </div>
          )}
        </section>

        {/* Footer */}
        <footer className="mt-auto border-t border-white/5 liquid-glass py-12 px-6 md:px-12">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-10">
            <div className="flex flex-col items-center md:items-start gap-4">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-primary green-glow" />
                <span className="text-base font-jetbrains font-bold tracking-tighter text-white">DORK<span className="text-primary">HUB</span></span>
              </div>
            </div>
            
            <div className="flex gap-12 text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
              <NextLink href="/docs" className="hover:text-primary transition-colors">DOCS</NextLink>
              <NextLink href="/settings" className="hover:text-primary transition-colors">Settings</NextLink>
              <NextLink href="/submit" className="hover:text-primary transition-colors">submit</NextLink>
            </div>
            
            <div className="flex items-center gap-8 text-[12px] text-dim-foreground font-jetbrains uppercase tracking-[0.3em]">
               <div className="flex items-center gap-3">
                 <span className="text-primary/40 italic">POWERED By</span>
                  <NextLink href="https://zankodev.xyz" className="hover:text-primary transition-colors"><span className="text-white/60 font-bold">ZANKO LEGEND</span></NextLink>
                 
               </div>
               <div className="w-[1px] h-4 bg-white/5" />
               <div className="flex items-center gap-3">
                 <span className="text-secondary/40 italic">Contact</span>
             <NextLink href="https://zankodev.xyz" className="hover:text-primary transition-colors"><span className="text-white/60 font-bold">ZANKODEV.XYZ</span></NextLink>
               </div>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}
