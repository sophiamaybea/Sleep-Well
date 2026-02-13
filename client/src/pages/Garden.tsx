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
  FileCheck, Heart, Bookmark, Compass, MessageCircle
} from "lucide-react";
import StarBackground from "@/components/StarBackground";
import type { Writing } from "@shared/schema";
import PlantingFlow, { VisibilityBadge } from "@/components/garden/PlantingFlow";
import { NotificationBell } from "@/components/garden/NotificationPanel";
import NotificationPanel from "@/components/garden/NotificationPanel";
import { ResonanceBar, MarginaliaSection, TendButton } from "@/components/garden/SocialFeatures";
import { TablesRoom, WorkshopRoom, SwapRoom } from "@/components/garden/CommunityRooms";

type Zone = "desk" | "reading-room" | "greenhouse";
type ActiveRoom = "tables" | "workshop" | "swap" | null;
type GreenhouseTool = "growth-journal" | "inner-weather" | "rituals" | "compost" | "reflections" | "circles" | null;

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

function wordCount(text: string) {
  return text.trim() ? text.trim().split(/\s+/).length : 0;
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
  { id: "tables", label: "Tables", icon: <Users size={13} /> },
  { id: "workshop", label: "Workshop", icon: <BookOpen size={13} /> },
  { id: "the-desk", label: "The Desk", icon: <PenLine size={13} /> },
  { id: "swap", label: "Swap", icon: <MessageCircle size={13} /> },
  { id: "retreats", label: "Retreats", icon: <Compass size={13} /> },
  { id: "press", label: "The Press", icon: <FileCheck size={13} /> },
];

function ZoneNav({ active, onChange }: { active: Zone; onChange: (z: Zone) => void }) {
  const zones: { id: Zone; label: string }[] = [
    { id: "desk", label: "Your Desk" },
    { id: "reading-room", label: "Reading Room" },
    { id: "greenhouse", label: "Greenhouse" },
  ];

  return (
    <div className="inline-flex gap-1 p-1 rounded-2xl border border-white/[0.06] bg-white/[0.02] backdrop-blur-xl">
      {zones.map((z) => (
        <button
          key={z.id}
          onClick={() => onChange(z.id)}
          className={`relative px-5 py-2.5 rounded-xl font-mono text-[10px] uppercase tracking-[0.2em] transition-all ${
            active === z.id ? "text-white/90" : "text-white/30 hover:text-white/55"
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
  );
}

const activeRoomIds = ["tables", "workshop", "swap"];

function RoomsStrip({ activeRoom, onSelectRoom }: { activeRoom: ActiveRoom; onSelectRoom: (room: ActiveRoom) => void }) {
  return (
    <div className="flex items-center gap-1 overflow-x-auto scrollbar-hide">
      {rooms.map((room) => {
        const isActive = activeRoom === room.id;
        const isClickable = activeRoomIds.includes(room.id);
        return isClickable ? (
          <button
            key={room.id}
            onClick={() => onSelectRoom(isActive ? null : room.id as ActiveRoom)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border font-mono text-[9px] uppercase tracking-widest whitespace-nowrap transition-all ${
              isActive
                ? "border-white/20 bg-white/[0.08] text-white/70"
                : "border-white/[0.06] text-white/25 hover:text-white/45 hover:border-white/12"
            }`}
            data-testid={`room-${room.id}`}
          >
            {room.icon}
            {room.label}
          </button>
        ) : (
          <div
            key={room.id}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-white/[0.04] text-white/15 font-mono text-[9px] uppercase tracking-widest whitespace-nowrap select-none"
            title="Coming soon"
            data-testid={`room-${room.id}`}
          >
            {room.icon}
            {room.label}
            <span className="text-[7px] text-white/10 ml-0.5">soon</span>
          </div>
        );
      })}
    </div>
  );
}

type StageFilter = "all" | "raw_seed" | "growing" | "ready_to_show";

