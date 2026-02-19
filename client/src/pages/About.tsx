import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import StarBackground from "@/components/StarBackground";
import { motion } from "framer-motion";
import { ChevronDown, BookOpen, Leaf, Eye, Sprout, Wind, Feather, Users } from "lucide-react";

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
              className="text-5xl md:text-7xl lg:text-8xl font-display font-light tracking-tight italic"
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

        <section className="py-32 px-6 md:px-12" data-testid="section-identity">
          <div className="max-w-4xl mx-auto space-y-20">
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
              viewport={{ once: true }}
              className="text-center space-y-8"
            >
              <span className="font-mono text-[10px] tracking-[0.4em] text-amber-400/60 uppercase">The Journal</span>
              <h2 className="text-3xl md:text-5xl font-display font-light italic leading-tight">
                We publish writing that<br />
                <span className="text-amber-400/80">we can't stop thinking about.</span>
              </h2>
              <p className="font-serif text-white/50 text-lg leading-relaxed max-w-2xl mx-auto">
                The Page Gallery Journal is a literary journal that publishes thematic print editions. Each issue is assembled by hand — selected, sequenced, and designed with the care of a gallery exhibition. We believe print is not dead; it's a deliberate act.
              </p>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-8">
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
                },
                {
                  icon: <Feather className="w-6 h-6 text-amber-400/70" />,
                  title: "Open Calls & Garden Scouting",
                  description: "We source work through themed open calls and by reading Gardens. Either way, nothing is published without your explicit consent."
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
          </div>
        </section>

        <section className="py-32 px-6 md:px-12 border-t border-white/[0.04]" data-testid="section-garden">
          <div className="max-w-4xl mx-auto space-y-16">
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
              viewport={{ once: true }}
              className="text-center space-y-6"
            >
              <span className="font-mono text-[10px] tracking-[0.4em] text-emerald-400/60 uppercase">The Garden</span>
              <h2 className="text-3xl md:text-5xl font-display font-light italic">
                A Place to Write, Not Perform
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

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              viewport={{ once: true }}
              className="text-center"
            >
              <a
                href="/garden"
                className="inline-block px-10 py-4 bg-emerald-500/10 border border-emerald-500/20 backdrop-blur-sm font-mono text-sm uppercase tracking-widest text-emerald-200/80 hover:bg-emerald-500/20 hover:text-emerald-100 transition-all duration-300 rounded-full"
                data-testid="cta-enter-garden"
              >
                Enter the Garden
              </a>
            </motion.div>
          </div>
        </section>

        <section className="py-32 px-6 md:px-12 border-t border-white/[0.04]" data-testid="section-editorial-model">
          <div className="max-w-4xl mx-auto space-y-16">
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
              viewport={{ once: true }}
              className="text-center space-y-6"
            >
              <span className="font-mono text-[10px] tracking-[0.4em] text-amber-400/60 uppercase">Editorial Model</span>
              <h2 className="text-3xl md:text-5xl font-display font-light italic">
                How We Find Work
              </h2>
            </motion.div>

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
        </section>

        <section className="py-32 px-6 md:px-12 border-t border-white/[0.04]">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
            viewport={{ once: true }}
            className="max-w-3xl mx-auto text-center space-y-8"
          >
            <Sprout className="w-8 h-8 text-emerald-400/50 mx-auto" />
            <h2 className="text-3xl md:text-5xl font-display font-light italic leading-tight">
              Why a Garden?
            </h2>
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
        </section>
      </main>

      <div className="relative z-10">
        <Footer />
      </div>
    </div>
  );
}
