import { useState, useRef, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Send, X, Crown, ChevronDown } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface SendToEditorsProps {
  writingId: string;
  writingTitle: string;
  onClose?: () => void;
}

const TIERS = [
  {
    id: "priority",
    label: "Priority",
    desc: "Goes to the top of the pile",
    price: 5,
    priceLabel: "$5",
  },
  {
    id: "feedback",
    label: "Feedback",
    desc: "Receive written editorial feedback",
    price: 7,
    priceLabel: "$7",
  },
  {
    id: "bundle",
    label: "Bundle",
    desc: "Top of the pile + written feedback",
    price: 10,
    priceLabel: "$10",
  },
];

export default function SendToEditors({ writingId, writingTitle, onClose }: SendToEditorsProps) {
  const [open, setOpen] = useState(false);
  const [selectedTier, setSelectedTier] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  async function handleCheckout() {
    if (!selectedTier) return;
    const tier = TIERS.find((t) => t.id === selectedTier);
    if (!tier) return;
    setProcessing(true);
    try {
      const res = await fetch("/api/paypal/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          writingId,
          tier: selectedTier,
          amount: tier.price,
          description: `${tier.label} — ${writingTitle || "Untitled"}`,
        }),
      });
      if (!res.ok) throw new Error(await res.text());
      const { approvalUrl } = await res.json();
      if (approvalUrl) {
        window.location.href = approvalUrl;
      } else {
        throw new Error("No approval URL returned");
      }
    } catch (err: any) {
      toast({
        title: "Checkout failed",
        description: err.message || "Could not initiate PayPal checkout.",
        variant: "destructive",
      });
      setProcessing(false);
    }
  }

  if (success) {
    return (
      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full font-mono text-[8px] uppercase tracking-widest border border-emerald-500/30 bg-emerald-500/10 text-emerald-300/80">
        <Send size={10} />
        Sent to editors
      </div>
    );
  }

  return (
    <div className="relative" ref={containerRef}>
      <button
        onClick={(e) => { e.stopPropagation(); setOpen(!open); }}
        className="flex items-center gap-1.5 px-2.5 py-1 rounded-full font-mono text-[8px] uppercase tracking-widest transition-all border border-white/[0.06] text-white/50 hover:text-amber-300/70 hover:border-amber-500/25"
        data-testid={`button-send-editors-${writingId}`}
      >
        <Send size={10} />
        Send to our editors
        <ChevronDown size={8} className={`transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -4, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.97 }}
            transition={{ duration: 0.15 }}
            className="absolute left-0 bottom-full mb-2 z-50 min-w-[260px] rounded-2xl border border-amber-500/15 bg-[#0a0f1a]/98 backdrop-blur-xl p-4 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
            data-testid={`send-editors-menu-${writingId}`}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="font-mono text-[9px] uppercase tracking-[0.25em] text-amber-400/60">
                Send to our editors
              </span>
              <button onClick={() => setOpen(false)} className="text-white/30 hover:text-white/60 transition-colors">
                <X size={12} />
              </button>
            </div>
            <p className="font-serif text-[11px] text-white/40 italic mb-3 leading-relaxed">
              Choose how your piece reaches the editorial team.
            </p>
            <div className="space-y-2">
              {TIERS.map((tier) => (
                <button
                  key={tier.id}
                  onClick={() => setSelectedTier(selectedTier === tier.id ? null : tier.id)}
                  className={`w-full text-left px-3 py-2.5 rounded-xl border transition-all ${
                    selectedTier === tier.id
                      ? "border-amber-500/40 bg-amber-500/[0.08] text-white/85"
                      : "border-white/[0.06] text-white/60 hover:border-amber-500/20 hover:bg-amber-500/[0.04]"
                  }`}
                  data-testid={`tier-${tier.id}-${writingId}`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Crown size={11} className={selectedTier === tier.id ? "text-amber-400/80" : "text-white/30"} />
                      <span className="font-mono text-[9px] uppercase tracking-wider">{tier.label}</span>
                    </div>
                    <span className={`font-mono text-[10px] font-medium ${
                      selectedTier === tier.id ? "text-amber-300/90" : "text-white/40"
                    }`}>{tier.priceLabel}</span>
                  </div>
                  <p className="font-serif text-[10px] text-white/35 italic mt-1 ml-[19px]">{tier.desc}</p>
                </button>
              ))}
            </div>
            <button
              onClick={handleCheckout}
              disabled={!selectedTier || processing}
              className="mt-3 w-full px-4 py-2.5 rounded-xl font-mono text-[9px] uppercase tracking-widest transition-all bg-amber-500/15 border border-amber-500/25 text-amber-300/80 hover:bg-amber-500/25 hover:text-amber-200 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              data-testid={`btn-checkout-editors-${writingId}`}
            >
              {processing ? (
                <span className="animate-pulse">Connecting to PayPal...</span>
              ) : (
                <>
                  <Send size={11} />
                  Checkout with PayPal
                </>
              )}
            </button>
            <p className="font-mono text-[7px] text-white/20 text-center mt-2 tracking-widest uppercase">
              Secure checkout via PayPal
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
