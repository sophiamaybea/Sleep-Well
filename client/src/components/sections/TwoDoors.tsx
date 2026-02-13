import { Section } from "@/components/ui/section";
import { content } from "@/data";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { useRef } from "react";

function TiltCard({ children, className }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const mouseX = useMotionValue(0.5);
  const mouseY = useMotionValue(0.5);

  const rotateX = useSpring(useTransform(mouseY, [0, 1], [8, -8]), { stiffness: 200, damping: 20 });
  const rotateY = useSpring(useTransform(mouseX, [0, 1], [-8, 8]), { stiffness: 200, damping: 20 });
  const glareX = useTransform(mouseX, [0, 1], ["0%", "100%"]);
  const glareY = useTransform(mouseY, [0, 1], ["0%", "100%"]);
  const glareBackground = useTransform(
    [glareX, glareY],
    ([x, y]) => `radial-gradient(circle at ${x} ${y}, rgba(255,255,255,0.06) 0%, transparent 60%)`
  );

  function handleMouse(e: React.MouseEvent) {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    mouseX.set((e.clientX - rect.left) / rect.width);
    mouseY.set((e.clientY - rect.top) / rect.height);
  }

  function handleLeave() {
    mouseX.set(0.5);
    mouseY.set(0.5);
  }

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouse}
      onMouseLeave={handleLeave}
      style={{ rotateX, rotateY, transformPerspective: 800 }}
      className={className}
    >
      <motion.div
        className="absolute inset-0 rounded-xl pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{ background: glareBackground }}
      />
      {children}
    </motion.div>
  );
}

export default function TwoDoors() {
  return (
    <Section id="two-doors" className="bg-transparent text-primary py-32">
      <div className="space-y-24 max-w-7xl w-full mx-auto px-6">
        <div className="text-center space-y-6">
          <span className="font-mono text-xs tracking-[0.3em] opacity-40 block uppercase">
            01 — Choose Your Path
          </span>
          <h2 className="text-5xl md:text-7xl font-display italic font-light tracking-tight">
            {content.twoDoors.title}
          </h2>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 lg:gap-24 relative" style={{ perspective: "1000px" }}>
          <div className="absolute left-1/2 top-0 bottom-0 w-[1px] bg-gradient-to-b from-transparent via-white/10 to-transparent hidden lg:block" />

          {content.twoDoors.doors.map((door, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.2, duration: 0.8 }}
              viewport={{ once: true }}
              className="group relative"
            >
              <TiltCard className="relative h-full">
                <div className="relative h-full flex flex-col p-8 md:p-12 transition-all duration-500">
                  <div className="absolute inset-0 bg-gradient-to-b from-white/[0.03] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 rounded-xl" />
                  <div className="absolute inset-0 border border-white/5 rounded-xl transition-all duration-500 group-hover:border-white/15 group-hover:shadow-[0_0_40px_rgba(255,255,255,0.03)]" />

                  <div className="relative z-10 space-y-8 flex-grow">
                    <div className="space-y-4">
                      <motion.span
                        className="font-mono text-xs tracking-widest text-secondary/60 uppercase block"
                        whileHover={{ letterSpacing: "0.2em" }}
                        transition={{ duration: 0.3 }}
                      >
                        {door.subtitle}
                      </motion.span>
                      <h3 className="text-4xl md:text-5xl font-display font-light group-hover:text-white transition-colors duration-300">
                        {door.title}
                      </h3>
                    </div>

                    <p className="text-lg md:text-xl opacity-70 leading-relaxed font-serif font-light group-hover:opacity-90 transition-opacity duration-500">
                      {door.description}
                    </p>

                    <ul className="space-y-4 pt-4 border-t border-white/5">
                      {door.points.map((point, i) => (
                        <motion.li
                          key={i}
                          initial={{ opacity: 0, x: -10 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.3 + i * 0.08, duration: 0.4 }}
                          viewport={{ once: true }}
                          className="flex gap-4 items-start text-sm font-mono opacity-60 group-hover:opacity-80 transition-opacity"
                        >
                          <motion.span
                            className="text-secondary opacity-40"
                            whileInView={{ rotate: [0, 180, 360] }}
                            transition={{ delay: 0.5 + i * 0.1, duration: 0.6 }}
                            viewport={{ once: true }}
                          >
                            ✦
                          </motion.span>
                          {point}
                        </motion.li>
                      ))}
                    </ul>
                  </div>

                  <a
                    href={door.href}
                    className="relative z-10 flex items-center gap-4 mt-12 py-4 group/btn"
                    data-testid={`link-door-${index}`}
                  >
                    <span className="font-mono text-xs uppercase tracking-widest opacity-60 group-hover/btn:opacity-100 transition-opacity">
                      {door.cta}
                    </span>
                    <motion.span
                      className="p-2 border border-white/10 rounded-full group-hover/btn:bg-white group-hover/btn:text-background transition-all duration-300"
                      whileHover={{ scale: 1.1, x: 4 }}
                    >
                      <ArrowRight size={16} />
                    </motion.span>
                  </a>
                </div>
              </TiltCard>
            </motion.div>
          ))}
        </div>
      </div>
    </Section>
  );
}
