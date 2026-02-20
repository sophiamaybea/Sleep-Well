import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import StarBackground from "@/components/StarBackground";
import { motion } from "framer-motion";
import { useState } from "react";
import { ChevronDown, Sprout, Leaf, TreePine, Users, Sparkles, BookOpen, Crown, Plus, Minus, Feather, PenLine, FileText, RotateCcw, Send } from "lucide-react";

interface FAQItem {
  question: string;
  answer: string;
}

interface FAQSection {
  title: string;
  icon: React.ReactNode;
  color: string;
  items: FAQItem[];
}

const faqSections: FAQSection[] = [
  {
    title: "Getting Started",
    icon: <Sprout className="w-5 h-5" />,
    color: "text-emerald-400",
    items: [
      {
        question: "What is The Page Gallery & Garden?",
        answer: "The Page Gallery & Garden is a literary journal built on a discovery model. Instead of traditional submissions, writers cultivate work in personal Gardens, and our editorial team wanders through those Gardens to discover pieces for publication in the Gallery."
      },
      {
        question: "How do I sign up?",
        answer: "Click 'Enter' in the navigation to create your account. You'll set up a pen name, a brief bio, and your Garden will be ready immediately. There's no approval process or waitlist — every writer is welcome."
      },
      {
        question: "Is it free?",
        answer: "Basic access is free. You can create a Garden, plant Seeds, and be discovered by editors at no cost. The Cultivator tier offers additional features like advanced analytics, priority visibility, and community tools for a monthly subscription."
      },
      {
        question: "What kind of writing does the journal publish?",
        answer: "We publish poetry, short fiction, creative nonfiction, hybrid forms, and experimental work. We're genre-agnostic and form-flexible. If it's writing and it's good, it belongs here."
      },
      {
        question: "Do I need previous publications to join?",
        answer: "Absolutely not. We believe in the work, not the CV. Many of our Gallery selections come from writers who have never published before. Your Garden levels the playing field."
      }
    ]
  },
  {
    title: "Your Garden",
    icon: <Leaf className="w-5 h-5" />,
    color: "text-emerald-300",
    items: [
      {
        question: "What is a Garden?",
        answer: "Your Garden is your personal creative workspace. Think of it as a living portfolio and drafting space combined. You plant Seeds (pieces of writing), nurture them through growth stages, and let them bloom when they're ready."
      },
      {
        question: "What are growth stages?",
        answer: "Every piece in your Garden has a growth stage: Seed (raw idea or first draft), Sprout (taking shape, being revised), and Bloom (polished and ready to be seen). You control when pieces move between stages."
      },
      {
        question: "Can anyone see my Garden?",
        answer: "You control your Garden's visibility. Seeds and Sprouts are private by default. Blooms can be made visible to editors and the community. You can also keep a fully private Garden if you prefer — it's your space."
      },
      {
        question: "How many pieces can I plant?",
        answer: "There's no limit on the number of pieces in your Garden. Plant as much or as little as you like. Some writers maintain dozens of active pieces; others tend a single poem for months."
      },
      {
        question: "Can I edit my work after planting?",
        answer: "Yes, always. Your Garden is a living space. Edit, revise, restructure, or completely rewrite at any time. Even pieces that have been noticed by editors can be updated — we respect the revision process."
      }
    ]
  },
  {
    title: "The Commons",
    icon: <TreePine className="w-5 h-5" />,
    color: "text-teal-400",
    items: [
      {
        question: "What is the Commons?",
        answer: "The Commons is our shared community space. It's where writers gather for discussion, feedback, prompt exchanges, and collaborative projects. Think of it as the village green of our literary community."
      },
      {
        question: "Are there writing groups or workshops?",
        answer: "Yes. The Commons hosts regular community challenges, themed writing prompts, and peer feedback circles. These are organic and community-driven — not top-down assignments."
      },
      {
        question: "Can I share my work in the Commons?",
        answer: "You can share links to Blooms in your Garden. The Commons isn't a separate publishing space — it's a place for conversation, not competition. Feedback is encouraged but never mandatory."
      },
      {
        question: "How is the Commons moderated?",
        answer: "The Commons is moderated by our community team with a light touch. We prioritize respect, generosity, and constructive dialogue. Harassment, gatekeeping, and unsolicited criticism are not tolerated."
      }
    ]
  },
  {
    title: "Opportunities",
    icon: <Sparkles className="w-5 h-5" />,
    color: "text-amber-400",
    items: [
      {
        question: "What opportunities are available?",
        answer: "We curate opportunities for writers including grants, residencies, contests, freelance work, and publisher calls. These are listed in the Nursery with deadlines, eligibility details, and direct links."
      },
      {
        question: "Are these opportunities vetted?",
        answer: "Yes. Every opportunity in the Nursery is reviewed by our team. We don't list vanity publishers, pay-to-play contests, or predatory services. If it's here, it's legitimate."
      },
      {
        question: "Can I submit to external opportunities through the platform?",
        answer: "We provide links and details, but submissions to external opportunities happen on those organizations' own platforms. We're a resource hub, not a submission manager."
      },
      {
        question: "Do you offer your own grants or prizes?",
        answer: "We're building toward community-funded prizes and editorial features. Currently, the Gallery itself is our primary recognition — being selected by an editor is a form of literary distinction."
      }
    ]
  },
  {
    title: "Community",
    icon: <Users className="w-5 h-5" />,
    color: "text-violet-400",
    items: [
      {
        question: "How do I connect with other writers?",
        answer: "Browse public Gardens, engage in the Commons, and participate in community challenges. You can follow writers whose work resonates with you and build a network of creative peers."
      },
      {
        question: "Is there a mentorship program?",
        answer: "Not formally, but our community naturally fosters mentorship. Published writers often engage with emerging voices in the Commons. We're exploring structured mentorship for future development."
      },
      {
        question: "Can I collaborate with other writers?",
        answer: "Collaboration happens organically in the Commons through shared prompts, feedback exchanges, and community projects. We're developing formal collaboration tools for future releases."
      },
      {
        question: "What's the community culture like?",
        answer: "Generous, curious, and low-ego. We attract writers who care about craft over clout. The absence of competitive metrics (no likes, no follower counts) keeps the focus on the writing itself."
      }
    ]
  },
  {
    title: "Editorial Process",
    icon: <BookOpen className="w-5 h-5" />,
    color: "text-rose-400",
    items: [
      {
        question: "How does editorial selection work?",
        answer: "Our editors wander through Gardens organically. When they find a piece that resonates, they nominate it for the Gallery. A small editorial committee reviews nominations and makes final selections."
      },
      {
        question: "How long does discovery take?",
        answer: "There's no timeline. Some writers are discovered within weeks; others bloom over months. The process is deliberately unhurried. We don't believe great writing should be rushed or ranked."
      },
      {
        question: "Will I be notified if an editor reads my work?",
        answer: "You'll receive a gentle notification if an editor nominates your work. We don't track or report casual browsing — editors need the freedom to read without pressure."
      },
      {
        question: "Can I request an editorial review?",
        answer: "No. The entire model rests on organic discovery. Requesting reviews would recreate the submission anxiety we're designed to eliminate. Trust the process — tend your Garden, and let the editors wander."
      },
      {
        question: "What rights do I retain?",
        answer: "All of them. Publication in the Gallery grants us first digital publication rights for a limited period. After that, all rights revert to you. Your work is always yours."
      }
    ]
  },
  {
    title: "Cultivator Tier",
    icon: <Crown className="w-5 h-5" />,
    color: "text-amber-300",
    items: [
      {
        question: "What is the Cultivator tier?",
        answer: "The Cultivator tier is our premium membership. It includes advanced Garden analytics, priority in editorial wandering paths, access to exclusive community events, and additional tools for building your writing career."
      },
      {
        question: "Does Cultivator status guarantee publication?",
        answer: "No. Editorial selection is always based on the work itself. Cultivator status gives you additional tools and visibility, but the editorial team selects work on merit alone."
      },
      {
        question: "What analytics are included?",
        answer: "Cultivators see detailed insights about their Garden: which pieces attract the most attention, reading time patterns, growth stage progression, and community engagement metrics."
      },
      {
        question: "Can I cancel anytime?",
        answer: "Yes. Cultivator is a monthly subscription with no long-term commitment. If you cancel, you retain access to all basic features and your Garden remains fully intact."
      },
      {
        question: "Is the Cultivator tier worth it?",
        answer: "If you're serious about building a writing practice and career, yes. The analytics alone help you understand what resonates. But the free tier is genuinely generous — you don't need Cultivator to be discovered."
      }
    ]
  }
];

