import React, { useState } from "react";
import { ArrowLeft, RefreshCw, ShieldAlert, ShieldCheck, Info } from "lucide-react";
import { motion } from "motion/react";
import Sparkline from "./Sparkline";

interface Asteroid {
  id: string;
  name: string;
  absolute_magnitude_h: number;
  estimated_diameter: {
    kilometers: {
      estimated_diameter_min: number;
      estimated_diameter_max: number;
    };
  };
  is_potentially_hazardous_asteroid: boolean;
  close_approach_data: Array<{
    relative_velocity: {
      kilometers_per_hour: string;
    };
    miss_distance: {
      kilometers: string;
    };
    close_approach_date: string;
    orbiting_body: string;
  }>;
}

interface FullFeedProps {
  asteroids: Asteroid[];
  isLoading: boolean;
  onBack: () => void;
  onSelect: (id: string) => void;
  countdown: number;
  updateTime: string;
}

export default function FullFeed({ asteroids, isLoading, onBack, onSelect, countdown, updateTime }: FullFeedProps) {
  const [selectingId, setSelectingId] = useState<string | null>(null);

  const fmtSz = (mn: number, mx: number) => {
    const a = (mn + mx) / 2;
    return a >= 1 ? `${a.toFixed(1)} km` : `${Math.round(a * 1000)} m`;
  };

  const genTrend = (id: string, base: number, count = 8) => {
    const seed = parseInt(id.slice(-4)) || 0;
    return Array.from({ length: count }, (_, i) => {
      const noise = Math.sin(seed + i) * (base * 0.05);
      return base + noise;
    });
  };

  const handleSelect = (id: string) => {
    if (selectingId) return;
    setSelectingId(id);
    setTimeout(() => {
      onSelect(id);
    }, 200);
  };

  return (
    <div className="min-h-screen bg-[#03030a] text-white pt-32 pb-20 px-6">
      <div className="container mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <button 
              onClick={onBack}
              className="group flex items-center gap-2 text-white/40 hover:text-[#00cfff] transition-colors mb-6 font-mono text-xs uppercase tracking-widest"
            >
              <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
              Back to Overview
            </button>
            <h1 className="text-5xl md:text-7xl font-bold tracking-tighter">Live Intelligence <span className="text-[#00cfff]">Feed</span></h1>
            <p className="text-white/40 mt-4 max-w-xl font-medium">
              Real-time surveillance of {asteroids.length} objects currently within Earth's gravitational proximity over the last 7 days. Data synchronized with NASA JPL Horizons.
            </p>
          </div>
          
          <div className="flex items-center gap-4 bg-white/5 p-4 rounded-2xl border border-white/10">
            <div className="flex flex-col items-end">
              <span className="text-[10px] uppercase tracking-widest text-white/30">Next Sync</span>
              <span className="font-mono text-[#00cfff]">{countdown}s</span>
            </div>
            <div className="w-px h-8 bg-white/10"></div>
            <div className="flex flex-col">
              <span className="text-[10px] uppercase tracking-widest text-white/30">Last Update</span>
              <span className="font-mono text-white/60">{updateTime}</span>
            </div>
            <RefreshCw className={`w-5 h-5 text-[#00cfff] ${isLoading ? 'animate-spin' : ''}`} />
          </div>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-32">
            <div className="w-12 h-12 border-2 border-[#00cfff]/20 border-t-[#00cfff] rounded-full animate-spin mb-4"></div>
            <p className="font-mono text-xs tracking-widest text-white/40 uppercase">Synchronizing with NASA...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {asteroids.map((ast) => {
              if (!ast) return null;
              const spd = parseFloat(ast.close_approach_data?.[0]?.relative_velocity?.kilometers_per_hour || "0");
              const dist = parseFloat(ast.close_approach_data?.[0]?.miss_distance?.kilometers || "0");
              const mn = ast.estimated_diameter?.kilometers?.estimated_diameter_min || 0;
              const mx = ast.estimated_diameter?.kilometers?.estimated_diameter_max || 0;
              const haz = ast.is_potentially_hazardous_asteroid;
              const name = (ast.name || "Unknown Object").replace(/[()]/g, '').trim();
              
              return (
                <motion.div 
                  key={ast.id}
                  onClick={() => handleSelect(ast.id)}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  animate={selectingId === ast.id ? { scale: 0.94, opacity: 0.6 } : {}}
                  whileHover={selectingId ? {} : { 
                    scale: 1.03,
                    borderColor: haz ? 'rgba(239, 68, 68, 0.5)' : 'rgba(0, 207, 255, 0.5)',
                    backgroundColor: haz ? 'rgba(239, 68, 68, 0.08)' : 'rgba(255, 255, 255, 0.08)'
                  }}
                  whileTap={selectingId ? {} : { scale: 0.98 }}
                  transition={{ duration: 0.2, ease: "easeInOut" }}
                  className={`group relative p-8 rounded-3xl border cursor-pointer ${
                    haz 
                    ? 'bg-red-500/5 border-red-500/20' 
                    : 'bg-white/5 border-white/10'
                  }`}
                >
                  <div className="flex justify-between items-start mb-6">
                    <div className={`px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest flex items-center gap-1.5 ${
                      haz ? 'bg-red-500/20 text-red-500' : 'bg-[#00ffa3]/10 text-[#00ffa3]'
                    }`}>
                      {haz ? <ShieldAlert className="w-3 h-3" /> : <ShieldCheck className="w-3 h-3" />}
                      {haz ? 'Hazardous' : 'Safe'}
                    </div>
                    <Info className="w-4 h-4 text-white/20 group-hover:text-[#00cfff] transition-colors" />
                  </div>

                  <h3 className="text-2xl font-bold mb-6 tracking-tight group-hover:text-[#00cfff] transition-colors">{name}</h3>

                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <div className="flex flex-col">
                        <span className="text-[10px] uppercase tracking-widest text-white/30">Velocity</span>
                        <div className="mt-1">
                          <Sparkline data={genTrend(ast.id, spd)} color={haz ? "#ef4444" : "#00cfff"} />
                        </div>
                      </div>
                      <span className="text-sm font-mono">{Math.round(spd).toLocaleString()} km/h</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <div className="flex flex-col">
                        <span className="text-[10px] uppercase tracking-widest text-white/30">Miss Distance</span>
                        <div className="mt-1">
                          <Sparkline data={genTrend(ast.id + "dist", dist)} color="#ffffff44" />
                        </div>
                      </div>
                      <span className="text-sm font-mono">
                        {dist >= 1e6 
                          ? `${(dist / 1e6).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}M km` 
                          : `${Math.round(dist).toLocaleString()} km`}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-4 pt-2">
                      <div className="flex flex-col">
                        <span className="text-[10px] uppercase tracking-widest text-white/30">Est. Size</span>
                        <span className="text-sm font-mono">{fmtSz(mn, mx)}</span>
                      </div>
                      <div className="flex flex-col text-right">
                        <span className="text-[10px] uppercase tracking-widest text-white/30">Magnitude</span>
                        <span className="text-sm font-mono">{ast.absolute_magnitude_h.toFixed(1)} H</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center pt-2 border-t border-white/5">
                      <span className="text-[10px] uppercase tracking-widest text-white/30">Orbiting Body</span>
                      <span className="text-sm font-mono text-[#00cfff]">{ast.close_approach_data?.[0]?.orbiting_body || "Earth"}</span>
                    </div>
                  </div>

                  <div className="mt-8 pt-6 border-t border-white/5 flex justify-between items-center">
                    <span className="text-[10px] uppercase tracking-widest text-white/20">Magnitude H</span>
                    <span className="text-xs font-bold">{ast.absolute_magnitude_h.toFixed(1)}</span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
