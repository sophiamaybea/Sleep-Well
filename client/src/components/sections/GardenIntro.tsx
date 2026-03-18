import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { useRef, useState } from "react";

function SeedDoodle() {
  return (
    <svg viewBox="0 0 40 40" fill="none" className="w-10 h-10 mx-auto" xmlns="http://www.w3.org/2000/svg">
      <path d="M20 35 Q20 32 20 25" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M20 26 Q14 18 16 12 Q18 6 22 8 Q26 10 26 16 Q26 22 20 26Z" fill="currentColor" stroke="currentColor" strokeWidth="1.5" />
      <path d="M18 8 Q16 4 18 2 Q20 0 22 2 Q24 4 22 8" stroke="currentColor" strokeWidth="1.2" fill="none" strokeLinecap="round" />
    </svg>
  );
}

function SproutDoodle() {
  return (
    <svg viewBox="0 0 40 40" fill="none" className="w-10 h-10 mx-auto" xmlns="http://www.w3.org/2000/svg">
      <path d="M20 38 Q20 35 20 22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M20 28 Q12 20 10 18 Q8 16 10 14 Q14 12 18 18 L20 22Z" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M20 22 Q28 14 30 12 Q32 10 34 12 Q36 16 30 18 L20 22Z" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M20 18 Q19 10 20 6 Q21 2 23 4 Q25 8 22 14 L20 18Z" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function BloomDoodle() {
  return (
    <svg viewBox="0 0 40 40" fill="none" className="w-10 h-10 mx-auto" xmlns="http://www.w3.org/2000/svg">
      <path d="M20 38 Q20 35 20 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M20 20 Q14 10 10 8 Q6 7 8 12 Q10 16 18 20Z" stroke="currentColor" strokeWidth="1.8" fill="none" strokeLinecap="round" />
      <path d="M20 20 Q26 10 30 8 Q34 7 32 12 Q30 16 22 20Z" stroke="currentColor" strokeWidth="1.8" fill="none" strokeLinecap="round" />
      <path d="M20 20 Q20 8 18 4 Q16 0 20 0 Q24 0 22 4 Q20 8 20 20Z" stroke="currentColor" strokeWidth="1.8" fill="none" strokeLinecap="round" />
      <path d="M20 20 Q10 16 6 18 Q2 20 6 22 Q10 24 20 20Z" stroke="currentColor" strokeWidth="1.8" fill="none" strokeLinecap="round" />
      <path d="M20 20 Q30 16 34 18 Q38 20 34 22 Q30 24 20 20Z" stroke="currentColor" strokeWidth="1.8" fill="none" strokeLinecap="round" />
      <circle cx="20" cy="20" r="3.5" fill="currentColor" />
      <path d="M16 30 Q14 26 12 28" stroke="currentColor" strokeWidth="1.2" fill="none" strokeLinecap="round" />
    </svg>
  );
}

const stageColors: Record<string, { glow: string; border: string; text: string }> = {
  "Seed": {
    glow: "rgba(251,191,36,0.15)",
    border: "hover:border-amber-400/40",
    text: "group-hover:text-amber-300",
  },
  "Sprout": {
    glow: "rgba(52,211,153,0.15)",
    border: "hover:border-emerald-400/40",
    text: "group-hover:text-emerald-300",
  },
  "Bloom": {
    glow: "rgba(244,114,182,0.15)",
    border: "hover:border-pink-400/40",
    text: "group-hover:text-pink-300",
  },
};

function GrowCard({ item, index }: { item: { stage: string; icon: React.ReactNode; desc: string }; index: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const [hovered, setHovered] = useState(false);
  const mouseX = useMotionValue(0.5);
  const mouseY = useMotionValue(0.5);
  const bgX = useTransform(mouseX, [0, 1], ["0%", "100%"]);
  const bgY = useTransform(mouseY, [0, 1], ["0%", "100%"]);
  const colors = stageColors[item.stage];
  const glowBackground = useTransform(
    [bgX, bgY],
    ([x, y]) => `radial-gradient(circle at ${x} ${y}, ${colors.glow} 0%, transparent 70%)`
  );

  function handleMove(e: React.MouseEvent) {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    mouseX.set((e.clientX - rect.left) / rect.width);
    mouseY.set((e.clientY - rect.top) / rect.height);
  }

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 + index * 0.15, duration: 0.6 }}
      viewport={{ once: true }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => { setHovered(false); mouseX.set(0.5); mouseY.set(0.5); }}
      onMouseMove={handleMove}
      whileHover={{ scale: 1.05, y: -8 }}
      className={`group text-center space-y-4 p-8 border border-white/5 rounded-xl bg-white/[0.02] backdrop-blur-sm cursor-default relative overflow-hidden transition-colors duration-300 ${colors.border}`}
      data-testid={`card-stage-${item.stage.toLowerCase()}`}
    >
      <motion.div
        className="absolute inset-0 pointer-events-none rounded-xl"
        style={{ background: glowBackground }}
        animate={{ opacity: hovered ? 1 : 0 }}
        transition={{ duration: 0.3 }}
      />
      <motion.div
        className="text-white/90 relative z-10"
        animate={{ scale: hovered ? 1.4 : 1, rotate: hovered ? [0, -5, 5, 0] : 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 12 }}
      >
        {item.icon}
      </motion.div>
      <h3 className={`font-display text-xl font-light relative z-10 transition-colors duration-300 ${colors.text}`}>
        {item.stage}
      </h3>
      <p className="text-sm font-serif opacity-80 leading-relaxed relative z-10 group-hover:opacity-100 transition-opacity duration-300">
        {item.desc}
      </p>
    </motion.div>
  );
}

