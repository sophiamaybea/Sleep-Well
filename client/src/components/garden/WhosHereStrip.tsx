import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { TendButton } from "./SocialFeatures";

type PresenceEntry = {
  userId: string;
  userName: string;
  zone: string;
};

const zoneLabel: Record<string, string> = {
  desk: "writing",
  "reading-room": "reading",
  greenhouse: "practising",
  submissions: "submitting",
  "garden-gate": "at the gate",
  collections: "in their beds",
};

export function WhosHereStrip() {
  const { data: presence = [] } = useQuery<PresenceEntry[]>({
    queryKey: ["/api/garden/presence/active"],
    queryFn: async () => {
      const res = await fetch("/api/garden/presence/active", { credentials: "include" });
      if (!res.ok) return [];
      return res.json();
    },
    refetchInterval: 30000,
  });

  if (presence.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-6 px-4 py-3 rounded-2xl border border-emerald-800/15 bg-emerald-950/10"
      data-testid="whos-here-strip"
    >
      <span className="font-mono text-[8px] uppercase tracking-[0.3em] text-emerald-400/40 block mb-2">
        In the garden now
      </span>
      <div className="flex flex-wrap gap-4">
        {presence.slice(0, 6).map((p) => (
          <div key={p.userId} className="flex items-center gap-2 group">
            <div className="relative">
              <div className="w-6 h-6 rounded-full bg-emerald-900/40 border border-emerald-700/20 flex items-center justify-center font-mono text-[9px] text-emerald-300/60 uppercase">
                {p.userName?.[0] || "?"}
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-400/60 border border-popover" />
            </div>
            <div className="min-w-0">
              <span className="font-serif text-xs text-white/60 block truncate max-w-[80px]">
                {p.userName}
              </span>
              <span className="font-mono text-[7px] uppercase tracking-widest text-white/25">
                {zoneLabel[p.zone] || p.zone}
              </span>
            </div>
            <div className="opacity-0 group-hover:opacity-100 transition-opacity">
              <TendButton gardenerId={p.userId} size="sm" />
            </div>
          </div>
        ))}
        {presence.length > 6 && (
          <span className="font-mono text-[8px] text-white/25 self-center">
            +{presence.length - 6} more
          </span>
        )}
      </div>
    </motion.div>
  );
}
