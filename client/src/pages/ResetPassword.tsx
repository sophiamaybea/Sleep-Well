import { useState, useEffect, useRef } from "react";
import { useLocation, useSearch } from "wouter";
import Navigation from "@/components/Navigation";

/**
 * ResetPassword — consumed via the link emailed by /api/forgot-password.
 * URL: /reset-password?token=<hex>
 */
export default function ResetPassword() {
  const [, navigate] = useLocation();
  const searchString = useSearch();
  const token = new URLSearchParams(searchString).get("token");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const redirectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (redirectTimerRef.current !== null) {
        clearTimeout(redirectTimerRef.current);
      }
    };
  }, []);

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#060a10" }}>
        <Navigation />
        <p className="font-serif text-white/50 italic text-center px-6">
          Invalid or missing reset token. Please request a new password reset link.
        </p>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match");
      return;
    }

    setIsPending(true);
    try {
      const res = await fetch("/api/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.message || "Something went wrong. Please request a new reset link.");
        return;
      }
      setSuccess(true);
      redirectTimerRef.current = setTimeout(() => navigate("/sign-in"), 3000);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsPending(false);
    }
  };

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center px-6" style={{ background: "#060a10" }}>
      <Navigation />

      <div className="w-full max-w-sm mx-auto space-y-8 text-center">
        <div className="space-y-2">
          <h1 className="font-display text-4xl font-light italic text-white/90">New password</h1>
          <p className="font-mono text-[10px] tracking-[0.15em] text-white/30 uppercase">
            Choose a password for your account
          </p>
        </div>

        {success ? (
          <div className="space-y-4">
            <p className="font-serif text-emerald-400/80 text-sm italic">
              Password updated. Redirecting you to sign in…
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2 text-left">
              <label className="block font-mono text-[10px] tracking-[0.2em] uppercase text-white/40">
                New password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                minLength={8}
                required
                className="w-full bg-white/[0.04] border border-white/10 rounded-lg px-4 py-3 text-white/90 placeholder-white/20 font-serif text-sm focus:border-[#c4a24d]/50 focus:outline-none focus:ring-1 focus:ring-[#c4a24d]/20 transition-all"
              />
            </div>
            <div className="space-y-2 text-left">
              <label className="block font-mono text-[10px] tracking-[0.2em] uppercase text-white/40">
                Confirm password
              </label>
              <input
                type="password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                placeholder="••••••••"
                minLength={8}
                required
                className="w-full bg-white/[0.04] border border-white/10 rounded-lg px-4 py-3 text-white/90 placeholder-white/20 font-serif text-sm focus:border-[#c4a24d]/50 focus:outline-none focus:ring-1 focus:ring-[#c4a24d]/20 transition-all"
              />
            </div>

            {error && (
              <p className="text-red-400/80 text-xs font-mono tracking-wide text-center">{error}</p>
            )}

            <button
              type="submit"
              disabled={isPending || !password || !confirm}
              className="w-full px-8 py-3.5 rounded-full border border-white/15 hover:border-[#c4a24d]/40 bg-white/[0.03] hover:bg-white/[0.06] backdrop-blur-sm transition-all duration-500 disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <span className="font-mono text-xs tracking-[0.3em] uppercase text-white/70 hover:text-[#c4a24d] transition-colors">
                {isPending ? "Updating…" : "Set new password"}
              </span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
