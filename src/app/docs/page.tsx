"use client";

import { Sidebar } from "@/components/layout/Sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Book, ShieldAlert, Terminal, Zap } from "lucide-react";

export default function DocsPage() {
  return (
    <div className="flex h-screen bg-black text-foreground font-ibm relative overflow-hidden">
      {/* Liquid Background */}
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_-20%,rgba(0,255,148,0.1),transparent_50%)] pointer-events-none" />

      <Sidebar />

      <main className="flex-1 flex flex-col min-h-screen relative z-10 overflow-y-auto">
        <header className="h-16 border-b border-white/5 liquid-glass flex items-center px-8 sticky top-0 z-20">
          <div className="flex items-center gap-3">
            <Book className="text-primary w-4 h-4 green-glow" />
            <h1 className="text-base font-oxanium font-bold uppercase tracking-widest text-white">
              Knowledge_<span className="text-primary">Base</span>
            </h1>
          </div>
        </header>

        <div className="p-8 max-w-4xl mx-auto w-full space-y-16 pb-32">
          <section className="space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/5 border border-primary/20 rounded-full text-primary text-[10px] font-bold uppercase tracking-widest">
              <ShieldAlert className="w-3 h-3" />
              Information_Protocol
            </div>
            <h2 className="text-4xl font-oxanium font-bold uppercase tracking-tight text-white leading-tight">Introduction_To_Matrix_Dorking</h2>
            <p className="text-muted-foreground text-sm leading-relaxed uppercase tracking-tight font-ibm max-w-2xl">
              Precision search methodology utilizing advanced operators to expose structural vulnerabilities and sensitive data leakage within network architectures.
            </p>
          </section>

          <section className="grid md:grid-cols-2 gap-8">
            <Card className="liquid-glass border-white/10 rounded-2xl p-6 shadow-2xl">
              <CardHeader className="p-0 mb-6">
                <CardTitle className="text-xs font-oxanium font-bold uppercase tracking-[0.3em] text-primary flex items-center gap-3">
                  <Terminal className="w-4 h-4 green-glow" />
                  Primary_Operators
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0 space-y-4 text-[11px] font-jetbrains">
                <div className="flex justify-between border-b border-white/5 pb-2">
                  <code className="text-primary">site:</code>
                  <span className="text-white/40">DOMAIN_CONSTRAINT</span>
                </div>
                <div className="flex justify-between border-b border-white/5 pb-2">
                  <code className="text-primary">filetype:</code>
                  <span className="text-white/40">EXTENSION_FILTER</span>
                </div>
                <div className="flex justify-between border-b border-white/5 pb-2">
                  <code className="text-primary">intitle:</code>
                  <span className="text-white/40">HEADER_MATCH</span>
                </div>
                <div className="flex justify-between border-b border-white/5 pb-2">
                  <code className="text-primary">inurl:</code>
                  <span className="text-white/40">STRING_RECON</span>
                </div>
              </CardContent>
            </Card>

            <Card className="liquid-glass border-white/10 rounded-2xl p-6 shadow-2xl">
              <CardHeader className="p-0 mb-6">
                <CardTitle className="text-xs font-oxanium font-bold uppercase tracking-[0.3em] text-secondary flex items-center gap-3">
                  <Zap className="w-4 h-4" />
                  Advanced_Heuristics
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0 space-y-6 text-[11px] font-jetbrains">
                <p className="text-white/40 uppercase tracking-widest">Stream_Combinations:</p>
                <code className="block bg-black/60 p-4 rounded-xl text-primary border border-white/5 green-glow">
                  site:target.net filetype:log &quot;CRITICAL&quot;
                </code>
                <p className="text-white/40 uppercase tracking-widest">Identity_Match:</p>
                <code className="block bg-black/60 p-4 rounded-xl text-primary border border-white/5 green-glow">
                  &quot;login_portal&quot; &quot;root_access&quot;
                </code>
              </CardContent>
            </Card>
          </section>

          <section className="p-10 rounded-3xl liquid-glass border-error/20 bg-error/5 space-y-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-error/5 blur-3xl rounded-full" />
            <div className="flex items-center gap-4 text-error">
              <ShieldAlert className="w-6 h-6" />
              <h3 className="text-2xl font-oxanium font-bold uppercase tracking-widest">Ethical_Compliance</h3>
            </div>
            <div className="grid sm:grid-cols-2 gap-6">
              {[
                "ZERO_UNAUTHORIZED_PROBING",
                "MANDATORY_SCOPE_VALIDATION",
                "RESPONSIBLE_DISCLOSURE_ONLY",
                "OSINT_PROTOCOL_ADHERENCE"
              ].map((directive, idx) => (
                <div key={idx} className="flex items-center gap-3 text-[10px] font-jetbrains font-bold text-white/50 uppercase tracking-widest">
                  <div className="w-1.5 h-1.5 bg-error rounded-full" />
                  {directive}
                </div>
              ))}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
