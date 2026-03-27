import { useState } from "react";
import { Sparkles, X } from "lucide-react";

/**
 * EditorialFeedbackBanner
 * Shown at the top of the WriteEditor (Garden writing space).
 * Persistent (dismissible per session via localStorage).
 * Advertises editorial feedback at £5 / 500p.
 */
export function EditorialFeedbackBanner({ onRequestFeedback }: { onRequestFeedback?: () => void }) {
  const [dismissed, setDismissed] = useState(() => {
    try {
      return localStorage.getItem("editorial_banner_dismissed") === "true";
    } catch {
      return false;
    }
  });

  function dismiss() {
    try { localStorage.setItem("editorial_banner_dismissed", "true"); } catch {}
    setDismissed(true);
  }

  if (dismissed) return null;

  return (
    <div
      className="relative mb-6 rounded-2xl border border-amber-500/25 bg-gradient-to-r from-amber-950/30 via-amber-900/20 to-emerald-950/20 p-4 flex items-start gap-3"
      data-testid="editorial-feedback-banner"
    >
      <div className="flex-shrink-0 w-8 h-8 rounded-xl bg-amber-500/15 border border-amber-500/25 flex items-center justify-center">
        <Sparkles size={15} className="text-amber-400/80" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-mono text-[9px] uppercase tracking-[0.25em] text-amber-400/60 mb-0.5">
          Editorial Feedback — £5
        </p>
        <p className="font-serif text-sm text-white/70 leading-relaxed">
          Get a personal editorial read on this piece.
          A real editor will read your work and leave notes within 5 days —{" "}
          <span className="text-amber-300/80 font-medium">£5 per piece.</span>
        </p>
        <button
          onClick={onRequestFeedback}
          className="mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full font-mono text-[9px] uppercase tracking-widest border border-amber-500/30 bg-amber-500/10 text-amber-300/80 hover:bg-amber-500/20 hover:text-amber-200 transition-all"
          data-testid="btn-request-editorial-feedback"
        >
          <Sparkles size={10} />
          Request feedback — £5
        </button>
      </div>
      <button
        onClick={dismiss}
        className="flex-shrink-0 p-1 text-white/30 hover:text-white/60 transition-colors"
        data-testid="btn-dismiss-editorial-banner"
        title="Dismiss"
      >
        <X size={13} />
      </button>
    </div>
  );
}
