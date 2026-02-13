import { useState, useRef, useEffect, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus, Trash2, ChevronLeft, Feather, PenLine,
  Search, ChevronDown, BookOpen, Lock,
  Globe, Users, MapPin, Home, LogOut,
  Sprout, Sparkles, Flower2, Droplets, Zap, Leaf,
  Flame, Archive, NotebookPen, CloudSun, Brain,
  CalendarRange, Network, Mic, Moon, Bell,
  FileCheck, Heart, Bookmark, Compass, MessageCircle,
  Pin, PinOff, ArchiveRestore, Tag, X
} from "lucide-react";
import StarBackground from "@/components/StarBackground";
import type { Writing } from "@shared/schema";
import PlantingFlow, { VisibilityBadge } from "@/components/garden/PlantingFlow";
import { NotificationBell } from "@/components/garden/NotificationPanel";
import NotificationPanel from "@/components/garden/NotificationPanel";
import { ResonanceBar, MarginaliaSection, TendButton } from "@/components/garden/SocialFeatures";
import { TablesRoom, WorkshopRoom, SwapRoom } from "@/components/garden/CommunityRooms";
import RichEditor, { ContentRenderer, stripHtml, wordCountFromContent } from "@/components/garden/RichEditor";
import ExportMenu from "@/components/garden/ExportMenu";

type Zone = "desk" | "reading-room" | "greenhouse";
type ActiveRoom = "tables" | "workshop" | "swap" | null;
type GreenhouseTool = "freewrite" | "growth-journal" | "inner-weather" | "rituals" | "compost" | "reflections" | "circles" | null;

const stageColors: Record<string, string> = {
  raw_seed: "border-amber-500/30 text-amber-400/80",
  growing: "border-emerald-500/30 text-emerald-400/80",
  ready_to_show: "border-pink-500/30 text-pink-400/80",
};

const stageAccent: Record<string, string> = {
  raw_seed: "bg-amber-500/10",
  growing: "bg-emerald-500/10",
  ready_to_show: "bg-pink-500/10",
};

const stageGlow: Record<string, string> = {
  raw_seed: "rgba(245, 158, 11, 0.15)",
  growing: "rgba(16, 185, 129, 0.15)",
  ready_to_show: "rgba(236, 72, 153, 0.15)",
};

const genreOptions = ["poetry", "fiction", "essay", "fragment", "other"];

function SeedIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
      <path d="M12 22 Q12 20 12 14" />
      <path d="M12 15 Q8 9 9 5 Q10 2 12 3 Q14 2 15 5 Q16 9 12 15Z" />
    </svg>
  );
}

function SproutIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
      <path d="M12 22 Q12 20 12 12" />
      <path d="M12 16 Q7 11 6 9 Q5 7 7 6 Q9 5 11 9 L12 12Z" />
      <path d="M12 12 Q17 7 18 5 Q19 3 21 4 Q23 6 19 8 L12 12Z" />
    </svg>
  );
}

function BloomIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
      <path d="M12 22 Q12 20 12 14" />
      <path d="M12 12 Q8 6 5 5 Q3 4.5 4 7 Q5 9 10 12Z" />
      <path d="M12 12 Q16 6 19 5 Q21 4.5 20 7 Q19 9 14 12Z" />
      <path d="M12 12 Q12 4 11 2 Q10 0 12 0 Q14 0 13 2 Q12 4 12 12Z" />
      <circle cx="12" cy="12" r="2" fill="currentColor" />
    </svg>
  );
}

const stageIcons: Record<string, React.ReactNode> = {
  raw_seed: <SeedIcon className="w-4 h-4" />,
  growing: <SproutIcon className="w-4 h-4" />,
  ready_to_show: <BloomIcon className="w-4 h-4" />,
};

function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse bg-white/[0.06] rounded-lg ${className}`} />;
}

function DeskSkeleton() {
  return (
    <div className="space-y-4 animate-in fade-in duration-300">
      {[1, 2, 3].map(i => (
        <div key={i} className="border border-white/[0.06] rounded-xl p-5 space-y-3">
          <div className="flex items-center justify-between">
            <Skeleton className="h-5 w-48" />
            <Skeleton className="h-4 w-16 rounded-full" />
          </div>
          <div className="space-y-1.5">
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-3/4" />
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-4 w-14 rounded-full" />
            <Skeleton className="h-4 w-10 rounded-full" />
          </div>
        </div>
      ))}
    </div>
  );
}

function ReadingRoomSkeleton() {
  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {[1, 2].map(i => (
        <div key={i} className="border border-white/[0.06] rounded-xl p-6 space-y-4">
          <div className="flex items-center gap-3">
            <Skeleton className="h-8 w-8 rounded-full" />
            <div className="space-y-1">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-3 w-16" />
            </div>
          </div>
          <Skeleton className="h-6 w-56" />
          <div className="space-y-1.5">
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-2/3" />
          </div>
        </div>
      ))}
    </div>
  );
}

function CommunityRoomSkeleton() {
  return (
    <div className="space-y-3 animate-in fade-in duration-300">
      {[1, 2, 3, 4].map(i => (
        <div key={i} className="border border-white/[0.06] rounded-xl p-4 space-y-2">
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-3 w-full" />
          <div className="flex gap-3">
            <Skeleton className="h-3 w-12" />
            <Skeleton className="h-3 w-16" />
          </div>
        </div>
      ))}
    </div>
  );
}

function wordCount(text: string) {
  const plain = text.includes("<") ? stripHtml(text) : text;
  return plain.trim() ? plain.trim().split(/\s+/).length : 0;
}

function timeAgo(date: string | Date | null | undefined) {
  if (!date) return "";
  const d = new Date(date);
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `${days}d ago`;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

const rooms = [
  { id: "tables", label: "Tables", icon: <Users size={13} />, desc: "Community discussions", comingSoon: false },
  { id: "workshop", label: "Workshop", icon: <BookOpen size={13} />, desc: "Writing exercises", comingSoon: false },
  { id: "the-desk", label: "The Desk", icon: <PenLine size={13} />, desc: "Coming soon", comingSoon: true },
  { id: "swap", label: "Swap", icon: <MessageCircle size={13} />, desc: "Beta reading exchange", comingSoon: false },
  { id: "retreats", label: "Retreats", icon: <Compass size={13} />, desc: "Coming soon", comingSoon: true },
  { id: "press", label: "The Press", icon: <FileCheck size={13} />, desc: "Coming soon", comingSoon: true },
];

function ZoneNav({ active, onChange }: { active: Zone; onChange: (z: Zone) => void }) {
  const zones: { id: Zone; label: string; desc: string }[] = [
    { id: "desk", label: "Your Desk", desc: "Your private writing space — drafts, fragments, and works in progress" },
    { id: "reading-room", label: "Reading Room", desc: "Read what others are growing — a quiet place to discover and respond" },
    { id: "greenhouse", label: "Greenhouse", desc: "Private tools for tending your creative practice" },
  ];

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="inline-flex gap-1 p-1 rounded-2xl border border-white/[0.20] bg-white/[0.05] backdrop-blur-xl">
        {zones.map((z) => (
          <button
            key={z.id}
            onClick={() => onChange(z.id)}
            className={`relative px-5 py-2.5 rounded-xl font-mono text-[10px] uppercase tracking-[0.2em] transition-all ${
              active === z.id ? "text-white/90" : "text-white/50 hover:text-white/55"
            }`}
            data-testid={`zone-tab-${z.id}`}
          >
            {active === z.id && (
              <motion.div
                layoutId="activeZone"
                className="absolute inset-0 rounded-xl bg-white/[0.08] border border-white/[0.1]"
                transition={{ type: "spring", stiffness: 500, damping: 35 }}
              />
            )}
            <span className="relative z-10">{z.label}</span>
          </button>
        ))}
      </div>
      <AnimatePresence mode="wait">
        <motion.p
          key={active}
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 4 }}
          transition={{ duration: 0.15 }}
          className="font-serif text-[12px] text-white/55 text-center"
        >
          {zones.find(z => z.id === active)?.desc}
        </motion.p>
      </AnimatePresence>
    </div>
  );
}

function RoomsStrip({ activeRoom, onSelectRoom }: { activeRoom: ActiveRoom; onSelectRoom: (room: ActiveRoom) => void }) {
  return (
    <div className="flex items-center gap-1 overflow-x-auto scrollbar-hide">
      {rooms.map((room) => {
        const isActive = activeRoom === room.id;
        return room.comingSoon ? (
          <div
            key={room.id}
            onClick={() => {
              const el = document.getElementById(`coming-soon-toast-${room.id}`);
              if (el) { el.classList.remove('opacity-0'); el.classList.add('opacity-100'); setTimeout(() => { el.classList.remove('opacity-100'); el.classList.add('opacity-0'); }, 2000); }
            }}
            className="relative flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-white/[0.08] text-white/20 font-mono text-[9px] uppercase tracking-widest whitespace-nowrap select-none cursor-pointer hover:text-white/30 transition-all"
            title={room.desc}
            data-testid={`room-${room.id}`}
          >
            {room.icon}
            {room.label}
            <span className="text-[7px] text-white/15 ml-0.5">soon</span>
            <div id={`coming-soon-toast-${room.id}`} className="absolute -bottom-8 left-1/2 -translate-x-1/2 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full font-mono text-[8px] text-white/60 whitespace-nowrap opacity-0 transition-opacity duration-300 pointer-events-none">
              Coming soon — we're building this
            </div>
          </div>
        ) : (
          <button
            key={room.id}
            onClick={() => onSelectRoom(isActive ? null : room.id as ActiveRoom)}
            title={room.desc}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border font-mono text-[9px] uppercase tracking-widest whitespace-nowrap transition-all ${
              isActive
                ? "border-white/20 bg-white/[0.08] text-white/80"
                : "border-white/[0.20] text-white/60 hover:text-white/60 hover:border-white/12"
            }`}
            data-testid={`room-${room.id}`}
          >
            {room.icon}
            {room.label}
          </button>
        );
      })}
    </div>
  );
}

type StageFilter = "all" | "raw_seed" | "growing" | "ready_to_show";

