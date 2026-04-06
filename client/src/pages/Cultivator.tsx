import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { motion } from "framer-motion";
import { Link } from "wouter";
import { Leaf, BookOpen, PenLine, Users, Sparkles, Check } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";

const benefits = [
  {
    icon: <PenLine size={18} />,
    title: "Full Workshop Access",
    description:
      "Write through every exercise in every session. Save your responses directly to the Garden.",
  },
  {
    icon: <BookOpen size={18} />,
    title: "Unlimited Courses",
    description:
      "Every course marked as Cultivator-included is yours — no separate purchase required.",
  },
  {
    icon: <Leaf size={18} />,
    title: "Atelier — Complete Series",
    description:
      "Work through every prompt in every Atelier series and keep your writing in the Garden.",
  },
  {
    icon: <Users size={18} />,
    title: "Unlimited Workshop Sessions",
    description:
      "Free members may join one session per month. Cultivators may join as many as they like.",
  },
  {
    icon: <Sparkles size={18} />,
    title: "Early Access",
    description:
      "Be among the first to see new features, seasonal challenges, and editorial opportunities.",
  },
];

export default function Cultivator() {
  const { user, isAuthenticated } = useAuth();
  const { data: tierData } = useQuery<{ tier: string }>({
    queryKey: ["/api/user/tier"],
    queryFn: async () => {
      const res = await fetch("/api/user/tier", { credentials: "include" });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    enabled: isAuthenticated,
  });

  const isCultivator =
    tierData?.tier === "cultivator" ||
    (user as any)?.tier === "cultivator" ||
    (user as any)?.role === "editor" ||
    (user as any)?.role === "editor_in_chief" ||
    (user as any)?.role === "admin";

  return (
    <div className="min-h-screen bg-transparent text-foreground selection:bg-secondary selection:text-background relative">
      <Navigation />

      <main id="main-content" className="relative z-10">
        <section className="py-24 md:py-32 px-6 md:px-12">
          <div className="max-w-3xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
              className="space-y-6 mb-16"
            >
              <div className="flex items-center gap-3">
                <div className="h-px w-8 bg-[#c4a24d]" />
                <span className="font-mono text-[10px] tracking-[0.3em] uppercase text-[#c4a24d]">
                  Membership
                </span>
              </div>
              <h1 className="text-4xl md:text-6xl font-display font-light tracking-normal italic">
                The Cultivator
              </h1>
              <p className="font-serif text-xl text-white/50 leading-relaxed italic">
                For writers who want to go deeper — full access to every workshop, course, and
                Atelier series.
              </p>
            </motion.div>

            {isCultivator && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="mb-12 p-5 rounded border border-[#4a7c59]/40 bg-[#4a7c59]/10"
                data-testid="cultivator-active-banner"
              >
                <div className="flex items-center gap-2 text-[#4a7c59] mb-1">
                  <Check size={16} />
                  <span className="font-mono text-xs tracking-widest uppercase">Active</span>
                </div>
                <p className="font-serif text-sm text-white/70">
                  You already have Cultivator access. All features are unlocked.
                </p>
                <Link
                  href="/garden"
                  className="inline-block mt-3 text-xs underline text-white/50 hover:text-white/80 transition-colors"
                >
                  Return to the Garden →
                </Link>
              </motion.div>
            )}

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="space-y-4 mb-16"
            >
              {benefits.map((benefit, i) => (
                <motion.div
                  key={benefit.title}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: i * 0.08 }}
                  viewport={{ once: true }}
                  className="flex gap-4 p-5 rounded border border-white/10 bg-white/[0.02] hover:bg-white/[0.04] transition-colors"
                  data-testid={`benefit-${benefit.title.toLowerCase().replace(/\s/g, "-")}`}
                >
                  <div className="mt-0.5 text-[#c4a24d] shrink-0">{benefit.icon}</div>
                  <div>
                    <p className="font-serif text-base text-white/90 mb-1">{benefit.title}</p>
                    <p className="text-sm text-white/50 leading-relaxed">{benefit.description}</p>
                  </div>
                </motion.div>
              ))}
            </motion.div>

            {!isCultivator && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: true }}
                className="border border-[#c4a24d]/30 bg-[#c4a24d]/5 rounded p-8 text-center"
                data-testid="cultivator-signup-cta"
              >
                <h2 className="font-display text-2xl italic mb-3">Become a Cultivator</h2>
                <p className="font-serif text-sm text-white/60 mb-6 max-w-sm mx-auto leading-relaxed">
                  Membership is currently available by invitation. Reach out to the editors to
                  join the Cultivator programme.
                </p>
                <a
                  href="mailto:submissions@pagegalleryjournal.com"
                  className="inline-block px-8 py-3 bg-[#c4a24d]/90 hover:bg-[#c4a24d] text-background text-sm font-mono tracking-widest uppercase rounded transition-colors"
                  data-testid="button-contact-cultivator"
                >
                  Get in Touch
                </a>
                {!isAuthenticated && (
                  <p className="text-xs text-white/30 mt-4">
                    Already a member?{" "}
                    <Link href="/sign-in" className="underline hover:text-white/60 transition-colors">
                      Sign in
                    </Link>
                  </p>
                )}
              </motion.div>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
