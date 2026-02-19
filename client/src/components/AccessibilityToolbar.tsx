import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Accessibility, X, Eye, Monitor, Contrast, Palette, Type,
  Link2, MousePointer2, AlignLeft, Keyboard, Pause, Target,
  BookOpen, Space, MoveHorizontal, LetterText, ImageOff,
  Focus, RotateCcw, Volume2, Info, Sun, Moon, ScanLine, FileText
} from "lucide-react";

const A11Y_STORAGE_KEY = "pgj-accessibility-settings";
const A11Y_FIRST_VISIT_KEY = "pgj-a11y-first-visit";

interface A11ySettings {
  highContrast: boolean;
  lightMode: boolean;
  invertedColors: boolean;
  grayscale: boolean;
  largeText: boolean;
  extraLargeText: boolean;
  highlightLinks: boolean;
  largeCursor: boolean;
  readingGuide: boolean;
  keyboardNav: boolean;
  stopAnimations: boolean;
  bigClickTargets: boolean;
  dyslexiaFont: boolean;
  letterSpacing: boolean;
  wordSpacing: boolean;
  lineHeight: boolean;
  hideImages: boolean;
  focusMode: boolean;
  textAlignLeft: boolean;
  plainMode: boolean;
  screenReaderOptimized: boolean;
  tooltipOnHover: boolean;
}

const defaultSettings: A11ySettings = {
  highContrast: false,
  lightMode: false,
  invertedColors: false,
  grayscale: false,
  largeText: false,
  extraLargeText: false,
  highlightLinks: false,
  largeCursor: false,
  readingGuide: false,
  keyboardNav: false,
  stopAnimations: false,
  bigClickTargets: false,
  dyslexiaFont: false,
  letterSpacing: false,
  wordSpacing: false,
  lineHeight: false,
  hideImages: false,
  focusMode: false,
  textAlignLeft: false,
  plainMode: false,
  screenReaderOptimized: false,
  tooltipOnHover: false,
};

function loadSettings(): A11ySettings {
  try {
    const stored = localStorage.getItem(A11Y_STORAGE_KEY);
    if (stored) {
      return { ...defaultSettings, ...JSON.parse(stored) };
    }
  } catch {}
  return { ...defaultSettings };
}

function saveSettings(settings: A11ySettings) {
  try {
    localStorage.setItem(A11Y_STORAGE_KEY, JSON.stringify(settings));
  } catch {}
}

function applySettings(settings: A11ySettings) {
  const root = document.documentElement;
  const classMap: Record<keyof A11ySettings, string> = {
    highContrast: "a11y-high-contrast",
    lightMode: "a11y-light-mode",
    invertedColors: "a11y-inverted",
    grayscale: "a11y-grayscale",
    largeText: "a11y-large-text",
    extraLargeText: "a11y-extra-large-text",
    highlightLinks: "a11y-highlight-links",
    largeCursor: "a11y-large-cursor",
    readingGuide: "a11y-reading-guide",
    keyboardNav: "a11y-keyboard-nav",
    stopAnimations: "a11y-stop-animations",
    bigClickTargets: "a11y-big-targets",
    dyslexiaFont: "a11y-dyslexia-font",
    letterSpacing: "a11y-letter-spacing",
    wordSpacing: "a11y-word-spacing",
    lineHeight: "a11y-line-height",
    hideImages: "a11y-hide-images",
    focusMode: "a11y-focus-mode",
    textAlignLeft: "a11y-text-left",
    plainMode: "a11y-plain-mode",
    screenReaderOptimized: "a11y-screen-reader",
    tooltipOnHover: "a11y-tooltip-hover",
  };

  for (const [key, className] of Object.entries(classMap)) {
    if (settings[key as keyof A11ySettings]) {
      root.classList.add(className);
    } else {
      root.classList.remove(className);
    }
  }
}

interface ToggleItem {
  key: keyof A11ySettings;
  label: string;
  icon: React.ReactNode;
  description: string;
}

const visionItems: ToggleItem[] = [
  { key: "highContrast", label: "High Contrast", icon: <Contrast size={16} />, description: "Increase contrast across the site" },
  { key: "lightMode", label: "Light Mode", icon: <Sun size={16} />, description: "Switch to light theme" },
  { key: "invertedColors", label: "Invert Colors", icon: <Palette size={16} />, description: "Invert all colors on the page" },
  { key: "grayscale", label: "Grayscale", icon: <Eye size={16} />, description: "Remove all color" },
  { key: "largeText", label: "Large Text (+25%)", icon: <Type size={16} />, description: "Increase text size by 25%" },
  { key: "extraLargeText", label: "Extra Large Text (+50%)", icon: <Type size={16} />, description: "Increase text size by 50%" },
  { key: "highlightLinks", label: "Highlight Links", icon: <Link2 size={16} />, description: "Underline and highlight all links" },
  { key: "largeCursor", label: "Large Cursor", icon: <MousePointer2 size={16} />, description: "Make the cursor larger" },
  { key: "readingGuide", label: "Reading Guide", icon: <ScanLine size={16} />, description: "Horizontal bar follows your cursor" },
  { key: "plainMode", label: "Plain Mode", icon: <FileText size={16} />, description: "Strip all decoration for a clean reading view" },
];

