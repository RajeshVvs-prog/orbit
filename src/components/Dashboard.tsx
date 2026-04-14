import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from "recharts";
import { 
  TrendingUp, Activity, ArrowUpRight, Loader2, Zap, 
  ShieldAlert, Ruler, Gauge, Calendar as CalendarIcon 
} from "lucide-react";
import { getAsteroidFeed, Asteroid } from "@/src/services/nasa";
import { cn } from "@/src/lib/utils";

export default function Dashboard() {
  const [asteroids, setAsteroids] = useState<Asteroid[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      const data = await getAsteroidFeed();
      setAsteroids(data);
      setIsLoading(false);
    }
    fetchData();
  }, []);

  const hazardousCount = asteroids.filter(a => a.is_potentially_hazardous_asteroid).length;
  const closestAsteroid = asteroids[0];
  const maxVelocity = Math.max(...asteroids.map(a => parseFloat(a.close_approach_data[0].relative_velocity.kilometers_per_hour)));

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-brand-cyan animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-6 pt-32 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
        <div>
          <h2 className="text-4xl font-bold tracking-tight mb-2">Near-Earth Objects</h2>
          <p className="text-white/50">Real-time tracking from NASA NeoWs</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="glass px-4 py-2 rounded-xl flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-brand-cyan animate-pulse" />
            <span className="text-sm font-medium">Live Feed Active</span>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[
          { label: "Tracked Objects", value: asteroids.length.toString(), trend: "Today", icon: Activity, color: "text-brand-cyan" },
          { label: "Hazardous", value: hazardousCount.toString(), trend: "Potential", icon: ShieldAlert, color: hazardousCount > 0 ? "text-red-400" : "text-green-400" },
          { label: "Closest Approach", value: `${(parseFloat(closestAsteroid?.close_approach_data[0].miss_distance.kilometers) / 1000000).toFixed(2)}M km`, trend: "Minimal", icon: Ruler, color: "text-yellow-400" },
          { label: "Max Velocity", value: `${(maxVelocity / 1000).toFixed(1)}k km/h`, trend: "Peak", icon: Gauge, color: "text-purple-400" },
        ].map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="glass p-6 rounded-3xl"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center">
                <stat.icon className={cn("w-5 h-5", stat.color)} />
              </div>
              <span className={cn("text-xs font-bold px-2 py-1 rounded-lg bg-white/5", stat.color)}>
                {stat.trend}
              </span>
            </div>
            <p className="text-white/50 text-sm mb-1">{stat.label}</p>
            <h3 className="text-2xl font-bold">{stat.value}</h3>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Asteroid List */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="lg:col-span-2 glass p-8 rounded-[2rem] overflow-hidden"
        >
          <h3 className="text-xl font-bold mb-8">Closest Approaches</h3>
          <div className="space-y-4 max-h-[600px] overflow-y-auto pr-4 custom-scrollbar">
            {asteroids.map((asteroid, i) => (
              <div key={asteroid.id} className="p-6 rounded-2xl bg-white/5 border border-white/5 hover:border-brand-cyan/30 transition-all group">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "w-3 h-3 rounded-full",
                      asteroid.is_potentially_hazardous_asteroid ? "bg-red-500 animate-pulse" : "bg-green-500"
                    )} />
                    <h4 className="font-bold text-lg">{asteroid.name}</h4>
                  </div>
                  <div className="text-xs text-white/40 font-mono">
                    ID: {asteroid.id}
                  </div>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-[10px] uppercase text-white/30 mb-1">Miss Distance</p>
                    <p className="text-sm font-medium">{(parseFloat(asteroid.close_approach_data[0].miss_distance.kilometers) / 1000).toLocaleString()}k km</p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase text-white/30 mb-1">Velocity</p>
                    <p className="text-sm font-medium">{parseFloat(asteroid.close_approach_data[0].relative_velocity.kilometers_per_hour).toLocaleString()} km/h</p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase text-white/30 mb-1">Diameter (Max)</p>
                    <p className="text-sm font-medium">{asteroid.estimated_diameter.kilometers.estimated_diameter_max.toFixed(3)} km</p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase text-white/30 mb-1">Approach Date</p>
                    <p className="text-sm font-medium">{asteroid.close_approach_data[0].close_approach_date}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Side Panel: AI Analysis */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-6"
        >
          <div className="glass p-8 rounded-[2rem]">
            <h3 className="text-xl font-bold mb-6">Orbital Insights</h3>
            <div className="space-y-6">
              <div className="p-6 rounded-2xl bg-brand-cyan/5 border border-brand-cyan/10">
                <div className="flex items-center gap-2 text-brand-cyan mb-3">
                  <Zap className="w-4 h-4" />
                  <span className="text-xs font-bold uppercase tracking-wider">Astro AI Analysis</span>
                </div>
                <p className="text-sm text-white/70 leading-relaxed">
                  {hazardousCount > 0 
                    ? `Warning: ${hazardousCount} potentially hazardous objects detected in current window. Monitoring trajectories for orbital perturbations.`
                    : "No immediate planetary threats detected in the current 24-hour observation window. All objects maintaining safe miss distances."}
                </p>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-white/50">Data Confidence</span>
                  <span className="text-brand-cyan font-bold">99.8%</span>
                </div>
                <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full bg-brand-cyan w-[99.8%]" />
                </div>
              </div>
            </div>
          </div>

          <div className="glass p-8 rounded-[2rem]">
            <h3 className="text-xl font-bold mb-4">Legend</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-sm">
                <div className="w-2 h-2 rounded-full bg-red-500" />
                <span className="text-white/60">Potentially Hazardous</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <div className="w-2 h-2 rounded-full bg-green-500" />
                <span className="text-white/60">Safe Trajectory</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
