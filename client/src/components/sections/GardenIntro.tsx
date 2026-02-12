import { motion } from "framer-motion";

const doodleAnim = (delay: number, rotate = -8) => ({
  initial: { opacity: 0, scale: 0.3, rotate },
  whileInView: { opacity: 1, scale: 1, rotate: 0 },
  transition: { delay, duration: 0.5, type: "spring" as const, stiffness: 100 },
  viewport: { once: true, margin: "-40px" },
});

function InkBouquet({ className, delay = 0 }: { className?: string; delay?: number }) {
  return (
    <motion.svg {...doodleAnim(delay, -12)} className={className} viewBox="0 0 100 140" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M45 140 C45 140 47 95 48 85 C49 78 44 80 45 85 L45 140Z" stroke="#d4c9a8" strokeWidth="2.5" fill="#d4c9a8" strokeLinecap="round" />
      <path d="M43 92 Q35 86 32 88 Q30 92 38 93 Z" fill="#d4c9a8" stroke="#b8a87a" strokeWidth="1" />
      <path d="M48 88 Q56 82 58 85 Q59 89 50 90 Z" fill="#d4c9a8" stroke="#b8a87a" strokeWidth="1" />
      <path d="M38 78 Q30 68 28 58 Q27 48 35 42 Q40 38 42 45 Q43 52 38 60 Q35 68 38 78Z" fill="none" stroke="#1a1a1a" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M42 75 Q38 62 40 50 Q42 40 48 36 Q55 33 55 42 Q55 50 50 58 Q46 66 42 75Z" fill="none" stroke="#1a1a1a" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M48 72 Q52 60 58 52 Q63 44 68 42 Q74 40 72 48 Q70 56 62 62 Q54 68 48 72Z" fill="none" stroke="#1a1a1a" strokeWidth="2.5" strokeLinecap="round" />
      <circle cx="33" cy="45" r="3" fill="#1a1a1a" />
      <circle cx="40" cy="38" r="2.5" fill="#1a1a1a" />
      <circle cx="48" cy="36" r="3" fill="#1a1a1a" />
      <circle cx="55" cy="38" r="2" fill="#1a1a1a" />
      <circle cx="62" cy="44" r="2.5" fill="#1a1a1a" />
      <circle cx="68" cy="42" r="2" fill="#1a1a1a" />
      <circle cx="36" cy="52" r="2" fill="#1a1a1a" />
      <circle cx="52" cy="42" r="1.5" fill="#1a1a1a" />
      <path d="M40 95 Q38 90 42 88 Q46 86 50 88 Q54 90 52 95 Q48 98 44 97 Q40 96 40 95Z" stroke="#1a1a1a" strokeWidth="2" fill="none" />
      <path d="M44 98 L43 105 Q42 108 46 108 Q50 108 49 105 L48 98" stroke="#1a1a1a" strokeWidth="1.8" fill="none" />
    </motion.svg>
  );
}

function InkFlowerEye({ className, delay = 0 }: { className?: string; delay?: number }) {
  return (
    <motion.svg {...doodleAnim(delay, 15)} className={className} viewBox="0 0 90 110" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M44 110 L44 65 Q43 60 45 58" stroke="#1a1a1a" strokeWidth="2" strokeLinecap="round" />
      <path d="M44 80 Q36 72 30 74 Q28 78 36 80 Q40 80 44 80Z" stroke="#1a1a1a" strokeWidth="1.5" fill="none" />
      <path d="M45 55 Q38 42 32 38 Q26 36 28 42 Q30 48 38 52 L45 55Z" stroke="#1a1a1a" strokeWidth="2" fill="none" strokeLinecap="round" />
      <path d="M45 55 Q52 42 58 38 Q64 36 62 42 Q60 48 52 52 L45 55Z" stroke="#1a1a1a" strokeWidth="2" fill="none" strokeLinecap="round" />
      <path d="M45 55 Q45 42 42 34 Q40 28 44 26 Q48 24 50 30 Q52 36 48 45 L45 55Z" stroke="#1a1a1a" strokeWidth="2" fill="none" strokeLinecap="round" />
      <path d="M45 55 Q34 50 28 52 Q24 54 28 58 Q32 62 40 58 L45 55Z" stroke="#1a1a1a" strokeWidth="2" fill="none" strokeLinecap="round" />
      <path d="M45 55 Q56 50 62 52 Q66 54 62 58 Q58 62 50 58 L45 55Z" stroke="#1a1a1a" strokeWidth="2" fill="none" strokeLinecap="round" />
      <ellipse cx="45" cy="55" rx="8" ry="5" stroke="#1a1a1a" strokeWidth="2" fill="none" />
      <circle cx="45" cy="55" r="3" fill="#1a1a1a" />
      <path d="M42 70 Q38 66 35 68" stroke="#1a1a1a" strokeWidth="1.2" fill="none" strokeLinecap="round" />
      <path d="M48 70 Q52 66 55 68" stroke="#1a1a1a" strokeWidth="1.2" fill="none" strokeLinecap="round" />
    </motion.svg>
  );
}

