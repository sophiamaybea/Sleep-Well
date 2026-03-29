import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import StarBackground from "@/components/StarBackground";
import { motion } from "framer-motion";
import { BookOpen, Heart, Archive, ExternalLink, ChevronDown } from "lucide-react";

interface Publication {
  title: string;
  type: string;
  description: string;
  coverColor: string;
  status: "available" | "out_of_print";
  buyLink?: string;
    // Friend/partner publication fields
  name?: string;
  link?: string;
}

const currentIssues: Publication[] = [];

const pastIssues: Publication[] = [];

const friends: Publication[] = [];
const hasPublications = currentIssues.length > 0 || (friends as any[]).length > 0 || pastIssues.length > 0;

export default function Publications() {
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
              The Page Gallery & Garden
            </motion.span>
            <motion.h1
              initial={{ opacity: 0, y: 20, filter: "blur(8px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              transition={{ delay: 0.5, duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
              className="text-5xl md:text-7xl lg:text-8xl font-display font-light tracking-normal italic"
              data-testid="publications-title"
            >
              Publications
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              transition={{ delay: 0.9, duration: 1 }}
              className="font-serif italic text-lg text-white/50 max-w-lg mx-auto leading-relaxed"
            >
              Print editions, chapbooks, and the presses we love.
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
              <span className="font-mono text-[9px] uppercase tracking-[0.3em]">Browse</span>
              <ChevronDown size={16} />
            </motion.div>
          </motion.div>
        </section>

        <section className="py-24 px-6 md:px-12 border-t border-white/[0.04]" data-testid="section-available-now" style={{ display: currentIssues.length === 0 ? 'none' : undefined }}>
          <div className="max-w-5xl mx-auto space-y-12">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              viewport={{ once: true }}
              className="space-y-4"
            >
              <div className="flex items-center gap-3">
                <BookOpen className="w-5 h-5 text-amber-400/60" />
                <span className="font-mono text-[10px] tracking-[0.4em] text-amber-400/60 uppercase">Available Now</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-display font-light italic">Current Issues</h2>
            </motion.div>

            <div className="grid md:grid-cols-2 gap-8">
              {currentIssues.map((issue, i) => (
                <motion.div
                  key={issue.title}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: i * 0.15, ease: [0.22, 1, 0.36, 1] }}
                  viewport={{ once: true }}
                  className="bg-white/[0.02] border border-white/[0.06] backdrop-blur-sm rounded-2xl overflow-hidden group hover:bg-white/[0.04] transition-all"
                  data-testid={`publication-card-${i}`}
                >
                  <div className={`h-48 bg-gradient-to-br ${issue.coverColor} flex items-center justify-center relative`}>
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_40%,rgba(255,255,255,0.04),transparent_60%)]" />
                    <span className="font-display text-3xl italic text-white/20 group-hover:text-white/30 transition-colors">{issue.title.split(":")[0]}</span>
                  </div>
                  <div className="p-8 space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[10px] uppercase tracking-widest text-amber-400/50">{issue.type}</span>
                      <span className="font-mono text-[10px] uppercase tracking-widest text-emerald-400/60 px-2 py-0.5 rounded-full border border-emerald-400/20 bg-emerald-400/10">Available</span>
                    </div>
                    <h3 className="font-display text-xl italic text-white/85">{issue.title}</h3>
                    <p className="font-serif text-white/40 text-sm leading-relaxed">{issue.description}</p>
                    {issue.buyLink && (
                      <a
                        href={issue.buyLink}
                        className="inline-flex items-center gap-2 px-6 py-3 rounded-full border border-amber-500/20 bg-amber-500/10 text-amber-300/80 font-mono text-[10px] uppercase tracking-widest hover:bg-amber-500/20 hover:border-amber-500/30 transition-all"
                        data-testid={`button-buy-${i}`}
                      >
                        <BookOpen size={12} />
                        Purchase
                      </a>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-24 px-6 md:px-12 border-t border-white/[0.04]" data-testid="section-our-friends">
          <div className="max-w-5xl mx-auto space-y-12">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              viewport={{ once: true }}
              className="space-y-4"
            >
              <div className="flex items-center gap-3">
                <Heart className="w-5 h-5 text-emerald-400/60" />
                <span className="font-mono text-[10px] tracking-[0.4em] text-emerald-400/60 uppercase">Our Friends</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-display font-light italic">Publications & Presses We Love</h2>
              <p className="font-serif text-white/40 text-lg leading-relaxed max-w-2xl">
                The literary ecosystem thrives on interconnection. These are the journals, presses, and publications whose work we admire and whose values align with ours.
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {friends.map((friend, i) => (
                <motion.a
                  key={friend.name}
                  href={friend.link}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] }}
                  viewport={{ once: true }}
                  className="bg-white/[0.02] border border-white/[0.06] backdrop-blur-sm rounded-xl p-6 space-y-3 group hover:bg-white/[0.04] hover:border-white/[0.1] transition-all"
                  data-testid={`friend-card-${i}`}
                >
                  <div className="flex items-center justify-between">
                    <h3 className="font-display text-lg italic text-white/80 group-hover:text-white transition-colors">{friend.name}</h3>
                    <ExternalLink size={14} className="text-white/20 group-hover:text-white/40 transition-colors" />
                  </div>
                  <p className="font-serif text-white/35 text-sm leading-relaxed">{friend.description}</p>
                </motion.a>
              ))}
            </div>
          </div>
        </section>

        <section className="py-24 px-6 md:px-12 border-t border-white/[0.04]" data-testid="section-archive" style={{ display: pastIssues.length === 0 ? 'none' : undefined }}>
          <div className="max-w-5xl mx-auto space-y-12">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              viewport={{ once: true }}
              className="space-y-4"
            >
              <div className="flex items-center gap-3">
                <Archive className="w-5 h-5 text-white/30" />
                <span className="font-mono text-[10px] tracking-[0.4em] text-white/30 uppercase">Archive</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-display font-light italic text-white/60">Past Issues</h2>
            </motion.div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {pastIssues.map((issue, i) => (
                <motion.div
                  key={issue.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] }}
                  viewport={{ once: true }}
                  className="bg-white/[0.015] border border-white/[0.04] backdrop-blur-sm rounded-2xl overflow-hidden opacity-70"
                  data-testid={`archive-card-${i}`}
                >
                  <div className={`h-32 bg-gradient-to-br ${issue.coverColor} flex items-center justify-center relative`}>
                    <span className="font-display text-2xl italic text-white/15">{issue.title.split(":")[0]}</span>
                    <span className="absolute top-3 right-3 font-mono text-[9px] uppercase tracking-widest text-white/30 px-2 py-0.5 rounded-full border border-white/10 bg-white/5">
                      Out of print
                    </span>
                  </div>
                  <div className="p-6 space-y-3">
                    <span className="font-mono text-[10px] uppercase tracking-widest text-white/25">{issue.type}</span>
                    <h3 className="font-display text-lg italic text-white/50">{issue.title}</h3>
                    <p className="font-serif text-white/30 text-sm leading-relaxed">{issue.description}</p>
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
            className="max-w-2xl mx-auto text-center space-y-8"
          >
            <h2 className="text-3xl md:text-5xl font-display font-light italic">
              Want to be in our pages?
            </h2>
            <p className="font-serif text-white/50 text-lg leading-relaxed">
              We don't accept traditional submissions. Instead, our editors discover work through the Garden. Plant your words, and let them find you.
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
