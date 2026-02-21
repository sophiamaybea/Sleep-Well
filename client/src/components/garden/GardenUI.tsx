import { useState, useEffect, type ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles } from "lucide-react";

export function timeAgo(date: string | Date | null | undefined) {
  if (!date) return "";
  const d = new Date(date);
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `${days}d ago`;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function AnimatedCounter({ target, duration = 1.5, delay = 0 }: { target: number; duration?: number; delay?: number }) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (target === 0) return;
    const timer = setTimeout(() => {
      let start = 0;
      const step = Math.max(1, Math.ceil(target / (duration * 60)));
      const interval = setInterval(() => {
        start += step;
        if (start >= target) {
          setCount(target);
          clearInterval(interval);
        } else {
          setCount(start);
        }
      }, 1000 / 60);
      return () => clearInterval(interval);
    }, delay * 1000);
    return () => clearTimeout(timer);
  }, [target, duration, delay]);
  return <>{count.toLocaleString()}</>;
}

export async function apiFetch(url: string, options?: RequestInit) {
  const res = await fetch(url, { credentials: "include", ...options });
  if (!res.ok) throw new Error(`Request failed: ${res.status}`);
  return res.json();
}

export function GlassCard({
  children,
  className = "",
  hoverGlow,
  onClick,
  "data-testid": testId,
}: {
  children: ReactNode;
  className?: string;
  hoverGlow?: string;
  onClick?: () => void;
  "data-testid"?: string;
}) {
  return (
    <motion.div
      whileHover={onClick ? { scale: 1.01, y: -2 } : undefined}
      className={`relative rounded-2xl border border-white/[0.06] backdrop-blur-sm overflow-hidden transition-all duration-300 hover:border-white/[0.12] ${className}`}
      style={{
        background: "linear-gradient(135deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%)",
      }}
      onClick={onClick}
      data-testid={testId}
    >
      {hoverGlow && (
        <div
          className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity duration-500 pointer-events-none"
          style={{
            background: `radial-gradient(ellipse at 50% 0%, ${hoverGlow} 0%, transparent 70%)`,
          }}
        />
      )}
      <div className="relative z-10">{children}</div>
    </motion.div>
  );
}

export function PageHeader({
  icon,
  label,
  title,
  subtitle,
  accentColor = "white",
  action,
  "data-testid": testId,
}: {
  icon?: ReactNode;
  label?: string;
  title: string;
  subtitle?: string;
  accentColor?: string;
  action?: ReactNode;
  "data-testid"?: string;
}) {
  const colorMap: Record<string, string> = {
    amber: "text-amber-400/60",
    emerald: "text-emerald-400/60",
    pink: "text-pink-400/60",
    purple: "text-purple-400/60",
    blue: "text-blue-400/60",
    sky: "text-sky-400/60",
    violet: "text-violet-400/60",
    indigo: "text-indigo-400/60",
    white: "text-white/25",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      className="mb-10"
    >
      {(icon || label) && (
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="flex items-center gap-3 mb-3"
        >
          {icon && <span className={colorMap[accentColor] || colorMap.white}>{icon}</span>}
          {label && (
            <span className="font-mono text-[10px] tracking-[0.3em] uppercase text-white/25">{label}</span>
          )}
        </motion.div>
      )}
      <div className="flex items-end justify-between gap-6 flex-wrap">
        <div>
          <h1
            className="text-3xl md:text-5xl font-display font-light tracking-normal italic text-white/90 mb-2"
            data-testid={testId}
          >
            {title}
          </h1>
          {subtitle && (
            <p className="text-base font-serif text-white/30 max-w-xl leading-relaxed">{subtitle}</p>
          )}
        </div>
        {action && (
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3 }}>
            {action}
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}

export function ActionButton({
  children,
  onClick,
  disabled,
  variant = "default",
  size = "md",
  icon,
  "data-testid": testId,
}: {
  children: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  variant?: "default" | "accent" | "ghost" | "danger";
  size?: "sm" | "md";
  icon?: ReactNode;
  "data-testid"?: string;
}) {
  const variants: Record<string, string> = {
    default: "bg-white/[0.04] hover:bg-white/[0.08] border-white/[0.08] hover:border-white/[0.15] text-white/60 hover:text-white",
    accent: "bg-white/[0.06] hover:bg-white/[0.1] border-white/10 hover:border-amber-500/30 text-white/60 hover:text-white",
    ghost: "border-white/[0.06] text-white/30 hover:text-white/60 hover:border-white/15",
    danger: "border-white/[0.06] text-white/30 hover:text-red-400/70 hover:border-red-500/20",
  };

  const sizes = {
    sm: "px-3 py-1.5 text-[9px]",
    md: "px-5 py-2.5 text-[10px]",
  };

  return (
    <motion.button
      onClick={onClick}
      disabled={disabled}
      whileHover={{ scale: 1.04 }}
      whileTap={{ scale: 0.97 }}
      className={`inline-flex items-center gap-2 rounded-full border font-mono uppercase tracking-widest transition-all disabled:opacity-30 disabled:cursor-not-allowed ${variants[variant]} ${sizes[size]}`}
      data-testid={testId}
    >
      {icon}
      {children}
    </motion.button>
  );
}

export function LoadingSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: i * 0.1 }}
          className="rounded-2xl border border-white/[0.04] p-6"
        >
          <div className="space-y-3">
            <div className="h-4 w-1/3 bg-white/[0.04] rounded-full animate-pulse" />
            <div className="h-3 w-2/3 bg-white/[0.03] rounded-full animate-pulse" />
            <div className="h-3 w-1/2 bg-white/[0.02] rounded-full animate-pulse" />
          </div>
        </motion.div>
      ))}
    </div>
  );
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  "data-testid": testId,
}: {
  icon: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
  "data-testid"?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3, duration: 0.6 }}
      className="relative border border-dashed border-white/[0.08] rounded-2xl p-16 md:p-20 text-center overflow-hidden"
      data-testid={testId}
    >
      <div className="absolute inset-0 pointer-events-none" style={{
        background: "radial-gradient(ellipse at 50% 30%, rgba(255,255,255,0.02) 0%, transparent 60%)",
      }} />
      <div className="relative z-10">
        <motion.div
          animate={{ y: [0, -6, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          className="inline-flex mb-6 text-white/15"
        >
          {icon}
        </motion.div>
        <h3 className="text-xl md:text-2xl font-display font-light italic text-white/50 mb-3">{title}</h3>
        {description && (
          <p className="font-serif text-sm text-white/25 max-w-md mx-auto leading-relaxed">{description}</p>
        )}
        {action && <div className="mt-8">{action}</div>}
      </div>
    </motion.div>
  );
}

export function TabGroup({
  tabs,
  active,
  onChange,
  "data-testid": testId,
}: {
  tabs: { id: string; label: string }[];
  active: string;
  onChange: (id: string) => void;
  "data-testid"?: string;
}) {
  return (
    <div
      className="inline-flex gap-1 p-1 rounded-xl border border-white/[0.06]"
      style={{ background: "rgba(255,255,255,0.015)" }}
      data-testid={testId}
    >
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className={`relative px-4 py-2 rounded-lg font-mono text-[10px] uppercase tracking-widest transition-all ${
            active === tab.id ? "text-white/85" : "text-white/30 hover:text-white/55"
          }`}
          data-testid={`tab-${tab.id}`}
        >
          {active === tab.id && (
            <motion.div
              layoutId="activeTab"
              className="absolute inset-0 rounded-lg bg-white/[0.08] border border-white/[0.08]"
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
            />
          )}
          <span className="relative z-10">{tab.label}</span>
        </button>
      ))}
    </div>
  );
}

