import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation, useSearch } from "wouter";
import LoadingScreen from "@/components/garden/LoadingScreen";

const ease = [0.22, 1, 0.36, 1] as const;

export default function EditorOnboarding() {
  const { user, isLoading: authLoading } = useAuth();
  const [, navigate] = useLocation();
  const searchString = useSearch();
  const params = new URLSearchParams(searchString);
  const token = params.get("token") || "";
  const [accepted, setAccepted] = useState(false);
  const [acceptAttempted, setAcceptAttempted] = useState(false);

  const { data: validation, isLoading: validating } = useQuery<{ valid: boolean; reason?: string; email?: string }>({
    queryKey: ["/api/editor-onboarding/validate", token],
    queryFn: async () => {
      const res = await fetch(`/api/editor-onboarding/validate?token=${encodeURIComponent(token)}`);
      if (!res.ok) throw new Error("Failed to validate");
      return res.json();
    },
    enabled: !!token,
  });

  const acceptMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/editor-onboarding/accept", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ token }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Failed to accept");
      }
      return res.json();
    },
    onSuccess: () => {
      setAccepted(true);
    },
  });

  useEffect(() => {
    if (user && validation?.valid && !accepted && !acceptAttempted) {
      setAcceptAttempted(true);
      acceptMutation.mutate();
    }
  }, [user, validation?.valid, accepted, acceptAttempted]);

  if (!token) {
    return (
      <div className="min-h-screen bg-popover flex items-center justify-center">
        <div className="text-center space-y-4 max-w-md px-6">
          <p className="text-foreground/60 font-serif text-lg">No invitation token provided.</p>
          <button onClick={() => navigate("/")} className="px-6 py-3 bg-accent-ornament/20 border border-accent-ornament/30 text-accent-ornament font-display text-lg rounded hover:bg-accent-ornament/30 transition-colors" data-testid="button-go-home">
            Return Home
          </button>
        </div>
      </div>
    );
  }

  // T35: replace raw border-t-accent-ornament animate-spin div with branded LoadingScreen (dark variant)
  if (validating || authLoading) {
    return <LoadingScreen />;
  }

  if (validation && !validation.valid) {
    return (
      <div className="min-h-screen bg-popover flex items-center justify-center">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease }} className="text-center space-y-4 max-w-md px-6">
          <div className="w-16 h-16 mx-auto rounded-full border border-red-400/20 flex items-center justify-center mb-6">
            <span className="text-red-400/60 text-2xl">×</span>
          </div>
          <p className="text-foreground/80 font-display text-2xl">{validation.reason}</p>
          <button onClick={() => navigate("/")} className="px-6 py-3 bg-accent-ornament/20 border border-accent-ornament/30 text-accent-ornament font-display text-lg rounded hover:bg-accent-ornament/30 transition-colors" data-testid="button-go-home">
            Return Home
          </button>
        </motion.div>
      </div>
    );
  }

  if (accepted) {
    return (
      <div className="min-h-screen bg-popover flex items-center justify-center">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease }} className="text-center space-y-6 max-w-lg px-6">
          <div className="w-16 h-16 mx-auto rounded-full border border-[#5eb5a0]/30 flex items-center justify-center mb-4">
            <span className="text-[#5eb5a0] text-2xl">✓</span>
          </div>
          <h1 className="font-display text-3xl text-foreground font-light" data-testid="text-welcome">Welcome to the Editorial Studio</h1>
          <p className="text-foreground/50 font-serif text-sm leading-relaxed">
            Your role has been upgraded. You now have access to the Editorial Studio where you can discover, curate, and publish literary works.
          </p>
          <button onClick={() => navigate("/editor-studio")} className="px-8 py-3 bg-accent-ornament/20 border border-accent-ornament/30 text-accent-ornament font-display text-lg rounded hover:bg-accent-ornament/30 transition-colors" data-testid="button-go-studio">
            Enter the Studio
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-popover">
      <div className="max-w-2xl mx-auto px-6 py-20">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, ease }}>
          <div className="text-center mb-16">
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 1.2, ease }} className="w-20 h-20 mx-auto mb-8 rounded-full border border-accent-ornament/20 flex items-center justify-center">
              <span className="text-accent-ornament/60 text-3xl font-display italic">e</span>
            </motion.div>
            <h1 className="font-display text-4xl md:text-5xl text-foreground font-light tracking-wide mb-4" data-testid="text-onboarding-title">
              You've Been Invited
            </h1>
            <p className="text-foreground/50 font-serif text-sm mb-2">
              to join The Page Gallery Journal as an Editor
            </p>
            <p className="text-foreground/30 font-serif text-xs max-w-sm mx-auto leading-relaxed mt-4">
              We don't accept traditional submissions. Instead, we ask editors to walk through the gardens — to discover what blooms naturally, and to tend what deserves a wider audience.
            </p>
          </div>

          <div className="w-16 h-[1px] bg-accent-ornament/20 mx-auto mb-14" />

          <div className="space-y-12 mb-16">
            <OnboardingSection
              number="01"
              title="The Editorial Studio"
              description="Your private workspace for literary curation. The Studio gives you a panoramic view of the journal's living ecosystem — the Garden Stream of new writing, the Greenhouse where pieces are nurtured toward publication, and the Issue Builder where you shape each edition."
              detail="Think of it as the editor's desk at the heart of a botanical library."
              delay={0.2}
            />
            <OnboardingSection
              number="02"
              title="Walking Through Gardens"
              description="Writers cultivate their work in private Gardens, tending pieces through four organic stages: raw seed, growing, ready to show, and dormant. When they open their Garden gate or raise a quiet flag — 'Ready for eyes' — their work appears in your Stream."
              detail="You'll also get your own Garden. Editors are writers too."
              delay={0.3}
            />
            <OnboardingSection
              number="03"
              title="The Growth Cycle"
              description="A piece moves from seed to sprout to bloom — and sometimes back again. This isn't a pipeline; it's a living process. You might find a poem that's been quietly growing for months, or a flash piece that bloomed overnight."
              delay={0.4}
            />
            <OnboardingSection
              number="04"
              title="Replant Requests"
              description="We don't reject work here. Instead, you send a Replant Request — a thoughtful invitation for the writer to revisit, reshape, or let a piece rest. It's how we honor the creative process while guiding the journal's voice."
              delay={0.5}
            />
            <OnboardingSection
              number="05"
              title="The Gallery"
              description="When a piece is ready, you move it from the Greenhouse to the Gallery — our public exhibition space. Each published work is displayed in a museum-style frame, given the ceremony it deserves. This is the culmination of the editorial journey."
              delay={0.6}
            />
          </div>

          <div className="w-16 h-[1px] bg-accent-ornament/20 mx-auto mb-14" />

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease, delay: 0.7 }} className="text-center">
            {user ? (
              // T35: replace inline animate-spin div with branded LoadingScreen (dark)
              <LoadingScreen />
            ) : (
              <div className="space-y-4">
                <button
                  onClick={() => window.location.href = "/sign-in"}
                  className="inline-block px-12 py-4 bg-accent-ornament/15 border border-accent-ornament/30 text-accent-ornament font-display text-xl rounded hover:bg-accent-ornament/25 transition-all duration-500 hover:border-accent-ornament/50"
                  data-testid="link-sign-in"
                >
                  Accept Invitation & Sign In
                </button>
                <p className="text-foreground/20 font-serif text-xs">
                  Sign in and your editor role will be activated
                </p>
              </div>
            )}
            {acceptMutation.isError && (
              <p className="text-red-400/80 text-sm mt-4 font-serif">
                {acceptMutation.error?.message || "Something went wrong. Please try again."}
              </p>
            )}
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}

function OnboardingSection({ number, title, description, detail, delay }: { number: string; title: string; description: string; detail?: string; delay: number }) {
  return (
    <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8, ease, delay }} className="flex gap-6">
      <span className="text-accent-ornament/30 font-['Space_Mono',monospace] text-xs mt-1 shrink-0">{number}</span>
      <div>
        <h3 className="font-display text-xl text-foreground/90 font-light mb-2">{title}</h3>
        <p className="text-foreground/40 font-serif text-sm leading-relaxed">{description}</p>
        {detail && <p className="text-accent-ornament/40 font-serif text-xs leading-relaxed mt-2 italic">{detail}</p>}
      </div>
    </motion.div>
  );
}
