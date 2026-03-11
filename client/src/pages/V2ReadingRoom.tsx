import V2Layout from "@/components/V2Layout";
import { useState } from "react";
import { Search } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

const CATEGORIES = ["All", "Poetry", "Fiction", "Essay", "Fragment", "Memoir"];
const TAGS = ["#grief", "#morning", "#sea", "#becoming"];

interface PublishedPiece {
  id: number;
  title: string;
  author: string;
  category: string;
  excerpt: string;
  readTime: string;
  likes: number;
  readDuration: string;
}

export default function V2ReadingRoom() {
  const [activeFilter, setActiveFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  const { data: pieces = [] } = useQuery<PublishedPiece[]>({
    queryKey: ["/api/publications"],
    queryFn: async () => {
      const res = await fetch("/api/publications");
      if (!res.ok) return [];
      return res.json();
    },
  });

  const samplePieces: PublishedPiece[] = [
    { id: 1, title: "Still, It Blooms", author: "Morgan Mayernik", category: "FRAGMENT", excerpt: "There is a crack in the sidewalk where something green insists. I walk past it...", readTime: "2 min read", likes: 12, readDuration: "2 min" },
    { id: 2, title: "You Are Becoming a Poem", author: "Dilara P\u0131nar Ar\u0131\u00e7", category: "POETRY", excerpt: "You are becoming a poem / the way light becomes a room\u2014 / not all at once, but...", readTime: "1 min read", likes: 24, readDuration: "1 min" },
    { id: 3, title: "The Weight of Ordinary Mornings", author: "Eleanor Chase", category: "ESSAY", excerpt: "I have been thinking about mornings\u2014not the metaphorical kind, but the literal one...", readTime: "5 min read", likes: 18, readDuration: "5 min" },
    { id: 4, title: "Map of the Body After Rain", author: "Soren Kiel", category: "POETRY", excerpt: "Here is where the water entered / through the seams of an old jacket...", readTime: "2 min read", likes: 15, readDuration: "2 min" },
    { id: 5, title: "Inheritance", author: "Maia Okonkwo", category: "FRAGMENT", excerpt: "My grandmother kept a jar of buttons. I never asked why...", readTime: "1 min read", likes: 9, readDuration: "1 min" },
    { id: 6, title: "The Room Where It Happened", author: "James Whitford", category: "FICTION", excerpt: "The door hadn't been opened in eleven years. Everyone in the building knew this...", readTime: "4 min read", likes: 21, readDuration: "4 min" },
  ];

  const displayPieces = pieces.length > 0 ? pieces : samplePieces;

  const categoryBadgeClass = (cat: string) => {
    switch (cat) {
      case "POETRY": return "bg-purple-900/40 text-purple-300";
      case "FICTION": return "bg-blue-900/40 text-blue-300";
      case "ESSAY": return "bg-amber-900/40 text-amber-300";
      case "FRAGMENT": return "bg-emerald-900/40 text-emerald-300";
      case "MEMOIR": return "bg-rose-900/40 text-rose-300";
      default: return "bg-[var(--color-muted)] text-[var(--color-muted-foreground)]";
    }
  };

  return (
    <V2Layout activeTab="reading">
      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Featured Writer */}
        <div className="bg-[var(--color-card)] border border-[var(--color-border)] rounded-lg p-6 mb-8">
          <div className="text-xs font-mono tracking-widest text-[var(--color-accent)] mb-3">FEATURED WRITER</div>
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-full bg-[var(--color-muted)] border-2 border-[var(--color-accent)] flex items-center justify-center text-lg font-bold">DA</div>
            <div className="flex-1">
              <h2 className="font-display text-2xl mb-2">Dilara P\u0131nar Ar\u0131\u00e7</h2>
              <p className="text-sm text-[var(--color-muted-foreground)] mb-3 max-w-2xl">
                Turkish-Canadian poet working at the intersection of displacement, language, and inherited memory.
              </p>
              <span className="text-sm text-[var(--color-accent)] cursor-pointer hover:underline">
                Read "You Are Becoming a Poem" &rarr;
              </span>
            </div>
          </div>
        </div>

        {/* Filter pills */}
        <div className="flex flex-wrap gap-2 mb-4">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveFilter(cat)}
              className={`px-4 py-1.5 rounded-full text-sm border transition-colors ${
                activeFilter === cat
                  ? "bg-[var(--color-foreground)] text-[var(--color-background)] border-[var(--color-foreground)]"
                  : "bg-transparent text-[var(--color-muted-foreground)] border-[var(--color-border)] hover:border-[var(--color-foreground)]"
              }`}
            >
              {cat}
            </button>
          ))}
          {TAGS.map((tag) => (
            <button
              key={tag}
              className="px-4 py-1.5 rounded-full text-sm border border-[var(--color-border)] text-[var(--color-muted-foreground)] hover:border-[var(--color-foreground)] transition-colors"
            >
              {tag}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative mb-8">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-muted-foreground)]" size={18} />
          <input
            type="text"
            placeholder="Search pieces, writers, or themes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-[var(--color-card)] border border-[var(--color-border)] rounded-lg text-sm text-[var(--color-foreground)] placeholder:text-[var(--color-muted-foreground)] focus:outline-none focus:border-[var(--color-accent)]"
          />
        </div>

        {/* Article grid */}
        <div className="grid grid-cols-3 gap-4">
          {displayPieces.map((piece) => (
            <div
              key={piece.id}
              className="bg-[var(--color-card)] border border-[var(--color-border)] rounded-lg p-5 hover:border-[var(--color-accent)] transition-colors cursor-pointer"
            >
              <div className="flex items-center justify-between mb-3">
                <span className={`px-2 py-0.5 rounded text-[10px] font-mono tracking-wider ${categoryBadgeClass(piece.category)}`}>
                  {piece.category}
                </span>
                <span className="text-xs text-[var(--color-muted-foreground)]">{piece.readTime}</span>
              </div>
              <h3 className="font-display text-lg mb-1">{piece.title}</h3>
              <p className="text-sm text-[var(--color-muted-foreground)] mb-1">{piece.author}</p>
              <p className="text-sm text-[var(--color-muted-foreground)] italic leading-relaxed mb-4 line-clamp-2">
                {piece.excerpt}
              </p>
              <div className="flex items-center gap-4 text-xs text-[var(--color-muted-foreground)]">
                <span>\uD83C\uDF31 {piece.likes}</span>
                <span>\uD83D\uDCDA {piece.readDuration}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </V2Layout>
  );
}