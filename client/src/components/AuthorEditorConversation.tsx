import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageSquare, X, Send, Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

interface Conversation {
  id: number;
  writingId: number;
  authorId: number;
  editorId: number;
  subject: string | null;
  status: string;
  createdAt: string;
  updatedAt: string;
}

interface ConversationMessage {
  id: number;
  conversationId: number;
  senderId: number;
  body: string;
  isRead: boolean;
  createdAt: string;
  senderName?: string;
}

interface Props {
  writingId: number;
  writingTitle?: string;
  /** Pass editorId when consumed from the editor side; omit on author side */
  peerId?: number;
  peerName?: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function AuthorEditorConversation({
  writingId,
  writingTitle,
  peerId,
  peerName,
  isOpen,
  onClose,
}: Props) {
  const { user } = useAuth();
  const qc = useQueryClient();
  const bottomRef = useRef<HTMLDivElement>(null);
  const [draft, setDraft] = useState("");
  const [activeConvId, setActiveConvId] = useState<number | null>(null);

  // ── 1. fetch or create the conversation for this writing ──────────────
  const { data: conversation, isLoading: convLoading } = useQuery<Conversation>({
    queryKey: ["/api/author-editor-conversations/writing", writingId],
    queryFn: async () => {
      const res = await apiRequest(
        "GET",
        `/api/author-editor-conversations/writing/${writingId}`
      );
      return res.json();
    },
    enabled: !!user && isOpen,
  });

  useEffect(() => {
    if (conversation) setActiveConvId(conversation.id);
  }, [conversation]);

  // ── 2. fetch messages ──────────────────────────────────────────────────
  const { data: messages = [], isLoading: msgsLoading } = useQuery<ConversationMessage[]>({
    queryKey: ["/api/author-editor-conversations", activeConvId, "messages"],
    queryFn: async () => {
      const res = await apiRequest(
        "GET",
        `/api/author-editor-conversations/${activeConvId}/messages`
      );
      return res.json();
    },
    enabled: !!activeConvId && isOpen,
    refetchInterval: isOpen ? 8000 : false,
  });

  // scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // ── 3. start conversation mutation ────────────────────────────────────
  const startConv = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/author-editor-conversations", {
        writingId,
        editorId: peerId,
        subject: writingTitle ? `Re: ${writingTitle}` : undefined,
      });
      return res.json() as Promise<Conversation>;
    },
    onSuccess: (data) => {
      setActiveConvId(data.id);
      qc.setQueryData(
        ["/api/author-editor-conversations/writing", writingId],
        data
      );
    },
  });

  // ── 4. send message mutation ──────────────────────────────────────────
  const sendMsg = useMutation({
    mutationFn: async (body: string) => {
      const convId = activeConvId!;
      const res = await apiRequest(
        "POST",
        `/api/author-editor-conversations/${convId}/messages`,
        { body }
      );
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({
        queryKey: ["/api/author-editor-conversations", activeConvId, "messages"],
      });
      setDraft("");
    },
  });

  const handleSend = () => {
    const trimmed = draft.trim();
    if (!trimmed) return;
    if (!activeConvId) {
      startConv.mutate(undefined, {
        onSuccess: () => sendMsg.mutate(trimmed),
      });
    } else {
      sendMsg.mutate(trimmed);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const loading = convLoading || msgsLoading;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[70] bg-black/50 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* drawer */}
          <motion.aside
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 280, damping: 28 }}
            className="fixed top-0 right-0 z-[80] w-full max-w-sm h-screen bg-[#080d15]/97 backdrop-blur-xl border-l border-white/[0.07] flex flex-col"
            data-testid="author-editor-conversation-drawer"
          >
            {/* header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.06]">
              <div className="flex items-center gap-2.5">
                <MessageSquare size={16} className="text-white/40" />
                <div>
                  <p className="text-[13px] font-serif text-white/80">
                    {peerName ? `Conversation with ${peerName}` : "Editorial Channel"}
                  </p>
                  {writingTitle && (
                    <p className="text-[10px] font-mono text-white/25 tracking-widest uppercase truncate max-w-[180px]">
                      {writingTitle}
                    </p>
                  )}
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg text-white/30 hover:text-white/70 hover:bg-white/[0.05] transition-all"
                aria-label="Close conversation"
              >
                <X size={16} />
              </button>
            </div>

            {/* messages area */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
              {loading && (
                <div className="flex justify-center pt-8">
                  <Loader2 size={18} className="text-white/20 animate-spin" />
                </div>
              )}

              {!loading && messages.length === 0 && (
                <div className="text-center pt-12">
                  <p className="text-[12px] font-serif text-white/20 italic">
                    No messages yet. Begin the conversation.
                  </p>
                </div>
              )}

              {messages.map((msg) => {
                const isMine = msg.senderId === user?.id;
                return (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex ${
                      isMine ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-[80%] px-3.5 py-2.5 rounded-2xl text-[13px] font-serif leading-relaxed ${
                        isMine
                          ? "bg-white/[0.10] text-white/85 rounded-br-sm"
                          : "bg-white/[0.05] text-white/70 rounded-bl-sm"
                      }`}
                    >
                      {!isMine && msg.senderName && (
                        <p className="text-[10px] font-mono text-white/30 tracking-widest uppercase mb-1">
                          {msg.senderName}
                        </p>
                      )}
                      <p className="whitespace-pre-wrap">{msg.body}</p>
                      <p className="text-[10px] text-white/20 mt-1 text-right">
                        {new Date(msg.createdAt).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </motion.div>
                );
              })}
              <div ref={bottomRef} />
            </div>

            {/* input */}
            <div className="px-4 pb-4 pt-2 border-t border-white/[0.06]">
              <div className="flex items-end gap-2">
                <textarea
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Write a message…"
                  rows={2}
                  className="flex-1 bg-white/[0.04] border border-white/[0.09] rounded-xl px-3.5 py-2.5 text-[13px] font-serif text-white/80 placeholder:text-white/20 resize-none focus:outline-none focus:border-white/20 transition-colors"
                  data-testid="conversation-input"
                />
                <button
                  onClick={handleSend}
                  disabled={!draft.trim() || sendMsg.isPending || startConv.isPending}
                  className="p-2.5 rounded-xl bg-white/[0.07] border border-white/[0.09] text-white/50 hover:text-white/80 hover:bg-white/[0.12] disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                  aria-label="Send message"
                  data-testid="conversation-send"
                >
                  {sendMsg.isPending ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <Send size={16} />
                  )}
                </button>
              </div>
              <p className="text-[10px] font-mono text-white/15 mt-1.5 text-right">
                Enter to send · Shift+Enter for newline
              </p>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
