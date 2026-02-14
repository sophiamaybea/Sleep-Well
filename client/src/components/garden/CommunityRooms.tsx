import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronDown, Plus, MessageSquare, BookOpen, ArrowLeftRight, Feather, Users, PenLine, FileCheck, Sparkles, Clock, Award, Send, ShieldOff, Globe, Lightbulb, ExternalLink, MapPin, Trash2, X, Heart } from "lucide-react";
import { ContentRenderer } from "./RichEditor";

function ListSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="space-y-3 animate-pulse">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="border border-white/[0.06] rounded-xl p-4 space-y-2">
          <div className="h-4 w-40 bg-white/[0.06] rounded-lg" />
          <div className="h-3 w-full bg-white/[0.06] rounded-lg" />
          <div className="flex gap-3">
            <div className="h-3 w-12 bg-white/[0.06] rounded-lg" />
            <div className="h-3 w-16 bg-white/[0.06] rounded-lg" />
          </div>
        </div>
      ))}
    </div>
  );
}

function timeAgo(date: string | Date | null | undefined) {
  if (!date) return "";
  const d = new Date(date);
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `${days}d ago`;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

const TABLE_CATEGORIES = ["general", "craft", "inspiration", "feedback", "off-topic"] as const;
const WORKSHOP_CATEGORIES = ["freewrite", "ekphrasis", "constraint", "form", "revision"] as const;
const SWAP_STATUSES = ["open", "matched", "completed"] as const;

type TableTopic = {
  id: string;
  authorId: string;
  title: string;
  body: string;
  category: string;
  isPinned: boolean;
  createdAt: string;
  updatedAt: string;
  authorName: string;
  replyCount: number;
};

type TableReply = {
  id: string;
  topicId: string;
  authorId: string;
  content: string;
  parentId: string | null;
  createdAt: string;
  authorName: string;
};

type Exercise = {
  id: string;
  title: string;
  prompt: string;
  category: string;
  durationMinutes: number | null;
  createdAt: string;
  authorName: string;
  responseCount: number;
};

type ExerciseResponse = {
  id: string;
  exerciseId: string;
  authorId: string;
  content: string;
  createdAt: string;
  authorName: string;
};

type SwapRequest = {
  id: string;
  requesterId: string;
  writingId: string;
  genre: string | null;
  note: string | null;
  status: string;
  matchedWithId: string | null;
  matchedWritingId: string | null;
  createdAt: string;
  requesterName: string;
  writingTitle: string;
  matchedName: string | null;
};

type Writing = {
  id: string;
  title: string;
};

function BackButton({ onBack }: { onBack: () => void }) {
  return (
    <button
      onClick={onBack}
      className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-white/50 hover:text-white/80 transition-colors group"
      data-testid="button-back"
    >
      <ChevronLeft size={15} className="group-hover:-translate-x-1 transition-transform" />
      Back
    </button>
  );
}

function CategoryPill({ label, active, onClick, testId }: { label: string; active: boolean; onClick: () => void; testId: string }) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 rounded-full font-mono text-[9px] uppercase tracking-widest transition-all border ${
        active
          ? "bg-white/[0.08] border-white/25 text-white/80"
          : "border-white/[0.15] text-white/60 hover:text-white/60 hover:border-white/20"
      }`}
      data-testid={testId}
    >
      {label}
    </button>
  );
}

function TopicReplies({ topicId }: { topicId: string }) {
  const [replyContent, setReplyContent] = useState("");
  const queryClient = useQueryClient();

  const { data: replies = [], isLoading } = useQuery<TableReply[]>({
    queryKey: ["/api/tables", topicId, "replies"],
    queryFn: async () => {
      const res = await fetch(`/api/tables/${topicId}/replies`, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch replies");
      return res.json();
    },
  });

  const replyMutation = useMutation({
    mutationFn: async (content: string) => {
      const res = await fetch(`/api/tables/${topicId}/replies`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ content }),
      });
      if (!res.ok) throw new Error("Failed to post reply");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tables", topicId, "replies"] });
      queryClient.invalidateQueries({ queryKey: ["/api/tables"] });
      setReplyContent("");
    },
  });

  const handleSubmitReply = () => {
    const trimmed = replyContent.trim();
    if (!trimmed) return;
    replyMutation.mutate(trimmed);
  };

  return (
    <div className="space-y-3" data-testid={`topic-replies-${topicId}`}>
      {isLoading && <ListSkeleton count={2} />}
      {replies.length === 0 && !isLoading && (
        <p className="font-serif text-sm text-white/50 italic">No replies yet — start the conversation.</p>
      )}
      {replies.map((reply) => (
        <div key={reply.id} className={`flex items-start gap-3 ${reply.parentId ? "ml-8 border-l border-white/[0.20] pl-4" : ""}`} data-testid={`reply-${reply.id}`}>
          <div className="w-6 h-6 rounded-full bg-white/[0.06] border border-white/20 flex items-center justify-center text-white/60 font-mono text-[8px] uppercase flex-shrink-0">
            {reply.authorName?.[0] || "?"}
          </div>
          <div className="flex-grow min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <span className="font-mono text-[10px] text-white/60 tracking-wide">{reply.authorName}</span>
              <span className="font-mono text-[9px] text-white/50">{timeAgo(reply.createdAt)}</span>
            </div>
            <p className="font-serif text-sm text-white/70 leading-relaxed">{reply.content}</p>
          </div>
        </div>
      ))}
      <div className="flex gap-2 pt-2 border-t border-white/[0.15]">
        <input
          type="text"
          value={replyContent}
          onChange={(e) => setReplyContent(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSubmitReply(); } }}
          placeholder="Write a reply..."
          className="flex-grow bg-white/[0.05] border border-white/[0.20] rounded-lg px-3 py-2 text-sm font-serif text-white/75 placeholder:text-white/45 focus:outline-none focus:border-white/40 transition-colors"
          data-testid={`input-reply-${topicId}`}
        />
        <button
          onClick={handleSubmitReply}
          disabled={!replyContent.trim() || replyMutation.isPending}
          className="px-4 py-2 bg-white/[0.05] hover:bg-white/[0.09] border border-white/20 hover:border-white/20 rounded-lg font-mono text-[9px] uppercase tracking-widest text-white/70 hover:text-white transition-all disabled:opacity-30 disabled:cursor-not-allowed"
          data-testid={`button-submit-reply-${topicId}`}
        >
          Reply
        </button>
      </div>
    </div>
  );
}

type CafeQuestionData = {
  id: string;
  question: string;
  createdAt: string;
  responseCount: number;
};

type CafeResponseData = {
  id: string;
  questionId: string;
  userId: string;
  content: string;
  createdAt: string;
  userName: string | null;
};

function PastQuestionResponses({ questionId }: { questionId: string }) {
  const { data: responses = [], isLoading } = useQuery<CafeResponseData[]>({
    queryKey: ["/api/cafe/questions", questionId, "responses"],
    queryFn: async () => {
      const res = await fetch(`/api/cafe/questions/${questionId}/responses`, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch responses");
      return res.json();
    },
  });

  if (isLoading) return <ListSkeleton count={2} />;

  if (responses.length === 0) {
    return <p className="font-serif text-sm text-white/40 italic py-2">No one answered this one yet.</p>;
  }

  return (
    <div className="space-y-2 py-2">
      {responses.map((r) => (
        <div key={r.id} className="flex items-start gap-2.5" data-testid={`past-response-${r.id}`}>
          <div className="w-5 h-5 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400/60 font-mono text-[7px] uppercase flex-shrink-0 mt-0.5">
            {r.userName?.[0] || "?"}
          </div>
          <div className="min-w-0">
            <p className="font-serif text-sm text-white/65 leading-relaxed">{r.content}</p>
            <span className="font-mono text-[8px] text-white/35">{r.userName} · {timeAgo(r.createdAt)}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

export function TablesRoom({ onBack }: { onBack: () => void }) {
  const [responseContent, setResponseContent] = useState("");
  const [expandedPast, setExpandedPast] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const { data: todayQuestion, isLoading: loadingToday } = useQuery<CafeQuestionData>({
    queryKey: ["/api/cafe/today"],
    queryFn: async () => {
      const res = await fetch("/api/cafe/today", { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch today's question");
      return res.json();
    },
  });

  const { data: todayResponses = [], isLoading: loadingResponses } = useQuery<CafeResponseData[]>({
    queryKey: ["/api/cafe/questions", todayQuestion?.id, "responses"],
    queryFn: async () => {
      const res = await fetch(`/api/cafe/questions/${todayQuestion!.id}/responses`, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch responses");
      return res.json();
    },
    enabled: !!todayQuestion?.id,
  });

  const { data: pastQuestions = [] } = useQuery<CafeQuestionData[]>({
    queryKey: ["/api/cafe/past"],
    queryFn: async () => {
      const res = await fetch("/api/cafe/past", { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch past questions");
      return res.json();
    },
  });

  const submitMutation = useMutation({
    mutationFn: async (content: string) => {
      const res = await fetch(`/api/cafe/questions/${todayQuestion!.id}/responses`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ content }),
      });
      if (!res.ok) throw new Error("Failed to submit response");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cafe/questions", todayQuestion?.id, "responses"] });
      queryClient.invalidateQueries({ queryKey: ["/api/cafe/today"] });
      setResponseContent("");
    },
  });

  const handleSubmit = () => {
    const trimmed = responseContent.trim();
    if (!trimmed || !todayQuestion) return;
    submitMutation.mutate(trimmed);
  };

  return (
    <div className="max-w-2xl mx-auto" data-testid="tables-room">
      <div className="flex items-center justify-between mb-10">
        <BackButton onBack={onBack} />
        <div className="flex items-center gap-3">
          <Feather size={16} className="text-amber-400/50" />
          <h2 className="text-xl font-display font-light italic text-white/80">The Café</h2>
        </div>
        <div className="w-16" />
      </div>

      {loadingToday ? (
        <div className="animate-pulse space-y-4 py-8">
          <div className="h-6 w-3/4 bg-white/[0.06] rounded-lg mx-auto" />
          <div className="h-4 w-1/2 bg-white/[0.06] rounded-lg mx-auto" />
        </div>
      ) : todayQuestion ? (
        <div className="text-center mb-10">
          <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-amber-400/50 mb-4" data-testid="label-today">Today's Question</p>
          <h3
            className="text-2xl md:text-3xl font-display font-light italic text-white/85 leading-snug max-w-lg mx-auto mb-8"
            data-testid="text-today-question"
          >
            "{todayQuestion.question}"
          </h3>

          <div className="max-w-md mx-auto mb-8">
            <div className="flex gap-2">
              <input
                type="text"
                value={responseContent}
                onChange={(e) => setResponseContent(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSubmit(); } }}
                placeholder="Pull up a chair..."
                maxLength={280}
                className="flex-grow bg-white/[0.04] border border-white/[0.12] rounded-lg px-4 py-2.5 text-sm font-serif text-white/75 placeholder:text-white/35 focus:outline-none focus:border-amber-500/30 transition-colors"
                data-testid="input-cafe-response"
              />
              <motion.button
                onClick={handleSubmit}
                disabled={!responseContent.trim() || submitMutation.isPending}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="px-4 py-2.5 bg-amber-500/10 hover:bg-amber-500/15 border border-amber-500/20 hover:border-amber-500/30 rounded-lg font-mono text-[9px] uppercase tracking-widest text-amber-400/70 hover:text-amber-300 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                data-testid="button-cafe-share"
              >
                <Send size={13} />
              </motion.button>
            </div>
          </div>

          {loadingResponses ? (
            <ListSkeleton count={3} />
          ) : todayResponses.length > 0 ? (
            <div className="space-y-3 max-w-lg mx-auto text-left">
              {todayResponses.map((r, i) => (
                <motion.div
                  key={r.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04, duration: 0.25 }}
                  className="flex items-start gap-3"
                  data-testid={`cafe-response-${r.id}`}
                >
                  <div className="w-6 h-6 rounded-full bg-amber-500/10 border border-amber-500/15 flex items-center justify-center text-amber-400/60 font-mono text-[8px] uppercase flex-shrink-0 mt-0.5">
                    {r.userName?.[0] || "?"}
                  </div>
                  <div className="min-w-0 flex-grow">
                    <p className="font-serif text-sm text-white/65 leading-relaxed">{r.content}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="font-mono text-[9px] text-white/35">{r.userName}</span>
                      <span className="font-mono text-[8px] text-white/25">·</span>
                      <span className="font-mono text-[8px] text-white/30">{timeAgo(r.createdAt)}</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <p className="font-serif text-sm text-white/40 italic" data-testid="text-no-responses">
              No one's answered yet — be the first to pull up a chair.
            </p>
          )}
        </div>
      ) : null}

      {pastQuestions.length > 0 && (
        <>
          <div className="border-t border-white/[0.08] my-10" />
          <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-white/35 mb-5" data-testid="label-past">Past Questions</p>
          <div className="space-y-2">
            {pastQuestions.map((q, i) => {
              const isExpanded = expandedPast === q.id;
              return (
                <motion.div
                  key={q.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03, duration: 0.25 }}
                  data-testid={`past-question-${q.id}`}
                >
                  <div className={`rounded-xl border overflow-hidden transition-all duration-300 ${
                    isExpanded
                      ? "border-white/15 bg-white/[0.025]"
                      : "border-white/[0.08] hover:border-white/[0.12] bg-white/[0.02]"
                  }`}>
                    <button
                      onClick={() => setExpandedPast(isExpanded ? null : q.id)}
                      className="w-full text-left p-4"
                      data-testid={`button-expand-past-${q.id}`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex-grow min-w-0">
                          <p className="font-display font-light italic text-sm text-white/60 truncate">"{q.question}"</p>
                        </div>
                        <div className="flex items-center gap-3 flex-shrink-0">
                          <div className="flex items-center gap-1 text-white/35">
                            <MessageSquare size={10} />
                            <span className="font-mono text-[9px]" data-testid={`text-past-count-${q.id}`}>{q.responseCount}</span>
                          </div>
                          <span className="font-mono text-[8px] text-white/25">{timeAgo(q.createdAt)}</span>
                          <ChevronDown size={12} className={`text-white/30 transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`} />
                        </div>
                      </div>
                    </button>

                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.25 }}
                          className="overflow-hidden"
                        >
                          <div className="px-4 pb-4 border-t border-white/[0.08]">
                            <PastQuestionResponses questionId={q.id} />
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

function ExerciseResponses({ exerciseId }: { exerciseId: string }) {
  const [responseContent, setResponseContent] = useState("");
  const queryClient = useQueryClient();

  const { data: responses = [], isLoading } = useQuery<ExerciseResponse[]>({
    queryKey: ["/api/workshop", exerciseId, "responses"],
    queryFn: async () => {
      const res = await fetch(`/api/workshop/${exerciseId}/responses`, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch responses");
      return res.json();
    },
  });

  const submitMutation = useMutation({
    mutationFn: async (content: string) => {
      const res = await fetch(`/api/workshop/${exerciseId}/responses`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ content }),
      });
      if (!res.ok) throw new Error("Failed to submit response");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/workshop", exerciseId, "responses"] });
      queryClient.invalidateQueries({ queryKey: ["/api/workshop"] });
      setResponseContent("");
    },
  });

  const handleSubmit = () => {
    const trimmed = responseContent.trim();
    if (!trimmed) return;
    submitMutation.mutate(trimmed);
  };

  return (
    <div className="space-y-4" data-testid={`exercise-responses-${exerciseId}`}>
      {isLoading && <ListSkeleton count={2} />}
      {responses.length === 0 && !isLoading && (
        <p className="font-serif text-sm text-white/50 italic">No responses yet — be the first to write.</p>
      )}
      {responses.map((r) => (
        <div key={r.id} className="flex items-start gap-3" data-testid={`response-${r.id}`}>
          <div className="w-6 h-6 rounded-full bg-white/[0.06] border border-white/20 flex items-center justify-center text-white/60 font-mono text-[8px] uppercase flex-shrink-0">
            {r.authorName?.[0] || "?"}
          </div>
          <div className="flex-grow min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-mono text-[10px] text-white/60 tracking-wide">{r.authorName}</span>
              <span className="font-mono text-[9px] text-white/50">{timeAgo(r.createdAt)}</span>
            </div>
            <p className="font-serif text-sm text-white/70 leading-relaxed whitespace-pre-wrap">{r.content}</p>
          </div>
        </div>
      ))}
      <div className="pt-3 border-t border-white/[0.15] space-y-2">
        <textarea
          value={responseContent}
          onChange={(e) => setResponseContent(e.target.value)}
          placeholder="Write your response to this exercise here..."
          rows={4}
          className="w-full bg-white/[0.05] border border-white/[0.20] rounded-lg px-4 py-3 text-sm font-serif text-white/75 placeholder:text-white/45 focus:outline-none focus:border-white/40 transition-colors resize-none"
          data-testid={`input-response-${exerciseId}`}
        />
        <div className="flex justify-end">
          <button
            onClick={handleSubmit}
            disabled={!responseContent.trim() || submitMutation.isPending}
            className="px-5 py-2 bg-white/[0.05] hover:bg-white/[0.09] border border-white/20 hover:border-white/20 rounded-full font-mono text-[9px] uppercase tracking-widest text-white/70 hover:text-white transition-all disabled:opacity-30 disabled:cursor-not-allowed"
            data-testid={`button-submit-response-${exerciseId}`}
          >
            Submit
          </button>
        </div>
      </div>
    </div>
  );
}

function PromptOfDayResponses({ exerciseId }: { exerciseId: string }) {
  const [responseContent, setResponseContent] = useState("");
  const [showWriteArea, setShowWriteArea] = useState(false);
  const [showNames, setShowNames] = useState(false);
  const queryClient = useQueryClient();

  const { data: responses = [], isLoading } = useQuery<ExerciseResponse[]>({
    queryKey: ["/api/workshop/exercises", exerciseId, "responses"],
    queryFn: async () => {
      const res = await fetch(`/api/workshop/exercises/${exerciseId}/responses`, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch responses");
      return res.json();
    },
  });

  const submitMutation = useMutation({
    mutationFn: async (content: string) => {
      const res = await fetch(`/api/workshop/${exerciseId}/responses`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ content }),
      });
      if (!res.ok) throw new Error("Failed to submit response");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/workshop/exercises", exerciseId, "responses"] });
      queryClient.invalidateQueries({ queryKey: ["/api/workshop"] });
      queryClient.invalidateQueries({ queryKey: ["/api/workshop/prompt-of-day"] });
      setResponseContent("");
      setShowWriteArea(false);
    },
  });

  const handleSubmit = () => {
    const trimmed = responseContent.trim();
    if (!trimmed) return;
    submitMutation.mutate(trimmed);
  };

  const wordCount = (text: string) => text.trim() ? text.trim().split(/\s+/).length : 0;

  return (
    <div className="space-y-4" data-testid="prompt-of-day-responses">
      {!showWriteArea ? (
        <button
          onClick={() => setShowWriteArea(true)}
          className="w-full flex items-center justify-center gap-2 py-3 border border-dashed border-amber-500/20 hover:border-amber-500/40 rounded-xl font-mono text-[10px] uppercase tracking-widest text-amber-400/70 hover:text-amber-400 bg-amber-500/[0.03] hover:bg-amber-500/[0.06] transition-all"
          data-testid="button-write-response"
        >
          <PenLine size={13} />
          Write a Response
        </button>
      ) : (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          className="space-y-3"
        >
          <textarea
            value={responseContent}
            onChange={(e) => setResponseContent(e.target.value)}
            placeholder="Write your response to today's prompt..."
            rows={6}
            className="w-full bg-white/[0.05] border border-white/[0.20] rounded-lg px-4 py-3 text-sm font-serif text-white/75 placeholder:text-white/45 focus:outline-none focus:border-amber-500/30 transition-colors resize-none"
            data-testid="input-prompt-response"
            autoFocus
          />
          <div className="flex items-center justify-between">
            <span className="font-mono text-[9px] text-white/40 tracking-wide" data-testid="text-word-count">{wordCount(responseContent)} words</span>
            <div className="flex gap-2">
              <button
                onClick={() => { setShowWriteArea(false); setResponseContent(""); }}
                className="px-4 py-2 font-mono text-[9px] uppercase tracking-widest text-white/50 hover:text-white/75 transition-colors"
                data-testid="button-cancel-response"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={!responseContent.trim() || submitMutation.isPending}
                className="flex items-center gap-2 px-5 py-2 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/25 hover:border-amber-500/40 rounded-full font-mono text-[9px] uppercase tracking-widest text-amber-400/80 hover:text-amber-400 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                data-testid="button-submit-prompt-response"
              >
                <Send size={11} />
                Submit
              </button>
            </div>
          </div>
        </motion.div>
      )}

      <div className="pt-4 border-t border-white/[0.08]">
        <div className="flex items-center justify-between mb-4">
          <h4 className="font-mono text-[10px] uppercase tracking-widest text-white/50" data-testid="text-community-responses-header">
            Community Responses {responses.length > 0 && `(${responses.length})`}
          </h4>
          <button
            onClick={() => setShowNames(!showNames)}
            className="flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-widest text-white/40 hover:text-white/60 transition-colors"
            data-testid="button-toggle-names"
          >
            {showNames ? <Users size={11} /> : <ShieldOff size={11} />}
            {showNames ? "Hide Names" : "Reveal Names"}
          </button>
        </div>

        {isLoading && <ListSkeleton count={2} />}
        {responses.length === 0 && !isLoading && (
          <p className="font-serif text-sm text-white/40 italic text-center py-4" data-testid="text-no-responses">No responses yet — be the first to write.</p>
        )}

        <div className="space-y-3">
          {responses.map((r) => (
            <div key={r.id} className="p-4 rounded-lg border border-white/[0.08] bg-white/[0.02]" data-testid={`prompt-response-${r.id}`}>
              <p className="font-serif text-sm text-white/65 leading-relaxed whitespace-pre-wrap" data-testid={`text-response-content-${r.id}`}>{r.content}</p>
              <div className="flex items-center gap-3 mt-3 pt-2 border-t border-white/[0.06]">
                <span className="font-mono text-[9px] text-white/40" data-testid={`text-response-author-${r.id}`}>
                  {showNames ? r.authorName : "Anonymous Writer"}
                </span>
                <span className="font-mono text-[9px] text-white/30">{wordCount(r.content)} words</span>
                <span className="font-mono text-[9px] text-white/30">{timeAgo(r.createdAt)}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function WorkshopRoom({ onBack }: { onBack: () => void }) {
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [expandedExercise, setExpandedExercise] = useState<string | null>(null);
  const [showNewForm, setShowNewForm] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newPrompt, setNewPrompt] = useState("");
  const [newCategory, setNewCategory] = useState<string>("freewrite");
  const [newDuration, setNewDuration] = useState<string>("");
  const queryClient = useQueryClient();

  const { data: promptOfDay, isLoading: promptLoading } = useQuery<Exercise>({
    queryKey: ["/api/workshop/prompt-of-day"],
    queryFn: async () => {
      const res = await fetch("/api/workshop/prompt-of-day", { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch prompt of the day");
      return res.json();
    },
  });

  const { data: exercises = [], isLoading } = useQuery<Exercise[]>({
    queryKey: ["/api/workshop"],
    queryFn: async () => {
      const res = await fetch("/api/workshop", { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch exercises");
      return res.json();
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: { title: string; prompt: string; category: string; durationMinutes?: number }) => {
      const res = await fetch("/api/workshop", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to create exercise");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/workshop"] });
      queryClient.invalidateQueries({ queryKey: ["/api/workshop/prompt-of-day"] });
      setShowNewForm(false);
      setNewTitle("");
      setNewPrompt("");
      setNewCategory("freewrite");
      setNewDuration("");
    },
  });

  const handleCreate = () => {
    if (!newTitle.trim() || !newPrompt.trim()) return;
    const data: { title: string; prompt: string; category: string; durationMinutes?: number } = {
      title: newTitle.trim(),
      prompt: newPrompt.trim(),
      category: newCategory,
    };
    if (newDuration && parseInt(newDuration) > 0) {
      data.durationMinutes = parseInt(newDuration);
    }
    createMutation.mutate(data);
  };

  const filteredExercises = exercises
    .filter((e) => activeCategory === "all" || e.category === activeCategory)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return (
    <div className="max-w-3xl mx-auto" data-testid="workshop-room">
      <div className="flex items-center justify-between mb-8">
        <BackButton onBack={onBack} />
        <div className="flex items-center gap-3">
          <BookOpen size={16} className="text-white/55" />
          <h2 className="text-xl font-display font-light italic text-white/80">Workshop</h2>
        </div>
        <motion.button
          onClick={() => setShowNewForm(!showNewForm)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.97 }}
          className="flex items-center gap-2 px-4 py-2 border border-white/20 hover:border-amber-500/30 rounded-full font-mono text-[10px] uppercase tracking-widest text-white/70 hover:text-white bg-white/[0.03] hover:bg-white/[0.06] transition-all"
          data-testid="button-create-exercise"
        >
          <Plus size={13} />
          Create Exercise
        </motion.button>
      </div>

      <p className="font-serif text-sm text-white/50 leading-relaxed mb-6 max-w-xl">
        A space for creative play. Try a writing exercise, respond to a prompt, or create one for others. No pressure, no grades — just practice.
      </p>

      {promptLoading && (
        <div className="mb-8 animate-pulse">
          <div className="border border-amber-500/15 rounded-2xl p-6 space-y-3 bg-amber-500/[0.02]">
            <div className="h-4 w-32 bg-white/[0.06] rounded-lg" />
            <div className="h-6 w-64 bg-white/[0.06] rounded-lg" />
            <div className="h-16 w-full bg-white/[0.06] rounded-lg" />
          </div>
        </div>
      )}

      {promptOfDay && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-8"
          data-testid="prompt-of-day-section"
        >
          <div className="border border-amber-500/15 rounded-2xl overflow-hidden bg-amber-500/[0.02]">
            <div className="px-5 py-4 border-b border-amber-500/10 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles size={14} className="text-amber-400/60" />
                <span className="font-mono text-[10px] uppercase tracking-widest text-amber-400/70" data-testid="text-todays-prompt-label">Today's Prompt</span>
              </div>
              <div className="flex items-center gap-3">
                {promptOfDay.durationMinutes && (
                  <span className="flex items-center gap-1 font-mono text-[9px] text-white/40" data-testid="text-prompt-duration">
                    <Clock size={10} />
                    {promptOfDay.durationMinutes}m
                  </span>
                )}
                <span className="px-2 py-0.5 rounded-full border border-amber-500/15 font-mono text-[8px] uppercase tracking-widest text-amber-400/50" data-testid="text-prompt-category">
                  {promptOfDay.category}
                </span>
              </div>
            </div>
            <div className="p-5 space-y-3">
              <h3 className="text-lg font-display font-light italic text-white/85" data-testid="text-prompt-title">{promptOfDay.title}</h3>
              <p className="font-serif text-sm text-white/60 leading-relaxed italic" data-testid="text-prompt-text">{promptOfDay.prompt}</p>
              <div className="flex items-center gap-3 pt-1">
                <span className="font-mono text-[9px] text-white/35">by {promptOfDay.authorName}</span>
                <span className="font-mono text-[9px] text-white/30">{promptOfDay.responseCount} {promptOfDay.responseCount === 1 ? "response" : "responses"}</span>
              </div>
            </div>
            <div className="px-5 pb-5">
              <PromptOfDayResponses exerciseId={promptOfDay.id} />
            </div>
          </div>
        </motion.div>
      )}

      <div className="flex items-center gap-3 mb-4">
        <div className="h-px flex-grow bg-white/[0.08]" />
        <span className="font-mono text-[10px] uppercase tracking-widest text-white/40" data-testid="text-all-exercises-label">All Exercises</span>
        <div className="h-px flex-grow bg-white/[0.08]" />
      </div>

      <AnimatePresence>
        {showNewForm && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden mb-6"
          >
            <div className="border border-white/[0.15] rounded-xl p-5 space-y-4 bg-white/[0.05]" data-testid="new-exercise-form">
              <input
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="Name this exercise..."
                className="w-full bg-transparent border-b border-white/[0.20] pb-2 text-lg font-display font-light italic text-white/80 placeholder:text-white/45 focus:outline-none focus:border-white/20 transition-colors"
                data-testid="input-exercise-title"
              />
              <textarea
                value={newPrompt}
                onChange={(e) => setNewPrompt(e.target.value)}
                placeholder="Describe the exercise — what should writers try? Give a starting line, constraint, or form..."
                rows={4}
                className="w-full bg-white/[0.05] border border-white/[0.20] rounded-lg px-4 py-3 text-sm font-serif text-white/75 placeholder:text-white/45 focus:outline-none focus:border-white/40 transition-colors resize-none"
                data-testid="input-exercise-prompt"
              />
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center gap-3">
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="bg-transparent text-white/50 font-mono text-[9px] uppercase tracking-widest border border-white/[0.20] rounded-full px-3 py-1.5 focus:outline-none hover:border-white/25 transition-colors cursor-pointer"
                    data-testid="select-exercise-category"
                  >
                    {WORKSHOP_CATEGORIES.map((c) => (
                      <option key={c} value={c} className="bg-[#0b101a]">{c}</option>
                    ))}
                  </select>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="number"
                      value={newDuration}
                      onChange={(e) => setNewDuration(e.target.value)}
                      placeholder="Time"
                      min="1"
                      className="w-16 bg-transparent border border-white/[0.20] rounded-full px-3 py-1.5 font-mono text-[9px] text-white/60 placeholder:text-white/45 focus:outline-none focus:border-white/40 transition-colors text-center"
                      data-testid="input-exercise-duration"
                    />
                    <span className="font-mono text-[8px] text-white/50 uppercase tracking-widest">min</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowNewForm(false)}
                    className="px-4 py-2 font-mono text-[9px] uppercase tracking-widest text-white/50 hover:text-white/75 transition-colors"
                    data-testid="button-cancel-exercise"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCreate}
                    disabled={!newTitle.trim() || !newPrompt.trim() || createMutation.isPending}
                    className="px-5 py-2 bg-white/[0.06] hover:bg-white/[0.1] border border-white/20 hover:border-white/20 rounded-full font-mono text-[9px] uppercase tracking-widest text-white/75 hover:text-white transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                    data-testid="button-submit-exercise"
                  >
                    Create
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex flex-wrap gap-1.5 mb-6">
        <CategoryPill label="All" active={activeCategory === "all"} onClick={() => setActiveCategory("all")} testId="filter-workshop-all" />
        {WORKSHOP_CATEGORIES.map((c) => (
          <CategoryPill key={c} label={c} active={activeCategory === c} onClick={() => setActiveCategory(c)} testId={`filter-workshop-${c}`} />
        ))}
      </div>

      {isLoading && <ListSkeleton count={4} />}

      {!isLoading && filteredExercises.length === 0 && (
        <div className="border border-dashed border-white/[0.15] rounded-2xl p-16 text-center space-y-4">
          <Feather size={32} className="mx-auto text-white/30" />
          <h3 className="text-xl font-display font-light italic text-white/60">No exercises yet</h3>
          <p className="font-serif text-sm text-white/55 max-w-sm mx-auto leading-relaxed">
            Create a writing prompt for the community — a constraint, a starting line, a form to try. Others can respond and share what they wrote.
          </p>
          <button
            onClick={() => setShowNewForm(true)}
            className="inline-flex items-center gap-2 mt-2 px-5 py-2.5 border border-white/20 hover:border-amber-500/30 rounded-full font-mono text-[10px] uppercase tracking-widest text-white/60 hover:text-white bg-white/[0.03] hover:bg-white/[0.06] transition-all"
            data-testid="button-create-first-exercise"
          >
            <Plus size={13} />
            Create the First Exercise
          </button>
        </div>
      )}

      <div className="space-y-3">
        {filteredExercises.map((exercise, i) => {
          const isExpanded = expandedExercise === exercise.id;
          return (
            <motion.div
              key={exercise.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03, duration: 0.3 }}
              data-testid={`exercise-card-${exercise.id}`}
            >
              <div className={`rounded-xl border overflow-hidden transition-all duration-300 ${
                isExpanded
                  ? "border-white/25 bg-white/[0.025]"
                  : "border-white/[0.15] hover:border-white/[0.15] bg-white/[0.04]"
              }`}>
                <button
                  onClick={() => setExpandedExercise(isExpanded ? null : exercise.id)}
                  className="w-full text-left p-4 md:p-5"
                  data-testid={`button-expand-exercise-${exercise.id}`}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-white/[0.04] border border-white/[0.15] flex items-center justify-center text-white/60">
                      <Feather size={14} />
                    </div>
                    <div className="flex-grow min-w-0">
                      <h3 className="text-base font-display font-light text-white/80 italic mb-1">{exercise.title}</h3>
                      <p className="font-serif text-sm text-white/50 line-clamp-2 leading-relaxed">{exercise.prompt}</p>
                      <div className="flex items-center gap-3 mt-2 text-white/55">
                        <span className="font-mono text-[10px]">{exercise.authorName}</span>
                        <span className="font-mono text-[9px]">{timeAgo(exercise.createdAt)}</span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2 flex-shrink-0">
                      <span className="px-2 py-0.5 rounded-full border border-white/[0.20] font-mono text-[8px] uppercase tracking-widest text-white/55" data-testid={`badge-exercise-category-${exercise.id}`}>
                        {exercise.category}
                      </span>
                      <div className="flex items-center gap-2">
                        {exercise.durationMinutes && (
                          <span className="font-mono text-[9px] text-white/55" data-testid={`text-duration-${exercise.id}`}>{exercise.durationMinutes}m</span>
                        )}
                        <div className="flex items-center gap-1 text-white/55">
                          <PenLine size={10} />
                          <span className="font-mono text-[9px]" data-testid={`text-response-count-${exercise.id}`}>
                            {exercise.responseCount} {exercise.responseCount === 1 ? "response" : "responses"}
                          </span>
                        </div>
                      </div>
                      <ChevronDown size={13} className={`text-white/50 transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`} />
                    </div>
                  </div>
                </button>

                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25 }}
                      className="overflow-hidden"
                    >
                      <div className="px-4 md:px-5 pb-4 md:pb-5 space-y-4 border-t border-white/[0.15]">
                        <div className="pt-4 p-4 bg-white/[0.05] rounded-lg border border-white/[0.15]">
                          <p className="font-serif text-sm text-white/60 leading-relaxed italic" data-testid={`text-exercise-prompt-${exercise.id}`}>{exercise.prompt}</p>
                        </div>
                        <ExerciseResponses exerciseId={exercise.id} />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

type MicroSwapItem = {
  id: string;
  userId: string;
  fragment: string;
  genre: string | null;
  matchedWithId: string | null;
  response: string | null;
  partnerResponse: string | null;
  status: string;
  createdAt: string;
  partnerFragment?: string;
  partnerName?: string;
};

function MicroSwapSection() {
  const [fragment, setFragment] = useState("");
  const [genre, setGenre] = useState("");
  const [responseText, setResponseText] = useState("");
  const queryClient = useQueryClient();

  const { data: microSwaps = [], isLoading } = useQuery<MicroSwapItem[]>({
    queryKey: ["/api/micro-swaps"],
    queryFn: async () => {
      const res = await fetch("/api/micro-swaps", { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch micro-swaps");
      return res.json();
    },
    refetchInterval: 5000,
  });

  const createMutation = useMutation({
    mutationFn: async (data: { fragment: string; genre?: string }) => {
      const res = await fetch("/api/micro-swaps", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to create micro-swap");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/micro-swaps"] });
      setFragment("");
      setGenre("");
    },
  });

  const respondMutation = useMutation({
    mutationFn: async ({ id, response }: { id: string; response: string }) => {
      const res = await fetch(`/api/micro-swaps/${id}/respond`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ response }),
      });
      if (!res.ok) throw new Error("Failed to respond");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/micro-swaps"] });
      setResponseText("");
    },
  });

  const handleCreate = () => {
    if (!fragment.trim()) return;
    const data: { fragment: string; genre?: string } = { fragment: fragment.trim() };
    if (genre.trim()) data.genre = genre.trim();
    createMutation.mutate(data);
  };

  const handleRespond = (id: string) => {
    if (!responseText.trim()) return;
    respondMutation.mutate({ id, response: responseText.trim() });
  };

  const activeSwap = microSwaps.find((s) => s.status === "waiting" || s.status === "matched");
  const completedSwaps = microSwaps.filter((s) => s.status === "completed");

  if (isLoading) return <ListSkeleton count={2} />;

  if (!activeSwap) {
    return (
      <div className="space-y-4" data-testid="micro-swap-create">
        <textarea
          value={fragment}
          onChange={(e) => setFragment(e.target.value)}
          placeholder="A paragraph, an opening line, a rough thought..."
          rows={3}
          className="w-full bg-white/[0.04] border border-amber-500/15 rounded-xl px-4 py-3 text-sm font-serif text-white/75 placeholder:text-white/40 focus:outline-none focus:border-amber-500/30 transition-colors resize-none"
          data-testid="input-micro-fragment"
        />
        <div className="flex items-center gap-3">
          <input
            type="text"
            value={genre}
            onChange={(e) => setGenre(e.target.value)}
            placeholder="Genre (optional)"
            className="flex-grow bg-white/[0.04] border border-white/[0.12] rounded-lg px-3 py-2 text-xs font-mono text-white/60 placeholder:text-white/35 focus:outline-none focus:border-white/25 transition-colors"
            data-testid="input-micro-genre"
          />
          <motion.button
            onClick={handleCreate}
            disabled={!fragment.trim() || createMutation.isPending}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="px-5 py-2 bg-amber-500/10 hover:bg-amber-500/15 border border-amber-500/25 hover:border-amber-500/40 rounded-full font-mono text-[9px] uppercase tracking-widest text-amber-300/80 hover:text-amber-200 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
            data-testid="button-send-fragment"
          >
            <Send size={12} className="inline mr-1.5 -mt-0.5" />
            Send into the garden
          </motion.button>
        </div>

        {completedSwaps.length > 0 && (
          <div className="pt-4 space-y-3">
            <p className="font-mono text-[9px] uppercase tracking-widest text-white/40">Past exchanges</p>
            {completedSwaps.slice(0, 3).map((s) => (
              <div key={s.id} className="border border-white/[0.08] rounded-xl p-4 bg-white/[0.02] space-y-3" data-testid={`micro-swap-completed-${s.id}`}>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="font-mono text-[8px] uppercase tracking-widest text-white/35 mb-1">Your fragment</p>
                    <p className="font-serif text-xs text-white/50 leading-relaxed">{s.fragment}</p>
                    {s.partnerResponse && (
                      <div className="mt-2 pl-3 border-l border-white/[0.1]">
                        <p className="font-mono text-[8px] uppercase tracking-widest text-white/30 mb-0.5">Their response</p>
                        <p className="font-serif text-xs text-white/45 italic">{s.partnerResponse}</p>
                      </div>
                    )}
                  </div>
                  <div>
                    <p className="font-mono text-[8px] uppercase tracking-widest text-white/35 mb-1">{s.partnerName || "Partner"}'s fragment</p>
                    <p className="font-serif text-xs text-white/50 leading-relaxed">{s.partnerFragment}</p>
                    {s.response && (
                      <div className="mt-2 pl-3 border-l border-white/[0.1]">
                        <p className="font-mono text-[8px] uppercase tracking-widest text-white/30 mb-0.5">Your response</p>
                        <p className="font-serif text-xs text-white/45 italic">{s.response}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  if (activeSwap.status === "waiting") {
    return (
      <div className="space-y-4" data-testid="micro-swap-waiting">
        <div className="border border-amber-500/15 rounded-xl p-5 bg-amber-500/[0.03]">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-2 h-2 rounded-full bg-amber-400/50 animate-pulse" />
            <p className="font-mono text-[10px] uppercase tracking-widest text-amber-400/60">Waiting for a partner...</p>
          </div>
          <p className="font-serif text-sm text-white/60 leading-relaxed">{activeSwap.fragment}</p>
          {activeSwap.genre && (
            <p className="font-mono text-[9px] text-white/40 mt-2">{activeSwap.genre}</p>
          )}
        </div>
        <p className="font-serif text-xs text-white/40 text-center italic">Your fragment is drifting through the garden, looking for someone to meet.</p>
      </div>
    );
  }

  if (activeSwap.status === "matched" && !activeSwap.response) {
    return (
      <div className="space-y-4" data-testid="micro-swap-respond">
        <div className="border border-amber-500/20 rounded-xl p-5 bg-amber-500/[0.04]">
          <div className="flex items-center justify-between mb-3">
            <p className="font-mono text-[10px] uppercase tracking-widest text-amber-400/60">A stranger's fragment</p>
            {activeSwap.partnerName && (
              <span className="font-mono text-[9px] text-white/40">{activeSwap.partnerName}</span>
            )}
          </div>
          <p className="font-serif text-sm text-white/70 leading-relaxed italic" data-testid="text-partner-fragment">{activeSwap.partnerFragment}</p>
        </div>
        <div>
          <p className="font-display text-sm italic text-white/50 mb-2">What do you notice?</p>
          <textarea
            value={responseText}
            onChange={(e) => setResponseText(e.target.value)}
            placeholder="A sentence or two — what catches your attention?"
            rows={2}
            className="w-full bg-white/[0.04] border border-white/[0.15] rounded-xl px-4 py-3 text-sm font-serif text-white/75 placeholder:text-white/40 focus:outline-none focus:border-amber-500/25 transition-colors resize-none"
            data-testid="input-micro-response"
          />
          <div className="flex justify-end mt-2">
            <motion.button
              onClick={() => handleRespond(activeSwap.id)}
              disabled={!responseText.trim() || respondMutation.isPending}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="px-5 py-2 bg-amber-500/10 hover:bg-amber-500/15 border border-amber-500/25 hover:border-amber-500/40 rounded-full font-mono text-[9px] uppercase tracking-widest text-amber-300/80 hover:text-amber-200 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
              data-testid="button-submit-micro-response"
            >
              Send
            </motion.button>
          </div>
        </div>
      </div>
    );
  }

  if (activeSwap.status === "matched" && activeSwap.response) {
    return (
      <div className="space-y-4" data-testid="micro-swap-awaiting-partner">
        <div className="border border-amber-500/15 rounded-xl p-5 bg-amber-500/[0.03]">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-2 h-2 rounded-full bg-amber-400/50 animate-pulse" />
            <p className="font-mono text-[10px] uppercase tracking-widest text-amber-400/60">Waiting for partner's response...</p>
          </div>
          <p className="font-serif text-xs text-white/50 mb-2">You wrote:</p>
          <p className="font-serif text-sm text-white/60 leading-relaxed italic">{activeSwap.response}</p>
        </div>
      </div>
    );
  }

  return null;
}

export function SwapRoom({ onBack }: { onBack: () => void }) {
  const [swapView, setSwapView] = useState<"quick" | "full">("quick");
  const [activeStatus, setActiveStatus] = useState<string>("all");
  const [showOfferForm, setShowOfferForm] = useState(false);
  const [selectedWritingId, setSelectedWritingId] = useState<string>("");
  const [swapGenre, setSwapGenre] = useState("");
  const [swapNote, setSwapNote] = useState("");
  const [matchingSwapId, setMatchingSwapId] = useState<string | null>(null);
  const [matchWritingId, setMatchWritingId] = useState<string>("");
  const [feedbackSwapId, setFeedbackSwapId] = useState<string | null>(null);
  const [feedbackToUserId, setFeedbackToUserId] = useState("");
  const [feedbackStrengths, setFeedbackStrengths] = useState("");
  const [feedbackSuggestions, setFeedbackSuggestions] = useState("");
  const [feedbackFavoriteLines, setFeedbackFavoriteLines] = useState("");
  const queryClient = useQueryClient();

  const { data: swaps = [], isLoading } = useQuery<SwapRequest[]>({
    queryKey: ["/api/swaps"],
    queryFn: async () => {
      const res = await fetch("/api/swaps", { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch swaps");
      return res.json();
    },
  });

  const { data: writings = [] } = useQuery<Writing[]>({
    queryKey: ["/api/writings"],
    queryFn: async () => {
      const res = await fetch("/api/writings", { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch writings");
      return res.json();
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: { writingId: string; genre?: string; note?: string }) => {
      const res = await fetch("/api/swaps", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to create swap");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/swaps"] });
      setShowOfferForm(false);
      setSelectedWritingId("");
      setSwapGenre("");
      setSwapNote("");
    },
  });

  const matchMutation = useMutation({
    mutationFn: async ({ swapId, writingId }: { swapId: string; writingId: string }) => {
      const res = await fetch(`/api/swaps/${swapId}/match`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ writingId }),
      });
      if (!res.ok) throw new Error("Failed to match swap");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/swaps"] });
      setMatchingSwapId(null);
      setMatchWritingId("");
    },
  });

  const feedbackMutation = useMutation({
    mutationFn: async ({ swapId, data }: { swapId: string; data: { toUserId: string; strengths: string; suggestions: string; favoriteLines?: string } }) => {
      const res = await fetch(`/api/swaps/${swapId}/feedback`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to submit feedback");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/swaps"] });
      setFeedbackSwapId(null);
      setFeedbackToUserId("");
      setFeedbackStrengths("");
      setFeedbackSuggestions("");
      setFeedbackFavoriteLines("");
    },
  });

  const handleCreateSwap = () => {
    if (!selectedWritingId) return;
    const data: { writingId: string; genre?: string; note?: string } = { writingId: selectedWritingId };
    if (swapGenre.trim()) data.genre = swapGenre.trim();
    if (swapNote.trim()) data.note = swapNote.trim();
    createMutation.mutate(data);
  };

  const handleMatch = (swapId: string) => {
    if (!matchWritingId) return;
    matchMutation.mutate({ swapId, writingId: matchWritingId });
  };

  const handleFeedback = (swapId: string) => {
    if (!feedbackStrengths.trim() || !feedbackSuggestions.trim() || !feedbackToUserId) return;
    const data: { toUserId: string; strengths: string; suggestions: string; favoriteLines?: string } = {
      toUserId: feedbackToUserId,
      strengths: feedbackStrengths.trim(),
      suggestions: feedbackSuggestions.trim(),
    };
    if (feedbackFavoriteLines.trim()) data.favoriteLines = feedbackFavoriteLines.trim();
    feedbackMutation.mutate({ swapId, data });
  };

  const filteredSwaps = swaps
    .filter((s) => activeStatus === "all" || s.status === activeStatus)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const statusColors: Record<string, string> = {
    open: "text-amber-400/60 border-amber-500/20",
    matched: "text-emerald-400/60 border-emerald-500/20",
    completed: "text-pink-400/60 border-pink-500/20",
  };

  return (
    <div className="max-w-3xl mx-auto" data-testid="swap-room">
      <div className="flex items-center justify-between mb-8">
        <BackButton onBack={onBack} />
        <div className="flex items-center gap-3">
          <ArrowLeftRight size={16} className="text-white/55" />
          <h2 className="text-xl font-display font-light italic text-white/80">Swap</h2>
        </div>
        {swapView === "full" ? (
          <motion.button
            onClick={() => setShowOfferForm(!showOfferForm)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.97 }}
            className="flex items-center gap-2 px-4 py-2 border border-white/20 hover:border-amber-500/30 rounded-full font-mono text-[10px] uppercase tracking-widest text-white/70 hover:text-white bg-white/[0.03] hover:bg-white/[0.06] transition-all"
            data-testid="button-offer-swap"
          >
            <Plus size={13} />
            Offer a Swap
          </motion.button>
        ) : <div />}
      </div>

      <div className="flex gap-1 mb-6 p-1 bg-white/[0.03] border border-white/[0.08] rounded-full w-fit" data-testid="swap-view-toggle">
        <button
          onClick={() => setSwapView("quick")}
          className={`px-4 py-1.5 rounded-full font-mono text-[9px] uppercase tracking-widest transition-all ${
            swapView === "quick"
              ? "bg-amber-500/15 border border-amber-500/25 text-amber-300/80"
              : "text-white/50 hover:text-white/70 border border-transparent"
          }`}
          data-testid="button-view-quick"
        >
          Quick Exchange
        </button>
        <button
          onClick={() => setSwapView("full")}
          className={`px-4 py-1.5 rounded-full font-mono text-[9px] uppercase tracking-widest transition-all ${
            swapView === "full"
              ? "bg-white/[0.08] border border-white/20 text-white/80"
              : "text-white/50 hover:text-white/70 border border-transparent"
          }`}
          data-testid="button-view-full"
        >
          Full Swap
        </button>
      </div>

      {swapView === "quick" ? (
        <div>
          <p className="font-serif text-sm text-white/50 leading-relaxed mb-5 max-w-xl">
            Drop a fragment — a paragraph, an opening line, a rough thought. Get matched with a stranger's fragment. Write back what you notice.
          </p>
          <MicroSwapSection />
        </div>
      ) : (
      <>
      <p className="font-serif text-sm text-white/50 leading-relaxed mb-6 max-w-xl">
        Find a reading partner. Offer one of your pieces, get matched with another writer, and exchange thoughtful feedback. Every swap is a gift — someone reading your work with real attention.
      </p>

      <AnimatePresence>
        {showOfferForm && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden mb-6"
          >
            <div className="border border-white/[0.15] rounded-xl p-5 space-y-4 bg-white/[0.05]" data-testid="new-swap-form">
              <div>
                <label className="font-mono text-[9px] uppercase tracking-widest text-white/60 mb-2 block">Select your writing</label>
                <select
                  value={selectedWritingId}
                  onChange={(e) => setSelectedWritingId(e.target.value)}
                  className="w-full bg-transparent text-white/70 font-serif text-sm border border-white/[0.20] rounded-lg px-3 py-2.5 focus:outline-none hover:border-white/25 transition-colors cursor-pointer"
                  data-testid="select-swap-writing"
                >
                  <option value="" className="bg-[#0b101a]">Choose a piece...</option>
                  {writings.map((w) => (
                    <option key={w.id} value={w.id} className="bg-[#0b101a]">{w.title}</option>
                  ))}
                </select>
              </div>
              <input
                type="text"
                value={swapGenre}
                onChange={(e) => setSwapGenre(e.target.value)}
                placeholder="What genre do you prefer to read? (optional)"
                className="w-full bg-white/[0.05] border border-white/[0.20] rounded-lg px-3 py-2.5 text-sm font-serif text-white/75 placeholder:text-white/45 focus:outline-none focus:border-white/40 transition-colors"
                data-testid="input-swap-genre"
              />
              <textarea
                value={swapNote}
                onChange={(e) => setSwapNote(e.target.value)}
                placeholder="Tell potential partners what kind of feedback you're looking for (optional)..."
                rows={2}
                className="w-full bg-white/[0.05] border border-white/[0.20] rounded-lg px-3 py-2.5 text-sm font-serif text-white/75 placeholder:text-white/45 focus:outline-none focus:border-white/40 transition-colors resize-none"
                data-testid="input-swap-note"
              />
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setShowOfferForm(false)}
                  className="px-4 py-2 font-mono text-[9px] uppercase tracking-widest text-white/50 hover:text-white/75 transition-colors"
                  data-testid="button-cancel-swap"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateSwap}
                  disabled={!selectedWritingId || createMutation.isPending}
                  className="px-5 py-2 bg-white/[0.06] hover:bg-white/[0.1] border border-white/20 hover:border-white/20 rounded-full font-mono text-[9px] uppercase tracking-widest text-white/75 hover:text-white transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                  data-testid="button-submit-swap"
                >
                  Offer
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex flex-wrap gap-1.5 mb-6">
        <CategoryPill label="All" active={activeStatus === "all"} onClick={() => setActiveStatus("all")} testId="filter-swap-all" />
        {SWAP_STATUSES.map((s) => (
          <CategoryPill key={s} label={s} active={activeStatus === s} onClick={() => setActiveStatus(s)} testId={`filter-swap-${s}`} />
        ))}
      </div>

      {isLoading && <ListSkeleton count={4} />}

      {!isLoading && filteredSwaps.length === 0 && (
        <div className="border border-dashed border-white/[0.15] rounded-2xl p-16 text-center space-y-4">
          <ArrowLeftRight size={32} className="mx-auto text-white/30" />
          <h3 className="text-xl font-display font-light italic text-white/60">No swap requests yet</h3>
          <p className="font-serif text-sm text-white/55 max-w-sm mx-auto leading-relaxed">
            Offer one of your pieces for beta reading. Another writer will match with you, and you'll each read and give feedback on the other's work.
          </p>
          <button
            onClick={() => setShowOfferForm(true)}
            className="inline-flex items-center gap-2 mt-2 px-5 py-2.5 border border-white/20 hover:border-amber-500/30 rounded-full font-mono text-[10px] uppercase tracking-widest text-white/60 hover:text-white bg-white/[0.03] hover:bg-white/[0.06] transition-all"
            data-testid="button-offer-first-swap"
          >
            <Plus size={13} />
            Offer the First Swap
          </button>
        </div>
      )}

      <div className="space-y-3">
        {filteredSwaps.map((swap, i) => (
          <motion.div
            key={swap.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.03, duration: 0.3 }}
            data-testid={`swap-card-${swap.id}`}
          >
            <div className="rounded-xl border border-white/[0.15] hover:border-white/[0.15] bg-white/[0.04] overflow-hidden transition-all duration-300">
              <div className="p-4 md:p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-grow min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`px-2 py-0.5 rounded-full border font-mono text-[8px] uppercase tracking-widest ${statusColors[swap.status] || "text-white/55 border-white/[0.20]"}`} data-testid={`badge-status-${swap.id}`}>
                        {swap.status}
                      </span>
                      <h3 className="text-base font-display font-light text-white/80 italic truncate" data-testid={`text-swap-title-${swap.id}`}>{swap.writingTitle}</h3>
                    </div>
                    <div className="flex items-center gap-3 text-white/55 mb-2">
                      <span className="font-mono text-[10px]">{swap.requesterName}</span>
                      {swap.genre && <span className="font-mono text-[9px] text-white/50">·  {swap.genre}</span>}
                      <span className="font-mono text-[9px]">{timeAgo(swap.createdAt)}</span>
                    </div>
                    {swap.note && (
                      <p className="font-serif text-sm text-white/50 leading-relaxed" data-testid={`text-swap-note-${swap.id}`}>{swap.note}</p>
                    )}
                    {swap.status === "matched" && swap.matchedName && (
                      <div className="mt-3 p-3 bg-emerald-500/[0.04] border border-emerald-500/10 rounded-lg">
                        <p className="font-mono text-[9px] uppercase tracking-widest text-emerald-400/50 mb-1">Matched with</p>
                        <p className="font-serif text-sm text-white/70">{swap.matchedName}</p>
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col gap-2 flex-shrink-0">
                    {swap.status === "open" && (
                      <>
                        {matchingSwapId === swap.id ? (
                          <div className="space-y-2" data-testid={`match-form-${swap.id}`}>
                            <select
                              value={matchWritingId}
                              onChange={(e) => setMatchWritingId(e.target.value)}
                              className="bg-transparent text-white/60 font-serif text-xs border border-white/[0.20] rounded-lg px-2 py-1.5 focus:outline-none hover:border-white/25 transition-colors cursor-pointer w-40"
                              data-testid={`select-match-writing-${swap.id}`}
                            >
                              <option value="" className="bg-[#0b101a]">Pick your piece...</option>
                              {writings.map((w) => (
                                <option key={w.id} value={w.id} className="bg-[#0b101a]">{w.title}</option>
                              ))}
                            </select>
                            <div className="flex gap-1">
                              <button
                                onClick={() => setMatchingSwapId(null)}
                                className="px-2 py-1 font-mono text-[8px] uppercase tracking-widest text-white/60 hover:text-white/70 transition-colors"
                                data-testid={`button-cancel-match-${swap.id}`}
                              >
                                Cancel
                              </button>
                              <button
                                onClick={() => handleMatch(swap.id)}
                                disabled={!matchWritingId || matchMutation.isPending}
                                className="px-3 py-1 bg-white/[0.06] hover:bg-white/[0.1] border border-white/20 rounded-full font-mono text-[8px] uppercase tracking-widest text-white/70 hover:text-white transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                                data-testid={`button-confirm-match-${swap.id}`}
                              >
                                Confirm
                              </button>
                            </div>
                          </div>
                        ) : (
                          <button
                            onClick={() => setMatchingSwapId(swap.id)}
                            className="flex items-center gap-1.5 px-3 py-1.5 border border-white/20 hover:border-white/20 rounded-full font-mono text-[9px] uppercase tracking-widest text-white/60 hover:text-white/80 transition-all"
                            data-testid={`button-match-${swap.id}`}
                          >
                            <ArrowLeftRight size={10} />
                            Match
                          </button>
                        )}
                      </>
                    )}
                    {swap.status === "matched" && (
                      <>
                        {feedbackSwapId === swap.id ? (
                          <div className="space-y-2 w-60" data-testid={`feedback-form-${swap.id}`}>
                            <input
                              type="hidden"
                              value={feedbackToUserId}
                            />
                            <label className="font-mono text-[9px] uppercase tracking-widest text-white/55 block mb-1">What worked well?</label>
                            <textarea
                              value={feedbackStrengths}
                              onChange={(e) => setFeedbackStrengths(e.target.value)}
                              placeholder="Strengths..."
                              rows={2}
                              className="w-full bg-white/[0.05] border border-white/[0.20] rounded-lg px-3 py-2 text-xs font-serif text-white/75 placeholder:text-white/45 focus:outline-none focus:border-white/40 transition-colors resize-none"
                              data-testid={`input-feedback-strengths-${swap.id}`}
                            />
                            <label className="font-mono text-[9px] uppercase tracking-widest text-white/55 block mb-1">Suggestions for improvement</label>
                            <textarea
                              value={feedbackSuggestions}
                              onChange={(e) => setFeedbackSuggestions(e.target.value)}
                              placeholder="Suggestions..."
                              rows={2}
                              className="w-full bg-white/[0.05] border border-white/[0.20] rounded-lg px-3 py-2 text-xs font-serif text-white/75 placeholder:text-white/45 focus:outline-none focus:border-white/40 transition-colors resize-none"
                              data-testid={`input-feedback-suggestions-${swap.id}`}
                            />
                            <label className="font-mono text-[9px] uppercase tracking-widest text-white/55 block mb-1">Favorite lines (optional)</label>
                            <input
                              type="text"
                              value={feedbackFavoriteLines}
                              onChange={(e) => setFeedbackFavoriteLines(e.target.value)}
                              placeholder="Favorite lines (optional)..."
                              className="w-full bg-white/[0.05] border border-white/[0.20] rounded-lg px-3 py-2 text-xs font-serif text-white/75 placeholder:text-white/45 focus:outline-none focus:border-white/40 transition-colors"
                              data-testid={`input-feedback-favorites-${swap.id}`}
                            />
                            <div className="flex gap-1">
                              <button
                                onClick={() => setFeedbackSwapId(null)}
                                className="px-2 py-1 font-mono text-[8px] uppercase tracking-widest text-white/60 hover:text-white/70 transition-colors"
                                data-testid={`button-cancel-feedback-${swap.id}`}
                              >
                                Cancel
                              </button>
                              <button
                                onClick={() => handleFeedback(swap.id)}
                                disabled={!feedbackStrengths.trim() || !feedbackSuggestions.trim() || feedbackMutation.isPending}
                                className="px-3 py-1 bg-white/[0.06] hover:bg-white/[0.1] border border-white/20 rounded-full font-mono text-[8px] uppercase tracking-widest text-white/70 hover:text-white transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                                data-testid={`button-submit-feedback-${swap.id}`}
                              >
                                Send
                              </button>
                            </div>
                          </div>
                        ) : (
                          <button
                            onClick={() => {
                              setFeedbackSwapId(swap.id);
                              setFeedbackToUserId(swap.requesterId);
                            }}
                            className="flex items-center gap-1.5 px-3 py-1.5 border border-emerald-500/15 hover:border-emerald-500/30 rounded-full font-mono text-[9px] uppercase tracking-widest text-emerald-400/50 hover:text-emerald-400/80 transition-all"
                            data-testid={`button-give-feedback-${swap.id}`}
                          >
                            <PenLine size={10} />
                            Feedback
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
      </>
      )}
    </div>
  );
}

type DeskPrompt = {
  id: string;
  text: string;
  category: string;
  createdAt: string;
};

type DeskEntry = {
  id: string;
  authorId: string;
  content: string;
  promptId?: string;
  authorName?: string;
  createdAt: string;
};

export function TheDeskRoom({ onBack }: { onBack: () => void }) {
  const queryClient = useQueryClient();
  const [isWriting, setIsWriting] = useState(false);
  const [deskText, setDeskText] = useState("");
  const [activePromptIndex, setActivePromptIndex] = useState(0);

  const { data: prompts = [], isLoading: loadingPrompts } = useQuery<DeskPrompt[]>({
    queryKey: ["/api/prompts"],
    queryFn: async () => {
      const r = await fetch("/api/prompts", { credentials: "include" });
      return r.ok ? r.json() : [];
    },
  });

  const { data: gardenFeed = [], isLoading: loadingFeed } = useQuery<any[]>({
    queryKey: ["/api/garden-feed", "desk-recent"],
    queryFn: async () => {
      const r = await fetch("/api/garden-feed", { credentials: "include" });
      return r.ok ? r.json() : [];
    },
  });

  const recentPieces = gardenFeed.slice(0, 10);

  const currentPrompt = prompts[activePromptIndex];

  return (
    <div className="space-y-6" data-testid="the-desk-room">
      <div className="flex items-center gap-3 mb-2">
        <button
          onClick={onBack}
          className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-white/60 hover:text-white/75 transition-colors group"
          data-testid="button-back-desk"
        >
          <ChevronLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
          Back
        </button>
        <div className="flex-1" />
        <PenLine size={16} className="text-white/30" />
      </div>

      <div className="text-center space-y-3 pb-4 border-b border-white/[0.06]">
        <h2 className="text-2xl font-display font-light italic text-white/80">The Desk</h2>
        <p className="font-serif text-sm text-white/45 max-w-md mx-auto leading-relaxed">
          A shared writing space. Pick a prompt, write freely, or simply read what others have left on the desk today.
        </p>
      </div>

      {prompts.length > 0 && (
        <div className="border border-amber-500/10 bg-amber-500/[0.02] rounded-xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <p className="font-mono text-[9px] uppercase tracking-widest text-amber-400/40">Today's Prompt</p>
            <button
              onClick={() => setActivePromptIndex((activePromptIndex + 1) % prompts.length)}
              className="p-1 text-white/25 hover:text-white/50 transition-colors"
              title="Next prompt"
              data-testid="button-next-desk-prompt"
            >
              <Sparkles size={13} />
            </button>
          </div>
          {currentPrompt && (
            <p className="font-display text-xl font-light italic text-amber-200/50 leading-relaxed">
              {currentPrompt.text}
            </p>
          )}
          {!isWriting ? (
            <button
              onClick={() => setIsWriting(true)}
              className="flex items-center gap-2 px-4 py-2 bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.12] rounded-lg font-mono text-[9px] uppercase tracking-widest text-white/55 hover:text-white/75 transition-all"
              data-testid="button-start-desk-write"
            >
              <Feather size={12} />
              Write at the desk
            </button>
          ) : (
            <div className="space-y-3">
              <textarea
                value={deskText}
                onChange={(e) => setDeskText(e.target.value)}
                placeholder="Write freely..."
                className="w-full bg-white/[0.03] border border-white/[0.10] rounded-xl px-4 py-3 text-sm font-serif text-white/75 placeholder:text-white/30 focus:outline-none focus:border-white/25 resize-none h-40 transition-colors"
                autoFocus
                data-testid="input-desk-text"
              />
              <div className="flex items-center gap-2">
                <button
                  onClick={() => { setIsWriting(false); setDeskText(""); }}
                  className="px-3 py-1.5 font-mono text-[8px] uppercase tracking-widest text-white/40 hover:text-white/60 transition-colors"
                  data-testid="button-cancel-desk-write"
                >
                  Cancel
                </button>
                <span className="font-mono text-[8px] text-white/20">
                  {deskText.trim().split(/\s+/).filter(Boolean).length} words
                </span>
              </div>
            </div>
          )}
        </div>
      )}

      {loadingPrompts && <ListSkeleton count={1} />}

      <div className="space-y-3">
        <p className="font-mono text-[9px] uppercase tracking-widest text-white/35">Recently on the desk</p>
        {loadingFeed ? (
          <ListSkeleton count={4} />
        ) : recentPieces.length > 0 ? (
          recentPieces.map((piece: any) => (
            <motion.div
              key={piece.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="border border-white/[0.08] rounded-xl p-5 space-y-3 hover:border-white/[0.15] transition-colors"
            >
              <div className="flex items-center gap-3">
                <span className="font-serif text-xs text-white/40 italic">{piece.authorName || "Anonymous"}</span>
                <span className="font-mono text-[8px] text-white/20">{timeAgo(piece.createdAt)}</span>
                <span className="ml-auto font-mono text-[8px] uppercase tracking-widest text-white/15 px-2 py-0.5 border border-white/[0.06] rounded-full">{piece.genre}</span>
              </div>
              <h4 className="font-display text-lg font-light text-white/70">{piece.title}</h4>
              <div className="font-serif text-sm text-white/50 leading-relaxed line-clamp-3">
                <ContentRenderer content={piece.content} maxLength={200} />
              </div>
            </motion.div>
          ))
        ) : (
          <div className="border border-dashed border-white/[0.10] rounded-xl p-12 text-center space-y-3">
            <PenLine size={24} className="mx-auto text-white/20" />
            <p className="font-serif text-sm text-white/40 italic">The desk is quiet. Be the first to write something today.</p>
          </div>
        )}
      </div>
    </div>
  );
}

type GalleryPiece = {
  id: string;
  title: string;
  content: string;
  genre: string;
  authorId: string;
  authorName: string | null;
  publishedAt: string | null;
  createdAt: string;
};

export function ThePressRoom({ onBack }: { onBack: () => void }) {
  const [view, setView] = useState<"published" | "editorial">("published");

  const { data: gallery = [], isLoading: loadingGallery } = useQuery<GalleryPiece[]>({
    queryKey: ["/api/gallery"],
    queryFn: async () => {
      const r = await fetch("/api/gallery", { credentials: "include" });
      return r.ok ? r.json() : [];
    },
  });

  const { data: editorialPieces = [], isLoading: loadingEditorial } = useQuery<any[]>({
    queryKey: ["/api/editorial/pieces"],
    queryFn: async () => {
      const r = await fetch("/api/editorial/pieces", { credentials: "include" });
      return r.ok ? r.json() : [];
    },
  });

  return (
    <div className="space-y-6" data-testid="the-press-room">
      <div className="flex items-center gap-3 mb-2">
        <button
          onClick={onBack}
          className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-white/60 hover:text-white/75 transition-colors group"
          data-testid="button-back-press"
        >
          <ChevronLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
          Back
        </button>
        <div className="flex-1" />
        <FileCheck size={16} className="text-white/30" />
      </div>

      <div className="text-center space-y-3 pb-4 border-b border-white/[0.06]">
        <h2 className="text-2xl font-display font-light italic text-white/80">The Press</h2>
        <p className="font-serif text-sm text-white/45 max-w-md mx-auto leading-relaxed">
          Where writing becomes published. Browse the gallery collection or discover pieces ready for the editorial eye.
        </p>
      </div>

      <div className="flex items-center gap-2 justify-center">
        <button
          onClick={() => setView("published")}
          className={`px-4 py-2 rounded-full font-mono text-[9px] uppercase tracking-widest border transition-all ${view === "published" ? "border-white/20 bg-white/[0.08] text-white/80" : "border-white/[0.08] text-white/40 hover:text-white/55"}`}
          data-testid="press-tab-published"
        >
          <span className="flex items-center gap-1.5"><Award size={11} /> Published</span>
        </button>
        <button
          onClick={() => setView("editorial")}
          className={`px-4 py-2 rounded-full font-mono text-[9px] uppercase tracking-widest border transition-all ${view === "editorial" ? "border-white/20 bg-white/[0.08] text-white/80" : "border-white/[0.08] text-white/40 hover:text-white/55"}`}
          data-testid="press-tab-editorial"
        >
          <span className="flex items-center gap-1.5"><Sparkles size={11} /> Editorial Queue</span>
        </button>
      </div>

      {view === "published" ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="font-mono text-[9px] uppercase tracking-widest text-white/35">
              Gallery Collection — {gallery.length} {gallery.length === 1 ? "piece" : "pieces"}
            </p>
          </div>

          {loadingGallery ? (
            <ListSkeleton count={3} />
          ) : gallery.length > 0 ? (
            gallery.map((piece, i) => (
              <motion.div
                key={piece.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="border border-white/[0.10] rounded-xl p-6 space-y-4 hover:border-white/[0.18] transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <span className="font-mono text-[8px] uppercase tracking-widest text-amber-400/30 px-2 py-0.5 border border-amber-400/10 rounded-full">{piece.genre}</span>
                  {piece.authorName && <span className="font-serif text-xs text-white/35 italic">{piece.authorName}</span>}
                  {piece.publishedAt && (
                    <span className="ml-auto font-mono text-[8px] text-white/20">
                      {new Date(piece.publishedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                    </span>
                  )}
                </div>
                <h3 className="text-xl font-display font-light text-white/75 group-hover:text-white/90 transition-colors">{piece.title}</h3>
                <div className="font-serif text-sm text-white/45 leading-relaxed">
                  <ContentRenderer content={piece.content} maxLength={300} />
                </div>
              </motion.div>
            ))
          ) : (
            <div className="border border-dashed border-white/[0.10] rounded-xl p-12 text-center space-y-3">
              <Award size={28} className="mx-auto text-white/15" />
              <h3 className="font-display text-lg font-light italic text-white/50">The gallery awaits its first exhibit</h3>
              <p className="font-serif text-sm text-white/35 max-w-sm mx-auto leading-relaxed">
                When editors discover work that moves them, it will appear here — no submissions needed, just writing that finds its way.
              </p>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          <p className="font-mono text-[9px] uppercase tracking-widest text-white/35">
            Pieces available for editorial consideration — {editorialPieces.length} in queue
          </p>

          {loadingEditorial ? (
            <ListSkeleton count={3} />
          ) : editorialPieces.length > 0 ? (
            editorialPieces.map((piece: any, i: number) => (
              <motion.div
                key={piece.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="border border-white/[0.08] rounded-xl p-5 space-y-3 hover:border-white/[0.15] transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="font-mono text-[8px] uppercase tracking-widest text-violet-400/30 px-2 py-0.5 border border-violet-400/10 rounded-full">{piece.genre}</span>
                  <span className="font-serif text-xs text-white/35 italic">{piece.authorName || "Anonymous"}</span>
                  <span className="ml-auto flex items-center gap-1 font-mono text-[8px] text-white/20">
                    <Clock size={9} />
                    {timeAgo(piece.createdAt)}
                  </span>
                </div>
                <h4 className="font-display text-lg font-light text-white/65">{piece.title}</h4>
                <div className="font-serif text-sm text-white/40 leading-relaxed">
                  <ContentRenderer content={piece.content} maxLength={200} />
                </div>
                <div className="flex items-center gap-2 pt-1">
                  <span className="font-mono text-[7px] uppercase tracking-widest text-emerald-400/25 flex items-center gap-1">
                    <Sparkles size={8} /> Ready for editorial
                  </span>
                </div>
              </motion.div>
            ))
          ) : (
            <div className="border border-dashed border-white/[0.10] rounded-xl p-12 text-center space-y-3">
              <Sparkles size={24} className="mx-auto text-white/15" />
              <h3 className="font-display text-lg font-light italic text-white/50">No pieces in the editorial queue</h3>
              <p className="font-serif text-sm text-white/35 max-w-sm mx-auto leading-relaxed">
                Writers can mark their work as editorially available through the planting flow. Those pieces will appear here for discovery.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

type RejectionEntry = {
  id: string;
  userId: string;
  outlet: string;
  pieceTitle: string | null;
  result: string;
  context: string | null;
  silver_lining: string | null;
  userName: string;
  createdAt: string;
};

const RESULT_BADGES: Record<string, { label: string; color: string }> = {
  rejected: { label: "Rejected", color: "text-red-400/70 border-red-400/20 bg-red-400/[0.04]" },
  no_response: { label: "No Response", color: "text-amber-400/70 border-amber-400/20 bg-amber-400/[0.04]" },
  close_call: { label: "Close Call", color: "text-violet-400/70 border-violet-400/20 bg-violet-400/[0.04]" },
  personal_rejection: { label: "Personal Rejection", color: "text-blue-400/70 border-blue-400/20 bg-blue-400/[0.04]" },
};

export function RejectionWallRoom({ onBack }: { onBack: () => void }) {
  const [showNewForm, setShowNewForm] = useState(false);
  const [outlet, setOutlet] = useState("");
  const [pieceTitle, setPieceTitle] = useState("");
  const [result, setResult] = useState("rejected");
  const [context, setContext] = useState("");
  const [silverLining, setSilverLining] = useState("");
  const queryClient = useQueryClient();

  const { data: entries = [], isLoading } = useQuery<RejectionEntry[]>({
    queryKey: ["/api/rejection-wall"],
    queryFn: async () => {
      const res = await fetch("/api/rejection-wall", { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch rejection wall");
      return res.json();
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: { outlet: string; pieceTitle?: string; result: string; context?: string; silver_lining?: string }) => {
      const res = await fetch("/api/rejection-wall", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to post rejection");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/rejection-wall"] });
      setShowNewForm(false);
      setOutlet("");
      setPieceTitle("");
      setResult("rejected");
      setContext("");
      setSilverLining("");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/rejection-wall/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to delete rejection");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/rejection-wall"] });
    },
  });

  const handleCreate = () => {
    if (!outlet.trim()) return;
    createMutation.mutate({
      outlet: outlet.trim(),
      pieceTitle: pieceTitle.trim() || undefined,
      result,
      context: context.trim() || undefined,
      silver_lining: silverLining.trim() || undefined,
    });
  };

  return (
    <div className="max-w-3xl mx-auto" data-testid="rejection-wall-room">
      <div className="flex items-center justify-between mb-8">
        <BackButton onBack={onBack} />
        <div className="flex items-center gap-3">
          <ShieldOff size={16} className="text-white/55" />
          <h2 className="text-xl font-display font-light italic text-white/80">The Rejection Wall</h2>
        </div>
        <motion.button
          onClick={() => setShowNewForm(!showNewForm)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.97 }}
          className="flex items-center gap-2 px-4 py-2 border border-white/20 hover:border-amber-500/30 rounded-full font-mono text-[10px] uppercase tracking-widest text-white/70 hover:text-white bg-white/[0.03] hover:bg-white/[0.06] transition-all"
          data-testid="button-new-rejection"
        >
          <Plus size={13} />
          Pin Yours
        </motion.button>
      </div>

      <p className="font-serif text-sm text-white/50 leading-relaxed mb-6 max-w-xl">
        Every &lsquo;no&rsquo; is proof you&rsquo;re trying. Pin yours here.
      </p>

      <AnimatePresence>
        {showNewForm && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden mb-6"
          >
            <div className="border border-white/[0.15] rounded-xl p-5 space-y-4 bg-white/[0.05]" data-testid="new-rejection-form">
              <input
                type="text"
                value={outlet}
                onChange={(e) => setOutlet(e.target.value)}
                placeholder="Outlet / publication name..."
                className="w-full bg-transparent border-b border-white/[0.20] pb-2 text-lg font-display font-light italic text-white/80 placeholder:text-white/45 focus:outline-none focus:border-white/20 transition-colors"
                data-testid="input-rejection-outlet"
              />
              <input
                type="text"
                value={pieceTitle}
                onChange={(e) => setPieceTitle(e.target.value)}
                placeholder="Piece title (optional)..."
                className="w-full bg-white/[0.05] border border-white/[0.20] rounded-lg px-4 py-2 text-sm font-serif text-white/75 placeholder:text-white/45 focus:outline-none focus:border-white/40 transition-colors"
                data-testid="input-rejection-piece-title"
              />
              <div className="flex items-center gap-3">
                <label className="font-mono text-[9px] uppercase tracking-widest text-white/55">Result</label>
                <select
                  value={result}
                  onChange={(e) => setResult(e.target.value)}
                  className="bg-transparent text-white/50 font-mono text-[9px] uppercase tracking-widest border border-white/[0.20] rounded-full px-3 py-1.5 focus:outline-none hover:border-white/25 transition-colors cursor-pointer"
                  data-testid="select-rejection-result"
                >
                  <option value="rejected" className="bg-[#0b101a]">Rejected</option>
                  <option value="no_response" className="bg-[#0b101a]">No Response</option>
                  <option value="close_call" className="bg-[#0b101a]">Close Call</option>
                  <option value="personal_rejection" className="bg-[#0b101a]">Personal Rejection</option>
                </select>
              </div>
              <textarea
                value={context}
                onChange={(e) => setContext(e.target.value)}
                placeholder="What did you learn? (optional)"
                rows={3}
                className="w-full bg-white/[0.05] border border-white/[0.20] rounded-lg px-4 py-3 text-sm font-serif text-white/75 placeholder:text-white/45 focus:outline-none focus:border-white/40 transition-colors resize-none"
                data-testid="input-rejection-context"
              />
              <textarea
                value={silverLining}
                onChange={(e) => setSilverLining(e.target.value)}
                placeholder="Silver lining? (optional)"
                rows={2}
                className="w-full bg-white/[0.05] border border-white/[0.20] rounded-lg px-4 py-3 text-sm font-serif text-white/75 placeholder:text-white/45 focus:outline-none focus:border-white/40 transition-colors resize-none"
                data-testid="input-rejection-silver-lining"
              />
              <div className="flex items-center justify-end gap-2">
                <button
                  onClick={() => setShowNewForm(false)}
                  className="px-4 py-2 font-mono text-[9px] uppercase tracking-widest text-white/50 hover:text-white/75 transition-colors"
                  data-testid="button-cancel-rejection"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreate}
                  disabled={!outlet.trim() || createMutation.isPending}
                  className="px-5 py-2 bg-white/[0.06] hover:bg-white/[0.1] border border-white/20 hover:border-white/20 rounded-full font-mono text-[9px] uppercase tracking-widest text-white/75 hover:text-white transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                  data-testid="button-submit-rejection"
                >
                  Pin It
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {isLoading && <ListSkeleton count={4} />}

      {!isLoading && entries.length === 0 && (
        <div className="border border-dashed border-white/[0.15] rounded-2xl p-16 text-center space-y-4">
          <ShieldOff size={32} className="mx-auto text-white/30" />
          <h3 className="text-xl font-display font-light italic text-white/60">The wall is empty</h3>
          <p className="font-serif text-sm text-white/55 max-w-sm mx-auto leading-relaxed">
            Every writer collects rejections. Pin yours here and turn them into badges of courage.
          </p>
          <button
            onClick={() => setShowNewForm(true)}
            className="inline-flex items-center gap-2 mt-2 px-5 py-2.5 border border-white/20 hover:border-amber-500/30 rounded-full font-mono text-[10px] uppercase tracking-widest text-white/60 hover:text-white bg-white/[0.03] hover:bg-white/[0.06] transition-all"
            data-testid="button-first-rejection"
          >
            <Plus size={13} />
            Pin the First Rejection
          </button>
        </div>
      )}

      <div className="space-y-3">
        {entries.map((entry, i) => {
          const badge = RESULT_BADGES[entry.result] || RESULT_BADGES.rejected;
          return (
            <motion.div
              key={entry.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03, duration: 0.3 }}
              data-testid={`rejection-card-${entry.id}`}
            >
              <div className="rounded-xl border border-white/[0.15] hover:border-white/[0.15] bg-white/[0.04] p-4 md:p-5 space-y-3 transition-all duration-300">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-grow min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-base font-display font-light text-white/80 italic truncate" data-testid={`text-rejection-outlet-${entry.id}`}>{entry.outlet}</h3>
                      <span className={`px-2 py-0.5 rounded-full border font-mono text-[8px] uppercase tracking-widest ${badge.color}`} data-testid={`badge-result-${entry.id}`}>
                        {badge.label}
                      </span>
                    </div>
                    {entry.pieceTitle && (
                      <p className="font-serif text-sm text-white/55 italic mb-1" data-testid={`text-rejection-piece-${entry.id}`}>&ldquo;{entry.pieceTitle}&rdquo;</p>
                    )}
                    <div className="flex items-center gap-3 text-white/55">
                      <span className="font-mono text-[10px]">{entry.userName}</span>
                      <span className="font-mono text-[9px]">{timeAgo(entry.createdAt)}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => deleteMutation.mutate(entry.id)}
                    className="p-1.5 text-white/20 hover:text-red-400/60 transition-colors flex-shrink-0"
                    data-testid={`button-delete-rejection-${entry.id}`}
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
                {entry.context && (
                  <p className="font-serif text-sm text-white/50 leading-relaxed" data-testid={`text-rejection-context-${entry.id}`}>{entry.context}</p>
                )}
                {entry.silver_lining && (
                  <div className="p-3 bg-amber-500/[0.04] border border-amber-500/10 rounded-lg" data-testid={`text-rejection-silver-${entry.id}`}>
                    <p className="font-mono text-[9px] uppercase tracking-widest text-amber-400/40 mb-1">Silver Lining</p>
                    <p className="font-serif text-sm text-amber-200/50 leading-relaxed">{entry.silver_lining}</p>
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

type Opportunity = {
  id: string;
  userId: string;
  title: string;
  outlet: string | null;
  link: string | null;
  deadline: string | null;
  payRate: string | null;
  responseTime: string | null;
  vibe: string | null;
  genres: string[];
  notes: string | null;
  userName: string;
  noteCount: number;
  createdAt: string;
};

type OpportunityNote = {
  id: string;
  opportunityId: string;
  authorId: string;
  content: string;
  authorName: string;
  createdAt: string;
};

function OpportunityNotes({ opportunityId }: { opportunityId: string }) {
  const [noteContent, setNoteContent] = useState("");
  const queryClient = useQueryClient();

  const { data: notes = [], isLoading } = useQuery<OpportunityNote[]>({
    queryKey: ["/api/opportunities", opportunityId, "notes"],
    queryFn: async () => {
      const res = await fetch(`/api/opportunities/${opportunityId}/notes`, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch notes");
      return res.json();
    },
  });

  const noteMutation = useMutation({
    mutationFn: async (content: string) => {
      const res = await fetch(`/api/opportunities/${opportunityId}/notes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ content }),
      });
      if (!res.ok) throw new Error("Failed to post note");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/opportunities", opportunityId, "notes"] });
      queryClient.invalidateQueries({ queryKey: ["/api/opportunities"] });
      setNoteContent("");
    },
  });

  const handleSubmitNote = () => {
    const trimmed = noteContent.trim();
    if (!trimmed) return;
    noteMutation.mutate(trimmed);
  };

  return (
    <div className="space-y-3" data-testid={`opportunity-notes-${opportunityId}`}>
      {isLoading && <ListSkeleton count={2} />}
      {notes.length === 0 && !isLoading && (
        <p className="font-serif text-sm text-white/50 italic">No notes yet — share your experience.</p>
      )}
      {notes.map((note) => (
        <div key={note.id} className="flex items-start gap-3" data-testid={`note-${note.id}`}>
          <div className="w-6 h-6 rounded-full bg-white/[0.06] border border-white/20 flex items-center justify-center text-white/60 font-mono text-[8px] uppercase flex-shrink-0">
            {note.authorName?.[0] || "?"}
          </div>
          <div className="flex-grow min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <span className="font-mono text-[10px] text-white/60 tracking-wide">{note.authorName}</span>
              <span className="font-mono text-[9px] text-white/50">{timeAgo(note.createdAt)}</span>
            </div>
            <p className="font-serif text-sm text-white/70 leading-relaxed">{note.content}</p>
          </div>
        </div>
      ))}
      <div className="flex gap-2 pt-2 border-t border-white/[0.15]">
        <input
          type="text"
          value={noteContent}
          onChange={(e) => setNoteContent(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSubmitNote(); } }}
          placeholder="Add a note..."
          className="flex-grow bg-white/[0.05] border border-white/[0.20] rounded-lg px-3 py-2 text-sm font-serif text-white/75 placeholder:text-white/45 focus:outline-none focus:border-white/40 transition-colors"
          data-testid={`input-note-${opportunityId}`}
        />
        <button
          onClick={handleSubmitNote}
          disabled={!noteContent.trim() || noteMutation.isPending}
          className="px-4 py-2 bg-white/[0.05] hover:bg-white/[0.09] border border-white/20 hover:border-white/20 rounded-lg font-mono text-[9px] uppercase tracking-widest text-white/70 hover:text-white transition-all disabled:opacity-30 disabled:cursor-not-allowed"
          data-testid={`button-submit-note-${opportunityId}`}
        >
          Add
        </button>
      </div>
    </div>
  );
}

