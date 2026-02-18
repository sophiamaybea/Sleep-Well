import Navigation from "@/components/Navigation";
import TwoDoors from "@/components/sections/TwoDoors";
import Manifesto from "@/components/sections/Manifesto";
import Footer from "@/components/Footer";
import StarBackground from "@/components/StarBackground";
import { motion } from "framer-motion";
import { ChevronDown, Leaf, Eye, Sprout, Wind } from "lucide-react";

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
              Our Philosophy
            </motion.span>
            <motion.h1
              initial={{ opacity: 0, y: 20, filter: "blur(8px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              transition={{ delay: 0.5, duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
              className="text-5xl md:text-7xl lg:text-8xl font-display font-light tracking-tight italic"
              data-testid="about-title"
            >
              The Two Doors
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              transition={{ delay: 0.9, duration: 1 }}
              className="font-serif italic text-lg text-white/50 max-w-md mx-auto leading-relaxed"
            >
              Every writer faces a choice. Every reader makes a discovery.
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

        <section className="py-32 px-6 md:px-12" data-testid="section-philosophy">
          <div className="max-w-4xl mx-auto space-y-20">
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
              viewport={{ once: true }}
              className="text-center space-y-8"
            >
              <span className="font-mono text-[10px] tracking-[0.4em] text-amber-400/60 uppercase">The Editorial Model</span>
              <h2 className="text-3xl md:text-5xl font-display font-light italic leading-tight">
                Editors wander through Gardens —<br />
                <span className="text-amber-400/80">you just write.</span>
              </h2>
              <p className="font-serif text-white/50 text-lg leading-relaxed max-w-2xl mx-auto">
                No slush pile. No cover letters. No anxiety. The Page Gallery Journal inverts the traditional submission model entirely. Instead of writers chasing editors, our editors come to you.
              </p>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  icon: <Leaf className="w-6 h-6 text-emerald-400/70" />,
                  title: "No Gatekeeping",
                  description: "There are no submission windows, no rejection letters, no hierarchies of access. Every Garden is visible. Every voice has equal ground."
                },
                {
                  icon: <Eye className="w-6 h-6 text-amber-400/70" />,
                  title: "Discovery, Not Application",
                  description: "Our editors browse Gardens the way a reader browses a bookshop — by instinct, curiosity, and taste. Your work is found, not filtered."
                },
                {
                  icon: <Wind className="w-6 h-6 text-emerald-400/70" />,
                  title: "Organic Attention",
                  description: "No algorithms rank your work. No popularity metrics determine visibility. Editors wander freely, and attention flows where the writing resonates."
                }
              ].map((card, i) => (
                <motion.div
                  key={card.title}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: i * 0.15, ease: [0.22, 1, 0.36, 1] }}
                  viewport={{ once: true }}
                  className="bg-white/[0.02] border border-white/[0.06] backdrop-blur-sm rounded-2xl p-8 space-y-4"
                  data-testid={`philosophy-card-${i}`}
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

        <section className="py-32 px-6 md:px-12 border-t border-white/[0.04]" data-testid="section-discovery">
          <div className="max-w-4xl mx-auto space-y-16">
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
              viewport={{ once: true }}
              className="text-center space-y-6"
            >
              <span className="font-mono text-[10px] tracking-[0.4em] text-emerald-400/60 uppercase">How Discovery Works</span>
              <h2 className="text-3xl md:text-5xl font-display font-light italic">
                The Wandering Editor
              </h2>
            </motion.div>

            <div className="space-y-12">
              {[
                { step: "01", title: "You Plant", detail: "Write in your Garden. Poetry, prose, fragments, experiments — whatever form your voice takes. Your Garden is your creative space, private until you choose otherwise." },
                { step: "02", title: "Editors Wander", detail: "Our editorial team browses Gardens organically. No submissions queue. No ranking system. They read because they're drawn to read — the way one follows a path through a real garden." },
                { step: "03", title: "Work Is Discovered", detail: "When an editor finds a piece that resonates, they nominate it for the Gallery. You're notified gently — no pressure, no expectation. Just recognition." },
                { step: "04", title: "The Gallery Publishes", detail: "Selected work appears in the Gallery — our curated, public-facing journal. Your name, your words, presented with the care they deserve." }
              ].map((item, i) => (
                <motion.div
                  key={item.step}
                  initial={{ opacity: 0, x: i % 2 === 0 ? -30 : 30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.8, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
                  viewport={{ once: true }}
                  className="flex gap-8 items-start"
                  data-testid={`discovery-step-${item.step}`}
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

        <section className="py-32 px-6 md:px-12 border-t border-white/[0.04]" data-testid="section-garden-metaphor">
          <div className="max-w-3xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
              viewport={{ once: true }}
              className="text-center space-y-8"
            >
              <Sprout className="w-8 h-8 text-emerald-400/50 mx-auto" />
              <span className="font-mono text-[10px] tracking-[0.4em] text-emerald-400/60 uppercase block">The Garden Metaphor</span>
              <h2 className="text-3xl md:text-5xl font-display font-light italic leading-tight">
                Why a Garden?
              </h2>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
              viewport={{ once: true }}
              className="mt-12 bg-white/[0.02] border border-white/[0.06] backdrop-blur-sm rounded-2xl p-8 md:p-12 space-y-6"
            >
              <p className="font-serif text-white/50 leading-relaxed text-lg">
                A garden is patient. It doesn't demand perfection on a deadline. Seeds become sprouts, sprouts become blooms — each at their own pace. Some pieces arrive fully formed; others need time in the soil.
              </p>
              <p className="font-serif text-white/50 leading-relaxed text-lg">
                We chose the garden metaphor because writing is cultivation, not manufacturing. Your Garden is where drafts live, where experiments grow, where half-formed ideas have permission to exist without judgment.
              </p>
              <p className="font-serif text-white/50 leading-relaxed text-lg">
                When a piece is ready — when it has bloomed — it becomes visible. Not because you submitted it to a faceless inbox, but because an editor wandered through and recognized something worth sharing.
              </p>
              <p className="font-serif text-amber-400/60 leading-relaxed text-lg italic">
                The garden doesn't rush. Neither do we.
              </p>
            </motion.div>
          </div>
        </section>

        <TwoDoors />
        <Manifesto />
      </main>

      <div className="relative z-10">
        <Footer />
      </div>
    </div>
  );
}