const motorItems: ToggleItem[] = [
  { key: "keyboardNav", label: "Keyboard Navigation", icon: <Keyboard size={16} />, description: "Enhanced focus indicators for tab navigation" },
  { key: "stopAnimations", label: "Stop Animations", icon: <Pause size={16} />, description: "Pause all animations and transitions" },
  { key: "bigClickTargets", label: "Big Click Targets", icon: <Target size={16} />, description: "Increase padding on interactive elements" },
];

const cognitiveItems: ToggleItem[] = [
  { key: "dyslexiaFont", label: "Dyslexia-Friendly Font", icon: <BookOpen size={16} />, description: "Switch to a dyslexia-friendly typeface" },
  { key: "letterSpacing", label: "Letter Spacing", icon: <LetterText size={16} />, description: "Increase spacing between letters" },
  { key: "wordSpacing", label: "Word Spacing", icon: <MoveHorizontal size={16} />, description: "Increase spacing between words" },
  { key: "lineHeight", label: "Line Height", icon: <Space size={16} />, description: "Increase line spacing for easier reading" },
  { key: "hideImages", label: "Hide Images", icon: <ImageOff size={16} />, description: "Hide decorative images" },
  { key: "focusMode", label: "Focus Mode", icon: <Focus size={16} />, description: "Show only main content" },
  { key: "textAlignLeft", label: "Align Text Left", icon: <AlignLeft size={16} />, description: "Force all text to left-align" },
];

const audioItems: ToggleItem[] = [
  { key: "screenReaderOptimized", label: "Screen Reader Mode", icon: <Volume2 size={16} />, description: "Improve semantic structure and aria labels" },
  { key: "tooltipOnHover", label: "Tooltip on Hover", icon: <Info size={16} />, description: "Show descriptions when hovering elements" },
];

