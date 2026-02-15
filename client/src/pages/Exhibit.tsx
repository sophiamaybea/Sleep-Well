import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, getQueryFn } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";

function useScrollReveal(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { setVisible(true); obs.disconnect(); }
    }, { threshold });
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, visible };
}

function ScrollReveal({ children, className = "", delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const { ref, visible } = useScrollReveal(0.1);
  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(24px)",
        transition: `opacity 1s cubic-bezier(0.22,1,0.36,1) ${delay}s, transform 1s cubic-bezier(0.22,1,0.36,1) ${delay}s`,
      }}
    >
      {children}
    </div>
  );
}

function getMirrorResponse(text: string): string {
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  if (words < 10) return "You gave me a whisper. Good. Sometimes the truest things fit in a palm.";
  if (words <= 30) return "That\u2019s honest. I can feel you reaching for something just out of frame.";
  return "You gave me everything at once. There\u2019s a door in there somewhere \u2014 we\u2019ll find it.";
}

const PROSE_STYLE: React.CSSProperties = {
  fontFamily: "'Cormorant Garamond', serif",
  fontSize: "clamp(1.4rem, 3.2vw, 1.75rem)",
  lineHeight: "2.1",
  color: "#e8e4df",
};

const HEADING_STYLE: React.CSSProperties = {
  color: "#c4a24d",
  fontFamily: "'Cormorant Garamond', serif",
  letterSpacing: "0.3em",
  fontSize: "0.75rem",
  textTransform: "uppercase" as const,
};

function ExhibitInput({ label, placeholder, value, onChange, maxRows }: { label?: string; placeholder?: string; value: string; onChange: (v: string) => void; maxRows?: number }) {
  return (
    <div className="mb-6">
      {label && <label className="block text-sm tracking-[0.2em] uppercase mb-3" style={{ color: "#8a8278" }}>{label}</label>}
      <textarea
        data-testid={`input-${label?.toLowerCase().replace(/\s+/g, "-") || "response"}`}
        className="w-full bg-transparent border border-[#2a2520] rounded-none p-5 text-[#e8e4df] placeholder-[#4a4540] focus:border-[#c4a24d] focus:outline-none transition-colors resize-none"
        style={{ fontFamily: "'Lora', serif", fontSize: "1.15rem", lineHeight: "1.9", minHeight: maxRows ? `${maxRows * 2.2}rem` : "7rem" }}
        placeholder={placeholder || "Write here..."}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}

function SubmitButton({ onClick, disabled, label = "Submit", testId }: { onClick: () => void; disabled?: boolean; label?: string; testId: string }) {
  return (
    <button
      data-testid={testId}
      onClick={onClick}
      disabled={disabled}
      className="mt-6 px-10 py-4 border border-[#c4a24d] text-[#c4a24d] tracking-[0.15em] uppercase text-sm hover:bg-[#c4a24d] hover:text-[#0a0a0a] transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed"
    >
      {label}
    </button>
  );
}

function MirrorResponse({ text }: { text: string }) {
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.4 }} className="mt-10 pl-6 border-l-2 border-[#c4a24d]">
      <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.3rem", lineHeight: "1.9", color: "#c4a24d", fontStyle: "italic" }}>{text}</p>
    </motion.div>
  );
}

function Divider() {
  return (
    <ScrollReveal className="py-24 flex justify-center">
      <div className="w-16 h-[1px] bg-[#c4a24d]/30" />
    </ScrollReveal>
  );
}

function SectionThreshold({ onSubmit }: { onSubmit: (text: string) => void }) {
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
    <>
      <ScrollReveal><h2 className="mb-16" style={HEADING_STYLE}>The Threshold</h2></ScrollReveal>
      <ScrollReveal><p style={PROSE_STYLE}>Before we begin, I need to know what you arrive with.</p></ScrollReveal>
      <ScrollReveal><p className="mt-8" style={PROSE_STYLE}>Below is a stem. You will finish it. Don{"\u2019"}t think. Don{"\u2019"}t polish. The sentence is already true {"\u2014"} you{"\u2019"}re just finding out what it says.</p></ScrollReveal>
      <ScrollReveal>
        <div className="mt-14">
          <p className="mb-4 italic" style={{ color: "#8a8278", fontFamily: "'Cormorant Garamond', serif", fontSize: "1.3rem" }}>My writing reaches for metaphor when...</p>
          <ExhibitInput value={value} onChange={setValue} placeholder="...finish the thought" />
          {!submitted && <SubmitButton onClick={handleSubmit} disabled={!value.trim()} testId="button-submit-threshold" />}
          {mirror && <MirrorResponse text={mirror} />}
        </div>
      </ScrollReveal>
    </>
  );
}

