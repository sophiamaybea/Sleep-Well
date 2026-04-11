import { useRef, useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Link } from "wouter";
import { gsap, prefersReducedMotion } from "@/lib/gsap-init";
import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";

const FUNDING_GOAL = 5000;

function FoundingProgressBar() {
  const { data } = useQuery<{ raised: number }>({
    queryKey: ["/api/funding/progress"],
    queryFn: async () => {
      const res = await fetch("/api/funding/progress", { credentials: "include" });
      if (!res.ok) return { raised: 0 };
      return res.json();
    },
    staleTime: 1000 * 60 * 5,
  });

  const raised = data?.raised ?? 0;
  const pct = Math.min((raised / FUNDING_GOAL) * 100, 100);

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <span className="font-handwritten text-base text-[#6B2A2A]">
          £{raised.toLocaleString()} raised
        </span>
        <span className="font-mono text-[length:var(--text-label)] text-[#1C1208]/50 uppercase tracking-wider">
          Goal: £{FUNDING_GOAL.toLocaleString()}
        </span>
      </div>
      <div className="progress-bar-studio">
        <div className="progress-bar-studio-fill" style={{ width: `${pct}%` }} />
      </div>
      <p className="font-mono text-[length:var(--text-label)] text-[#1C1208]/40 uppercase tracking-wider">
        {pct.toFixed(0)}% funded — first print run
      </p>
    </div>
  );
}

