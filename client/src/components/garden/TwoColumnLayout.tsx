import { Columns2, AlignJustify } from "lucide-react";
import { useWritingLayout } from "@/hooks/use-writing-layout";

interface LayoutToggleProps {
  writingId: string;
}

export function LayoutToggle({ writingId }: LayoutToggleProps) {
  const { layout, toggleLayout, isToggling } = useWritingLayout(writingId);

  return (
    <button
      onClick={toggleLayout}
      disabled={isToggling}
      className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-full font-mono text-[9px] uppercase tracking-widest transition-all border ${
        layout === "two-column"
          ? "border-violet-500/30 bg-violet-500/10 text-violet-300/80"
          : "border-white/[0.15] text-white/55 hover:text-white/70 hover:border-white/25"
      }`}
      data-testid="button-toggle-layout"
      title={layout === "two-column" ? "Switch to single column" : "Switch to two columns"}
    >
      {layout === "two-column" ? <Columns2 size={11} /> : <AlignJustify size={11} />}
      {layout === "two-column" ? "Two Col" : "Single"}
    </button>
  );
}

interface TwoColumnContentProps {
  writingId: string;
  children: React.ReactNode;
}

export function TwoColumnContent({ writingId, children }: TwoColumnContentProps) {
  const { layout } = useWritingLayout(writingId);

  if (layout !== "two-column") {
    return <>{children}</>;
  }

  return (
    <div
      className="two-column-layout"
      style={{
        columnCount: 2,
        columnGap: "2rem",
        columnRule: "1px solid rgba(255, 255, 255, 0.06)",
      }}
      data-testid="two-column-wrapper"
    >
      {children}
    </div>
  );
}
