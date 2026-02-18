import { useState, useMemo } from "react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import StarBackground from "@/components/StarBackground";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import {
  Flower2,
  ExternalLink,
  Calendar,
  DollarSign,
  Tag,
  Filter,
  Sprout,
  Leaf,
  Award,
  Clock,
  Search,
  ChevronDown,
} from "lucide-react";

interface Opportunity {
  id: string;
  title: string;
  link: string;
  outlet: string;
  deadline: string;
  payRate: string;
  responseTime: string;
  vibe: string;
  genres: string[] | null;
  notes: string;
  isCurated: boolean;
  opType: string;
  fee: string | null;
  theme: string | null;
  isPageGallery: boolean;
  isRolling: boolean;
  createdAt: string;
}

interface TrackerItem {
  id: string;
  userId: string;
  opportunityId: string;
  status: string;
  submittedAt: string | null;
  acceptedAt: string | null;
  notes: string | null;
  createdAt: string;
}

type TabKey = "page_gallery" | "open_calls" | "general";
type GenreFilter = "any" | "poetry" | "fiction" | "nonfiction" | "drama";
type DeadlineSort = "soonest" | "latest" | "none";
type FeeFilter = "all" | "free" | "fee";
type PayFilter = "all" | "paid" | "unpaid";

const tabs: { key: TabKey; label: string; icon?: boolean }[] = [
  { key: "page_gallery", label: "Page Gallery Calls", icon: true },
  { key: "open_calls", label: "Open Calls" },
  { key: "general", label: "General Submissions" },
];

function classifyOpportunity(op: Opportunity): TabKey {
  if (op.isPageGallery) return "page_gallery";
  if (op.isRolling || op.opType === "general_submission") return "general";
  return "open_calls";
}

function parseDeadline(d: string): Date | null {
  if (!d) return null;
  const parsed = new Date(d);
  return isNaN(parsed.getTime()) ? null : parsed;
}

