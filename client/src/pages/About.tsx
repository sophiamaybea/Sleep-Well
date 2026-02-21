import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import StarBackground from "@/components/StarBackground";
import { motion } from "framer-motion";
import { ChevronDown, BookOpen, Leaf, Eye, Sprout, Wind, Feather, Users } from "lucide-react";
import { Link } from "wouter";

export default function About() {
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
              About The Page Gallery Journal
            </motion.span>
            <motion.h1
              initial={{ opacity: 0, y: 20, filter: "blur(8px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              transition={{ delay: 0.5, duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
              className="text-5xl md:text-7xl lg:text-8xl font-display font-light tracking-normal italic"
              data-testid="about-title"
            >
              About Us
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              transition={{ delay: 0.9, duration: 1 }}
              className="font-serif italic text-lg text-white/50 max-w-lg mx-auto leading-relaxed"
            >
              A literary journal and a collaborative writing garden.
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

        {/* PART 1 - THE JOURNAL */}
        <section className="py-32 px-6 md:px-12" data-testid="section-the-journal">
          <div className="max-w-4xl mx-auto space-y-20">
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
              viewport={{ once: true }}
              className="text-center space-y-8"
            >
              <span className="font-mono text-[10px] tracking-[0.4em] text-amber-400/60 uppercase">Institutional</span>
              <h2 className="text-3xl md:text-5xl font-display font-light italic leading-normal">
                The Journal<br />
                <span className="text-amber-400/80">We publish writing that we can't stop thinking about.</span>
              </h2>
              <p className="font-serif text-white/50 text-lg leading-relaxed max-w-2xl mx-auto">
                The Page Gallery Journal is a literary journal that publishes thematic print editions. Each issue is assembled by hand — selected, sequenced, and designed with the care of a gallery exhibition. We believe print is not dead; it's a deliberate act.
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 gap-8">
              {[
                {
                  icon: <BookOpen className="w-6 h-6 text-amber-400/70" />,
                  title: "Print First",
                  description: "Our editions are physical objects. Each issue has a theme, a cover, a spine. We design for the shelf, the hand, the bedside table."
                },
                {
                  icon: <Eye className="w-6 h-6 text-amber-400/70" />,
                  title: "Curatorial Eye",
                  description: "Every piece is chosen because an editor read it and couldn't leave it alone. We don't accept slush. We discover."
                }
              ].map((card, i) => (
                <motion.div
                  key={card.title}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: i * 0.15, ease: [0.22, 1, 0.36, 1] }}
                  viewport={{ once: true }}
                  className="bg-white/[0.02] border border-white/[0.06] backdrop-blur-sm rounded-2xl p-8 space-y-4"
                  data-testid={`journal-card-${i}`}
                >
                  <div className="w-12 h-12 rounded-full bg-white/[0.04] border border-white/[0.08] flex items-center justify-center">
                    {card.icon}
                  </div>
                  <h3 className="font-display text-xl italic text-white/90">{card.title}</h3>
                  <p className="font-serif text-white/40 text-sm leading-relaxed">{card.description}</p>
                </motion.div>
              ))}
            </div>

            <div className="space-y-16 pt-12">
              <div className="text-center space-y-4">
                <span className="font-mono text-[10px] tracking-[0.4em] text-amber-400/60 uppercase">Editorial Model</span>
                <h3 className="text-2xl md:text-4xl font-display font-light italic">How We Find Work</h3>
              </div>
              
              <div className="space-y-12">
                {[
                  { step: "01", title: "Open Calls", detail: "Each print edition has a theme. We publish open calls with clear deadlines. Anyone can submit. Every submission is read by at least two editors." },
                  { step: "02", title: "Garden Scouting", detail: "Our editors also browse the Garden — reading freely, following their instincts. When they find something that resonates, they note it privately." },
                  { step: "03", title: "Invitation & Consent", detail: "If an editor wants to include your work, they reach out directly. Nothing is ever published without your explicit agreement. We ask. Always." },
                  { step: "04", title: "Publication", detail: "Selected work appears in a print edition — designed, typeset, and printed as a physical object. Your name, your words, given the care they deserve." },
                ].map((item, i) => (
                  <motion.div
                    key={item.step}
                    initial={{ opacity: 0, x: i % 2 === 0 ? -30 : 30 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
                    viewport={{ once: true }}
                    className="flex gap-8 items-start"
                    data-testid={`editorial-step-${item.step}`}
                  >
                    <span className="font-mono text-3xl text-amber-400/20 font-light shrink-0">{item.step}</span>
                    <div className="space-y-2">
                      <h3 className="font-display text-2xl italic text-white/80">{item.title}</h3>
                      <p className="font-serif text-white/40 leading-relaxed">{item.detail}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            <div className="space-y-8 pt-12">
              <div className="text-center space-y-4">
                <span className="font-mono text-[10px] tracking-[0.4em] text-amber-400/60 uppercase">Submitting for Print</span>
                <h3 className="text-2xl md:text-4xl font-display font-light italic">How to Get Published</h3>
              </div>
              <div className="bg-white/[0.02] border border-white/[0.06] backdrop-blur-sm rounded-2xl p-8 md:p-12 space-y-6">
                <p className="font-serif text-white/55 text-lg leading-relaxed">
                  To be considered for our print editions, you need to be part of the Garden — which is completely free to join. When we announce open calls for upcoming issues, you can submit your work directly through the platform.
                </p>
                <p className="font-serif text-white/55 text-lg leading-relaxed">
                  Our editors also read the Gardens, discovering work that resonates. If they find something they'd like to feature, they'll always reach out to you first. Nothing is ever published without your explicit consent.
                </p>
                <p className="font-serif text-amber-400/60 text-lg leading-relaxed italic">
                  Join the Garden, write freely, and when the time is right — let your work bloom.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* VISUAL SEPARATION */}
        <div className="max-w-5xl mx-auto px-6">
          <div className="h-px w-full bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        </div>

        {/* PART 2 - THE GARDEN */}
        <section className="py-32 px-6 md:px-12" data-testid="section-the-garden-about">
          <div className="max-w-4xl mx-auto space-y-20">
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
              viewport={{ once: true }}
              className="text-center space-y-8"
            >
              <span className="font-mono text-[10px] tracking-[0.4em] text-emerald-400/60 uppercase">Metaphorical</span>
              <h2 className="text-3xl md:text-5xl font-display font-light italic leading-normal">
                The Garden<br />
                <span className="text-emerald-400/80">A Place to Write, Not Perform</span>
              </h2>
              <p className="font-serif text-white/50 text-lg leading-relaxed max-w-2xl mx-auto">
                Alongside the Journal, we tend a collaborative writing platform — the Garden. It's where writers plant their work, nurture their practice, and connect with a community that values process over product.
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 gap-8">
              {[
                {
                  icon: <Sprout className="w-5 h-5 text-emerald-400/70" />,
                  title: "Private by Default",
                  detail: "Your Garden is yours. Write drafts, fragments, experiments. Share when you're ready — or don't."
                },
                {
                  icon: <Users className="w-5 h-5 text-emerald-400/70" />,
                  title: "Community, Not Competition",
                  detail: "Circles, rituals, reading feeds. Writers supporting writers, without metrics or algorithms."
                },
                {
                  icon: <Leaf className="w-5 h-5 text-emerald-400/70" />,
                  title: "Courses & Feedback",
                  detail: "Learn from published writers. Get detailed editorial feedback. Grow under optimal conditions in the Greenhouse."
                },
                {
                  icon: <Wind className="w-5 h-5 text-emerald-400/70" />,
                  title: "No Algorithms",
                  detail: "Everything here is human-curated. No ranking, no trending, no popularity contest. Just writing."
                },
              ].map((card, i) => (
                <motion.div
                  key={card.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] }}
                  viewport={{ once: true }}
                  className="bg-white/[0.02] border border-white/[0.06] backdrop-blur-sm rounded-xl p-6 space-y-3"
                  data-testid={`garden-card-${i}`}
                >
                  <div className="flex items-center gap-3">
                    {card.icon}
                    <h3 className="font-display text-lg italic text-white/85">{card.title}</h3>
                  </div>
                  <p className="font-serif text-white/40 text-sm leading-relaxed">{card.detail}</p>
                </motion.div>
              ))}
            </div>

            <div className="space-y-8 pt-12">
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
                viewport={{ once: true }}
                className="max-w-3xl mx-auto text-center space-y-8"
              >
                <Sprout className="w-8 h-8 text-emerald-400/50 mx-auto" />
                <h3 className="text-3xl md:text-5xl font-display font-light italic leading-normal">
                  Why a Garden?
                </h3>
                <div className="bg-white/[0.02] border border-white/[0.06] backdrop-blur-sm rounded-2xl p-8 md:p-12 space-y-6 text-left">
                  <p className="font-serif text-white/50 leading-relaxed text-lg">
                    A garden is patient. It doesn't demand perfection on a deadline. Seeds become sprouts, sprouts become blooms — each at their own pace.
                  </p>
                  <p className="font-serif text-white/50 leading-relaxed text-lg">
                    We chose the garden metaphor because writing is cultivation, not manufacturing. Your Garden is where drafts live, where experiments grow, where half-formed ideas have permission to exist without judgment.
                  </p>
                  <p className="font-serif text-amber-400/60 leading-relaxed text-lg italic">
                    The garden doesn't rush. Neither do we.
                  </p>
                </div>
              </motion.div>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              viewport={{ once: true }}
              className="text-center pt-12"
            >
              <Link
                href="/how-it-works"
                className="inline-flex items-center gap-3 font-mono text-sm uppercase tracking-widest text-emerald-400/60 hover:text-emerald-400 transition-colors group"
                data-testid="link-see-how-garden-works"
              >
                See how the Garden works
                <ChevronDown size={16} className="group-hover:translate-y-1 transition-transform rotate-[-90deg]" />
              </Link>
            </motion.div>
          </div>
        </section>
      </main>

      <div className="relative z-10">
        <Footer />
      </div>
    </div>
  );
}
