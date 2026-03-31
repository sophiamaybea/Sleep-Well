// Garden utility functions and style constants
import { stripHtml } from "@/components/garden/RichEditor";

// ── Stage style maps ─────────────────────────────────────────────────────────
export const stageColors: Record<string, string> = {
  raw_seed: "border-amber-500/30 text-amber-400/80",
  growing: "border-emerald-500/30 text-emerald-400/80",
  ready_to_show: "border-pink-500/30 text-pink-400/80",
  dormant: "border-violet-500/30 text-violet-400/80",
};

export const stageAccent: Record<string, string> = {
  raw_seed: "bg-amber-500/10",
  growing: "bg-emerald-500/10",
  ready_to_show: "bg-pink-500/10",
  dormant: "bg-violet-500/10",
};

export const stageGlow: Record<string, string> = {
  raw_seed: "rgba(245, 158, 11, 0.15)",
  growing: "rgba(16, 185, 129, 0.15)",
  ready_to_show: "rgba(236, 72, 153, 0.15)",
  dormant: "rgba(139, 92, 246, 0.15)",
};

export const stageCardBg: Record<string, string> = {
  raw_seed: "bg-gradient-to-br from-amber-950/15 via-emerald-950/10 to-emerald-950/8",
  growing: "bg-gradient-to-br from-emerald-950/15 via-teal-950/12 to-emerald-950/8",
  ready_to_show: "bg-gradient-to-br from-pink-950/12 via-emerald-950/10 to-amber-950/8",
  dormant: "bg-gradient-to-br from-violet-950/10 via-slate-950/10 to-emerald-950/8",
};

export const stageCardBorder: Record<string, string> = {
  raw_seed: "border-amber-800/20 hover:border-amber-600/30",
  growing: "border-emerald-800/20 hover:border-emerald-600/30",
  ready_to_show: "border-pink-800/20 hover:border-pink-600/30",
  dormant: "border-violet-800/15 hover:border-violet-600/20",
};

// ── Genre options ─────────────────────────────────────────────────────────────
export const genreOptions = ["poetry", "fiction", "essay", "fragment", "other"];

// ── Types ────────────────────────────────────────────────────────────────────
export type Zone = "desk" | "reading-room" | "greenhouse" | "submissions" | "garden-gate" | "collections" | "studio";
export type ActiveRoom = "tables" | "workshop" | "swap" | "the-desk" | "first-reader" | "shelf" | null;
export type GreenhouseTool = "freewrite" | "growth-journal" | "circles" | "compost" | null;
export type StageFilter = "all" | "raw_seed" | "growing" | "ready_to_show" | "dormant";

// ── Utility functions ─────────────────────────────────────────────────────────
export function wordCount(text: string): number {
  const plain = text.includes("<") ? stripHtml(text) : text;
  return plain.trim() ? plain.trim().split(/\s+/).length : 0;
}

export function timeAgo(date: string | Date | null | undefined): string {
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
