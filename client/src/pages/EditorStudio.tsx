import { useMemo, useState } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  ArrowLeft, Check, ExternalLink, FileCheck2, Filter, Search, 
  Send, Plus, ChevronRight, Inbox, Sprout, ClipboardCheck, 
  Clock, MessageSquare, Briefcase, Settings, BarChart3, User, BookOpen
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import type { Writing, Issue, GreenhouseEntry, PublishRequest, AuthorEditorConversation } from "@shared/schema";
import { stripHtml, wordCountFromContent } from "@/components/garden/RichEditor";
import { format } from "date-fns";

type StudioBucket = "all" | "triage" | "development" | "ready" | "published";

export default function EditorStudio() {
  const { user, isLoading } = useAuth();
  const [, navigate] = useLocation();
  const queryClient = useQueryClient();
  const [bucket, setBucket] = useState<StudioBucket>("all");
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"pipeline" | "greenhouse" | "requests" | "issues">("pipeline");

  // Core Data Queries
  const { data: writings = [], isFetching: isFetchingWritings } = useQuery<Writing[]>({
    queryKey: ["/api/editor/garden-stream"],
    enabled: !!user,
  });

  const { data: issues = [] } = useQuery<Issue[]>({
    queryKey: ["/api/editor/issues"],
    enabled: !!user,
  });

  const { data: greenhouse = [] } = useQuery<GreenhouseEntry[]>({
    queryKey: ["/api/editor/greenhouse"],
    enabled: !!user,
  });

  const { data: requests = [] } = useQuery<PublishRequest[]>({
    queryKey: ["/api/editor/requests"],
    enabled: !!user,
  });

  if (!isLoading && (!user || (user.role !== "editor" && user.role !== "editor_in_chief"))) {
    return (
      <main className="min-h-screen bg-[#f7f4ee] flex items-center justify-center p-6 text-center">
        <div className="max-w-md space-y-4">
          <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-black/50">Access Denied</p>
          <h1 className="text-3xl font-semibold">Editor Studio is restricted</h1>
          <button onClick={() => navigate("/garden")} className="rounded-lg border border-black/10 bg-white px-5 py-2.5 font-mono text-[10px] uppercase">Return to Garden</button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f7f4ee] text-[#1f1d18] flex flex-col">
      {/* Universal Header */}
      <header className="border-b border-black/5 bg-white px-6 py-4 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="bg-black text-white p-2 rounded-lg"><Briefcase size={20} /></div>
            <div>
              <h1 className="text-lg font-semibold tracking-tight">Editor Studio</h1>
              <p className="text-[10px] font-mono text-black/40 uppercase tracking-widest">Control Room / The Page Gallery</p>
            </div>
          </div>
          <nav className="flex items-center gap-1 bg-black/[0.03] p-1 rounded-xl">
            {[
              { id: "pipeline", label: "Pipeline", icon: Inbox },
              { id: "greenhouse", label: "Greenhouse", icon: Sprout },
              { id: "requests", label: "Requests", icon: Send },
              { id: "issues", label: "Issues", icon: ClipboardCheck }
            ].map(tab => (
              <button 
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-mono text-[10px] uppercase tracking-wider transition-all ${activeTab === tab.id ? "bg-white shadow-sm text-black" : "text-black/40 hover:text-black/60"}`}
              >
                <tab.icon size={12} />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </header>

      <div className="flex-1 max-w-7xl mx-auto w-full p-6 grid lg:grid-cols-[1fr,400px] gap-6">
        <section className="space-y-6">
          {/* View Search/Filter */}
          <div className="flex items-center gap-3">
            <div className="relative flex-1">
              <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-black/30" />
              <input 
                type="text" 
                placeholder="Search by title, author, or genre..."
                className="w-full bg-white border border-black/5 rounded-2xl py-3 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-black/5"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <button className="p-3 bg-white border border-black/5 rounded-2xl hover:bg-black/[0.02]">
              <Filter size={18} className="text-black/60" />
            </button>
          </div>

          {/* Dynamic Content Based on Tab */}
          <div className="bg-white rounded-3xl border border-black/5 shadow-sm overflow-hidden min-h-[600px]">
            {activeTab === "pipeline" && (
              <div className="p-8">
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-2xl font-semibold">Garden Stream</h2>
                  <div className="flex gap-2">
                    {['all', 'triage', 'development', 'ready'].map(f => (
                      <button key={f} onClick={() => setBucket(f as any)} className={`px-3 py-1.5 rounded-full font-mono text-[9px] uppercase tracking-widest border ${bucket === f ? "bg-black text-white border-black" : "border-black/10 text-black/40"}`}>
                        {f}
                      </button>
                    ))}
                  </div>
                </div>
                {/* Writing Cards - Mock list for structure */}
                <div className="grid gap-4">
                   {writings.length === 0 ? (
                     <div className="text-center py-20 text-black/30 font-mono text-[10px] uppercase tracking-widest">Scanning Garden for seeds...</div>
                   ) : (
                     <div className="space-y-3">
                       {/* Real item mapping would go here */}
                     </div>
                   )}
                </div>
              </div>
            )}

            {activeTab === "greenhouse" && (
              <div className="p-8">
                <h2 className="text-2xl font-semibold mb-2">The Greenhouse</h2>
                <p className="text-sm text-black/50 mb-8">Your private editorial shortlist. No authors are notified of activity here.</p>
                <div className="grid sm:grid-cols-2 gap-4">
                   {/* Greenhouse grouping slots */}
                   {['Winter 2026', 'Spring 2026', 'Unsorted'].map(group => (
                     <div key={group} className="bg-[#f9f8f4] p-5 rounded-2xl border border-black/5">
                       <h3 className="font-mono text-[10px] uppercase tracking-widest text-black/40 mb-4">{group}</h3>
                       <div className="text-center py-10 border border-dashed border-black/10 rounded-xl">
                         <Sprout size={20} className="mx-auto text-black/10 mb-2" />
                         <p className="text-[10px] font-mono text-black/20 uppercase">Drag seeds here</p>
                       </div>
                     </div>
                   ))}
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Action Sidebar */}
        <aside className="space-y-6">
          <div className="bg-black text-white rounded-3xl p-6 space-y-4">
             <h3 className="font-mono text-[10px] uppercase tracking-[0.2em] opacity-50">Quick Actions</h3>
             <div className="grid grid-cols-2 gap-2">
                <button className="flex flex-col items-center gap-2 p-4 bg-white/10 rounded-2xl hover:bg-white/20 transition-all">
                  <Plus size={20} />
                  <span className="text-[9px] font-mono uppercase">New Issue</span>
                </button>
                <button className="flex flex-col items-center gap-2 p-4 bg-white/10 rounded-2xl hover:bg-white/20 transition-all">
                  <Clock size={20} />
                  <span className="text-[9px] font-mono uppercase">Deadlines</span>
                </button>
             </div>
          </div>

          <div className="bg-white rounded-3xl border border-black/5 p-6 shadow-sm">
             <h3 className="font-mono text-[10px] uppercase tracking-[0.2em] text-black/40 mb-6">Active Insights</h3>
             <div className="space-y-4">
                {[
                  { label: "Growth Trend", value: "+12% New Seeds", color: "#29493d" },
                  { label: "Ready Queue", value: "8 Pieces", color: "#d97706" },
                  { label: "Response Time", value: "2.4 Days", color: "#0284c7" }
                ].map(stat => (
                  <div key={stat.label} className="flex items-center justify-between">
                    <span className="text-xs text-black/60 font-mono">{stat.label}</span>
                    <span className="text-xs font-semibold">{stat.value}</span>
                  </div>
                ))}
             </div>
          </div>
        </aside>
      </div>
    </main>
  );
}