function formatDeadline(d: string): string {
  const parsed = parseDeadline(d);
  if (!parsed) return d || "Rolling";
  return parsed.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function isExpired(d: string): boolean {
  const parsed = parseDeadline(d);
  if (!parsed) return false;
  return parsed < new Date();
}

export default function Opportunities() {
  const { user, isAuthenticated } = useAuth();
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState<TabKey>("page_gallery");
  const [genreFilter, setGenreFilter] = useState<GenreFilter>("any");
  const [deadlineSort, setDeadlineSort] = useState<DeadlineSort>("soonest");
  const [feeFilter, setFeeFilter] = useState<FeeFilter>("all");
  const [payFilter, setPayFilter] = useState<PayFilter>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  const { data: opportunities = [], isLoading } = useQuery<Opportunity[]>({
    queryKey: ["/api/curated-opportunities"],
    queryFn: async () => {
      const res = await fetch("/api/curated-opportunities");
      if (!res.ok) return [];
      return res.json();
    },
  });

  const { data: userOpportunities = [] } = useQuery<Opportunity[]>({
    queryKey: ["/api/opportunities"],
    queryFn: async () => {
      const res = await fetch("/api/opportunities", { credentials: "include" });
      if (!res.ok) return [];
      return res.json();
    },
    enabled: isAuthenticated,
  });

  const allOpportunities = useMemo(() => {
    const map = new Map<string, Opportunity>();
    for (const op of opportunities) map.set(op.id, op);
    for (const op of userOpportunities) map.set(op.id, op);
    return Array.from(map.values());
  }, [opportunities, userOpportunities]);

  const { data: trackerItems = [] } = useQuery<TrackerItem[]>({
    queryKey: ["/api/opportunity-tracker"],
    queryFn: async () => {
      const res = await fetch("/api/opportunity-tracker", { credentials: "include" });
      if (!res.ok) return [];
      return res.json();
    },
    enabled: isAuthenticated,
  });

  const trackerMutation = useMutation({
    mutationFn: async ({ opportunityId, status, notes }: { opportunityId: string; status: string; notes?: string }) => {
      const res = await fetch("/api/opportunity-tracker", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ opportunityId, status, notes }),
      });
      if (!res.ok) throw new Error("Failed to update tracker");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/opportunity-tracker"] });
    },
  });

  const deleteTrackerMutation = useMutation({
    mutationFn: async (opportunityId: string) => {
      const res = await fetch(`/api/opportunity-tracker/${opportunityId}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to delete tracker item");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/opportunity-tracker"] });
    },
  });

  const trackerMap = useMemo(() => {
    const map = new Map<string, TrackerItem>();
    for (const item of trackerItems) map.set(item.opportunityId, item);
    return map;
  }, [trackerItems]);

  const filteredOpportunities = useMemo(() => {
    let filtered = allOpportunities.filter((op) => classifyOpportunity(op) === activeTab);

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (op) =>
          op.title.toLowerCase().includes(q) ||
          op.outlet.toLowerCase().includes(q) ||
          (op.theme && op.theme.toLowerCase().includes(q))
      );
    }

    if (genreFilter !== "any") {
      filtered = filtered.filter(
        (op) => op.genres && op.genres.some((g) => g.toLowerCase() === genreFilter)
      );
    }

    if (feeFilter === "free") {
      filtered = filtered.filter((op) => !op.fee || op.fee === "0" || op.fee.toLowerCase() === "free" || op.fee === "");
    } else if (feeFilter === "fee") {
      filtered = filtered.filter((op) => op.fee && op.fee !== "0" && op.fee.toLowerCase() !== "free" && op.fee !== "");
    }

    if (payFilter === "paid") {
      filtered = filtered.filter((op) => op.payRate && op.payRate !== "" && op.payRate !== "0" && op.payRate.toLowerCase() !== "none");
    } else if (payFilter === "unpaid") {
      filtered = filtered.filter((op) => !op.payRate || op.payRate === "" || op.payRate === "0" || op.payRate.toLowerCase() === "none");
    }

    if (deadlineSort === "soonest") {
      filtered.sort((a, b) => {
        const da = parseDeadline(a.deadline);
        const db = parseDeadline(b.deadline);
        if (!da && !db) return 0;
        if (!da) return 1;
        if (!db) return -1;
        return da.getTime() - db.getTime();
      });
    } else if (deadlineSort === "latest") {
      filtered.sort((a, b) => {
        const da = parseDeadline(a.deadline);
        const db = parseDeadline(b.deadline);
        if (!da && !db) return 0;
        if (!da) return 1;
        if (!db) return -1;
        return db.getTime() - da.getTime();
      });
    }

    return filtered;
  }, [allOpportunities, activeTab, searchQuery, genreFilter, feeFilter, payFilter, deadlineSort]);

  const greenhouseItems = trackerItems.filter((t) => t.status === "greenhouse");
  const plantedItems = trackerItems.filter((t) => t.status === "planted");
  const harvestedItems = trackerItems.filter((t) => t.status === "harvested");

  const getOpportunityById = (id: string) => allOpportunities.find((op) => op.id === id);

  return (
    <div className="min-h-screen bg-[#0b101a] text-white selection:bg-secondary selection:text-background relative">
      <StarBackground />
      <Navigation />

      <main className="relative z-10">
        <section className="min-h-[60vh] flex flex-col items-center justify-center px-6 pt-32 pb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center space-y-6"
          >
            <span className="font-mono text-[10px] tracking-[0.4em] text-amber-200/25 block uppercase">
              For Writers Who Submit
            </span>
            <h1 className="text-5xl md:text-7xl font-display font-light tracking-tight italic" data-testid="text-page-title">
              Curated Opportunities
            </h1>
            <p className="text-lg font-serif italic text-white/45 max-w-xl mx-auto leading-relaxed">
              Calls for submission, residencies, and places that honour the craft.
              Gathered with care, tracked with intention.
            </p>
            <div className="flex items-center justify-center gap-4 pt-2">
              <div className="h-px w-16 bg-gradient-to-r from-transparent to-amber-600/20" />
              <Flower2 size={14} className="text-amber-400/30" />
              <div className="h-px w-16 bg-gradient-to-l from-transparent to-amber-600/20" />
            </div>
          </motion.div>
        </section>

        <section className="max-w-6xl mx-auto px-6 pb-8">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="flex flex-wrap items-center justify-center gap-2"
          >
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`px-5 py-2.5 rounded-full font-mono text-[11px] uppercase tracking-widest whitespace-nowrap transition-all duration-300 flex items-center gap-2 ${
                  activeTab === tab.key
                    ? "bg-white/[0.08] border border-amber-500/30 text-amber-200/90 shadow-[0_0_12px_rgba(217,169,56,0.08)]"
                    : "border border-white/[0.07] text-white/40 hover:text-white/65 hover:border-white/15 hover:bg-white/[0.03]"
                }`}
                data-testid={`tab-${tab.key}`}
              >
                {tab.icon && <Flower2 size={13} className="text-amber-400" />}
                {tab.label}
                {tab.icon && (
                  <span className="px-1.5 py-0.5 text-[8px] bg-amber-500/20 text-amber-400 rounded-full border border-amber-500/30 font-mono uppercase tracking-wider">
                    Page Gallery Original
                  </span>
                )}
              </button>
            ))}
          </motion.div>
        </section>

        <section className="max-w-6xl mx-auto px-6 pb-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="space-y-4"
          >
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <div className="relative flex-1">
                <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/25" />
                <input
                  type="text"
                  placeholder="Search opportunities..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-white/[0.04] border border-white/[0.08] rounded-full font-serif text-sm text-white/80 placeholder:text-white/25 focus:outline-none focus:border-amber-600/30 transition-colors"
                  data-testid="input-search-opportunities"
                />
              </div>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center gap-2 px-5 py-3 rounded-full border font-mono text-[11px] uppercase tracking-widest transition-all ${
                  showFilters
                    ? "border-amber-500/30 bg-amber-500/10 text-amber-200/90"
                    : "border-white/[0.08] text-white/40 hover:text-white/65 hover:bg-white/[0.03]"
                }`}
                data-testid="button-toggle-filters"
              >
                <Filter size={13} />
                Filters
                <ChevronDown size={12} className={`transition-transform ${showFilters ? "rotate-180" : ""}`} />
              </button>
            </div>

            <AnimatePresence>
              {showFilters && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden"
                >
                  <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl backdrop-blur-sm p-5 grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="space-y-2">
                      <label className="font-mono text-[9px] uppercase tracking-widest text-white/30 block">Genre</label>
                      <select
                        value={genreFilter}
                        onChange={(e) => setGenreFilter(e.target.value as GenreFilter)}
                        className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2 font-serif text-sm text-white/70 focus:outline-none focus:border-amber-600/30 appearance-none cursor-pointer"
                        data-testid="select-genre-filter"
                      >
                        <option value="any">Any Genre</option>
                        <option value="poetry">Poetry</option>
                        <option value="fiction">Fiction</option>
                        <option value="nonfiction">Nonfiction</option>
                        <option value="drama">Drama</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="font-mono text-[9px] uppercase tracking-widest text-white/30 block">Deadline</label>
                      <select
                        value={deadlineSort}
                        onChange={(e) => setDeadlineSort(e.target.value as DeadlineSort)}
                        className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2 font-serif text-sm text-white/70 focus:outline-none focus:border-amber-600/30 appearance-none cursor-pointer"
                        data-testid="select-deadline-sort"
                      >
                        <option value="soonest">Soonest First</option>
                        <option value="latest">Latest First</option>
                        <option value="none">No Sort</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="font-mono text-[9px] uppercase tracking-widest text-white/30 block">Fee</label>
                      <select
                        value={feeFilter}
                        onChange={(e) => setFeeFilter(e.target.value as FeeFilter)}
                        className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2 font-serif text-sm text-white/70 focus:outline-none focus:border-amber-600/30 appearance-none cursor-pointer"
                        data-testid="select-fee-filter"
                      >
                        <option value="all">All</option>
                        <option value="free">Free Only</option>
                        <option value="fee">With Fee</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="font-mono text-[9px] uppercase tracking-widest text-white/30 block">Pay Rate</label>
                      <select
                        value={payFilter}
                        onChange={(e) => setPayFilter(e.target.value as PayFilter)}
                        className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2 font-serif text-sm text-white/70 focus:outline-none focus:border-amber-600/30 appearance-none cursor-pointer"
                        data-testid="select-pay-filter"
                      >
                        <option value="all">All</option>
                        <option value="paid">Paid</option>
                        <option value="unpaid">Unpaid / Contributor Copies</option>
                      </select>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </section>

        <section className="max-w-6xl mx-auto px-6 pb-20">
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-6 animate-pulse">
                  <div className="h-5 w-48 bg-white/[0.04] rounded mb-3" />
                  <div className="h-3 w-32 bg-white/[0.03] rounded mb-2" />
                  <div className="flex gap-2">
                    <div className="h-3 w-16 bg-white/[0.03] rounded" />
                    <div className="h-3 w-20 bg-white/[0.03] rounded" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredOpportunities.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-20 space-y-6"
            >
              <Leaf size={32} className="mx-auto text-amber-200/20" />
              <h3 className="text-3xl font-display font-light text-white/70 italic" data-testid="text-empty-state">
                {activeTab === "page_gallery"
                  ? "No Page Gallery Calls Right Now"
                  : activeTab === "open_calls"
                  ? "No Open Calls Found"
                  : "No General Submissions Listed"}
              </h3>
              <p className="text-white/40 font-serif italic max-w-md mx-auto">
                New opportunities are added regularly. Check back soon, or adjust your filters.
              </p>
            </motion.div>
          ) : (
            <div className="grid gap-4">
              {filteredOpportunities.map((op, i) => (
                <OpportunityCard
                  key={op.id}
                  opportunity={op}
                  index={i}
                  trackerStatus={trackerMap.get(op.id)?.status}
                  isAuthenticated={isAuthenticated}
                  onSave={(status) =>
                    trackerMutation.mutate({ opportunityId: op.id, status })
                  }
                  onRemove={() => deleteTrackerMutation.mutate(op.id)}
                />
              ))}
            </div>
          )}
        </section>

        {isAuthenticated && (
          <section className="max-w-6xl mx-auto px-6 pb-24">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
              className="space-y-8"
            >
              <div className="text-center space-y-3">
                <span className="font-mono text-[10px] tracking-[0.4em] text-emerald-400/30 block uppercase">
                  Your Submission Tracker
                </span>
                <h2 className="text-3xl md:text-4xl font-display font-light italic text-white/85" data-testid="text-tracker-title">
                  Growing Season
                </h2>
                <p className="font-serif italic text-white/40 text-sm">
                  Save, plant, and harvest your submissions.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <TrackerColumn
                  title="Greenhouse"
                  subtitle="Saved & researching"
                  icon={<Sprout size={16} />}
                  accentClass="emerald"
                  items={greenhouseItems}
                  getOpportunity={getOpportunityById}
                  onMove={(oppId, status) => trackerMutation.mutate({ opportunityId: oppId, status })}
                  onRemove={(oppId) => deleteTrackerMutation.mutate(oppId)}
                  moveOptions={[
                    { label: "Mark as Planted", status: "planted" },
                    { label: "Mark as Harvested", status: "harvested" },
                  ]}
                />
                <TrackerColumn
                  title="Planted"
                  subtitle="Submitted & waiting"
                  icon={<Leaf size={16} />}
                  accentClass="amber"
                  items={plantedItems}
                  getOpportunity={getOpportunityById}
                  onMove={(oppId, status) => trackerMutation.mutate({ opportunityId: oppId, status })}
                  onRemove={(oppId) => deleteTrackerMutation.mutate(oppId)}
                  moveOptions={[
                    { label: "Move to Greenhouse", status: "greenhouse" },
                    { label: "Mark as Harvested", status: "harvested" },
                  ]}
                />
                <TrackerColumn
                  title="Harvested"
                  subtitle="Accepted & published"
                  icon={<Award size={16} />}
                  accentClass="yellow"
                  items={harvestedItems}
                  getOpportunity={getOpportunityById}
                  onMove={(oppId, status) => trackerMutation.mutate({ opportunityId: oppId, status })}
                  onRemove={(oppId) => deleteTrackerMutation.mutate(oppId)}
                  moveOptions={[
                    { label: "Move to Greenhouse", status: "greenhouse" },
                    { label: "Move to Planted", status: "planted" },
                  ]}
                />
              </div>
            </motion.div>
          </section>
        )}
      </main>

      <div className="relative z-10">
        <Footer />
      </div>
    </div>
  );
}