function InkLeaf({ className, delay = 0 }: { className?: string; delay?: number }) {
  return (
    <motion.svg {...doodleAnim(delay, -20)} className={className} viewBox="0 0 70 90" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M35 85 L35 50" stroke="#1a1a1a" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M35 50 Q20 35 22 20 Q24 8 35 10 Q46 8 48 20 Q50 35 35 50Z" fill="#1a1a1a" stroke="#1a1a1a" strokeWidth="1" />
      <path d="M35 48 L35 18" stroke="#d4c9a8" strokeWidth="1.5" strokeLinecap="round" opacity="0.4" />
      <path d="M35 40 L26 30" stroke="#d4c9a8" strokeWidth="1" strokeLinecap="round" opacity="0.3" />
      <path d="M35 38 L44 28" stroke="#d4c9a8" strokeWidth="1" strokeLinecap="round" opacity="0.3" />
      <path d="M35 32 L28 24" stroke="#d4c9a8" strokeWidth="1" strokeLinecap="round" opacity="0.3" />
      <path d="M35 30 L42 22" stroke="#d4c9a8" strokeWidth="1" strokeLinecap="round" opacity="0.3" />
      <path d="M30 70 Q24 62 20 64 Q18 68 24 70 Z" fill="#1a1a1a" stroke="#1a1a1a" strokeWidth="1" />
      <path d="M40 65 Q46 58 50 60 Q52 64 46 66 Z" fill="#1a1a1a" stroke="#1a1a1a" strokeWidth="1" />
    </motion.svg>
  );
}

function InkStar({ className, delay = 0 }: { className?: string; delay?: number }) {
  return (
    <motion.svg {...doodleAnim(delay, 10)} className={className} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M50 8 Q52 30 54 34 Q58 36 78 32 Q60 42 58 46 Q60 50 76 70 Q54 56 50 54 Q46 56 24 70 Q40 50 42 46 Q40 42 22 32 Q42 36 46 34 Q48 30 50 8Z"
        stroke="#4a5a8a" strokeWidth="3" fill="none" strokeLinejoin="round" strokeLinecap="round"
      />
      <path
        d="M50 14 Q52 32 54 36 Q56 37 72 34 Q58 43 56 46 Q58 50 70 64 Q53 54 50 52 Q47 54 30 64 Q42 50 44 46 Q42 43 28 34 Q44 37 46 36 Q48 32 50 14Z"
        stroke="#4a5a8a" strokeWidth="1.5" fill="none" opacity="0.4" strokeLinejoin="round"
      />
    </motion.svg>
  );
}

