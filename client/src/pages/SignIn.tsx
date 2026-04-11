import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import Navigation from "@/components/Navigation";
import { useQueryClient } from "@tanstack/react-query";
import { Link } from "wouter";

const quotes = [
  { text: "You don't submit. You don't query. You just write.", author: "The Page Gallery Journal" },
  { text: "A writer is someone for whom writing is more difficult than it is for other people.", author: "Thomas Mann" },
  { text: "There is no greater agony than bearing an untold story inside you.", author: "Maya Angelou" },
  { text: "We write to taste life twice, in the moment and in retrospect.", author: "Anaïs Nin" },
];

function StudioInput({
  label,
  type = "text",
  value,
  onChange,
  testId,
  placeholder,
  required,
}: {
  label: string;
  type?: string;
  value: string;
  onChange: (v: string) => void;
  testId: string;
  placeholder?: string;
  required?: boolean;
}) {
  return (
    <div className="space-y-1.5">
      <label className="block font-mono text-[10px] tracking-[0.2em] uppercase text-[#1C1208]/50">
        {label}
      </label>
      <input
        data-testid={testId}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        className="w-full bg-[#F8F4EC] border border-[rgba(107,42,42,0.2)] rounded-lg px-4 py-3 text-[#1C1208] placeholder-[#1C1208]/25 font-sans text-sm focus:border-[#6B2A2A]/60 focus:outline-none focus:ring-2 focus:ring-[#6B2A2A]/10 transition-all duration-200"
      />
    </div>
  );
}

function AuthForm() {
  const { login, register, loginError, registerError, isLoggingIn, isRegistering, resetLoginError, resetRegisterError } = useAuth();
  const queryClient = useQueryClient();
  const [mode, setMode] = useState<"signin" | "register" | "forgot">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isForgotPending, setIsForgotPending] = useState(false);
  const [, navigate] = useLocation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    if (mode === "forgot") {
      if (!email) { setError("Please enter your email address"); return; }
      setIsForgotPending(true);
      try {
        const res = await fetch("/api/forgot-password", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ email }),
        });
        const data = await res.json().catch(() => ({}));
        setSuccessMessage(data.message || "If that email is registered, a reset link has been sent.");
      } catch {
        setError("Something went wrong. Please try again.");
      } finally {
        setIsForgotPending(false);
      }
      return;
    }

    if (mode === "signin") resetLoginError();
    else resetRegisterError();

    try {
      if (mode === "signin") {
        await login({ email, password });
      } else {
        await register({ email, password, firstName, lastName });
      }
      await queryClient.refetchQueries({ queryKey: ["/api/auth/user"] });
      navigate("/garden");
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    }
  };

  const isSubmitting = isLoggingIn || isRegistering || isForgotPending;
  const displayError = error || (mode === "signin" ? loginError?.message : mode === "register" ? registerError?.message : null) || null;

  return (
    <motion.form
      onSubmit={handleSubmit}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      className="w-full space-y-5"
    >
      {/* Mode tabs */}
      <div className="flex border-b border-[rgba(107,42,42,0.12)] mb-6">
        {(["signin", "register"] as const).map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => { setMode(m); setError(null); setSuccessMessage(null); }}
            className={`flex-1 pb-3 font-mono text-[10px] uppercase tracking-[0.2em] transition-all duration-200 border-b-2 -mb-[2px] ${
              mode === m
                ? "border-[#6B2A2A] text-[#6B2A2A]"
                : "border-transparent text-[#1C1208]/40 hover:text-[#1C1208]/70"
            }`}
            data-testid={`button-mode-${m}`}
          >
            {m === "signin" ? "Sign In" : "Join"}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={mode}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.25 }}
          className="space-y-4"
        >
          {mode === "forgot" ? (
            <StudioInput label="Email" type="email" value={email} onChange={setEmail} testId="input-forgot-email" placeholder="your@email.com" required />
          ) : (
            <>
              {mode === "register" && (
                <div className="grid grid-cols-2 gap-3">
                  <StudioInput label="First Name" value={firstName} onChange={setFirstName} testId="input-first-name" placeholder="Ada" />
                  <StudioInput label="Last Name" value={lastName} onChange={setLastName} testId="input-last-name" placeholder="Lovelace" />
                </div>
              )}
              <StudioInput label="Email" type="email" value={email} onChange={setEmail} testId="input-email" placeholder="your@email.com" required />
              <StudioInput label="Password" type="password" value={password} onChange={setPassword} testId="input-password" placeholder="••••••••" required />
            </>
          )}
        </motion.div>
      </AnimatePresence>

      <AnimatePresence>
        {displayError && (
          <motion.p
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="text-[#6B2A2A] text-xs font-mono tracking-wide text-center bg-[#6B2A2A]/5 rounded-lg py-2 px-3"
            data-testid="text-auth-error"
          >
            {displayError}
          </motion.p>
        )}
        {successMessage && (
          <motion.p
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="text-[#8A8F6F] text-xs font-mono tracking-wide text-center bg-[#8A8F6F]/8 rounded-lg py-2 px-3"
            data-testid="text-auth-success"
          >
            {successMessage}
          </motion.p>
        )}
      </AnimatePresence>

      <button
        type="submit"
        disabled={isSubmitting || (!email && mode !== "forgot") || (!password && mode !== "forgot")}
        data-testid="button-submit-auth"
        className="w-full py-3.5 rounded-full bg-[#6B2A2A] text-[#F8F4EC] font-mono text-[10px] tracking-[0.25em] uppercase hover:bg-[#5a2222] transition-colors duration-200 disabled:opacity-40 disabled:cursor-not-allowed shadow-sm"
      >
        {isSubmitting
          ? (mode === "signin" ? "Opening the door…" : "Setting up your desk…")
          : (mode === "signin" ? "Enter The Studio" : mode === "register" ? "Claim Your Desk" : "Send Reset Link")}
      </button>

      {mode === "signin" && (
        <div className="text-center">
          <button
            type="button"
            data-testid="button-forgot-password"
            onClick={() => { setMode("forgot"); setError(null); setSuccessMessage(null); }}
            className="font-mono text-[10px] tracking-[0.15em] text-[#1C1208]/30 hover:text-[#6B2A2A] transition-colors uppercase"
          >
            Forgot password?
          </button>
        </div>
      )}

      {mode === "forgot" && (
        <div className="text-center">
          <button
            type="button"
            onClick={() => { setMode("signin"); setError(null); setSuccessMessage(null); }}
            className="font-mono text-[10px] tracking-[0.15em] text-[#1C1208]/30 hover:text-[#6B2A2A] transition-colors uppercase"
          >
            ← Back to sign in
          </button>
        </div>
      )}
    </motion.form>
  );
}