function DeskZone({ writings, onOpenWriting, onCreateNew, onOpenPlanting, onQuickUpdate, isCreating }: {
  writings: Writing[];
  onOpenWriting: (w: Writing) => void;
  onCreateNew: () => void;
  onOpenPlanting: (w: Writing) => void;
  onQuickUpdate: (id: string, data: Record<string, any>) => void;
  isCreating: boolean;
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<StageFilter>("all");
  const [expandedCard, setExpandedCard] = useState<string | null>(null);
  const [showArchived, setShowArchived] = useState(false);
  const [activeTag, setActiveTag] = useState<string | null>(null);

  const readinessKey = (w: Writing) => w.readiness || "raw_seed";

  const allTags = Array.from(new Set(writings.flatMap(w => (w as any).tags || [])));

  const activeWritings = writings.filter(w => !(w as any).isArchived);
  const archivedWritings = writings.filter(w => (w as any).isArchived);
  const baseWritings = showArchived ? archivedWritings : activeWritings;

  const filteredWritings = baseWritings
    .filter(w => activeFilter === "all" || readinessKey(w) === activeFilter)
    .filter(w => !activeTag || ((w as any).tags || []).includes(activeTag))
    .filter(w => {
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      const plainContent = w.content.includes("<") ? stripHtml(w.content) : w.content;
      return w.title.toLowerCase().includes(q) || plainContent.toLowerCase().includes(q) || ((w as any).tags || []).some((t: string) => t.toLowerCase().includes(q));
    })
    .sort((a, b) => {
      const pinA = (a as any).isPinned ? 1 : 0;
      const pinB = (b as any).isPinned ? 1 : 0;
      if (pinB !== pinA) return pinB - pinA;
      return new Date(b.updatedAt || 0).getTime() - new Date(a.updatedAt || 0).getTime();
    });

  const seedCount = activeWritings.filter(w => readinessKey(w) === "raw_seed").length;
  const growingCount = activeWritings.filter(w => readinessKey(w) === "growing").length;
  const readyCount = activeWritings.filter(w => readinessKey(w) === "ready_to_show").length;

  const filters: { id: StageFilter; label: string; count: number }[] = [
    { id: "all", label: "All", count: activeWritings.length },
    { id: "raw_seed", label: "Seeds", count: seedCount },
    { id: "growing", label: "Growing", count: growingCount },
    { id: "ready_to_show", label: "Ready", count: readyCount },
  ];

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-end justify-between gap-4 mb-8">
        <div>
          <p className="text-sm font-serif text-white/60">
            {writings.length} {writings.length === 1 ? "piece" : "pieces"} · {writings.reduce((a, w) => a + wordCount(w.content), 0).toLocaleString()} words
          </p>
        </div>
        <motion.button
          onClick={onCreateNew}
          disabled={isCreating}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.97 }}
          className="flex items-center gap-2 px-5 py-2.5 border border-white/20 hover:border-amber-500/30 rounded-full font-mono text-[10px] uppercase tracking-widest text-white/70 hover:text-white bg-white/[0.03] hover:bg-white/[0.06] transition-all group"
          data-testid="button-new-piece"
        >
          <Plus size={14} className="group-hover:rotate-90 transition-transform duration-300" />
          New Piece
        </motion.button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-grow">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/50" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search your pieces..."
            className="w-full pl-10 pr-4 py-2.5 bg-white/[0.05] border border-white/[0.20] rounded-xl text-sm font-serif text-white/75 placeholder:text-white/45 focus:outline-none focus:border-white/40 transition-colors"
            data-testid="input-search"
          />
        </div>
        <div className="flex gap-0.5 p-0.5 bg-white/[0.05] rounded-xl border border-white/[0.05]">
          {filters.map((f) => (
            <button
              key={f.id}
              onClick={() => setActiveFilter(f.id)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg font-mono text-[9px] uppercase tracking-widest transition-all ${
                activeFilter === f.id ? "bg-white/[0.08] text-white/80" : "text-white/60 hover:text-white/60"
              }`}
              data-testid={`filter-${f.id}`}
            >
              {f.label}
              <span className={`text-[8px] ${activeFilter === f.id ? "text-white/60" : "text-white/45"}`}>{f.count}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-2 mb-6 flex-wrap">
        {allTags.length > 0 && (
          <>
            {allTags.map((tag) => (
              <button
                key={tag}
                onClick={() => setActiveTag(activeTag === tag ? null : tag)}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-full font-mono text-[8px] uppercase tracking-widest border transition-all ${
                  activeTag === tag
                    ? "border-violet-500/30 bg-violet-500/10 text-violet-300/80"
                    : "border-white/[0.08] text-white/40 hover:text-white/60 hover:border-white/15"
                }`}
                data-testid={`tag-filter-${tag}`}
              >
                <Tag size={9} />
                {tag}
              </button>
            ))}
            {activeTag && (
              <button onClick={() => setActiveTag(null)} className="text-white/30 hover:text-white/60 transition-colors" data-testid="clear-tag-filter">
                <X size={12} />
              </button>
            )}
            <span className="w-px h-4 bg-white/[0.06]" />
          </>
        )}
        {archivedWritings.length > 0 && (
          <button
            onClick={() => { setShowArchived(!showArchived); setActiveFilter("all"); }}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full font-mono text-[8px] uppercase tracking-widest border transition-all ${
              showArchived
                ? "border-stone-400/25 bg-stone-500/10 text-stone-300/70"
                : "border-white/[0.08] text-white/35 hover:text-white/55"
            }`}
            data-testid="toggle-archived"
          >
            <Archive size={9} />
            Archived ({archivedWritings.length})
          </button>
        )}
      </div>

      {writings.length === 0 && (
        <div className="border border-dashed border-white/[0.15] rounded-2xl p-16 text-center space-y-6">
          <div className="flex items-center justify-center gap-6">
            <SeedIcon className="w-8 h-8 text-amber-400/15" />
            <SproutIcon className="w-10 h-10 text-emerald-400/15" />
            <BloomIcon className="w-8 h-8 text-pink-400/15" />
          </div>
          <div className="space-y-2">
            <h3 className="text-2xl font-display font-light italic text-white/70">Your garden awaits its first seed</h3>
            <p className="font-serif text-sm text-white/60 max-w-md mx-auto leading-relaxed">
              A line, a fragment, a whole draft — whatever wants to come out.
            </p>
          </div>
          <motion.button
            onClick={onCreateNew}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.97 }}
            className="inline-flex items-center gap-2 px-6 py-3 bg-white/[0.05] hover:bg-white/[0.08] border border-white/20 hover:border-amber-500/30 rounded-full font-mono text-[10px] uppercase tracking-widest text-white/70 hover:text-white transition-all"
            data-testid="button-plant-seed"
          >
            <Sparkles size={13} />
            Plant Your First Seed
          </motion.button>
        </div>
      )}

      {filteredWritings.length === 0 && writings.length > 0 && (
        <p className="text-center py-12 font-serif text-white/60 text-sm">No pieces match your search.</p>
      )}

      <div className="space-y-2">
        {filteredWritings.map((w, i) => {
          const isExpanded = expandedCard === w.id;
          const readiness = readinessKey(w);
          const vis = w.visibility || "personal";
          return (
            <motion.div
              key={w.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03, duration: 0.3 }}
              data-testid={`card-piece-${w.id}`}
            >
              <div
                className={`relative rounded-xl border overflow-hidden transition-all duration-300 ${
                  isExpanded
                    ? `${stageColors[readiness]?.split(" ")[0] || "border-white/25"} bg-white/[0.025]`
                    : "border-white/[0.15] hover:border-white/[0.15] bg-white/[0.04]"
                }`}
              >
                {isExpanded && (
                  <div className="absolute inset-0 pointer-events-none" style={{
                    background: `linear-gradient(135deg, ${stageGlow[readiness] || "transparent"} 0%, transparent 50%)`,
                  }} />
                )}

                <button
                  onClick={() => setExpandedCard(isExpanded ? null : w.id)}
                  className="w-full text-left p-4 md:p-5 relative z-10"
                  data-testid={`button-expand-${w.id}`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`flex-shrink-0 w-7 h-7 rounded-full border flex items-center justify-center ${stageColors[readiness] || "border-white/20 text-white/50"} ${stageAccent[readiness] || ""}`}>
                      {stageIcons[readiness] || stageIcons.raw_seed}
                    </div>
                    <div className="flex-grow min-w-0">
                      <div className="flex items-center gap-2">
                        {(w as any).isPinned && <Pin size={10} className="text-amber-400/50 flex-shrink-0" />}
                        <h3 className="text-base font-display font-light truncate text-white/80 italic">
                          {w.title || "Untitled"}
                        </h3>
                        {vis !== "personal" && (
                          <span className={`text-[9px] ${vis === "circle" ? "text-violet-400/40" : "text-emerald-400/40"}`}>
                            {vis === "circle" ? <Users size={10} /> : <Globe size={10} />}
                          </span>
                        )}
                      </div>
                      {((w as any).tags || []).length > 0 && (
                        <div className="flex gap-1 mt-0.5">
                          {((w as any).tags as string[]).map((tag: string) => (
                            <span key={tag} className="font-mono text-[7px] uppercase tracking-widest text-violet-400/40 bg-violet-500/[0.06] px-1.5 py-0.5 rounded-full">{tag}</span>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0 text-white/50">
                      <span className="font-mono text-[9px] uppercase tracking-widest hidden sm:inline">{w.genre}</span>
                      <span className="font-mono text-[9px]">{timeAgo(w.updatedAt)}</span>
                      <ChevronDown size={13} className={`transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`} />
                    </div>
                  </div>
                  {!isExpanded && w.content && (
                    <ContentRenderer content={w.content} maxLength={120} className="text-sm font-serif text-white/55 line-clamp-1 mt-1 ml-10" />
                  )}
                </button>

                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25 }}
                      className="overflow-hidden"
                    >
                      <div className="px-4 md:px-5 pb-4 md:pb-5 ml-10 space-y-3 relative z-10">
                        {w.content && (
                          <ContentRenderer content={w.content} maxLength={400} className="text-sm font-serif text-white/55 leading-relaxed line-clamp-4" />
                        )}
                        <div className="flex items-center gap-3 text-white/50">
                          <span className="font-mono text-[9px] tracking-widest">{wordCount(w.content)} words</span>
                          <VisibilityBadge visibility={vis} readiness={readiness} editorialAvailable={w.editorialAvailable} compact />
                        </div>
                        <div className="flex gap-2 pt-1">
                          <button
                            onClick={(e) => { e.stopPropagation(); onOpenWriting(w); }}
                            className="flex items-center gap-1.5 px-3.5 py-2 bg-white/[0.05] hover:bg-white/[0.09] border border-white/20 hover:border-white/20 rounded-lg font-mono text-[9px] uppercase tracking-widest text-white/70 hover:text-white transition-all"
                            data-testid={`button-edit-${w.id}`}
                          >
                            <PenLine size={11} />
                            Open
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); onOpenPlanting(w); }}
                            className="flex items-center gap-1.5 px-3.5 py-2 border border-white/[0.20] hover:border-white/25 rounded-lg font-mono text-[9px] uppercase tracking-widest text-white/50 hover:text-white/75 transition-all"
                            data-testid={`button-plant-${w.id}`}
                          >
                            <MapPin size={11} />
                            Plant
                          </button>
                          <div onClick={(e) => e.stopPropagation()}>
                            <ExportMenu title={w.title} content={w.content} />
                          </div>
                          <button
                            onClick={(e) => { e.stopPropagation(); onQuickUpdate(w.id, { isPinned: !(w as any).isPinned }); }}
                            className="flex items-center gap-1.5 px-3.5 py-2 border border-white/[0.15] hover:border-amber-500/20 rounded-lg font-mono text-[9px] uppercase tracking-widest text-white/50 hover:text-amber-400/70 transition-all"
                            data-testid={`button-pin-${w.id}`}
                          >
                            {(w as any).isPinned ? <PinOff size={11} /> : <Pin size={11} />}
                            {(w as any).isPinned ? "Unpin" : "Pin"}
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); onQuickUpdate(w.id, { isArchived: !(w as any).isArchived }); }}
                            className="flex items-center gap-1.5 px-3.5 py-2 border border-white/[0.15] hover:border-stone-400/20 rounded-lg font-mono text-[9px] uppercase tracking-widest text-white/50 hover:text-stone-400/70 transition-all"
                            data-testid={`button-archive-${w.id}`}
                          >
                            {(w as any).isArchived ? <ArchiveRestore size={11} /> : <Archive size={11} />}
                            {(w as any).isArchived ? "Restore" : "Archive"}
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

function WriteEditor({ writing, onBack, onSave, onDelete, onOpenPlanting }: {
  writing: Writing;
  onBack: () => void;
  onSave: (data: { title: string; content: string; genre: string; readiness?: string; tags?: string[] }) => void;
  onDelete: () => void;
  onOpenPlanting: () => void;
}) {
  const [editTitle, setEditTitle] = useState(writing.title);
  const [editContent, setEditContent] = useState(writing.content);
  const [editGenre, setEditGenre] = useState(writing.genre);
  const [editStage, setEditStage] = useState(writing.readiness || "raw_seed");
  const [editTags, setEditTags] = useState<string[]>((writing as any).tags || []);
  const [tagInput, setTagInput] = useState("");
  const [saveStatus, setSaveStatus] = useState<"saved" | "saving" | "idle">("saved");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const hasMounted = useRef(false);

  const doSave = useCallback(() => {
    onSave({ title: editTitle, content: editContent, genre: editGenre, readiness: editStage, tags: editTags });
  }, [editTitle, editContent, editGenre, editStage, editTags, onSave]);

  useEffect(() => {
    if (!hasMounted.current) { hasMounted.current = true; return; }
    setSaveStatus("idle");
    const timer = setTimeout(() => {
      setSaveStatus("saving");
      doSave();
      setTimeout(() => setSaveStatus("saved"), 600);
    }, 800);
    return () => clearTimeout(timer);
  }, [editTitle, editContent, editGenre, editStage, editTags]);

  function addTag() {
    const t = tagInput.trim().toLowerCase().replace(/[^a-z0-9-]/g, "");
    if (t && !editTags.includes(t) && editTags.length < 5) {
      setEditTags([...editTags, t]);
      setTagInput("");
    }
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <button
          onClick={() => { doSave(); onBack(); }}
          className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-white/50 hover:text-white/80 transition-colors group"
          data-testid="button-back"
        >
          <ChevronLeft size={15} className="group-hover:-translate-x-1 transition-transform" />
          Back
        </button>
        <div className="flex items-center gap-3">
          <span className={`font-mono text-[9px] tracking-widest transition-all duration-300 ${
            saveStatus === "saving" ? "text-amber-400/70" : saveStatus === "saved" ? "text-emerald-400/70" : "text-white/40"
          }`}>
            {saveStatus === "saving" ? "Saving..." : saveStatus === "saved" ? "Saved" : "Editing..."}
          </span>
          <span className="font-mono text-[9px] tracking-widest text-white/50">{wordCount(editContent)} words</span>
          <ExportMenu title={editTitle} content={editContent} compact />
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="p-1.5 text-white/50 hover:text-red-400/70 transition-colors"
            data-testid="button-delete"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      <AnimatePresence>
        {showDeleteConfirm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-6 overflow-hidden"
          >
            <div className="border border-red-500/20 bg-red-500/5 rounded-lg p-4 flex items-center justify-between">
              <p className="font-serif text-sm text-red-300/70">Delete this writing permanently?</p>
              <div className="flex gap-2">
                <button onClick={() => setShowDeleteConfirm(false)} className="px-4 py-1.5 font-mono text-[9px] uppercase tracking-widest text-white/60 hover:text-white" data-testid="button-cancel-delete">Cancel</button>
                <button onClick={onDelete} className="px-4 py-1.5 font-mono text-[9px] uppercase tracking-widest bg-red-500/20 text-red-300 rounded-full hover:bg-red-500/30" data-testid="button-confirm-delete">Delete</button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="space-y-6">
        <input
          type="text"
          value={editTitle}
          onChange={(e) => setEditTitle(e.target.value)}
          placeholder="Title..."
          className="w-full bg-transparent text-3xl md:text-4xl font-display font-light tracking-tight text-white/90 placeholder:text-white/25 focus:outline-none border-none italic"
          data-testid="input-title"
        />

        <div className="flex items-center gap-3 pb-5 border-b border-white/[0.15] flex-wrap">
          <div className="flex gap-0.5">
            {([
              { id: "raw_seed", label: "Seed" },
              { id: "growing", label: "Growing" },
              { id: "ready_to_show", label: "Ready" },
            ] as const).map((s) => (
              <button
                key={s.id}
                onClick={() => setEditStage(s.id)}
                className={`flex items-center gap-1 px-2.5 py-1.5 rounded-full font-mono text-[9px] uppercase tracking-widest transition-all border ${
                  editStage === s.id
                    ? `${stageColors[s.id]} ${stageAccent[s.id]}`
                    : "border-transparent text-white/55 hover:text-white/60"
                }`}
                data-testid={`button-stage-${s.id}`}
              >
                {stageIcons[s.id]}
                {s.label}
              </button>
            ))}
          </div>
          <span className="w-px h-4 bg-white/[0.04]" />
          <select
            value={editGenre}
            onChange={(e) => setEditGenre(e.target.value)}
            className="bg-transparent text-white/50 font-mono text-[9px] uppercase tracking-widest border border-white/[0.15] rounded-full px-3 py-1.5 focus:outline-none hover:border-white/25 transition-colors cursor-pointer"
            data-testid="select-genre"
          >
            {genreOptions.map((g) => (
              <option key={g} value={g} className="bg-[#0b101a]">{g}</option>
            ))}
          </select>
          <span className="w-px h-4 bg-white/[0.04]" />
          <button
            onClick={onOpenPlanting}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full font-mono text-[9px] uppercase tracking-widest border border-white/[0.15] text-white/60 hover:text-white/70 hover:border-white/25 transition-all"
            data-testid="button-open-planting"
          >
            <MapPin size={11} />
            {(writing.visibility || "personal") === "personal" ? "Private" : (writing.visibility || "personal") === "circle" ? "Circle" : "Gallery"}
          </button>
        </div>

        <div className="flex items-center gap-2 pb-4 flex-wrap">
          {editTags.map((tag) => (
            <span key={tag} className="flex items-center gap-1 px-2.5 py-1 rounded-full font-mono text-[8px] uppercase tracking-widest border border-violet-500/20 bg-violet-500/[0.06] text-violet-300/70">
              {tag}
              <button onClick={() => setEditTags(editTags.filter(t => t !== tag))} className="hover:text-violet-200 transition-colors" data-testid={`remove-tag-${tag}`}>
                <X size={9} />
              </button>
            </span>
          ))}
          {editTags.length < 5 && (
            <div className="flex items-center gap-1">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addTag(); } }}
                placeholder={editTags.length === 0 ? "Add tags..." : "Add..."}
                className="w-24 bg-transparent font-mono text-[9px] uppercase tracking-widest text-white/50 placeholder:text-white/25 focus:outline-none border-b border-transparent focus:border-white/20 transition-colors py-1"
                data-testid="input-tag"
              />
              {tagInput.trim() && (
                <button onClick={addTag} className="text-white/30 hover:text-white/60 transition-colors">
                  <Plus size={11} />
                </button>
              )}
            </div>
          )}
        </div>

        <RichEditor
          content={editContent}
          onChange={setEditContent}
          placeholder="Begin writing..."
          autoFocus
        />
      </div>
    </div>
  );
}

type FeedWriting = Writing & { authorName: string | null };

function ReadingRoomZone({ onViewProfile }: { onViewProfile?: (userId: string) => void }) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const perPage = 8;

  const { data: tendingFeed = [], isLoading: loadingTending } = useQuery<FeedWriting[]>({
    queryKey: ["/api/tending-feed"],
    queryFn: async () => {
      const res = await fetch("/api/tending-feed", { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch");
      return res.json();
    },
  });

  const { data: gardenFeed = [], isLoading: loadingGarden } = useQuery<FeedWriting[]>({
    queryKey: ["/api/garden-feed"],
    queryFn: async () => {
      const res = await fetch("/api/garden-feed", { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch");
      return res.json();
    },
  });

  if (loadingTending || loadingGarden) return <ReadingRoomSkeleton />;

  const seen = new Set<string>();
  const allPieces: FeedWriting[] = [];
  for (const piece of tendingFeed) {
    if (!seen.has(piece.id)) { seen.add(piece.id); allPieces.push(piece); }
  }
  for (const piece of gardenFeed) {
    if (!seen.has(piece.id)) { seen.add(piece.id); allPieces.push(piece); }
  }

  allPieces.sort((a, b) => new Date(b.updatedAt || 0).getTime() - new Date(a.updatedAt || 0).getTime());

  const visiblePieces = allPieces.slice(0, page * perPage);
  const hasMore = allPieces.length > visiblePieces.length;

  return (
    <div className="max-w-2xl mx-auto">
      {allPieces.length === 0 && (
        <div className="border border-dashed border-white/[0.20] rounded-2xl p-16 text-center space-y-4">
          <Feather size={32} className="mx-auto text-white/30" />
          <h3 className="text-xl font-display font-light italic text-white/60">No letters yet</h3>
          <p className="font-serif text-sm text-white/55 max-w-sm mx-auto leading-relaxed">
            When writers share their work to the garden, or you tend someone's garden, their pieces will appear here like letters slid under your door.
          </p>
        </div>
      )}

      <div className="space-y-6">
        {visiblePieces.map((piece, i) => {
          const isExpanded = expandedId === piece.id;
          return (
            <motion.article
              key={piece.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: i * 0.04, duration: 0.4 }}
              className="group"
              data-testid={`letter-${piece.id}`}
            >
              <div className={`rounded-xl border transition-all duration-300 ${
                isExpanded ? "border-white/[0.1] bg-white/[0.05]" : "border-transparent hover:border-white/[0.20]"
              }`}>
                <button
                  onClick={() => setExpandedId(isExpanded ? null : piece.id)}
                  className="w-full text-left p-5 md:p-6"
                  data-testid={`button-open-letter-${piece.id}`}
                >
                  <div className="flex items-center gap-2 mb-3">
                    <button
                      onClick={(e) => { e.stopPropagation(); onViewProfile?.(piece.authorId); }}
                      className="flex items-center gap-2 text-white/50 hover:text-white/75 transition-colors"
                      data-testid={`link-author-${piece.id}`}
                    >
                      <div className="w-5 h-5 rounded-full bg-white/[0.06] border border-white/[0.15] flex items-center justify-center text-white/50 font-mono text-[8px] uppercase">
                        {piece.authorName?.[0] || "?"}
                      </div>
                      <span className="font-serif text-xs">{piece.authorName || "Anonymous"}</span>
                    </button>
                    <span className="font-mono text-[8px] text-white/30">{timeAgo(piece.updatedAt)}</span>
                  </div>

                  <h3 className="text-lg md:text-xl font-display font-light text-white/80 italic mb-2 leading-snug">
                    {piece.title || "Untitled"}
                  </h3>

                  {isExpanded ? (
                    <ContentRenderer content={piece.content} maxLength={2000} className="font-serif text-white/55 leading-[1.9]" />
                  ) : (
                    <ContentRenderer content={piece.content} maxLength={250} className="font-serif text-white/55 leading-[1.9] line-clamp-3" />
                  )}

                  {!isExpanded && (
                    <div className="flex items-center gap-3 mt-3">
                      <span className="font-mono text-[8px] uppercase tracking-widest text-white/45">{piece.genre}</span>
                      <ResonanceBar writingId={piece.id} compact />
                    </div>
                  )}
                </button>

                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25 }}
                      className="overflow-hidden"
                    >
                      <div className="px-5 md:px-6 pb-5 md:pb-6 space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <span className="font-mono text-[8px] uppercase tracking-widest text-white/45">{piece.genre}</span>
                            <span className="font-mono text-[8px] text-white/30">{wordCount(piece.content)} words</span>
                          </div>
                          <TendButton gardenerId={piece.authorId} size="sm" />
                        </div>
                        <ResonanceBar writingId={piece.id} />
                        <MarginaliaSection writingId={piece.id} authorId={piece.authorId} />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {!isExpanded && <div className="border-b border-white/[0.03] mx-6 mt-2" />}
            </motion.article>
          );
        })}
      </div>

      {hasMore && (
        <div className="text-center mt-10">
          <button
            onClick={() => setPage(p => p + 1)}
            className="inline-flex items-center gap-2 px-6 py-3 border border-white/[0.20] hover:border-white/25 rounded-full font-mono text-[9px] uppercase tracking-widest text-white/60 hover:text-white/70 transition-all"
            data-testid="button-more-letters"
          >
            <Feather size={12} />
            More letters
          </button>
        </div>
      )}
    </div>
  );
}

const greenhouseTools = [
  { id: "freewrite" as const, label: "Freewrite", desc: "A typewriter for your thoughts — just you, the keys, and the sound of writing. No saving, no editing. Pure flow.", icon: <PenLine size={20} />, color: "warmGray" },
  { id: "growth-journal" as const, label: "Growth Journal", desc: "A private space to reflect on your writing journey — celebrate progress, note struggles, track what you're learning", icon: <NotebookPen size={20} />, color: "emerald" },
  { id: "inner-weather" as const, label: "Inner Weather", desc: "Check in with your creative mood and energy before you write — track patterns over time", icon: <CloudSun size={20} />, color: "sky" },
  { id: "rituals" as const, label: "Rituals", desc: "Set a timer and write — timed sessions to build a consistent creative practice", icon: <Flame size={20} />, color: "amber" },
  { id: "compost" as const, label: "Compost", desc: "Save fragments, abandoned drafts, and stray lines here — nothing is wasted, everything can be recycled", icon: <Archive size={20} />, color: "violet" },
  { id: "reflections" as const, label: "Reflections", desc: "Structured prompts to think about your craft — what you're reading, what you're trying, what's working", icon: <Brain size={20} />, color: "pink" },
  { id: "circles" as const, label: "Circles", desc: "Create or join small writing groups for ongoing conversation and mutual support", icon: <Users size={20} />, color: "indigo" },
];

const toolColorMap: Record<string, { border: string; text: string; bg: string; glow: string }> = {
  emerald: { border: "border-emerald-500/15", text: "text-emerald-400/60", bg: "hover:bg-emerald-500/[0.04]", glow: "rgba(16,185,129,0.08)" },
  sky: { border: "border-sky-500/15", text: "text-sky-400/60", bg: "hover:bg-sky-500/[0.04]", glow: "rgba(14,165,233,0.08)" },
  amber: { border: "border-amber-500/15", text: "text-amber-400/60", bg: "hover:bg-amber-500/[0.04]", glow: "rgba(245,158,11,0.08)" },
  violet: { border: "border-violet-500/15", text: "text-violet-400/60", bg: "hover:bg-violet-500/[0.04]", glow: "rgba(139,92,246,0.08)" },
  pink: { border: "border-pink-500/15", text: "text-pink-400/60", bg: "hover:bg-pink-500/[0.04]", glow: "rgba(236,72,153,0.08)" },
  indigo: { border: "border-indigo-500/15", text: "text-indigo-400/60", bg: "hover:bg-indigo-500/[0.04]", glow: "rgba(99,102,241,0.08)" },
  warmGray: { border: "border-stone-400/20", text: "text-stone-300/70", bg: "hover:bg-stone-500/[0.06]", glow: "rgba(168,162,158,0.1)" },
};

function GreenhouseZone() {
  const [activeTool, setActiveTool] = useState<GreenhouseTool>(null);

  if (activeTool) {
    return <GreenhouseToolView tool={activeTool} onBack={() => setActiveTool(null)} />;
  }

  return (
    <div className="max-w-3xl mx-auto">
      <p className="font-serif text-sm text-white/60 mb-8">
        Your private creative toolkit — a quiet space just for you. No one else can see what's here. Use these tools to tend your practice, track your energy, and nurture your creative life.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {greenhouseTools.map((tool, i) => {
          const colors = toolColorMap[tool.color];
          return (
            <motion.button
              key={tool.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05, duration: 0.3 }}
              onClick={() => setActiveTool(tool.id)}
              className={`relative text-left p-5 rounded-xl border ${colors.border} bg-white/[0.04] ${colors.bg} transition-all duration-300 group overflow-hidden`}
              data-testid={`tool-${tool.id}`}
            >
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" style={{
                background: `radial-gradient(ellipse at 30% 20%, ${colors.glow} 0%, transparent 70%)`,
              }} />
              <div className="relative z-10">
                <div className={`${colors.text} mb-3 group-hover:scale-110 transition-transform origin-left`}>
                  {tool.icon}
                </div>
                <h3 className="font-display text-base font-light italic text-white/65 group-hover:text-white/85 transition-colors mb-1">
                  {tool.label}
                </h3>
                <p className="font-serif text-xs text-white/55 leading-relaxed">{tool.desc}</p>
              </div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}

function GreenhouseToolView({ tool, onBack }: { tool: NonNullable<GreenhouseTool>; onBack: () => void }) {
  const toolInfo = greenhouseTools.find(t => t.id === tool)!;

  const toolContent: Record<string, React.ReactNode> = {
    "freewrite": <FreewriteView />,
    "growth-journal": <GrowthJournalView />,
    "inner-weather": <InnerWeatherView />,
    "rituals": <RitualsView />,
    "compost": <CompostView />,
    "reflections": <ReflectionsView />,
    "circles": <CirclesView />,
  };

  return (
    <div className="max-w-3xl mx-auto">
      <button
        onClick={onBack}
        className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-white/60 hover:text-white/75 transition-colors group mb-6"
        data-testid="button-back-greenhouse"
      >
        <ChevronLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
        Greenhouse
      </button>
      <div className="flex items-center gap-3 mb-6">
        <div className={`${toolColorMap[toolInfo.color].text}`}>{toolInfo.icon}</div>
        <h2 className="text-2xl font-display font-light italic text-white/80">{toolInfo.label}</h2>
      </div>
      <p className="font-serif text-sm text-white/55 leading-relaxed mt-1 max-w-lg">{toolInfo.desc}</p>
      {toolContent[tool]}
    </div>
  );
}

function useTypewriterSound() {
  const audioCtxRef = useRef<AudioContext | null>(null);
  const noiseBufferRef = useRef<AudioBuffer | null>(null);

  const getCtx = useCallback(() => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new AudioContext();
      const sr = audioCtxRef.current.sampleRate;
      const len = sr * 0.5;
      const buf = audioCtxRef.current.createBuffer(1, len, sr);
      const data = buf.getChannelData(0);
      for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;
      noiseBufferRef.current = buf;
    }
    return audioCtxRef.current;
  }, []);

  const noise = useCallback((ctx: AudioContext) => {
    const src = ctx.createBufferSource();
    src.buffer = noiseBufferRef.current;
    return src;
  }, []);

  const playKey = useCallback(() => {
    try {
      const ctx = getCtx();
      const t = ctx.currentTime;
      const p = 0.85 + Math.random() * 0.3;

      const tick = noise(ctx);
      const tickHp = ctx.createBiquadFilter();
      tickHp.type = "highpass";
      tickHp.frequency.value = 1800 + Math.random() * 800;
      tickHp.Q.value = 0.4;
      const tickLp = ctx.createBiquadFilter();
      tickLp.type = "lowpass";
      tickLp.frequency.value = 6000;
      const tickG = ctx.createGain();
      tickG.gain.setValueAtTime(0, t);
      tickG.gain.linearRampToValueAtTime(0.09 * p, t + 0.001);
      tickG.gain.exponentialRampToValueAtTime(0.01 * p, t + 0.008);
      tickG.gain.exponentialRampToValueAtTime(0.001, t + 0.04);
      tick.connect(tickHp).connect(tickLp).connect(tickG).connect(ctx.destination);
      tick.start(t);
      tick.stop(t + 0.05);

      const body = noise(ctx);
      const bodyLp = ctx.createBiquadFilter();
      bodyLp.type = "lowpass";
      bodyLp.frequency.value = 350 + Math.random() * 150;
      bodyLp.Q.value = 2.5;
      const bodyG = ctx.createGain();
      bodyG.gain.setValueAtTime(0, t);
      bodyG.gain.linearRampToValueAtTime(0.22 * p, t + 0.002);
      bodyG.gain.exponentialRampToValueAtTime(0.06 * p, t + 0.025);
      bodyG.gain.exponentialRampToValueAtTime(0.001, t + 0.12);
      body.connect(bodyLp).connect(bodyG).connect(ctx.destination);
      body.start(t + 0.001);
      body.stop(t + 0.14);

      const res = ctx.createOscillator();
      res.type = "sine";
      res.frequency.value = 180 + Math.random() * 60;
      const resG = ctx.createGain();
      resG.gain.setValueAtTime(0, t);
      resG.gain.linearRampToValueAtTime(0.035 * p, t + 0.003);
      resG.gain.exponentialRampToValueAtTime(0.001, t + 0.08);
      res.connect(resG).connect(ctx.destination);
      res.start(t + 0.002);
      res.stop(t + 0.1);

      const tail = noise(ctx);
      const tailBp = ctx.createBiquadFilter();
      tailBp.type = "bandpass";
      tailBp.frequency.value = 1200 + Math.random() * 600;
      tailBp.Q.value = 0.3;
      const tailG = ctx.createGain();
      tailG.gain.setValueAtTime(0, t + 0.005);
      tailG.gain.linearRampToValueAtTime(0.025 * p, t + 0.01);
      tailG.gain.exponentialRampToValueAtTime(0.001, t + 0.1);
      tail.connect(tailBp).connect(tailG).connect(ctx.destination);
      tail.start(t + 0.004);
      tail.stop(t + 0.12);
    } catch {}
  }, [getCtx, noise]);

  const playSpace = useCallback(() => {
    try {
      const ctx = getCtx();
      const t = ctx.currentTime;

      const tick = noise(ctx);
      const tickBp = ctx.createBiquadFilter();
      tickBp.type = "bandpass";
      tickBp.frequency.value = 1400;
      tickBp.Q.value = 0.5;
      const tickG = ctx.createGain();
      tickG.gain.setValueAtTime(0, t);
      tickG.gain.linearRampToValueAtTime(0.1, t + 0.001);
      tickG.gain.exponentialRampToValueAtTime(0.001, t + 0.03);
      tick.connect(tickBp).connect(tickG).connect(ctx.destination);
      tick.start(t);
      tick.stop(t + 0.04);

      const thock = noise(ctx);
      const thockLp = ctx.createBiquadFilter();
      thockLp.type = "lowpass";
      thockLp.frequency.value = 250;
      thockLp.Q.value = 3.5;
      const thockG = ctx.createGain();
      thockG.gain.setValueAtTime(0, t);
      thockG.gain.linearRampToValueAtTime(0.3, t + 0.002);
      thockG.gain.exponentialRampToValueAtTime(0.08, t + 0.04);
      thockG.gain.exponentialRampToValueAtTime(0.001, t + 0.18);
      thock.connect(thockLp).connect(thockG).connect(ctx.destination);
      thock.start(t + 0.001);
      thock.stop(t + 0.2);

      const sub = ctx.createOscillator();
      sub.type = "sine";
      sub.frequency.value = 100;
      const subG = ctx.createGain();
      subG.gain.setValueAtTime(0, t);
      subG.gain.linearRampToValueAtTime(0.06, t + 0.004);
      subG.gain.exponentialRampToValueAtTime(0.001, t + 0.15);
      sub.connect(subG).connect(ctx.destination);
      sub.start(t + 0.002);
      sub.stop(t + 0.17);
    } catch {}
  }, [getCtx, noise]);

  const playReturn = useCallback(() => {
    try {
      const ctx = getCtx();
      const t = ctx.currentTime;

      const clack = noise(ctx);
      const clackBp = ctx.createBiquadFilter();
      clackBp.type = "bandpass";
      clackBp.frequency.value = 2000;
      clackBp.Q.value = 0.6;
      const clackG = ctx.createGain();
      clackG.gain.setValueAtTime(0, t);
      clackG.gain.linearRampToValueAtTime(0.12, t + 0.001);
      clackG.gain.exponentialRampToValueAtTime(0.001, t + 0.04);
      clack.connect(clackBp).connect(clackG).connect(ctx.destination);
      clack.start(t);
      clack.stop(t + 0.05);

      const whoosh = noise(ctx);
      const whooshBp = ctx.createBiquadFilter();
      whooshBp.type = "bandpass";
      whooshBp.frequency.setValueAtTime(800, t + 0.02);
      whooshBp.frequency.exponentialRampToValueAtTime(300, t + 0.25);
      whooshBp.Q.value = 0.3;
      const whooshG = ctx.createGain();
      whooshG.gain.setValueAtTime(0, t + 0.02);
      whooshG.gain.linearRampToValueAtTime(0.07, t + 0.05);
      whooshG.gain.exponentialRampToValueAtTime(0.001, t + 0.3);
      whoosh.connect(whooshBp).connect(whooshG).connect(ctx.destination);
      whoosh.start(t + 0.02);
      whoosh.stop(t + 0.35);

      const bell = ctx.createOscillator();
      bell.type = "sine";
      bell.frequency.value = 1800;
      const bellG = ctx.createGain();
      bellG.gain.setValueAtTime(0, t + 0.03);
      bellG.gain.linearRampToValueAtTime(0.04, t + 0.04);
      bellG.gain.exponentialRampToValueAtTime(0.001, t + 0.6);
      bell.connect(bellG).connect(ctx.destination);
      bell.start(t + 0.03);
      bell.stop(t + 0.65);

      const bell2 = ctx.createOscillator();
      bell2.type = "sine";
      bell2.frequency.value = 2700;
      const bell2G = ctx.createGain();
      bell2G.gain.setValueAtTime(0, t + 0.035);
      bell2G.gain.linearRampToValueAtTime(0.02, t + 0.045);
      bell2G.gain.exponentialRampToValueAtTime(0.001, t + 0.5);
      bell2.connect(bell2G).connect(ctx.destination);
      bell2.start(t + 0.035);
      bell2.stop(t + 0.55);

      const settle = noise(ctx);
      const settleLp = ctx.createBiquadFilter();
      settleLp.type = "lowpass";
      settleLp.frequency.value = 300;
      settleLp.Q.value = 2;
      const settleG = ctx.createGain();
      settleG.gain.setValueAtTime(0, t + 0.2);
      settleG.gain.linearRampToValueAtTime(0.12, t + 0.22);
      settleG.gain.exponentialRampToValueAtTime(0.001, t + 0.35);
      settle.connect(settleLp).connect(settleG).connect(ctx.destination);
      settle.start(t + 0.2);
      settle.stop(t + 0.4);
    } catch {}
  }, [getCtx, noise]);

  return { playKey, playSpace, playReturn };
}

function FreewriteView() {
  const [text, setText] = useState("");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [planted, setPlanted] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const queryClient = useQueryClient();
  const { playKey, playSpace, playReturn } = useTypewriterSound();

  const plantMutation = useMutation({
    mutationFn: async () => {
      const firstLine = text.trim().split("\n")[0].slice(0, 60);
      const title = firstLine || "Freewrite";
      const res = await fetch("/api/writings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ title, content: text, genre: "fragment", stage: "raw_seed", readiness: "raw_seed", visibility: "personal" }),
      });
      if (!res.ok) throw new Error("Failed to plant");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/writings"] });
      setPlanted(true);
    },
  });

  useEffect(() => {
    if (textareaRef.current) textareaRef.current.focus();
  }, [isFullscreen]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (!soundEnabled) return;
    if (e.key === "Enter") playReturn();
    else if (e.key === " ") playSpace();
    else if (e.key.length === 1) playKey();
  }, [soundEnabled, playKey, playSpace, playReturn]);

  const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;
  const charCount = text.length;

  const editorContent = (
    <div className={`relative ${isFullscreen ? "fixed inset-0 z-50 bg-[#1a1612]" : ""}`}>
      {isFullscreen && (
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-stone-600/30 to-transparent" />
      )}
      <div className={`flex items-center justify-between ${isFullscreen ? "px-8 pt-6 pb-2" : "mb-4"}`}>
        <div className="flex items-center gap-4">
          <span className="font-mono text-[9px] tracking-[0.3em] uppercase text-stone-500">
            {wordCount} words
          </span>
          <span className="text-stone-700">|</span>
          <span className="font-mono text-[9px] tracking-[0.3em] uppercase text-stone-500">
            {charCount} chars
          </span>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`font-mono text-[9px] tracking-widest uppercase px-3 py-1 rounded-full border transition-all ${
              soundEnabled
                ? "border-stone-500/30 text-stone-400 bg-stone-500/10"
                : "border-stone-700/30 text-stone-600"
            }`}
            data-testid="button-toggle-sound"
          >
            {soundEnabled ? "sound on" : "sound off"}
          </button>
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="font-mono text-[9px] tracking-widest uppercase px-3 py-1 rounded-full border border-stone-600/20 text-stone-500 hover:text-stone-300 hover:border-stone-500/30 transition-all"
            data-testid="button-toggle-fullscreen"
          >
            {isFullscreen ? "exit" : "focus mode"}
          </button>
        </div>
      </div>

      <div
        className={`relative ${
          isFullscreen
            ? "h-[calc(100vh-80px)] px-8"
            : "min-h-[400px]"
        }`}
        style={{
          background: isFullscreen
            ? "radial-gradient(ellipse at 50% 30%, rgba(168,162,158,0.04) 0%, transparent 70%)"
            : undefined,
        }}
      >
        <textarea
          ref={textareaRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Start typing. Don't think. Don't stop. Just let the words come..."
          className={`w-full h-full bg-transparent border-none outline-none resize-none leading-[2] tracking-wide ${
            isFullscreen
              ? "text-lg text-stone-300/90 placeholder:text-stone-600/50 max-w-2xl mx-auto pt-8"
              : "text-sm text-stone-300/80 placeholder:text-stone-600/40 p-4 border border-stone-600/15 rounded-xl bg-stone-900/20 min-h-[400px]"
          }`}
          style={{ fontFamily: "'Special Elite', 'Courier New', monospace" }}
          data-testid="textarea-freewrite"
          spellCheck={false}
        />

        {text.length === 0 && (
          <div className={`absolute pointer-events-none ${isFullscreen ? "bottom-16 left-1/2 -translate-x-1/2" : "bottom-6 left-1/2 -translate-x-1/2"}`}>
            <motion.div
              animate={{ opacity: [0.3, 0.6, 0.3] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="font-mono text-[8px] tracking-[0.4em] uppercase text-stone-600"
            >
              just begin
            </motion.div>
          </div>
        )}
      </div>

      {text.length > 0 && (
        <div className={`flex items-center justify-between ${isFullscreen ? "px-8 pb-4" : "mt-3"}`}>
          <button
            onClick={() => { if (confirm("Clear everything? This freewrite is meant to be ephemeral — the words served their purpose.")) { setText(""); setPlanted(false); } }}
            className="font-mono text-[9px] tracking-widest uppercase text-stone-600 hover:text-stone-400 transition-colors"
            data-testid="button-clear-freewrite"
          >
            clear page
          </button>
          {planted ? (
            <span className="font-mono text-[9px] tracking-widest uppercase text-emerald-400/70">
              Planted in your desk
            </span>
          ) : (
            <button
              onClick={() => plantMutation.mutate()}
              disabled={plantMutation.isPending || text.trim().length < 10}
              className="flex items-center gap-2 px-4 py-2 rounded-full border border-emerald-500/25 bg-emerald-500/[0.06] font-mono text-[9px] tracking-widest uppercase text-emerald-400/80 hover:text-emerald-300 hover:bg-emerald-500/[0.1] hover:border-emerald-500/40 disabled:opacity-30 transition-all"
              data-testid="button-plant-freewrite"
            >
              <Sprout size={13} />
              {plantMutation.isPending ? "Planting..." : "Plant this"}
            </button>
          )}
        </div>
      )}
    </div>
  );

  return editorContent;
}

function GrowthJournalView() {
  const { data: entries = [] } = useQuery<any[]>({
    queryKey: ["/api/growth-journal"],
    queryFn: async () => { const r = await fetch("/api/growth-journal", { credentials: "include" }); return r.ok ? r.json() : []; },
  });
  const queryClient = useQueryClient();
  const [content, setContent] = useState("");

  const addMutation = useMutation({
    mutationFn: async () => {
      const r = await fetch("/api/growth-journal", { method: "POST", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify({ content, mood: "reflective" }) });
      if (!r.ok) throw new Error("Failed"); return r.json();
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["/api/growth-journal"] }); setContent(""); },
  });

  return (
    <div className="space-y-4">
      <div>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="What's growing in your practice today..."
          className="w-full bg-white/[0.05] border border-white/[0.20] rounded-xl px-4 py-3 text-sm font-serif text-white/75 placeholder:text-white/45 focus:outline-none focus:border-white/40 resize-none h-28 transition-colors"
          data-testid="input-journal-entry"
        />
        <button onClick={() => addMutation.mutate()} disabled={!content.trim()} className="mt-2 px-4 py-2 bg-white/[0.05] hover:bg-white/[0.08] border border-white/20 rounded-lg font-mono text-[9px] uppercase tracking-widest text-white/60 hover:text-white disabled:opacity-30 transition-all" data-testid="button-add-journal">Add Entry</button>
      </div>
      {entries.map((e: any) => (
        <div key={e.id} className="border border-white/[0.15] rounded-xl p-4">
          <p className="font-serif text-sm text-white/60 leading-relaxed">{e.content}</p>
          <span className="font-mono text-[8px] text-white/45 mt-2 block">{timeAgo(e.createdAt)}</span>
        </div>
      ))}
      {entries.length === 0 && <p className="font-serif text-sm text-white/50 italic py-6 text-center">No entries yet. Start reflecting on your growth.</p>}
    </div>
  );
}

const moodEmoji: Record<string, string> = { stormy: "⛈", cloudy: "☁", misty: "🌫", clear: "☀", radiant: "✨" };
const moodColor: Record<string, string> = { stormy: "#6366f1", cloudy: "#94a3b8", misty: "#a78bfa", clear: "#fbbf24", radiant: "#f472b6" };

function InnerWeatherView() {
  const { data: entries = [] } = useQuery<any[]>({
    queryKey: ["/api/inner-weather"],
    queryFn: async () => { const r = await fetch("/api/inner-weather", { credentials: "include" }); return r.ok ? r.json() : []; },
  });
  const queryClient = useQueryClient();
  const [mood, setMood] = useState("clear");
  const [energy, setEnergy] = useState(5);
  const [note, setNote] = useState("");

  const moods = ["stormy", "cloudy", "misty", "clear", "radiant"];

  const addMutation = useMutation({
    mutationFn: async () => {
      const r = await fetch("/api/inner-weather", { method: "POST", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify({ mood, energy, note }) });
      if (!r.ok) throw new Error("Failed"); return r.json();
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["/api/inner-weather"] }); setNote(""); },
  });

  const recentWeek = entries.slice(0, 14);

  return (
    <div className="space-y-6">
      <div className="flex gap-1 mb-2">
        {moods.map(m => (
          <button key={m} onClick={() => setMood(m)} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full font-mono text-[9px] uppercase tracking-widest border transition-all ${mood === m ? "border-white/20 bg-white/[0.08] text-white/80" : "border-transparent text-white/55 hover:text-white/60"}`} data-testid={`mood-${m}`}>
            <span className="text-sm">{moodEmoji[m]}</span>
            {m}
          </button>
        ))}
      </div>
      <div className="flex items-center gap-3">
        <span className="font-mono text-[9px] text-white/55 uppercase tracking-widest">Energy</span>
        <input type="range" min="1" max="10" value={energy} onChange={(e) => setEnergy(Number(e.target.value))} className="flex-grow accent-white/40" />
        <span className="font-mono text-[10px] text-white/50">{energy}/10</span>
      </div>
      <input type="text" value={note} onChange={(e) => setNote(e.target.value)} placeholder="Brief note..." className="w-full bg-white/[0.05] border border-white/[0.20] rounded-xl px-4 py-3 text-sm font-serif text-white/75 placeholder:text-white/45 focus:outline-none focus:border-white/40 transition-colors" data-testid="input-weather-note" />
      <button onClick={() => addMutation.mutate()} className="px-4 py-2 bg-white/[0.05] hover:bg-white/[0.08] border border-white/20 rounded-lg font-mono text-[9px] uppercase tracking-widest text-white/60 hover:text-white transition-all" data-testid="button-log-weather">Log Weather</button>

      {recentWeek.length >= 2 && (
        <div className="border border-white/[0.08] rounded-xl p-4 space-y-2">
          <p className="font-mono text-[9px] uppercase tracking-widest text-white/40 mb-3">Mood & Energy — Recent</p>
          <div className="flex items-end gap-1 h-24">
            {[...recentWeek].reverse().map((e: any, i: number) => (
              <div key={e.id} className="flex-1 flex flex-col items-center gap-1 group" title={`${e.mood} · energy ${e.energy}/10${e.note ? ` · ${e.note}` : ""}`}>
                <div className="w-full rounded-t" style={{ height: `${(e.energy / 10) * 80}px`, backgroundColor: moodColor[e.mood] || "#666", opacity: 0.5 + (i / recentWeek.length) * 0.5, transition: "height 0.3s" }} />
                <span className="text-[10px] opacity-60 group-hover:opacity-100 transition-opacity">{moodEmoji[e.mood] || "·"}</span>
              </div>
            ))}
          </div>
          <div className="flex justify-between font-mono text-[7px] text-white/25 uppercase tracking-widest mt-1">
            <span>oldest</span>
            <span>today</span>
          </div>
        </div>
      )}

      {entries.map((e: any) => (
        <div key={e.id} className="border border-white/[0.08] rounded-xl p-3 flex items-center gap-3">
          <span className="text-sm">{moodEmoji[e.mood] || "·"}</span>
          <span className="font-mono text-[9px] uppercase text-white/50">{e.mood}</span>
          <span className="font-mono text-[9px] text-white/50">energy {e.energy}/10</span>
          {e.note && <span className="font-serif text-xs text-white/60 truncate">{e.note}</span>}
          <span className="ml-auto font-mono text-[8px] text-white/30 flex-shrink-0">{timeAgo(e.createdAt)}</span>
        </div>
      ))}
    </div>
  );
}

