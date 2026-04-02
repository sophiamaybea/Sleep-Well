import { motion, useMotionValue, useTransform, useSpring, AnimatePresence } from "framer-motion";
import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import Navigation from "@/components/Navigation";
import { useQueryClient } from "@tanstack/react-query";

// FIX(Finding 4): Remove localhost and 0.0.0.0 from isReplit so local dev
// uses the EmailAuthForm (the actual auth flow) instead of Replit OAuth.
const isReplit = typeof window !== "undefined" && (
  window.location.hostname.includes("replit") ||
  window.location.hostname.includes(".repl.")
);

const quotes = [
  { text: "You don't submit. You don't query. You just write.", author: "The Page Gallery Journal" },
  { text: "A writer is someone for whom writing is more difficult than it is for other people.", author: "Thomas Mann" },
  { text: "There is no greater agony than bearing an untold story inside you.", author: "Maya Angelou" },
  { text: "Start writing, no matter what. The water does not flow until the faucet is turned on.", author: "Louis L'Amour" },
  { text: "We write to taste life twice, in the moment and in retrospect.", author: "Anaïs Nin" },
  { text: "If there's a book that you want to read, but it hasn't been written yet, then you must write it.", author: "Toni Morrison" },
  { text: "Poetry is when an emotion has found its thought and the thought has found words.", author: "Robert Frost" },
];

function FloatingWord({ word, index }: { word: string; index: number }) {
  const duration = 15 + Math.random() * 20;
  const startX = Math.random() * 100;
  const startY = 100 + Math.random() * 20;
  const endY = -20 - Math.random() * 20;
  const drift = (Math.random() - 0.5) * 30;

  return (
    <motion.span
      className="absolute font-display italic text-white/[0.04] select-none pointer-events-none"
      style={{
        left: `${startX}%`,
        fontSize: `${14 + Math.random() * 24}px`,
      }}
      initial={{ y: `${startY}vh`, x: 0, opacity: 0 }}
      animate={{
        y: `${endY}vh`,
        x: drift,
        opacity: [0, 0.06, 0.06, 0],
      }}
      transition={{
        duration,
        delay: index * 1.5 + Math.random() * 3,
        repeat: Infinity,
        ease: "linear",
      }}
    >
      {word}
    </motion.span>
  );
}

const floatingWords = [
  "bloom", "seed", "garden", "poem", "ink", "page", "verse",
  "story", "voice", "roots", "light", "silence", "breath",
  "echo", "drift", "tender", "moonlit", "whisper", "fragment",
];

function InkDrop({ delay }: { delay: number }) {
  const x = Math.random() * 100;
  const size = 3 + Math.random() * 8;

  return (
    <motion.div
      className="absolute rounded-full"
      style={{
        left: `${x}%`,
        width: size,
        height: size,
        background: "radial-gradient(circle, rgba(196,162,77,0.3) 0%, transparent 70%)",
      }}
      initial={{ y: "-10%", opacity: 0, scale: 0 }}
      animate={{
        y: "110vh",
        opacity: [0, 0.6, 0.6, 0],
        scale: [0, 1, 1, 0.5],
      }}
      transition={{
        duration: 8 + Math.random() * 6,
        delay,
        repeat: Infinity,
        ease: "linear",
      }}
    />
  );
}

