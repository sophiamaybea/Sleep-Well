import { useState, useRef, useEffect, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus, Trash2, ChevronLeft, Feather, PenLine,
  Search, ChevronDown, BookOpen, Lock,
  Globe, Users, MapPin, Home, LogOut,
  Sprout, Sparkles, Flower2, Droplets, Zap, Leaf,
  Flame, Archive, NotebookPen,
  Bell, FileCheck, Heart, Bookmark, MessageCircle,
  Pin, PinOff, ArchiveRestore, Tag, X,
  TreePine, Glasses, Compass, Eye, Moon, Clock, Check, Send,
  Flag, ExternalLink, Camera, Crown
} from "lucide-react";
import type { Writing, WritingSnapshot } from "@shared/schema";
import { toast } from "@/hooks/use-toast";
import { useAccessibility } from "@/hooks/use-accessibility";
import PlantingFlow, { VisibilityBadge } from "@/components/garden/PlantingFlow";
import { NotificationBell } from "@/components/garden/NotificationPanel";
import NotificationPanel from "@/components/garden/NotificationPanel";
import { ResonanceBar, MarginaliaSection, TendButton } from "@/components/garden/SocialFeatures";
import { TablesRoom, WorkshopRoom, SwapRoom, TheDeskRoom } from "@/components/garden/CommunityRooms";
import RichEditor, { ContentRenderer, stripHtml, wordCountFromContent } from "@/components/garden/RichEditor";
import ExportMenu from "@/components/garden/ExportMenu";

type Zone = "desk" | "reading-room" | "greenhouse";
type ActiveRoom = "tables" | "workshop" | "swap" | "the-desk" | null;
type GreenhouseTool = "freewrite" | "growth-journal" | "circles" | null;

const stageColors: Record<string, string> = {
  raw_seed: "border-amber-500/30 text-amber-400/80",
  growing: "border-emerald-500/30 text-emerald-400/80",
  ready_to_show: "border-pink-500/30 text-pink-400/80",
  dormant: "border-violet-500/30 text-violet-400/80",
};

const stageAccent: Record<string, string> = {
  raw_seed: "bg-amber-500/10",
  growing: "bg-emerald-500/10",
  ready_to_show: "bg-pink-500/10",
  dormant: "bg-violet-500/10",
};

const stageGlow: Record<string, string> = {
  raw_seed: "rgba(245, 158, 11, 0.15)",
  growing: "rgba(16, 185, 129, 0.15)",
  ready_to_show: "rgba(236, 72, 153, 0.15)",
  dormant: "rgba(139, 92, 246, 0.15)",
};

const genreOptions = ["poetry", "fiction", "essay", "fragment", "other"];

function NightGardenAtmosphere() {
  return (
    <div className="fixed inset-0 z-[1] pointer-events-none overflow-hidden">
      <div className="absolute top-[-5%] right-[15%] w-[500px] h-[500px] rounded-full animate-moonpulse"
        style={{ background: "radial-gradient(circle, rgba(200, 220, 255, 0.08) 0%, rgba(200, 220, 255, 0.03) 40%, transparent 70%)" }} />

      <div className="absolute top-[12%] left-[8%] w-2 h-2 rounded-full bg-amber-300/70 animate-firefly-1 shadow-[0_0_8px_rgba(251,191,36,0.4)]" />
      <div className="absolute top-[25%] right-[12%] w-1.5 h-1.5 rounded-full bg-amber-200/60 animate-firefly-2 shadow-[0_0_6px_rgba(251,191,36,0.3)]" />
      <div className="absolute top-[45%] left-[20%] w-1 h-1 rounded-full bg-yellow-300/50 animate-firefly-3 shadow-[0_0_5px_rgba(253,224,71,0.3)]" />
      <div className="absolute top-[60%] right-[25%] w-2 h-2 rounded-full bg-amber-300/50 animate-firefly-4 shadow-[0_0_8px_rgba(251,191,36,0.3)]" />
      <div className="absolute top-[35%] left-[75%] w-1.5 h-1.5 rounded-full bg-yellow-200/40 animate-firefly-5 shadow-[0_0_6px_rgba(253,224,71,0.25)]" />
      <div className="absolute top-[70%] left-[40%] w-1 h-1 rounded-full bg-amber-200/50 animate-firefly-6 shadow-[0_0_5px_rgba(251,191,36,0.3)]" />

      <svg className="absolute bottom-0 left-0 w-full h-48 opacity-[0.04]" viewBox="0 0 1200 200" preserveAspectRatio="none" fill="currentColor">
        <path d="M0 200 L0 140 Q50 100 80 130 Q100 80 130 120 Q160 60 200 110 Q240 70 280 100 Q310 50 350 90 Q380 40 420 80 Q460 30 500 70 Q530 20 570 60 Q600 10 650 50 Q700 30 750 70 Q800 20 850 60 Q900 40 950 80 Q1000 30 1050 70 Q1100 50 1150 90 Q1180 60 1200 100 L1200 200Z" className="text-emerald-600" />
      </svg>

      <div className="absolute bottom-0 left-[5%] animate-sway">
        <svg width="30" height="80" viewBox="0 0 30 80" className="opacity-[0.06] text-emerald-400" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M15 80 Q15 60 15 40" />
          <path d="M15 55 Q5 45 3 35 Q2 28 8 30 Q12 32 15 45" />
          <path d="M15 40 Q25 30 27 20 Q28 13 22 15 Q18 17 15 30" />
          <path d="M15 30 Q10 20 8 10 Q7 4 12 8 Q14 12 15 22" />
        </svg>
      </div>
      <div className="absolute bottom-0 right-[8%] animate-sway-slow">
        <svg width="40" height="100" viewBox="0 0 40 100" className="opacity-[0.05] text-emerald-500" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M20 100 Q20 75 20 45" />
          <path d="M20 70 Q8 58 5 45 Q3 36 10 40 Q15 43 20 58" />
          <path d="M20 55 Q32 42 35 30 Q37 22 30 25 Q25 28 20 42" />
          <path d="M20 42 Q12 30 10 18 Q9 10 15 15 Q18 20 20 32" />
          <ellipse cx="20" cy="40" rx="6" ry="3" className="text-emerald-300" fill="currentColor" opacity="0.15" />
        </svg>
      </div>
      <div className="absolute bottom-0 left-[35%] animate-sway-fast">
        <svg width="20" height="60" viewBox="0 0 20 60" className="opacity-[0.05] text-emerald-400" fill="none" stroke="currentColor" strokeWidth="1.2">
          <path d="M10 60 Q10 45 10 25" />
          <path d="M10 40 Q4 32 3 24 Q2 18 7 22 Q9 25 10 35" />
          <path d="M10 30 Q16 22 17 14 Q18 8 13 12 Q11 15 10 25" />
        </svg>
      </div>
      <div className="absolute bottom-0 right-[30%] animate-sway">
        <svg width="25" height="70" viewBox="0 0 25 70" className="opacity-[0.04] text-emerald-500" fill="none" stroke="currentColor" strokeWidth="1.3">
          <path d="M12 70 Q12 55 12 30" />
          <path d="M12 50 Q5 40 4 30 Q3 22 9 27 Q11 30 12 42" />
          <path d="M12 38 Q19 28 20 18 Q21 11 16 15 Q14 18 12 30" />
        </svg>
      </div>

      <div className="absolute bottom-0 left-[60%] animate-sway-slow">
        <svg width="18" height="50" viewBox="0 0 18 50" className="opacity-[0.05] text-teal-400" fill="none" stroke="currentColor" strokeWidth="1">
          <path d="M9 50 Q9 35 9 15" />
          <circle cx="9" cy="12" r="5" fill="currentColor" opacity="0.12" />
          <circle cx="9" cy="12" r="3" fill="currentColor" opacity="0.08" />
        </svg>
      </div>

      <div className="absolute bottom-0 left-0 w-full h-20">
        <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(6, 78, 59, 0.06) 0%, transparent 100%)" }} />
      </div>
    </div>
  );
}

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
  dormant: <Moon size={16} />,
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
  { id: "the-desk", label: "The Desk", icon: <PenLine size={13} />, desc: "Shared writing space", comingSoon: false },
  { id: "swap", label: "Swap", icon: <MessageCircle size={13} />, desc: "Beta reading exchange", comingSoon: false },
];