function calcStreak(sessions: any[]): { current: number; longest: number; thisWeek: number; totalMinutes: number } {
  if (sessions.length === 0) return { current: 0, longest: 0, thisWeek: 0, totalMinutes: 0 };
  const days = new Set<string>();
  let totalMinutes = 0;
  sessions.forEach((s: any) => {
    const d = new Date(s.createdAt).toDateString();
    days.add(d);
    totalMinutes += (s.duration || 0);
  });
  const sortedDays = Array.from(days).map(d => new Date(d)).sort((a, b) => b.getTime() - a.getTime());
  let current = 0;
  const today = new Date(); today.setHours(0, 0, 0, 0);
  for (let i = 0; i < sortedDays.length; i++) {
    const expected = new Date(today); expected.setDate(expected.getDate() - i);
    if (sortedDays[i].toDateString() === expected.toDateString()) current++;
    else break;
  }
  let longest = 0, run = 0;
  for (let i = 0; i < sortedDays.length; i++) {
    if (i === 0) { run = 1; } else {
      const diff = (sortedDays[i - 1].getTime() - sortedDays[i].getTime()) / 86400000;
      run = diff <= 1.5 ? run + 1 : 1;
    }
    if (run > longest) longest = run;
  }
  const weekAgo = new Date(); weekAgo.setDate(weekAgo.getDate() - 7);
  const thisWeek = sessions.filter((s: any) => new Date(s.createdAt) >= weekAgo).length;
  return { current, longest, thisWeek, totalMinutes };
}