function OpportunityCard({
  opportunity: op,
  index,
  trackerStatus,
  isAuthenticated,
  onSave,
  onRemove,
}: {
  opportunity: Opportunity;
  index: number;
  trackerStatus?: string;
  isAuthenticated: boolean;
  onSave: (status: string) => void;
  onRemove: () => void;
}) {
  const [showActions, setShowActions] = useState(false);
  const expired = isExpired(op.deadline);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-30px" }}
      transition={{ delay: Math.min(index * 0.06, 0.3), duration: 0.6 }}
      className={`bg-white/[0.02] border border-white/[0.06] rounded-2xl backdrop-blur-sm p-6 hover:bg-white/[0.04] hover:border-white/[0.1] transition-all duration-500 group relative ${
        expired ? "opacity-60" : ""
      }`}
      data-testid={`card-opportunity-${op.id}`}
    >
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div className="space-y-3 flex-1 min-w-0">
          <div className="flex items-center gap-3 flex-wrap">
            {op.isPageGallery && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-mono uppercase tracking-wider bg-amber-500/15 text-amber-400 border border-amber-500/25" data-testid={`badge-page-gallery-${op.id}`}>
                <Flower2 size={11} />
                Page Gallery
              </span>
            )}
            {expired && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-mono uppercase tracking-wider bg-red-500/10 text-red-400/70 border border-red-500/20">
                Expired
              </span>
            )}
          </div>

          <h3 className="text-xl md:text-2xl font-display font-light italic text-white/85 group-hover:text-white transition-colors" data-testid={`text-opportunity-title-${op.id}`}>
            {op.title}
          </h3>

          {op.outlet && (
            <p className="font-serif text-sm text-white/45 italic" data-testid={`text-opportunity-outlet-${op.id}`}>
              {op.outlet}
            </p>
          )}

          {op.theme && (
            <p className="font-serif text-xs text-white/35 italic">
              <span className="text-white/20 font-mono text-[9px] uppercase tracking-widest mr-2">Theme:</span>
              {op.theme}
            </p>
          )}

          <div className="flex flex-wrap items-center gap-3 pt-1">
            {op.deadline && (
              <span className="inline-flex items-center gap-1.5 text-[11px] font-mono text-white/40" data-testid={`text-deadline-${op.id}`}>
                <Calendar size={11} className="text-white/25" />
                {op.isRolling ? "Rolling" : formatDeadline(op.deadline)}
              </span>
            )}

            {op.payRate && op.payRate !== "" && op.payRate !== "0" && (
              <span className="inline-flex items-center gap-1.5 text-[11px] font-mono text-emerald-400/60" data-testid={`text-pay-rate-${op.id}`}>
                <DollarSign size={11} />
                {op.payRate}
              </span>
            )}

            {op.fee && op.fee !== "" && op.fee !== "0" && op.fee.toLowerCase() !== "free" && (
              <span className="inline-flex items-center gap-1.5 text-[11px] font-mono text-amber-400/50" data-testid={`text-fee-${op.id}`}>
                Fee: {op.fee}
              </span>
            )}
            {(!op.fee || op.fee === "" || op.fee === "0" || op.fee.toLowerCase() === "free") && (
              <span className="inline-flex items-center gap-1.5 text-[11px] font-mono text-emerald-400/40">
                No fee
              </span>
            )}

            {op.responseTime && (
              <span className="inline-flex items-center gap-1.5 text-[11px] font-mono text-white/30">
                <Clock size={11} />
                {op.responseTime}
              </span>
            )}
          </div>

          {op.genres && op.genres.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-1">
              {op.genres.map((genre) => (
                <span
                  key={genre}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-mono uppercase tracking-wider bg-white/[0.04] text-white/40 border border-white/[0.06]"
                >
                  <Tag size={9} />
                  {genre}
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="flex sm:flex-col items-center sm:items-end gap-2 flex-shrink-0">
          {op.link && (
            <a
              href={op.link}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-amber-500/20 text-amber-400/80 font-mono text-[10px] uppercase tracking-widest hover:bg-amber-500/10 hover:border-amber-500/40 transition-all"
              data-testid={`link-opportunity-${op.id}`}
            >
              <ExternalLink size={12} />
              Visit
            </a>
          )}

          {isAuthenticated && (
            <div className="relative">
              <button
                onClick={() => setShowActions(!showActions)}
                className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-full border font-mono text-[10px] uppercase tracking-widest transition-all ${
                  trackerStatus
                    ? trackerStatus === "greenhouse"
                      ? "border-emerald-500/30 text-emerald-400/70 bg-emerald-500/10"
                      : trackerStatus === "planted"
                      ? "border-amber-500/30 text-amber-400/70 bg-amber-500/10"
                      : "border-yellow-500/30 text-yellow-400/70 bg-yellow-500/10"
                    : "border-white/[0.08] text-white/40 hover:text-white/65 hover:bg-white/[0.03]"
                }`}
                data-testid={`button-track-${op.id}`}
              >
                <Sprout size={11} />
                {trackerStatus
                  ? trackerStatus === "greenhouse"
                    ? "Saved"
                    : trackerStatus === "planted"
                    ? "Planted"
                    : "Harvested"
                  : "Save"}
                <ChevronDown size={10} className={`transition-transform ${showActions ? "rotate-180" : ""}`} />
              </button>

              <AnimatePresence>
                {showActions && (
                  <motion.div
                    initial={{ opacity: 0, y: -4, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -4, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 top-full mt-1 z-20 bg-[#141a28] border border-white/[0.1] rounded-xl shadow-xl overflow-hidden min-w-[160px]"
                  >
                    {!trackerStatus && (
                      <button
                        onClick={() => { onSave("greenhouse"); setShowActions(false); }}
                        className="w-full text-left px-4 py-2.5 font-mono text-[10px] uppercase tracking-widest text-emerald-400/70 hover:bg-white/[0.04] transition-colors flex items-center gap-2"
                        data-testid={`button-save-greenhouse-${op.id}`}
                      >
                        <Sprout size={11} /> Greenhouse
                      </button>
                    )}
                    {trackerStatus !== "greenhouse" && (
                      <button
                        onClick={() => { onSave("greenhouse"); setShowActions(false); }}
                        className="w-full text-left px-4 py-2.5 font-mono text-[10px] uppercase tracking-widest text-emerald-400/70 hover:bg-white/[0.04] transition-colors flex items-center gap-2"
                        data-testid={`button-move-greenhouse-${op.id}`}
                      >
                        <Sprout size={11} /> To Greenhouse
                      </button>
                    )}
                    {trackerStatus !== "planted" && (
                      <button
                        onClick={() => { onSave("planted"); setShowActions(false); }}
                        className="w-full text-left px-4 py-2.5 font-mono text-[10px] uppercase tracking-widest text-amber-400/70 hover:bg-white/[0.04] transition-colors flex items-center gap-2"
                        data-testid={`button-move-planted-${op.id}`}
                      >
                        <Leaf size={11} /> To Planted
                      </button>
                    )}
                    {trackerStatus !== "harvested" && (
                      <button
                        onClick={() => { onSave("harvested"); setShowActions(false); }}
                        className="w-full text-left px-4 py-2.5 font-mono text-[10px] uppercase tracking-widest text-yellow-400/70 hover:bg-white/[0.04] transition-colors flex items-center gap-2"
                        data-testid={`button-move-harvested-${op.id}`}
                      >
                        <Award size={11} /> To Harvested
                      </button>
                    )}
                    {trackerStatus && (
                      <>
                        <div className="h-px bg-white/[0.06]" />
                        <button
                          onClick={() => { onRemove(); setShowActions(false); }}
                          className="w-full text-left px-4 py-2.5 font-mono text-[10px] uppercase tracking-widest text-red-400/60 hover:bg-white/[0.04] transition-colors"
                          data-testid={`button-remove-tracker-${op.id}`}
                        >
                          Remove
                        </button>
                      </>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

function TrackerColumn({
  title,
  subtitle,
  icon,
  accentClass,
  items,
  getOpportunity,
  onMove,
  onRemove,
  moveOptions,
}: {
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  accentClass: "emerald" | "amber" | "yellow";
  items: TrackerItem[];
  getOpportunity: (id: string) => Opportunity | undefined;
  onMove: (opportunityId: string, status: string) => void;
  onRemove: (opportunityId: string) => void;
  moveOptions: { label: string; status: string }[];
}) {
  const borderColor =
    accentClass === "emerald"
      ? "border-emerald-500/20"
      : accentClass === "amber"
      ? "border-amber-500/20"
      : "border-yellow-500/20";
  const iconColor =
    accentClass === "emerald"
      ? "text-emerald-400"
      : accentClass === "amber"
      ? "text-amber-400"
      : "text-yellow-400";
  const countBg =
    accentClass === "emerald"
      ? "bg-emerald-500/15 text-emerald-400"
      : accentClass === "amber"
      ? "bg-amber-500/15 text-amber-400"
      : "bg-yellow-500/15 text-yellow-400";

  return (
    <div
      className={`bg-white/[0.02] border ${borderColor} rounded-2xl backdrop-blur-sm p-5 space-y-4`}
      data-testid={`tracker-column-${title.toLowerCase()}`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className={iconColor}>{icon}</span>
          <h3 className="font-display text-lg italic text-white/80">{title}</h3>
        </div>
        <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono ${countBg}`}>
          {items.length}
        </span>
      </div>
      <p className="font-mono text-[9px] uppercase tracking-widest text-white/25">{subtitle}</p>

      <div className="space-y-3 min-h-[100px]">
        {items.length === 0 ? (
          <div className="text-center py-8">
            <p className="font-serif text-xs text-white/25 italic">Nothing here yet</p>
          </div>
        ) : (
          items.map((item) => {
            const op = getOpportunity(item.opportunityId);
            if (!op) return null;
            return (
              <TrackerCard
                key={item.id}
                item={item}
                opportunity={op}
                moveOptions={moveOptions}
                onMove={onMove}
                onRemove={onRemove}
              />
            );
          })
        )}
      </div>
    </div>
  );
}

function TrackerCard({
  item,
  opportunity: op,
  moveOptions,
  onMove,
  onRemove,
}: {
  item: TrackerItem;
  opportunity: Opportunity;
  moveOptions: { label: string; status: string }[];
  onMove: (opportunityId: string, status: string) => void;
  onRemove: (opportunityId: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div
      className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-3 space-y-2"
      data-testid={`tracker-card-${item.opportunityId}`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <h4 className="font-display text-sm italic text-white/75 truncate">{op.title}</h4>
          {op.outlet && (
            <p className="font-mono text-[9px] text-white/30 truncate">{op.outlet}</p>
          )}
        </div>
        <button
          onClick={() => setExpanded(!expanded)}
          className="text-white/20 hover:text-white/50 transition-colors"
          data-testid={`button-expand-tracker-${item.opportunityId}`}
        >
          <ChevronDown size={12} className={`transition-transform ${expanded ? "rotate-180" : ""}`} />
        </button>
      </div>

      {item.submittedAt && (
        <p className="font-mono text-[9px] text-amber-400/40">
          Submitted {new Date(item.submittedAt).toLocaleDateString()}
        </p>
      )}
      {item.acceptedAt && (
        <p className="font-mono text-[9px] text-yellow-400/40">
          Accepted {new Date(item.acceptedAt).toLocaleDateString()}
        </p>
      )}

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="space-y-2 overflow-hidden"
          >
            {op.deadline && (
              <p className="font-mono text-[9px] text-white/25 flex items-center gap-1">
                <Calendar size={9} /> {formatDeadline(op.deadline)}
              </p>
            )}
            <div className="flex flex-wrap gap-1.5">
              {moveOptions.map((opt) => (
                <button
                  key={opt.status}
                  onClick={() => onMove(item.opportunityId, opt.status)}
                  className="px-2.5 py-1 rounded-full border border-white/[0.08] font-mono text-[8px] uppercase tracking-widest text-white/40 hover:text-white/65 hover:bg-white/[0.04] transition-all"
                  data-testid={`button-move-${opt.status}-${item.opportunityId}`}
                >
                  {opt.label}
                </button>
              ))}
              <button
                onClick={() => onRemove(item.opportunityId)}
                className="px-2.5 py-1 rounded-full border border-red-500/15 font-mono text-[8px] uppercase tracking-widest text-red-400/50 hover:text-red-400/70 hover:bg-red-500/5 transition-all"
                data-testid={`button-remove-${item.opportunityId}`}
              >
                Remove
              </button>
            </div>
            {op.link && (
              <a
                href={op.link}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 font-mono text-[9px] text-amber-400/50 hover:text-amber-400/80 transition-colors"
                data-testid={`link-tracker-${item.opportunityId}`}
              >
                <ExternalLink size={9} /> Open Link
              </a>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