function AuthInput({ label, type = "text", value, onChange, testId, placeholder }: {
  label: string; type?: string; value: string; onChange: (v: string) => void; testId: string; placeholder?: string;
}) {
  return (
    <div className="space-y-2">
      <label className="block font-mono text-[10px] tracking-[0.2em] uppercase text-white/40">{label}</label>
      <input
        data-testid={testId}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-white/[0.04] border border-white/10 rounded-lg px-4 py-3 text-white/90 placeholder-white/20 font-serif text-sm focus:border-[#c4a24d]/50 focus:outline-none focus:ring-1 focus:ring-[#c4a24d]/20 transition-all duration-300 backdrop-blur-sm"
      />
    </div>
  );
}

function EmailAuthForm() {
  const { login, register, loginError, registerError, isLoggingIn, isRegistering, resetLoginError, resetRegisterError } = useAuth();
  const queryClient = useQueryClient();
  const [mode, setMode] = useState<"signin" | "register">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [, navigate] = useLocation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    // FIX(Finding 6): Clear stale errors from the mutation state
    if (mode === "signin") resetLoginError();
    else resetRegisterError();

    try {
      if (mode === "signin") {
        await login({ email, password });
      } else {
        await register({ email, password, firstName, lastName });
      }
      
      // FIX(Finding 1): Wait for refetch to ensure ProtectedRoute doesn't redirect.
      await queryClient.refetchQueries({ queryKey: ["/api/auth/user"] });
      navigate("/garden");
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    }
  };

  const isSubmitting = isLoggingIn || isRegistering;
  const displayError = error || (mode === "signin" ? loginError?.message : registerError?.message) || null;

  return (
    <motion.form
      onSubmit={handleSubmit}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 1.2, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      className="w-full max-w-sm mx-auto space-y-5"
    >
      <div className="flex justify-center mb-2">
        <div className="inline-flex rounded-full border border-white/10 p-0.5 bg-white/[0.02]">
          <button
            type="button"
            data-testid="button-mode-signin"
            onClick={() => { setMode("signin"); setError(null); }}
            className={`px-5 py-1.5 rounded-full font-mono text-[10px] tracking-[0.2em] uppercase transition-all duration-300 ${
              mode === "signin" ? "bg-[#c4a24d]/20 text-[#c4a24d] border border-[#c4a24d]/30" : "text-white/40 hover:text-white/60 border border-transparent"
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            data-testid="button-mode-register"
            onClick={() => { setMode("register"); setError(null); }}
            className={`px-5 py-1.5 rounded-full font-mono text-[10px] tracking-[0.2em] uppercase transition-all duration-300 ${
              mode === "register" ? "bg-[#c4a24d]/20 text-[#c4a24d] border border-[#c4a24d]/30" : "text-white/40 hover:text-white/60 border border-transparent"
            }`}
          >
            Register
          </button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={mode}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.3 }}
          className="space-y-4"
        >
          {mode === "register" && (
            <div className="grid grid-cols-2 gap-3">
              <AuthInput label="First Name" value={firstName} onChange={setFirstName} testId="input-first-name" placeholder="Ada" />
              <AuthInput label="Last Name" value={lastName} onChange={setLastName} testId="input-last-name" placeholder="Lovelace" />
            </div>
          )}
          <AuthInput label="Email" type="email" value={email} onChange={setEmail} testId="input-email" placeholder="writer@garden.ink" />
          <AuthInput label="Password" type="password" value={password} onChange={setPassword} testId="input-password" placeholder="••••••••" />
        </motion.div>
      </AnimatePresence>

      <AnimatePresence>
        {displayError && (
          <motion.p
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="text-red-400/80 text-xs font-mono tracking-wide text-center"
            data-testid="text-auth-error"
          >
            {displayError}
          </motion.p>
        )}
      </AnimatePresence>

      <button
        type="submit"
        disabled={isSubmitting || !email || !password}
        data-testid="button-submit-auth"
        className="w-full relative group px-8 py-3.5 rounded-full border border-white/15 hover:border-[#c4a24d]/40 bg-white/[0.03] hover:bg-white/[0.06] backdrop-blur-sm transition-all duration-500 disabled:opacity-30 disabled:cursor-not-allowed"
      >
        <span className="font-mono text-xs tracking-[0.3em] uppercase text-white/70 group-hover:text-[#c4a24d] transition-colors duration-500">
          {isSubmitting ? (mode === "signin" ? "Entering..." : "Planting seeds...") : (mode === "signin" ? "Enter the Garden" : "Plant Your First Seed")}
        </span>
      </button>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.6, duration: 0.8 }}
        className="font-mono text-[10px] tracking-[0.15em] text-white/20 text-center"
      >
        {mode === "signin" ? "Your private writing space awaits" : "Every garden begins with a single seed"}
      </motion.p>
    </motion.form>
  );
}

function ReplitAuthButton() {
  const [isHovering, setIsHovering] = useState(false);
  const buttonScale = useSpring(isHovering ? 1.05 : 1, { stiffness: 300, damping: 20 });
  const buttonGlow = useSpring(isHovering ? 1 : 0, { stiffness: 200, damping: 25 });
  const glowOpacity = useTransform(buttonGlow, [0, 1], [0, 0.4]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 1.2, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      className="space-y-6 flex flex-col items-center"
    >
      <motion.a
        href="/api/login"
        style={{ scale: buttonScale }}
        onHoverStart={() => setIsHovering(true)}
        onHoverEnd={() => setIsHovering(false)}
        className="relative inline-flex items-center justify-center group"
        data-testid="button-signin-replit"
      >
        <motion.div
          className="absolute inset-0 rounded-full"
          style={{
            opacity: glowOpacity,
            background: "radial-gradient(circle, rgba(196,162,77,0.4) 0%, transparent 70%)",
            filter: "blur(20px)",
            transform: "scale(1.5)",
          }}
        />
        <div className="relative px-12 py-4 rounded-full border border-white/15 hover:border-[#c4a24d]/40 bg-white/[0.03] hover:bg-white/[0.06] backdrop-blur-sm transition-all duration-500">
          <span className="font-mono text-xs tracking-[0.3em] uppercase text-white/70 group-hover:text-[#c4a24d] transition-colors duration-500">
            Sign in with Replit
          </span>
        </div>
        <motion.div
          className="absolute -right-1 top-1/2 -translate-y-1/2"
          animate={{ x: isHovering ? 4 : 0, opacity: isHovering ? 1 : 0 }}
          transition={{ duration: 0.3 }}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="text-[#c4a24d]">
            <path d="M6 3L11 8L6 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </motion.div>
      </motion.a>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.6, duration: 0.8 }}
        className="font-mono text-[10px] tracking-[0.15em] text-white/20"
      >
        Your private writing space awaits
      </motion.p>
    </motion.div>
  );
}

export default function SignIn() {
  const { isAuthenticated, isLoading } = useAuth();
  const [, navigate] = useLocation();
  const [quoteIndex, setQuoteIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // FIX(Finding 3): Guard redirect to prevent flash of sign-in page.
  if (!isLoading && isAuthenticated) {
    navigate("/garden");
    return null;
  }

  useEffect(() => {
    const interval = setInterval(() => {
      setQuoteIndex((prev) => (prev + 1) % quotes.length);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  function handleMouseMove(e: React.MouseEvent) {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    mouseX.set((e.clientX - rect.left) / rect.width - 0.5);
    mouseY.set((e.clientY - rect.top) / rect.height - 0.5);
  }

  const bgX = useTransform(mouseX, [-0.5, 0.5], ["-1%", "1%"]);
  const bgY = useTransform(mouseY, [-0.5, 0.5], ["-1%", "1%"]);
  const glowX = useSpring(useTransform(mouseX, [-0.5, 0.5], [30, 70]), { stiffness: 80, damping: 30 });
  const glowY = useSpring(useTransform(mouseY, [-0.5, 0.5], [30, 70]), { stiffness: 80, damping: 30 });

  const currentQuote = quotes[quoteIndex];

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      className="relative min-h-screen overflow-hidden flex flex-col"
      style={{ background: "#060a10" }}
    >
      <Navigation />
      
      <motion.div
        className="absolute inset-0 pointer-events-none"
        style={{
          x: bgX,
          y: bgY,
          background: "radial-gradient(ellipse 80% 60% at 50% 40%, rgba(13,30,45,0.8) 0%, rgba(6,10,16,0) 70%)",
        }}
      />

      <motion.div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: useTransform(
            [glowX, glowY],
            ([x, y]) => `radial-gradient(circle 400px at ${x}% ${y}%, rgba(196,162,77,0.03) 0%, transparent 100%)`
          ),
        }}
      />

      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {floatingWords.map((word, i) => (
          <FloatingWord key={`${word}-${i}`} word={word} index={i} />
        ))}
      </div>

      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {Array.from({ length: 12 }).map((_, i) => (
          <InkDrop key={i} delay={i * 1.2} />
        ))}
      </div>

      <div className="flex-1 flex items-center justify-center px-6 relative z-10">
        <div className="max-w-lg w-full text-center space-y-12">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
            className="space-y-6"
          >
            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ delay: 0.3, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              className="w-16 h-[1px] bg-gradient-to-r from-transparent via-[#c4a24d]/50 to-transparent mx-auto"
            />
            
            <h1 className="font-display text-5xl md:text-6xl lg:text-7xl font-light italic tracking-normal text-white/90 leading-[1.05]">
              <motion.span
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.8 }}
                className="block"
              >
                Enter the
              </motion.span>
              <motion.span
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.8 }}
                className="block text-white"
              >
                Garden
              </motion.span>
            </h1>

            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ delay: 0.8, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              className="w-16 h-[1px] bg-gradient-to-r from-transparent via-[#c4a24d]/50 to-transparent mx-auto"
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.0, duration: 1 }}
            className="h-24 flex items-center justify-center"
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={quoteIndex}
                initial={{ opacity: 0, y: 10, filter: "blur(4px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                exit={{ opacity: 0, y: -10, filter: "blur(4px)" }}
                transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                className="text-center px-4"
              >
                <p className="font-serif text-base md:text-lg text-white/50 italic leading-relaxed" data-testid="text-signin-quote">
                  "{currentQuote.text}"
                </p>
                <p className="font-mono text-[10px] tracking-[0.2em] text-white/25 mt-3 uppercase">
                  — {currentQuote.author}
                </p>
              </motion.div>
            </AnimatePresence>
          </motion.div>

          {isReplit ? <ReplitAuthButton /> : <EmailAuthForm />}

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2, duration: 1 }}
            className="pt-8 space-y-4"
          >
            <div className="flex items-center justify-center gap-6">
              {["Plant seeds", "Tend your garden", "Watch them bloom"].map((step, i) => (
                <motion.div
                  key={step}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 2.2 + i * 0.15, duration: 0.6 }}
                  className="flex items-center gap-2"
                >
                  <span className="w-1 h-1 rounded-full bg-[#c4a24d]/40" />
                  <span className="font-mono text-[10px] tracking-wide text-white/25">
                    {step}
                  </span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      <motion.div
        className="absolute bottom-0 left-0 right-0 h-32 pointer-events-none"
        style={{
          background: "linear-gradient(to top, rgba(6,10,16,0.8) 0%, transparent 100%)",
        }}
      />
    </div>
  );
}