export default function AccessibilityToolbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [settings, setSettings] = useState<A11ySettings>(loadSettings);
  const [showPulse, setShowPulse] = useState(false);
  const [readingGuideY, setReadingGuideY] = useState(0);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      const visited = localStorage.getItem(A11Y_FIRST_VISIT_KEY);
      if (!visited) {
        setShowPulse(true);
        localStorage.setItem(A11Y_FIRST_VISIT_KEY, "true");
      }
    } catch {}
  }, []);

  useEffect(() => {
    applySettings(settings);
    saveSettings(settings);
  }, [settings]);

  useEffect(() => {
    const initial = loadSettings();
    applySettings(initial);
  }, []);

  useEffect(() => {
    if (!settings.readingGuide) return;
    const handleMouse = (e: MouseEvent) => setReadingGuideY(e.clientY);
    window.addEventListener("mousemove", handleMouse);
    return () => window.removeEventListener("mousemove", handleMouse);
  }, [settings.readingGuide]);

  useEffect(() => {
    if (!isOpen) return;
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false);
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [isOpen]);

  const toggle = useCallback((key: keyof A11ySettings) => {
    setSettings(prev => {
      const next = { ...prev, [key]: !prev[key] };
      if (key === "largeText" && next.largeText) next.extraLargeText = false;
      if (key === "extraLargeText" && next.extraLargeText) next.largeText = false;
      return next;
    });
  }, []);

  const resetAll = useCallback(() => {
    setSettings({ ...defaultSettings });
  }, []);

  const activeCount = Object.values(settings).filter(Boolean).length;

  return (
    <>
      {settings.readingGuide && (
        <div
          className="fixed left-0 right-0 h-10 pointer-events-none z-[9998] transition-transform duration-75"
          style={{ top: readingGuideY - 20 }}
          aria-hidden="true"
        >
          <div className="w-full h-full bg-amber-400/10 border-y border-amber-400/20" />
        </div>
      )}

      <button
        onClick={() => { setIsOpen(true); setShowPulse(false); }}
        className="fixed bottom-6 right-6 z-[9999] w-14 h-14 rounded-full bg-[#1a2a3a] border border-white/15 shadow-lg shadow-black/30 flex items-center justify-center text-white/70 hover:text-white hover:bg-[#243a4d] hover:border-white/25 transition-all duration-300 group"
        aria-label="Open accessibility settings"
        data-testid="button-accessibility-open"
      >
        <Accessibility size={24} />
        {activeCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-amber-500 text-[10px] font-mono font-bold text-white flex items-center justify-center">
            {activeCount}
          </span>
        )}
        {showPulse && activeCount === 0 && (
          <span className="absolute inset-0 rounded-full border-2 border-amber-400/50 animate-ping" />
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-[10000] bg-black/50 backdrop-blur-sm"
              onClick={() => setIsOpen(false)}
              aria-hidden="true"
            />

            <motion.div
              ref={panelRef}
              initial={{ x: "100%", opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: "100%", opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="fixed top-0 right-0 bottom-0 z-[10001] w-full max-w-[400px] bg-[#0c1520] border-l border-white/10 shadow-2xl shadow-black/50 flex flex-col overflow-hidden"
              role="dialog"
              aria-label="Accessibility Settings"
              aria-modal="true"
            >
              <div className="flex items-center justify-between px-6 py-5 border-b border-white/[0.08] shrink-0">
                <div className="flex items-center gap-3">
                  <Accessibility size={20} className="text-amber-400/70" />
                  <h2 className="font-display text-xl italic text-white/90">Accessibility</h2>
                  {activeCount > 0 && (
                    <span className="text-[10px] font-mono text-amber-400/70 px-2 py-0.5 rounded-full border border-amber-400/20 bg-amber-400/10">
                      {activeCount} active
                    </span>
                  )}
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 rounded-lg text-white/30 hover:text-white/70 hover:bg-white/[0.06] transition-all"
                  aria-label="Close accessibility settings"
                  data-testid="button-accessibility-close"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto px-5 py-4 space-y-6 scrollbar-thin scrollbar-thumb-white/5">
                <SettingsGroup title="Vision" items={visionItems} settings={settings} onToggle={toggle} />
                <SettingsGroup title="Motor & Navigation" items={motorItems} settings={settings} onToggle={toggle} />
                <SettingsGroup title="Cognitive" items={cognitiveItems} settings={settings} onToggle={toggle} />
                <SettingsGroup title="Audio & Screen Reader" items={audioItems} settings={settings} onToggle={toggle} />
              </div>

              <div className="px-5 py-4 border-t border-white/[0.08] shrink-0">
                <button
                  onClick={resetAll}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-full border border-white/[0.1] bg-white/[0.03] text-white/50 hover:text-white/80 hover:bg-white/[0.06] font-mono text-[11px] uppercase tracking-widest transition-all"
                  data-testid="button-accessibility-reset"
                >
                  <RotateCcw size={14} />
                  Reset All Settings
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

function SettingsGroup({ title, items, settings, onToggle }: {
  title: string;
  items: ToggleItem[];
  settings: A11ySettings;
  onToggle: (key: keyof A11ySettings) => void;
}) {
  return (
    <div className="space-y-2" role="group" aria-label={`${title} settings`}>
      <h3 className="font-mono text-[9px] uppercase tracking-[0.25em] text-white/25 px-1 pb-1">{title}</h3>
      <div className="space-y-1">
        {items.map(item => {
          const isActive = settings[item.key];
          return (
            <button
              key={item.key}
              onClick={() => onToggle(item.key)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all duration-200 group ${
                isActive
                  ? "bg-amber-500/10 border border-amber-500/20 text-white/90"
                  : "border border-transparent text-white/50 hover:text-white/75 hover:bg-white/[0.03]"
              }`}
              role="switch"
              aria-checked={isActive}
              aria-label={`${item.label}: ${isActive ? "on" : "off"}`}
              data-testid={`toggle-${item.key}`}
            >
              <span className={`shrink-0 transition-colors ${isActive ? "text-amber-400/80" : "text-white/25 group-hover:text-white/40"}`}>
                {item.icon}
              </span>
              <div className="flex-1 min-w-0">
                <span className="text-[13px] font-serif block">{item.label}</span>
                <span className={`text-[10px] font-mono block mt-0.5 ${isActive ? "text-amber-200/40" : "text-white/20"}`}>
                  {item.description}
                </span>
              </div>
              <div className={`w-9 h-5 rounded-full shrink-0 relative transition-colors duration-200 ${
                isActive ? "bg-amber-500/40" : "bg-white/10"
              }`}>
                <div className={`absolute top-0.5 w-4 h-4 rounded-full transition-all duration-200 ${
                  isActive ? "left-[18px] bg-amber-400" : "left-0.5 bg-white/30"
                }`} />
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
