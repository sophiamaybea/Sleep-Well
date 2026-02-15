import { useState, useEffect, useCallback } from "react";
import { useParams, useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest, getQueryFn } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";

const EASE = [0.22, 1, 0.36, 1] as const;
const FADE = { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 }, transition: { duration: 0.6, ease: EASE as unknown as [number, number, number, number] } };

function getMirrorResponse(text: string): string {
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  if (words < 10) return "You gave me a whisper. Good. Sometimes the truest things fit in a palm.";
  if (words <= 30) return "That\u2019s honest. I can feel you reaching for something just out of frame.";
  return "You gave me everything at once. There\u2019s a door in there somewhere \u2014 we\u2019ll find it.";
}

function ExhibitInput({ label, placeholder, value, onChange, maxRows }: { label?: string; placeholder?: string; value: string; onChange: (v: string) => void; maxRows?: number }) {
  return (
    <div className="mb-6">
      {label && <label className="block text-sm tracking-[0.2em] uppercase mb-3" style={{ color: "#8a8278" }}>{label}</label>}
      <textarea
        data-testid={`input-${label?.toLowerCase().replace(/\s+/g, "-") || "response"}`}
        className="w-full bg-transparent border border-[#2a2520] rounded-none p-4 text-[#e8e4df] placeholder-[#4a4540] focus:border-[#c4a24d] focus:outline-none transition-colors resize-none"
        style={{ fontFamily: "'Lora', serif", fontSize: "1rem", lineHeight: "1.8", minHeight: maxRows ? `${maxRows * 2}rem` : "6rem" }}
        placeholder={placeholder || "Write here..."}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}

function ContinueButton({ onClick, delay = 2 }: { onClick: () => void; delay?: number }) {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    setVisible(false);
    const t = setTimeout(() => setVisible(true), delay * 1000);
    return () => clearTimeout(t);
  }, [delay]);
  return (
    <div className="mt-12 min-h-[60px]">
      {visible && (
        <motion.button
          data-testid="button-continue"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] as unknown as [number, number, number, number] }}
          onClick={onClick}
          className="px-8 py-3 border border-[#c4a24d] text-[#c4a24d] tracking-[0.15em] uppercase text-sm hover:bg-[#c4a24d] hover:text-[#0a0a0a] transition-all duration-300"
        >
          Continue
        </motion.button>
      )}
    </div>
  );
}

function Prose({ children }: { children: React.ReactNode }) {
  return (
    <div className="prose-exhibit" style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.25rem", lineHeight: "2", color: "#e8e4df", whiteSpace: "pre-line" }}>
      {children}
    </div>
  );
}

function ScreenEntrance({ onContinue }: { onContinue: () => void }) {
  return (
    <motion.div {...FADE}>
      <Prose>
        <p>You are standing in a narrow corridor. The walls are the color of wet ink.</p>
        <p className="mt-6">Somewhere ahead, a metaphor is waiting to show you what it knows.</p>
        <p className="mt-6">You did not come here to learn definitions. You came here because something in your writing has been staying too still {"\u2014"} circling the same comparisons, reaching for the same safe distances.</p>
        <p className="mt-6">A metaphor is not a decoration. It is a migration.</p>
        <p className="mt-6">The image leaves one thing and arrives at another, and in the crossing, both are changed.</p>
        <p className="mt-6">Today, we practice letting the image move.</p>
      </Prose>
      <ContinueButton onClick={onContinue} delay={3} />
    </motion.div>
  );
}

