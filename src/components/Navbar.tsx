import { motion } from "motion/react";
import { LayoutDashboard, Zap, Globe, MessageSquare, Settings, User, Radar } from "lucide-react";
import { cn } from "@/src/lib/utils";

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export default function Navbar({ activeTab, setActiveTab }: NavbarProps) {
  const navItems = [
    { id: "home", label: "Overview", icon: LayoutDashboard },
    { id: "market", label: "Live Tracker", icon: Radar },
    { id: "graph", label: "Orbit Map", icon: Globe },
    { id: "chat", label: "Astro AI", icon: MessageSquare },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 flex justify-center p-6">
      <motion.div 
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="glass-dark px-6 py-3 rounded-full flex items-center gap-8"
      >
        <div className="flex items-center gap-2 mr-4">
          <div className="w-8 h-8 bg-brand-cyan rounded-lg glow-cyan flex items-center justify-center">
            <Radar className="w-5 h-5 text-black" />
          </div>
          <span className="font-bold tracking-tighter text-xl">ASTROGUARD</span>
        </div>

        <div className="flex items-center gap-1">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={cn(
                "px-4 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-2",
                activeTab === item.id 
                  ? "bg-white/10 text-brand-cyan" 
                  : "text-white/60 hover:text-white hover:bg-white/5"
              )}
            >
              <item.icon className="w-4 h-4" />
              {item.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3 ml-4 pl-4 border-l border-white/10">
          <button className="p-2 text-white/60 hover:text-white transition-colors">
            <Settings className="w-5 h-5" />
          </button>
          <button className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-cyan to-blue-600 p-[1px]">
            <div className="w-full h-full rounded-full bg-brand-bg flex items-center justify-center">
              <User className="w-4 h-4 text-brand-cyan" />
            </div>
          </button>
        </div>
      </motion.div>
    </nav>
  );
}
