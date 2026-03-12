import V2Layout from "@/components/V2Layout";
import { Link } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Pencil } from "lucide-react";

export default function V2Dashboard() {
  const { user } = useAuth();

  return (
    <V2Layout activeTab="garden">
      <div className="max-w-4xl mx-auto">
        <div className="mb-12">
          <h1 className="font-display text-3xl mb-2">
            {user ? `Welcome back, ${user.username}` : "Welcome to your Garden"}
          </h1>
          <p className="text-[var(--color-muted-foreground)]">
            Your private writing space
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          <Link href="/garden">
            <div className="bg-[var(--color-card)] border border-[var(--color-border)] rounded-lg p-6 hover:border-amber-500/30 transition-colors cursor-pointer">
              <Pencil className="w-5 h-5 mb-3 text-amber-500" />
              <h3 className="font-display text-lg mb-1">Write</h3>
              <p className="text-sm text-[var(--color-muted-foreground)]">Open your garden and start writing</p>
            </div>
          </Link>
          <Link href="/v2/reading-room">
            <div className="bg-[var(--color-card)] border border-[var(--color-border)] rounded-lg p-6 hover:border-amber-500/30 transition-colors cursor-pointer">
              <svg className="w-5 h-5 mb-3 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
              <h3 className="font-display text-lg mb-1">Reading Room</h3>
              <p className="text-sm text-[var(--color-muted-foreground)]">Discover and read published pieces</p>
            </div>
          </Link>
        </div>

        <div className="border-t border-[var(--color-border)] pt-8">
          <h2 className="font-display text-xl mb-4">Recent Activity</h2>
          <p className="text-sm text-[var(--color-muted-foreground)] italic">Your recent drafts and activity will appear here.</p>
        </div>
      </div>
    </V2Layout>
  );
}