function ScreenCraftInsight1({ onContinue }: { onContinue: () => void }) {
  return (
    <motion.div {...FADE}>
      <h2 className="text-sm tracking-[0.3em] uppercase mb-10" style={{ color: "#c4a24d" }}>What a Metaphor Does</h2>
      <Prose>
        <p>Most writing advice treats metaphor as ornamentation {"\u2014"} a way to make sentences prettier. But a metaphor is not a brooch pinned to a dress. It is the thread that pulls the fabric into shape.</p>
        <p className="mt-6">When you say {"\u2018"}grief is an ocean,{"\u2019"} you are not describing grief. You are teaching your body to feel it differently: as something vast, tidal, indifferent to your swimming.</p>
        <p className="mt-6">The image does not explain. It relocates.</p>
        <p className="mt-6">Every strong metaphor is a small act of transformation. You take one thing and let it travel until it touches something else, and in that touch, both are altered.</p>
        <p className="mt-6">This is what we{"\u2019"}ll practice: not finding metaphors, but following them.</p>
      </Prose>
      <ContinueButton onClick={onContinue} delay={2} />
    </motion.div>
  );
}

function ScreenThreshold({ onSubmit }: { onSubmit: (text: string) => void }) {
  const [value, setValue] = useState("");
  const [mirror, setMirror] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = () => {
    if (!value.trim()) return;
    setSubmitted(true);
    setMirror(getMirrorResponse(value));
    onSubmit(value);
  };

  return (
    <motion.div {...FADE}>
      <h2 className="text-sm tracking-[0.3em] uppercase mb-10" style={{ color: "#c4a24d" }}>The Threshold</h2>
      <Prose>
        <p>Before we begin, I need to know what you arrive with.</p>
        <p className="mt-6">Below is a stem. You will finish it. Don{"\u2019"}t think. Don{"\u2019"}t polish. The sentence is already true {"\u2014"} you{"\u2019"}re just finding out what it says.</p>
      </Prose>
      <div className="mt-10">
        <p className="mb-2 italic" style={{ color: "#8a8278", fontFamily: "'Cormorant Garamond', serif", fontSize: "1.1rem" }}>My writing reaches for metaphor when...</p>
        <ExhibitInput value={value} onChange={setValue} placeholder="...finish the thought" />
        {!submitted && (
          <button
            data-testid="button-submit-threshold"
            onClick={handleSubmit}
            disabled={!value.trim()}
            className="mt-4 px-8 py-3 border border-[#c4a24d] text-[#c4a24d] tracking-[0.15em] uppercase text-sm hover:bg-[#c4a24d] hover:text-[#0a0a0a] transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed"
          >
            Submit
          </button>
        )}
        <AnimatePresence>
          {mirror && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.3 }} className="mt-8 pl-6 border-l-2 border-[#c4a24d]">
              <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.15rem", lineHeight: "1.8", color: "#c4a24d", fontStyle: "italic" }}>{mirror}</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

function ScreenSyntaxBloom({ onSubmit }: { onSubmit: (moss: string, ivy: string, wildflower: string) => void }) {
  const [moss, setMoss] = useState("");
  const [ivy, setIvy] = useState("");
  const [wildflower, setWildflower] = useState("");
  const [mirror, setMirror] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = () => {
    if (!moss.trim() || !ivy.trim() || !wildflower.trim()) return;
    setSubmitted(true);
    setMirror("Now you know: the same image can breathe in different bodies. Keep that.");
    onSubmit(moss, ivy, wildflower);
  };

  return (
    <motion.div {...FADE}>
      <h2 className="text-sm tracking-[0.3em] uppercase mb-10" style={{ color: "#c4a24d" }}>Syntax Bloom</h2>
      <Prose>
        <p>Sentences are organisms. Some sprawl like ivy, covering every surface. Some stay low, like moss {"\u2014"} barely there, but persistent. Others rise fast and fall, like wildflowers after rain.</p>
        <p className="mt-6">Below, you{"\u2019"}ll write three versions of the same image. I{"\u2019"}ll give you a seed: the image of someone waiting.</p>
        <p className="mt-6">Write it three ways:</p>
      </Prose>
      <div className="mt-8 space-y-2">
        <Prose><p><strong>1. MOSS</strong> {"\u2014"} A short, clipped sentence. Five words or fewer. Let it sit on the page like a held breath.</p></Prose>
        <Prose><p><strong>2. IVY</strong> {"\u2014"} A long, winding sentence. Let it sprawl. Subordinate clauses, digressions, the whole tangled thing.</p></Prose>
        <Prose><p><strong>3. WILDFLOWER</strong> {"\u2014"} A balanced sentence. Medium length. It rises, turns, and completes.</p></Prose>
      </div>
      <p className="mt-6 text-sm" style={{ color: "#8a8278" }}>Same image. Three different metabolisms.</p>
      <div className="mt-8">
        <ExhibitInput label="MOSS (5 words or fewer)" value={moss} onChange={setMoss} maxRows={2} />
        <ExhibitInput label="IVY (let it sprawl)" value={ivy} onChange={setIvy} maxRows={4} />
        <ExhibitInput label="WILDFLOWER (balanced)" value={wildflower} onChange={setWildflower} maxRows={3} />
        {!submitted && (
          <button
            data-testid="button-submit-syntax-bloom"
            onClick={handleSubmit}
            disabled={!moss.trim() || !ivy.trim() || !wildflower.trim()}
            className="mt-4 px-8 py-3 border border-[#c4a24d] text-[#c4a24d] tracking-[0.15em] uppercase text-sm hover:bg-[#c4a24d] hover:text-[#0a0a0a] transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed"
          >
            Submit
          </button>
        )}
        <AnimatePresence>
          {mirror && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.3 }} className="mt-8 pl-6 border-l-2 border-[#c4a24d]">
              <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.15rem", lineHeight: "1.8", color: "#c4a24d", fontStyle: "italic" }}>{mirror}</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

function ScreenCraftInsight2({ onContinue }: { onContinue: () => void }) {
  return (
    <motion.div {...FADE}>
      <h2 className="text-sm tracking-[0.3em] uppercase mb-10" style={{ color: "#c4a24d" }}>On Fidelity</h2>
      <Prose>
        <p>There is a kind of loyalty that kills metaphors: the insistence that they {"\u2018"}make sense.{"\u2019"}</p>
        <p className="mt-6">The most alive comparisons don{"\u2019"}t explain themselves. They trust the reader{"\u2019"}s body to understand before the mind catches up.</p>
        <p className="mt-6">{"\u2018"}Grief is an ocean{"\u2019"} works not because grief is actually like an ocean, but because your lungs already know what drowning feels like.</p>
        <p className="mt-6">When you follow a metaphor, you are not solving a puzzle. You are agreeing to a temporary belief.</p>
        <p className="mt-6">The writer{"\u2019"}s job is not to justify the comparison {"\u2014"} it is to commit to it so fully that the reader forgets it was ever a leap.</p>
      </Prose>
      <ContinueButton onClick={onContinue} delay={2} />
    </motion.div>
  );
}

function ScreenMigrationPath({ onSubmit }: { onSubmit: (text: string) => void }) {
  const [value, setValue] = useState("");
  const [mirror, setMirror] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = () => {
    if (!value.trim()) return;
    setSubmitted(true);
    setMirror("You let it move. That\u2019s the whole lesson, really. The rest is just practice.");
    onSubmit(value);
  };

  return (
    <motion.div {...FADE}>
      <h2 className="text-sm tracking-[0.3em] uppercase mb-10" style={{ color: "#c4a24d" }}>The Migration Path</h2>
      <Prose>
        <p>Now we travel.</p>
        <p className="mt-6">Write a short paragraph {"\u2014"} four to six sentences {"\u2014"} in which a metaphor begins as one thing and becomes another by the end.</p>
        <p className="mt-6">Don{"\u2019"}t plan. Start with an image that feels true, and let it shift. The metaphor might begin as weather and end as architecture. It might start as an animal and arrive as a memory.</p>
        <p className="mt-6">Your job is to follow it. Not to control it.</p>
        <p className="mt-6">Begin.</p>
      </Prose>
      <div className="mt-10">
        <ExhibitInput value={value} onChange={setValue} maxRows={8} />
        {!submitted && (
          <button
            data-testid="button-submit-migration"
            onClick={handleSubmit}
            disabled={!value.trim()}
            className="mt-4 px-8 py-3 border border-[#c4a24d] text-[#c4a24d] tracking-[0.15em] uppercase text-sm hover:bg-[#c4a24d] hover:text-[#0a0a0a] transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed"
          >
            Submit
          </button>
        )}
        <AnimatePresence>
          {mirror && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.3 }} className="mt-8 pl-6 border-l-2 border-[#c4a24d]">
              <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.15rem", lineHeight: "1.8", color: "#c4a24d", fontStyle: "italic" }}>{mirror}</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

const CHALLENGES = [
  "Your metaphors still believe someone is watching.",
  "You reach for comparison when you\u2019re afraid of saying the thing directly.",
  "There is an image you keep circling but won\u2019t name.",
  "You protect certain metaphors from their own wildness.",
  "You have not yet written the metaphor that scares you.",
];

function ScreenReflections({ onSubmit }: { onSubmit: (responses: string[]) => void }) {
  const [values, setValues] = useState<string[]>(["", "", "", "", ""]);
  const [submitted, setSubmitted] = useState(false);

  const update = (i: number, v: string) => {
    const next = [...values];
    next[i] = v;
    setValues(next);
  };

  const allFilled = values.every((v) => v.trim().length > 0);

  const handleSubmit = () => {
    if (!allFilled) return;
    setSubmitted(true);
    onSubmit(values);
  };

  return (
    <motion.div {...FADE}>
      <h2 className="text-sm tracking-[0.3em] uppercase mb-10" style={{ color: "#c4a24d" }}>Before You Leave</h2>
      <Prose>
        <p>The exhibit is almost over. But I want to leave you with some accusations.</p>
        <p className="mt-6">They are not questions. They are statements about your writing. Your job is to respond {"\u2014"} agree, argue, or confess.</p>
      </Prose>
      <div className="mt-10 space-y-10">
        {CHALLENGES.map((challenge, i) => (
          <div key={i}>
            <p className="mb-3 italic" style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.15rem", lineHeight: "1.8", color: "#e8e4df" }}>
              {i + 1}. {"\u201C"}{challenge}{"\u201D"}
            </p>
            <ExhibitInput label={`Challenge ${i + 1}`} value={values[i]} onChange={(v) => update(i, v)} maxRows={3} />
          </div>
        ))}
      </div>
      {!submitted && (
        <button
          data-testid="button-submit-reflections"
          onClick={handleSubmit}
          disabled={!allFilled}
          className="mt-8 px-8 py-3 border border-[#c4a24d] text-[#c4a24d] tracking-[0.15em] uppercase text-sm hover:bg-[#c4a24d] hover:text-[#0a0a0a] transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed"
        >
          Submit Reflections
        </button>
      )}
    </motion.div>
  );
}

function ScreenExit({ allComplete }: { allComplete: boolean }) {
  const [, navigate] = useLocation();
  const [showBlessing, setShowBlessing] = useState(false);

  useEffect(() => {
    if (allComplete) {
      const t = setTimeout(() => setShowBlessing(true), 1500);
      return () => clearTimeout(t);
    }
  }, [allComplete]);

  return (
    <motion.div {...FADE}>
      <h2 className="text-sm tracking-[0.3em] uppercase mb-10" style={{ color: "#c4a24d" }}>The Exit</h2>
      <Prose>
        <p>You are walking back through the corridor. The walls are still ink-dark, but the light has changed.</p>
        <p className="mt-6">What you practiced here is simple: following the image instead of directing it. Trusting the metaphor to know where it needs to go.</p>
        <p className="mt-6">This is not a skill you master. It is a practice you return to.</p>
        <p className="mt-6">Your responses have been saved to your Garden.</p>
        <p className="mt-6">If one of them surprised you {"\u2014"} if one sentence felt more true than you expected {"\u2014"} consider sharing it in the Gallery.</p>
        <p className="mt-6">The exhibit will be here when you need it again.</p>
      </Prose>
      <div className="mt-12 flex gap-6 flex-wrap">
        <button
          data-testid="button-return-garden"
          onClick={() => navigate("/garden")}
          className="px-8 py-3 border border-[#c4a24d] text-[#c4a24d] tracking-[0.15em] uppercase text-sm hover:bg-[#c4a24d] hover:text-[#0a0a0a] transition-all duration-300"
        >
          Return to Garden
        </button>
        <button
          data-testid="button-share-gallery"
          onClick={() => navigate("/gallery")}
          className="px-8 py-3 bg-[#c4a24d] text-[#0a0a0a] tracking-[0.15em] uppercase text-sm hover:bg-[#d4b25d] transition-all duration-300"
        >
          Share to Gallery
        </button>
      </div>
      <AnimatePresence>
        {showBlessing && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1.2 }} className="mt-16 pt-12 border-t border-[#1a1815]">
            <p className="text-sm tracking-[0.3em] uppercase mb-8" style={{ color: "#c4a24d" }}>A Blessing for the Returning Writer</p>
            <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.2rem", lineHeight: "2.2", color: "#8a8278", fontStyle: "italic" }}>
              <p>May your metaphors be unruly.</p>
              <p>May they refuse your first intentions.</p>
              <p>May they lead you somewhere inconvenient and true.</p>
              <p>May you follow anyway.</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function Exhibit() {
  const { slug } = useParams<{ slug: string }>();
  const [screen, setScreen] = useState(1);
  const [completedExercises, setCompletedExercises] = useState<string[]>([]);
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const { data: exhibit, isLoading, error } = useQuery<any>({
    queryKey: [`/api/exhibits/${slug}`],
    queryFn: getQueryFn({ on401: "returnNull" }),
    enabled: !!slug,
  });

  const responseMutation = useMutation({
    mutationFn: async (data: { exerciseKey: string; responseText: string; tags?: string[] }) => {
      const res = await apiRequest("POST", `/api/exhibits/${slug}/responses`, data);
      return res.json();
    },
  });

  const reflectionMutation = useMutation({
    mutationFn: async (data: { challengeKey: string; responseText: string }) => {
      const res = await apiRequest("POST", `/api/exhibits/${slug}/reflections`, data);
      return res.json();
    },
  });

  const progressMutation = useMutation({
    mutationFn: async (data: { currentScreen: number; completedExercises: string[]; completedAt?: string | null }) => {
      const res = await apiRequest("POST", `/api/exhibits/${slug}/progress`, data);
      return res.json();
    },
  });

  const advance = useCallback((exerciseKey?: string) => {
    const next = screen + 1;
    const newCompleted = exerciseKey ? [...completedExercises, exerciseKey] : completedExercises;
    if (exerciseKey && !completedExercises.includes(exerciseKey)) {
      setCompletedExercises(newCompleted);
    }
    setScreen(next);
    window.scrollTo({ top: 0, behavior: "smooth" });
    if (user) {
      progressMutation.mutate({
        currentScreen: next,
        completedExercises: newCompleted,
        completedAt: next > 8 ? new Date().toISOString() : null,
      });
    }
  }, [screen, completedExercises, user, slug]);

  const handleThreshold = (text: string) => {
    if (user) responseMutation.mutate({ exerciseKey: "threshold", responseText: text });
    setTimeout(() => advance("threshold"), 2000);
  };

  const handleSyntaxBloom = (moss: string, ivy: string, wildflower: string) => {
    if (user) {
      responseMutation.mutate({ exerciseKey: "syntax_bloom_moss", responseText: moss, tags: ["moss"] });
      responseMutation.mutate({ exerciseKey: "syntax_bloom_ivy", responseText: ivy, tags: ["ivy"] });
      responseMutation.mutate({ exerciseKey: "syntax_bloom_wildflower", responseText: wildflower, tags: ["wildflower"] });
    }
    setTimeout(() => advance("syntax_bloom"), 2000);
  };

  const handleMigration = (text: string) => {
    if (user) responseMutation.mutate({ exerciseKey: "migration_path", responseText: text });
    setTimeout(() => advance("migration_path"), 2000);
  };

  const handleReflections = (responses: string[]) => {
    if (user) {
      responses.forEach((text, i) => {
        reflectionMutation.mutate({ challengeKey: `challenge_${i + 1}`, responseText: text });
      });
    }
    setTimeout(() => advance("reflections"), 1500);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#0a0a0a" }}>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center">
          <div className="w-8 h-[1px] bg-[#c4a24d] mx-auto mb-6 animate-pulse" />
          <p style={{ fontFamily: "'Cormorant Garamond', serif", color: "#8a8278", fontSize: "1rem", letterSpacing: "0.1em" }}>Preparing the exhibit...</p>
        </motion.div>
      </div>
    );
  }

  if (error || !exhibit) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#0a0a0a" }}>
        <div className="text-center max-w-md px-6">
          <p style={{ fontFamily: "'Cormorant Garamond', serif", color: "#e8e4df", fontSize: "1.3rem" }}>This exhibit could not be found.</p>
          <p className="mt-4" style={{ fontFamily: "'Lora', serif", color: "#8a8278", fontSize: "0.9rem" }}>It may have been removed, or it hasn't opened yet.</p>
        </div>
      </div>
    );
  }

  const allComplete = completedExercises.includes("threshold") && completedExercises.includes("syntax_bloom") && completedExercises.includes("migration_path") && completedExercises.includes("reflections");

  return (
    <div className="min-h-screen" style={{ background: "#0a0a0a" }}>
      <div className="fixed top-0 left-0 right-0 z-50 flex justify-between items-center px-6 py-4" style={{ background: "linear-gradient(to bottom, #0a0a0a 60%, transparent)" }}>
        <span className="text-xs tracking-[0.2em] uppercase" style={{ color: "#4a4540" }}>{exhibit.title}</span>
        <span className="text-xs tracking-[0.2em]" style={{ color: "#4a4540" }}>{screen} / 8</span>
      </div>

      <div className="max-w-[680px] mx-auto px-6 pt-24 pb-20 min-h-screen flex flex-col justify-center">
        <AnimatePresence mode="wait">
          {screen === 1 && <ScreenEntrance key="s1" onContinue={() => advance()} />}
          {screen === 2 && <ScreenCraftInsight1 key="s2" onContinue={() => advance()} />}
          {screen === 3 && <ScreenThreshold key="s3" onSubmit={handleThreshold} />}
          {screen === 4 && <ScreenSyntaxBloom key="s4" onSubmit={handleSyntaxBloom} />}
          {screen === 5 && <ScreenCraftInsight2 key="s5" onContinue={() => advance()} />}
          {screen === 6 && <ScreenMigrationPath key="s6" onSubmit={handleMigration} />}
          {screen === 7 && <ScreenReflections key="s7" onSubmit={handleReflections} />}
          {screen === 8 && <ScreenExit key="s8" allComplete={allComplete} />}
        </AnimatePresence>
      </div>

      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 flex gap-2">
        {Array.from({ length: 8 }).map((_, i) => (
          <button
            key={i}
            data-testid={`dot-screen-${i + 1}`}
            onClick={() => {
              setScreen(i + 1);
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            className="w-3 h-3 rounded-full transition-all duration-500 hover:scale-150 cursor-pointer p-0 border-0 bg-transparent flex items-center justify-center"
            aria-label={`Go to screen ${i + 1}`}
          >
            <span
              className="block w-1.5 h-1.5 rounded-full transition-all duration-500"
              style={{ background: i + 1 === screen ? "#c4a24d" : i + 1 < screen ? "#3a3530" : "#1a1815" }}
            />
          </button>
        ))}
      </div>
    </div>
  );
}