export function FormField({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div>
      <label className="font-mono text-[10px] tracking-widest uppercase text-white/25 block mb-2">{label}</label>
      {children}
    </div>
  );
}

export const inputClass = "w-full bg-white/[0.03] border border-white/[0.06] rounded-xl px-4 py-3 text-sm font-serif text-white/70 placeholder:text-white/20 focus:outline-none focus:border-white/[0.15] focus:bg-white/[0.04] transition-all";

export const textareaClass = `${inputClass} resize-none`;

export function StaggeredList({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={{
        hidden: {},
        visible: { transition: { staggerChildren: 0.04 } },
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function StaggeredItem({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 12 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function Toast({ message, type = "success", onClose }: { message: string; type?: "success" | "error"; onClose: () => void }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 40, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.95 }}
      className={`fixed bottom-6 right-6 z-[100] px-5 py-3 rounded-xl border backdrop-blur-xl font-mono text-xs tracking-wider ${
        type === "success"
          ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-300"
          : "border-red-500/20 bg-red-500/10 text-red-300"
      }`}
    >
      {message}
    </motion.div>
  );
}

export function ProgressRing({ progress, size = 120, strokeWidth = 4, color = "rgba(255,255,255,0.6)" }: {
  progress: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - Math.min(1, Math.max(0, progress)));

  return (
    <svg width={size} height={size} className="transform -rotate-90">
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="rgba(255,255,255,0.06)"
        strokeWidth={strokeWidth}
      />
      <motion.circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeDasharray={circumference}
        animate={{ strokeDashoffset }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      />
    </svg>
  );
}

export function Badge({ children, color = "white" }: { children: ReactNode; color?: string }) {
  const colorMap: Record<string, string> = {
    amber: "border-amber-500/20 bg-amber-500/10 text-amber-400/80",
    emerald: "border-emerald-500/20 bg-emerald-500/10 text-emerald-400/80",
    pink: "border-pink-500/20 bg-pink-500/10 text-pink-400/80",
    purple: "border-purple-500/20 bg-purple-500/10 text-purple-400/80",
    blue: "border-blue-500/20 bg-blue-500/10 text-blue-400/80",
    red: "border-red-500/20 bg-red-500/10 text-red-400/80",
    white: "border-white/10 bg-white/[0.04] text-white/50",
  };

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border font-mono text-[9px] uppercase tracking-widest ${colorMap[color] || colorMap.white}`}>
      {children}
    </span>
  );
}
