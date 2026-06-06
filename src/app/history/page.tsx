"use client";

import { Sidebar } from "@/components/layout/Sidebar";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { History, Zap } from "lucide-react";

const mockHistory = [
  { id: 1, query: 'filetype:env "DB_PASSWORD"', target: "example.com", platform: "google", timestamp: "2026-06-03 21:45" },
  { id: 2, query: 'intitle:"index of" "backup"', target: "test-node.io", platform: "google", timestamp: "2026-06-03 21:30" },
  { id: 3, query: 'inurl:"/phpmyadmin/setup/index.php"', target: "dev-server.net", platform: "google", timestamp: "2026-06-03 21:15" },
];

export default function HistoryPage() {
  return (
    <div className="flex h-screen bg-black text-foreground font-ibm relative overflow-hidden">
      {/* Liquid Background */}
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_-20%,rgba(0,255,148,0.1),transparent_50%)] pointer-events-none" />

      <Sidebar />

      <main className="flex-1 flex flex-col min-h-screen relative z-10 overflow-y-auto">
        <header className="h-16 border-b border-white/5 liquid-glass flex items-center px-8 sticky top-0 z-20">
          <div className="flex items-center gap-3">
            <History className="text-primary w-4 h-4 green-glow" />
            <h1 className="text-base font-oxanium font-bold uppercase tracking-widest text-white">
              Operation_<span className="text-primary">Logs</span>
            </h1>
          </div>
        </header>

        <div className="p-8 max-w-7xl mx-auto w-full space-y-10">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-oxanium font-bold uppercase tracking-tight text-white">Recent_Launches</h2>
            <Badge className="bg-primary/10 text-primary border-primary/20 uppercase text-[9px] font-jetbrains green-glow">SESSION_ACTIVE</Badge>
          </div>

          <div className="liquid-glass border-white/5 rounded-2xl overflow-hidden shadow-2xl">
            <Table>
              <TableHeader className="bg-white/5">
                <TableRow className="border-white/5 hover:bg-transparent">
                  <TableHead className="text-primary font-bold uppercase text-[9px] font-jetbrains tracking-widest">Timestamp</TableHead>
                  <TableHead className="text-primary font-bold uppercase text-[9px] font-jetbrains tracking-widest">Signature</TableHead>
                  <TableHead className="text-primary font-bold uppercase text-[9px] font-jetbrains tracking-widest">Target</TableHead>
                  <TableHead className="text-primary font-bold uppercase text-[9px] font-jetbrains tracking-widest">Relay</TableHead>
                  <TableHead className="text-right text-primary font-bold uppercase text-[9px] font-jetbrains tracking-widest">Execute</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockHistory.map((log) => (
                  <TableRow key={log.id} className="border-white/5 hover:bg-primary/5 transition-all">
                    <TableCell className="text-[10px] font-jetbrains text-muted-foreground">{log.timestamp}</TableCell>
                    <TableCell className="font-jetbrains text-[10px] text-white/80">{log.query}</TableCell>
                    <TableCell className="font-bold text-[10px] uppercase text-secondary/80">{log.target}</TableCell>
                    <TableCell>
                      <Badge className="text-[8px] uppercase tracking-tighter bg-white/5 border-white/10 text-white/40">
                        {log.platform}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <button className="text-primary hover:green-glow transition-all">
                        <Zap className="w-4 h-4 inline" />
                      </button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </main>
    </div>
  );
}
