import { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import { motion } from "motion/react";
import { Search, Filter, Maximize2, Loader2 } from "lucide-react";
import { getAsteroidFeed, Asteroid } from "@/src/services/nasa";

export default function KnowledgeGraph() {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [asteroids, setAsteroids] = useState<Asteroid[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      const data = await getAsteroidFeed();
      setAsteroids(data.slice(0, 15)); // Show top 15 closest
      setIsLoading(false);
    }
    fetchData();
  }, []);

  useEffect(() => {
    if (!svgRef.current || !containerRef.current || asteroids.length === 0) return;

    const width = containerRef.current.clientWidth;
    const height = 600;

    const svg = d3.select(svgRef.current)
      .attr("width", width)
      .attr("height", height)
      .attr("viewBox", [0, 0, width, height]);

    svg.selectAll("*").remove();

    // Prepare data for visualization
    const nodes = [
      { id: "Earth", type: "planet", r: 25, color: "#3B82F6" },
      ...asteroids.map(a => ({
        id: a.name,
        type: "asteroid",
        r: Math.max(4, a.estimated_diameter.kilometers.estimated_diameter_max * 10),
        color: a.is_potentially_hazardous_asteroid ? "#ef4444" : "#94a3b8",
        distance: parseFloat(a.close_approach_data[0].miss_distance.kilometers)
      }))
    ];

    const maxDist = d3.max(nodes.filter(n => n.type === "asteroid"), n => (n as any).distance) || 1;
    const distScale = d3.scaleLinear()
      .domain([0, maxDist])
      .range([60, Math.min(width, height) / 2 - 40]);

    // Simulation
    const simulation = d3.forceSimulation(nodes as any)
      .force("charge", d3.forceManyBody().strength(-100))
      .force("center", d3.forceCenter(width / 2, height / 2))
      .force("collision", d3.forceCollide().radius((d: any) => d.r + 5))
      .force("radial", d3.forceRadial((d: any) => d.type === "planet" ? 0 : distScale(d.distance), width / 2, height / 2).strength(1));

    // Draw orbits
    const orbits = svg.append("g")
      .attr("class", "orbits")
      .selectAll("circle")
      .data(nodes.filter(n => n.type === "asteroid"))
      .join("circle")
      .attr("cx", width / 2)
      .attr("cy", height / 2)
      .attr("r", (d: any) => distScale(d.distance))
      .attr("fill", "none")
      .attr("stroke", "rgba(255,255,255,0.05)")
      .attr("stroke-dasharray", "4,4");

    const node = svg.append("g")
      .selectAll("g")
      .data(nodes)
      .join("g");

    node.append("circle")
      .attr("r", (d: any) => d.r)
      .attr("fill", (d: any) => d.color)
      .attr("class", (d: any) => d.type === "planet" ? "glow-blue" : "")
      .style("filter", (d: any) => d.type === "planet" ? "drop-shadow(0 0 10px #3B82F6)" : "none");

    node.append("text")
      .text((d: any) => d.id)
      .attr("x", (d: any) => d.r + 5)
      .attr("y", 4)
      .attr("fill", "rgba(255,255,255,0.4)")
      .attr("font-size", "10px")
      .attr("font-family", "Inter");

    simulation.on("tick", () => {
      node.attr("transform", (d: any) => `translate(${d.x},${d.y})`);
    });

    return () => {
      simulation.stop();
    };
  }, [asteroids]);

  return (
    <div className="container mx-auto px-6 pt-32 pb-20">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-4xl font-bold tracking-tight mb-2">Orbital Map</h2>
          <p className="text-white/50">Visualizing Near-Earth Object trajectories relative to Earth</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="p-2 glass rounded-xl hover:bg-white/10 transition-colors">
            <Maximize2 className="w-5 h-5" />
          </button>
        </div>
      </div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        ref={containerRef}
        className="glass rounded-[2.5rem] overflow-hidden relative h-[600px] bg-black/20"
      >
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center z-20 bg-black/40 backdrop-blur-sm">
            <Loader2 className="w-12 h-12 text-brand-cyan animate-spin" />
          </div>
        )}
        
        <div className="absolute top-8 left-8 z-10 space-y-2">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-blue-500" />
            <span className="text-xs text-white/60">Earth</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500" />
            <span className="text-xs text-white/60">Hazardous NEO</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-slate-400" />
            <span className="text-xs text-white/60">Safe Asteroid</span>
          </div>
        </div>
        
        <svg ref={svgRef} className="w-full h-full" />

        <div className="absolute bottom-8 right-8 z-10 glass p-4 rounded-2xl max-w-xs">
          <h4 className="font-bold text-sm mb-2">Map Legend</h4>
          <p className="text-xs text-white/50 leading-relaxed">
            Distances are scaled for visualization. Dashed lines represent orbital proximity. 
            Node size corresponds to estimated asteroid diameter.
          </p>
        </div>
      </motion.div>
    </div>
  );
}
