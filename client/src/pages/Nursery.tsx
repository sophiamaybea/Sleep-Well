import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import StarBackground from "@/components/StarBackground";
import { motion } from "framer-motion";
import { useState } from "react";
import { ChevronDown, GraduationCap, MessageCircle, FileCheck, FolderOpen, ArrowRight, Clock, Star, Users, BookOpen, Sprout } from "lucide-react";

type TabId = "courses" | "feedback" | "submissions" | "portfolio";

const tabs: { id: TabId; label: string; icon: React.ReactNode }[] = [
  { id: "courses", label: "Courses", icon: <GraduationCap size={16} /> },
  { id: "feedback", label: "Editorial Feedback", icon: <MessageCircle size={16} /> },
  { id: "submissions", label: "Submissions", icon: <FileCheck size={16} /> },
  { id: "portfolio", label: "Portfolio", icon: <FolderOpen size={16} /> },
];

interface Course {
  title: string;
  instructor: string;
  description: string;
  duration: string;
  level: string;
  spots: number;
  status: "enrolling" | "in_progress" | "upcoming";
}

const courses: Course[] = [
  {
    title: "The First Draft",
    instructor: "Elena Marsh",
    description: "A 6-week course on getting words on the page without judgment. Freewriting techniques, daily practice structures, and the art of silencing the inner critic.",
    duration: "6 weeks",
    level: "Beginner",
    spots: 12,
    status: "enrolling",
  },
  {
    title: "Revision as Discovery",
    instructor: "James Okafor",
    description: "Learn to see revision not as correction but as creative excavation. Close reading, structural analysis, and the craft of cutting.",
    duration: "8 weeks",
    level: "Intermediate",
    spots: 8,
    status: "enrolling",
  },
  {
    title: "The Prose Poem",
    instructor: "Sofia Valdez",
    description: "Exploring the territory between poetry and prose. Form, rhythm, compression, and the lyric essay. Readings and weekly writing assignments.",
    duration: "4 weeks",
    level: "All levels",
    spots: 15,
    status: "upcoming",
  },
  {
    title: "Writing the Body",
    instructor: "Aisha Lowe",
    description: "Embodied writing practice. Somatic techniques for accessing deeper material. Includes guided movement exercises and weekly critique.",
    duration: "6 weeks",
    level: "Intermediate",
    spots: 10,
    status: "upcoming",
  },
];