function RitualsView() {
  const { data: sessions = [] } = useQuery<any[]>({
    queryKey: ["/api/rituals"],
    queryFn: async () => { const r = await fetch("/api/rituals", { credentials: "include" }); return r.ok ? r.json() : []; },
  });
  const queryClient = useQueryClient();
  const [duration, setDuration] = useState(15);
  const [isRunning, setIsRunning] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const streak = calcStreak(sessions);

  function startTimer() {
    setTimeLeft(duration * 60);
    setIsRunning(true);
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          setIsRunning(false);
          fetch("/api/rituals", { method: "POST", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify({ type: "timed_write", duration, wordsWritten: 0, notes: "" }) })
            .then(() => queryClient.invalidateQueries({ queryKey: ["/api/rituals"] }));
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }

  const mins = Math.floor(timeLeft / 60);
  const secs = timeLeft % 60;

  return (
    <div className="space-y-6">
      {sessions.length > 0 && (
        <div className="grid grid-cols-4 gap-2">
          <div className="border border-amber-500/10 bg-amber-500/[0.03] rounded-xl p-3 text-center">
            <p className="text-2xl font-display font-light text-amber-400/70">{streak.current}</p>
            <p className="font-mono text-[7px] uppercase tracking-widest text-white/35 mt-1">Day Streak</p>
          </div>
          <div className="border border-white/[0.06] rounded-xl p-3 text-center">
            <p className="text-2xl font-display font-light text-white/60">{streak.longest}</p>
            <p className="font-mono text-[7px] uppercase tracking-widest text-white/35 mt-1">Best Streak</p>
          </div>
          <div className="border border-white/[0.06] rounded-xl p-3 text-center">
            <p className="text-2xl font-display font-light text-white/60">{streak.thisWeek}</p>
            <p className="font-mono text-[7px] uppercase tracking-widest text-white/35 mt-1">This Week</p>
          </div>
          <div className="border border-white/[0.06] rounded-xl p-3 text-center">
            <p className="text-2xl font-display font-light text-white/60">{Math.round(streak.totalMinutes / 60)}h</p>
            <p className="font-mono text-[7px] uppercase tracking-widest text-white/35 mt-1">Total</p>
          </div>
        </div>
      )}

      <div className="text-center space-y-4">
        {!isRunning ? (
          <>
            <div className="flex items-center justify-center gap-3">
              {[5, 10, 15, 25, 45].map(d => (
                <button key={d} onClick={() => setDuration(d)} className={`px-3 py-1.5 rounded-full font-mono text-[9px] uppercase tracking-widest border transition-all ${duration === d ? "border-white/20 bg-white/[0.08] text-white/80" : "border-transparent text-white/55 hover:text-white/60"}`}>{d}m</button>
              ))}
            </div>
            <button onClick={startTimer} className="px-6 py-3 bg-white/[0.05] hover:bg-white/[0.08] border border-amber-500/20 hover:border-amber-500/40 rounded-full font-mono text-[10px] uppercase tracking-widest text-amber-400/70 hover:text-amber-300 transition-all" data-testid="button-start-ritual">
              {streak.current > 0 ? `Continue Streak (Day ${streak.current})` : "Begin Ritual"}
            </button>
          </>
        ) : (
          <div className="py-8">
            <p className="text-5xl font-display font-light text-white/80 tabular-nums">{mins}:{secs.toString().padStart(2, "0")}</p>
            <p className="font-serif text-sm text-white/55 mt-3">Write freely. The timer is tending to the time.</p>
          </div>
        )}
      </div>
      {sessions.length > 0 && (
        <div>
          <p className="font-mono text-[9px] uppercase tracking-widest text-white/50 mb-2">Past Sessions</p>
          {sessions.slice(0, 8).map((s: any) => (
            <div key={s.id} className="flex items-center gap-3 py-2 border-b border-white/[0.03]">
              <Flame size={10} className="text-amber-400/30" />
              <span className="font-mono text-[9px] text-white/60">{s.duration}min</span>
              <span className="font-mono text-[8px] text-white/30">{timeAgo(s.createdAt)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function CompostView() {
  const { data: entries = [] } = useQuery<any[]>({
    queryKey: ["/api/compost"],
    queryFn: async () => { const r = await fetch("/api/compost", { credentials: "include" }); return r.ok ? r.json() : []; },
  });
  const queryClient = useQueryClient();
  const [fragment, setFragment] = useState("");

  const addMutation = useMutation({
    mutationFn: async () => {
      const r = await fetch("/api/compost", { method: "POST", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify({ content: fragment, source: "manual" }) });
      if (!r.ok) throw new Error("Failed"); return r.json();
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["/api/compost"] }); setFragment(""); },
  });

  return (
    <div className="space-y-4">
      <div>
        <textarea value={fragment} onChange={(e) => setFragment(e.target.value)} placeholder="Toss a fragment, a cut line, an abandoned thought..." className="w-full bg-white/[0.05] border border-white/[0.20] rounded-xl px-4 py-3 text-sm font-serif text-white/75 placeholder:text-white/45 focus:outline-none focus:border-white/40 resize-none h-24 transition-colors" data-testid="input-compost" />
        <button onClick={() => addMutation.mutate()} disabled={!fragment.trim()} className="mt-2 px-4 py-2 bg-white/[0.05] hover:bg-white/[0.08] border border-white/20 rounded-lg font-mono text-[9px] uppercase tracking-widest text-white/60 hover:text-white disabled:opacity-30 transition-all" data-testid="button-add-compost">Add to Compost</button>
      </div>
      {entries.map((e: any) => (
        <div key={e.id} className={`border rounded-xl p-4 ${e.isRecycled ? "border-emerald-500/10 bg-emerald-500/[0.02]" : "border-white/[0.15]"}`}>
          <p className="font-serif text-sm text-white/55 leading-relaxed italic">{e.content}</p>
          <div className="flex items-center gap-2 mt-2">
            <span className="font-mono text-[8px] text-white/30">{timeAgo(e.createdAt)}</span>
            {e.isRecycled && <span className="font-mono text-[8px] text-emerald-400/40">recycled</span>}
          </div>
        </div>
      ))}
      {entries.length === 0 && <p className="font-serif text-sm text-white/50 italic py-6 text-center">Nothing composting yet. Toss in your fragments.</p>}
    </div>
  );
}

const reflectionPrompts = [
  "What surprised you about your writing this week?",
  "Describe a sentence you wrote that felt true. Why did it work?",
  "What are you avoiding in your writing? What would happen if you went there?",
  "Name a writer whose voice you envy. What specifically draws you to them?",
  "What's the difference between your writing voice and your speaking voice?",
  "What recurring images or themes keep appearing in your work?",
  "When do you feel most honest in your writing? What conditions enable that?",
  "What did you read recently that changed how you think about craft?",
  "Describe a piece you abandoned. What was it trying to do?",
  "What's a technique you've been wanting to try but haven't yet?",
  "When does revision feel like discovery vs. obligation?",
  "What does your writing need more of? Less of?",
  "Who is the ideal reader for what you're writing now?",
  "What are you learning about pacing, rhythm, or silence in your work?",
  "If your current project were a room, what would be in it?",
];

function ReflectionsView() {
  const { data: entries = [] } = useQuery<any[]>({
    queryKey: ["/api/reflections"],
    queryFn: async () => { const r = await fetch("/api/reflections", { credentials: "include" }); return r.ok ? r.json() : []; },
  });
  const queryClient = useQueryClient();
  const [content, setContent] = useState("");
  const [promptIndex, setPromptIndex] = useState(() => Math.floor(Math.random() * reflectionPrompts.length));

  const currentPrompt = reflectionPrompts[promptIndex];

  const addMutation = useMutation({
    mutationFn: async () => {
      const r = await fetch("/api/reflections", { method: "POST", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify({ title: currentPrompt, content, category: "craft" }) });
      if (!r.ok) throw new Error("Failed"); return r.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/reflections"] });
      setContent("");
      setPromptIndex((promptIndex + 1) % reflectionPrompts.length);
    },
  });

  return (
    <div className="space-y-5">
      <div className="border border-pink-500/10 bg-pink-500/[0.02] rounded-xl p-5 space-y-4">
        <div className="flex items-start justify-between gap-3">
          <p className="font-display text-lg font-light italic text-pink-200/60 leading-relaxed">{currentPrompt}</p>
          <button
            onClick={() => setPromptIndex((promptIndex + 1) % reflectionPrompts.length)}
            className="flex-shrink-0 p-1.5 text-white/30 hover:text-white/60 transition-colors"
            title="New prompt"
            data-testid="button-next-prompt"
          >
            <Sparkles size={14} />
          </button>
        </div>
        <textarea value={content} onChange={(e) => setContent(e.target.value)} placeholder="Reflect..." className="w-full bg-white/[0.03] border border-white/[0.10] rounded-xl px-4 py-3 text-sm font-serif text-white/75 placeholder:text-white/35 focus:outline-none focus:border-white/30 resize-none h-28 transition-colors" data-testid="input-reflection-content" />
        <button onClick={() => addMutation.mutate()} disabled={!content.trim()} className="px-4 py-2 bg-white/[0.05] hover:bg-white/[0.08] border border-white/20 rounded-lg font-mono text-[9px] uppercase tracking-widest text-white/60 hover:text-white disabled:opacity-30 transition-all" data-testid="button-add-reflection">Save Reflection</button>
      </div>
      {entries.map((e: any) => (
        <div key={e.id} className="border border-white/[0.08] rounded-xl p-4">
          {e.title && <h4 className="font-display text-sm font-light italic text-white/45 mb-2">{e.title}</h4>}
          <p className="font-serif text-sm text-white/55 leading-relaxed">{e.content}</p>
          <span className="font-mono text-[8px] text-white/30 mt-2 block">{timeAgo(e.createdAt)}</span>
        </div>
      ))}
      {entries.length === 0 && <p className="font-serif text-sm text-white/50 italic py-4 text-center">Your reflections will gather here over time.</p>}
    </div>
  );
}

function CirclesView() {
  const { data: circles = [] } = useQuery<any[]>({
    queryKey: ["/api/circles"],
    queryFn: async () => { const r = await fetch("/api/circles", { credentials: "include" }); return r.ok ? r.json() : []; },
  });

  return (
    <div className="space-y-4">
      {circles.map((c: any) => (
        <div key={c.id} className="border border-white/[0.20] rounded-xl p-4">
          <h4 className="font-display text-base font-light italic text-white/75">{c.name}</h4>
          {c.description && <p className="font-serif text-xs text-white/60 mt-1">{c.description}</p>}
          <div className="flex items-center gap-2 mt-2">
            <Users size={10} className="text-white/50" />
            <span className="font-mono text-[8px] text-white/50">{c.memberCount || 0} members</span>
          </div>
        </div>
      ))}
      {circles.length === 0 && <p className="font-serif text-sm text-white/50 italic py-6 text-center">No circles yet. Writing circles are intimate groups for sharing and discussion.</p>}
    </div>
  );
}


export default function Garden() {
  const { user, isLoading: authLoading, isAuthenticated } = useAuth();
  const queryClient = useQueryClient();
  const [activeZone, setActiveZone] = useState<Zone>("desk");
  const [activeWriting, setActiveWriting] = useState<Writing | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [plantingTarget, setPlantingTarget] = useState<Writing | null>(null);
  const [showPlantingFlow, setShowPlantingFlow] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [profileUserId, setProfileUserId] = useState<string | null>(null);
  const [activeRoom, setActiveRoom] = useState<ActiveRoom>(null);

  const { data: writings = [], isLoading } = useQuery<Writing[]>({
    queryKey: ["/api/writings"],
    queryFn: async () => {
      const res = await fetch("/api/writings", { credentials: "include" });
      if (!res.ok) throw new Error(`${res.status}: ${res.statusText}`);
      return res.json();
    },
    enabled: isAuthenticated,
  });

  const createMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/writings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ title: "Untitled", content: "", genre: "poetry", stage: "raw_seed", readiness: "raw_seed", visibility: "personal" }),
      });
      if (!res.ok) throw new Error("Failed to create");
      return res.json();
    },
    onSuccess: (data: Writing) => {
      queryClient.invalidateQueries({ queryKey: ["/api/writings"] });
      setActiveWriting(data);
      setIsEditing(true);
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, ...data }: { id: string; [key: string]: any }) => {
      const res = await fetch(`/api/writings/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to save");
      return res.json();
    },
    onSuccess: (data: Writing) => {
      queryClient.invalidateQueries({ queryKey: ["/api/writings"] });
      if (activeWriting && data.id === activeWriting.id) setActiveWriting(data);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/writings/${id}`, { method: "DELETE", credentials: "include" });
      if (!res.ok) throw new Error("Failed to delete");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/writings"] });
      setActiveWriting(null);
      setIsEditing(false);
    },
  });

  function openWriting(w: Writing) { setActiveWriting(w); setIsEditing(true); }
  function openPlanting(w: Writing) { setPlantingTarget(w); setShowPlantingFlow(true); }
  function handlePlantingSave(data: { visibility: string; readiness: string; editorialAvailable: boolean }) {
    if (plantingTarget) updateMutation.mutate({ id: plantingTarget.id, ...data });
  }

  if (!authLoading && !isAuthenticated) { window.location.href = "/api/login"; return null; }

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-background text-foreground relative">
        <StarBackground />
        <div className="relative z-10 flex items-center justify-center min-h-screen">
          <div className="text-center space-y-4">
            <div className="w-12 h-12 mx-auto border border-white/20 rounded-full flex items-center justify-center">
              <Feather size={20} className="text-white/50 animate-pulse" />
            </div>
            <p className="font-mono text-[10px] tracking-widest text-white/60 uppercase">Opening your garden...</p>
          </div>
        </div>
      </div>
    );
  }

  if (showNotifications) {
    return (
      <div className="min-h-screen bg-background text-foreground relative">
        <StarBackground />
        <div className="relative z-10 pt-20 pb-24 px-6 max-w-2xl mx-auto">
          <button
            onClick={() => setShowNotifications(false)}
            className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-white/60 hover:text-white/75 transition-colors group mb-6"
          >
            <ChevronLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
            Back
          </button>
          <NotificationPanel />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground relative">
      <StarBackground />

      <div className="relative z-10">
        <header className="sticky top-0 z-50 backdrop-blur-xl bg-background/60 border-b border-white/[0.15]">
          <div className="max-w-5xl mx-auto px-6 py-3">
            <div className="flex items-center justify-between gap-4">
              <a href="/" className="font-mono text-[9px] uppercase tracking-[0.3em] text-white/55 hover:text-white/60 transition-colors" data-testid="link-home">
                <Home size={15} />
              </a>

              {!isEditing && <ZoneNav active={activeZone} onChange={(z) => { setActiveZone(z); setProfileUserId(null); }} />}
              {isEditing && <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-white/55">Writing</span>}

              <div className="flex items-center gap-1">
                <NotificationBell onClick={() => setShowNotifications(true)} />
                <div className="relative">
                  <button
                    onClick={() => setShowProfileMenu(!showProfileMenu)}
                    className="w-7 h-7 rounded-full bg-white/[0.06] border border-white/[0.15] flex items-center justify-center text-white/50 font-mono text-[9px] uppercase hover:border-white/20 transition-colors"
                    data-testid="button-profile-menu"
                  >
                    {user?.firstName?.[0] || "?"}
                  </button>
                  <AnimatePresence>
                    {showProfileMenu && (
                      <motion.div
                        initial={{ opacity: 0, y: 5, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 5, scale: 0.95 }}
                        className="absolute right-0 top-full mt-2 w-64 rounded-xl border border-white/[0.15] bg-[#0b101a]/95 backdrop-blur-xl overflow-hidden shadow-xl"
                      >
                        <div className="p-4 border-b border-white/[0.15]">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-white/[0.08] border border-white/20 flex items-center justify-center text-white/70 font-display text-lg italic">
                              {user?.firstName?.[0] || "?"}
                            </div>
                            <div>
                              <p className="font-display text-sm text-white/85 italic">{user?.firstName} {user?.lastName}</p>
                              <p className="font-mono text-[8px] text-white/50 uppercase tracking-widest">Writer</p>
                            </div>
                          </div>
                        </div>
                        <div className="p-3 border-b border-white/[0.15] space-y-2">
                          <a
                            href={`/writer/${user?.id}`}
                            className="flex items-center gap-2 px-2 py-2 rounded-lg text-white/60 hover:text-white/80 hover:bg-white/[0.05] transition-all font-serif text-sm"
                            data-testid="nav-my-profile"
                          >
                            <Feather size={14} />
                            My Public Garden
                          </a>
                          <button
                            onClick={() => { setActiveZone("desk"); setShowProfileMenu(false); }}
                            className="w-full flex items-center gap-2 px-2 py-2 rounded-lg text-white/60 hover:text-white/80 hover:bg-white/[0.05] transition-all font-serif text-sm text-left"
                            data-testid="nav-my-desk"
                          >
                            <PenLine size={14} />
                            My Writings
                          </button>
                          <button
                            onClick={() => { setShowNotifications(true); setShowProfileMenu(false); }}
                            className="w-full flex items-center gap-2 px-2 py-2 rounded-lg text-white/60 hover:text-white/80 hover:bg-white/[0.05] transition-all font-serif text-sm text-left"
                            data-testid="nav-whispers"
                          >
                            <Bell size={14} />
                            Whispers
                          </button>
                        </div>
                        <div className="p-2">
                          <a href="/api/logout" className="flex items-center gap-2 px-2 py-2 rounded-lg text-white/50 hover:text-red-400/80 hover:bg-white/[0.03] transition-all font-serif text-sm" data-testid="nav-logout">
                            <LogOut size={13} />
                            Sign Out
                          </a>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>

            {!isEditing && (
              <div className="mt-2 -mb-1">
                <RoomsStrip activeRoom={activeRoom} onSelectRoom={(r) => { setActiveRoom(r); if (r) setActiveZone("desk"); }} />
              </div>
            )}
          </div>
        </header>

        <main className="pt-8 pb-24 px-6" onClick={() => showProfileMenu && setShowProfileMenu(false)}>
          <AnimatePresence mode="wait">
            <motion.div
              key={activeRoom ? `room-${activeRoom}` : (isEditing ? `editor-${activeWriting?.id}` : activeZone)}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              {activeRoom === "tables" ? (
                <TablesRoom onBack={() => setActiveRoom(null)} />
              ) : activeRoom === "workshop" ? (
                <WorkshopRoom onBack={() => setActiveRoom(null)} />
              ) : activeRoom === "swap" ? (
                <SwapRoom onBack={() => setActiveRoom(null)} />
              ) : isEditing && activeWriting ? (
                <WriteEditor
                  key={activeWriting.id}
                  writing={activeWriting}
                  onBack={() => { setIsEditing(false); setActiveWriting(null); }}
                  onSave={(data) => updateMutation.mutate({ id: activeWriting.id, ...data })}
                  onDelete={() => deleteMutation.mutate(activeWriting.id)}
                  onOpenPlanting={() => openPlanting(activeWriting)}
                />
              ) : activeZone === "desk" ? (
                <DeskZone
                  writings={writings}
                  onOpenWriting={openWriting}
                  onCreateNew={() => createMutation.mutate()}
                  onOpenPlanting={openPlanting}
                  onQuickUpdate={(id, data) => updateMutation.mutate({ id, ...data })}
                  isCreating={createMutation.isPending}
                />
              ) : activeZone === "reading-room" ? (
                <ReadingRoomZone onViewProfile={(id) => setProfileUserId(id)} />
              ) : (
                <GreenhouseZone />
              )}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      <PlantingFlow
        isOpen={showPlantingFlow}
        onClose={() => { setShowPlantingFlow(false); setPlantingTarget(null); }}
        currentVisibility={(plantingTarget?.visibility as any) || "personal"}
        currentReadiness={(plantingTarget?.readiness as any) || "raw_seed"}
        currentEditorialAvailable={plantingTarget?.editorialAvailable || false}
        onSave={handlePlantingSave}
        title={plantingTarget?.title}
      />
    </div>
  );
}