function SectionSyntaxBloom({ onSubmit }: { onSubmit: (moss: string, ivy: string, wildflower: string) => void }) {
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
    <>
      <ScrollReveal><h2 className="mb-16" style={HEADING_STYLE}>Syntax Bloom</h2></ScrollReveal>
      <ScrollReveal><p style={PROSE_STYLE}>Sentences are organisms. Some sprawl like ivy, covering every surface. Some stay low, like moss {"\u2014"} barely there, but persistent. Others rise fast and fall, like wildflowers after rain.</p></ScrollReveal>
      <ScrollReveal><p className="mt-8" style={PROSE_STYLE}>Below, you{"\u2019"}ll write three versions of the same image. I{"\u2019"}ll give you a seed: the image of someone waiting.</p></ScrollReveal>
      <ScrollReveal><p className="mt-8" style={PROSE_STYLE}>Write it three ways:</p></ScrollReveal>
      <ScrollReveal>
        <div className="mt-10 space-y-4">
          <p style={PROSE_STYLE}><strong>1. MOSS</strong> {"\u2014"} A short, clipped sentence. Five words or fewer. Let it sit on the page like a held breath.</p>
          <p style={PROSE_STYLE}><strong>2. IVY</strong> {"\u2014"} A long, winding sentence. Let it sprawl. Subordinate clauses, digressions, the whole tangled thing.</p>
          <p style={PROSE_STYLE}><strong>3. WILDFLOWER</strong> {"\u2014"} A balanced sentence. Medium length. It rises, turns, and completes.</p>
        </div>
      </ScrollReveal>
      <ScrollReveal><p className="mt-8 text-sm" style={{ color: "#8a8278" }}>Same image. Three different metabolisms.</p></ScrollReveal>
      <ScrollReveal>
        <div className="mt-10">
          <ExhibitInput label="MOSS (5 words or fewer)" value={moss} onChange={setMoss} maxRows={2} />
          <ExhibitInput label="IVY (let it sprawl)" value={ivy} onChange={setIvy} maxRows={4} />
          <ExhibitInput label="WILDFLOWER (balanced)" value={wildflower} onChange={setWildflower} maxRows={3} />
          {!submitted && <SubmitButton onClick={handleSubmit} disabled={!moss.trim() || !ivy.trim() || !wildflower.trim()} testId="button-submit-syntax-bloom" />}
          {mirror && <MirrorResponse text={mirror} />}
        </div>
      </ScrollReveal>
    </>
  );
}

function SectionMigrationPath({ onSubmit }: { onSubmit: (text: string) => void }) {
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
    <>
      <ScrollReveal><h2 className="mb-16" style={HEADING_STYLE}>The Migration Path</h2></ScrollReveal>
      <ScrollReveal><p style={PROSE_STYLE}>Now we travel.</p></ScrollReveal>
      <ScrollReveal><p className="mt-8" style={PROSE_STYLE}>Write a short paragraph {"\u2014"} four to six sentences {"\u2014"} in which a metaphor begins as one thing and becomes another by the end.</p></ScrollReveal>
      <ScrollReveal><p className="mt-8" style={PROSE_STYLE}>Don{"\u2019"}t plan. Start with an image that feels true, and let it shift. The metaphor might begin as weather and end as architecture. It might start as an animal and arrive as a memory.</p></ScrollReveal>
      <ScrollReveal><p className="mt-8" style={PROSE_STYLE}>Your job is to follow it. Not to control it.</p></ScrollReveal>
      <ScrollReveal><p className="mt-8" style={PROSE_STYLE}>Begin.</p></ScrollReveal>
      <ScrollReveal>
        <div className="mt-14">
          <ExhibitInput value={value} onChange={setValue} maxRows={8} />
          {!submitted && <SubmitButton onClick={handleSubmit} disabled={!value.trim()} testId="button-submit-migration" />}
          {mirror && <MirrorResponse text={mirror} />}
        </div>
      </ScrollReveal>
    </>
  );
}

