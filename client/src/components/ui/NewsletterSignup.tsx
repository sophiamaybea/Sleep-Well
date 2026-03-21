import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Props {
  variant?: "homepage" | "inline";
  heading?: string;
  subheading?: string;
}

export default function NewsletterSignup({
  variant = "homepage",
  heading = "Letters from the Garden",
  subheading = "A new piece and a writing prompt, every two weeks.",
}: Props) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setStatus("loading");
    try {
      const res = await fetch("/api/newsletter/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });
      if (res.ok) {
        setStatus("success");
        setEmail("");
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  }

  if (variant === "inline") {
    return (
      <div className="border-t border-white/8 pt-8 mt-8">
        <p className="font-mono text-[10px] tracking-[0.3em] text-amber-200/50 uppercase mb-3">
          {heading}
        </p>
        <p className="font-serif text-[13px] text-white/40 mb-4">{subheading}</p>
        <AnimatePresence mode="wait">
          {status === "success" ? (
            <motion.p
              key="success"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="font-mono text-[11px] text-amber-300/70 tracking-wide"
            >
              You're in. Watch for the first letter.
            </motion.p>
          ) : (
            <motion.form
              key="form"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              onSubmit={handleSubmit}
              className="flex gap-2 max-w-sm"
            >
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
                className="flex-1 bg-transparent border border-white/15 rounded-sm px-3 py-2 font-mono text-[11px] text-white/70 placeholder:text-white/20 focus:outline-none focus:border-amber-600/40"
              />
              <button
                type="submit"
                disabled={status === "loading"}
                className="font-mono text-[10px] tracking-[0.2em] uppercase text-amber-200/60 hover:text-amber-200 border border-amber-600/20 hover:border-amber-600/50 px-4 py-2 transition-colors disabled:opacity-40"
              >
                {status === "loading" ? "..." : "Join"}
              </button>
            </motion.form>
          )}
        </AnimatePresence>
        {status === "error" && (
          <p className="font-mono text-[10px] text-red-400/60 mt-2">Something went wrong. Try again.</p>
        )}
      </div>
    );
  }

  // Homepage variant
  return (
    <section className="relative py-24 px-6">
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: "radial-gradient(ellipse at 50% 80%, rgba(196,162,77,0.03) 0%, transparent 60%)" }}
      />
      <div className="max-w-xl mx-auto text-center space-y-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          viewport={{ once: true }}
          className="space-y-3"
        >
          <span className="font-mono text-[10px] tracking-[0.4em] text-amber-200/50 block uppercase">
            Subscribe
          </span>
          <h3 className="font-display text-3xl md:text-4xl font-light text-white">{heading}</h3>
          <p className="font-serif text-[14px] text-white/50 leading-relaxed">{subheading}</p>
        </motion.div>

        <AnimatePresence mode="wait">
          {status === "success" ? (
            <motion.p
              key="success"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="font-mono text-[12px] text-amber-300/80 tracking-wide py-4"
            >
              You're in. Watch for the first letter.
            </motion.p>
          ) : (
            <motion.form
              key="form"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              onSubmit={handleSubmit}
              className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto pt-2"
            >
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
                className="flex-1 bg-transparent border border-white/15 rounded-sm px-4 py-3 font-mono text-[12px] text-white/70 placeholder:text-white/25 focus:outline-none focus:border-amber-600/40"
              />
              <button
                type="submit"
                disabled={status === "loading"}
                className="font-mono text-[10px] tracking-[0.3em] uppercase text-amber-200/70 hover:text-amber-200 border border-amber-600/20 hover:border-amber-600/50 px-6 py-3 transition-colors rounded-sm disabled:opacity-40"
              >
                {status === "loading" ? "Sending..." : "Subscribe"}
              </button>
            </motion.form>
          )}
        </AnimatePresence>
        {status === "error" && (
          <p className="font-mono text-[10px] text-red-400/60">Something went wrong. Try again.</p>
        )}
      </div>
    </section>
  );
}
