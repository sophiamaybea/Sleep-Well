import { useRoute, Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { BookOpen, ArrowLeft, Feather } from "lucide-react";

type CollectionItem = {
  id: string;
  pieceId: string;
  title: string;
  excerpt?: string | null;
  position: number;
};

type PublicCollectionData = {
  id: string;
  title: string;
  description: string;
  coverNote?: string | null;
  shareSlug: string;
  allowTip: boolean;
  tipAmountPence: number;
  items?: CollectionItem[];
  author?: { username?: string; displayName?: string };
};

export default function PublicCollection() {
  const [, params] = useRoute("/collections/:slug");
  const slug = params?.slug;

  const { data: collection, isLoading, error } = useQuery<PublicCollectionData>({
    queryKey: ["/api/public/collections", slug],
    queryFn: () => apiRequest("GET", `/api/public/collections/${slug}`).then(r => r.json()),
    enabled: !!slug,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center relative z-10" style={{ backgroundColor: "#060d06" }}>
        <p className="font-mono text-[9px] tracking-[0.3em] uppercase text-white/30">Loading collection...</p>
      </div>
    );
  }

  if (error || !collection) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 relative z-10" style={{ backgroundColor: "#060d06" }}>
        <Feather size={24} className="text-white/20" />
        <h1 className="text-white/60 text-lg font-serif">Collection not found</h1>
        <p className="text-white/30 text-sm">This collection may have been moved or made private.</p>
        <Link href="/" className="font-mono text-[10px] tracking-widest uppercase text-amber-400/60 hover:text-amber-400/90 transition-colors">
          Back to home
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative z-10" style={{ backgroundColor: "#060d06" }}>
      <div className="max-w-2xl mx-auto px-6 py-16">
        {/* Header */}
        <div className="mb-12">
          <Link href="/" className="inline-flex items-center gap-2 font-mono text-[9px] tracking-widest uppercase text-white/30 hover:text-white/60 transition-colors mb-8">
            <ArrowLeft size={10} />
            The Page Gallery
          </Link>
          <div className="flex items-start gap-3 mb-6">
            <BookOpen size={16} className="text-violet-400/60 mt-1 shrink-0" />
            <div>
              <h1 className="text-2xl font-serif text-white/90 leading-snug">{collection.title}</h1>
              {collection.author && (
                <p className="font-mono text-[10px] tracking-widest uppercase text-white/30 mt-1">
                  by {collection.author.displayName || collection.author.username || "a writer"}
                </p>
              )}
            </div>
          </div>
          {collection.description && (
            <p className="text-white/50 text-sm leading-relaxed font-serif italic border-l border-white/10 pl-4">
              {collection.description}
            </p>
          )}
          {collection.coverNote && (
            <div className="mt-6 p-4 rounded border border-violet-500/10 bg-violet-900/10">
              <p className="text-white/50 text-xs leading-relaxed">{collection.coverNote}</p>
            </div>
          )}
        </div>

        {/* Items */}
        {collection.items && collection.items.length > 0 ? (
          <div className="space-y-3">
            <p className="font-mono text-[9px] tracking-[0.25em] uppercase text-white/20 mb-6">
              {collection.items.length} {collection.items.length === 1 ? "piece" : "pieces"}
            </p>
            {collection.items.map((item, i) => (
              <Link
                key={item.id}
                href={`/piece/${item.pieceId}`}
                className="block p-4 rounded border border-white/5 hover:border-white/15 bg-white/[0.02] hover:bg-white/[0.04] transition-all group"
              >
                <div className="flex items-center gap-3">
                  <span className="font-mono text-[9px] text-white/20 w-5 text-right shrink-0">{i + 1}</span>
                  <span className="text-white/70 text-sm font-serif group-hover:text-white/90 transition-colors">
                    {item.title}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-white/20 text-sm font-serif italic">This collection is empty.</p>
          </div>
        )}
      </div>
    </div>
  );
}
