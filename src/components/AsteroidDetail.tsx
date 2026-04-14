import React, { useEffect, useState } from "react";
import { ArrowLeft, Activity, ShieldAlert, Ruler, Gauge, Calendar, Globe, ExternalLink, Loader2 } from "lucide-react";
import Sparkline from "./Sparkline";

interface AsteroidDetailProps {
  id: string;
  onBack: () => void;
}

export default function AsteroidDetail({ id, onBack }: AsteroidDetailProps) {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchDetail() {
      try {
        const res = await fetch(`/api/asteroids/${id}`);
        const json = await res.json();
        setData(json);
      } catch (e) {
        console.error("Error fetching asteroid detail", e);
      } finally {
        setIsLoading(false);
      }
    }
    fetchDetail();
    window.scrollTo(0, 0);
  }, [id]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#03030a]">
        <Loader2 className="w-12 h-12 text-[#00cfff] animate-spin mb-4" />
        <p className="font-mono text-xs tracking-widest text-white/40 uppercase">Decrypting Orbital Data...</p>
      </div>
    );
  }

  if (!data) return null;

  const haz = data.is_potentially_hazardous_asteroid;
  const approach = data.close_approach_data?.[0];

  return (
    <div className="min-h-screen bg-[#03030a] text-white pt-32 pb-20 px-6">
      <div className="container mx-auto max-w-5xl">
        <button 
          onClick={onBack}
          className="group flex items-center gap-2 text-white/40 hover:text-[#00cfff] transition-colors mb-12 font-mono text-xs uppercase tracking-widest"
        >
          <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
          Back to Surveillance
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Header & Main Info */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-4 mb-6">
              <div className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border ${haz ? 'border-red-500/50 text-red-500 bg-red-500/10' : 'border-[#00ffa3]/50 text-[#00ffa3] bg-[#00ffa3]/10'}`}>
                {haz ? 'Potentially Hazardous' : 'Safe Trajectory'}
              </div>
              <span className="font-mono text-xs text-white/20">ID: {data.id}</span>
            </div>
            
            <h1 className="text-6xl md:text-8xl font-bold tracking-tighter mb-8 leading-none">
              {(data.name || "Unknown Object").replace(/[()]/g, '').trim()}
            </h1>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-1 mb-12 bg-white/5 border border-white/10">
              <div className="p-4 md:p-6 border-r border-white/10">
                <p className="text-[10px] uppercase tracking-widest text-white/30 mb-2">Magnitude</p>
                <p className="text-2xl font-bold text-[#00cfff]">{data.absolute_magnitude_h.toFixed(1)}<span className="text-[10px] ml-1 text-white/20 uppercase">H</span></p>
              </div>
              <div className="p-4 md:p-6 border-r border-white/10">
                <p className="text-[10px] uppercase tracking-widest text-white/30 mb-2">Diameter</p>
                <p className="text-2xl font-bold">
                  {data.estimated_diameter.kilometers.estimated_diameter_max >= 1 
                    ? data.estimated_diameter.kilometers.estimated_diameter_max.toLocaleString(undefined, { maximumFractionDigits: 2 })
                    : (data.estimated_diameter.kilometers.estimated_diameter_max * 1000).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                  <span className="text-xs ml-1 text-white/40">{data.estimated_diameter.kilometers.estimated_diameter_max >= 1 ? 'km' : 'm'}</span>
                </p>
              </div>
              <div className="p-4 md:p-6 border-r border-white/10">
                <p className="text-[10px] uppercase tracking-widest text-white/30 mb-2">Velocity</p>
                <p className="text-2xl font-bold">{Math.round(parseFloat(approach?.relative_velocity.kilometers_per_hour)).toLocaleString()}<span className="text-xs ml-1 text-white/40">km/h</span></p>
                <div className="mt-2">
                  <Sparkline 
                    data={Array.from({ length: 12 }, (_, i) => Math.round(parseFloat(approach?.relative_velocity.kilometers_per_hour)) + Math.sin(parseInt(data.id.slice(-4)) + i) * 500)} 
                    color={haz ? "#ef4444" : "#00cfff"} 
                    width={100} 
                  />
                </div>
              </div>
              <div className="p-4 md:p-6">
                <p className="text-[10px] uppercase tracking-widest text-white/30 mb-2">Miss Dist.</p>
                <p className="text-2xl font-bold">
                  {parseFloat(approach?.miss_distance.kilometers) >= 1e6
                    ? (parseFloat(approach?.miss_distance.kilometers) / 1e6).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                    : Math.round(parseFloat(approach?.miss_distance.kilometers)).toLocaleString()}
                  <span className="text-xs ml-1 text-white/40">{parseFloat(approach?.miss_distance.kilometers) >= 1e6 ? 'M km' : 'km'}</span>
                </p>
                <div className="mt-2">
                  <Sparkline 
                    data={Array.from({ length: 12 }, (_, i) => parseFloat(approach?.miss_distance.kilometers) + Math.cos(parseInt(data.id.slice(-4)) + i) * 10000)} 
                    color="#ffffff22" 
                    width={100} 
                  />
                </div>
              </div>
            </div>

            <div className="space-y-8">
              <div>
                <h3 className="font-mono text-xs uppercase tracking-widest text-[#00cfff] mb-4 flex items-center gap-2">
                  <Globe className="w-4 h-4" /> Orbital Parameters
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { label: "Orbit ID", value: data.orbital_data.orbit_id },
                    { label: "Orbit Class", value: data.orbital_data.orbit_class.orbit_class_type },
                    { label: "Orbit Determination", value: data.orbital_data.orbit_determination_date },
                    { label: "Orbital Period", value: `${parseFloat(data.orbital_data.orbital_period).toLocaleString(undefined, { maximumFractionDigits: 1 })} days` },
                    { label: "Perihelion Distance", value: `${parseFloat(data.orbital_data.perihelion_distance).toLocaleString(undefined, { minimumFractionDigits: 4, maximumFractionDigits: 4 })} AU` },
                    { label: "Aphelion Distance", value: `${parseFloat(data.orbital_data.aphelion_distance).toLocaleString(undefined, { minimumFractionDigits: 4, maximumFractionDigits: 4 })} AU` },
                    { label: "Semi Major Axis", value: `${parseFloat(data.orbital_data.semi_major_axis).toLocaleString(undefined, { minimumFractionDigits: 4, maximumFractionDigits: 4 })} AU` },
                    { label: "Eccentricity", value: parseFloat(data.orbital_data.eccentricity).toLocaleString(undefined, { minimumFractionDigits: 6, maximumFractionDigits: 6 }) },
                    { label: "Inclination", value: `${parseFloat(data.orbital_data.inclination).toLocaleString(undefined, { maximumFractionDigits: 4 })}°` },
                    { label: "Mean Anomaly", value: `${parseFloat(data.orbital_data.mean_anomaly).toLocaleString(undefined, { maximumFractionDigits: 4 })}°` },
                    { label: "Ascending Node", value: `${parseFloat(data.orbital_data.ascending_node_longitude).toLocaleString(undefined, { maximumFractionDigits: 4 })}°` },
                    { label: "Mean Motion", value: `${parseFloat(data.orbital_data.mean_motion).toLocaleString(undefined, { maximumFractionDigits: 6 })}°/day` },
                  ].map((item, i) => (
                    <div key={i} className="flex justify-between items-center p-4 bg-white/5 rounded-lg border border-white/5">
                      <span className="text-xs text-white/40 uppercase tracking-wider">{item.label}</span>
                      <span className="text-sm font-medium">{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="font-mono text-xs uppercase tracking-widest text-[#00cfff] mb-4 flex items-center gap-2">
                  <Calendar className="w-4 h-4" /> Close Approach History
                </h3>
                <div className="space-y-2">
                  {data.close_approach_data.slice(0, 5).map((app: any, i: number) => (
                    <div key={i} className="flex justify-between items-center p-4 bg-white/5 rounded-lg border border-white/5 hover:bg-white/10 transition-colors">
                      <div className="flex flex-col">
                        <span className="text-sm font-bold">{app.close_approach_date}</span>
                        <span className="text-[10px] text-white/30 uppercase tracking-widest">Orbiting {app.orbiting_body}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-sm font-mono">
                          {parseFloat(app.miss_distance.kilometers) >= 1e6
                            ? `${(parseFloat(app.miss_distance.kilometers) / 1e6).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}M km`
                            : `${Math.round(parseFloat(app.miss_distance.kilometers)).toLocaleString()} km`}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <div className="p-8 bg-white/5 border border-white/10 rounded-3xl">
              <h4 className="font-bold mb-4">NASA JPL Resources</h4>
              <p className="text-sm text-white/50 leading-relaxed mb-6">
                Access the official Small-Body Database Lookup from NASA's Jet Propulsion Laboratory for this specific object.
              </p>
              <a 
                href={data.nasa_jpl_url} 
                target="_blank" 
                rel="noreferrer"
                className="flex items-center justify-center gap-2 w-full py-4 bg-[#00cfff] text-black font-bold rounded-xl hover:scale-[1.02] transition-transform"
              >
                JPL Database <ExternalLink className="w-4 h-4" />
              </a>
            </div>

            <div className="p-8 bg-red-500/5 border border-red-500/20 rounded-3xl">
              <div className="flex items-center gap-2 text-red-500 mb-4">
                <ShieldAlert className="w-5 h-5" />
                <h4 className="font-bold">Risk Assessment</h4>
              </div>
              <p className="text-sm text-white/60 leading-relaxed">
                {haz 
                  ? "This object is classified as a Potentially Hazardous Asteroid (PHA). It meets the criteria of having a minimum orbit intersection distance (MOID) of 0.05 au or less and an absolute magnitude (H) of 22.0 or less."
                  : "This object does not currently meet the criteria for a Potentially Hazardous Asteroid. Its trajectory is well-monitored and poses no immediate threat to Earth."}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