export default function SignIn() {
  const { isAuthenticated, isLoading } = useAuth();
  const [, navigate] = useLocation();
  const [quoteIdx, setQuoteIdx] = useState(0);

  if (!isLoading && isAuthenticated) {
    navigate("/garden");
    return null;
  }

  return (
    <div className="min-h-screen studio-paper">
      <Navigation />

      <div className="min-h-screen flex">
        {/* Left — form */}
        <div className="w-full lg:w-[480px] xl:w-[520px] flex flex-col justify-center px-8 md:px-16 pt-32 pb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="space-y-8"
          >
            {/* Header */}
            <div className="space-y-2">
              <p className="font-mono text-[length:var(--text-label)] uppercase tracking-[0.2em] text-[#6B2A2A]/70">
                The Page Gallery
              </p>
              <h1 className="font-display text-4xl md:text-5xl font-bold italic text-[#1C1208]">
                Welcome back.
              </h1>
              <p className="font-sans text-sm text-[#1C1208]/50 leading-relaxed">
                Your desk is waiting. Pick up where you left off.
              </p>
            </div>

            <div className="studio-section-divider" />

            <AuthForm />

            <p className="font-mono text-[10px] tracking-[0.15em] text-[#1C1208]/25 text-center">
              By continuing you agree to our{" "}
              <Link href="/terms" className="underline underline-offset-2 hover:text-[#6B2A2A] transition-colors">Terms</Link>
              {" "}and{" "}
              <Link href="/privacy" className="underline underline-offset-2 hover:text-[#6B2A2A] transition-colors">Privacy Policy</Link>
            </p>
          </motion.div>
        </div>

        {/* Right — editorial panel (desktop only) */}
        <div className="hidden lg:flex flex-1 bg-[#EDE7D9] border-l border-[rgba(107,42,42,0.1)] flex-col items-center justify-center p-16 relative overflow-hidden">
          {/* Background ink texture hint */}
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='200' height='200' filter='url(%23noise)'/%3E%3C/svg%3E\")",
            }}
            aria-hidden="true"
          />

          <div className="relative z-10 max-w-sm text-center space-y-10">
            <AnimatePresence mode="wait">
              <motion.div
                key={quoteIdx}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.6 }}
              >
                <p className="font-display italic text-xl md:text-2xl text-[#1C1208]/70 leading-relaxed mb-4" data-testid="text-signin-quote">
                  &ldquo;{quotes[quoteIdx].text}&rdquo;
                </p>
                <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#1C1208]/30">
                  — {quotes[quoteIdx].author}
                </p>
              </motion.div>
            </AnimatePresence>

            <div className="studio-section-divider" />

            {/* Handwritten note */}
            <div className="handwritten-note p-6 text-left">
              <p className="font-handwritten text-lg text-[#1C1208]/70 leading-relaxed">
                Every serious writer needs a room of their own.
                This is yours.
              </p>
              <p className="font-handwritten text-sm text-[#6B2A2A] mt-3">— The Editors</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
