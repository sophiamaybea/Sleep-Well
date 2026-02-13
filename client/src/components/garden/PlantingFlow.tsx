import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Eye, EyeOff, Users, Globe, Lock, Sparkles, ChevronRight } from "lucide-react";

type Visibility = "personal" | "circle" | "garden";
type Readiness = "raw_seed" | "growing" | "ready_to_show";

interface PlantingFlowProps {
  isOpen: boolean;
  onClose: () => void;
  currentVisibility: Visibility;
  currentReadiness: Readiness;
  currentEditorialAvailable: boolean;
  onSave: (data: { visibility: Visibility; readiness: Readiness; editorialAvailable: boolean }) => void;
  title?: string;
}

function RawSeedIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" fill="none" className={className} stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
      <ellipse cx="16" cy="18" rx="6" ry="8" />
      <path d="M13 12 Q14 8 16 7 Q18 8 19 12" />
      <path d="M16 26 L16 30" />
    </svg>
  );
}

function GrowingIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" fill="none" className={className} stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
      <path d="M16 30 Q16 26 16 16" />
      <path d="M16 20 Q10 14 9 11 Q8 8 10 8 Q12 8 14 14 L16 18Z" />
      <path d="M16 16 Q22 10 23 7 Q24 5 26 6 Q28 8 24 12 L16 16Z" />
      <path d="M16 14 Q15 8 16 4 Q17 2 18 4 Q19 8 17 13Z" />
    </svg>
  );
}

function ReadyIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" fill="none" className={className} stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
      <path d="M16 30 Q16 26 16 18" />
      <path d="M16 16 Q10 8 6 7 Q4 6.5 5 9 Q6 12 12 16Z" />
      <path d="M16 16 Q22 8 26 7 Q28 6.5 27 9 Q26 12 20 16Z" />
      <path d="M16 16 Q16 6 15 3 Q14 0 16 0 Q18 0 17 3 Q16 6 16 16Z" />
      <path d="M16 16 Q8 14 4 15 Q2 16 4 17 Q6 18 16 16Z" />
      <path d="M16 16 Q24 14 28 15 Q30 16 28 17 Q26 18 16 16Z" />
      <circle cx="16" cy="16" r="2.5" fill="currentColor" />
    </svg>
  );
}

const visibilityOptions: { id: Visibility; label: string; description: string; icon: React.ReactNode; color: string }[] = [
  {
    id: "personal",
    label: "Personal Garden",
    description: "Just for you. A private space to grow your words without any eyes on them.",
    icon: <Lock size={20} />,
    color: "amber",
  },
  {
    id: "circle",
    label: "Share with Circle",
    description: "Visible to your trusted circle members. A small, safe audience.",
    icon: <Users size={20} />,
    color: "violet",
  },
  {
    id: "garden",
    label: "The Garden Gallery",
    description: "Visible to all Garden members. Your work enters the shared landscape.",
    icon: <Globe size={20} />,
    color: "emerald",
  },
];

const readinessOptions: { id: Readiness; label: string; description: string; icon: React.ReactNode; color: string }[] = [
  {
    id: "raw_seed",
    label: "Raw Seed",
    description: "A fragment, a beginning, an unfinished thought. No expectations.",
    icon: <RawSeedIcon className="w-6 h-6" />,
    color: "amber",
  },
  {
    id: "growing",
    label: "Growing",
    description: "Taking shape, but still finding its form. Tender and in-progress.",
    icon: <GrowingIcon className="w-6 h-6" />,
    color: "emerald",
  },
  {
    id: "ready_to_show",
    label: "Ready to Show",
    description: "You feel complete with this piece. It's ready for eyes.",
    icon: <ReadyIcon className="w-6 h-6" />,
    color: "pink",
  },
];