const CHALLENGES = [
  "Your metaphors still believe someone is watching.",
  "You reach for comparison when you\u2019re afraid of saying the thing directly.",
  "There is an image you keep circling but won\u2019t name.",
  "You protect certain metaphors from their own wildness.",
  "You have not yet written the metaphor that scares you.",
];

function SectionReflections({ onSubmit }: { onSubmit: (responses: string[]) => void }) {
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
    <>
      <ScrollReveal><h2 className="mb-16" style={HEADING_STYLE}>Before You Leave</h2></ScrollReveal>
      <ScrollReveal><p style={PROSE_STYLE}>The exhibit is almost over. But I want to leave you with some accusations.</p></ScrollReveal>
      <ScrollReveal><p className="mt-8" style={PROSE_STYLE}>They are not questions. They are statements about your writing. Your job is to respond {"\u2014"} agree, argue, or confess.</p></ScrollReveal>
      <div className="mt-14 space-y-12">
        {CHALLENGES.map((challenge, i) => (
          <ScrollReveal key={i}>
            <p className="mb-4 italic" style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.3rem", lineHeight: "1.9", color: "#e8e4df" }}>
              {i + 1}. {"\u201C"}{challenge}{"\u201D"}
            </p>
            <ExhibitInput label={`Challenge ${i + 1}`} value={values[i]} onChange={(v) => update(i, v)} maxRows={3} />
          </ScrollReveal>
        ))}
      </div>
      <ScrollReveal>
        {!submitted && <SubmitButton onClick={handleSubmit} disabled={!allFilled} label="Submit Reflections" testId="button-submit-reflections" />}
      </ScrollReveal>
    </>
  );
}

