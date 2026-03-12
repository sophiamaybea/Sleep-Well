import { Link, useRoute } from "wouter";
import { useState } from "react";
import { Bell, Moon, Sun, Pencil } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";

interface V2LayoutProps {
  children: React.ReactNode;
  activeTab?: "garden" | "reading" | "community";
}

export default function V2Layout({ children, activeTab = "garden" }: V2LayoutProps) {
  const { user, isAuthenticated } = useAuth();
  const [isLight, setIsLight] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("theme") === "light";
    }
    return false;
  });

  const toggleTheme = () => {
    setIsLight(!isLight);
    if (!isLight) {
      document.documentElement.classList.add("light-theme");
      localStorage.setItem("theme", "light");
    } else {
      document.documentElement.classList.remove("light-theme");
      localStorage.setItem("theme", "dark");
    }
  };

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

  const initials = user?.username
    ? user.username.slice(0, 2).toUpperCase()
    : "??";

  const tabs = [
    { id: "garden" as const, label: "My Garden", sublabel: "Private workspace", href: "/v2" },
    { id: "reading" as const, label: "Reading Room", sublabel: "Discover & read", href: "/v2/reading-room" },
    { id: "community" as const, label: "Community", sublabel: "Circles & events", href: "/v2/community" },
  ];

  return (
    <div className="min-h-screen bg-[var(--color-background)] text-[var(--color-foreground)]">
      {/* Top header bar */}
      <header className="flex items-center justify-between px-6 py-3 border-b border-[var(--color-border)]">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 flex items-center justify-center">
            <svg width="24" height="32" viewBox="0 0 24 32" fill="none">
              <line x1="12" y1="32" x2="12" y2="8" stroke="var(--color-accent)" strokeWidth="1.5" />
              <line x1="12" y1="16" x2="6" y2="10" stroke="var(--color-accent)" strokeWidth="1.5" />
              <line x1="12" y1="12" x2="18" y2="6" stroke="var(--color-accent)" strokeWidth="1.5" />
              <circle cx="12" cy="4" r="3" stroke="var(--color-accent)" strokeWidth="1.5" fill="none" />
            </svg>
          </div>
          <span className="font-display text-lg tracking-wide">The Page Gallery Journal</span>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={toggleTheme}
            className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-[var(--color-border)] text-sm text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)] transition-colors"
          >
            <span className="text-xs">Quiet Hours</span>
            <div className="w-8 h-4 rounded-full bg-[var(--color-muted)] relative">
              <div className="w-3 h-3 rounded-full bg-[var(--color-accent)] absolute top-0.5 left-0.5 transition-transform" />
            </div>
          </button>

          <button className="relative p-2 text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)]">
            <Bell size={18} />
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-[var(--color-accent)] text-[var(--color-accent-foreground)] text-[10px] rounded-full flex items-center justify-center font-bold">3</span>
          </button>

          <button className="w-8 h-8 rounded-full bg-[var(--color-card)] border border-[var(--color-border)] flex items-center justify-center text-xs font-bold">
            {initials}
          </button>
        </div>
      </header>

      {/* Tab navigation */}
      <nav className="flex gap-0 px-6 border-b border-[var(--color-border)]" aria-label="Main navigation">
        {tabs.map((tab) => (
          <Link key={tab.id} href={tab.href}>
            <a
              className={`px-6 py-3 text-center border-b-2 transition-colors ${
                activeTab === tab.id
                  ? "border-[var(--color-accent)] text-[var(--color-foreground)]"
                  : "border-transparent text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)]"
              }`}
            >
              <div className="text-sm font-medium">{tab.label}</div>
              <div className="text-[11px] text-[var(--color-muted-foreground)]">{tab.sublabel}</div>
            </a>
          </Link>
        ))}
      </nav>

      {/* Main content */}
      <main className="relative">
        {children}
      </main>

      {/* Floating write button */}
      <Link href="/garden">
        <a className="fixed bottom-8 right-8 w-14 h-14 rounded-full bg-[var(--color-card)] border border-[var(--color-border)] flex items-center justify-center shadow-lg hover:bg-[var(--color-muted)] transition-colors z-50">
          <Pencil size={20} className="text-[var(--color-accent)]" />
        </a>
      </Link>
    </div>
  );
}