import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import StarBackground from "@/components/StarBackground";
import { motion } from "framer-motion";
import { useState } from "react";
import { ChevronDown, BookOpen, Compass, Calendar, ExternalLink, Plus, Minus, Award, Building, Pen, Briefcase, FileText, Sprout } from "lucide-react";

type TabId = "resources" | "guides" | "seasonal";

interface Resource {
  category: string;
  categoryColor: string;
  title: string;
  description: string;
  link: string;
}

interface Guide {
  title: string;
  description: string;
  steps: string[];
}

interface SeasonalItem {
  month: string;
  items: { name: string; type: string; status: "open" | "closing" | "upcoming"; deadline?: string }[];
}

const categoryIcons: Record<string, React.ReactNode> = {
  "Grants": <Award className="w-3.5 h-3.5" />,
  "Residencies": <Building className="w-3.5 h-3.5" />,
  "Contests": <Pen className="w-3.5 h-3.5" />,
  "Freelance": <Briefcase className="w-3.5 h-3.5" />,
  "Publishers": <FileText className="w-3.5 h-3.5" />,
};

const resources: Resource[] = [
  { category: "Grants", categoryColor: "text-amber-400 bg-amber-400/10 border-amber-400/20", title: "NEA Creative Writing Fellowships", description: "National Endowment for the Arts offers $25,000 fellowships for published creative writers in prose and poetry.", link: "#" },
  { category: "Grants", categoryColor: "text-amber-400 bg-amber-400/10 border-amber-400/20", title: "PEN/Robert W. Bingham Prize", description: "Annual prize for an exceptionally talented fiction writer whose debut work represents distinguished literary achievement.", link: "#" },
  { category: "Residencies", categoryColor: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20", title: "MacDowell Fellowship", description: "Residencies of up to eight weeks for artists working in seven disciplines. Room, board, and studio provided.", link: "#" },
  { category: "Residencies", categoryColor: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20", title: "Yaddo Residency", description: "Invitations for artists working at a professional level in their field. Free room, board, and studio space.", link: "#" },
  { category: "Contests", categoryColor: "text-violet-400 bg-violet-400/10 border-violet-400/20", title: "Pushcart Prize Nominations", description: "Annual literary anthology honoring the best poetry, short fiction, and essays published by small presses.", link: "#" },
  { category: "Contests", categoryColor: "text-violet-400 bg-violet-400/10 border-violet-400/20", title: "Best of the Net Anthology", description: "Annual anthology featuring the best online literary work. Nominated by editors of participating journals.", link: "#" },
  { category: "Freelance", categoryColor: "text-rose-400 bg-rose-400/10 border-rose-400/20", title: "Literary Hub Contributor Network", description: "Opportunities for literary criticism, essays, and cultural commentary. Pays competitive rates for quality work.", link: "#" },
  { category: "Freelance", categoryColor: "text-rose-400 bg-rose-400/10 border-rose-400/20", title: "Poets & Writers Classifieds", description: "Curated listings of freelance writing opportunities, workshops, and publication calls updated regularly.", link: "#" },
  { category: "Publishers", categoryColor: "text-teal-400 bg-teal-400/10 border-teal-400/20", title: "Graywolf Press Open Reading", description: "Independent nonprofit publisher. Accepts unsolicited manuscripts during specific reading periods.", link: "#" },
  { category: "Publishers", categoryColor: "text-teal-400 bg-teal-400/10 border-teal-400/20", title: "Copper Canyon Press", description: "Nonprofit publisher dedicated to poetry. Open submission periods announced on their website.", link: "#" },
];

const guides: Guide[] = [
  {
    title: "Writing a Compelling Author Bio",
    description: "Your bio is often the first impression editors and readers get. Learn to write one that's professional, authentic, and memorable.",
    steps: [
      "Start with your name and what you do — keep it simple and direct",
      "Mention 2-3 notable publications or achievements (if applicable)",
      "Include one personal detail that makes you human, not a resume",
      "Write in third person for formal contexts, first person for casual",
      "Keep it under 100 words — brevity signals confidence",
      "Update it quarterly as your career evolves"
    ]
  },
  {
    title: "Pitching to Literary Journals",
    description: "While The Page Gallery uses discovery, many journals still require pitches. Here's how to make yours stand out.",
    steps: [
      "Read at least 3 recent issues of the journal before pitching",
      "Address the specific editor by name when possible",
      "Lead with the work — describe what you're sending in one sentence",
      "Keep the cover letter under 200 words",
      "Follow submission guidelines exactly — no exceptions",
      "Send simultaneous submissions unless explicitly prohibited"
    ]
  },
  {
    title: "Building a Writer's Portfolio",
    description: "A strong portfolio opens doors to opportunities, residencies, and publication. Build one strategically.",
    steps: [
      "Choose 5-8 of your strongest pieces across different forms",
      "Include a mix of published and unpublished work",
      "Create a simple, clean website (your Garden can serve this purpose)",
      "Organize by genre or theme, not chronologically",
      "Include a brief introduction for each piece explaining context",
      "Update every 3-6 months with your latest and best work"
    ]
  },
  {
    title: "Understanding Publishing Contracts",
    description: "Before signing anything, understand what you're agreeing to. A quick guide to common contract terms.",
    steps: [
      "First serial rights — the journal publishes it first; rights revert after",
      "Exclusive vs. non-exclusive — know the difference and negotiate",
      "Always retain copyright — never sign it away for journal publication",
      "Check the reversion clause — when do rights return to you?",
      "Understand digital vs. print rights — they're separate",
      "When in doubt, ask a literary lawyer or consult the Authors Guild"
    ]
  },
  {
    title: "Applying for Writing Residencies",
    description: "Residencies offer time, space, and community. Here's how to put together a strong application.",
    steps: [
      "Start applications 6-12 months before deadlines",
      "Craft a project statement that's specific but not rigid",
      "Include your best work samples — quality over quantity",
      "Get letters of recommendation from people who know your work",
      "Apply to 5-10 residencies per cycle to improve odds",
      "Don't be discouraged by rejection — persistence matters"
    ]
  }
];

const seasonalRounds: SeasonalItem[] = [
  {
    month: "January",
    items: [
      { name: "NEA Creative Writing Fellowships", type: "Grant", status: "open", deadline: "March 8" },
      { name: "AWP Conference Registration", type: "Event", status: "open", deadline: "February 15" },
    ]
  },
  {
    month: "February",
    items: [
      { name: "Pushcart Prize Nominations", type: "Contest", status: "closing", deadline: "February 28" },
      { name: "MacDowell Fellowship — Spring Cycle", type: "Residency", status: "open", deadline: "April 15" },
    ]
  },
  {
    month: "March",
    items: [
      { name: "Best of the Net Nominations", type: "Contest", status: "upcoming" },
      { name: "Graywolf Press Open Reading", type: "Publisher", status: "open", deadline: "March 31" },
    ]
  },
  {
    month: "April",
    items: [
      { name: "National Poetry Month Challenges", type: "Community", status: "open", deadline: "April 30" },
      { name: "Yaddo Residency — Fall Applications", type: "Residency", status: "open", deadline: "May 1" },
    ]
  },
  {
    month: "May",
    items: [
      { name: "PEN Literary Awards Cycle", type: "Contest", status: "upcoming" },
      { name: "Summer Writing Workshop Season", type: "Event", status: "open", deadline: "June 1" },
    ]
  },
  {
    month: "June",
    items: [
      { name: "Copper Canyon Press Reading Period", type: "Publisher", status: "open", deadline: "August 31" },
      { name: "Bread Loaf Writers Conference", type: "Event", status: "closing", deadline: "June 15" },
    ]
  },
];

const tabs: { id: TabId; label: string; icon: React.ReactNode }[] = [
  { id: "resources", label: "Resources", icon: <BookOpen className="w-4 h-4" /> },
  { id: "guides", label: "Propagation Guides", icon: <Compass className="w-4 h-4" /> },
  { id: "seasonal", label: "Seasonal Rounds", icon: <Calendar className="w-4 h-4" /> },
];

function GuideCard({ guide, index }: { guide: Guide; index: number }) {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      viewport={{ once: true }}
      className="bg-white/[0.02] border border-white/[0.06] backdrop-blur-sm rounded-2xl overflow-hidden"
      data-testid={`guide-card-${index}`}
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full p-6 md:p-8 flex items-start justify-between text-left group"
        data-testid={`guide-toggle-${index}`}
      >
        <div className="space-y-2 pr-4">
          <h3 className="font-display text-xl italic text-white/80 group-hover:text-white transition-colors">{guide.title}</h3>
          <p className="font-serif text-white/40 text-sm leading-relaxed">{guide.description}</p>
        </div>
        <span className="shrink-0 text-white/30 mt-1">
          {isOpen ? <Minus className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
        </span>
      </button>
      <motion.div
        initial={false}
        animate={{ height: isOpen ? "auto" : 0, opacity: isOpen ? 1 : 0 }}
        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
        className="overflow-hidden"
      >
        <div className="px-6 md:px-8 pb-8 space-y-3">
          {guide.steps.map((step, si) => (
            <div key={si} className="flex gap-3 items-start" data-testid={`guide-${index}-step-${si}`}>
              <span className="font-mono text-[10px] text-amber-400/50 mt-1 shrink-0">{String(si + 1).padStart(2, '0')}</span>
              <span className="font-serif text-white/50 text-sm leading-relaxed">{step}</span>
            </div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function Nursery() {
  const [activeTab, setActiveTab] = useState<TabId>("resources");
  const [categoryFilter, setCategoryFilter] = useState<string>("All");

  const categories = ["All", ...Array.from(new Set(resources.map(r => r.category)))];
  const filteredResources = categoryFilter === "All" ? resources : resources.filter(r => r.category === categoryFilter);

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
              Career Resources
            </motion.span>
            <motion.div
              initial={{ opacity: 0, y: 20, filter: "blur(8px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              transition={{ delay: 0.5, duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
            >
              <h1 className="text-5xl md:text-7xl lg:text-8xl font-display font-light tracking-tight italic" data-testid="nursery-title">
                The Nursery
              </h1>
              <p className="font-display text-xl md:text-2xl italic text-amber-400/60 mt-2">Where Careers Take Root</p>
            </motion.div>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              transition={{ delay: 0.9, duration: 1 }}
              className="font-serif italic text-lg text-white/50 max-w-lg mx-auto leading-relaxed"
            >
              Grants, residencies, guides, and seasonal opportunities — everything a growing writer needs.
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
          <div className="max-w-5xl mx-auto">
            <div className="flex flex-wrap gap-2 mb-12 justify-center">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-6 py-3 rounded-full font-mono text-xs uppercase tracking-widest transition-all duration-300 border ${
                    activeTab === tab.id
                      ? "bg-white/[0.08] border-white/[0.15] text-white"
                      : "bg-white/[0.02] border-white/[0.06] text-white/40 hover:text-white/60 hover:bg-white/[0.04]"
                  }`}
                  data-testid={`tab-${tab.id}`}
                >
                  {tab.icon}
                  <span className="hidden sm:inline">{tab.label}</span>
                </button>
              ))}
            </div>

            {activeTab === "resources" && (
              <motion.div
                key="resources"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <div className="flex flex-wrap gap-2 mb-8 justify-center">
                  {categories.map(cat => (
                    <button
                      key={cat}
                      onClick={() => setCategoryFilter(cat)}
                      className={`px-4 py-2 rounded-full font-mono text-[10px] uppercase tracking-widest transition-all duration-300 border ${
                        categoryFilter === cat
                          ? "bg-white/[0.06] border-white/[0.12] text-white/80"
                          : "bg-transparent border-white/[0.04] text-white/30 hover:text-white/50"
                      }`}
                      data-testid={`filter-${cat.toLowerCase()}`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  {filteredResources.map((resource, i) => (
                    <motion.div
                      key={`${resource.title}-${i}`}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: i * 0.05 }}
                      className="bg-white/[0.02] border border-white/[0.06] backdrop-blur-sm rounded-2xl p-6 space-y-3 group hover:bg-white/[0.04] transition-colors"
                      data-testid={`resource-card-${i}`}
                    >
                      <div className="flex items-center justify-between">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-mono uppercase tracking-wider border ${resource.categoryColor}`}>
                          {categoryIcons[resource.category]}
                          {resource.category}
                        </span>
                        <a href={resource.link} className="text-white/20 hover:text-white/50 transition-colors" data-testid={`resource-link-${i}`}>
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      </div>
                      <h3 className="font-display text-lg italic text-white/80 group-hover:text-white transition-colors">{resource.title}</h3>
                      <p className="font-serif text-white/40 text-sm leading-relaxed">{resource.description}</p>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {activeTab === "guides" && (
              <motion.div
                key="guides"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="space-y-4"
              >
                {guides.map((guide, i) => (
                  <GuideCard key={guide.title} guide={guide} index={i} />
                ))}
              </motion.div>
            )}

            {activeTab === "seasonal" && (
              <motion.div
                key="seasonal"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="space-y-8"
              >
                <div className="flex items-center gap-3 mb-4">
                  <Sprout className="w-5 h-5 text-emerald-400/60" />
                  <p className="font-serif text-white/40 text-sm italic">An almanac of what's open, closing, and coming soon in the literary world.</p>
                </div>

                {seasonalRounds.map((month, mi) => (
                  <motion.div
                    key={month.month}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: mi * 0.05 }}
                    viewport={{ once: true }}
                    data-testid={`month-${month.month.toLowerCase()}`}
                  >
                    <div className="flex items-center gap-4 mb-4">
                      <span className="font-display text-2xl italic text-white/60">{month.month}</span>
                      <div className="flex-1 h-[1px] bg-white/[0.06]" />
                    </div>

                    <div className="space-y-2 pl-4 md:pl-8">
                      {month.items.map((item, ii) => (
                        <div
                          key={`${item.name}-${ii}`}
                          className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 py-3 px-4 bg-white/[0.02] border border-white/[0.04] rounded-xl"
                          data-testid={`seasonal-item-${mi}-${ii}`}
                        >
                          <div className="flex items-center gap-3">
                            <span className={`w-2 h-2 rounded-full shrink-0 ${
                              item.status === "open" ? "bg-emerald-400" :
                              item.status === "closing" ? "bg-amber-400" :
                              "bg-white/20"
                            }`} />
                            <div>
                              <span className="font-serif text-white/70 text-sm">{item.name}</span>
                              <span className="font-mono text-[9px] text-white/30 uppercase tracking-wider ml-2">{item.type}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 pl-5 sm:pl-0">
                            <span className={`font-mono text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                              item.status === "open" ? "text-emerald-400 border-emerald-400/20 bg-emerald-400/10" :
                              item.status === "closing" ? "text-amber-400 border-amber-400/20 bg-amber-400/10" :
                              "text-white/30 border-white/10 bg-white/5"
                            }`}>
                              {item.status}
                            </span>
                            {item.deadline && (
                              <span className="font-mono text-[10px] text-white/30">Due {item.deadline}</span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </div>
        </section>
      </main>

      <div className="relative z-10">
        <Footer />
      </div>
    </div>
  );
}
