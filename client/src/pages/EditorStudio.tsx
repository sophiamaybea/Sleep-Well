import { useMemo, useState } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Check, ExternalLink, FileCheck2, Filter, Search } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import type { Writing } from "@shared/schema";
import { stripHtml, wordCountFromContent } from "@/components/garden/RichEditor";

type StudioBucket = "all" | "triage" | "development" | "ready";

function getBucketForWriting(writing: Writing): Exclude<StudioBucket, "all"> {
  const title = (writing.title || "").trim().toLowerCase();
  const hasRealTitle = title.length > 0 && title !== "untitled";
  const readiness = writing.readiness || "raw_seed";

  if (!hasRealTitle || readiness === "raw_seed") return "triage";
  if (readiness === "growing") return "development";
  return "ready";
}

export default function EditorStudio() {
  const { user, isLoading } = useAuth();
  const [, navigate] = useLocation();
  const [bucket, setBucket] = useState<StudioBucket>("all");
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [editorNotes, setEditorNotes] = useState("");
  const [checks, setChecks] = useState<Record<string, boolean>>({
    intention: false,
    language: false,
    shape: false,
    ending: false,
  });

  const { data: writings = [], isFetching } = useQuery<Writing[]>({
    queryKey: ["/api/writings"],
    enabled: !!user,
    queryFn: async () => {
      const res = await fetch("/api/writings", { credentials: "include" });
      if (!res.ok) throw new Error("Failed to load writings");
      return res.json();
    },
  });

  if (!isLoading && (!user || (user.role !== "editor" && user.role !== "editor_in_chief"))) {
    return (
      <main className="min-h-screen bg-[#f7f4ee] text-[#1f1d18] flex items-center justify-center px-6">
        <div className="max-w-md text-center space-y-4">
          <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-black/40">Restricted Space</p>
          <h1 className="text-3xl font-semibold tracking-tight text-black/90">Editor Studio is for editorial roles</h1>
          <button
            onClick={() => navigate("/garden")}
            className="inline-flex items-center gap-2 rounded-lg border border-black/10 bg-white px-5 py-2.5 font-mono text-[10px] uppercase tracking-widest text-black/75 hover:bg-black/[0.03] transition-colors"
          >
            <ArrowLeft size={14} />
            Return to garden
          </button>
        </div>
      </main>
    );
  }

  const enriched = useMemo(() => {
    const term = search.trim().toLowerCase();
    return writings
      .map((w) => {
        const plain = w.content.includes("<") ? stripHtml(w.content) : w.content;
        const words = wordCountFromContent(w.content || "");
        const bucketForWriting = getBucketForWriting(w);
        return { writing: w, plain, words, bucketForWriting };
      })
      .filter((item) => {
        if (bucket !== "all" && item.bucketForWriting !== bucket) return false;
        if (!term) return true;
        return (
          (item.writing.title || "").toLowerCase().includes(term) ||
          item.plain.toLowerCase().includes(term) ||
          (item.writing.genre || "").toLowerCase().includes(term)
        );
      })
      .sort((a, b) => new Date(b.writing.updatedAt || 0).getTime() - new Date(a.writing.updatedAt || 0).getTime());
  }, [writings, bucket, search]);

  const selected = enriched.find((item) => item.writing.id === selectedId) || enriched[0] || null;
  const doneCount = Object.values(checks).filter(Boolean).length;

  return (
    <main className="min-h-screen bg-[#f7f4ee] px-4 py-6 text-[#1f1d18] md:px-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <header className="rounded-2xl border border-black/8 bg-white p-5 shadow-[0_10px_30px_rgba(0,0,0,0.04)]">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-3">
            <div>
              <p className="font-mono text-[9px] uppercase tracking-[0.3em] text-black/40">Editor Studio</p>
              <h1 className="text-3xl font-semibold tracking-tight text-black/90">Functional editing workspace</h1>
              <p className="mt-1 text-sm text-black/60">Triage submissions, coach drafts, and move polished work to publication.</p>
            </div>
            <div className="flex items-center gap-2">
              <a
                href="/garden"
                className="inline-flex items-center gap-1.5 rounded-lg border border-black/10 bg-[#fcfbf8] px-3 py-2 font-mono text-[9px] uppercase tracking-widest text-black/65 hover:bg-black/[0.03] transition-colors"
              >
                <ArrowLeft size={12} />
                Garden
              </a>
              <a
                href="/submissions"
                className="inline-flex items-center gap-1.5 rounded-lg border border-[#29493d]/20 bg-[#eef5f2] px-3 py-2 font-mono text-[9px] uppercase tracking-widest text-[#29493d] transition-colors hover:bg-[#e5efeb]"
              >
                <ExternalLink size={12} />
                Submissions
              </a>
            </div>
          </div>
        </header>

        <section className="grid sm:grid-cols-2 xl:grid-cols-4 gap-3">
          {[
            { key: "triage", label: "Needs triage", color: "amber", value: writings.filter((w) => getBucketForWriting(w) === "triage").length },
            { key: "development", label: "In development", color: "emerald", value: writings.filter((w) => getBucketForWriting(w) === "development").length },
            { key: "ready", label: "Ready queue", color: "fuchsia", value: writings.filter((w) => getBucketForWriting(w) === "ready").length },
            { key: "loaded", label: "Loaded now", color: "sky", value: enriched.length },
          ].map((stat) => (
            <div key={stat.key} className="rounded-xl border border-black/8 bg-white p-3 shadow-[0_6px_18px_rgba(0,0,0,0.03)]">
              <p className="font-mono text-[8px] uppercase tracking-widest text-black/40">{stat.label}</p>
              <p className="mt-1 text-2xl font-semibold text-black/85">{stat.value}</p>
            </div>
          ))}
        </section>

        <section className="grid xl:grid-cols-[1.05fr,1fr] gap-4">
          <div className="rounded-2xl border border-black/8 bg-white p-4 shadow-[0_10px_30px_rgba(0,0,0,0.04)]">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-3">
              <div className="relative flex-1">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-black/30" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by title, text, or genre"
                  className="w-full rounded-xl border border-black/10 bg-[#fcfbf8] py-2 pl-9 pr-3 text-sm text-black/80 placeholder:text-black/35 focus:outline-none focus:border-[#29493d]/35"
                />
              </div>
              <div className="flex items-center gap-1 rounded-xl border border-black/8 bg-[#fcfbf8] p-1">
                {["all", "triage", "development", "ready"].map((filter) => (
                  <button
                    key={filter}
                    onClick={() => setBucket(filter as StudioBucket)}
                    className={`rounded-lg px-2.5 py-1 font-mono text-[8px] uppercase tracking-widest transition-colors ${
                      bucket === filter ? "bg-white text-black/80 shadow-sm" : "text-black/45 hover:text-black/75"
                    }`}
                  >
                    {filter === "all" ? <Filter size={11} className="inline mr-1" /> : null}
                    {filter}
                  </button>
                ))}
              </div>
            </div>

            <div
              className="easy-scroll space-y-2 max-h-[38rem] overflow-y-auto pr-1"
              tabIndex={0}
              aria-label="Editor queue list"
            >
              {isFetching && <p className="font-mono text-[10px] uppercase tracking-widest text-black/45">Loading queue...</p>}
              {!isFetching && enriched.length === 0 && (
                <div className="rounded-xl border border-dashed border-black/12 p-6 text-center">
                  <p className="text-sm text-black/50">No pieces match this filter.</p>
                </div>
              )}
              {enriched.map((item) => {
                const isActive = selected?.writing.id === item.writing.id;
                return (
                  <button
                    key={item.writing.id}
                    onClick={() => setSelectedId(item.writing.id)}
                    className={`w-full text-left rounded-xl border p-3 transition-all ${
                      isActive
                        ? "border-[#29493d]/25 bg-[#f1f6f4]"
                        : "border-black/8 bg-[#fcfbf8] hover:border-black/15"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="line-clamp-1 text-sm font-semibold text-black/85">{item.writing.title || "Untitled"}</h3>
                      <span className="font-mono text-[8px] uppercase tracking-widest text-black/40">{item.words}w</span>
                    </div>
                    <p className="mt-1 font-mono text-[8px] uppercase tracking-widest text-black/35">
                      {item.bucketForWriting} • {item.writing.genre || "other"}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="rounded-2xl border border-black/8 bg-white p-4 shadow-[0_10px_30px_rgba(0,0,0,0.04)]">
            <p className="mb-3 font-mono text-[9px] uppercase tracking-[0.25em] text-black/45">Active Edit Pass</p>
            {!selected ? (
              <p className="text-sm text-black/50">Select a piece from the queue.</p>
            ) : (
              <div className="space-y-4">
                <div>
                  <h2 className="text-2xl font-semibold tracking-tight text-black/90">{selected.writing.title || "Untitled"}</h2>
                  <p className="mt-1 font-mono text-[9px] uppercase tracking-widest text-black/40">
                    {selected.bucketForWriting} • {selected.words} words
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: "intention", label: "Intention clear" },
                    { id: "language", label: "Language alive" },
                    { id: "shape", label: "Shape supports meaning" },
                    { id: "ending", label: "Ending lands" },
                  ].map((item) => (
                    <button
                      key={item.id}
                      onClick={() => setChecks((prev) => ({ ...prev, [item.id]: !prev[item.id] }))}
                      className={`flex items-center justify-between gap-2 rounded-lg border p-2.5 text-left ${
                        checks[item.id]
                          ? "border-[#29493d]/25 bg-[#eef5f2]"
                          : "border-black/10 bg-[#fcfbf8]"
                      }`}
                    >
                      <span className="text-sm text-black/75">{item.label}</span>
                      {checks[item.id] ? <Check size={13} className="text-[#29493d]" /> : <FileCheck2 size={13} className="text-black/25" />}
                    </button>
                  ))}
                </div>

                <div>
                  <label className="mb-2 block font-mono text-[8px] uppercase tracking-[0.25em] text-black/40">Editorial Notes</label>
                  <textarea
                    value={editorNotes}
                    onChange={(e) => setEditorNotes(e.target.value)}
                    placeholder="Capture your revision brief, strongest line, and next action for the writer..."
                    className="min-h-[170px] w-full rounded-xl border border-black/10 bg-[#fcfbf8] px-3 py-2 text-sm text-black/80 placeholder:text-black/35 focus:outline-none focus:border-[#29493d]/35"
                  />
                </div>

                <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                  <p className="font-mono text-[8px] uppercase tracking-widest text-black/45">Checklist {doneCount}/4 complete</p>
                  <a
                    href="/editorial-dashboard"
                    className="inline-flex items-center gap-1.5 rounded-lg border border-[#29493d]/20 bg-[#eef5f2] px-3 py-1.5 font-mono text-[9px] uppercase tracking-widest text-[#29493d] transition-colors hover:bg-[#e5efeb]"
                  >
                    <ExternalLink size={11} />
                    Open editorial dashboard
                  </a>
                </div>
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
