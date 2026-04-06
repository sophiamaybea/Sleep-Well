import { usePageMeta } from "@/hooks/use-page-meta";
import { useState, useEffect } from "react";
import { Link } from "wouter";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Home, Save, Check, ArrowLeft, Mail, User, FileText, EyeOff, Lock } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import StarBackground from "@/components/StarBackground";

export default function EditProfile() {
  usePageMeta({ title: "Edit Profile", description: "Edit your Garden profile at The Page Gallery Journal." });
  const { user, isLoading, isAuthenticated } = useAuth();
  const queryClient = useQueryClient();
  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (user) {
      setDisplayName((user as any).displayName || [user.firstName, user.lastName].filter(Boolean).join(" ") || "");
      setBio(user.bio || "");
      setIsAnonymous((user as any).isAnonymous || false);
    }
  }, [user]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ displayName, bio, isAnonymous }),
      });
      if (!res.ok) throw new Error("Failed to save");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0b101a] relative flex items-center justify-center">
        <StarBackground />
        <motion.div animate={{ opacity: [0.3, 0.7, 0.3] }} transition={{ duration: 2, repeat: Infinity }} data-testid="loading-indicator">
          <User size={32} className="text-white/50" />
        </motion.div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen bg-[#0b101a] relative flex items-center justify-center">
        <StarBackground />
        <div className="text-center space-y-4 relative z-10">
          <p className="font-serif text-white/60">Please sign in to edit your profile.</p>
          <Link href="/sign-in" className="inline-block px-6 py-3 rounded-full border border-white/20 text-white/70 font-mono text-[10px] uppercase tracking-widest hover:bg-white/5 transition-colors" data-testid="link-sign-in">
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0b101a] relative">
      <StarBackground />
      <div className="relative z-10 max-w-xl mx-auto px-6 py-16 md:py-24">
        <Link
          href={`/writer/${user.id}`}
          className="inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-white/60 hover:text-white/75 transition-colors mb-10 group"
          data-testid="link-back-profile"
        >
          <ArrowLeft size={13} className="group-hover:-translate-x-0.5 transition-transform" />
          Back to Profile
        </Link>

        <header className="mb-10">
          <h1 className="text-3xl font-display font-light italic text-white/90" data-testid="text-page-title">
            Edit Profile
          </h1>
          <p className="font-serif text-sm text-white/70 mt-2">
            Update how you appear to other writers and readers.
          </p>
        </header>

        <div className="space-y-8">
          <div>
            <label className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-white/50 mb-3">
              <Mail size={12} />
              Email
            </label>
            <div
              className="w-full px-4 py-3 rounded-xl border border-white/[0.08] bg-white/[0.03] font-serif text-sm text-white/40 cursor-not-allowed"
              data-testid="text-email-readonly"
            >
              {user.email || "No email on file"}
            </div>
            <p className="font-mono text-[9px] text-white/50 mt-1.5 tracking-wide">
              Email cannot be changed
            </p>
          </div>

          <div>
            <label htmlFor="displayName" className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-white/50 mb-3">
              <User size={12} />
              Display Name
            </label>
            <input
              id="displayName"
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="How you'd like to be known"
              maxLength={100}
              className="w-full px-4 py-3 rounded-xl border border-white/[0.12] bg-white/[0.04] font-serif text-sm text-white/80 placeholder:text-white/25 focus:outline-none focus:border-amber-500/30 focus:bg-white/[0.06] transition-all"
              data-testid="input-display-name"
            />
            <p className="font-mono text-[9px] text-white/50 mt-1.5 tracking-wide">
              This is the name shown on your profile and writings
            </p>
          </div>

          <div>
            <label htmlFor="bio" className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-white/50 mb-3">
              <FileText size={12} />
              Bio
            </label>
            <textarea
              id="bio"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="A few words about yourself and your writing..."
              maxLength={500}
              rows={4}
              className="w-full px-4 py-3 rounded-xl border border-white/[0.12] bg-white/[0.04] font-serif text-sm text-white/80 placeholder:text-white/25 focus:outline-none focus:border-amber-500/30 focus:bg-white/[0.06] transition-all resize-none"
              data-testid="input-bio"
            />
            <p className="font-mono text-[9px] text-white/50 mt-1.5 tracking-wide">
              {bio.length}/500 characters
            </p>
          </div>

          <div className="rounded-xl border border-white/[0.08] bg-white/[0.03] p-5">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3">
                {(user as any).isAnonymous ? (
                  <Lock size={16} className="text-white/30 mt-0.5" />
                ) : (
                  <EyeOff size={16} className="text-white/40 mt-0.5" />
                )}
                <div>
                  <label className="font-mono text-[10px] uppercase tracking-widest text-white/50">
                    Anonymous Mode
                  </label>
                  <p className="font-serif text-xs text-white/60 mt-1 leading-relaxed max-w-sm">
                    {(user as any).isAnonymous
                      ? "Your profile is permanently anonymous. Your name will not be shown to other users."
                      : "Hide your identity from other users. Your name will be replaced with \"Anonymous\" across the platform."
                    }
                  </p>
                  {!(user as any).isAnonymous && (
                    <p className="font-mono text-[9px] text-amber-400/50 mt-2 tracking-wide">
                      This cannot be undone once enabled.
                    </p>
                  )}
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  if (!(user as any).isAnonymous) setIsAnonymous(!isAnonymous);
                }}
                disabled={(user as any).isAnonymous}
                className={`relative w-11 h-6 rounded-full transition-colors flex-shrink-0 ${
                  (user as any).isAnonymous
                    ? "bg-white/10 cursor-not-allowed opacity-50"
                    : isAnonymous
                      ? "bg-amber-500/40"
                      : "bg-white/10 hover:bg-white/15"
                }`}
                data-testid="toggle-anonymous"
              >
                <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full transition-transform ${
                  isAnonymous || (user as any).isAnonymous
                    ? "translate-x-5 bg-amber-300"
                    : "translate-x-0 bg-white/50"
                }`} />
              </button>
            </div>
          </div>

          <div className="flex items-center gap-4 pt-2">
            <motion.button
              onClick={() => saveMutation.mutate()}
              disabled={saveMutation.isPending}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex items-center gap-2 px-8 py-3 rounded-full border border-amber-500/25 bg-amber-500/10 text-amber-200/80 hover:bg-amber-500/20 hover:border-amber-500/35 font-mono text-[10px] uppercase tracking-widest transition-all disabled:opacity-50"
              data-testid="button-save-profile"
            >
              {saveMutation.isPending ? (
                <>Saving...</>
              ) : saved ? (
                <>
                  <Check size={14} />
                  Saved
                </>
              ) : (
                <>
                  <Save size={14} />
                  Save Changes
                </>
              )}
            </motion.button>

            <AnimatePresence>
              {saved && (
                <motion.span
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0 }}
                  className="font-serif text-sm text-emerald-400/70 italic"
                  data-testid="text-save-success"
                >
                  Profile updated successfully
                </motion.span>
              )}
            </AnimatePresence>
          </div>

          {saveMutation.isError && (
            <p className="font-serif text-sm text-red-400/70 italic" data-testid="text-save-error">
              Something went wrong. Please try again.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
