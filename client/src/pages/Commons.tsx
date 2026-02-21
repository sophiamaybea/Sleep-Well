import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import StarBackground from "@/components/StarBackground";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { BookOpen, Flower, Palette, Users, Eye, Calendar, Tag, ChevronDown, ChevronRight, Layers } from "lucide-react";
import { stripHtml } from "@/components/garden/RichEditor";

type Tab = "garden" | "bouquets" | "moodboards";

interface CommonsWriting {
  id: string;
  userId: string;
  writingId: string;
  sharedAt: string | null;
  title: string;
  content: string;
  genre: string;
  authorName: string | null;
  authorId: string;
}

interface Bouquet {
  id: string;
  curatorId: string;
  title: string;
  description: string;
  theme: string | null;
  isPublic: boolean;
  createdAt: string | null;
  curatorName: string | null;
  itemCount: number;
}

interface BouquetDetail extends Bouquet {
  items: {
    id: string;
    bouquetId: string;
    writingId: string;
    sortOrder: number;
    note: string | null;
    createdAt: string | null;
    writingTitle: string;
    authorName: string | null;
  }[];
}

interface SharedMoodboard {
  id: string;
  userId: string;
  title: string;
  description: string;
  isShared: boolean;
  createdAt: string | null;
  updatedAt: string | null;
  userName: string | null;
}

interface MoodboardDetail extends SharedMoodboard {
  items: {
    id: string;
    moodboardId: string;
    itemType: string;
    content: string;
    color: string | null;
    imageUrl: string | null;
    sortOrder: number;
    createdAt: string | null;
  }[];
}

const tabs: { key: Tab; label: string; icon: typeof BookOpen }[] = [
  { key: "garden", label: "Shared Garden", icon: BookOpen },
  { key: "bouquets", label: "Reading Bouquets", icon: Flower },
  { key: "moodboards", label: "Moodboards", icon: Palette },
];

