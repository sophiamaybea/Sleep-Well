import { useState, useEffect, useRef, useCallback } from "react";
import { Link } from "wouter";
import { julyPoems, curatorLetter, type Poem } from "@/data/julyExhibitData";
import { ArrowUp, ArrowLeft } from "lucide-react";

function FloatingParticles({ count = 30 }: { count?: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    const particles: { x: number; y: number; vx: number; vy: number; size: number; alpha: number; pulse: number }[] = [];

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    for (let i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3 - 0.1,
        size: Math.random() * 2 + 0.5,
        alpha: Math.random() * 0.4 + 0.1,
        pulse: Math.random() * Math.PI * 2,
      });
    }

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.pulse += 0.01;
        const a = p.alpha * (0.5 + 0.5 * Math.sin(p.pulse));

        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(196, 162, 77, ${a})`;
        ctx.fill();
      });
      animId = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
    };
  }, [count]);

  return <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-[5]" />;
}

function ProgressBar() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const onScroll = () => {
      const h = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(h > 0 ? (window.scrollY / h) * 100 : 0);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="fixed top-0 left-0 right-0 z-50 h-[2px] bg-black/50">
      <div
        className="h-full transition-[width] duration-100 ease-linear"
        style={{ width: `${progress}%`, background: "linear-gradient(90deg, #9c27b0, #c4a24d)" }}
      />
    </div>
  );
}

function useScrollReveal(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, visible };
}

function RevealLine({ children, delay = 0, className = "" }: { children: React.ReactNode; delay?: number; className?: string }) {
  const { ref, visible } = useScrollReveal(0.1);
  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(20px)",
        transition: `opacity 0.8s cubic-bezier(0.22,1,0.36,1) ${delay}s, transform 0.8s cubic-bezier(0.22,1,0.36,1) ${delay}s`,
      }}
    >
      {children}
    </div>
  );
}

function PoemTransition() {
  return (
    <div className="py-16 md:py-24 flex items-center justify-center">
      <RevealLine>
        <div className="flex items-center gap-6">
          <div className="w-16 h-[1px] bg-gradient-to-r from-transparent to-[#c4a24d]/20" />
          <div className="w-1.5 h-1.5 rounded-full bg-[#c4a24d]/30" />
          <div className="w-16 h-[1px] bg-gradient-to-l from-transparent to-[#c4a24d]/20" />
        </div>
      </RevealLine>
    </div>
  );
}

function PoemSection({ poem, index }: { poem: Poem; index: number }) {
  const lines = poem.text.split("\n");
  const isPlaceholder = poem.text === "[Full text to be added]";
  const isLong = lines.length > 60 || poem.text.length > 3000;

  return (
    <section
      className="min-h-screen flex flex-col justify-center py-20 md:py-32 px-6 relative"
      data-testid={`poem-section-${poem.id}`}
      id={`poem-${poem.id}`}
    >
      <div className="max-w-[740px] mx-auto w-full">
        <RevealLine delay={0}>
          <p className="font-mono text-[9px] tracking-[0.4em] uppercase text-[#9c27b0]/50 mb-8">
            {String(index + 1).padStart(2, "0")} / {julyPoems.length}
          </p>
        </RevealLine>

        <RevealLine delay={0.1}>
          <h2
            className="text-2xl md:text-4xl lg:text-5xl font-light mb-4 uppercase"
            style={{
              fontFamily: "'Cormorant Garamond', Georgia, serif",
              color: "#2d8f2d",
              letterSpacing: "0.15em",
              lineHeight: 1.2,
            }}
          >
            {poem.title}
          </h2>
        </RevealLine>

        {poem.author && (
          <RevealLine delay={0.2}>
            <p
              className="text-base md:text-lg italic mb-12"
              style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", color: "#00bcd4" }}
            >
              {poem.author}
            </p>
          </RevealLine>
        )}

        {!poem.author && <div className="mb-12" />}

        {isPlaceholder ? (
          <RevealLine delay={0.3}>
            <div className="py-12 border border-white/[0.06] bg-white/[0.01] rounded-sm text-center">
              <p className="font-mono text-[10px] tracking-[0.3em] uppercase text-white/20">
                Full text coming soon
              </p>
            </div>
          </RevealLine>
        ) : (
          <div className={isLong ? "max-h-[70vh] overflow-y-auto pr-4 scrollbar-thin" : ""}>
            {lines.map((line, li) => {
              if (line.trim() === "") {
                return <div key={li} className="h-6" />;
              }
              return (
                <RevealLine key={li} delay={Math.min(0.3 + li * 0.04, 1.5)}>
                  <p
                    style={{
                      fontFamily: "'Georgia', 'Cormorant Garamond', serif",
                      fontSize: poem.type === "prose" ? "1.05rem" : "1.1rem",
                      lineHeight: poem.type === "prose" ? "2.0" : "1.9",
                      color: "#e0e0e0",
                      textIndent: poem.type === "prose" && li > 0 && lines[li - 1]?.trim() === "" ? "2em" : undefined,
                    }}
                  >
                    {line}
                  </p>
                </RevealLine>
              );
            })}
          </div>
        )}

        <RevealLine delay={0.5}>
          <div className="mt-12 flex items-center gap-3">
            <span className="font-mono text-[8px] tracking-[0.2em] uppercase text-white/15 border border-white/[0.06] px-2.5 py-1">
              {poem.type}
            </span>
          </div>
        </RevealLine>
      </div>
    </section>
  );
}

function Entrance({ onEnter }: { onEnter: () => void }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden">
      <div className="absolute inset-0 border-[12px] md:border-[20px] pointer-events-none z-10"
        style={{
          borderImage: "linear-gradient(135deg, #c4a24d 0%, #8b6914 25%, #c4a24d 50%, #8b6914 75%, #c4a24d 100%) 1",
        }}
      />

      <div className="absolute inset-0"
        style={{
          background: "linear-gradient(180deg, #0a0a0a 0%, #0d1520 30%, #0a0a0a 100%)",
        }}
      />

      <div className="absolute bottom-0 left-0 right-0 h-[40%]"
        style={{
          background: "linear-gradient(0deg, rgba(0,0,0,0.8) 0%, transparent 100%)",
        }}
      />

      <div className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: `
            linear-gradient(rgba(0, 188, 212, 0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0, 188, 212, 0.03) 1px, transparent 1px)
          `,
          backgroundSize: "60px 60px",
        }}
      />

      <div className="relative z-20 text-center px-6 space-y-8">
        <p className="font-mono text-[9px] tracking-[0.5em] uppercase text-[#00bcd4]/40">
          The Page Gallery Journal
        </p>

        <h1
          className="text-4xl md:text-6xl lg:text-7xl font-light"
          style={{
            fontFamily: "'Cormorant Garamond', Georgia, serif",
            color: "#e0e0e0",
            letterSpacing: "0.08em",
          }}
        >
          Exhibit 1: July
        </h1>

        <p
          className="text-base md:text-lg max-w-md mx-auto"
          style={{
            fontFamily: "'Georgia', serif",
            color: "#e0e0e0",
            opacity: 0.4,
            lineHeight: 1.8,
          }}
        >
          28 poems and prose pieces. Scroll to read.
        </p>

        <div className="pt-8">
          <button
            onClick={onEnter}
            data-testid="button-enter-exhibit"
            className="group relative px-12 py-5 border-2 border-[#9c27b0]/40 hover:border-[#9c27b0] transition-all duration-500 bg-[#9c27b0]/[0.05] hover:bg-[#9c27b0]/[0.12]"
          >
            <span
              className="font-mono text-sm tracking-[0.3em] uppercase text-[#9c27b0]/70 group-hover:text-[#9c27b0] transition-colors duration-500"
            >
              Enter the Exhibit
            </span>
          </button>
        </div>

        <p className="font-mono text-[8px] tracking-[0.3em] uppercase text-white/15 pt-4">
          Issue One &middot; {julyPoems.length} Works
        </p>
      </div>
    </div>
  );
}

function CuratorLetter() {
  return (
    <section className="min-h-screen flex flex-col justify-center py-24 md:py-32 px-6" data-testid="section-curator-letter">
      <div className="max-w-[640px] mx-auto w-full">
        <RevealLine>
          <div className="w-16 h-[1px] bg-[#c4a24d]/30 mb-12" />
        </RevealLine>

        <RevealLine delay={0.1}>
          <h2
            className="text-2xl md:text-3xl font-light italic mb-12"
            style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", color: "#c4a24d" }}
          >
            {curatorLetter.title}
          </h2>
        </RevealLine>

        <RevealLine delay={0.2}>
          <p style={{ fontFamily: "'Georgia', serif", fontSize: "1.05rem", lineHeight: 2, color: "#e0e0e0" }}>
            Thank you for walking through this exhibit. Every piece here was offered freely — planted by a writer who trusted the soil enough to let something grow in public.
          </p>
        </RevealLine>

        <RevealLine delay={0.3}>
          <p className="mt-8" style={{ fontFamily: "'Georgia', serif", fontSize: "1.05rem", lineHeight: 2, color: "#e0e0e0" }}>
            This journal exists because we believe the most important creative work happens before anyone sees it. The rough drafts. The fragments. The inner life that exits the world without ceremony when someone dies.
          </p>
        </RevealLine>

        <RevealLine delay={0.4}>
          <p className="mt-8" style={{ fontFamily: "'Georgia', serif", fontSize: "1.05rem", lineHeight: 2, color: "#e0e0e0" }}>
            The Garden holds that inner life. And this exhibit is a window into it.
          </p>
        </RevealLine>

        <RevealLine delay={0.5}>
          <div className="mt-16 pt-8 border-t border-white/[0.06]">
            <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.1rem", color: "#c4a24d", fontStyle: "italic" }}>
              {curatorLetter.signedBy}
            </p>
          </div>
        </RevealLine>

        <RevealLine delay={0.6}>
          <div className="mt-12">
            <p className="font-mono text-[9px] tracking-[0.3em] uppercase text-white/25 mb-3">
              Special thanks to
            </p>
            <p style={{ fontFamily: "'Georgia', serif", fontSize: "0.95rem", lineHeight: 1.8, color: "#e0e0e0", opacity: 0.5 }}>
              {curatorLetter.thanks}
            </p>
          </div>
        </RevealLine>

        <RevealLine delay={0.7}>
          <div className="mt-16 flex flex-wrap gap-4">
            <Link
              href="/exhibits"
              className="inline-flex items-center gap-2 px-8 py-4 border border-white/[0.1] hover:border-white/[0.2] text-white/50 hover:text-white/80 font-mono text-[10px] tracking-[0.2em] uppercase transition-all duration-300"
              data-testid="link-back-exhibits"
            >
              <ArrowLeft size={14} />
              All Exhibits
            </Link>
          </div>
        </RevealLine>
      </div>
    </section>
  );
}

function TableOfContents({ onSelect }: { onSelect: (id: string) => void }) {
  return (
    <section className="min-h-screen flex flex-col justify-center py-24 px-6" data-testid="section-toc">
      <div className="max-w-[640px] mx-auto w-full">
        <RevealLine>
          <p className="font-mono text-[9px] tracking-[0.4em] uppercase text-[#00bcd4]/40 mb-8">
            Contents
          </p>
        </RevealLine>

        <RevealLine delay={0.1}>
          <h2
            className="text-2xl md:text-3xl font-light mb-16"
            style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", color: "#e0e0e0", letterSpacing: "0.05em" }}
          >
            July Issue
          </h2>
        </RevealLine>

        <div className="space-y-0">
          {julyPoems.map((poem, i) => (
            <RevealLine key={poem.id} delay={Math.min(0.15 + i * 0.03, 1.2)}>
              <button
                onClick={() => onSelect(poem.id)}
                className="w-full text-left py-3 group flex items-baseline gap-4 border-b border-white/[0.03] hover:border-white/[0.08] transition-colors"
                data-testid={`toc-${poem.id}`}
              >
                <span className="font-mono text-[9px] text-white/15 shrink-0 w-6">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span
                  className="text-sm md:text-base group-hover:text-[#2d8f2d] transition-colors duration-300 flex-1"
                  style={{ fontFamily: "'Cormorant Garamond', serif", color: "#e0e0e0", opacity: 0.6 }}
                >
                  {poem.title}
                </span>
                {poem.author && (
                  <span className="font-mono text-[8px] tracking-[0.1em] text-white/20 shrink-0 hidden md:block">
                    {poem.author}
                  </span>
                )}
              </button>
            </RevealLine>
          ))}
        </div>
      </div>
    </section>
  );
}

export default function JulyExhibit() {
  const [entered, setEntered] = useState(false);
  const [showBackToTop, setShowBackToTop] = useState(false);

  useEffect(() => {
    const onScroll = () => setShowBackToTop(window.scrollY > window.innerHeight);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleEnter = useCallback(() => {
    setEntered(true);
    setTimeout(() => {
      window.scrollTo({ top: window.innerHeight, behavior: "smooth" });
    }, 100);
  }, []);

  const scrollToPoem = useCallback((id: string) => {
    const el = document.getElementById(`poem-${id}`);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  }, []);

  const scrollToTop = useCallback(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  useEffect(() => {
    document.title = "Exhibit 1: July — The Page Gallery Journal";
    return () => { document.title = "The Page Gallery Journal"; };
  }, []);

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white relative">
      <ProgressBar />
      <FloatingParticles count={25} />

      <div className="fixed top-3 left-0 right-0 z-40 flex justify-between items-center px-4 md:px-8 py-2">
        <Link
          href="/exhibits"
          className="font-mono text-[9px] tracking-[0.2em] uppercase text-white/20 hover:text-white/50 transition-colors bg-black/40 backdrop-blur-sm px-3 py-2 rounded-sm"
          data-testid="link-nav-exhibits"
        >
          <span className="flex items-center gap-1.5">
            <ArrowLeft size={10} />
            Exhibits
          </span>
        </Link>

        {entered && (
          <span className="font-mono text-[9px] tracking-[0.2em] uppercase text-white/15 bg-black/40 backdrop-blur-sm px-3 py-2 rounded-sm hidden md:block">
            July Issue
          </span>
        )}
      </div>

      <Entrance onEnter={handleEnter} />

      {entered && (
        <>
          <TableOfContents onSelect={scrollToPoem} />

          {julyPoems.map((poem, i) => (
            <div key={poem.id}>
              <PoemSection poem={poem} index={i} />
              {i < julyPoems.length - 1 && <PoemTransition />}
            </div>
          ))}

          <PoemTransition />
          <CuratorLetter />
        </>
      )}

      {showBackToTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 z-40 p-3 bg-black/60 backdrop-blur-sm border border-white/[0.08] hover:border-white/[0.2] text-white/40 hover:text-white/70 transition-all duration-300 rounded-sm"
          data-testid="button-back-to-top"
        >
          <ArrowUp size={18} />
        </button>
      )}
    </div>
  );
}
