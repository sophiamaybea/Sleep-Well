import { useEffect, useState, useCallback, useMemo } from "react";
import { useParams, Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Share2, BookOpen, Bookmark, BookmarkCheck, ChevronRight, ChevronLeft } from "lucide-react";
import { ContentRenderer, stripHtml } from "@/components/garden/RichEditor";
import LoadingScreen from "@/components/garden/LoadingScreen";

interface PieceData {
  id: string;
  title: string;
  content: string;
  genre: string;
  authorName: string | null;
  authorBio: string | null;
  publishedAt: string | null;
  authorId?: string;
  description?: string;
  tags?: string[];
  createdAt?: string;
  author?: {
    id: string;
    displayName: string;
    bio: string | null;
    profileImageUrl: string | null;
  } | null;
}

interface Comment {
  id: string;
  authorName: string | null;
  content: string;
  createdAt: string | null;
}

function getReadingTime(content: string): number {
  const words = stripHtml(content).split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 200));
}

function upsertOgMeta(property: string, content: string): () => void {
  let tag = document.querySelector<HTMLMetaElement>(`meta[property="${property}"]`);
  const existed = !!tag;
  const previous = tag?.getAttribute("content") ?? null;
  if (!tag) {
    tag = document.createElement("meta");
    tag.setAttribute("property", property);
    document.head.appendChild(tag);
  }
  tag.setAttribute("content", content);
  return () => {
    const el = document.querySelector<HTMLMetaElement>(`meta[property="${property}"]`);
    if (!el) return;
    if (!existed) el.remove();
    else if (previous !== null) el.setAttribute("content", previous);
  };
}

// ─── JSON-LD helper ───────────────────────────────────────────────────────────

const JSONLD_ID = "tpg-article-jsonld";

function upsertJsonLd(data: Record<string, unknown>): () => void {
  let script = document.getElementById(JSONLD_ID) as HTMLScriptElement | null;
  const existed = !!script;
  if (!script) {
    script = document.createElement("script");
    script.id = JSONLD_ID;
    script.type = "application/ld+json";
    document.head.appendChild(script);
  }
  script.textContent = JSON.stringify(data);
  return () => {
    const el = document.getElementById(JSONLD_ID);
    if (!el) return;
    if (!existed) el.remove();
    else el.textContent = "";
  };
}

// ─── localStorage bookmark helpers ────────────────────────────────────────────

const LS_KEY = "tpg_saved_pieces";

function getSavedPieces(): string[] {
  try {
    return JSON.parse(localStorage.getItem(LS_KEY) ?? "[]");
  } catch {
    return [];
  }
}

function toggleSavedPiece(pieceId: string): boolean {
  const saved = getSavedPieces();
  const idx = saved.indexOf(pieceId);
  if (idx === -1) {
    localStorage.setItem(LS_KEY, JSON.stringify([...saved, pieceId]));
    return true;
  } else {
    localStorage.setItem(LS_KEY, JSON.stringify(saved.filter((id) => id !== pieceId)));
    return false;
  }
}

// ─── BookmarkButton component ─────────────────────────────────────────────────

