import { motion, useReducedMotion } from "framer-motion";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Link } from "wouter";
import { Check, Star, BookOpen, Headphones, Printer, Users } from "lucide-react";

interface Tier {
  id: string;
  name: string;
  price: string;
  priceNote: string;
  tagline: string;
  badge?: string;
  highlight: boolean;
  features: string[];
  cta: string;
  ctaHref: string;
  icon: React.ReactNode;
}

const tiers: Tier[] = [
  {
    id: "digital",
    name: "Digital",
    price: "£28",
    priceNote: "one-time",
    tagline: "The journal, delivered.",
    highlight: false,
    features: [
      "Full digital edition — current + all future issues",
      "Exclusive founding colophon (your name in the first edition)",
      "Unlimited access to the digital archive",
      "Early access to all new issues before public release",
    ],
    cta: "Claim Digital Access",
    ctaHref: "/sign-in",
    icon: <BookOpen size={20} />,
  },
  {
    id: "studio",
    name: "Studio",
    price: "£75",
    priceNote: "one-time",
    tagline: "The full room.",
    badge: "Most popular",
    highlight: true,
    features: [
      "Everything in Digital",
      "Exclusive audio editions — editors reading their picks",
      "High-resolution printable typeset pages",
      "Monthly craft notes from the editorial desk",
      "Priority submission review for your own work",
    ],
    cta: "Join The Studio",
    ctaHref: "/sign-in",
    icon: <Headphones size={20} />,
  },
  {
    id: "founding-collector",
    name: "Founding Collector",
    price: "£180",
    priceNote: "recurring / year",
    tagline: "You're building this with us.",
    highlight: false,
    features: [
      "Everything in Studio",
      "Your name in the first print run — permanently",
      "Founding Collector physical copy (first print run)",
      "Early access to The Studio workspace",
      "Direct line to the editorial team",
      "Annual collector letter from the founder",
    ],
    cta: "Become a Founding Collector",
    ctaHref: "/sign-in",
    icon: <Star size={20} />,
  },
];

