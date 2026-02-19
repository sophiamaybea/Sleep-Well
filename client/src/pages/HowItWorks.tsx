import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import StarBackground from "@/components/StarBackground";
import { motion } from "framer-motion";
import { Sprout, Sun, Leaf, BookOpen, ChevronDown, GraduationCap, MessageCircle, FileCheck, Users } from "lucide-react";

export default function HowItWorks() {
  return (
    <div className="min-h-screen bg-transparent text-foreground selection:bg-secondary selection:text-background relative">
      <StarBackground />
      <Navigation />

      <main className="relative z-10">
        <section className="min-h-[85vh] flex flex-col items-center justify-center px-6 relative">
          <div className="text-center space-y-6">
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.35 }}
              transition={{ delay: 0.3, duration: 1 }}
              className="font-mono text-[10px] tracking-[0.4em] block uppercase"
            >
              Understanding the Platform
            </motion.span>
            <motion.h1
              initial={{ opacity: 0, y: 20, filter: "blur(8px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              transition={{ delay: 0.5, duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
              className="text-5xl md:text-7xl lg:text-8xl font-display font-light tracking-tight italic"
              data-testid="how-it-works-title"
            >
              How It Works
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              transition={{ delay: 0.9, duration: 1 }}
              className="font-serif italic text-lg text-white/50 max-w-lg mx-auto leading-relaxed"
            >
              A journal and a garden. Two doors, one home.
            </motion.p>
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5, duration: 1 }}
            className="absolute bottom-12 left-1/2 -translate-x-1/2"
          >
            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              className="flex flex-col items-center gap-2 text-white/20"
            >
              <span className="font-mono text-[9px] uppercase tracking-[0.3em]">Scroll</span>
              <ChevronDown size={16} />
            </motion.div>
          </motion.div>
        </section>

        {/* Part A: Three Intro Paragraphs */}
        <section className="py-24 px-6 md:px-12 border-t border-white/[0.04]" data-testid="section-intro">
          <div className="max-w-4xl mx-auto space-y-16">
            {[
              {
                label: "Our Mission",
                text: "Everything here is human-made. No algorithm decides what you see. Only intention and care. We believe that writing deserves to be read by people who choose to read it \u2014 not served by a machine that guesses what you want.",
              },
              {
                label: "Who We Are",
                text: "A literary journal and curatorial project. We publish thematic print editions, each one assembled by hand. Alongside the Journal, we tend to a garden \u2014 a collaborative writing platform where writers plant, nurture, and share their work.",
              },
              {
                label: "What We Offer",
                text: "A collaborative writing platform. Paid courses. Detailed editorial feedback. Traditional publishing opportunities. And above all, a community that values the process of writing as much as the finished piece.",
              },
            ].map((item, i) => (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] }}
                viewport={{ once: true }}
                className="space-y-4"
                data-testid={`intro-block-${i}`}
              >
                <span className="font-mono text-[10px] tracking-[0.4em] text-amber-400/60 uppercase">{item.label}</span>
                <p className="font-serif text-white/55 text-xl md:text-2xl leading-relaxed">{item.text}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Part B: Garden vs Journal Comparison */}
        <section className="py-24 px-6 md:px-12 border-t border-white/[0.04]" data-testid="section-comparison">
          <div className="max-w-5xl mx-auto space-y-16">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              viewport={{ once: true }}
              className="text-center space-y-4"
            >
              <span className="font-mono text-[10px] tracking-[0.4em] text-emerald-400/60 uppercase">Two Paths, One Home</span>
              <h2 className="text-3xl md:text-5xl font-display font-light italic">The Garden & The Journal</h2>
            </motion.div>

            <div className="grid md:grid-cols-2 gap-8">
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                viewport={{ once: true }}
                className="bg-white/[0.02] border border-emerald-400/10 backdrop-blur-sm rounded-2xl p-8 md:p-10 space-y-6"
                data-testid="comparison-garden"
              >
                <div className="flex items-center gap-3">
                  <Sprout className="w-6 h-6 text-emerald-400/70" />
                  <h3 className="font-display text-2xl italic text-white/85">The Garden</h3>
                </div>
                <ul className="space-y-4">
                  {[
                    "Writer-to-writer, non-algorithmic platform",
                    "Share writing at your own pace",
                    "No rejections \u2014 your garden is always yours",
                    "Work may be \u201cbloomed\u201d with your explicit consent",
                    "Community features: circles, rituals, feedback",
                  ].map((point, i) => (
                    <li key={i} className="flex gap-3 items-start">
                      <span className="w-1.5 h-1.5 rounded-full mt-2 shrink-0 bg-emerald-400/50" />
                      <span className="font-serif text-white/45 text-sm leading-relaxed">{point}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                viewport={{ once: true }}
                className="bg-white/[0.02] border border-amber-400/10 backdrop-blur-sm rounded-2xl p-8 md:p-10 space-y-6"
                data-testid="comparison-journal"
              >
                <div className="flex items-center gap-3">
                  <BookOpen className="w-6 h-6 text-amber-400/70" />
                  <h3 className="font-display text-2xl italic text-white/85">The Journal</h3>
                </div>
                <ul className="space-y-4">
                  {[
                    "Thematic curations handpicked by editors",
                    "Open calls for themed print editions",
                    "Print publication \u2014 physical, beautiful objects",
                    "Editors may scout from the Garden with consent",
                    "Professional editorial and publishing standards",
                  ].map((point, i) => (
                    <li key={i} className="flex gap-3 items-start">
                      <span className="w-1.5 h-1.5 rounded-full mt-2 shrink-0 bg-amber-400/50" />
                      <span className="font-serif text-white/45 text-sm leading-relaxed">{point}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
              viewport={{ once: true }}
              className="bg-white/[0.02] border border-white/[0.06] backdrop-blur-sm rounded-xl p-6 md:p-8 text-center"
              data-testid="consent-disclaimer"
            >
              <p className="font-serif text-white/50 text-sm md:text-base leading-relaxed italic max-w-3xl mx-auto">
                Nothing is ever featured or published without your explicit permission. Submitting to an open call constitutes consent. Work selected from the Garden will always be discussed with you first. We ask. Always.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Part C: Feature Walkthrough */}
        <section className="py-24 px-6 md:px-12 border-t border-white/[0.04]" data-testid="section-features">
          <div className="max-w-5xl mx-auto space-y-16">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              viewport={{ once: true }}
              className="text-center space-y-4"
            >
              <span className="font-mono text-[10px] tracking-[0.4em] text-white/30 uppercase">Feature Walkthrough</span>
              <h2 className="text-3xl md:text-5xl font-display font-light italic">Inside the Garden</h2>
            </motion.div>

            {[
              {
                name: "Seeding",
                tagline: "Your first words into the soil.",
                icon: <Sprout className="w-8 h-8" />,
                color: "text-emerald-400",
                borderColor: "border-emerald-400/15",
                howTo: [
                  "Create drafts in your private writing space",
                  "Save work automatically as you write",
                  "Tag pieces with growth stages: seed, sprout, bloom",
                  "Choose when to share \u2014 or keep it private forever",
                ],
              },
              {
                name: "Sunlight",
                tagline: "Where your words are seen, and where you see the words of others.",
                icon: <Sun className="w-8 h-8" />,
                color: "text-amber-400",
                borderColor: "border-amber-400/15",
                howTo: [
                  "Browse writing from gardens you tend",
                  "Discover new writers through the explore feed",
                  "Leave resonances and marginalia on pieces that move you",
                  "Build a reading queue of work you want to return to",
                ],
              },
              {
                name: "Nutrients",
                tagline: "The space for nurturing your voice.",
                icon: <Leaf className="w-8 h-8" />,
                color: "text-teal-400",
                borderColor: "border-teal-400/15",
                howTo: [
                  "Set writing rituals and track your practice",
                  "Use the growth journal for reflections",
                  "Check your inner weather before writing",
                  "Join circles \u2014 small groups for accountability and support",
                ],
              },
              {
                name: "Greenhouse",
                tagline: "Growth under optimal conditions.",
                icon: <GraduationCap className="w-8 h-8" />,
                color: "text-violet-400",
                borderColor: "border-violet-400/15",
                howTo: [
                  "Enrol in courses led by published writers",
                  "Submit a piece for detailed editorial feedback (paid)",
                  "Track your submissions to external publications",
                  "Build your portfolio and writer profile",
                ],
              },
            ].map((feature, i) => (
              <motion.div
                key={feature.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
                viewport={{ once: true }}
                className="grid md:grid-cols-2 gap-8 items-start"
                data-testid={`feature-${feature.name.toLowerCase()}`}
              >
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className={`w-14 h-14 rounded-full bg-white/[0.04] border ${feature.borderColor} flex items-center justify-center ${feature.color}`}>
                      {feature.icon}
                    </div>
                    <div>
                      <h3 className="font-display text-2xl italic text-white/85">{feature.name}</h3>
                      <p className="font-serif text-sm italic text-white/35 mt-1">{feature.tagline}</p>
                    </div>
                  </div>
                </div>

                <div className={`bg-white/[0.02] border ${feature.borderColor} backdrop-blur-sm rounded-2xl p-6 md:p-8 space-y-3`}>
                  {feature.howTo.map((step, si) => (
                    <div key={si} className="flex gap-3 items-start" data-testid={`feature-${feature.name.toLowerCase()}-step-${si}`}>
                      <span className={`w-1.5 h-1.5 rounded-full mt-2 shrink-0 ${feature.color} opacity-50`} />
                      <span className="font-serif text-white/40 text-sm leading-relaxed">{step}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        <section className="py-32 px-6 md:px-12 border-t border-white/[0.04]">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
            viewport={{ once: true }}
            className="max-w-2xl mx-auto text-center space-y-8"
          >
            <h2 className="text-3xl md:text-5xl font-display font-light italic">
              Ready to plant?
            </h2>
            <p className="font-serif text-white/50 text-lg leading-relaxed">
              Your Garden is waiting. No applications, no approval process. Just a quiet space for your words to grow.
            </p>
            <a
              href="/garden"
              className="inline-block px-10 py-4 bg-white/[0.06] border border-white/[0.1] backdrop-blur-sm font-mono text-sm uppercase tracking-widest text-white/80 hover:bg-white/[0.1] hover:text-white transition-all duration-300 rounded-full"
              data-testid="cta-enter-garden"
            >
              Enter the Garden
            </a>
          </motion.div>
        </section>
      </main>

      <div className="relative z-10">
        <Footer />
      </div>
    </div>
  );
}
