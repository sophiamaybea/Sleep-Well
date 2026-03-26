import { useEffect, useState, useCallback } from "react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Bookmark, BookmarkX, BookOpen } from "lucide-react";
import { stripHtml } from "@/components/garden/RichEditor";
import LoadingScreen from "@/components/garden/LoadingScreen";

const LS_KEY = "tpg_saved_pieces";

function getSavedIds(): string[] {
  try {
    return JSON.parse(localStorage.getItem(LS_KEY) ?? "[]");
  } catch {
    return [];
  }
}

function removeFromSaved(id: string) {
  const current = getSavedIds();
  localStorage.setItem(LS_KEY, JSON.stringify(current.filter((s) => s !== id)));
}

function getReadingTime(content: string): number {
  const words = stripHtml(content).split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 200));
}

interface PieceMeta {
  id: string;
  title: string;
  content: string;
  genre: string;
  authorName: string | null;
  author?: { displayName: string } | null;
}

function SavedPieceCard({ id, onRemove }: { id: string; onRemove: (id: string) => void }) {
  const { data: piece, isLoading, isError } = useQuery<PieceMeta>({
    queryKey: ["/api/public-piece", id],
    queryFn: async () => {
      const res = await fetch(`/api/public-piece/${id}`);
      if (!res.ok) throw new Error("not found");
      return res.json();
    },
    retry: false,
  });

  if (isLoading) {
    return (
      <div className="border border-[#e8e0d5] rounded-lg p-5 animate-pulse">
        <div className="h-4 bg-[#e8e0d5] rounded w-3/4 mb-3" />
        <div className="h-3 bg-[#e8e0d5] rounded w-1/2" />
      </div>
    );
  }

  if (isError || !piece) {
    return (
      <div className="border border-[#e8e0d5] rounded-lg p-5 flex items-center justify-between">
        <p className="text-[#b0a090] font-serif text-sm italic">This piece is no longer available.</p>
        <button
          onClick={() => onRemove(id)}
          aria-label="Remove from saved"
          className="text-[#b0a090] hover:text-[#8B7355] transition-colors ml-4"
        >
          <BookmarkX className="w-4 h-4" />
        </button>
      </div>
    );
  }

  const authorName = piece.author?.displayName || piece.authorName || "Anonymous";
  const readingTime = getReadingTime(piece.content || "");

  return (
    <div className="group border border-[#e8e0d5] rounded-lg p-5 hover:border-[#d4c4a8] hover:bg-[#f5f0ea] transition-all duration-200">
      <div className="flex items-start justify-between gap-4">
        <Link href={`/piece/${piece.id}`} className="flex-1 min-w-0">
          <div>
            {piece.genre && (
              <span className="inline-block text-[10px] font-medium text-[#8B7355] uppercase tracking-widest border border-[#d4c4a8] rounded-full px-2.5 py-0.5 mb-2">
                {piece.genre}
              </span>
            )}
            <h2 className="font-serif text-[#4a3728] text-lg leading-snug mb-1 group-hover:text-[#3a2a1a] transition-colors">
              {piece.title}
            </h2>
            <div className="flex items-center gap-2 text-xs text-[#8B7355] font-serif">
              <span>by {authorName}</span>
              <span className="text-[#d4c4a8]">·</span>
              <span className="flex items-center gap-1">
                <BookOpen className="w-3 h-3" />
                {readingTime} min
              </span>
            </div>
          </div>
        </Link>
        <button
          onClick={() => onRemove(piece.id)}
          aria-label="Remove from saved"
          className="flex-shrink-0 text-[#d4c4a8] hover:text-[#8B7355] transition-colors mt-0.5"
        >
          <BookmarkX className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

export default function Saved() {
  const [savedIds, setSavedIds] = useState<string[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setSavedIds(getSavedIds());
    setLoaded(true);
  }, []);

  const handleRemove = useCallback((id: string) => {
    removeFromSaved(id);
    setSavedIds((prev) => prev.filter((s) => s !== id));
  }, []);

  if (!loaded) {
    return <LoadingScreen variant="light" />;
  }

  return (
    <div className="min-h-screen bg-[#faf8f5]">
      {/* Header nav */}
      <div className="border-b border-[#e8e0d5] bg-[#faf8f5]/95 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/in-bloom">
            <button className="inline-flex items-center gap-2 text-[#8B7355] hover:text-[#4a3728] transition-colors font-serif text-sm">
              <ArrowLeft className="w-4 h-4" />
              In Bloom
            </button>
          </Link>
          <div className="flex items-center gap-1.5 text-[#8B7355]/60 font-serif text-sm">
            <Bookmark className="w-3.5 h-3.5" />
            <span>Saved</span>
          </div>
        </div>
      </div>

      <main className="max-w-2xl mx-auto px-6 py-12">
        <div className="mb-10">
          <h1 className="font-serif text-3xl text-[#4a3728] mb-2">Saved Pieces</h1>
          <p className="text-[#8B7355] font-serif text-sm">
            {savedIds.length === 0
              ? "Nothing saved yet."
              : `${savedIds.length} piece${savedIds.length === 1 ? "" : "s"} saved to this device.`}
          </p>
        </div>

        {savedIds.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-5xl mb-6">🌿</div>
            <p className="font-serif text-[#8B7355] mb-6 leading-relaxed">
              Browse In Bloom and save pieces to return to them later.
            </p>
            <Link href="/in-bloom">
              <button className="inline-flex items-center gap-2 bg-[#4a3728] text-[#faf8f5] px-6 py-3 rounded-lg font-serif text-sm hover:bg-[#3a2a1a] transition-colors">
                Browse In Bloom
              </button>
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {savedIds.map((id) => (
              <SavedPieceCard key={id} id={id} onRemove={handleRemove} />
            ))}
          </div>
        )}

        {savedIds.length > 0 && (
          <p className="text-center text-xs text-[#b0a090] font-serif mt-8">
            Saved pieces are stored on this device only.
          </p>
        )}
      </main>
    </div>
  );
}