function TierCard({ tier, index }: { tier: Tier; index: number }) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.div
      initial={shouldReduceMotion ? {} : { opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.7, delay: index * 0.12, ease: [0.22, 1, 0.36, 1] }}
      whileHover={shouldReduceMotion ? {} : { y: -6, transition: { duration: 0.3 } }}
      className={`relative flex flex-col rounded-2xl p-8 ${
        tier.highlight
          ? "bg-[#6B2A2A] text-[#F8F4EC] shadow-xl shadow-[rgba(107,42,42,0.25)]"
          : "studio-card"
      }`}
    >
      {tier.badge && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-[#c4a24d] text-[#1C1208] rounded-full font-mono text-[10px] uppercase tracking-[0.2em] shadow-md">
          {tier.badge}
        </div>
      )}

      {/* Header */}
      <div className="space-y-3 mb-8">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
          tier.highlight ? "bg-[#F8F4EC]/15" : "bg-[#6B2A2A]/8"
        }`}>
          <span className={tier.highlight ? "text-[#F8F4EC]" : "text-[#6B2A2A]"}>
            {tier.icon}
          </span>
        </div>
        <div>
          <p className={`font-mono text-[10px] uppercase tracking-[0.2em] mb-1 ${
            tier.highlight ? "text-[#F8F4EC]/60" : "text-[#1C1208]/40"
          }`}>
            {tier.name}
          </p>
          <div className="flex items-baseline gap-2">
            <span className={`font-display text-4xl font-bold ${tier.highlight ? "text-[#F8F4EC]" : "text-[#1C1208]"}`}>
              {tier.price}
            </span>
            <span className={`font-mono text-[10px] uppercase tracking-wider ${
              tier.highlight ? "text-[#F8F4EC]/50" : "text-[#1C1208]/40"
            }`}>
              {tier.priceNote}
            </span>
          </div>
          <p className={`font-display italic text-lg mt-1 ${
            tier.highlight ? "text-[#F8F4EC]/80" : "text-[#1C1208]/60"
          }`}>
            {tier.tagline}
          </p>
        </div>
      </div>

      {/* Features */}
      <ul className="space-y-3 flex-1 mb-8">
        {tier.features.map((feature) => (
          <li key={feature} className="flex items-start gap-3">
            <Check
              size={14}
              className={`mt-0.5 flex-shrink-0 ${tier.highlight ? "text-[#c4a24d]" : "text-[#6B2A2A]"}`}
            />
            <span className={`font-sans text-sm leading-snug ${
              tier.highlight ? "text-[#F8F4EC]/80" : "text-[#1C1208]/65"
            }`}>
              {feature}
            </span>
          </li>
        ))}
      </ul>

      {/* CTA */}
      <Link
        href={tier.ctaHref}
        className={`block text-center py-3.5 rounded-full font-mono text-[10px] uppercase tracking-[0.2em] transition-all duration-200 ${
          tier.highlight
            ? "bg-[#F8F4EC] text-[#6B2A2A] hover:bg-[#F0EBE0] shadow-sm"
            : "bg-[#6B2A2A] text-[#F8F4EC] hover:bg-[#5a2222] shadow-sm"
        }`}
      >
        {tier.cta}
      </Link>
    </motion.div>
  );
}

export default function FoundingEditions() {
  const shouldReduceMotion = useReducedMotion();

  return (
    <div className="min-h-screen studio-paper">
      <Navigation />

      <main className="pt-32 pb-24">
        {/* Hero */}
        <section className="px-6 md:px-12 max-w-7xl mx-auto mb-24">
          <motion.div
            initial={shouldReduceMotion ? {} : { opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="max-w-3xl"
          >
            <p className="font-mono text-[length:var(--text-label)] uppercase tracking-[0.2em] text-[#6B2A2A]/70 mb-4">
              Founding Editions
            </p>
            <h1 className="font-display text-[clamp(2.5rem,6vw,4.5rem)] font-bold italic text-[#1C1208] leading-tight mb-6">
              You're not a subscriber.
              <br />
              <span className="text-[#6B2A2A]">You're a founder.</span>
            </h1>
            <p className="font-sans text-lg text-[#1C1208]/60 leading-relaxed max-w-xl mb-4">
              The first print run of The Page Gallery Journal is funded entirely by readers like you.
              Choose your edition. Own a piece of it.
            </p>

            {/* Handwritten urgency note */}
            <div className="handwritten-note inline-block px-6 py-4 mt-4 max-w-sm">
              <p className="font-handwritten text-lg text-[#1C1208]/75 leading-relaxed">
                First print run is capped at 300 copies. Once they're gone, they're gone. — S.
              </p>
            </div>
          </motion.div>
        </section>

        <div className="studio-section-divider mx-6 md:mx-12 mb-20" />

        {/* Tier cards */}
        <section className="px-6 md:px-12 max-w-7xl mx-auto">
          <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
            {tiers.map((tier, i) => (
              <TierCard key={tier.id} tier={tier} index={i} />
            ))}
          </div>
        </section>

        {/* Trust signals */}
        <section className="px-6 md:px-12 max-w-7xl mx-auto mt-24">
          <div className="studio-card rounded-2xl p-10 md:p-14">
            <div className="grid md:grid-cols-3 gap-10 text-center">
              {[
                { icon: <BookOpen size={24} />, stat: "300", label: "Print copies — first run" },
                { icon: <Users size={24} />, stat: "Free", label: "Digital submission for all writers" },
                { icon: <Printer size={24} />, stat: "2026", label: "First print edition ships" },
              ].map((item) => (
                <div key={item.label} className="space-y-3">
                  <div className="w-12 h-12 rounded-full bg-[#6B2A2A]/8 flex items-center justify-center mx-auto text-[#6B2A2A]">
                    {item.icon}
                  </div>
                  <div className="font-display text-3xl font-bold text-[#1C1208]">{item.stat}</div>
                  <div className="font-mono text-[10px] uppercase tracking-[0.15em] text-[#1C1208]/40">{item.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ teaser */}
        <section className="px-6 md:px-12 max-w-3xl mx-auto mt-20 text-center">
          <p className="font-display italic text-xl text-[#1C1208]/50 mb-4">
            Questions? We're real people.
          </p>
          <a
            href="mailto:submissions@pagegalleryjournal.com"
            className="font-mono text-[length:var(--text-label)] uppercase tracking-[0.2em] text-[#6B2A2A] hover:text-[#5a2222] transition-colors border-b border-[#6B2A2A]/30 hover:border-[#5a2222] pb-0.5"
          >
            Write to the editors →
          </a>
        </section>
      </main>

      <Footer />
    </div>
  );
}
