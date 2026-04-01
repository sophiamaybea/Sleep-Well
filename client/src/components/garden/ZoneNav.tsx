import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sprout, Glasses, TreePine, Send, BookOpen,
  Users, Compass, ChevronDown, Eye, PenLine, X,
} from "lucide-react";

export type Zone = "desk" | "reading-room" | "greenhouse" | "submissions" | "garden-gate" | "collections";
export type ActiveRoom = "tables" | "workshop" | "swap" | "the-desk" | "first-reader" | "shelf" | null;

export const rooms = [
  { id: "tables", label: "Tables", icon: <Users size={13} />, desc: "Community discussions", comingSoon: false },
  { id: "workshop", label: "Workshop", icon: <BookOpen size={13} />, desc: "Writing exercises", comingSoon: false },
  { id: "the-desk", label: "The Desk", icon: <PenLine size={13} />, desc: "Shared writing space", comingSoon: false },
  { id: "swap", label: "Swap", icon: <Eye size={13} />, desc: "Beta reading exchange", comingSoon: false },
  { id: "first-reader", label: "First Reader", icon: <Eye size={13} />, desc: "Drop fresh writing, get honest first impressions", comingSoon: false },
  { id: "shelf", label: "Reading Shelf", icon: <BookOpen size={13} />, desc: "What the community is reading", comingSoon: false },
];

export function ZoneNav({ active, onChange }: { active: Zone; onChange: (z: Zone) => void }) {
  const zones: { id: Zone; label: string; desc: string; icon: React.ReactNode; activeColor: string }[] = [
    { id: "desk", label: "Write", desc: "Private soil for your seeds", icon: <Sprout size={14} />, activeColor: "border-amber-600/25 bg-amber-900/20 text-amber-200/90" },
    { id: "reading-room", label: "Read", desc: "The public garden — what blooms here, others can tend", icon: <Glasses size={14} />, activeColor: "border-emerald-600/25 bg-emerald-900/20 text-emerald-200/90" },
    { id: "greenhouse", label: "Practice", desc: "A sheltered bed for practice and growth", icon: <TreePine size={14} />, activeColor: "border-teal-600/25 bg-teal-900/20 text-teal-200/90" },
    { id: "submissions", label: "Publish", desc: "Where your harvest reaches the world", icon: <Send size={14} />, activeColor: "border-amber-600/25 bg-amber-900/20 text-amber-200/90" },
    { id: "garden-gate", label: "Gate", desc: "Your public garden — writing you've opened to the world", icon: <TreePine size={14} />, activeColor: "border-emerald-500/25 bg-emerald-900/20 text-emerald-200/90" },
    { id: "collections", label: "Beds", desc: "Curate your work into chapbook collections", icon: <BookOpen size={14} />, activeColor: "border-violet-500/25 bg-violet-900/20 text-violet-200/90" },
  ];
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="inline-flex gap-1 p-1.5 rounded-full border border-emerald-800/20 bg-emerald-950/20 backdrop-blur-xl max-w-[calc(100vw-2rem)] overflow-x-auto scrollbar-hide">
        {zones.map((z) => (
          <button
            key={z.id}
            onClick={() => onChange(z.id)}
            className={`relative flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-full font-mono text-[10px] uppercase tracking-[0.15em] sm:tracking-[0.2em] transition-all whitespace-nowrap ${
              active === z.id ? "text-white/90" : "text-white/90 hover:text-white/90"
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

export function RoomsStrip({ activeRoom, onSelectRoom }: { activeRoom: ActiveRoom; onSelectRoom: (room: ActiveRoom) => void }) {
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
              ? "border-white/20 bg-white/[0.06] text-white/90"
              : "border-emerald-800/12 text-white/90 hover:text-white/90 hover:border-emerald-700/20"
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
                        : "border-white/[0.06] text-white/90 hover:text-white/90 hover:border-white/15 hover:bg-white/[0.03]"
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
