import { Link } from "wouter";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { getQueryFn } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import Navigation from "@/components/Navigation";

interface ExhibitItem {
  id: string;
  slug: string;
  title: string;
  subtitle: string | null;
  price: number;
  isPublished: boolean;
  purchased: boolean;
  status: "locked" | "available" | "in_progress" | "completed";
  currentScreen: number | null;
}

const STATUS_CONFIG = {
  locked: { label: "Locked", color: "#e8e4df", border: "#e8e4df/20", opacity: "opacity-50" },
  available: { label: "Free", color: "var(--color-accent-ornament)", border: "var(--color-accent-ornament)" },
  in_progress: { label: "In Progress", color: "#6ba5a5", border: "#6ba5a5" },
  completed: { label: "Completed", color: "#4a7c59", border: "#4a7c59" },
} as const;

function ExhibitBadges({ exhibit }: { exhibit: ExhibitItem }) {
  const statusCfg = STATUS_CONFIG[exhibit.status];

  return (
    <div className="flex items-center gap-3">
      {exhibit.price > 0 && (
        <span
          data-testid={`badge-price-${exhibit.slug}`}
          className="inline-block px-3 py-1 text-[10px] tracking-[0.2em] uppercase"
          style={{ border: `1px solid rgba(232,228,223,0.2)`, color: "rgba(232,228,223,0.6)" }}
        >
          ${(exhibit.price / 100).toFixed(2)}
        </span>
      )}
      <span
        data-testid={`badge-status-${exhibit.slug}`}
        className="inline-block px-3 py-1 text-[10px] tracking-[0.2em] uppercase"
        style={{ border: `1px solid ${statusCfg.color}40`, color: statusCfg.color }}
      >
        {exhibit.status === "available" && exhibit.price === 0 ? "Free" : statusCfg.label}
      </span>
    </div>
  );
}

function ExhibitCard({ exhibit }: { exhibit: ExhibitItem }) {
  const isLocked = exhibit.status === "locked";

  return (
    <Link href={isLocked ? "#" : `/exhibits/${exhibit.slug}`}>
      <motion.div
        data-testid={`card-exhibit-${exhibit.slug}`}
        className={`group cursor-pointer border transition-all duration-500 p-8 md:p-10 ${isLocked ? "border-[#1a1815] opacity-60" : "border-[#1a1815] hover:border-accent-ornament/30"}`}
        whileHover={isLocked ? {} : { y: -4 }}
        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="flex items-start justify-between mb-6">
          <ExhibitBadges exhibit={exhibit} />
          {!isLocked && (
            <svg className="w-4 h-4 text-[#4a4540] group-hover:text-accent-ornament transition-colors duration-300 group-hover:translate-x-1 transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 8.25L21 12m0 0l-3.75 3.75M21 12H3" />
            </svg>
          )}
          {isLocked && (
            <svg className="w-4 h-4 text-[#4a4540]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
            </svg>
          )}
        </div>
        <h3
          className={`text-2xl md:text-3xl mb-3 transition-colors duration-300 ${!isLocked ? "group-hover:text-accent-ornament" : ""}`}
          style={{ fontFamily: "var(--font-display)", color: "#e8e4df", fontWeight: 500 }}
        >
          {exhibit.title}
        </h3>
        {exhibit.subtitle && (
          <p
            className="leading-relaxed"
            style={{ fontFamily: "var(--font-serif)", fontSize: "0.95rem", color: "#8a8278", lineHeight: "1.7" }}
          >
            {exhibit.subtitle}
          </p>
        )}
        {exhibit.status === "in_progress" && exhibit.currentScreen && (
          <div className="mt-6 flex items-center gap-3">
            <div className="flex-1 h-[2px] bg-[#1a1815] rounded-full overflow-hidden">
              <div
                className="h-full bg-[#6ba5a5] transition-all duration-500"
                style={{ width: `${(exhibit.currentScreen / 8) * 100}%` }}
              />
            </div>
            <span className="text-[10px] tracking-[0.15em] text-[#6ba5a5]">{exhibit.currentScreen}/8</span>
          </div>
        )}
        {exhibit.status === "completed" && (
          <div className="mt-6 flex items-center gap-2 text-[10px] tracking-[0.15em] text-[#4a7c59]">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
            </svg>
            <span>Journey complete</span>
          </div>
        )}
        <div className={`mt-8 flex items-center gap-2 text-[length:var(--text-label)] tracking-[0.15em] uppercase transition-colors duration-300 ${isLocked ? "text-[#3a3530]" : "text-[#4a4540] group-hover:text-accent-ornament/60"}`}>
          <span>{isLocked ? "Purchase to enter" : exhibit.status === "in_progress" ? "Continue journey" : exhibit.status === "completed" ? "Revisit exhibit" : "Enter exhibit"}</span>
          <span className="inline-block w-4 h-[1px] bg-current" />
        </div>
      </motion.div>
    </Link>
  );
}

export default function Exhibits() {
  const { user } = useAuth();

  const { data: exhibits, isLoading } = useQuery<ExhibitItem[]>({
    queryKey: ["/api/exhibits"],
    queryFn: getQueryFn({ on401: "returnNull" }),
  });

  return (
    <div className="min-h-screen" style={{ background: "#0a0a0a" }}>
      <Navigation />
      <div className="max-w-4xl mx-auto px-6 pt-36 pb-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="text-center mb-20"
        >
          <h1
            data-testid="text-exhibits-title"
            className="text-4xl md:text-5xl mb-8"
            style={{ fontFamily: "var(--font-display)", color: "#e8e4df", fontWeight: 400, letterSpacing: "0.08em" }}
          >
            The Exhibits
          </h1>
          <div className="w-12 h-[1px] bg-accent-ornament mx-auto mb-8" />
          <p
            style={{ fontFamily: "var(--font-serif)", fontSize: "1.05rem", color: "#8a8278", lineHeight: "1.8", maxWidth: "480px", margin: "0 auto" }}
          >
            Each exhibit is a self-contained journey. Enter at your own pace. Leave changed.
          </p>
        </motion.div>

        {isLoading ? (
          <div className="space-y-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="border border-[#1a1815] p-10 animate-pulse">
                <div className="h-3 w-16 bg-[#1a1815] rounded mb-6" />
                <div className="h-7 w-3/4 bg-[#1a1815] rounded mb-3" />
                <div className="h-4 w-1/2 bg-[#1a1815] rounded" />
              </div>
            ))}
          </div>
        ) : exhibits && exhibits.length > 0 ? (
          <motion.div
            className="space-y-6"
            initial="hidden"
            animate="show"
            variants={{ hidden: {}, show: { transition: { staggerChildren: 0.12 } } }}
          >
            {exhibits.map((exhibit) => (
              <motion.div
                key={exhibit.id}
                variants={{ hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } }}
                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              >
                <ExhibitCard exhibit={exhibit} />
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <div className="text-center py-20">
            <p style={{ fontFamily: "var(--font-display)", fontSize: "1.3rem", color: "#4a4540" }}>
              No exhibits are currently on display.
            </p>
            <p className="mt-3" style={{ fontFamily: "var(--font-serif)", fontSize: "0.9rem", color: "#3a3530" }}>
              New exhibits open throughout the season.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}