function BookmarkButton({ pieceId, size = "default" }: { pieceId: string; size?: "default" | "large" }) {
  const [isSaved, setIsSaved] = useState(false);
  const [justSaved, setJustSaved] = useState(false);

  useEffect(() => {
    setIsSaved(getSavedPieces().includes(pieceId));
  }, [pieceId]);

  const handleToggle = useCallback(() => {
    const nowSaved = toggleSavedPiece(pieceId);
    setIsSaved(nowSaved);
    if (nowSaved) {
      setJustSaved(true);
      setTimeout(() => setJustSaved(false), 1800);
    }
  }, [pieceId]);

  const isLarge = size === "large";

  if (isLarge) {
    return (
      <button
        onClick={handleToggle}
        data-testid="bookmark-button-large"
        aria-label={isSaved ? "Remove from saved pieces" : "Save this piece"}
        className={`
          inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full
          border font-serif text-sm transition-all duration-300
          ${
            isSaved
              ? "border-[#b09070] bg-[#f0e8dc] text-[#4a3728]"
              : "border-[#d4c4a8] bg-transparent text-[#8B7355] hover:border-[#b09070] hover:text-[#4a3728]"
          }
        `}
      >
        {isSaved ? (
          <BookmarkCheck className="w-4 h-4 flex-shrink-0" />
        ) : (
          <Bookmark className="w-4 h-4 flex-shrink-0" />
        )}
        <span>
          {justSaved ? "Saved" : isSaved ? "Saved to your list" : "Save this piece"}
        </span>
      </button>
    );
  }

  return (
    <button
      onClick={handleToggle}
      data-testid="bookmark-button"
      aria-label={isSaved ? "Remove from saved pieces" : "Save this piece"}
      className={`
        inline-flex items-center gap-1.5 font-serif text-sm transition-colors
        ${
          isSaved
            ? "text-[#4a3728]"
            : "text-[#8B7355] hover:text-[#4a3728]"
        }
      `}
    >
      {isSaved ? (
        <BookmarkCheck className="w-4 h-4 flex-shrink-0" />
      ) : (
        <Bookmark className="w-4 h-4 flex-shrink-0" />
      )}
      <span className="hidden sm:inline">
        {justSaved ? "Saved" : isSaved ? "Saved" : "Save"}
      </span>
    </button>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function Piece() {
  const { id } = useParams<{ id: string }>();

  useEffect(() => {
    if (id) {
      const url = `/piece/${id}`;
      if (window.location.pathname !== url) {
        window.history.replaceState(null, "", url);
      }
    }
  }, [id]);

  // Keep body scroll available while in long-form reading content
  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "auto";
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, []);

  const { data: allPublished = [] } = useQuery<PieceData[]>({
    queryKey: ["/api/gallery"],
    queryFn: async () => {
      const res = await fetch("/api/gallery");
      if (!res.ok) return [];
      return res.json();
    },
  });

  const sortedPublishedPieces = useMemo(() => {
    const list = [...allPublished];
    list.sort((a, b) => {
      const dateA = new Date(a.publishedAt || a.createdAt || "").getTime();
      const dateB = new Date(b.publishedAt || b.createdAt || "").getTime();
      return dateB - dateA;
    });
    return list;
  }, [allPublished]);

  const currentIndex = sortedPublishedPieces.findIndex((item) => item.id === id);
  const previousPiece = currentIndex > 0 ? sortedPublishedPieces[currentIndex - 1] : null;
  const nextPiece = currentIndex >= 0 && currentIndex < sortedPublishedPieces.length - 1 ? sortedPublishedPieces[currentIndex + 1] : null;

  const { data: piece, isLoading, isError } = useQuery<PieceData>({
    queryKey: ["/api/public-piece", id],
    queryFn: async () => {
      const res = await fetch(`/api/public-piece/${id}`);
      if (!res.ok) throw new Error("Piece not found");
      return res.json();
    },
    enabled: !!id,
    retry: false,
  });

  useEffect(() => {
    if (!piece?.title) return;

    const pageTitle = `${piece.title} | The Page Gallery`;
    const previousTitle = document.title;
    document.title = pageTitle;

    const rawText = stripHtml(piece.content || "");
    const ogDescription = (piece.description || rawText).slice(0, 160).trim();
    const canonicalUrl = `${window.location.origin}/piece/${piece.id}`;

    const cleanups = [
      upsertOgMeta("og:title", piece.title),
      upsertOgMeta("og:description", ogDescription),
      upsertOgMeta("og:url", canonicalUrl),
      upsertOgMeta("og:type", "article"),
      upsertJsonLd({
        "@context": "https://schema.org",
        "@type": "Article",
        headline: piece.title,
        description: ogDescription,
        url: canonicalUrl,
        author: {
          "@type": "Person",
          name: piece.author?.displayName || piece.authorName || "Anonymous",
        },
        publisher: {
          "@type": "Organization",
          name: "The Page Gallery",
          url: window.location.origin,
        },
        ...(piece.publishedAt ? { datePublished: piece.publishedAt } : {}),
        ...(piece.createdAt ? { dateCreated: piece.createdAt } : {}),
        ...(piece.tags && piece.tags.length > 0 ? { keywords: piece.tags.join(", ") } : {}),
        mainEntityOfPage: {
          "@type": "WebPage",
          "@id": canonicalUrl,
        },
      }),
    ];

    return () => {
      document.title = previousTitle;
      cleanups.forEach((fn) => fn());
    };
  }, [piece?.title, piece?.content, piece?.id, piece?.description, piece?.publishedAt, piece?.createdAt, piece?.tags, piece?.author, piece?.authorName]);

  const { data: comments = [] } = useQuery<Comment[]>({
    queryKey: ["/api/gallery-comments", id],
    queryFn: async () => {
      const res = await fetch(`/api/gallery-comments/${id}`);
      if (!res.ok) return [];
      return res.json();
    },
    enabled: !!id,
  });

  // T35: replace raw border-t-transparent spinner with branded LoadingScreen (light variant)
  if (isLoading) {
    return <LoadingScreen variant="light" />;
  }

  if (isError || !piece) {
    return (
      <div className="min-h-screen bg-[#faf8f5] flex items-center justify-center relative z-10">
        <div className="text-center max-w-md px-6">
          <div className="text-6xl mb-6">🌿</div>
          <h1 className="text-2xl font-serif text-[#4a3728] mb-3">This page has wandered off</h1>
          <p className="text-[#8B7355] mb-8 leading-relaxed">
            The piece you're looking for may have moved, or it's not available publicly.
          </p>
          <Link href="/in-bloom">
            <button className="inline-flex items-center gap-2 bg-[#4a3728] text-[#faf8f5] px-6 py-3 rounded-lg font-serif hover:bg-[#3a2a1a] transition-colors">
              <ArrowLeft className="w-4 h-4" />
              Back to In Bloom
            </button>
          </Link>
        </div>
      </div>
    );
  }

  const authorDisplayName = piece.author?.displayName || piece.authorName || "Anonymous";
  const authorBio = piece.author?.bio || piece.authorBio;
  const readingTime = getReadingTime(piece.content || "");

  const canonicalUrl = `${window.location.origin}/piece/${piece.id}`;

  const handleShare = async () => {
    if (navigator.share) {
      try { await navigator.share({ title: piece.title, url: canonicalUrl }); } catch {}
    } else {
      await navigator.clipboard.writeText(canonicalUrl);
      alert("Link copied to clipboard!");
    }
  };

  return (
    <div className="min-h-screen bg-[#faf8f5] relative z-10">
      {/* Sticky top nav */}
      <div className="border-b border-[#e8e0d5] bg-[#faf8f5]/95 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/in-bloom">
            <button className="inline-flex items-center gap-2 text-[#8B7355] hover:text-[#4a3728] transition-colors font-serif text-sm">
              <ArrowLeft className="w-4 h-4" />
              In Bloom
            </button>
          </Link>

          <div className="flex items-center gap-5">
            <BookmarkButton pieceId={id!} />
            <button
              onClick={handleShare}
              className="inline-flex items-center gap-1.5 text-[#8B7355] hover:text-[#4a3728] transition-colors font-serif text-sm"
              data-testid="button-share"
            >
              <Share2 className="w-4 h-4" />
              <span className="hidden sm:inline">Share</span>
            </button>
          </div>
        </div>

        <div className="max-w-3xl mx-auto px-6 py-2 flex items-center justify-between gap-2 text-sm">
          {previousPiece ? (
            <Link href={`/piece/${previousPiece.id}`} className="inline-flex items-center gap-1 text-[#4a3728] hover:text-[#1e221f] transition-colors font-serif">
              <ChevronLeft className="w-4 h-4" /> Previous
            </Link>
          ) : (
            <span className="text-[#a19a8f]">Previous</span>
          )}

          {nextPiece ? (
            <Link href={`/piece/${nextPiece.id}`} className="inline-flex items-center gap-1 text-[#4a3728] hover:text-[#1e221f] transition-colors font-serif">
              Next <ChevronRight className="w-4 h-4" />
            </Link>
          ) : (
            <span className="text-[#a19a8f]">Next</span>
          )}
        </div>
      </div>

      {/* Main content */}
      <main className="max-w-3xl mx-auto px-6 py-12">
        {piece.genre && (
          <div className="mb-6">
            <span className="inline-block text-xs font-medium text-[#8B7355] uppercase tracking-widest border border-[#d4c4a8] rounded-full px-3 py-1">
              {piece.genre}
            </span>
          </div>
        )}

        <h1 className="text-3xl md:text-4xl font-serif text-[#4a3728] leading-tight mb-4">
          {piece.title}
        </h1>

        <div className="flex items-center gap-3 text-sm text-[#8B7355] mb-10 font-serif">
          <span>by {authorDisplayName}</span>
          <span className="text-[#d4c4a8]">·</span>
          <span className="flex items-center gap-1">
            <BookOpen className="w-3.5 h-3.5" />
            {readingTime} min read
          </span>
        </div>

        <article className="prose prose-stone max-w-none font-serif text-[#4a3728] leading-relaxed text-lg">
          <ContentRenderer content={piece.content} />
        </article>

        <div className="mt-10 flex justify-center" data-testid="bookmark-cta-section">
          <BookmarkButton pieceId={id!} size="large" />
        </div>

        {piece.tags && piece.tags.length > 0 && (
          <div className="mt-8 flex flex-wrap gap-2">
            {piece.tags.map((tag) => (
              <span
                key={tag}
                className="text-xs text-[#8B7355] border border-[#e8e0d5] rounded-full px-3 py-1"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

        {authorBio && (
          <div className="mt-12 pt-8 border-t border-[#e8e0d5]">
            <div className="flex items-start gap-4">
              {piece.author?.profileImageUrl && (
                <img
                  src={piece.author.profileImageUrl}
                  alt={authorDisplayName}
                  className="w-12 h-12 rounded-full object-cover flex-shrink-0"
                />
              )}
              <div>
                <p className="font-serif font-medium text-[#4a3728] mb-1">{authorDisplayName}</p>
                <p className="text-sm text-[#8B7355] leading-relaxed font-serif">{authorBio}</p>
              </div>
            </div>
          </div>
        )}

        {comments.length > 0 && (
          <div className="mt-12 pt-8 border-t border-[#e8e0d5]">
            <h2 className="font-serif text-[#4a3728] text-xl mb-6">Responses</h2>
            <div className="space-y-6">
              {comments.map((comment) => (
                <div key={comment.id}>
                  <p className="text-sm font-medium text-[#4a3728] mb-1 font-serif">
                    {comment.authorName || "Anonymous"}
                  </p>
                  <p className="text-[#8B7355] font-serif leading-relaxed">{comment.content}</p>
                  {comment.createdAt && (
                    <p className="text-xs text-[#b0a090] mt-1">
                      {new Date(comment.createdAt).toLocaleDateString("en-GB", {
                        day: "numeric", month: "long", year: "numeric",
                      })}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mt-16 pt-8 border-t border-[#e8e0d5] text-center">
          <Link href="/in-bloom">
            <button className="font-serif text-sm text-[#8B7355] hover:text-[#4a3728] transition-colors underline underline-offset-2">
              Read more published work
            </button>
          </Link>
        </div>
      </main>
    </div>
  );
}
