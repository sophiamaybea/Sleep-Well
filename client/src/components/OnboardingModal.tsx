import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/hooks/use-auth";
import { useQueryClient } from "@tanstack/react-query";
import { Sprout, Pen, BookOpen, Glasses, ChevronRight } from "lucide-react";

const WALKTHROUGH_STEPS = [
  {
    icon: Pen,
    title: "Write",
    description: "This is your private desk. Start a seed, grow it at your own pace.",
    color: "text-amber-400",
    bg: "bg-amber-400/10 border-amber-400/20",
  },
  {
    icon: Sprout,
    title: "Share",
    description: "When you're ready, move work to the Garden for others to read.",
    color: "text-emerald-400",
    bg: "bg-emerald-400/10 border-emerald-400/20",
  },
  {
    icon: Glasses,
    title: "Discover",
    description: "Read what others have shared. Leave quiet gestures.",
    color: "text-teal-400",
    bg: "bg-teal-400/10 border-teal-400/20",
  },
];

export default function OnboardingModal() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [step, setStep] = useState(0); // 0-2 = walkthrough, 3 = form
  const [displayName, setDisplayName] = useState((user as any)?.displayName || "");
  const [bio, setBio] = useState((user as any)?.bio || "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dontShowAgain, setDontShowAgain] = useState(false);

  const shouldShow = user && !(user as any).hasCompletedOnboarding;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!displayName.trim()) {
      setError("Please choose a username");
      return;
    }
    setError(null);
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/user/onboarding", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ displayName: displayName.trim(), bio: bio.trim() }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({ message: "Something went wrong" }));
        throw new Error(data.message);
      }
      const updatedUser = await res.json();
      queryClient.setQueryData(["/api/auth/user"], updatedUser);
      setIsSubmitting(false);
    } catch (err: any) {
      setError(err.message || "Failed to save");
      setIsSubmitting(false);
    }
  };

  const skipToForm = () => setStep(3);

  return (
    <AnimatePresence>
      {shouldShow && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
          style={{ backgroundColor: "rgba(0,0,0,0.85)" }}
          data-testid="modal-onboarding"
        >
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.95 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="w-full max-w-md rounded-2xl border border-white/10 overflow-hidden"
            style={{ backgroundColor: "var(--color-popover)" }}
          >
            <AnimatePresence mode="wait">
              {step < 3 ? (
                <motion.div
                  key={`step-${step}`}
                  initial={{ opacity: 0, x: 40 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -40 }}
                  transition={{ duration: 0.3 }}
                  className="p-8 space-y-6"
                >
                  <div className="text-center space-y-4">
                    <div className="flex justify-center">
                      {(() => {
                        const Icon = WALKTHROUGH_STEPS[step].icon;
                        return (
                          <div className={`w-16 h-16 rounded-full border flex items-center justify-center ${WALKTHROUGH_STEPS[step].bg}`}>
                            <Icon className={`w-8 h-8 ${WALKTHROUGH_STEPS[step].color}`} />
                          </div>
                        );
                      })()}
                    </div>
                    <h2 className="font-display text-2xl italic text-white/95">
                      {WALKTHROUGH_STEPS[step].title}
                    </h2>
                    <p className="font-serif text-base text-white/60 leading-relaxed">
                      {WALKTHROUGH_STEPS[step].description}
                    </p>
                  </div>

                  {/* Step indicators */}
                  <div className="flex justify-center gap-2">
                    {WALKTHROUGH_STEPS.map((_, i) => (
                      <div
                        key={i}
                        className={`w-2 h-2 rounded-full transition-all ${i === step ? "bg-accent-ornament w-6" : "bg-white/20"}`}
                      />
                    ))}
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={skipToForm}
                      className="flex-1 px-4 py-3 rounded-full border border-white/10 text-white/50 font-mono text-xs tracking-widest uppercase hover:bg-white/5 transition-all"
                    >
                      Skip to writing
                    </button>
                    <button
                      onClick={() => setStep(step + 1)}
                      className="flex-1 px-4 py-3 rounded-full border border-accent-ornament/30 bg-accent-ornament/10 text-accent-ornament font-mono text-xs tracking-widest uppercase hover:bg-accent-ornament/20 transition-all flex items-center justify-center gap-1"
                    >
                      {step < 2 ? "Next" : "Get Started"}
                      <ChevronRight className="w-3 h-3" />
                    </button>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="form"
                  initial={{ opacity: 0, x: 40 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -40 }}
                  transition={{ duration: 0.3 }}
                  className="p-8 space-y-6"
                >
                  <div className="text-center space-y-3">
                    <div className="flex justify-center">
                      <div className="w-12 h-12 rounded-full bg-accent-ornament/10 border border-accent-ornament/20 flex items-center justify-center">
                        <Sprout className="w-6 h-6 text-accent-ornament" />
                      </div>
                    </div>
                    <h2 className="font-display text-2xl italic text-white/95">
                      Welcome to the Garden
                    </h2>
                    <p className="font-serif text-base text-white/60 leading-relaxed">
                      Before you begin, let's set up your writer identity.
                    </p>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="space-y-2">
                      <label className="block font-mono text-xs tracking-widest uppercase text-white/50">
                        Username <span className="text-accent-ornament">*</span>
                      </label>
                      <input
                        data-testid="input-onboarding-username"
                        type="text"
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        placeholder="Your pen name or display name"
                        maxLength={100}
                        className="w-full bg-white/[0.04] border border-white/10 rounded-lg px-4 py-3 text-white/90 placeholder-white/25 font-serif text-base focus:border-accent-ornament/50 focus:outline-none focus:ring-1 focus:ring-accent-ornament/20 transition-all"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="block font-mono text-xs tracking-widest uppercase text-white/50">
                        Bio
                      </label>
                      <div className="relative">
                        <Pen className="absolute left-3 top-3 w-4 h-4 text-white/20" />
                        <textarea
                          data-testid="input-onboarding-bio"
                          value={bio}
                          onChange={(e) => setBio(e.target.value)}
                          placeholder="A few words about yourself (optional)"
                          maxLength={500}
                          rows={3}
                          className="w-full bg-white/[0.04] border border-white/10 rounded-lg pl-10 pr-4 py-3 text-white/90 placeholder-white/25 font-serif text-base focus:border-accent-ornament/50 focus:outline-none focus:ring-1 focus:ring-accent-ornament/20 transition-all resize-none"
                        />
                      </div>
                      <p className="font-mono text-[10px] text-white/25 text-right">
                        {bio.length}/500
                      </p>
                    </div>

                    {error && (
                      <p className="text-red-400/80 text-sm font-mono text-center" data-testid="text-onboarding-error">
                        {error}
                      </p>
                    )}

                    <button
                      type="submit"
                      disabled={isSubmitting || !displayName.trim()}
                      data-testid="button-onboarding-submit"
                      className="w-full px-6 py-3.5 rounded-full border border-accent-ornament/30 bg-accent-ornament/10 text-accent-ornament font-mono text-sm tracking-widest uppercase hover:bg-accent-ornament/20 hover:border-accent-ornament/50 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      {isSubmitting ? "Planting..." : "Begin Writing"}
                    </button>
                  </form>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