function InkHeart({ className, delay = 0 }: { className?: string; delay?: number }) {
  return (
    <motion.svg {...doodleAnim(delay, -5)} className={className} viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="8" y="8" width="64" height="50" rx="3" stroke="#8a5a6a" strokeWidth="2" fill="none" strokeDasharray="4 2" />
      <rect x="12" y="12" width="56" height="42" rx="2" stroke="#8a5a6a" strokeWidth="1" fill="none" opacity="0.3" />
      <path
        d="M40 50 Q28 38 28 30 Q28 22 34 22 Q38 22 40 26 Q42 22 46 22 Q52 22 52 30 Q52 38 40 50Z"
        fill="#8a3030" stroke="#1a1a1a" strokeWidth="1.5"
      />
      <circle cx="18" cy="18" r="1.5" fill="#8a5a6a" opacity="0.6" />
      <circle cx="62" cy="18" r="1.5" fill="#8a5a6a" opacity="0.6" />
      <circle cx="18" cy="48" r="1.5" fill="#8a5a6a" opacity="0.6" />
      <circle cx="62" cy="48" r="1.5" fill="#8a5a6a" opacity="0.6" />
    </motion.svg>
  );
}

function InkSprout({ className, delay = 0 }: { className?: string; delay?: number }) {
  return (
    <motion.svg {...doodleAnim(delay)} className={className} viewBox="0 0 50 70" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M25 68 Q25 65 26 45 Q27 38 25 35" stroke="#1a1a1a" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M25 40 Q18 30 14 28 Q10 27 12 32 Q14 38 22 42 L25 40Z" fill="#1a1a1a" stroke="#1a1a1a" strokeWidth="1" />
      <path d="M25 35 Q32 25 36 22 Q40 20 38 26 Q36 32 28 38 L25 35Z" fill="#1a1a1a" stroke="#1a1a1a" strokeWidth="1" />
      <path d="M25 32 Q24 22 26 18 Q28 14 30 18 Q32 24 27 32Z" fill="#1a1a1a" stroke="#1a1a1a" strokeWidth="1" />
    </motion.svg>
  );
}

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

export default function GardenIntro() {
  return (
    <section id="garden-intro" className="relative py-32 overflow-hidden" data-testid="section-garden-intro">
      <div className="max-w-5xl mx-auto w-full px-6 relative">
        <div className="text-center space-y-10 relative z-10">
          <motion.span
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 0.4 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="font-mono text-xs tracking-[0.3em] block uppercase"
          >
            Your Private Space
          </motion.span>

          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            viewport={{ once: true }}
            className="text-5xl md:text-7xl font-display font-light tracking-tight italic"
            data-testid="heading-garden-intro"
          >
            The Garden
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            viewport={{ once: true }}
            className="text-lg md:text-xl font-serif font-light leading-relaxed max-w-2xl mx-auto opacity-70"
          >
            Every writer gets a private garden — a quiet place to plant ideas,
            tend to drafts, and let your words grow at their own pace.
            No deadlines. No pressure. Just soil, sun, and your imagination.
          </motion.p>

          <div className="grid md:grid-cols-3 gap-8 pt-12 max-w-3xl mx-auto">
            {[
              {
                stage: "Seed",
                icon: <SeedDoodle />,
                desc: "Plant a raw idea. A sentence, a feeling, a fragment — anything that stirs."
              },
              {
                stage: "Sprout",
                icon: <SproutDoodle />,
                desc: "Nurture it. Shape it. Let the draft grow roots and find its voice."
              },
              {
                stage: "Bloom",
                icon: <BloomDoodle />,
                desc: "When it's ready, it blooms. Our editors wander the gardens looking for flowers."
              }
            ].map((item, i) => (
              <motion.div
                key={item.stage}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + i * 0.15, duration: 0.6 }}
                viewport={{ once: true }}
                className="text-center space-y-3 p-6 border border-white/5 rounded-xl bg-white/[0.02] backdrop-blur-sm hover:border-white/10 transition-colors"
                data-testid={`card-stage-${item.stage.toLowerCase()}`}
              >
                <div className="text-white/80">{item.icon}</div>
                <h3 className="font-display text-xl font-light">{item.stage}</h3>
                <p className="text-sm font-serif opacity-60 leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.8 }}
            viewport={{ once: true }}
            className="pt-8"
          >
            <a
              href="/garden"
              className="inline-flex items-center gap-3 font-mono text-sm uppercase tracking-widest border-b border-white/20 hover:border-white/60 transition-all pb-2 hover:text-white"
              data-testid="link-enter-garden"
            >
              Enter Your Garden
              <span className="text-lg">→</span>
            </a>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