function MagneticLink({ href, children, className, testId }: { href: string; children: React.ReactNode; className?: string; testId?: string }) {
  const ref = useRef<HTMLAnchorElement>(null);
  const x = useSpring(0, { stiffness: 150, damping: 12 });
  const y = useSpring(0, { stiffness: 150, damping: 12 });

  function handleMove(e: React.MouseEvent) {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    x.set((e.clientX - cx) * 0.4);
    y.set((e.clientY - cy) * 0.4);
  }

  function handleLeave() {
    x.set(0);
    y.set(0);
  }

  return (
    <motion.a
      ref={ref}
      href={href}
      style={{ x, y }}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      className={className}
      data-testid={testId}
      whileHover={{ scale: 1.05 }}
    >
      {children}
    </motion.a>
  );
}

export default function GardenIntro() {
  const stages = [
    {
      stage: "Seed",
      icon: <SeedDoodle />,
      desc: "A private space for first drafts, fragments, and rough edges. Yours alone until you decide otherwise."
    },
    {
      stage: "Sprout",
      icon: <SproutDoodle />,
      desc: "Revise, reshape, let the work find its form. Still private, still yours."
    },
    {
      stage: "Bloom",
      icon: <BloomDoodle />,
      desc: "Share your work publicly. Our editors read from here when selecting pieces for the journal."
    }
  ];

  return (
    <section id="garden-intro" className="relative pt-24 pb-40 overflow-hidden" data-testid="section-garden-intro">
      <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse at 50% 10%, rgba(52,211,153,0.05) 0%, transparent 50%)" }} />
      <div className="max-w-5xl mx-auto w-full px-6 relative">
        <div className="text-center space-y-10 relative z-10">
          <motion.span
            initial={{ opacity: 0, y: -10, letterSpacing: "0.15em" }}
            whileInView={{ opacity: 0.8, y: 0, letterSpacing: "0.3em" }}
            transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
            viewport={{ once: true, margin: "100px" }}
            className="font-mono text-xs tracking-[0.3em] block uppercase"
          >
            How It Works
          </motion.span>

          <div className="relative">
            <motion.div
              className="absolute inset-0 -inset-x-20 pointer-events-none"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 2, ease: [0.22, 1, 0.36, 1] }}
              viewport={{ once: true, margin: "50px" }}
              style={{ background: "radial-gradient(ellipse at 50% 50%, rgba(255,255,255,0.03) 0%, transparent 60%)" }}
            />
            <motion.h2
              initial={{ opacity: 0, y: 30, filter: "blur(12px)", scale: 0.95 }}
              whileInView={{ opacity: 1, y: 0, filter: "blur(0px)", scale: 1 }}
              transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
              viewport={{ once: true, margin: "50px" }}
              className="text-5xl md:text-7xl font-display font-light tracking-normal italic relative"
              data-testid="heading-garden-intro"
            >
              The Garden
            </motion.h2>
          </div>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 0.9, y: 0 }}
            transition={{ delay: 0.2, duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
            viewport={{ once: true }}
            className="text-lg md:text-xl font-serif font-light leading-relaxed max-w-2xl mx-auto"
          >
            Every writer here gets a private space — somewhere to work without
            an audience, on your own terms, at your own pace.
          </motion.p>

          <div className="grid md:grid-cols-3 gap-8 pt-12 max-w-3xl mx-auto">
            {stages.map((item, i) => (
              <GrowCard key={item.stage} item={item} index={i} />
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.8 }}
            viewport={{ once: true }}
            className="pt-8"
          >
            <MagneticLink
              href="/garden"
              className="inline-flex items-center gap-3 font-mono text-sm uppercase tracking-widest border-b border-white/20 hover:border-white/60 transition-all pb-2 hover:text-white"
              testId="link-enter-garden"
            >
              Begin Writing
              <motion.span
                className="text-lg inline-block"
                whileHover={{ x: 8, scale: 1.3 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                →
              </motion.span>
            </MagneticLink>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
