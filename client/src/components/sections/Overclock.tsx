import { Section } from "@/components/ui/section";
import { content } from "@/data";
import { motion, useAnimation } from "framer-motion";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

export default function Overclock() {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [systemStatuses, setSystemStatuses] = useState(
    Array.from({ length: 12 }).map((_, i) => ({
      id: i,
      name: `SYSTEM_CHECK_${i + 10}`,
      status: i > 8 ? "OVERHEAT" : "OK",
      value: Math.floor(Math.random() * 100)
    }))
  );

  useEffect(() => {
    const interval = setInterval(() => {
      setSystemStatuses(prev => prev.map(item => ({
        ...item,
        value: Math.floor(Math.random() * 100),
        status: Math.random() > 0.9 ? "WARN" : item.status
      })));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <Section id="section-4" className="bg-destructive text-destructive-foreground overflow-hidden">
      <div className="grid lg:grid-cols-2 gap-12 items-center relative z-10">
        <div className="order-2 lg:order-1 relative">
          <div className="absolute inset-0 bg-gradient-to-tr from-destructive/50 via-transparent to-transparent opacity-50 blur-3xl" />
          
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            className="border border-white/20 p-6 rounded-lg bg-black/40 backdrop-blur-md shadow-2xl relative overflow-hidden group"
          >
            {/* Scanline effect */}
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/5 to-transparent h-[10px] w-full animate-scan pointer-events-none" />

            <div className="flex justify-between items-center mb-6 border-b border-white/20 pb-4">
               <span className="font-mono text-sm tracking-widest">CPU TEMPERATURE</span>
               <span className="font-mono text-2xl font-bold text-red-500 animate-pulse">98°C</span>
            </div>

            <div className="grid grid-cols-1 gap-2 font-mono text-xs">
              {systemStatuses.map((item, i) => (
                <motion.div 
                  key={item.id}
                  onHoverStart={() => setHoveredIndex(i)}
                  onHoverEnd={() => setHoveredIndex(null)}
                  className={cn(
                    "flex justify-between items-center p-2 rounded cursor-crosshair transition-colors",
                    hoveredIndex === i ? "bg-white/10" : "hover:bg-white/5",
                    item.status === "OVERHEAT" ? "bg-red-500/10 border border-red-500/30" : ""
                  )}
                >
                  <div className="flex gap-4">
                    <span className="opacity-50 w-8">0{i}</span>
                    <span>{item.name}</span>
                  </div>
                  <div className="flex gap-4">
                     <span className="opacity-50">[{item.value}%]</span>
                     <span className={cn(
                       "font-bold w-20 text-right",
                       item.status === "OVERHEAT" ? "text-red-500 animate-pulse" : 
                       item.status === "WARN" ? "text-yellow-400" : "text-green-400"
                     )}>
                       {item.status}
                     </span>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>

        <div className="order-1 lg:order-2 space-y-8">
          <span className="font-mono text-xs tracking-[0.2em] opacity-60 block flex items-center gap-2">
            <span className="w-2 h-2 bg-white rounded-full animate-ping" />
            {content.overclock.eyebrow}
          </span>
          <h2 className="text-5xl md:text-7xl font-display font-bold leading-none tracking-tight">
            BE ON THE <br/>
            <span className="text-stroke text-transparent relative">
              CLOCK
              <motion.span 
                className="absolute inset-0 text-white opacity-20 blur-sm"
                animate={{ opacity: [0.2, 0.5, 0.2] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                CLOCK
              </motion.span>
            </span>
          </h2>
          <h3 className="text-xl font-mono uppercase tracking-widest border-l-4 border-white pl-4">
            {content.overclock.subtitle}
          </h3>
          <p className="text-xl leading-relaxed opacity-90">
            {content.overclock.text}
          </p>
          <motion.div 
            whileHover={{ scale: 1.05 }}
            className="inline-block bg-white text-destructive font-bold px-6 py-3 uppercase tracking-widest text-sm shadow-[0_0_20px_rgba(255,255,255,0.3)] cursor-pointer"
          >
            {content.overclock.warning}
          </motion.div>
        </div>
      </div>
    </Section>
  );
}
