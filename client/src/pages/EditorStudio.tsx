import { useMemo, useState } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  ArrowLeft, Check, ExternalLink, FileCheck2, Filter, Search, 
  Send, Plus, ChevronRight, Inbox, Sprout, ClipboardCheck, 
  Clock, MessageSquare, Briefcase, Settings, BarChart3, User, BookOpen,
  BookMarked, X
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import type { Writing, Issue, GreenhouseEntry, PublishRequest, AuthorEditorConversation } from "@shared/schema";
import { stripHtml, wordCountFromContent } from "@/components/garden/RichEditor";
import { format } from "date-fns";
import { apiRequest } from "@/lib/queryClient";
import { toast } from "@/hooks/use-toast";
import LoadingScreen from "@/components/garden/LoadingScreen";

type StudioBucket = "all" | "triage" | "development" | "ready" | "published";

type WritingWithAuthor = Writing & {
  authorName: string | null;
  authorImage: string | null;
  resonanceCount: number;
};

type RequestWithTitle = PublishRequest & {
  writingTitle: string;
  authorName: string | null;
  editorName: string | null;
};

export default function EditorStudio() {
  const { user, isLoading } = useAuth();
  const [, navigate] = useLocation();
  const queryClient = useQueryClient();
  const [bucket, setBucket] = useState<StudioBucket>("all");
  const [search, setSearch] = useState("");
  const [selectedWritingId, setSelectedWritingId] = useState<string | null>(null);
  const [selectedIssueId, setSelectedIssueId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"pipeline" | "greenhouse" | "requests" | "issues">("pipeline");
  const [showNewIssueForm, setShowNewIssueForm] = useState(false);
  const [newIssueTitle, setNewIssueTitle] = useState("");
  const [newIssueSubtitle, setNewIssueSubtitle] = useState("");

  // Core Data Queries
  const { data: writings = [], isFetching: isFetchingWritings } = useQuery<WritingWithAuthor[]>({
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

  const { data: requests = [] } = useQuery<RequestWithTitle[]>({
    queryKey: ["/api/editor/requests"],
    enabled: !!user,
  });

  // Derived: filtered writings for pipeline
  const filteredWritings = useMemo(() => {
    let list = writings;
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(w =>
        w.title.toLowerCase().includes(q) ||
        (w.authorName ?? "").toLowerCase().includes(q) ||
        w.genre.toLowerCase().includes(q),
      );
    }
    if (bucket === "triage") return list.filter(w => w.readiness === "raw_seed");
    if (bucket === "development") return list.filter(w => w.readiness === "growing");
    if (bucket === "ready") return list.filter(w => w.readiness === "ready_to_show" || w.editorialAvailable);
    if (bucket === "published") return list.filter(w => w.isPublished);
    return list;
  }, [writings, bucket, search]);

  // Selected issue
  const selectedIssue = useMemo(() => issues.find(i => i.id === selectedIssueId) ?? null, [issues, selectedIssueId]);

  // Mutations
  const publishIssueMutation = useMutation({
    mutationFn: async (issueId: string) => {
      const res = await apiRequest("POST", `/api/editor/issues/${issueId}/publish`);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/editor/issues"] });
      toast({ title: "Issue published", description: "All pieces are now live." });
    },
    onError: () => {
      toast({ title: "Failed to publish issue", variant: "destructive" });
    },
  });

  const createIssueMutation = useMutation({
    mutationFn: async (data: { title: string; subtitle?: string }) => {
      const res = await apiRequest("POST", `/api/editor/issues`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/editor/issues"] });
      toast({ title: "Issue created" });
      setShowNewIssueForm(false);
      setNewIssueTitle("");
      setNewIssueSubtitle("");
      setActiveTab("issues");
    },
    onError: () => {
      toast({ title: "Failed to create issue", variant: "destructive" });
    },
  });

  if (isLoading) {
    return (
      <main className="min-h-screen studio-paper flex items-center justify-center">
        <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-[#1C1208]/40">Opening the studio…</p>
      </main>
    );
  }

  if (!isLoading && (!user || (user.role !== "editor" && user.role !== "editor_in_chief"))) {
    return (
      <main className="min-h-screen studio-paper flex items-center justify-center p-6 text-center">
        <div className="max-w-md space-y-4">
          <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-[#1C1208]/40">Access Denied</p>
          <h1 className="font-display text-3xl italic text-[#1C1208]">Editor Studio is restricted</h1>
          <button onClick={() => navigate("/garden")} className="rounded-full border border-[rgba(107,42,42,0.2)] bg-[#F0EBE0] px-6 py-2.5 font-mono text-[10px] uppercase tracking-wider text-[#6B2A2A] hover:bg-[#EDE7D9] transition-colors">Return to Desk</button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen studio-paper text-[#1C1208] flex flex-col">
      {/* Universal Header */}
      <header className="border-b border-[rgba(107,42,42,0.1)] bg-[#F0EBE0] px-6 py-4 sticky top-0 z-10 shadow-sm shadow-[rgba(28,18,8,0.04)]">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="bg-[#6B2A2A] text-[#F8F4EC] p-2 rounded-lg"><Briefcase size={20} /></div>
            <div>
              <h1 className="font-display text-lg font-bold italic text-[#1C1208]">Editor Studio</h1>
              <p className="font-mono text-[10px] text-[#1C1208]/40 uppercase tracking-widest">The Desk / The Page Gallery</p>
            </div>
          </div>
          <nav className="flex items-center gap-1 bg-[#1C1208]/5 p-1 rounded-xl">
            {[
              { id: "pipeline", label: "Pipeline", icon: Inbox },
              { id: "greenhouse", label: "Shortlist", icon: Sprout },
              { id: "requests", label: "Requests", icon: Send },
              { id: "issues", label: "Issues", icon: ClipboardCheck }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-mono text-[10px] uppercase tracking-wider transition-all ${activeTab === tab.id ? "bg-[#F8F4EC] shadow-sm text-[#6B2A2A]" : "text-[#1C1208]/50 hover:text-[#1C1208]/80"}`}
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
          {/* View Search/Filter — only relevant for Pipeline */}
          {activeTab === "pipeline" && (
          <div className="flex items-center gap-3">
            <div className="relative flex-1">
              <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#1C1208]/30" />
              <input
                type="text"
                placeholder="Search by title, author, or genre..."
                className="w-full bg-[#F8F4EC] border border-[rgba(107,42,42,0.15)] rounded-2xl py-3 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-[#6B2A2A]/10 placeholder-[#1C1208]/30 font-sans"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <button className="p-3 bg-[#F0EBE0] border border-[rgba(107,42,42,0.12)] rounded-2xl hover:bg-[#EDE7D9] transition-colors">
              <Filter size={18} className="text-[#1C1208]/50" />
            </button>
          </div>
          )}

          {/* Dynamic Content Based on Tab */}
          <div className="bg-[#F0EBE0] rounded-2xl border border-[rgba(107,42,42,0.1)] shadow-sm overflow-hidden min-h-[600px]">
            {activeTab === "pipeline" && (
              <div className="p-8">
                <div className="flex items-center justify-between mb-8">
                  <h2 className="font-display text-2xl italic text-[#1C1208]">Submissions Desk</h2>
                  <div className="flex gap-2">
                    {['all', 'triage', 'development', 'ready', 'published'].map(f => (
                      <button key={f} onClick={() => setBucket(f as any)} className={`px-3 py-1.5 rounded-full font-mono text-[9px] uppercase tracking-widest border transition-colors ${bucket === f ? "bg-[#6B2A2A] text-[#F8F4EC] border-[#6B2A2A]" : "border-[rgba(107,42,42,0.15)] text-[#1C1208]/40 hover:border-[#6B2A2A]/40"}`}>
                        {f}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="space-y-3">
                  {isFetchingWritings ? (
                    <div className="text-center py-20 font-handwritten text-xl text-[#1C1208]/30">Scanning the desk for submissions…</div>
                  ) : filteredWritings.length === 0 ? (
                    <div className="text-center py-20 font-mono text-[10px] uppercase tracking-widest text-[#1C1208]/30">No pieces match this filter</div>
                  ) : (
                    filteredWritings.map(w => (
                      <div
                        key={w.id}
                        onClick={() => { setSelectedWritingId(w.id); setActiveTab("pipeline"); }}
                        className={`studio-index-card flex items-start justify-between p-4 rounded-xl cursor-pointer transition-all ${selectedWritingId === w.id ? "bg-[#6B2A2A] text-[#F8F4EC] border-[#6B2A2A]" : "hover:border-[rgba(107,42,42,0.3)]"}`}
                      >
                        <div className="space-y-1 flex-1 min-w-0">
                          <p className={`text-sm font-medium truncate ${selectedWritingId === w.id ? "text-[#F8F4EC]" : "text-[#1C1208]"}`}>{w.title}</p>
                          {w.authorName && (
                            <p className={`text-[10px] font-mono ${selectedWritingId === w.id ? "text-[#F8F4EC]/60" : "text-[#1C1208]/40"}`}>{w.authorName}</p>
                          )}
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className={`px-2 py-0.5 rounded-full font-mono text-[9px] uppercase tracking-widest border ${selectedWritingId === w.id ? "border-[#F8F4EC]/20 text-[#F8F4EC]/70" : "border-[rgba(107,42,42,0.15)] text-[#1C1208]/40"}`}>{w.genre}</span>
                            <span className={`px-2 py-0.5 rounded-full font-mono text-[9px] uppercase tracking-widest border ${selectedWritingId === w.id ? "border-[#F8F4EC]/20 text-[#F8F4EC]/70" : "border-[rgba(107,42,42,0.15)] text-[#1C1208]/40"}`}>{w.readiness.replace(/_/g, " ")}</span>
                            {w.editorialAvailable && (
                              <span className={`px-2 py-0.5 rounded-full font-mono text-[9px] uppercase tracking-widest ${selectedWritingId === w.id ? "bg-[#F8F4EC]/20 text-[#F8F4EC]" : "bg-[#8A8F6F]/10 border border-[#8A8F6F]/30 text-[#8A8F6F]"}`}>open</span>
                            )}
                          </div>
                        </div>
                        <div className={`text-[10px] font-mono ml-4 shrink-0 ${selectedWritingId === w.id ? "text-[#F8F4EC]/50" : "text-[#1C1208]/30"}`}>
                          {w.createdAt && !isNaN(new Date(w.createdAt).getTime()) ? format(new Date(w.createdAt), "MMM d") : ""}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {activeTab === "greenhouse" && (
              <div className="p-8">
                <h2 className="font-display text-2xl italic text-[#1C1208] mb-2">The Shortlist</h2>
                <p className="text-sm text-[#1C1208]/50 mb-8">Your private editorial shortlist. No authors are notified of activity here.</p>
                {greenhouse.length === 0 ? (
                  <div className="text-center py-20 font-handwritten text-xl text-[#1C1208]/30">Nothing on the shortlist yet</div>
                ) : (
                  <div className="space-y-3">
                    {greenhouse.map(entry => {
                      const writing = writings.find(w => w.id === entry.writingId);
                      return (
                        <div key={entry.id} className="studio-index-card flex items-start justify-between p-4 rounded-xl">
                          <div className="space-y-1 flex-1 min-w-0">
                            <p className="text-sm font-medium truncate text-[#1C1208]">{writing?.title ?? entry.writingId}</p>
                            {writing?.authorName && (
                              <p className="text-[10px] font-mono text-[#1C1208]/40">{writing.authorName}</p>
                            )}
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="px-2 py-0.5 rounded-full font-mono text-[9px] uppercase tracking-widest border border-[rgba(107,42,42,0.15)] text-[#1C1208]/40">{entry.stage}</span>
                              <span className="px-2 py-0.5 rounded-full font-mono text-[9px] uppercase tracking-widest border border-[rgba(107,42,42,0.15)] text-[#1C1208]/40">{entry.priority}</span>
                              {entry.themeFolder && (
                                <span className="px-2 py-0.5 rounded-full font-mono text-[9px] uppercase tracking-widest border border-[rgba(107,42,42,0.15)] text-[#1C1208]/40">{entry.themeFolder}</span>
                              )}
                            </div>
                            {entry.internalNote && (
                              <p className="font-handwritten text-base text-[#6B2A2A]/70 mt-1">{entry.internalNote}</p>
                            )}
                          </div>
                          <div className="text-[10px] font-mono ml-4 shrink-0 text-[#1C1208]/30">
                            {entry.createdAt ? format(new Date(entry.createdAt), "MMM d") : ""}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {activeTab === "requests" && (
              <div className="p-8">
                <div className="flex items-center justify-between mb-8">
                  <h2 className="font-display text-2xl italic text-[#1C1208]">Publish Requests</h2>
                  <span className="font-mono text-[10px] uppercase tracking-widest text-[#1C1208]/40">{requests.length} total</span>
                </div>
                {requests.length === 0 ? (
                  <div className="text-center py-20 font-handwritten text-xl text-[#1C1208]/30">No publish requests yet</div>
                ) : (
                  <div className="space-y-3">
                    {requests.map(req => (
                      <div key={req.id} className="studio-index-card flex items-center justify-between p-4 rounded-xl">
                        <div className="space-y-0.5">
                          <p className="text-sm font-medium text-[#1C1208]">{req.writingTitle}</p>
                          {req.authorName && (
                            <p className="text-[10px] font-mono text-[#1C1208]/40">{req.authorName}</p>
                          )}
                          {req.proposedDate && (
                            <p className="text-[10px] font-mono text-[#1C1208]/40">Proposed: {req.proposedDate}</p>
                          )}
                        </div>
                        <span className={`px-3 py-1 rounded-full font-mono text-[9px] uppercase tracking-widest border ${req.status === "approved" ? "bg-[#8A8F6F]/10 border-[#8A8F6F]/30 text-[#8A8F6F]" : req.status === "rejected" ? "bg-[#6B2A2A]/8 border-[#6B2A2A]/20 text-[#6B2A2A]" : "border-[rgba(107,42,42,0.15)] text-[#1C1208]/50"}`}>
                          {req.status}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === "issues" && (
              <div className="p-8">
                <div className="flex items-center justify-between mb-8">
                  <h2 className="font-display text-2xl italic text-[#1C1208]">Issues</h2>
                  <span className="font-mono text-[10px] uppercase tracking-widest text-[#1C1208]/40">{issues.length} total</span>
                </div>
                {issues.length === 0 ? (
                  <div className="text-center py-20 font-handwritten text-xl text-[#1C1208]/30">No issues created yet</div>
                ) : (
                  <div className="space-y-3">
                    {issues.map(issue => (
                      <div
                        key={issue.id}
                        onClick={() => setSelectedIssueId(selectedIssueId === issue.id ? null : issue.id)}
                        className={`studio-index-card flex items-center justify-between p-4 rounded-xl cursor-pointer transition-all ${selectedIssueId === issue.id ? "bg-[#6B2A2A] text-[#F8F4EC] border-[#6B2A2A]" : "hover:border-[rgba(107,42,42,0.3)]"}`}
                      >
                        <div className="space-y-0.5">
                          <p className={`text-sm font-medium ${selectedIssueId === issue.id ? "text-[#F8F4EC]" : "text-[#1C1208]"}`}>{issue.title}</p>
                          {issue.subtitle && (
                            <p className={`text-xs ${selectedIssueId === issue.id ? "text-[#F8F4EC]/60" : "text-[#1C1208]/50"}`}>{issue.subtitle}</p>
                          )}
                          {issue.publishDate && (
                            <p className={`text-[10px] font-mono ${selectedIssueId === issue.id ? "text-[#F8F4EC]/50" : "text-[#1C1208]/40"}`}>{format(new Date(issue.publishDate), "MMM d, yyyy")}</p>
                          )}
                        </div>
                        <span className={`px-3 py-1 rounded-full font-mono text-[9px] uppercase tracking-widest border ${issue.status === "published" ? "bg-[#8A8F6F]/10 border-[#8A8F6F]/30 text-[#8A8F6F]" : issue.status === "archived" ? "bg-[#1C1208]/5 border-[#1C1208]/10 text-[#1C1208]/40" : selectedIssueId === issue.id ? "border-[#F8F4EC]/20 text-[#F8F4EC]/70" : "border-[rgba(107,42,42,0.15)] text-[#1C1208]/50"}`}>
                          {issue.status}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </section>

        {/* Action Sidebar */}
        <aside className="space-y-6">
          {/* New Issue inline form */}
          {showNewIssueForm ? (
            <div className="bg-[#F0EBE0] rounded-2xl border border-[rgba(107,42,42,0.1)] p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#1C1208]/40">New Issue</h3>
                <button onClick={() => setShowNewIssueForm(false)} className="text-[#1C1208]/30 hover:text-[#6B2A2A] transition-colors">
                  <X size={14} />
                </button>
              </div>
              <input
                type="text"
                placeholder="Issue title *"
                value={newIssueTitle}
                onChange={e => setNewIssueTitle(e.target.value)}
                className="w-full border border-[rgba(107,42,42,0.15)] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#6B2A2A]/10 bg-[#F8F4EC] font-sans"
              />
              <input
                type="text"
                placeholder="Subtitle (optional)"
                value={newIssueSubtitle}
                onChange={e => setNewIssueSubtitle(e.target.value)}
                className="w-full border border-[rgba(107,42,42,0.15)] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#6B2A2A]/10 bg-[#F8F4EC] font-sans"
              />
              <button
                onClick={() => {
                  const payload: { title: string; subtitle?: string } = { title: newIssueTitle.trim() };
                  if (newIssueSubtitle.trim()) payload.subtitle = newIssueSubtitle.trim();
                  createIssueMutation.mutate(payload);
                }}
                disabled={!newIssueTitle.trim() || createIssueMutation.isPending}
                className="w-full bg-[#6B2A2A] text-[#F8F4EC] rounded-xl py-2.5 font-mono text-[10px] uppercase tracking-widest disabled:opacity-40 hover:bg-[#5a2222] transition-colors"
              >
                {createIssueMutation.isPending ? "Creating…" : "Create Issue"}
              </button>
            </div>
          ) : (
            <div className="bg-[#6B2A2A] text-[#F8F4EC] rounded-2xl p-6 space-y-4">
              <h3 className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#F8F4EC]/60">Quick Actions</h3>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => { setShowNewIssueForm(true); setActiveTab("issues"); }}
                  className="flex flex-col items-center gap-2 p-4 bg-[#F8F4EC]/10 rounded-xl hover:bg-[#F8F4EC]/20 transition-all"
                >
                  <Plus size={20} />
                  <span className="text-[9px] font-mono uppercase">New Issue</span>
                </button>
                <button className="flex flex-col items-center gap-2 p-4 bg-[#F8F4EC]/10 rounded-xl hover:bg-[#F8F4EC]/20 transition-all">
                  <Clock size={20} />
                  <span className="text-[9px] font-mono uppercase">Deadlines</span>
                </button>
              </div>
            </div>
          )}

          {/* Selected issue detail + publish */}
          {selectedIssue && activeTab === "issues" ? (
            <div className="bg-[#F0EBE0] rounded-2xl border border-[rgba(107,42,42,0.1)] p-6 shadow-sm space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#1C1208]/40 mb-1">Selected Issue</h3>
                  <p className="font-display italic text-base text-[#1C1208] leading-snug">{selectedIssue.title}</p>
                  {selectedIssue.subtitle && <p className="text-xs text-[#1C1208]/50 mt-0.5">{selectedIssue.subtitle}</p>}
                </div>
                <button onClick={() => setSelectedIssueId(null)} className="text-[#1C1208]/30 hover:text-[#6B2A2A] transition-colors mt-0.5 ml-2 shrink-0">
                  <X size={14} />
                </button>
              </div>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-[#1C1208]/40 font-mono">Status</span>
                  <span className={`font-mono uppercase text-[9px] px-2 py-0.5 rounded-full border ${selectedIssue.status === "published" ? "bg-[#8A8F6F]/10 border-[#8A8F6F]/30 text-[#8A8F6F]" : selectedIssue.status === "archived" ? "bg-[#1C1208]/5 border-[#1C1208]/10 text-[#1C1208]/40" : "border-[rgba(107,42,42,0.15)] text-[#1C1208]/50"}`}>{selectedIssue.status}</span>
                </div>
                {selectedIssue.publishDate && (
                  <div className="flex justify-between">
                    <span className="text-[#1C1208]/40 font-mono">Publish date</span>
                    <span className="font-mono text-[10px] text-[#1C1208]">{format(new Date(selectedIssue.publishDate), "MMM d, yyyy")}</span>
                  </div>
                )}
                {selectedIssue.themeNote && (
                  <div className="pt-1">
                    <span className="text-[#1C1208]/40 font-mono text-[10px]">Theme</span>
                    <p className="font-handwritten text-base text-[#6B2A2A]/70 mt-0.5">{selectedIssue.themeNote}</p>
                  </div>
                )}
              </div>
              {selectedIssue.status !== "published" && (
                <button
                  onClick={() => publishIssueMutation.mutate(selectedIssue.id)}
                  disabled={publishIssueMutation.isPending}
                  className="w-full bg-[#6B2A2A] text-[#F8F4EC] rounded-xl py-2.5 font-mono text-[10px] uppercase tracking-widest hover:bg-[#5a2222] transition-colors disabled:opacity-40 flex items-center justify-center gap-2"
                >
                  <BookMarked size={14} />
                  {publishIssueMutation.isPending ? "Publishing…" : "Publish Issue"}
                </button>
              )}
              {selectedIssue.status === "published" && (
                <div className="flex items-center gap-2 text-[#8A8F6F] bg-[#8A8F6F]/8 rounded-xl px-4 py-2.5">
                  <Check size={14} />
                  <span className="font-mono text-[10px] uppercase tracking-widest">Published</span>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-[#F0EBE0] rounded-2xl border border-[rgba(107,42,42,0.1)] p-6 shadow-sm">
              <h3 className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#1C1208]/40 mb-6">Desk Insights</h3>
              <div className="space-y-4">
                {[
                  { label: "Total Submissions", value: `${writings.length}` },
                  { label: "Ready to publish", value: `${writings.filter(w => w.readiness === "ready_to_show").length}` },
                  { label: "Open Issues", value: `${issues.filter(i => i.status === "draft").length} Draft` }
                ].map(stat => (
                  <div key={stat.label} className="flex items-center justify-between">
                    <span className="text-xs text-[#1C1208]/50 font-mono">{stat.label}</span>
                    <span className="font-display italic text-sm text-[#6B2A2A]">{stat.value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </aside>
      </div>
    </main>
  );
}
