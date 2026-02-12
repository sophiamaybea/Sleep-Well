import { motion } from "framer-motion";

function CrayonFlower({ className, delay = 0, color = "#f7c8d0", stemColor = "#7ec878" }: { className?: string; delay?: number; color?: string; stemColor?: string }) {
  return (
    <motion.svg
      initial={{ opacity: 0, scale: 0, rotate: -20 }}
      whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
      transition={{ delay, duration: 0.6, type: "spring", stiffness: 120 }}
      viewport={{ once: true, margin: "-50px" }}
      viewBox="0 0 80 120"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M38 120 C38 120 40 65 42 55 C43 48 39 48 38 55 C36 65 38 120 38 120Z"
        fill={stemColor}
        stroke={stemColor}
        strokeWidth="1.5"
        strokeLinecap="round"
        style={{ filter: "url(#crayon)" }}
      />
      <path
        d="M30 80 C30 80 22 72 18 74 C14 76 20 82 30 80Z"
        fill={stemColor}
        opacity="0.8"
      />
      <path
        d="M48 70 C48 70 56 64 58 68 C60 72 50 72 48 70Z"
        fill={stemColor}
        opacity="0.8"
      />
      <g>
        <ellipse cx="40" cy="42" rx="10" ry="14" fill={color} opacity="0.85" transform="rotate(0 40 42)" />
        <ellipse cx="40" cy="42" rx="10" ry="14" fill={color} opacity="0.85" transform="rotate(60 40 42)" />
        <ellipse cx="40" cy="42" rx="10" ry="14" fill={color} opacity="0.85" transform="rotate(120 40 42)" />
        <ellipse cx="40" cy="42" rx="10" ry="14" fill={color} opacity="0.7" transform="rotate(30 40 42)" />
        <ellipse cx="40" cy="42" rx="10" ry="14" fill={color} opacity="0.7" transform="rotate(90 40 42)" />
        <ellipse cx="40" cy="42" rx="10" ry="14" fill={color} opacity="0.7" transform="rotate(150 40 42)" />
      </g>
      <circle cx="40" cy="42" r="7" fill="#f5e6a3" stroke="#e8d488" strokeWidth="1" />
      <defs>
        <filter id="crayon">
          <feTurbulence type="turbulence" baseFrequency="0.05" numOctaves="2" />
          <feDisplacementMap in="SourceGraphic" scale="2" />
        </filter>
      </defs>
    </motion.svg>
  );
}

function CrayonDaisy({ className, delay = 0 }: { className?: string; delay?: number }) {
  return (
    <motion.svg
      initial={{ opacity: 0, scale: 0, rotate: 15 }}
      whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
      transition={{ delay, duration: 0.5, type: "spring", stiffness: 100 }}
      viewport={{ once: true, margin: "-50px" }}
      viewBox="0 0 60 100"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M28 100 C28 98 30 55 31 45 C32 40 28 40 28 45 C27 55 28 100 28 100Z"
        fill="#6ab862"
        stroke="#6ab862"
        strokeWidth="1"
        strokeLinecap="round"
      />
      <path
        d="M22 75 C22 75 15 68 12 70 C9 72 16 76 22 75Z"
        fill="#6ab862"
        opacity="0.7"
      />
      {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => (
        <ellipse
          key={i}
          cx="30"
          cy="35"
          rx="4"
          ry="11"
          fill="white"
          opacity="0.9"
          transform={`rotate(${angle} 30 35)`}
          stroke="#ddd"
          strokeWidth="0.5"
        />
      ))}
      <circle cx="30" cy="35" r="5" fill="#f7d84e" stroke="#e8c93e" strokeWidth="0.8" />
    </motion.svg>
  );
}

function CrayonTulip({ className, delay = 0, color = "#e86b6b" }: { className?: string; delay?: number; color?: string }) {
  return (
    <motion.svg
      initial={{ opacity: 0, y: 30, rotate: -10 }}
      whileInView={{ opacity: 1, y: 0, rotate: 0 }}
      transition={{ delay, duration: 0.7, type: "spring", stiffness: 80 }}
      viewport={{ once: true, margin: "-50px" }}
      viewBox="0 0 50 100"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M24 100 C24 98 25 55 26 48 C27 44 23 44 24 48 C23 55 24 100 24 100Z"
        fill="#5da855"
        stroke="#5da855"
        strokeWidth="1.5"
      />
      <path
        d="M20 72 C20 72 13 66 10 68 C7 70 14 74 20 72Z"
        fill="#5da855"
        opacity="0.7"
      />
      <path
        d="M15 42 C15 30 20 22 25 20 C30 22 35 30 35 42 C35 46 25 48 25 48 C25 48 15 46 15 42Z"
        fill={color}
        opacity="0.9"
      />
      <path
        d="M20 40 C20 30 24 24 25 22 C25 24 25 30 25 40 C25 44 20 44 20 40Z"
        fill={color}
        opacity="0.6"
      />
      <path
        d="M30 40 C30 30 26 24 25 22 C25 24 25 30 25 40 C25 44 30 44 30 40Z"
        fill={color}
        opacity="0.5"
      />
    </motion.svg>
  );
}

function SmallSprout({ className, delay = 0 }: { className?: string; delay?: number }) {
  return (
    <motion.svg
      initial={{ opacity: 0, scale: 0 }}
      whileInView={{ opacity: 1, scale: 1 }}
      transition={{ delay, duration: 0.4, type: "spring" }}
      viewport={{ once: true }}
      viewBox="0 0 30 40"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M15 40 C15 38 15 22 15 18" stroke="#6ab862" strokeWidth="2" strokeLinecap="round" fill="none" />
      <path d="M15 22 C15 22 8 16 6 18 C4 20 10 24 15 22Z" fill="#7ec878" />
      <path d="M15 18 C15 18 22 12 24 14 C26 16 20 20 15 18Z" fill="#7ec878" />
    </motion.svg>
  );
}

export default function GardenIntro() {
  return (
    <section id="garden-intro" className="relative py-32 overflow-hidden" data-testid="section-garden-intro">
      <div className="max-w-5xl mx-auto w-full px-6 relative">
        <CrayonFlower className="absolute -left-4 md:left-8 top-0 w-16 md:w-20 opacity-60" delay={0.2} color="#f0a0b0" />
        <CrayonDaisy className="absolute right-4 md:right-12 top-8 w-12 md:w-16 opacity-50" delay={0.4} />
        <CrayonTulip className="absolute -left-2 md:left-20 bottom-20 w-10 md:w-14 opacity-50" delay={0.6} color="#c87ed8" />
        <CrayonFlower className="absolute right-8 md:right-24 bottom-0 w-14 md:w-[72px] opacity-55" delay={0.8} color="#87c5f0" stemColor="#5daa5d" />
        <SmallSprout className="absolute left-1/4 top-16 w-8 opacity-40" delay={0.3} />
        <SmallSprout className="absolute right-1/3 bottom-32 w-6 opacity-35" delay={0.7} />
        <CrayonTulip className="absolute left-1/2 bottom-8 w-10 opacity-40" delay={0.9} color="#f7a04e" />

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
                icon: "🌱",
                desc: "Plant a raw idea. A sentence, a feeling, a fragment — anything that stirs."
              },
              {
                stage: "Sprout",
                icon: "🌿",
                desc: "Nurture it. Shape it. Let the draft grow roots and find its voice."
              },
              {
                stage: "Bloom",
                icon: "🌸",
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
                <span className="text-3xl block">{item.icon}</span>
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
