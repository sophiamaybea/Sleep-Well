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
  }, [navigate]);
  return (
    <div className="flex items-center justify-center py-20">
      <p className="font-mono text-[10px] uppercase tracking-widest text-white/40">
        Opening your beds…
      </p>
    </div>
  );
}
