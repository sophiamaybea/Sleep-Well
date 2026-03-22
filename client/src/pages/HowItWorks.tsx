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
                          The Garden & The Journal
            </motion.span>
            <motion.h1
              initial={{ opacity: 0, y: 20, filter: "blur(8px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              transition={{ delay: 0.5, duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
              className="text-5xl md:text-7xl lg:text-8xl font-display font-light tracking-normal italic"
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
                text: "Everything here is human-made. The writing, the website, the community \u2014 this is an ode to human creativity. We believe in collaborative spaces, non-algorithmic platforms, and a different approach to writing and publishing. No algorithm decides what you see. Only intention and care.",
              },
              {
                label: "Who We Are",
                text: "The Page Gallery Journal is a literary journal and curatorial project. We publish thematic, illustrated print editions \u2014 chapbooks and quarterly issues \u2014 that treat the book as an art object. Alongside the Journal, we tend to a garden: a collaborative writing platform where writers grow, share, and support one another.",
              },
              {
                label: "What We Offer",
                        text: "A collaborative writing platform. Paid courses. Editorial feedback. And traditional publishing opportunities through our chapbook series and quarterly issues.",
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
                          <span className="font-mono text-[10px] tracking-[0.4em] text-white/30 uppercase">What's Inside</span>
              <h2 className="text-3xl md:text-5xl font-display font-light italic">Inside the Garden</h2>
            </motion.div>

            {[
              {
                name: "Seeds (Private Drafts)",
                tagline: "This is your private workspace. No one else can see what you write here.",
                icon: <Sprout className="w-8 h-8" />,
                color: "text-emerald-400",
                borderColor: "border-emerald-400/15",
                description: "Think of 'Seeds' as your private notebook. It is a locked door. Use this space to write your first ideas, messy drafts, and personal thoughts. You decide if and when anyone else ever sees them.",
                howToLabel: "How to use it",
                howTo: [
                  "Go to 'Your Desk' and click 'New Piece' to start writing",
                  "Click 'New Piece' to open a blank page and start typing",
                  "Everything you save here stays private by default",
                  "If you want others to read it, you can 'move it to Growing or Ready' later",
                ],
              },
              {
                name: "Growing & Ready (Sharing Your Work)",
                tagline: "This is where you share your work and read what others have written.",
                icon: <Sun className="w-8 h-8" />,
                color: "text-amber-400",
                borderColor: "border-amber-400/15",
                description: "When you move a piece to 'Growing' or 'Ready', other writers can read it and leave comments. The 'Garden Feed' is where you go to discover what the community is writing.",
                howToLabel: "How to use it",
                howTo: [
                  "Visit the 'Garden Feed' to see what others are writing",
                  "To share your work, open a piece and change its stage from 'Seeds' to 'Growing' or 'Ready'",
                  "You can leave 'Resonance' (like a 'Like' button) on things you enjoy",
                  "Check the 'Garden Feed' to see the very latest posts",
                ],
              },
              {
                name: "Practice (Writing Tools)",
                tagline: "This is where you go to get better at writing with exercises.",
                icon: <Leaf className="w-8 h-8" />,
                color: "text-teal-400",
                borderColor: "border-teal-400/15",
                description: "The Practice section has tools to help your writing grow. We provide daily prompts (ideas to write about), writing 'rituals' to help you build a habit, and small groups called 'Circles' where you can talk to other writers.",
                howToLabel: "How to use it",
                howTo: [
                  "Look at 'Writing Rituals' for help starting a daily habit",
                  "Use the 'Growth Journal' to keep notes on your progress",
                  "Join a 'Circle' to meet 3-5 other writers and share work privately",
                  "Try the daily prompt if you don't know what to write about today",
                ],
              },
              {
                name: "Publish (Professional Tools)",
                tagline: "This is for writers who want to get published or take classes.",
                icon: <GraduationCap className="w-8 h-8" />,
                color: "text-violet-400",
                borderColor: "border-violet-400/15",
                description: "The Publish section is for serious growth. Here you can find 'Courses' (online classes), a 'Submission Tracker' (to keep track of where you sent your work), and 'Editorial Feedback' where a real person reads your work and gives you advice.",
                howToLabel: "What’s inside",
                howTo: [
                  "Courses — Lessons on how to write better and get published",
                  "Editorial Feedback — Pay for a professional editor to give you advice",
                  "Submission Tracker — A simple list to help you remember where you sent your stories",
                  "Portfolio — A page that shows off your best work to the world",
                ],
              },
            ].map((feature, i) => (
              <motion.div
                key={feature.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
                viewport={{ once: true }}
                className={`bg-white/[0.02] border ${feature.borderColor} backdrop-blur-sm rounded-2xl p-8 md:p-10 space-y-6`}
                data-testid={`feature-${feature.name.toLowerCase()}`}
              >
                <div className="flex items-center gap-4">
                  <div className={`w-14 h-14 rounded-full bg-white/[0.04] border ${feature.borderColor} flex items-center justify-center ${feature.color}`}>
                    {feature.icon}
                  </div>
                  <div>
                    <h3 className="font-display text-2xl italic text-white/85">{feature.name}</h3>
                    <p className="font-serif text-sm italic text-white/35 mt-1">{feature.tagline}</p>
                  </div>
                </div>

                <p className="font-serif text-white/45 leading-relaxed">{feature.description}</p>

                <div className="space-y-1">
                  <span className="font-mono text-[10px] tracking-[0.3em] text-white/30 uppercase">{feature.howToLabel}</span>
                  <div className="space-y-3 pt-2">
                    {feature.howTo.map((step, si) => (
                      <div key={si} className="flex gap-3 items-start" data-testid={`feature-${feature.name.toLowerCase()}-step-${si}`}>
                        <span className={`w-1.5 h-1.5 rounded-full mt-2 shrink-0 ${feature.color} opacity-50`} />
                        <span className="font-serif text-white/40 text-sm leading-relaxed">{step}</span>
                      </div>
                    ))}
                  </div>
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
