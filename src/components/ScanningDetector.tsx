import React, { useEffect, useRef } from "react";
import { ArrowLeft, ShieldAlert, ShieldCheck, RefreshCw, Activity } from "lucide-react";
import { motion } from "motion/react";

interface ScanningDetectorProps {
  onBack: () => void;
  asteroids: any[];
}

export default function ScanningDetector({ onBack, asteroids }: ScanningDetectorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [scanTarget, setScanTarget] = React.useState<{ name: string, haz: boolean } | null>(null);
  const scanTargetRef = useRef<{ name: string, haz: boolean } | null>(null);
  const lastScanTimeRef = useRef<number>(0);
  const lockDuration = 4000; // 4 seconds lock-on for better readability

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let rocks: any[] = [];
    let fieldT = 0;

    const drawRock = (x: number, y: number, r: number, a: number, pts: number) => {
      ctx.save(); ctx.translate(x, y); ctx.rotate(a); ctx.beginPath();
      for (let i = 0; i < pts; i++) {
        const ang = (i / pts) * Math.PI * 2;
        const rr = r * (0.65 + 0.5 * (((i * 7 + 3) % 5) / 5));
        i === 0 ? ctx.moveTo(Math.cos(ang) * rr, Math.sin(ang) * rr) : ctx.lineTo(Math.cos(ang) * rr, Math.sin(ang) * rr);
      }
      ctx.closePath(); ctx.restore();
    };

    const init = () => {
      const dpr = window.devicePixelRatio || 1;
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      rocks = Array.from({ length: 200 }, () => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.8,
        vy: (Math.random() - 0.5) * 0.4,
        r: Math.random() * 6 + 1,
        o: Math.random() * 0.8 + 0.2,
        haz: Math.random() > 0.85,
        spin: Math.random() * Math.PI * 2,
        spinS: (Math.random() - 0.5) * 0.03,
        depth: Math.random() * 0.8 + 0.2,
        pts: 6 + Math.floor(Math.random() * 5),
        id: Math.random().toString(36).substr(2, 9)
      }));
    };

    const draw = () => {
      fieldT += 0.01;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Background
      const bg = ctx.createLinearGradient(0, 0, 0, canvas.height);
      bg.addColorStop(0, '#010108'); bg.addColorStop(0.5, '#02020c'); bg.addColorStop(1, '#010105');
      ctx.fillStyle = bg; ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Nebula Glow
      const ng = ctx.createRadialGradient(canvas.width * 0.5, canvas.height * 0.5, 0, canvas.width * 0.5, canvas.height * 0.5, canvas.width * 0.7);
      ng.addColorStop(0, 'rgba(0,207,255,0.08)'); ng.addColorStop(0.6, 'rgba(26,50,180,0.04)'); ng.addColorStop(1, 'transparent');
      ctx.fillStyle = ng; ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Scanning Radar Line
      const scanY = (Math.sin(fieldT * 0.5) * 0.5 + 0.5) * canvas.height;
      const scanG = ctx.createLinearGradient(0, scanY - 100, 0, scanY + 100);
      scanG.addColorStop(0, 'transparent');
      scanG.addColorStop(0.5, 'rgba(0, 207, 255, 0.15)');
      scanG.addColorStop(1, 'transparent');
      ctx.fillStyle = scanG;
      ctx.fillRect(0, scanY - 100, canvas.width, 200);
      
      ctx.beginPath();
      ctx.moveTo(0, scanY);
      ctx.lineTo(canvas.width, scanY);
      ctx.strokeStyle = 'rgba(0, 207, 255, 0.4)';
      ctx.lineWidth = 1;
      ctx.stroke();

      // Rotating Radar Sweep
      ctx.save();
      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.rotate(fieldT * 0.5);
      const radarG = ctx.createConicGradient(0, 0, 0);
      radarG.addColorStop(0, 'rgba(0, 207, 255, 0.2)');
      radarG.addColorStop(0.1, 'transparent');
      ctx.fillStyle = radarG;
      ctx.beginPath();
      ctx.arc(0, 0, Math.max(canvas.width, canvas.height), 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      const dpr = window.devicePixelRatio || 1;
      let closestRock: any = null;
      let minDistance = 50;

      rocks.forEach(r => {
        r.x += r.vx * r.depth; r.y += r.vy * r.depth; r.spin += r.spinS;
        if (r.x < -30) r.x = canvas.width + 30; if (r.x > canvas.width + 30) r.x = -30;
        if (r.y < -30) r.y = canvas.height + 30; if (r.y > canvas.height + 30) r.y = -30;
        
        const fr = r.r * r.depth * dpr;
        drawRock(r.x, r.y, fr, r.spin, r.pts);
        
        // Highlight if near scan line
        const distToScan = Math.abs(r.y - scanY);
        const highlight = distToScan < 100 ? (1 - distToScan / 100) : 0;

        if (distToScan < minDistance) {
          minDistance = distToScan;
          closestRock = r;
        }

        if (r.haz) {
          ctx.fillStyle = `rgba(255,60,60,${(r.o + highlight * 0.5) * r.depth})`;
          ctx.strokeStyle = `rgba(255,100,60,${(r.o * 0.4 + highlight) * r.depth})`;
          if (highlight > 0.8) {
             ctx.shadowBlur = 15;
             ctx.shadowColor = 'rgba(255,60,60,0.8)';
          }
        } else {
          ctx.fillStyle = `rgba(155,155,170,${(r.o * 0.8 + highlight * 0.3) * r.depth})`;
          ctx.strokeStyle = `rgba(200,200,220,${(r.o * 0.3 + highlight * 0.5) * r.depth})`;
          if (highlight > 0.8) {
            ctx.shadowBlur = 10;
            ctx.shadowColor = 'rgba(0,207,255,0.5)';
          }
        }
        
        ctx.lineWidth = 0.5; ctx.fill(); ctx.stroke();
        ctx.shadowBlur = 0;
      });

      // Glitch Effect for Critical Threats
      const hasCritical = asteroids.filter(a => a.is_potentially_hazardous_asteroid).some(a => {
        const velocity = parseFloat(a.close_approach_data[0].relative_velocity.kilometers_per_hour);
        const diameter = a.estimated_diameter.kilometers.estimated_diameter_max;
        return (velocity / 100000 * 40 + diameter / 1 * 40 + 20) > 75;
      });

      if (hasCritical && Math.random() > 0.97) {
        ctx.fillStyle = 'rgba(255, 45, 45, 0.05)';
        ctx.fillRect(0, Math.random() * canvas.height, canvas.width, Math.random() * 10);
      }

      const now = Date.now();
      if (closestRock && asteroids.length > 0) {
        // Only update if we don't have a target or the lock has expired
        if (!scanTargetRef.current || now - lastScanTimeRef.current > lockDuration) {
          const hazOnly = asteroids.filter(a => a.is_potentially_hazardous_asteroid);
          const pool = closestRock.haz && hazOnly.length > 0 ? hazOnly : asteroids;
          
          if (pool.length > 0) {
            const index = Math.floor((closestRock.x + closestRock.y) % pool.length);
            const target = pool[index];
            
            if (target) {
              const newTarget = { 
                name: target.name.replace(/[()]/g, ''), 
                haz: target.is_potentially_hazardous_asteroid 
              };
              setScanTarget(newTarget);
              scanTargetRef.current = newTarget;
              lastScanTimeRef.current = now;
            }
          }
        }
      } else if (now - lastScanTimeRef.current > lockDuration) {
        // Only clear if the lock has expired
        if (scanTargetRef.current) {
          setScanTarget(null);
          scanTargetRef.current = null;
        }
      }

      requestAnimationFrame(draw);
    };

    init();
    const animId = requestAnimationFrame(draw);
    window.addEventListener('resize', init);
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', init);
    };
  }, []);

  return (
    <div className="fixed inset-0 z-[1000] bg-[#010108] text-white overflow-hidden flex flex-col">
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
      
      {/* UI Overlay */}
      <div className="relative z-10 p-8 flex flex-col h-full pointer-events-none">
        <div className="flex justify-between items-start">
          <motion.button 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            onClick={onBack}
            className="pointer-events-auto group flex items-center gap-3 px-6 py-3 bg-white/5 backdrop-blur-xl border border-white/10 rounded-full hover:bg-[#00cfff] hover:text-black transition-all"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-mono text-xs uppercase tracking-widest font-bold">Abort Mission</span>
          </motion.button>

          <div className="text-right">
            <div className="flex items-center gap-3 justify-end mb-2">
              <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              <span className="font-mono text-xs uppercase tracking-widest text-red-500 font-bold">Live Detection Active</span>
            </div>
            <p className="font-mono text-[10px] text-white/40 uppercase tracking-tighter">Deep Field Scanning Protocol 09-X</p>
          </div>
        </div>

        {/* Current Scan Target */}
        {scanTarget && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            key={scanTarget.name}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
          >
            <div className="flex flex-col items-center gap-2">
              <div className={`w-48 h-[1px] bg-gradient-to-r from-transparent ${scanTarget.haz ? 'via-red-500' : 'via-[#00cfff]'} to-transparent`} />
              <div className={`px-4 py-1 ${scanTarget.haz ? 'bg-red-500/10 border-red-500/30' : 'bg-[#00cfff]/10 border-[#00cfff]/30'} backdrop-blur-md border rounded-full`}>
                <p className={`font-mono text-[10px] ${scanTarget.haz ? 'text-red-500' : 'text-[#00cfff]'} uppercase tracking-[0.3em] font-bold`}>
                  {scanTarget.haz ? 'WARNING: ' : 'Scanning: '}{scanTarget.name}
                </p>
              </div>
              <div className={`w-48 h-[1px] bg-gradient-to-r from-transparent ${scanTarget.haz ? 'via-red-500' : 'via-[#00cfff]'} to-transparent`} />
            </div>
          </motion.div>
        )}

        {/* Threat Intelligence Log */}
        <div className="flex-1 flex justify-end items-center py-12">
          <motion.div 
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            className="w-80 h-[400px] bg-black/40 backdrop-blur-2xl border border-red-500/20 rounded-3xl p-6 flex flex-col pointer-events-auto"
          >
            <div className="flex items-center gap-3 mb-6 border-b border-red-500/10 pb-4">
              <ShieldAlert className="w-5 h-5 text-red-500" />
              <div>
                <h3 className="text-sm font-bold uppercase tracking-tight text-red-500">Threat Intelligence Log</h3>
                <p className="text-[9px] font-mono text-white/30 uppercase tracking-widest">Priority Alpha Intercepts</p>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
              {asteroids.filter(a => a.is_potentially_hazardous_asteroid).length > 0 ? (
                asteroids.filter(a => a.is_potentially_hazardous_asteroid).map((ast, i) => {
                  const velocity = parseFloat(ast.close_approach_data[0].relative_velocity.kilometers_per_hour);
                  const diameter = ast.estimated_diameter.kilometers.estimated_diameter_max;
                  const missDistKm = parseFloat(ast.close_approach_data[0].miss_distance.kilometers);
                  const missDistLD = parseFloat(ast.close_approach_data[0].miss_distance.lunar);
                  
                  // Calculate a simple risk score (0-100)
                  // Higher velocity and larger diameter = higher risk
                  // Closer distance = higher risk
                  const vScore = Math.min(velocity / 100000, 1) * 40;
                  const dScore = Math.min(diameter / 1, 1) * 40;
                  const distScore = Math.max(0, (1 - missDistKm / 10000000)) * 20;
                  const riskScore = Math.round(vScore + dScore + distScore);
                  
                  const isCritical = riskScore > 75;
                  const magnitude = ast.absolute_magnitude_h;
                  const orbitClass = ast.orbital_data?.orbit_class?.orbit_class_type || "N/A";

                  return (
                    <div key={ast.id} className="p-4 bg-red-500/5 border border-red-500/10 rounded-xl hover:bg-red-500/10 transition-colors group">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex flex-col">
                          <span className="text-xs font-bold tracking-tight group-hover:text-red-400 transition-colors">{ast.name.replace(/[()]/g, '')}</span>
                          <span className="text-[8px] font-mono text-white/40 uppercase">ID: {ast.id} | {orbitClass}</span>
                        </div>
                        <div className="flex flex-col items-end">
                          <span className={`text-[8px] font-mono px-1.5 py-0.5 rounded uppercase ${isCritical ? 'bg-red-500 text-white animate-pulse' : 'bg-red-500/20 text-red-500'}`}>
                            {isCritical ? 'Level IV - Critical' : 'Level III - High'}
                          </span>
                          <span className="text-[9px] font-mono text-white/60 mt-1">Risk: {riskScore}%</span>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-x-4 gap-y-3">
                        <div>
                          <p className="text-[8px] uppercase tracking-widest text-white/20">Velocity</p>
                          <p className="text-[10px] font-mono">{Math.round(velocity).toLocaleString()} <span className="text-[8px] text-white/30">km/h</span></p>
                        </div>
                        <div className="text-right">
                          <p className="text-[8px] uppercase tracking-widest text-white/20">Diameter</p>
                          <p className="text-[10px] font-mono">{diameter.toFixed(3)} <span className="text-[8px] text-white/30">km</span></p>
                        </div>
                        <div>
                          <p className="text-[8px] uppercase tracking-widest text-white/20">Miss Distance</p>
                          <p className="text-[10px] font-mono">{(missDistKm / 1e6).toFixed(2)} <span className="text-[8px] text-white/30">M km</span></p>
                          <p className="text-[9px] font-mono text-white/40">{missDistLD.toFixed(1)} <span className="text-[8px]">LD</span></p>
                        </div>
                        <div className="text-right">
                          <p className="text-[8px] uppercase tracking-widest text-white/20">Magnitude</p>
                          <p className="text-[10px] font-mono text-amber-500">{magnitude.toFixed(1)} <span className="text-[8px] text-white/30">H</span></p>
                        </div>
                      </div>

                      {/* Risk Bar */}
                      <div className="mt-3 h-1 bg-white/5 rounded-full overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${riskScore}%` }}
                          className={`h-full ${isCritical ? 'bg-red-500' : 'bg-red-500/40'}`}
                        />
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center p-4">
                  <ShieldCheck className="w-8 h-8 text-[#00ffa3] mb-3 opacity-20" />
                  <p className="text-[10px] font-mono text-white/20 uppercase tracking-widest">No PHAs in current scan sector</p>
                </div>
              )}
            </div>
          </motion.div>
        </div>

        <div className="mt-auto flex justify-between items-end">
          <div className="flex flex-col gap-4">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-6 bg-black/60 backdrop-blur-2xl border border-white/10 rounded-3xl max-w-sm"
            >
              <div className="flex items-center gap-3 mb-4">
                <ShieldAlert className="w-4 h-4 text-amber-500" />
                <h4 className="text-[10px] font-mono uppercase tracking-[0.2em] text-amber-500 font-bold">Threat Analysis Summary</h4>
              </div>
              <p className="text-xs text-white/60 leading-relaxed mb-4">
                Current sector scanning reveals {asteroids.filter(a => a.is_potentially_hazardous_asteroid).length} Potentially Hazardous Asteroids (PHAs). 
                {asteroids.filter(a => a.is_potentially_hazardous_asteroid).some(a => parseFloat(a.close_approach_data[0].relative_velocity.kilometers_per_hour) > 80000) 
                  ? " High-velocity intercepts detected. Monitoring for orbital variance." 
                  : " All objects currently maintaining stable trajectories."}
              </p>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-white/5 rounded-xl">
                  <p className="text-[8px] uppercase tracking-widest text-white/30 mb-1">Avg. Velocity</p>
                  <p className="text-sm font-bold font-mono">
                    {Math.round(asteroids.reduce((acc, a) => acc + parseFloat(a.close_approach_data[0].relative_velocity.kilometers_per_hour), 0) / asteroids.length).toLocaleString()}
                  </p>
                </div>
                <div className="p-3 bg-white/5 rounded-xl">
                  <p className="text-[8px] uppercase tracking-widest text-white/30 mb-1">Max Diameter</p>
                  <p className="text-sm font-bold font-mono">
                    {Math.max(...asteroids.map(a => a.estimated_diameter.kilometers.estimated_diameter_max)).toFixed(2)} km
                  </p>
                </div>
              </div>
            </motion.div>

            <div className="max-w-md p-8 bg-black/40 backdrop-blur-2xl border border-white/10 rounded-3xl">
            <div className="flex items-center gap-4 mb-6">
              <div className="p-3 bg-[#00cfff]/10 rounded-2xl">
                <Activity className="w-6 h-6 text-[#00cfff]" />
              </div>
              <div>
                <h2 className="text-xl font-bold tracking-tight">Orbital Sensor Array</h2>
                <p className="text-xs text-white/40 font-mono uppercase tracking-widest">Sector 7G Surveillance</p>
              </div>
            </div>
            
            <div className="space-y-6">
              <div className="flex justify-between items-center pb-4 border-b border-white/5">
                <span className="text-[10px] uppercase tracking-widest text-white/30">Objects Tracked</span>
                <span className="font-mono text-[#00cfff] font-bold">{asteroids.length}</span>
              </div>
              <div className="flex justify-between items-center pb-4 border-b border-white/5">
                <span className="text-[10px] uppercase tracking-widest text-white/30">Hazardous Detected</span>
                <span className="font-mono text-red-500 font-bold">{asteroids.filter(a => a.is_potentially_hazardous_asteroid).length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[10px] uppercase tracking-widest text-white/30">Signal Strength</span>
                <div className="flex gap-1">
                  {[1,2,3,4,5].map(i => (
                    <div key={i} className={`w-1 h-3 rounded-full ${i <= 4 ? 'bg-[#00cfff]' : 'bg-white/10'}`} />
                  ))}
                </div>
              </div>
            </div>
            </div>
          </div>

          <div className="flex flex-col items-end gap-4">
             <div className="flex gap-4">
                <div className="p-6 bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl text-center min-w-[120px]">
                   <p className="text-[10px] uppercase tracking-widest text-white/30 mb-1">Azimuth</p>
                   <p className="font-mono text-xl font-bold">284.4°</p>
                </div>
                <div className="p-6 bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl text-center min-w-[120px]">
                   <p className="text-[10px] uppercase tracking-widest text-white/30 mb-1">Elevation</p>
                   <p className="font-mono text-xl font-bold">+12.8°</p>
                </div>
             </div>
             <div className="p-4 bg-[#00cfff] text-black rounded-xl flex items-center gap-3 pointer-events-auto cursor-pointer hover:scale-105 transition-transform">
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span className="font-mono text-[10px] font-bold uppercase tracking-widest">Recalibrating Sensors</span>
             </div>
          </div>
        </div>
      </div>

      {/* Grid Overlay */}
      <div className="absolute inset-0 pointer-events-none opacity-20" 
           style={{ backgroundImage: 'linear-gradient(rgba(0,207,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(0,207,255,0.1) 1px, transparent 1px)', backgroundSize: '100px 100px' }} />
      
      {/* Vignette */}
      <div className="absolute inset-0 pointer-events-none bg-radial-gradient(circle, transparent 40%, rgba(0,0,0,0.8) 100%)" />
    </div>
  );
}
