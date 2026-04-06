import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import { useState } from "react";
import LoadingScreen from "@/components/garden/LoadingScreen";
import { BookOpen } from "lucide-react";

type WaitlistEntry = {
  id: string;
  name: string;
  email: string;
  genre: string;
  manuscriptType: string;
  estimatedWordCount: number | null;
  brief: string | null;
  status: string;
  sophiaNote: string | null;
  quotedPrice: number | null;
  paymentConfirmed: boolean;
  createdAt: string;
};

export default function EditorialDashboard() {
  const { user, isLoading: authLoading } = useAuth();
  const queryClient = useQueryClient();

  const { data: entries = [], isLoading } = useQuery<WaitlistEntry[]>({
    queryKey: ["/api/editorial-waitlist"],
    enabled: user?.email === "sophiamaybea@gmail.com",
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, ...data }: { id: string; [key: string]: any }) =>
      apiRequest("PATCH", `/api/editorial-waitlist/${id}`, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["/api/editorial-waitlist"] }),
  });

  // Show loading screen while auth or data is resolving
  if (authLoading) return <LoadingScreen />;

  if (user?.email !== "sophiamaybea@gmail.com") {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <p className="font-serif text-foreground/40 italic">Not authorized.</p>
      </div>
    );
  }

  // Data is loading after auth confirms the user is authorized
  if (isLoading) return <LoadingScreen />;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="max-w-5xl mx-auto px-6 py-12">
        <h1 className="font-display text-3xl font-light mb-2">Editorial Waitlist</h1>
        <p className="font-mono text-xs uppercase tracking-widest text-accent-ornament/60 mb-8">{entries.length} {entries.length === 1 ? "entry" : "entries"}</p>

        {entries.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <BookOpen size={40} className="text-foreground/10 mb-6" />
            <p className="font-display text-xl font-light text-foreground/30 italic mb-2">No enquiries yet</p>
            <p className="font-serif text-sm text-foreground/20">Submissions from writers will appear here once they arrive.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {entries.map((entry) => (
              <EntryCard key={entry.id} entry={entry} onUpdate={(data) => updateMutation.mutate({ id: entry.id, ...data })} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function EntryCard({ entry, onUpdate }: { entry: WaitlistEntry; onUpdate: (data: any) => void }) {
  const [note, setNote] = useState(entry.sophiaNote || "");
  const [price, setPrice] = useState(entry.quotedPrice?.toString() || "");

  const paymentUrl = `${window.location.origin}/editorial-payment?id=${entry.id}`;

  const statusColors: Record<string, string> = {
    pending: "text-foreground/40",
    reviewing: "text-accent-ornament/80",
    invited: "text-garden-bloom/80",
    paid: "text-garden-bloom",
    in_progress: "text-accent-ornament",
    completed: "text-garden-bloom",
    declined: "text-red-400/60",
  };

  return (
    <div className="glass-panel rounded-xl p-6 space-y-4">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-display text-lg font-light">{entry.name}</h3>
          <p className="font-mono text-xs text-foreground/40 mt-0.5">{entry.email}</p>
        </div>
        <div className="flex items-center gap-3">
          {entry.paymentConfirmed && (
            <span className="px-2 py-0.5 rounded-full bg-garden-bloom/10 text-garden-bloom font-mono text-[10px] uppercase tracking-widest">Paid</span>
          )}
          <select
            value={entry.status}
            onChange={(e) => onUpdate({ status: e.target.value })}
            className={`bg-background border border-foreground/10 rounded px-3 py-1 font-mono text-xs focus:outline-none focus:border-accent-ornament/40 transition-colors ${statusColors[entry.status] ?? "text-foreground/60"}`}
            aria-label="Update status"
          >
            <option value="pending">Pending</option>
            <option value="reviewing">Reviewing</option>
            <option value="invited">Invited</option>
            <option value="paid">Paid</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="declined">Declined</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 text-xs text-foreground/60 font-mono">
        <div><span className="text-foreground/30 uppercase tracking-widest">Genre</span><br />{entry.genre}</div>
        <div><span className="text-foreground/30 uppercase tracking-widest">Type</span><br />{entry.manuscriptType}</div>
        <div><span className="text-foreground/30 uppercase tracking-widest">Words</span><br />{entry.estimatedWordCount?.toLocaleString() || "—"}</div>
      </div>

      {entry.brief && <p className="font-serif text-sm text-foreground/60 italic border-l-2 border-foreground/10 pl-3">{entry.brief}</p>}

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block font-mono text-[10px] uppercase tracking-widest text-foreground/30 mb-1">Private note</label>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            onBlur={() => onUpdate({ sophiaNote: note })}
            rows={2}
            className="w-full bg-transparent border border-foreground/10 rounded-lg px-3 py-2 font-serif text-sm text-foreground resize-none focus:outline-none focus:border-accent-ornament/40 transition-colors"
            placeholder="Notes visible only to you…"
          />
        </div>
        <div>
          <label className="block font-mono text-[10px] uppercase tracking-widest text-foreground/30 mb-1">Quoted price (GBP)</label>
          <input
            type="number"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            onBlur={() => price && onUpdate({ quotedPrice: parseInt(price) })}
            className="w-full bg-transparent border border-foreground/10 rounded-lg px-3 py-2 font-mono text-sm text-foreground focus:outline-none focus:border-accent-ornament/40 transition-colors"
            placeholder="0"
          />
        </div>
      </div>

      {entry.status === "invited" && entry.quotedPrice && (
        <div className="flex items-center gap-3">
          <input
            readOnly
            value={paymentUrl}
            className="flex-1 bg-foreground/[0.03] border border-foreground/10 rounded-lg px-3 py-2 font-mono text-xs text-foreground/40 select-all"
            aria-label="Payment link"
          />
          <button
            onClick={() => navigator.clipboard.writeText(paymentUrl)}
            className="bg-accent-ornament/15 hover:bg-accent-ornament/25 border border-accent-ornament/20 text-accent-ornament px-4 py-2 rounded-lg font-mono text-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-ornament"
          >
            Copy link
          </button>
        </div>
      )}

      <p className="font-mono text-[10px] text-foreground/20">Joined {new Date(entry.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}</p>
    </div>
  );
}