export function OpportunityBoardRoom({ onBack }: { onBack: () => void }) {
  const [showNewForm, setShowNewForm] = useState(false);
  const [expandedOpp, setExpandedOpp] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [oppOutlet, setOppOutlet] = useState("");
  const [link, setLink] = useState("");
  const [deadline, setDeadline] = useState("");
  const [payRate, setPayRate] = useState("");
  const [responseTime, setResponseTime] = useState("");
  const [vibe, setVibe] = useState("");
  const [genres, setGenres] = useState("");
  const [oppNotes, setOppNotes] = useState("");
  const queryClient = useQueryClient();

  const { data: opportunities = [], isLoading } = useQuery<Opportunity[]>({
    queryKey: ["/api/opportunities"],
    queryFn: async () => {
      const res = await fetch("/api/opportunities", { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch opportunities");
      return res.json();
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: Record<string, any>) => {
      const res = await fetch("/api/opportunities", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to create opportunity");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/opportunities"] });
      setShowNewForm(false);
      setTitle("");
      setOppOutlet("");
      setLink("");
      setDeadline("");
      setPayRate("");
      setResponseTime("");
      setVibe("");
      setGenres("");
      setOppNotes("");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/opportunities/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to delete opportunity");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/opportunities"] });
    },
  });

  const handleCreate = () => {
    if (!title.trim()) return;
    createMutation.mutate({
      title: title.trim(),
      outlet: oppOutlet.trim() || undefined,
      link: link.trim() || undefined,
      deadline: deadline.trim() || undefined,
      payRate: payRate.trim() || undefined,
      responseTime: responseTime.trim() || undefined,
      vibe: vibe.trim() || undefined,
      genres: genres.trim() ? genres.split(",").map((g) => g.trim()).filter(Boolean) : [],
      notes: oppNotes.trim() || undefined,
    });
  };

  return (
    <div className="max-w-3xl mx-auto" data-testid="opportunity-board-room">
      <div className="flex items-center justify-between mb-8">
        <BackButton onBack={onBack} />
        <div className="flex items-center gap-3">
          <Globe size={16} className="text-white/55" />
          <h2 className="text-xl font-display font-light italic text-white/80">Opportunity Board</h2>
        </div>
        <motion.button
          onClick={() => setShowNewForm(!showNewForm)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.97 }}
          className="flex items-center gap-2 px-4 py-2 border border-white/20 hover:border-amber-500/30 rounded-full font-mono text-[10px] uppercase tracking-widest text-white/70 hover:text-white bg-white/[0.03] hover:bg-white/[0.06] transition-all"
          data-testid="button-new-opportunity"
        >
          <Plus size={13} />
          Share Lead
        </motion.button>
      </div>

      <p className="font-serif text-sm text-white/50 leading-relaxed mb-6 max-w-xl">
        What we find, we share. Publishing leads from the community.
      </p>

      <AnimatePresence>
        {showNewForm && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden mb-6"
          >
            <div className="border border-white/[0.15] rounded-xl p-5 space-y-4 bg-white/[0.05]" data-testid="new-opportunity-form">
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Opportunity title (required)..."
                className="w-full bg-transparent border-b border-white/[0.20] pb-2 text-lg font-display font-light italic text-white/80 placeholder:text-white/45 focus:outline-none focus:border-white/20 transition-colors"
                data-testid="input-opportunity-title"
              />
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="text"
                  value={oppOutlet}
                  onChange={(e) => setOppOutlet(e.target.value)}
                  placeholder="Outlet / publication..."
                  className="bg-white/[0.05] border border-white/[0.20] rounded-lg px-4 py-2 text-sm font-serif text-white/75 placeholder:text-white/45 focus:outline-none focus:border-white/40 transition-colors"
                  data-testid="input-opportunity-outlet"
                />
                <input
                  type="text"
                  value={link}
                  onChange={(e) => setLink(e.target.value)}
                  placeholder="Link (URL)..."
                  className="bg-white/[0.05] border border-white/[0.20] rounded-lg px-4 py-2 text-sm font-serif text-white/75 placeholder:text-white/45 focus:outline-none focus:border-white/40 transition-colors"
                  data-testid="input-opportunity-link"
                />
                <input
                  type="text"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  placeholder="Deadline..."
                  className="bg-white/[0.05] border border-white/[0.20] rounded-lg px-4 py-2 text-sm font-serif text-white/75 placeholder:text-white/45 focus:outline-none focus:border-white/40 transition-colors"
                  data-testid="input-opportunity-deadline"
                />
                <input
                  type="text"
                  value={payRate}
                  onChange={(e) => setPayRate(e.target.value)}
                  placeholder="Pay rate..."
                  className="bg-white/[0.05] border border-white/[0.20] rounded-lg px-4 py-2 text-sm font-serif text-white/75 placeholder:text-white/45 focus:outline-none focus:border-white/40 transition-colors"
                  data-testid="input-opportunity-pay-rate"
                />
                <input
                  type="text"
                  value={responseTime}
                  onChange={(e) => setResponseTime(e.target.value)}
                  placeholder="Response time..."
                  className="bg-white/[0.05] border border-white/[0.20] rounded-lg px-4 py-2 text-sm font-serif text-white/75 placeholder:text-white/45 focus:outline-none focus:border-white/40 transition-colors"
                  data-testid="input-opportunity-response-time"
                />
                <input
                  type="text"
                  value={vibe}
                  onChange={(e) => setVibe(e.target.value)}
                  placeholder="Vibe — what's the journal like?"
                  className="bg-white/[0.05] border border-white/[0.20] rounded-lg px-4 py-2 text-sm font-serif text-white/75 placeholder:text-white/45 focus:outline-none focus:border-white/40 transition-colors"
                  data-testid="input-opportunity-vibe"
                />
              </div>
              <input
                type="text"
                value={genres}
                onChange={(e) => setGenres(e.target.value)}
                placeholder="Genres (comma-separated: fiction, poetry, nonfiction)..."
                className="w-full bg-white/[0.05] border border-white/[0.20] rounded-lg px-4 py-2 text-sm font-serif text-white/75 placeholder:text-white/45 focus:outline-none focus:border-white/40 transition-colors"
                data-testid="input-opportunity-genres"
              />
              <textarea
                value={oppNotes}
                onChange={(e) => setOppNotes(e.target.value)}
                placeholder="Additional notes..."
                rows={3}
                className="w-full bg-white/[0.05] border border-white/[0.20] rounded-lg px-4 py-3 text-sm font-serif text-white/75 placeholder:text-white/45 focus:outline-none focus:border-white/40 transition-colors resize-none"
                data-testid="input-opportunity-notes"
              />
              <div className="flex items-center justify-end gap-2">
                <button
                  onClick={() => setShowNewForm(false)}
                  className="px-4 py-2 font-mono text-[9px] uppercase tracking-widest text-white/50 hover:text-white/75 transition-colors"
                  data-testid="button-cancel-opportunity"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreate}
                  disabled={!title.trim() || createMutation.isPending}
                  className="px-5 py-2 bg-white/[0.06] hover:bg-white/[0.1] border border-white/20 hover:border-white/20 rounded-full font-mono text-[9px] uppercase tracking-widest text-white/75 hover:text-white transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                  data-testid="button-submit-opportunity"
                >
                  Share
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {isLoading && <ListSkeleton count={4} />}

      {!isLoading && opportunities.length === 0 && (
        <div className="border border-dashed border-white/[0.15] rounded-2xl p-16 text-center space-y-4">
          <Globe size={32} className="mx-auto text-white/30" />
          <h3 className="text-xl font-display font-light italic text-white/60">No opportunities yet</h3>
          <p className="font-serif text-sm text-white/55 max-w-sm mx-auto leading-relaxed">
            Found a journal accepting submissions? A contest worth entering? Share it with the community.
          </p>
          <button
            onClick={() => setShowNewForm(true)}
            className="inline-flex items-center gap-2 mt-2 px-5 py-2.5 border border-white/20 hover:border-amber-500/30 rounded-full font-mono text-[10px] uppercase tracking-widest text-white/60 hover:text-white bg-white/[0.03] hover:bg-white/[0.06] transition-all"
            data-testid="button-first-opportunity"
          >
            <Plus size={13} />
            Share the First Lead
          </button>
        </div>
      )}

      <div className="space-y-3">
        {opportunities.map((opp, i) => {
          const isExpanded = expandedOpp === opp.id;
          return (
            <motion.div
              key={opp.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03, duration: 0.3 }}
              data-testid={`opportunity-card-${opp.id}`}
            >
              <div className={`rounded-xl border overflow-hidden transition-all duration-300 ${
                isExpanded
                  ? "border-white/25 bg-white/[0.025]"
                  : "border-white/[0.15] hover:border-white/[0.15] bg-white/[0.04]"
              }`}>
                <button
                  onClick={() => setExpandedOpp(isExpanded ? null : opp.id)}
                  className="w-full text-left p-4 md:p-5"
                  data-testid={`button-expand-opportunity-${opp.id}`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-grow min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <h3 className="text-base font-display font-light text-white/80 italic truncate" data-testid={`text-opp-title-${opp.id}`}>{opp.title}</h3>
                        {opp.outlet && <span className="font-serif text-xs text-white/45 italic">at {opp.outlet}</span>}
                      </div>
                      <div className="flex items-center gap-3 flex-wrap mb-2">
                        {opp.link && (
                          <a
                            href={opp.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="flex items-center gap-1 font-mono text-[9px] text-blue-400/60 hover:text-blue-400/90 transition-colors"
                            data-testid={`link-opp-${opp.id}`}
                          >
                            <ExternalLink size={10} />
                            Link
                          </a>
                        )}
                        {opp.deadline && (
                          <span className="px-2 py-0.5 rounded-full border border-amber-400/20 bg-amber-400/[0.04] font-mono text-[8px] uppercase tracking-widest text-amber-400/60" data-testid={`badge-deadline-${opp.id}`}>
                            <Clock size={9} className="inline mr-1" />{opp.deadline}
                          </span>
                        )}
                        {opp.payRate && (
                          <span className="font-mono text-[9px] text-emerald-400/50" data-testid={`text-pay-${opp.id}`}>{opp.payRate}</span>
                        )}
                      </div>
                      {opp.vibe && (
                        <p className="font-serif text-sm text-white/40 italic leading-relaxed mb-2" data-testid={`text-vibe-${opp.id}`}>&ldquo;{opp.vibe}&rdquo;</p>
                      )}
                      <div className="flex items-center gap-2 flex-wrap">
                        {opp.genres && opp.genres.map((genre, gi) => (
                          <span key={gi} className="px-2 py-0.5 rounded-full border border-white/[0.12] font-mono text-[8px] uppercase tracking-widest text-white/45" data-testid={`pill-genre-${opp.id}-${gi}`}>
                            {genre}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0">
                      <div className="flex items-center gap-1 text-white/55">
                        <MessageSquare size={11} />
                        <span className="font-mono text-[9px]" data-testid={`text-note-count-${opp.id}`}>{opp.noteCount || 0}</span>
                      </div>
                      <button
                        onClick={(e) => { e.stopPropagation(); deleteMutation.mutate(opp.id); }}
                        className="p-1.5 text-white/20 hover:text-red-400/60 transition-colors"
                        data-testid={`button-delete-opportunity-${opp.id}`}
                      >
                        <Trash2 size={13} />
                      </button>
                      <ChevronDown size={13} className={`text-white/50 transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`} />
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-white/55 mt-2">
                    <span className="font-mono text-[10px]">{opp.userName}</span>
                    <span className="font-mono text-[9px]">{timeAgo(opp.createdAt)}</span>
                  </div>
                </button>

                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25 }}
                      className="overflow-hidden"
                    >
                      <div className="px-4 md:px-5 pb-4 md:pb-5 space-y-4 border-t border-white/[0.15]">
                        {opp.notes && (
                          <p className="font-serif text-sm text-white/50 leading-relaxed pt-4" data-testid={`text-opp-notes-${opp.id}`}>{opp.notes}</p>
                        )}
                        {opp.responseTime && (
                          <p className="font-mono text-[9px] text-white/40 uppercase tracking-widest pt-2">Response time: {opp.responseTime}</p>
                        )}
                        <div className="pt-2">
                          <p className="font-mono text-[9px] uppercase tracking-widest text-white/35 mb-3">Community Notes</p>
                          <OpportunityNotes opportunityId={opp.id} />
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

type IdeaDrop = {
  id: string;
  userId: string;
  content: string;
  status: string;
  userName: string;
  adopterName: string | null;
  createdAt: string;
};

export function IdeaDropsRoom({ onBack }: { onBack: () => void }) {
  const [showNewForm, setShowNewForm] = useState(false);
  const [content, setContent] = useState("");
  const queryClient = useQueryClient();

  const { data: drops = [], isLoading } = useQuery<IdeaDrop[]>({
    queryKey: ["/api/idea-drops"],
    queryFn: async () => {
      const res = await fetch("/api/idea-drops", { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch idea drops");
      return res.json();
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: { content: string }) => {
      const res = await fetch("/api/idea-drops", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to drop idea");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/idea-drops"] });
      setShowNewForm(false);
      setContent("");
    },
  });

  const adoptMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/idea-drops/${id}/adopt`, {
        method: "POST",
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to adopt idea");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/idea-drops"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/idea-drops/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to delete idea");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/idea-drops"] });
    },
  });

  const handleCreate = () => {
    if (!content.trim()) return;
    createMutation.mutate({ content: content.trim() });
  };

  return (
    <div className="max-w-3xl mx-auto" data-testid="idea-drops-room">
      <div className="flex items-center justify-between mb-8">
        <BackButton onBack={onBack} />
        <div className="flex items-center gap-3">
          <Lightbulb size={16} className="text-white/55" />
          <h2 className="text-xl font-display font-light italic text-white/80">Idea Drops</h2>
        </div>
        <motion.button
          onClick={() => setShowNewForm(!showNewForm)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.97 }}
          className="flex items-center gap-2 px-4 py-2 border border-white/20 hover:border-amber-500/30 rounded-full font-mono text-[10px] uppercase tracking-widest text-white/70 hover:text-white bg-white/[0.03] hover:bg-white/[0.06] transition-all"
          data-testid="button-new-idea-drop"
        >
          <Plus size={13} />
          Drop Idea
        </motion.button>
      </div>

      <p className="font-serif text-sm text-white/50 leading-relaxed mb-6 max-w-xl">
        Can&rsquo;t use it? Drop it here. Someone else might need it.
      </p>

      <AnimatePresence>
        {showNewForm && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden mb-6"
          >
            <div className="border border-white/[0.15] rounded-xl p-5 space-y-4 bg-white/[0.05]" data-testid="new-idea-drop-form">
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Drop your idea, fragment, or concept here..."
                rows={5}
                className="w-full bg-white/[0.05] border border-white/[0.20] rounded-lg px-4 py-3 text-sm font-serif text-white/75 placeholder:text-white/45 focus:outline-none focus:border-white/40 transition-colors resize-none"
                data-testid="input-idea-drop-content"
              />
              <div className="flex items-center justify-end gap-2">
                <button
                  onClick={() => setShowNewForm(false)}
                  className="px-4 py-2 font-mono text-[9px] uppercase tracking-widest text-white/50 hover:text-white/75 transition-colors"
                  data-testid="button-cancel-idea-drop"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreate}
                  disabled={!content.trim() || createMutation.isPending}
                  className="px-5 py-2 bg-white/[0.06] hover:bg-white/[0.1] border border-white/20 hover:border-white/20 rounded-full font-mono text-[9px] uppercase tracking-widest text-white/75 hover:text-white transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                  data-testid="button-submit-idea-drop"
                >
                  Drop It
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {isLoading && <ListSkeleton count={4} />}

      {!isLoading && drops.length === 0 && (
        <div className="border border-dashed border-white/[0.15] rounded-2xl p-16 text-center space-y-4">
          <Lightbulb size={32} className="mx-auto text-white/30" />
          <h3 className="text-xl font-display font-light italic text-white/60">No ideas dropped yet</h3>
          <p className="font-serif text-sm text-white/55 max-w-sm mx-auto leading-relaxed">
            Got an idea you can&rsquo;t use? A fragment that doesn&rsquo;t fit? Drop it here — someone else might turn it into something beautiful.
          </p>
          <button
            onClick={() => setShowNewForm(true)}
            className="inline-flex items-center gap-2 mt-2 px-5 py-2.5 border border-white/20 hover:border-amber-500/30 rounded-full font-mono text-[10px] uppercase tracking-widest text-white/60 hover:text-white bg-white/[0.03] hover:bg-white/[0.06] transition-all"
            data-testid="button-first-idea-drop"
          >
            <Plus size={13} />
            Drop the First Idea
          </button>
        </div>
      )}

      <div className="space-y-3">
        {drops.map((drop, i) => (
          <motion.div
            key={drop.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.03, duration: 0.3 }}
            data-testid={`idea-drop-card-${drop.id}`}
          >
            <div className="rounded-xl border border-white/[0.15] hover:border-white/[0.15] bg-white/[0.04] p-4 md:p-5 space-y-3 transition-all duration-300">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-grow min-w-0">
                  <p className="font-serif text-sm text-white/70 leading-relaxed whitespace-pre-wrap mb-3" data-testid={`text-idea-content-${drop.id}`}>{drop.content}</p>
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className={`px-2 py-0.5 rounded-full border font-mono text-[8px] uppercase tracking-widest ${
                      drop.status === "open"
                        ? "text-emerald-400/70 border-emerald-400/20 bg-emerald-400/[0.04]"
                        : "text-amber-400/70 border-amber-400/20 bg-amber-400/[0.04]"
                    }`} data-testid={`badge-status-${drop.id}`}>
                      {drop.status}
                    </span>
                    <span className="font-mono text-[10px] text-white/55">{drop.userName}</span>
                    {drop.adopterName && (
                      <span className="font-mono text-[9px] text-amber-400/50">
                        <Heart size={9} className="inline mr-1" />adopted by {drop.adopterName}
                      </span>
                    )}
                    <span className="font-mono text-[9px] text-white/50">{timeAgo(drop.createdAt)}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  {drop.status === "open" && (
                    <button
                      onClick={() => adoptMutation.mutate(drop.id)}
                      disabled={adoptMutation.isPending}
                      className="flex items-center gap-1.5 px-3 py-1.5 border border-emerald-500/15 hover:border-emerald-500/30 rounded-full font-mono text-[9px] uppercase tracking-widest text-emerald-400/50 hover:text-emerald-400/80 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                      data-testid={`button-adopt-${drop.id}`}
                    >
                      <Heart size={10} />
                      Adopt This
                    </button>
                  )}
                  <button
                    onClick={() => deleteMutation.mutate(drop.id)}
                    className="p-1.5 text-white/20 hover:text-red-400/60 transition-colors"
                    data-testid={`button-delete-idea-${drop.id}`}
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}