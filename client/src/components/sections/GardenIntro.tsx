import { motion } from "framer-motion";
import { Link } from "wouter";

function SeedDoodle() {
  return (
    <svg viewBox="0 0 40 40" fill="none" className="w-12 h-12" xmlns="http://www.w3.org/2000/svg">
      <path d="M20 35 Q20 32 20 25" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M20 26 Q14 18 16 12 Q18 6 22 8 Q26 10 26 16 Q26 22 20 26Z" fill="currentColor" stroke="currentColor" strokeWidth="1.5" />
      <path d="M18 8 Q16 4 18 2 Q20 0 22 2 Q24 4 22 8" stroke="currentColor" strokeWidth="1.2" fill="none" strokeLinecap="round" />
    </svg>
  );
}

function SproutDoodle() {
  return (
    <svg viewBox="0 0 40 40" fill="none" className="w-12 h-12" xmlns="http://www.w3.org/2000/svg">
      <path d="M20 38 Q20 35 20 22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M20 28 Q12 20 10 18 Q8 16 10 14 Q14 12 18 18 L20 22Z" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M20 22 Q28 14 30 12 Q32 10 34 12 Q36 16 30 18 L20 22Z" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M20 18 Q19 10 20 6 Q21 2 23 4 Q25 8 22 14 L20 18Z" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function BloomDoodle() {
  return (
    <svg viewBox="0 0 40 40" fill="none" className="w-12 h-12" xmlns="http://www.w3.org/2000/svg">
      <path d="M20 38 Q20 35 20 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M20 20 Q14 10 10 8 Q6 7 8 12 Q10 16 18 20Z" stroke="currentColor" strokeWidth="1.8" fill="none" strokeLinecap="round" />
      <path d="M20 20 Q26 10 30 8 Q34 7 32 12 Q30 16 22 20Z" stroke="currentColor" strokeWidth="1.8" fill="none" strokeLinecap="round" />
      <path d="M20 20 Q20 8 18 4 Q16 0 20 0 Q24 0 22 4 Q20 8 20 20Z" stroke="currentColor" strokeWidth="1.8" fill="none" strokeLinecap="round" />
      <path d="M20 20 Q10 16 6 18 Q2 20 6 22 Q10 24 20 20Z" stroke="currentColor" strokeWidth="1.8" fill="none" strokeLinecap="round" />
      <path d="M20 20 Q30 16 34 18 Q38 20 34 22 Q30 24 20 20Z" stroke="currentColor" strokeWidth="1.8" fill="none" strokeLinecap="round" />
      <circle cx="20" cy="20" r="3.5" fill="currentColor" />
    </svg>
  );
}

const stages = [
  {
    stage: "Seed",
    icon: <SeedDoodle />,
    color: "text-amber-400/70",
    desc: "A private space for first drafts, fragments, and rough edges. Yours alone until you decide otherwise.",
  },
  {
    stage: "Sprout",
    icon: <SproutDoodle />,
    color: "text-emerald-400/70",
    desc: "Revise, reshape, let the work find its form. Still private, still yours.",
  },
  {
    stage: "Bloom",
    icon: <BloomDoodle />,
    color: "text-pink-300/70",
    desc: "Share your work publicly. Our editors read from here when selecting pieces for the journal.",
  },
];

export default function GardenIntro() {
  return (
    <section id="garden-intro" className="relative py-32 overflow-hidden" data-testid="section-garden-intro">
      <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse at 50% 30%, rgba(52,211,153,0.04) 0%, transparent 60%)" }} />

      <div className="max-w-4xl mx-auto px-6 relative z-10">
        {/* Section header */}
        <div className="text-center mb-24">
          <motion.span
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 0.4 }}
            transition={{ duration: 1.5 }}
            viewport={{ once: true }}
            className="font-mono text-[10px] tracking-[0.4em] block mb-8"
          >
            HOW IT WORKS
          </motion.span>

          <motion.h2
            initial={{ opacity: 0, y: 30, filter: "blur(8px)" }}
            whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
            viewport={{ once: true }}
            className="text-5xl md:text-7xl lg:text-8xl font-display font-light italic tracking-tight"
            data-testid="heading-garden-intro"
          >
            The Garden
          </motion.h2>

          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 0.7 }}
            transition={{ delay: 0.3, duration: 1 }}
            viewport={{ once: true }}
            className="text-lg md:text-xl font-serif italic leading-relaxed max-w-xl mx-auto mt-8 text-white/60"
          >
            Every writer here gets a private space &mdash; somewhere to work without
            an audience, on your own terms, at your own pace.
          </motion.p>
        </div>

        {/* Stages — flowing vertical layout, no cards */}
        <div className="space-y-20 md:space-y-28">
          {stages.map((item, i) => (
            <motion.div
              key={item.stage}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              viewport={{ once: true, margin: "-50px" }}
              className={`flex items-start gap-8 md:gap-12 ${
                i % 2 === 1 ? "md:flex-row-reverse md:text-right" : ""
              }`}
              data-testid={`card-stage-${item.stage.toLowerCase()}`}
            >
              {/* Icon */}
              <div className={`flex-shrink-0 ${item.color} mt-1`}>
                {item.icon}
              </div>

              {/* Text */}
              <div className="space-y-3">
                <h3 className={`font-display text-2xl md:text-3xl font-light italic ${item.color}`}>
                  {item.stage}
                </h3>
                <p className="font-serif text-base md:text-lg leading-relaxed text-white/50 max-w-md">
                  {item.desc}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 1 }}
          viewport={{ once: true }}
          className="text-center mt-24"
        >
          <Link
            href="/garden"
            className="inline-block font-serif italic text-lg text-white/40 hover:text-white/80 transition-colors duration-700 border-b border-white/10 hover:border-white/30 pb-1"
            data-testid="link-enter-garden"
          >
            Begin writing &rarr;
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