function ZoneNav({ active, onChange }: { active: Zone; onChange: (z: Zone) => void }) {
  const zones: { id: Zone; label: string; desc: string; icon: React.ReactNode; activeColor: string }[] = [
    { id: "desk", label: "Your Desk", desc: "Your private writing space — drafts, fragments, and works in progress", icon: <PenLine size={14} />, activeColor: "border-amber-600/25 bg-amber-900/20 text-amber-200/90" },
    { id: "reading-room", label: "Reading Room", desc: "Read what others are growing — a quiet place to discover and respond", icon: <Glasses size={14} />, activeColor: "border-emerald-600/25 bg-emerald-900/20 text-emerald-200/90" },
    { id: "greenhouse", label: "Greenhouse", desc: "Private tools for tending your creative practice", icon: <TreePine size={14} />, activeColor: "border-teal-600/25 bg-teal-900/20 text-teal-200/90" },
  ];

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="inline-flex gap-1 p-1.5 rounded-full border border-emerald-800/20 bg-emerald-950/20 backdrop-blur-xl">
        {zones.map((z) => (
          <button
            key={z.id}
            onClick={() => onChange(z.id)}
            className={`relative flex items-center gap-2 px-4 py-2.5 rounded-full font-mono text-[10px] uppercase tracking-[0.2em] transition-all ${
              active === z.id ? "text-white/90" : "text-white/40 hover:text-white/60"
            }`}
            data-testid={`zone-tab-${z.id}`}
          >
            {active === z.id && (
              <motion.div
                layoutId="activeZone"
                className={`absolute inset-0 rounded-full ${z.activeColor}`}
                transition={{ type: "spring", stiffness: 500, damping: 35 }}
              />
            )}
            <span className="relative z-10 flex items-center gap-1.5 sm:gap-2">
              {z.icon}
              <span className="text-[8px] sm:text-[10px]">{z.label}</span>
            </span>
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
          className="font-serif text-[12px] text-white/45 text-center italic"
        >
          {zones.find(z => z.id === active)?.desc}
        </motion.p>
      </AnimatePresence>
    </div>
  );
}

function RoomsStrip({ activeRoom, onSelectRoom }: { activeRoom: ActiveRoom; onSelectRoom: (room: ActiveRoom) => void }) {
  const [showRooms, setShowRooms] = useState(false);
  const activeRoomData = rooms.find(r => r.id === activeRoom);

  return (
    <div className="relative">
      <div className="flex items-center gap-2">
        {activeRoomData && (
          <button
            onClick={() => onSelectRoom(null)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-emerald-600/25 bg-emerald-900/20 text-emerald-200/80 font-mono text-[9px] uppercase tracking-widest whitespace-nowrap transition-all"
            data-testid={`room-${activeRoomData.id}`}
          >
            {activeRoomData.icon}
            {activeRoomData.label}
            <X size={10} className="ml-1 opacity-60" />
          </button>
        )}
        <button
          onClick={() => setShowRooms(!showRooms)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border font-mono text-[9px] uppercase tracking-widest whitespace-nowrap transition-all ${
            showRooms
              ? "border-white/20 bg-white/[0.06] text-white/70"
              : "border-emerald-800/12 text-white/40 hover:text-white/60 hover:border-emerald-700/20"
          }`}
          data-testid="button-discover-rooms"
        >
          <Compass size={12} />
          Discover
          <ChevronDown size={10} className={`transition-transform ${showRooms ? "rotate-180" : ""}`} />
        </button>
      </div>

      <AnimatePresence>
        {showRooms && (
          <motion.div
            initial={{ opacity: 0, y: -4, height: 0 }}
            animate={{ opacity: 1, y: 0, height: "auto" }}
            exit={{ opacity: 0, y: -4, height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 pt-2">
              {rooms.map((room) => {
                const isActive = activeRoom === room.id;
                return (
                  <button
                    key={room.id}
                    onClick={() => { onSelectRoom(isActive ? null : room.id as ActiveRoom); setShowRooms(false); }}
                    title={room.desc}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-lg border font-mono text-[9px] uppercase tracking-widest whitespace-nowrap transition-all ${
                      isActive
                        ? "border-emerald-600/25 bg-emerald-900/20 text-emerald-200/80"
                        : "border-white/[0.06] text-white/40 hover:text-white/60 hover:border-white/15 hover:bg-white/[0.03]"
                    }`}
                    data-testid={`room-${room.id}`}
                  >
                    {room.icon}
                    <span className="truncate">{room.label}</span>
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

type StageFilter = "all" | "raw_seed" | "growing" | "ready_to_show" | "dormant";

function PublishInvitations() {
  const queryClient = useQueryClient();
  const { data: requests = [] } = useQuery<any[]>({
    queryKey: ["/api/author/requests"],
    queryFn: async () => {
      const res = await fetch("/api/author/requests", { credentials: "include" });
      if (!res.ok) return [];
      return res.json();
    },
  });

  const respondMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const res = await fetch(`/api/author/requests/${id}`, {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        credentials: "include", body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error(await res.text());
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/author/requests"] });
      queryClient.invalidateQueries({ queryKey: ["/api/writings"] });
    },
  });

  const pending = requests.filter((r: any) => r.status === "sent");
  if (pending.length === 0) return null;

  return (
    <div className="mb-6 space-y-3">
      <h3 className="font-mono text-[9px] uppercase tracking-[0.3em] text-amber-400/60 flex items-center gap-2">
        <Sparkles size={12} />
        Publishing Invitations
      </h3>
      {pending.map((r: any) => (
        <div key={r.id} className="rounded-xl border border-amber-400/20 bg-amber-400/[0.03] p-4" data-testid={`invite-${r.id}`}>
          <p className="font-serif text-sm text-white/80 mb-1">
            We'd like to invite your piece <span className="font-display italic text-amber-200/90">"{r.writingTitle}"</span> into The Page.
          </p>
          {r.editorNote && <p className="font-serif text-xs text-white/50 italic mb-2">"{r.editorNote}"</p>}
          {r.proposedDate && <p className="font-mono text-[8px] text-white/40 mb-2">Proposed: {r.proposedDate}</p>}
          <div className="flex gap-2 mt-3">
            <button
              onClick={() => respondMutation.mutate({ id: r.id, status: "accepted" })}
              className="px-3 py-1.5 rounded-lg bg-emerald-500/20 text-emerald-400/80 font-mono text-[10px] uppercase tracking-wider hover:bg-emerald-500/30 transition-colors"
              data-testid={`btn-accept-${r.id}`}
            >
              Accept
            </button>
            <button
              onClick={() => respondMutation.mutate({ id: r.id, status: "declined" })}
              className="px-3 py-1.5 rounded-lg bg-rose-500/10 text-rose-400/60 font-mono text-[10px] uppercase tracking-wider hover:bg-rose-500/20 transition-colors"
              data-testid={`btn-decline-${r.id}`}
            >
              Decline
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

function DeskZone({ writings, onOpenWriting, onCreateNew, onOpenPlanting, onQuickUpdate, isCreating, myFlags, flagMutation, userTier }: {
  writings: Writing[];
  onOpenWriting: (w: Writing) => void;
  onCreateNew: () => void;
  onOpenPlanting: (w: Writing) => void;
  onQuickUpdate: (id: string, data: Record<string, any>) => void;
  isCreating: boolean;
  myFlags: any[];
  flagMutation: any;
  userTier: string;
}) {
  const queryClient = useQueryClient();
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

  const searchAndTagFiltered = baseWritings
    .filter(w => !activeTag || ((w as any).tags || []).includes(activeTag))
    .filter(w => {
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      const plainContent = w.content.includes("<") ? stripHtml(w.content) : w.content;
      return w.title.toLowerCase().includes(q) || plainContent.toLowerCase().includes(q) || ((w as any).tags || []).some((t: string) => t.toLowerCase().includes(q));
    });

  const seedCount = searchAndTagFiltered.filter(w => readinessKey(w) === "raw_seed").length;
  const growingCount = searchAndTagFiltered.filter(w => readinessKey(w) === "growing").length;
  const readyCount = searchAndTagFiltered.filter(w => readinessKey(w) === "ready_to_show").length;
  const dormantCount = searchAndTagFiltered.filter(w => readinessKey(w) === "dormant").length;

  const filters: { id: StageFilter; label: string; count: number; tip: string }[] = [
    { id: "all", label: "All", count: searchAndTagFiltered.length, tip: "All your pieces" },
    { id: "raw_seed", label: "Seeds", count: seedCount, tip: "Early ideas and fragments" },
    { id: "growing", label: "Growing", count: growingCount, tip: "Works in progress" },
    { id: "ready_to_show", label: "Ready", count: readyCount, tip: "Polished and ready to share" },
    { id: "dormant", label: "Dormant", count: dormantCount, tip: "Sleeping pieces — not abandoned, just waiting" },
  ];

  return (
    <div className="max-w-3xl mx-auto">
      <PublishInvitations />

      <div className="flex items-end justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Feather size={16} className="text-amber-400/50" />
            <h2 className="font-display text-xl font-light italic text-white/70">Your Desk</h2>
          </div>
          <p className="text-xs font-serif text-white/40 ml-6">
            {writings.length} {writings.length === 1 ? "piece" : "pieces"} · {writings.reduce((a, w) => a + wordCount(w.content), 0).toLocaleString()} words
          </p>
        </div>
        <motion.button
          onClick={onCreateNew}
          disabled={isCreating}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.97 }}
          className="flex items-center gap-2 px-5 py-2.5 border border-emerald-600/20 hover:border-emerald-500/35 rounded-full font-mono text-[10px] uppercase tracking-widest text-emerald-200/60 hover:text-emerald-100/80 bg-emerald-900/15 hover:bg-emerald-900/25 transition-all group"
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
            className="w-full pl-10 pr-4 py-2.5 bg-emerald-950/15 border border-emerald-800/15 rounded-2xl text-sm font-serif text-white/75 placeholder:text-white/35 focus:outline-none focus:border-emerald-700/25 transition-colors"
            data-testid="input-search"
          />
        </div>
        <div className="flex gap-0.5 p-0.5 bg-emerald-950/15 rounded-2xl border border-emerald-800/10">
          {filters.map((f) => (
            <button
              key={f.id}
              onClick={() => setActiveFilter(f.id)}
              title={f.tip}
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
        <div className="relative border border-dashed border-emerald-700/20 rounded-3xl p-16 text-center space-y-6 overflow-hidden">
          <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse at 50% 80%, rgba(6,78,59,0.08) 0%, transparent 60%)" }} />
          <div className="relative flex items-center justify-center gap-6">
            <SeedIcon className="w-8 h-8 text-amber-400/20" />
            <SproutIcon className="w-10 h-10 text-emerald-400/20" />
            <BloomIcon className="w-8 h-8 text-pink-400/20" />
          </div>
          <div className="relative space-y-2">
            <h3 className="text-2xl font-display font-light italic text-white/70">Your garden awaits its first seed</h3>
            <p className="font-serif text-sm text-white/50 max-w-md mx-auto leading-relaxed">
              A line, a fragment, a whole draft — whatever wants to come out.
            </p>
          </div>
          <motion.button
            onClick={onCreateNew}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.97 }}
            className="relative inline-flex items-center gap-2 px-6 py-3 bg-emerald-950/30 hover:bg-emerald-900/30 border border-emerald-700/20 hover:border-emerald-600/30 rounded-full font-mono text-[10px] uppercase tracking-widest text-emerald-200/60 hover:text-emerald-100/80 transition-all"
            data-testid="button-plant-seed"
          >
            <Sparkles size={13} />
            Start Your First Piece
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
                className={`relative rounded-2xl border overflow-hidden transition-all duration-300 ${
                  isExpanded
                    ? `${stageColors[readiness]?.split(" ")[0] || "border-white/25"} bg-emerald-950/20`
                    : "border-emerald-800/15 hover:border-emerald-700/25 bg-emerald-950/10"
                } ${readiness === "dormant" ? "opacity-75" : ""}`}
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
                        {(w as any).isPublished && (
                          <span className="flex items-center gap-1 text-[8px] font-mono uppercase tracking-widest text-amber-400/60 bg-amber-400/[0.08] px-1.5 py-0.5 rounded-full flex-shrink-0" data-testid={`badge-exhibited-${w.id}`}>
                            <Sparkles size={8} />
                            Exhibited
                          </span>
                        )}
                        {vis !== "personal" && (
                          <span className={`text-[9px] ${vis === "circle" ? "text-violet-400/40" : "text-emerald-400/40"}`}>
                            {vis === "circle" ? <Users size={10} /> : <Globe size={10} />}
                          </span>
                        )}
                        {vis === "garden" && <QuietlyReadIndicator writingId={w.id} />}
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
                            Share
                          </button>
                          <div onClick={(e) => e.stopPropagation()}>
                            <ExportMenu title={w.title} content={w.content} writingId={w.id} />
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
                        <div className="flex items-center gap-2 pt-1 flex-wrap">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onQuickUpdate(w.id, { isPublicGarden: !(w as any).isPublicGarden });
                              }}
                              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full font-mono text-[8px] uppercase tracking-widest transition-all border ${
                                (w as any).isPublicGarden
                                  ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300/80"
                                  : "border-white/[0.06] text-white/30 hover:text-white/50 hover:border-white/15"
                              }`}
                              data-testid={`toggle-public-${w.id}`}
                            >
                              <Globe size={10} />
                              {(w as any).isPublicGarden ? "Public" : "Make Public"}
                            </button>
                          </div>
                          {userTier === "paid" ? (
                          <button
                            onClick={async (e) => {
                              e.stopPropagation();
                              const note = prompt("Optional note for this snapshot:");
                              const res = await fetch(`/api/writings/${w.id}/snapshot`, {
                                method: "POST",
                                headers: { "Content-Type": "application/json" },
                                credentials: "include",
                                body: JSON.stringify({ note: note || undefined }),
                              });
                              if (res.ok) {
                                queryClient.invalidateQueries({ queryKey: [`/api/writings/${w.id}/snapshots`] });
                                toast({ title: "Snapshot saved", description: note ? `"${note}"` : "Current state preserved" });
                              }
                            }}
                            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full font-mono text-[8px] uppercase tracking-widest transition-all border border-white/[0.06] text-white/30 hover:text-amber-300/60 hover:border-amber-500/20"
                            data-testid={`button-snapshot-${w.id}`}
                          >
                            <Camera size={10} />
                            Save this state
                          </button>
                          ) : (
                          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full font-mono text-[8px] uppercase tracking-widest text-amber-300/25">
                            <Camera size={10} />
                            <Crown size={8} />
                            Snapshots
                          </span>
                          )}
                          {readiness === "ready_to_show" && (() => {
                            const existingFlag = myFlags.find((f: any) => f.writingId === w.id);
                            if (existingFlag) {
                              return (
                                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full font-mono text-[8px] uppercase tracking-widest border border-violet-500/20 bg-violet-500/5 text-violet-300/70">
                                  <Flag size={10} />
                                  {existingFlag.status === "flagged" ? "Flagged for editors" : 
                                   existingFlag.status === "seen" ? "Seen by an editor" : 
                                   "Editor responded"}
                                </div>
                              );
                            }
                            return (
                              <button
                                onClick={(e) => { e.stopPropagation(); flagMutation.mutate(w.id); }}
                                className="flex items-center gap-1.5 px-2.5 py-1 rounded-full font-mono text-[8px] uppercase tracking-widest transition-all border border-white/[0.06] text-white/30 hover:text-violet-300/60 hover:border-violet-500/20"
                                data-testid={`button-flag-${w.id}`}
                              >
                                <Flag size={10} />
                                Ready for eyes
                              </button>
                            );
                          })()}
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
  const [showHistory, setShowHistory] = useState(false);
  const [previewSnapshot, setPreviewSnapshot] = useState<WritingSnapshot | null>(null);
  const hasMounted = useRef(false);

  const { data: snapshots = [] } = useQuery<WritingSnapshot[]>({
    queryKey: [`/api/writings/${writing.id}/snapshots`],
    queryFn: async () => {
      const res = await fetch(`/api/writings/${writing.id}/snapshots`, { credentials: "include" });
      if (!res.ok) return [];
      return res.json();
    },
  });

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
          <ExportMenu title={editTitle} content={editContent} compact writingId={writing.id} />
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
              { id: "dormant", label: "Dormant" },
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

        <div className="pb-2">
          <button
            onClick={() => setShowHistory(!showHistory)}
            className="flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-widest text-white/35 hover:text-white/55 transition-colors"
            data-testid="btn-version-history"
          >
            <Clock size={12} />
            Version History
            {snapshots.length > 0 && <span className="text-white/25">({snapshots.length})</span>}
            <ChevronDown size={10} className={`transition-transform ${showHistory ? "rotate-180" : ""}`} />
          </button>

          <AnimatePresence>
            {showHistory && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="mt-3 space-y-0 relative pl-4 border-l border-white/[0.06]">
                  <div className="relative py-2" data-testid="snapshot-current">
                    <div className="absolute -left-[17px] top-3 w-2 h-2 rounded-full bg-emerald-400/60 ring-2 ring-emerald-400/20" />
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[9px] uppercase tracking-widest text-emerald-400/70">Current</span>
                      <span className={`px-1.5 py-0.5 rounded text-[8px] font-mono uppercase tracking-widest border ${stageColors[editStage] || "border-white/10 text-white/40"}`}>
                        {editStage === "raw_seed" ? "Seed" : editStage === "growing" ? "Growing" : editStage === "ready_to_show" ? "Ready" : "Dormant"}
                      </span>
                      <span className="font-mono text-[8px] text-white/25">{wordCount(editContent)} words</span>
                    </div>
                  </div>

                  {snapshots.length === 0 && (
                    <p className="py-2 font-serif text-[11px] text-white/25 italic">No snapshots yet. Snapshots are saved when you change the readiness stage.</p>
                  )}

                  {snapshots.map((snap) => (
                    <button
                      key={snap.id}
                      onClick={() => setPreviewSnapshot(snap)}
                      className="relative w-full text-left py-2 group/snap hover:bg-white/[0.02] rounded-r-lg px-2 -ml-2 transition-colors"
                      data-testid={`snapshot-${snap.id}`}
                    >
                      <div className="absolute -left-[15px] top-3.5 w-1.5 h-1.5 rounded-full bg-white/20 group-hover/snap:bg-white/40 transition-colors" />
                      <div className="flex items-center gap-2">
                        <span className={`px-1.5 py-0.5 rounded text-[8px] font-mono uppercase tracking-widest border ${stageColors[snap.readiness] || "border-white/10 text-white/40"}`}>
                          {snap.readiness === "raw_seed" ? "Seed" : snap.readiness === "growing" ? "Growing" : snap.readiness === "ready_to_show" ? "Ready" : "Dormant"}
                        </span>
                        <span className="font-mono text-[8px] text-white/25">{snap.wordCount} words</span>
                        <span className="font-mono text-[8px] text-white/20">{timeAgo(snap.createdAt)}</span>
                        {(snap as any).isManual && <span className="font-mono text-[7px] uppercase tracking-widest text-amber-300/50 ml-2">manual</span>}
                      </div>
                      {(snap as any).snapshotNote && <p className="font-mono text-[8px] text-white/35 mt-0.5 italic">"{(snap as any).snapshotNote}"</p>}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <AnimatePresence>
          {previewSnapshot && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
              onClick={() => setPreviewSnapshot(null)}
              data-testid="snapshot-preview-overlay"
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-[#0b101a] border border-white/[0.08] rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden flex flex-col"
              >
                <div className="flex items-center justify-between p-4 border-b border-white/[0.06]">
                  <div className="flex items-center gap-3">
                    <span className={`px-2 py-0.5 rounded text-[9px] font-mono uppercase tracking-widest border ${stageColors[previewSnapshot.readiness] || "border-white/10 text-white/40"}`}>
                      {previewSnapshot.readiness === "raw_seed" ? "Seed" : previewSnapshot.readiness === "growing" ? "Growing" : previewSnapshot.readiness === "ready_to_show" ? "Ready" : "Dormant"}
                    </span>
                    <span className="font-mono text-[9px] text-white/30">{previewSnapshot.wordCount} words</span>
                    <span className="font-mono text-[9px] text-white/25">{timeAgo(previewSnapshot.createdAt)}</span>
                  </div>
                  <button
                    onClick={() => setPreviewSnapshot(null)}
                    className="p-1.5 text-white/40 hover:text-white/70 transition-colors"
                    data-testid="btn-close-preview"
                  >
                    <X size={16} />
                  </button>
                </div>
                <div className="p-6 overflow-y-auto">
                  <h3 className="font-display text-xl font-light italic text-white/70 mb-4">{previewSnapshot.title || "Untitled"}</h3>
                  <ContentRenderer content={previewSnapshot.content} className="font-serif text-white/55 leading-[1.9]" />
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

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

function QuietReadButton({ writingId }: { writingId: string }) {
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery<{ hasRead: boolean }>({
    queryKey: ["/api/quiet-read", writingId],
    queryFn: async () => {
      const res = await fetch(`/api/quiet-read/${writingId}`, { credentials: "include" });
      if (!res.ok) return { hasRead: false };
      return res.json();
    },
  });

  const mutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/quiet-read/${writingId}`, {
        method: "POST", credentials: "include",
      });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    onSuccess: () => {
      queryClient.setQueryData(["/api/quiet-read", writingId], { hasRead: true });
    },
  });

  const hasRead = data?.hasRead || false;

  return (
    <button
      onClick={(e) => { e.stopPropagation(); if (!hasRead) mutation.mutate(); }}
      className={`group/quiet relative flex items-center justify-center w-7 h-7 rounded-full transition-all duration-300 ${
        hasRead
          ? "text-amber-300/40 hover:text-amber-300/50"
          : "text-white/20 hover:text-white/40"
      }`}
      title={hasRead ? "You were here" : "I was here"}
      data-testid={`button-quiet-read-${writingId}`}
      disabled={isLoading}
    >
      <Eye size={14} />
      <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap font-mono text-[8px] tracking-widest text-white/40 opacity-0 group-hover/quiet:opacity-100 transition-opacity pointer-events-none">
        {hasRead ? "you were here" : "I was here"}
      </span>
    </button>
  );
}

function QuietlyReadIndicator({ writingId }: { writingId: string }) {
  const [showWhispers, setShowWhispers] = useState(false);
  const whisperRef = useRef<HTMLDivElement>(null);
  const { data } = useQuery<{ hasBeenRead: boolean }>({
    queryKey: ["/api/quietly-read", writingId],
    queryFn: async () => {
      const res = await fetch(`/api/quietly-read/${writingId}`, { credentials: "include" });
      if (!res.ok) return { hasBeenRead: false };
      return res.json();
    },
  });

  const { data: whispers = [] } = useQuery<{ whisper: string; createdAt: string | null }[]>({
    queryKey: ["/api/writings", writingId, "whispers"],
    queryFn: async () => {
      const res = await fetch(`/api/writings/${writingId}/whispers`, { credentials: "include" });
      if (!res.ok) return [];
      return res.json();
    },
    enabled: !!data?.hasBeenRead,
  });

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (whisperRef.current && !whisperRef.current.contains(e.target as Node)) {
        setShowWhispers(false);
      }
    }
    if (showWhispers) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showWhispers]);

  if (!data?.hasBeenRead) return null;

  return (
    <div className="relative" ref={whisperRef}>
      <button
        onClick={(e) => { e.stopPropagation(); setShowWhispers(!showWhispers); }}
        className="flex items-center gap-1 text-[8px] font-mono tracking-widest text-amber-300/25 italic hover:text-amber-300/40 transition-colors cursor-pointer"
        data-testid={`indicator-quietly-read-${writingId}`}
      >
        <Eye size={10} className="text-amber-300/30" />
        {whispers.length > 0 ? `${whispers.length} whisper${whispers.length !== 1 ? "s" : ""}` : "someone was here"}
      </button>

      <AnimatePresence>
        {showWhispers && whispers.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -4, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.97 }}
            transition={{ duration: 0.15 }}
            className="absolute left-0 top-full mt-2 z-50 min-w-[220px] max-w-[300px] rounded-xl border border-amber-500/10 bg-[#0a0a0a]/95 backdrop-blur-xl p-3 shadow-xl"
            data-testid="whispers-list"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="space-y-2">
              {whispers.map((w, i) => (
                <p key={i} className="font-serif italic text-xs text-white/40 leading-relaxed" data-testid={`whisper-${i}`}>
                  {w.whisper}
                </p>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

type ReadingRoomSort = "recent" | "quiet" | "tended";
const readingRoomGenres = ["all", "poetry", "fiction", "essay", "hybrid", "fragment", "other"];

function CuratedOpportunitiesBanner() {
  const [dismissed, setDismissed] = useState(false);
  const { data: opps = [] } = useQuery<any[]>({
    queryKey: ["/api/curated-opportunities"],
    queryFn: async () => {
      const res = await fetch("/api/curated-opportunities");
      if (!res.ok) return [];
      return res.json();
    },
  });

  if (dismissed || opps.length === 0) return null;

  const display = opps.slice(0, 2);

  return (
    <div className="mb-6 relative" data-testid="curated-opportunities-banner">
      <div className="rounded-xl border border-amber-500/15 bg-amber-500/[0.04] p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="font-mono text-[8px] uppercase tracking-[0.3em] text-amber-400/50">From the editors</span>
          <button onClick={() => setDismissed(true)} className="text-white/20 hover:text-white/40 transition-colors" data-testid="btn-dismiss-opps">
            <X size={12} />
          </button>
        </div>
        <div className="space-y-2">
          {display.map((opp: any) => (
            <div key={opp.id} className="flex items-baseline justify-between gap-3" data-testid={`garden-opp-${opp.id}`}>
              <div className="min-w-0">
                {opp.link ? (
                  <a href={opp.link} target="_blank" rel="noopener noreferrer" className="font-serif text-sm text-amber-200/80 hover:text-amber-200 underline underline-offset-2 decoration-amber-500/20 hover:decoration-amber-500/40 transition-colors">{opp.title}</a>
                ) : (
                  <span className="font-serif text-sm text-amber-200/80">{opp.title}</span>
                )}
                {opp.outlet && <span className="font-mono text-[8px] uppercase tracking-widest text-white/30 ml-2">{opp.outlet}</span>}
              </div>
              {opp.deadline && <span className="font-mono text-[8px] text-white/25 whitespace-nowrap flex-shrink-0">{opp.deadline}</span>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

type DailyLetterPiece = Writing & { authorName: string | null; authorImage: string | null };

function ReadingRoomZone({ onViewProfile }: { onViewProfile?: (userId: string) => void }) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [dailyLetterExpanded, setDailyLetterExpanded] = useState(false);
  const [page, setPage] = useState(1);
  const [activeSort, setActiveSort] = useState<ReadingRoomSort>("recent");
  const [genreFilter, setGenreFilter] = useState("all");
  const perPage = 8;

  const { data: dailyLetter, isLoading: loadingDailyLetter } = useQuery<DailyLetterPiece | null>({
    queryKey: ["/api/daily-letter"],
    queryFn: async () => {
      const res = await fetch("/api/daily-letter", { credentials: "include" });
      if (!res.ok) return null;
      return res.json();
    },
  });

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

  if (loadingTending || loadingGarden || loadingDailyLetter) return <ReadingRoomSkeleton />;

  const tendedAuthorIds = new Set(tendingFeed.map(p => p.authorId));

  const seen = new Set<string>();
  const allPieces: FeedWriting[] = [];
  for (const piece of tendingFeed) {
    if (!seen.has(piece.id) && piece.readiness !== "dormant") { seen.add(piece.id); allPieces.push(piece); }
  }
  for (const piece of gardenFeed) {
    if (!seen.has(piece.id) && piece.readiness !== "dormant") { seen.add(piece.id); allPieces.push(piece); }
  }

  let filteredPieces = genreFilter === "all"
    ? [...allPieces]
    : allPieces.filter(p => p.genre === genreFilter);

  if (activeSort === "tended") {
    filteredPieces = filteredPieces.filter(p => tendedAuthorIds.has(p.authorId));
  }

  if (activeSort === "recent" || activeSort === "tended") {
    filteredPieces.sort((a, b) => new Date(b.updatedAt || 0).getTime() - new Date(a.updatedAt || 0).getTime());
  } else if (activeSort === "quiet") {
    filteredPieces.sort((a, b) => new Date(a.updatedAt || 0).getTime() - new Date(b.updatedAt || 0).getTime());
  }

  if (dailyLetter) {
    filteredPieces = filteredPieces.filter(p => p.id !== dailyLetter.id);
  }

  const visiblePieces = filteredPieces.slice(0, page * perPage);
  const hasMore = filteredPieces.length > visiblePieces.length;

  const sortOptions: { id: ReadingRoomSort; label: string }[] = [
    { id: "recent", label: "Recent" },
    { id: "quiet", label: "Quiet" },
    { id: "tended", label: "Tended" },
  ];

  const dailyLetterContentWords = dailyLetter ? wordCount(dailyLetter.content) : 0;
  const shouldTruncateDailyLetter = dailyLetterContentWords > 500 && !dailyLetterExpanded;

  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-6">
        <div className="inline-flex items-center gap-2 mb-2">
          <BookOpen size={16} className="text-emerald-400/50" />
          <h2 className="font-display text-xl font-light italic text-white/70">Reading Room</h2>
        </div>
        <p className="font-serif text-xs text-white/35 italic">Letters from gardens you tend, and new voices growing nearby</p>
      </div>

      {dailyLetter && (
        <div className="mb-10" data-testid="daily-letter-card">
          <div className="rounded-2xl border border-amber-500/10 bg-amber-950/[0.06] p-7 md:p-9 space-y-5"
            style={{ boxShadow: "0 0 40px rgba(245, 158, 11, 0.03)" }}
          >
            <span className="font-mono text-[9px] uppercase tracking-[0.3em] text-amber-400/50">
              Today's Letter
            </span>

            <div className="flex items-center gap-2.5 pt-1">
              <button
                onClick={() => onViewProfile?.(dailyLetter.authorId)}
                className="flex items-center gap-2.5 text-white/55 hover:text-white/75 transition-colors"
                data-testid="daily-letter-author"
              >
                <div className="w-7 h-7 rounded-full bg-amber-500/[0.08] border border-amber-500/20 flex items-center justify-center text-amber-300/60 font-mono text-[10px] uppercase">
                  {dailyLetter.authorName?.[0] || "?"}
                </div>
                <span className="font-serif text-sm">{dailyLetter.authorName || "Anonymous"}</span>
              </button>
              <span className="font-mono text-[8px] text-white/25">{timeAgo(dailyLetter.createdAt)}</span>
            </div>

            <h3 className="text-2xl md:text-3xl font-display font-light text-white/85 italic leading-snug" data-testid="daily-letter-title">
              {dailyLetter.title || "Untitled"}
            </h3>

            <div className="pt-2">
              <ContentRenderer
                content={dailyLetter.content}
                maxLength={shouldTruncateDailyLetter ? 2500 : undefined}
                className="font-serif text-white/55 leading-[2] text-[15px]"
              />
              {shouldTruncateDailyLetter && (
                <button
                  onClick={() => setDailyLetterExpanded(true)}
                  className="mt-4 font-mono text-[10px] uppercase tracking-widest text-amber-400/50 hover:text-amber-400/70 transition-colors"
                  data-testid="daily-letter-continue-reading"
                >
                  Continue reading →
                </button>
              )}
            </div>

            <div className="pt-3 space-y-4">
              <div className="flex items-center gap-3">
                <QuietReadButton writingId={dailyLetter.id} />
                <span className="w-px h-3 bg-white/[0.06]" />
                <span className="font-mono text-[8px] uppercase tracking-widest text-white/40">{dailyLetter.genre}</span>
                <span className="font-mono text-[8px] text-white/25">{dailyLetterContentWords} words</span>
                <div className="ml-auto">
                  <TendButton gardenerId={dailyLetter.authorId} size="sm" />
                </div>
              </div>
              <ResonanceBar writingId={dailyLetter.id} />
              {dailyLetterExpanded && (
                <MarginaliaSection writingId={dailyLetter.id} authorId={dailyLetter.authorId} />
              )}
            </div>
          </div>

          {(allPieces.length > 1 || (allPieces.length === 1 && allPieces[0].id !== dailyLetter.id)) && (
            <div className="flex items-center gap-4 mt-10 mb-2">
              <div className="flex-1 border-t border-white/[0.04]" />
              <span className="font-mono text-[8px] uppercase tracking-[0.3em] text-white/25">More from the Garden</span>
              <div className="flex-1 border-t border-white/[0.04]" />
            </div>
          )}
        </div>
      )}

      <CuratedOpportunitiesBanner />

      <div className="flex flex-col items-center gap-3 mb-8">
        <div className="flex items-center gap-1.5 flex-wrap justify-center">
          {sortOptions.map((s) => (
            <button
              key={s.id}
              onClick={() => { setActiveSort(s.id); setPage(1); }}
              className={`px-3 py-1.5 rounded-full font-mono text-[9px] uppercase tracking-widest transition-all border ${
                activeSort === s.id
                  ? "border-amber-500/30 bg-amber-500/10 text-amber-300/90"
                  : "border-white/[0.06] text-white/35 hover:text-white/55 hover:border-white/15"
              }`}
              data-testid={`sort-${s.id}`}
            >
              {s.label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-1 flex-wrap justify-center">
          {readingRoomGenres.map((g) => (
            <button
              key={g}
              onClick={() => { setGenreFilter(g); setPage(1); }}
              className={`px-2.5 py-1 rounded-full font-mono text-[9px] uppercase tracking-widest transition-all border ${
                genreFilter === g
                  ? "border-amber-500/30 bg-amber-500/10 text-amber-300/90"
                  : "border-transparent text-white/25 hover:text-white/45"
              }`}
              data-testid={`genre-filter-${g}`}
            >
              {g}
            </button>
          ))}
        </div>
      </div>

      {allPieces.length === 0 && (
        <div className="relative border border-dashed border-emerald-700/15 rounded-3xl p-16 text-center space-y-4 overflow-hidden">
          <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse at 50% 80%, rgba(6,78,59,0.06) 0%, transparent 60%)" }} />
          <Feather size={32} className="relative mx-auto text-emerald-500/25" />
          <h3 className="relative text-xl font-display font-light italic text-white/50">No letters yet</h3>
          <p className="relative font-serif text-sm text-white/40 max-w-sm mx-auto leading-relaxed">
            When writers share their work to the garden, or you tend someone's garden, their pieces will appear here like letters slid under your door.
          </p>
        </div>
      )}

      {allPieces.length > 0 && filteredPieces.length === 0 && (
        <div className="border border-dashed border-white/[0.06] rounded-2xl p-12 text-center space-y-3">
          <Eye size={24} className="mx-auto text-white/15" />
          <p className="font-serif text-sm text-white/35 italic">
            {activeSort === "tended"
              ? "No pieces from writers you're tending yet. Tend a garden to see their work here."
              : "No pieces match this filter."}
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
              <div className={`rounded-2xl border transition-all duration-300 ${
                isExpanded ? "border-emerald-700/20 bg-emerald-950/20" : "border-transparent hover:border-emerald-800/15"
              }`}>
                <button
                  onClick={() => setExpandedId(isExpanded ? null : piece.id)}
                  className="w-full text-left p-5 md:p-6"
                  data-testid={`button-open-letter-${piece.id}`}
                >
                  <div className="flex items-center gap-2 mb-3">
                    <span
                      role="link"
                      tabIndex={0}
                      onClick={(e) => { e.stopPropagation(); onViewProfile?.(piece.authorId); }}
                      onKeyDown={(e) => { if (e.key === 'Enter') { e.stopPropagation(); onViewProfile?.(piece.authorId); } }}
                      className="flex items-center gap-2 text-white/50 hover:text-white/75 transition-colors cursor-pointer"
                      data-testid={`link-author-${piece.id}`}
                    >
                      <div className="w-5 h-5 rounded-full bg-white/[0.06] border border-white/[0.15] flex items-center justify-center text-white/50 font-mono text-[8px] uppercase">
                        {piece.authorName?.[0] || "?"}
                      </div>
                      <span className="font-serif text-xs">{piece.authorName || "Anonymous"}</span>
                    </span>
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
                      <div onClick={(e) => e.stopPropagation()}>
                        <QuietReadButton writingId={piece.id} />
                      </div>
                      <span className="w-px h-3 bg-white/[0.06]" />
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
                            <QuietReadButton writingId={piece.id} />
                            <span className="w-px h-3 bg-white/[0.06]" />
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
  { id: "freewrite" as const, label: "Freewrite", desc: "A typewriter with optional timer — pure flow writing with timed sessions to build your practice.", icon: <PenLine size={20} />, color: "warmGray" },
  { id: "growth-journal" as const, label: "Growth Journal", desc: "A private space to reflect on your writing journey — celebrate progress, note struggles, track what you're learning", icon: <NotebookPen size={20} />, color: "emerald" },
  { id: "circles" as const, label: "Circles", desc: "Create or join small writing groups for ongoing conversation and mutual support", icon: <Users size={20} />, color: "indigo" },
];

const toolColorMap: Record<string, { border: string; text: string; bg: string; glow: string }> = {
  emerald: { border: "border-emerald-400/25", text: "text-emerald-400/80", bg: "hover:bg-emerald-500/[0.08]", glow: "rgba(16,185,129,0.15)" },
  sky: { border: "border-sky-400/25", text: "text-sky-400/80", bg: "hover:bg-sky-500/[0.08]", glow: "rgba(14,165,233,0.15)" },
  amber: { border: "border-amber-400/25", text: "text-amber-400/80", bg: "hover:bg-amber-500/[0.08]", glow: "rgba(245,158,11,0.15)" },
  violet: { border: "border-violet-400/25", text: "text-violet-400/80", bg: "hover:bg-violet-500/[0.08]", glow: "rgba(139,92,246,0.15)" },
  pink: { border: "border-pink-400/25", text: "text-pink-400/80", bg: "hover:bg-pink-500/[0.08]", glow: "rgba(236,72,153,0.15)" },
  indigo: { border: "border-indigo-400/25", text: "text-indigo-400/80", bg: "hover:bg-indigo-500/[0.08]", glow: "rgba(99,102,241,0.15)" },
  warmGray: { border: "border-stone-400/25", text: "text-stone-300/80", bg: "hover:bg-stone-500/[0.08]", glow: "rgba(168,162,158,0.15)" },
};

function GreenhouseZone() {
  const [activeTool, setActiveTool] = useState<GreenhouseTool>(null);

  if (activeTool) {
    return <GreenhouseToolView tool={activeTool} onBack={() => setActiveTool(null)} />;
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 mb-3">
          <TreePine size={18} className="text-teal-400/60" />
          <h2 className="font-display text-2xl font-light italic text-white/70">Your Greenhouse</h2>
        </div>
        <p className="font-serif text-sm text-white/45 max-w-md mx-auto leading-relaxed">
          A private space just for you. Tend your practice, track your energy, and nurture your creative life. No one else can see what's here.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {greenhouseTools.map((tool, i) => {
          const colors = toolColorMap[tool.color];
          return (
            <motion.button
              key={tool.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06, duration: 0.35 }}
              onClick={() => setActiveTool(tool.id)}
              className={`relative text-left p-6 rounded-3xl border ${colors.border} bg-emerald-950/15 transition-all duration-300 group overflow-hidden`}
              data-testid={`tool-${tool.id}`}
            >
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" style={{
                background: `radial-gradient(ellipse at 30% 80%, ${colors.glow} 0%, rgba(6,78,59,0.05) 50%, transparent 80%)`,
              }} />
              <div className="absolute bottom-0 right-0 w-32 h-20 opacity-[0.03] group-hover:opacity-[0.06] transition-opacity pointer-events-none" style={{
                background: `radial-gradient(ellipse at 80% 100%, rgba(16,185,129,0.3) 0%, transparent 70%)`,
              }} />
              <div className="relative z-10">
                <div className={`${colors.text} mb-3 w-10 h-10 rounded-xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-center group-hover:scale-110 group-hover:bg-white/[0.08] transition-all`}>
                  {tool.icon}
                </div>
                <h3 className="font-display text-lg font-light italic text-white/75 group-hover:text-white/90 transition-colors mb-1.5">
                  {tool.label}
                </h3>
                <p className="font-serif text-xs text-white/45 leading-relaxed group-hover:text-white/55 transition-colors">{tool.desc}</p>
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
  const [timerDuration, setTimerDuration] = useState<number | null>(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const queryClient = useQueryClient();
  const { playKey, playSpace, playReturn } = useTypewriterSound();

  function startTimer(minutes: number) {
    setTimerDuration(minutes);
    setTimeLeft(minutes * 60);
    setIsTimerRunning(true);
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          setIsTimerRunning(false);
          fetch("/api/rituals", { method: "POST", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify({ type: "timed_write", duration: minutes, wordsWritten: 0, notes: "" }) })
            .then(() => queryClient.invalidateQueries({ queryKey: ["/api/rituals"] }));
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }

  function stopTimer() {
    if (timerRef.current) clearInterval(timerRef.current);
    setIsTimerRunning(false);
    setTimerDuration(null);
    setTimeLeft(0);
  }

  const timerMins = Math.floor(timeLeft / 60);
  const timerSecs = timeLeft % 60;

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
      <div className={`flex items-center justify-between flex-wrap gap-2 ${isFullscreen ? "px-8 pt-6 pb-2" : "mb-4"}`}>
        <div className="flex items-center gap-4">
          <span className="font-mono text-[9px] tracking-[0.3em] uppercase text-stone-500">
            {wordCount} words
          </span>
          <span className="text-stone-700">|</span>
          <span className="font-mono text-[9px] tracking-[0.3em] uppercase text-stone-500">
            {charCount} chars
          </span>
          {isTimerRunning && (
            <>
              <span className="text-stone-700">|</span>
              <span className="font-mono text-[9px] tracking-[0.3em] uppercase text-amber-400/80 tabular-nums">
                {timerMins}:{timerSecs.toString().padStart(2, "0")}
              </span>
              <button onClick={stopTimer} className="font-mono text-[8px] tracking-widest uppercase text-stone-600 hover:text-stone-400 transition-colors" data-testid="button-stop-timer">stop</button>
            </>
          )}
        </div>
        <div className="flex items-center gap-3">
          {!isTimerRunning && (
            <div className="flex items-center gap-1">
              <Flame size={11} className="text-stone-600" />
              {[5, 10, 15, 25].map(d => (
                <button key={d} onClick={() => startTimer(d)} className="font-mono text-[8px] tracking-widest uppercase px-2 py-0.5 rounded-full text-stone-600 hover:text-amber-400/80 hover:bg-amber-500/[0.06] transition-all" data-testid={`button-timer-${d}`} title={`${d} minute timed session`}>{d}m</button>
              ))}
            </div>
          )}
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
  const [tab, setTab] = useState<"journal" | "prompts">("journal");
  const { data: entries = [] } = useQuery<any[]>({
    queryKey: ["/api/growth-journal"],
    queryFn: async () => { const r = await fetch("/api/growth-journal", { credentials: "include" }); return r.ok ? r.json() : []; },
  });
  const { data: reflectionEntries = [] } = useQuery<any[]>({
    queryKey: ["/api/reflections"],
    queryFn: async () => { const r = await fetch("/api/reflections", { credentials: "include" }); return r.ok ? r.json() : []; },
  });
  const queryClient = useQueryClient();
  const [content, setContent] = useState("");
  const [promptIndex, setPromptIndex] = useState(() => Math.floor(Math.random() * reflectionPrompts.length));
  const currentPrompt = reflectionPrompts[promptIndex];

  const addMutation = useMutation({
    mutationFn: async () => {
      if (tab === "prompts") {
        const r = await fetch("/api/reflections", { method: "POST", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify({ title: currentPrompt, content, category: "craft" }) });
        if (!r.ok) throw new Error("Failed"); return r.json();
      }
      const r = await fetch("/api/growth-journal", { method: "POST", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify({ content, mood: "reflective" }) });
      if (!r.ok) throw new Error("Failed"); return r.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/growth-journal"] });
      queryClient.invalidateQueries({ queryKey: ["/api/reflections"] });
      setContent("");
      if (tab === "prompts") setPromptIndex((promptIndex + 1) % reflectionPrompts.length);
    },
  });

  const allEntries = tab === "journal" ? entries : reflectionEntries;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-1 p-0.5 bg-white/[0.03] rounded-lg border border-white/[0.06] w-fit">
        <button onClick={() => setTab("journal")} className={`px-3 py-1.5 rounded-md font-mono text-[9px] uppercase tracking-widest transition-all ${tab === "journal" ? "bg-white/[0.08] text-white/80" : "text-white/40 hover:text-white/60"}`} data-testid="tab-journal">Journal</button>
        <button onClick={() => setTab("prompts")} className={`px-3 py-1.5 rounded-md font-mono text-[9px] uppercase tracking-widest transition-all ${tab === "prompts" ? "bg-white/[0.08] text-white/80" : "text-white/40 hover:text-white/60"}`} data-testid="tab-prompts">Prompts</button>
      </div>

      {tab === "prompts" && (
        <div className="border border-pink-500/10 bg-pink-500/[0.02] rounded-xl p-4">
          <div className="flex items-start justify-between gap-3">
            <p className="font-display text-base font-light italic text-pink-200/60 leading-relaxed">{currentPrompt}</p>
            <button onClick={() => setPromptIndex((promptIndex + 1) % reflectionPrompts.length)} className="flex-shrink-0 p-1.5 text-white/30 hover:text-white/60 transition-colors" title="New prompt" data-testid="button-next-prompt">
              <Sparkles size={14} />
            </button>
          </div>
        </div>
      )}

      <div>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={tab === "prompts" ? "Reflect on this prompt..." : "What's growing in your practice today..."}
          className="w-full bg-white/[0.05] border border-white/[0.20] rounded-xl px-4 py-3 text-sm font-serif text-white/75 placeholder:text-white/45 focus:outline-none focus:border-white/40 resize-none h-28 transition-colors"
          data-testid="input-journal-entry"
        />
        <button onClick={() => addMutation.mutate()} disabled={!content.trim()} className="mt-2 px-4 py-2 bg-white/[0.05] hover:bg-white/[0.08] border border-white/20 rounded-lg font-mono text-[9px] uppercase tracking-widest text-white/60 hover:text-white disabled:opacity-30 transition-all" data-testid="button-add-journal">
          {tab === "prompts" ? "Save Reflection" : "Add Entry"}
        </button>
      </div>
      {allEntries.map((e: any) => (
        <div key={e.id} className="border border-white/[0.15] rounded-xl p-4">
          {e.title && <h4 className="font-display text-sm font-light italic text-white/45 mb-2">{e.title}</h4>}
          <p className="font-serif text-sm text-white/60 leading-relaxed">{e.content}</p>
          <span className="font-mono text-[8px] text-white/45 mt-2 block">{timeAgo(e.createdAt)}</span>
        </div>
      ))}
      {allEntries.length === 0 && <p className="font-serif text-sm text-white/50 italic py-6 text-center">{tab === "prompts" ? "Your reflections will gather here over time." : "No entries yet. Start reflecting on your growth."}</p>}
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

function CirclesView() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [expandedCircle, setExpandedCircle] = useState<string | null>(null);
  const [selectedWritingId, setSelectedWritingId] = useState<string>("");

  const { data: circles = [] } = useQuery<any[]>({
    queryKey: ["/api/circles"],
    queryFn: async () => { const r = await fetch("/api/circles", { credentials: "include" }); return r.ok ? r.json() : []; },
  });

  const { data: writings = [] } = useQuery<any[]>({
    queryKey: ["/api/writings"],
    queryFn: async () => { const r = await fetch("/api/writings", { credentials: "include" }); return r.ok ? r.json() : []; },
  });

  const joinMutation = useMutation({
    mutationFn: async (circleId: string) => {
      const r = await fetch(`/api/circles/${circleId}/join`, { method: "POST", credentials: "include" });
      if (!r.ok) { const e = await r.json(); throw new Error(e.message); }
      return r.json();
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["/api/circles"] }),
  });

  const shareMutation = useMutation({
    mutationFn: async ({ circleId, writingId }: { circleId: string; writingId: string }) => {
      const now = new Date();
      const startOfYear = new Date(now.getFullYear(), 0, 1);
      const weekNum = Math.floor((now.getTime() - startOfYear.getTime()) / (7 * 86400000));
      const weekOf = `${now.getFullYear()}-W${String(weekNum).padStart(2, "0")}`;
      const r = await fetch(`/api/circles/${circleId}/shares`, {
        method: "POST", headers: { "Content-Type": "application/json" }, credentials: "include",
        body: JSON.stringify({ writingId, weekOf }),
      });
      if (!r.ok) throw new Error("Failed to share");
      return r.json();
    },
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: [`/api/circles/${vars.circleId}/shares`] });
      setSelectedWritingId("");
    },
  });

  return (
    <div className="space-y-4">
      {circles.map((c: any) => {
        const isFull = (c.memberCount || 0) >= (c.maxMembers || 5);
        const isExpanded = expandedCircle === c.id;

        return (
          <div key={c.id} className="border border-white/[0.20] rounded-xl overflow-hidden" data-testid={`circle-card-${c.id}`}>
            <button
              onClick={() => setExpandedCircle(isExpanded ? null : c.id)}
              className="w-full p-4 text-left hover:bg-white/[0.02] transition-colors"
              data-testid={`circle-toggle-${c.id}`}
            >
              <div className="flex items-center justify-between">
                <h4 className="font-display text-base font-light italic text-white/75">{c.name}</h4>
                <div className="flex items-center gap-2">
                  {isFull && (
                    <span className="font-mono text-[8px] uppercase tracking-widest px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400/70 border border-amber-500/20" data-testid={`badge-full-${c.id}`}>
                      Full
                    </span>
                  )}
                  <ChevronDown size={14} className={`text-white/40 transition-transform ${isExpanded ? "rotate-180" : ""}`} />
                </div>
              </div>
              {c.description && <p className="font-serif text-xs text-white/60 mt-1">{c.description}</p>}
              <div className="flex items-center gap-2 mt-2">
                <Users size={10} className="text-white/50" />
                <span className="font-mono text-[8px] text-white/50" data-testid={`text-member-count-${c.id}`}>
                  {c.memberCount || 0}/{c.maxMembers || 5} members
                </span>
              </div>
            </button>

            <AnimatePresence>
              {isExpanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <CircleDetail circle={c} userId={user?.id || ""} writings={writings} isFull={isFull}
                    onJoin={() => joinMutation.mutate(c.id)}
                    onShare={(writingId) => shareMutation.mutate({ circleId: c.id, writingId })}
                    isJoining={joinMutation.isPending}
                    isSharing={shareMutation.isPending}
                    selectedWritingId={selectedWritingId}
                    onSelectWriting={setSelectedWritingId}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
      {circles.length === 0 && <p className="font-serif text-sm text-white/50 italic py-6 text-center">No circles yet. Writing circles are intimate groups for sharing and discussion.</p>}
    </div>
  );
}

function CircleDetail({ circle, userId, writings, isFull, onJoin, onShare, isJoining, isSharing, selectedWritingId, onSelectWriting }: {
  circle: any; userId: string; writings: any[]; isFull: boolean;
  onJoin: () => void; onShare: (writingId: string) => void;
  isJoining: boolean; isSharing: boolean;
  selectedWritingId: string; onSelectWriting: (id: string) => void;
}) {
  const { data: members = [] } = useQuery<any[]>({
    queryKey: [`/api/circles/${circle.id}/members`],
    queryFn: async () => { const r = await fetch(`/api/circles/${circle.id}/members`, { credentials: "include" }); return r.ok ? r.json() : []; },
  });

  const { data: currentSharer } = useQuery<any>({
    queryKey: [`/api/circles/${circle.id}/current-sharer`],
    queryFn: async () => { const r = await fetch(`/api/circles/${circle.id}/current-sharer`, { credentials: "include" }); return r.ok ? r.json() : null; },
  });

  const { data: shares = [] } = useQuery<any[]>({
    queryKey: [`/api/circles/${circle.id}/shares`],
    queryFn: async () => { const r = await fetch(`/api/circles/${circle.id}/shares`, { credentials: "include" }); return r.ok ? r.json() : []; },
  });

  const { data: microPrompt, refetch: refetchPrompt } = useQuery<any>({
    queryKey: [`/api/circles/${circle.id}/micro-prompt`],
    queryFn: async () => { const r = await fetch(`/api/circles/${circle.id}/micro-prompt`, { credentials: "include" }); return r.ok ? r.json() : null; },
    enabled: members.some((m: any) => m.userId === userId),
  });

  const queryClient = useQueryClient();
  const [microResponse, setMicroResponse] = useState("");
  const respondMutation = useMutation({
    mutationFn: async (content: string) => {
      const r = await fetch(`/api/circles/${circle.id}/micro-prompt/respond`, {
        method: "POST", headers: { "Content-Type": "application/json" }, credentials: "include",
        body: JSON.stringify({ promptId: microPrompt?.id, content }),
      });
      if (!r.ok) throw new Error("Failed");
      return r.json();
    },
    onSuccess: () => { setMicroResponse(""); refetchPrompt(); },
  });

  const isMember = members.some((m: any) => m.userId === userId);
  const isMyTurn = currentSharer?.userId === userId;
  const hasResponded = microPrompt?.responses?.some((r: any) => r.userId === userId);
  const now = new Date();
  const startOfYear = new Date(now.getFullYear(), 0, 1);
  const weekNum = Math.floor((now.getTime() - startOfYear.getTime()) / (7 * 86400000));
  const currentWeek = `${now.getFullYear()}-W${String(weekNum).padStart(2, "0")}`;
  const thisWeekShare = shares.find((s: any) => s.weekOf === currentWeek);

  return (
    <div className="px-4 pb-4 space-y-4 border-t border-white/[0.08]">
      {isMember && currentSharer && (
        <div className="pt-3 space-y-3">
          <h5 className="font-mono text-[9px] uppercase tracking-[0.3em] text-teal-400/60 flex items-center gap-2">
            <Clock size={11} />
            This Week
          </h5>

          {thisWeekShare ? (
            <div className="rounded-lg border border-emerald-500/15 bg-emerald-500/[0.04] p-3" data-testid={`share-this-week-${circle.id}`}>
              <p className="font-serif text-xs text-white/70">
                <span className="text-emerald-400/80 font-display italic">{thisWeekShare.userName}</span> shared
                {thisWeekShare.writingTitle && (
                  <> — <span className="italic text-white/60">"{thisWeekShare.writingTitle}"</span></>
                )}
              </p>
              <p className="font-mono text-[8px] text-emerald-400/40 mt-1 uppercase tracking-widest">Read & Respond</p>
            </div>
          ) : isMyTurn ? (
            <div className="rounded-lg border border-amber-500/20 bg-amber-500/[0.04] p-3" data-testid={`share-your-turn-${circle.id}`}>
              <p className="font-serif text-xs text-amber-200/80 mb-2">It's your turn to share — pick a piece</p>
              <div className="flex gap-2">
                <select
                  value={selectedWritingId}
                  onChange={(e) => onSelectWriting(e.target.value)}
                  className="flex-1 bg-white/[0.06] border border-white/[0.12] rounded-lg px-2 py-1.5 font-serif text-xs text-white/70 focus:outline-none focus:border-amber-500/30"
                  data-testid={`select-writing-${circle.id}`}
                >
                  <option value="">Choose a writing...</option>
                  {writings.map((w: any) => (
                    <option key={w.id} value={w.id}>{w.title}</option>
                  ))}
                </select>
                <button
                  onClick={() => selectedWritingId && onShare(selectedWritingId)}
                  disabled={!selectedWritingId || isSharing}
                  className="px-3 py-1.5 rounded-lg bg-amber-500/20 text-amber-300/80 font-mono text-[9px] uppercase tracking-wider hover:bg-amber-500/30 transition-colors disabled:opacity-40"
                  data-testid={`btn-share-${circle.id}`}
                >
                  Share
                </button>
              </div>
            </div>
          ) : (
            <div className="rounded-lg border border-white/[0.08] bg-white/[0.02] p-3" data-testid={`share-waiting-${circle.id}`}>
              <p className="font-serif text-xs text-white/55">
                Waiting for <span className="text-teal-400/70 font-display italic">{currentSharer.userName}</span> to share this week
              </p>
            </div>
          )}

          {members.length > 1 && (
            <div className="flex items-center gap-1 flex-wrap" data-testid={`rotation-order-${circle.id}`}>
              <span className="font-mono text-[7px] text-white/30 uppercase tracking-widest mr-1">Rotation:</span>
              {members.map((m: any, i: number) => (
                <span
                  key={m.id}
                  className={`font-mono text-[8px] px-1.5 py-0.5 rounded-full ${
                    m.userId === currentSharer?.userId
                      ? "bg-teal-500/15 text-teal-400/70 border border-teal-500/20"
                      : "text-white/30"
                  }`}
                >
                  {m.userName || "?"}
                  {i < members.length - 1 && <span className="text-white/15 ml-1">→</span>}
                </span>
              ))}
            </div>
          )}
        </div>
      )}

      {isMember && microPrompt && (
        <div className="pt-1 space-y-2" data-testid={`micro-prompt-${circle.id}`}>
          <h5 className="font-mono text-[9px] uppercase tracking-[0.3em] text-amber-400/50 flex items-center gap-2">
            <Sparkles size={10} />
            This week's prompt
          </h5>
          <p className="font-serif italic text-sm text-amber-200/70 leading-relaxed">{microPrompt.prompt}</p>

          {microPrompt.responses?.length > 0 && (
            <div className="space-y-1.5">
              {microPrompt.responses.map((r: any) => (
                <div key={r.id} className="flex items-start gap-2" data-testid={`micro-response-${r.id}`}>
                  <span className="w-5 h-5 rounded-full bg-emerald-500/10 border border-emerald-500/15 flex items-center justify-center text-emerald-400/60 font-mono text-[8px] uppercase flex-shrink-0 mt-0.5">
                    {r.userName?.[0] || "?"}
                  </span>
                  <div className="min-w-0">
                    <span className="font-mono text-[8px] text-white/30 uppercase tracking-wider">{r.userName}</span>
                    <p className="font-serif text-xs text-white/60 leading-snug">{r.content}</p>
                  </div>
                  {r.userId === userId && (
                    <Check size={10} className="text-emerald-400/50 flex-shrink-0 mt-1" />
                  )}
                </div>
              ))}
            </div>
          )}

          {!hasResponded && (
            <div className="flex gap-1.5" data-testid={`micro-prompt-input-${circle.id}`}>
              <input
                type="text"
                value={microResponse}
                onChange={(e) => setMicroResponse(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter" && microResponse.trim()) respondMutation.mutate(microResponse.trim()); }}
                placeholder="Your response..."
                className="flex-1 bg-white/[0.04] border border-amber-500/10 rounded-lg px-2.5 py-1.5 font-serif text-xs text-white/70 placeholder:text-white/20 focus:outline-none focus:border-amber-500/25 transition-colors"
                data-testid={`input-micro-response-${circle.id}`}
              />
              <button
                onClick={() => microResponse.trim() && respondMutation.mutate(microResponse.trim())}
                disabled={!microResponse.trim() || respondMutation.isPending}
                className="px-2 py-1.5 rounded-lg bg-amber-500/15 text-amber-300/70 hover:bg-amber-500/25 transition-colors disabled:opacity-30"
                data-testid={`btn-micro-respond-${circle.id}`}
              >
                <Send size={11} />
              </button>
            </div>
          )}
        </div>
      )}

      {!isMember && (
        <div className="pt-3">
          <button
            onClick={onJoin}
            disabled={isFull || isJoining}
            className={`px-4 py-2 rounded-lg font-mono text-[10px] uppercase tracking-wider transition-colors ${
              isFull
                ? "bg-white/[0.04] text-white/30 cursor-not-allowed border border-white/[0.08]"
                : "bg-emerald-500/15 text-emerald-400/80 border border-emerald-500/20 hover:bg-emerald-500/25"
            }`}
            data-testid={`btn-join-circle-${circle.id}`}
          >
            {isFull ? "Circle is full" : isJoining ? "Joining..." : "Join Circle"}
          </button>
        </div>
      )}
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
  const [showA11yPanel, setShowA11yPanel] = useState(false);
  const [profileUserId, setProfileUserId] = useState<string | null>(null);
  const [activeRoom, setActiveRoom] = useState<ActiveRoom>(null);
  const { settings: a11y, toggle: toggleA11y } = useAccessibility();

  const { data: writings = [], isLoading } = useQuery<Writing[]>({
    queryKey: ["/api/writings"],
    queryFn: async () => {
      const res = await fetch("/api/writings", { credentials: "include" });
      if (!res.ok) throw new Error(`${res.status}: ${res.statusText}`);
      return res.json();
    },
    enabled: isAuthenticated,
  });

  const { data: gardenPulse } = useQuery<{ activeWriters: number; newSeeds: number; bloomedPieces: number; totalWriters: number }>({
    queryKey: ["/api/garden-pulse"],
    queryFn: async () => {
      const res = await fetch("/api/garden-pulse", { credentials: "include" });
      if (!res.ok) throw new Error(`${res.status}: ${res.statusText}`);
      return res.json();
    },
    enabled: isAuthenticated,
    refetchInterval: 60000,
  });

  const { data: tierData } = useQuery<{ tier: string }>({
    queryKey: ["/api/user/tier"],
    queryFn: async () => {
      const res = await fetch("/api/user/tier", { credentials: "include" });
      if (!res.ok) return { tier: "free" };
      return res.json();
    },
    enabled: !!user,
  });
  const userTier = tierData?.tier || "free";

  const { data: myFlags = [] } = useQuery<any[]>({
    queryKey: ["/api/editorial-flags/mine"],
    queryFn: async () => {
      const res = await fetch("/api/editorial-flags/mine", { credentials: "include" });
      if (!res.ok) return [];
      return res.json();
    },
    enabled: !!user,
  });

  const { data: activeWalk } = useQuery<any>({
    queryKey: ["/api/editors-walk/active"],
    queryFn: async () => {
      const res = await fetch("/api/editors-walk/active");
      if (!res.ok) return null;
      return res.json();
    },
  });

  const flagMutation = useMutation({
    mutationFn: async (writingId: string) => {
      const res = await fetch("/api/editorial-flags", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ writingId }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message);
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/editorial-flags/mine"] });
    },
    onError: (err: any) => {
      toast({ title: "Cannot flag", description: err.message, variant: "destructive" });
    },
  });

  useEffect(() => {
    if (!isAuthenticated) return;
    const sendHeartbeat = () => { fetch("/api/presence", { method: "POST", credentials: "include" }).catch(() => {}); };
    sendHeartbeat();
    const interval = setInterval(sendHeartbeat, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [isAuthenticated]);

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
    <div className="min-h-screen bg-background text-foreground relative" style={{ background: "linear-gradient(180deg, #0b101a 0%, #0a1210 30%, #0b1318 60%, #0b101a 100%)" }}>
      <NightGardenAtmosphere />

      <div className="relative z-10">
        <header className="sticky top-0 z-50 backdrop-blur-xl border-b border-emerald-900/25" style={{ background: "linear-gradient(135deg, rgba(11,16,26,0.92) 0%, rgba(10,18,16,0.92) 100%)" }}>
          <div className="max-w-5xl mx-auto px-6 py-3">
            <div className="flex items-center justify-between gap-4">
              <a href="/" className="flex items-center gap-2 font-mono text-[9px] uppercase tracking-[0.3em] text-white/45 hover:text-white/60 transition-colors group" data-testid="link-home">
                <Leaf size={14} className="text-emerald-500/40 group-hover:text-emerald-400/60 transition-colors" />
              </a>

              <div className="flex flex-col items-center">
                {!isEditing && <ZoneNav active={activeZone} onChange={(z) => { setActiveZone(z); setProfileUserId(null); }} />}
                {isEditing && <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-white/55">Writing</span>}
                {!isEditing && gardenPulse && gardenPulse.activeWriters > 0 && (
                  <div className="flex flex-col items-center gap-0.5 mt-1.5" data-testid="garden-pulse">
                    <div className="flex items-center gap-1.5">
                      <span className="relative flex h-1.5 w-1.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400/40" />
                        <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-400/60" />
                      </span>
                      <span className="font-mono text-[9px] text-white/30">
                        {gardenPulse.activeWriters} {gardenPulse.activeWriters === 1 ? "writer" : "writers"} in the garden right now
                      </span>
                    </div>
                    {(gardenPulse.newSeeds > 0 || gardenPulse.bloomedPieces > 0) && (
                      <p className="font-serif italic text-[9px] text-white/25">
                        This month: {gardenPulse.newSeeds > 0 && <>{gardenPulse.newSeeds} {gardenPulse.newSeeds === 1 ? "writer" : "writers"} planted new seeds</>}{gardenPulse.newSeeds > 0 && gardenPulse.bloomedPieces > 0 && ". "}{gardenPulse.bloomedPieces > 0 && <>{gardenPulse.bloomedPieces} {gardenPulse.bloomedPieces === 1 ? "piece" : "pieces"} bloomed</>}.
                      </p>
                    )}
                  </div>
                )}
              </div>

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
                        className="absolute right-0 top-full mt-2 w-64 rounded-2xl border border-emerald-800/20 overflow-hidden shadow-xl" style={{ background: "linear-gradient(180deg, rgba(10,18,16,0.97) 0%, rgba(11,16,26,0.97) 100%)" }}
                      >
                        <div className="p-4 border-b border-emerald-900/20">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-white/[0.08] border border-white/20 flex items-center justify-center text-white/70 font-display text-lg italic">
                              {user?.firstName?.[0] || "?"}
                            </div>
                            <div>
                              <p className="font-display text-sm text-white/85 italic">{user?.firstName} {user?.lastName}</p>
                              <p className="font-mono text-[8px] text-white/50 uppercase tracking-widest">{user?.role === "editor" ? "Editor" : "Writer"}</p>
                              {userTier === "paid" && (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-mono text-[8px] uppercase tracking-widest border border-amber-500/20 bg-amber-500/5 text-amber-300/60">
                                  <Crown size={9} />
                                  Cultivator
                                </span>
                              )}
                            </div>
                          </div>
                          <a
                            href={`/public-garden/${user?.id}`}
                            target="_blank"
                            rel="noopener"
                            className="inline-flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-widest text-emerald-400/50 hover:text-emerald-400/80 transition-colors mt-2"
                            data-testid="link-public-garden"
                          >
                            <ExternalLink size={10} />
                            Your Public Garden
                          </a>
                        </div>
                        <div className="p-3 border-b border-emerald-900/20 space-y-2">
                          <a
                            href={`/writer/${user?.id}`}
                            className="flex items-center gap-2 px-2 py-2 rounded-lg text-white/60 hover:text-white/80 hover:bg-white/[0.05] transition-all font-serif text-sm"
                            data-testid="nav-my-profile"
                          >
                            <Feather size={14} />
                            My Public Garden
                          </a>
                          {user?.role === "editor" && (
                            <a
                              href="/editor-studio"
                              className="flex items-center gap-2 px-2 py-2 rounded-lg text-amber-400/70 hover:text-amber-400 hover:bg-amber-400/[0.05] transition-all font-serif text-sm"
                              data-testid="nav-editor-studio"
                            >
                              <FileCheck size={14} />
                              Editor Studio
                            </a>
                          )}
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
                        <div className="p-3 border-b border-emerald-900/20">
                          <button
                            onClick={() => setShowA11yPanel(!showA11yPanel)}
                            className="w-full flex items-center justify-between px-2 py-2 rounded-lg text-white/60 hover:text-white/80 hover:bg-white/[0.05] transition-all font-serif text-sm text-left"
                            data-testid="toggle-a11y-panel"
                          >
                            <span className="flex items-center gap-2">
                              <Glasses size={14} />
                              Accessibility
                            </span>
                            <ChevronDown size={12} className={`transition-transform ${showA11yPanel ? "rotate-180" : ""}`} />
                          </button>
                          <AnimatePresence>
                            {showA11yPanel && (
                              <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                exit={{ opacity: 0, height: 0 }}
                                className="overflow-hidden"
                              >
                                <div className="pt-2 space-y-1">
                                  {([
                                    { key: "reducedMotion" as const, label: "Reduce Motion", desc: "Pause animations" },
                                    { key: "highContrast" as const, label: "High Contrast", desc: "Brighter text" },
                                    { key: "largerText" as const, label: "Larger Text", desc: "Increase font size" },
                                    { key: "dyslexiaFont" as const, label: "Dyslexia Font", desc: "Easier to read" },
                                    { key: "widerSpacing" as const, label: "Wider Spacing", desc: "More breathing room" },
                                    { key: "focusMode" as const, label: "Focus Mode", desc: "Remove decorations" },
                                  ]).map((opt) => (
                                    <button
                                      key={opt.key}
                                      onClick={() => toggleA11y(opt.key)}
                                      className="w-full flex items-center justify-between px-2 py-1.5 rounded-lg hover:bg-white/[0.04] transition-all group"
                                      data-testid={`toggle-a11y-${opt.key}`}
                                    >
                                      <div className="text-left">
                                        <p className="font-serif text-xs text-white/65 group-hover:text-white/80 transition-colors">{opt.label}</p>
                                        <p className="font-mono text-[7px] text-white/25 uppercase tracking-widest">{opt.desc}</p>
                                      </div>
                                      <div className={`w-7 h-4 rounded-full border transition-all flex items-center ${
                                        a11y[opt.key]
                                          ? "bg-emerald-500/30 border-emerald-500/50"
                                          : "bg-white/[0.04] border-white/[0.12]"
                                      }`}>
                                        <div className={`w-2.5 h-2.5 rounded-full transition-all ${
                                          a11y[opt.key]
                                            ? "bg-emerald-400 translate-x-3.5"
                                            : "bg-white/30 translate-x-0.5"
                                        }`} />
                                      </div>
                                    </button>
                                  ))}
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
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
          {activeWalk && (
            <div className="mb-6 rounded-2xl border border-violet-500/15 bg-violet-950/[0.08] p-5 text-center max-w-5xl mx-auto" data-testid="editors-walk-banner">
              <div className="flex items-center justify-center gap-2 mb-2">
                <div className="w-2 h-2 rounded-full bg-violet-400/60 animate-pulse" />
                <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-violet-300/70">The Editors Walk</span>
              </div>
              <p className="font-display text-lg font-light italic text-white/70">{activeWalk.title}</p>
              {activeWalk.description && <p className="font-serif text-xs text-white/45 mt-1">{activeWalk.description}</p>}
              <p className="font-mono text-[9px] text-violet-300/50 mt-3">
                Editors are walking through the gardens. Flag up to {activeWalk.flagLimit} pieces during this window.
              </p>
              <p className="font-mono text-[8px] text-white/30 mt-1">
                Ends {new Date(activeWalk.endsAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}
              </p>
            </div>
          )}
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
              ) : activeRoom === "the-desk" ? (
                <TheDeskRoom onBack={() => setActiveRoom(null)} />
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
                  myFlags={myFlags}
                  flagMutation={flagMutation}
                  userTier={userTier}
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