export default function Commons() {
  const [activeTab, setActiveTab] = useState<Tab>("garden");
  const [expandedWriting, setExpandedWriting] = useState<string | null>(null);
  const [selectedBouquet, setSelectedBouquet] = useState<string | null>(null);
  const [selectedMoodboard, setSelectedMoodboard] = useState<string | null>(null);

  const { data: commons = [], isLoading: commonsLoading } = useQuery<CommonsWriting[]>({
    queryKey: ["/api/commons"],
    queryFn: async () => {
      const res = await fetch("/api/commons");
      if (!res.ok) return [];
      return res.json();
    },
  });

  const { data: bouquets = [], isLoading: bouquetsLoading } = useQuery<Bouquet[]>({
    queryKey: ["/api/bouquets"],
    queryFn: async () => {
      const res = await fetch("/api/bouquets");
      if (!res.ok) return [];
      return res.json();
    },
  });

  const { data: bouquetDetail, isLoading: bouquetDetailLoading } = useQuery<BouquetDetail>({
    queryKey: ["/api/bouquets", selectedBouquet],
    queryFn: async () => {
      const res = await fetch(`/api/bouquets/${selectedBouquet}`);
      if (!res.ok) throw new Error("Not found");
      return res.json();
    },
    enabled: !!selectedBouquet,
  });

  const { data: sharedMoodboards = [], isLoading: moodboardsLoading } = useQuery<SharedMoodboard[]>({
    queryKey: ["/api/moodboards/shared"],
    queryFn: async () => {
      const res = await fetch("/api/moodboards/shared");
      if (!res.ok) return [];
      return res.json();
    },
  });

  const { data: moodboardDetail, isLoading: moodboardDetailLoading } = useQuery<MoodboardDetail>({
    queryKey: ["/api/moodboards", selectedMoodboard],
    queryFn: async () => {
      const res = await fetch(`/api/moodboards/${selectedMoodboard}`);
      if (!res.ok) throw new Error("Not found");
      return res.json();
    },
    enabled: !!selectedMoodboard,
  });

  return (
    <div className="min-h-screen bg-transparent text-foreground selection:bg-secondary selection:text-background relative">
      <StarBackground />
      <Navigation />

      <main className="relative z-10">
        <section className="min-h-[70vh] flex flex-col items-center justify-center px-6 relative pt-32 pb-16">
          <div className="text-center space-y-6">
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.35 }}
              transition={{ delay: 0.3, duration: 1 }}
              className="font-mono text-[10px] tracking-[0.4em] block uppercase"
              data-testid="text-commons-label"
            >
              Peer-to-Peer Writing Space
            </motion.span>
            <motion.h1
              initial={{ opacity: 0, y: 20, filter: "blur(8px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              transition={{ delay: 0.5, duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
              className="text-5xl md:text-7xl lg:text-8xl font-display font-light tracking-normal italic"
              data-testid="text-commons-title"
            >
              The Commons
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              transition={{ delay: 0.9, duration: 1 }}
              className="font-serif italic text-lg text-white/50 max-w-lg mx-auto leading-relaxed"
              data-testid="text-commons-subtitle"
            >
              A communal garden where writers share work with peers
            </motion.p>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.2, duration: 0.8 }}
              className="flex items-center justify-center gap-4 pt-2"
            >
              <div className="h-px w-16 bg-gradient-to-r from-transparent to-emerald-600/20" />
              <div className="w-1.5 h-1.5 rotate-45 border border-emerald-600/20" />
              <div className="h-px w-16 bg-gradient-to-l from-transparent to-emerald-600/20" />
            </motion.div>
          </div>
        </section>

        <section className="max-w-6xl mx-auto px-6 pb-32">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="flex justify-center mb-12"
          >
            <div className="inline-flex items-center border border-white/[0.08] rounded-full p-1 bg-white/[0.02] backdrop-blur-sm" data-testid="tab-navigation">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.key}
                    onClick={() => {
                      setActiveTab(tab.key);
                      setExpandedWriting(null);
                      setSelectedBouquet(null);
                      setSelectedMoodboard(null);
                    }}
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-full font-mono text-[10px] uppercase tracking-widest transition-all duration-300 ${
                      activeTab === tab.key
                        ? "bg-white/[0.08] text-white/80 shadow-[0_0_12px_rgba(255,255,255,0.03)]"
                        : "text-white/35 hover:text-white/55"
                    }`}
                    data-testid={`tab-${tab.key}`}
                  >
                    <Icon size={13} />
                    <span className="hidden sm:inline">{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </motion.div>

          <AnimatePresence mode="wait">
            {activeTab === "garden" && (
              <motion.div
                key="garden"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 }}
                transition={{ duration: 0.4 }}
              >
                <SharedGardenTab
                  items={commons}
                  isLoading={commonsLoading}
                  expandedId={expandedWriting}
                  onExpand={setExpandedWriting}
                />
              </motion.div>
            )}
            {activeTab === "bouquets" && (
              <motion.div
                key="bouquets"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 }}
                transition={{ duration: 0.4 }}
              >
                <BouquetsTab
                  bouquets={bouquets}
                  isLoading={bouquetsLoading}
                  selectedId={selectedBouquet}
                  onSelect={setSelectedBouquet}
                  detail={bouquetDetail}
                  detailLoading={bouquetDetailLoading}
                />
              </motion.div>
            )}
            {activeTab === "moodboards" && (
              <motion.div
                key="moodboards"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 }}
                transition={{ duration: 0.4 }}
              >
                <MoodboardsTab
                  moodboards={sharedMoodboards}
                  isLoading={moodboardsLoading}
                  selectedId={selectedMoodboard}
                  onSelect={setSelectedMoodboard}
                  detail={moodboardDetail}
                  detailLoading={moodboardDetailLoading}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </section>
      </main>

      <div className="relative z-10">
        <Footer />
      </div>
    </div>
  );
}

function SharedGardenTab({
  items,
  isLoading,
  expandedId,
  onExpand,
}: {
  items: CommonsWriting[];
  isLoading: boolean;
  expandedId: string | null;
  onExpand: (id: string | null) => void;
}) {
  if (isLoading) return <LoadingSkeleton count={6} />;

  if (items.length === 0) {
    return (
      <EmptyState
        icon={<BookOpen size={36} className="text-emerald-400/30" />}
        title="The Garden Awaits Its First Seeds"
        description="No writings have been shared to the commons yet. When writers share their work, it will bloom here for all to read."
      />
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" data-testid="commons-grid">
      {items.map((item, i) => {
        const excerpt = stripHtml(item.content).slice(0, 200).trim();
        const isExpanded = expandedId === item.writingId;

        return (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: Math.min(i * 0.08, 0.4), duration: 0.6 }}
            viewport={{ once: true }}
            className={`bg-white/[0.02] border border-white/[0.06] rounded-xl backdrop-blur-sm p-6 cursor-pointer transition-all duration-500 hover:bg-white/[0.04] hover:border-white/[0.1] group ${
              isExpanded ? "md:col-span-2 lg:col-span-3" : ""
            }`}
            onClick={() => onExpand(isExpanded ? null : item.writingId)}
            data-testid={`card-commons-${item.writingId}`}
          >
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-3">
                <h3 className="text-lg font-display font-light italic text-white/80 group-hover:text-white transition-colors leading-normal" data-testid={`text-title-${item.writingId}`}>
                  {item.title}
                </h3>
                <motion.div
                  animate={{ rotate: isExpanded ? 180 : 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <ChevronDown size={16} className="text-white/20 group-hover:text-white/40 transition-colors flex-shrink-0 mt-1" />
                </motion.div>
              </div>

              <div className="flex items-center gap-3 flex-wrap">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 font-mono text-[9px] uppercase tracking-widest text-emerald-400/70" data-testid={`tag-genre-${item.writingId}`}>
                  <Tag size={9} />
                  {item.genre}
                </span>
                {item.authorName && (
                  <span className="font-serif text-xs italic text-white/40 flex items-center gap-1.5" data-testid={`text-author-${item.writingId}`}>
                    <Users size={10} />
                    {item.authorName}
                  </span>
                )}
              </div>

              {!isExpanded && (
                <p className="font-serif text-sm leading-relaxed text-white/30 line-clamp-3">
                  {excerpt}{excerpt.length >= 200 ? "…" : ""}
                </p>
              )}

              {item.sharedAt && (
                <div className="flex items-center gap-1.5 text-white/20 font-mono text-[9px] uppercase tracking-widest" data-testid={`text-date-${item.writingId}`}>
                  <Calendar size={9} />
                  {new Date(item.sharedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                </div>
              )}

              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.4 }}
                    className="overflow-hidden"
                  >
                    <div className="pt-4 border-t border-white/[0.06]">
                      <div
                        className="font-serif text-sm leading-[1.9] text-white/60 prose prose-invert prose-sm max-w-none"
                        dangerouslySetInnerHTML={{ __html: item.content }}
                        data-testid={`text-content-${item.writingId}`}
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}

function BouquetsTab({
  bouquets,
  isLoading,
  selectedId,
  onSelect,
  detail,
  detailLoading,
}: {
  bouquets: Bouquet[];
  isLoading: boolean;
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  detail?: BouquetDetail;
  detailLoading: boolean;
}) {
  if (isLoading) return <LoadingSkeleton count={4} />;

  if (selectedId && detail) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-3xl mx-auto"
      >
        <button
          onClick={() => onSelect(null)}
          className="flex items-center gap-2 text-white/40 hover:text-white/70 transition-colors font-mono text-xs uppercase tracking-widest group mb-8"
          data-testid="button-back-bouquets"
        >
          <ChevronRight size={14} className="rotate-180 group-hover:-translate-x-1 transition-transform" />
          All Bouquets
        </button>

        <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl backdrop-blur-sm p-8 space-y-6" data-testid={`bouquet-detail-${selectedId}`}>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <Flower size={20} className="text-amber-400/50" />
              {detail.theme && (
                <span className="px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 font-mono text-[9px] uppercase tracking-widest text-amber-400/70" data-testid={`badge-theme-${selectedId}`}>
                  {detail.theme}
                </span>
              )}
            </div>
            <h2 className="text-3xl md:text-4xl font-display font-light italic text-white/90" data-testid={`text-bouquet-title-${selectedId}`}>
              {detail.title}
            </h2>
            {detail.description && (
              <p className="font-serif text-sm italic text-white/45 leading-relaxed max-w-2xl">
                {detail.description}
              </p>
            )}
            <div className="flex items-center gap-4 text-white/30 font-mono text-[9px] uppercase tracking-widest">
              {detail.curatorName && (
                <span className="flex items-center gap-1.5">
                  <Users size={10} />
                  Curated by {detail.curatorName}
                </span>
              )}
              <span className="flex items-center gap-1.5">
                <Layers size={10} />
                {detail.items.length} {detail.items.length === 1 ? "piece" : "pieces"}
              </span>
            </div>
          </div>

          <div className="border-t border-white/[0.06] pt-6 space-y-4">
            {detail.items.map((item, i) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1, duration: 0.4 }}
                className="flex items-start gap-4 p-4 rounded-lg hover:bg-white/[0.03] transition-colors group"
                data-testid={`bouquet-item-${item.id}`}
              >
                <span className="font-mono text-[10px] text-white/15 mt-1 w-6 text-right flex-shrink-0">{i + 1}.</span>
                <div className="space-y-1 min-w-0 flex-1">
                  <h4 className="font-display text-lg italic text-white/70 group-hover:text-white/90 transition-colors" data-testid={`text-item-title-${item.id}`}>
                    {item.writingTitle}
                  </h4>
                  {item.authorName && (
                    <span className="font-serif text-xs italic text-white/35">
                      by {item.authorName}
                    </span>
                  )}
                  {item.note && (
                    <p className="font-serif text-xs italic text-amber-400/40 mt-1">
                      "{item.note}"
                    </p>
                  )}
                </div>
                <Eye size={14} className="text-white/10 group-hover:text-white/30 transition-colors mt-1.5 flex-shrink-0" />
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>
    );
  }

  if (selectedId && detailLoading) {
    return <LoadingSkeleton count={1} />;
  }

  if (bouquets.length === 0) {
    return (
      <EmptyState
        icon={<Flower size={36} className="text-amber-400/30" />}
        title="No Bouquets Arranged Yet"
        description="Reading bouquets are curated collections of writing, gathered like wildflowers into themed arrangements. The first bouquet is waiting to be composed."
      />
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6" data-testid="bouquets-grid">
      {bouquets.map((bouquet, i) => (
        <motion.div
          key={bouquet.id}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: Math.min(i * 0.1, 0.4), duration: 0.6 }}
          viewport={{ once: true }}
          onClick={() => onSelect(bouquet.id)}
          className="bg-white/[0.02] border border-white/[0.06] rounded-xl backdrop-blur-sm p-6 cursor-pointer transition-all duration-500 hover:bg-white/[0.04] hover:border-amber-500/20 group"
          data-testid={`card-bouquet-${bouquet.id}`}
        >
          <div className="space-y-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <Flower size={18} className="text-amber-400/40 group-hover:text-amber-400/70 transition-colors" />
                {bouquet.theme && (
                  <span className="px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 font-mono text-[9px] uppercase tracking-widest text-amber-400/60" data-testid={`badge-theme-${bouquet.id}`}>
                    {bouquet.theme}
                  </span>
                )}
              </div>
              <ChevronRight size={16} className="text-white/15 group-hover:text-amber-400/50 group-hover:translate-x-1 transition-all flex-shrink-0 mt-0.5" />
            </div>

            <h3 className="text-xl font-display font-light italic text-white/75 group-hover:text-white transition-colors" data-testid={`text-bouquet-title-${bouquet.id}`}>
              {bouquet.title}
            </h3>

            {bouquet.description && (
              <p className="font-serif text-sm italic text-white/30 leading-relaxed line-clamp-2">
                {bouquet.description}
              </p>
            )}

            <div className="flex items-center gap-4 text-white/25 font-mono text-[9px] uppercase tracking-widest pt-1">
              {bouquet.curatorName && (
                <span className="flex items-center gap-1.5" data-testid={`text-curator-${bouquet.id}`}>
                  <Users size={10} />
                  {bouquet.curatorName}
                </span>
              )}
              <span className="flex items-center gap-1.5" data-testid={`text-count-${bouquet.id}`}>
                <Layers size={10} />
                {bouquet.itemCount} {bouquet.itemCount === 1 ? "piece" : "pieces"}
              </span>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

function MoodboardsTab({
  moodboards,
  isLoading,
  selectedId,
  onSelect,
  detail,
  detailLoading,
}: {
  moodboards: SharedMoodboard[];
  isLoading: boolean;
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  detail?: MoodboardDetail;
  detailLoading: boolean;
}) {
  if (isLoading) return <LoadingSkeleton count={4} />;

  if (selectedId && detail) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-4xl mx-auto"
      >
        <button
          onClick={() => onSelect(null)}
          className="flex items-center gap-2 text-white/40 hover:text-white/70 transition-colors font-mono text-xs uppercase tracking-widest group mb-8"
          data-testid="button-back-moodboards"
        >
          <ChevronRight size={14} className="rotate-180 group-hover:-translate-x-1 transition-transform" />
          All Moodboards
        </button>

        <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl backdrop-blur-sm p-8 space-y-6" data-testid={`moodboard-detail-${selectedId}`}>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <Palette size={20} className="text-emerald-400/50" />
            </div>
            <h2 className="text-3xl md:text-4xl font-display font-light italic text-white/90" data-testid={`text-moodboard-title-${selectedId}`}>
              {detail.title}
            </h2>
            {detail.description && (
              <p className="font-serif text-sm italic text-white/45 leading-relaxed max-w-2xl">
                {detail.description}
              </p>
            )}
            {detail.userName && (
              <span className="flex items-center gap-1.5 text-white/30 font-mono text-[9px] uppercase tracking-widest">
                <Users size={10} />
                {detail.userName}
              </span>
            )}
          </div>

          <div className="border-t border-white/[0.06] pt-6">
            {detail.items.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {detail.items.map((item, i) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.08, duration: 0.4 }}
                    className="rounded-lg border border-white/[0.06] p-4 transition-colors hover:bg-white/[0.03]"
                    style={{ backgroundColor: item.color ? `${item.color}10` : undefined }}
                    data-testid={`moodboard-item-${item.id}`}
                  >
                    {item.imageUrl && (
                      <img
                        src={item.imageUrl}
                        alt=""
                        className="w-full h-32 object-cover rounded-md mb-3 opacity-80"
                      />
                    )}
                    <p className="font-serif text-sm text-white/50 leading-relaxed">
                      {item.content}
                    </p>
                    <span className="block mt-2 font-mono text-[8px] uppercase tracking-widest text-white/15">
                      {item.itemType}
                    </span>
                  </motion.div>
                ))}
              </div>
            ) : (
              <p className="text-center font-serif text-sm italic text-white/30 py-8">
                This moodboard is empty — a blank canvas waiting for inspiration.
              </p>
            )}
          </div>
        </div>
      </motion.div>
    );
  }

  if (selectedId && detailLoading) {
    return <LoadingSkeleton count={1} />;
  }

  if (moodboards.length === 0) {
    return (
      <EmptyState
        icon={<Palette size={36} className="text-emerald-400/30" />}
        title="No Moodboards Shared Yet"
        description="Moodboards are visual and textual collages — fragments of inspiration gathered from private gardens. When writers share theirs, they'll appear here like pressed flowers in a notebook."
      />
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" data-testid="moodboards-grid">
      {moodboards.map((board, i) => (
        <motion.div
          key={board.id}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: Math.min(i * 0.1, 0.4), duration: 0.6 }}
          viewport={{ once: true }}
          onClick={() => onSelect(board.id)}
          className="bg-white/[0.02] border border-white/[0.06] rounded-xl backdrop-blur-sm p-6 cursor-pointer transition-all duration-500 hover:bg-white/[0.04] hover:border-emerald-500/20 group"
          data-testid={`card-moodboard-${board.id}`}
        >
          <div className="space-y-3">
            <div className="flex items-start justify-between gap-3">
              <Palette size={18} className="text-emerald-400/40 group-hover:text-emerald-400/70 transition-colors" />
              <ChevronRight size={16} className="text-white/15 group-hover:text-emerald-400/50 group-hover:translate-x-1 transition-all flex-shrink-0" />
            </div>

            <h3 className="text-xl font-display font-light italic text-white/75 group-hover:text-white transition-colors" data-testid={`text-moodboard-title-${board.id}`}>
              {board.title}
            </h3>

            {board.description && (
              <p className="font-serif text-sm italic text-white/30 leading-relaxed line-clamp-2">
                {board.description}
              </p>
            )}

            <div className="flex items-center gap-4 text-white/25 font-mono text-[9px] uppercase tracking-widest pt-1">
              {board.userName && (
                <span className="flex items-center gap-1.5" data-testid={`text-moodboard-author-${board.id}`}>
                  <Users size={10} />
                  {board.userName}
                </span>
              )}
              {board.createdAt && (
                <span className="flex items-center gap-1.5" data-testid={`text-moodboard-date-${board.id}`}>
                  <Calendar size={9} />
                  {new Date(board.createdAt).toLocaleDateString("en-US", { month: "short", year: "numeric" })}
                </span>
              )}
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

function EmptyState({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      className="text-center py-24 space-y-6 max-w-lg mx-auto"
      data-testid="empty-state"
    >
      <div className="mx-auto w-16 h-16 rounded-full bg-white/[0.03] border border-white/[0.06] flex items-center justify-center">
        {icon}
      </div>
      <h3 className="text-2xl md:text-3xl font-display font-light italic text-white/70" data-testid="text-empty-title">
        {title}
      </h3>
      <p className="font-serif text-sm italic text-white/35 leading-relaxed" data-testid="text-empty-description">
        {description}
      </p>
    </motion.div>
  );
}

function LoadingSkeleton({ count }: { count: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="bg-white/[0.02] border border-white/[0.04] rounded-xl p-6 animate-pulse space-y-3">
          <div className="h-5 w-3/4 bg-white/[0.04] rounded" />
          <div className="h-3 w-1/2 bg-white/[0.03] rounded" />
          <div className="h-3 w-full bg-white/[0.03] rounded" />
          <div className="h-3 w-2/3 bg-white/[0.03] rounded" />
        </div>
      ))}
    </div>
  );
}