export default function Hero() {
  const heroRef = useRef<HTMLDivElement>(null);
  const headlineRef = useRef<HTMLHeadingElement>(null);
  const shouldReduceMotion = useReducedMotion();
  const { user, isLoading: authLoading } = useAuth();
  const [bannerVisible, setBannerVisible] = useState(true);

  useEffect(() => {
    if (!headlineRef.current || prefersReducedMotion) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        headlineRef.current,
        { opacity: 0, y: 30, filter: "blur(2px)" },
        { opacity: 1, y: 0, filter: "blur(0px)", duration: 1.2, ease: "power3.out", delay: 0.2 }
      );
    });
    return () => ctx.revert();
  }, []);

  const writingHref = !authLoading && user ? "/garden" : "/sign-in";

  return (
    <div ref={heroRef} className="relative min-h-screen studio-paper flex flex-col">
      {/* Founding Digital Edition Banner */}
      {bannerVisible && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={shouldReduceMotion ? { duration: 0 } : { duration: 0.5, delay: 0.1 }}
          className="w-full bg-[#6B2A2A] text-[#F8F4EC] py-2.5 px-6 flex items-center justify-between z-40"
        >
          <p className="font-mono text-[length:var(--text-label)] tracking-[0.12em] uppercase text-center flex-1">
            <span className="font-handwritten text-base normal-case tracking-normal mr-2">✦</span>
            Founding Digital Edition Live — Digital drops now. First print run funded by you.
            <Link href="/editions/founding" className="ml-3 underline underline-offset-2 hover:text-[#F8F4EC]/80 transition-colors">
              Claim yours →
            </Link>
          </p>
          <button
            onClick={() => setBannerVisible(false)}
            className="ml-4 opacity-60 hover:opacity-100 transition-opacity text-lg leading-none"
            aria-label="Dismiss banner"
          >
            ×
          </button>
        </motion.div>
      )}

      {/* Hero Content */}
      <section
        id="hero-content"
        className="flex-1 pt-32 pb-24 px-6 md:px-12 lg:px-20 max-w-7xl mx-auto w-full"
      >
        <div className="grid lg:grid-cols-12 gap-16 items-start">
          {/* Main headline column */}
          <div className="lg:col-span-7 space-y-10">
            <motion.p
              initial={shouldReduceMotion ? {} : { opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.05 }}
              className="font-mono text-[length:var(--text-label)] tracking-[0.2em] uppercase text-[#6B2A2A]/70"
            >
              The Page Gallery Journal — Est. 2024
            </motion.p>

            <h1
              ref={headlineRef}
              className="font-display text-[clamp(2.8rem,7vw,5.5rem)] font-bold leading-[0.95] tracking-tight text-[#1C1208]"
              style={{ opacity: prefersReducedMotion ? 1 : 0 }}
            >
              Once an{" "}
              <span className="italic text-[#6B2A2A]">ENTREPRENEUR,</span>
              <br />
              always an{" "}
              <span className="italic text-[#6B2A2A]">ENTREPRENEUR.</span>
            </h1>

            {/* Mission copy */}
            <motion.div
              initial={shouldReduceMotion ? {} : { opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, delay: 0.5 }}
              className="space-y-4 max-w-xl"
            >
              <p className="font-sans text-base leading-relaxed text-[#1C1208]/70">
                The Page Gallery publishes poetry, fiction, and essays that resist easy resolution.
                We believe in writing that earns its silences — work that asks something of the reader.
              </p>
              <p className="font-sans text-sm leading-relaxed text-[#1C1208]/50">
                No slush pile. No query letters. No waiting rooms.
                Every writer gets a Desk — a private space for drafts, fragments, and work that isn't ready yet.
              </p>
            </motion.div>

            {/* CTAs */}
            <motion.div
              initial={shouldReduceMotion ? {} : { opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, delay: 0.65 }}
              className="flex flex-wrap items-center gap-4 pt-2"
            >
              <Link
                href="/editions/founding"
                className="px-7 py-3 bg-[#6B2A2A] text-[#F8F4EC] rounded-full font-mono text-[length:var(--text-label)] tracking-[0.15em] uppercase hover:bg-[#5a2222] transition-colors shadow-md"
                data-testid="cta-founding-editions"
              >
                Founding Editions
              </Link>

              <Link
                href="/in-bloom"
                className="group flex items-center gap-2 font-display italic text-lg text-[#1C1208]/70 hover:text-[#6B2A2A] transition-colors"
                data-testid="cta-read-journal"
              >
                Read the Journal
                <span className="group-hover:translate-x-1 transition-transform">→</span>
              </Link>

              <Link
                href={writingHref}
                className="font-mono text-[length:var(--text-label)] uppercase tracking-[0.12em] text-[#1C1208]/40 hover:text-[#6B2A2A] transition-colors border-b border-transparent hover:border-[#6B2A2A]/40 pb-0.5"
                data-testid="cta-start-writing"
              >
                {!authLoading && user ? "Open Your Desk" : "Start Writing — it's free"}
              </Link>
            </motion.div>

            {/* Funding progress */}
            <motion.div
              initial={shouldReduceMotion ? {} : { opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, delay: 0.8 }}
              className="max-w-sm pt-2"
            >
              <FoundingProgressBar />
            </motion.div>
          </div>

          {/* Handwritten note — 1992 story */}
          <motion.aside
            initial={shouldReduceMotion ? {} : { opacity: 0, rotate: -3, y: 20 }}
            animate={{ opacity: 1, rotate: -1.5, y: 0 }}
            transition={shouldReduceMotion ? { duration: 0 } : { duration: 1.1, delay: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="lg:col-span-5 handwritten-note p-7 rounded-sm mt-8 lg:mt-24"
            aria-label="Founder's note"
          >
            <p className="font-handwritten text-xl text-[#1C1208]/80 leading-relaxed mb-4">
              1992. I was eleven, going door to door selling chocolate bars for the school.
            </p>
            <p className="font-handwritten text-lg text-[#1C1208]/70 leading-relaxed mb-4">
              My mum said I didn't need to. I did it anyway —
              something in me already knew: if you don't ask, the answer is always no.
            </p>
            <p className="font-handwritten text-lg text-[#1C1208]/70 leading-relaxed mb-4">
              That kid never left. She just found better things to sell.
            </p>
            <p className="font-handwritten text-lg text-[#6B2A2A] leading-relaxed">
              This journal is one of them. — S.
            </p>
            <div className="mt-5 flex items-center gap-2">
              <span className="font-mono text-[10px] text-[#1C1208]/30 uppercase tracking-widest">Pinned — Founder's desk</span>
            </div>
          </motion.aside>
        </div>
      </section>

      {/* Studio section divider */}
      <div className="studio-section-divider mx-6 md:mx-12" />
    </div>
  );
}