const colorMap: Record<string, {
  border: string; borderActive: string; text: string; bg: string; glow: string; ring: string;
}> = {
  amber: {
    border: "border-amber-500/10", borderActive: "border-amber-500/40",
    text: "text-amber-400", bg: "bg-amber-500/5", glow: "rgba(245, 158, 11, 0.15)",
    ring: "ring-amber-500/20",
  },
  violet: {
    border: "border-violet-500/10", borderActive: "border-violet-500/40",
    text: "text-violet-400", bg: "bg-violet-500/5", glow: "rgba(139, 92, 246, 0.15)",
    ring: "ring-violet-500/20",
  },
  emerald: {
    border: "border-emerald-500/10", borderActive: "border-emerald-500/40",
    text: "text-emerald-400", bg: "bg-emerald-500/5", glow: "rgba(16, 185, 129, 0.15)",
    ring: "ring-emerald-500/20",
  },
  pink: {
    border: "border-pink-500/10", borderActive: "border-pink-500/40",
    text: "text-pink-400", bg: "bg-pink-500/5", glow: "rgba(236, 72, 153, 0.15)",
    ring: "ring-pink-500/20",
  },
};

export default function PlantingFlow({
  isOpen, onClose, currentVisibility, currentReadiness, currentEditorialAvailable, onSave, title,
}: PlantingFlowProps) {
  const [step, setStep] = useState<"visibility" | "readiness" | "confirm">("visibility");
  const [visibility, setVisibility] = useState<Visibility>(currentVisibility);
  const [readiness, setReadiness] = useState<Readiness>(currentReadiness);
  const [editorialAvailable, setEditorialAvailable] = useState(currentEditorialAvailable);

  useEffect(() => {
    if (isOpen) {
      setVisibility(currentVisibility);
      setReadiness(currentReadiness);
      setEditorialAvailable(currentEditorialAvailable);
      setStep("visibility");
    }
  }, [isOpen, currentVisibility, currentReadiness, currentEditorialAvailable]);

  function handleConfirm() {
    onSave({ visibility, readiness, editorialAvailable });
    onClose();
  }

  const selectedVisibility = visibilityOptions.find(v => v.id === visibility)!;
  const selectedReadiness = readinessOptions.find(r => r.id === readiness)!;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-md"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed inset-x-4 top-[10%] md:inset-x-auto md:left-1/2 md:-translate-x-1/2 md:w-full md:max-w-lg z-[101] max-h-[80vh] overflow-y-auto"
          >
            <div className="bg-[#0a0f18]/95 backdrop-blur-2xl border border-white/[0.08] rounded-2xl overflow-hidden shadow-2xl shadow-black/40">
              <div className="p-6 pb-4 border-b border-white/[0.06] flex items-center justify-between">
                <div>
                  <p className="font-mono text-[9px] tracking-[0.3em] uppercase text-white/25 mb-1">
                    {step === "visibility" ? "Step 1 of 3 — Where" : step === "readiness" ? "Step 2 of 3 — How Ready" : "Step 3 of 3 — Confirm"}
                  </p>
                  <h2 className="text-xl font-display font-light italic text-white/85">
                    {step === "visibility" ? "Where should this live?" : step === "readiness" ? "How does it feel?" : "Plant this piece"}
                  </h2>
                  {title && (
                    <p className="text-sm font-serif text-white/30 mt-1 truncate">{title}</p>
                  )}
                </div>
                <button
                  onClick={onClose}
                  className="p-2 text-white/25 hover:text-white/60 transition-colors rounded-lg hover:bg-white/[0.05]"
                  data-testid="button-close-planting"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="p-6">
                <AnimatePresence mode="wait">
                  {step === "visibility" && (
                    <motion.div
                      key="visibility"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ duration: 0.25 }}
                      className="space-y-3"
                    >
                      {visibilityOptions.map((opt) => {
                        const isSelected = visibility === opt.id;
                        const colors = colorMap[opt.color];
                        return (
                          <motion.button
                            key={opt.id}
                            onClick={() => setVisibility(opt.id)}
                            whileHover={{ scale: 1.01, y: -1 }}
                            whileTap={{ scale: 0.995 }}
                            className={`w-full text-left rounded-xl border p-5 transition-all duration-300 group ${
                              isSelected
                                ? `${colors.borderActive} ${colors.bg}`
                                : `${colors.border} bg-white/[0.01] hover:bg-white/[0.03]`
                            }`}
                            style={isSelected ? { boxShadow: `0 0 30px ${colors.glow}` } : {}}
                            data-testid={`planting-visibility-${opt.id}`}
                          >
                            <div className="flex items-start gap-4">
                              <div className={`flex-shrink-0 w-10 h-10 rounded-full border ${isSelected ? colors.borderActive : colors.border} flex items-center justify-center ${colors.text} ${isSelected ? "opacity-100" : "opacity-40 group-hover:opacity-70"} transition-opacity`}>
                                {opt.icon}
                              </div>
                              <div className="flex-grow min-w-0">
                                <h3 className={`text-base font-display font-light ${isSelected ? "text-white/90" : "text-white/60 group-hover:text-white/80"} transition-colors`}>
                                  {opt.label}
                                </h3>
                                <p className={`text-sm font-serif mt-1 leading-relaxed ${isSelected ? "text-white/45" : "text-white/25"} transition-colors`}>
                                  {opt.description}
                                </p>
                              </div>
                              {isSelected && (
                                <motion.div
                                  initial={{ scale: 0 }}
                                  animate={{ scale: 1 }}
                                  className={`flex-shrink-0 w-5 h-5 rounded-full ${colors.bg} border ${colors.borderActive} flex items-center justify-center mt-0.5`}
                                >
                                  <div className={`w-2 h-2 rounded-full bg-current ${colors.text}`} />
                                </motion.div>
                              )}
                            </div>
                          </motion.button>
                        );
                      })}

                      <div className="pt-4 flex justify-end">
                        <motion.button
                          onClick={() => setStep("readiness")}
                          whileHover={{ scale: 1.03 }}
                          whileTap={{ scale: 0.97 }}
                          className="flex items-center gap-2 px-6 py-2.5 bg-white/[0.06] hover:bg-white/[0.1] border border-white/10 hover:border-white/20 rounded-full font-mono text-[10px] uppercase tracking-widest text-white/60 hover:text-white transition-all group"
                          data-testid="button-next-readiness"
                        >
                          Continue
                          <ChevronRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
                        </motion.button>
                      </div>
                    </motion.div>
                  )}

                  {step === "readiness" && (
                    <motion.div
                      key="readiness"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ duration: 0.25 }}
                      className="space-y-3"
                    >
                      {readinessOptions.map((opt) => {
                        const isSelected = readiness === opt.id;
                        const colors = colorMap[opt.color];
                        return (
                          <motion.button
                            key={opt.id}
                            onClick={() => setReadiness(opt.id)}
                            whileHover={{ scale: 1.01, y: -1 }}
                            whileTap={{ scale: 0.995 }}
                            className={`w-full text-left rounded-xl border p-5 transition-all duration-300 group ${
                              isSelected
                                ? `${colors.borderActive} ${colors.bg}`
                                : `${colors.border} bg-white/[0.01] hover:bg-white/[0.03]`
                            }`}
                            style={isSelected ? { boxShadow: `0 0 30px ${colors.glow}` } : {}}
                            data-testid={`planting-readiness-${opt.id}`}
                          >
                            <div className="flex items-start gap-4">
                              <div className={`flex-shrink-0 w-10 h-10 rounded-full border ${isSelected ? colors.borderActive : colors.border} flex items-center justify-center ${colors.text} ${isSelected ? "opacity-100" : "opacity-40 group-hover:opacity-70"} transition-opacity`}>
                                {opt.icon}
                              </div>
                              <div className="flex-grow min-w-0">
                                <h3 className={`text-base font-display font-light ${isSelected ? "text-white/90" : "text-white/60 group-hover:text-white/80"} transition-colors`}>
                                  {opt.label}
                                </h3>
                                <p className={`text-sm font-serif mt-1 leading-relaxed ${isSelected ? "text-white/45" : "text-white/25"} transition-colors`}>
                                  {opt.description}
                                </p>
                              </div>
                              {isSelected && (
                                <motion.div
                                  initial={{ scale: 0 }}
                                  animate={{ scale: 1 }}
                                  className={`flex-shrink-0 w-5 h-5 rounded-full ${colors.bg} border ${colors.borderActive} flex items-center justify-center mt-0.5`}
                                >
                                  <div className={`w-2 h-2 rounded-full bg-current ${colors.text}`} />
                                </motion.div>
                              )}
                            </div>
                          </motion.button>
                        );
                      })}

                      <div className="pt-4 flex justify-between">
                        <button
                          onClick={() => setStep("visibility")}
                          className="font-mono text-[10px] uppercase tracking-widest text-white/30 hover:text-white/60 transition-colors px-3 py-2"
                          data-testid="button-back-visibility"
                        >
                          Back
                        </button>
                        <motion.button
                          onClick={() => setStep("confirm")}
                          whileHover={{ scale: 1.03 }}
                          whileTap={{ scale: 0.97 }}
                          className="flex items-center gap-2 px-6 py-2.5 bg-white/[0.06] hover:bg-white/[0.1] border border-white/10 hover:border-white/20 rounded-full font-mono text-[10px] uppercase tracking-widest text-white/60 hover:text-white transition-all group"
                          data-testid="button-next-confirm"
                        >
                          Continue
                          <ChevronRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
                        </motion.button>
                      </div>
                    </motion.div>
                  )}

                  {step === "confirm" && (
                    <motion.div
                      key="confirm"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ duration: 0.25 }}
                      className="space-y-6"
                    >
                      <div className="space-y-3">
                        <div className={`rounded-xl border p-4 ${colorMap[selectedVisibility.color].border} ${colorMap[selectedVisibility.color].bg}`}>
                          <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-full border ${colorMap[selectedVisibility.color].borderActive} flex items-center justify-center ${colorMap[selectedVisibility.color].text}`}>
                              {selectedVisibility.icon}
                            </div>
                            <div>
                              <p className="font-mono text-[9px] tracking-widest text-white/25 uppercase">Destination</p>
                              <p className="text-sm font-display text-white/80">{selectedVisibility.label}</p>
                            </div>
                          </div>
                        </div>

                        <div className={`rounded-xl border p-4 ${colorMap[selectedReadiness.color].border} ${colorMap[selectedReadiness.color].bg}`}>
                          <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-full border ${colorMap[selectedReadiness.color].borderActive} flex items-center justify-center ${colorMap[selectedReadiness.color].text}`}>
                              {selectedReadiness.icon}
                            </div>
                            <div>
                              <p className="font-mono text-[9px] tracking-widest text-white/25 uppercase">Readiness</p>
                              <p className="text-sm font-display text-white/80">{selectedReadiness.label}</p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {(visibility === "garden" || visibility === "circle") && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-5"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center text-white/30">
                                {editorialAvailable ? <Eye size={16} /> : <EyeOff size={16} />}
                              </div>
                              <div>
                                <p className="text-sm font-serif text-white/70">Available for editorial consideration</p>
                                <p className="text-xs font-serif text-white/30 mt-0.5">
                                  Let editors know this piece is open to being featured on The Page
                                </p>
                              </div>
                            </div>
                            <button
                              onClick={() => setEditorialAvailable(!editorialAvailable)}
                              className={`relative w-12 h-6 rounded-full transition-all duration-300 ${
                                editorialAvailable
                                  ? "bg-emerald-500/30 border border-emerald-500/50"
                                  : "bg-white/[0.06] border border-white/10"
                              }`}
                              data-testid="toggle-editorial"
                            >
                              <motion.div
                                animate={{ x: editorialAvailable ? 24 : 2 }}
                                transition={{ type: "spring", stiffness: 500, damping: 30 }}
                                className={`absolute top-1 w-4 h-4 rounded-full transition-colors ${
                                  editorialAvailable ? "bg-emerald-400" : "bg-white/30"
                                }`}
                              />
                            </button>
                          </div>
                        </motion.div>
                      )}

                      {visibility === "personal" && (
                        <div className="rounded-xl border border-white/[0.04] bg-white/[0.01] p-4">
                          <p className="text-xs font-serif text-white/25 italic leading-relaxed text-center">
                            This piece will stay in your private garden. You can always change where it lives later.
                          </p>
                        </div>
                      )}

                      <div className="pt-2 flex justify-between">
                        <button
                          onClick={() => setStep("readiness")}
                          className="font-mono text-[10px] uppercase tracking-widest text-white/30 hover:text-white/60 transition-colors px-3 py-2"
                          data-testid="button-back-readiness"
                        >
                          Back
                        </button>
                        <motion.button
                          onClick={handleConfirm}
                          whileHover={{ scale: 1.05, boxShadow: `0 0 40px ${colorMap[selectedVisibility.color].glow}` }}
                          whileTap={{ scale: 0.97 }}
                          className={`flex items-center gap-2 px-8 py-3 ${colorMap[selectedVisibility.color].bg} border ${colorMap[selectedVisibility.color].borderActive} rounded-full font-mono text-[10px] uppercase tracking-widest ${colorMap[selectedVisibility.color].text} hover:text-white transition-all group`}
                          data-testid="button-plant-confirm"
                        >
                          <Sparkles size={14} className="group-hover:rotate-12 transition-transform" />
                          {visibility === "personal" ? "Save to Garden" : visibility === "circle" ? "Share with Circle" : "Plant in Gallery"}
                        </motion.button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div className="px-6 pb-5">
                <div className="flex gap-1.5 justify-center">
                  {["visibility", "readiness", "confirm"].map((s, i) => (
                    <div
                      key={s}
                      className={`h-1 rounded-full transition-all duration-500 ${
                        s === step ? "w-8 bg-white/30" : i < ["visibility", "readiness", "confirm"].indexOf(step) ? "w-4 bg-white/15" : "w-4 bg-white/5"
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

export function VisibilityBadge({ visibility, readiness, editorialAvailable, compact }: {
  visibility: string;
  readiness: string;
  editorialAvailable?: boolean;
  compact?: boolean;
}) {
  const visConfig: Record<string, { label: string; icon: React.ReactNode; color: string }> = {
    personal: { label: "Personal", icon: <Lock size={compact ? 10 : 12} />, color: "amber" },
    circle: { label: "Circle", icon: <Users size={compact ? 10 : 12} />, color: "violet" },
    garden: { label: "Gallery", icon: <Globe size={compact ? 10 : 12} />, color: "emerald" },
  };

  const readConfig: Record<string, { label: string; color: string }> = {
    raw_seed: { label: "Raw Seed", color: "amber" },
    growing: { label: "Growing", color: "emerald" },
    ready_to_show: { label: "Ready", color: "pink" },
  };

  const vis = visConfig[visibility] || visConfig.personal;
  const read = readConfig[readiness] || readConfig.raw_seed;
  const visColors = colorMap[vis.color];
  const readColors = colorMap[read.color];

  if (compact) {
    return (
      <div className="flex items-center gap-1.5">
        <span className={`inline-flex items-center gap-1 ${visColors.text} opacity-60`}>
          {vis.icon}
        </span>
        {editorialAvailable && (
          <span className="text-emerald-400/40">
            <Eye size={10} />
          </span>
        )}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border ${visColors.border} ${visColors.bg} font-mono text-[9px] tracking-widest uppercase ${visColors.text}`}>
        {vis.icon}
        {vis.label}
      </span>
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border ${readColors.border} ${readColors.bg} font-mono text-[9px] tracking-widest uppercase ${readColors.text}`}>
        {read.label}
      </span>
      {editorialAvailable && (
        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full border border-emerald-500/10 bg-emerald-500/5 font-mono text-[9px] tracking-widest uppercase text-emerald-400/60">
          <Eye size={10} />
        </span>
      )}
    </div>
  );
}
