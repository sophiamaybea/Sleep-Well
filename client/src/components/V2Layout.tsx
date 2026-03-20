import { Link } from "wouter";
import { useState } from "react";
import { Bell, Pencil } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

interface V2LayoutProps {
  children: React.ReactNode;
  activeTab?: "garden" | "reading" | "community";
}

export default function V2Layout({ children, activeTab = "garden" }: V2LayoutProps) {
  const { user } = useAuth();

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
      <header className="flex items-center justify-between px-6 py-3 border-b border-[var(--color-border)]">
        <div className="flex items-center gap-3">
          <span className="font-display text-lg tracking-wide">The Page Gallery Journal</span>
        </div>
        <div className="flex items-center gap-4">
          <button className="relative p-2 text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)]">
            <Bell size={18} />
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-[var(--color-accent)] text-[var(--color-accent-foreground)] text-[10px] rounded-full flex items-center justify-center font-bold">3</span>
          </button>
          <div className="w-8 h-8 rounded-full bg-[var(--color-card)] border border-[var(--color-border)] flex items-center justify-center text-xs font-bold">
            {initials}
          </div>
        </div>
      </header>

      <nav className="flex gap-0 px-6 border-b border-[var(--color-border)]" aria-label="Main navigation">
        {tabs.map((tab) => (
          <Link
            key={tab.id}
            href={tab.href}
            className={`px-6 py-3 text-center border-b-2 transition-colors ${
              activeTab === tab.id
                ? "border-[var(--color-accent)] text-[var(--color-foreground)]"
                : "border-transparent text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)]"
            }`}
          >
            <div className="text-sm font-medium">{tab.label}</div>
            <div className="text-[11px] text-[var(--color-muted-foreground)]">{tab.sublabel}</div>
          </Link>
        ))}
      </nav>

      <main className="relative">
        {children}
      </main>

      <Link
        href="/garden"
        className="fixed bottom-8 right-8 w-14 h-14 rounded-full bg-[var(--color-card)] border border-[var(--color-border)] flex items-center justify-center shadow-lg hover:bg-[var(--color-muted)] transition-colors z-50"
      >
        <Pencil size={20} className="text-[var(--color-accent)]" />
      </Link>
    </div>
  );
}