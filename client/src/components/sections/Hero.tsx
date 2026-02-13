import { useState, useEffect, useRef } from "react";
import { Section } from "@/components/ui/section";
import { content } from "@/data";
import { motion, useMotionValue, useTransform, useSpring } from "framer-motion";
import StarTitle from "@/components/StarTitle";

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return "Good morning, writer.";
  if (hour >= 12 && hour < 17) return "Good afternoon, writer.";
  if (hour >= 17 && hour < 21) return "Good evening, writer.";
  return "The night is yours, writer.";
}

function MagneticLink({ href, children, className }: { href: string; children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLAnchorElement>(null);
  const x = useSpring(0, { stiffness: 200, damping: 15 });
  const y = useSpring(0, { stiffness: 200, damping: 15 });

  function handleMove(e: React.MouseEvent) {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    x.set((e.clientX - cx) * 0.25);
    y.set((e.clientY - cy) * 0.25);
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
    >
      {children}
    </motion.a>
  );
}

function WordReveal({ text, className, delay = 0 }: { text: string; className?: string; delay?: number }) {
  const words = text.split(" ");
  return (
    <span className={className}>
      {words.map((word, i) => (
        <motion.span
          key={i}
          initial={{ opacity: 0, y: 20, filter: "blur(4px)" }}
          whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ delay: delay + i * 0.06, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          viewport={{ once: true }}
          className="inline-block mr-[0.3em]"
        >
          {word}
        </motion.span>
      ))}
    </span>
  );
}

export default function Hero() {
  const [greeting, setGreeting] = useState(getGreeting);

  useEffect(() => {
    const interval = setInterval(() => setGreeting(getGreeting()), 60000);
    return () => clearInterval(interval);
  }, []);

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  function handleMouseMove({ currentTarget, clientX, clientY }: React.MouseEvent) {
    const { left, top, width, height } = currentTarget.getBoundingClientRect();
    const x = (clientX - left) / width - 0.5;
    const y = (clientY - top) / height - 0.5;
    mouseX.set(x);
    mouseY.set(y);
  }

  const textX = useTransform(mouseX, [-0.5, 0.5], ["2%", "-2%"]);
  const textY = useTransform(mouseY, [-0.5, 0.5], ["2%", "-2%"]);

  return (
    <>
      <StarTitle />

      <Section
        id="hero-content"
        className="bg-transparent text-primary relative z-10 min-h-[50vh] pt-0"
      >
        <div
          className="absolute inset-0 z-10"
          onMouseMove={handleMouseMove}
        >
          <div className="grid lg:grid-cols-12 gap-12 items-center relative h-full px-6 md:px-12 lg:px-24">
            <div className="lg:col-span-8 space-y-8 pointer-events-none">
              <motion.div
                style={{ x: textX, y: textY }}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
                viewport={{ margin: "-100px" }}
              >
                <motion.div
                  className="flex items-center gap-4 mb-6"
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3, duration: 0.6 }}
                  viewport={{ once: true }}
                >
                  <span className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse shadow-[0_0_10px_rgba(255,255,255,0.5)]" />
                  <span className="font-mono text-xs tracking-[0.2em] text-secondary opacity-70 uppercase" data-testid="text-greeting">
                    {greeting}
                  </span>
                </motion.div>

                <h2 className="text-4xl md:text-5xl lg:text-6xl font-display font-light leading-[1.1] tracking-tight text-white/90 drop-shadow-[0_0_20px_rgba(0,0,0,0.8)]">
                  <WordReveal text="You don't submit." delay={0.1} />
                  <br />
                  <WordReveal text="You don't query." delay={0.4} />
                  <br />
                  <span className="italic font-medium text-white drop-shadow-[0_0_30px_rgba(255,255,255,0.15)]">
                    <WordReveal text="You just write." delay={0.7} />
                  </span>
                </h2>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: 1.0, duration: 0.8 }}
                viewport={{ once: true }}
                className="max-w-xl text-lg leading-relaxed font-serif opacity-80 backdrop-blur-sm p-6 border-l-2 border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/[0.07] transition-all duration-500"
              >
                {content.hero.subtitle}
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ delay: 1.2, duration: 1 }}
                viewport={{ once: true }}
                className="flex gap-6 pt-4 pointer-events-auto"
              >
                {content.hero.links.map((link, i) => (
                  <MagneticLink
                    key={i}
                    href={link.href}
                    className="font-mono text-sm uppercase tracking-widest border-b border-transparent hover:border-primary transition-all pb-1 hover:text-white"
                  >
                    {link.text}
                  </MagneticLink>
                ))}
              </motion.div>
            </div>
          </div>
        </div>
      </Section>
    </>
  );
}