function AccordionItem({ item, isOpen, onToggle, testId }: { item: FAQItem; isOpen: boolean; onToggle: () => void; testId: string }) {
  return (
    <div className="border-b border-white/[0.04]" data-testid={testId}>
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between py-5 text-left group"
        data-testid={`${testId}-trigger`}
      >
        <span className="font-serif text-white/70 group-hover:text-white/90 transition-colors pr-4">{item.question}</span>
        <span className="shrink-0 text-white/30">
          {isOpen ? <Minus className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
        </span>
      </button>
      <motion.div
        initial={false}
        animate={{ height: isOpen ? "auto" : 0, opacity: isOpen ? 1 : 0 }}
        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
        className="overflow-hidden"
      >
        <p className="font-serif text-white/40 text-sm leading-relaxed pb-5 pr-8">{item.answer}</p>
      </motion.div>
    </div>
  );
}

export default function FieldGuide() {
  const [openItems, setOpenItems] = useState<Record<string, boolean>>({});

  const toggleItem = (key: string) => {
    setOpenItems(prev => ({ ...prev, [key]: !prev[key] }));
  };

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
              Reference & FAQ
            </motion.span>
            <motion.h1
              initial={{ opacity: 0, y: 20, filter: "blur(8px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              transition={{ delay: 0.5, duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
              className="text-5xl md:text-7xl lg:text-8xl font-display font-light tracking-tight italic"
              data-testid="field-guide-title"
            >
              Field Guide
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              transition={{ delay: 0.9, duration: 1 }}
              className="font-serif italic text-lg text-white/50 max-w-lg mx-auto leading-relaxed"
            >
              Everything you need to know about cultivating your writing life at The Page Gallery & Garden.
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
              <span className="font-mono text-[9px] uppercase tracking-[0.3em]">Explore</span>
              <ChevronDown size={16} />
            </motion.div>
          </motion.div>
        </section>

        <section className="py-16 px-6 md:px-12">
          <div className="max-w-3xl mx-auto space-y-20">
            {faqSections.map((section, si) => (
              <motion.div
                key={section.title}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
                viewport={{ once: true }}
                data-testid={`faq-section-${section.title.toLowerCase().replace(/\s/g, '-')}`}
              >
                <div className="flex items-center gap-3 mb-8">
                  <div className={`w-10 h-10 rounded-full bg-white/[0.04] border border-white/[0.08] flex items-center justify-center ${section.color}`}>
                    {section.icon}
                  </div>
                  <h2 className="font-display text-2xl md:text-3xl italic text-white/80">{section.title}</h2>
                </div>

                <div className="bg-white/[0.02] border border-white/[0.06] backdrop-blur-sm rounded-2xl px-6 md:px-8">
                  {section.items.map((item, qi) => {
                    const key = `${si}-${qi}`;
                    return (
                      <AccordionItem
                        key={key}
                        item={item}
                        isOpen={!!openItems[key]}
                        onToggle={() => toggleItem(key)}
                        testId={`faq-item-${si}-${qi}`}
                      />
                    );
                  })}
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        <section className="py-16 px-6 md:px-12 border-t border-white/[0.04]" data-testid="craft-notes-section">
          <div className="max-w-3xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <span className="font-mono text-[10px] tracking-[0.4em] text-white/35 uppercase block mb-4">
                Cultivate Your Craft
              </span>
              <h2 className="text-4xl md:text-5xl font-display font-light italic text-white/85 mb-4" data-testid="craft-notes-title">
                Craft Notes
              </h2>
              <p className="font-serif italic text-white/45 max-w-lg mx-auto leading-relaxed">
                Seeds of wisdom for your writing practice — brief, actionable guidance to help your work grow.
              </p>
            </motion.div>

            <div className="space-y-12">
              {[
                {
                  title: "Poetry Tips",
                  icon: <Feather className="w-5 h-5" />,
                  color: "text-rose-400",
                  borderColor: "border-rose-500/15",
                  bgColor: "bg-rose-500/[0.03]",
                  tips: [
                    { heading: "Read your poem aloud", body: "Sound is the skeleton of a poem. Read every draft aloud at least once — your ear will catch what your eye forgives. Listen for rhythm breaks, accidental rhymes, and where breath naturally falls." },
                    { heading: "Cut the first stanza", body: "Many poems don't truly begin until the second or third stanza. The opening lines are often throat-clearing. Try removing them entirely and see if the poem stands stronger." },
                    { heading: "Earn your abstractions", body: "Words like 'love,' 'death,' and 'beauty' carry so much weight they often collapse under it. Ground abstract ideas in concrete images first — let the reader arrive at the feeling through specifics." },
                  ],
                },
                {
                  title: "Fiction Fundamentals",
                  icon: <PenLine className="w-5 h-5" />,
                  color: "text-emerald-400",
                  borderColor: "border-emerald-500/15",
                  bgColor: "bg-emerald-500/[0.03]",
                  tips: [
                    { heading: "Enter scenes late, leave early", body: "Skip the arrivals and departures. Start in the middle of the action and cut before the scene resolves completely. This keeps the narrative taut and trusts the reader to fill gaps." },
                    { heading: "Give characters contradictions", body: "A generous person who steals. A coward who speaks truth. Characters become real when they contain opposing forces. Consistency is for résumés, not fiction." },
                    { heading: "Dialogue is not conversation", body: "Real speech is full of filler, repetition, and dead ends. Fictional dialogue should feel natural but do work — reveal character, advance plot, or create tension. Every line should earn its place." },
                  ],
                },
                {
                  title: "Essay Writing",
                  icon: <FileText className="w-5 h-5" />,
                  color: "text-amber-400",
                  borderColor: "border-amber-500/15",
                  bgColor: "bg-amber-500/[0.03]",
                  tips: [
                    { heading: "Follow your obsessions", body: "The best essays begin with a question you can't stop thinking about. Don't write what you already know — write toward what puzzles you. The essay is a thinking tool, not a display case." },
                    { heading: "Weave the personal and the universal", body: "A memoir detail grounds the reader; a wider observation gives them a reason to care. Alternate between close-up and wide-angle — your specific experience illuminating a shared truth." },
                    { heading: "Let the structure surprise", body: "Not every essay needs five paragraphs or a linear argument. Try fragments, numbered sections, braided narratives, or associative leaps. Let the form mirror the content's energy." },
                  ],
                },
                {
                  title: "Revision Strategies",
                  icon: <RotateCcw className="w-5 h-5" />,
                  color: "text-violet-400",
                  borderColor: "border-violet-500/15",
                  bgColor: "bg-violet-500/[0.03]",
                  tips: [
                    { heading: "Let it rest before you revise", body: "Distance is a revision tool. Put your draft away for at least a day — a week is better. When you return, you'll read with fresh eyes and notice patterns invisible during composition." },
                    { heading: "Revise for one thing at a time", body: "Don't try to fix everything in a single pass. Read once for structure, once for language, once for rhythm. Layered revision is slower but catches problems that scattered editing misses." },
                    { heading: "Read it backwards", body: "Start from the last paragraph and read each section in reverse order. This breaks your familiarity with the flow and forces you to evaluate each passage on its own terms." },
                  ],
                },
                {
                  title: "Getting Published",
                  icon: <Send className="w-5 h-5" />,
                  color: "text-teal-400",
                  borderColor: "border-teal-500/15",
                  bgColor: "bg-teal-500/[0.03]",
                  tips: [
                    { heading: "Read the journals you submit to", body: "Before sending work, read at least three recent pieces from the publication. Understanding their aesthetic isn't gaming the system — it's respect for the conversation you're joining." },
                    { heading: "Track your submissions", body: "Keep a simple spreadsheet: what you sent, where, when, and the result. Patterns emerge — you'll learn which venues respond to your voice and where to focus energy." },
                    { heading: "Rejection is data, not judgment", body: "A rejection means that piece wasn't right for that venue at that time. It says nothing about your talent. Keep submitting, keep revising, and remember that every published writer has a stack of rejections behind them." },
                  ],
                },
              ].map((section, si) => (
                <motion.div
                  key={section.title}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.7, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
                  viewport={{ once: true }}
                  data-testid={`craft-section-${section.title.toLowerCase().replace(/\s/g, '-')}`}
                >
                  <div className="flex items-center gap-3 mb-5">
                    <div className={`w-10 h-10 rounded-full bg-white/[0.04] border border-white/[0.08] flex items-center justify-center ${section.color}`}>
                      {section.icon}
                    </div>
                    <h3 className="font-display text-xl md:text-2xl italic text-white/80">{section.title}</h3>
                  </div>

                  <div className={`rounded-2xl border ${section.borderColor} ${section.bgColor} backdrop-blur-sm overflow-hidden`}>
                    {section.tips.map((tip, ti) => (
                      <div
                        key={ti}
                        className={`px-6 md:px-8 py-5 ${ti < section.tips.length - 1 ? "border-b border-white/[0.04]" : ""}`}
                        data-testid={`craft-tip-${si}-${ti}`}
                      >
                        <h4 className="font-serif text-white/75 font-medium mb-2">{tip.heading}</h4>
                        <p className="font-serif text-sm text-white/40 leading-relaxed">{tip.body}</p>
                      </div>
                    ))}
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
            <Leaf className="w-8 h-8 text-emerald-400/50 mx-auto" />
            <h2 className="text-3xl md:text-4xl font-display font-light italic">
              Still have questions?
            </h2>
            <p className="font-serif text-white/50 leading-relaxed">
              The best way to understand The Page Gallery Journal is to experience it. Create your Garden and start writing — the rest will grow from there.
            </p>
            <a
              href="/garden"
              className="inline-block px-10 py-4 bg-white/[0.06] border border-white/[0.1] backdrop-blur-sm font-mono text-sm uppercase tracking-widest text-white/80 hover:bg-white/[0.1] hover:text-white transition-all duration-300 rounded-full"
              data-testid="cta-create-garden"
            >
              Create Your Garden
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
