import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { Menu, X, Bell } from "lucide-react";
import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";

export default function Navigation() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [location] = useLocation();
  const shouldReduceMotion = useReducedMotion();
  const { user, isLoading, isAuthenticated } = useAuth();

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

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

  const [showNotifs, setShowNotifs] = useState(false);

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

  const publicMenuItems = [
    { label: "Journal", href: "/in-bloom" },
    { label: "The Studio", href: "/editor-studio" },
    { label: "Editions", href: "/editions/founding" },
    { label: "About", href: "/about" },
    { label: "Shop", href: "/marketplace" },
  ];

  const writerMenuItems = [
    { label: "Journal", href: "/in-bloom" },
    { label: "My Desk", href: "/garden" },
    { label: "Editions", href: "/editions/founding" },
    { label: "About", href: "/about" },
    { label: "Shop", href: "/marketplace" },
  ];

  const editorMenuItems = [
    { label: "Journal", href: "/in-bloom" },
    { label: "The Studio", href: "/editor-studio" },
    { label: "My Desk", href: "/garden" },
    { label: "Editions", href: "/editions/founding" },
    { label: "About", href: "/about" },
  ];

  const activeMenuItems = !isAuthenticated
    ? publicMenuItems
    : (isEditorOrEIC ? editorMenuItems : writerMenuItems);

  const navBg = scrolled
    ? "bg-[#F8F4EC]/95 backdrop-blur-md border-b border-[rgba(107,42,42,0.1)] shadow-sm shadow-[rgba(28,18,8,0.04)]"
    : "bg-transparent";

  return (
    <>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100] focus:rounded-lg focus:bg-[#F8F4EC] focus:px-4 focus:py-2 focus:font-mono focus:text-xs focus:tracking-widest focus:text-[#1C1208] focus:ring-2 focus:ring-[#6B2A2A]/50 focus:outline-none"
      >
        Skip to main content
      </a>
      <nav className={`fixed top-0 left-0 w-full z-50 transition-all duration-400 ${scrolled ? 'py-3' : 'py-6'} ${navBg}`}>
        <div className="max-w-7xl mx-auto px-6 md:px-12 flex justify-between items-center">
          {/* Logo */}
          <Link href="/" className="relative group flex items-center gap-3">
            <img src="/logo%20(2).png" alt="The Page Gallery Journal" className="h-8 w-auto" />
          </Link>

          {/* Desktop nav */}
          <div className="hidden lg:flex items-center gap-6">
            {activeMenuItems.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className={`font-mono text-[length:var(--text-label)] tracking-[0.15em] uppercase transition-colors relative group ${
                  location === item.href
                    ? "text-[#6B2A2A]"
                    : "text-[#1C1208]/60 hover:text-[#1C1208]"
                }`}
                data-testid={`nav-${item.label.toLowerCase().replace(/\s/g, '-')}`}
                aria-current={location === item.href ? "page" : undefined}
              >
                {item.label}
                <span className={`absolute -bottom-1 left-0 h-[1px] bg-[#6B2A2A] transition-all duration-300 ${location === item.href ? "w-full" : "w-0 group-hover:w-full"}`} />
              </Link>
            ))}
          </div>

          {/* Right side */}
          <div className="hidden lg:flex items-center gap-3">
            {user && (
              <div className="relative">
                <button
                  onClick={() => setShowNotifs(!showNotifs)}
                  className="p-2 text-[#1C1208]/50 hover:text-[#6B2A2A] transition-colors relative"
                  aria-label={`Notifications${(notifData?.unread || 0) > 0 ? `, ${notifData!.unread} unread` : ''}`}
                  data-testid="button-notifications"
                >
                  <Bell size={15} />
                  {(notifData?.unread || 0) > 0 && (
                    <span aria-hidden="true" className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-[#6B2A2A] text-[8px] font-mono text-[#F8F4EC] flex items-center justify-center">
                      {notifData!.unread > 9 ? "9+" : notifData!.unread}
                    </span>
                  )}
                </button>
                {showNotifs && (
                  <div className="absolute right-0 top-full mt-2 w-80 bg-[#F8F4EC] border border-[rgba(107,42,42,0.12)] rounded-xl shadow-lg z-50 max-h-80 overflow-y-auto">
                    <div className="p-3 border-b border-[rgba(107,42,42,0.08)]">
                      <h3 className="font-display text-sm text-[#1C1208] italic">Notifications</h3>
                    </div>
                    <div className="p-2">
                      {(notifData?.notifications || []).length === 0 ? (
                        <p className="text-center py-4 font-display text-sm text-[#1C1208]/50 italic">Nothing new at the desk.</p>
                      ) : (
                        (notifData?.notifications || []).map((n: any) => (
                          <div key={n.id} className={`p-3 rounded-lg mb-1 ${n.isRead ? "opacity-60" : "bg-[#F0EBE0]"}`} data-testid={`notification-${n.id}`}>
                            <p className="font-sans text-xs text-[#1C1208]/80">{n.message}</p>
                            <span className="font-mono text-[length:var(--text-label)] text-[#1C1208]/40 mt-1 block">
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

            {!isLoading && (
              isAuthenticated && user ? (
                <div className="relative group/user">
                  <button className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-[rgba(107,42,42,0.2)] hover:border-[rgba(107,42,42,0.4)] transition-all bg-[#F0EBE0] hover:bg-[#EDE7D9]" data-testid="nav-user-dropdown">
                    <div className="w-5 h-5 rounded-full bg-[#6B2A2A]/10 border border-[rgba(107,42,42,0.2)] flex items-center justify-center">
                      <span className="text-[10px] font-mono text-[#6B2A2A]">{(user as any).username?.slice(0, 1).toUpperCase() || (user as any).email?.slice(0, 1).toUpperCase() || "U"}</span>
                    </div>
                    <span className="font-mono text-[length:var(--text-label)] tracking-wider text-[#1C1208]/70 uppercase">
                      {(user as any).username || "Writer"}
                    </span>
                  </button>

                  <div className="absolute right-0 top-full mt-1 pt-1 w-48 bg-[#F8F4EC] border border-[rgba(107,42,42,0.12)] rounded-xl shadow-lg z-50 py-2 opacity-0 translate-y-2 pointer-events-none group-hover/user:opacity-100 group-hover/user:translate-y-0 group-hover/user:pointer-events-auto transition-all duration-200">
                    <Link href={`/writer/${user.id}`} className="block px-4 py-2 text-[#1C1208]/70 hover:text-[#6B2A2A] hover:bg-[#F0EBE0] transition-colors font-mono text-[length:var(--text-label)] tracking-[0.15em] uppercase">
                      Profile
                    </Link>
                    <Link href="/settings" className="block px-4 py-2 text-[#1C1208]/70 hover:text-[#6B2A2A] hover:bg-[#F0EBE0] transition-colors font-mono text-[length:var(--text-label)] tracking-[0.15em] uppercase">
                      Settings
                    </Link>
                    <div className="h-[1px] bg-[rgba(107,42,42,0.08)] my-1" />
                    <a href="/api/logout" className="block px-4 py-2 text-[#1C1208]/50 hover:text-[#6B2A2A] hover:bg-[#F0EBE0] transition-colors font-mono text-[length:var(--text-label)] tracking-[0.15em] uppercase" data-testid="nav-logout">
                      Sign Out
                    </a>
                  </div>
                </div>
              ) : (
                <Link
                  href="/sign-in"
                  className="px-5 py-2 bg-[#6B2A2A] text-[#F8F4EC] rounded-full font-mono text-[length:var(--text-label)] tracking-[0.15em] uppercase hover:bg-[#5a2222] transition-colors shadow-sm"
                  data-testid="nav-enter-studio"
                >
                  Enter The Studio
                </Link>
              )
            )}

            {!isLoading && !isAuthenticated && (
              <Link
                href="/sign-in"
                className="px-4 py-2 border border-[rgba(107,42,42,0.25)] text-[#1C1208]/70 rounded-full font-mono text-[length:var(--text-label)] tracking-[0.15em] uppercase hover:border-[rgba(107,42,42,0.5)] hover:text-[#6B2A2A] transition-all"
                data-testid="nav-login"
              >
                Sign In
              </Link>
            )}
          </div>

          <button
            onClick={() => setIsOpen(true)}
            className="lg:hidden p-2 text-[#1C1208]/70 hover:text-[#6B2A2A] hover:bg-[#F0EBE0] rounded-full transition-colors"
            aria-label="Open menu"
          >
            <Menu size={20} />
          </button>
        </div>
      </nav>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={shouldReduceMotion ? { duration: 0 } : { duration: 0.2 }}
            className="fixed inset-0 z-[60] bg-[#F8F4EC]/98 backdrop-blur-sm flex flex-col items-center justify-center"
          >
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-6 right-6 p-2 text-[#1C1208]/60 hover:text-[#6B2A2A] transition-colors"
              aria-label="Close menu"
            >
              <X size={24} />
            </button>

            <div className="flex flex-col gap-8 text-center">
              {activeMenuItems.map((item, i) => (
                <motion.div
                  key={item.label}
                  initial={shouldReduceMotion ? {} : { y: 16, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={shouldReduceMotion ? { duration: 0 } : { delay: i * 0.08 }}
                >
                  <Link
                    href={item.href}
                    onClick={() => setIsOpen(false)}
                    className={`font-display text-4xl italic hover:text-[#6B2A2A] transition-colors ${location === item.href ? "text-[#6B2A2A]" : "text-[#1C1208]/70"}`}
                    aria-current={location === item.href ? "page" : undefined}
                  >
                    {item.label}
                  </Link>
                </motion.div>
              ))}

              <div className="studio-section-divider my-2" />

              {!isLoading && (
                isAuthenticated && user ? (
                  <>
                    <motion.div initial={shouldReduceMotion ? {} : { y: 16, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={shouldReduceMotion ? { duration: 0 } : { delay: 0.4 }}>
                      <Link href={`/writer/${user.id}`} onClick={() => setIsOpen(false)} className="font-display text-2xl text-[#1C1208]/60 hover:text-[#6B2A2A] italic transition-colors">
                        Profile
                      </Link>
                    </motion.div>
                    <motion.a
                      href="/api/logout"
                      initial={shouldReduceMotion ? {} : { y: 16, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={shouldReduceMotion ? { duration: 0 } : { delay: 0.48 }}
                      className="font-mono text-[length:var(--text-label)] text-[#1C1208]/40 hover:text-[#6B2A2A] uppercase tracking-[0.15em] transition-colors"
                    >
                      Sign Out
                    </motion.a>
                  </>
                ) : (
                  <>
                    <motion.div initial={shouldReduceMotion ? {} : { y: 16, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={shouldReduceMotion ? { duration: 0 } : { delay: 0.4 }}>
                      <Link
                        href="/sign-in"
                        onClick={() => setIsOpen(false)}
                        className="font-display text-3xl text-[#1C1208]/60 hover:text-[#6B2A2A] italic transition-colors"
                      >
                        Sign In
                      </Link>
                    </motion.div>
                    <motion.div initial={shouldReduceMotion ? {} : { y: 16, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={shouldReduceMotion ? { duration: 0 } : { delay: 0.48 }}>
                      <Link
                        href="/sign-in"
                        onClick={() => setIsOpen(false)}
                        className="inline-block px-8 py-3 bg-[#6B2A2A] text-[#F8F4EC] rounded-full font-mono text-[length:var(--text-label)] uppercase tracking-[0.15em] hover:bg-[#5a2222] transition-colors"
                      >
                        Enter The Studio
                      </Link>
                    </motion.div>
                  </>
                )
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

