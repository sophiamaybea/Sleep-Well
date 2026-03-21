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
}

interface Comment {
 id: string;
 authorName: string | null;
 content: string;
 createdAt: string | null;
}

function getReadingTime(content: string): number {
 const text = stripHtml(content);
 const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;
 return Math.max(1, Math.ceil(wordCount / 200));
}

function formatDate(dateStr: string | null): string {
 if (!dateStr) return "";
 return new Date(dateStr).toLocaleDateString("en-US", {
 month: "long",
 year: "numeric",
 }).toUpperCase();
}

export default function Piece() {
 const { id } = useParams<{ id: string }>();
 const qc = useQueryClient();

 // Fetch piece by ID
 const { data: piece, isLoading, isError } = useQuery<PieceData>({
 queryKey: ["/api/pieces", id],
 queryFn: async () => {
 const res = await fetch(`/api/pieces/${id}`);
 if (!res.ok) {
 // Fallback: fetch all pieces and find by ID
 const allRes = await fetch("/api/pieces?published=true&limit=200");
 if (!allRes.ok) throw new Error("Piece not found");
 const all: PieceData[] = await allRes.json();
 const found = all.find((p) => p.id === id);
 if (!found) throw new Error("Piece not found");
 return found;
 }
 return res.json();
 },
 enabled: !!id,
 });

 // Fetch comments
 const { data: comments = [] } = useQuery<Comment[]>({
 queryKey: ["/api/pieces", id, "comments"],
 queryFn: async () => {
 const res = await fetch(`/api/pieces/${id}/comments`);
 if (!res.ok) return [];
 return res.json();
 },
 enabled: !!id,
 });

 // Set document title dynamically
 useEffect(() => {
 if (piece) {
 document.title = `${piece.title}${
 piece.authorName ? ` by ${piece.authorName}` : ""
 } — The Page Gallery`;
 }
 }, [piece]);

 // Share handler
 function handleShare() {
 if (navigator.share) {
 navigator.share({
 title: piece?.title,
 url: window.location.href,
 });
 } else {
 navigator.clipboard.writeText(window.location.href);
 }
 }

 if (isLoading) {
 return (
 <div
 className="min-h-screen flex items-center justify-center"
 style={{ backgroundColor: "#0a0a0a" }}
 >
 <div className="relative w-10 h-10">
 <div className="absolute inset-0 rounded-full border border-amber-500/20 border-t-amber-500/50 animate-spin" />
 </div>
 </div>
 );
 }

 if (isError || !piece) {
 return (
 <div
 className="min-h-screen flex flex-col items-center justify-center gap-6"
 style={{ backgroundColor: "#0a0a0a", color: "#fff" }}
 >
 <p className="font-mono text-xs tracking-widest uppercase text-white/40">
 This page has wandered off.
 </p>
 <Link
 href="/in-bloom"
 className="font-mono text-[10px] tracking-[0.3em] uppercase border border-white/20 px-6 py-3 hover:border-white/50 transition-colors"
 >
 Read the Journal
 </Link>
 </div>
 );
 }

 const readingTime = getReadingTime(piece.content);

 return (
 <div
 className="min-h-screen"
 style={{ backgroundColor: "#0a0a0a", color: "#f5f0e8" }}
 >
 {/* Nav bar */}
 <div className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4"
 style={{ backgroundColor: "rgba(10,10,10,0.9)", backdropFilter: "blur(8px)" }}
 >
 <Link
 href="/in-bloom"
 className="flex items-center gap-2 text-white/50 hover:text-white/90 transition-colors"
 >
 <ArrowLeft size={14} />
 <span className="font-mono text-[10px] tracking-[0.3em] uppercase">Back</span>
 </Link>
 <button
 onClick={handleShare}
 className="flex items-center gap-2 text-white/50 hover:text-white/90 transition-colors"
 >
 <Share2 size={14} />
 <span className="font-mono text-[10px] tracking-[0.3em] uppercase">Share</span>
 </button>
 </div>

 {/* Piece content */}
 <div className="max-w-2xl mx-auto px-6 pt-28 pb-24">
 {/* Genre + reading time */}
 <div className="flex items-center gap-3 mb-8">
 <span className="font-mono text-[9px] tracking-[0.3em] uppercase text-white/40">
 {piece.genre}
 </span>
 <span className="text-white/20">·</span>
 <span className="font-mono text-[9px] tracking-[0.3em] uppercase text-white/40">
 {readingTime} min read
 </span>
 </div>

 {/* Title */}
 <h1 className="font-serif text-3xl md:text-4xl leading-tight mb-6"
 style={{ fontFamily: "'Cormorant Garamond', serif" }}
 >
 {piece.title}
 </h1>

 {/* Author + date */}
 <div className="flex items-center gap-3 mb-12 pb-8 border-b border-white/10">
 {piece.authorId ? (
 <Link
 href={`/writer/${piece.authorId}`}
 className="font-serif text-sm text-white/70 hover:text-white/90 italic transition-colors"
 >
 {piece.authorName || "Anonymous"}
 </Link>
 ) : (
 <span className="font-serif text-sm text-white/70 italic">
 {piece.authorName || "Anonymous"}
 </span>
 )}
 {piece.publishedAt && (
 <>
 <span className="text-white/20">·</span>
 <span className="font-mono text-[9px] tracking-[0.2em] uppercase text-white/30">
 {formatDate(piece.publishedAt)}
 </span>
 </>
 )}
 </div>

 {/* Body */}
 <div className="prose prose-invert max-w-none"
 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.15rem", lineHeight: "1.9" }}
 >
 <ContentRenderer content={piece.content} />
 </div>

 {/* Author bio */}
 {piece.authorBio && (
 <div className="mt-16 pt-8 border-t border-white/10">
 <p className="font-mono text-[9px] tracking-[0.3em] uppercase text-white/30 mb-4">
 About the author
 </p>
 <p className="font-serif text-sm text-white/60 italic leading-relaxed">
 {piece.authorBio}
 </p>
 {piece.authorId && (
 <Link
 href={`/writer/${piece.authorId}`}
 className="inline-block mt-4 font-mono text-[9px] tracking-[0.3em] uppercase text-white/40 hover:text-white/70 border border-white/20 hover:border-white/40 px-4 py-2 transition-colors"
 >
 View Profile
 </Link>
 )}
 </div>
 )}

 {/* Reflections */}
 <div className="mt-16">
 <p className="font-mono text-[9px] tracking-[0.3em] uppercase text-white/30 mb-8">
 Reflections
 </p>
 {comments.length === 0 ? (
 <p className="font-serif text-sm text-white/30 italic">
 No reflections yet. Be the first to share your thoughts.
 </p>
 ) : (
 <div className="space-y-6">
 {comments.map((c) => (
 <div key={c.id} className="border-l border-white/10 pl-4">
 <div className="flex items-center gap-2 mb-2">
 <span className="font-serif text-xs text-white/50">
 {c.authorName || "Anonymous"}
 </span>
 {c.createdAt && (
 <span className="font-mono text-[9px] text-white/25">
 {new Date(c.createdAt).toLocaleDateString()}
 </span>
 )}
 </div>
 <p className="font-serif text-sm text-white/60 leading-relaxed">
 {c.content}
 </p>
 </div>
 ))}
 </div>
 )}
 </div>

 {/* Back to Journal */}
 <div className="mt-20 flex justify-center">
 <Link
 href="/in-bloom"
 className="flex items-center gap-3 font-mono text-[10px] tracking-[0.3em] uppercase text-white/30 hover:text-white/70 border border-white/15 hover:border-white/40 px-8 py-4 transition-colors"
 >
 <BookOpen size={12} />
 Read more from the Journal
 </Link>
 </div>
 </div>
 </div>
 );
}
