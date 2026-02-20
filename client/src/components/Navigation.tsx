import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Sun, Moon, Bell } from "lucide-react";
import { useState, useEffect } from "react";
import { Link } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";

export default function Navigation() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { user, isLoading, isAuthenticated } = useAuth();
  const [isLight, setIsLight] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("theme") === "light";
    }
    return false;
  });

  useEffect(() => {
    if (isLight) {
      document.documentElement.classList.add("light-theme");
      localStorage.setItem("theme", "light");
    } else {
      document.documentElement.classList.remove("light-theme");
      localStorage.setItem("theme", "dark");
    }
  }, [isLight]);

  const { data: roleData } = useQuery<{ role: string; tier: string }>({
    queryKey: ["/api/user/role"],
    queryFn: async () => {
      const res = await fetch("/api/user/role", { credentials: "include" });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    enabled: isAuthenticated,
    staleTime: 1000 * 60 * 5,
  });

  const isEditorOrEIC = roleData?.role === "editor" || roleData?.role === "editor_in_chief";
  const isEIC = roleData?.role === "editor_in_chief";

  const { data: notifData } = useQuery<{ unread: number; notifications: any[] }>({
    queryKey: ["/api/notifications"],
    queryFn: async () => {
      const [notifRes, countRes] = await Promise.all([
        fetch("/api/notifications", { credentials: "include" }),
        fetch("/api/notifications/unread-count", { credentials: "include" }),
      ]);
      const notifications = notifRes.ok ? await notifRes.json() : [];
      const countData = countRes.ok ? await countRes.json() : { count: 0 };
      return { unread: countData.count, notifications: notifications.slice(0, 10) };
    },
    enabled: !!user,
    refetchInterval: 30000,
  });

  const [showNotifs, setShowNotifs] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const menuItems: { label: string; href: string; isPage?: boolean }[] = [
    { label: "Home", href: "/", isPage: true },
    { label: "In Bloom", href: "/in-bloom", isPage: true },
    { label: "Seasons", href: "/seasons", isPage: true },
    { label: "About", href: "/about", isPage: true },
    { label: "How It Works", href: "/how-it-works", isPage: true },
  ];

  return (
    <>
      <nav className={`fixed top-0 left-0 w-full z-50 transition-all duration-500 ${scrolled ? 'py-4' : 'py-8'}`}>
        <div className="max-w-7xl mx-auto px-6 md:px-12 flex justify-between items-center">
          <Link href="/" className="relative group">
            <span className="font-display font-medium text-2xl tracking-tight italic mix-blend-difference text-white">
              The Page Gallery Journal
            </span>
            <span className="absolute -bottom-1 left-0 w-0 h-[1px] bg-white transition-all duration-300 group-hover:w-full" />
          </Link>

          <div className={`hidden lg:flex items-center gap-4 font-mono text-[10px] uppercase tracking-widest transition-all duration-500 ${scrolled ? 'bg-white/5 backdrop-blur-md px-6 py-3 rounded-full border border-white/10' : ''}`}>
            {menuItems.map((item) =>
              item.isPage ? (
                <Link
                  key={item.label}
                  href={item.href}
                  className="text-white/70 hover:text-white transition-colors relative group"
                  data-testid={`nav-${item.label.toLowerCase().replace(/\s/g, '-')}`}
                >
                  {item.label}
                  <span className="absolute -bottom-1 left-1/2 w-0 h-[1px] bg-white transition-all duration-300 group-hover:w-full group-hover:left-0" />
                </Link>
              ) : (
                <a 
                  key={item.label} 
                  href={item.href}
                  className="text-white/70 hover:text-white transition-colors relative group"
                  data-testid={`nav-${item.label.toLowerCase().replace(/\s/g, '-')}`}
                >
                  {item.label}
                  <span className="absolute -bottom-1 left-1/2 w-0 h-[1px] bg-white transition-all duration-300 group-hover:w-full group-hover:left-0" />
                </a>
              )
            )}
            <button
              onClick={() => setIsLight(!isLight)}
              className="p-2 text-white/50 hover:text-white/80 transition-colors"
              data-testid="button-theme-toggle"
              title={isLight ? "Switch to dark mode" : "Switch to light mode"}
            >
              {isLight ? <Moon size={16} /> : <Sun size={16} />}
            </button>
            {user && (
              <div className="relative">
                <button
                  onClick={() => setShowNotifs(!showNotifs)}
                  className="p-2 text-white/50 hover:text-white/80 transition-colors relative"
                  data-testid="button-notifications"
                >
                  <Bell size={16} />
                  {(notifData?.unread || 0) > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-amber-500 text-[8px] font-mono text-black flex items-center justify-center">
                      {notifData!.unread > 9 ? "9+" : notifData!.unread}
                    </span>
                  )}
                </button>
                {showNotifs && (
                  <div className="absolute right-0 top-full mt-2 w-80 bg-[#0a0f18]/95 backdrop-blur-2xl border border-white/[0.08] rounded-xl shadow-2xl shadow-black/40 z-50 max-h-80 overflow-y-auto">
                    <div className="p-3 border-b border-white/[0.06]">
                      <h3 className="font-display text-sm text-white/70 italic">Wind Chimes</h3>
                    </div>
                    <div className="p-2">
                      {(notifData?.notifications || []).length === 0 ? (
                        <p className="text-center py-4 font-serif text-sm text-white/25 italic">All quiet in the garden</p>
                      ) : (
                        (notifData?.notifications || []).map((n: any) => (
                          <div key={n.id} className={`p-3 rounded-lg mb-1 ${n.isRead ? "opacity-60" : "bg-white/[0.03]"}`} data-testid={`notification-${n.id}`}>
                            <p className="font-serif text-xs text-white/60">{n.message}</p>
                            <span className="font-mono text-[8px] text-white/25 mt-1 block">
                              {n.createdAt ? new Date(n.createdAt).toLocaleDateString() : ""}
                            </span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
            <span className="w-[1px] h-4 bg-white/10" />
            {!isLoading && (
              isAuthenticated ? (
                <>
                  <Link href="/garden" className="text-white/70 hover:text-white transition-colors relative group" data-testid="nav-garden">
                    My Garden
                    <span className="absolute -bottom-1 left-1/2 w-0 h-[1px] bg-white transition-all duration-300 group-hover:w-full group-hover:left-0" />
                  </Link>
                  {isEditorOrEIC && (
                    <Link href="/editor-studio" className="text-white/70 hover:text-white transition-colors relative group" data-testid="nav-editor-studio">
                      Studio
                      <span className="absolute -bottom-1 left-1/2 w-0 h-[1px] bg-white transition-all duration-300 group-hover:w-full group-hover:left-0" />
                    </Link>
                  )}
                  {isEIC && (
                    <Link href="/eic-dashboard" className="text-[#c4a24d]/70 hover:text-[#c4a24d] transition-colors relative group" data-testid="nav-eic-dashboard">
                      Command
                      <span className="absolute -bottom-1 left-1/2 w-0 h-[1px] bg-[#c4a24d] transition-all duration-300 group-hover:w-full group-hover:left-0" />
                    </Link>
                  )}
                  <a href="/api/logout" className="text-white/40 hover:text-white/70 transition-all duration-300 text-[10px] lowercase tracking-[0.15em]" data-testid="nav-logout">
                    leave
                  </a>
                </>
              ) : (
                <Link href="/sign-in" className="text-white/70 hover:text-white transition-colors relative group" data-testid="nav-login">
                  Enter
                  <span className="absolute -bottom-1 left-1/2 w-0 h-[1px] bg-white transition-all duration-300 group-hover:w-full group-hover:left-0" />
                </Link>
              )
            )}
          </div>

          <button 
            onClick={() => setIsOpen(true)}
            className="lg:hidden p-2 text-white hover:bg-white/10 rounded-full transition-colors mix-blend-difference"
          >
            <Menu />
          </button>
        </div>
      </nav>

      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-[#0b101a]/95 backdrop-blur-xl flex flex-col items-center justify-center"
          >
            <button 
              onClick={() => setIsOpen(false)}
              className="absolute top-8 right-8 p-2 text-white/50 hover:text-white transition-colors"
            >
              <X size={32} />
            </button>

            <div className="flex flex-col gap-8 text-center">
              {menuItems.map((item, i) =>
                item.isPage ? (
                  <motion.div
                    key={item.label}
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: i * 0.1 }}
                  >
                    <Link
                      href={item.href}
                      onClick={() => setIsOpen(false)}
                      className="font-display text-4xl text-white/80 hover:text-white italic hover:scale-105 transition-transform"
                    >
                      {item.label}
                    </Link>
                  </motion.div>
                ) : (
                <motion.a 
                  key={item.label} 
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: i * 0.1 }}
                  className="font-display text-4xl text-white/80 hover:text-white italic hover:scale-105 transition-transform"
                >
                  {item.label}
                </motion.a>
                )
              )}
              <div className="w-12 h-[1px] bg-white/10 mx-auto my-4" />
              {!isLoading && (
                isAuthenticated ? (
                  <>
                    <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.5 }}>
                      <Link href="/garden" onClick={() => setIsOpen(false)} className="font-display text-4xl text-white/80 hover:text-white italic hover:scale-105 transition-transform">
                        My Garden
                      </Link>
                    </motion.div>
                    {isEditorOrEIC && (
                      <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.55 }}>
                        <Link href="/editor-studio" onClick={() => setIsOpen(false)} className="font-display text-4xl text-white/80 hover:text-white italic hover:scale-105 transition-transform">
                          Editorial Studio
                        </Link>
                      </motion.div>
                    )}
                    {isEIC && (
                      <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.6 }}>
                        <Link href="/eic-dashboard" onClick={() => setIsOpen(false)} className="font-display text-3xl text-[#c4a24d]/80 hover:text-[#c4a24d] italic hover:scale-105 transition-transform">
                          Editorial Command
                        </Link>
                      </motion.div>
                    )}
                    <motion.a 
                      href="/api/logout"
                      initial={{ y: 20, opacity: 0 }} 
                      animate={{ y: 0, opacity: 1 }} 
                      transition={{ delay: 0.65 }}
                      className="font-mono text-[11px] text-white/30 hover:text-white/60 lowercase tracking-[0.15em] transition-colors"
                    >
                      leave
                    </motion.a>
                  </>
                ) : (
                  <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.5 }}>
                    <Link
                      href="/sign-in"
                      onClick={() => setIsOpen(false)}
                      className="font-display text-4xl text-white/80 hover:text-white italic hover:scale-105 transition-transform"
                    >
                      Enter
                    </Link>
                  </motion.div>
                )
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
