import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useRoute } from "wouter";
import { Footprints, Send, Clock, ArrowLeft, DoorOpen } from "lucide-react";
import StarBackground from "@/components/StarBackground";
import { apiRequest } from "@/lib/queryClient";

function timeAgo(date: string | Date) {
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (seconds < 60) return "just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}

function WalkDetail({ slug }: { slug: string }) {
  const [authorName, setAuthorName] = useState("");
  const [content, setContent] = useState("");
  const queryClient = useQueryClient();

  const { data: walk, isLoading } = useQuery<any>({
    queryKey: [`/api/mind-walks/${slug}`],
  });

  const submitMutation = useMutation({
    mutationFn: async (data: { authorName: string; content: string }) => {
      const res = await apiRequest("POST", `/api/mind-walks/${slug}/fragments`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/mind-walks/${slug}`] });
      setContent("");
      setAuthorName("");
    },
  });

  if (isLoading) return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
      <div className="w-6 h-6 border-2 border-emerald-400/30 border-t-emerald-400 rounded-full animate-spin" />
    </div>
  );

  if (!walk) return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center text-zinc-400">
      Walk not found.
    </div>
  );

  const isOpen = walk.status === "open";

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-zinc-200">
      <StarBackground />
      <div className="relative z-10 max-w-2xl mx-auto px-6 py-20">
        <Link href="/mind-walks">
          <button className="flex items-center gap-2 text-zinc-500 hover:text-zinc-300 mb-12 transition-colors text-sm">
            <ArrowLeft className="w-4 h-4" /> all walks
          </button>
        </Link>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <div className="flex items-center gap-3 mb-4">
            <span className={`text-xs px-2 py-0.5 rounded-full ${isOpen ? 'bg-emerald-500/20 text-emerald-400' : 'bg-zinc-700/50 text-zinc-500'}`}>
              {isOpen ? 'open' : 'closed'}
            </span>
            <span className="text-xs text-zinc-600">opened by {walk.editorName}</span>
          </div>
          <h1 className="text-3xl font-serif italic text-zinc-100 mb-4">{walk.theme}</h1>
          <p className="text-zinc-400 text-lg leading-relaxed mb-12 font-serif italic border-l-2 border-emerald-500/30 pl-4">
            {walk.prompt}
          </p>
        </motion.div>

        {isOpen && (
          <motion.form
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
            onSubmit={(e) => { e.preventDefault(); if (content.trim() && authorName.trim()) submitMutation.mutate({ authorName: authorName.trim(), content: content.trim() }); }}
            className="mb-16 space-y-4"
          >
            <input
              value={authorName}
              onChange={(e) => setAuthorName(e.target.value)}
              placeholder="your name"
              className="w-full bg-transparent border-b border-zinc-800 focus:border-emerald-500/50 outline-none py-2 text-sm text-zinc-300 placeholder-zinc-600 transition-colors"
              maxLength={100}
            />
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="drop something in..."
              className="w-full bg-transparent border border-zinc-800 focus:border-emerald-500/30 rounded-lg p-4 text-zinc-300 placeholder-zinc-600 outline-none resize-none transition-colors min-h-[120px] text-sm leading-relaxed"
              maxLength={2500}
            />
            <div className="flex justify-between items-center">
              <span className="text-xs text-zinc-600">{content.length}/2500</span>
              <button
                type="submit"
                disabled={!content.trim() || !authorName.trim() || submitMutation.isPending}
                className="flex items-center gap-2 text-sm px-4 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <Send className="w-3 h-3" /> drop it in
              </button>
            </div>
          </motion.form>
        )}

        <div className="space-y-8">
          <AnimatePresence>
            {walk.fragments?.map((f: any, i: number) => (
              <motion.div
                key={f.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="border-l border-zinc-800 pl-6 py-2"
              >
                <p className="text-zinc-300 text-sm leading-relaxed whitespace-pre-wrap mb-3">{f.content}</p>
                <div className="flex items-center gap-3 text-xs text-zinc-600">
                  <span>{f.authorName}</span>
                  <span>{timeAgo(f.createdAt)}</span>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          {(!walk.fragments || walk.fragments.length === 0) && (
            <p className="text-zinc-600 text-sm italic">no fragments yet. be the first to walk here.</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default function MindWalks() {
  const [, params] = useRoute("/mind-walks/:slug");

  if (params?.slug) {
    return <WalkDetail slug={params.slug} />;
  }

  const { data: walks = [], isLoading } = useQuery<any[]>({
    queryKey: ["/api/mind-walks"],
  });

  const openWalks = walks.filter(w => w.status === "open");
  const closedWalks = walks.filter(w => w.status === "closed");

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-zinc-200">
      <StarBackground />
      <div className="relative z-10 max-w-3xl mx-auto px-6 py-20">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <div className="flex items-center gap-3 mb-2">
            <Footprints className="w-5 h-5 text-emerald-400" />
            <h1 className="text-2xl font-serif">Mind Walks</h1>
          </div>
          <p className="text-zinc-500 text-sm mb-12 max-w-lg">
            Themed doors opened by editors. Walk in, leave a fragment. No cover letter needed.
          </p>
        </motion.div>

        {isLoading && (
          <div className="flex justify-center py-20">
            <div className="w-6 h-6 border-2 border-emerald-400/30 border-t-emerald-400 rounded-full animate-spin" />
          </div>
        )}

        {openWalks.length > 0 && (
          <div className="mb-16">
            <h2 className="text-xs uppercase tracking-widest text-emerald-400 mb-6">Open Now</h2>
            <div className="space-y-4">
              {openWalks.map((walk: any) => (
                <Link key={walk.id} href={`/mind-walks/${walk.slug}`}>
                  <motion.div
                    whileHover={{ x: 4 }}
                    className="group border border-zinc-800/50 hover:border-emerald-500/20 rounded-lg p-6 cursor-pointer transition-colors"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <DoorOpen className="w-4 h-4 text-emerald-400" />
                        <h3 className="font-serif italic text-lg text-zinc-200 group-hover:text-emerald-300 transition-colors">{walk.theme}</h3>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-zinc-600">
                        <Clock className="w-3 h-3" />
                        closes {timeAgo(walk.closesAt)}
                      </div>
                    </div>
                    <p className="text-zinc-500 text-sm font-serif italic">{walk.prompt}</p>
                    <p className="text-xs text-zinc-600 mt-3">opened by {walk.editorName}</p>
                  </motion.div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {closedWalks.length > 0 && (
          <div>
            <h2 className="text-xs uppercase tracking-widest text-zinc-600 mb-6">Past Walks</h2>
            <div className="space-y-3">
              {closedWalks.map((walk: any) => (
                <Link key={walk.id} href={`/mind-walks/${walk.slug}`}>
                  <motion.div
                    whileHover={{ x: 4 }}
                    className="group border border-zinc-800/30 hover:border-zinc-700/50 rounded-lg p-5 cursor-pointer transition-colors"
                  >
                    <h3 className="font-serif italic text-zinc-400 group-hover:text-zinc-300 transition-colors">{walk.theme}</h3>
                    <p className="text-xs text-zinc-600 mt-1">by {walk.editorName}</p>
                  </motion.div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {!isLoading && walks.length === 0 && (
          <p className="text-zinc-600 text-sm italic text-center py-20">no walks yet. an editor will open one soon.</p>
        )}
      </div>
    </div>
  );
}
