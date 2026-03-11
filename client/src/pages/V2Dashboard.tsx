import V2Layout from "@/components/V2Layout";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";

interface GardenPiece {
  id: number;
  title: string;
  stage: "seed" | "growing" | "bloomed";
  wordCount: number;
  editedAt: string;
  tags: string[];
}

export default function V2Dashboard() {
  const { isAuthenticated } = useAuth();

  const { data: pieces = [] } = useQuery<GardenPiece[]>({
    queryKey: ["/api/garden/pieces"],
    queryFn: async () => {
      const res = await fetch("/api/garden/pieces", { credentials: "include" });
      if (!res.ok) return [];
      return res.json();
    },
    enabled: isAuthenticated,
  });

  const seeds = pieces.filter((p) => p.stage === "seed");
  const growing = pieces.filter((p) => p.stage === "growing");
  const bloomed = pieces.filter((p) => p.stage === "bloomed");

  const stageIcon = (stage: string) => {
    switch (stage) {
      case "seed": return "\uD83C\uDF31";
      case "growing": return "\uD83C\uDF3F";
      case "bloomed": return "\uD83C\uDF38";
      default: return "\uD83C\uDF31";
    }
  };

  const stageBadgeClass = (stage: string) => {
    switch (stage) {
      case "seed": return "bg-[var(--color-muted)] text-[var(--color-muted-foreground)]";
      case "growing": return "bg-emerald-900/50 text-emerald-300";
      case "bloomed": return "bg-pink-900/50 text-pink-300";
      default: return "bg-[var(--color-muted)] text-[var(--color-muted-foreground)]";
    }
  };

  // Collect recurring tags
  const tagCounts: Record<string, number> = {};
  pieces.forEach((p) => p.tags?.forEach((t) => {
    tagCounts[t] = (tagCounts[t] || 0) + 1;
  }));
  const recurringThreads = Object.entries(tagCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  return (
    <V2Layout activeTab="garden">
      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Today's Prompt */}
        <div className="bg-[var(--color-card)] border border-[var(--color-border)] rounded-lg p-6 mb-8">
          <div className="text-xs font-mono tracking-widest text-[var(--color-accent)] mb-3">TODAY'S PROMPT</div>
          <p className="font-display text-xl italic text-[var(--color-foreground)] mb-4">
            "Write from the perspective of an object in your room."
          </p>
          <div className="flex items-center gap-4">
            <Link href="/garden">
              <a className="px-5 py-2.5 bg-[var(--color-accent)] text-[var(--color-accent-foreground)] rounded-full text-sm font-medium hover:opacity-90 transition-opacity">
                Start Writing
              </a>
            </Link>
            <span className="text-sm text-[var(--color-muted-foreground)] cursor-pointer hover:text-[var(--color-foreground)]">
              See all 100 prompts &rarr;
            </span>
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          <div className="bg-[var(--color-card)] border border-[var(--color-border)] rounded-lg p-4">
            <div className="flex items-center gap-2 text-[var(--color-accent)] mb-2">
              <span>\uD83C\uDF31</span>
              <span className="text-sm font-medium">7-day streak</span>
            </div>
            <div className="flex gap-1 mb-2">
              {[1,2,3,4,5,6,7].map((d) => (
                <div key={d} className="w-6 h-6 rounded-full bg-emerald-800/50 flex items-center justify-center text-emerald-300 text-[10px]">\u2713</div>
              ))}
            </div>
            <div className="text-xs text-[var(--color-muted-foreground)]">2,847 words this week</div>
          </div>
          <div className="bg-[var(--color-card)] border border-[var(--color-border)] rounded-lg p-4">
            <div className="text-2xl font-display font-bold">{seeds.length || 12}</div>
            <div className="text-sm text-[var(--color-muted-foreground)]">Seeds (drafts)</div>
          </div>
          <div className="bg-[var(--color-card)] border border-[var(--color-border)] rounded-lg p-4">
            <div className="text-2xl font-display font-bold">{growing.length || 5}</div>
            <div className="text-sm text-[var(--color-muted-foreground)]">Growing</div>
          </div>
          <div className="bg-[var(--color-card)] border border-[var(--color-border)] rounded-lg p-4">
            <div className="text-2xl font-display font-bold">{bloomed.length || 3}</div>
            <div className="text-sm text-[var(--color-muted-foreground)]">Bloomed</div>
          </div>
        </div>

        {/* Main content: Desk + Recurring Threads */}
        <div className="grid grid-cols-3 gap-8">
          {/* Your Desk - 2 cols */}
          <div className="col-span-2">
            <h2 className="font-display text-xl mb-4">Your Desk</h2>
            <div className="space-y-3">
              {(pieces.length > 0 ? pieces : [
                { id: 1, title: "Untitled Fragment", stage: "seed", wordCount: 142, editedAt: "Edited 2h ago", tags: ["grief", "morning"] },
                { id: 2, title: "Letters to the Kitchen Table", stage: "growing", wordCount: 890, editedAt: "Edited yesterday", tags: ["home", "memory"] },
                { id: 3, title: "What the Tide Returns", stage: "bloomed", wordCount: 1204, editedAt: "Published Mar 8", tags: ["sea", "letting go"] },
                { id: 4, title: "Morning Ritual, Version Three", stage: "growing", wordCount: 456, editedAt: "Edited 3 days ago", tags: ["morning", "ritual"] },
                { id: 5, title: "The Argument with Silence", stage: "seed", wordCount: 67, editedAt: "Edited 5 days ago", tags: ["grief"] },
              ] as GardenPiece[]).map((piece) => (
                <div
                  key={piece.id}
                  className="bg-[var(--color-card)] border border-[var(--color-border)] rounded-lg p-4 hover:border-[var(--color-accent)] transition-colors cursor-pointer"
                >
                  <div className="flex items-start gap-3">
                    <span className="text-lg">{stageIcon(piece.stage)}</span>
                    <div className="flex-1">
                      <div className="font-medium mb-1">{piece.title}</div>
                      <div className="flex items-center gap-3 text-xs text-[var(--color-muted-foreground)]">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${stageBadgeClass(piece.stage)}`}>
                          {piece.stage.charAt(0).toUpperCase() + piece.stage.slice(1)}
                        </span>
                        <span>{piece.wordCount} words</span>
                        <span>{piece.editedAt}</span>
                        {piece.tags?.map((tag) => (
                          <span key={tag} className="px-2 py-0.5 rounded-full bg-[var(--color-muted)] text-[10px]">{tag}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recurring Threads - 1 col */}
          <div>
            <h3 className="font-display text-lg mb-4">Recurring Threads</h3>
            <div className="space-y-4">
              {(recurringThreads.length > 0 ? recurringThreads : [
                ["grief", 4], ["morning", 3], ["sea", 2], ["home", 2], ["memory", 1]
              ] as [string, number][]).map(([tag, count]) => (
                <div key={tag} className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium">{tag}</div>
                    <div className="w-8 h-0.5 bg-[var(--color-accent)] mt-1" />
                  </div>
                  <span className="text-xs text-[var(--color-muted-foreground)]">
                    {count} {Number(count) === 1 ? "piece" : "pieces"}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </V2Layout>
  );
}