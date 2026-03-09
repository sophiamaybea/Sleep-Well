import { useState, useEffect, useRef } from "react";
import { usePageMeta } from "@/hooks/usePageMeta";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import StarBackground from "@/components/StarBackground";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { Send, Mail, User, MessageSquare, ArrowLeft } from "lucide-react";

const SUBJECT_OPTIONS = [
  "General Inquiry",
  "Submission Question",
  "Feedback",
  "Collaboration Proposal",
] as const;

type ChatMsg = {
  id: string;
  conversationId: string;
  senderName: string;
  senderEmail: string;
  senderRole: string;
  message: string;
  createdAt: string;
};

type Conv = {
  id: string;
  userName: string;
  userEmail: string;
  subject: string;
  status: string;
  createdAt: string;
};

function ChatView({ conversation, userName, userEmail }: { conversation: Conv; userName: string; userEmail: string }) {
  const { toast } = useToast();
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [newMsg, setNewMsg] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const fetchMessages = async () => {
    try {
      const res = await fetch(`/api/conversations/${conversation.id}/messages`);
      if (res.ok) {
        const data = await res.json();
        setMessages(data);
      }
    } catch {}
  };

  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, 5000);
    return () => clearInterval(interval);
  }, [conversation.id]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  const handleSend = async () => {
    if (!newMsg.trim()) return;
    setSending(true);
    try {
      const res = await fetch(`/api/conversations/${conversation.id}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ senderName: userName, senderEmail: userEmail, senderRole: "user", message: newMsg }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || "Failed to send");
      }
      setNewMsg("");
      await fetchMessages();
    } catch (err: any) {
      toast({ title: err.message || "Failed to send message", variant: "destructive" });
    } finally {
      setSending(false);
    }
  };

  const isClosed = conversation.status === "closed";

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 pb-3 border-b border-white/[0.06]">
        <MessageSquare size={16} className="text-amber-400/50" />
        <div>
          <h3 className="font-display text-lg italic text-white/70">{conversation.subject}</h3>
          <p className="font-mono text-[9px] uppercase tracking-widest text-white/30">
            {isClosed ? "Conversation closed" : "Live conversation"}
          </p>
        </div>
      </div>

      <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 scrollbar-thin" data-testid="chat-messages">
        {messages.map((msg) => {
          const isEditor = msg.senderRole === "editor";
          return (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${isEditor ? "justify-start" : "justify-end"}`}
            >
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                  isEditor
                    ? "bg-emerald-900/20 border border-emerald-500/10 rounded-bl-md"
                    : "bg-white/[0.06] border border-white/[0.08] rounded-br-md"
                }`}
                data-testid={`chat-message-${msg.id}`}
              >
                <div className="flex items-center gap-2 mb-1.5">
                  <span className={`font-mono text-[9px] uppercase tracking-widest ${isEditor ? "text-emerald-400/60" : "text-amber-400/50"}`}>
                    {msg.senderName}
                  </span>
                  {isEditor && (
                    <span className="font-mono text-[7px] uppercase tracking-widest text-emerald-400/30 bg-emerald-500/10 px-1.5 py-0.5 rounded-full">
                      Editor
                    </span>
                  )}
                  <span className="font-mono text-[8px] text-white/20 ml-auto">
                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>
                <p className="font-serif text-[13px] text-white/70 leading-relaxed whitespace-pre-wrap">{msg.message}</p>
              </div>
            </motion.div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {!isClosed ? (
        <div className="flex gap-3 pt-2 border-t border-white/[0.06]">
          <input
            type="text"
            value={newMsg}
            onChange={(e) => setNewMsg(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
            placeholder="Write a message..."
            className="flex-1 bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-3 font-serif text-sm text-white/90 placeholder:text-white/25 focus:outline-none focus:border-amber-500/30 focus:ring-1 focus:ring-amber-500/20 transition-all"
            data-testid="chat-input"
          />
          <button
            onClick={handleSend}
            disabled={!newMsg.trim() || sending}
            className="px-4 py-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-200/80 hover:bg-amber-500/15 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            data-testid="chat-send"
          >
            <Send size={16} />
          </button>
        </div>
      ) : (
        <div className="text-center py-4 border-t border-white/[0.06]">
          <p className="font-serif text-sm text-white/30 italic">This conversation has been closed by the editors.</p>
        </div>
      )}
    </div>
  );
}

export default function ContactEditors() {
  usePageMeta({
    title: "Contact the Editors",
    description: "Send a message or ask a question to the editors of The Page Gallery Journal.",
    canonicalPath: "/contact-editors",
  });

  const { toast } = useToast();
  const [submitting, setSubmitting] = useState(false);
  const [activeConversation, setActiveConversation] = useState<Conv | null>(null);
  const [chatUserName, setChatUserName] = useState("");
  const [chatUserEmail, setChatUserEmail] = useState("");
  const [form, setForm] = useState({
    name: "",
    email: "",
    subject: SUBJECT_OPTIONS[0] as string,
    message: "",
  });

  const update = (field: string, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim() || !form.message.trim()) {
      toast({ title: "Please fill in all fields", variant: "destructive" });
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/conversations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userName: form.name, userEmail: form.email, subject: form.subject, message: form.message }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || "Failed to start conversation");
      }
      const conv = await res.json();
      setChatUserName(form.name);
      setChatUserEmail(form.email);
      setActiveConversation(conv);
      toast({
        title: "Conversation started",
        description: "The editors will see your message and reply here.",
      });
    } catch (err: any) {
      toast({ title: err.message || "Something went wrong", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass =
    "w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-3 font-serif text-sm text-white/90 placeholder:text-white/25 focus:outline-none focus:border-amber-500/30 focus:ring-1 focus:ring-amber-500/20 transition-all";

  return (
    <div className="min-h-screen bg-transparent text-foreground selection:bg-secondary selection:text-background relative">
      <StarBackground />
      <Navigation />

      <main id="main-content" className="relative z-10">
        <section className="py-24 md:py-32 px-6 md:px-12" data-testid="section-contact-editors">
          <div className="max-w-2xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
              className="space-y-10"
            >
              <div className="space-y-4">
                <h1
                  className="text-4xl md:text-5xl font-display font-light tracking-normal italic"
                  data-testid="contact-title"
                >
                  Ask the Editors / Send a Message
                </h1>
                <p className="font-serif text-white/50 text-base leading-relaxed max-w-lg">
                  Whether you have a question about submissions, want to share feedback, or are
                  curious about collaborating — we are listening.
                </p>
              </div>

              <AnimatePresence mode="wait">
                {activeConversation ? (
                  <motion.div
                    key="chat"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-6"
                  >
                    <button
                      onClick={() => { setActiveConversation(null); setForm({ name: "", email: "", subject: SUBJECT_OPTIONS[0], message: "" }); }}
                      className="flex items-center gap-2 font-mono text-[9px] uppercase tracking-widest text-white/40 hover:text-white/60 transition-colors mb-4"
                      data-testid="button-new-conversation"
                    >
                      <ArrowLeft size={12} />
                      Start a new conversation
                    </button>
                    <ChatView conversation={activeConversation} userName={chatUserName} userEmail={chatUserEmail} />
                  </motion.div>
                ) : (
                  <motion.form
                    key="form"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.8, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
                    onSubmit={handleSubmit}
                    className="space-y-6"
                    data-testid="contact-form"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div className="space-y-2">
                        <label className="flex items-center gap-2 font-mono text-[10px] tracking-[0.2em] uppercase text-white/40">
                          <User size={12} />
                          Name
                        </label>
                        <input
                          type="text"
                          value={form.name}
                          onChange={(e) => update("name", e.target.value)}
                          placeholder="Your name"
                          className={inputClass}
                          data-testid="input-name"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="flex items-center gap-2 font-mono text-[10px] tracking-[0.2em] uppercase text-white/40">
                          <Mail size={12} />
                          Email
                        </label>
                        <input
                          type="email"
                          value={form.email}
                          onChange={(e) => update("email", e.target.value)}
                          placeholder="you@example.com"
                          className={inputClass}
                          data-testid="input-email"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="flex items-center gap-2 font-mono text-[10px] tracking-[0.2em] uppercase text-white/40">
                        Subject
                      </label>
                      <select
                        value={form.subject}
                        onChange={(e) => update("subject", e.target.value)}
                        className={`${inputClass} appearance-none cursor-pointer`}
                        data-testid="select-subject"
                      >
                        {SUBJECT_OPTIONS.map((opt) => (
                          <option key={opt} value={opt} className="bg-[#0d1e2d] text-white">
                            {opt}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label className="flex items-center gap-2 font-mono text-[10px] tracking-[0.2em] uppercase text-white/40">
                        <MessageSquare size={12} />
                        Message
                      </label>
                      <textarea
                        value={form.message}
                        onChange={(e) => update("message", e.target.value)}
                        placeholder="What would you like to say?"
                        rows={6}
                        className={`${inputClass} resize-none`}
                        data-testid="input-message"
                      />
                    </div>

                    <div className="pt-2">
                      <button
                        type="submit"
                        disabled={submitting}
                        className="group flex items-center gap-2.5 px-6 py-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-200/80 font-mono text-xs tracking-widest uppercase hover:bg-amber-500/15 hover:border-amber-500/30 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                        data-testid="button-submit"
                      >
                        <Send size={14} className="group-hover:translate-x-0.5 transition-transform" />
                        {submitting ? "Starting..." : "Start Conversation"}
                      </button>
                    </div>
                  </motion.form>
                )}
              </AnimatePresence>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1, delay: 0.6 }}
                className="pt-6 border-t border-white/[0.06]"
              >
                <p className="font-serif text-white/30 text-sm italic leading-relaxed">
                  We read every message. Response times vary, but we aim to reply within a few days.
                  For submission-related questions, you may also find answers in our{" "}
                  <a href="/field-guide" className="text-amber-400/50 hover:text-amber-400/70 underline underline-offset-4 decoration-amber-400/20 transition-colors">
                    Field Guide
                  </a>.
                </p>
              </motion.div>
            </motion.div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
