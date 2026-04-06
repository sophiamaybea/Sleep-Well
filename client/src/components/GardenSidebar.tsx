import { motion, AnimatePresence } from "framer-motion";
import {
  PenLine, Sprout, Compass, BookOpen,
  Users, FileCheck, Wind, Home, Menu, X, LogOut,
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import type { Notification } from "@shared/schema";

// The GardenView type is kept broad so other pages that consume it
// still compile. Only the 8 anchors below are wired to nav items.
export type GardenView =
  | "landing" | "my-garden" | "write" | "garden-feed" | "tending-feed" | "notifications"
  | "gallery" | "queue" | "explore" | "saved" | "pollination"
  | "rituals" | "compost" | "growth-journal" | "submissions"
  | "inner-weather" | "reflections" | "seasonal-review" | "root-system"
  | "circles" | "moonlit-readings" | "replant-requests";

interface NavItem {
  id: GardenView;
  label: string;
  icon: React.ReactNode;
}

// ── The 8 anchors that actually exist ─────────────────────────────────────
const navItems: NavItem[] = [
  { id: "my-garden",    label: "My Garden",     icon: <Sprout size={15} /> },
  { id: "write",        label: "Write",         icon: <PenLine size={15} /> },
  { id: "explore",      label: "Explore",       icon: <Compass size={15} /> },
  { id: "queue",        label: "Reading",       icon: <BookOpen size={15} /> },
  { id: "circles",      label: "Circles",       icon: <Users size={15} /> },
  { id: "submissions",  label: "Submissions",   icon: <FileCheck size={15} /> },
  { id: "notifications",label: "Wind Chimes",   icon: <Wind size={15} /> },
];

interface GardenSidebarProps {
  currentView: GardenView;
  onNavigate: (view: GardenView) => void;
  isOpen: boolean;
  onToggle: () => void;
}

export default function GardenSidebar({ currentView, onNavigate, isOpen, onToggle }: GardenSidebarProps) {
  const { user } = useAuth();
    const { data: notifications = [] } = useQuery<Notification[]>({
    queryKey: ["/api/notifications"],
    enabled: !!user,
  });
  const hasUnread = (notifications as Notification[]).some((n) => !n.isRead);

  return (
    <>
      {/* ── toggle button + back-home pill, always visible ──────────────── */}
      <div className="fixed top-6 left-6 z-[60] flex items-center gap-2">
        <button
          onClick={onToggle}
          className="p-2.5 rounded-lg border border-white/10 bg-white/[0.03] backdrop-blur-sm text-white/50 hover:text-white hover:bg-white/[0.08] transition-all"
          data-testid="button-toggle-sidebar"
          aria-label={isOpen ? "Close navigation" : "Open navigation"}
        >
          {isOpen ? <X size={18} /> : <Menu size={18} />}
        </button>
        {!isOpen && (
          <a
            href="/"
            className="flex items-center gap-2 px-3 py-2.5 rounded-lg border border-white/10 bg-white/[0.03] backdrop-blur-sm text-white/40 hover:text-white hover:bg-white/[0.08] transition-all font-mono text-[10px] tracking-widest uppercase"
            data-testid="button-back-home"
          >
            <Home size={14} />
            <span className="hidden sm:inline">Home</span>
          </a>
        )}
      </div>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[45] bg-black/40 backdrop-blur-sm lg:hidden"
              onClick={onToggle}
            />

            {/* drawer */}
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="fixed top-0 left-0 z-[50] w-[240px] h-screen bg-popover/95 backdrop-blur-xl border-r border-white/[0.06] flex flex-col overflow-hidden"
            >
              {/* writer identity */}
              <div className="pt-6 pb-4 px-5 border-b border-white/[0.06]">
                <div className="flex items-center gap-3 mt-8">
                  <div className="w-8 h-8 rounded-full bg-white/[0.06] border border-white/10 flex items-center justify-center text-white/50 font-mono text-xs uppercase shrink-0">
                    {user?.firstName?.[0] || "?"}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm text-white/80 truncate font-serif" data-testid="text-username">
                      {user?.firstName || ""} {user?.lastName || ""}
                    </p>
                    <p className="text-[10px] font-mono text-white/25 tracking-widest uppercase">Writer</p>
                  </div>
                </div>
              </div>

              {/* flat nav anchors */}
              <nav className="flex-1 overflow-y-auto py-4 px-3">
                {navItems.map((item) => {
                  const isActive = currentView === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => onNavigate(item.id)}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all duration-150 mb-0.5 ${
                        isActive
                          ? "bg-white/[0.08] text-white/90"
                          : "text-white/40 hover:text-white/70 hover:bg-white/[0.03]"
                      }`}
                      data-testid={`nav-item-${item.id}`}
                    >
                      <span className={isActive ? "text-white/80" : ""}>{item.icon}</span>
                      <span className="text-[13px] font-serif">{item.label}</span>
                                    {item.id === "notifications" && hasUnread && (
                <span className="ml-auto w-1.5 h-1.5 rounded-full bg-amber-400/70" />
              )}
                    </button>
                  );
                })}
              </nav>

              {/* footer: home + sign out */}
              <div className="px-3 py-3 border-t border-white/[0.06] space-y-0.5">
                <a
                  href="/"
                  className="flex items-center gap-3 px-3 py-2 rounded-lg text-white/30 hover:text-white/60 hover:bg-white/[0.03] transition-all"
                  data-testid="nav-home"
                >
                  <Home size={15} />
                  <span className="text-[13px] font-serif">Back to Home</span>
                </a>
                <a
                  href="/api/logout"
                  className="flex items-center gap-3 px-3 py-2 rounded-lg text-white/30 hover:text-red-400/60 hover:bg-white/[0.03] transition-all"
                  data-testid="nav-logout"
                >
                  <LogOut size={15} />
                  <span className="text-[13px] font-serif">Sign Out</span>
                </a>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
