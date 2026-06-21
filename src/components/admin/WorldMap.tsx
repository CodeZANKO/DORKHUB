"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { Globe } from "lucide-react";

interface UserProfile {
  id: string;
  username: string;
  role: 'admin' | 'user';
  reputation: number;
  country_code: string | null;
  created_at: string;
}

interface VisitorStat {
  country_code: string;
  visitor_count: number;
}

interface WorldMapProps {
  users: UserProfile[];
  visitorStats?: VisitorStat[];
}

interface MapPath {
  id: string;
  d: string;
  name: string;
}

export function WorldMap({ users, visitorStats }: WorldMapProps) {
  const [mapPaths, setMapPaths] = useState<MapPath[]>([]);
  const [viewBox, setViewBox] = useState("0 0 1008 651");
  const [loading, setLoading] = useState(true);
  const [hovered, setHovered] = useState<{ 
    name: string; 
    operatorsCount: number; 
    visitorsCount: number; 
    x: number; 
    y: number; 
  } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Compute operator count per country code (lowercase)
  const countryStats = useMemo(() => {
    const stats: Record<string, number> = {};
    users.forEach((u) => {
      if (u.country_code) {
        const code = u.country_code.trim().toLowerCase();
        stats[code] = (stats[code] || 0) + 1;
      }
    });
    return stats;
  }, [users]);

  // Compute visitor count per country code (lowercase)
  const visitorCountryStats = useMemo(() => {
    const stats: Record<string, number> = {};
    if (visitorStats) {
      visitorStats.forEach((v) => {
        if (v.country_code) {
          const code = v.country_code.trim().toLowerCase();
          stats[code] = (stats[code] || 0) + Number(v.visitor_count);
        }
      });
    }
    return stats;
  }, [visitorStats]);

  // Load and parse simplified SVG world map
  useEffect(() => {
    async function loadMap() {
      try {
        const res = await fetch("https://cdn.jsdelivr.net/gh/flekschas/simple-world-map/world-map.min.svg");
        if (!res.ok) throw new Error("Failed to load map asset");
        const svgText = await res.text();

        const parser = new DOMParser();
        const doc = parser.parseFromString(svgText, "image/svg+xml");
        const paths = doc.querySelectorAll("path");
        const parsedPaths: MapPath[] = [];

        paths.forEach((p) => {
          const id = p.getAttribute("id") || "";
          const d = p.getAttribute("d") || "";
          const name = p.getAttribute("name") || id.toUpperCase();
          if (id && d) {
            parsedPaths.push({ id, d, name });
          }
        });

        const svgEl = doc.querySelector("svg");
        if (svgEl) {
          const vb = svgEl.getAttribute("viewBox");
          if (vb) setViewBox(vb);
        }

        setMapPaths(parsedPaths);
      } catch (err) {
        console.error("Failed to parse map data:", err);
      } finally {
        setLoading(false);
      }
    }
    loadMap();
  }, []);

  const handleMouseMove = (e: React.MouseEvent, name: string, operatorsCount: number, visitorsCount: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setHovered({ name, operatorsCount, visitorsCount, x, y });
  };

  const handleMouseLeave = () => {
    setHovered(null);
  };

  // Find country with most operators and visitors for telemetry display
  const topCountry = useMemo(() => {
    let topOps = { name: "N/A", count: 0 };
    let topVis = { name: "N/A", count: 0 };

    Object.entries(countryStats).forEach(([code, count]) => {
      if (count > topOps.count) {
        const path = mapPaths.find(p => p.id.toLowerCase() === code);
        if (path) {
          topOps = { name: path.name, count };
        }
      }
    });

    Object.entries(visitorCountryStats).forEach(([code, count]) => {
      if (count > topVis.count) {
        const path = mapPaths.find(p => p.id.toLowerCase() === code);
        if (path) {
          topVis = { name: path.name, count };
        }
      }
    });

    return { topOps, topVis };
  }, [countryStats, visitorCountryStats, mapPaths]);

  return (
    <div className="liquid-glass border-white/5 rounded-3xl p-6 relative overflow-hidden group shadow-2xl transition-all hover:border-primary/20">
      <div className="h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-30 absolute top-0 left-0 w-full" />
      
      <header className="flex items-center justify-between mb-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-primary green-glow">
            <Globe className="w-4 h-4" />
            <span className="text-[9px] font-oxanium font-bold uppercase tracking-[0.3em]">Global_Operator_Grid</span>
          </div>
          <h2 className="text-xl font-oxanium font-bold uppercase tracking-widest text-white">Live_Deployment_Map</h2>
        </div>
        {!loading && (
          <div className="text-right font-mono text-[9px] text-muted-foreground uppercase tracking-widest hidden sm:flex flex-col gap-0.5">
            <div>Top Operator Node: <span className="text-blue-400 font-bold">{topCountry.topOps.name}</span> ({topCountry.topOps.count} ops)</div>
            <div>Top Visitor Node: <span className="text-emerald-400 font-bold">{topCountry.topVis.name}</span> ({topCountry.topVis.count} visits)</div>
          </div>
        )}
      </header>

      <div ref={containerRef} className="relative w-full aspect-[1.55] bg-black/40 rounded-2xl border border-white/5 overflow-hidden flex items-center justify-center">
        {loading ? (
          <div className="flex flex-col items-center gap-2 text-xs uppercase tracking-widest text-muted-foreground animate-pulse font-mono">
            <Globe className="w-8 h-8 animate-spin text-primary/60" />
            <span>Establishing Grid Link...</span>
          </div>
        ) : (
          <>
            <svg 
              viewBox={viewBox} 
              className="w-full h-full select-none"
              style={{ strokeLinejoin: "round" }}
            >
              {mapPaths.map((path) => {
                const code = path.id.toLowerCase();
                const operatorsCount = countryStats[code] || 0;
                const visitorsCount = visitorCountryStats[code] || 0;
                const isHovered = hovered?.name === path.name;
                const totalActivity = operatorsCount + visitorsCount;
                const hasActivity = totalActivity > 0;

                // Cyberpunk styled fills & strokes
                let fill = "rgba(255, 255, 255, 0.03)";
                let stroke = "rgba(255, 255, 255, 0.08)";
                let strokeWidth = "0.6";

                if (hasActivity) {
                  // Dark green transparent for active countries, brighter for more activity
                  const opacity = Math.min(0.15 + (totalActivity * 0.03), 0.6);
                  fill = `rgba(0, 255, 148, ${opacity})`;
                  stroke = "rgba(0, 255, 148, 0.4)";
                  strokeWidth = "0.8";
                }

                if (isHovered) {
                  fill = "rgba(0, 255, 148, 0.65)";
                  stroke = "#00FF94";
                  strokeWidth = "1.5";
                }

                return (
                  <path
                    key={path.id}
                    d={path.d}
                    fill={fill}
                    stroke={stroke}
                    strokeWidth={strokeWidth}
                    className="transition-all duration-150 cursor-pointer"
                    onMouseMove={(e) => handleMouseMove(e, path.name, operatorsCount, visitorsCount)}
                    onMouseLeave={handleMouseLeave}
                  />
                );
              })}
            </svg>

            {/* Custom Tooltip */}
            {hovered && (
              <div 
                className="absolute pointer-events-none bg-black/95 border border-primary/30 px-3 py-2 rounded-xl text-xs font-mono shadow-[0_0_15px_rgba(0,255,148,0.2)] z-50 transition-all duration-75 flex flex-col gap-1 min-w-[120px]"
                style={{ 
                  left: `${hovered.x + 12}px`, 
                  top: `${hovered.y + 12}px`,
                  transform: 'translate(0, 0)'
                }}
              >
                <span className="text-white font-bold tracking-tight border-b border-white/10 pb-1 mb-0.5">{hovered.name}</span>
                <div className="flex flex-col gap-0.5">
                  <span className="text-blue-400 text-[9px] uppercase font-bold tracking-wider flex justify-between gap-4">
                    <span>Operators:</span>
                    <span className="text-white font-bold">{hovered.operatorsCount}</span>
                  </span>
                  <span className="text-emerald-400 text-[9px] uppercase font-bold tracking-wider flex justify-between gap-4">
                    <span>Visitors:</span>
                    <span className="text-white font-bold">{hovered.visitorsCount}</span>
                  </span>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
