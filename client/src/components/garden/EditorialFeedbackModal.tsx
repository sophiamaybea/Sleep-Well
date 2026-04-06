import { useState } from "react";
import { Sparkles, X, ExternalLink } from "lucide-react";

interface Props {
  writingId: string | number | null;
  writingTitle?: string;
  onClose: () => void;
}

/**
 * EditorialFeedbackModal
 * Opens from the EditorialFeedbackBanner CTA or ExportMenu item.
 * Calls POST /api/editorial-orders/feedback-order to create a Stripe
 * Checkout session and redirects the user to pay £5 / 500p.
 */
export function EditorialFeedbackModal({ writingId, writingTitle, onClose }: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleCheckout() {
    if (!writingId) {
      setError("Please save your writing first.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/editorial-orders/feedback-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ writingId: String(writingId), writingTitle }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Something went wrong. Please try again.");
        return;
      }
      if (data.url) {
        // Stripe Checkout redirect
        window.location.href = data.url;
      } else if (data.mode === "confirm") {
        // Stripe not yet configured — show fallback
        setError(data.message || "Payment not yet available. Please check back soon.");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.75)" }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="relative w-full max-w-sm rounded-2xl border border-amber-500/20 bg-card p-6 shadow-2xl">
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 text-white/30 hover:text-white/60 transition-colors"
        >
          <X size={15} />
        </button>

        {/* Icon + title */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center flex-shrink-0">
            <Sparkles size={16} className="text-amber-400/80" />
          </div>
          <div>
            <p className="font-mono text-[9px] uppercase tracking-[0.25em] text-amber-400/60">Editorial Feedback</p>
            <p className="font-serif text-sm text-white/80 leading-snug">Personal editor read — 5-day turnaround</p>
          </div>
        </div>

        {/* Price */}
        <div className="mb-5 rounded-xl border border-white/[0.08] bg-white/[0.03] p-4">
          <p className="font-serif text-2xl text-white/90 mb-0.5">
            £5
            <span className="ml-2 font-mono text-[10px] uppercase tracking-widest text-white/40">one-time</span>
          </p>
          <p className="font-mono text-[10px] text-white/40 leading-relaxed">
            A real editor reads your piece and returns written notes.
            Secure payment via Stripe.
          </p>
        </div>

        {writingTitle && (
          <p className="mb-4 font-mono text-[9px] text-white/40 truncate">
            Piece: <span className="text-white/60">{writingTitle}</span>
          </p>
        )}

        {error && (
          <p className="mb-3 text-xs text-red-400/80 font-mono">{error}</p>
        )}

        <button
          onClick={handleCheckout}
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-full font-mono text-[10px] uppercase tracking-widest bg-amber-500/15 border border-amber-500/30 text-amber-300/90 hover:bg-amber-500/25 hover:text-amber-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          data-testid="btn-confirm-editorial-checkout"
        >
          {loading ? "Creating checkout\u2026" : (
            <>
              <ExternalLink size={11} />
              Pay £5 — Secure checkout
            </>
          )}
        </button>
      </div>
    </div>
  );
}
