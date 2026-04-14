import React, { useEffect, useRef, useState } from "react";
import { RefreshCw, Activity } from "lucide-react";
import AsteroidDetail from "./components/AsteroidDetail";
import FullFeed from "./components/FullFeed";
import ScanningDetector from "./components/ScanningDetector";
import OrbitVisualizer3D from "./components/OrbitVisualizer3D";
import Earth3D from "./components/Earth3D";
import { getPlanetaryStatus } from "./services/gemini";

// Types for NASA Data
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

export default function App() {
  const [asteroids, setAsteroids] = useState<Asteroid[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [countdown, setCountdown] = useState(60);
  const [updateTime, setUpdateTime] = useState("");
  const [stats, setStats] = useState({ total: 0, pha: 0, closest: "—", closestName: "km", fastest: "—", fastestName: "km/h" });
  const [selectedAsteroidId, setSelectedAsteroidId] = useState<string | null>(null);
  const [showFullFeed, setShowFullFeed] = useState(false);
  const [showDetector, setShowDetector] = useState(false);
  const [aiStatus, setAiStatus] = useState("");

  const starCanvasRef = useRef<HTMLCanvasElement>(null);
  const nebulaCanvasRef = useRef<HTMLCanvasElement>(null);
  const heroArtCanvasRef = useRef<HTMLCanvasElement>(null);
  const hazardCanvasRef = useRef<HTMLCanvasElement>(null);
  const ctaCanvasRef = useRef<HTMLCanvasElement>(null);
  const cursorRef = useRef<HTMLDivElement>(null);
  const cursorRingRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const navRef = useRef<HTMLElement>(null);

  // Cursor Logic
  useEffect(() => {
    let mx = 0, my = 0, rx = 0, ry = 0;
    const handleMouseMove = (e: MouseEvent) => {
      mx = e.clientX;
      my = e.clientY;
      if (cursorRef.current) {
        cursorRef.current.style.left = mx + 'px';
        cursorRef.current.style.top = my + 'px';
      }
    };
    document.addEventListener('mousemove', handleMouseMove);

    const loop = () => {
      rx += (mx - rx) * 0.12;
      ry += (my - ry) * 0.12;
      if (cursorRingRef.current) {
        cursorRingRef.current.style.left = rx + 'px';
        cursorRingRef.current.style.top = ry + 'px';
      }
      requestAnimationFrame(loop);
    };
    const animId = requestAnimationFrame(loop);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animId);
    };
  }, []);

  // Scroll Logic
  useEffect(() => {
    const handleScroll = () => {
      if (progressRef.current) {
        progressRef.current.style.transform = `scaleX(${window.scrollY / (document.body.scrollHeight - window.innerHeight)})`;
      }
      if (navRef.current) {
        navRef.current.classList.toggle('solid', window.scrollY > 60);
      }
      
      // Reveal Logic
      const reveals = document.querySelectorAll('.reveal');
      reveals.forEach(el => {
        const rect = el.getBoundingClientRect();
        if (rect.top < window.innerHeight * 0.88) {
          el.classList.add('in');
        }
      });
    };
    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Initial check
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Star Canvas
  useEffect(() => {
    const canvas = starCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let stars: any[] = [];
    const init = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      stars = Array.from({ length: 350 }, () => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        r: Math.random() * 1.4 + 0.2,
        o: Math.random() * 0.7 + 0.1,
        sp: Math.random() * 0.004 + 0.001,
        ph: Math.random() * Math.PI * 2
      }));
    };

    let st = 0;
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      st += 0.01;
      stars.forEach(s => {
        const o = s.o * (0.5 + 0.5 * Math.sin(st * s.sp * 100 + s.ph));
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${o})`;
        ctx.fill();
      });
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

  // Nebula Canvas
  useEffect(() => {
    const canvas = nebulaCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const draw = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      [[window.innerWidth * 0.2, window.innerHeight * 0.3, window.innerWidth * 0.4, 'rgba(26,86,255,0.06)'],
       [window.innerWidth * 0.8, window.innerHeight * 0.7, window.innerWidth * 0.35, 'rgba(0,207,255,0.05)'],
       [window.innerWidth * 0.5, window.innerHeight * 0.5, window.innerWidth * 0.6, 'rgba(100,20,180,0.04)']].forEach(([cx, cy, r, c]: any) => {
        const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
        g.addColorStop(0, c);
        g.addColorStop(1, 'transparent');
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      });
    };
    draw();
    window.addEventListener('resize', draw);
    return () => window.removeEventListener('resize', draw);
  }, []);

  // Hero Art Canvas
  useEffect(() => {
    const canvas = heroArtCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let particles: any[] = [];
    const init = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      particles = Array.from({ length: 60 }, () => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        r: Math.random() * 2.5 + 0.5,
        o: Math.random() * 0.6 + 0.1,
        haz: Math.random() > 0.8
      }));
    };

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const cg = ctx.createRadialGradient(canvas.width / 2, canvas.height / 2, 0, canvas.width / 2, canvas.height / 2, canvas.width * 0.5);
      cg.addColorStop(0, 'rgba(0,80,255,0.07)');
      cg.addColorStop(1, 'transparent');
      ctx.fillStyle = cg;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      particles.forEach(p => {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0) p.x = canvas.width; if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height; if (p.y > canvas.height) p.y = 0;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = p.haz ? `rgba(255,45,45,${p.o})` : `rgba(0,207,255,${p.o * 0.7})`;
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(p.x - p.vx * 20, p.y - p.vy * 20);
        ctx.strokeStyle = p.haz ? `rgba(255,45,45,${p.o * 0.3})` : `rgba(0,207,255,${p.o * 0.2})`;
        ctx.lineWidth = p.r * 0.6;
        ctx.stroke();
      });
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

  // Hazard Canvas
  useEffect(() => {
    const canvas = hazardCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let dots: any[] = [];
    let hzT = 0, swA = 0;

    const init = () => {
      canvas.width = window.innerWidth;
      canvas.height = canvas.offsetHeight || Math.round(window.innerHeight * 0.8);
      dots = Array.from({ length: 28 }, () => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.7,
        vy: (Math.random() - 0.5) * 0.35,
        r: Math.random() * 4 + 1,
        o: Math.random() * 0.7 + 0.3
      }));
    };

    const draw = () => {
      hzT += 0.01; swA += 0.018;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#03020a'; ctx.fillRect(0, 0, canvas.width, canvas.height);
      const rg = ctx.createRadialGradient(canvas.width / 2, canvas.height / 2, 0, canvas.width / 2, canvas.height / 2, canvas.width * 0.6);
      rg.addColorStop(0, 'rgba(255,20,20,0.09)'); rg.addColorStop(1, 'transparent');
      ctx.fillStyle = rg; ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      const cx = canvas.width / 2, cy = canvas.height / 2, maxR = Math.min(canvas.width, canvas.height) * 0.44;
      ctx.strokeStyle = 'rgba(255,45,45,0.07)'; ctx.lineWidth = 0.5;
      [.25, .5, .75, 1].forEach(f => { ctx.beginPath(); ctx.arc(cx, cy, maxR * f, 0, Math.PI * 2); ctx.stroke(); });
      
      ctx.save(); ctx.translate(cx, cy); ctx.rotate(swA);
      ctx.beginPath(); ctx.moveTo(0, 0); ctx.arc(0, 0, maxR, 0, 0.65); ctx.closePath();
      ctx.fillStyle = 'rgba(255,45,45,0.06)'; ctx.fill();
      ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(maxR, 0); ctx.strokeStyle = 'rgba(255,100,100,0.55)'; ctx.lineWidth = 1.5; ctx.stroke();
      ctx.restore();

      dots.forEach(d => {
        d.x += d.vx; d.y += d.vy;
        if (d.x < 0) d.x = canvas.width; if (d.x > canvas.width) d.x = 0;
        if (d.y < 0) d.y = canvas.height; if (d.y > canvas.height) d.y = 0;
        const bl = 0.5 + 0.5 * Math.sin(hzT * 3 + d.x);
        ctx.beginPath(); ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2); ctx.fillStyle = `rgba(255,60,60,${d.o * bl})`; ctx.fill();
      });
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

  // CTA Canvas
  useEffect(() => {
    const canvas = ctaCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let particles: any[] = [];
    let ctaT = 0;

    const init = () => {
      canvas.width = window.innerWidth;
      canvas.height = canvas.parentElement?.offsetHeight || window.innerHeight;
      particles = Array.from({ length: 80 }, () => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.2,
        r: Math.random() * 2 + 0.3,
        o: Math.random() * 0.6 + 0.1,
        haz: Math.random() > 0.75
      }));
    };

    const draw = () => {
      ctaT += 0.006;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#03030a'; ctx.fillRect(0, 0, canvas.width, canvas.height);
      const cg = ctx.createRadialGradient(canvas.width * 0.5, canvas.height * 0.5, 0, canvas.width * 0.5, canvas.height * 0.5, canvas.width * 0.55);
      cg.addColorStop(0, 'rgba(255,100,0,0.07)'); cg.addColorStop(0.5, 'rgba(0,80,255,0.04)'); cg.addColorStop(1, 'transparent');
      ctx.fillStyle = cg; ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      particles.forEach(p => {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0) p.x = canvas.width; if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height; if (p.y > canvas.height) p.y = 0;
        const pu = 0.5 + 0.5 * Math.sin(ctaT * 2 + p.x * 0.01);
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = p.haz ? `rgba(255,150,0,${p.o * pu})` : `rgba(0,207,255,${p.o * pu * 0.6})`;
        ctx.fill();
      });
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

  // NASA API Logic
  const fetchNEOs = async () => {
    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - 7);
    
    const startStr = start.toISOString().slice(0, 10);
    const endStr = end.toISOString().slice(0, 10);

    try {
      const res = await fetch(`/api/asteroids?start_date=${startStr}&end_date=${endStr}`);
      if (!res.ok) throw new Error(res.status.toString());
      const data = await res.json();
      let all: Asteroid[] = [];
      Object.values(data.near_earth_objects).forEach((a: any) => all = all.concat(a));
      
      all.sort((a, b) => parseFloat(a.close_approach_data?.[0]?.miss_distance?.kilometers || "Infinity") - parseFloat(b.close_approach_data?.[0]?.miss_distance?.kilometers || "Infinity"));
      
      setAsteroids(all.slice(0, 24)); // Increased from 12 to 24
      setIsLoading(false);
      setUpdateTime(new Date().toLocaleTimeString());

      // Update Stats
      let closest: Asteroid | null = null, minD = Infinity, fastest: Asteroid | null = null, maxS = 0;
      all.forEach(a => {
        const d = parseFloat(a.close_approach_data?.[0]?.miss_distance?.kilometers || "Infinity");
        const s = parseFloat(a.close_approach_data?.[0]?.relative_velocity?.kilometers_per_hour || "0");
        if (d < minD) { minD = d; closest = a; }
        if (s > maxS) { maxS = s; fastest = a; }
      });

      setStats({
        total: all.length,
        pha: all.filter(a => a.is_potentially_hazardous_asteroid).length,
        closest: closest ? (minD >= 1e6 ? `${(minD / 1e6).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}M` : Math.round(minD).toLocaleString()) + " km" : "—",
        closestName: closest ? closest.name.replace(/[()]/g, '').trim().slice(0, 18) : "km",
        fastest: fastest ? Math.round(maxS).toLocaleString() + " km/h" : "—",
        fastestName: fastest ? fastest.name.replace(/[()]/g, '').trim().slice(0, 18) : "km/h"
      });

      // Fetch AI Status from Gemini (Non-blocking)
      getPlanetaryStatus(all.length, all.filter(a => a.is_potentially_hazardous_asteroid).length)
        .then(status => setAiStatus(status))
        .catch(err => console.error("Gemini status error:", err));
    } catch (e) {
      console.error("NASA API error", e);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNEOs();
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          fetchNEOs();
          return 60;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const fmtSz = (mn: number, mx: number) => {
    const a = (mn + mx) / 2;
    return a >= 1 ? `${a.toFixed(1)} km` : `${Math.round(a * 1000)} m`;
  };

  return (
    <>
      <div id="cursor" ref={cursorRef}></div>
      <div id="cursor-ring" ref={cursorRingRef}></div>
      <div id="progress" ref={progressRef}></div>
      <canvas id="starCanvas" ref={starCanvasRef}></canvas>
      <canvas id="nebulaCanvas" ref={nebulaCanvasRef}></canvas>
      <Earth3D aiStatus={aiStatus} />

      {selectedAsteroidId ? (
        <AsteroidDetail id={selectedAsteroidId} onBack={() => setSelectedAsteroidId(null)} />
      ) : showDetector ? (
        <ScanningDetector asteroids={asteroids} onBack={() => setShowDetector(false)} />
      ) : showFullFeed ? (
        <FullFeed 
          asteroids={asteroids} 
          isLoading={isLoading} 
          onBack={() => setShowFullFeed(false)} 
          onSelect={(id) => setSelectedAsteroidId(id)}
          countdown={countdown}
          updateTime={updateTime}
        />
      ) : (
        <>
          <nav id="nav" ref={navRef}>
            <div className="nav-brand">Orbit</div>
            <ul className="nav-links">
              <li><a href="#hero" className="act">Overview</a></li>
              <li><a href="#s2">Detection</a></li>
              <li><a href="#s3">Visualization</a></li>
              <li><a href="#s4">Live Feed</a></li>
              <li><a href="#s5">Risk Zone</a></li>
            </ul>
            <button className="nav-pill" onClick={() => document.getElementById('cta-section')?.scrollIntoView({ behavior: 'smooth' })}>Live Data ↗</button>
          </nav>

          <section id="hero" className="premium-frame" style={{ margin: 0, borderTop: 'none' }}>
            <div className="frame-corner bl"></div>
            <div className="frame-corner br"></div>
            <div className="frame-label">Orbital Intelligence: Online</div>
            <canvas id="heroArtCanvas" ref={heroArtCanvasRef}></canvas>
            <div className="hero-inner">
              <div className="hero-eyebrow">
                <span className="hero-dot"></span>
                NASA NeoWs · Near-Earth Intelligence Active
              </div>
              <h1 className="hero-h1">ASTEROID<br /><span className="grad">ATLAS</span></h1>
              <p className="hero-sub">Real-time orbital surveillance of every asteroid crossing Earth's gravitational boundary over the last 7 days — powered by NASA JPL deep space telemetry.</p>
            </div>
            <div className="hero-scroll">
              <span className="hero-scroll-txt">Scroll to enter</span>
              <div className="hero-scroll-line"></div>
            </div>
          </section>

          <section id="s2" className="premium-frame">
            <div className="frame-corner tl"></div>
            <div className="frame-corner tr"></div>
            <div className="frame-corner bl"></div>
            <div className="frame-corner br"></div>
            <div className="frame-label">System Status: Active</div>
            <div className="container">
              <div className="two-col">
                <div>
                  <div className="eyebrow reveal"><span className="eyebrow-line"></span>01 — Earth Orbit Surveillance</div>
                  <h2 className="big-h reveal reveal-d1">You are now inside<br />Earth's watch zone</h2>
                  <p className="body-p reveal reveal-d2">Every object crossing within 1.3 AU of the Sun enters NASA's near-Earth catalog. We monitor all of them, continuously.</p>
                  <p className="body-p reveal reveal-d3" style={{ marginTop: '14px' }}>Objects exceeding 140 metres within 7.5 million km are classified as <span style={{ color: 'var(--red)' }}>Potentially Hazardous Asteroids</span>. Every single one is tracked.</p>
                  <div className="stat-pair reveal reveal-d4">
                    <div className="stat-item"><div className="stat-num">{stats.total || "—"}</div><div className="stat-lbl">NEOs Today</div></div>
                    <div className="stat-item r"><div className="stat-num">{stats.pha || "—"}</div><div className="stat-lbl">Hazardous</div></div>
                  </div>
                </div>
                <div className="reveal reveal-d2">
                  <div className="orbit-viz">
                    <div className="orbit-ring or1"></div>
                    <div className="orbit-ring or2"></div>
                    <div className="orbit-ring or3"></div>
                    <div className="orbit-ring or4"></div>
                    <div className="orbit-earth"></div>
                    <div className="orbit-dot od-safe" style={{ top: '12%', left: '62%' }}></div>
                    <div className="orbit-dot od-safe" style={{ top: '78%', left: '22%' }}></div>
                    <div className="orbit-dot od-haz" style={{ top: '35%', left: '8%' }}></div>
                    <div className="orbit-dot od-safe" style={{ top: '55%', left: '85%' }}></div>
                    <div className="orbit-dot od-haz" style={{ top: '88%', left: '68%' }}></div>
                    <div className="orbit-dot od-safe" style={{ top: '20%', left: '40%' }}></div>
                    <div className="orbit-dot od-safe" style={{ top: '62%', left: '50%' }}></div>
                    <div className="orbit-dot od-haz" style={{ top: '8%', left: '30%' }}></div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section id="s3" className="premium-frame">
            <div className="frame-corner tl"></div>
            <div className="frame-corner tr"></div>
            <div className="frame-corner bl"></div>
            <div className="frame-corner br"></div>
            <div className="frame-label">Deep Space Visualization</div>
            <div className="container">
              <div className="two-col" style={{ marginBottom: '48px' }}>
                <div>
                  <div className="eyebrow reveal"><span className="eyebrow-line"></span>02 — Deep Field Visualization</div>
                  <h2 className="big-h reveal reveal-d1">Real-time asteroid<br />field detection</h2>
                  <div className="reveal reveal-d2 mt-6">
                    <button 
                      onClick={() => setShowDetector(true)}
                      className="px-8 py-4 bg-white/5 border border-white/10 rounded-full font-mono text-[10px] uppercase tracking-widest hover:bg-[#00cfff] hover:text-black transition-all flex items-center gap-3 group"
                    >
                      <Activity className="w-4 h-4 text-[#00cfff] group-hover:text-black" />
                      Initialize Deep Scan Detector
                    </button>
                  </div>
                </div>
                <p className="body-p reveal reveal-d2" style={{ margin: 'auto 0' }}>Our sensor array tracks orbital trajectories across the entire NeoWs catalog. Each point represents a real object currently logged in NASA's database.</p>
              </div>
              <div className="reveal" style={{ height: '600px', width: '100%', position: 'relative' }}>
                <OrbitVisualizer3D asteroids={asteroids} onSelect={(id) => setSelectedAsteroidId(id)} />
              </div>
            </div>
          </section>

          <section id="s4" className="premium-frame">
            <div className="frame-corner tl"></div>
            <div className="frame-corner tr"></div>
            <div className="frame-corner bl"></div>
            <div className="frame-corner br"></div>
            <div className="frame-label">Live Intelligence Stream</div>
            <div className="container">
              <div className="two-col" style={{ marginBottom: '48px' }}>
                <div>
                  <div className="eyebrow reveal"><span className="eyebrow-line"></span>03 — Live Intelligence Stream</div>
                  <h2 className="big-h reveal reveal-d1">Orbital data,<br />object by object</h2>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
                  <p className="body-p reveal reveal-d2">Sourced directly from NASA NeoWs. Access the full real-time intelligence feed for comprehensive orbital tracking.</p>
                  <div style={{ marginTop: '24px' }} className="reveal reveal-d3">
                    <button 
                      onClick={() => setShowFullFeed(true)}
                      className="group flex items-center gap-4 px-8 py-4 bg-[#00cfff] text-black font-bold rounded-full hover:scale-105 transition-all"
                    >
                      Show Live Data Feed
                      <div className="w-8 h-8 rounded-full bg-black/10 flex items-center justify-center group-hover:bg-black/20 transition-colors">
                        <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                      </div>
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="reveal reveal-d4" style={{ opacity: 0.6 }}>
                <div id="asteroid-grid" style={{ pointerEvents: 'none', filter: 'blur(4px)' }}>
                  {asteroids.slice(0, 3).map((ast) => {
                    const haz = ast.is_potentially_hazardous_asteroid;
                    const name = ast.name.replace(/[()]/g, '').trim();
                    return (
                      <div key={ast.id} className={`ast-card ${haz ? 'haz' : ''}`}>
                        <div className={`ast-tag ${haz ? 'danger' : 'safe'}`}><div className="dot"></div>{haz ? 'Hazardous' : 'Safe'}</div>
                        <div className="ast-name">{name}</div>
                      </div>
                    );
                  })}
                </div>
                <div style={{ textAlign: 'center', marginTop: '-100px', position: 'relative', zIndex: 10 }}>
                  <div style={{ background: 'linear-gradient(to top, #03030a, transparent)', height: '200px', width: '100%' }}></div>
                </div>
              </div>
            </div>
          </section>

          <section id="s5" className="premium-frame">
            <div className="frame-corner tl"></div>
            <div className="frame-corner tr"></div>
            <div className="frame-corner bl"></div>
            <div className="frame-corner br"></div>
            <div className="frame-label">Threat Assessment Protocol</div>
            <canvas id="hazardCanvas" ref={hazardCanvasRef}></canvas>
            <div className="hazard-caption">
              <div className="container">
                <div className="two-col">
                  <div>
                    <div className="eyebrow reveal"><span className="eyebrow-line" style={{ background: 'var(--red)' }}></span><span style={{ color: 'var(--red)' }}>04 — Threat Assessment</span></div>
                    <h2 className="big-h reveal reveal-d1">Potentially<br /><span style={{ color: 'var(--red)' }}>hazardous</span><br />object tracking</h2>
                    <p className="body-p reveal reveal-d2">CNEOS orbital models flag objects meeting dual criteria: size ≥140m and MOID ≤0.05 AU. Every blip is a real classified PHA.</p>
                  </div>
                  <div>
                    <div className="hazard-stats reveal reveal-d2">
                      <div className="h-stat"><div className="h-stat-val r">{stats.pha || "—"}</div><div className="h-stat-lbl">Hazardous Today</div><div className="h-stat-sub">PHAs detected</div></div>
                      <div className="h-stat"><div className="h-stat-val">{stats.total || "—"}</div><div className="h-stat-lbl">Total NEOs</div><div className="h-stat-sub">Objects tracked</div></div>
                      <div className="h-stat"><div className="h-stat-val g">{stats.closest}</div><div className="h-stat-lbl">Closest Approach</div><div className="h-stat-sub">{stats.closestName}</div></div>
                      <div className="h-stat"><div className="h-stat-val r">{stats.fastest}</div><div className="h-stat-lbl">Fastest Object</div><div className="h-stat-sub">{stats.fastestName}</div></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section id="cta-section" className="premium-frame">
            <div className="frame-corner tl"></div>
            <div className="frame-corner tr"></div>
            <div className="frame-corner bl"></div>
            <div className="frame-corner br"></div>
            <div className="frame-label">Mission Control</div>
            <canvas id="ctaCanvas" ref={ctaCanvasRef}></canvas>
            <div className="cta-inner">
              <div className="cta-ticker reveal"><span className="cta-ticker-dot"></span>NASA NeoWs Feed Active · Data Updated Live</div>
              <h2 className="cta-h reveal reveal-d1">WATCH THE<br /><span>ASTEROIDS</span><br />LIVE NOW</h2>
              <p className="cta-p reveal reveal-d2">Every asteroid in this feed is real. Every speed, every distance, every hazard flag — pulled live from NASA's Near Earth Object Web Service, right now.</p>
              <div className="cta-buttons reveal reveal-d3">
                <button className="btn-live" onClick={() => document.getElementById('s4')?.scrollIntoView({ behavior: 'smooth' })}>
                  <span className="btn-live-pulse"></span>
                  Open Live Asteroid Feed ↗
                </button>
                <button className="btn-ghost" onClick={() => window.open('https://api.nasa.gov/', '_blank')}>
                  View NASA API Docs
                </button>
              </div>
              <p className="cta-note reveal reveal-d4">Real data from <a href="https://api.nasa.gov/" target="_blank">api.nasa.gov/neo</a> · Refreshes every 60 seconds · Free API key at nasa.gov</p>
            </div>
          </section>

          <footer>
            <p>Orbit — Near-Earth Object Intelligence</p>
            <p>Data: <a href="https://api.nasa.gov/" target="_blank">NASA NeoWs · JPL Horizons</a></p>
            <p>© 2026 Deep Space Intelligence</p>
          </footer>
        </>
      )}
    </>
  );
}

