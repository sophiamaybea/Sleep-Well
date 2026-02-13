import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sprout, PenLine, BookOpen, Compass, Heart, Bookmark,
  MessageCircle, Flame, Archive, NotebookPen, FileCheck,
  CloudSun, Brain, CalendarRange, Network, Users, Mic,
  Mail, Moon, BarChart3, ChevronDown, Menu, X, Home,
  Search, Settings, LogOut
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

type GardenView =
  | "landing" | "my-garden" | "write"
  | "gallery" | "queue" | "explore" | "saved" | "pollination"
  | "rituals" | "compost" | "growth-journal" | "submissions"
  | "inner-weather" | "reflections" | "seasonal-review" | "root-system"
  | "circles" | "moonlit-readings" | "replant-requests";

interface NavItem {
  id: GardenView;
  label: string;
  icon: React.ReactNode;
  available?: boolean;
}

interface NavGroup {
  title: string;
  items: NavItem[];
}

const navGroups: NavGroup[] = [
  {
    title: "Create",
    items: [
      { id: "landing", label: "Garden Home", icon: <Home size={16} />, available: true },
      { id: "my-garden", label: "My Garden", icon: <Sprout size={16} />, available: true },
      { id: "write", label: "Write", icon: <PenLine size={16} />, available: true },
    ],
  },
  {
    title: "Discover",
    items: [
      { id: "gallery", label: "Gallery", icon: <BookOpen size={16} />, available: false },
      { id: "queue", label: "Reading Queue", icon: <Bookmark size={16} />, available: false },
      { id: "explore", label: "Explore", icon: <Compass size={16} />, available: false },
      { id: "saved", label: "Saved", icon: <Heart size={16} />, available: false },
      { id: "pollination", label: "Pollination", icon: <MessageCircle size={16} />, available: false },
    ],
  },
  {
    title: "Practice",
    items: [
      { id: "rituals", label: "Rituals", icon: <Flame size={16} />, available: false },
      { id: "compost", label: "Compost", icon: <Archive size={16} />, available: false },
      { id: "growth-journal", label: "Growth Journal", icon: <NotebookPen size={16} />, available: false },
      { id: "submissions", label: "Submissions", icon: <FileCheck size={16} />, available: false },
    ],
  },
  {
    title: "Reflect",
    items: [
      { id: "inner-weather", label: "Inner Weather", icon: <CloudSun size={16} />, available: false },
      { id: "reflections", label: "Reflections", icon: <Brain size={16} />, available: false },
      { id: "seasonal-review", label: "Seasonal Review", icon: <CalendarRange size={16} />, available: false },
      { id: "root-system", label: "Root System", icon: <Network size={16} />, available: false },
    ],
  },
  {
    title: "Community",
    items: [
      { id: "circles", label: "Circles", icon: <Users size={16} />, available: false },
      { id: "moonlit-readings", label: "Moonlit Readings", icon: <Mic size={16} />, available: false },
      { id: "replant-requests", label: "Replant Requests", icon: <Mail size={16} />, available: false },
    ],
  },
];

interface GardenSidebarProps {
  currentView: GardenView;
  onNavigate: (view: GardenView) => void;
  isOpen: boolean;
  onToggle: () => void;
}

export type { GardenView };

export default function GardenSidebar({ currentView, onNavigate, isOpen, onToggle }: GardenSidebarProps) {
  const { user } = useAuth();
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({
    Create: true,
    Discover: false,
    Practice: false,
    Reflect: false,
    Community: false,
  });

  function toggleGroup(title: string) {
    setExpandedGroups(prev => ({ ...prev, [title]: !prev[title] }));
  }

  return (
    <>
      <button
        onClick={onToggle}
        className="fixed top-6 left-6 z-[60] p-2.5 rounded-lg border border-white/10 bg-white/[0.03] backdrop-blur-sm text-white/50 hover:text-white hover:bg-white/[0.08] transition-all"
        data-testid="button-toggle-sidebar"
      >
        {isOpen ? <X size={18} /> : <Menu size={18} />}
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[45] bg-black/40 backdrop-blur-sm lg:hidden"
              onClick={onToggle}
            />

            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="fixed top-0 left-0 z-[50] w-[260px] h-screen bg-[#080d15]/95 backdrop-blur-xl border-r border-white/[0.06] flex flex-col overflow-hidden"
            >
              <div className="pt-6 pb-4 px-5 border-b border-white/[0.06]">
                <div className="flex items-center gap-3 mb-1 mt-8">
                  <div className="w-8 h-8 rounded-full bg-white/[0.06] border border-white/10 flex items-center justify-center text-white/50 font-mono text-xs uppercase">
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

              <div className="flex-1 overflow-y-auto py-3 px-3 scrollbar-thin scrollbar-thumb-white/5">
                {navGroups.map((group) => (
                  <div key={group.title} className="mb-1">
                    <button
                      onClick={() => toggleGroup(group.title)}
                      className="w-full flex items-center justify-between px-2 py-2 text-white/30 hover:text-white/50 transition-colors group"
                      data-testid={`nav-group-${group.title.toLowerCase()}`}
                    >
                      <span className="font-mono text-[9px] tracking-[0.25em] uppercase">{group.title}</span>
                      <ChevronDown
                        size={12}
                        className={`transition-transform duration-200 ${expandedGroups[group.title] ? "rotate-0" : "-rotate-90"}`}
                      />
                    </button>

                    <AnimatePresence initial={false}>
                      {expandedGroups[group.title] && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden"
                        >
                          {group.items.map((item) => {
                            const isActive = currentView === item.id;
                            const isAvailable = item.available !== false;

                            return (
                              <button
                                key={item.id}
                                onClick={() => {
                                  if (isAvailable) {
                                    onNavigate(item.id);
                                  }
                                }}
                                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-all duration-200 ${
                                  isActive
                                    ? "bg-white/[0.08] text-white/90"
                                    : isAvailable
                                    ? "text-white/40 hover:text-white/70 hover:bg-white/[0.03]"
                                    : "text-white/15 cursor-default"
                                }`}
                                data-testid={`nav-item-${item.id}`}
                              >
                                <span className={isActive ? "text-white/80" : ""}>{item.icon}</span>
                                <span className="text-[13px] font-serif">{item.label}</span>
                                {!isAvailable && (
                                  <span className="ml-auto text-[8px] font-mono tracking-widest text-white/15 uppercase">Soon</span>
                                )}
                              </button>
                            );
                          })}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ))}
              </div>

              <div className="px-3 py-3 border-t border-white/[0.06] space-y-1">
                <a
                  href="/"
                  className="flex items-center gap-3 px-3 py-2 rounded-lg text-white/30 hover:text-white/60 hover:bg-white/[0.03] transition-all"
                  data-testid="nav-home"
                >
                  <Home size={16} />
                  <span className="text-[13px] font-serif">Back to Home</span>
                </a>
                <a
                  href="/api/logout"
                  className="flex items-center gap-3 px-3 py-2 rounded-lg text-white/30 hover:text-red-400/60 hover:bg-white/[0.03] transition-all"
                  data-testid="nav-logout"
                >
                  <LogOut size={16} />
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
