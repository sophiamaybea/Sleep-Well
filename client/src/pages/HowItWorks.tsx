import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import StarBackground from "@/components/StarBackground";
import { motion } from "framer-motion";
import { Sprout, Sun, Leaf, Eye, Frame, Share2, ChevronDown } from "lucide-react";

const steps = [
  {
    number: "01",
    title: "Create Your Garden",
    subtitle: "Plant your first seed",
    icon: <Sprout className="w-8 h-8" />,
    color: "text-emerald-400",
    borderColor: "border-emerald-400/20",
    bgGlow: "rgba(52,211,153,0.05)",
    description: "Sign up and step into your Garden — a private creative space that belongs entirely to you. Here, you plant Seeds: poems, stories, essays, fragments, experiments. There are no rules about form or genre. Your Garden is your sanctuary.",
    details: [
      "Choose your pen name and set up your writer profile",
      "Your Garden is private by default — only you can see it",
      "Plant your first Seed: paste, type, or start from a prompt",
      "Tag your work with growth stages as it develops"
    ]
  },
  {
    number: "02",
    title: "Nurture Your Work",
    subtitle: "Seed → Sprout → Bloom",
    icon: <Sun className="w-8 h-8" />,
    color: "text-amber-400",
    borderColor: "border-amber-400/20",
    bgGlow: "rgba(245,158,11,0.05)",
    description: "Every piece of writing has a lifecycle. Use growth stages to track where your work is in its journey. There's no pressure to rush — some seeds take seasons to bloom.",
    details: [
      "Seed — a raw idea, a fragment, a first draft. Still underground.",
      "Sprout — taking shape. You're revising, expanding, finding the voice.",
      "Bloom — ready to be seen. Polished, intentional, complete.",
      "Move pieces between stages at your own pace"
    ],
    stages: [
      { label: "Seed", icon: <Sprout className="w-5 h-5" />, desc: "Raw idea" },
      { label: "Sprout", icon: <Leaf className="w-5 h-5" />, desc: "Taking shape" },
      { label: "Bloom", icon: <Sun className="w-5 h-5" />, desc: "Ready to share" }
    ]
  },
  {
    number: "03",
    title: "Editors Discover",
    subtitle: "Editors wander gardens organically",
    icon: <Eye className="w-8 h-8" />,
    color: "text-violet-400",
    borderColor: "border-violet-400/20",
    bgGlow: "rgba(167,139,250,0.05)",
    description: "This is where The Page Gallery Journal breaks from tradition. You never submit your work. Instead, our editorial team wanders through Gardens — reading, discovering, and nominating pieces that resonate.",
    details: [
      "No submission forms, no cover letters, no query process",
      "Editors browse Gardens organically, following their instincts",
      "When an editor finds work they love, they nominate it",
      "You're notified if your work catches editorial attention"
    ]
  },
  {
    number: "04",
    title: "Selected for Gallery",
    subtitle: "Work published in the Gallery",
    icon: <Frame className="w-8 h-8" />,
    color: "text-amber-300",
    borderColor: "border-amber-300/20",
    bgGlow: "rgba(252,211,77,0.05)",
    description: "The Gallery is our curated, public-facing journal. When your work is selected, it's presented with care — beautifully typeset, properly credited, and given the space it deserves. This is publication as recognition, not transaction.",
    details: [
      "Selected work is professionally presented in the Gallery",
      "Your writer profile is linked — readers can explore your Garden",
      "Gallery pieces are shared across our community and beyond",
      "Publication carries no rights transfer — your work remains yours"
    ]
  },
  {
    number: "05",
    title: "Beyond the Gallery",
    subtitle: "Sharing, community, growth",
    icon: <Share2 className="w-8 h-8" />,
    color: "text-emerald-300",
    borderColor: "border-emerald-300/20",
    bgGlow: "rgba(110,231,183,0.05)",
    description: "Publication is a beginning, not an end. Beyond the Gallery, you'll find a community of writers, opportunities for growth, and resources to build a sustainable creative practice.",
    details: [
      "Connect with other writers in the Commons",
      "Access career resources in the Nursery",
      "Participate in community challenges and workshops",
      "Build your public portfolio from your Garden"
    ]
  }
];

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
              From Seed to Gallery
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
              Five steps from planting a seed to seeing your work in the Gallery. No submissions. No gatekeeping. Just writing.
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

        {steps.map((step, index) => (
          <section
            key={step.number}
            className="py-24 md:py-32 px-6 md:px-12 border-t border-white/[0.04]"
            data-testid={`step-section-${step.number}`}
          >
            <div className="max-w-5xl mx-auto">
              <div className="grid md:grid-cols-2 gap-12 md:gap-16 items-start">
                <motion.div
                  initial={{ opacity: 0, x: -40 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                  viewport={{ once: true }}
                  className="space-y-6"
                >
                  <div className="flex items-center gap-4">
                    <span className="font-mono text-5xl md:text-7xl font-light text-white/[0.06]">{step.number}</span>
                    <div className={`w-14 h-14 rounded-full bg-white/[0.04] border ${step.borderColor} flex items-center justify-center ${step.color}`}>
                      {step.icon}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <span className={`font-mono text-[10px] tracking-[0.4em] uppercase ${step.color} opacity-60`}>{step.subtitle}</span>
                    <h2 className="text-3xl md:text-4xl font-display font-light italic">{step.title}</h2>
                  </div>
                  <p className="font-serif text-white/50 leading-relaxed text-lg">{step.description}</p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: 40 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
                  viewport={{ once: true }}
                  className="space-y-4"
                >
                  <div
                    className="bg-white/[0.02] border border-white/[0.06] backdrop-blur-sm rounded-2xl p-8 space-y-4"
                    style={{ boxShadow: `0 0 80px ${step.bgGlow}` }}
                  >
                    {step.details.map((detail, di) => (
                      <motion.div
                        key={di}
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.3 + di * 0.1 }}
                        viewport={{ once: true }}
                        className="flex gap-3 items-start"
                        data-testid={`step-${step.number}-detail-${di}`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full mt-2 shrink-0 ${step.color} opacity-50`} />
                        <span className="font-serif text-white/40 text-sm leading-relaxed">{detail}</span>
                      </motion.div>
                    ))}
                  </div>

                  {step.stages && (
                    <div className="grid grid-cols-3 gap-3 mt-6">
                      {step.stages.map((stage, si) => (
                        <motion.div
                          key={stage.label}
                          initial={{ opacity: 0, scale: 0.9 }}
                          whileInView={{ opacity: 1, scale: 1 }}
                          transition={{ duration: 0.5, delay: 0.5 + si * 0.15 }}
                          viewport={{ once: true }}
                          className="bg-white/[0.02] border border-white/[0.06] backdrop-blur-sm rounded-xl p-4 text-center space-y-2"
                          data-testid={`stage-${stage.label.toLowerCase()}`}
                        >
                          <div className="text-amber-400/60 flex justify-center">{stage.icon}</div>
                          <p className="font-display text-sm italic text-white/70">{stage.label}</p>
                          <p className="font-mono text-[9px] text-white/30 uppercase tracking-wider">{stage.desc}</p>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </motion.div>
              </div>

              {index < steps.length - 1 && (
                <motion.div
                  initial={{ scaleY: 0 }}
                  whileInView={{ scaleY: 1 }}
                  transition={{ duration: 0.8, delay: 0.5 }}
                  viewport={{ once: true }}
                  className="w-[1px] h-16 bg-gradient-to-b from-white/10 to-transparent mx-auto mt-16 origin-top"
                />
              )}
            </div>
          </section>
        ))}

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
