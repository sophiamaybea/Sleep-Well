import { useEffect } from "react";
import { useParams, Link } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Share2, BookOpen } from "lucide-react";
import { ContentRenderer, stripHtml } from "@/components/garden/RichEditor";

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

export default function Piece() {
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();

  // Update URL and document title when piece loads
  useEffect(() => {
    if (id) {
      const url = `/piece/${id}`;
      if (window.location.pathname !== url) {
        window.history.replaceState(null, "", url);
      }
    }
  }, [id]);

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
    if (piece?.title) {
      document.title = `${piece.title} | The Page Gallery`;
    }
    return () => {
      document.title = "The Page Gallery";
    };
  }, [piece?.title]);

  const { data: comments = [] } = useQuery<Comment[]>({
    queryKey: ["/api/gallery-comments", id],
    queryFn: async () => {
      const res = await fetch(`/api/gallery-comments/${id}`);
      if (!res.ok) return [];
      return res.json();
    },
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#faf8f5] flex items-center justify-center relative z-10">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-[#8B7355] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-[#8B7355] font-serif italic">Loading...</p>
        </div>
      </div>
    );
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

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({ title: piece.title, url });
      } catch {}
    } else {
      await navigator.clipboard.writeText(url);
      alert("Link copied to clipboard!");
    }
  };

  return (
    <div className="min-h-screen bg-[#faf8f5] relative z-10">
      {/* Top nav */}
      <div className="border-b border-[#e8e0d5] bg-[#faf8f5]/95 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/in-bloom">
            <button className="inline-flex items-center gap-2 text-[#8B7355] hover:text-[#4a3728] transition-colors font-serif text-sm">
              <ArrowLeft className="w-4 h-4" />
              In Bloom
            </button>
          </Link>
          <button
            onClick={handleShare}
            className="inline-flex items-center gap-2 text-[#8B7355] hover:text-[#4a3728] transition-colors font-serif text-sm"
          >
            <Share2 className="w-4 h-4" />
            Share
          </button>
        </div>
      </div>

      {/* Content */}
      <main className="max-w-3xl mx-auto px-6 py-12">
        {/* Genre badge */}
        {piece.genre && (
          <div className="mb-6">
            <span className="inline-block text-xs font-medium text-[#8B7355] uppercase tracking-widest border border-[#d4c4a8] rounded-full px-3 py-1">
              {piece.genre}
            </span>
          </div>
        )}

        {/* Title */}
        <h1 className="text-3xl md:text-4xl font-serif text-[#4a3728] leading-tight mb-4">
          {piece.title}
        </h1>

        {/* Author + reading time */}
        <div className="flex items-center gap-3 text-sm text-[#8B7355] mb-10 font-serif">
          <span>by {authorDisplayName}</span>
          <span className="text-[#d4c4a8]">·</span>
          <span className="flex items-center gap-1">
            <BookOpen className="w-3.5 h-3.5" />
            {readingTime} min read
          </span>
        </div>

        {/* Body */}
        <article className="prose prose-stone max-w-none font-serif text-[#4a3728] leading-relaxed text-lg">
          <ContentRenderer content={piece.content} />
        </article>

        {/* Tags */}
        {piece.tags && piece.tags.length > 0 && (
          <div className="mt-10 flex flex-wrap gap-2">
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

        {/* Author bio */}
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

        {/* Comments */}
        {comments.length > 0 && (
          <div className="mt-12 pt-8 border-t border-[#e8e0d5]">
            <h2 className="font-serif text-[#4a3728] text-xl mb-6">Responses</h2>
            <div className="space-y-6">
              {comments.map((comment) => (
                <div key={comment.id} className="">
                  <p className="text-sm font-medium text-[#4a3728] mb-1 font-serif">
                    {comment.authorName || "Anonymous"}
                  </p>
                  <p className="text-[#8B7355] font-serif leading-relaxed">{comment.content}</p>
                  {comment.createdAt && (
                    <p className="text-xs text-[#b0a090] mt-1">
                      {new Date(comment.createdAt).toLocaleDateString("en-GB", {
                        day: "numeric", month: "long", year: "numeric"
                      })}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Footer nav */}
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
