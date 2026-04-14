import { motion } from "motion/react";
import { ArrowRight, Play, Shield, Zap, TrendingUp } from "lucide-react";

export default function Hero() {
  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden pt-20">
      {/* Background Elements */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-brand-cyan/10 rounded-full blur-[120px] animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-600/5 rounded-full blur-[120px] animate-pulse delay-1000" />
      
      <div className="container mx-auto px-6 relative z-10 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-medium text-brand-cyan mb-8">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-cyan opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-cyan"></span>
            </span>
            NASA NeoWs Live Feed Active
          </div>
          
          <h1 className="text-6xl md:text-8xl font-bold tracking-tighter mb-6 leading-tight">
            Planetary Defense <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-cyan via-blue-400 to-slate-500">
              Starts with Awareness
            </span>
          </h1>
          
          <p className="text-xl text-white/60 max-w-2xl mx-auto mb-10 leading-relaxed">
            Orbit tracks every Near-Earth Object in real-time. Monitor close approaches, 
            analyze potential hazards, and stay informed about our cosmic neighborhood.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button className="px-8 py-4 bg-brand-cyan text-black font-bold rounded-full flex items-center gap-2 hover:scale-105 transition-transform glow-cyan">
              View Live Tracker <ArrowRight className="w-5 h-5" />
            </button>
            <button className="px-8 py-4 glass text-white font-bold rounded-full flex items-center gap-2 hover:bg-white/10 transition-colors">
              <Play className="w-5 h-5 fill-current" /> Orbital Mechanics
            </button>
          </div>
        </motion.div>

        {/* Feature Grid */}
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-24 max-w-5xl mx-auto"
        >
          {[
            { icon: Zap, title: "Real-time Tracking", desc: "Live data direct from NASA's Near Earth Object Web Service." },
            { icon: Shield, title: "Hazard Analysis", desc: "Automated risk assessment for potentially hazardous asteroids." },
            { icon: TrendingUp, title: "Velocity & Distance", desc: "Precise measurements of miss distance and relative velocity." },
          ].map((feature, i) => (
            <div key={i} className="glass p-8 rounded-3xl text-left hover:border-brand-cyan/30 transition-colors group">
              <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-brand-cyan/10 transition-colors">
                <feature.icon className="w-6 h-6 text-brand-cyan" />
              </div>
              <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
              <p className="text-white/50 leading-relaxed">{feature.desc}</p>
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
