import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { TreePine } from "lucide-react";

/**
 * GardenGateZone — the writer's public garden: writing they've opened to the world.
 * Extracted from Garden.tsx to allow independent iteration and testing.
 */
export default function GardenGateZone() {
  const { user } = useAuth();
  const { data: writings = [] } = useQuery({
    queryKey: ["/api/writings"],
    enabled: !!user,
  });

  const publicWritings = (writings as any[]).filter(
    (w: any) => w.visibility === "public" || w.visibility === "garden_gate"
  );

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <TreePine size={18} className="text-emerald-400/70" />
          <h2 className="font-display text-xl font-light italic text-white/80">Garden Gate</h2>
        </div>
        <p className="font-serif text-xs text-white/40 italic">
          Writing you've opened to the world. Quiet, shared, unhurried.
        </p>
      </div>

      {publicWritings.length === 0 ? (
        <div className="text-center py-16">
          <TreePine size={32} className="mx-auto mb-4 text-emerald-900/50" />
          <p className="font-serif text-sm text-white/30 italic">
            Nothing has passed through the gate yet.
          </p>
          <p className="font-mono text-[10px] text-white/20 mt-2 tracking-widest uppercase">
            Open a piece from your desk to share it here
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {publicWritings.map((w: any) => (
            <div
              key={w.id}
              className="group p-4 rounded-lg border border-emerald-900/30 bg-emerald-950/20 hover:border-emerald-800/40 transition-all"
            >
              <h3 className="font-serif text-sm text-white/70 italic mb-1">
                {w.title || "Untitled"}
              </h3>
              <p className="font-mono text-[10px] text-white/30 uppercase tracking-widest">
                {w.readiness || "raw seed"}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