export default function Exhibit() {
  const { slug } = useParams<{ slug: string }>();
  const [, navigate] = useLocation();
  const [completedExercises, setCompletedExercises] = useState<string[]>([]);
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

  const markExercise = useCallback((key: string) => {
    const newCompleted = completedExercises.includes(key) ? completedExercises : [...completedExercises, key];
    setCompletedExercises(newCompleted);
    if (user) {
      progressMutation.mutate({ currentScreen: 8, completedExercises: newCompleted, completedAt: newCompleted.length >= 4 ? new Date().toISOString() : null });
    }
  }, [completedExercises, user, slug]);

  const handleThreshold = (text: string) => {
    if (user) responseMutation.mutate({ exerciseKey: "threshold", responseText: text });
    markExercise("threshold");
  };

  const handleSyntaxBloom = (moss: string, ivy: string, wildflower: string) => {
    if (user) {
      responseMutation.mutate({ exerciseKey: "syntax_bloom_moss", responseText: moss, tags: ["moss"] });
      responseMutation.mutate({ exerciseKey: "syntax_bloom_ivy", responseText: ivy, tags: ["ivy"] });
      responseMutation.mutate({ exerciseKey: "syntax_bloom_wildflower", responseText: wildflower, tags: ["wildflower"] });
    }
    markExercise("syntax_bloom");
  };

  const handleMigration = (text: string) => {
    if (user) responseMutation.mutate({ exerciseKey: "migration_path", responseText: text });
    markExercise("migration_path");
  };

  const handleReflections = (responses: string[]) => {
    if (user) {
      responses.forEach((text, i) => {
        reflectionMutation.mutate({ challengeKey: `challenge_${i + 1}`, responseText: text });
      });
    }
    markExercise("reflections");
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
          <p className="mt-4" style={{ fontFamily: "'Lora', serif", color: "#8a8278", fontSize: "0.9rem" }}>It may have been removed, or it hasn{"\u2019"}t opened yet.</p>
        </div>
      </div>
    );
  }

  const allComplete = completedExercises.includes("threshold") && completedExercises.includes("syntax_bloom") && completedExercises.includes("migration_path") && completedExercises.includes("reflections");

  return (
    <div className="min-h-screen" style={{ background: "#0a0a0a" }}>
      <div className="fixed top-0 left-0 right-0 z-50 flex justify-between items-center px-6 py-4" style={{ background: "linear-gradient(to bottom, #0a0a0a 60%, transparent)" }}>
        <span className="text-xs tracking-[0.2em] uppercase" style={{ color: "#4a4540" }}>{exhibit.title}</span>
        <button onClick={() => navigate("/exhibits")} className="text-xs tracking-[0.2em] uppercase text-[#4a4540] hover:text-[#c4a24d] transition-colors" data-testid="button-back-exhibits">Back</button>
      </div>

      <div className="max-w-[720px] mx-auto px-8 md:px-6">

        {/* === ENTRANCE === */}
        <div className="min-h-screen flex flex-col justify-center py-24">
          <ScrollReveal><p style={PROSE_STYLE}>You are standing in a narrow corridor. The walls are the color of wet ink.</p></ScrollReveal>
          <ScrollReveal><p className="mt-10" style={PROSE_STYLE}>Somewhere ahead, a metaphor is waiting to show you what it knows.</p></ScrollReveal>
          <ScrollReveal><p className="mt-10" style={PROSE_STYLE}>You did not come here to learn definitions. You came here because something in your writing has been staying too still {"\u2014"} circling the same comparisons, reaching for the same safe distances.</p></ScrollReveal>
          <ScrollReveal><p className="mt-10" style={PROSE_STYLE}>A metaphor is not a decoration. It is a migration.</p></ScrollReveal>
          <ScrollReveal><p className="mt-10" style={PROSE_STYLE}>The image leaves one thing and arrives at another, and in the crossing, both are changed.</p></ScrollReveal>
          <ScrollReveal><p className="mt-10" style={PROSE_STYLE}>Today, we practice letting the image move.</p></ScrollReveal>
        </div>

        <Divider />

        {/* === CRAFT INSIGHT 1 === */}
        <div className="py-24">
          <ScrollReveal><h2 className="mb-16" style={HEADING_STYLE}>What a Metaphor Does</h2></ScrollReveal>
          <ScrollReveal><p style={PROSE_STYLE}>Most writing advice treats metaphor as ornamentation {"\u2014"} a way to make sentences prettier. But a metaphor is not a brooch pinned to a dress. It is the thread that pulls the fabric into shape.</p></ScrollReveal>
          <ScrollReveal><p className="mt-10" style={PROSE_STYLE}>When you say {"\u2018"}grief is an ocean,{"\u2019"} you are not describing grief. You are teaching your body to feel it differently: as something vast, tidal, indifferent to your swimming.</p></ScrollReveal>
          <ScrollReveal><p className="mt-10" style={PROSE_STYLE}>The image does not explain. It relocates.</p></ScrollReveal>
          <ScrollReveal><p className="mt-10" style={PROSE_STYLE}>Every strong metaphor is a small act of transformation. You take one thing and let it travel until it touches something else, and in that touch, both are altered.</p></ScrollReveal>
          <ScrollReveal><p className="mt-10" style={PROSE_STYLE}>This is what we{"\u2019"}ll practice: not finding metaphors, but following them.</p></ScrollReveal>
        </div>

        <Divider />

        {/* === EXERCISE 1: THRESHOLD === */}
        <div className="py-24">
          <SectionThreshold onSubmit={handleThreshold} />
        </div>

        <Divider />

        {/* === EXERCISE 2: SYNTAX BLOOM === */}
        <div className="py-24">
          <SectionSyntaxBloom onSubmit={handleSyntaxBloom} />
        </div>

        <Divider />

        {/* === CRAFT INSIGHT 2 === */}
        <div className="py-24">
          <ScrollReveal><h2 className="mb-16" style={HEADING_STYLE}>On Fidelity</h2></ScrollReveal>
          <ScrollReveal><p style={PROSE_STYLE}>There is a kind of loyalty that kills metaphors: the insistence that they {"\u2018"}make sense.{"\u2019"}</p></ScrollReveal>
          <ScrollReveal><p className="mt-10" style={PROSE_STYLE}>The most alive comparisons don{"\u2019"}t explain themselves. They trust the reader{"\u2019"}s body to understand before the mind catches up.</p></ScrollReveal>
          <ScrollReveal><p className="mt-10" style={PROSE_STYLE}>{"\u2018"}Grief is an ocean{"\u2019"} works not because grief is actually like an ocean, but because your lungs already know what drowning feels like.</p></ScrollReveal>
          <ScrollReveal><p className="mt-10" style={PROSE_STYLE}>When you follow a metaphor, you are not solving a puzzle. You are agreeing to a temporary belief.</p></ScrollReveal>
          <ScrollReveal><p className="mt-10" style={PROSE_STYLE}>The writer{"\u2019"}s job is not to justify the comparison {"\u2014"} it is to commit to it so fully that the reader forgets it was ever a leap.</p></ScrollReveal>
        </div>

        <Divider />

        {/* === EXERCISE 3: MIGRATION PATH === */}
        <div className="py-24">
          <SectionMigrationPath onSubmit={handleMigration} />
        </div>

        <Divider />

        {/* === REFLECTIONS === */}
        <div className="py-24">
          <SectionReflections onSubmit={handleReflections} />
        </div>

        <Divider />

        {/* === EXIT === */}
        <div className="py-24 pb-40">
          <ScrollReveal><h2 className="mb-16" style={HEADING_STYLE}>The Exit</h2></ScrollReveal>
          <ScrollReveal><p style={PROSE_STYLE}>You are walking back through the corridor. The walls are still ink-dark, but the light has changed.</p></ScrollReveal>
          <ScrollReveal><p className="mt-10" style={PROSE_STYLE}>What you practiced here is simple: following the image instead of directing it. Trusting the metaphor to know where it needs to go.</p></ScrollReveal>
          <ScrollReveal><p className="mt-10" style={PROSE_STYLE}>This is not a skill you master. It is a practice you return to.</p></ScrollReveal>
          <ScrollReveal><p className="mt-10" style={PROSE_STYLE}>Your responses have been saved to your Garden.</p></ScrollReveal>
          <ScrollReveal><p className="mt-10" style={PROSE_STYLE}>If one of them surprised you {"\u2014"} if one sentence felt more true than you expected {"\u2014"} consider sharing it in the Gallery.</p></ScrollReveal>
          <ScrollReveal><p className="mt-10" style={PROSE_STYLE}>The exhibit will be here when you need it again.</p></ScrollReveal>
          <ScrollReveal>
            <div className="mt-16 flex gap-6 flex-wrap">
              <button
                data-testid="button-return-garden"
                onClick={() => navigate("/garden")}
                className="px-10 py-4 border border-[#c4a24d] text-[#c4a24d] tracking-[0.15em] uppercase text-sm hover:bg-[#c4a24d] hover:text-[#0a0a0a] transition-all duration-300"
              >
                Return to Garden
              </button>
              <button
                data-testid="button-share-gallery"
                onClick={() => navigate("/gallery")}
                className="px-10 py-4 bg-[#c4a24d] text-[#0a0a0a] tracking-[0.15em] uppercase text-sm hover:bg-[#d4b25d] transition-all duration-300"
              >
                Share to Gallery
              </button>
            </div>
          </ScrollReveal>
          {allComplete && (
            <ScrollReveal>
              <div className="mt-24 pt-16 border-t border-[#1a1815]">
                <p className="mb-10" style={HEADING_STYLE}>A Blessing for the Returning Writer</p>
                <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(1.3rem, 2.8vw, 1.5rem)", lineHeight: "2.4", color: "#8a8278", fontStyle: "italic" }}>
                  <p>May your metaphors be unruly.</p>
                  <p>May they refuse your first intentions.</p>
                  <p>May they lead you somewhere inconvenient and true.</p>
                  <p>May you follow anyway.</p>
                </div>
              </div>
            </ScrollReveal>
          )}
        </div>

      </div>
    </div>
  );
}