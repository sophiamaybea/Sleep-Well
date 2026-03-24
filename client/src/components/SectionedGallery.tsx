import { useMemo } from "react";
import { motion } from "framer-motion";
import { stripHtml } from "@/components/garden/RichEditor";
import { BookOpen } from "lucide-react";

interface GalleryItem {
  id: string;
  title: string;
  content: string;
  genre: string;
  authorName: string | null;
  authorBio: string | null;
  publishedAt: string | null;
  authorId?: string;
}

const SECTION_LABELS: Record<string, { title: string; subtitle: string }> = {
  love: { title: "Love & Longing", subtitle: "Pieces that ache with desire" },
  loss: { title: "Grief & Memory", subtitle: "Writing through absence" },
  nature: { title: "The Natural World", subtitle: "Landscapes of feeling" },
  identity: { title: "Self & Belonging", subtitle: "Reflections on who we are" },
  time: { title: "Time & Transience", subtitle: "Moments caught in amber" },
  place: { title: "Place & Journey", subtitle: "Stories rooted in location" },
  other: { title: "Further Reading", subtitle: "More from the collection" },
};

const TOPIC_GROUPS: Record<string, { keywords: string[]; priority: number }> = {
  love: { keywords: ["love", "heart", "kiss", "embrace", "longing", "desire", "tender", "beloved", "romance", "passion", "ache", "touch"], priority: 0 },
  loss: { keywords: ["grief", "loss", "death", "mourn", "gone", "absence", "memory", "ghost", "grave", "funeral", "farewell"], priority: 1 },
  nature: { keywords: ["tree", "river", "mountain", "ocean", "sky", "bird", "forest", "field", "stone", "wind", "rain", "earth", "water", "moon", "star"], priority: 2 },
  identity: { keywords: ["mirror", "self", "name", "body", "skin", "voice", "home", "mother", "father", "child", "woman", "man", "belong"], priority: 3 },
  time: { keywords: ["time", "clock", "year", "age", "old", "young", "past", "future", "moment", "forever", "fleeting", "eternal", "remember"], priority: 4 },
  place: { keywords: ["city", "town", "country", "road", "street", "house", "room", "window", "door", "wall", "bridge", "map", "travel", "journey"], priority: 5 },
};

function detectTopic(text: string): string {
  const lower = text.toLowerCase();
  let best = "other";
  let bestCount = 0;
  for (const [topic, { keywords }] of Object.entries(TOPIC_GROUPS)) {
    const count = keywords.filter(k => lower.includes(k)).length;
    if (count > bestCount) { bestCount = count; best = topic; }
  }
  return bestCount >= 1 ? best : "other";
}

function getReadingTime(content: string): number {
  const text = stripHtml(content);
  const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;
  return Math.max(1, Math.ceil(wordCount / 200));
}

interface Props {
  items: GalleryItem[];
  searchQuery: string;
  activeGenre: string;
  selectedContributor: string | null;
  onSelectPiece: (item: GalleryItem) => void;
}

export default function SectionedGallery({ items, searchQuery, activeGenre, selectedContributor, onSelectPiece }: Props) {
  const sections = useMemo(() => {
    if (items.length === 0) return [];
    const buckets = new Map<string, GalleryItem[]>();
    for (const item of items) {
      const text = `${item.title} ${stripHtml(item.content).slice(0, 500)}`;
      const topic = detectTopic(text);
      if (!buckets.has(topic)) buckets.set(topic, []);
      buckets.get(topic)!.push(item);
    }
    const keys = Array.from(buckets.keys()).sort((a, b) => {
      if (a === "other") return 1;
      if (b === "other") return -1;
      return (buckets.get(b)?.length || 0) - (buckets.get(a)?.length || 0);
    });
    return keys.map(key => ({
      key,
      label: SECTION_LABELS[key] || SECTION_LABELS.other,
      items: buckets.get(key)!,
    }));
  }, [items]);

  return (
    <div className="max-w-3xl mx-auto">
      {sections.map((section) => (
        <div key={section.key} className="mb-8">
          <div className="pt-10 pb-4 mb-2">
            <h2 className="font-display text-2xl text-white/90 tracking-wide">{section.label.title}</h2>
            <p className="font-serif text-sm text-white/50 italic mt-1">{section.label.subtitle}</p>
          </div>
          <div className="border-t border-white/[0.06] grid grid-cols-1 md:grid-cols-2 gap-0">
            {section.items.map((item, i) => {
              const readingTime = getReadingTime(item.content);
              const isFeatured = i < 1 && !searchQuery && activeGenre === "all" && !selectedContributor;
              const excerpt = isFeatured ? stripHtml(item.content).slice(0, 120).trim() : "";
              if (isFeatured) {
                return (
                  <motion.button key={item.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.04 }} onClick={() => onSelectPiece(item)} className="w-full text-left border-b border-white/[0.06] group cursor-pointer transition-all duration-500 relative col-span-full py-10 px-4">
                    <div className="flex items-center gap-3 mb-3">
                      <span className="font-mono text-[9px] uppercase tracking-[0.25em] text-amber-400/70">{item.genre}</span>
                      <span className="text-white/20">·</span>
                      <span className="font-mono text-[9px] text-white/75">{readingTime} min</span>
                    </div>
                    <h3 className="font-display text-xl md:text-2xl text-white/90 group-hover:text-white/70 transition-colors leading-snug">{item.title}</h3>
                    {excerpt && <p className="font-serif text-sm text-white/50 mt-3 leading-relaxed">{excerpt}{excerpt.length >= 120 ? "..." : ""}</p>}
                    <div className="flex items-center gap-3 mt-4">
                      {item.authorName && <span className="font-serif text-[12px] italic text-white/55">{item.authorName}</span>}
                      {item.publishedAt && <span className="font-mono text-[8px] text-white/75 uppercase tracking-widest">{new Date(item.publishedAt).toLocaleDateString("en-US", { month: "long", year: "numeric" })}</span>}
                    </div>
                    <span className="font-mono text-[9px] uppercase tracking-[0.25em] text-white/25 group-hover:text-white/50 transition-colors mt-4 block">Read</span>
                  </motion.button>
                );
              }
              return (
                <motion.button key={item.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.04 }} onClick={() => onSelectPiece(item)} className="w-full text-left border-b border-white/[0.06] group cursor-pointer transition-all duration-500 relative py-7 px-4">
                  <h3 className="font-display text-base text-white/85 group-hover:text-white/65 transition-colors leading-snug">{item.title}</h3>
                  <div className="flex items-center gap-3 mt-2 flex-wrap">
                    <span className="font-mono text-[9px] uppercase tracking-[0.25em] text-amber-400/60">{item.genre}</span>
                    {item.authorName && <span className="font-serif text-[12px] italic text-white/55 group-hover:text-white/45">{item.authorName}</span>}
                    <span className="font-mono text-[9px] text-white/75">{readingTime} min</span>
                    {item.publishedAt && <span className="font-mono text-[8px] text-white/75 uppercase tracking-widest">{new Date(item.publishedAt).toLocaleDateString("en-US", { month: "long", year: "numeric" })}</span>}
                  </div>
                  <span className="font-mono text-[9px] uppercase tracking-[0.25em] text-white/25 group-hover:text-white/50 transition-colors mt-3 block">Read</span>
                </motion.button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