function DeskZone({ writings, onOpenWriting, onCreateNew, onOpenPlanting, isCreating }: {
  writings: Writing[];
  onOpenWriting: (w: Writing) => void;
  onCreateNew: () => void;
  onOpenPlanting: (w: Writing) => void;
  isCreating: boolean;
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<StageFilter>("all");
  const [expandedCard, setExpandedCard] = useState<string | null>(null);

  const readinessKey = (w: Writing) => w.readiness || "raw_seed";

  const filteredWritings = writings
    .filter(w => activeFilter === "all" || readinessKey(w) === activeFilter)
    .filter(w => {
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return w.title.toLowerCase().includes(q) || w.content.toLowerCase().includes(q);
    })
    .sort((a, b) => new Date(b.updatedAt || 0).getTime() - new Date(a.updatedAt || 0).getTime());

  const seedCount = writings.filter(w => readinessKey(w) === "raw_seed").length;
  const growingCount = writings.filter(w => readinessKey(w) === "growing").length;
  const readyCount = writings.filter(w => readinessKey(w) === "ready_to_show").length;

  const filters: { id: StageFilter; label: string; count: number }[] = [
    { id: "all", label: "All", count: writings.length },
    { id: "raw_seed", label: "Seeds", count: seedCount },
    { id: "growing", label: "Growing", count: growingCount },
    { id: "ready_to_show", label: "Ready", count: readyCount },
  ];

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-end justify-between gap-4 mb-8">
        <div>
          <p className="text-sm font-serif text-white/25">
            {writings.length} {writings.length === 1 ? "piece" : "pieces"} · {writings.reduce((a, w) => a + wordCount(w.content), 0).toLocaleString()} words
          </p>
        </div>
        <motion.button
          onClick={onCreateNew}
          disabled={isCreating}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.97 }}
          className="flex items-center gap-2 px-5 py-2.5 border border-white/10 hover:border-amber-500/30 rounded-full font-mono text-[10px] uppercase tracking-widest text-white/50 hover:text-white bg-white/[0.03] hover:bg-white/[0.06] transition-all group"
          data-testid="button-new-piece"
        >
          <Plus size={14} className="group-hover:rotate-90 transition-transform duration-300" />
          New Piece
        </motion.button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-grow">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/15" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search your pieces..."
            className="w-full pl-10 pr-4 py-2.5 bg-white/[0.02] border border-white/[0.06] rounded-xl text-sm font-serif text-white/60 placeholder:text-white/15 focus:outline-none focus:border-white/15 transition-colors"
            data-testid="input-search"
          />
        </div>
        <div className="flex gap-0.5 p-0.5 bg-white/[0.02] rounded-xl border border-white/[0.05]">
          {filters.map((f) => (
            <button
              key={f.id}
              onClick={() => setActiveFilter(f.id)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg font-mono text-[9px] uppercase tracking-widest transition-all ${
                activeFilter === f.id ? "bg-white/[0.08] text-white/80" : "text-white/25 hover:text-white/45"
              }`}
              data-testid={`filter-${f.id}`}
            >
              {f.label}
              <span className={`text-[8px] ${activeFilter === f.id ? "text-white/40" : "text-white/12"}`}>{f.count}</span>
            </button>
          ))}
        </div>
      </div>

      {writings.length === 0 && (
        <div className="border border-dashed border-white/[0.08] rounded-2xl p-16 text-center space-y-6">
          <div className="flex items-center justify-center gap-6">
            <SeedIcon className="w-8 h-8 text-amber-400/15" />
            <SproutIcon className="w-10 h-10 text-emerald-400/15" />
            <BloomIcon className="w-8 h-8 text-pink-400/15" />
          </div>
          <div className="space-y-2">
            <h3 className="text-2xl font-display font-light italic text-white/50">Your garden awaits its first seed</h3>
            <p className="font-serif text-sm text-white/25 max-w-md mx-auto leading-relaxed">
              A line, a fragment, a whole draft — whatever wants to come out.
            </p>
          </div>
          <motion.button
            onClick={onCreateNew}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.97 }}
            className="inline-flex items-center gap-2 px-6 py-3 bg-white/[0.05] hover:bg-white/[0.08] border border-white/10 hover:border-amber-500/30 rounded-full font-mono text-[10px] uppercase tracking-widest text-white/50 hover:text-white transition-all"
            data-testid="button-plant-seed"
          >
            <Sparkles size={13} />
            Plant Your First Seed
          </motion.button>
        </div>
      )}

      {filteredWritings.length === 0 && writings.length > 0 && (
        <p className="text-center py-12 font-serif text-white/25 text-sm">No pieces match your search.</p>
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
                    ? `${stageColors[readiness]?.split(" ")[0] || "border-white/15"} bg-white/[0.025]`
                    : "border-white/[0.04] hover:border-white/[0.08] bg-white/[0.01]"
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
                    <div className={`flex-shrink-0 w-7 h-7 rounded-full border flex items-center justify-center ${stageColors[readiness] || "border-white/10 text-white/30"} ${stageAccent[readiness] || ""}`}>
                      {stageIcons[readiness] || stageIcons.raw_seed}
                    </div>
                    <div className="flex-grow min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-display font-light truncate text-white/70 italic">
                          {w.title || "Untitled"}
                        </h3>
                        {vis !== "personal" && (
                          <span className={`text-[9px] ${vis === "circle" ? "text-violet-400/40" : "text-emerald-400/40"}`}>
                            {vis === "circle" ? <Users size={10} /> : <Globe size={10} />}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0 text-white/15">
                      <span className="font-mono text-[9px] uppercase tracking-widest hidden sm:inline">{w.genre}</span>
                      <span className="font-mono text-[9px]">{timeAgo(w.updatedAt)}</span>
                      <ChevronDown size={13} className={`transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`} />
                    </div>
                  </div>
                  {!isExpanded && w.content && (
                    <p className="text-sm font-serif text-white/20 line-clamp-1 mt-1 ml-10">
                      {w.content.slice(0, 120)}
                    </p>
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
                          <p className="text-sm font-serif text-white/35 leading-relaxed line-clamp-4">
                            {w.content.slice(0, 400)}
                          </p>
                        )}
                        <div className="flex items-center gap-3 text-white/15">
                          <span className="font-mono text-[9px] tracking-widest">{wordCount(w.content)} words</span>
                          <VisibilityBadge visibility={vis} readiness={readiness} editorialAvailable={w.editorialAvailable} compact />
                        </div>
                        <div className="flex gap-2 pt-1">
                          <button
                            onClick={(e) => { e.stopPropagation(); onOpenWriting(w); }}
                            className="flex items-center gap-1.5 px-3.5 py-2 bg-white/[0.05] hover:bg-white/[0.09] border border-white/10 hover:border-white/20 rounded-lg font-mono text-[9px] uppercase tracking-widest text-white/50 hover:text-white transition-all"
                            data-testid={`button-edit-${w.id}`}
                          >
                            <PenLine size={11} />
                            Open
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); onOpenPlanting(w); }}
                            className="flex items-center gap-1.5 px-3.5 py-2 border border-white/[0.06] hover:border-white/15 rounded-lg font-mono text-[9px] uppercase tracking-widest text-white/30 hover:text-white/60 transition-all"
                            data-testid={`button-plant-${w.id}`}
                          >
                            <MapPin size={11} />
                            Plant
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
  onSave: (data: { title: string; content: string; genre: string; readiness?: string }) => void;
  onDelete: () => void;
  onOpenPlanting: () => void;
}) {
  const [editTitle, setEditTitle] = useState(writing.title);
  const [editContent, setEditContent] = useState(writing.content);
  const [editGenre, setEditGenre] = useState(writing.genre);
  const [editStage, setEditStage] = useState(writing.readiness || "raw_seed");
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const autoSaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const doSave = useCallback(() => {
    setSaving(true);
    onSave({ title: editTitle, content: editContent, genre: editGenre, readiness: editStage });
    setTimeout(() => { setSaving(false); setLastSaved(new Date()); }, 500);
  }, [editTitle, editContent, editGenre, editStage, onSave]);

  function handleContentChange(value: string) {
    setEditContent(value);
    if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
    autoSaveTimer.current = setTimeout(() => doSave(), 2000);
  }

  function handleTitleChange(value: string) {
    setEditTitle(value);
    if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
    autoSaveTimer.current = setTimeout(() => doSave(), 2000);
  }

  useEffect(() => {
    if (textareaRef.current) textareaRef.current.focus();
    return () => { if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current); };
  }, []);

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <button
          onClick={() => { doSave(); onBack(); }}
          className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-white/30 hover:text-white/70 transition-colors group"
          data-testid="button-back"
        >
          <ChevronLeft size={15} className="group-hover:-translate-x-1 transition-transform" />
          Back
        </button>
        <div className="flex items-center gap-3">
          <span className="font-mono text-[9px] tracking-widest text-white/15">
            {saving ? "saving..." : lastSaved ? `saved ${timeAgo(lastSaved)}` : ""}
          </span>
          <span className="font-mono text-[9px] tracking-widest text-white/15">{wordCount(editContent)} words</span>
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="p-1.5 text-white/15 hover:text-red-400/70 transition-colors"
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
                <button onClick={() => setShowDeleteConfirm(false)} className="px-4 py-1.5 font-mono text-[9px] uppercase tracking-widest text-white/40 hover:text-white" data-testid="button-cancel-delete">Cancel</button>
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
          onChange={(e) => handleTitleChange(e.target.value)}
          placeholder="Title..."
          className="w-full bg-transparent text-3xl md:text-4xl font-display font-light tracking-tight text-white/90 placeholder:text-white/10 focus:outline-none border-none italic"
          data-testid="input-title"
        />

        <div className="flex items-center gap-3 pb-5 border-b border-white/[0.04] flex-wrap">
          <div className="flex gap-0.5">
            {([
              { id: "raw_seed", label: "Seed" },
              { id: "growing", label: "Growing" },
              { id: "ready_to_show", label: "Ready" },
            ] as const).map((s) => (
              <button
                key={s.id}
                onClick={() => { setEditStage(s.id); setTimeout(doSave, 100); }}
                className={`flex items-center gap-1 px-2.5 py-1.5 rounded-full font-mono text-[9px] uppercase tracking-widest transition-all border ${
                  editStage === s.id
                    ? `${stageColors[s.id]} ${stageAccent[s.id]}`
                    : "border-transparent text-white/20 hover:text-white/40"
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
            onChange={(e) => { setEditGenre(e.target.value); setTimeout(doSave, 100); }}
            className="bg-transparent text-white/30 font-mono text-[9px] uppercase tracking-widest border border-white/[0.04] rounded-full px-3 py-1.5 focus:outline-none hover:border-white/15 transition-colors cursor-pointer"
            data-testid="select-genre"
          >
            {genreOptions.map((g) => (
              <option key={g} value={g} className="bg-[#0b101a]">{g}</option>
            ))}
          </select>
          <span className="w-px h-4 bg-white/[0.04]" />
          <button
            onClick={onOpenPlanting}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full font-mono text-[9px] uppercase tracking-widest border border-white/[0.04] text-white/25 hover:text-white/50 hover:border-white/15 transition-all"
            data-testid="button-open-planting"
          >
            <MapPin size={11} />
            {(writing.visibility || "personal") === "personal" ? "Private" : (writing.visibility || "personal") === "circle" ? "Circle" : "Gallery"}
          </button>
        </div>

        <textarea
          ref={textareaRef}
          value={editContent}
          onChange={(e) => handleContentChange(e.target.value)}
          placeholder="Begin writing..."
          className="w-full min-h-[60vh] bg-transparent text-lg font-serif leading-[2] text-white/70 placeholder:text-white/8 focus:outline-none resize-none border-none tracking-wide"
          data-testid="textarea-content"
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

  const { data: tendingFeed = [] } = useQuery<FeedWriting[]>({
    queryKey: ["/api/tending-feed"],
    queryFn: async () => {
      const res = await fetch("/api/tending-feed", { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch");
      return res.json();
    },
  });

  const { data: gardenFeed = [] } = useQuery<FeedWriting[]>({
    queryKey: ["/api/garden-feed"],
    queryFn: async () => {
      const res = await fetch("/api/garden-feed", { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch");
      return res.json();
    },
  });

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
        <div className="border border-dashed border-white/[0.06] rounded-2xl p-16 text-center space-y-4">
          <Feather size={32} className="mx-auto text-white/10" />
          <h3 className="text-xl font-display font-light italic text-white/40">No letters yet</h3>
          <p className="font-serif text-sm text-white/20 max-w-sm mx-auto leading-relaxed">
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
                isExpanded ? "border-white/[0.1] bg-white/[0.02]" : "border-transparent hover:border-white/[0.06]"
              }`}>
                <button
                  onClick={() => setExpandedId(isExpanded ? null : piece.id)}
                  className="w-full text-left p-5 md:p-6"
                  data-testid={`button-open-letter-${piece.id}`}
                >
                  <div className="flex items-center gap-2 mb-3">
                    <button
                      onClick={(e) => { e.stopPropagation(); onViewProfile?.(piece.authorId); }}
                      className="flex items-center gap-2 text-white/30 hover:text-white/60 transition-colors"
                      data-testid={`link-author-${piece.id}`}
                    >
                      <div className="w-5 h-5 rounded-full bg-white/[0.06] border border-white/[0.08] flex items-center justify-center text-white/30 font-mono text-[8px] uppercase">
                        {piece.authorName?.[0] || "?"}
                      </div>
                      <span className="font-serif text-xs">{piece.authorName || "Anonymous"}</span>
                    </button>
                    <span className="font-mono text-[8px] text-white/10">{timeAgo(piece.updatedAt)}</span>
                  </div>

                  <h3 className="text-lg md:text-xl font-display font-light text-white/70 italic mb-2 leading-snug">
                    {piece.title || "Untitled"}
                  </h3>

                  <p className={`font-serif text-white/35 leading-[1.9] ${isExpanded ? "" : "line-clamp-3"}`}>
                    {isExpanded ? piece.content.slice(0, 2000) : piece.content.slice(0, 250)}
                    {isExpanded && piece.content.length > 2000 && (
                      <span className="text-white/15 italic"> ...continues</span>
                    )}
                  </p>

                  {!isExpanded && (
                    <div className="flex items-center gap-3 mt-3">
                      <span className="font-mono text-[8px] uppercase tracking-widest text-white/12">{piece.genre}</span>
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
                            <span className="font-mono text-[8px] uppercase tracking-widest text-white/12">{piece.genre}</span>
                            <span className="font-mono text-[8px] text-white/10">{wordCount(piece.content)} words</span>
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
            className="inline-flex items-center gap-2 px-6 py-3 border border-white/[0.06] hover:border-white/15 rounded-full font-mono text-[9px] uppercase tracking-widest text-white/25 hover:text-white/50 transition-all"
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
  { id: "growth-journal" as const, label: "Growth Journal", desc: "Private reflections on your writing journey", icon: <NotebookPen size={20} />, color: "emerald" },
  { id: "inner-weather" as const, label: "Inner Weather", desc: "Track your creative mood and energy", icon: <CloudSun size={20} />, color: "sky" },
  { id: "rituals" as const, label: "Rituals", desc: "Timed writing sessions and creative routines", icon: <Flame size={20} />, color: "amber" },
  { id: "compost" as const, label: "Compost", desc: "Archive fragments — nothing is wasted", icon: <Archive size={20} />, color: "violet" },
  { id: "reflections" as const, label: "Reflections", desc: "Structured thoughts on your craft", icon: <Brain size={20} />, color: "pink" },
  { id: "circles" as const, label: "Circles", desc: "Small writing groups and conversation", icon: <Users size={20} />, color: "indigo" },
];

const toolColorMap: Record<string, { border: string; text: string; bg: string; glow: string }> = {
  emerald: { border: "border-emerald-500/15", text: "text-emerald-400/60", bg: "hover:bg-emerald-500/[0.04]", glow: "rgba(16,185,129,0.08)" },
  sky: { border: "border-sky-500/15", text: "text-sky-400/60", bg: "hover:bg-sky-500/[0.04]", glow: "rgba(14,165,233,0.08)" },
  amber: { border: "border-amber-500/15", text: "text-amber-400/60", bg: "hover:bg-amber-500/[0.04]", glow: "rgba(245,158,11,0.08)" },
  violet: { border: "border-violet-500/15", text: "text-violet-400/60", bg: "hover:bg-violet-500/[0.04]", glow: "rgba(139,92,246,0.08)" },
  pink: { border: "border-pink-500/15", text: "text-pink-400/60", bg: "hover:bg-pink-500/[0.04]", glow: "rgba(236,72,153,0.08)" },
  indigo: { border: "border-indigo-500/15", text: "text-indigo-400/60", bg: "hover:bg-indigo-500/[0.04]", glow: "rgba(99,102,241,0.08)" },
};

function GreenhouseZone() {
  const [activeTool, setActiveTool] = useState<GreenhouseTool>(null);

  if (activeTool) {
    return <GreenhouseToolView tool={activeTool} onBack={() => setActiveTool(null)} />;
  }

  return (
    <div className="max-w-3xl mx-auto">
      <p className="font-serif text-sm text-white/25 mb-8">
        Your private creative toolkit. These tools are for you alone — no one else sees them.
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
              className={`relative text-left p-5 rounded-xl border ${colors.border} bg-white/[0.01] ${colors.bg} transition-all duration-300 group overflow-hidden`}
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
                <p className="font-serif text-xs text-white/20 leading-relaxed">{tool.desc}</p>
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
        className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-white/25 hover:text-white/60 transition-colors group mb-6"
        data-testid="button-back-greenhouse"
      >
        <ChevronLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
        Greenhouse
      </button>
      <div className="flex items-center gap-3 mb-6">
        <div className={`${toolColorMap[toolInfo.color].text}`}>{toolInfo.icon}</div>
        <h2 className="text-2xl font-display font-light italic text-white/80">{toolInfo.label}</h2>
      </div>
      {toolContent[tool]}
    </div>
  );
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
          className="w-full bg-white/[0.02] border border-white/[0.06] rounded-xl px-4 py-3 text-sm font-serif text-white/60 placeholder:text-white/15 focus:outline-none focus:border-white/15 resize-none h-28 transition-colors"
          data-testid="input-journal-entry"
        />
        <button onClick={() => addMutation.mutate()} disabled={!content.trim()} className="mt-2 px-4 py-2 bg-white/[0.05] hover:bg-white/[0.08] border border-white/10 rounded-lg font-mono text-[9px] uppercase tracking-widest text-white/40 hover:text-white disabled:opacity-30 transition-all" data-testid="button-add-journal">Add Entry</button>
      </div>
      {entries.map((e: any) => (
        <div key={e.id} className="border border-white/[0.04] rounded-xl p-4">
          <p className="font-serif text-sm text-white/40 leading-relaxed">{e.content}</p>
          <span className="font-mono text-[8px] text-white/12 mt-2 block">{timeAgo(e.createdAt)}</span>
        </div>
      ))}
      {entries.length === 0 && <p className="font-serif text-sm text-white/15 italic py-6 text-center">No entries yet. Start reflecting on your growth.</p>}
    </div>
  );
}

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

  return (
    <div className="space-y-4">
      <div className="flex gap-1 mb-2">
        {moods.map(m => (
          <button key={m} onClick={() => setMood(m)} className={`px-3 py-1.5 rounded-full font-mono text-[9px] uppercase tracking-widest border transition-all ${mood === m ? "border-white/20 bg-white/[0.08] text-white/70" : "border-transparent text-white/20 hover:text-white/40"}`}>{m}</button>
        ))}
      </div>
      <div className="flex items-center gap-3">
        <span className="font-mono text-[9px] text-white/20 uppercase tracking-widest">Energy</span>
        <input type="range" min="1" max="10" value={energy} onChange={(e) => setEnergy(Number(e.target.value))} className="flex-grow accent-white/40" />
        <span className="font-mono text-[10px] text-white/30">{energy}</span>
      </div>
      <input type="text" value={note} onChange={(e) => setNote(e.target.value)} placeholder="Brief note..." className="w-full bg-white/[0.02] border border-white/[0.06] rounded-xl px-4 py-3 text-sm font-serif text-white/60 placeholder:text-white/15 focus:outline-none focus:border-white/15 transition-colors" data-testid="input-weather-note" />
      <button onClick={() => addMutation.mutate()} className="px-4 py-2 bg-white/[0.05] hover:bg-white/[0.08] border border-white/10 rounded-lg font-mono text-[9px] uppercase tracking-widest text-white/40 hover:text-white transition-all" data-testid="button-log-weather">Log Weather</button>
      {entries.map((e: any) => (
        <div key={e.id} className="border border-white/[0.04] rounded-xl p-3 flex items-center gap-3">
          <span className="font-mono text-[9px] uppercase text-white/30">{e.mood}</span>
          <span className="font-mono text-[9px] text-white/15">energy {e.energy}/10</span>
          {e.note && <span className="font-serif text-xs text-white/25">{e.note}</span>}
          <span className="ml-auto font-mono text-[8px] text-white/10">{timeAgo(e.createdAt)}</span>
        </div>
      ))}
    </div>
  );
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
      <div className="text-center space-y-4">
        {!isRunning ? (
          <>
            <div className="flex items-center justify-center gap-3">
              {[5, 10, 15, 25, 45].map(d => (
                <button key={d} onClick={() => setDuration(d)} className={`px-3 py-1.5 rounded-full font-mono text-[9px] uppercase tracking-widest border transition-all ${duration === d ? "border-white/20 bg-white/[0.08] text-white/70" : "border-transparent text-white/20 hover:text-white/40"}`}>{d}m</button>
              ))}
            </div>
            <button onClick={startTimer} className="px-6 py-3 bg-white/[0.05] hover:bg-white/[0.08] border border-amber-500/20 hover:border-amber-500/40 rounded-full font-mono text-[10px] uppercase tracking-widest text-amber-400/70 hover:text-amber-300 transition-all" data-testid="button-start-ritual">Begin Ritual</button>
          </>
        ) : (
          <div className="py-8">
            <p className="text-5xl font-display font-light text-white/80 tabular-nums">{mins}:{secs.toString().padStart(2, "0")}</p>
            <p className="font-serif text-sm text-white/20 mt-3">Write freely. The timer is tending to the time.</p>
          </div>
        )}
      </div>
      {sessions.length > 0 && (
        <div>
          <p className="font-mono text-[9px] uppercase tracking-widest text-white/15 mb-2">Past Sessions</p>
          {sessions.slice(0, 5).map((s: any) => (
            <div key={s.id} className="flex items-center gap-3 py-2 border-b border-white/[0.03]">
              <span className="font-mono text-[9px] text-white/25">{s.duration}min</span>
              <span className="font-mono text-[8px] text-white/10">{timeAgo(s.createdAt)}</span>
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
        <textarea value={fragment} onChange={(e) => setFragment(e.target.value)} placeholder="Toss a fragment, a cut line, an abandoned thought..." className="w-full bg-white/[0.02] border border-white/[0.06] rounded-xl px-4 py-3 text-sm font-serif text-white/60 placeholder:text-white/15 focus:outline-none focus:border-white/15 resize-none h-24 transition-colors" data-testid="input-compost" />
        <button onClick={() => addMutation.mutate()} disabled={!fragment.trim()} className="mt-2 px-4 py-2 bg-white/[0.05] hover:bg-white/[0.08] border border-white/10 rounded-lg font-mono text-[9px] uppercase tracking-widest text-white/40 hover:text-white disabled:opacity-30 transition-all" data-testid="button-add-compost">Add to Compost</button>
      </div>
      {entries.map((e: any) => (
        <div key={e.id} className={`border rounded-xl p-4 ${e.isRecycled ? "border-emerald-500/10 bg-emerald-500/[0.02]" : "border-white/[0.04]"}`}>
          <p className="font-serif text-sm text-white/35 leading-relaxed italic">{e.content}</p>
          <div className="flex items-center gap-2 mt-2">
            <span className="font-mono text-[8px] text-white/10">{timeAgo(e.createdAt)}</span>
            {e.isRecycled && <span className="font-mono text-[8px] text-emerald-400/40">recycled</span>}
          </div>
        </div>
      ))}
      {entries.length === 0 && <p className="font-serif text-sm text-white/15 italic py-6 text-center">Nothing composting yet. Toss in your fragments.</p>}
    </div>
  );
}

function ReflectionsView() {
  const { data: entries = [] } = useQuery<any[]>({
    queryKey: ["/api/reflections"],
    queryFn: async () => { const r = await fetch("/api/reflections", { credentials: "include" }); return r.ok ? r.json() : []; },
  });
  const queryClient = useQueryClient();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  const addMutation = useMutation({
    mutationFn: async () => {
      const r = await fetch("/api/reflections", { method: "POST", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify({ title, content, category: "craft" }) });
      if (!r.ok) throw new Error("Failed"); return r.json();
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["/api/reflections"] }); setTitle(""); setContent(""); },
  });

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Reflection title..." className="w-full bg-white/[0.02] border border-white/[0.06] rounded-xl px-4 py-3 text-sm font-serif text-white/60 placeholder:text-white/15 focus:outline-none focus:border-white/15 transition-colors" data-testid="input-reflection-title" />
        <textarea value={content} onChange={(e) => setContent(e.target.value)} placeholder="What are you learning about your craft..." className="w-full bg-white/[0.02] border border-white/[0.06] rounded-xl px-4 py-3 text-sm font-serif text-white/60 placeholder:text-white/15 focus:outline-none focus:border-white/15 resize-none h-28 transition-colors" data-testid="input-reflection-content" />
        <button onClick={() => addMutation.mutate()} disabled={!content.trim()} className="px-4 py-2 bg-white/[0.05] hover:bg-white/[0.08] border border-white/10 rounded-lg font-mono text-[9px] uppercase tracking-widest text-white/40 hover:text-white disabled:opacity-30 transition-all" data-testid="button-add-reflection">Add Reflection</button>
      </div>
      {entries.map((e: any) => (
        <div key={e.id} className="border border-white/[0.04] rounded-xl p-4">
          {e.title && <h4 className="font-display text-base font-light italic text-white/50 mb-1">{e.title}</h4>}
          <p className="font-serif text-sm text-white/35 leading-relaxed">{e.content}</p>
          <span className="font-mono text-[8px] text-white/10 mt-2 block">{timeAgo(e.createdAt)}</span>
        </div>
      ))}
      {entries.length === 0 && <p className="font-serif text-sm text-white/15 italic py-6 text-center">No reflections yet. Begin exploring your craft.</p>}
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
        <div key={c.id} className="border border-white/[0.06] rounded-xl p-4">
          <h4 className="font-display text-base font-light italic text-white/60">{c.name}</h4>
          {c.description && <p className="font-serif text-xs text-white/25 mt-1">{c.description}</p>}
          <div className="flex items-center gap-2 mt-2">
            <Users size={10} className="text-white/15" />
            <span className="font-mono text-[8px] text-white/15">{c.memberCount || 0} members</span>
          </div>
        </div>
      ))}
      {circles.length === 0 && <p className="font-serif text-sm text-white/15 italic py-6 text-center">No circles yet. Writing circles are intimate groups for sharing and discussion.</p>}
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
            <div className="w-12 h-12 mx-auto border border-white/10 rounded-full flex items-center justify-center">
              <Feather size={20} className="text-white/30 animate-pulse" />
            </div>
            <p className="font-mono text-[10px] tracking-widest text-white/25 uppercase">Opening your garden...</p>
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
            className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-white/25 hover:text-white/60 transition-colors group mb-6"
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
        <header className="sticky top-0 z-50 backdrop-blur-xl bg-background/60 border-b border-white/[0.04]">
          <div className="max-w-5xl mx-auto px-6 py-3">
            <div className="flex items-center justify-between gap-4">
              <a href="/" className="font-mono text-[9px] uppercase tracking-[0.3em] text-white/20 hover:text-white/40 transition-colors" data-testid="link-home">
                <Home size={15} />
              </a>

              {!isEditing && <ZoneNav active={activeZone} onChange={(z) => { setActiveZone(z); setProfileUserId(null); }} />}
              {isEditing && <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-white/20">Writing</span>}

              <div className="flex items-center gap-1">
                <NotificationBell onClick={() => setShowNotifications(true)} />
                <div className="relative">
                  <button
                    onClick={() => setShowProfileMenu(!showProfileMenu)}
                    className="w-7 h-7 rounded-full bg-white/[0.06] border border-white/[0.08] flex items-center justify-center text-white/30 font-mono text-[9px] uppercase hover:border-white/20 transition-colors"
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
                        className="absolute right-0 top-full mt-2 w-44 rounded-xl border border-white/[0.08] bg-[#0b101a]/95 backdrop-blur-xl overflow-hidden shadow-xl"
                      >
                        <div className="p-3 border-b border-white/[0.04]">
                          <p className="font-serif text-sm text-white/60 truncate">{user?.firstName} {user?.lastName}</p>
                          <p className="font-mono text-[8px] text-white/15 uppercase tracking-widest">Writer</p>
                        </div>
                        <a href="/api/logout" className="flex items-center gap-2 px-3 py-2.5 text-white/25 hover:text-red-400/60 hover:bg-white/[0.03] transition-all font-serif text-sm" data-testid="nav-logout">
                          <LogOut size={13} />
                          Sign Out
                        </a>
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
