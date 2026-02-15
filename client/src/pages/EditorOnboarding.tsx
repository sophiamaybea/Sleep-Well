import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation, useSearch } from "wouter";

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
      <div className="min-h-screen bg-[#0d1e2d] flex items-center justify-center">
        <div className="text-center space-y-4 max-w-md px-6">
          <p className="text-[#f0eeea]/60 font-['Lora',serif] text-lg">No invitation token provided.</p>
          <button onClick={() => navigate("/")} className="px-6 py-3 bg-[#c4a24d]/20 border border-[#c4a24d]/30 text-[#c4a24d] font-['Cormorant_Garamond',serif] text-lg rounded hover:bg-[#c4a24d]/30 transition-colors" data-testid="button-go-home">
            Return Home
          </button>
        </div>
      </div>
    );
  }

  if (validating || authLoading) {
    return (
      <div className="min-h-screen bg-[#0d1e2d] flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-[#c4a24d]/40 border-t-[#c4a24d] rounded-full animate-spin" />
      </div>
    );
  }

  if (validation && !validation.valid) {
    return (
      <div className="min-h-screen bg-[#0d1e2d] flex items-center justify-center">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease }} className="text-center space-y-4 max-w-md px-6">
          <div className="w-16 h-16 mx-auto rounded-full border border-red-400/20 flex items-center justify-center mb-6">
            <span className="text-red-400/60 text-2xl">×</span>
          </div>
          <p className="text-[#f0eeea]/80 font-['Cormorant_Garamond',serif] text-2xl">{validation.reason}</p>
          <button onClick={() => navigate("/")} className="px-6 py-3 bg-[#c4a24d]/20 border border-[#c4a24d]/30 text-[#c4a24d] font-['Cormorant_Garamond',serif] text-lg rounded hover:bg-[#c4a24d]/30 transition-colors" data-testid="button-go-home">
            Return Home
          </button>
        </motion.div>
      </div>
    );
  }

  if (accepted) {
    return (
      <div className="min-h-screen bg-[#0d1e2d] flex items-center justify-center">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease }} className="text-center space-y-6 max-w-lg px-6">
          <div className="w-16 h-16 mx-auto rounded-full border border-[#5eb5a0]/30 flex items-center justify-center mb-4">
            <span className="text-[#5eb5a0] text-2xl">✓</span>
          </div>
          <h1 className="font-['Cormorant_Garamond',serif] text-3xl text-[#f0eeea] font-light" data-testid="text-welcome">Welcome to the Editorial Studio</h1>
          <p className="text-[#f0eeea]/50 font-['Lora',serif] text-sm leading-relaxed">
            Your role has been upgraded. You now have access to the Editorial Studio where you can discover, curate, and publish literary works.
          </p>
          <button onClick={() => navigate("/editor-studio")} className="px-8 py-3 bg-[#c4a24d]/20 border border-[#c4a24d]/30 text-[#c4a24d] font-['Cormorant_Garamond',serif] text-lg rounded hover:bg-[#c4a24d]/30 transition-colors" data-testid="button-go-studio">
            Enter the Studio
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0d1e2d]">
      <div className="max-w-2xl mx-auto px-6 py-20">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, ease }}>
          <div className="text-center mb-16">
            <h1 className="font-['Cormorant_Garamond',serif] text-4xl md:text-5xl text-[#f0eeea] font-light tracking-wide mb-4" data-testid="text-onboarding-title">
              You've Been Invited
            </h1>
            <p className="text-[#f0eeea]/50 font-['Lora',serif] text-sm">
              to join The Page Gallery Journal as an Editor
            </p>
          </div>

          <div className="space-y-10 mb-16">
            <OnboardingSection
              number="01"
              title="The Editorial Studio"
              description="Your private workspace for discovering literary works. Browse writers' Gardens, curate pieces for the Greenhouse, and shape issues of the journal."
              delay={0.2}
            />
            <OnboardingSection
              number="02"
              title="Browsing Gardens"
              description="Writers cultivate their work in private Gardens, moving pieces through stages — from raw seed to bloom. When a writer opens their Garden or flags a piece 'Ready for eyes,' it becomes visible to you in the Garden Stream."
              delay={0.3}
            />
            <OnboardingSection
              number="03"
              title="The Replant Request"
              description="Instead of traditional acceptance or rejection, you can send a Replant Request — a gentle invitation for the writer to revisit and reshape their work. This preserves the organic spirit of the journal."
              delay={0.4}
            />
            <OnboardingSection
              number="04"
              title="Publishing"
              description="When a piece is ready, you can move it from the Greenhouse to the Gallery — the public exhibition space where selected works are displayed in museum-style frames for the world to read."
              delay={0.5}
            />
          </div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease, delay: 0.6 }} className="text-center">
            {user ? (
              <div className="space-y-4">
                <p className="text-[#f0eeea]/40 font-['Lora',serif] text-sm">Accepting your invitation...</p>
                <div className="w-6 h-6 mx-auto border-2 border-[#c4a24d]/40 border-t-[#c4a24d] rounded-full animate-spin" />
              </div>
            ) : (
              <a
                href="/api/login"
                className="inline-block px-10 py-4 bg-[#c4a24d]/20 border border-[#c4a24d]/30 text-[#c4a24d] font-['Cormorant_Garamond',serif] text-xl rounded hover:bg-[#c4a24d]/30 transition-colors"
                data-testid="link-sign-in"
              >
                Sign in to Begin
              </a>
            )}
            {acceptMutation.isError && (
              <p className="text-red-400/80 text-sm mt-4 font-['Lora',serif]">
                {acceptMutation.error?.message || "Something went wrong. Please try again."}
              </p>
            )}
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}

function OnboardingSection({ number, title, description, delay }: { number: string; title: string; description: string; delay: number }) {
  return (
    <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8, ease, delay }} className="flex gap-6">
      <span className="text-[#c4a24d]/30 font-['Space_Mono',monospace] text-xs mt-1 shrink-0">{number}</span>
      <div>
        <h3 className="font-['Cormorant_Garamond',serif] text-xl text-[#f0eeea]/90 font-light mb-2">{title}</h3>
        <p className="text-[#f0eeea]/40 font-['Lora',serif] text-sm leading-relaxed">{description}</p>
      </div>
    </motion.div>
  );
}