export default function Greenhouse() {
  const [activeTab, setActiveTab] = useState<TabId>("courses");

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
              Growth Under Optimal Conditions
            </motion.span>
            <motion.h1
              initial={{ opacity: 0, y: 20, filter: "blur(8px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              transition={{ delay: 0.5, duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
              className="text-5xl md:text-7xl lg:text-8xl font-display font-light tracking-tight italic"
              data-testid="greenhouse-title"
            >
              The Greenhouse
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              transition={{ delay: 0.9, duration: 1 }}
              className="font-serif italic text-lg text-white/50 max-w-lg mx-auto leading-relaxed"
            >
              Courses, editorial feedback, submission tracking, and your writer's portfolio.
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

        <section className="py-16 px-6 md:px-12 border-t border-white/[0.04]">
          <div className="max-w-5xl mx-auto">
            <div className="flex flex-wrap items-center justify-center gap-2 mb-16">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-6 py-3 rounded-full font-mono text-[10px] uppercase tracking-widest transition-all duration-300 ${
                    activeTab === tab.id
                      ? "bg-white/[0.08] border border-white/[0.12] text-white/90"
                      : "border border-white/[0.06] text-white/35 hover:text-white/60 hover:bg-white/[0.03]"
                  }`}
                  data-testid={`tab-${tab.id}`}
                >
                  {tab.icon}
                  {tab.label}
                </button>
              ))}
            </div>

            {activeTab === "courses" && <CoursesTab />}
            {activeTab === "feedback" && <FeedbackTab />}
            {activeTab === "submissions" && <SubmissionsTab />}
            {activeTab === "portfolio" && <PortfolioTab />}
          </div>
        </section>
      </main>

      <div className="relative z-10">
        <Footer />
      </div>
    </div>
  );
}

function CoursesTab() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-12"
    >
      <div className="text-center space-y-4">
        <h2 className="text-3xl md:text-4xl font-display font-light italic">Courses</h2>
        <p className="font-serif text-white/40 text-lg max-w-2xl mx-auto leading-relaxed">
          Small-group writing courses led by published writers. Each course includes weekly assignments, peer feedback, and one-on-one mentorship.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {courses.map((course, i) => (
          <motion.div
            key={course.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1, duration: 0.5 }}
            className="bg-white/[0.02] border border-white/[0.06] backdrop-blur-sm rounded-2xl p-7 space-y-4 group hover:bg-white/[0.04] transition-all"
            data-testid={`course-card-${i}`}
          >
            <div className="flex items-center justify-between">
              <span className={`font-mono text-[9px] uppercase tracking-widest px-2.5 py-1 rounded-full border ${
                course.status === "enrolling"
                  ? "text-emerald-400/70 border-emerald-400/20 bg-emerald-400/10"
                  : course.status === "in_progress"
                  ? "text-amber-400/70 border-amber-400/20 bg-amber-400/10"
                  : "text-white/30 border-white/10 bg-white/5"
              }`}>
                {course.status === "enrolling" ? "Enrolling Now" : course.status === "in_progress" ? "In Progress" : "Coming Soon"}
              </span>
              <span className="font-mono text-[9px] text-white/20">{course.level}</span>
            </div>
            <h3 className="font-display text-xl italic text-white/85 group-hover:text-white transition-colors">{course.title}</h3>
            <p className="font-serif text-sm italic text-white/40">with {course.instructor}</p>
            <p className="font-serif text-sm text-white/35 leading-relaxed">{course.description}</p>
            <div className="flex items-center justify-between pt-2">
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1.5 font-mono text-[9px] text-white/25">
                  <Clock size={12} /> {course.duration}
                </span>
                <span className="flex items-center gap-1.5 font-mono text-[9px] text-white/25">
                  <Users size={12} /> {course.spots} spots
                </span>
              </div>
              {course.status === "enrolling" && (
                <button className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-widest text-amber-300/70 hover:text-amber-200 transition-colors" data-testid={`button-enrol-${i}`}>
                  Enrol <ArrowRight size={12} />
                </button>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

function FeedbackTab() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-12"
    >
      <div className="text-center space-y-4">
        <h2 className="text-3xl md:text-4xl font-display font-light italic">Editorial Feedback</h2>
        <p className="font-serif text-white/40 text-lg max-w-2xl mx-auto leading-relaxed">
          Submit a piece for detailed, professional editorial feedback. Our editors provide line-level notes, structural suggestions, and a written editorial letter.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {[
          {
            title: "Quick Read",
            price: "£15",
            description: "A 500-word editorial overview of your piece — strengths, opportunities, and a suggested direction.",
            turnaround: "3-5 days",
            wordLimit: "Up to 3,000 words",
          },
          {
            title: "Full Critique",
            price: "£45",
            description: "Line-level annotations, structural analysis, and a 1,000-word editorial letter. The most popular option.",
            turnaround: "7-10 days",
            wordLimit: "Up to 8,000 words",
            featured: true,
          },
          {
            title: "Manuscript Review",
            price: "£120",
            description: "For longer works — novellas, essay collections, chapbook manuscripts. Includes a 30-minute video call with your editor.",
            turnaround: "2-3 weeks",
            wordLimit: "Up to 30,000 words",
          },
        ].map((tier, i) => (
          <motion.div
            key={tier.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1, duration: 0.5 }}
            className={`bg-white/[0.02] border backdrop-blur-sm rounded-2xl p-7 space-y-5 ${
              tier.featured ? "border-amber-400/20 ring-1 ring-amber-400/10" : "border-white/[0.06]"
            }`}
            data-testid={`feedback-tier-${i}`}
          >
            {tier.featured && (
              <span className="inline-block font-mono text-[8px] uppercase tracking-widest text-amber-400/70 px-2 py-0.5 rounded-full border border-amber-400/20 bg-amber-400/10">
                Most Popular
              </span>
            )}
            <h3 className="font-display text-2xl italic text-white/85">{tier.title}</h3>
            <p className="font-display text-3xl text-white/90">{tier.price}</p>
            <p className="font-serif text-sm text-white/35 leading-relaxed">{tier.description}</p>
            <div className="space-y-2 pt-2">
              <div className="flex items-center gap-2 font-mono text-[9px] text-white/25">
                <Clock size={12} /> {tier.turnaround}
              </div>
              <div className="flex items-center gap-2 font-mono text-[9px] text-white/25">
                <BookOpen size={12} /> {tier.wordLimit}
              </div>
            </div>
            <button
              className={`w-full py-3 rounded-full font-mono text-[10px] uppercase tracking-widest transition-all ${
                tier.featured
                  ? "bg-amber-500/15 border border-amber-500/25 text-amber-200/80 hover:bg-amber-500/25"
                  : "bg-white/[0.04] border border-white/[0.08] text-white/50 hover:bg-white/[0.08]"
              }`}
              data-testid={`button-submit-feedback-${i}`}
            >
              Submit for Review
            </button>
          </motion.div>
        ))}
      </div>

      <div className="bg-white/[0.02] border border-white/[0.06] backdrop-blur-sm rounded-xl p-6 text-center">
        <p className="font-serif text-sm text-white/40 italic leading-relaxed max-w-2xl mx-auto">
          All editorial feedback is provided by our team of published writers and editors. Feedback is private — only you see it. We never share your work without consent.
        </p>
      </div>
    </motion.div>
  );
}

function SubmissionsTab() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-12"
    >
      <div className="text-center space-y-4">
        <h2 className="text-3xl md:text-4xl font-display font-light italic">Submission Tracker</h2>
        <p className="font-serif text-white/40 text-lg max-w-2xl mx-auto leading-relaxed">
          Track your submissions to external journals, contests, and publications. Keep everything organised in one place.
        </p>
      </div>

      <div className="bg-white/[0.02] border border-white/[0.06] backdrop-blur-sm rounded-2xl p-8 space-y-8" data-testid="submissions-tracker">
        <div className="flex items-center justify-between">
          <h3 className="font-display text-lg italic text-white/70">Your Submissions</h3>
          <button className="flex items-center gap-2 px-4 py-2 rounded-full border border-white/[0.08] bg-white/[0.03] font-mono text-[10px] uppercase tracking-widest text-white/50 hover:bg-white/[0.06] transition-all" data-testid="button-add-submission">
            + Add Submission
          </button>
        </div>

        <div className="text-center py-16 space-y-4">
          <FileCheck size={32} className="mx-auto text-white/15" />
          <p className="font-serif text-white/30 italic">No submissions tracked yet.</p>
          <p className="font-serif text-white/20 text-sm">
            Add your first submission to start tracking responses and building your publication history.
          </p>
        </div>

        <div className="border-t border-white/[0.06] pt-6 space-y-3">
          <h4 className="font-mono text-[10px] uppercase tracking-widest text-white/30">How It Works</h4>
          <div className="grid sm:grid-cols-2 gap-4">
            {[
              "Log each submission with journal name, piece title, and date",
              "Track status: Submitted → Under Review → Accepted / Rejected",
              "Set reminders for follow-ups and response windows",
              "View your acceptance rate and submission history over time",
            ].map((step, i) => (
              <div key={i} className="flex gap-3 items-start">
                <span className="w-1.5 h-1.5 rounded-full mt-2 shrink-0 bg-emerald-400/40" />
                <span className="font-serif text-white/35 text-sm leading-relaxed">{step}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function PortfolioTab() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-12"
    >
      <div className="text-center space-y-4">
        <h2 className="text-3xl md:text-4xl font-display font-light italic">Your Portfolio</h2>
        <p className="font-serif text-white/40 text-lg max-w-2xl mx-auto leading-relaxed">
          Build a curated portfolio of your best work. Share it with editors, agents, or anyone who asks "so, what do you write?"
        </p>
      </div>

      <div className="bg-white/[0.02] border border-white/[0.06] backdrop-blur-sm rounded-2xl p-8 space-y-8" data-testid="portfolio-builder">
        <div className="flex items-center justify-between">
          <h3 className="font-display text-lg italic text-white/70">Portfolio Pieces</h3>
          <button className="flex items-center gap-2 px-4 py-2 rounded-full border border-white/[0.08] bg-white/[0.03] font-mono text-[10px] uppercase tracking-widest text-white/50 hover:bg-white/[0.06] transition-all" data-testid="button-add-portfolio-piece">
            + Add Piece
          </button>
        </div>

        <div className="text-center py-16 space-y-4">
          <FolderOpen size={32} className="mx-auto text-white/15" />
          <p className="font-serif text-white/30 italic">Your portfolio is empty.</p>
          <p className="font-serif text-white/20 text-sm">
            Select pieces from your Garden to build a curated collection of your strongest work.
          </p>
        </div>

        <div className="border-t border-white/[0.06] pt-6 space-y-4">
          <h4 className="font-mono text-[10px] uppercase tracking-widest text-white/30">Portfolio Features</h4>
          <div className="grid sm:grid-cols-2 gap-4">
            {[
              "Curate your best 5-8 pieces across genres",
              "Customise ordering and add context notes",
              "Generate a shareable portfolio link",
              "Export as PDF for grant and residency applications",
            ].map((feature, i) => (
              <div key={i} className="flex gap-3 items-start">
                <span className="w-1.5 h-1.5 rounded-full mt-2 shrink-0 bg-amber-400/40" />
                <span className="font-serif text-white/35 text-sm leading-relaxed">{feature}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white/[0.02] border border-white/[0.06] backdrop-blur-sm rounded-xl p-6 text-center">
        <p className="font-serif text-sm text-white/40 italic leading-relaxed max-w-2xl mx-auto">
          Your portfolio draws from your Garden. Pieces you add here remain private unless you choose to share the portfolio link.
        </p>
      </div>
    </motion.div>
  );
}
