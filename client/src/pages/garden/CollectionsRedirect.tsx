import { useEffect } from "react";
import { useLocation } from "wouter";

/**
 * CollectionsRedirect — redirects to the /collections page.
 * Extracted from Garden.tsx for clarity and independent navigation.
 */
export default function CollectionsRedirect() {
  const [, navigate] = useLocation();
  useEffect(() => {
    navigate("/collections");
    // navigate is stable across renders; run once on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return (
    <div className="flex items-center justify-center py-20">
      <p className="font-mono text-[10px] uppercase tracking-widest text-white/40">
        Opening your beds…
      </p>
    </div>
  );
}
